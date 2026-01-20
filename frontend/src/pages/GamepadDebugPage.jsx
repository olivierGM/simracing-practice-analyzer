/**
 * Page GamepadDebugPage
 * 
 * Page de debug pour diagnostiquer les problèmes de détection de gamepads
 * Affiche tous les gamepads connectés avec leurs axes et boutons en temps réel
 */

import { useState, useEffect, useRef } from 'react';
import { getConnectedGamepads, getGamepadInfo, listenToGamepadEvents } from '../services/gamepadService';
import { loadMappingConfig, getMappedValue, AXIS_TYPES } from '../services/deviceMappingService';
import './GamepadDebugPage.css';

export function GamepadDebugPage() {
  const [gamepads, setGamepads] = useState([]);
  const [axesValues, setAxesValues] = useState({});
  const [buttonValues, setButtonValues] = useState({});
  const [config, setConfig] = useState(null);
  const [mappedValues, setMappedValues] = useState({});
  const [matchingInfo, setMatchingInfo] = useState([]);
  const [recentConnections, setRecentConnections] = useState([]);
  const consoleLogRef = useRef([]);

  // Intercepter les console.log pour capturer les logs de matching
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('Device') || message.includes('matché') || message.includes('clé')) {
        consoleLogRef.current.push({ type: 'log', message, timestamp: Date.now() });
        if (consoleLogRef.current.length > 50) {
          consoleLogRef.current.shift();
        }
      }
      originalLog.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('Device') || message.includes('slot') || message.includes('fingerprint')) {
        consoleLogRef.current.push({ type: 'warn', message, timestamp: Date.now() });
        if (consoleLogRef.current.length > 50) {
          consoleLogRef.current.shift();
        }
      }
      originalWarn.apply(console, args);
    };
    
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
    };
  }, []);

  // Charger la config
  useEffect(() => {
    const loadedConfig = loadMappingConfig();
    setConfig(loadedConfig);
  }, []);

  // Écouter les événements de connexion/déconnexion
  useEffect(() => {
    const cleanup = listenToGamepadEvents(
      (gamepad) => {
        console.log('🎮 Gamepad connecté:', gamepad.id);
        setRecentConnections(prev => [
          ...prev.slice(-4), // Garder seulement les 5 derniers
          { type: 'connect', gamepad, timestamp: Date.now() }
        ]);
      },
      (gamepad) => {
        console.log('🎮 Gamepad déconnecté:', gamepad.id);
        setRecentConnections(prev => [
          ...prev.slice(-4),
          { type: 'disconnect', gamepad, timestamp: Date.now() }
        ]);
      }
    );
    return cleanup;
  }, []);

  // Polling des gamepads et calcul des valeurs mappées
  useEffect(() => {
    const pollGamepads = () => {
      // Essayer de "réveiller" les devices en lisant tous les slots
      if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
        try {
          const allGamepads = navigator.getGamepads();
          // GamepadList est array-like, pas un vrai Array
          if (allGamepads && allGamepads.length !== undefined) {
            // Lire chaque slot pour forcer l'activation (même si null)
            for (let i = 0; i < allGamepads.length; i++) {
              const gp = allGamepads[i];
              if (gp) {
                // Lire les axes pour "réveiller" le device
                if (gp.axes && gp.axes.length !== undefined) {
                  try {
                    gp.axes.forEach((val, idx) => {
                      // Juste lire la valeur pour activer le device
                      if (val !== undefined) {
                        // Device actif
                      }
                    });
                  } catch (e) {
                    // Ignorer les erreurs de lecture d'axes
                  }
                }
              }
            }
          }
        } catch (error) {
          console.warn('Erreur lors de la lecture des gamepads:', error);
        }
      }
      
      const connected = getConnectedGamepads();
      setGamepads(connected);

      // Récupérer les valeurs des axes et boutons
      const axes = {};
      const buttons = {};
      
      connected.forEach(gamepad => {
        if (gamepad) {
          axes[gamepad.index] = Array.from(gamepad.axes || []);
          buttons[gamepad.index] = Array.from(gamepad.buttons || []).map(btn => ({
            pressed: btn.pressed,
            value: btn.value
          }));
        }
      });
      
      setAxesValues(axes);
      setButtonValues(buttons);

      // Calculer les valeurs mappées si config disponible
      if (config) {
        try {
          const mapped = {
            wheel: getMappedValue(AXIS_TYPES.WHEEL, connected, config),
            accelerator: getMappedValue(AXIS_TYPES.ACCELERATOR, connected, config),
            brake: getMappedValue(AXIS_TYPES.BRAKE, connected, config),
            clutch: getMappedValue(AXIS_TYPES.CLUTCH, connected, config),
            shiftUp: getMappedValue(AXIS_TYPES.SHIFT_UP, connected, config) > 0.5,
            shiftDown: getMappedValue(AXIS_TYPES.SHIFT_DOWN, connected, config) > 0.5
          };
          setMappedValues(mapped);
        } catch (error) {
          console.warn('Erreur lors du calcul des valeurs mappées:', error);
          setMappedValues({});
        }

        // Calculer les infos de matching
        try {
          const matching = [];
          if (config.axisMappings) {
            for (const [deviceKey, deviceMapping] of Object.entries(config.axisMappings)) {
              try {
                // Trouver le gamepad correspondant (simulation de findGamepadByKey)
                const match = deviceKey.match(/^(.+?)(?: #(\d+))?$/);
                if (!match) continue;
                
                const baseId = match[1];
                const slotNumber = match[2] ? parseInt(match[2]) : null;
                
                const sameIdDevices = connected.filter(gp => gp && gp.id === baseId);
                let matchedGamepad = null;
                
                if (slotNumber === null) {
                  matchedGamepad = sameIdDevices.find(gp => gp.id === baseId) || null;
                } else {
                  if (deviceMapping._fingerprint) {
                    const fingerprint = deviceMapping._fingerprint;
                    for (const device of sameIdDevices) {
                      const matchesFingerprint = 
                        device.axes?.length === fingerprint.axisCount &&
                        device.buttons?.length === fingerprint.buttonCount;
                      if (matchesFingerprint) {
                        matchedGamepad = device;
                        break;
                      }
                    }
                  }
                  if (!matchedGamepad && sameIdDevices.length >= slotNumber) {
                    matchedGamepad = sameIdDevices[slotNumber - 1];
                  }
                }

                matching.push({
                  deviceKey,
                  deviceMapping,
                  matchedGamepad,
                  isConnected: matchedGamepad !== null,
                  sameIdCount: sameIdDevices.length
                });
              } catch (error) {
                console.warn(`Erreur lors du matching pour ${deviceKey}:`, error);
              }
            }
          }
          setMatchingInfo(matching);
        } catch (error) {
          console.warn('Erreur lors du calcul du matching:', error);
          setMatchingInfo([]);
        }
      }
    };

    pollGamepads();
    const interval = setInterval(pollGamepads, 100);
    
    return () => clearInterval(interval);
  }, [config]);

  // Fonction pour copier toutes les infos de debug
  const copyDebugInfo = () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      gamepads: (gamepads || []).map(gp => {
        if (!gp) return null;
        return {
          index: gp.index,
          id: gp.id,
          axes: (gp.axes && gp.axes.length !== undefined) ? gp.axes.length : 0,
          buttons: (gp.buttons && gp.buttons.length !== undefined) ? gp.buttons.length : 0,
          axesValues: Array.from(gp.axes || []),
          buttonsValues: Array.from(gp.buttons || []).map(b => ({ pressed: b.pressed, value: b.value }))
        };
      }).filter(gp => gp !== null),
      config: config ? {
        version: config.version,
        axisMappings: config.axisMappings
      } : null,
      matchingInfo: (matchingInfo || []).map(m => {
        if (!m || !m.deviceMapping) return null;
        return {
          deviceKey: m.deviceKey,
          matchedIndex: m.matchedGamepad?.index ?? null,
          matchedId: m.matchedGamepad?.id ?? null,
          isConnected: m.isConnected,
          fingerprint: m.deviceMapping._fingerprint || {},
          lastKnownIndex: m.deviceMapping._lastKnownIndex,
          axesMapped: Object.keys(m.deviceMapping.axes || {}).filter(k => !k.startsWith('_'))
        };
      }).filter(m => m !== null),
      mappedValues,
      consoleLogs: consoleLogRef.current.slice(-20) // Derniers 20 logs
    };

    const text = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Informations de debug copiées dans le presse-papier !\n\nColle-les dans un message pour me les envoyer.');
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
      // Fallback: afficher dans une textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Informations de debug copiées dans le presse-papier !');
    });
  };

  // Fonction pour afficher une barre de progression d'axe
  const renderAxisBar = (value) => {
    // Normaliser de [-1, 1] à [0, 100]%
    const percentage = ((value + 1) / 2) * 100;
    
    return (
      <div className="axis-bar-container">
        <div className="axis-bar">
          <div 
            className="axis-bar-fill" 
            style={{ width: `${percentage}%` }}
          />
          <div 
            className="axis-bar-center-marker"
            style={{ left: '50%' }}
          />
        </div>
        <span className="axis-value">{value.toFixed(3)}</span>
      </div>
    );
  };

  return (
    <div className="gamepad-debug-page">
      <div className="debug-header">
        <h1>🎮 Gamepad Debug</h1>
        <p className="debug-description">
          Cette page affiche tous les gamepads détectés avec leurs axes et boutons en temps réel.
          <br />
          <strong>Instructions :</strong> Bougez vos pédales, volant, shifter pour voir quel device correspond à quoi.
        </p>
        <div className="debug-actions">
          <button onClick={copyDebugInfo} className="copy-debug-button">
            📋 Copier toutes les infos de debug
          </button>
          <button 
            onClick={() => {
              try {
                // Forcer la détection en lisant tous les gamepads (même null)
                if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
                  const allGamepads = navigator.getGamepads();
                  const nullSlots = [];
                  if (allGamepads && allGamepads.length !== undefined) {
                    for (let i = 0; i < allGamepads.length; i++) {
                      if (allGamepads[i] === null) {
                        nullSlots.push(i);
                      }
                    }
                  }
                  console.log('🔍 Forçage de la détection...');
                  console.log(`Gamepads détectés: ${gamepads.length}`);
                  console.log(`Slots null: ${nullSlots.join(', ')}`);
                  // Forcer un refresh
                  const connected = getConnectedGamepads();
                  setGamepads(connected);
                  alert(`Détection forcée.\nGamepads trouvés: ${connected.length}\nSlots null: ${nullSlots.length}\n\n💡 Si vos pédales ne sont toujours pas détectées, bougez-les pendant que cette page est ouverte.`);
                } else {
                  alert('Gamepad API non supporté dans ce navigateur.');
                }
              } catch (error) {
                console.error('Erreur lors du forçage de la détection:', error);
                alert('Erreur lors du forçage de la détection. Vérifiez la console pour plus de détails.');
              }
            }} 
            className="force-detect-button"
          >
            🔍 Forcer la détection
          </button>
        </div>
      </div>

      <div className="debug-content">
        {/* Avertissement si des devices sont dans la config mais pas détectés */}
        {config && config.axisMappings && Object.keys(config.axisMappings).length > 0 && (
          (() => {
            const missingDevices = matchingInfo.filter(m => !m.isConnected && m.axesMapped && m.axesMapped.length > 0);
            if (missingDevices && missingDevices.length > 0) {
              return (
                <div className="missing-devices-warning">
                  <h3>⚠️ Devices mappés mais non détectés</h3>
                  <p>Les devices suivants sont dans votre configuration mais ne sont pas détectés par le navigateur :</p>
                  <ul>
                    {missingDevices.map((m, idx) => (
                      <li key={idx}>
                        <strong>{m.deviceKey}</strong>
                        <br />
                        <small>
                          Fingerprint: {m.fingerprint.axisCount} axes, {m.fingerprint.buttonCount} boutons
                          {m.fingerprint.usedAxes && m.fingerprint.usedAxes.length > 0 && `, axes utilisés: [${m.fingerprint.usedAxes.join(', ')}]`}
                        </small>
                      </li>
                    ))}
                  </ul>
                  <div className="missing-devices-help">
                    <strong>💡 Solutions :</strong>
                    <ol>
                      <li><strong>Bougez les pédales/volant</strong> - Certains devices nécessitent une interaction utilisateur pour être détectés</li>
                      <li><strong>Vérifiez dans le Gestionnaire de périphériques Windows</strong> - Les devices doivent apparaître sans erreur</li>
                      <li><strong>Débranchez et rebranchez</strong> les devices USB</li>
                      <li><strong>Rafraîchissez la page</strong> après avoir bougé les devices</li>
                    </ol>
                  </div>
                </div>
              );
            }
            return null;
          })()
        )}

        {/* Événements récents de connexion/déconnexion */}
        {recentConnections.length > 0 && (
          <div className="recent-connections">
            <h3>📡 Événements récents</h3>
            <ul>
              {recentConnections.map((event, idx) => (
                <li key={idx} className={event.type === 'connect' ? 'event-connect' : 'event-disconnect'}>
                  {event.type === 'connect' ? '✅ Connecté' : '❌ Déconnecté'}: <strong>{event.gamepad.id}</strong>
                  <br />
                  <small>Index: {event.gamepad.index}, {event.gamepad.axes?.length || 0} axes, {event.gamepad.buttons?.length || 0} boutons</small>
                </li>
              ))}
            </ul>
          </div>
        )}

        {gamepads.length === 0 ? (
          <div className="no-gamepads">
            <h2>❌ Aucun gamepad détecté</h2>
            <p>Vérifiez que vos périphériques sont connectés et reconnus par votre ordinateur.</p>
            <ul>
              <li><strong>Important :</strong> Bougez vos pédales/volant - certains devices nécessitent une interaction utilisateur pour être détectés</li>
              <li>Vérifiez les câbles USB</li>
              <li>Redémarrez vos devices</li>
              <li>Testez sur <a href="https://gamepad-tester.com/" target="_blank" rel="noopener noreferrer">gamepad-tester.com</a></li>
            </ul>
          </div>
        ) : (
          <div className="gamepads-list">
            <h2>✅ {gamepads.length} gamepad{gamepads.length > 1 ? 's' : ''} détecté{gamepads.length > 1 ? 's' : ''}</h2>
            
            {gamepads.map((gamepad) => {
              const info = getGamepadInfo(gamepad);
              const axes = axesValues[gamepad.index] || [];
              const buttons = buttonValues[gamepad.index] || [];
              
              return (
                <div key={gamepad.index} className="gamepad-card">
                  <div className="gamepad-header">
                    <h3>
                      <span className="gamepad-index">#{gamepad.index}</span>
                      {info.id}
                    </h3>
                    <div className="gamepad-meta">
                      <span className="gamepad-meta-item">
                        {info.axes} axes
                      </span>
                      <span className="gamepad-meta-item">
                        {info.buttons} boutons
                      </span>
                      <span className="gamepad-meta-item">
                        Mapping: {info.mapping}
                      </span>
                    </div>
                  </div>

                  {/* Axes */}
                  {axes.length > 0 && (
                    <div className="gamepad-section">
                      <h4>📊 Axes ({axes.length})</h4>
                      <div className="axes-grid">
                        {axes.map((value, axisIndex) => (
                          <div key={axisIndex} className="axis-item">
                            <div className="axis-label">
                              <span className="axis-index">Axe {axisIndex}</span>
                              {/* Détecter les types d'axes communs */}
                              {axisIndex === 0 && <span className="axis-hint">(souvent: Volant)</span>}
                              {axisIndex === 1 && <span className="axis-hint">(souvent: Accélérateur)</span>}
                              {axisIndex === 2 && <span className="axis-hint">(souvent: Frein)</span>}
                              {axisIndex === 3 && <span className="axis-hint">(souvent: Embrayage)</span>}
                            </div>
                            {renderAxisBar(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Boutons */}
                  {buttons.length > 0 && (
                    <div className="gamepad-section">
                      <h4>🔘 Boutons ({buttons.length})</h4>
                      <div className="buttons-grid">
                        {buttons.map((button, buttonIndex) => (
                          <div 
                            key={buttonIndex} 
                            className={`button-item ${button.pressed ? 'button-pressed' : ''}`}
                          >
                            <span className="button-index">B{buttonIndex}</span>
                            <span className="button-value">
                              {button.pressed ? '✅ ON' : '⬜ OFF'}
                            </span>
                            {button.value > 0 && (
                              <span className="button-analog">{(button.value * 100).toFixed(0)}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Config et Matching */}
        {config && (
          <div className="debug-section">
            <h2>⚙️ Configuration Sauvegardée</h2>
            <div className="config-info">
              <p><strong>Version:</strong> {config.version || 'Non spécifiée'}</p>
              <p><strong>Nombre de devices mappés:</strong> {Object.keys(config.axisMappings || {}).length}</p>
              
              {Object.keys(config.axisMappings || {}).length > 0 && (
                <div className="mappings-list">
                  <h3>Mappings:</h3>
                  {Object.entries(config.axisMappings).map(([deviceKey, deviceMapping]) => (
                    <div key={deviceKey} className="mapping-item">
                      <h4>Device: <code>{deviceKey}</code></h4>
                      <p><strong>Last Known Index:</strong> {deviceMapping._lastKnownIndex ?? 'N/A'}</p>
                      {deviceMapping._fingerprint && (
                        <p><strong>Fingerprint:</strong> {deviceMapping._fingerprint.axisCount} axes, {deviceMapping._fingerprint.buttonCount} boutons, axes utilisés: [{deviceMapping._fingerprint.usedAxes?.join(', ') || 'aucun'}]</p>
                      )}
                      <p><strong>Axes mappés:</strong></p>
                      <ul>
                        {Object.entries(deviceMapping.axes || {}).filter(([k]) => !k.startsWith('_')).map(([axisIndex, mapping]) => (
                          <li key={axisIndex}>
                            Axe {axisIndex}: <strong>{mapping.type}</strong> {mapping.invert ? '(inversé)' : ''}
                          </li>
                        ))}
                      </ul>
                      {matchingInfo.find(m => m.deviceKey === deviceKey) && (
                        <p className={matchingInfo.find(m => m.deviceKey === deviceKey).isConnected ? 'match-success' : 'match-error'}>
                          <strong>Status:</strong> {matchingInfo.find(m => m.deviceKey === deviceKey).isConnected ? '✅ Connecté' : '❌ Non connecté'}
                          {matchingInfo.find(m => m.deviceKey === deviceKey).matchedGamepad && (
                            <> (Index: {matchingInfo.find(m => m.deviceKey === deviceKey).matchedGamepad.index})</>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Valeurs Mappées */}
        {Object.keys(mappedValues).length > 0 && (
          <div className="debug-section">
            <h2>📊 Valeurs Mappées (Temps Réel)</h2>
            <div className="mapped-values">
              <div className="mapped-value-item">
                <span className="mapped-label">Volant:</span>
                <span className="mapped-value">{mappedValues.wheel.toFixed(3)}</span>
              </div>
              <div className="mapped-value-item">
                <span className="mapped-label">Accélérateur:</span>
                <span className="mapped-value">{mappedValues.accelerator.toFixed(3)}</span>
              </div>
              <div className="mapped-value-item">
                <span className="mapped-label">Frein:</span>
                <span className="mapped-value">{mappedValues.brake.toFixed(3)}</span>
              </div>
              <div className="mapped-value-item">
                <span className="mapped-label">Embrayage:</span>
                <span className="mapped-value">{mappedValues.clutch.toFixed(3)}</span>
              </div>
              <div className="mapped-value-item">
                <span className="mapped-label">Shift Up:</span>
                <span className="mapped-value">{mappedValues.shiftUp ? '✅' : '⬜'}</span>
              </div>
              <div className="mapped-value-item">
                <span className="mapped-label">Shift Down:</span>
                <span className="mapped-value">{mappedValues.shiftDown ? '✅' : '⬜'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Aide */}
        <div className="debug-help">
          <h3>💡 Comment utiliser cette page ?</h3>
          <ol>
            <li><strong>Identifiez vos pédales SimJack :</strong> Appuyez sur l'accélérateur et le frein pour voir quel gamepad réagit</li>
            <li><strong>Notez le nom et l'index du device :</strong> Par exemple "SimJack Pedals - #1"</li>
            <li><strong>Retournez à la configuration :</strong> Dans la page "Drills Pédales & Volant", assignez manuellement chaque fonction au bon device</li>
            <li><strong>Si vos pédales n'apparaissent pas :</strong>
              <ul>
                <li>Déconnectez tous les devices USB</li>
                <li>Reconnectez vos pédales SimJack en premier</li>
                <li>Reconnectez les autres devices un par un</li>
                <li>Rafraîchissez cette page</li>
              </ul>
            </li>
          </ol>
          
          <div className="debug-tip">
            <strong>⚠️ Note sur les "Haptics" :</strong> Si vos haptics (moteurs de vibration) apparaissent comme un pédalier,
            c'est normal - certains devices de vibration sont détectés comme des gamepads. Il suffit de ne pas les assigner dans la configuration.
          </div>
        </div>
      </div>
    </div>
  );
}

