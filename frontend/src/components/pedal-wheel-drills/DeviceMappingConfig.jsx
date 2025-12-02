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
  assignDevice,
  mapAxis,
  resetMappingConfig,
  DEVICE_TYPES,
  AXIS_TYPES
} from '../../services/deviceMappingService';
import { getConnectedGamepads, getGamepadInfo } from '../../services/gamepadService';
import './DeviceMappingConfig.css';

// Fonctions assignables avec leurs labels
const ASSIGNABLE_FUNCTIONS = [
  { type: AXIS_TYPES.ACCELERATOR, label: '⚡ Accélérateur', icon: '⚡' },
  { type: AXIS_TYPES.BRAKE, label: '🛑 Frein', icon: '🛑' },
  { type: AXIS_TYPES.WHEEL, label: '🎮 Volant', icon: '🎮' },
  { type: AXIS_TYPES.CLUTCH, label: '🔧 Embrayage', icon: '🔧' }
];

export function DeviceMappingConfig({ onConfigChange }) {
  const [config, setConfig] = useState(loadMappingConfig());
  const [gamepads, setGamepads] = useState([]);
  const [assigningFunction, setAssigningFunction] = useState(null); // Fonction en cours d'assignation
  const [previousAxesValues, setPreviousAxesValues] = useState({}); // Valeurs précédentes pour détecter les changements
  const [debugInfo, setDebugInfo] = useState(null); // Info de debug
  const assignmentTimeoutRef = useRef(null);

  // Charger les gamepads avec polling
  useEffect(() => {
    const updateGamepads = () => {
      setGamepads(getConnectedGamepads());
    };
    
    updateGamepads();
    const interval = setInterval(updateGamepads, 50); // Polling rapide pour détecter les changements
    
    return () => clearInterval(interval);
  }, []);

  // Détecter les changements d'axes pendant l'assignation
  useEffect(() => {
    if (!assigningFunction) {
      // Sauvegarder les valeurs actuelles comme référence
      const currentValues = {};
      gamepads.forEach(gamepad => {
        if (gamepad && gamepad.axes) {
          currentValues[gamepad.index] = Array.from(gamepad.axes);
        }
      });
      setPreviousAxesValues(currentValues);
      return;
    }

    // Détecter quel axe a changé
    const detectAxisChange = () => {
      gamepads.forEach(gamepad => {
        if (!gamepad || !gamepad.axes) return;

        const deviceIndex = gamepad.index;
        const currentAxes = Array.from(gamepad.axes);
        const previousAxes = previousAxesValues[deviceIndex] || [];

        // Chercher l'axe qui a le plus changé
        let maxChange = 0;
        let changedAxisIndex = -1;
        let changedAxisValue = 0;
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
          
          // Seuil de détection plus bas pour être plus réactif
          // Pour le volant, on accepte des changements plus petits
          const threshold = assigningFunction === AXIS_TYPES.WHEEL ? 0.02 : 0.05;
          
          if (change > maxChange && change > threshold) {
            maxChange = change;
            changedAxisIndex = axisIndex;
            changedAxisValue = currentValue;
          }
        });

        // Debug info
        if (allChanges.length > 0) {
          const maxChangeInfo = allChanges.reduce((max, curr) => 
            curr.change > max.change ? curr : max
          );
          setDebugInfo({
            maxChange: maxChangeInfo.change,
            axis: maxChangeInfo.axis,
            current: maxChangeInfo.current,
            previous: maxChangeInfo.previous,
            threshold: assigningFunction === AXIS_TYPES.WHEEL ? 0.02 : 0.05
          });
        }

        // Si un axe a changé significativement, l'assigner
        const threshold = assigningFunction === AXIS_TYPES.WHEEL ? 0.02 : 0.05;
        if (changedAxisIndex >= 0 && maxChange > threshold) {
          // Détecter si l'axe doit être inversé
          // Pour les pédales : si la valeur est négative quand on appuie, il faut inverser
          // Pour le volant : pas d'inversion nécessaire
          let shouldInvert = false;
          
          if (assigningFunction === AXIS_TYPES.ACCELERATOR || 
              assigningFunction === AXIS_TYPES.BRAKE ||
              assigningFunction === AXIS_TYPES.CLUTCH) {
            // Pour les pédales, si la valeur est négative quand on appuie, inverser
            shouldInvert = changedAxisValue < -0.1;
          }

          // Assigner l'axe
          const newConfig = mapAxis(
            deviceIndex,
            changedAxisIndex,
            assigningFunction,
            shouldInvert,
            config
          );
          setConfig(newConfig);
          setAssigningFunction(null);
          setDebugInfo(null);
          
          // Mettre à jour les valeurs précédentes
          const updatedValues = { ...previousAxesValues };
          updatedValues[deviceIndex] = currentAxes;
          setPreviousAxesValues(updatedValues);

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
    };
  }, [assigningFunction, gamepads, previousAxesValues, config, onConfigChange]);

  // Notifier les changements de config
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  const handleStartAssignment = (functionType) => {
    setAssigningFunction(functionType);
    // Sauvegarder les valeurs actuelles comme référence
    const currentValues = {};
    gamepads.forEach(gamepad => {
      if (gamepad && gamepad.axes) {
        currentValues[gamepad.index] = Array.from(gamepad.axes);
      }
    });
    setPreviousAxesValues(currentValues);
  };

  const handleCancelAssignment = () => {
    setAssigningFunction(null);
    setDebugInfo(null);
    if (assignmentTimeoutRef.current) {
      clearTimeout(assignmentTimeoutRef.current);
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
    for (const [deviceIndex, axisMappings] of Object.entries(config.axisMappings)) {
      for (const [axisIndex, mapping] of Object.entries(axisMappings)) {
        if (mapping.type === functionType) {
          const gamepad = gamepads.find(gp => gp.index === parseInt(deviceIndex));
          if (gamepad) {
            const info = getGamepadInfo(gamepad);
            return {
              device: info.id,
              axis: parseInt(axisIndex),
              invert: mapping.invert
            };
          }
        }
      }
    }
    return null;
  };

  return (
    <div className="device-mapping-config">
      <div className="config-header">
        <h3>⚙️ Configuration du Mapping</h3>
        <button className="reset-button" onClick={handleReset}>
          🔄 Réinitialiser
        </button>
      </div>

      {gamepads.length === 0 ? (
        <div className="config-message">
          <p>Connectez vos périphériques pour commencer la configuration.</p>
        </div>
      ) : (
        <div className="config-content">
          {/* Liste des fonctions à assigner */}
          <div className="functions-list">
            <h4>Assigner les fonctions</h4>
            <p className="config-instructions">
              Cliquez sur une fonction, puis bougez/appuyez sur le contrôle correspondant pour l'assigner automatiquement.
            </p>
            
            {ASSIGNABLE_FUNCTIONS.map(func => {
              const isAssigning = assigningFunction === func.type;
              const currentAssignment = getCurrentAssignment(func.type);
              
              return (
                <div
                  key={func.type}
                  className={`function-item ${isAssigning ? 'function-item-assigning' : ''} ${currentAssignment ? 'function-item-assigned' : ''}`}
                >
                  <div className="function-info">
                    <span className="function-icon">{func.icon}</span>
                    <div className="function-details">
                      <span className="function-label">{func.label}</span>
                      {currentAssignment && (
                        <span className="function-assignment">
                          Assigné: {currentAssignment.device} - Axe {currentAssignment.axis}
                          {currentAssignment.invert && ' (inversé)'}
                        </span>
                      )}
                       {isAssigning && (
                         <div className="function-assigning-hint">
                           <span>⏳ Bougez/appuyez sur le contrôle maintenant...</span>
                           {debugInfo && (
                             <span className="debug-info">
                               Détection: Axe {debugInfo.axis} - Changement: {debugInfo.maxChange.toFixed(3)} 
                               (Seuil: {debugInfo.threshold}) - Valeur: {debugInfo.current.toFixed(3)}
                             </span>
                           )}
                         </div>
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
                      <button
                        className="assign-button"
                        onClick={() => handleStartAssignment(func.type)}
                      >
                        {currentAssignment ? 'Réassigner' : 'Assigner'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Liste des devices connectés (pour info) */}
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
        </div>
      )}
    </div>
  );
}
