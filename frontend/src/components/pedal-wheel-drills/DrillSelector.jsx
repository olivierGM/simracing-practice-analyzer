/**
 * Composant DrillSelector
 * 
 * Menu de sélection des types de drills disponibles
 */

import './DrillSelector.css';

export const DRILL_TYPES = {
  PERCENTAGE: 'percentage',
  BRAKE_ACCEL: 'brakeaccel',
  COMBINED_VERTICAL: 'combined_vertical'
};

const DRILL_OPTIONS = [
  {
    type: DRILL_TYPES.PERCENTAGE,
    label: 'Drill une pédale',
    description: 'Maintenir un pourcentage précis (20%, 40%, 60%, 80%)',
    icon: '📊',
    available: true
  },
  {
    type: DRILL_TYPES.BRAKE_ACCEL,
    label: 'Frein + Accélérateur',
    description: 'Trail braking : combiner freinage et accélération',
    icon: '🚦',
    available: true
  },
  {
    type: DRILL_TYPES.COMBINED_VERTICAL,
    label: 'Drill Complet',
    description: 'Frein, volant, accélérateur et shifter (lanes verticales)',
    icon: '🎯',
    available: true,
    tag: 'En construction'
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
            {option.tag && (
              <div className="drill-option-tag drill-option-tag-construction">{option.tag}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

