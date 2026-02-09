/**
 * Contexte d'authentification global
 * Fournit user, login, signUp, logout à toute l'app
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';
import { useAuthState } from '../hooks/useAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = useAuthState();
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
