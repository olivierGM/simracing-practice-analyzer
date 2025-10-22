/**
 * Hook pour charger les données depuis Firebase
 * 
 * Charge les résultats (Storage) et métadonnées (Firestore)
 * Gère les états loading/error
 * 
 * MODE DEV: Utilise des données mock pour le développement
 */

import { useState, useEffect } from 'react';
import { fetchResults, fetchMetadata } from '../services/firebase';
import { mockDriversData, mockMetadata } from '../data/mockData';

// Mode développement : utiliser mock data
const USE_MOCK_DATA = true; // 🎭 Mock data en dev, Firebase après déploiement

export function useFirebaseData() {
  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        if (USE_MOCK_DATA) {
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 500));
          setData(mockDriversData);
          setMetadata(mockMetadata);
        } else {
          // Charger en parallèle les résultats et métadonnées depuis Firebase
          const [resultsData, metaData] = await Promise.all([
            fetchResults(),
            fetchMetadata()
          ]);
          
          setData(resultsData);
          setMetadata(metaData);
        }
      } catch (err) {
        console.error('Error loading Firebase data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []); // Charger une seule fois au montage

  /**
   * Fonction pour recharger manuellement les données
   */
  const reload = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(mockDriversData);
        setMetadata(mockMetadata);
      } else {
        const [resultsData, metaData] = await Promise.all([
          fetchResults(),
          fetchMetadata()
        ]);
        
        setData(resultsData);
        setMetadata(metaData);
      }
    } catch (err) {
      console.error('Error reloading data:', err);
      setError(err.message || 'Failed to reload data');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    metadata,
    loading,
    error,
    reload
  };
}

