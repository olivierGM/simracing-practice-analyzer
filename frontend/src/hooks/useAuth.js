/**
 * Hook pour gérer l'authentification (utilisateurs et admin)
 *
 * Gère : état de connexion, Login / SignUp / Logout, observer Firebase Auth.
 * Utilisé par AuthProvider ; les composants utilisent useAuth() depuis AuthContext.
 */

import { useState, useEffect } from 'react';
import { onAuthChanged, login as fbLogin, signUp as fbSignUp, loginWithGoogle as fbLoginWithGoogle, logout as fbLogout } from '../services/firebase';

/**
 * Hook interne contenant la logique d'auth (utilisé par AuthProvider).
 */
export function useAuthState() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      await fbLogin(email, password);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Connexion impossible');
      return false;
    }
  };

  const signUp = async (email, password) => {
    try {
      setError(null);
      await fbSignUp(email, password);
      return true;
    } catch (err) {
      console.error('SignUp error:', err);
      setError(err.message || 'Inscription impossible');
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await fbLoginWithGoogle();
      return true;
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Connexion Google impossible');
      return false;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await fbLogout();
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Déconnexion impossible');
      return false;
    }
  };

  const clearError = () => setError(null);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signUp,
    loginWithGoogle,
    logout,
    clearError
  };
}

