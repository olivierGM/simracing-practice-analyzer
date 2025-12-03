/**
 * Composant DeviceMappingConfig
 * 
 * Panneau de configuration pour mapper les devices et les axes
 * Interface intuitive : cliquer sur une fonction puis bouger/appuyer pour assigner
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { getMappedValue } from '../../services/deviceMappingService';
import {
  initializeKeyboardListeners,
  cleanupKeyboardListeners,
  assignKeyToFunction,
  unassignKey,
  getAssignedKeys,
  formatKeyCode,
  isKeyPressed,
  getKeyboardValue
} from '../../services/keyboardService';
import './DeviceMappingConfig.css';

// Fonctions assignables avec leurs labels
const ASSIGNABLE_FUNCTIONS = [
  { type: AXIS_TYPES.ACCELERATOR, label: '⚡ Accélérateur', icon: '⚡' },
  { type: AXIS_TYPES.BRAKE, label: '🛑 Frein', icon: '🛑' },
  { type: AXIS_TYPES.WHEEL, label: '🎮 Volant', icon: '🎮' },
  { type: AXIS_TYPES.SHIFT_UP, label: '⬆️ Shift Up', icon: '⬆️' },
  { type: AXIS_TYPES.SHIFT_DOWN, label: '⬇️ Shift Down', icon: '⬇️' }
];

export function DeviceMappingConfig({ onConfigChange }) {
  const [config, setConfig] = useState(loadMappingConfig());
  const [gamepads, setGamepads] = useState([]);
  const [assigningFunction, setAssigningFunction] = useState(null); // Fonction en cours d'assignation
  const [debugInfo, setDebugInfo] = useState(null); // Info de debug
  const [realtimeValues, setRealtimeValues] = useState({}); // Valeurs en temps réel pour les tests
  const assignmentTimeoutRef = useRef(null);
  const configRef = useRef(config); // Ref pour éviter les dépendances dans useEffect
  const debugUpdateTimeoutRef = useRef(null); // Pour limiter les mises à jour de debug
  const previousAxesValuesRef = useRef({}); // Ref pour éviter les re-renders

  // Initialiser le clavier
  useEffect(() => {
    initializeKeyboardListeners();
    return () => {
      cleanupKeyboardListeners();
    };
  }, []);

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
      
      // Vérifier si chaque fonction est assignée et récupérer sa valeur
      const assignedKeys = getAssignedKeys();
      ASSIGNABLE_FUNCTIONS.forEach(func => {
        // Vérifier si la fonction est assignée dans la config (gamepad)
        let isAssigned = false;
        for (const [deviceIndex, axisMappings] of Object.entries(currentConfig.axisMappings || {})) {
          for (const [axisIndex, mapping] of Object.entries(axisMappings)) {
            if (mapping && mapping.type === func.type) {
              isAssigned = true;
              break;
            }
          }
          if (isAssigned) break;
        }
        
        // Vérifier aussi si assignée au clavier
        if (!isAssigned) {
          for (const assignedType of Object.values(assignedKeys)) {
            if (assignedType === func.type) {
              isAssigned = true;
              break;
            }
          }
        }
        
        if (isAssigned) {
          // Récupérer les valeurs depuis gamepad et clavier
          const keyboardValue = getKeyboardValue(func.type);
          const gamepadValue = getMappedValue(func.type, connected, currentConfig);
          
          // Utiliser le gamepad si actif, sinon le clavier
          if (func.type === 'wheel') {
            values[func.type] = Math.abs(gamepadValue) > 0.1 ? gamepadValue : keyboardValue;
          } else {
            values[func.type] = gamepadValue > 0.1 ? gamepadValue : keyboardValue;
          }
        }
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
              // Pour les boutons, on utilise un index négatif pour les différencier des axes
              const newConfig = mapAxis(
                deviceIndex,
                -buttonIndex - 1, // Index négatif pour les boutons
                assigningFunction,
                false, // Pas d'inversion pour les boutons
                currentConfig
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
              changedAxisValue = currentValue;
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
          const newConfig = mapAxis(
            deviceIndex,
            changedAxisIndex,
            assigningFunction,
            shouldInvert,
            currentConfig
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

    // Détecter les touches clavier pressées
    const detectKeyPress = () => {
      if (!assigningFunction) return;

      // Écouter les événements clavier via window
      const handleKeyDown = (e) => {
        e.preventDefault(); // Empêcher le comportement par défaut
        
        // Assigner la touche à la fonction
        assignKeyToFunction(e.code, assigningFunction);
        
        // Notifier le changement
        setAssigningFunction(null);
        setDebugInfo(null);
        
        // Mettre à jour la config (les touches clavier sont gérées séparément)
        if (onConfigChange) {
          onConfigChange(configRef.current);
        }
        
        // Retirer le listener
        window.removeEventListener('keydown', handleKeyDown);
      };
      
      // Ajouter le listener temporaire
      window.addEventListener('keydown', handleKeyDown);
      
      // Retirer le listener après 10 secondes ou quand l'assignation est annulée
      const timeoutId = setTimeout(() => {
        window.removeEventListener('keydown', handleKeyDown);
      }, 10000);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('keydown', handleKeyDown);
      };
    };

    let keyCleanup = null;
    if (assigningFunction) {
      keyCleanup = detectKeyPress();
    }

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
      if (keyCleanup) {
        keyCleanup();
      }
    };
  }, [assigningFunction, gamepads, onConfigChange]); // Retirer previousAxesValues (utilise une ref maintenant)

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
    for (const [deviceIndex, axisMappings] of Object.entries(newConfig.axisMappings)) {
      for (const [axisIndex, mapping] of Object.entries(axisMappings)) {
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
    // Vérifier d'abord les touches clavier
    const assignedKeys = getAssignedKeys();
    for (const [keyCode, assignedType] of Object.entries(assignedKeys)) {
      if (assignedType === functionType) {
        return {
          type: 'keyboard',
          key: formatKeyCode(keyCode),
          keyCode: keyCode
        };
      }
    }
    
    // Ensuite vérifier les gamepads
    for (const [deviceIndex, axisMappings] of Object.entries(config.axisMappings)) {
      for (const [axisIndex, mapping] of Object.entries(axisMappings)) {
        if (mapping.type === functionType) {
          const gamepad = gamepads.find(gp => gp.index === parseInt(deviceIndex));
          if (gamepad) {
            const info = getGamepadInfo(gamepad);
            const axisIdx = parseInt(axisIndex);
            // Si l'index est négatif, c'est un bouton
            if (axisIdx < 0) {
              const buttonIndex = -axisIdx - 1;
              return {
                type: 'gamepad',
                device: info.id,
                button: buttonIndex,
                invert: mapping.invert,
                isButton: true
              };
            } else {
              return {
                type: 'gamepad',
                device: info.id,
                axis: axisIdx,
                invert: mapping.invert,
                isButton: false
              };
            }
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
                        <>
                          <span className="function-assignment">
                            Assigné: {
                              currentAssignment.type === 'keyboard'
                                ? `⌨️ Touche ${currentAssignment.key}`
                                : `${currentAssignment.device} - ${
                                    currentAssignment.isButton 
                                      ? `Bouton ${currentAssignment.button}`
                                      : `Axe ${currentAssignment.axis}`
                                  }`
                            }
                            {currentAssignment.type === 'gamepad' && currentAssignment.invert && ' (inversé)'}
                          </span>
                          {/* Barre de test en temps réel */}
                          <div className="function-test-bar">
                            <div className="test-bar-container">
                              {func.type === AXIS_TYPES.WHEEL ? (
                                // Barre horizontale pour le volant (gauche/droite)
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
                                // Barre pour les boutons (on/off)
                                <div className="test-bar test-bar-button">
                                  <div
                                    className={`test-bar-fill test-bar-fill-button ${(realtimeValues[func.type] || 0) > 0.5 ? 'active' : ''}`}
                                    style={{
                                      width: `${(realtimeValues[func.type] || 0) > 0.5 ? 100 : 0}%`
                                    }}
                                  />
                                </div>
                              ) : (
                                // Barre horizontale pour les pédales (0-100%)
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
                        </>
                      )}
                       {isAssigning && (
                         <div className="function-assigning-hint">
                           <span>⏳ Bougez/appuyez sur le contrôle maintenant...</span>
                           {debugInfo && (
                             <span className="debug-info">
                               Axe {debugInfo.axis}: {debugInfo.current.toFixed(3)} 
                               (Changement: {debugInfo.maxChange.toFixed(3)}, Seuil: {debugInfo.threshold})
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
                      <>
                        <button
                          className="assign-button"
                          onClick={() => handleStartAssignment(func.type)}
                        >
                          {currentAssignment ? 'Réassigner' : 'Assigner'}
                        </button>
                        {currentAssignment && 
                         (func.type === AXIS_TYPES.ACCELERATOR || func.type === AXIS_TYPES.BRAKE) && (
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
