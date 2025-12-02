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
    clutch: 0
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

  // Vérifier le support de l'API
  useEffect(() => {
    const supported = typeof navigator !== 'undefined' && 
                      typeof navigator.getGamepads === 'function';
    isSupportedRef.current = supported;
    setIsSupported(supported);
  }, []);

  // Fonction de polling des données (mémorisée avec useCallback)
  const pollGamepads = useCallback(() => {
    if (!isSupportedRef.current) {
      animationFrameRef.current = null;
      return;
    }

    const connected = getConnectedGamepads();
    setGamepads(connected);

    // Appliquer le mapping pour obtenir les valeurs
    const wheel = getMappedValue(AXIS_TYPES.WHEEL, connected, currentConfigRef.current);
    const accelerator = getMappedValue(AXIS_TYPES.ACCELERATOR, connected, currentConfigRef.current);
    const brake = getMappedValue(AXIS_TYPES.BRAKE, connected, currentConfigRef.current);
    const clutch = getMappedValue(AXIS_TYPES.CLUTCH, connected, currentConfigRef.current);

    setMappedValues({
      wheel,
      accelerator,
      brake,
      clutch
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
    
    // Config actuelle
    config: currentConfigRef.current
  };
}

