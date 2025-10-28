/**
 * Composant App principal
 * 
 * Point d'entrée de l'application React avec routing
 */

import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { HomePage } from './pages/HomePage';
import { PilotePage } from './pages/PilotePage';
import { AdminPage } from './pages/AdminPage';
import { AnalyticsTracker } from './components/layout/AnalyticsTracker';
import { useFirebaseData } from './hooks/useFirebaseData';
import { TrackProvider, useTrackContext } from './contexts/TrackContext';
import './App.css';

function AppContent() {
  // ⚠️ IMPORTANT: Tous les hooks doivent être appelés AVANT tout return conditionnel
  const { data, metadata, sessions, loading, error } = useFirebaseData();
  const { trackFilter } = useTrackContext();

  // Extraire les pilotes des données
  const drivers = data?.drivers || [];

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
    <BrowserRouter>
      <AnalyticsTracker />
      <div className="app">
        <Header metadata={metadata} trackName={trackFilter} />
        
        <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage drivers={drivers} sessions={sessions} />} />
                  <Route path="/circuit/:circuitId/pilote/:pilotId" element={<PilotePage drivers={drivers} sessions={sessions} />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  const { data, metadata, sessions, loading, error } = useFirebaseData();
  const drivers = data?.drivers || [];

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
    <TrackProvider>
      <AppContent />
    </TrackProvider>
  );
}

export default App;
