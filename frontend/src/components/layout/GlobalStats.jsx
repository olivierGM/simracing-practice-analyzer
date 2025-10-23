/**
 * Composant GlobalStats
 * 
 * Affiche les statistiques globales de la piste sélectionnée
 * COPIE EXACTE de displayOverallStats() dans script-public.js lignes 879-913
 */

import { formatTime } from '../../utils/formatters';
import './GlobalStats.css';

export function GlobalStats({ drivers }) {
  // Calculer les statistiques globales (comme dans script-public.js)
  const overall = {
    totalLaps: 0,
    validLaps: 0,
    wetLaps: 0,
    bestValidTime: Infinity,
    averageValidTime: 0,
    pilotCount: drivers.length
  };

  let totalValidTime = 0;

  drivers.forEach(driver => {
    overall.totalLaps += driver.totalLaps || 0;
    overall.validLaps += driver.validLaps || 0;
    overall.wetLaps += driver.wetLaps || 0;

    if (driver.bestValidTime && driver.bestValidTime < overall.bestValidTime) {
      overall.bestValidTime = driver.bestValidTime;
    }

    if (driver.validLaps && driver.averageValidTime) {
      totalValidTime += driver.averageValidTime * driver.validLaps;
    }
  });

  // Calculer la moyenne globale
  if (overall.validLaps > 0) {
    overall.averageValidTime = totalValidTime / overall.validLaps;
  }

  // Si pas de temps valide trouvé
  if (overall.bestValidTime === Infinity) {
    overall.bestValidTime = 0;
  }

  return (
    <div className="compact-stats-grid">
      <div className="compact-stat-card">
        <h3>🏁 Total Tours</h3>
        <div className="stat-value">{overall.totalLaps}</div>
      </div>
      <div className="compact-stat-card">
        <h3>✅ Tours Valides</h3>
        <div className="stat-value">{overall.validLaps}</div>
      </div>
      <div className="compact-stat-card">
        <h3>🏆 Meilleur Temps</h3>
        <div className="stat-value">{formatTime(overall.bestValidTime)}</div>
      </div>
      <div className="compact-stat-card">
        <h3>📊 Moyenne</h3>
        <div className="stat-value">{formatTime(overall.averageValidTime)}</div>
      </div>
      <div className="compact-stat-card">
        <h3>🌧️ Tours Wet</h3>
        <div className="stat-value">{overall.wetLaps}</div>
      </div>
      <div className="compact-stat-card">
        <h3>👥 Pilotes</h3>
        <div className="stat-value">{overall.pilotCount}</div>
      </div>
    </div>
  );
}

