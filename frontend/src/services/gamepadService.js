/**
 * Service Gamepad
 * 
 * Gère la détection, la connexion et la lecture des gamepads
 * Compatible avec les volants de sim racing (Moza R9, Logitech, Thrustmaster, etc.)
 */

/**
 * Détecte tous les gamepads connectés
 * @returns {Array<Gamepad>} Liste des gamepads
 */
export function getConnectedGamepads() {
  if (!navigator.getGamepads) {
    return [];
  }
  
  const gamepads = navigator.getGamepads();
  return Array.from(gamepads).filter(gp => gp !== null);
}

/**
 * Normalise une valeur d'axe entre -1 et 1 vers 0 et 1
 * @param {number} value - Valeur de l'axe (-1 à 1)
 * @returns {number} Valeur normalisée (0 à 1)
 */
export function normalizeAxis(value) {
  if (value === null || value === undefined) return 0;
  // Convertir de [-1, 1] à [0, 1]
  return (value + 1) / 2;
}

/**
 * Normalise une valeur d'axe pour les pédales (inverser si nécessaire)
 * @param {number} value - Valeur de l'axe (-1 à 1)
 * @param {boolean} invert - Si true, inverse la valeur
 * @returns {number} Valeur normalisée (0 à 1)
 */
export function normalizePedal(value, invert = false) {
  const normalized = normalizeAxis(value);
  return invert ? 1 - normalized : normalized;
}

/**
 * Mappe les axes d'un gamepad pour un volant de sim racing
 * @param {Gamepad} gamepad - Le gamepad à mapper
 * @returns {Object} Objet avec les valeurs mappées
 */
export function mapRacingWheelAxes(gamepad) {
  if (!gamepad || !gamepad.axes) {
    return {
      wheel: 0,
      accelerator: 0,
      brake: 0,
      clutch: 0,
      raw: {
        axes: [],
        buttons: []
      }
    };
  }

  const axes = gamepad.axes;
  const buttons = gamepad.buttons;

  // Mapping standard pour la plupart des volants :
  // - Axe 0 : Volant (gauche/droite) - généralement [-1, 1]
  // - Axe 1 : Pédale (accélérateur ou frein selon le modèle)
  // - Axe 2 : Pédale (frein ou accélérateur selon le modèle)
  // - Axe 3 : Embrayage (si présent)
  
  // Pour Moza R9 et SimJack :
  // - Axe 0 : Volant
  // - Axe 1 : Accélérateur (généralement inversé, donc on utilise normalizePedal avec invert)
  // - Axe 2 : Frein
  // - Axe 3 : Embrayage (si présent)

  return {
    wheel: axes[0] || 0, // Volant : -1 (gauche) à 1 (droite)
    accelerator: normalizePedal(axes[1] || 0, true), // Accélérateur : 0 à 1 (inversé car souvent -1 = plein gaz)
    brake: normalizePedal(axes[2] || 0, true), // Frein : 0 à 1
    clutch: axes[3] ? normalizePedal(axes[3], true) : 0, // Embrayage : 0 à 1 (si présent)
    raw: {
      axes: Array.from(axes),
      buttons: Array.from(buttons).map(btn => ({
        pressed: btn.pressed,
        touched: btn.touched,
        value: btn.value
      }))
    }
  };
}

/**
 * Obtient les informations d'un gamepad
 * @param {Gamepad} gamepad - Le gamepad
 * @returns {Object} Informations du gamepad
 */
export function getGamepadInfo(gamepad) {
  if (!gamepad) {
    return {
      id: 'Aucun',
      index: -1,
      connected: false,
      mapping: 'standard',
      axes: 0,
      buttons: 0
    };
  }

  return {
    id: gamepad.id || 'Gamepad inconnu',
    index: gamepad.index,
    connected: gamepad.connected,
    mapping: gamepad.mapping || 'standard',
    axes: gamepad.axes?.length || 0,
    buttons: gamepad.buttons?.length || 0,
    timestamp: gamepad.timestamp
  };
}

/**
 * Vérifie si le Gamepad API est supporté
 * @returns {boolean} True si supporté
 */
export function isGamepadAPISupported() {
  return typeof navigator !== 'undefined' && 
         typeof navigator.getGamepads === 'function';
}

/**
 * Écoute les événements de connexion/déconnexion de gamepads
 * @param {Function} onConnect - Callback appelé quand un gamepad se connecte
 * @param {Function} onDisconnect - Callback appelé quand un gamepad se déconnecte
 * @returns {Function} Fonction pour arrêter l'écoute
 */
export function listenToGamepadEvents(onConnect, onDisconnect) {
  if (!isGamepadAPISupported()) {
    console.warn('Gamepad API non supporté');
    return () => {};
  }

  const handleConnect = (e) => {
    const gamepad = e.gamepad;
    if (gamepad) {
      onConnect(gamepad);
    }
  };

  const handleDisconnect = (e) => {
    const gamepad = e.gamepad;
    if (gamepad) {
      onDisconnect(gamepad);
    }
  };

  window.addEventListener('gamepadconnected', handleConnect);
  window.addEventListener('gamepaddisconnected', handleDisconnect);

  // Retourner une fonction pour nettoyer
  return () => {
    window.removeEventListener('gamepadconnected', handleConnect);
    window.removeEventListener('gamepaddisconnected', handleDisconnect);
  };
}

