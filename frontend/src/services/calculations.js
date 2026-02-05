/**
 * Service de calculs pour les statistiques de pilotes
 * 
 * Réplique EXACTEMENT les fonctions de script-public.js pour la parité complète
 */

/**
 * Calcule la consistance d'un pilote (COPIE EXACTE de script-public.js ligne 1263)
 * 
 * @param {Array} lapTimes - Temps de tours
 * @param {number} bestTime - Meilleur temps
 * @param {number} averageTime - Temps moyen
 * @returns {number} Consistance en % (0-100)
 */
export function calculateConsistency(lapTimes, bestTime, averageTime) {
    if (!lapTimes || lapTimes.length === 0 || !bestTime || !averageTime || averageTime === 0) {
        return 0;
    }
    
    // Calculer l'écart type
    const variance = lapTimes.reduce((sum, time) => {
        const diff = time - averageTime;
        return sum + (diff * diff);
    }, 0) / lapTimes.length;
    
    const standardDeviation = Math.sqrt(variance);
    
    // Calculer le coefficient de variation (écart type / moyenne)
    const coefficientOfVariation = standardDeviation / averageTime;
    
    // Consistance = (1 - coefficient_de_variation) * 100
    // Mais on ajuste pour avoir des résultats plus réalistes
    const consistency = Math.max(0, Math.min(100, (1 - coefficientOfVariation * 2) * 100));
    
    return Math.round(consistency * 100) / 100; // Arrondir à 2 décimales
}

/**
 * Retourne le nom de la catégorie (COPIE EXACTE de script-public.js ligne 1286)
 * 
 * @param {number} category - Numéro de catégorie (0, 2, 3)
 * @returns {string} Nom de la catégorie
 */
export function getCategoryName(category) {
    switch (category) {
        case 0: return 'PRO';
        case 2: return 'AMATEUR';
        case 3: return 'SILVER';
        default: return `Catégorie ${category}`;
    }
}

/**
 * Retourne la classe CSS pour la catégorie
 * 
 * @param {number} category - Numéro de catégorie (0, 2, 3)
 * @returns {string} Classe CSS pour le badge
 */
export function getCategoryClass(category) {
    switch (category) {
        case 0: return 'pro';
        case 2: return 'amateur';
        case 3: return 'silver';
        default: return 'default';
    }
}

/**
 * Calcule le gap entre le pilote et le leader
 * 
 * @param {number} driverTime - Temps du pilote (ms)
 * @param {number} leaderTime - Temps du leader (ms)
 * @returns {string|null} Gap formaté en secondes
 */
export function calculateGap(driverTime, leaderTime) {
  if (!driverTime || !leaderTime) return null;
  return ((driverTime - leaderTime) / 1000).toFixed(3);
}

/**
 * Trouve les meilleurs temps de segments globaux parmi tous les pilotes (tours valides uniquement).
 *
 * @param {Array} allDrivers - Tous les pilotes
 * @returns {Array} Meilleurs temps par segment
 */
export function findGlobalBestSegments(allDrivers) {
  if (!allDrivers || allDrivers.length === 0) return [];
  
  const segmentBests = [];
  
  allDrivers.forEach(driver => {
    if (driver.lapTimes) {
      driver.lapTimes.forEach(lap => {
        if (lap.isValid && lap.splits && lap.splits.length > 0) {
          lap.splits.forEach((split, index) => {
            if (!segmentBests[index] || split < segmentBests[index]) {
              segmentBests[index] = split;
            }
          });
        }
      });
    }
  });
  
  return segmentBests;
}

/**
 * Calcule les statistiques de segments pour un pilote
 * Retourne: { bestS1, bestS2, bestS3, avgS1, avgS2, avgS3 }
 */
