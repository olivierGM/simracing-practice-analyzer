/**
 * Hook pour charger les données depuis Firebase
 * 
 * Charge les résultats (Storage) et métadonnées (Firestore)
 * Gère les états loading/error
 */

import { useState, useEffect } from 'react';
import { fetchResults, fetchMetadata } from '../services/firebase';

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
        
        // Charger en parallèle les résultats et métadonnées
        const [resultsData, metaData] = await Promise.all([
          fetchResults(),
          fetchMetadata()
        ]);
        
        setData(resultsData);
        setMetadata(metaData);
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
      const [resultsData, metaData] = await Promise.all([
        fetchResults(),
        fetchMetadata()
      ]);
      
      setData(resultsData);
      setMetadata(metaData);
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

