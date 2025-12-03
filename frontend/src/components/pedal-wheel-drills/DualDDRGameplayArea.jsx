/**
 * Composant DualDDRGameplayArea
 * 
 * Zone de jeu dual : Frein (haut) + Accélérateur (bas)
 * Layout empilé verticalement pour responsive
 */

import { useState, useEffect, useRef } from 'react';
import './DualDDRGameplayArea.css';

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
  tolerance,
  audioEnabled,
  blindMode,
  drillSong,
  onBrakeStatsUpdate,
  onThrottleStatsUpdate,
  onBrakeJudgmentUpdate,
  onThrottleJudgmentUpdate
}) {
  // États pour le frein
  const [brakeTargets, setBrakeTargets] = useState([
    { id: 1, percentage: 80, startTime: Date.now() + 2000, duration: 2000, color: PERCENTAGE_COLORS[80].hex }
  ]);
  const [brakeJudgment, setBrakeJudgment] = useState(null);
  
  // États pour l'accélérateur
  const [throttleTargets, setThrottleTargets] = useState([
    { id: 2, percentage: 40, startTime: Date.now() + 3000, duration: 2000, color: PERCENTAGE_COLORS[40].hex }
  ]);
  const [throttleJudgment, setThrottleJudgment] = useState(null);

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

  return (
    <div className="dual-ddr-gameplay-area">
      {/* Zone Frein (Haut) */}
      <div className="ddr-zone ddr-zone-brake">
        <h3 className="ddr-zone-title">🛑 FREIN</h3>
        <div className="ddr-zone-content">
          {/* Judgment line */}
          <div className="ddr-judgment-line ddr-judgment-line-brake">
            {brakeJudgment && (
              <div className={'ddr-judgment-result ddr-judgment-' + brakeJudgment}>
                {brakeJudgment}
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
            {brakeTargets.map(function(target) {
              return (
                <div
                  key={target.id}
                  className="ddr-target-bar ddr-target-bar-brake"
                  style={{
                    backgroundColor: target.color,
                    transform: 'translateY(0px)' // Simplifi pour l'instant
                  }}
                >
                  <span className="ddr-target-label">{target.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zone Accélérateur (Bas) */}
      <div className="ddr-zone ddr-zone-throttle">
        <h3 className="ddr-zone-title">⚡ ACCÉLÉRATEUR</h3>
        <div className="ddr-zone-content">
          {/* Judgment line */}
          <div className="ddr-judgment-line ddr-judgment-line-throttle">
            {throttleJudgment && (
              <div className={'ddr-judgment-result ddr-judgment-' + throttleJudgment}>
                {throttleJudgment}
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
            {throttleTargets.map(function(target) {
              return (
                <div
                  key={target.id}
                  className="ddr-target-bar ddr-target-bar-throttle"
                  style={{
                    backgroundColor: target.color,
                    transform: 'translateY(0px)' // Simplifié pour l'instant
                  }}
                >
                  <span className="ddr-target-label">{target.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

