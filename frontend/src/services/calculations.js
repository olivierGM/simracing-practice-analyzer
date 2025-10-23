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
