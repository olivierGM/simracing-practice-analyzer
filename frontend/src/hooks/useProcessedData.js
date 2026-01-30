/**
 * Hook pour retraiter les sessions selon la piste sélectionnée
 * 
 * COPIE la logique de la prod : filtrer les sessions par piste AVANT de les traiter
 */

import { useMemo } from 'react';
import { processSessionData } from '../services/dataProcessor';
import { calculateConsistency, calculatePilotSegmentStats } from '../services/calculations';
import { getTeamNameFallback } from '../services/driverTeamFallback';

export function useProcessedData(sessions = [], selectedTrack = '') {
  // Filtrer les sessions pour la piste sélectionnée (comme en prod)
  const filteredSessions = useMemo(() => {
    if (!selectedTrack || !sessions || sessions.length === 0) return [];
    
    return sessions.filter(session => session.trackName === selectedTrack);
  }, [sessions, selectedTrack]);
  
  // Trouver la date de la session la plus récente
  const mostRecentSessionDate = useMemo(() => {
    if (filteredSessions.length === 0) return null;
    
    const dates = filteredSessions
      .map(s => s.Date ? new Date(s.Date) : null)
      .filter(d => d !== null);
    
    if (dates.length === 0) return null;
    
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }, [filteredSessions]);
  
  // Traiter les sessions filtrées
  const drivers = useMemo(() => {
    if (filteredSessions.length === 0) return [];
    
    console.log(`📊 Retraitement pour piste "${selectedTrack}": ${filteredSessions.length} sessions`);
    
    const processedData = processSessionData(filteredSessions);
    
    // Transformer en array de pilotes ET TRIER par bestValidTime (COPIE de la prod ligne 959)
    const driversArray = Object.entries(processedData.byDriver)
      .map(([id, driver]) => ({
      id,
      name: `${driver.firstName} ${driver.lastName}`,
      firstName: driver.firstName,
      lastName: driver.lastName,
      category: driver.cupCategory,
      carModel: driver.carModel,
      teamName: (driver.teamName && String(driver.teamName).trim()) || getTeamNameFallback(`${driver.firstName} ${driver.lastName}`) || '',
      
      // Statistiques valides
      bestValidTime: driver.bestValidTime,
      bestPotentialTime: (() => {
        const seg = calculatePilotSegmentStats({ ...driver, lapTimes: driver.lapTimes });
        if (seg && seg.bestS1 != null && seg.bestS2 != null && seg.bestS3 != null) {
          return seg.bestS1 + seg.bestS2 + seg.bestS3;
        }
        return driver.bestValidTime || 0;
      })(),
      averageValidTime: driver.averageValidTime,
      validConsistency: calculateConsistency(driver.validLapTimes || [], driver.bestValidTime, driver.averageValidTime),
      validLaps: driver.validLaps,
      
      // Statistiques wet
      bestWetTime: driver.bestWetTime,
      averageWetTime: driver.averageWetTime,
      wetConsistency: calculateConsistency(driver.wetLapTimes || [], driver.bestWetTime, driver.averageWetTime),
      wetLaps: driver.wetLaps,
      
      // Statistiques totales
      bestOverallTime: driver.bestOverallTime,
      averageOverallTime: driver.averageOverallTime,
      totalConsistency: calculateConsistency(driver.allLapTimes || [], driver.bestOverallTime, driver.averageOverallTime),
      totalLaps: driver.totalLaps,
      
      // Données pour la modal pilote
      lapTimes: driver.lapTimes,
      validLapTimes: driver.validLapTimes,
      wetLapTimes: driver.wetLapTimes,
      allLapTimes: driver.allLapTimes,
      track: selectedTrack,
      
      // Calculer la date de la dernière session (pour filtre période)
      // Utiliser la date de session la plus récente de la piste
      lastSession: mostRecentSessionDate
    }))
      // Trier par meilleur temps valide (COPIE EXACTE de la prod ligne 959-974)
      .sort((a, b) => {
        const timeA = a.bestValidTime || 0;
        const timeB = b.bestValidTime || 0;
        
        // Si les deux temps sont à 0, garder l'ordre original
        if (timeA === 0 && timeB === 0) return 0;
        
        // Si seul A est à 0, A va en dernier
        if (timeA === 0) return 1;
        
        // Si seul B est à 0, B va en dernier
        if (timeB === 0) return -1;
        
        // Sinon, trier normalement par temps
        return timeA - timeB;
      });
    
    console.log(`👥 ${driversArray.length} pilotes trouvés pour ${selectedTrack}`);
    
    return driversArray;
  }, [filteredSessions, selectedTrack]);
  
  return drivers;
}

