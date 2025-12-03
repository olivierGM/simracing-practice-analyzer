/**
 * Composant DDRStatsBar
 * 
 * Barre de statistiques compacte en haut de l'interface
 */

import { formatTime } from '../../hooks/useDrillEngine';
import './DDRStatsBar.css';

export function DDRStatsBar({ totalTime, zoneStatus, accuracy, score }) {
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
    <div className="ddr-stats-bar">
      <div className="ddr-stat-item">
        <div className="ddr-stat-label">Temps</div>
        <div className="ddr-stat-value">{formatTime(totalTime)}</div>
      </div>
      <div className="ddr-stat-item">
        <div className="ddr-stat-label">Zone</div>
        <div className="ddr-stat-value">
          <span className="ddr-stat-zone-emoji">{getZoneEmoji()}</span>
          <span className="ddr-stat-zone-text">{getZoneText()}</span>
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

