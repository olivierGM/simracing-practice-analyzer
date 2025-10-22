/**
 * Service de calculs de performance
 * 
 * Contient tous les algorithmes pour calculer :
 * - Potentiel (meilleur temps théorique)
 * - Constance (écart-type des temps)
 * - Comparaison de segments
 */

/**
 * Calcule le temps potentiel (somme des meilleurs segments)
 * 
 * @param {Object} segments - Objet contenant les temps de segments
 * @returns {number} Temps potentiel en millisecondes
 */
export function calculatePotential(segments) {
  return Object.keys(segments).reduce((sum, key) => {
    if (key.startsWith('S') && !key.includes('Best')) {
      return sum + segments[key];
    }
    return sum;
  }, 0);
}

/**
 * Calcule la constance (écart-type des temps de tours valides)
 * 
 * @param {Array} validLaps - Array des tours valides
 * @returns {number} Écart-type en millisecondes
 */
export function calculateConsistency(validLaps) {
  if (!validLaps || validLaps.length < 2) return 0;
  
  const times = validLaps.map(lap => lap.totalTime);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
  
  return Math.sqrt(variance);
}

/**
 * Trouve les meilleurs segments globaux parmi tous les pilotes
 * 
 * @param {Array} drivers - Array de tous les pilotes
 * @returns {Object} Meilleurs segments globaux
 */
export function findGlobalBestSegments(drivers) {
  const globalBest = {};
  
  drivers.forEach(driver => {
    if (!driver.segments) return;
    
    Object.entries(driver.segments).forEach(([key, value]) => {
      if (!globalBest[key] || value < globalBest[key]) {
        globalBest[key] = value;
      }
    });
  });
  
  return globalBest;
}

/**
 * Détermine le focus du comparateur de segments
 * 
 * @param {Object} selectedDriver - Pilote sélectionné
 * @param {Array} allDrivers - Tous les pilotes
 * @returns {Object} Focus avec primary, secondary et label
 */
export function getSegmentComparatorFocus(selectedDriver, allDrivers) {
  const driverBest = selectedDriver.segments || {};
  const globalBest = findGlobalBestSegments(allDrivers);
  
  return {
    primary: driverBest,
    secondary: globalBest,
    label: 'Meilleur pilote vs Meilleur global'
  };
}

/**
 * Calcule le delta entre deux segments
 * 
 * @param {number} time1 - Premier temps
 * @param {number} time2 - Deuxième temps
 * @returns {number} Delta (positif si time1 > time2)
 */
export function calculateSegmentDelta(time1, time2) {
  return time1 - time2;
}

/**
 * Formate un delta en string avec signe
 * 
 * @param {number} delta - Delta en millisecondes
 * @returns {string} Delta formaté (ex: "+0.123" ou "-0.045")
 */
export function formatDelta(delta) {
  const sign = delta >= 0 ? '+' : '';
  const seconds = (delta / 1000).toFixed(3);
  return `${sign}${seconds}`;
}

