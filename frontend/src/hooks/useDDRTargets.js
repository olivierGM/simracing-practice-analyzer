/**
 * Hook useDDRTargets
 * 
 * Gère la génération et le suivi des cibles DDR
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Paramètres de génération selon la difficulté
 */
const DIFFICULTY_PARAMS = {
  easy: {
    minDuration: 1.0,
    maxDuration: 4.0,
    minSpacing: 1.0,
    maxSpacing: 3.0
  },
  medium: {
    minDuration: 0.5,
    maxDuration: 3.0,
    minSpacing: 0.5,
    maxSpacing: 2.0
  },
  hard: {
    minDuration: 0.5,
    maxDuration: 2.0,
    minSpacing: 0.3,
    maxSpacing: 1.0
  }
};

/**
 * Génère une séquence de cibles
 * @param {Object} options
 * @param {number} options.duration - Durée totale en secondes (null = infini)
 * @param {Array<number>} options.percentages - Pourcentages disponibles [20, 40, 60, 80]
 * @param {string} options.difficulty - Difficulté ('easy', 'medium', 'hard')
 * @param {number} options.minDuration - Durée minimum d'une cible (secondes) - override si difficulty fournie
 * @param {number} options.maxDuration - Durée maximum d'une cible (secondes) - override si difficulty fournie
 * @param {number} options.minSpacing - Espacement minimum entre cibles (secondes) - override si difficulty fournie
 * @param {number} options.maxSpacing - Espacement maximum entre cibles (secondes) - override si difficulty fournie
 * @returns {Array} Séquence de cibles
 */
export function generateTargetSequence({
  duration = null,
  percentages = [20, 40, 60, 80, 100],
  difficulty = 'medium',
  minDuration = null,
  maxDuration = null,
  minSpacing = null,
  maxSpacing = null
}) {
  // Utiliser les paramètres de difficulté si fournis
  const params = difficulty && DIFFICULTY_PARAMS[difficulty.toLowerCase()] 
    ? DIFFICULTY_PARAMS[difficulty.toLowerCase()]
    : DIFFICULTY_PARAMS.medium;

  const finalMinDuration = minDuration ?? params.minDuration;
  const finalMaxDuration = maxDuration ?? params.maxDuration;
  const finalMinSpacing = minSpacing ?? params.minSpacing;
  const finalMaxSpacing = maxSpacing ?? params.maxSpacing;

  const targets = [];
  let timeOffset = 0;
  let index = 0;

  // Pour le mode infini, générer suffisamment de cibles pour avancer
  const maxTargets = duration === null ? 100 : Math.ceil(duration / (finalMinDuration + finalMinSpacing)) + 10;

  while ((duration === null && index < maxTargets) || (duration !== null && timeOffset < duration)) {
    const percent = percentages[Math.floor(Math.random() * percentages.length)];
    const targetDuration = finalMinDuration + Math.random() * (finalMaxDuration - finalMinDuration);
    const spacing = finalMinSpacing + Math.random() * (finalMaxSpacing - finalMinSpacing);

    targets.push({
      id: `target-${index}`,
      percent,
      duration: targetDuration,
      startTime: timeOffset,
      hit: false,
      miss: false,
      score: 0
    });

    timeOffset += targetDuration + spacing;
    index++;

    // Si durée limitée et qu'on dépasse, arrêter
    if (duration !== null && timeOffset >= duration) {
      break;
    }
  }

  return targets;
}

/**
 * Convertit un drill song en format de cibles DDR
 * @param {Object} drillSong - Drill song avec targets
 * @returns {Array} Séquence de cibles
 */
export function convertDrillSongToTargets(drillSong) {
  if (!drillSong || !drillSong.targets) {
    return [];
  }

  return drillSong.targets.map((target, index) => ({
    id: `target-${index}`,
    percent: target.percent,
    duration: target.duration,
    startTime: target.time,
    hit: false,
    miss: false,
    score: 0
  }));
}

/**
 * Hook pour gérer les cibles DDR
 * @param {Object} options
 * @param {boolean} options.isActive - Si le drill est actif
 * @param {number} options.duration - Durée totale (null = infini, utilisé si drillSong est null)
 * @param {Object} options.drillSong - Drill song à utiliser (prioritaire sur duration)
 * @param {string} options.difficulty - Difficulté pour mode random ('easy', 'medium', 'hard')
 */
