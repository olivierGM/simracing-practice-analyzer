/**
 * Composant DDRStatsBar
 * 
 * Barre de statistiques compacte en haut de l'interface
 */

import { formatTime } from '../../hooks/useDrillEngine';
import { useState, useEffect } from 'react';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import './DDRStatsBar.css';

export function DDRStatsBar({ totalTime, zoneStatus, accuracy, score, vertical = false }) {
  const [comboInfo, setComboInfo] = useState({ current: 0, max: 0 });
  
  // Mettre à jour le combo toutes les 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      setComboInfo(enhancedDrillAudioService.getComboInfo());
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  const getZoneEmoji = () => {
    if (zoneStatus === 'in_target') return '🟢';
    if (zoneStatus === 'close') return '🟡';
    return '🔴';
  };

  const getZoneText = () => {
    if (zoneStatus === 'in_target') return 'In Zone';
    if (zoneStatus === 'close') return 'Close';
    return 'Out';
  };

  return (
    <div className={`ddr-stats-bar ${vertical ? 'ddr-stats-bar-vertical' : ''}`}>
      <div className="ddr-stat-item">
        <div className="ddr-stat-label">Temps</div>
        <div className="ddr-stat-value">{formatTime(totalTime)}</div>
      </div>
      <div className="ddr-stat-item">
        <div className="ddr-stat-label">Combo</div>
        <div className="ddr-stat-value ddr-stat-combo">
          <span className={`ddr-combo-current ${comboInfo.current >= 5 ? 'ddr-combo-active' : ''}`}>
            {comboInfo.current}x
          </span>
          {comboInfo.max > 0 && (
            <span className="ddr-combo-max">(Max: {comboInfo.max})</span>
          )}
        </div>
      </div>
      <div className="ddr-stat-item">
        <div className="ddr-stat-label">Précision</div>
        <div className="ddr-stat-value">{accuracy}%</div>
      </div>
      <div className="ddr-stat-item ddr-stat-item-score">
        <div className="ddr-stat-label">Score</div>
        <div className="ddr-stat-value">{score.toLocaleString()}</div>
      </div>
    </div>
  );
}

