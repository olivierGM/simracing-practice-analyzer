/**
 * Connecteur Motek (.ld / .ldx) vers ExerciseDefinition
 *
 * .ldx = XML (metadata, beacons, markers)
 * .ld = binaire (télémétrie) — non supporté pour l'instant
 */

/**
 * Parse le contenu XML d'un fichier .ldx
 * Exporté pour les tests unitaires
 * @param {string} text
 * @param {string} fileName
 * @returns {{ name: string, mapName: string, targets: Array }}
 */
export function parseLdxXml(text, fileName) {
  const mapName = extractMapNameFromFileName(fileName);
  const name = fileName.replace(/\.ldx$/i, '');

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Format XML invalide');
  }

  const targets = [];
  const markerGroups = doc.querySelectorAll('MarkerGroup');
  markerGroups.forEach((group) => {
    const markers = group.querySelectorAll('Marker');
    markers.forEach((marker) => {
      const time = parseFloat(marker.getAttribute('Time') || marker.getAttribute('time') || 0);
      const typeAttr = marker.getAttribute('Type') || marker.getAttribute('type') || 'brake';
      const percent = parseFloat(marker.getAttribute('Percent') || marker.getAttribute('percent') || 50);
      const angle = parseFloat(marker.getAttribute('Angle') || marker.getAttribute('angle') || 0);
      const duration = parseFloat(marker.getAttribute('Duration') || marker.getAttribute('duration') || 1);

      const type = String(typeAttr).toLowerCase();
      if (type === 'brake' || type === 'accel') {
        targets.push({ type, time, percent, duration });
      } else if (type === 'wheel') {
        targets.push({ type: 'wheel', time, angle, duration });
      } else if (type === 'shift_up' || type === 'shift_down') {
        targets.push({ type, time, duration: 0 });
      }
    });
  });

  return { name, mapName, targets };
}

function extractMapNameFromFileName(fileName) {
  const base = fileName.replace(/\.(ld|ldx)$/i, '');
  const parts = base.split('-');
  return parts[0] || base;
}

/**
 * Vérifie si un ArrayBuffer ressemble à du texte (XML)
 */
function isTextLike(buffer) {
  const bytes = new Uint8Array(buffer.slice(0, 100));
  let printable = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] >= 32 && bytes[i] < 127) printable++;
  }
  return printable > 80;
}

/**
 * MotekFileSource — charge un fichier .ld ou .ldx
 * @returns {Promise<ExerciseDefinition>}
 */
export const motekFileSource = {
  async load(file) {
    if (!file || typeof file.name !== 'string') {
      throw new Error('Input doit être un objet File');
    }

    const ext = (file.name || '').toLowerCase();
    if (!ext.endsWith('.ld') && !ext.endsWith('.ldx')) {
      throw new Error('Format non supporté. Utilisez un fichier .ld ou .ldx');
    }

    const getText = () => {
      if (typeof file.text === 'function') return file.text();
      if (typeof file.arrayBuffer === 'function') {
        return file.arrayBuffer().then((buf) => new TextDecoder('utf-8').decode(buf));
      }
      return Promise.reject(new Error('File doit avoir .text() ou .arrayBuffer()'));
    };

    if (ext.endsWith('.ld')) {
      const buffer = await file.arrayBuffer();
      if (isTextLike(buffer)) {
        const text = new TextDecoder('utf-8').decode(buffer);
        if (text.trimStart().startsWith('<?xml') || text.trimStart().startsWith('<')) {
          return parseLdxXml(text, file.name);
        }
      }
      throw new Error('Format .ld binaire non supporté. Utilisez un fichier .ldx (XML).');
    }

    const text = await getText();
    const result = parseLdxXml(text, file.name);

    if (result.targets.length === 0) {
      throw new Error(
        `Aucune étape détectée dans le fichier. Le fichier .ldx doit contenir des marqueurs (Marker) dans les MarkerGroup.`
      );
    }

    return {
      targets: result.targets,
      name: result.name,
      mapName: result.mapName,
      duration: Math.max(...result.targets.map((t) => t.time + (t.duration || 1)))
    };
  }
};
