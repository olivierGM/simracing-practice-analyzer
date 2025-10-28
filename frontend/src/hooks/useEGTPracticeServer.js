import { useState, useEffect } from 'react';
import { getACCTrackName } from '../utils/constants';

/**
 * Hook pour récupérer le serveur de pratique EGT pour un circuit donné
 * @param {string} trackName - Nom du circuit (ex: 'misano')
 * @returns {Object} - { server, loading, error }
 */
export function useEGTPracticeServer(trackName) {
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trackName) {
      setServer(null);
      return;
    }

    const fetchServer = async () => {
      setLoading(true);
      setError(null);

      try {
        // Mapper le nom du circuit vers le nom utilisé par l'API ACC
        const accTrackName = getACCTrackName(trackName);
        
        // Utiliser la fonction Firebase pour contourner CORS
        const url = `https://us-central1-simracing-practice-analyzer.cloudfunctions.net/getEGTPracticeServer?track=${accTrackName}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch EGT server: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch EGT server');
        }
        
        setServer(data.server); // Peut être null si aucun serveur EGT trouvé
      } catch (err) {
        console.error('❌ Erreur lors de la récupération du serveur EGT:', err);
        setError(err.message);
        setServer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
    
    // Rafraîchir toutes les minutes
    const interval = setInterval(fetchServer, 60000);
    
    return () => clearInterval(interval);
  }, [trackName]);

  return { server, loading, error };
}

