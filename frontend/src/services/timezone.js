/**
 * ⚠️ LOGIQUE CRITIQUE - NE PAS MODIFIER SANS TESTS
 * 
 * Les dates Firestore sont en UTC.
 * On applique un offset de +3h pour aligner avec la perception locale de la session.
 * 
 * Cette logique a été debuggée extensivement et validée en production.
 */

/**
 * Parse une date de session depuis Firestore (UTC) 
 * et applique l'offset pour la perception locale
 * 
 * @param {string} dateStr - Date au format "YYYY-MM-DD HH:MM:SS" (UTC)
 * @returns {Date} Date avec offset appliqué
 */
export function parseSessionDate(dateStr) {
  const [date, time] = dateStr.split(' ');
  const [year, month, day] = date.split('-');
  const [hour, minute, second] = time.split(':');
  
  // OFFSET CRITIQUE: +3h pour aligner la date UTC avec la perception locale
  const hourNum = parseInt(hour) + 3;
  
  return new Date(Date.UTC(
    parseInt(year), 
    parseInt(month) - 1, 
    parseInt(day), 
    hourNum, 
    parseInt(minute), 
    parseInt(second)
  ));
}

/**
 * Formate une date en "Il y a Xh/min/jours"
 * 
 * @param {Date} date - Date à formater
 * @returns {string} Texte formaté
 */
export function formatUpdateDate(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
}

/**
 * Estime la durée d'une session basée sur le nombre de tours
 * 
 * @param {number} sessionCount - Nombre de sessions/tours
 * @returns {number} Durée estimée en minutes
 */
export function estimateSessionDuration(sessionCount) {
  const baseMinutes = 90;
  const additionalPerSession = 5;
  return baseMinutes + (sessionCount * additionalPerSession);
}

/**
 * Crée un tooltip détaillé pour l'indicateur "Dernière session"
 * 
 * @param {Date} sessionStartDate - Date de début de session
 * @param {number} sessionCount - Nombre de sessions
 * @returns {string} Tooltip formaté
 */
export function createSessionTooltip(sessionStartDate, sessionCount) {
  const durationMinutes = estimateSessionDuration(sessionCount);
  const sessionEndDate = new Date(sessionStartDate.getTime() + (durationMinutes * 60000));
  
  const formatDate = (date) => date.toLocaleString('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  return `Dernière session:\n` +
         `• Début: ${formatDate(sessionStartDate)}\n` +
         `• Durée estimée: ${durationMinutes}min\n` +
         `• Fin estimée: ${formatDate(sessionEndDate)}\n` +
         `• Nombre de sessions: ${sessionCount}`;
}

