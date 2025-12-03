/**
 * Service Keyboard
 * 
 * Gère la capture des entrées clavier pour simuler les périphériques
 */

// État global des touches pressées
let pressedKeys = new Set();

// Valeurs simulées pour les touches
let keyValues = {
  // Par défaut, certaines touches pour tester
  'KeyW': { type: 'accelerator', value: 0 }, // W = Accélérateur
  'KeyS': { type: 'brake', value: 0 },       // S = Frein
  'ArrowLeft': { type: 'wheel', value: -1 }, // Flèche gauche = Volant gauche
  'ArrowRight': { type: 'wheel', value: 1 }, // Flèche droite = Volant droite
  'ArrowUp': { type: 'shift_up', value: 0 }, // Flèche haut = Shift Up
  'ArrowDown': { type: 'shift_down', value: 0 } // Flèche bas = Shift Down
};

// Listeners
let keyDownListener = null;
let keyUpListener = null;
let listenersInitialized = false;

/**
 * Initialise les listeners clavier
 */
export function initializeKeyboardListeners() {
  if (listenersInitialized) return;

  keyDownListener = (e) => {
    pressedKeys.add(e.code);
    updateKeyValue(e.code, true);
  };

  keyUpListener = (e) => {
    pressedKeys.delete(e.code);
    updateKeyValue(e.code, false);
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

  pressedKeys.clear();
  listenersInitialized = false;
}

/**
 * Met à jour la valeur d'une touche
 */
function updateKeyValue(keyCode, isPressed) {
  if (!keyValues[keyCode]) return;

  const keyInfo = keyValues[keyCode];
  
  if (keyInfo.type === 'wheel') {
    // Pour le volant, on maintient la valeur maximale quand la touche est pressée
    keyInfo.value = isPressed ? keyInfo.value : 0;
  } else if (keyInfo.type === 'accelerator' || keyInfo.type === 'brake') {
    // Pour les pédales, 1 si pressé, 0 sinon
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
 */
export function assignKeyToFunction(keyCode, functionType) {
  if (!keyValues[keyCode]) {
    keyValues[keyCode] = { type: functionType, value: 0 };
  } else {
    keyValues[keyCode].type = functionType;
    keyValues[keyCode].value = 0;
  }
  
  // Si c'est un volant, déterminer la direction
  if (functionType === 'wheel') {
    // Par défaut, on peut utiliser les flèches ou A/D
    if (keyCode === 'ArrowLeft' || keyCode === 'KeyA') {
      keyValues[keyCode].value = -1; // Gauche
    } else if (keyCode === 'ArrowRight' || keyCode === 'KeyD') {
      keyValues[keyCode].value = 1; // Droite
    }
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
  
  // Chercher toutes les touches assignées à cette fonction
  for (const [keyCode, keyInfo] of Object.entries(keyValues)) {
    if (keyInfo.type === functionType) {
      const isPressed = pressedKeys.has(keyCode);
      
      if (functionType === 'wheel') {
        // Pour le volant, additionner les valeurs (gauche = -1, droite = +1)
        if (isPressed) {
          value += keyInfo.value;
        }
      } else {
        // Pour les pédales et boutons, prendre la valeur maximale
        if (isPressed) {
          value = Math.max(value, keyInfo.value);
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

