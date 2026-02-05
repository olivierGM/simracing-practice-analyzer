/**
 * Composant DeviceMappingConfig
 * 
 * Panneau de configuration pour mapper les devices et les axes
 * Interface intuitive : cliquer sur une fonction puis bouger/appuyer pour assigner
 */

import { useState, useEffect, useRef } from 'react';
import {
  loadMappingConfig,
  saveMappingConfig,
  mapAxis,
  resetMappingConfig,
  AXIS_TYPES
} from '../../services/deviceMappingService';
import { getConnectedGamepads, getGamepadInfo } from '../../services/gamepadService';
import { getMappedValue } from '../../services/deviceMappingService';
import { getKeyboardValue } from '../../services/keyboardService';
import './DeviceMappingConfig.css';

// Fonctions assignables avec leurs labels (emoji uniquement dans icon, pas dans label)
const ASSIGNABLE_FUNCTIONS = [
  { type: AXIS_TYPES.ACCELERATOR, label: 'Accélérateur', icon: '⚡' },
  { type: AXIS_TYPES.BRAKE, label: 'Frein', icon: '🛑' },
  { type: AXIS_TYPES.CLUTCH, label: 'Embrayage', icon: '🔄' },
  { type: AXIS_TYPES.WHEEL, label: 'Volant', icon: '🎮' },
  { type: AXIS_TYPES.SHIFT_UP, label: 'Shift Up', icon: '⬆️' },
  { type: AXIS_TYPES.SHIFT_DOWN, label: 'Shift Down', icon: '⬇️' }
];

