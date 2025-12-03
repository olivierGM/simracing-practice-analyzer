/**
 * Composant DDRInputsBar
 * 
 * Barre ultra compacte d'inputs en bas de l'interface
 */

import './DDRInputsBar.css';

export function DDRInputsBar({ accelerator, brake, wheel, shiftUp, shiftDown }) {
  const acceleratorPercent = Math.round(accelerator * 100);
  const brakePercent = Math.round(brake * 100);
  const wheelDegrees = Math.round(wheel * 900);

  return (
    <div className="ddr-inputs-bar">
      <div className="ddr-input-item">
        <span className="ddr-input-icon">⚡</span>
        <span className="ddr-input-value">{acceleratorPercent}%</span>
      </div>
      <div className="ddr-input-separator">│</div>
      <div className="ddr-input-item">
        <span className="ddr-input-icon">🛑</span>
        <span className="ddr-input-value">{brakePercent}%</span>
      </div>
      <div className="ddr-input-separator">│</div>
      <div className="ddr-input-item">
        <span className="ddr-input-icon">🎮</span>
        <span className="ddr-input-value">{wheelDegrees}°</span>
      </div>
      <div className="ddr-input-separator">│</div>
      <div className="ddr-input-item">
        <span className="ddr-input-icon">⬆️</span>
        <span className="ddr-input-value">{shiftUp ? 'ON' : 'OFF'}</span>
      </div>
      <div className="ddr-input-separator">│</div>
      <div className="ddr-input-item">
        <span className="ddr-input-icon">⬇️</span>
        <span className="ddr-input-value">{shiftDown ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  );
}

