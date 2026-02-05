/**
 * Composant PedalWheelDrills
 * 
 * Composant principal pour les drills pédales/volant.
 * Homepage : cartes type en haut, liste drills en bas, panneau réglages à droite.
 */

import { useState } from 'react';
import { DRILL_TYPES } from './DrillSelector';
import { DrillsHomeView } from './DrillsHomeView';
import { PercentageDrill } from './PercentageDrill';
import { BrakeAccelDrill } from './BrakeAccelDrill';
import { FullComboVerticalDrill } from './FullComboVerticalDrill';
import { MotekGraphicDrill } from './MotekGraphicDrill';
import { DrillDebugPanel } from './DrillDebugPanel';
import { useMappedGamepads } from '../../hooks/useMappedGamepads';
import { loadMappingConfig } from '../../services/deviceMappingService';
import { getAssignedKeys } from '../../services/keyboardService';
import './PedalWheelDrills.css';

export function PedalWheelDrills() {
  const [mappingConfig, setMappingConfig] = useState(loadMappingConfig());
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [initialDrillState, setInitialDrillState] = useState(null); // { drillSong, audioEnabled, blindMode }

  const {
    isSupported: _isSupported,
    gamepads: _gamepads,
    wheel,
    accelerator,
    brake,
    shiftUp,
    shiftDown
  } = useMappedGamepads(mappingConfig);

  const handleConfigChange = (newConfig) => {
    setMappingConfig(newConfig);
  };

  const handleStartDrill = (drillType, state) => {
    setInitialDrillState(state);
    setSelectedDrill(drillType);
  };

  const handleDrillBack = () => {
    setSelectedDrill(null);
    setInitialDrillState(null);
  };

  const hasGamepadAssignments = Object.keys(mappingConfig.axisMappings || {}).length > 0 &&
    Object.values(mappingConfig.axisMappings || {}).some(deviceMappings =>
      Object.keys(deviceMappings || {}).length > 0
    );
  const assignedKeys = getAssignedKeys();
  const hasKeyboardAssignments = Object.keys(assignedKeys).length > 0;
  const _hasAssignedDevices = hasGamepadAssignments || hasKeyboardAssignments;

  if (selectedDrill) {
    const initial = initialDrillState || {};
    const inputType = initial.inputType || 'brake';
    return (
      <div className="pedal-wheel-drills pedal-wheel-drills-fullpage">
        {(selectedDrill === DRILL_TYPES.ACCELERATOR || selectedDrill === DRILL_TYPES.BRAKE) && (
          <PercentageDrill
            acceleratorValue={accelerator}
            brakeValue={brake}
            wheelValue={wheel}
            shiftUp={shiftUp}
            shiftDown={shiftDown}
            onBack={handleDrillBack}
            initialDrillSong={initial.drillSong}
            initialAudioEnabled={initial.audioEnabled}
            initialBlindMode={initial.blindMode}
            initialInputType={inputType}
          />
        )}
        {selectedDrill === DRILL_TYPES.BRAKE_ACCEL && (
          <BrakeAccelDrill
            acceleratorValue={accelerator}
            brakeValue={brake}
            wheelValue={wheel}
            shiftUp={shiftUp}
            shiftDown={shiftDown}
            onBack={handleDrillBack}
            initialDrillSong={initial.drillSong}
            initialAudioEnabled={initial.audioEnabled}
            initialBlindMode={initial.blindMode}
          />
        )}
        {selectedDrill === DRILL_TYPES.COMBINED_VERTICAL_MOTEK_GRAPHIC && (
          <MotekGraphicDrill
            acceleratorValue={accelerator}
            brakeValue={brake}
            wheelValue={wheel}
            shiftUp={shiftUp}
            shiftDown={shiftDown}
            onBack={handleDrillBack}
            initialDrillSong={initial.drillSong}
            initialAudioEnabled={initial.audioEnabled}
            initialBlindMode={initial.blindMode}
          />
        )}
        {(selectedDrill === DRILL_TYPES.COMBINED_VERTICAL || selectedDrill === DRILL_TYPES.COMBINED_VERTICAL_MOTEK) && (
          <FullComboVerticalDrill
            acceleratorValue={accelerator}
            brakeValue={brake}
            wheelValue={wheel}
            shiftUp={shiftUp}
            shiftDown={shiftDown}
            onBack={handleDrillBack}
            initialDrillSong={initial.drillSong}
            initialAudioEnabled={initial.audioEnabled}
            initialBlindMode={initial.blindMode}
          />
        )}
        <DrillDebugPanel />
      </div>
    );
  }

  return (
    <div className="pedal-wheel-drills">
      <DrillsHomeView
        onStartDrill={handleStartDrill}
        mappingConfig={mappingConfig}
        onMappingConfigChange={handleConfigChange}
      />
      <DrillDebugPanel />
    </div>
  );
}

