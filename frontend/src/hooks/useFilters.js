/**
 * Hook pour gérer les filtres de l'application
 * 
 * Gère :
 * - Filtre par période (day/week/all)
 * - Filtre par circuit
 * - Groupement par classe
 * 
 * Retourne les pilotes filtrés avec memoization
 */

import { useState, useMemo, useEffect } from 'react';
import { DURATIONS } from '../utils/constants';
import { extractAvailableSeasons, addSeasonToSessions, filterSessionsBySeason } from '../services/seasonService';

export function useFilters(drivers = [], sessions = []) {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('');
  const [groupByClass, setGroupByClass] = useState(false);
  const [seasonFilter, setSeasonFilter] = useState(''); // Nouvelle state pour la saison

  // Ajouter le champ season à toutes les sessions
  const sessionsWithSeasons = useMemo(() => {
    return addSeasonToSessions(sessions);
  }, [sessions]);

  // Extraire les saisons disponibles
  const availableSeasons = useMemo(() => {
    return extractAvailableSeasons(sessions);
  }, [sessions]);

  // Sélectionner automatiquement la saison la plus élevée (la plus récente) UNE SEULE FOIS
  useEffect(() => {
    if (availableSeasons.length > 0 && !seasonFilter) {
      const mostRecentSeason = availableSeasons[0]; // Déjà trié par ordre décroissant
      setSeasonFilter(mostRecentSeason.toString());
    }
  }, [availableSeasons, seasonFilter]); // IMPORTANT: Inclure seasonFilter pour détecter quand il est vide

  // Filtrer les sessions par saison
  const filteredSessionsBySeason = useMemo(() => {
    if (seasonFilter === 'all' || !seasonFilter) {
      return sessionsWithSeasons;
    }
    return filterSessionsBySeason(sessionsWithSeasons, parseInt(seasonFilter));
  }, [sessionsWithSeasons, seasonFilter]);

  // Extraction des circuits uniques disponibles (DEPUIS LES SESSIONS FILTRÉES par saison!)
  const availableTracks = useMemo(() => {
    const tracks = new Set();
    
    filteredSessionsBySeason.forEach(session => {
      if (session.trackName) {
        tracks.add(session.trackName);
      }
    });
    
    return Array.from(tracks).sort();
  }, [filteredSessionsBySeason]);

  // Types de session présents dans les données (sessionType: FP, Q, R)
  const availableSessionTypes = useMemo(() => {
    const types = new Set();
    filteredSessionsBySeason.forEach(session => {
      const t = session.sessionType;
      if (t && typeof t === 'string') types.add(t.trim().toUpperCase());
    });
    return Array.from(types).sort();
  }, [filteredSessionsBySeason]);
  
  // Trouver le circuit avec la session la plus récente (depuis les sessions filtrées par saison)
  const mostRecentTrack = useMemo(() => {
    if (!filteredSessionsBySeason || filteredSessionsBySeason.length === 0) return null;
    
    let mostRecentTrack = null;
    let mostRecentDate = new Date(0); // Date très ancienne
    
    filteredSessionsBySeason.forEach(session => {
      if (session.Date && session.trackName) {
        const sessionDate = new Date(session.Date);
        if (sessionDate > mostRecentDate) {
          mostRecentDate = sessionDate;
          mostRecentTrack = session.trackName;
        }
      }
    });
    
    return mostRecentTrack;
  }, [filteredSessionsBySeason]);
  
  // Initialiser trackFilter avec le circuit le plus récent
  // IMPORTANT: Cet effet ne doit PAS se déclencher à chaque changement de saison
  // sinon ça cause un re-render qui réinitialise la saison
  useEffect(() => {
    if (availableTracks.length > 0 && !trackFilter) {
      // Sélectionner automatiquement seulement si aucun circuit n'est sélectionné
      const defaultTrack = mostRecentTrack && availableTracks.includes(mostRecentTrack)
        ? mostRecentTrack
        : availableTracks[0];
      
      console.log(`🏁 Circuit sélectionné automatiquement: ${defaultTrack}`);
      setTrackFilter(defaultTrack);
    }
  }, [availableTracks, mostRecentTrack, trackFilter]); // Ajouter trackFilter pour éviter de réinitialiser

  // PROBLÈME: Les pilotes sont déjà regroupés tous circuits confondus
  // Il faut retraiter les sessions pour le circuit sélectionné uniquement
  // TODO: Implémenter le retraitement par circuit
  
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
    } else if (periodFilter === 'custom' && customDateStart && customDateEnd) {
      const startMs = new Date(customDateStart).getTime();
      const endMs = new Date(customDateEnd).getTime();
      result = result.filter(d => {
        const lastSession = d.lastSession ? new Date(d.lastSession).getTime() : 0;
        return lastSession >= startMs && lastSession <= endMs;
      });
    }
    // 'all' ou custom sans dates = pas de filtre sur la période

    // Filtre par circuit (toujours filtrer, pas d'option "all")
    if (trackFilter) {
      result = result.filter(d => d.track === trackFilter);
    }

    return result;
  }, [drivers, periodFilter, trackFilter, customDateStart, customDateEnd]);

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = () => {
    setPeriodFilter('all');
    setCustomDateStart('');
    setCustomDateEnd('');
    setTrackFilter('all');
    setSessionTypeFilter('');
    setGroupByClass(false);
  };

  return {
    // États
    periodFilter,
    customDateStart,
    customDateEnd,
    trackFilter,
    sessionTypeFilter,
    groupByClass,
    seasonFilter,
    
    // Setters
    setPeriodFilter,
    setCustomDateStart,
    setCustomDateEnd,
    setTrackFilter,
    setSessionTypeFilter,
    setGroupByClass,
    setSeasonFilter,
    
    // Données calculées
    availableTracks,
    availableSeasons,
    availableSessionTypes,
    filteredDrivers,
    filteredSessionsBySeason, // Sessions filtrées par saison
    
    // Actions
    resetFilters
  };
}

