/**
 * Hook pour retraiter les sessions selon la piste sélectionnée
 * 
 * COPIE la logique de la prod : filtrer les sessions par piste AVANT de les traiter
 */

import { useMemo } from 'react';
import { processSessionData } from '../services/dataProcessor';
import { calculateConsistency } from '../services/calculations';

export function useProcessedData(sessions = [], selectedTrack = '') {
  // Filtrer les sessions pour la piste sélectionnée (comme en prod)
  const filteredSessions = useMemo(() => {
    if (!selectedTrack || !sessions || sessions.length === 0) return [];
    
    return sessions.filter(session => session.trackName === selectedTrack);
  }, [sessions, selectedTrack]);
  
  // Traiter les sessions filtrées
  const drivers = useMemo(() => {
    if (filteredSessions.length === 0) return [];
    
    console.log(`📊 Retraitement pour piste "${selectedTrack}": ${filteredSessions.length} sessions`);
    
    const processedData = processSessionData(filteredSessions);
    
    // Transformer en array de pilotes (même logique que useFirebaseData)
    const driversArray = Object.entries(processedData.byDriver).map(([id, driver]) => ({
      id,
      name: `${driver.firstName} ${driver.lastName}`,
      firstName: driver.firstName,
      lastName: driver.lastName,
      category: driver.cupCategory,
      carModel: driver.carModel,
      
      // Statistiques valides
      bestValidTime: driver.bestValidTime,
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
      track: selectedTrack
    }));
    
    console.log(`👥 ${driversArray.length} pilotes trouvés pour ${selectedTrack}`);
    
    return driversArray;
  }, [filteredSessions, selectedTrack]);
  
  return drivers;
}

