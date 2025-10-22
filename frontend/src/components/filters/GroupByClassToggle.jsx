/**
 * Composant GroupByClassToggle
 * 
 * Checkbox pour activer/désactiver le groupement par classe
 */

import './GroupByClassToggle.css';

export function GroupByClassToggle({ checked, onChange }) {
  return (
    <div className="filter-group group-toggle">
      <label className="toggle-label">
        <input
          type="checkbox"
          id="groupByClass"
          className="toggle-checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-text">
          📊 Grouper par classe
        </span>
      </label>
    </div>
  );
}

