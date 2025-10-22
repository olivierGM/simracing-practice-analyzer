/**
 * Composant ProgressionChart
 * 
 * Graphique Chart.js de la progression des temps de tours
 * 
 * TODO: Implémenter avec Chart.js une fois les données de tours disponibles
 */

import './ProgressionChart.css';

export function ProgressionChart({ driver }) {
  // Pour l'instant, afficher un placeholder
  // Dans la vraie version, on utilisera react-chartjs-2

  return (
    <div className="progression-section">
      <h3 className="section-title">Progression des temps</h3>
      
      <div className="chart-placeholder">
        <p>📊 Graphique de progression</p>
        <p className="placeholder-note">
          (Chart.js à implémenter avec les données de tours)
        </p>
      </div>
    </div>
  );
}

