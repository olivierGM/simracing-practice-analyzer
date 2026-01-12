/**
 * DDRFullGameplayAreaVertical
 * 
 * Zone de gameplay pour le drill complet VERTICAL
 * - 4 lanes côte à côte (colonnes)
 * - Cibles défilent du haut vers le bas
 * - Judgment zone en bas de chaque lane
 */

import { useState, useEffect, useRef } from 'react';
import { useDDRFullTargets } from '../../hooks/useDDRFullTargets';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import './DDRFullGameplayAreaVertical.css';

export function DDRFullGameplayAreaVertical({
  brakeValue,
  wheelValue,
  acceleratorValue,
  shiftUp,
  shiftDown,
  tolerance,
  isActive,
  drillSong,
  duration,
  difficulty,
  audioEnabled,
  musicEnabled,
  blindMode,
  onJudgmentUpdate,
  onComplete
}) {
  // État des jugements
  const [judgmentCounts, setJudgmentCounts] = useState({
    PERFECT: 0,
    GREAT: 0,
    GOOD: 0,
    OK: 0,
    MISS: 0
  });

  // Générer les cibles pour les 4 lanes
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
    drillSong,
    duration,
    difficulty,
    onComplete
  });

  // Debug dans la console (toutes les 2 secondes)
  useEffect(() => {
    if (!isActive) return;
    
    const debugInterval = setInterval(() => {
      console.log(`[Drill Complet Vertical Debug] Time: ${currentTime.toFixed(2)}s | Brake: ${brakeTargets.length} | Wheel: ${wheelTargets.length} | Accel: ${accelTargets.length} | Shift: ${shiftTargets.length} | Judgments: P:${judgmentCounts.PERFECT} G:${judgmentCounts.GREAT} M:${judgmentCounts.MISS}`);
    }, 2000);
    
    return () => clearInterval(debugInterval);
  }, [isActive, currentTime, brakeTargets.length, wheelTargets.length, accelTargets.length, shiftTargets.length, judgmentCounts]);

  // Calcul de la position verticale (du haut vers le bas)
  // 0s = -100px (hors écran en haut), 3s = 400px (judgment zone en bas)
  const getTargetPositionY = (target) => {
    const timeUntilTarget = target.time - currentTime;
    const SCROLL_SPEED = 150; // pixels par seconde
    const JUDGMENT_ZONE_Y = 350; // Position de la judgment zone
    
    // Position = judgment zone - (temps restant * vitesse)
    return JUDGMENT_ZONE_Y - (timeUntilTarget * SCROLL_SPEED);
  };

  // Logique de judgment (identique à la version horizontale)
  const checkJudgment = (targetValue, currentValue, tolerance) => {
    const diff = Math.abs(targetValue - currentValue);
    const perfectThreshold = tolerance * 0.3;
    const greatThreshold = tolerance * 0.6;
    const goodThreshold = tolerance;
    const okThreshold = tolerance * 1.5;

    if (diff <= perfectThreshold) return 'PERFECT';
    if (diff <= greatThreshold) return 'GREAT';
    if (diff <= goodThreshold) return 'GOOD';
    if (diff <= okThreshold) return 'OK';
    return 'MISS';
  };

  const checkShifterJudgment = (target, shiftUpPressed, shiftDownPressed, currentTime) => {
    const timeDiff = Math.abs(target.time - currentTime);
    
    // Fenêtres de temps
    if (timeDiff <= 0.05) return 'PERFECT';
    if (timeDiff <= 0.1) return 'GREAT';
    if (timeDiff <= 0.15) return 'GOOD';
    if (timeDiff <= 0.2) return 'OK';
    return 'MISS';
  };

  // Vérification des inputs pour chaque lane
  useEffect(() => {
    if (!isActive) return;

    // Frein
    brakeTargets.filter(t => !t.hit && !t.missed).forEach(target => {
      const yPos = getTargetPositionY(target);
      if (yPos >= 340 && yPos <= 360) {
        const judgment = checkJudgment(target.percent, brakeValue, tolerance);
        markTargetHit('brake', target.id, judgment);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound(judgment);
        onJudgmentUpdate(judgment);
        setJudgmentCounts(prev => ({ ...prev, [judgment]: prev[judgment] + 1 }));
      } else if (yPos > 400) {
        markTargetMiss('brake', target.id);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound('MISS');
        onJudgmentUpdate('MISS');
        setJudgmentCounts(prev => ({ ...prev, MISS: prev.MISS + 1 }));
      }
    });

    // Volant
    wheelTargets.filter(t => !t.hit && !t.missed).forEach(target => {
      const yPos = getTargetPositionY(target);
      if (yPos >= 340 && yPos <= 360) {
        const judgment = checkJudgment(target.angle, wheelValue, tolerance);
        markTargetHit('wheel', target.id, judgment);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound(judgment);
        onJudgmentUpdate(judgment);
        setJudgmentCounts(prev => ({ ...prev, [judgment]: prev[judgment] + 1 }));
      } else if (yPos > 400) {
        markTargetMiss('wheel', target.id);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound('MISS');
        onJudgmentUpdate('MISS');
        setJudgmentCounts(prev => ({ ...prev, MISS: prev.MISS + 1 }));
      }
    });

    // Accélérateur
    accelTargets.filter(t => !t.hit && !t.missed).forEach(target => {
      const yPos = getTargetPositionY(target);
      if (yPos >= 340 && yPos <= 360) {
        const judgment = checkJudgment(target.percent, acceleratorValue, tolerance);
        markTargetHit('accel', target.id, judgment);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound(judgment);
        onJudgmentUpdate(judgment);
        setJudgmentCounts(prev => ({ ...prev, [judgment]: prev[judgment] + 1 }));
      } else if (yPos > 400) {
        markTargetMiss('accel', target.id);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound('MISS');
        onJudgmentUpdate('MISS');
        setJudgmentCounts(prev => ({ ...prev, MISS: prev.MISS + 1 }));
      }
    });

    // Shifter (shift_up et shift_down combinés)
    shiftTargets.filter(t => !t.hit && !t.missed).forEach(target => {
      const yPos = getTargetPositionY(target);
      if (yPos >= 340 && yPos <= 360) {
        const correctButton = (target.type === 'shift_up' && shiftUp) || (target.type === 'shift_down' && shiftDown);
        if (correctButton) {
          const judgment = checkShifterJudgment(target, shiftUp, shiftDown, currentTime);
          markTargetHit('shift', target.id, judgment);
          if (audioEnabled) enhancedDrillAudioService.playJudgmentSound(judgment);
          onJudgmentUpdate(judgment);
          setJudgmentCounts(prev => ({ ...prev, [judgment]: prev[judgment] + 1 }));
        }
      } else if (yPos > 400) {
        markTargetMiss('shift', target.id);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound('MISS');
        onJudgmentUpdate('MISS');
        setJudgmentCounts(prev => ({ ...prev, MISS: prev.MISS + 1 }));
      }
    });
  }, [isActive, currentTime, brakeTargets, wheelTargets, accelTargets, shiftTargets, brakeValue, wheelValue, acceleratorValue, shiftUp, shiftDown, tolerance, audioEnabled, onJudgmentUpdate]);

  // Rendu des 4 lanes côte à côte (colonnes)
  return (
    <div className="ddr-full-gameplay-vertical">
      {/* Les 4 lanes côte à côte */}
      <div className="ddr-full-lanes-vertical">
        {/* Lane 1: Frein */}
        <div className="ddr-lane-vertical ddr-lane-brake-vertical">
          <div className="ddr-lane-header-vertical">🛑 Frein</div>
          <div className="ddr-lane-content-vertical">
            {/* Zone de judgment en bas */}
            <div className="ddr-judgment-zone-vertical"></div>
            
            {/* Cibles de frein */}
            {brakeTargets.map(target => {
              const yPos = getTargetPositionY(target);
              if (yPos < -100 || yPos > 500) return null;
              
              // Hauteur proportionnelle à la valeur (20% à 100% = 40px à 200px)
              const height = 40 + (target.percent * 1.6);
              
              return (
                <div
                  key={target.id}
                  className={`ddr-target-vertical ddr-target-brake-vertical ${target.hit ? 'ddr-target-hit' : ''} ${target.missed ? 'ddr-target-missed' : ''} ${blindMode ? 'ddr-target-blind' : ''}`}
                  style={{
                    top: `${yPos}px`,
                    height: `${height}px`
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
        <div className="ddr-lane-vertical ddr-lane-wheel-vertical">
          <div className="ddr-lane-header-vertical">🎮 Volant</div>
          <div className="ddr-lane-content-vertical ddr-lane-content-centered-vertical">
            {/* Zone de judgment en bas */}
            <div className="ddr-judgment-zone-vertical"></div>
            
            {/* Cibles de volant */}
            {wheelTargets.map(target => {
              const yPos = getTargetPositionY(target);
              if (yPos < -100 || yPos > 500) return null;
              
              // Hauteur proportionnelle à l'angle absolu (0° à 175° = 40px à 200px)
              const height = 40 + (Math.abs(target.angle) / 175 * 160);
              
              return (
                <div
                  key={target.id}
                  className={`ddr-target-vertical ddr-target-wheel-vertical ${target.hit ? 'ddr-target-hit' : ''} ${target.missed ? 'ddr-target-missed' : ''} ${blindMode ? 'ddr-target-blind' : ''}`}
                  style={{
                    top: `${yPos}px`,
                    height: `${height}px`
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
        <div className="ddr-lane-vertical ddr-lane-accel-vertical">
          <div className="ddr-lane-header-vertical">⚡ Accél</div>
          <div className="ddr-lane-content-vertical">
            {/* Zone de judgment en bas */}
            <div className="ddr-judgment-zone-vertical"></div>
            
            {/* Cibles d'accélérateur */}
            {accelTargets.map(target => {
              const yPos = getTargetPositionY(target);
              if (yPos < -100 || yPos > 500) return null;
              
              // Hauteur proportionnelle à la valeur
              const height = 40 + (target.percent * 1.6);
              
              return (
                <div
                  key={target.id}
                  className={`ddr-target-vertical ddr-target-accel-vertical ${target.hit ? 'ddr-target-hit' : ''} ${target.missed ? 'ddr-target-missed' : ''} ${blindMode ? 'ddr-target-blind' : ''}`}
                  style={{
                    top: `${yPos}px`,
                    height: `${height}px`
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
        <div className="ddr-lane-vertical ddr-lane-shift-vertical">
          <div className="ddr-lane-header-vertical">🔀 Shifter</div>
          <div className="ddr-lane-content-vertical">
            {/* Zone de judgment en bas */}
            <div className="ddr-judgment-zone-vertical"></div>
            
            {/* Cibles de shifter */}
            {shiftTargets.map(target => {
              const yPos = getTargetPositionY(target);
              if (yPos < -100 || yPos > 500) return null;
              
              const icon = target.type === 'shift_up' ? '⬆️' : '⬇️';
              
              return (
                <div
                  key={target.id}
                  className={`ddr-target-vertical ddr-target-shift-vertical ${target.hit ? 'ddr-target-hit' : ''} ${target.missed ? 'ddr-target-missed' : ''} ${blindMode ? 'ddr-target-blind' : ''}`}
                  style={{
                    top: `${yPos}px`
                  }}
                >
                  {!blindMode && <span className="ddr-target-icon">{icon}</span>}
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
