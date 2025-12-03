/**
 * Hook useDualDDRTargets
 * 
 * Gère les targets pour les deux pédales (frein + accélérateur)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { generateTargetSequence } from './useDDRTargets';

export function useDualDDRTargets({
  isActive = false,
  duration = null,
  drillSong = null,
  difficulty = 'medium',
  onComplete = null
}) {
  const [brakeTargets, setBrakeTargets] = useState([]);
  const [throttleTargets, setThrottleTargets] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Générer les targets au démarrage
  useEffect(() => {
    if (isActive && brakeTargets.length === 0 && throttleTargets.length === 0) {
      if (drillSong && drillSong.brake_targets && drillSong.throttle_targets) {
        // Charger depuis un drill song
        setBrakeTargets(drillSong.brake_targets.map((t, idx) => ({
          ...t,
          id: `brake-${idx}`,
          hit: false,
          missed: false
        })));
        setThrottleTargets(drillSong.throttle_targets.map((t, idx) => ({
          ...t,
          id: `throttle-${idx}`,
          hit: false,
          missed: false
        })));
      } else {
        // Générer aléatoirement (mode random)
        const brakeSeq = generateTargetSequence({
          duration,
          percentages: [20, 40, 60, 80, 100],
          difficulty
        });
        const throttleSeq = generateTargetSequence({
          duration,
          percentages: [20, 40, 60, 80, 100],
          difficulty
        });
        
        setBrakeTargets(brakeSeq.map(t => ({ ...t, id: `brake-${t.id}` })));
        setThrottleTargets(throttleSeq.map(t => ({ ...t, id: `throttle-${t.id}` })));
      }
      
      startTimeRef.current = Date.now();
      setIsComplete(false);
    }
  }, [isActive, drillSong, duration, difficulty, brakeTargets.length, throttleTargets.length]);

  // Animation loop pour mettre à jour le temps
  useEffect(() => {
    if (!isActive || !startTimeRef.current) {
      return;
    }

    const updateTime = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      // Vérifier si le drill est terminé
      if (duration !== null && elapsed >= duration) {
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, duration, onComplete]);

  // Réinitialiser quand le jeu s'arrête
  useEffect(() => {
    if (!isActive) {
      setBrakeTargets([]);
      setThrottleTargets([]);
      setCurrentTime(0);
      startTimeRef.current = null;
      setIsComplete(false);
    }
  }, [isActive]);

  // Marquer un target comme hit
  const markBrakeTargetHit = useCallback((targetId) => {
    setBrakeTargets(prev => prev.map(t => 
      t.id === targetId ? { ...t, hit: true } : t
    ));
  }, []);

  const markThrottleTargetHit = useCallback((targetId) => {
    setThrottleTargets(prev => prev.map(t => 
      t.id === targetId ? { ...t, hit: true } : t
    ));
  }, []);

  const markBrakeTargetMiss = useCallback((targetId) => {
    setBrakeTargets(prev => prev.map(t => 
      t.id === targetId ? { ...t, missed: true } : t
    ));
  }, []);

  const markThrottleTargetMiss = useCallback((targetId) => {
    setThrottleTargets(prev => prev.map(t => 
      t.id === targetId ? { ...t, missed: true } : t
    ));
  }, []);

  return {
    brakeTargets,
    throttleTargets,
    currentTime,
    isComplete,
    markBrakeTargetHit,
    markThrottleTargetHit,
    markBrakeTargetMiss,
    markThrottleTargetMiss
  };
}

