/**
 * Page GamepadDebugPage
 * 
 * Page de debug pour diagnostiquer les problèmes de détection de gamepads
 * Affiche tous les gamepads connectés avec leurs axes et boutons en temps réel
 */

import { useState, useEffect } from 'react';
import { getConnectedGamepads, getGamepadInfo } from '../services/gamepadService';
import './GamepadDebugPage.css';

export function GamepadDebugPage() {
  const [gamepads, setGamepads] = useState([]);
  const [axesValues, setAxesValues] = useState({});
  const [buttonValues, setButtonValues] = useState({});

  // Polling des gamepads
  useEffect(() => {
    const pollGamepads = () => {
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
    };

    pollGamepads();
    const interval = setInterval(pollGamepads, 50);
    
    return () => clearInterval(interval);
  }, []);

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
      </div>

      <div className="debug-content">
        {gamepads.length === 0 ? (
          <div className="no-gamepads">
            <h2>❌ Aucun gamepad détecté</h2>
            <p>Vérifiez que vos périphériques sont connectés et reconnus par votre ordinateur.</p>
            <ul>
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

