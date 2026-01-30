/**
 * Service Drill Song
 * 
 * Gère le chargement et la validation des drill songs
 */

const DRILLS_BASE_PATH = '/drills';

/**
 * Charge un drill song depuis un fichier JSON
 * @param {string} path - Chemin relatif depuis /drills (ex: 'easy/test-succession.json')
 * @returns {Promise<Object>} Drill song
 */
export async function loadDrillSong(path) {
  try {
    const response = await fetch(`${DRILLS_BASE_PATH}/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to load drill song: ${response.statusText}`);
    }
    const drillSong = await response.json();
    
    // Valider le drill song
    validateDrillSong(drillSong);
    
    // Calculer la durée si non fournie
    if (!drillSong.duration) {
      drillSong.duration = calculateDuration(drillSong.targets);
    }
    
    return drillSong;
  } catch (error) {
    console.error('Error loading drill song:', error);
    throw error;
  }
}

/**
 * Valide la structure d'un drill song
 * @param {Object} drillSong - Drill song à valider
 * @throws {Error} Si le drill song est invalide
 */
export function validateDrillSong(drillSong) {
  if (!drillSong.name) {
    throw new Error('Drill song must have a name');
  }
  
  if (!drillSong.difficulty) {
    throw new Error('Drill song must have a difficulty');
  }
  
  if (!Array.isArray(drillSong.targets)) {
    throw new Error('Drill song must have a targets array');
  }
  
  if (drillSong.targets.length === 0) {
    throw new Error('Drill song must have at least one target');
  }
  
  // Valider chaque cible
  drillSong.targets.forEach((target, index) => {
    if (typeof target.time !== 'number' || target.time < 0) {
      throw new Error(`Target ${index}: time must be a positive number`);
    }
    
    if (typeof target.percent !== 'number' || target.percent < 0 || target.percent > 100) {
      throw new Error(`Target ${index}: percent must be between 0 and 100`);
    }
    
    if (typeof target.duration !== 'number' || target.duration <= 0) {
      throw new Error(`Target ${index}: duration must be a positive number`);
    }
    
    // Si le drill a des cibles avec type (brake/accel), valider le type
    if (target.type && target.type !== 'brake' && target.type !== 'accel') {
      throw new Error(`Target ${index}: type must be 'brake' or 'accel'`);
    }
  });
  
  // Vérifier que les temps sont croissants
  // Pour les drills brake+accel, on ne vérifie pas le chevauchement car les 2 lanes sont indépendantes
  const hasDualLanes = drillSong.targets.some(t => t.type);
  
  for (let i = 1; i < drillSong.targets.length; i++) {
    const prev = drillSong.targets[i - 1];
    const curr = drillSong.targets[i];
    
    if (curr.time < prev.time) {
      throw new Error(`Targets must be in chronological order (target ${i} starts before ${i - 1})`);
    }
    
    // Vérifier le chevauchement seulement si même type ou pas de type (drills classiques)
    if (!hasDualLanes || (prev.type === curr.type)) {
      if (prev.time + prev.duration > curr.time) {
        throw new Error(`Targets cannot overlap (target ${i - 1} overlaps with ${i})`);
      }
    }
  }
}

/**
 * Calcule la durée totale d'un drill song
 * @param {Array} targets - Tableau de cibles
 * @returns {number} Durée en secondes
 */
export function calculateDuration(targets) {
  if (targets.length === 0) return 0;
  
  const lastTarget = targets[targets.length - 1];
  return lastTarget.time + lastTarget.duration + 1; // +1 seconde de marge
}

/**
 * Liste les drill songs disponibles par difficulté
 * @param {string} difficulty - Difficulté ('easy', 'medium', 'hard')
 * @param {string} drillType - Type de drill ('percentage', 'brakeaccel', etc.)
 * @returns {Promise<Array>} Liste des noms de fichiers
 */
export async function listDrillSongs(difficulty = null, drillType = 'percentage') {
  // Pour l'instant, on retourne une liste hardcodée
  // Plus tard, on pourra faire une requête au serveur pour lister les fichiers
  
  if (drillType === 'brakeaccel') {
    // Uniquement les modes random ; Trail Braking Facile/Moyen retirés (non fonctionnels)
    const brakeAccelDrills = { easy: [], medium: [], hard: [] };
    
    if (difficulty) {
      return brakeAccelDrills[difficulty] || [];
    }
    
    return [...brakeAccelDrills.easy, ...brakeAccelDrills.medium, ...brakeAccelDrills.hard];
  }
  
  // Drills de pourcentages par défaut
  const drills = {
    easy: [
      { path: 'easy/progressive-braking.json', name: 'Progressive Braking - Freinage Progressif' },
      { path: 'easy/multi-threshold.json', name: 'Seuils Multiples' }
    ],
    medium: [
      { path: 'medium/brake-trailing.json', name: 'Brake Trailing - Dégraissage Progressif' },
      { path: 'medium/cadence-braking.json', name: 'Cadence Braking - Freinage en Cadence' }
    ],
    hard: [
      { path: 'hard/threshold-braking.json', name: 'Threshold Braking - Freinage à Seuil' }
    ]
  };
  
  if (difficulty) {
    return drills[difficulty] || [];
  }
  
  return [...drills.easy, ...drills.medium, ...drills.hard];
}

