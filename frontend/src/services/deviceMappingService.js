/**
 * Service Device Mapping
 * 
 * Gère la configuration et le mapping des devices
 * Permet d'assigner des devices à des fonctions (Volant, Pédales, etc.)
 * et de mapper les axes individuellement
 */

const STORAGE_KEY = 'pedal-wheel-drills-mapping';

// Types de devices assignables
export const DEVICE_TYPES = {
  WHEEL: 'wheel',
  PEDALS: 'pedals',
  CLUTCH: 'clutch',
  NONE: 'none'
};

// Types d'axes mappables
export const AXIS_TYPES = {
  WHEEL: 'wheel',           // Volant (gauche/droite)
  ACCELERATOR: 'accelerator', // Accélérateur
  BRAKE: 'brake',            // Frein
  CLUTCH: 'clutch'           // Embrayage
};

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG = {
  deviceAssignments: {}, // { deviceIndex: DEVICE_TYPES }
  axisMappings: {}       // { deviceIndex: { axisIndex: AXIS_TYPES, invert: boolean } }
};

/**
 * Charge la configuration depuis localStorage
 * @returns {Object} Configuration
 */
export function loadMappingConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Fusionner avec la config par défaut
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        deviceAssignments: parsed.deviceAssignments || {},
        axisMappings: parsed.axisMappings || {}
      };
    }
  } catch (error) {
    console.warn('Erreur lors du chargement de la configuration:', error);
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Sauvegarde la configuration dans localStorage
 * @param {Object} config - Configuration à sauvegarder
 */
export function saveMappingConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde de la configuration:', error);
  }
}

/**
 * Assigne un device à un type
 * @param {number} deviceIndex - Index du device
 * @param {string} deviceType - Type de device (DEVICE_TYPES)
 * @param {Object} currentConfig - Configuration actuelle
 * @returns {Object} Nouvelle configuration
 */
export function assignDevice(deviceIndex, deviceType, currentConfig) {
  const newConfig = { ...currentConfig };
  
  // Retirer l'assignation précédente si le device était déjà assigné à un autre type
  Object.keys(newConfig.deviceAssignments).forEach(index => {
    if (newConfig.deviceAssignments[index] === deviceType && parseInt(index) !== deviceIndex) {
      delete newConfig.deviceAssignments[index];
    }
  });
  
  if (deviceType === DEVICE_TYPES.NONE) {
    delete newConfig.deviceAssignments[deviceIndex];
    // Supprimer aussi les mappings d'axes pour ce device
    delete newConfig.axisMappings[deviceIndex];
  } else {
    newConfig.deviceAssignments[deviceIndex] = deviceType;
  }
  
  saveMappingConfig(newConfig);
  return newConfig;
}

/**
 * Mappe un axe d'un device à un type d'axe
 * @param {number} deviceIndex - Index du device
 * @param {number} axisIndex - Index de l'axe
 * @param {string} axisType - Type d'axe (AXIS_TYPES)
 * @param {boolean} invert - Si true, inverse la valeur
 * @param {Object} currentConfig - Configuration actuelle
 * @returns {Object} Nouvelle configuration
 */
export function mapAxis(deviceIndex, axisIndex, axisType, invert = false, currentConfig) {
  const newConfig = { ...currentConfig };
  
  if (!newConfig.axisMappings[deviceIndex]) {
    newConfig.axisMappings[deviceIndex] = {};
  }
  
  // Retirer le mapping précédent si cet axe était déjà mappé ailleurs
  Object.keys(newConfig.axisMappings).forEach(devIdx => {
    Object.keys(newConfig.axisMappings[devIdx]).forEach(axIdx => {
      if (newConfig.axisMappings[devIdx][axIdx]?.type === axisType && 
          (parseInt(devIdx) !== deviceIndex || parseInt(axIdx) !== axisIndex)) {
        delete newConfig.axisMappings[devIdx][axIdx];
      }
    });
  });
  
  if (axisType === null || axisType === 'none') {
    delete newConfig.axisMappings[deviceIndex][axisIndex];
  } else {
    newConfig.axisMappings[deviceIndex][axisIndex] = {
      type: axisType,
      invert: invert
    };
  }
  
  saveMappingConfig(newConfig);
  return newConfig;
}

/**
 * Obtient le device assigné à un type
 * @param {string} deviceType - Type de device (DEVICE_TYPES)
 * @param {Object} config - Configuration
 * @returns {number|null} Index du device ou null
 */
export function getDeviceForType(deviceType, config) {
  for (const [index, type] of Object.entries(config.deviceAssignments)) {
    if (type === deviceType) {
      return parseInt(index);
    }
  }
  return null;
}

/**
 * Obtient le mapping d'un axe
 * @param {number} deviceIndex - Index du device
 * @param {number} axisIndex - Index de l'axe
 * @param {Object} config - Configuration
 * @returns {Object|null} Mapping ou null
 */
export function getAxisMapping(deviceIndex, axisIndex, config) {
  return config.axisMappings[deviceIndex]?.[axisIndex] || null;
}

/**
 * Applique le mapping à une valeur d'axe
 * @param {number} deviceIndex - Index du device
 * @param {number} axisIndex - Index de l'axe
 * @param {number} rawValue - Valeur brute de l'axe
 * @param {Object} config - Configuration
 * @returns {Object|null} { type, value } ou null
 */
export function applyAxisMapping(deviceIndex, axisIndex, rawValue, config) {
  const mapping = getAxisMapping(deviceIndex, axisIndex, config);
  if (!mapping) return null;
  
  let value = rawValue;
  
  // Normaliser selon le type
  if (mapping.type === AXIS_TYPES.WHEEL) {
    // Volant : garder [-1, 1]
    value = value;
  } else {
    // Pédales : normaliser vers [0, 1]
    value = (value + 1) / 2;
  }
  
  // Inverser si nécessaire
  if (mapping.invert) {
    if (mapping.type === AXIS_TYPES.WHEEL) {
      value = -value;
    } else {
      value = 1 - value;
    }
  }
  
  return {
    type: mapping.type,
    value: value
  };
}

/**
 * Obtient toutes les valeurs mappées pour un type d'axe
 * @param {string} axisType - Type d'axe (AXIS_TYPES)
 * @param {Array<Gamepad>} gamepads - Liste des gamepads
 * @param {Object} config - Configuration
 * @returns {number} Valeur mappée (0 si non trouvé)
 */
export function getMappedValue(axisType, gamepads, config) {
  for (const gamepad of gamepads) {
    if (!gamepad || !gamepad.axes) continue;
    
    const deviceIndex = gamepad.index;
    const axes = gamepad.axes;
    
    for (let i = 0; i < axes.length; i++) {
      const mapping = applyAxisMapping(deviceIndex, i, axes[i], config);
      if (mapping && mapping.type === axisType) {
        return mapping.value;
      }
    }
  }
  
  return 0;
}

/**
 * Réinitialise la configuration
 * @returns {Object} Configuration par défaut
 */
export function resetMappingConfig() {
  const defaultConfig = { ...DEFAULT_CONFIG };
  saveMappingConfig(defaultConfig);
  return defaultConfig;
}

