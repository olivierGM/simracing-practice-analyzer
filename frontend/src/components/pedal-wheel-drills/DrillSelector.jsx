/**
 * Composant DrillSelector
 * 
 * Menu de sélection des types de drills disponibles
 */
/* eslint-disable react-refresh/only-export-components */
import './DrillSelector.css';

export const DRILL_TYPES = {
  ACCELERATOR: 'accelerator',
  BRAKE: 'brake',
  BRAKE_ACCEL: 'brakeaccel',
  COMBINED_VERTICAL: 'combined_vertical',
  COMBINED_VERTICAL_MOTEK: 'combined_vertical_motek',
  COMBINED_VERTICAL_MOTEK_GRAPHIC: 'combined_vertical_motek_graphic'
};

const DRILL_OPTIONS = [
  { type: DRILL_TYPES.ACCELERATOR, label: 'Accélérateur', description: 'Contrôle en pourcentage (accélérateur)', icon: '⚡', available: true },
  { type: DRILL_TYPES.BRAKE, label: 'Frein', description: 'Contrôle en pourcentage (frein)', icon: '🛑', available: true },
  { type: DRILL_TYPES.BRAKE_ACCEL, label: 'Frein + Accélérateur', description: 'Pistes frein et accélération', icon: '🚦', available: true },
  { type: DRILL_TYPES.COMBINED_VERTICAL, label: 'Drill Complet', description: 'Frein, volant, accélérateur et shifter', icon: '🎯', available: true, tag: 'En construction' },
  { type: DRILL_TYPES.COMBINED_VERTICAL_MOTEK, label: 'Drill Complet Motek', description: 'Drill complet à partir d\'un fichier Motek (.ld/.ldx)', icon: '📊', available: true }
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

