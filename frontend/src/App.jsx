/**
 * Composant App principal
 * 
 * Point d'entrée de l'application React
 * Phase 3 : Filtres + Tableau des pilotes
 */

import { useState } from 'react';
import { Header } from './components/layout/Header';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { FiltersBar } from './components/filters/FiltersBar';
import { DriversTable } from './components/table/DriversTable';
import { PilotModal } from './components/modal/PilotModal';
import { useFirebaseData } from './hooks/useFirebaseData';
import { useFilters } from './hooks/useFilters';
import { useSorting } from './hooks/useSorting';
import './App.css';

function App() {
  const { data, metadata, loading, error } = useFirebaseData();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Extraire les pilotes des données
  const drivers = data?.drivers || [];

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

  // Handler pour le bouton login
  const handleLoginClick = () => {
    setShowLoginModal(true);
    console.log('Login modal à implémenter');
  };

  // Handler pour clic sur un pilote
  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
  };

  // Handler pour fermer la modal
  const handleCloseModal = () => {
    setSelectedDriver(null);
  };

  if (loading) {
    return (
      <div className="app">
        <LoadingSpinner message="Chargement des données..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header metadata={metadata} onLoginClick={handleLoginClick} />
      
      <main className="main-content">
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
      </main>

      {/* Modal pilote */}
      {selectedDriver && (
        <PilotModal
          driver={selectedDriver}
          allDrivers={drivers}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default App;
