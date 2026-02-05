/**
 * Service Keyboard
 * 
 * Gère la capture des entrées clavier pour simuler les périphériques
 * Mode progressif : Les valeurs augmentent/diminuent progressivement (simulation réaliste)
 */

// État global des touches pressées
let pressedKeys = new Set();

// Mode progressif (true = simulation réaliste, false = binaire 0/1)
let progressiveMode = false;

// Valeurs simulées pour les touches
let keyValues = {
  // Par défaut, certaines touches pour tester
  'KeyW': { type: 'accelerator', value: 0, targetValue: 1, speed: 0.04 }, // W = Accélérateur
  'KeyS': { type: 'brake', value: 0, targetValue: 1, speed: 0.04 },       // S = Frein
  'Space': { type: 'clutch', value: 0, targetValue: 1, speed: 0.04 },     // Espace = Embrayage
  'ArrowLeft': { type: 'wheel', value: -1, targetValue: -1, speed: 0.05 }, // Flèche gauche
  'ArrowRight': { type: 'wheel', value: 1, targetValue: 1, speed: 0.05 }, // Flèche droite
  'ArrowUp': { type: 'shift_up', value: 0, targetValue: 1, speed: 1 },    // Shift Up (instantané)
  'ArrowDown': { type: 'shift_down', value: 0, targetValue: 1, speed: 1 } // Shift Down (instantané)
};

// Vitesses de montée/descente par défaut
const DEFAULT_SPEEDS = {
  pedal: 0.04,        // Vitesse d'appui sur pédales
  pedalRelease: 0.06, // Vitesse de relâchement des pédales
  wheel: 0.05,        // Vitesse de rotation du volant
  wheelReturn: 0.08,  // Vitesse de retour au centre du volant
  button: 1           // Boutons instantanés
};

// Animation frame pour le mode progressif
let animationFrameId = null;

// Listeners
let keyDownListener = null;
let keyUpListener = null;
let listenersInitialized = false;

/**
 * Active/désactive le mode progressif
 * @param {boolean} enabled - true pour activer le mode progressif
 */
