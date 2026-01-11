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
// Mapping officiel basé sur la liste ACC fournie
const CAR_MODEL_TO_MANUFACTURER = {
  // GT3 Cars
  0: { name: 'Porsche', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Porsche_logo.svg' }, // 991 GT3 R
  1: { name: 'Mercedes', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg' }, // AMG GT3
  2: { name: 'Ferrari', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Ferrari_logo.svg' }, // 488 GT3
  3: { name: 'Audi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' }, // R8 LMS
  4: { name: 'Lamborghini', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Lamborghini_logo.svg' }, // Huracan GT3
  5: { name: 'McLaren', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/McLaren_logo.svg' }, // 650S GT3
  6: { name: 'Nissan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_logo.svg' }, // GT-R Nismo GT3 2018
  7: { name: 'BMW', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' }, // M6 GT3
  8: { name: 'Bentley', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Car_icon.svg' }, // Continental GT3 2018
  9: { name: 'Porsche', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Porsche_logo.svg' }, // 991II GT3 Cup
  10: { name: 'Nissan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_logo.svg' }, // GT-R Nismo GT3 2017
  11: { name: 'Bentley', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Car_icon.svg' }, // Continental GT3 2016
  12: { name: 'Aston Martin', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Aston_Martin_Lagonda_logo.svg' }, // V12 Vantage GT3
  13: { name: 'Lamborghini', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Lamborghini_logo.svg' }, // Gallardo R-EX
  14: { name: 'Jaguar', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/11/Jaguar_logo.svg' }, // G3
  15: { name: 'Lexus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Lexus_logo.svg' }, // RC F GT3
  16: { name: 'Lamborghini', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Lamborghini_logo.svg' }, // Huracan Evo 2019
  17: { name: 'Honda', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Honda_Logo.svg' }, // NSX GT3
  18: { name: 'Lamborghini', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Lamborghini_logo.svg' }, // Huracan SuperTrofeo
  19: { name: 'Audi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' }, // R8 LMS Evo 2019
  20: { name: 'Aston Martin', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Aston_Martin_Lagonda_logo.svg' }, // V8 Vantage 2019
  21: { name: 'Honda', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Honda_Logo.svg' }, // NSX Evo 2019
  22: { name: 'McLaren', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/McLaren_logo.svg' }, // 720S GT3 2019
  23: { name: 'Porsche', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Porsche_logo.svg' }, // 911II GT3 R 2019
  24: { name: 'Ferrari', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Ferrari_logo.svg' }, // 488 GT3 Evo 2020
  25: { name: 'Mercedes', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg' }, // AMG GT3 2020
  30: { name: 'BMW', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' }, // M4 GT3
  31: { name: 'Audi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' }, // R8 LMS GT3 evo II
  32: { name: 'Ferrari', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Ferrari_logo.svg' }, // 296 GT3
  33: { name: 'Lamborghini', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Lamborghini_logo.svg' }, // Huracan Evo2
  34: { name: 'Porsche', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Porsche_logo.svg' }, // 992 GT3 R
  35: { name: 'McLaren', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/McLaren_logo.svg' } // 720S GT3 Evo 2023
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
