/**
 * Filtre par type de session (Pratique / Qualif / Course).
 * Valeurs sessionType: FP, Q, R (ACC/MoTec).
 */

import { SESSION_TYPE_FILTERS } from '../../utils/constants';
import './SessionTypeFilter.css';

export function SessionTypeFilter({ value, onChange, availableSessionTypes = [] }) {
  // Afficher toutes les options ; désactiver celles sans données si on veut, ou garder actives
  const options = SESSION_TYPE_FILTERS.map(({ value: v, label }) => ({
    value: v,
    label,
    disabled: v !== '' && availableSessionTypes.length > 0 && !availableSessionTypes.includes(v)
  }));

  return (
    <div className="filter-group session-type-filter">
      <label htmlFor="sessionTypeSelect" className="filter-label">
        Session :
      </label>
      <select
        id="sessionTypeSelect"
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value || 'all'} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
