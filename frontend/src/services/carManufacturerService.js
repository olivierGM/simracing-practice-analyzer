/**
 * Service pour mapper les IDs de carModel aux marques automobiles et leurs logos
 * 
 * Utilise Simple Icons CDN pour les logos SVG des marques automobiles
 * https://simpleicons.org/
 */

// Mapping des IDs de carModel aux marques
// Basé sur les IDs courants dans les jeux GT3
// Utilise des logos SVG hébergés publiquement
// Sources: Wikimedia Commons, BrandsLogos.com, ou autres sources publiques
const CAR_MODEL_TO_MANUFACTURER = {
  // Audi
  8: { name: 'Audi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' },
  15: { name: 'Audi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' },
  // McLaren
  20: { name: 'McLaren', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/McLaren_logo.svg' },
  // Bentley
  25: { name: 'Bentley', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Car_icon.svg' },
  // Porsche
  30: { name: 'Porsche', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Porsche_logo.svg' },
  // Ferrari
  31: { name: 'Ferrari', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Ferrari_logo.svg' },
  // BMW
  32: { name: 'BMW', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' },
  // Ferrari (autre modèle)
  33: { name: 'Ferrari', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Ferrari_logo.svg' },
  // Aston Martin
  34: { name: 'Aston Martin', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Aston_Martin_Lagonda_logo.svg' },
  // Mercedes-Benz
  35: { name: 'Mercedes', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg' },
  // Porsche (autre modèle)
  39: { name: 'Porsche', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Porsche_logo.svg' },
  // Lamborghini
  40: { name: 'Lamborghini', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Lamborghini_logo.svg' },
  // Aston Martin (autre modèle)
  41: { name: 'Aston Martin', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Aston_Martin_Lagonda_logo.svg' },
  // Lexus
  42: { name: 'Lexus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Lexus_logo.svg' },
  // Honda
  43: { name: 'Honda', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Honda_Logo.svg' },
  // Nissan
  44: { name: 'Nissan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_logo.svg' },
  // Jaguar
  45: { name: 'Jaguar', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/11/Jaguar_logo.svg' }
};

/**
 * Récupère la marque et les infos du logo à partir d'un ID de carModel
 * @param {number} carModel - ID du modèle de voiture
 * @returns {{name: string, logoUrl: string} | null} - Objet avec les infos du logo
 */
export function getManufacturer(carModel) {
  if (!carModel) return null;
  const manufacturer = CAR_MODEL_TO_MANUFACTURER[carModel];
  if (!manufacturer) {
    // Logo par défaut (voiture générique)
    return { name: 'Unknown', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Car_icon.svg' };
  }
  return manufacturer;
}

/**
 * Récupère l'URL du logo de la marque
 * @param {number} carModel - ID du modèle de voiture
 * @returns {string} - URL du logo SVG
 */
export function getManufacturerLogoUrl(carModel) {
  const manufacturer = getManufacturer(carModel);
  return manufacturer ? manufacturer.logoUrl : 'https://upload.wikimedia.org/wikipedia/commons/9/90/Car_icon.svg';
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