export function DeviceMappingConfig({ onConfigChange, compact = false }) {
  const [config, setConfig] = useState(loadMappingConfig());
  const [gamepads, setGamepads] = useState([]);
  const [assigningFunction, setAssigningFunction] = useState(null);
  const [_debugInfo, setDebugInfo] = useState(null);
  const [realtimeValues, setRealtimeValues] = useState({});
  const [showInfo, setShowInfo] = useState(false); // Panneau info / debug
  const assignmentTimeoutRef = useRef(null);
  const configRef = useRef(config); // Ref pour éviter les dépendances dans useEffect
  const debugUpdateTimeoutRef = useRef(null); // Pour limiter les mises à jour de debug
  const previousAxesValuesRef = useRef({}); // Ref pour éviter les re-renders

  // Charger les gamepads avec polling
  useEffect(() => {
    const updateGamepads = () => {
      setGamepads(getConnectedGamepads());
    };
    
    updateGamepads();
    const interval = setInterval(updateGamepads, 50); // Polling rapide pour détecter les changements
    
    return () => clearInterval(interval);
  }, []);

  // Mettre à jour les valeurs en temps réel pour les fonctions assignées
  useEffect(() => {
    const updateRealtimeValues = () => {
      const connected = getConnectedGamepads();
      const currentConfig = configRef.current;
      const values = {};
      
      // Récupérer la valeur pour chaque fonction (gamepad + clavier)
      const kbMap = { accelerator: 'accelerator', brake: 'brake', clutch: 'clutch', wheel: 'wheel', shift_up: 'shift_up', shift_down: 'shift_down' };
      ASSIGNABLE_FUNCTIONS.forEach(func => {
        const gpVal = getMappedValue(func.type, connected, currentConfig);
        const kbVal = getKeyboardValue(kbMap[func.type] || func.type);
        values[func.type] = func.type === AXIS_TYPES.WHEEL
          ? (Math.abs(gpVal) > 0.1 ? gpVal : kbVal)
          : Math.max(gpVal, kbVal);
      });
      
      setRealtimeValues(values);
    };
    
    updateRealtimeValues();
    const interval = setInterval(updateRealtimeValues, 50); // Polling rapide pour les valeurs en temps réel
    
    return () => clearInterval(interval);
  }, [config]); // Recharger quand config change

  // Détecter les changements d'axes pendant l'assignation
  useEffect(() => {
    if (!assigningFunction) {
      // Sauvegarder les valeurs actuelles comme référence (dans une ref pour éviter les re-renders)
      const currentValues = {};
      gamepads.forEach(gamepad => {
        if (gamepad && gamepad.axes) {
          currentValues[gamepad.index] = Array.from(gamepad.axes);
        }
        if (gamepad && gamepad.buttons) {
          currentValues[`${gamepad.index}_buttons`] = Array.from(gamepad.buttons);
        }
      });
      previousAxesValuesRef.current = currentValues;
      return;
    }

    // Détecter quel axe ou bouton a changé
    const detectAxisChange = () => {
      gamepads.forEach(gamepad => {
        if (!gamepad) return;

        const deviceIndex = gamepad.index;
        
        // Détecter les boutons pour SHIFT_UP/DOWN
        if ((assigningFunction === AXIS_TYPES.SHIFT_UP || assigningFunction === AXIS_TYPES.SHIFT_DOWN) && gamepad.buttons) {
          const currentButtons = Array.from(gamepad.buttons);
          const previousButtons = previousAxesValuesRef.current[`${deviceIndex}_buttons`] || Array(currentButtons.length).fill({ pressed: false });
          
          currentButtons.forEach((button, buttonIndex) => {
            const wasPressed = previousButtons[buttonIndex]?.pressed || false;
            const isPressed = button.pressed;
            
            // Si un bouton vient d'être pressé, l'assigner
            if (isPressed && !wasPressed) {
              const currentConfig = configRef.current;
              const allGamepads = getConnectedGamepads();
              // Pour les boutons, on utilise un index négatif pour les différencier des axes
              const newConfig = mapAxis(
                gamepad,  // Gamepad complet (pas juste l'index)
                -buttonIndex - 1, // Index négatif pour les boutons
                assigningFunction,
                false, // Pas d'inversion pour les boutons
                currentConfig,
                allGamepads  // Pour détecter les collisions
              );
              setConfig(newConfig);
              setAssigningFunction(null);
              setDebugInfo(null);
              
              // Mettre à jour les valeurs précédentes
              const updatedValues = { ...previousAxesValuesRef.current };
              updatedValues[`${deviceIndex}_buttons`] = currentButtons;
              previousAxesValuesRef.current = updatedValues;

              // Notifier le changement
              if (onConfigChange) {
                onConfigChange(newConfig);
              }
            }
          });
          
          // Mettre à jour les valeurs précédentes des boutons
          const updatedValues = { ...previousAxesValuesRef.current };
          updatedValues[`${deviceIndex}_buttons`] = currentButtons;
          previousAxesValuesRef.current = updatedValues;
          return; // Ne pas continuer avec les axes pour les boutons
        }
        
        // Détecter les axes pour les autres fonctions
        if (!gamepad.axes) return;
        
        const currentAxes = Array.from(gamepad.axes);
        const previousAxes = previousAxesValuesRef.current[deviceIndex] || [];

        // Chercher l'axe qui a le plus changé
        let maxChange = 0;
        let changedAxisIndex = -1;
        let _changedAxisValue = 0;
        const allChanges = [];

        currentAxes.forEach((currentValue, axisIndex) => {
          const previousValue = previousAxes[axisIndex] || 0;
          const change = Math.abs(currentValue - previousValue);
          
          allChanges.push({
            axis: axisIndex,
            change: change,
            current: currentValue,
            previous: previousValue
          });
          
          // Seuil de détection adaptatif selon le type de fonction
          let threshold = 0.05;
          if (assigningFunction === AXIS_TYPES.WHEEL) {
            threshold = 0.02; // Volant : très sensible
          } else if (assigningFunction === AXIS_TYPES.ACCELERATOR || 
                     assigningFunction === AXIS_TYPES.BRAKE) {
            threshold = 0.1; // Pédales : besoin d'un changement plus important
          } else if (assigningFunction === AXIS_TYPES.SHIFT_UP || 
                     assigningFunction === AXIS_TYPES.SHIFT_DOWN) {
            // Pour les boutons, on détecte les changements de boutons, pas les axes
            // On gère ça dans une autre partie du code
            threshold = 0.1;
          }
          
          // Détecter aussi les changements vers les extrêmes (-1 ou 1)
          // Pour les pédales, on détecte quand on appuie (valeur qui va vers -1)
          const isMovingToExtreme = (assigningFunction === AXIS_TYPES.ACCELERATOR || 
                                     assigningFunction === AXIS_TYPES.BRAKE ||
                                     assigningFunction === AXIS_TYPES.CLUTCH) &&
                                    (Math.abs(currentValue) > 0.5 && Math.abs(previousValue) < 0.5);
          
          // Détecter si le changement est significatif OU si on va vers un extrême
          if ((change > maxChange && change > threshold) || isMovingToExtreme) {
            if (change > maxChange || isMovingToExtreme) {
              maxChange = Math.max(change, 0.2); // Forcer un changement minimum si on détecte un extrême
              changedAxisIndex = axisIndex;
              _changedAxisValue = currentValue;
            }
          }
        });

        // Debug info (limiter les mises à jour pour éviter les re-renders)
        if (allChanges.length > 0 && !debugUpdateTimeoutRef.current) {
          const maxChangeInfo = allChanges.reduce((max, curr) => 
            curr.change > max.change ? curr : max
          );
          let threshold = 0.05;
          if (assigningFunction === AXIS_TYPES.WHEEL) {
            threshold = 0.02;
          } else if (assigningFunction === AXIS_TYPES.ACCELERATOR || 
                     assigningFunction === AXIS_TYPES.BRAKE ||
                     assigningFunction === AXIS_TYPES.CLUTCH) {
            threshold = 0.1;
          }
          
          // Mettre à jour le debug info seulement toutes les 100ms pour éviter les re-renders
          debugUpdateTimeoutRef.current = setTimeout(() => {
            setDebugInfo({
              maxChange: maxChangeInfo.change,
              axis: maxChangeInfo.axis,
              current: maxChangeInfo.current,
              previous: maxChangeInfo.previous,
              threshold: threshold
            });
            debugUpdateTimeoutRef.current = null;
          }, 100);
        }

        // Si un axe a changé significativement, l'assigner
        let threshold = 0.05;
        if (assigningFunction === AXIS_TYPES.WHEEL) {
          threshold = 0.02;
        } else if (assigningFunction === AXIS_TYPES.ACCELERATOR || 
                   assigningFunction === AXIS_TYPES.BRAKE) {
          threshold = 0.1;
        }
        
        if (changedAxisIndex >= 0 && maxChange > threshold) {
          // Pour les axes, pas d'inversion par défaut (l'utilisateur peut l'activer manuellement)
          const shouldInvert = false;

          // Assigner l'axe (utiliser configRef pour éviter les dépendances)
          const currentConfig = configRef.current;
          const allGamepads = getConnectedGamepads();
          const newConfig = mapAxis(
            gamepad,  // Gamepad complet (pas juste l'index)
            changedAxisIndex,
            assigningFunction,
            shouldInvert,
            currentConfig,
            allGamepads  // Pour détecter les collisions
          );
          setConfig(newConfig);
          setAssigningFunction(null);
          setDebugInfo(null);
          
          // Mettre à jour les valeurs précédentes (dans la ref pour éviter les re-renders)
          const updatedValues = { ...previousAxesValuesRef.current };
          updatedValues[deviceIndex] = currentAxes;
          previousAxesValuesRef.current = updatedValues;

          // Notifier le changement
          if (onConfigChange) {
            onConfigChange(newConfig);
          }
        }
      });
    };

    // Démarrer la détection avec polling rapide
    const detectionInterval = setInterval(detectAxisChange, 30);
    
    // Timeout de sécurité (10 secondes pour le volant qui peut être plus lent)
    if (assignmentTimeoutRef.current) {
      clearTimeout(assignmentTimeoutRef.current);
    }
    assignmentTimeoutRef.current = setTimeout(() => {
      setAssigningFunction(null);
      setDebugInfo(null);
    }, 10000);

    return () => {
      clearInterval(detectionInterval);
      if (assignmentTimeoutRef.current) {
        clearTimeout(assignmentTimeoutRef.current);
      }
      if (debugUpdateTimeoutRef.current) {
        clearTimeout(debugUpdateTimeoutRef.current);
        debugUpdateTimeoutRef.current = null;
      }
    };
  }, [assigningFunction, gamepads]); // Retirer previousAxesValues (utilise une ref maintenant)

  // Mettre à jour la ref quand config change
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const handleStartAssignment = (functionType) => {
    setAssigningFunction(functionType);
    // Sauvegarder les valeurs actuelles comme référence (dans une ref)
    const currentValues = {};
    gamepads.forEach(gamepad => {
      if (gamepad && gamepad.axes) {
        currentValues[gamepad.index] = Array.from(gamepad.axes);
      }
      if (gamepad && gamepad.buttons) {
        currentValues[`${gamepad.index}_buttons`] = Array.from(gamepad.buttons);
      }
    });
    previousAxesValuesRef.current = currentValues;
  };

  const handleToggleInvert = (functionType) => {
    const assignment = getCurrentAssignment(functionType);
    if (!assignment) return;
    
    // Trouver le mapping actuel et inverser l'inversion
    const newConfig = { ...config };
    for (const [_deviceId, deviceMapping] of Object.entries(newConfig.axisMappings)) {
      const axes = deviceMapping.axes || deviceMapping;  // Compatibilité v1/v2
      
      for (const [axisIndex, mapping] of Object.entries(axes)) {
        if (axisIndex.startsWith('_')) continue;  // Skip metadata
        
        if (mapping.type === functionType) {
          mapping.invert = !mapping.invert;
          setConfig(newConfig);
          saveMappingConfig(newConfig);
          if (onConfigChange) {
            onConfigChange(newConfig);
          }
          return;
        }
      }
    }
  };

  const handleCancelAssignment = () => {
    setAssigningFunction(null);
    setDebugInfo(null);
    if (assignmentTimeoutRef.current) {
      clearTimeout(assignmentTimeoutRef.current);
    }
    if (debugUpdateTimeoutRef.current) {
      clearTimeout(debugUpdateTimeoutRef.current);
      debugUpdateTimeoutRef.current = null;
    }
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toute la configuration ?')) {
      const newConfig = resetMappingConfig();
      setConfig(newConfig);
    }
  };

  // Obtenir l'assignation actuelle pour une fonction
  const getCurrentAssignment = (functionType) => {
    for (const [deviceKey, deviceMapping] of Object.entries(config.axisMappings)) {
      const axes = deviceMapping.axes || deviceMapping;  // Compatibilité v1/v2
      
      for (const [axisIndex, mapping] of Object.entries(axes)) {
        if (axisIndex.startsWith('_')) continue;  // Skip metadata
        
        if (mapping.type === functionType) {
          const axisIdx = parseInt(axisIndex);
          // Si l'index est négatif, c'est un bouton
          if (axisIdx < 0) {
            const buttonIndex = -axisIdx - 1;
            return {
              device: deviceKey,  // Utilise deviceKey (peut contenir #N)
              button: buttonIndex,
              invert: mapping.invert,
              isButton: true
            };
          } else {
            return {
              device: deviceKey,  // Utilise deviceKey (peut contenir #N)
              axis: axisIdx,
              invert: mapping.invert,
              isButton: false
            };
          }
        }
      }
    }
    return null;
  };

  return (
    <div className={`device-mapping-config ${compact ? 'device-mapping-config-compact' : ''}`}>
      {!compact && (
        <div className="config-header">
          <h3>⚙️ Configuration du Mapping</h3>
          <div className="config-header-buttons">
            <a 
              href="/gamepad-debug" 
              target="_blank"
              rel="noopener noreferrer"
              className="debug-link-button"
              title="Ouvre une page pour diagnostiquer les problèmes de détection"
            >
              🔍 Debug Gamepads
            </a>
            <button className="reset-button" onClick={handleReset}>
              🔄 Réinitialiser
            </button>
          </div>
        </div>
      )}
      {compact && (
        <div className="config-header-compact">
          <h4 className="config-title-inline">Périphériques</h4>
          <div className="config-header-buttons-inline">
            <a
              href="/gamepad-debug"
              target="_blank"
              rel="noopener noreferrer"
              className="config-btn-mini"
              title="Debug Gamepads"
            >
              🔍
            </a>
            <button className="config-btn-mini" onClick={handleReset} title="Réinitialiser">
              🔄
            </button>
            <button
              className={`config-btn-mini config-btn-info ${showInfo ? 'active' : ''}`}
              onClick={() => setShowInfo(!showInfo)}
              title="Infos & diagnostic"
            >
              ℹ️
            </button>
          </div>
        </div>
      )}
      {compact && showInfo && (
        <div className="config-info-panel">
          <p className="config-info-hint">
            Si vos devices sont connectés mais n'apparaissent pas, ouvrez la page <a href="/gamepad-debug" target="_blank" rel="noopener noreferrer">Debug Gamepads</a> pour diagnostiquer.
          </p>
          <div className="config-devices-list">
            {gamepads.length === 0 ? (
              <p>Aucun périphérique détecté.</p>
            ) : (
              gamepads.map((gp) => {
                const info = getGamepadInfo(gp);
                return (
                  <div key={gp.index} className="config-device-item">
                    <span>{info.id}</span>
                    <span className="config-device-meta">{info.axes} axes • {info.buttons} boutons</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      <div className="config-content">
        {!compact && gamepads.length === 0 && (
          <div className="config-message-inline">
            <p>⚠️ Aucun périphérique détecté. Connectez vos périphériques pour assigner les contrôles.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#888' }}>
              💡 Si vos devices sont connectés mais n'apparaissent pas, utilisez le bouton <strong>"🔍 Debug Gamepads"</strong> ci-dessus pour diagnostiquer le problème.
            </p>
          </div>
        )}
        {compact && (
          <p className="config-device-status">
            {gamepads.length === 0
              ? 'Aucun périphérique détecté'
              : `${gamepads.length} périphérique${gamepads.length > 1 ? 's' : ''} détecté${gamepads.length > 1 ? 's' : ''}`
            }
          </p>
        )}
          <div className="functions-list">
            {!compact && <h4>Assigner les fonctions</h4>}
            {!compact && (
              <p className="config-instructions">
                Cliquez sur une fonction, puis bougez/appuyez sur le contrôle correspondant pour l'assigner automatiquement.
              </p>
            )}
            
            {ASSIGNABLE_FUNCTIONS.map(func => {
              const isAssigning = assigningFunction === func.type;
              const currentAssignment = getCurrentAssignment(func.type);
              
              return (
                <div
                  key={func.type}
                  className={`function-item ${isAssigning ? 'function-item-assigning' : ''} ${currentAssignment ? 'function-item-assigned' : ''}`}
                >
                  <div className="function-item-header">
                    <div className="function-info">
                      <span className="function-icon">{func.icon}</span>
                      <div className="function-details">
                        <span className="function-label">{func.label}</span>
                        {!compact && currentAssignment && (
                          <span className="function-assignment">
                            {currentAssignment.device} - {
                              currentAssignment.isButton 
                                ? `Btn ${currentAssignment.button}`
                                : `Axe ${currentAssignment.axis}`
                            }
                            {currentAssignment.invert && ' (↩)'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="function-actions">
                    {isAssigning ? (
                      <button
                        className="cancel-button"
                        onClick={handleCancelAssignment}
                      >
                        Annuler
                      </button>
                    ) : (
                      <>
                        <button
                          className="assign-button"
                          onClick={() => handleStartAssignment(func.type)}
                        >
                          {currentAssignment ? 'Réassigner' : 'Assigner'}
                        </button>
                        {currentAssignment && 
                         (func.type === AXIS_TYPES.ACCELERATOR || func.type === AXIS_TYPES.BRAKE || func.type === AXIS_TYPES.CLUTCH) && (
                          <button
                            className="invert-button"
                            onClick={() => handleToggleInvert(func.type)}
                            title={currentAssignment.invert ? "Désactiver l'inversion" : "Activer l'inversion"}
                          >
                            {currentAssignment.invert ? '↩️ Inversé' : '↪️ Normal'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  </div>
                  {/* Barre d'input pleine largeur */}
                  <div className="function-test-bar">
                    <div className="test-bar-container">
                      {func.type === AXIS_TYPES.WHEEL ? (
                        <div className="test-bar test-bar-wheel">
                          <div
                            className="test-bar-fill test-bar-fill-wheel"
                            style={{
                              width: `${Math.abs(realtimeValues[func.type] || 0) * 50}%`,
                              left: (realtimeValues[func.type] || 0) < 0 ? '0' : 'auto',
                              right: (realtimeValues[func.type] || 0) >= 0 ? '0' : 'auto'
                            }}
                          />
                          <div
                            className="test-bar-indicator"
                            style={{
                              left: `${((realtimeValues[func.type] || 0) + 1) * 50}%`
                            }}
                          />
                        </div>
                      ) : func.type === AXIS_TYPES.SHIFT_UP || func.type === AXIS_TYPES.SHIFT_DOWN ? (
                        <div className="test-bar test-bar-button">
                          <div
                            className={`test-bar-fill test-bar-fill-button ${(realtimeValues[func.type] || 0) > 0.5 ? 'active' : ''}`}
                            style={{
                              width: `${(realtimeValues[func.type] || 0) > 0.5 ? 100 : 0}%`
                            }}
                          />
                        </div>
                      ) : (
                        <div className="test-bar test-bar-pedal">
                          <div
                            className="test-bar-fill test-bar-fill-pedal"
                            style={{
                              width: `${(realtimeValues[func.type] || 0) * 100}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <span className="test-bar-value">
                      {func.type === AXIS_TYPES.WHEEL 
                        ? `${((realtimeValues[func.type] || 0) * 900).toFixed(0)}°`
                        : func.type === AXIS_TYPES.SHIFT_UP || func.type === AXIS_TYPES.SHIFT_DOWN
                        ? (realtimeValues[func.type] || 0) > 0.5 ? 'ON' : 'OFF'
                        : `${((realtimeValues[func.type] || 0) * 100).toFixed(0)}%`
                      }
                    </span>
                  </div>
                  {isAssigning && (
                    <div className="function-assigning-hint">
                      <span>⏳ Bougez/appuyez sur le contrôle...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Liste des devices connectés (pour info) */}
          {!compact && (
          <div className="devices-info">
            <h4>Périphériques connectés</h4>
            <div className="devices-list">
              {gamepads.map((gamepad) => {
                const info = getGamepadInfo(gamepad);
                return (
                  <div key={gamepad.index} className="device-info-item">
                    <span className="device-info-name">{info.id}</span>
                    <span className="device-info-details">
                      {info.axes} axes • {info.buttons} boutons
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          )}
      </div>
    </div>
  );
}
