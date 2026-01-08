/**
 * Service pour gérer les saisons
 * 
 * Détecte automatiquement la saison à partir de la date de session
 */

/**
 * Configuration des dates de début de chaque saison
 * Format: { saison: 'YYYY-MM-DD' }
 */
const SEASON_START_DATES = {
  12: '2025-09-01', // Saison 12 commence en septembre 2025
  13: '2026-01-01', // Saison 13 commence en janvier 2026
  14: '2026-05-01', // Saison 14 commence en mai 2026
  // Ajouter d'autres saisons ici au fur et à mesure
};

/**
 * Détermine la saison d'une session basée sur sa date
 * 
 * @param {string} dateStr - Date au format "YYYY-MM-DD HH:MM:SS" ou fileName "YYMMDD_HHMMSS"
 * @returns {number|null} Numéro de saison (12, 13, etc.) ou null si invalide
 */
export function detectSeason(dateStr) {
  if (!dateStr) return null;

  let sessionDate;

  // Si le format est fileName (YYMMDD_HHMMSS)
  if (dateStr.match(/^\d{6}_\d{6}/)) {
    const year = '20' + dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);
    sessionDate = new Date(`${year}-${month}-${day}`);
  } 
  // Si le format est Date standard
  else if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    sessionDate = new Date(dateStr);
  }
  // Sinon, essayer de parser directement
  else {
    sessionDate = new Date(dateStr);
  }

  // Vérifier si la date est valide
  if (isNaN(sessionDate.getTime())) {
    return null;
  }

  // Trouver la saison correspondante
  const seasons = Object.keys(SEASON_START_DATES)
    .map(Number)
    .sort((a, b) => b - a); // Trier du plus récent au plus ancien

  for (const season of seasons) {
    const seasonStartDate = new Date(SEASON_START_DATES[season]);
    if (sessionDate >= seasonStartDate) {
      return season;
    }
  }

  // Si la date est avant toutes les saisons connues, retourner la plus ancienne
  return Math.min(...seasons);
}

/**
 * Extrait toutes les saisons uniques depuis une liste de sessions
 * 
 * @param {Array} sessions - Liste des sessions
 * @returns {Array<number>} Liste des saisons triées (plus récente en premier)
 */
export function extractAvailableSeasons(sessions) {
  if (!sessions || sessions.length === 0) return [];

  const seasonsSet = new Set();

  sessions.forEach(session => {
    // Essayer différents champs pour la date
    const dateStr = session.Date || session.fileName || session.SessionFile;
    const season = detectSeason(dateStr);
    
    if (season !== null) {
      seasonsSet.add(season);
    }
  });

  // Convertir en array et trier (plus récent en premier)
  return Array.from(seasonsSet).sort((a, b) => b - a);
}

/**
 * Ajoute le champ season à chaque session
 * 
 * @param {Array} sessions - Liste des sessions
 * @returns {Array} Sessions avec le champ season ajouté
 */
export function addSeasonToSessions(sessions) {
  if (!sessions || sessions.length === 0) return [];

  return sessions.map(session => {
    const dateStr = session.Date || session.fileName || session.SessionFile;
    const season = detectSeason(dateStr);
    
    return {
      ...session,
      season
    };
  });
}

/**
 * Filtre les sessions par saison
 * 
 * @param {Array} sessions - Liste des sessions
 * @param {number|string} seasonFilter - Saison à filtrer ('all' ou numéro de saison)
 * @returns {Array} Sessions filtrées
 */
export function filterSessionsBySeason(sessions, seasonFilter) {
  if (!sessions || sessions.length === 0) return [];
  if (seasonFilter === 'all') return sessions;

  return sessions.filter(session => {
    return session.season === seasonFilter;
  });
}