export function calculatePilotSegmentStats(driver) {
  const allS1 = [];
  const allS2 = [];
  const allS3 = [];
  
  if (!driver.lapTimes) return null;
  
  let lapsWithSplits = 0;
  let lapsWithoutSplits = 0;
  
  // Pour le temps potentiel, on ne prend que les meilleurs segments des tours VALIDES
  // (exclure les segments des tours invalides, ex. passage dans une chicane)
  driver.lapTimes.forEach(lap => {
    if (lap.isValid && lap.splits && lap.splits.length >= 3) {
      lapsWithSplits++;
      const s1 = lap.splits[0];
      const s2 = lap.splits[1];
      const s3 = lap.splits[2];
      
      // Valider que les segments sont des nombres valides (> 0)
      if (s1 && s1 > 0) allS1.push(s1);
      if (s2 && s2 > 0) allS2.push(s2);
      if (s3 && s3 > 0) allS3.push(s3);
    } else {
      lapsWithoutSplits++;
    }
  });
  
  if (allS1.length === 0 || allS2.length === 0 || allS3.length === 0) {
    console.warn(`⚠️ calculatePilotSegmentStats: Pas assez de segments pour ${driver.name || 'pilote inconnu'}. Laps avec splits: ${lapsWithSplits}, Laps sans splits: ${lapsWithoutSplits}, S1: ${allS1.length}, S2: ${allS2.length}, S3: ${allS3.length}`);
    return null;
  }
  
  const result = {
    bestS1: Math.min(...allS1),
    bestS2: Math.min(...allS2),
    bestS3: Math.min(...allS3),
    avgS1: allS1.reduce((sum, t) => sum + t, 0) / allS1.length,
    avgS2: allS2.reduce((sum, t) => sum + t, 0) / allS2.length,
    avgS3: allS3.reduce((sum, t) => sum + t, 0) / allS3.length,
  };
  
  return result;
}

/**
 * Calcule les statistiques de segments globales et par classe
 * COPIE de calculateSegmentStats() ligne 1714 de script-public.js
 */
export function calculateGlobalSegmentStats(drivers) {
  const stats = {
    global: { allS1: [], allS2: [], allS3: [] },
    byCategory: {}
  };
  
  // Collecter tous les segments
  drivers.forEach(driver => {
    const category = driver.category;
    
    if (!stats.byCategory[category]) {
      stats.byCategory[category] = { allS1: [], allS2: [], allS3: [] };
    }
    
    if (driver.lapTimes) {
      driver.lapTimes.forEach(lap => {
        if (lap.splits && lap.splits.length >= 3 && lap.isValid) {
          // Global
          stats.global.allS1.push(lap.splits[0]);
          stats.global.allS2.push(lap.splits[1]);
          stats.global.allS3.push(lap.splits[2]);
          
          // Par catégorie
          stats.byCategory[category].allS1.push(lap.splits[0]);
          stats.byCategory[category].allS2.push(lap.splits[1]);
          stats.byCategory[category].allS3.push(lap.splits[2]);
        }
      });
    }
  });
  
  // Calculer best et avg pour global
  const globalStats = stats.global;
  if (globalStats.allS1.length > 0) {
    globalStats.bestS1 = Math.min(...globalStats.allS1);
    globalStats.avgS1 = globalStats.allS1.reduce((sum, t) => sum + t, 0) / globalStats.allS1.length;
  }
  if (globalStats.allS2.length > 0) {
    globalStats.bestS2 = Math.min(...globalStats.allS2);
    globalStats.avgS2 = globalStats.allS2.reduce((sum, t) => sum + t, 0) / globalStats.allS2.length;
  }
  if (globalStats.allS3.length > 0) {
    globalStats.bestS3 = Math.min(...globalStats.allS3);
    globalStats.avgS3 = globalStats.allS3.reduce((sum, t) => sum + t, 0) / globalStats.allS3.length;
  }
  
  // Calculer best et avg pour chaque catégorie
  Object.keys(stats.byCategory).forEach(category => {
    const catStats = stats.byCategory[category];
    
    if (catStats.allS1.length > 0) {
      catStats.bestS1 = Math.min(...catStats.allS1);
      catStats.avgS1 = catStats.allS1.reduce((sum, t) => sum + t, 0) / catStats.allS1.length;
    }
    if (catStats.allS2.length > 0) {
      catStats.bestS2 = Math.min(...catStats.allS2);
      catStats.avgS2 = catStats.allS2.reduce((sum, t) => sum + t, 0) / catStats.allS2.length;
    }
    if (catStats.allS3.length > 0) {
      catStats.bestS3 = Math.min(...catStats.allS3);
      catStats.avgS3 = catStats.allS3.reduce((sum, t) => sum + t, 0) / catStats.allS3.length;
    }
  });
  
  return stats;
}
