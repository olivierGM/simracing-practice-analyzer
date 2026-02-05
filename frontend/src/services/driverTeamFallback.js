/**
 * Mapping pilote → équipe (fallback quand car.teamName est vide dans les sessions).
 * Source: liste extraite de l'image roster (50 pilotes).
 */

const DRIVER_TO_TEAM = {
  'Jean-Luc Marchand': 'Forge',
  'Michael Formato': 'Forge',
  'Johnny Guérin': "L'équipe",
  'Marc-Andre Hamel': "L'équipe",
  'Claude Labrecque': 'LabRacing',
  'Pierre-Etienne Longuez': "L'équipe",
  'Tommy Landry': 'NEXUS PASSIONSIM',
  'Jeff Collins': 'LAPS Simsport',
  'Kevin Godin': "L'équipe",
  'Cedric Couturier': "L'équipe",
  'Nicolas Plante': 'Sarto',
  'Carl Baillargeon': 'VNET',
  'Daniel Dubé': 'VNET',
  'Dany Fillion': "L'équipe",
  'David Boucher': 'RCDB',
  'Eric Fillion': 'EFI Racing',
  'Francis Plante': 'Sarto',
  'Francis Tougas': 'LimitRacing',
  'Gabriel Lafrenaye': 'VNET',
  'Guillaume Madore': 'MSR Motorsports',
  'Jean-Benoit Richard': "L'équipe",
  'Jean-Sebastien Cotte': 'CHoKo Racing',
  'Jérémy Martin': 'Forzielo Racing Team',
  'Martin Lesage': 'MOFO',
  'Mathieu Cote': "NIVE'ART",
  'Michel Melo': 'mcorse',
  'Nathan Barbosa': 'LimitRacing',
  'Nicolas Gaudreault': 'VNET',
  'Olivier Guénette': "L'équipe",
  'Olivier Lagacé': 'VNET',
  'Peter Gifford': 'RCM',
  'Philippe Guitard': 'LimitRacing',
  'Steve St-Ours': 'DSP',
  'Steven Pacheco': 'Pork Chop',
  'Victor Plourde': 'DSP',
  'Vincent Dubuc': 'KB&VD',
  'Vincent Roy': 'VNET',
  'Zachary Boudreault': 'DSP',
  'Julien Pichette': 'U8R',
  'Francois Richard': 'U8R',
};

/**
 * Retourne le nom d'équipe pour un pilote (fallback si les données session n'ont pas teamName).
 * @param {string} driverName - Nom complet du pilote (ex: "Jean-Luc Marchand")
 * @returns {string} Nom d'équipe ou ''
 */
export function getTeamNameFallback(driverName) {
  if (!driverName || typeof driverName !== 'string') return '';
  const trimmed = driverName.trim();
  return DRIVER_TO_TEAM[trimmed] || '';
}
