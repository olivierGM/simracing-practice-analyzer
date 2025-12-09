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
  SHIFT_UP: 'shift_up',      // Shift Up (bouton)
  SHIFT_DOWN: 'shift_down'   // Shift Down (bouton)
};

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG = {
  version: 2,  // Version 2 = ID-based mapping
  deviceAssignments: {}, // { deviceIndex: DEVICE_TYPES } - Deprecated
  axisMappings: {}       // { deviceId: { axes: { axisIndex: { type, invert } }, _lastKnownIndex } }
};

/**
 * Migre l'ancienne config (index-based) vers la nouvelle (ID-based)
 * @param {Object} oldConfig - Ancienne configuration
 * @param {Array<Gamepad>} gamepads - Gamepads actuellement connectés
 * @returns {Object} Nouvelle configuration migrée
 */
function migrateConfigToV2(oldConfig, gamepads) {
  console.log('🔄 Migration de la config vers v2 (ID-based)...');
  
  const newConfig = {
    version: 2,
    deviceAssignments: {},
    axisMappings: {}
  };
  
  // Migrer axisMappings : index → deviceId
  for (const [indexStr, axisMappings] of Object.entries(oldConfig.axisMappings || {})) {
    const index = parseInt(indexStr);
    const gamepad = gamepads.find(gp => gp && gp.index === index);
    
    if (gamepad) {
      const deviceId = gamepad.id;
      newConfig.axisMappings[deviceId] = {
        axes: axisMappings,
        _lastKnownIndex: index
      };
      console.log(`  ✅ Migré device index ${index} → "${deviceId}"`);
    } else {
      console.warn(`  ⚠️ Device à l'index ${index} non trouvé, ignoré`);
    }
  }
  
  return newConfig;
}

/**
 * Charge la configuration depuis localStorage
 * @returns {Object} Configuration
 */
export function loadMappingConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Vérifier si migration nécessaire (version 1 ou pas de version)
      if (!parsed.version || parsed.version === 1) {
        // Migration nécessaire - on la fera au premier appel de getMappedValue
        // Pour l'instant, retourner la config telle quelle
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          version: parsed.version || 1,
          deviceAssignments: parsed.deviceAssignments || {},
          axisMappings: parsed.axisMappings || {}
        };
      }
      
      // Config v2, fusionner avec défaut
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
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
 * Mappe un axe d'un device à un type d'axe (Version 2: ID-based)
 * @param {Gamepad} gamepad - Le gamepad complet
 * @param {number} axisIndex - Index de l'axe
 * @param {string} axisType - Type d'axe (AXIS_TYPES)
 * @param {boolean} invert - Si true, inverse la valeur
 * @param {Object} currentConfig - Configuration actuelle
 * @returns {Object} Nouvelle configuration
 */
