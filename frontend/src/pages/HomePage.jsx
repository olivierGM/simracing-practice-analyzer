/**
 * Page HomePage
 * 
 * Page principale avec liste des pilotes
 */

import { useNavigate } from 'react-router-dom';
import { FiltersBar } from '../components/filters/FiltersBar';
import { DriversTable } from '../components/table/DriversTable';
import { GlobalStats } from '../components/layout/GlobalStats';
import { useFilters } from '../hooks/useFilters';
import { useSorting } from '../hooks/useSorting';

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

  const {
    sortColumn,
    sortDirection,
    sortedItems: sortedDrivers,
    handleSort
  } = useSorting(filteredDrivers);

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

      <div className="stats-footer">
        <p>{sortedDrivers.length} pilote(s) affiché(s)</p>
      </div>
    </div>
  );
}

