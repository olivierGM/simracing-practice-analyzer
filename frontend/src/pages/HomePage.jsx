/**
 * Page HomePage
 * 
 * Page principale avec liste des pilotes
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiltersBar } from '../components/filters/FiltersBar';
import { DriversTable } from '../components/table/DriversTable';
import { GlobalStats } from '../components/layout/GlobalStats';
import { useFilters } from '../hooks/useFilters';
import { useProcessedData } from '../hooks/useProcessedData';
import { useSorting } from '../hooks/useSorting';
import { DURATIONS } from '../utils/constants';

export function HomePage({ drivers, sessions = [] }) {
  const navigate = useNavigate();

  // Hooks pour filtres et tri
  const {
    periodFilter,
    setPeriodFilter,
    trackFilter,
    setTrackFilter,
    groupByClass,
    setGroupByClass,
    availableTracks,
    filteredDrivers
  } = useFilters(drivers, sessions);
  
  // COPIE DE LA PROD ligne 1164-1182: Filtrer les sessions par période AVANT retraitement
  const filteredSessions = useMemo(() => {
    let result = [...sessions];
    
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
  }, [sessions, trackFilter, periodFilter]);
  
  // Retraiter les sessions FILTRÉES (COMME LA PROD ligne 1185-1186)
  const processedDrivers = useProcessedData(filteredSessions, trackFilter);

  const {
    sortColumn,
    sortDirection,
    sortedItems: sortedDrivers,
    handleSort
  } = useSorting(processedDrivers);

  // Navigation vers la fiche pilote
  const handleDriverClick = (driver) => {
    // Normaliser le nom du circuit pour l'URL (enlever espaces et caractères spéciaux)
    const circuitSlug = driver.track
      ? driver.track
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Enlever accents
          .replace(/[^a-z0-9]+/g, '-') // Remplacer espaces et caractères spéciaux par -
          .replace(/^-+|-+$/g, '') // Enlever - au début/fin
      : 'circuit';
    
    navigate(`/circuit/${circuitSlug}/pilote/${driver.id}`);
  };

  return (
    <div className="container">
      <FiltersBar
        periodFilter={periodFilter}
        onPeriodChange={setPeriodFilter}
        trackFilter={trackFilter}
        onTrackChange={setTrackFilter}
        availableTracks={availableTracks}
        groupByClass={groupByClass}
        onGroupByClassChange={setGroupByClass}
      />

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
        />
      )}
    </div>
  );
}

