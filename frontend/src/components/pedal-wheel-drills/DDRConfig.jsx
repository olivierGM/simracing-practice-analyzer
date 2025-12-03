/**
 * Composant DDRConfig
 * 
 * Configuration avant de commencer le drill DDR
 */

import { DrillSongSelector } from './DrillSongSelector';
import './DDRConfig.css';

const DIFFICULTY_MODES = {
  EASY: { label: 'Facile', tolerance: 5 },
  MEDIUM: { label: 'Moyen', tolerance: 5 },
  HARD: { label: 'Difficile', tolerance: 5 },
  EXTREME: { label: 'Extreme', tolerance: 5 },
  INSANE: { label: 'Insane', tolerance: 5 },
  INSANE_PLUS_1: { label: 'Insane +1', tolerance: 5 },
  INSANE_PLUS_2: { label: 'Insane +2', tolerance: 5 }
};

const DURATION_OPTIONS = [
  { value: null, label: 'Libre' },
  { value: 30, label: '30 secondes' },
  { value: 60, label: '60 secondes' },
  { value: 120, label: '120 secondes' }
];

export function DDRConfig({ 
  inputType, 
  onInputTypeChange,
  tolerance,
  onToleranceChange,
  drillSong,
  onDrillSongChange,
  onDifficultyChange,
  audioEnabled,
  onAudioEnabledChange,
  blindMode,
  onBlindModeChange,
  onStart,
  onBack
}) {
  return (
    <div className="ddr-config">
      <div className="ddr-config-header">
        <button className="ddr-config-back-button" onClick={onBack}>
          ← Retour
        </button>
        <h2 className="ddr-config-title">⚙️ Configuration</h2>
      </div>

      <div className="ddr-config-content">
        <div className="ddr-config-section">
          <label className="ddr-config-label">Pédale</label>
          <div className="ddr-config-options">
            <button
              className={`ddr-config-option ${inputType === 'accelerator' ? 'ddr-config-option-selected' : ''}`}
              onClick={() => onInputTypeChange('accelerator')}
            >
              ⚡ Accélérateur
            </button>
            <button
              className={`ddr-config-option ${inputType === 'brake' ? 'ddr-config-option-selected' : ''}`}
              onClick={() => onInputTypeChange('brake')}
            >
              🛑 Frein
            </button>
          </div>
        </div>

        <div className="ddr-config-section">
          <label className="ddr-config-label">Tolérance (%)</label>
          <div className="ddr-config-tolerance-input">
            <input
              type="number"
              min="1"
              max="20"
              step="0.5"
              value={tolerance}
              onChange={(e) => onToleranceChange(parseFloat(e.target.value) || 5)}
              className="ddr-config-tolerance-field"
            />
            <span className="ddr-config-tolerance-unit">±{tolerance}%</span>
          </div>
          <p className="ddr-config-hint">Ajustez la tolérance pour tester différents niveaux de précision</p>
        </div>

        <div className="ddr-config-section">
          <DrillSongSelector 
            onSelectDrillSong={onDrillSongChange}
            onSelectDifficulty={onDifficultyChange}
          />
        </div>

        <div className="ddr-config-section">
          <label className="ddr-config-label">Options</label>
          <div className="ddr-config-options-vertical">
            <label className="ddr-config-checkbox">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={(e) => onAudioEnabledChange(e.target.checked)}
              />
              <span>🔊 Sons activés (annonces + jugements)</span>
            </label>
            <label className="ddr-config-checkbox">
              <input
                type="checkbox"
                checked={blindMode}
                onChange={(e) => onBlindModeChange(e.target.checked)}
              />
              <span>👁️ Mode Blind (cacher barre verticale)</span>
            </label>
          </div>
          <p className="ddr-config-hint">
            Mode Blind : Testez si vous avez bien appris vos pourcentages sans aide visuelle
          </p>
        </div>

      </div>

      <div className="ddr-config-actions">
        <button className="ddr-config-start-button" onClick={onStart}>
          ▶️ Commencer
        </button>
      </div>
    </div>
  );
}

export { DIFFICULTY_MODES };

