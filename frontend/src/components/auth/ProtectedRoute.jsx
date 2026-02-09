/**
 * Garde de route : redirige vers /login si non connecté.
 * Utilisé comme layout route : rend <Outlet /> quand connecté.
 * Aucun bypass : l'accès protégé exige une session authentifiée.
 */

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app">
        <LoadingSpinner message="Vérification de la session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    const from = location.pathname + location.search;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
