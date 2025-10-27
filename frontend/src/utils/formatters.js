/**
 * Utilitaires de formatage
 * 
 * Fonctions pour formater les temps, dates, nombres, etc.
 */

/**
 * Formate un temps en millisecondes en MM:SS.mmm (COPIE EXACTE de la prod)
 * Prod affiche: 01:34.087 (avec padding sur les minutes)
 * 
 * @param {number} ms - Temps en millisecondes
 * @returns {string} Temps formaté
 */
export function formatTime(ms) {
  if (!ms || ms === 0) return '--:--.---';
  
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // Padding: minutes sur 2 chiffres, secondes sur 6 caractères (SS.mmm)
  return `${String(minutes).padStart(2, '0')}:${seconds.toFixed(3).padStart(6, '0')}`;
}

/**
 * Formate un segment time (plus court, sans minutes si < 60s)
 * 
 * @param {number} ms - Temps en millisecondes
 * @returns {string} Temps formaté
 */
export function formatSegmentTime(ms) {
  if (!ms || ms === 0) return '-';
  
  const totalSeconds = ms / 1000;
  
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(3)}s`;
  }
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
}

/**
 * Formate un delta de temps avec couleur
 * 
 * @param {number} delta - Delta en millisecondes
 * @returns {string} Delta formaté en secondes (ex: "+1.234" ou "-0.567")
 */
export function formatDelta(delta) {
  if (!delta || delta === 0) {
    return '0.000';
  }
  
  const sign = delta > 0 ? '+' : '';
  const seconds = (delta / 1000).toFixed(3);
  
  return `${sign}${seconds}`;
}

/**
 * Formate un nombre avec séparateurs de milliers
 * 
 * @param {number} num - Nombre à formater
 * @returns {string} Nombre formaté
 */
export function formatNumber(num) {
  if (!num && num !== 0) return '-';
  return num.toLocaleString('fr-CA');
}

/**
 * Formate un pourcentage
 * 
 * @param {number} value - Valeur entre 0 et 1
 * @param {number} decimals - Nombre de décimales (défaut: 1)
 * @returns {string} Pourcentage formaté
 */
export function formatPercentage(value, decimals = 1) {
  if (!value && value !== 0) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formate une date en format court
 * 
 * @param {Date|string} date - Date à formater
 * @returns {string} Date formatée (ex: "15 oct. 2025")
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('fr-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formate une date avec heure
 * 
 * @param {Date|string} date - Date à formater
 * @returns {string} Date et heure formatées
 */
export function formatDateTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleString('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Tronque un texte à une longueur maximale
 * 
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}

