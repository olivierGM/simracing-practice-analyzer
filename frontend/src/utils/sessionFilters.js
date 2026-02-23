/**
 * Filtrage des sessions (par type, etc.) — logique réutilisable et testable.
 */

/**
 * Filtre les sessions par type (FP / Q / R).
 * @param {Array<{ sessionType?: string }>} sessions
 * @param {string} sessionTypeFilter - '' | 'FP' | 'Q' | 'R'
 * @returns {Array}
 */
export function filterSessionsBySessionType(sessions, sessionTypeFilter) {
  if (!Array.isArray(sessions)) return [];
  if (!sessionTypeFilter) return sessions;
  return sessions.filter((session) => {
    const t = (session.sessionType && String(session.sessionType).trim().toUpperCase()) || '';
    return t === sessionTypeFilter;
  });
}
