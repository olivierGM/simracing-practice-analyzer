/**
 * Page HomePage
 * 
 * Page principale avec liste des pilotes
 */

import { useNavigate } from 'react-router-dom';
import { FiltersBar } from '../components/filters/FiltersBar';
import { DriversTable } from '../components/table/DriversTable';
import { useFilters } from '../hooks/useFilters';
import { useSorting } from '../hooks/useSorting';

export function HomePage({ drivers }) {
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
  } = useFilters(drivers);

  const {
    sortColumn,
    sortDirection,
    sortedItems: sortedDrivers,
    handleSort
  } = useSorting(filteredDrivers);

  // Navigation vers la fiche pilote
  const handleDriverClick = (driver) => {
    navigate(`/pilote/${driver.id}`);
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

