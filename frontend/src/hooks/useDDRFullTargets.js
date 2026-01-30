/**
 * Hook useDDRFullTargets
 * 
 * Gère les cibles pour le Drill Complet (4 inputs) :
 * - Frein (brake) : pourcentage 0-100%
 * - Volant (wheel) : degrés -175 à +175
 * - Accélérateur (accel) : pourcentage 0-100%
 * - Shifter (shift) : shift_up ou shift_down (événements ponctuels)
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
 * Génère une séquence de cibles pour les 4 lanes
 * Simule un virage réaliste : freinage → tournage → accélération + shifter
 */
export function generateFullTargetSequence({
  duration = null,
  difficulty = 'medium'
}) {
  const params = DIFFICULTY_PARAMS[difficulty] || DIFFICULTY_PARAMS.medium;
  
  const brakeTargets = [];
  const wheelTargets = [];
  const accelTargets = [];
  const shiftTargets = [];
  
  let timeOffset = 2.0; // Commencer à 2s pour laisser le temps de se préparer
  let index = 0;
  
  // Générer suffisamment de cibles
  const maxTime = duration || 120; // 2 minutes max pour le mode infini
  
  while (timeOffset < maxTime) {
    const patternType = Math.random();

    if (patternType < 0.25) {
      // Pattern simultané : frein + volant au même moment (inputs en parallèle)
      const brakePercent = 40 + Math.floor(Math.random() * 55);
      const turnDirection = Math.random() > 0.5 ? 1 : -1;
      const wheelAngle = turnDirection * (40 + Math.floor(Math.random() * 100));
      const dur = params.minDuration * 0.8 + Math.random() * (params.maxDuration - params.minDuration) * 0.5;
      brakeTargets.push({
        id: `brake-${index}`,
        time: timeOffset,
        percent: brakePercent,
        duration: dur,
        hit: false,
        missed: false
      });
      wheelTargets.push({
        id: `wheel-${index}`,
        time: timeOffset,
        angle: wheelAngle,
        duration: dur,
        hit: false,
        missed: false
      });
      index++;
      timeOffset += dur + params.minSpacing;
      continue;
    }

    // Pattern de virage : freinage → tournage → accélération → shifter
    const turnDirection = Math.random() > 0.5 ? 1 : -1; // Gauche ou droite
    const turnIntensity = 30 + Math.floor(Math.random() * 145); // 30° à 175°
    
    // Phase 1 : Freinage avant le virage (100% → 60%)
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
      timeOffset += dur + 0.05;
      index++;
    }
    
    // Phase 2 : Tournage du volant (avec trail braking progressif)
    const wheelPhases = [
      { angle: turnDirection * turnIntensity * 0.4, durationMult: 0.4 },
      { angle: turnDirection * turnIntensity * 0.7, durationMult: 0.5 },
      { angle: turnDirection * turnIntensity, durationMult: 0.6 },
      { angle: turnDirection * turnIntensity * 0.7, durationMult: 0.5 },
      { angle: turnDirection * turnIntensity * 0.4, durationMult: 0.4 },
      { angle: 0, durationMult: 0.3 } // Retour au centre
    ];
    
    // Overlap avec le trail braking (frein+volant simultané)
    timeOffset -= 0.3; // Reculer un peu pour créer l'overlap
    
    for (const phase of wheelPhases) {
      const dur = params.minDuration * 0.8 + Math.random() * 0.3;
      wheelTargets.push({
        id: `wheel-${index}`,
        time: timeOffset,
        angle: Math.round(phase.angle),
        duration: dur,
        hit: false,
        missed: false
      });
      
      // Trail braking pendant le tournage (frein diminue progressivement)
      if (brakePhases.length > 0 && Math.random() > 0.3) {
        const brakePercent = 40 - (wheelPhases.indexOf(phase) * 5);
        if (brakePercent > 10) {
          brakeTargets.push({
            id: `brake-${index}-trail`,
            time: timeOffset,
            percent: brakePercent,
            duration: dur,
            hit: false,
            missed: false
          });
        }
      }
      
      timeOffset += dur + 0.05;
      index++;
    }
    
    // Phase 3 : Accélération sortie de virage (30% → 100%)
    const accelPhases = [
      { percent: 30, durationMult: 0.4 },
      { percent: 50, durationMult: 0.5 },
      { percent: 70, durationMult: 0.6 },
      { percent: 90, durationMult: 0.7 },
      { percent: 100, durationMult: 0.8 }
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
      timeOffset += dur + 0.05;
      index++;
    }
    
    // Phase 4 : Shifter (occasionnel, vers la fin de l'accélération)
    if (Math.random() > 0.5) {
      const numShifts = 1 + Math.floor(Math.random() * 2); // 1-2 shifts
      for (let i = 0; i < numShifts; i++) {
        shiftTargets.push({
          id: `shift-${index}`,
          time: timeOffset,
          type: 'shift_up', // Pour le moment, seulement shift up
          duration: 0, // Événement ponctuel
          hit: false,
          missed: false
        });
        timeOffset += 0.8 + Math.random() * 0.4;
        index++;
      }
    }
    
    // Espacement avant la prochaine séquence
    timeOffset += params.minSpacing + Math.random() * (params.maxSpacing - params.minSpacing);
  }
  
  return { brakeTargets, wheelTargets, accelTargets, shiftTargets };
}

