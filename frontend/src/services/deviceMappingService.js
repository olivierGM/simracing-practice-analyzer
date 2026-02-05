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
  CLUTCH: 'clutch',          // Embrayage
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
 * Extrait le Vendor ID et Product ID d'un ID de gamepad
 * @param {string} gamepadId - ID du gamepad (ex: "Simjack Pedals (Vendor: 7864 Product: 5801)")
 * @returns {Object|null} { vendorId, productId } ou null si non trouvé
 */
function extractVendorProductId(gamepadId) {
  const vendorMatch = gamepadId.match(/Vendor:\s*([0-9a-fA-F]+)/i);
  const productMatch = gamepadId.match(/Product:\s*([0-9a-fA-F]+)/i);
  
  if (vendorMatch && productMatch) {
    return {
      vendorId: vendorMatch[1].toLowerCase(),
      productId: productMatch[1].toLowerCase()
    };
  }
  return null;
}

/**
 * Détecte les collisions d'ID et génère une clé unique avec slot si nécessaire
 * Essaie d'abord de réutiliser une clé existante si le device est déjà mappé
 * Utilise maintenant le Vendor/Product ID pour matcher même si le nom change
 * @param {Gamepad} gamepad - Le gamepad à assigner
 * @param {Array<Gamepad>} allGamepads - Tous les gamepads connectés
 * @param {Object} config - Configuration actuelle
 * @returns {string} Clé unique (deviceId ou deviceId #N)
 */
