/**
 * Service pour mapper les IDs de carModel aux marques automobiles et leurs logos
 * 
 * Tous les logos sont hébergés localement dans /public/logos/
 * - SVG : Aston Martin, Audi, BMW, Honda, Lamborghini, Mercedes, Unknown
 * - PNG : Alpine, Bentley, Chevrolet, Ferrari, Ford, Ginetta, Jaguar, KTM, Lexus, Maserati, McLaren, Nissan, Porsche
 */

// Mapping des IDs de carModel aux marques
// Basé sur la liste officielle ACC fournie par l'utilisateur
const CAR_MODEL_TO_MANUFACTURER = {
  // GT3 Cars
  0: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 991 GT3 R' },
  1: { name: 'Mercedes', logoUrl: '/logos/mercedes.svg', fullName: 'Mercedes-AMG GT3' },
  2: { name: 'Ferrari', logoUrl: '/logos/ferrari.png', fullName: 'Ferrari 488 GT3' },
  3: { name: 'Audi', logoUrl: '/logos/audi.svg', fullName: 'Audi R8 LMS' },
  4: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Huracan GT3' },
  5: { name: 'McLaren', logoUrl: '/logos/mclaren.png', fullName: 'McLaren 650S GT3' },
  6: { name: 'Nissan', logoUrl: '/logos/nissan.svg', fullName: 'Nissan GT-R Nismo GT3 2018' },
  7: { name: 'BMW', logoUrl: '/logos/bmw.svg', fullName: 'BMW M6 GT3' },
  8: { name: 'Bentley', logoUrl: '/logos/bentley.svg', fullName: 'Bentley Continental GT3 2018' },
  9: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 991II GT3 Cup' },
  10: { name: 'Nissan', logoUrl: '/logos/nissan.svg', fullName: 'Nissan GT-R Nismo GT3 2017' },
  11: { name: 'Bentley', logoUrl: '/logos/bentley.svg', fullName: 'Bentley Continental GT3 2016' },
  12: { name: 'Aston Martin', logoUrl: '/logos/aston-martin.svg', fullName: 'Aston Martin V12 Vantage GT3' },
  13: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Gallardo R-EX' },
  14: { name: 'Jaguar', logoUrl: '/logos/jaguar.png', fullName: 'Jaguar G3' },
  15: { name: 'Lexus', logoUrl: '/logos/lexus.png', fullName: 'Lexus RC F GT3' },
  16: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Huracan Evo (2019)' },
  17: { name: 'Honda', logoUrl: '/logos/honda.svg', fullName: 'Honda NSX GT3' },
  18: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Huracan SuperTrofeo' },
  19: { name: 'Audi', logoUrl: '/logos/audi.svg', fullName: 'Audi R8 LMS Evo (2019)' },
  20: { name: 'Aston Martin', logoUrl: '/logos/aston-martin.svg', fullName: 'AMR V8 Vantage (2019)' },
  21: { name: 'Honda', logoUrl: '/logos/honda.svg', fullName: 'Honda NSX Evo (2019)' },
  22: { name: 'McLaren', logoUrl: '/logos/mclaren.png', fullName: 'McLaren 720S GT3 (2019)' },
  23: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 911II GT3 R (2019)' },
  24: { name: 'Ferrari', logoUrl: '/logos/ferrari.png', fullName: 'Ferrari 488 GT3 Evo 2020' },
  25: { name: 'Mercedes', logoUrl: '/logos/mercedes.svg', fullName: 'Mercedes-AMG GT3 2020' },
  26: { name: 'Ferrari', logoUrl: '/logos/ferrari.png', fullName: 'Ferrari 488 Challenge Evo' },
  27: { name: 'BMW', logoUrl: '/logos/bmw.svg', fullName: 'BMW M2 CS Racing' },
  28: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 911 GT3 Cup (Type 992)' },
  29: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Huracán Super Trofeo EVO2' },
  30: { name: 'BMW', logoUrl: '/logos/bmw.svg', fullName: 'BMW M4 GT3' },
  31: { name: 'Audi', logoUrl: '/logos/audi.svg', fullName: 'Audi R8 LMS GT3 evo II' },
  32: { name: 'Ferrari', logoUrl: '/logos/ferrari.png', fullName: 'Ferrari 296 GT3' },
  33: { name: 'Lamborghini', logoUrl: '/logos/lamborghini.svg', fullName: 'Lamborghini Huracan Evo2' },
  34: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 992 GT3 R' },
  35: { name: 'McLaren', logoUrl: '/logos/mclaren.png', fullName: 'McLaren 720S GT3 Evo 2023' },
  36: { name: 'Ford', logoUrl: '/logos/ford.png', fullName: 'Ford Mustang GT3' },
  // GT4 Cars
  50: { name: 'Alpine', logoUrl: '/logos/alpine.png', fullName: 'Alpine A110 GT4' },
  51: { name: 'Aston Martin', logoUrl: '/logos/aston-martin.svg', fullName: 'AMR V8 Vantage GT4' },
  52: { name: 'Audi', logoUrl: '/logos/audi.svg', fullName: 'Audi R8 LMS GT4' },
  53: { name: 'BMW', logoUrl: '/logos/bmw.svg', fullName: 'BMW M4 GT4' },
  55: { name: 'Chevrolet', logoUrl: '/logos/chevrolet.png', fullName: 'Chevrolet Camaro GT4' },
  56: { name: 'Ginetta', logoUrl: '/logos/ginetta.png', fullName: 'Ginetta G55 GT4' },
  57: { name: 'KTM', logoUrl: '/logos/ktm.png', fullName: 'KTM X-Bow GT4' },
  58: { name: 'Maserati', logoUrl: '/logos/maserati.png', fullName: 'Maserati MC GT4' },
  59: { name: 'McLaren', logoUrl: '/logos/mclaren.png', fullName: 'McLaren 570S GT4' },
  60: { name: 'Mercedes', logoUrl: '/logos/mercedes.svg', fullName: 'Mercedes-AMG GT4' },
  61: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 718 Cayman GT4' },
  // GT2 Cars
  80: { name: 'Audi', logoUrl: '/logos/audi.svg', fullName: 'Audi R8 LMS GT2' },
  82: { name: 'KTM', logoUrl: '/logos/ktm.png', fullName: 'KTM XBOW GT2' },
  83: { name: 'Maserati', logoUrl: '/logos/maserati.png', fullName: 'Maserati MC20 GT2' },
  84: { name: 'Mercedes', logoUrl: '/logos/mercedes.svg', fullName: 'Mercedes AMG GT2' },
  85: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 911 GT2 RS CS Evo' },
  86: { name: 'Porsche', logoUrl: '/logos/porsche.png', fullName: 'Porsche 935' }
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
    return { name: 'Unknown', logoUrl: '/logos/unknown.svg' };
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
  return manufacturer ? manufacturer.logoUrl : '/logos/unknown.svg';
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
