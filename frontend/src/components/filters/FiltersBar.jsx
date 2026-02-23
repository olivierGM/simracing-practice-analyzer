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
import { SessionTypeFilter } from './SessionTypeFilter';
import { TeamFilter } from './TeamFilter';
import { GroupByClassToggle } from './GroupByClassToggle';
import './FiltersBar.css';

export function FiltersBar({
  seasonFilter,
  onSeasonChange,
  availableSeasons,
  periodFilter,
  onPeriodChange,
  customDateStart,
  customDateEnd,
  onCustomDateStartChange,
  onCustomDateEndChange,
  trackFilter,
  onTrackChange,
  availableTracks,
  sessionTypeFilter,
  onSessionTypeChange,
  availableSessionTypes = [],
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
        <PeriodFilter
          value={periodFilter}
          onChange={onPeriodChange}
          customDateStart={customDateStart}
          customDateEnd={customDateEnd}
          onCustomDateStartChange={onCustomDateStartChange}
          onCustomDateEndChange={onCustomDateEndChange}
        />
        <TrackFilter 
          value={trackFilter} 
          onChange={onTrackChange}
          tracks={availableTracks}
        />
        <SessionTypeFilter
          value={sessionTypeFilter}
          onChange={onSessionTypeChange}
          availableSessionTypes={availableSessionTypes}
        />
        {false && (
          <TeamFilter
            value={teamFilter}
            onChange={onTeamChange}
            teams={availableTeams}
            hasDriversWithoutTeam={hasDriversWithoutTeam}
          />
        )}
        <GroupByClassToggle 
          checked={groupByClass}
          onChange={onGroupByClassChange}
        />
      </div>
    </div>
  );
}

