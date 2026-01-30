/**
 * Service Drill Song
 * 
 * Gère le chargement et la validation des drill songs.
 * Chaque drill custom a une propriété drillTypes (dans le JSON ou le manifest)
 * pour indiquer avec quels types de drill il est compatible.
 */

const DRILLS_BASE_PATH = '/drills';

/** Types de drill : un fichier custom est associé à un ou plusieurs. */
export const DRILL_TYPES = {
  SINGLE_PEDAL: 'single_pedal',   // Drill une pédale (percent seulement)
  BRAKE_ACCEL: 'brake_accel',     // Frein + Accélérateur (type brake/accel)
  FULL_COMBO: 'full_combo'        // Drill Complet (brake, accel, wheel, shift_up/shift_down)
};

/** Manifeste de tous les drills customs : path, name, difficulty, drillTypes. */
const CUSTOM_DRILL_MANIFEST = [
  // Drill une pédale
  { path: 'easy/progressive-braking.json', name: 'Progressive Braking - Freinage Progressif', difficulty: 'easy', drillTypes: [DRILL_TYPES.SINGLE_PEDAL] },
  { path: 'easy/multi-threshold.json', name: 'Seuils Multiples', difficulty: 'easy', drillTypes: [DRILL_TYPES.SINGLE_PEDAL] },
  { path: 'easy/test-succession.json', name: 'Test Succession', difficulty: 'easy', drillTypes: [DRILL_TYPES.SINGLE_PEDAL] },
  { path: 'medium/brake-trailing.json', name: 'Brake Trailing - Dégraissage Progressif', difficulty: 'medium', drillTypes: [DRILL_TYPES.SINGLE_PEDAL] },
  { path: 'medium/cadence-braking.json', name: 'Cadence Braking - Freinage en Cadence', difficulty: 'medium', drillTypes: [DRILL_TYPES.SINGLE_PEDAL] },
  { path: 'hard/threshold-braking.json', name: 'Threshold Braking - Freinage à Seuil', difficulty: 'hard', drillTypes: [DRILL_TYPES.SINGLE_PEDAL] },
  // Frein + Accélérateur
  { path: 'brakeaccel/hairpin.json', name: 'Épingles', difficulty: 'easy', drillTypes: [DRILL_TYPES.BRAKE_ACCEL] },
  { path: 'brakeaccel/chicane.json', name: 'Chicane', difficulty: 'medium', drillTypes: [DRILL_TYPES.BRAKE_ACCEL] },
  { path: 'brakeaccel/trail-and-gradual-accel.json', name: 'Trail brake + accélération graduelle', difficulty: 'medium', drillTypes: [DRILL_TYPES.BRAKE_ACCEL] },
  { path: 'brakeaccel/heavy-braking.json', name: 'Freinage intense', difficulty: 'hard', drillTypes: [DRILL_TYPES.BRAKE_ACCEL] },
  { path: 'brakeaccel/double-chicane.json', name: 'Double chicane', difficulty: 'hard', drillTypes: [DRILL_TYPES.BRAKE_ACCEL] },
  { path: 'brakeaccel/trail-braking-easy.json', name: 'Trail Braking (facile)', difficulty: 'easy', drillTypes: [DRILL_TYPES.BRAKE_ACCEL] },
  { path: 'brakeaccel/trail-braking-medium.json', name: 'Trail Braking (moyen)', difficulty: 'medium', drillTypes: [DRILL_TYPES.BRAKE_ACCEL] },
  // Drill Complet : ajouter ici les JSON full_combo quand tu en crées
  // { path: 'fullcombo/example.json', name: 'Exemple Full Combo', difficulty: 'medium', drillTypes: [DRILL_TYPES.FULL_COMBO] },
];

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
  
  // Si drillTypes est présent dans le JSON, valider (optionnel)
  const allowedDrillTypes = [DRILL_TYPES.SINGLE_PEDAL, DRILL_TYPES.BRAKE_ACCEL, DRILL_TYPES.FULL_COMBO];
  if (drillSong.drillTypes != null) {
    if (!Array.isArray(drillSong.drillTypes)) {
      throw new Error('drillTypes must be an array');
    }
    const invalid = drillSong.drillTypes.filter(t => !allowedDrillTypes.includes(t));
    if (invalid.length > 0) {
      throw new Error(`drillTypes contains invalid value(s): ${invalid.join(', ')}. Allowed: ${allowedDrillTypes.join(', ')}`);
    }
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
 * Mappe le type de drill de l’UI vers le type interne (drillTypes dans le manifest).
 * @param {string} uiDrillType - 'percentage' | 'brakeaccel' | 'fullcombo'
 * @returns {string} DRILL_TYPES.*
 */
function uiDrillTypeToInternal(uiDrillType) {
  const map = {
    percentage: DRILL_TYPES.SINGLE_PEDAL,
    brakeaccel: DRILL_TYPES.BRAKE_ACCEL,
    fullcombo: DRILL_TYPES.FULL_COMBO
  };
  return map[uiDrillType] || DRILL_TYPES.SINGLE_PEDAL;
}

/**
 * Liste les drill songs disponibles pour un type de drill et optionnellement une difficulté.
 * Seuls les drills dont drillTypes contient le type demandé sont retournés.
 * @param {string} difficulty - 'easy' | 'medium' | 'hard' ou null pour toutes
 * @param {string} drillType - Type UI : 'percentage', 'brakeaccel', 'fullcombo'
 * @returns {Promise<Array<{path, name, difficulty}>>}
 */
export async function listDrillSongs(difficulty = null, drillType = 'percentage') {
  const internalType = uiDrillTypeToInternal(drillType);
  let list = CUSTOM_DRILL_MANIFEST.filter(
    (entry) => entry.drillTypes && entry.drillTypes.includes(internalType)
  );
  if (difficulty) {
    list = list.filter((entry) => entry.difficulty === difficulty);
  }
  return list.map(({ path, name, difficulty: d }) => ({ path, name, difficulty: d }));
}

