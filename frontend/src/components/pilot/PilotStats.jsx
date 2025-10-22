/**
 * Composant PilotStats
 * 
 * Affiche les statistiques principales du pilote
 */

import { formatTime } from '../../utils/formatters';
import './PilotStats.css';

export function PilotStats({ driver }) {
  return (
    <div className="pilot-stats">
      <div className="stat-item">
        <span className="stat-label">Meilleur temps</span>
        <span className="stat-value best-time">{formatTime(driver.bestTime)}</span>
      </div>

      <div className="stat-item">
        <span className="stat-label">Potentiel</span>
        <span className="stat-value">{formatTime(driver.potential)}</span>
      </div>

      <div className="stat-item">
        <span className="stat-label">
          Constance
          <button className="info-icon" title="Écart-type des temps de tours valides">ℹ️</button>
        </span>
        <span className="stat-value">
          {driver.consistency ? `${(driver.consistency / 1000).toFixed(3)}s` : '-'}
        </span>
      </div>

      <div className="stat-item">
        <span className="stat-label">Tours valides</span>
        <span className="stat-value">{driver.validLaps || 0}</span>
      </div>

      <div className="stat-item">
        <span className="stat-label">Piste</span>
        <span className="stat-value track-name">{driver.track || '-'}</span>
      </div>

      <div className="stat-item">
        <span className="stat-label">Classe</span>
        <span className="stat-value class-badge">{driver.carClass || '-'}</span>
      </div>
    </div>
  );
}

