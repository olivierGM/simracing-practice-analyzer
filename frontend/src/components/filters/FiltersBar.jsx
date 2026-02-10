/**
 * Composant FiltersBar
 *
 * Barre de filtres principale contenant :
 * - Filtre par période (day/week/all)
 * - Filtre par circuit
 * - Toggle groupement par classe
 */

import { SeasonFilter } from './SeasonFilter';
import { PeriodFilter } from './PeriodFilter';
import { TrackFilter } from './TrackFilter';
import { TeamFilter } from './TeamFilter';
import { GroupByClassToggle } from './GroupByClassToggle';
import './FiltersBar.css';

export function FiltersBar({
  seasonFilter,
  onSeasonChange,
  availableSeasons,
  periodFilter,
  onPeriodChange,
  trackFilter,
  onTrackChange,
  availableTracks,
  teamFilter,
  onTeamChange,
  availableTeams,
  hasDriversWithoutTeam = false,
  groupByClass,
  onGroupByClassChange
}) {
  return (
    <div className="filters-bar">
      <div className="filters-container">
        <SeasonFilter 
          value={seasonFilter} 
          onChange={onSeasonChange}
          availableSeasons={availableSeasons}
        />
        <PeriodFilter value={periodFilter} onChange={onPeriodChange} />
        <TrackFilter 
          value={trackFilter} 
          onChange={onTrackChange}
          tracks={availableTracks}
        />
        <TeamFilter
          value={teamFilter}
          onChange={onTeamChange}
          teams={availableTeams}
          hasDriversWithoutTeam={hasDriversWithoutTeam}
        />
        <GroupByClassToggle 
          checked={groupByClass}
          onChange={onGroupByClassChange}
        />
      </div>
    </div>
  );
}

