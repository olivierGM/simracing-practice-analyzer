/**
 * Hook useMappedGamepads
 * 
 * Hook pour gérer plusieurs gamepads avec mapping personnalisé
 * Utilise le système de configuration de mapping
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getConnectedGamepads } from '../services/gamepadService';
import {
  loadMappingConfig,
  getMappedValue,
  AXIS_TYPES
} from '../services/deviceMappingService';
import {
  initializeKeyboardListeners,
  cleanupKeyboardListeners,
  getKeyboardValue,
  setProgressiveMode,
  isProgressiveModeEnabled
} from '../services/keyboardService';

/**
 * Hook pour utiliser plusieurs gamepads avec mapping
 * @param {Object} config - Configuration de mapping (optionnel, charge depuis localStorage si non fourni)
 * @returns {Object} État et données des gamepads mappés
 */
export function useMappedGamepads(config = null) {
  const [gamepads, setGamepads] = useState([]);
  const [mappedValues, setMappedValues] = useState({
    wheel: 0,
    accelerator: 0,
    brake: 0,
    clutch: 0,
    shiftUp: false,
    shiftDown: false
  });
  const [isSupported, setIsSupported] = useState(false);
  
  const animationFrameRef = useRef(null);
  const currentConfigRef = useRef(config || loadMappingConfig());
  const isSupportedRef = useRef(false);

  // Charger la config si non fournie
  useEffect(() => {
    if (!config) {
      currentConfigRef.current = loadMappingConfig();
    } else {
      currentConfigRef.current = config;
    }
  }, [config]);

  // Vérifier le support de l'API et initialiser le clavier
  useEffect(() => {
    const supported = typeof navigator !== 'undefined' && 
                      typeof navigator.getGamepads === 'function';
    isSupportedRef.current = supported;
    setIsSupported(supported);
    
    // Initialiser les listeners clavier
    initializeKeyboardListeners();
    
    return () => {
      cleanupKeyboardListeners();
    };
  }, []);

  // Fonction de polling des données (mémorisée avec useCallback)
  const pollGamepads = useCallback(() => {
    if (!isSupportedRef.current) {
      animationFrameRef.current = null;
      return;
    }

    const connected = getConnectedGamepads();
    setGamepads(connected);

    // Auto-activer le mode progressif si aucun gamepad connecté
    const hasGamepads = connected.length > 0;
    if (!hasGamepads && !isProgressiveModeEnabled()) {
      setProgressiveMode(true);
    } else if (hasGamepads && isProgressiveModeEnabled()) {
      // Désactiver le mode progressif si un gamepad est connecté
      setProgressiveMode(false);
    }

    // Appliquer le mapping pour obtenir les valeurs depuis les gamepads
    let wheel = getMappedValue(AXIS_TYPES.WHEEL, connected, currentConfigRef.current);
    let accelerator = getMappedValue(AXIS_TYPES.ACCELERATOR, connected, currentConfigRef.current);
    let brake = getMappedValue(AXIS_TYPES.BRAKE, connected, currentConfigRef.current);
    let clutch = getMappedValue(AXIS_TYPES.CLUTCH, connected, currentConfigRef.current);
    let shiftUp = getMappedValue(AXIS_TYPES.SHIFT_UP, connected, currentConfigRef.current) > 0.5;
    let shiftDown = getMappedValue(AXIS_TYPES.SHIFT_DOWN, connected, currentConfigRef.current) > 0.5;

    // Combiner avec les valeurs du clavier (priorité au gamepad si les deux sont actifs)
    const keyboardWheel = getKeyboardValue('wheel');
    const keyboardAccel = getKeyboardValue('accelerator');
    const keyboardBrake = getKeyboardValue('brake');
    const keyboardClutch = getKeyboardValue('clutch');
    const keyboardShiftUp = getKeyboardValue('shift_up') > 0.5;
    const keyboardShiftDown = getKeyboardValue('shift_down') > 0.5;

    // Utiliser le clavier si les gamepads ne sont pas actifs, sinon combiner (max)
    wheel = Math.abs(wheel) > 0.1 ? wheel : keyboardWheel;
    accelerator = accelerator > 0.1 ? accelerator : keyboardAccel;
    brake = brake > 0.1 ? brake : keyboardBrake;
    clutch = clutch > 0.1 ? clutch : keyboardClutch;
    shiftUp = shiftUp || keyboardShiftUp;
    shiftDown = shiftDown || keyboardShiftDown;

    setMappedValues({
      wheel,
      accelerator,
      brake,
      clutch,
      shiftUp,
      shiftDown
    });

    // Continuer le polling seulement si on est toujours monté
    if (animationFrameRef.current !== null) {
      animationFrameRef.current = requestAnimationFrame(pollGamepads);
    }
  }, []); // Pas de dépendances - utilise des refs

  // Démarrer le polling
  useEffect(() => {
    if (!isSupportedRef.current) return;

    // Démarrer le polling
    animationFrameRef.current = requestAnimationFrame(pollGamepads);

    // Nettoyer à la fin
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [pollGamepads]);

  return {
    // État
    isSupported,
    gamepads,
    
    // Valeurs mappées
    wheel: mappedValues.wheel,
    accelerator: mappedValues.accelerator,
    brake: mappedValues.brake,
    clutch: mappedValues.clutch,
    shiftUp: mappedValues.shiftUp,
    shiftDown: mappedValues.shiftDown,
    
    // Config actuelle
    config: currentConfigRef.current
  };
}

