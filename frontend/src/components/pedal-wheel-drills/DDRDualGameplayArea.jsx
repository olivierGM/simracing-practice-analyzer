/**
 * Composant DDRDualGameplayArea
 * 
 * Zone de jeu DDR avec 2 rangées superposées :
 * - Rangée du haut : Accélérateur (vert)
 * - Rangée du bas : Frein (rouge)
 * 
 * Chaque rangée affiche ses propres cibles qui défilent indépendamment
 */

import { useState, useEffect, useRef } from 'react';
import { useDDRDualTargets } from '../../hooks/useDDRDualTargets';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import { getColorForPercent } from '../../utils/drillColors';
import { drillDebug } from '../../utils/drillDebug';
import './DDRDualGameplayArea.css';

// Vitesse de défilement (pixels par seconde)
const SCROLL_SPEED = 360;

// Largeur de la zone d'approche (en pixels, correspond à ~1 seconde)
const APPROACH_ZONE_WIDTH = 300;

export function DDRDualGameplayArea({ 
  acceleratorValue,
  brakeValue,
  tolerance = 2,
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
  const accelContainerRef = useRef(null);
  const brakeContainerRef = useRef(null);
  const [judgmentResults, setJudgmentResults] = useState({
    accel: [],
    brake: []
  });
  const [judgmentCounts, setJudgmentCounts] = useState({ 
    PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 
  });
  const [renderedTargets, setRenderedTargets] = useState({
    accel: [],
    brake: []
  });
  const announcedTargetsRef = useRef(new Set());

  // Utiliser le hook useDDRDualTargets pour gérer les cibles séparées
  const {
    accelTargets,
    brakeTargets,
    currentTime,
    isComplete,
    markTargetHit,
    markTargetMiss
  } = useDDRDualTargets({
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
  
  // Utiliser des refs pour éviter le problème de closure dans les useEffect
  const accelTargetsRef = useRef(accelTargets);
  const brakeTargetsRef = useRef(brakeTargets);
  
  // Mettre à jour les refs quand les targets changent
  useEffect(() => {
    accelTargetsRef.current = accelTargets;
    brakeTargetsRef.current = brakeTargets;
  }, [accelTargets, brakeTargets]);

  // Réinitialiser quand le jeu s'arrête
  useEffect(() => {
    if (!isActive) {
      setJudgmentResults({ accel: [], brake: [] });
      setJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
      setRenderedTargets({ accel: [], brake: [] });
      announcedTargetsRef.current.clear();
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
  
  // Démarrer/arrêter la musique selon l'état du jeu
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
  
  // Reset combo quand le jeu s'arrête
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

  // Fonction pour vérifier la précision d'une cible
  const checkTargetHit = (target, currentValue) => {
    const diff = Math.abs(currentValue * 100 - target.percent);
    
    if (diff <= tolerance * 0.3) return 'PERFECT';
    if (diff <= tolerance * 0.6) return 'GREAT';
    if (diff <= tolerance) return 'GOOD';
    if (diff <= tolerance * 1.5) return 'OK';
    return 'MISS';
  };

  const effectiveAccel = drillDebug.isActive() ? (drillDebug.getValue(currentTime, 'accelerator') ?? acceleratorValue) : acceleratorValue;
  const effectiveBrake = drillDebug.isActive() ? (drillDebug.getValue(currentTime, 'brake') ?? brakeValue) : brakeValue;

  // Gestion des hits pour l'accélérateur
  useEffect(() => {
    if (!isActive) return;

    accelTargetsRef.current.forEach(target => {
      if (target.hit || target.missed) return;

      const timeUntilTarget = target.time - currentTime;
      const isInJudgmentZone = Math.abs(timeUntilTarget) <= 0.15;

      if (isInJudgmentZone) {
        const judgment = checkTargetHit(target, effectiveAccel);
        
        if (judgment !== 'MISS') {
          markTargetHit(target.id, 'accel', judgment);
          if (drillDebug.isActive()) drillDebug.logJudgment(judgment, 'accel', currentTime, { targetPercent: target.percent });
          
          if (audioEnabled) {
            enhancedDrillAudioService.playJudgmentSound(judgment);
          }
          
          setJudgmentResults(prev => ({
            ...prev,
            accel: [...prev.accel, { 
              id: target.id, 
              judgment, 
              timestamp: Date.now() 
            }]
          }));
          
          setJudgmentCounts(prev => ({
            ...prev,
            [judgment]: (prev[judgment] || 0) + 1
          }));
          
          if (onJudgmentUpdate) {
            onJudgmentUpdate(judgment);
          }
        }
      } else if (timeUntilTarget < -0.2) {
        // Miss si on dépasse la zone
        markTargetMiss(target.id, 'accel');
        if (drillDebug.isActive()) drillDebug.logJudgment('MISS', 'accel', currentTime, { targetPercent: target.percent });
        
        if (audioEnabled) {
          enhancedDrillAudioService.playJudgmentSound('MISS');
          enhancedDrillAudioService.resetCombo();
        }
        
        setJudgmentResults(prev => ({
          ...prev,
          accel: [...prev.accel, { 
            id: target.id, 
            judgment: 'MISS', 
            timestamp: Date.now() 
          }]
        }));
        
        setJudgmentCounts(prev => ({
          ...prev,
          MISS: (prev.MISS || 0) + 1
        }));
        
        if (onJudgmentUpdate) {
          onJudgmentUpdate('MISS');
        }
      }
    });
  }, [currentTime, effectiveAccel, isActive, audioEnabled, tolerance]);

  // Gestion des hits pour le frein
  useEffect(() => {
    if (!isActive) return;

    brakeTargetsRef.current.forEach(target => {
      if (target.hit || target.missed) return;

      const timeUntilTarget = target.time - currentTime;
      const isInJudgmentZone = Math.abs(timeUntilTarget) <= 0.15;

      if (isInJudgmentZone) {
        const judgment = checkTargetHit(target, effectiveBrake);
        
        if (judgment !== 'MISS') {
          markTargetHit(target.id, 'brake', judgment);
          if (drillDebug.isActive()) drillDebug.logJudgment(judgment, 'brake', currentTime, { targetPercent: target.percent });
          
          if (audioEnabled) {
            enhancedDrillAudioService.playJudgmentSound(judgment);
          }
          
          setJudgmentResults(prev => ({
            ...prev,
            brake: [...prev.brake, { 
              id: target.id, 
              judgment, 
              timestamp: Date.now() 
            }]
          }));
          
          setJudgmentCounts(prev => ({
            ...prev,
            [judgment]: (prev[judgment] || 0) + 1
          }));
          
          if (onJudgmentUpdate) {
            onJudgmentUpdate(judgment);
          }
        }
      } else if (timeUntilTarget < -0.2) {
        markTargetMiss(target.id, 'brake');
        if (drillDebug.isActive()) drillDebug.logJudgment('MISS', 'brake', currentTime, { targetPercent: target.percent });
        
        if (audioEnabled) {
          enhancedDrillAudioService.playJudgmentSound('MISS');
          enhancedDrillAudioService.resetCombo();
        }
        
        setJudgmentResults(prev => ({
          ...prev,
          brake: [...prev.brake, { 
            id: target.id, 
            judgment: 'MISS', 
            timestamp: Date.now() 
          }]
        }));
        
        setJudgmentCounts(prev => ({
          ...prev,
          MISS: (prev.MISS || 0) + 1
        }));
        
        if (onJudgmentUpdate) {
          onJudgmentUpdate('MISS');
        }
      }
    });
  }, [currentTime, effectiveBrake, isActive, audioEnabled, tolerance]);

  // Rendu des cibles pour l'accélérateur
  const renderAccelTargets = () => {
    return accelTargets
      .filter(target => {
        const position = getTargetPosition(target);
        return position > -100 && position < window.innerWidth + 100;
      })
      .map(target => {
        const position = getTargetPosition(target);
        const width = target.duration * SCROLL_SPEED;
        const height = `${target.percent}%`;
        
        const color = getColorForPercent(target.percent);
        return (
          <div
            key={target.id}
            className={`ddr-target ddr-target-accel ${target.hit ? 'hit' : ''} ${target.missed ? 'missed' : ''}`}
            style={{
              left: `${position}px`,
              width: `${width}px`,
              height: height,
              bottom: 0,
              backgroundColor: color,
              borderColor: color
            }}
          >
            <div className="target-percent">{target.percent}%</div>
          </div>
        );
      });
  };

  // Rendu des cibles pour le frein (même logique couleur par % que Drill une pédale)
  const renderBrakeTargets = () => {
    return brakeTargets
      .filter(target => {
        const position = getTargetPosition(target);
        return position > -100 && position < window.innerWidth + 100;
      })
      .map(target => {
        const position = getTargetPosition(target);
        const width = target.duration * SCROLL_SPEED;
        const height = `${target.percent}%`;
        const color = getColorForPercent(target.percent);
        return (
          <div
            key={target.id}
            className={`ddr-target ddr-target-brake ${target.hit ? 'hit' : ''} ${target.missed ? 'missed' : ''}`}
            style={{
              left: `${position}px`,
              width: `${width}px`,
              height: height,
              bottom: 0,
              backgroundColor: color,
              borderColor: color
            }}
          >
            <div className="target-percent">{target.percent}%</div>
          </div>
        );
      });
  };

  return (
    <div className="ddr-dual-gameplay">
      {/* Rangée Accélérateur (haut) */}
      <div className="ddr-lane ddr-lane-accel">
        <div className="ddr-lane-label">🟢 ACCÉLÉRATEUR</div>
        <div className="ddr-track" ref={accelContainerRef}>
          {/* Zone d'approche */}
          <div 
            className="ddr-approach-zone"
            style={{
              left: 0,
              width: `${APPROACH_ZONE_WIDTH}px`
            }}
          />
          
          {/* Barre de jugement */}
          <div 
            className="ddr-judgment-line ddr-judgment-line-accel"
            style={{ left: `${APPROACH_ZONE_WIDTH}px` }}
          >
            {!blindMode && (
              <div 
                className="ddr-current-value-bar ddr-current-value-bar-accel"
                style={{
                  height: `${effectiveAccel * 100}%`,
                  backgroundColor: getColorForPercent(effectiveAccel * 100)
                }}
              />
            )}
          </div>
          
          {/* Cibles */}
          {renderAccelTargets()}
        </div>
      </div>

      {/* Rangée Frein (bas) */}
      <div className="ddr-lane ddr-lane-brake">
        <div className="ddr-lane-label">🔴 FREIN</div>
        <div className="ddr-track" ref={brakeContainerRef}>
          {/* Zone d'approche */}
          <div 
            className="ddr-approach-zone"
            style={{
              left: 0,
              width: `${APPROACH_ZONE_WIDTH}px`
            }}
          />
          
          {/* Barre de jugement */}
          <div 
            className="ddr-judgment-line ddr-judgment-line-brake"
            style={{ left: `${APPROACH_ZONE_WIDTH}px` }}
          >
            {!blindMode && (
              <div 
                className="ddr-current-value-bar ddr-current-value-bar-brake"
                style={{
                  height: `${effectiveBrake * 100}%`,
                  backgroundColor: getColorForPercent(effectiveBrake * 100)
                }}
              />
            )}
          </div>
          
          {/* Cibles */}
          {renderBrakeTargets()}
        </div>
      </div>

      {/* Affichage des judgments récents */}
      <div className="ddr-judgments-display">
        {[...judgmentResults.accel, ...judgmentResults.brake]
          .slice(-3)
          .map((result, index) => (
            <div
              key={`${result.id}-${result.timestamp}`}
              className={`ddr-judgment-popup ddr-judgment-${result.judgment.toLowerCase()}`}
              style={{
                animation: `judgmentPopup 0.8s ease-out`,
                opacity: 1 - (index * 0.3)
              }}
            >
              {result.judgment}
            </div>
          ))}
      </div>

      {/* Affichage du combo */}
      {enhancedDrillAudioService.getComboInfo().combo > 0 && (
        <div className="ddr-combo-display">
          <div className="combo-number">
            {enhancedDrillAudioService.getComboInfo().combo}
          </div>
          <div className="combo-label">COMBO</div>
        </div>
      )}
    </div>
  );
}
