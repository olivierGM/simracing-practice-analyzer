/**
 * Hook pour gérer les filtres de l'application
 * 
 * Gère :
 * - Filtre par période (day/week/all)
 * - Filtre par piste
 * - Groupement par classe
 * 
 * Retourne les pilotes filtrés avec memoization
 */

import { useState, useMemo, useEffect } from 'react';
import { DURATIONS } from '../utils/constants';

export function useFilters(drivers = [], sessions = []) {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('');
  const [groupByClass, setGroupByClass] = useState(false);

  // Extraction des pistes uniques disponibles
  const availableTracks = useMemo(() => {
    const tracks = new Set();
    
    drivers.forEach(driver => {
      if (driver.track) {
        tracks.add(driver.track);
      }
    });
    
    return Array.from(tracks).sort();
  }, [drivers]);
  
  // Trouver la piste avec la session la plus récente (COPIE de getMostRecentTrack() ligne 1506)
  const mostRecentTrack = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;
    
    let mostRecentTrack = null;
    let mostRecentDate = new Date(0); // Date très ancienne
    
    sessions.forEach(session => {
      if (session.Date && session.trackName) {
        const sessionDate = new Date(session.Date);
        if (sessionDate > mostRecentDate) {
          mostRecentDate = sessionDate;
          mostRecentTrack = session.trackName;
        }
      }
    });
    
    return mostRecentTrack;
  }, [sessions]);
  
  // Initialiser trackFilter avec la piste la plus récente (COPIE de updateSessionSelect() ligne 1570)
  useEffect(() => {
    if (availableTracks.length > 0 && !trackFilter) {
      // Sélectionner automatiquement la piste avec la session la plus récente
      const defaultTrack = mostRecentTrack && availableTracks.includes(mostRecentTrack)
        ? mostRecentTrack
        : availableTracks[0]; // Fallback sur la première si pas trouvée
      
      console.log(`🏁 Piste sélectionnée automatiquement: ${defaultTrack}`);
      setTrackFilter(defaultTrack);
    }
  }, [availableTracks, trackFilter, mostRecentTrack]);

  // PROBLÈME: Les pilotes sont déjà regroupés toutes pistes confondues
  // Il faut retraiter les sessions pour la piste sélectionnée uniquement
  // TODO: Implémenter le retraitement par piste
  
  // Application des filtres avec memoization
  const filteredDrivers = useMemo(() => {
    if (!drivers || drivers.length === 0) return [];
    
    let result = [...drivers];

    // Filtre par période
    if (periodFilter === 'day') {
      const oneDayAgo = Date.now() - DURATIONS.ONE_DAY;
      result = result.filter(d => {
        const lastSession = d.lastSession ? new Date(d.lastSession).getTime() : 0;
        return lastSession > oneDayAgo;
      });
    } else if (periodFilter === 'week') {
      const oneWeekAgo = Date.now() - DURATIONS.ONE_WEEK;
      result = result.filter(d => {
        const lastSession = d.lastSession ? new Date(d.lastSession).getTime() : 0;
        return lastSession > oneWeekAgo;
      });
    }
    // 'all' = pas de filtre sur la période

    // Filtre par piste (toujours filtrer, pas d'option "all")
    if (trackFilter) {
      result = result.filter(d => d.track === trackFilter);
    }

    return result;
  }, [drivers, periodFilter, trackFilter]);

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = () => {
    setPeriodFilter('all');
    setTrackFilter('all');
    setGroupByClass(false);
  };

  return {
    // États
    periodFilter,
    trackFilter,
    groupByClass,
    
    // Setters
    setPeriodFilter,
    setTrackFilter,
    setGroupByClass,
    
    // Données calculées
    availableTracks,
    filteredDrivers,
    
    // Actions
    resetFilters
  };
}

