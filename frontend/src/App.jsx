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
import { useFirebaseData } from './hooks/useFirebaseData';
import './App.css';

function App() {
  const { data, metadata, sessions, loading, error } = useFirebaseData();

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
      <div className="app">
        <Header metadata={metadata} />
        
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

export default App;
