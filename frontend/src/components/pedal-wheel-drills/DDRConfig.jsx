/**
 * Composant DDRConfig
 * 
 * Configuration avant de commencer le drill DDR
 */

import { DrillSongSelector } from './DrillSongSelector';
import './DDRConfig.css';

const DIFFICULTY_MODES = {
  MEDIUM: { label: 'Facile', tolerance: 5 },
  HARD: { label: 'Moyen', tolerance: 5 },
  EXTREME: { label: 'Difficile', tolerance: 5 },
  INSANE: { label: 'Extreme', tolerance: 5 },
  INSANE_PLUS_1: { label: 'Insane', tolerance: 5 },
  INSANE_PLUS_2: { label: 'Nightmare', tolerance: 5 }
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
  musicEnabled,
  onMusicEnabledChange,
  blindMode,
  onBlindModeChange,
  onStart,
  onBack,
  showInputTypeSelector = true, // Nouveau prop pour cacher le sélecteur d'input
  drillType = 'percentage' // Nouveau prop pour définir le type de drill
}) {
  return (
    <div className="ddr-config">
      <div className="ddr-config-header">
        <button className="ddr-config-back-button" onClick={onBack}>
          ← Retour
        </button>
        <h2 className="ddr-config-title">Sélection du Drill</h2>
      </div>

      <div className="ddr-config-content">
        {/* Colonne gauche : Settings */}
        <div className="ddr-config-settings">
          {showInputTypeSelector && (
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
          )}

          <div className="ddr-config-section">
            <label className="ddr-config-label">Options Audio</label>
            <div className="ddr-config-options-vertical">
              <label className="ddr-config-checkbox">
                <input
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={(e) => onAudioEnabledChange(e.target.checked)}
                />
                <span>🔊 Effets sonores</span>
              </label>
              <label className="ddr-config-checkbox">
                <input
                  type="checkbox"
                  checked={musicEnabled}
                  onChange={(e) => onMusicEnabledChange(e.target.checked)}
                  disabled={!audioEnabled}
                />
                <span>🎵 Musique de fond</span>
              </label>
            </div>
          </div>

          <div className="ddr-config-section">
            <label className="ddr-config-label">Options Visuelles</label>
            <div className="ddr-config-options-vertical">
              <label className="ddr-config-checkbox">
                <input
                  type="checkbox"
                  checked={blindMode}
                  onChange={(e) => onBlindModeChange(e.target.checked)}
                />
                <span>👁️ Mode Blind</span>
              </label>
            </div>
            <p className="ddr-config-hint">
              Une fois vos niveaux de braking appris, testez sans indicateur visuel
            </p>
          </div>
        </div>

        {/* Colonne droite : Drills */}
        <div className="ddr-config-drills">
          <DrillSongSelector 
            onSelectDrillSong={onDrillSongChange}
            onSelectDifficulty={onDifficultyChange}
            drillType={drillType}
          />
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

