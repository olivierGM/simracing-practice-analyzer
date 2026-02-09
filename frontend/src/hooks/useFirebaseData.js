/**
 * Hook pour charger les données depuis Firebase
 * 
 * Charge les résultats (Storage) et métadonnées (Firestore)
 * Gère les états loading/error
 * 
 * MODE DEV: Utilise des données mock pour le développement
 */

import { useState, useEffect } from 'react';
import { fetchSessions, fetchMetadata } from '../services/firebase';
import { processSessionData } from '../services/dataProcessor';
import { calculateConsistency } from '../services/calculations';
import { mockDriversData, mockMetadata } from '../data/mockData';

// Mode développement : utiliser mock data (désactivé = charger depuis Firebase)
const USE_MOCK_DATA = false;

export function useFirebaseData() {
  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [sessions, setSessions] = useState([]); // Pour trouver la piste la plus récente
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser mock data uniquement si USE_MOCK_DATA est true (pas de bypass)
        const useMockData = USE_MOCK_DATA;
        
        if (useMockData) {
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Créer des sessions mock avec laps pour que processSessionData produise des pilotes
          const trackName = 'Circuit Gilles-Villeneuve';
          const mockSessions = mockDriversData.drivers.map((driver, index) => {
            const carId = `car_${driver.id}`;
            const laptime = (driver.bestTime || 95432) + index * 500; // temps en ms
            return {
              Date: new Date(Date.now() - index * 86400000),
              trackName: driver.track || trackName,
              laps: [{
                carId,
                laptime,
                isValidForBest: true,
                splits: []
              }],
              sessionResult: {
                leaderBoardLines: [{
                  car: {
                    carId,
                    cupCategory: driver.carClass || 'GT3',
                    carModel: driver.carModel || 'Unknown',
                    drivers: [{
                      firstName: driver.name.split(' ')[0] || 'Unknown',
                      lastName: driver.name.split(' ').slice(1).join(' ') || 'Unknown'
                    }],
                    teamName: ''
                  }
                }]
              }
            };
          });
          
          setData(mockDriversData);
          setMetadata(mockMetadata);
          setSessions(mockSessions);
          setLoading(false);
          return; // Sortir de la fonction pour éviter de continuer avec Firebase
        }
        
        // Code Firebase (seulement si pas de mock)
        {
          // Charger les sessions depuis Firestore
          console.log('🔄 Chargement des sessions depuis Firestore...');
          
          // Timeout de 10 secondes pour éviter un blocage indéfini
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: Le chargement des données a pris trop de temps')), 10000)
          );
          
          const [sessions, _metaData] = await Promise.race([
            Promise.all([
              fetchSessions(),
              fetchMetadata()
            ]),
            timeoutPromise
          ]);
          
          console.log(`📊 ${sessions.length} sessions chargées depuis Firestore`);
          
          // Traiter les sessions pour générer les données de pilotes
          console.log('🔄 Traitement des données...');
          const processedData = processSessionData(sessions);
          
          console.log(`👥 ${Object.keys(processedData.byDriver).length} pilotes trouvés`);
          
          // Créer un mapping pilote -> piste(s) depuis les sessions
          // Utiliser le même ID sans cupCategory que dans processSessionData
          const driverTrackMap = {};
          sessions.forEach(session => {
            if (session.sessionResult && session.sessionResult.leaderBoardLines) {
              session.sessionResult.leaderBoardLines.forEach(line => {
                const driver = line.car.drivers[0];
                const driverId = `${driver.firstName}_${driver.lastName}`;
                
                if (!driverTrackMap[driverId]) {
                  driverTrackMap[driverId] = session.trackName;
                }
              });
            }
          });
          
          // Transformer en format attendu par l'app (avec "drivers" array)
          // IMPORTANT: Inclure TOUTES les colonnes de la prod (14 colonnes)
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
            track: driverTrackMap[id] || 'Unknown' // Piste du pilote (pas toutes les sessions)
          }));
          
          // Calculer lastUpdate depuis les sessions
          // Utiliser la date brute (UTC) sans offset pour "Il y a X min" - évite le bug DST Québec
          const mostRecentSessionDate = sessions.reduce((latest, session) => {
            if (session.Date) {
              const sessionDate = typeof session.Date?.toDate === 'function'
                ? session.Date.toDate()
                : new Date(session.Date);
              const ts = sessionDate.getTime();
              if (isNaN(ts)) return latest;
              return !latest || ts > latest.getTime() ? sessionDate : latest;
            }
            return latest;
          }, null);
          
          const calculatedMetadata = {
            lastUpdate: mostRecentSessionDate ? mostRecentSessionDate.getTime() : null,
            sessionCount: sessions.length
          };
          
          console.log('📅 Dernière session calculée:', calculatedMetadata.lastUpdate);
          
          setData({ drivers: driversArray });
          setMetadata(calculatedMetadata);
          setSessions(sessions); // Stocker les sessions pour trouver la plus récente
        }
      } catch (err) {
        console.error('❌ Error loading Firebase data:', err);
        console.error('❌ Error stack:', err.stack);
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
        // Charger les sessions depuis Firestore
        const [sessions, _metaData] = await Promise.all([
          fetchSessions(),
          fetchMetadata()
        ]);
        
        // Traiter les sessions
        const processedData = processSessionData(sessions);
        
        // Créer un mapping pilote -> piste(s) depuis les sessions
        const driverTrackMap = {};
        sessions.forEach(session => {
          if (session.sessionResult && session.sessionResult.leaderBoardLines) {
            session.sessionResult.leaderBoardLines.forEach(line => {
              const driver = line.car.drivers[0];
              const driverId = `${driver.firstName}_${driver.lastName}_${line.car.cupCategory}`;
              
              if (!driverTrackMap[driverId]) {
                driverTrackMap[driverId] = session.trackName;
              }
            });
          }
        });
        
        // Transformer en format attendu (même structure que loadData)
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
          track: driverTrackMap[id] || 'Unknown'
        }));
        
        // Calculer lastUpdate depuis les sessions (même logique que loadData)
        const mostRecentSessionDate = sessions.reduce((latest, session) => {
          if (session.Date) {
            const sessionDate = typeof session.Date?.toDate === 'function'
              ? session.Date.toDate()
              : new Date(session.Date);
            const ts = sessionDate.getTime();
            if (isNaN(ts)) return latest;
            return !latest || ts > latest.getTime() ? sessionDate : latest;
          }
          return latest;
        }, null);
        
        const calculatedMetadata = {
          lastUpdate: mostRecentSessionDate ? mostRecentSessionDate.getTime() : null,
          sessionCount: sessions.length
        };
        
        setData({ drivers: driversArray });
        setMetadata(calculatedMetadata);
        setSessions(sessions);
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
    sessions,
    loading,
    error,
    reload
  };
}

