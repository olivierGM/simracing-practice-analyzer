/**
 * Service de traitement des données de sessions
 * 
 * Réplique EXACTEMENT la logique de script-public.js:processSessionData()
 * pour transformer les sessions Firestore en données de pilotes
 */

/**
 * Traite les sessions brutes pour générer les statistiques par pilote
 * 
 * @param {Array} sessions - Sessions depuis Firestore
 * @returns {Object} Données traitées { overall, byCategory, byDriver }
 */
export function processSessionData(sessions) {
    const result = {
        overall: { bestValidTime: 0, averageValidTime: 0, bestOverallTime: 0, averageOverallTime: 0, totalLaps: 0, validLaps: 0 },
        byCategory: {},
        byDriver: {}
    };
    
    // Trier les sessions par date (plus récente en premier) pour utiliser la catégorie la plus récente
    const sortedSessions = [...sessions].sort((a, b) => {
        const dateA = a.Date ? new Date(a.Date).getTime() : 0;
        const dateB = b.Date ? new Date(b.Date).getTime() : 0;
        return dateB - dateA; // Plus récent en premier
    });
    
    sortedSessions.forEach(session => {
        if (session.laps && session.sessionResult && session.sessionResult.leaderBoardLines) {
            // Préserver le fileName pour la modal pilote
            const sessionFileName = session.fileName || session.SessionFile || 'Unknown';
            const sessionDate = session.Date ? new Date(session.Date) : null;
            
            // Créer un mapping carId -> pilote
            const driverMap = {};
            session.sessionResult.leaderBoardLines.forEach(line => {
                const car = line.car;
                const driver = car.drivers[0];
                driverMap[car.carId] = {
                    firstName: driver.firstName,
                    lastName: driver.lastName,
                    cupCategory: car.cupCategory,
                    carModel: car.carModel,
                    teamName: (car.teamName && String(car.teamName).trim()) || '',
                    sessionDate: sessionDate // Stocker la date de session
                };
            });
            
            // Détecter si la session est wet (peut être true/false ou 1/0)
            const isWetSession = session.sessionResult?.isWetSession === true || 
                                session.sessionResult?.isWetSession === 1 || 
                                session.sessionResult?.isWetSession === "1" ||
                                session.isWetSession === true || 
                                session.isWetSession === 1 || 
                                session.isWetSession === "1";
            
            session.laps.forEach(lap => {
                const driverInfo = driverMap[lap.carId];
                if (driverInfo) {
                    // ID sans cupCategory pour regrouper toutes les sessions d'un même pilote
                    const driverId = `${driverInfo.firstName}_${driverInfo.lastName}`;
                    
                    // Initialiser le pilote
                    if (!result.byDriver[driverId]) {
                        result.byDriver[driverId] = {
                            firstName: driverInfo.firstName,
                            lastName: driverInfo.lastName,
                            cupCategory: driverInfo.cupCategory, // Catégorie de la session la plus récente (car trié)
                            categoriesSeen: new Set([driverInfo.cupCategory]), // Pour détecter PRO+AMATEUR
                            carModel: driverInfo.carModel,
                            teamName: driverInfo.teamName || '',
                            bestValidTime: 0,
                            averageValidTime: 0,
                            bestOverallTime: 0,
                            averageOverallTime: 0,
                            bestWetTime: 0,
                            averageWetTime: 0,
                            totalLaps: 0,
                            validLaps: 0,
                            wetLaps: 0,
                            totalTime: 0,
                            validTime: 0,
                            wetTime: 0,
                            // Tableaux de temps pour le calcul de consistance
                            validLapTimes: [],
                            wetLapTimes: [],
                            allLapTimes: [],
                            lapTimes: [],
                            // Stocker la date de la session la plus récente pour ce pilote
                            mostRecentSessionDate: driverInfo.sessionDate
                        };
                    } else {
                        // Mettre à jour le carModel si le pilote change de voiture
                        // (Pour les saisons, c'est une auto par saison, donc on utilise le carModel le plus récent)
                        result.byDriver[driverId].carModel = driverInfo.carModel;
                        if (driverInfo.teamName) {
                            result.byDriver[driverId].teamName = driverInfo.teamName;
                        }
                        result.byDriver[driverId].categoriesSeen.add(driverInfo.cupCategory);
                        
                        // Mettre à jour la catégorie si cette session est plus récente
                        if (driverInfo.sessionDate && 
                            (!result.byDriver[driverId].mostRecentSessionDate || 
                             driverInfo.sessionDate > result.byDriver[driverId].mostRecentSessionDate)) {
                            result.byDriver[driverId].cupCategory = driverInfo.cupCategory;
                            result.byDriver[driverId].mostRecentSessionDate = driverInfo.sessionDate;
                        }
                    }
                    
                    // Utiliser isWetSession pour déterminer si le tour est wet
                    const isWet = isWetSession;
                    
                    // Ajouter le tour à la liste avec les segments
                    result.byDriver[driverId].lapTimes.push({
                        time: lap.laptime,
                        isValid: lap.isValidForBest,
                        isWet: isWet,
                        splits: lap.splits || [], // Ajouter les segments
                        sessionDate: sessionFileName // Ajouter la date de session
                    });
                    
                    // Mettre à jour les statistiques
                    result.byDriver[driverId].totalLaps++;
                    result.byDriver[driverId].totalTime += lap.laptime;
                    result.byDriver[driverId].allLapTimes.push(lap.laptime);
                    
                    if (isWet) {
                        result.byDriver[driverId].wetLaps++;
                        result.byDriver[driverId].wetTime += lap.laptime;
                        result.byDriver[driverId].wetLapTimes.push(lap.laptime);
                        
                        if (result.byDriver[driverId].bestWetTime === 0 || lap.laptime < result.byDriver[driverId].bestWetTime) {
                            result.byDriver[driverId].bestWetTime = lap.laptime;
                        }
                    }
                    
                    if (lap.isValidForBest) {
                        result.byDriver[driverId].validLaps++;
                        result.byDriver[driverId].validTime += lap.laptime;
                        result.byDriver[driverId].validLapTimes.push(lap.laptime);
                        
                        if (result.byDriver[driverId].bestValidTime === 0 || lap.laptime < result.byDriver[driverId].bestValidTime) {
                            result.byDriver[driverId].bestValidTime = lap.laptime;
                        }
                    }
                    
                    if (result.byDriver[driverId].bestOverallTime === 0 || lap.laptime < result.byDriver[driverId].bestOverallTime) {
                        result.byDriver[driverId].bestOverallTime = lap.laptime;
                    }
                }
            });
            
            // Ajouter le fileName à la session pour la modal pilote
            session.fileName = sessionFileName;
        }
    });
    
    // Si un pilote a des sessions en PRO (0) et en AMATEUR (2), afficher en AMATEUR (tous les laps fusionnés)
    const PRO = 0, AMATEUR = 2;
    Object.values(result.byDriver).forEach(driver => {
        if (driver.categoriesSeen && driver.categoriesSeen.has(PRO) && driver.categoriesSeen.has(AMATEUR)) {
            driver.cupCategory = AMATEUR;
        }
        delete driver.categoriesSeen;
    });
    
    // Calculer les moyennes
    Object.values(result.byDriver).forEach(driver => {
        if (driver.totalLaps > 0) {
            driver.averageOverallTime = driver.totalTime / driver.totalLaps;
        }
        if (driver.validLaps > 0) {
            driver.averageValidTime = driver.validTime / driver.validLaps;
        }
        if (driver.wetLaps > 0) {
            driver.averageWetTime = driver.wetTime / driver.wetLaps;
        }
    });
    
    // Calculer les statistiques globales
    const allDrivers = Object.values(result.byDriver);
    if (allDrivers.length > 0) {
        result.overall.bestValidTime = Math.min(...allDrivers.map(d => d.bestValidTime || Infinity));
        result.overall.bestOverallTime = Math.min(...allDrivers.map(d => d.bestOverallTime || Infinity));
        result.overall.totalLaps = allDrivers.reduce((sum, d) => sum + d.totalLaps, 0);
        result.overall.validLaps = allDrivers.reduce((sum, d) => sum + d.validLaps, 0);
        result.overall.wetLaps = allDrivers.reduce((sum, d) => sum + (d.wetLaps || 0), 0);
        
        // Calculer les moyennes globales
        if (result.overall.validLaps > 0) {
            result.overall.averageValidTime = allDrivers.reduce((sum, d) => sum + d.validTime, 0) / result.overall.validLaps;
        }
        if (result.overall.totalLaps > 0) {
            result.overall.averageOverallTime = allDrivers.reduce((sum, d) => sum + d.totalTime, 0) / result.overall.totalLaps;
        }
    }
    
    // Calculer les statistiques globales des segments
    result.globalSegmentStats = calculateGlobalSegmentStats(result);
    
    return result;
}

/**
 * Calcule les statistiques globales des segments
 * 
 * @param {Object} result - Résultat du traitement des sessions
 * @returns {Object} Statistiques par segment
 */
function calculateGlobalSegmentStats(result) {
    const segmentStats = {};
    
    // Parcourir tous les pilotes
    Object.values(result.byDriver).forEach(driver => {
        driver.lapTimes.forEach(lap => {
            if (lap.splits && lap.splits.length > 0) {
                lap.splits.forEach((split, index) => {
                    if (!segmentStats[index]) {
                        segmentStats[index] = {
                            bestTime: Infinity,
                            times: []
                        };
                    }
                    
                    segmentStats[index].times.push(split);
                    if (split < segmentStats[index].bestTime) {
                        segmentStats[index].bestTime = split;
                    }
                });
            }
        });
    });
    
    // Calculer les moyennes
    Object.keys(segmentStats).forEach(index => {
        const times = segmentStats[index].times;
        if (times.length > 0) {
            segmentStats[index].averageTime = times.reduce((sum, t) => sum + t, 0) / times.length;
        }
    });
    
    return segmentStats;
}

