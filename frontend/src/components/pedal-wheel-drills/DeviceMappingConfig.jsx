/**
 * Composant DeviceMappingConfig
 * 
 * Panneau de configuration pour mapper les devices et les axes
 */

import { useState, useEffect } from 'react';
import {
  loadMappingConfig,
  saveMappingConfig,
  assignDevice,
  mapAxis,
  resetMappingConfig,
  DEVICE_TYPES,
  AXIS_TYPES
} from '../../services/deviceMappingService';
import { getConnectedGamepads, getGamepadInfo } from '../../services/gamepadService';
import './DeviceMappingConfig.css';

export function DeviceMappingConfig({ onConfigChange }) {
  const [config, setConfig] = useState(loadMappingConfig());
  const [gamepads, setGamepads] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [expandedDevice, setExpandedDevice] = useState(null);

  // Charger les gamepads avec polling
  useEffect(() => {
    const updateGamepads = () => {
      setGamepads(getConnectedGamepads());
    };
    
    updateGamepads();
    const interval = setInterval(updateGamepads, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Notifier les changements de config
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  const handleDeviceAssign = (deviceIndex, deviceType) => {
    const newConfig = assignDevice(deviceIndex, deviceType, config);
    setConfig(newConfig);
  };

  const handleAxisMap = (deviceIndex, axisIndex, axisType, invert) => {
    const newConfig = mapAxis(deviceIndex, axisIndex, axisType, invert, config);
    setConfig(newConfig);
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toute la configuration ?')) {
      const newConfig = resetMappingConfig();
      setConfig(newConfig);
    }
  };

  const getDeviceTypeLabel = (type) => {
    const labels = {
      [DEVICE_TYPES.WHEEL]: '🎮 Volant',
      [DEVICE_TYPES.PEDALS]: '🦶 Pédales',
      [DEVICE_TYPES.CLUTCH]: '🔧 Embrayage',
      [DEVICE_TYPES.NONE]: 'Aucun'
    };
    return labels[type] || 'Aucun';
  };

  const getAxisTypeLabel = (type) => {
    const labels = {
      [AXIS_TYPES.WHEEL]: 'Volant',
      [AXIS_TYPES.ACCELERATOR]: 'Accélérateur',
      [AXIS_TYPES.BRAKE]: 'Frein',
      [AXIS_TYPES.CLUTCH]: 'Embrayage'
    };
    return labels[type] || 'Aucun';
  };

  return (
    <div className="device-mapping-config">
      <div className="config-header">
        <h3>⚙️ Configuration du Mapping</h3>
        <button className="reset-button" onClick={handleReset}>
          🔄 Réinitialiser
        </button>
      </div>

      {gamepads.length === 0 ? (
        <div className="config-message">
          <p>Connectez vos périphériques pour commencer la configuration.</p>
        </div>
      ) : (
        <div className="config-content">
          {/* Liste des devices */}
          <div className="devices-list">
            {gamepads.map((gamepad, index) => {
              const info = getGamepadInfo(gamepad);
              const assignedType = config.deviceAssignments[gamepad.index] || DEVICE_TYPES.NONE;
              const isExpanded = expandedDevice === gamepad.index;

              return (
                <div key={gamepad.index} className="device-config-item">
                  <div className="device-config-header">
                    <div className="device-config-info">
                      <h4>{info.id}</h4>
                      <p className="device-config-details">
                        {info.axes} axes • {info.buttons} boutons
                      </p>
                    </div>
                    <div className="device-config-assignment">
                      <select
                        value={assignedType}
                        onChange={(e) => handleDeviceAssign(gamepad.index, e.target.value)}
                        className="device-type-select"
                      >
                        <option value={DEVICE_TYPES.NONE}>Aucun</option>
                        <option value={DEVICE_TYPES.WHEEL}>🎮 Volant</option>
                        <option value={DEVICE_TYPES.PEDALS}>🦶 Pédales</option>
                        <option value={DEVICE_TYPES.CLUTCH}>🔧 Embrayage</option>
                      </select>
                    </div>
                    <button
                      className="expand-button"
                      onClick={() => setExpandedDevice(isExpanded ? null : gamepad.index)}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="device-axes-config">
                      <h5>Mapping des axes</h5>
                      {gamepad.axes && gamepad.axes.length > 0 ? (
                        <div className="axes-list">
                          {gamepad.axes.map((axisValue, axisIndex) => {
                            const currentMapping = config.axisMappings[gamepad.index]?.[axisIndex];
                            const currentType = currentMapping?.type || 'none';
                            const currentInvert = currentMapping?.invert || false;

                            return (
                              <div key={axisIndex} className="axis-config-item">
                                <div className="axis-info">
                                  <span className="axis-label">Axe {axisIndex}</span>
                                  <span className="axis-value">
                                    {axisValue.toFixed(3)}
                                  </span>
                                </div>
                                <div className="axis-controls">
                                  <select
                                    value={currentType}
                                    onChange={(e) => handleAxisMap(
                                      gamepad.index,
                                      axisIndex,
                                      e.target.value === 'none' ? null : e.target.value,
                                      currentInvert
                                    )}
                                    className="axis-type-select"
                                  >
                                    <option value="none">Aucun</option>
                                    <option value={AXIS_TYPES.WHEEL}>Volant</option>
                                    <option value={AXIS_TYPES.ACCELERATOR}>Accélérateur</option>
                                    <option value={AXIS_TYPES.BRAKE}>Frein</option>
                                    <option value={AXIS_TYPES.CLUTCH}>Embrayage</option>
                                  </select>
                                  {currentType !== 'none' && (
                                    <label className="invert-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={currentInvert}
                                        onChange={(e) => handleAxisMap(
                                          gamepad.index,
                                          axisIndex,
                                          currentType,
                                          e.target.checked
                                        )}
                                      />
                                      <span>Inverser</span>
                                    </label>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="no-axes">Aucun axe disponible</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Résumé de la configuration */}
          <div className="config-summary">
            <h4>Résumé de la configuration</h4>
            <div className="summary-grid">
              {Object.entries(config.deviceAssignments).map(([deviceIndex, deviceType]) => {
                const gamepad = gamepads.find(gp => gp.index === parseInt(deviceIndex));
                if (!gamepad) return null;
                const info = getGamepadInfo(gamepad);
                
                return (
                  <div key={deviceIndex} className="summary-item">
                    <span className="summary-label">{getDeviceTypeLabel(deviceType)}:</span>
                    <span className="summary-value">{info.id}</span>
                  </div>
                );
              })}
              {Object.keys(config.deviceAssignments).length === 0 && (
                <p className="summary-empty">Aucun device assigné</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

