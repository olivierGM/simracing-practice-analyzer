/**
 * Hook useGamepad
 * 
 * Hook personnalisé pour gérer les gamepads
 * Utilise requestAnimationFrame pour le polling des données
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getConnectedGamepads,
  mapRacingWheelAxes,
  getGamepadInfo,
  isGamepadAPISupported,
  listenToGamepadEvents
} from '../services/gamepadService';

/**
 * Hook pour utiliser un gamepad
 * @param {number} gamepadIndex - Index du gamepad à utiliser (optionnel, utilise le premier si non spécifié)
 * @returns {Object} État et données du gamepad
 */
export function useGamepad(gamepadIndex = null) {
  const [gamepads, setGamepads] = useState([]);
  const [selectedGamepad, setSelectedGamepad] = useState(null);
  const [gamepadData, setGamepadData] = useState({
    wheel: 0,
    accelerator: 0,
    brake: 0,
    clutch: 0,
    raw: { axes: [], buttons: [] }
  });
  const [gamepadInfo, setGamepadInfo] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const animationFrameRef = useRef(null);
  const lastGamepadRef = useRef(null);
  const gamepadIndexRef = useRef(gamepadIndex);
  const isSupportedRef = useRef(false);

  // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    gamepadIndexRef.current = gamepadIndex;
  }, [gamepadIndex]);

  // Vérifier le support de l'API
  useEffect(() => {
    const supported = isGamepadAPISupported();
    isSupportedRef.current = supported;
    setIsSupported(supported);
  }, []);

  // Fonction de polling des données (mémorisée avec useCallback)
  const pollGamepad = useCallback(() => {
    if (!isSupportedRef.current) {
      animationFrameRef.current = null;
      return;
    }

    const connected = getConnectedGamepads();
    setGamepads(connected);

    // Sélectionner le gamepad
    let currentGamepad = null;
    const currentIndex = gamepadIndexRef.current;
    if (currentIndex !== null && connected[currentIndex]) {
      currentGamepad = connected[currentIndex];
    } else if (connected.length > 0) {
      currentGamepad = connected[0];
    }

    // Mettre à jour si le gamepad a changé
    if (currentGamepad !== lastGamepadRef.current) {
      lastGamepadRef.current = currentGamepad;
      setSelectedGamepad(currentGamepad);
      setIsConnected(currentGamepad !== null);
      
      if (currentGamepad) {
        setGamepadInfo(getGamepadInfo(currentGamepad));
      } else {
        setGamepadInfo(null);
        setGamepadData({
          wheel: 0,
          accelerator: 0,
          brake: 0,
          clutch: 0,
          raw: { axes: [], buttons: [] }
        });
      }
    }

    // Lire les données si un gamepad est connecté
    if (currentGamepad) {
      const mapped = mapRacingWheelAxes(currentGamepad);
      setGamepadData(mapped);
    }

    // Continuer le polling seulement si on est toujours monté
    if (animationFrameRef.current !== null) {
      animationFrameRef.current = requestAnimationFrame(pollGamepad);
    }
  }, []); // Pas de dépendances - utilise des refs

  // Démarrer le polling
  useEffect(() => {
    if (!isSupportedRef.current) return;

    // Démarrer le polling
    animationFrameRef.current = requestAnimationFrame(pollGamepad);

    // Nettoyer à la fin
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [pollGamepad]);

  // Écouter les événements de connexion/déconnexion
  useEffect(() => {
    if (!isSupported) return;

    const cleanup = listenToGamepadEvents(
      (gamepad) => {
        console.log('Gamepad connecté:', gamepad.id);
        // Le polling détectera automatiquement le nouveau gamepad
      },
      (gamepad) => {
        console.log('Gamepad déconnecté:', gamepad.id);
        // Le polling détectera automatiquement la déconnexion
      }
    );

    return cleanup;
  }, [isSupported]);

  return {
    // État
    isSupported,
    isConnected,
    gamepads,
    selectedGamepad,
    gamepadInfo,
    
    // Données
    wheel: gamepadData.wheel,
    accelerator: gamepadData.accelerator,
    brake: gamepadData.brake,
    clutch: gamepadData.clutch,
    raw: gamepadData.raw,
    
    // Utilitaires
    selectGamepad: (index) => {
      const connected = getConnectedGamepads();
      if (connected[index]) {
        setSelectedGamepad(connected[index]);
      }
    }
  };
}

