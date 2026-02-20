/**
 * Composant PeriodFilter
 *
 * Filtre par période : day / week / all / custom (plage date-heure personnalisée).
 */

import { PERIOD_FILTERS } from '../../utils/constants';
import './PeriodFilter.css';

export function PeriodFilter({
  value,
  onChange,
  customDateStart = '',
  customDateEnd = '',
  onCustomDateStartChange,
  onCustomDateEndChange
}) {
  const isCustom = value === 'custom';

  return (
    <div className="filter-group period-filter-wrap">
      <label htmlFor="dateFilter" className="filter-label">
        📅 Période :
      </label>
      <select
        id="dateFilter"
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {PERIOD_FILTERS.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
      {isCustom && (
        <div className="period-custom-range">
          <label htmlFor="customDateStart" className="period-custom-label">Du</label>
          <input
            id="customDateStart"
            type="datetime-local"
            className="filter-select period-datetime"
            value={customDateStart}
            onChange={(e) => onCustomDateStartChange?.(e.target.value)}
            aria-label="Date et heure de début"
          />
          <label htmlFor="customDateEnd" className="period-custom-label">au</label>
          <input
            id="customDateEnd"
            type="datetime-local"
            className="filter-select period-datetime"
            value={customDateEnd}
            onChange={(e) => onCustomDateEndChange?.(e.target.value)}
            aria-label="Date et heure de fin"
          />
        </div>
      )}
    </div>
  );
}

