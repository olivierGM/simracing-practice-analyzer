/**
 * Composant PedalWheelDrills
 * 
 * Composant principal pour les drills pédales/volant
 * Phase 1 : Affichage de la connexion et des valeurs en temps réel
 * Avec support de mapping personnalisé et plusieurs devices
 */

import { useState } from 'react';
import { DeviceConnector } from './DeviceConnector';
import { DeviceMappingConfig } from './DeviceMappingConfig';
import { useMappedGamepads } from '../../hooks/useMappedGamepads';
import { loadMappingConfig } from '../../services/deviceMappingService';
import './PedalWheelDrills.css';

export function PedalWheelDrills() {
  const [mappingConfig, setMappingConfig] = useState(loadMappingConfig());
  const [showConfig, setShowConfig] = useState(false);
  
  const {
    isSupported,
    gamepads,
    wheel,
    accelerator,
    brake,
    clutch
  } = useMappedGamepads(mappingConfig);

  const handleConfigChange = (newConfig) => {
    setMappingConfig(newConfig);
  };

  const hasAssignedDevices = Object.keys(mappingConfig.deviceAssignments).length > 0;

  // Convertir la valeur du volant en degrés (approximation)
  const wheelDegrees = (wheel * 900).toFixed(1); // -900° à +900° (environ 2.5 tours)

  // Convertir les valeurs en pourcentages
  const acceleratorPercent = (accelerator * 100).toFixed(1);
  const brakePercent = (brake * 100).toFixed(1);
  const clutchPercent = (clutch * 100).toFixed(1);

  return (
    <div className="pedal-wheel-drills">
      <div className="drills-container">
        {/* Section Connexion */}
        <section className="drills-section">
          <div className="section-header-with-button">
            <h2 className="section-title">🔌 Connexion Périphérique</h2>
            <button
              className="config-toggle-button"
              onClick={() => setShowConfig(!showConfig)}
            >
              {showConfig ? '▼' : '⚙️'} Configuration
            </button>
          </div>
          <DeviceConnector />
          
          {/* Panneau de configuration */}
          {showConfig && (
            <div className="config-panel">
              <DeviceMappingConfig onConfigChange={handleConfigChange} />
            </div>
          )}
        </section>

        {/* Section Affichage en Temps Réel */}
        {isSupported && (hasAssignedDevices || gamepads.length > 0) && (
          <section className="drills-section">
            <h2 className="section-title">📊 Valeurs en Temps Réel</h2>
            <div className="realtime-display">
              {/* Volant */}
              <div className="input-display input-display-wheel">
                <div className="input-display-header">
                  <h3>🎮 Volant</h3>
                  <span className="input-value">{wheelDegrees}°</span>
                </div>
                <div className="input-bar-container">
                  <div className="input-bar input-bar-wheel">
                    <div
                      className="input-bar-fill input-bar-fill-wheel"
                      style={{
                        width: `${Math.abs(wheel) * 100}%`,
                        left: wheel < 0 ? '0' : 'auto',
                        right: wheel >= 0 ? '0' : 'auto'
                      }}
                    />
                    <div
                      className="input-indicator"
                      style={{
                        left: `${(wheel + 1) * 50}%`
                      }}
                    />
                  </div>
                </div>
                <div className="input-labels">
                  <span>Gauche (-900°)</span>
                  <span>Centre (0°)</span>
                  <span>Droite (+900°)</span>
                </div>
              </div>

              {/* Accélérateur */}
              <div className="input-display input-display-accelerator">
                <div className="input-display-header">
                  <h3>⚡ Accélérateur</h3>
                  <span className="input-value">{acceleratorPercent}%</span>
                </div>
                <div className="input-bar-container">
                  <div className="input-bar input-bar-vertical">
                    <div
                      className="input-bar-fill input-bar-fill-accelerator"
                      style={{
                        height: `${accelerator * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="input-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Frein */}
              <div className="input-display input-display-brake">
                <div className="input-display-header">
                  <h3>🛑 Frein</h3>
                  <span className="input-value">{brakePercent}%</span>
                </div>
                <div className="input-bar-container">
                  <div className="input-bar input-bar-vertical">
                    <div
                      className="input-bar-fill input-bar-fill-brake"
                      style={{
                        height: `${brake * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="input-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Embrayage (si présent) */}
              {clutch > 0.01 && (
                <div className="input-display input-display-clutch">
                  <div className="input-display-header">
                    <h3>🔧 Embrayage</h3>
                    <span className="input-value">{clutchPercent}%</span>
                  </div>
                  <div className="input-bar-container">
                    <div className="input-bar input-bar-vertical">
                      <div
                        className="input-bar-fill input-bar-fill-clutch"
                        style={{
                          height: `${clutch * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="input-labels">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Données brutes (pour debug) */}
            <details className="raw-data">
              <summary>🔧 Données brutes (Debug)</summary>
              <div className="raw-data-content">
                <div className="raw-data-section">
                  <h4>Axes</h4>
                  <pre>{JSON.stringify(raw.axes, null, 2)}</pre>
                </div>
                <div className="raw-data-section">
                  <h4>Boutons</h4>
                  <pre>{JSON.stringify(raw.buttons, null, 2)}</pre>
                </div>
              </div>
            </details>
          </section>
        )}

        {/* Message si aucun device assigné */}
        {!hasAssignedDevices && gamepads.length > 0 && (
          <section className="drills-section">
            <div className="info-message">
              <p>⚙️ Configurez le mapping de vos périphériques pour voir les valeurs en temps réel.</p>
              <button
                className="show-config-button"
                onClick={() => setShowConfig(true)}
              >
                Ouvrir la configuration
              </button>
            </div>
          </section>
        )}

        {/* Message si aucun device connecté */}
        {gamepads.length === 0 && isSupported && (
          <section className="drills-section">
            <div className="info-message">
              <p>⏳ Connectez vos périphériques pour commencer.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

