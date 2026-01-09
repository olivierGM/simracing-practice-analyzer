/**
 * Page HomePage
 * 
 * Page principale avec liste des pilotes
 */

import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiltersBar } from '../components/filters/FiltersBar';
import { DriversTable } from '../components/table/DriversTable';
import { GlobalStats } from '../components/layout/GlobalStats';
import { ACCServersBanner } from '../components/layout/ACCServersBanner';
import { useFilters } from '../hooks/useFilters';
import { useProcessedData } from '../hooks/useProcessedData';
import { useSorting } from '../hooks/useSorting';
import { useTrackContext } from '../contexts/TrackContext';
import { trackFilterChange, trackSort, trackPilotClick } from '../services/analytics';
import { DURATIONS } from '../utils/constants';

export function HomePage({ drivers, sessions = [] }) {
  const navigate = useNavigate();
  const { setTrackFilter: setContextTrackFilter } = useTrackContext();

  // Hooks pour filtres et tri
  const {
    seasonFilter,
    setSeasonFilter,
    availableSeasons,
    periodFilter,
    setPeriodFilter,
    trackFilter,
    setTrackFilter,
    groupByClass,
    setGroupByClass,
    availableTracks,
    filteredDrivers,
    filteredSessionsBySeason // Sessions déjà filtrées par saison
  } = useFilters(drivers, sessions);
  
  // Mettre à jour le contexte quand trackFilter change
  useEffect(() => {
    setContextTrackFilter(trackFilter);
    // Track le changement de filtre piste
    if (trackFilter) {
      trackFilterChange('track', trackFilter);
    }
  }, [trackFilter, setContextTrackFilter]);
  
  // Track le changement de filtre période
  useEffect(() => {
    trackFilterChange('period', periodFilter);
  }, [periodFilter]);
  
  // Track le changement de groupement par classe
  useEffect(() => {
    trackFilterChange('group_by_class', groupByClass ? 'enabled' : 'disabled');
  }, [groupByClass]);
  
  // COPIE DE LA PROD ligne 1164-1182: Filtrer les sessions par période AVANT retraitement
  // Note: filteredSessionsBySeason contient déjà les sessions filtrées par saison
  const filteredSessions = useMemo(() => {
    let result = [...filteredSessionsBySeason]; // Utiliser les sessions déjà filtrées par saison
    
    // Filtrer par piste
    if (trackFilter) {
      result = result.filter(session => session.trackName === trackFilter);
    }
    
    // Filtrer par date (COPIE EXACTE de la prod)
    if (periodFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      if (periodFilter === 'week') {
        cutoffDate.setTime(now.getTime() - DURATIONS.ONE_WEEK);
      } else if (periodFilter === 'day') {
        cutoffDate.setTime(now.getTime() - DURATIONS.ONE_DAY);
      }
      
      result = result.filter(session => {
        if (!session.Date) return false;
        const sessionDate = new Date(session.Date);
        return sessionDate >= cutoffDate;
      });
    }
    
    return result;
  }, [filteredSessionsBySeason, trackFilter, periodFilter]);
  
  // Retraiter les sessions FILTRÉES (COMME LA PROD ligne 1185-1186)
  const processedDrivers = useProcessedData(filteredSessions, trackFilter);

  const {
    sortColumn,
    sortDirection,
    sortedItems: sortedDrivers,
    handleSort: originalHandleSort
  } = useSorting(processedDrivers);

  // Vérifier s'il y a des wet times dans les données
  const hasWetTimes = useMemo(() => {
    return sortedDrivers.some(driver => 
      (driver.bestWetTime && driver.bestWetTime > 0) ||
      (driver.averageWetTime && driver.averageWetTime > 0) ||
      (driver.wetConsistency && driver.wetConsistency > 0)
    );
  }, [sortedDrivers]);
  
  // Wrapper pour handleSort avec tracking
  const handleSort = (column) => {
    trackSort(column, sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc');
    originalHandleSort(column);
  };

  // Navigation vers la fiche pilote
  const handleDriverClick = (driver) => {
    // Track le clic sur le pilote
    trackPilotClick(driver.name, driver.track || 'unknown', driver.category || 'unknown');
    
    // Normaliser le nom du circuit pour l'URL (enlever espaces et caractères spéciaux)
    const circuitSlug = driver.track
      ? driver.track
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Enlever accents
          .replace(/[^a-z0-9]+/g, '-') // Remplacer espaces et caractères spéciaux par -
          .replace(/^-+|-+$/g, '') // Enlever - au début/fin
      : 'circuit';
    
    // Ajouter le paramètre season dans l'URL si une saison est sélectionnée
    const seasonParam = seasonFilter && seasonFilter !== 'all' ? `?season=${seasonFilter}` : '';
    console.log(`🔗 Navigation: seasonFilter=${seasonFilter}, seasonParam=${seasonParam}`);
    navigate(`/circuit/${circuitSlug}/pilote/${driver.id}${seasonParam}`);
  };

  return (
    <div className="container">
      <FiltersBar
        seasonFilter={seasonFilter}
        onSeasonChange={setSeasonFilter}
        availableSeasons={availableSeasons}
        periodFilter={periodFilter}
        onPeriodChange={setPeriodFilter}
        trackFilter={trackFilter}
        onTrackChange={setTrackFilter}
        availableTracks={availableTracks}
        groupByClass={groupByClass}
        onGroupByClassChange={setGroupByClass}
      />

      {/* Bandeau des serveurs ACC (sous la barre de filtres) */}
      <ACCServersBanner trackName={trackFilter} />

      {/* Cartes de statistiques globales (COPIE de la prod) */}
      <GlobalStats drivers={sortedDrivers} />

      {sortedDrivers.length === 0 ? (
        <div className="no-data">
          <p>Aucun pilote trouvé avec les filtres sélectionnés.</p>
        </div>
      ) : (
        <DriversTable
          drivers={sortedDrivers}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          groupByClass={groupByClass}
          onDriverClick={handleDriverClick}
          hasWetTimes={hasWetTimes}
        />
      )}
    </div>
  );
}

