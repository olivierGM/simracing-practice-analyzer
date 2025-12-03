/**
 * Composant PedalWheelDrills
 * 
 * Composant principal pour les drills pédales/volant
 * Phase 1 : Affichage de la connexion et des valeurs en temps réel
 * Avec support de mapping personnalisé et plusieurs devices
 */

import { useState } from 'react';
import { DeviceMappingConfig } from './DeviceMappingConfig';
import { DrillSelector, DRILL_TYPES } from './DrillSelector';
import { PercentageDrill } from './PercentageDrill';
import { useMappedGamepads } from '../../hooks/useMappedGamepads';
import { loadMappingConfig } from '../../services/deviceMappingService';
import { getAssignedKeys } from '../../services/keyboardService';
import './PedalWheelDrills.css';

export function PedalWheelDrills() {
  const [mappingConfig, setMappingConfig] = useState(loadMappingConfig());
  const [showConfig, setShowConfig] = useState(false); // Fermé par défaut
  const [selectedDrill, setSelectedDrill] = useState(null); // null = sélection, sinon type de drill
  
  const {
    isSupported,
    gamepads,
    wheel,
    accelerator,
    brake,
    shiftUp,
    shiftDown
  } = useMappedGamepads(mappingConfig);

  const handleConfigChange = (newConfig) => {
    setMappingConfig(newConfig);
  };

  const handleDrillSelect = (drillType) => {
    setSelectedDrill(drillType);
  };

  const handleDrillBack = () => {
    setSelectedDrill(null);
  };

  // Vérifier si des axes sont assignés (dans axisMappings OU clavier)
  const hasGamepadAssignments = Object.keys(mappingConfig.axisMappings || {}).length > 0 && 
    Object.values(mappingConfig.axisMappings || {}).some(deviceMappings => 
      Object.keys(deviceMappings || {}).length > 0
    );
  
  // Vérifier si des touches clavier sont assignées
  const assignedKeys = getAssignedKeys();
  const hasKeyboardAssignments = Object.keys(assignedKeys).length > 0;
  
  // On peut utiliser les drills si on a des gamepads OU du clavier assigné
  const hasAssignedDevices = hasGamepadAssignments || hasKeyboardAssignments;

  return (
    <div className="pedal-wheel-drills">
      <div className="drills-container">
        {/* Section Configuration */}
        <section className="drills-section">
          <div className="section-header-with-button">
            <h2 className="section-title">⚙️ Configuration</h2>
            <button
              className="config-toggle-button"
              onClick={() => setShowConfig(!showConfig)}
            >
              {showConfig ? '▼' : '▶'} {showConfig ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          
          {/* Panneau de configuration */}
          {showConfig && (
            <div className="config-panel">
              <DeviceMappingConfig onConfigChange={handleConfigChange} />
            </div>
          )}
        </section>

        {/* Section 2: Sélection du Drill */}
        <section className="drills-section">
          <h2 className="section-title">🎮 Sélection du Drill</h2>
          {!selectedDrill ? (
            <>
              {!hasAssignedDevices && (
                <div className="drill-setup-message" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                  <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
                    💡 <strong>Astuce:</strong> Configurez vos périphériques ou touches clavier pour utiliser les drills.
                  </p>
                  <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.8 }}>
                    Cliquez sur "Afficher" dans Configuration, puis assignez des touches (ex: W = accélérateur, S = frein, ←→ = volant)
                  </p>
                </div>
              )}
              
              {hasKeyboardAssignments && !hasGamepadAssignments && (
                <div className="drill-setup-message" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)' }}>
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>
                    ⌨️ Mode clavier activé - Vous pouvez tester les drills avec le clavier !
                  </p>
                </div>
              )}
              
              <DrillSelector 
                onSelectDrill={handleDrillSelect}
                selectedDrill={selectedDrill}
              />
            </>
          ) : (
            <>
                {selectedDrill === DRILL_TYPES.PERCENTAGE && (
                  <PercentageDrill
                    acceleratorValue={accelerator}
                    brakeValue={brake}
                    wheelValue={wheel}
                    shiftUp={shiftUp}
                    shiftDown={shiftDown}
                    onBack={handleDrillBack}
                  />
                )}
              {/* Autres types de drills à ajouter plus tard */}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