export function setProgressiveMode(enabled) {
  progressiveMode = enabled;
  
  if (enabled && !animationFrameId) {
    // Démarrer la boucle d'animation
    updateProgressiveValues();
  } else if (!enabled && animationFrameId) {
    // Arrêter la boucle
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Obtient l'état du mode progressif
 * @returns {boolean}
 */
export function isProgressiveModeEnabled() {
  return progressiveMode;
}

/**
 * Boucle d'animation pour le mode progressif
 */
function updateProgressiveValues() {
  if (!progressiveMode) {
    animationFrameId = null;
    return;
  }

  // Mettre à jour chaque touche
  for (const [keyCode, keyInfo] of Object.entries(keyValues)) {
    const isPressed = pressedKeys.has(keyCode);
    const { type, value: _value } = keyInfo;

    if (type === 'wheel') {
      // Volant : retour progressif au centre si pas pressé
      if (isPressed) {
        // Maintenir la valeur cible
        keyInfo.value = keyInfo.targetValue;
      } else {
        // Retour au centre progressif
        if (Math.abs(keyInfo.value) > 0.01) {
          const direction = keyInfo.value > 0 ? -1 : 1;
          keyInfo.value += direction * DEFAULT_SPEEDS.wheelReturn;
          keyInfo.value = Math.max(-1, Math.min(1, keyInfo.value));
          
          // Snap au centre si très proche
          if (Math.abs(keyInfo.value) < 0.01) {
            keyInfo.value = 0;
          }
        } else {
          keyInfo.value = 0;
        }
      }
    } else if (type === 'accelerator' || type === 'brake' || type === 'clutch') {
      // Pédales (accélérateur, frein, embrayage) : montée/descente progressive
      if (isPressed) {
        // Appui progressif
        if (keyInfo.value < keyInfo.targetValue) {
          keyInfo.value = Math.min(keyInfo.targetValue, keyInfo.value + DEFAULT_SPEEDS.pedal);
        }
      } else {
        // Relâchement progressif
        if (keyInfo.value > 0.01) {
          keyInfo.value = Math.max(0, keyInfo.value - DEFAULT_SPEEDS.pedalRelease);
        } else {
          keyInfo.value = 0;
        }
      }
    } else {
      // Boutons (shift) : instantané
      keyInfo.value = isPressed ? keyInfo.targetValue : 0;
    }
  }

  // Continuer la boucle
  animationFrameId = requestAnimationFrame(updateProgressiveValues);
}

/**
 * Initialise les listeners clavier
 */
export function initializeKeyboardListeners() {
  if (listenersInitialized) return;

  keyDownListener = (e) => {
    pressedKeys.add(e.code);
    if (!progressiveMode) {
      updateKeyValue(e.code, true);
    }
    
    // Empêcher le scroll avec les flèches
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
  };

  keyUpListener = (e) => {
    pressedKeys.delete(e.code);
    if (!progressiveMode) {
      updateKeyValue(e.code, false);
    }
  };

  window.addEventListener('keydown', keyDownListener);
  window.addEventListener('keyup', keyUpListener);
  listenersInitialized = true;
}

/**
 * Désinitialise les listeners clavier
 */
export function cleanupKeyboardListeners() {
  if (!listenersInitialized) return;

  if (keyDownListener) {
    window.removeEventListener('keydown', keyDownListener);
  }
  if (keyUpListener) {
    window.removeEventListener('keyup', keyUpListener);
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  pressedKeys.clear();
  listenersInitialized = false;
}

/**
 * Met à jour la valeur d'une touche (mode non-progressif)
 */
function updateKeyValue(keyCode, isPressed) {
  if (!keyValues[keyCode]) return;

  const keyInfo = keyValues[keyCode];
  
  if (keyInfo.type === 'wheel') {
    // Pour le volant, utiliser la targetValue
    keyInfo.value = isPressed ? keyInfo.targetValue : 0;
  } else if (keyInfo.type === 'accelerator' || keyInfo.type === 'brake' || keyInfo.type === 'clutch') {
    // Pour les pédales (accélérateur, frein, embrayage), 1 si pressé, 0 sinon
    keyInfo.value = isPressed ? 1 : 0;
  } else {
    // Pour les boutons (shift), 1 si pressé, 0 sinon
    keyInfo.value = isPressed ? 1 : 0;
  }
}

/**
 * Assigne une touche à une fonction
 * @param {string} keyCode - Code de la touche (ex: 'KeyW')
 * @param {string} functionType - Type de fonction ('accelerator', 'brake', 'wheel', etc.)
 * @param {{ wheelDirection?: number }} options - Pour 'wheel': -1 = gauche, 1 = droite
 */
export function assignKeyToFunction(keyCode, functionType, options = {}) {
  if (!keyValues[keyCode]) {
    keyValues[keyCode] = { type: functionType, value: 0 };
  } else {
    keyValues[keyCode].type = functionType;
    keyValues[keyCode].value = 0;
  }

  if (functionType === 'wheel') {
    const direction = options.wheelDirection ?? (
      (keyCode === 'ArrowLeft' || keyCode === 'KeyA') ? -1 :
      (keyCode === 'ArrowRight' || keyCode === 'KeyD') ? 1 : 1
    );
    keyValues[keyCode].targetValue = direction;
    keyValues[keyCode].value = 0;
  }
}

/**
 * Retire l'assignation d'une touche
 * @param {string} keyCode - Code de la touche
 */
export function unassignKey(keyCode) {
  delete keyValues[keyCode];
}

/**
 * Obtient la valeur actuelle d'une fonction depuis le clavier
 * @param {string} functionType - Type de fonction
 * @returns {number} Valeur (0-1 pour pédales, -1 à 1 pour volant, 0-1 pour boutons)
 */
export function getKeyboardValue(functionType) {
  let value = 0;
  
  // En mode progressif, utiliser directement les valeurs animées
  if (progressiveMode) {
    for (const [_keyCode, keyInfo] of Object.entries(keyValues)) {
      if (keyInfo.type === functionType) {
        if (functionType === 'wheel') {
          // Pour le volant, additionner les valeurs
          value += keyInfo.value;
        } else {
          // Pour les pédales et boutons, prendre la valeur maximale
          value = Math.max(value, keyInfo.value);
        }
      }
    }
  } else {
    // Mode binaire (comportement original)
    for (const [keyCode, keyInfo] of Object.entries(keyValues)) {
      if (keyInfo.type === functionType) {
        const isPressed = pressedKeys.has(keyCode);
        
        if (functionType === 'wheel') {
          // Pour le volant, additionner les valeurs (gauche = -1, droite = +1)
          if (isPressed) {
            value += keyInfo.targetValue || keyInfo.value;
          }
        } else {
          // Pour les pédales et boutons, prendre la valeur maximale
          if (isPressed) {
            value = Math.max(value, 1);
          }
        }
      }
    }
  }
  
  // Clamper la valeur du volant entre -1 et 1
  if (functionType === 'wheel') {
    value = Math.max(-1, Math.min(1, value));
  }
  
  return value;
}

/**
 * Vérifie si une touche est pressée
 * @param {string} keyCode - Code de la touche
 * @returns {boolean}
 */
export function isKeyPressed(keyCode) {
  return pressedKeys.has(keyCode);
}

/**
 * Obtient toutes les touches assignées
 * @returns {Object} { keyCode: functionType }
 */
export function getAssignedKeys() {
  const assigned = {};
  for (const [keyCode, keyInfo] of Object.entries(keyValues)) {
    if (keyInfo && keyInfo.type) {
      assigned[keyCode] = keyInfo.type;
    }
  }
  return assigned;
}

/**
 * Obtient les détails des assignations (inclut targetValue pour wheel)
 * @returns {Object} { keyCode: { type, targetValue? } }
 */
export function getAssignmentDetails() {
  const details = {};
  for (const [keyCode, keyInfo] of Object.entries(keyValues)) {
    if (keyInfo && keyInfo.type) {
      details[keyCode] = {
        type: keyInfo.type,
        targetValue: keyInfo.targetValue
      };
    }
  }
  return details;
}

/**
 * Formate un code de touche en nom lisible
 * @param {string} keyCode - Code de la touche
 * @returns {string} Nom lisible
 */
export function formatKeyCode(keyCode) {
  const keyMap = {
    'KeyW': 'W',
    'KeyA': 'A',
    'KeyS': 'S',
    'KeyD': 'D',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Space': 'Espace',
    'Enter': 'Entrée'
  };
  
  if (keyMap[keyCode]) {
    return keyMap[keyCode];
  }
  
  // Si c'est une lettre simple (KeyX), extraire la lettre
  if (keyCode.startsWith('Key')) {
    return keyCode.substring(3);
  }
  
  // Si c'est une touche numérique (DigitX), extraire le chiffre
  if (keyCode.startsWith('Digit')) {
    return keyCode.substring(5);
  }
  
  return keyCode;
}

