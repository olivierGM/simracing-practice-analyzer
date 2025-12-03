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
import './DDRGameplayArea.css';

// Vitesse de défilement (pixels par seconde)
const SCROLL_SPEED = 300; // pixels/seconde

// Largeur de la zone d'approche (en pixels, correspond à ~1 seconde)
const APPROACH_ZONE_WIDTH = 300;

export function DDRGameplayArea({ 
  currentValue, 
  tolerance = 5,
  isActive = false,
  drillSong = null,
  duration = null,
  difficulty = 'medium',
  onComplete = null
}) {
  const containerRef = useRef(null);
  const [judgmentResults, setJudgmentResults] = useState([]);
  const [renderedTargets, setRenderedTargets] = useState([]);

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
                // Hit!
                markTargetHit(target.id, 100 - diff);
                setJudgmentResults(prev => {
                  const newResults = [...prev, { type: 'hit', time: performance.now() }];
                  return newResults.slice(-10);
                });
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

  // Code couleur unique par palier de 20%
  const getColorForPercent = (percent) => {
    if (percent >= 80) return '#F44336'; // Rouge - 80-100%
    if (percent >= 60) return '#FF9800'; // Orange - 60-79%
    if (percent >= 40) return '#4CAF50'; // Vert - 40-59%
    if (percent >= 20) return '#2196F3'; // Bleu - 20-39%
    return '#9E9E9E'; // Gris - 0-19%
  };

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
          {judgmentResults.slice(-5).map((result, index) => (
            <div 
              key={index}
              className={`ddr-judgment-result ddr-judgment-${result.type}`}
            >
              {result.type === 'hit' ? '✓' : '✗'}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar verticale simple - 8px de large */}
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
        >
          {/* Label du pourcentage en haut de la barre */}
          <div className="ddr-progress-label">
            {Math.round(currentValue * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
