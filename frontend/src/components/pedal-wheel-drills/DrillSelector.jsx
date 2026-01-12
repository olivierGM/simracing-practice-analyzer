/**
 * Composant DrillSelector
 * 
 * Menu de sélection des types de drills disponibles
 */

import './DrillSelector.css';

export const DRILL_TYPES = {
  PERCENTAGE: 'percentage',
  BRAKE_ACCEL: 'brakeaccel',
  TURNING: 'turning',
  ACCELERATION: 'acceleration',
  COMBINED: 'combined'
};

const DRILL_OPTIONS = [
  {
    type: DRILL_TYPES.PERCENTAGE,
    label: '📊 Drill de Pourcentages',
    description: 'Maintenir un pourcentage précis (20%, 40%, 60%, 80%)',
    icon: '📊',
    available: true
  },
  {
    type: DRILL_TYPES.BRAKE_ACCEL,
    label: '🚦 Frein + Accélérateur',
    description: 'Trail braking : combiner freinage et accélération',
    icon: '🚦',
    available: true
  },
  {
    type: DRILL_TYPES.TURNING,
    label: '🔄 Drill de Virages',
    description: 'Tourner le volant à un angle précis',
    icon: '🔄',
    available: false // À implémenter plus tard
  },
  {
    type: DRILL_TYPES.ACCELERATION,
    label: '📈 Drill d\'Accélération',
    description: 'Suivre une courbe d\'accélération progressive',
    icon: '📈',
    available: false // À implémenter plus tard
  },
  {
    type: DRILL_TYPES.COMBINED,
    label: '🎯 Drill Combiné',
    description: 'Combiner pédales et volant simultanément',
    icon: '🎯',
    available: false // À implémenter plus tard
  }
];

export function DrillSelector({ onSelectDrill, selectedDrill }) {
  return (
    <div className="drill-selector">
      <h3 className="drill-selector-title">🎮 Sélectionner un Drill</h3>
      <div className="drill-options-grid">
        {DRILL_OPTIONS.map(option => (
          <button
            key={option.type}
            className={`drill-option ${selectedDrill === option.type ? 'drill-option-selected' : ''} ${!option.available ? 'drill-option-disabled' : ''}`}
            onClick={() => option.available && onSelectDrill(option.type)}
            disabled={!option.available}
            title={!option.available ? 'Bientôt disponible' : option.description}
          >
            <div className="drill-option-icon">{option.icon}</div>
            <div className="drill-option-content">
              <div className="drill-option-label">{option.label}</div>
              <div className="drill-option-description">{option.description}</div>
            </div>
            {!option.available && (
              <div className="drill-option-badge">Bientôt</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

