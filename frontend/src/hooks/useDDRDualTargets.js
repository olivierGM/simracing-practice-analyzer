/**
 * Hook useDDRDualTargets
 * 
 * Gère les cibles pour Frein + Accélérateur combinés
 * Charge le drill song et sépare les cibles en 2 listes :
 * - accelTargets : cibles pour l'accélérateur
 * - brakeTargets : cibles pour le frein
 * 
 * Format JSON attendu :
 * {
 *   "targets": [
 *     { "time": 1.0, "type": "accel", "percent": 80, "duration": 0.5 },
 *     { "time": 1.5, "type": "brake", "percent": 60, "duration": 0.4 }
 *   ]
 * }
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Paramètres de génération selon la difficulté
 */
const DIFFICULTY_PARAMS = {
  medium: {
    minDuration: 0.5,
    maxDuration: 2.5,
    minSpacing: 0.8,
    maxSpacing: 2.0
  },
  hard: {
    minDuration: 0.4,
    maxDuration: 1.5,
    minSpacing: 0.5,
    maxSpacing: 1.2
  },
  extreme: {
    minDuration: 0.3,
    maxDuration: 1.0,
    minSpacing: 0.3,
    maxSpacing: 0.8
  }
};

/**
 * Génère une séquence de cibles pour les 2 lanes (brake + accel)
 * Les cibles sont générées de manière à simuler du trail braking réaliste
 */
export function generateDualTargetSequence({
  duration = null,
  difficulty = 'medium'
}) {
  const params = DIFFICULTY_PARAMS[difficulty] || DIFFICULTY_PARAMS.medium;
  
  const accelTargets = [];
  const brakeTargets = [];
  
  let timeOffset = 2.0; // Commencer à 2s pour laisser le temps de se préparer
  let index = 0;
  
  // Générer suffisamment de cibles
  const maxTime = duration || 120; // 2 minutes max pour le mode infini
  
  while (timeOffset < maxTime) {
    // Trois types de patterns : classique (frein→accel), alterné, ou simultané (frein ET accel en même temps)
    const patternType = Math.random();
    
    if (patternType < 0.25) {
      // Pattern simultané : frein ET accélérateur au même moment (gestion multi-inputs)
      const percentBrake = 40 + Math.floor(Math.random() * 50);
      const percentAccel = 40 + Math.floor(Math.random() * 50);
      const dur = params.minDuration + Math.random() * (params.maxDuration - params.minDuration) * 0.6;
      brakeTargets.push({
        id: `brake-${index}`,
        time: timeOffset,
        percent: percentBrake,
        duration: dur,
        hit: false,
        missed: false
      });
      accelTargets.push({
        id: `accel-${index}`,
        time: timeOffset,
        percent: percentAccel,
        duration: dur,
        hit: false,
        missed: false
      });
      index++;
      timeOffset += dur + params.minSpacing;
    } else if (patternType < 0.7) {
      // Pattern classique : freinage → accélération
      
      // Phase de freinage (100% → dégression)
      const brakePhases = [
        { percent: 100, durationMult: 0.3 },
        { percent: 80, durationMult: 0.4 },
        { percent: 60, durationMult: 0.5 }
      ];
      
      for (const phase of brakePhases) {
        const dur = params.minDuration + Math.random() * (params.maxDuration - params.minDuration) * phase.durationMult;
        brakeTargets.push({
          id: `brake-${index}`,
          time: timeOffset,
          percent: phase.percent,
          duration: dur,
          hit: false,
          missed: false
        });
        timeOffset += dur + 0.1; // Petit gap entre phases de freinage
        index++;
      }
      
      // Petit gap avant l'accélération
      timeOffset += params.minSpacing;
      
      // Phase d'accélération (progression 30% → 100%)
      const accelPhases = [
        { percent: 30, durationMult: 0.4 },
        { percent: 60, durationMult: 0.5 },
        { percent: 90, durationMult: 0.6 },
        { percent: 100, durationMult: 0.7 }
      ];
      
      for (const phase of accelPhases) {
        const dur = params.minDuration + Math.random() * (params.maxDuration - params.minDuration) * phase.durationMult;
        accelTargets.push({
          id: `accel-${index}`,
          time: timeOffset,
          percent: phase.percent,
          duration: dur,
          hit: false,
          missed: false
        });
        timeOffset += dur + 0.1;
        index++;
      }
      
      // Espacement avant la prochaine séquence
      timeOffset += params.minSpacing + Math.random() * (params.maxSpacing - params.minSpacing);
      
    } else {
      // Pattern alterné : quelques cibles rapides alternées
      const numAlternate = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numAlternate; i++) {
        const isBrake = i % 2 === 0;
        const percent = 50 + Math.floor(Math.random() * 50); // 50-100%
        const dur = params.minDuration + Math.random() * 0.3;
        
        if (isBrake) {
          brakeTargets.push({
            id: `brake-${index}`,
            time: timeOffset,
            percent,
            duration: dur,
            hit: false,
            missed: false
          });
        } else {
          accelTargets.push({
            id: `accel-${index}`,
            time: timeOffset,
            percent,
            duration: dur,
            hit: false,
            missed: false
          });
        }
        
        timeOffset += dur + params.minSpacing * 0.5;
        index++;
      }
      
      timeOffset += params.maxSpacing;
    }
  }
  
  return { accelTargets, brakeTargets };
}