export function useDDRTargets({ isActive, duration = null, drillSong = null, difficulty = 'medium', onComplete = null }) {
  const [targets, setTargets] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const nextTargetTimeRef = useRef(0);
  const nextTargetIndexRef = useRef(0);

  // Générer les cibles au démarrage
  useEffect(() => {
    if (!isActive) {
      setTargets([]);
      setCurrentTime(0);
      startTimeRef.current = null;
      nextTargetTimeRef.current = 0;
      nextTargetIndexRef.current = 0;
      return;
    }

    let sequence = [];

    // Priorité au drill song si fourni
    if (drillSong && drillSong.targets) {
      sequence = convertDrillSongToTargets(drillSong);
    } else {
      // Mode random : générer aléatoirement avec durée infinie
      sequence = generateTargetSequence({
        duration: null, // Infini pour mode random
        percentages: [20, 40, 60, 80, 100],
        difficulty: difficulty
      });
      nextTargetTimeRef.current = sequence.length > 0 
        ? sequence[sequence.length - 1].startTime + sequence[sequence.length - 1].duration
        : 0;
      nextTargetIndexRef.current = sequence.length;
    }

    setTargets(sequence);
    startTimeRef.current = performance.now() / 1000;
  }, [isActive, duration, drillSong, difficulty]);

  // Mettre à jour le temps et générer de nouvelles cibles en mode random
  useEffect(() => {
    if (!isActive) return;

    const updateTime = () => {
      if (startTimeRef.current) {
        const elapsed = (performance.now() / 1000) - startTimeRef.current;
        setCurrentTime(elapsed);

        // Vérifier si le drill song est terminé
        if (drillSong && drillSong.targets && drillSong.duration) {
          const lastTarget = drillSong.targets[drillSong.targets.length - 1];
          const endTime = lastTarget.time + lastTarget.duration;
          if (elapsed >= endTime + 1 && !isComplete) {
            // Le drill song est terminé (+1 seconde de marge)
            setIsComplete(true);
            if (onComplete) {
              onComplete();
            }
            return;
          }
        }

        // En mode random (pas de drillSong), générer de nouvelles cibles à l'avance
        if (!drillSong && elapsed >= nextTargetTimeRef.current - 5) {
          setTargets(prev => {
            // Générer quelques cibles supplémentaires
            const newTargets = [];
            let timeOffset = nextTargetTimeRef.current;
            let index = nextTargetIndexRef.current;
            const params = DIFFICULTY_PARAMS[difficulty.toLowerCase()] || DIFFICULTY_PARAMS.medium;

            for (let i = 0; i < 10; i++) {
              const percent = [20, 40, 60, 80, 100][Math.floor(Math.random() * 5)];
              const targetDuration = params.minDuration + Math.random() * (params.maxDuration - params.minDuration);
              const spacing = params.minSpacing + Math.random() * (params.maxSpacing - params.minSpacing);

              newTargets.push({
                id: `target-${index}`,
                percent,
                duration: targetDuration,
                startTime: timeOffset,
                hit: false,
                miss: false,
                score: 0
              });

              timeOffset += targetDuration + spacing;
              index++;
            }

            nextTargetTimeRef.current = timeOffset;
            nextTargetIndexRef.current = index;

            return [...prev, ...newTargets].filter(t => {
              // Garder seulement les cibles qui ne sont pas trop anciennes (plus de 10s dans le passé)
              return t.startTime + t.duration > elapsed - 10;
            });
          });
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, drillSong, difficulty]);

  // Marquer une cible comme hit
  const markTargetHit = useCallback((targetId, score) => {
    setTargets(prev => prev.map(t => 
      t.id === targetId ? { ...t, hit: true, score } : t
    ));
  }, []);

  // Marquer une cible comme miss
  const markTargetMiss = useCallback((targetId) => {
    setTargets(prev => prev.map(t => 
      t.id === targetId ? { ...t, miss: true } : t
    ));
  }, []);

  // Obtenir les cibles actives (qui sont dans la fenêtre visible)
  const getActiveTargets = useCallback(() => {
    return targets.filter(target => {
      const targetEnd = target.startTime + target.duration;
      return target.startTime <= currentTime + 5 && targetEnd >= currentTime - 2;
    });
  }, [targets, currentTime]);

  return {
    targets,
    currentTime,
    isComplete,
    getActiveTargets,
    markTargetHit,
    markTargetMiss
  };
}

