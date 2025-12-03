/**
 * Composant DualDDRGameplayArea
 * 
 * Zone de jeu dual : Frein (haut) + Accélérateur (bas)
 * Layout empilé verticalement pour responsive
 */

import { useState, useEffect, useRef } from 'react';
import { useDualDDRTargets } from '../../hooks/useDualDDRTargets';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import './DualDDRGameplayArea.css';

// Vitesse de défilement (pixels par seconde)
const SCROLL_SPEED = 360;

// Largeur de la zone d'approche
const APPROACH_ZONE_WIDTH = 300;

// Guitar Hero inspired colors
const PERCENTAGE_COLORS = {
  0: { hex: '#2a2a2a', rgb: { r: 42, g: 42, b: 42 } },
  20: { hex: '#0f9d58', rgb: { r: 15, g: 157, b: 88 } }, // Green
  40: { hex: '#db4437', rgb: { r: 219, g: 68, b: 55 } }, // Red
  60: { hex: '#f4b400', rgb: { r: 244, g: 180, b: 0 } }, // Yellow
  80: { hex: '#4285f4', rgb: { r: 66, g: 133, b: 244 } }, // Blue
  100: { hex: '#ff6f00', rgb: { r: 255, g: 111, b: 0 } }  // Orange
};

export function DualDDRGameplayArea({
  brakeValue,
  throttleValue,
  isActive,
  isPaused,
  difficulty,
  tolerance = 5,
  audioEnabled,
  blindMode,
  drillSong,
  onBrakeStatsUpdate,
  onThrottleStatsUpdate,
  onBrakeJudgmentUpdate,
  onThrottleJudgmentUpdate
}) {
  const brakeContainerRef = useRef(null);
  const throttleContainerRef = useRef(null);
  
  // États pour les jugements
  const [brakeJudgmentResults, setBrakeJudgmentResults] = useState([]);
  const [throttleJudgmentResults, setThrottleJudgmentResults] = useState([]);
  const [brakeJudgmentCounts, setBrakeJudgmentCounts] = useState({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
  const [throttleJudgmentCounts, setThrottleJudgmentCounts] = useState({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
  
  // Targets rendus pour l'affichage
  const [renderedBrakeTargets, setRenderedBrakeTargets] = useState([]);
  const [renderedThrottleTargets, setRenderedThrottleTargets] = useState([]);

  // Hook pour gérer les targets duales
  const {
    brakeTargets,
    throttleTargets,
    currentTime,
    isComplete,
    markBrakeTargetHit,
    markThrottleTargetHit,
    markBrakeTargetMiss,
    markThrottleTargetMiss
  } = useDualDDRTargets({
    isActive: isActive && !isPaused,
    duration: drillSong?.duration || null,
    drillSong,
    difficulty
  });

  // Réinitialiser quand le jeu s'arrête
  useEffect(() => {
    if (!isActive) {
      setBrakeJudgmentResults([]);
      setThrottleJudgmentResults([]);
      setBrakeJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
      setThrottleJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
      setRenderedBrakeTargets([]);
      setRenderedThrottleTargets([]);
    }
  }, [isActive]);

  // Animer les targets du frein
  useEffect(() => {
    if (!isActive || isPaused || !brakeContainerRef.current || brakeTargets.length === 0) {
      return;
    }

    var animationFrameId;
    var containerWidth = brakeContainerRef.current.offsetWidth;
    var judgmentLineX = APPROACH_ZONE_WIDTH;

    var animate = function() {
      if (!isActive || isPaused) return;

      var elapsed = currentTime;

      setRenderedBrakeTargets(function() {
        return brakeTargets.map(function(target) {
          var targetElapsed = elapsed - target.startTime;
          var currentX = containerWidth - (targetElapsed * SCROLL_SPEED);
          var barWidth = target.duration * SCROLL_SPEED;
          var barEndX = currentX + barWidth;

          // Détection hit/miss
          if (!target.hit && !target.missed) {
            if (currentX <= judgmentLineX && barEndX >= judgmentLineX) {
              var currentPercent = brakeValue * 100;
              var diff = Math.abs(currentPercent - target.percent);
              
              if (diff <= tolerance) {
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
                
                markBrakeTargetHit(target.id);
                setBrakeJudgmentCounts(function(prev) {
                  var newCounts = {};
                  for (var key in prev) {
                    newCounts[key] = prev[key];
                  }
                  newCounts[judgment] = (newCounts[judgment] || 0) + 1;
                  return newCounts;
                });
                
                setBrakeJudgmentResults(function(prev) {
                  var newResults = prev.concat([{ 
                    type: judgment, 
                    time: performance.now()
                  }]);
                  return newResults.slice(-1);
                });
                
                if (audioEnabled) {
                  enhancedDrillAudioService.playJudgmentSound(judgment);
                }
              }
            } else if (barEndX < judgmentLineX) {
              // Miss
              markBrakeTargetMiss(target.id);
              setBrakeJudgmentCounts(function(prev) {
                var newCounts = {};
                for (var key in prev) {
                  newCounts[key] = prev[key];
                }
                newCounts.MISS = (newCounts.MISS || 0) + 1;
                return newCounts;
              });
              
              setBrakeJudgmentResults(function(prev) {
                return prev.concat([{ 
                  type: 'MISS', 
                  time: performance.now()
                }]).slice(-1);
              });
              
              if (audioEnabled) {
                enhancedDrillAudioService.playJudgmentSound('MISS');
              }
            }
          }

          return {
            id: target.id,
            percent: target.percent,
            x: currentX,
            width: barWidth,
            visible: currentX + barWidth >= 0 && currentX <= containerWidth + 100,
            color: PERCENTAGE_COLORS[target.percent]?.hex || '#fff'
          };
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return function() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, isPaused, brakeTargets, currentTime, brakeValue, tolerance, audioEnabled, markBrakeTargetHit, markBrakeTargetMiss]);

  // Animer les targets de l'accélérateur (même logique)
  useEffect(() => {
    if (!isActive || isPaused || !throttleContainerRef.current || throttleTargets.length === 0) {
      return;
    }

    var animationFrameId;
    var containerWidth = throttleContainerRef.current.offsetWidth;
    var judgmentLineX = APPROACH_ZONE_WIDTH;

    var animate = function() {
      if (!isActive || isPaused) return;

      var elapsed = currentTime;

      setRenderedThrottleTargets(function() {
        return throttleTargets.map(function(target) {
          var targetElapsed = elapsed - target.startTime;
          var currentX = containerWidth - (targetElapsed * SCROLL_SPEED);
          var barWidth = target.duration * SCROLL_SPEED;
          var barEndX = currentX + barWidth;

          // Détection hit/miss
          if (!target.hit && !target.missed) {
            if (currentX <= judgmentLineX && barEndX >= judgmentLineX) {
              var currentPercent = throttleValue * 100;
              var diff = Math.abs(currentPercent - target.percent);
              
              if (diff <= tolerance) {
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
                
                markThrottleTargetHit(target.id);
                setThrottleJudgmentCounts(function(prev) {
                  var newCounts = {};
                  for (var key in prev) {
                    newCounts[key] = prev[key];
                  }
                  newCounts[judgment] = (newCounts[judgment] || 0) + 1;
                  return newCounts;
                });
                
                setThrottleJudgmentResults(function(prev) {
                  var newResults = prev.concat([{ 
                    type: judgment, 
                    time: performance.now()
                  }]);
                  return newResults.slice(-1);
                });
                
                if (audioEnabled) {
                  enhancedDrillAudioService.playJudgmentSound(judgment);
                }
              }
            } else if (barEndX < judgmentLineX) {
              // Miss
              markThrottleTargetMiss(target.id);
              setThrottleJudgmentCounts(function(prev) {
                var newCounts = {};
                for (var key in prev) {
                  newCounts[key] = prev[key];
                }
                newCounts.MISS = (newCounts.MISS || 0) + 1;
                return newCounts;
              });
              
              setThrottleJudgmentResults(function(prev) {
                return prev.concat([{ 
                  type: 'MISS', 
                  time: performance.now()
                }]).slice(-1);
              });
              
              if (audioEnabled) {
                enhancedDrillAudioService.playJudgmentSound('MISS');
              }
            }
          }

          return {
            id: target.id,
            percent: target.percent,
            x: currentX,
            width: barWidth,
            visible: currentX + barWidth >= 0 && currentX <= containerWidth + 100,
            color: PERCENTAGE_COLORS[target.percent]?.hex || '#fff'
          };
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return function() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, isPaused, throttleTargets, currentTime, throttleValue, tolerance, audioEnabled, markThrottleTargetHit, markThrottleTargetMiss]);

  // Mettre à jour les stats
  useEffect(() => {
    if (onBrakeJudgmentUpdate) {
      onBrakeJudgmentUpdate(brakeJudgmentCounts);
    }
  }, [brakeJudgmentCounts, onBrakeJudgmentUpdate]);

  useEffect(() => {
    if (onThrottleJudgmentUpdate) {
      onThrottleJudgmentUpdate(throttleJudgmentCounts);
    }
  }, [throttleJudgmentCounts, onThrottleJudgmentUpdate]);

  // Fonction pour obtenir la couleur basée sur le pourcentage
  const getColorForPercent = function(percent) {
    var p = Math.max(0, Math.min(100, percent));
    
    // Trouver les seuils proches
    var lowerThreshold = 0;
    var upperThreshold = 100;
    
    if (p >= 95 && p <= 105) return PERCENTAGE_COLORS[100].rgb;
    if (p >= 75 && p <= 85) return PERCENTAGE_COLORS[80].rgb;
    if (p >= 55 && p <= 65) return PERCENTAGE_COLORS[60].rgb;
    if (p >= 35 && p <= 45) return PERCENTAGE_COLORS[40].rgb;
    if (p >= 15 && p <= 25) return PERCENTAGE_COLORS[20].rgb;
    if (p <= 5) return PERCENTAGE_COLORS[0].rgb;
    
    // Gradient entre les seuils
    if (p > 85 && p < 95) {
      var ratio = (p - 85) / 10;
      return {
        r: PERCENTAGE_COLORS[80].rgb.r + (PERCENTAGE_COLORS[100].rgb.r - PERCENTAGE_COLORS[80].rgb.r) * ratio,
        g: PERCENTAGE_COLORS[80].rgb.g + (PERCENTAGE_COLORS[100].rgb.g - PERCENTAGE_COLORS[80].rgb.g) * ratio,
        b: PERCENTAGE_COLORS[80].rgb.b + (PERCENTAGE_COLORS[100].rgb.b - PERCENTAGE_COLORS[80].rgb.b) * ratio
      };
    }
    
    // Autres gradients...
    return PERCENTAGE_COLORS[0].rgb;
  };

  // Obtenir le jugement le plus récent
  var latestBrakeJudgment = brakeJudgmentResults.length > 0 ? brakeJudgmentResults[brakeJudgmentResults.length - 1] : null;
  var latestThrottleJudgment = throttleJudgmentResults.length > 0 ? throttleJudgmentResults[throttleJudgmentResults.length - 1] : null;
  
  // Masquer le jugement après 1 seconde
  useEffect(() => {
    if (latestBrakeJudgment && performance.now() - latestBrakeJudgment.time > 1000) {
      setBrakeJudgmentResults(function(prev) { return prev.slice(0, -1); });
    }
  }, [latestBrakeJudgment, currentTime]);

  useEffect(() => {
    if (latestThrottleJudgment && performance.now() - latestThrottleJudgment.time > 1000) {
      setThrottleJudgmentResults(function(prev) { return prev.slice(0, -1); });
    }
  }, [latestThrottleJudgment, currentTime]);

  return (
    <div className="dual-ddr-gameplay-area">
      {/* Zone Frein (Haut) */}
      <div className="ddr-zone ddr-zone-brake">
        <h3 className="ddr-zone-title">🛑 FREIN</h3>
        <div className="ddr-zone-content" ref={brakeContainerRef}>
          {/* Judgment line */}
          <div className="ddr-judgment-line ddr-judgment-line-brake">
            {latestBrakeJudgment && (
              <div className={'ddr-judgment-result ddr-judgment-' + latestBrakeJudgment.type}>
                {latestBrakeJudgment.type}
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          {!blindMode && (
            <div 
              className="ddr-progress-bar-vertical ddr-progress-bar-brake"
              style={{
                height: (brakeValue * 100) + '%',
                backgroundColor: (function() {
                  var color = getColorForPercent(brakeValue * 100);
                  return 'rgb(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ')';
                })()
              }}
            />
          )}
          
          {/* Targets scrolling */}
          <div className="ddr-targets-container">
            {renderedBrakeTargets.filter(function(t) { return t.visible; }).map(function(target) {
              return (
                <div
                  key={target.id}
                  className="ddr-target-bar ddr-target-bar-brake"
                  style={{
                    backgroundColor: target.color,
                    left: target.x + 'px',
                    width: target.width + 'px'
                  }}
                >
                  <span className="ddr-target-label">{target.percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zone Accélérateur (Bas) */}
      <div className="ddr-zone ddr-zone-throttle">
        <h3 className="ddr-zone-title">⚡ ACCÉLÉRATEUR</h3>
        <div className="ddr-zone-content" ref={throttleContainerRef}>
          {/* Judgment line */}
          <div className="ddr-judgment-line ddr-judgment-line-throttle">
            {latestThrottleJudgment && (
              <div className={'ddr-judgment-result ddr-judgment-' + latestThrottleJudgment.type}>
                {latestThrottleJudgment.type}
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          {!blindMode && (
            <div 
              className="ddr-progress-bar-vertical ddr-progress-bar-throttle"
              style={{
                height: (throttleValue * 100) + '%',
                backgroundColor: (function() {
                  var color = getColorForPercent(throttleValue * 100);
                  return 'rgb(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ')';
                })()
              }}
            />
          )}
          
          {/* Targets scrolling */}
          <div className="ddr-targets-container">
            {renderedThrottleTargets.filter(function(t) { return t.visible; }).map(function(target) {
              return (
                <div
                  key={target.id}
                  className="ddr-target-bar ddr-target-bar-throttle"
                  style={{
                    backgroundColor: target.color,
                    left: target.x + 'px',
                    width: target.width + 'px'
                  }}
                >
                  <span className="ddr-target-label">{target.percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

