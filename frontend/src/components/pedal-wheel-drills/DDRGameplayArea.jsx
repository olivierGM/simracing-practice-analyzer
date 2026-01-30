/**
 * Composant DDRGameplayArea
 * 
 * Zone de jeu style DDR avec barres qui défilent
 * - Barres avec hauteur = pourcentage cible
 * - Largeur = durée à maintenir
 * - Zone d'approche avant la barre de jugement
 */

import { useState, useEffect, useRef } from 'react';
import { useDDRTargets } from '../../hooks/useDDRTargets';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import { getColorForPercent } from '../../utils/drillColors';
import { drillDebug } from '../../utils/drillDebug';
import './DDRGameplayArea.css';

// Vitesse de défilement (pixels par seconde)
const SCROLL_SPEED = 360; // pixels/seconde (augmenté de 20%: 300 * 1.2 = 360)

// Largeur de la zone d'approche (en pixels, correspond à ~1 seconde)
const APPROACH_ZONE_WIDTH = 300;

// Durée minimale à maintenir la pédale dans le seuil pour valider (ms)
const HOLD_MS = 250;

export function DDRGameplayArea({ 
  currentValue, 
  inputType = 'brake',
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
  const containerRef = useRef(null);
  const [judgmentResults, setJudgmentResults] = useState([]);
  const [judgmentCounts, setJudgmentCounts] = useState({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
  const [renderedTargets, setRenderedTargets] = useState([]);
  const announcedTargetsRef = useRef(new Set()); // Pour éviter d'annoncer plusieurs fois
  const holdStartByTargetRef = useRef({}); // Pour Story 6 : maintien obligatoire dans le seuil

  // Utiliser le hook useDDRTargets pour gérer les cibles
  const {
    targets,
    currentTime,
    isComplete,
    markTargetHit,
    markTargetMiss
  } = useDDRTargets({
    isActive,
    duration: drillSong ? drillSong.duration : duration,
    drillSong,
    difficulty,
    onComplete: () => {
      // Le drill song est terminé, on peut notifier le parent
      if (onComplete) {
        onComplete();
      }
    }
  });

  // Réinitialiser quand le jeu s'arrête
  useEffect(() => {
    if (!isActive) {
      setJudgmentResults([]);
      setJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
      setRenderedTargets([]);
      announcedTargetsRef.current.clear();
      holdStartByTargetRef.current = {};
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
      // Initialiser l'audio context au premier clic
      enhancedDrillAudioService.initialize();
      
      // Démarrer la musique avec tempo selon difficulté
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

  // Animer les barres qui défilent
  useEffect(() => {
    if (!isActive || !containerRef.current || targets.length === 0) {
      if (!isActive) {
        setRenderedTargets([]);
      }
      return;
    }

    let animationFrameId;
    const containerWidth = containerRef.current.offsetWidth;
    const judgmentLineX = APPROACH_ZONE_WIDTH;

    const animate = () => {
      if (!isActive) return;

      const elapsed = currentTime;
      const effectiveValue = drillDebug.isActive() ? (drillDebug.getValue(elapsed, inputType) ?? currentValue) : currentValue;

      setRenderedTargets(() => {
        return targets.map(target => {
          // Calculer la position X (barre part de droite)
          const targetElapsed = elapsed - target.startTime;
          const currentX = containerWidth - (targetElapsed * SCROLL_SPEED);
          const barWidth = target.duration * SCROLL_SPEED;
          const barEndX = currentX + barWidth;

          // Vérifier si la cible est en cours de jugement
          if (!target.hit && !target.miss) {
            const now = performance.now();
            // Si la barre est dans la zone de jugement
            if (currentX <= judgmentLineX && barEndX >= judgmentLineX) {
              const currentPercent = effectiveValue * 100;
              const diff = Math.abs(currentPercent - target.percent);
              
              if (diff <= tolerance) {
                // Maintien obligatoire : ne valider qu'après HOLD_MS dans le seuil
                if (!holdStartByTargetRef.current[target.id]) {
                  holdStartByTargetRef.current[target.id] = now;
                }
                const holdDuration = now - holdStartByTargetRef.current[target.id];
                if (holdDuration >= HOLD_MS) {
                  var judgment = 'MISS';
                  var score = 0;
                  if (diff <= 1) {
                    judgment = 'PERFECT';
                    score = 100;
                  } else if (diff <= 2) {
                    judgment = 'GREAT';
                    score = 90;
                  } else if (diff <= 3.5) {
                    judgment = 'GOOD';
                    score = 75;
                  } else if (diff <= tolerance) {
                    judgment = 'OK';
                    score = 50;
                  }
                  markTargetHit(target.id, score);
                  delete holdStartByTargetRef.current[target.id];
                  if (drillDebug.isActive()) {
                    drillDebug.logJudgment(judgment, inputType, elapsed, { targetPercent: target.percent });
                  }
                  setJudgmentCounts(prev => ({
                    ...prev,
                    [judgment]: (prev[judgment] || 0) + 1
                  }));
                  if (onJudgmentUpdate) {
                    onJudgmentUpdate(judgment);
                  }
                  setJudgmentResults(prev => {
                    const newResults = [...prev, { type: judgment, time: now, diff }];
                    return newResults.slice(-10);
                  });
                  if (audioEnabled) {
                    enhancedDrillAudioService.playJudgmentSound(judgment);
                  }
                }
              } else {
                // Sortie du seuil : annuler le maintien en cours
                delete holdStartByTargetRef.current[target.id];
              }
            }

            // Miss si la barre est passée sans être touchée
            if (barEndX < judgmentLineX) {
              delete holdStartByTargetRef.current[target.id];
              if (drillDebug.isActive()) {
                drillDebug.logJudgment('MISS', inputType, elapsed, { targetPercent: target.percent });
              }
              markTargetMiss(target.id);
              // Mettre à jour les compteurs de jugements
              setJudgmentCounts(prev => ({
                ...prev,
                MISS: (prev.MISS || 0) + 1
              }));
              
              // Notifier le parent
              if (onJudgmentUpdate) {
                onJudgmentUpdate('MISS');
              }
              
              setJudgmentResults(prev => {
                const newResults = [...prev, { type: 'miss', time: performance.now() }];
                return newResults.slice(-10);
              });
            }
          }

          return {
            ...target,
            currentX,
            barWidth
          };
        }).filter(target => {
          // Garder seulement les cibles visibles ou proches
          return target.currentX !== undefined && 
                 target.currentX + target.barWidth > -200 && 
                 target.currentX < containerWidth + 200;
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, currentValue, inputType, tolerance, targets, currentTime, markTargetHit, markTargetMiss]);

  return (
    <div className="ddr-gameplay-area" ref={containerRef}>
      {/* Zone de défilement */}
      <div className="ddr-scroll-zone">
        {renderedTargets.map(target => {
          if (target.currentX === undefined) return null;
          
          const barHeight = `${target.percent}%`;

          return (
            <div
              key={target.id}
              className={`ddr-target-bar ${target.hit ? 'ddr-target-hit' : ''} ${target.miss ? 'ddr-target-miss' : ''}`}
              style={{
                left: `${target.currentX}px`,
                height: barHeight,
                width: `${target.barWidth}px`,
                backgroundColor: getColorForPercent(target.percent),
                borderColor: getColorForPercent(target.percent)
              }}
            >
              <span className="ddr-target-label">{target.percent}%</span>
            </div>
          );
        })}

        {/* Zone d'approche (vert clair) */}
        <div 
          className="ddr-approach-zone"
          style={{
            left: `0px`,
            width: `${APPROACH_ZONE_WIDTH}px`
          }}
        />

        {/* Barre de jugement */}
        <div 
          className="ddr-judgment-line"
          style={{
            left: `${APPROACH_ZONE_WIDTH}px`
          }}
        >
          {judgmentResults.slice(-3).map((result, index) => (
            <div 
              key={result.time}
              className={`ddr-judgment-result ddr-judgment-${result.type.toLowerCase()}`}
              style={{
                animationDelay: `${index * 0.05}s`
              }}
            >
              {result.type}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar verticale - 20px de large (cachée en mode blind) */}
      {!blindMode && (
        <div 
          className="ddr-progress-bar-vertical"
          style={{
            left: `${APPROACH_ZONE_WIDTH}px`
          }}
        >
          <div 
            className="ddr-progress-fill"
            style={{
              height: `${(drillDebug.isActive() ? (drillDebug.getValue(currentTime, inputType) ?? currentValue) : currentValue) * 100}%`,
              backgroundColor: getColorForPercent(((drillDebug.isActive() ? (drillDebug.getValue(currentTime, inputType) ?? currentValue) : currentValue) * 100))
            }}
          />
        </div>
      )}
    </div>
  );
}
