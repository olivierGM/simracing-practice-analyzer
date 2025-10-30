/**
 * Composant PilotStats
 * 
 * Affiche les statistiques principales du pilote (COPIE du modal prod)
 */

import { formatTime, formatDelta } from '../../utils/formatters';
import { getCategoryName, calculatePilotSegmentStats } from '../../services/calculations';
import './PilotStats.css';

export function PilotStats({ driver, allDrivers = [] }) {
  // Calculer le temps potentiel (somme des meilleurs segments valides du pilote)
  let potentialTime = driver.bestValidTime || 0;
  const pilotSegStats = calculatePilotSegmentStats(driver);
  if (pilotSegStats && pilotSegStats.bestS1 && pilotSegStats.bestS2 && pilotSegStats.bestS3) {
    const sumBestSplits = pilotSegStats.bestS1 + pilotSegStats.bestS2 + pilotSegStats.bestS3;
    if (sumBestSplits > 0) {
      potentialTime = sumBestSplits;
    }
  }
  
  // Calculer l'écart au leader (comme prod)
  const leaderTime = allDrivers.reduce((best, d) => {
    if (d.bestValidTime && d.bestValidTime > 0) {
      return best === 0 || d.bestValidTime < best ? d.bestValidTime : best;
    }
    return best;
  }, 0);
  
  const gapToLeader = (driver.bestValidTime && driver.bestValidTime > 0 && leaderTime > 0)
    ? driver.bestValidTime - leaderTime
    : null;
  
  return (
    <section className="pilot-stats-section">
      <h3>📊 Informations du Pilote</h3>
      
      <div className="pilot-stats-grid">
        {/* Ligne 1 */}
        <div className="stat-item">
          <span className="stat-label">Total tours:</span>
          <span className="stat-value">{driver.totalLaps || 0}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Tours valides:</span>
          <span className="stat-value">{driver.validLaps || 0}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Tours wet:</span>
          <span className="stat-value">{driver.wetLaps || 0}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Meilleur temps:</span>
          <span className="stat-value">{formatTime(driver.bestValidTime)}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Temps potentiel:</span>
          <span className="stat-value">{formatTime(potentialTime)}</span>
        </div>
        
        {/* Ligne 2 */}
        <div className="stat-item">
          <span className="stat-label">Moyenne:</span>
          <span className="stat-value">{formatTime(driver.averageValidTime)}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Écart au leader:</span>
          <span className="stat-value">
            {gapToLeader !== null ? formatDelta(gapToLeader) : '--:--.---'}
          </span>
        </div>
        
        <div className="stat-item constance-item">
          <span className="stat-label">
            Constance
            <button className="info-icon" title="Écart-type des temps de tours valides">ℹ️</button>
          </span>
          <span className="stat-value constance-value">
            {driver.validConsistency ? (
              <>
                <span className="trophy">🏆</span> {driver.validConsistency}%
              </>
            ) : '-'}
          </span>
        </div>
      </div>
    </section>
  );
}

