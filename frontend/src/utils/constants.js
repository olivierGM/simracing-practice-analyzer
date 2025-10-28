/**
 * Constantes de l'application
 */

// Thèmes disponibles
export const THEMES = ['auto', 'dark', 'light'];

// Filtres de période
export const PERIOD_FILTERS = [
  { value: 'all', label: 'À tout moment' },
  { value: 'week', label: 'Dernière semaine' },
  { value: 'day', label: 'Dernière journée' }
];

// Colonnes du tableau principal (COPIE EXACTE de la prod - 14 colonnes)
// Voir script-public.js lignes 942-956
export const TABLE_COLUMNS = [
  { key: 'position', label: 'Pos', sortable: false },
  { key: 'name', label: 'Pilote', sortable: true, dataType: 'text' },
  { key: 'category', label: 'Classe', sortable: true, dataType: 'text' },
  { key: 'totalLaps', label: 'Tours', sortable: true, dataType: 'number' },
  { key: 'validLaps', label: 'Tours Valides', sortable: true, dataType: 'number' },
  { key: 'bestValidTime', label: 'Meilleur valide', sortable: true, dataType: 'time' },
  { key: 'averageValidTime', label: 'Moyenne valide', sortable: true, dataType: 'time' },
  { key: 'validConsistency', label: 'Const. valide', sortable: true, dataType: 'percentage' },
  { key: 'bestWetTime', label: 'Meilleur wet', sortable: true, dataType: 'time' },
  { key: 'averageWetTime', label: 'Moyenne wet', sortable: true, dataType: 'time' },
  { key: 'wetConsistency', label: 'Const. wet', sortable: true, dataType: 'percentage' },
  { key: 'bestOverallTime', label: 'Meilleur total', sortable: true, dataType: 'time' },
  { key: 'averageOverallTime', label: 'Moyenne total', sortable: true, dataType: 'time' },
  { key: 'totalConsistency', label: 'Const. total', sortable: true, dataType: 'percentage' }
];

// Colonnes de la liste des tours (dans la modal)
export const LAPS_TABLE_COLUMNS = [
  { key: 'lapNumber', label: 'Tour' },
  { key: 'S1', label: 'S1' },
  { key: 'S2', label: 'S2' },
  { key: 'S3', label: 'S3' },
  { key: 'S4', label: 'S4' },
  { key: 'S5', label: 'S5' },
  { key: 'S6', label: 'S6' },
  { key: 'totalTime', label: 'Total' }
];

// Configuration Firebase (publique)
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBOyMeW0kxC3d9pP5VsYr2czQfBJQYdjTs",
  authDomain: "simracing-practice-analyzer.firebaseapp.com",
  projectId: "simracing-practice-analyzer",
  storageBucket: "simracing-practice-analyzer.appspot.com",
  messagingSenderId: "377068056867",
  appId: "1:377068056867:web:d7c2a3f4e5b6c7d8e9f0a1"
};

// Durées en millisecondes
export const DURATIONS = {
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000
};

// Classes de voitures (pour le groupement)
export const CAR_CLASSES = [
  'GT3',
  'GT4',
  'TCR',
  'Prototype',
  'Formula'
];

// Nombre de segments par piste (peut varier)
export const DEFAULT_SEGMENTS_COUNT = 6;

// Configuration du graphique de progression
export const CHART_CONFIG = {
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  },
  maintainAspectRatio: true,
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  }
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  NO_DATA: 'Aucune donnée disponible',
  LOADING_FAILED: 'Erreur lors du chargement des données',
  AUTH_FAILED: 'Échec de l\'authentification',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion.'
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOGIN: 'Connexion réussie',
  LOGOUT: 'Déconnexion réussie',
  DATA_LOADED: 'Données chargées avec succès'
};

/**
 * Mappe les noms de circuits internes vers les noms utilisés par l'API ACC
 * @param {string} trackName - Nom du circuit interne
 * @returns {string} - Nom du circuit pour l'API ACC
 */
export function getACCTrackName(trackName) {
  const trackMap = {
    'valencia': 'valencia',
    'nurburgring': 'nurburgring',
    'donington': 'donington',
    'red_bull_ring': 'red_bull_ring',
    'misano': 'misano',
    'snetterton': 'snetterton',
    'monza': 'monza',
    'zandvoort': 'zandvoort',
    // Ajouter d'autres mappings si nécessaire
  };

  return trackMap[trackName] || trackName;
}

