/**
 * Composant FiltersBar
 *
 * Barre de filtres principale contenant :
 * - Filtre par période (day/week/all)
 * - Filtre par circuit
 * - Toggle groupement par classe
 * En mobile : section collapsible, fermée par défaut.
 */

import { useState, useEffect } from 'react';
import { SeasonFilter } from './SeasonFilter';
import { PeriodFilter } from './PeriodFilter';
import { TrackFilter } from './TrackFilter';
import { SessionTypeFilter } from './SessionTypeFilter';
import { GroupByClassToggle } from './GroupByClassToggle';
import './FiltersBar.css';

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

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
  teamFilter: _teamFilter,
  onTeamChange: _onTeamChange,
  availableTeams: _availableTeams,
  hasDriversWithoutTeam: _hasDriversWithoutTeam = false,
  groupByClass,
  onGroupByClassChange
}) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  );

  return (
    <div className={`filters-bar ${isMobile && collapsed ? 'filters-bar--collapsed' : ''}`}>
      {isMobile && (
        <button
          type="button"
          className="filters-bar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls="filters-container"
        >
          <span>Filtres</span>
          <span className="filters-bar-toggle-icon" aria-hidden>{collapsed ? '▾' : '▴'}</span>
        </button>
      )}
      <div id="filters-container" className="filters-container" role="region" aria-label="Filtres">
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
        <GroupByClassToggle 
          checked={groupByClass}
          onChange={onGroupByClassChange}
        />
      </div>
    </div>
  );
}

