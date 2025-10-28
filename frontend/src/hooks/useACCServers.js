import { useState, useEffect } from 'react';
import { getACCTrackName } from '../utils/constants';

// Mock data pour développement local
const MOCK_SERVERS = [
  {
    name: "Apex Killers #1 | Mi",
    drivers: 10,
    max_drivers: 10,
    sessions: [
      { type: "Qualifying", time: 8, elapsed_time: 10, active: false },
      { type: "Race", time: 13, elapsed_time: 15, active: true }
    ]
  },
  {
    name: "#9B VooDoo Sim Racin",
    drivers: 3,
    max_drivers: 10,
    sessions: [
      { type: "Qualifying", time: 0, elapsed_time: 10, active: false },
      { type: "Race", time: 20, elapsed_time: 30, active: true }
    ]
  }
];

const USE_MOCK = false; // Mode production: utiliser la vraie API Firebase

/**
 * Hook pour récupérer les serveurs ACC actifs pour un circuit donné
 * @param {string} trackName - Nom du circuit (ex: 'misano')
 * @returns {Object} - { servers, loading, error }
 */
export function useACCServers(trackName) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trackName) {
      setServers([]);
      return;
    }

    const fetchServers = async () => {
      setLoading(true);
      setError(null);

      // Mode mock pour développement
      if (USE_MOCK) {
        setTimeout(() => {
          setServers(MOCK_SERVERS);
          setLoading(false);
        }, 500);
        return;
      }

      try {
        // Mapper le nom du circuit vers le nom utilisé par l'API ACC
        const accTrackName = getACCTrackName(trackName);
        
        // Utiliser la fonction Firebase pour contourner CORS
        const url = `https://us-central1-simracing-practice-analyzer.cloudfunctions.net/getACCServers?track=${accTrackName}&limit=3`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch servers: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch servers');
        }
        
        setServers(data.servers || []);
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des serveurs ACC:', err);
        setError(err.message);
        setServers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
    
    if (!USE_MOCK) {
      // Rafraîchir toutes les 2 minutes (au lieu de 1 minute pour réduire les reloads)
      const interval = setInterval(fetchServers, 120000);
      return () => clearInterval(interval);
    }
  }, [trackName]);

  return { servers, loading, error };
}

