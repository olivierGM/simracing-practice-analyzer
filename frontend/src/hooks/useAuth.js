/**
 * Hook pour gérer l'authentification admin
 * 
 * Gère :
 * - État de connexion
 * - Login/Logout
 * - Observer Firebase Auth
 */

import { useState, useEffect } from 'react';
import { onAuthChanged, loginAdmin, logoutAdmin } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // S'abonner aux changements d'état d'authentification
    const unsubscribe = onAuthChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  /**
   * Login avec email/password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      await loginAdmin(email, password);
      // L'état user sera mis à jour par onAuthChanged
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await logoutAdmin();
      // L'état user sera mis à jour par onAuthChanged
      
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout
  };
}

