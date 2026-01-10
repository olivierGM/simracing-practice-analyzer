/**
 * Service pour mapper les IDs de carModel aux marques automobiles et leurs icônes
 */

// Mapping des IDs de carModel aux marques
// Basé sur les IDs courants dans les jeux GT3
const CAR_MODEL_TO_MANUFACTURER = {
  // Audi
  15: { name: 'Audi', icon: '🔷' },
  // McLaren
  20: { name: 'McLaren', icon: '🟠' },
  // BMW
  32: { name: 'BMW', icon: '🔵' },
  // Ferrari
  33: { name: 'Ferrari', icon: '🔴' },
  // Mercedes-Benz
  35: { name: 'Mercedes', icon: '⚫' },
  // Porsche (ajouter si présent dans les données)
  39: { name: 'Porsche', icon: '🟡' },
  // Lamborghini
  40: { name: 'Lamborghini', icon: '🟣' },
  // Aston Martin
  41: { name: 'Aston Martin', icon: '🔵' },
  // Lexus
  42: { name: 'Lexus', icon: '🟢' },
  // Honda
  43: { name: 'Honda', icon: '🔴' },
  // Nissan
  44: { name: 'Nissan', icon: '🟦' },
  // Jaguar
  45: { name: 'Jaguar', icon: '🟩' }
};

/**
 * Récupère la marque et l'icône à partir d'un ID de carModel
 * @param {number} carModel - ID du modèle de voiture
 * @returns {{name: string, icon: string} | null} - Objet avec le nom et l'icône, ou null si inconnu
 */
export function getManufacturer(carModel) {
  if (!carModel) return null;
  return CAR_MODEL_TO_MANUFACTURER[carModel] || { name: 'Unknown', icon: '🚗' };
}

/**
 * Récupère uniquement l'icône de la marque
 * @param {number} carModel - ID du modèle de voiture
 * @returns {string} - Icône emoji de la marque
 */
export function getManufacturerIcon(carModel) {
  const manufacturer = getManufacturer(carModel);
  return manufacturer ? manufacturer.icon : '🚗';
}

/**
 * Récupère uniquement le nom de la marque
 * @param {number} carModel - ID du modèle de voiture
 * @returns {string} - Nom de la marque
 */
export function getManufacturerName(carModel) {
  const manufacturer = getManufacturer(carModel);
  return manufacturer ? manufacturer.name : 'Unknown';
}
