/**
 * Composant PeriodFilter
 * 
 * Filtre par période : day / week / all
 */

import { PERIOD_FILTERS } from '../../utils/constants';
import './PeriodFilter.css';

export function PeriodFilter({ value, onChange }) {
  return (
    <div className="filter-group">
      <label htmlFor="dateFilter" className="filter-label">
        📅 Période :
      </label>
      <select
        id="dateFilter"
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {PERIOD_FILTERS.map(filter => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
    </div>
  );
}

