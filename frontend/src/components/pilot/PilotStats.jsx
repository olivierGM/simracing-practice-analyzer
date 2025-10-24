/**
 * Composant PilotStats
 * 
 * Affiche les statistiques principales du pilote (COPIE du modal prod)
 */

import { formatTime } from '../../utils/formatters';
import { getCategoryName } from '../../services/calculations';
import './PilotStats.css';

export function PilotStats({ driver }) {
  // Calculer le temps potentiel (somme des meilleurs segments)
  const potentialTime = driver.bestValidTime || 0; // TODO: calculer depuis les segments
  
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
          <span className="stat-value best-time">{formatTime(driver.bestValidTime)}</span>
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
          <span className="stat-value">--:--.---</span>
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

