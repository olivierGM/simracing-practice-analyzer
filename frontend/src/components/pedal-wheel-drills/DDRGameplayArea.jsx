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
import './DDRGameplayArea.css';

// Vitesse de défilement (pixels par seconde)
const SCROLL_SPEED = 360; // pixels/seconde (augmenté de 20%: 300 * 1.2 = 360)

// Largeur de la zone d'approche (en pixels, correspond à ~1 seconde)
const APPROACH_ZONE_WIDTH = 300;

export function DDRGameplayArea({ 
  currentValue, 
  tolerance = 5,
  isActive = false,
  drillSong = null,
  duration = null,
  difficulty = 'medium',
  audioEnabled = true,
  musicEnabled = true,
  blindMode = false,
  onComplete = null
}) {
  const containerRef = useRef(null);
  const [judgmentResults, setJudgmentResults] = useState([]);
  const [renderedTargets, setRenderedTargets] = useState([]);
  const announcedTargetsRef = useRef(new Set()); // Pour éviter d'annoncer plusieurs fois

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
      setRenderedTargets([]);
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

      setRenderedTargets(() => {
        return targets.map(target => {
          // Calculer la position X (barre part de droite)
          const targetElapsed = elapsed - target.startTime;
          const currentX = containerWidth - (targetElapsed * SCROLL_SPEED);
          const barWidth = target.duration * SCROLL_SPEED;
          const barEndX = currentX + barWidth;

          // Vérifier si la cible est en cours de jugement
          if (!target.hit && !target.miss) {
            // Si la barre est dans la zone de jugement
            if (currentX <= judgmentLineX && barEndX >= judgmentLineX) {
              const currentPercent = currentValue * 100;
              const diff = Math.abs(currentPercent - target.percent);
              
              if (diff <= tolerance) {
                // Hit! Calculer le niveau de précision style DDR
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
                setJudgmentResults(prev => {
                  const newResults = [...prev, { 
                    type: judgment, 
                    time: performance.now(),
                    diff: diff 
                  }];
                  return newResults.slice(-10);
                });
                
                // Jouer le son de jugement
                if (audioEnabled) {
                  enhancedDrillAudioService.playJudgmentSound(judgment);
                }
              }
            }

            // Miss si la barre est passée sans être touchée
            if (barEndX < judgmentLineX) {
              markTargetMiss(target.id);
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
  }, [isActive, currentValue, tolerance, targets, currentTime, markTargetHit, markTargetMiss]);

  // Code couleur par palier avec tolérance de ±5% et dégradés entre les paliers
  // Fonction helper pour convertir hex en RGB (définie en premier pour Edge)
  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return { r: 0, g: 0, b: 0 };
    }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }
  
  function getColorForPercent(percent) {
    var tolerance = 5;
    
    // Paliers cibles avec couleurs Guitar Hero (distinctes et iconiques)
    var targets = [
      { percent: 0, color: '#666666', rgb: { r: 102, g: 102, b: 102 } },     // Gris foncé
      { percent: 20, color: '#22B14C', rgb: { r: 34, g: 177, b: 76 } },      // Vert (GH)
      { percent: 40, color: '#EF2B2D', rgb: { r: 239, g: 43, b: 45 } },      // Rouge (GH)
      { percent: 60, color: '#FFC600', rgb: { r: 255, g: 198, b: 0 } },      // Jaune (GH)
      { percent: 80, color: '#3E75C3', rgb: { r: 62, g: 117, b: 195 } },     // Bleu (GH)
      { percent: 100, color: '#F66A00', rgb: { r: 246, g: 106, b: 0 } }      // Orange (GH)
    ];
    
    // Trouver si on est dans une zone de tolérance d'un palier
    for (var i = 0; i < targets.length; i++) {
      if (Math.abs(percent - targets[i].percent) <= tolerance) {
        return targets[i].color;
      }
    }
    
    // Sinon, faire un dégradé entre les deux paliers les plus proches
    var lowerTarget = targets[0];
    var upperTarget = targets[targets.length - 1];
    
    for (var j = 0; j < targets.length - 1; j++) {
      if (percent >= targets[j].percent && percent <= targets[j + 1].percent) {
        lowerTarget = targets[j];
        upperTarget = targets[j + 1];
        break;
      }
    }
    
    // Calculer la position relative entre les deux paliers
    var range = upperTarget.percent - lowerTarget.percent;
    var position = (percent - lowerTarget.percent) / range;
    
    // Interpoler entre les deux couleurs (utiliser RGB pré-calculés)
    var color1 = lowerTarget.rgb;
    var color2 = upperTarget.rgb;
    
    var r = Math.round(color1.r + (color2.r - color1.r) * position);
    var g = Math.round(color1.g + (color2.g - color1.g) * position);
    var b = Math.round(color1.b + (color2.b - color1.b) * position);
    
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }

  const getTargetColor = (percent) => {
    return getColorForPercent(percent);
  };

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
                backgroundColor: getTargetColor(target.percent),
                borderColor: getTargetColor(target.percent)
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
              height: `${currentValue * 100}%`,
              backgroundColor: getColorForPercent(currentValue * 100)
            }}
          />
        </div>
      )}
    </div>
  );
}