export function mapAxis(gamepad, axisIndex, axisType, invert = false, currentConfig) {
  const newConfig = { ...currentConfig };
  newConfig.version = 2;  // S'assurer qu'on est en v2
  
  const deviceId = gamepad.id;
  const deviceIndex = gamepad.index;
  
  // Initialiser la structure pour ce device si nécessaire
  if (!newConfig.axisMappings[deviceId]) {
    newConfig.axisMappings[deviceId] = {
      axes: {},
      _lastKnownIndex: deviceIndex
    };
  }
  
  // Mettre à jour le lastKnownIndex
  newConfig.axisMappings[deviceId]._lastKnownIndex = deviceIndex;
  
  // Retirer le mapping précédent si cet axe était déjà mappé ailleurs
  Object.keys(newConfig.axisMappings).forEach(devId => {
    const deviceMapping = newConfig.axisMappings[devId];
    const axes = deviceMapping.axes || deviceMapping;  // Compatibilité v1
    
    Object.keys(axes).forEach(axIdx => {
      if (axIdx.startsWith('_')) return;  // Skip metadata
      
      if (axes[axIdx]?.type === axisType && 
          (devId !== deviceId || parseInt(axIdx) !== axisIndex)) {
        delete axes[axIdx];
      }
    });
  });
  
  if (axisType === null || axisType === 'none') {
    delete newConfig.axisMappings[deviceId].axes[axisIndex];
  } else {
    newConfig.axisMappings[deviceId].axes[axisIndex] = {
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
 * Obtient le mapping d'un axe (Compatible v1 et v2)
 * @param {string|number} deviceIdOrIndex - ID ou index du device
 * @param {number} axisIndex - Index de l'axe
 * @param {Object} config - Configuration
 * @returns {Object|null} Mapping ou null
 */
export function getAxisMapping(deviceIdOrIndex, axisIndex, config) {
  // V2: deviceId est une string
  if (typeof deviceIdOrIndex === 'string') {
    const deviceMapping = config.axisMappings[deviceIdOrIndex];
    if (!deviceMapping) return null;
    
    const axes = deviceMapping.axes || {};
    return axes[axisIndex] || null;
  }
  
  // V1: deviceIndex est un number (compatibilité)
  return config.axisMappings[deviceIdOrIndex]?.[axisIndex] || null;
}

/**
 * Applique le mapping à une valeur d'axe (Compatible v1 et v2)
 * @param {string|number} deviceIdOrIndex - ID ou index du device
 * @param {number} axisIndex - Index de l'axe
 * @param {number} rawValue - Valeur brute de l'axe
 * @param {Object} config - Configuration
 * @returns {Object|null} { type, value } ou null
 */
export function applyAxisMapping(deviceIdOrIndex, axisIndex, rawValue, config) {
  const mapping = getAxisMapping(deviceIdOrIndex, axisIndex, config);
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
 * Obtient toutes les valeurs mappées pour un type d'axe (Version 2: ID-based)
 * @param {string} axisType - Type d'axe (AXIS_TYPES)
 * @param {Array<Gamepad>} gamepads - Liste des gamepads
 * @param {Object} config - Configuration
 * @returns {number} Valeur mappée (0 si non trouvé)
 */
export function getMappedValue(axisType, gamepads, config) {
  // Migration automatique si nécessaire
  if (!config.version || config.version === 1) {
    const migratedConfig = migrateConfigToV2(config, gamepads);
    saveMappingConfig(migratedConfig);
    config = migratedConfig;
    console.log('✅ Config migrée automatiquement vers v2');
  }
  
  // Parcourir les devices par leur ID
  for (const [deviceId, deviceMapping] of Object.entries(config.axisMappings)) {
    // Trouver le gamepad avec cet ID
    const gamepad = gamepads.find(gp => gp && gp.id === deviceId);
    
    if (!gamepad) {
      // Device pas connecté ou index a changé
      continue;
    }
    
    const axes = deviceMapping.axes || {};
    
    // Chercher dans les axes
    for (const [axisIndexStr, mapping] of Object.entries(axes)) {
      if (axisIndexStr.startsWith('_')) continue;  // Skip metadata
      
      const axisIndex = parseInt(axisIndexStr);
      
      // Gérer les boutons (index négatif)
      if (axisIndex < 0) {
        if (mapping.type === axisType && gamepad.buttons) {
          const buttonIndex = -axisIndex - 1;
          if (buttonIndex < gamepad.buttons.length) {
            return gamepad.buttons[buttonIndex].pressed ? 1 : 0;
          }
        }
      } else {
        // Gérer les axes
        if (mapping.type === axisType && gamepad.axes) {
          const rawValue = gamepad.axes[axisIndex];
          if (rawValue !== undefined) {
            let value = rawValue;
            
            // Normaliser selon le type
            if (mapping.type === AXIS_TYPES.WHEEL) {
              value = value;  // Garder [-1, 1]
            } else {
              value = (value + 1) / 2;  // Normaliser vers [0, 1]
            }
            
            // Inverser si nécessaire
            if (mapping.invert) {
              if (mapping.type === AXIS_TYPES.WHEEL) {
                value = -value;
              } else {
                value = 1 - value;
              }
            }
            
            return value;
          }
        }
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