function getUniqueDeviceKey(gamepad, allGamepads, config) {
  const baseId = gamepad.id;
  const currentVendorProduct = extractVendorProductId(baseId);
  
  // D'abord, essayer de trouver si ce device est déjà mappé dans la config
  // en utilisant le Vendor/Product ID, fingerprint ou lastKnownIndex
  for (const [existingKey, deviceMapping] of Object.entries(config.axisMappings || {})) {
    // Extraire l'ID de base de la clé existante
    const existingMatch = existingKey.match(/^(.+?)(?: #(\d+))?$/);
    const existingBaseId = existingMatch ? existingMatch[1] : existingKey;
    
    // 1. Match par ID exact (comportement original)
    if (existingBaseId === baseId) {
      // Vérifier si le fingerprint correspond
      if (deviceMapping._fingerprint) {
        const fingerprint = deviceMapping._fingerprint;
        const matchesFingerprint = 
          gamepad.axes?.length === fingerprint.axisCount &&
          gamepad.buttons?.length === fingerprint.buttonCount;
        
        if (matchesFingerprint) {
          // Vérifier aussi les axes utilisés si disponibles
          if (fingerprint.usedAxes && fingerprint.usedAxes.length > 0) {
            const deviceHasUsedAxes = fingerprint.usedAxes.every(axisIdx => 
              gamepad.axes && Math.abs(axisIdx) < gamepad.axes.length
            );
            if (deviceHasUsedAxes) {
              console.log(`✅ Réutilisation de la clé existante (ID exact): "${existingKey}"`);
              return existingKey;
            }
          } else {
            // Pas d'axes utilisés encore, mais le fingerprint de base correspond
            console.log(`✅ Réutilisation de la clé existante (ID exact): "${existingKey}"`);
            return existingKey;
          }
        }
      }
      
      // Vérifier aussi par lastKnownIndex si disponible
      if (deviceMapping._lastKnownIndex !== undefined && 
          deviceMapping._lastKnownIndex === gamepad.index) {
        console.log(`✅ Réutilisation de la clé existante (par index): "${existingKey}"`);
        return existingKey;
      }
    }
    
    // 2. Match par Vendor/Product ID (nouveau - pour gérer les changements de nom)
    if (currentVendorProduct) {
      const existingVendorProduct = extractVendorProductId(existingBaseId);
      if (existingVendorProduct && 
          existingVendorProduct.vendorId === currentVendorProduct.vendorId &&
          existingVendorProduct.productId === currentVendorProduct.productId) {
        // Même Vendor/Product ID ! Vérifier le fingerprint pour confirmer
        if (deviceMapping._fingerprint) {
          const fingerprint = deviceMapping._fingerprint;
          const matchesFingerprint = 
            gamepad.axes?.length === fingerprint.axisCount &&
            gamepad.buttons?.length === fingerprint.buttonCount;
          
          if (matchesFingerprint) {
            // Vérifier aussi les axes utilisés si disponibles
            if (fingerprint.usedAxes && fingerprint.usedAxes.length > 0) {
              const deviceHasUsedAxes = fingerprint.usedAxes.every(axisIdx => 
                gamepad.axes && Math.abs(axisIdx) < gamepad.axes.length
              );
              if (deviceHasUsedAxes) {
                console.log(`✅ Réutilisation de la clé existante (Vendor/Product ID): "${existingKey}" (nom changé: "${baseId}")`);
                return existingKey;
              }
            } else {
              // Pas d'axes utilisés encore, mais le fingerprint de base correspond
              console.log(`✅ Réutilisation de la clé existante (Vendor/Product ID): "${existingKey}" (nom changé: "${baseId}")`);
              return existingKey;
            }
          }
        }
      }
    }
  }
  
  // Aucune clé existante trouvée, générer une nouvelle clé
  // Compter combien de devices ont le même ID
  const sameIdDevices = allGamepads.filter(gp => gp && gp.id === baseId);
  
  if (sameIdDevices.length === 1) {
    // Pas de collision, utiliser l'ID tel quel
    return baseId;
  }
  
  // Collision détectée ! Trouver le slot number de ce device
  const slotNumber = sameIdDevices.findIndex(gp => gp.index === gamepad.index) + 1;
  const newKey = `${baseId} #${slotNumber}`;
  console.log(`🆕 Nouvelle clé générée: "${newKey}"`);
  return newKey;
}

/**
 * Mappe un axe d'un device à un type d'axe (Version 2: ID-based avec slots)
 * @param {Gamepad} gamepad - Le gamepad complet
 * @param {number} axisIndex - Index de l'axe
 * @param {string} axisType - Type d'axe (AXIS_TYPES)
 * @param {boolean} invert - Si true, inverse la valeur
 * @param {Object} currentConfig - Configuration actuelle
 * @param {Array<Gamepad>} allGamepads - Tous les gamepads (pour détecter collisions)
 * @returns {Object} Nouvelle configuration
 */
export function mapAxis(gamepad, axisIndex, axisType, invert = false, currentConfig, allGamepads = []) {
  const newConfig = { ...currentConfig };
  newConfig.version = 2;  // S'assurer qu'on est en v2
  
  const deviceIndex = gamepad.index;
  
  // Générer la clé unique (avec slot si collision)
  const deviceKey = getUniqueDeviceKey(gamepad, allGamepads, newConfig);
  
  // Initialiser la structure pour ce device si nécessaire
  if (!newConfig.axisMappings[deviceKey]) {
    newConfig.axisMappings[deviceKey] = {
      axes: {},
      _lastKnownIndex: deviceIndex,
      _baseId: gamepad.id  // Sauvegarder l'ID de base pour recherche
    };
  }
  
  // Mettre à jour le lastKnownIndex
  newConfig.axisMappings[deviceKey]._lastKnownIndex = deviceIndex;
  
  // Retirer le mapping précédent si cet axe était déjà mappé ailleurs
  Object.keys(newConfig.axisMappings).forEach(devKey => {
    const deviceMapping = newConfig.axisMappings[devKey];
    const axes = deviceMapping.axes || deviceMapping;  // Compatibilité v1
    
    Object.keys(axes).forEach(axIdx => {
      if (axIdx.startsWith('_')) return;  // Skip metadata
      
      if (axes[axIdx]?.type === axisType && 
          (devKey !== deviceKey || parseInt(axIdx) !== axisIndex)) {
        delete axes[axIdx];
      }
    });
  });
  
  if (axisType === null || axisType === 'none') {
    delete newConfig.axisMappings[deviceKey].axes[axisIndex];
    // Mettre à jour le fingerprint même après suppression
    const usedAxes = Object.keys(newConfig.axisMappings[deviceKey].axes)
      .filter(key => !key.startsWith('_'))
      .map(key => parseInt(key));
    if (newConfig.axisMappings[deviceKey]._fingerprint) {
      newConfig.axisMappings[deviceKey]._fingerprint.usedAxes = usedAxes;
    }
  } else {
    newConfig.axisMappings[deviceKey].axes[axisIndex] = {
      type: axisType,
      invert: invert
    };
    
    // Créer/mettre à jour le fingerprint des axes pour aider à différencier les devices identiques
    const usedAxes = Object.keys(newConfig.axisMappings[deviceKey].axes)
      .filter(key => !key.startsWith('_'))
      .map(key => parseInt(key));
    newConfig.axisMappings[deviceKey]._fingerprint = {
      axisCount: gamepad.axes?.length || 0,
      buttonCount: gamepad.buttons?.length || 0,
      usedAxes: usedAxes
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
    // Volant : garder [-1, 1] (value déjà correct)
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
 * Trouve un gamepad par sa clé (avec support des slots)
 * @param {string} deviceKey - Clé du device (ID ou ID #N)
 * @param {Array<Gamepad>} gamepads - Liste des gamepads
 * @param {Object} deviceMapping - Mapping du device (avec fingerprint)
 * @returns {Gamepad|null} Le gamepad trouvé ou null
 */
function findGamepadByKey(deviceKey, gamepads, deviceMapping) {
  // Extraire l'ID de base et le slot number (si présent)
  const match = deviceKey.match(/^(.+?)(?: #(\d+))?$/);
  const baseId = match[1];
  const slotNumber = match[2] ? parseInt(match[2]) : null;
  const baseVendorProduct = extractVendorProductId(baseId);
  
  if (slotNumber === null) {
    // Pas de slot, chercher par ID simple
    let found = gamepads.find(gp => gp && gp.id === baseId);
    
    // Si trouvé par ID exact, vérifier le fingerprint
    if (found && deviceMapping._fingerprint) {
      const fingerprint = deviceMapping._fingerprint;
      const matchesFingerprint = 
        found.axes?.length === fingerprint.axisCount &&
        found.buttons?.length === fingerprint.buttonCount;
      
      if (matchesFingerprint) {
        return found;
      }
    }
    
    // Si pas trouvé par ID exact, essayer par Vendor/Product ID
    if (!found && baseVendorProduct) {
      const candidates = gamepads.filter(gp => {
        if (!gp) return false;
        const gpVendorProduct = extractVendorProductId(gp.id);
        return gpVendorProduct && 
               gpVendorProduct.vendorId === baseVendorProduct.vendorId &&
               gpVendorProduct.productId === baseVendorProduct.productId;
      });
      
      // Si on trouve des candidats, utiliser le fingerprint pour choisir le bon
      if (candidates.length > 0 && deviceMapping._fingerprint) {
        const fingerprint = deviceMapping._fingerprint;
        for (const candidate of candidates) {
          const matchesFingerprint = 
            candidate.axes?.length === fingerprint.axisCount &&
            candidate.buttons?.length === fingerprint.buttonCount;
          
          if (matchesFingerprint) {
            // Vérifier aussi les axes utilisés si disponibles
            if (fingerprint.usedAxes && fingerprint.usedAxes.length > 0) {
              const deviceHasUsedAxes = fingerprint.usedAxes.every(axisIdx => 
                candidate.axes && Math.abs(axisIdx) < candidate.axes.length
              );
              if (deviceHasUsedAxes) {
                console.log(`✅ Device trouvé par Vendor/Product ID (nom changé: "${candidate.id}")`);
                return candidate;
              }
            } else {
              console.log(`✅ Device trouvé par Vendor/Product ID (nom changé: "${candidate.id}")`);
              return candidate;
            }
          }
        }
        
        // Si plusieurs candidats mais aucun ne match le fingerprint, prendre le premier
        if (candidates.length === 1) {
          console.log(`⚠️ Device trouvé par Vendor/Product ID mais fingerprint ne match pas exactement`);
          return candidates[0];
        }
      }
    }
    
    return found || null;
  }
  
  // Avec slot, trouver le Nième device avec cet ID
  let sameIdDevices = gamepads.filter(gp => gp && gp.id === baseId);
  
  // Si aucun device avec le même ID, essayer par Vendor/Product ID
  if (sameIdDevices.length === 0 && baseVendorProduct) {
    sameIdDevices = gamepads.filter(gp => {
      if (!gp) return false;
      const gpVendorProduct = extractVendorProductId(gp.id);
      return gpVendorProduct && 
             gpVendorProduct.vendorId === baseVendorProduct.vendorId &&
             gpVendorProduct.productId === baseVendorProduct.productId;
    });
    
    if (sameIdDevices.length > 0) {
      console.log(`⚠️ Device avec slot trouvé par Vendor/Product ID (nom changé)`);
    }
  }
  
  if (sameIdDevices.length === 0) {
    return null;
  }
  
  if (sameIdDevices.length < slotNumber) {
    // Le device à ce slot n'existe plus, mais on peut essayer de le retrouver par fingerprint
    console.warn(`⚠️ Device au slot ${slotNumber} non trouvé, tentative de matching par fingerprint...`);
  }
  
  // Utiliser le fingerprint pour matcher le bon device
  if (deviceMapping._fingerprint) {
    const fingerprint = deviceMapping._fingerprint;
    const lastKnownIndex = deviceMapping._lastKnownIndex;
    
    // Calculer un score pour chaque device candidat
    const candidates = sameIdDevices.map(device => {
      let score = 0;
      
      // Score de base : match des counts
      if (device.axes?.length === fingerprint.axisCount) {
        score += 10;
      }
      if (device.buttons?.length === fingerprint.buttonCount) {
        score += 10;
      }
      
      // Score bonus : match des axes utilisés (plus spécifique)
      if (fingerprint.usedAxes && fingerprint.usedAxes.length > 0) {
        const deviceHasUsedAxes = fingerprint.usedAxes.every(axisIdx => 
          device.axes && axisIdx < device.axes.length
        );
        if (deviceHasUsedAxes) {
          score += 20; // Bonus important pour les axes utilisés
        }
      }
      
      // Score bonus : match du lastKnownIndex (hint de persistance)
      if (lastKnownIndex !== undefined && device.index === lastKnownIndex) {
        score += 15; // Bonus pour l'index connu
      }
      
      return { device, score };
    });
    
    // Trier par score décroissant
    candidates.sort((a, b) => b.score - a.score);
    
    // Prendre le meilleur match si le score est suffisant
    const bestMatch = candidates[0];
    if (bestMatch && bestMatch.score >= 10) { // Au moins un match de base
      console.log(`✅ Device matché avec score ${bestMatch.score} (slot ${slotNumber}, index ${bestMatch.device.index})`);
      return bestMatch.device;
    }
    
    // Si aucun match par fingerprint, essayer quand même le slot number
    if (sameIdDevices.length >= slotNumber) {
      console.warn(`⚠️ Aucun match par fingerprint, utilisation du slot ${slotNumber} comme fallback`);
      return sameIdDevices[slotNumber - 1];
    }
  }
  
  // Fallback : Prendre le Nième device (slot number)
  if (sameIdDevices.length >= slotNumber) {
    return sameIdDevices[slotNumber - 1];
  }
  
  return null;
}

/**
 * Obtient toutes les valeurs mappées pour un type d'axe (Version 2: ID-based avec slots)
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
  
  // Parcourir les devices par leur clé (avec slots)
  for (const [deviceKey, deviceMapping] of Object.entries(config.axisMappings)) {
    // Trouver le gamepad avec cette clé (gère les slots automatiquement)
    const gamepad = findGamepadByKey(deviceKey, gamepads, deviceMapping);
    
    if (!gamepad) {
      // Device pas connecté
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
              // Garder [-1, 1]
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

