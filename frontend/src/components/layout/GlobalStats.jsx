/**
 * Composant GlobalStats
 * 
 * Affiche les statistiques globales de la piste sélectionnée
 * COPIE EXACTE de displayOverallStats() dans script-public.js lignes 879-913
 */

import { useMemo } from 'react';
import { formatTime } from '../../utils/formatters';
import { getManufacturerName, getManufacturerLogoUrl } from '../../services/carManufacturerService';
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

  // Calculer les statistiques de marques
  const manufacturerStats = useMemo(() => {
    const counts = {};
    const manufacturerToCarModel = {}; // Mapping pour obtenir le carModel représentatif de chaque marque
    
    drivers.forEach(driver => {
      if (driver.carModel) {
        const manufacturerName = getManufacturerName(driver.carModel);
        counts[manufacturerName] = (counts[manufacturerName] || 0) + 1;
        // Garder le premier carModel trouvé pour chaque marque (pour obtenir le logo)
        if (!manufacturerToCarModel[manufacturerName]) {
          manufacturerToCarModel[manufacturerName] = driver.carModel;
        }
      }
    });

    // Trier par nombre décroissant et prendre les top 4
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        logoUrl: getManufacturerLogoUrl(manufacturerToCarModel[name])
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [drivers]);

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
      {manufacturerStats.length > 0 && (
        <div className="compact-stat-card manufacturer-stats-card">
          <h3>🚗 Marques</h3>
          <div className="manufacturer-stats-list">
            {manufacturerStats.map(({ name, count, logoUrl }) => (
              <div key={name} className="manufacturer-stat-item" title={`${name}: ${count} pilote${count > 1 ? 's' : ''}`}>
                <img 
                  src={logoUrl} 
                  alt={name}
                  className="manufacturer-stat-logo"
                  loading="lazy"
                />
                <span className="manufacturer-stat-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

