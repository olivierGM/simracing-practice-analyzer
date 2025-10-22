/**
 * Composant App principal
 * 
 * Point d'entrée de l'application React
 * Phase 2 : Test des composants de base
 */

import { useState } from 'react';
import { Header } from './components/layout/Header';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useFirebaseData } from './hooks/useFirebaseData';
import './App.css';

function App() {
  const { data, metadata, loading, error } = useFirebaseData();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handler pour le bouton login
  const handleLoginClick = () => {
    setShowLoginModal(true);
    console.log('Login modal à implémenter');
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
          <h2>Migration React - Phase 2</h2>
          <p>✅ Header avec LastUpdateIndicator</p>
          <p>✅ ThemeToggle fonctionnel</p>
          <p>✅ Firebase Data loading</p>
          
          {data && (
            <div className="data-preview">
              <h3>Aperçu des données chargées :</h3>
              <pre>{JSON.stringify(metadata, null, 2).slice(0, 500)}...</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
