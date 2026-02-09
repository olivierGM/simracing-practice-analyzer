/**
 * Route protégée pour les administrateurs uniquement
 * 
 * Vérifie :
 * 1. Que l'utilisateur est connecté (via ProtectedRoute parent)
 * 2. Que l'utilisateur a le rôle 'admin' dans Firestore
 * 
 * Redirige vers / si pas admin
 * 
 * Usage: <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function AdminRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const { isAdmin, loading } = useUserRole();

  // Attendre le chargement du rôle
  if (loading) {
    return (
      <div className="app">
        <LoadingSpinner message="Vérification des permissions..." />
      </div>
    );
  }

  // Vérifier la connexion (normalement déjà vérifié par ProtectedRoute, mais sécurité supplémentaire)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rediriger si pas admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Rendre les enfants seulement si admin
  return <>{children}</>;
}
