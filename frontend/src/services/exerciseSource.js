/**
 * Abstraction de source d'exercices pour Drill complet
 *
 * Interface ExerciseSource : load(input) -> ExerciseDefinition
 * ExerciseDefinition = format attendu par useDDRFullTargets :
 * - { type: 'random', duration, difficulty } → génère des cibles
 * - { file: url } → charge un JSON avec targets
 * - { targets: [...], duration? } → cibles pré-chargées
 */

/**
 * @typedef {Object} ExerciseDefinition
 * @property {'random'} [type]
 * @property {number} [duration]
 * @property {string} [difficulty]
 * @property {string} [file]
 * @property {Array} [targets]
 * @property {string} [name]
 * @property {string} [mapName]
 */

/**
 * Interface ExerciseSource
 * @callback ExerciseSourceLoad
 * @param {any} [input] - fichier File, URL, ou autre
 * @returns {Promise<ExerciseDefinition> | ExerciseDefinition}
 */

/**
 * Source aléatoire (Drill complet classique)
 */
export const randomExerciseSource = {
  load(difficulty = 'medium', duration = 60) {
    return {
      type: 'random',
      difficulty,
      duration
    };
  }
};

/**
 * Source mock pour Drill complet Motek (Story 1-2 — stub)
 */
export const mockMotekExerciseSource = {
  load() {
    return {
      type: 'random',
      difficulty: 'medium',
      duration: 60
    };
  }
};

/**
 * Vérifie si un objet est un ExerciseDefinition valide
 * @param {any} def
 * @returns {boolean}
 */
export function isValidExerciseDefinition(def) {
  if (!def || typeof def !== 'object') return false;
  if (def.type === 'random') {
    return typeof def.duration === 'number' && typeof def.difficulty === 'string';
  }
  if (def.file) return true;
  if (Array.isArray(def.targets)) return true;
  return false;
}
