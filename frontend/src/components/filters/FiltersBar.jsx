/**
 * Composant FiltersBar
 * 
 * Barre de filtres principale contenant :
 * - Filtre par période (day/week/all)
 * - Filtre par piste
 * - Toggle groupement par classe
 */

import { PeriodFilter } from './PeriodFilter';
import { TrackFilter } from './TrackFilter';
import { GroupByClassToggle } from './GroupByClassToggle';
import './FiltersBar.css';

export function FiltersBar({
  periodFilter,
  onPeriodChange,
  trackFilter,
  onTrackChange,
  availableTracks,
  groupByClass,
  onGroupByClassChange
}) {
  return (
    <div className="filters-bar">
      <div className="filters-container">
        <PeriodFilter value={periodFilter} onChange={onPeriodChange} />
        <TrackFilter 
          value={trackFilter} 
          onChange={onTrackChange}
          tracks={availableTracks}
        />
        <GroupByClassToggle 
          checked={groupByClass}
          onChange={onGroupByClassChange}
        />
      </div>
    </div>
  );
}

