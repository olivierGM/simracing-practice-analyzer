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

export function useFilters(drivers = []) {
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
  
  // Initialiser trackFilter avec la première piste quand les pistes sont chargées
  // (COPIE de updateSessionSelect() dans script-public.js ligne 1556)
  useEffect(() => {
    if (availableTracks.length > 0 && !trackFilter) {
      // Sélectionner automatiquement la première piste (ordre alphabétique)
      setTrackFilter(availableTracks[0]);
    }
  }, [availableTracks, trackFilter]);

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

