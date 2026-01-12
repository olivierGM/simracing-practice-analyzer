/**
 * Composant DDRFullGameplayArea
 * 
 * Zone de jeu DDR avec 4 lanes côte à côte :
 * - Lane 1 : Frein (rouge) - pourcentage 0-100%
 * - Lane 2 : Volant (bleu) - degrés -175 à +175
 * - Lane 3 : Accélérateur (vert) - pourcentage 0-100%
 * - Lane 4 : Shifter (orange) - shift_up/shift_down
 * 
 * Chaque lane affiche ses propres cibles qui défilent indépendamment
 */

import { useState, useEffect, useRef } from 'react';
import { useDDRFullTargets } from '../../hooks/useDDRFullTargets';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import './DDRFullGameplayArea.css';

// Vitesse de défilement (pixels par seconde)
const SCROLL_SPEED = 360;

// Largeur de la zone d'approche (en pixels)
const APPROACH_ZONE_WIDTH = 300;

export function DDRFullGameplayArea({ 
  brakeValue,
  wheelValue,
  acceleratorValue,
  shiftUp,
  shiftDown,
  tolerance = 5,
  isActive = false,
  drillSong = null,
  duration = null,
  difficulty = 'medium',
  audioEnabled = true,
  musicEnabled = true,
  blindMode = false,
  onComplete = null,
  onJudgmentUpdate = null
}) {
  const [judgmentCounts, setJudgmentCounts] = useState({ 
    PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 
  });

  // Utiliser le hook useDDRFullTargets pour gérer les 4 types de cibles
  const {
    brakeTargets,
    wheelTargets,
    accelTargets,
    shiftTargets,
    currentTime,
    isComplete,
    markTargetHit,
    markTargetMiss
  } = useDDRFullTargets({
    isActive,
    duration: drillSong ? drillSong.duration : duration,
    drillSong,
    difficulty,
    onComplete: () => {
      if (onComplete) {
        onComplete();
      }
    }
  });
  
  // Refs pour éviter les problèmes de closure
  const brakeTargetsRef = useRef(brakeTargets);
  const wheelTargetsRef = useRef(wheelTargets);
  const accelTargetsRef = useRef(accelTargets);
  const shiftTargetsRef = useRef(shiftTargets);
  const shiftUpPressedRef = useRef(false);
  const shiftDownPressedRef = useRef(false);
  
  // Mettre à jour les refs
  useEffect(() => {
    brakeTargetsRef.current = brakeTargets;
    wheelTargetsRef.current = wheelTargets;
    accelTargetsRef.current = accelTargets;
    shiftTargetsRef.current = shiftTargets;
  }, [brakeTargets, wheelTargets, accelTargets, shiftTargets]);

  // Réinitialiser quand le jeu s'arrête
  useEffect(() => {
    if (!isActive) {
      setJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    }
  }, [isActive]);
  
  // Activer/désactiver l'audio
  useEffect(() => {
    enhancedDrillAudioService.setEnabled(audioEnabled);
  }, [audioEnabled]);
  
  // Activer/désactiver la musique
  useEffect(() => {
    enhancedDrillAudioService.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);
  
  // Démarrer/arrêter la musique
  useEffect(() => {
    if (isActive && musicEnabled) {
      enhancedDrillAudioService.initialize();
      const tempo = difficulty === 'medium' ? 'medium' : 
                    (difficulty === 'hard' || difficulty === 'extreme') ? 'medium' : 'fast';
      enhancedDrillAudioService.startMusic(tempo);
    } else {
      enhancedDrillAudioService.stopMusic();
    }
    
    return () => {
      enhancedDrillAudioService.stopMusic();
    };
  }, [isActive, musicEnabled, difficulty]);
  
  // Reset combo
  useEffect(() => {
    if (!isActive) {
      enhancedDrillAudioService.resetCombo();
    }
  }, [isActive]);

  // Fonction pour calculer la position X d'une cible
  const getTargetPosition = (target) => {
    const timeUntilTarget = target.time - currentTime;
    const distanceFromJudgment = timeUntilTarget * SCROLL_SPEED;
    return distanceFromJudgment + APPROACH_ZONE_WIDTH;
  };

  // Fonction pour vérifier la précision pour pourcentages (brake, accel)
  const checkPercentHit = (target, currentValue) => {
    const diff = Math.abs(currentValue * 100 - target.percent);
    
    if (diff <= tolerance * 0.3) return 'PERFECT';
    if (diff <= tolerance * 0.6) return 'GREAT';
    if (diff <= tolerance) return 'GOOD';
    if (diff <= tolerance * 1.5) return 'OK';
    return 'MISS';
  };

  // Fonction pour vérifier la précision pour le volant (degrés)
  const checkWheelHit = (target, currentValue) => {
    // Convertir wheelValue (-1 à 1) en degrés (-175 à 175)
    const currentAngle = currentValue * 175;
    const diff = Math.abs(currentAngle - target.angle);
    
    // Tolérance adaptée pour les angles (un peu plus large)
    const angleTolerance = tolerance * 2; // Ex: 10° pour tolerance 5%
    
    if (diff <= angleTolerance * 0.3) return 'PERFECT';
    if (diff <= angleTolerance * 0.6) return 'GREAT';
    if (diff <= angleTolerance) return 'GOOD';
    if (diff <= angleTolerance * 1.5) return 'OK';
    return 'MISS';
  };

  // Fonction pour vérifier le shifter (timing seulement)
  const checkShifterHit = (timeUntilTarget) => {
    const absTime = Math.abs(timeUntilTarget);
    
    if (absTime <= 0.05) return 'PERFECT'; // ±50ms
    if (absTime <= 0.10) return 'GREAT';   // ±100ms
    if (absTime <= 0.15) return 'GOOD';    // ±150ms
    if (absTime <= 0.20) return 'OK';      // ±200ms
    return 'MISS';
  };

  // Gestion des hits pour le frein
  useEffect(() => {
    if (!isActive) return;

    brakeTargetsRef.current.forEach(target => {
      if (target.hit || target.missed) return;

      const timeUntilTarget = target.time - currentTime;
      const isInJudgmentZone = Math.abs(timeUntilTarget) <= 0.15;

      if (isInJudgmentZone && brakeValue > 0.05) {
        const judgment = checkPercentHit(target, brakeValue);
        
        if (judgment !== 'MISS') {
          markTargetHit(target.id, 'brake', judgment);
          
          setJudgmentCounts(prev => ({
            ...prev,
            [judgment]: prev[judgment] + 1
          }));
          
          if (onJudgmentUpdate) {
            onJudgmentUpdate(judgment);
          }
          
          if (audioEnabled) {
            enhancedDrillAudioService.playJudgmentSound(judgment);
          }
        }
      }

      // Miss si la cible est passée
      if (timeUntilTarget < -0.2 && !target.hit && !target.missed) {
        markTargetMiss(target.id, 'brake');
        setJudgmentCounts(prev => ({
          ...prev,
          MISS: prev.MISS + 1
        }));
        
        if (onJudgmentUpdate) {
          onJudgmentUpdate('MISS');
        }
        
        if (audioEnabled) {
          enhancedDrillAudioService.playJudgmentSound('MISS');
        }
      }
    });
  }, [currentTime, brakeValue, isActive, tolerance, audioEnabled, onJudgmentUpdate, markTargetHit, markTargetMiss]);

  // Gestion des hits pour le volant
  useEffect(() => {
    if (!isActive) return;

    wheelTargetsRef.current.forEach(target => {
      if (target.hit || target.missed) return;

      const timeUntilTarget = target.time - currentTime;
      const isInJudgmentZone = Math.abs(timeUntilTarget) <= 0.15;

      if (isInJudgmentZone) {
        const judgment = checkWheelHit(target, wheelValue);
        
        if (judgment !== 'MISS') {
          markTargetHit(target.id, 'wheel', judgment);
          
          setJudgmentCounts(prev => ({
            ...prev,
            [judgment]: prev[judgment] + 1
          }));
          
          if (onJudgmentUpdate) {
            onJudgmentUpdate(judgment);
          }
          
          if (audioEnabled) {
            enhancedDrillAudioService.playJudgmentSound(judgment);
          }
        }
      }

      // Miss si la cible est passée
      if (timeUntilTarget < -0.2 && !target.hit && !target.missed) {
        markTargetMiss(target.id, 'wheel');
        setJudgmentCounts(prev => ({
          ...prev,
          MISS: prev.MISS + 1
        }));
        
        if (onJudgmentUpdate) {
          onJudgmentUpdate('MISS');
        }
        
        if (audioEnabled) {
          enhancedDrillAudioService.playJudgmentSound('MISS');
        }
      }
    });
  }, [currentTime, wheelValue, isActive, tolerance, audioEnabled, onJudgmentUpdate, markTargetHit, markTargetMiss]);

  // Gestion des hits pour l'accélérateur
  useEffect(() => {
    if (!isActive) return;

    accelTargetsRef.current.forEach(target => {
      if (target.hit || target.missed) return;

      const timeUntilTarget = target.time - currentTime;
      const isInJudgmentZone = Math.abs(timeUntilTarget) <= 0.15;

      if (isInJudgmentZone && acceleratorValue > 0.05) {
        const judgment = checkPercentHit(target, acceleratorValue);
        
        if (judgment !== 'MISS') {
          markTargetHit(target.id, 'accel', judgment);
          
          setJudgmentCounts(prev => ({
            ...prev,
            [judgment]: prev[judgment] + 1
          }));
          
          if (onJudgmentUpdate) {
            onJudgmentUpdate(judgment);
          }
          
          if (audioEnabled) {
            enhancedDrillAudioService.playJudgmentSound(judgment);
          }
        }
      }

      // Miss si la cible est passée
      if (timeUntilTarget < -0.2 && !target.hit && !target.missed) {
        markTargetMiss(target.id, 'accel');
        setJudgmentCounts(prev => ({
          ...prev,
          MISS: prev.MISS + 1
        }));
        
        if (onJudgmentUpdate) {
          onJudgmentUpdate('MISS');
        }
        
        if (audioEnabled) {
          enhancedDrillAudioService.playJudgmentSound('MISS');
        }
      }
    });
  }, [currentTime, acceleratorValue, isActive, tolerance, audioEnabled, onJudgmentUpdate, markTargetHit, markTargetMiss]);

  // Gestion des hits pour le shifter
  useEffect(() => {
    if (!isActive) return;

    // Détecter les appuis sur les boutons
    const currentShiftUp = shiftUp;
    const currentShiftDown = shiftDown;
    
    const wasShiftUpPressed = shiftUpPressedRef.current;
    const wasShiftDownPressed = shiftDownPressedRef.current;
    
    shiftUpPressedRef.current = currentShiftUp;
    shiftDownPressedRef.current = currentShiftDown;

    // Appui sur shift_up
    if (currentShiftUp && !wasShiftUpPressed) {
      // Chercher la cible shift_up la plus proche
      let closestTarget = null;
      let closestTime = Infinity;
      
      shiftTargetsRef.current.forEach(target => {
        if (target.hit || target.missed || target.type !== 'shift_up') return;
        
        const timeUntilTarget = target.time - currentTime;
        if (Math.abs(timeUntilTarget) < Math.abs(closestTime)) {
          closestTime = timeUntilTarget;
          closestTarget = target;
        }
      });
      
      if (closestTarget && Math.abs(closestTime) <= 0.25) {
        const judgment = checkShifterHit(closestTime);
        
        markTargetHit(closestTarget.id, 'shift_up', judgment);
        
        setJudgmentCounts(prev => ({
          ...prev,
          [judgment]: prev[judgment] + 1
        }));
        
        if (onJudgmentUpdate) {
          onJudgmentUpdate(judgment);
        }
        
        if (audioEnabled) {
          enhancedDrillAudioService.playJudgmentSound(judgment);
        }
      }
    }
    
    // Appui sur shift_down
    if (currentShiftDown && !wasShiftDownPressed) {
      // Chercher la cible shift_down la plus proche
      let closestTarget = null;
      let closestTime = Infinity;
      
      shiftTargetsRef.current.forEach(target => {
        if (target.hit || target.missed || target.type !== 'shift_down') return;
        
        const timeUntilTarget = target.time - currentTime;
        if (Math.abs(timeUntilTarget) < Math.abs(closestTime)) {
          closestTime = timeUntilTarget;
          closestTarget = target;
        }
      });
      
      if (closestTarget && Math.abs(closestTime) <= 0.25) {
        const judgment = checkShifterHit(closestTime);
        
        markTargetHit(closestTarget.id, 'shift_down', judgment);
        
        setJudgmentCounts(prev => ({
          ...prev,
          [judgment]: prev[judgment] + 1
        }));
        
        if (onJudgmentUpdate) {
          onJudgmentUpdate(judgment);
        }
        
        if (audioEnabled) {
          enhancedDrillAudioService.playJudgmentSound(judgment);
        }
      }
    }
    
    // Miss si la cible shifter est passée
    shiftTargetsRef.current.forEach(target => {
      const timeUntilTarget = target.time - currentTime;
      
      if (timeUntilTarget < -0.25 && !target.hit && !target.missed) {
        markTargetMiss(target.id, target.type);
        setJudgmentCounts(prev => ({
          ...prev,
          MISS: prev.MISS + 1
        }));
        
        if (onJudgmentUpdate) {
          onJudgmentUpdate('MISS');
        }
        
        if (audioEnabled) {
          enhancedDrillAudioService.playJudgmentSound('MISS');
        }
      }
    });
  }, [currentTime, shiftUp, shiftDown, isActive, audioEnabled, onJudgmentUpdate, markTargetHit, markTargetMiss]);

  // Rendu des 4 lanes
  return (
    <div className="ddr-full-gameplay">
      {/* Debug panel */}
      <div className="ddr-debug-panel">
        <div className="debug-section">
          <div className="debug-label">Time:</div>
          <div className="debug-value">{currentTime.toFixed(2)}s</div>
        </div>
        
        <div className="debug-section">
          <div className="debug-label">Active:</div>
          <div className="debug-value">{isActive ? '✅' : '❌'}</div>
        </div>
        
        <div className="debug-section">
          <div className="debug-label">Brake Targets:</div>
          <div className="debug-value">{brakeTargets.length}</div>
        </div>
        
        <div className="debug-section">
          <div className="debug-label">Wheel Targets:</div>
          <div className="debug-value">{wheelTargets.length}</div>
        </div>
        
        <div className="debug-section">
          <div className="debug-label">Accel Targets:</div>
          <div className="debug-value">{accelTargets.length}</div>
        </div>
        
        <div className="debug-section">
          <div className="debug-label">Shift Targets:</div>
          <div className="debug-value">{shiftTargets.length}</div>
        </div>
        
        <div className="debug-section">
          <div className="debug-label">Judgments:</div>
          <div className="debug-value">
            P:{judgmentCounts.PERFECT} G:{judgmentCounts.GREAT} M:{judgmentCounts.MISS}
          </div>
        </div>
      </div>
      
      {/* Les 4 lanes côte à côte */}
      <div className="ddr-full-lanes">
        {/* Lane 1: Frein */}
        <div className="ddr-lane ddr-lane-brake">
          <div className="ddr-lane-header">🛑 Frein</div>
          <div className="ddr-lane-content">
            {/* Zone de judgment */}
            <div className="ddr-judgment-zone"></div>
            
            {/* Cibles de frein */}
            {brakeTargets.map(target => {
              const xPos = getTargetPosition(target);
              if (xPos < -100 || xPos > 600) return null;
              
              return (
                <div
                  key={target.id}
                  className={`ddr-target ddr-target-brake ${target.hit ? 'ddr-target-hit' : ''} ${target.missed ? 'ddr-target-missed' : ''} ${blindMode ? 'ddr-target-blind' : ''}`}
                  style={{
                    left: `${xPos}px`
                  }}
                >
                  {!blindMode && <span className="ddr-target-value">{target.percent}%</span>}
                  {target.judgment && (
                    <span className={`ddr-judgment-label ddr-judgment-${target.judgment.toLowerCase()}`}>
                      {target.judgment}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lane 2: Volant */}
        <div className="ddr-lane ddr-lane-wheel">
          <div className="ddr-lane-header">🎮 Volant</div>
          <div className="ddr-lane-content">
            {/* Zone de judgment */}
            <div className="ddr-judgment-zone"></div>
            
            {/* Cibles de volant */}
            {wheelTargets.map(target => {
              const xPos = getTargetPosition(target);
              if (xPos < -100 || xPos > 600) return null;
              
              return (
                <div
                  key={target.id}
                  className={`ddr-target ddr-target-wheel ${target.hit ? 'ddr-target-hit' : ''} ${target.missed ? 'ddr-target-missed' : ''} ${blindMode ? 'ddr-target-blind' : ''}`}
                  style={{
                    left: `${xPos}px`
                  }}
                >
                  {!blindMode && <span className="ddr-target-value">{target.angle}°</span>}
                  {target.judgment && (
                    <span className={`ddr-judgment-label ddr-judgment-${target.judgment.toLowerCase()}`}>
                      {target.judgment}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lane 3: Accélérateur */}
        <div className="ddr-lane ddr-lane-accel">
          <div className="ddr-lane-header">⚡ Accél</div>
          <div className="ddr-lane-content">
            {/* Zone de judgment */}
            <div className="ddr-judgment-zone"></div>
            
            {/* Cibles d'accélérateur */}
            {accelTargets.map(target => {
              const xPos = getTargetPosition(target);
              if (xPos < -100 || xPos > 600) return null;
              
              return (
                <div
                  key={target.id}
                  className={`ddr-target ddr-target-accel ${target.hit ? 'ddr-target-hit' : ''} ${target.missed ? 'ddr-target-missed' : ''} ${blindMode ? 'ddr-target-blind' : ''}`}
                  style={{
                    left: `${xPos}px`
                  }}
                >
                  {!blindMode && <span className="ddr-target-value">{target.percent}%</span>}
                  {target.judgment && (
                    <span className={`ddr-judgment-label ddr-judgment-${target.judgment.toLowerCase()}`}>
                      {target.judgment}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lane 4: Shifter */}
        <div className="ddr-lane ddr-lane-shift">
          <div className="ddr-lane-header">🔀 Shifter</div>
          <div className="ddr-lane-content">
            {/* Zone de judgment */}
            <div className="ddr-judgment-zone"></div>
            
            {/* Cibles de shifter */}
            {shiftTargets.map(target => {
              const xPos = getTargetPosition(target);
              if (xPos < -100 || xPos > 600) return null;
              
              const isShiftUp = target.type === 'shift_up';
              
              return (
                <div
                  key={target.id}
                  className={`ddr-target ddr-target-shift ${target.hit ? 'ddr-target-hit' : ''} ${target.missed ? 'ddr-target-missed' : ''} ${blindMode ? 'ddr-target-blind' : ''}`}
                  style={{
                    left: `${xPos}px`
                  }}
                >
                  {!blindMode && <span className="ddr-target-icon">{isShiftUp ? '⬆️' : '⬇️'}</span>}
                  {target.judgment && (
                    <span className={`ddr-judgment-label ddr-judgment-${target.judgment.toLowerCase()}`}>
                      {target.judgment}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
