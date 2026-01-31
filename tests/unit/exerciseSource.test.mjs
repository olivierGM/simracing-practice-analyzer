/**
 * Tests unitaires : ExerciseSource (Story 2)
 */
import { randomExerciseSource, mockMotekExerciseSource, isValidExerciseDefinition } from '../../frontend/src/services/exerciseSource.js';

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

// randomExerciseSource
const randomDef = randomExerciseSource.load('hard', 90);
assert(randomDef.type === 'random', 'randomExerciseSource returns type random');
assert(randomDef.difficulty === 'hard', 'randomExerciseSource returns difficulty');
assert(randomDef.duration === 90, 'randomExerciseSource returns duration');

// mockMotekExerciseSource
const mockDef = mockMotekExerciseSource.load();
assert(mockDef.type === 'random', 'mockMotekExerciseSource returns type random');
assert(mockDef.difficulty === 'medium', 'mockMotekExerciseSource returns medium');
assert(mockDef.duration === 60, 'mockMotekExerciseSource returns 60s');

// isValidExerciseDefinition
assert(isValidExerciseDefinition(randomDef), 'random def is valid');
assert(isValidExerciseDefinition(mockDef), 'mock def is valid');
assert(isValidExerciseDefinition({ file: '/foo.json' }), 'file def is valid');
assert(isValidExerciseDefinition({ targets: [] }), 'targets def is valid');
assert(!isValidExerciseDefinition(null), 'null is invalid');
assert(!isValidExerciseDefinition({}), 'empty obj is invalid');

console.log('✅ exerciseSource tests OK');
