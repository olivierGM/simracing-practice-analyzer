/**
 * DrillsSettingsPanel
 * Sidebar réglages : son, mode aveugle en haut, bindings périphériques avec valeurs
 */

import { DeviceMappingConfig } from './DeviceMappingConfig';
import './DrillsSettingsPanel.css';

export function DrillsSettingsPanel({
  isOpen,
  onClose,
  audioEnabled,
  onAudioEnabledChange,
  blindMode,
  onBlindModeChange,
  mappingConfig,
  onMappingConfigChange
}) {
  if (!isOpen) return null;

  return (
    <div className="drills-settings-panel-inner">
      <div className="drills-settings-panel-header">
        <h3 className="drills-settings-panel-title">Réglages</h3>
        <button
          type="button"
          className="drills-settings-panel-close"
          onClick={onClose}
          aria-label="Fermer le panneau"
        >
          ×
        </button>
      </div>

      {/* Barre du haut : Son + Mode aveugle */}
      <div className="drills-settings-top-bar">
        <label className="drills-settings-toggle">
          <input
            type="checkbox"
            checked={audioEnabled}
            onChange={(e) => onAudioEnabledChange(e.target.checked)}
          />
          <span className="drills-settings-toggle-slider" />
          <span className="drills-settings-toggle-label">Son</span>
        </label>
        <label className="drills-settings-toggle drills-settings-toggle-with-desc">
          <input
            type="checkbox"
            checked={blindMode}
            onChange={(e) => onBlindModeChange(e.target.checked)}
          />
          <span className="drills-settings-toggle-slider" />
          <span className="drills-settings-toggle-wrap">
            <span className="drills-settings-toggle-label">Mode aveugle</span>
            <span className="drills-settings-toggle-desc">Cache la barre de jugement pendant le drill</span>
          </span>
        </label>
      </div>

      {/* Bindings périphériques avec valeurs */}
      <div className="drills-settings-panel-content">
        <div className="drills-settings-device-mapping">
          <DeviceMappingConfig
            onConfigChange={onMappingConfigChange}
            compact
          />
        </div>
      </div>
    </div>
  );
}
