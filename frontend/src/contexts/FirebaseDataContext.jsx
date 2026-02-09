/**
 * Contexte des données Firebase (sessions, drivers, metadata)
 * Fourni par FirebaseDataGate pour les routes protégées
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

const FirebaseDataContext = createContext(null);

export function FirebaseDataProvider({ value, children }) {
  return (
    <FirebaseDataContext.Provider value={value}>
      {children}
    </FirebaseDataContext.Provider>
  );
}

export function useFirebaseDataContext() {
  const ctx = useContext(FirebaseDataContext);
  if (!ctx) {
    throw new Error('useFirebaseDataContext must be used within FirebaseDataProvider');
  }
  return ctx;
}
