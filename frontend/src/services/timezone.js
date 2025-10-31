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
 * Ajoute +2h à une date/heure pour corriger le décalage horaire
 * 
 * @param {Date} date - Date à ajuster
 * @returns {Date} Date avec +2h ajoutée
 */
export function addTimezoneOffset(date) {
  if (!date) return null;
  const adjustedDate = new Date(date);
  adjustedDate.setHours(adjustedDate.getHours() + 2);
  return adjustedDate;
}

/**
 * Parse et formate une date de session au format YYMMDD_HHMMSS avec +2h
 * Format d'entrée: "241028_203400" (YYMMDD_HHMMSS)
 * Format de sortie: "28/10/24 20:34" (DD/MM/YY HH:MM avec +2h appliqué)
 * 
 * @param {string} sessionDateStr - Date au format YYMMDD_HHMMSS
 * @returns {string} Date formatée avec +2h ou "--" si invalide
 */
export function formatSessionDateTime(sessionDateStr) {
  if (!sessionDateStr || sessionDateStr.length < 13) {
    return '--';
  }

  try {
    // Format: YYMMDD_HHMMSS
    const year = '20' + sessionDateStr.substring(0, 2);
    const month = sessionDateStr.substring(2, 4);
    const day = sessionDateStr.substring(4, 6);
    const hour = parseInt(sessionDateStr.substring(7, 9));
    const minute = sessionDateStr.substring(9, 11);
    const second = sessionDateStr.substring(11, 13) || '00';

    // Créer une Date avec les valeurs extraites
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );

    // Ajouter +2h
    const adjustedDate = addTimezoneOffset(date);

    // Formater: DD/MM/YY HH:MM
    const formattedDay = String(adjustedDate.getDate()).padStart(2, '0');
    const formattedMonth = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const formattedYear = String(adjustedDate.getFullYear()).substring(2);
    const formattedHour = String(adjustedDate.getHours()).padStart(2, '0');
    const formattedMinute = String(adjustedDate.getMinutes()).padStart(2, '0');

    return `${formattedDay}/${formattedMonth}/${formattedYear} ${formattedHour}:${formattedMinute}`;
  } catch (error) {
    console.error('Erreur lors du formatage de la date de session:', error);
    return '--';
  }
}

/**
 * Formate une date en "Il y a Xh/min/jours"
 * Applique automatiquement +2h pour corriger le décalage horaire
 * 
 * @param {Date} date - Date à formater
 * @returns {string} Texte formaté
 */
export function formatUpdateDate(date) {
  if (!date) return '-';
  
  // Appliquer +2h pour corriger le décalage horaire
  const adjustedDate = addTimezoneOffset(date);
  const now = new Date();
  const diffMs = now.getTime() - adjustedDate.getTime();
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
 * Applique automatiquement +2h pour corriger le décalage horaire
 * 
 * @param {Date} sessionStartDate - Date de début de session
 * @param {number} sessionCount - Nombre de sessions
 * @returns {string} Tooltip formaté
 */
export function createSessionTooltip(sessionStartDate, sessionCount) {
  if (!sessionStartDate) return 'Aucune donnée disponible';
  
  // Appliquer +2h pour corriger le décalage horaire
  const adjustedStartDate = addTimezoneOffset(sessionStartDate);
  const durationMinutes = estimateSessionDuration(sessionCount);
  const adjustedEndDate = addTimezoneOffset(new Date(sessionStartDate.getTime() + (durationMinutes * 60000)));
  
  const formatDate = (date) => date.toLocaleString('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  return `Dernière session:\n` +
         `• Début: ${formatDate(adjustedStartDate)}\n` +
         `• Durée estimée: ${durationMinutes}min\n` +
         `• Fin estimée: ${formatDate(adjustedEndDate)}\n` +
         `• Nombre de sessions: ${sessionCount}`;
}

