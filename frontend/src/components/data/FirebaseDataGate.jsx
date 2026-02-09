/**
 * Charge les données Firebase et les fournit via le contexte.
 * Affiche un spinner pendant le chargement, une erreur en cas d'échec, sinon <Outlet />.
 */

import { Outlet } from 'react-router-dom';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { FirebaseDataProvider } from '../../contexts/FirebaseDataContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function FirebaseDataGate() {
  const { data, metadata, sessions, loading, error, reload } = useFirebaseData();

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

  const drivers = data?.drivers || [];

  return (
    <FirebaseDataProvider value={{ data, metadata, sessions, drivers, reload }}>
      <Outlet />
    </FirebaseDataProvider>
  );
}
