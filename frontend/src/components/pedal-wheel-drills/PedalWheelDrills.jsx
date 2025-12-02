/**
 * Composant PedalWheelDrills
 * 
 * Composant principal pour les drills pédales/volant
 * Phase 1 : Affichage de la connexion et des valeurs en temps réel
 */

import { useState } from 'react';
import { DeviceConnector } from './DeviceConnector';
import { useGamepad } from '../../hooks/useGamepad';
import './PedalWheelDrills.css';

export function PedalWheelDrills() {
  const [selectedGamepadIndex, setSelectedGamepadIndex] = useState(null);
  
  const {
    isConnected,
    wheel,
    accelerator,
    brake,
    clutch,
    raw
  } = useGamepad(selectedGamepadIndex);

  const handleGamepadSelect = (index) => {
    setSelectedGamepadIndex(index);
  };

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
          <h2 className="section-title">🔌 Connexion Périphérique</h2>
          <DeviceConnector onGamepadSelect={handleGamepadSelect} />
        </section>

        {/* Section Affichage en Temps Réel */}
        {isConnected && (
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

        {/* Message si non connecté */}
        {!isConnected && selectedGamepadIndex !== null && (
          <section className="drills-section">
            <div className="info-message">
              <p>⏳ En attente de connexion du périphérique...</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

