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
// Logos téléchargés localement depuis Wikimedia (espacés pour éviter le blocage)
const CAR_MODEL_TO_MANUFACTURER = {
  // GT3 Cars
  0: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 991 GT3 R' },
  1: { name: 'Mercedes', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg', fullName: 'Mercedes-AMG GT3' },
  2: { name: 'Ferrari', logoUrl: '/logos/ferrari.png', fullName: 'Ferrari 488 GT3' },
  3: { name: 'Audi', logoUrl: '/logos/audi.png', fullName: 'Audi R8 LMS' },
  4: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Huracan GT3' },
  5: { name: 'McLaren', logoUrl: '/logos/mclaren.png', fullName: 'McLaren 650S GT3' },
  6: { name: 'Nissan', logoUrl: '/logos/nissan.png', fullName: 'Nissan GT-R Nismo GT3 2018' },
  7: { name: 'BMW', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg', fullName: 'BMW M6 GT3' },
  8: { name: 'Bentley', logoUrl: '/logos/bentley.png', fullName: 'Bentley Continental GT3 2018' },
  9: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 991II GT3 Cup' },
  10: { name: 'Nissan', logoUrl: '/logos/nissan.png', fullName: 'Nissan GT-R Nismo GT3 2017' },
  11: { name: 'Bentley', logoUrl: '/logos/bentley.png', fullName: 'Bentley Continental GT3 2016' },
  12: { name: 'Aston Martin', logoUrl: '/logos/aston-martin.png', fullName: 'Aston Martin V12 Vantage GT3' },
  13: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Gallardo R-EX' },
  14: { name: 'Jaguar', logoUrl: '/logos/jaguar.png', fullName: 'Jaguar G3' },
  15: { name: 'Lexus', logoUrl: '/logos/lexus.png', fullName: 'Lexus RC F GT3' },
  16: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Huracan Evo (2019)' },
  17: { name: 'Honda', logoUrl: '/logos/honda.svg', fullName: 'Honda NSX GT3' },
  18: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Huracan SuperTrofeo' },
  19: { name: 'Audi', logoUrl: '/logos/audi.png', fullName: 'Audi R8 LMS Evo (2019)' },
  20: { name: 'Aston Martin', logoUrl: '/logos/aston-martin.png', fullName: 'AMR V8 Vantage (2019)' },
  21: { name: 'Honda', logoUrl: '/logos/honda.svg', fullName: 'Honda NSX Evo (2019)' },
  22: { name: 'McLaren', logoUrl: '/logos/mclaren.png', fullName: 'McLaren 720S GT3 (2019)' },
  23: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 911II GT3 R (2019)' },
  24: { name: 'Ferrari', logoUrl: '/logos/ferrari.png', fullName: 'Ferrari 488 GT3 Evo 2020' },
  25: { name: 'Mercedes', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg', fullName: 'Mercedes-AMG GT3 2020' },
  30: { name: 'BMW', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg', fullName: 'BMW M4 GT3' },
  31: { name: 'Audi', logoUrl: '/logos/audi.png', fullName: 'Audi R8 LMS GT3 evo II' },
  32: { name: 'Ferrari', logoUrl: '/logos/ferrari.png', fullName: 'Ferrari 296 GT3' },
  33: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Huracan Evo2' },
  34: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 992 GT3 R' },
  35: { name: 'McLaren', logoUrl: '/logos/mclaren.png', fullName: 'McLaren 720S GT3 Evo 2023' }
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

export function getCarFullName(carModel) {
  const manufacturer = getManufacturer(carModel);
  return manufacturer ? manufacturer.fullName : 'Unknown';
}
