import { useState, useEffect } from 'react';

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
    
    // Rafraîchir toutes les minutes
    const interval = setInterval(fetchServers, 60000);
    
    return () => clearInterval(interval);
  }, [trackName]);

  return { servers, loading, error };
}

/**
 * Mappe les noms de circuits internes vers les noms utilisés par l'API ACC
 * @param {string} trackName - Nom du circuit interne
 * @returns {string} - Nom du circuit pour l'API ACC
 */
function getACCTrackName(trackName) {
  const trackMap = {
    'valencia': 'valencia',
    'nurburgring': 'nurburgring',
    'donington': 'donington',
    'red_bull_ring': 'red_bull_ring',
    'misano': 'misano',
    'snetterton': 'snetterton',
    'monza': 'monza',
    'zandvoort': 'zandvoort',
    // Ajouter d'autres mappings si nécessaire
  };

  return trackMap[trackName] || trackName;
}