export function useDDRFullTargets({
  isActive = false,
  duration = null,
  drillSong = null,
  difficulty = 'medium',
  onComplete = null
}) {
  const [brakeTargets, setBrakeTargets] = useState([]);
  const [wheelTargets, setWheelTargets] = useState([]);
  const [accelTargets, setAccelTargets] = useState([]);
  const [shiftTargets, setShiftTargets] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Utiliser les refs pour éviter de re-déclencher le timer
  const onCompleteRef = useRef(onComplete);
  const drillSongRef = useRef(drillSong);
  const durationRef = useRef(duration);
  
  // Mettre à jour les refs AVANT chaque render
  onCompleteRef.current = onComplete;
  drillSongRef.current = drillSong;
  durationRef.current = duration;

  // Générer ou charger les cibles quand le drill devient actif
  useEffect(() => {
    if (!isActive) {
      setBrakeTargets([]);
      setWheelTargets([]);
      setAccelTargets([]);
      setShiftTargets([]);
      setCurrentTime(0);
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
          const brake = [];
          const wheel = [];
          const accel = [];
          const shift = [];
          
          data.targets.forEach((target, index) => {
            const targetWithId = {
              ...target,
              id: `${target.type}-${index}`,
              hit: false,
              missed: false,
              judgment: null
            };
            
            if (target.type === 'brake') {
              brake.push(targetWithId);
            } else if (target.type === 'wheel') {
              wheel.push(targetWithId);
            } else if (target.type === 'accel') {
              accel.push(targetWithId);
            } else if (target.type === 'shift_up' || target.type === 'shift_down') {
              shift.push(targetWithId);
            }
          });
          
          setBrakeTargets(brake);
          setWheelTargets(wheel);
          setAccelTargets(accel);
          setShiftTargets(shift);
        } catch (error) {
          console.error('Error loading drill song:', error);
        }
      };

      loadDrillSong();
    } 
    // Mode random : générer des cibles aléatoires
    else if (drillSong && drillSong.type === 'random') {
      const totalDuration = drillSong.duration || duration || 120;
      const { brakeTargets: genBrake, wheelTargets: genWheel, accelTargets: genAccel, shiftTargets: genShift } = generateFullTargetSequence({
        duration: totalDuration,
        difficulty: drillSong.difficulty || difficulty
      });
      
      setBrakeTargets(genBrake);
      setWheelTargets(genWheel);
      setAccelTargets(genAccel);
      setShiftTargets(genShift);
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
      setBrakeTargets(prev => prev.map(t => ({ ...t, hit: false, missed: false, judgment: null, judgedAtY: undefined })));
      setWheelTargets(prev => prev.map(t => ({ ...t, hit: false, missed: false, judgment: null, judgedAtY: undefined })));
      setAccelTargets(prev => prev.map(t => ({ ...t, hit: false, missed: false, judgment: null, judgedAtY: undefined })));
      setShiftTargets(prev => prev.map(t => ({ ...t, hit: false, missed: false, judgment: null, judgedAtY: undefined })));
    }
  }, [isActive]);

  // judgedAtY = position Y (px) au moment du jugement — on la stocke pour figer l’affichage à la barre
  const markTargetHit = (targetId, type, judgment, judgedAtY = null) => {
    if (type === 'brake') {
      setBrakeTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, hit: true, judgment, judgedAtY: judgedAtY ?? target.judgedAtY }
            : target
        )
      );
    } else if (type === 'wheel') {
      setWheelTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, hit: true, judgment, judgedAtY: judgedAtY ?? target.judgedAtY }
            : target
        )
      );
    } else if (type === 'accel') {
      setAccelTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, hit: true, judgment, judgedAtY: judgedAtY ?? target.judgedAtY }
            : target
        )
      );
    } else if (type === 'shift' || type === 'shift_up' || type === 'shift_down') {
      setShiftTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, hit: true, judgment, judgedAtY: judgedAtY ?? target.judgedAtY }
            : target
        )
      );
    }
  };

  const markTargetMiss = (targetId, type, judgedAtY = null) => {
    if (type === 'brake') {
      setBrakeTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, missed: true, judgment: 'MISS', judgedAtY: judgedAtY ?? target.judgedAtY }
            : target
        )
      );
    } else if (type === 'wheel') {
      setWheelTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, missed: true, judgment: 'MISS', judgedAtY: judgedAtY ?? target.judgedAtY }
            : target
        )
      );
    } else if (type === 'accel') {
      setAccelTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, missed: true, judgment: 'MISS', judgedAtY: judgedAtY ?? target.judgedAtY }
            : target
        )
      );
    } else if (type === 'shift' || type === 'shift_up' || type === 'shift_down') {
      setShiftTargets(prev =>
        prev.map(target =>
          target.id === targetId
            ? { ...target, missed: true, judgment: 'MISS', judgedAtY: judgedAtY ?? target.judgedAtY }
            : target
        )
      );
    }
  };

  return {
    brakeTargets,
    wheelTargets,
    accelTargets,
    shiftTargets,
    currentTime,
    isComplete,
    markTargetHit,
    markTargetMiss
  };
}