export function useDDRDualTargets({
  isActive = false,
  duration = null,
  drillSong = null,
  difficulty = 'medium',
  onComplete = null
}) {
  const [accelTargets, setAccelTargets] = useState([]);
  const [brakeTargets, setBrakeTargets] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const drillSongLoadedRef = useRef(false);
  
  // Utiliser les refs pour éviter de re-déclencher le timer
  // Mais TOUJOURS utiliser les valeurs les plus récentes
  const onCompleteRef = useRef(onComplete);
  const drillSongRef = useRef(drillSong);
  const durationRef = useRef(duration);
  
  // Mettre à jour les refs AVANT chaque render (pas dans un useEffect!)
  onCompleteRef.current = onComplete;
  drillSongRef.current = drillSong;
  durationRef.current = duration;

  // Générer ou charger les cibles quand le drill devient actif
  useEffect(() => {
    if (!isActive) {
      setAccelTargets([]);
      setBrakeTargets([]);
      setCurrentTime(0);
      drillSongLoadedRef.current = false;
      return;
    }

    // Mode drill song : charger depuis un fichier JSON
    if (drillSong && drillSong.file) {
      const loadDrillSong = async () => {
        try {
          const response = await fetch(drillSong.file);
          if (!response.ok) {
            throw new Error(`Failed to load drill song: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Séparer les cibles par type
          const accel = [];
          const brake = [];
          
          data.targets.forEach((target, index) => {
            const targetWithId = {
              ...target,
              id: `${target.type}-${index}`,
              hit: false,
              missed: false,
              judgment: null
            };
            
            if (target.type === 'accel') {
              accel.push(targetWithId);
            } else if (target.type === 'brake') {
              brake.push(targetWithId);
            }
          });
          
          setAccelTargets(accel);
          setBrakeTargets(brake);
        } catch (error) {
          console.error('Error loading drill song:', error);
        }
      };

      loadDrillSong();
    } 
    // Mode random : générer des cibles aléatoires
    else if (drillSong && drillSong.type === 'random') {
      const totalDuration = drillSong.duration || duration || 120;
      const { accelTargets: generatedAccel, brakeTargets: generatedBrake } = generateDualTargetSequence({
        duration: totalDuration,
        difficulty: drillSong.difficulty || difficulty
      });
      
      setAccelTargets(generatedAccel);
      setBrakeTargets(generatedBrake);
    }
  }, [isActive, drillSong, duration, difficulty]);

  // Timer pour le défilement
  useEffect(() => {
    if (!isActive) {
      startTimeRef.current = null;
      setCurrentTime(0);
      setIsComplete(false);
      return;
    }

    startTimeRef.current = performance.now();
    
    const updateTime = () => {
      if (!startTimeRef.current) return;
      
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      // Vérifier si le drill est terminé
      const totalDuration = drillSongRef.current ? drillSongRef.current.duration : durationRef.current;
      
      if (totalDuration && elapsed >= totalDuration) {
        setIsComplete(true);
        if (onCompleteRef.current) {
          onCompleteRef.current();
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
  }, [isActive]);

  // Réinitialiser les cibles quand le jeu s'arrête
  useEffect(() => {
    if (!isActive) {
      setAccelTargets(prev => prev.map(t => ({ ...t, hit: false, missed: false, judgment: null })));
      setBrakeTargets(prev => prev.map(t => ({ ...t, hit: false, missed: false, judgment: null })));
    }
  }, [isActive]);

  // Marquer une cible comme hit
  const markTargetHit = (targetId, type, judgment) => {
    if (type === 'accel') {
      setAccelTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, hit: true, judgment }
            : target
        )
      );
    } else if (type === 'brake') {
      setBrakeTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, hit: true, judgment }
            : target
        )
      );
    }
  };

  // Marquer une cible comme missed
  const markTargetMiss = (targetId, type) => {
    if (type === 'accel') {
      setAccelTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, missed: true }
            : target
        )
      );
    } else if (type === 'brake') {
      setBrakeTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, missed: true }
            : target
        )
      );
    }
  };

  return {
    accelTargets,
    brakeTargets,
    currentTime,
    isComplete,
    markTargetHit,
    markTargetMiss
  };
}
