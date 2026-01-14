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

  // Calculer les statistiques de marques (seulement celles avec 2+ pilotes)
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

    // Filtrer pour ne garder que les marques avec 2+ pilotes, puis trier par nombre décroissant
    return Object.entries(counts)
      .filter(([_, count]) => count >= 2) // Seulement les marques avec 2+ pilotes
      .map(([name, count]) => ({
        name,
        count,
        logoUrl: getManufacturerLogoUrl(manufacturerToCarModel[name])
      }))
      .sort((a, b) => b.count - a.count);
  }, [drivers]);

  // Afficher jusqu'à 6 marques sur toutes les tailles d'écran
  const maxDisplayed = 6;
  const displayedManufacturers = manufacturerStats.slice(0, maxDisplayed);

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
      {overall.wetLaps > 0 && (
        <div className="compact-stat-card">
          <h3>🌧️ Tours Wet</h3>
          <div className="stat-value">{overall.wetLaps}</div>
        </div>
      )}
      <div className="compact-stat-card">
        <h3>👥 Pilotes</h3>
        <div className="stat-value">{overall.pilotCount}</div>
      </div>
      {displayedManufacturers.length > 0 && (
        <div className="compact-stat-card manufacturer-stats-card">
          <h3>🚗 Marques</h3>
          <div className="manufacturer-stats-list">
            {displayedManufacturers.map(({ name, count, logoUrl }) => (
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

