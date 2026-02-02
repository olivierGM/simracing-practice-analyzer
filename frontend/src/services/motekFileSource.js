/**
 * Connecteur Motek (.ld / .ldx) vers ExerciseDefinition
 *
 * Utilise fast-xml-parser pour un parsing robuste du .ldx (XML).
 * Supporte :
 * - Markers avec Type, Time, Percent, Angle, Duration (notre format étendu)
 * - Beacons MoTec (Marker avec Time en microsecondes)
 * - Details (Total Laps, Fastest Time) si présents
 *
 * .ld = binaire (télémétrie) — non supporté (requiert ldparser/motec-parser côté serveur)
 */

import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ''
});

/**
 * Parse le contenu XML d'un fichier .ldx
 * Exporté pour les tests unitaires
 * @param {string} text
 * @param {string} fileName
 * @returns {{ name: string, mapName: string, targets: Array, metadata?: object }}
 */
export function parseLdxXml(text, fileName) {
  const mapName = extractMapNameFromFileName(fileName);
  const name = fileName.replace(/\.ldx$/i, '');

  let parsed;
  try {
    parsed = xmlParser.parse(text);
  } catch (e) {
    throw new Error('Format XML invalide');
  }

  const targets = [];
  const metadata = {};

  const ldx = parsed?.LDXFile;
  if (!ldx) throw new Error('Format LDX invalide (pas de LDXFile)');

  const layers = [].concat(ldx.Layers?.Layer ?? []);
  for (const layer of layers) {
    const markerBlock = layer.MarkerBlock;
    if (!markerBlock) continue;

    const groups = [].concat(markerBlock.MarkerGroup ?? []);
    for (const group of groups) {
      const markers = [].concat(group.Marker ?? []);
      for (const m of markers) {
        const att = typeof m === 'object' && m !== null ? m : {};
        const timeRaw = att.Time ?? att.time ?? 0;
        const timeSec = timeRaw > 1e5 ? timeRaw / 1e6 : parseFloat(timeRaw);
        const typeAttr = (att.Type ?? att.type ?? 'brake').toString().toLowerCase();
        const percent = parseFloat(att.Percent ?? att.percent ?? 50);
        const angle = parseFloat(att.Angle ?? att.angle ?? 0);
        const duration = parseFloat(att.Duration ?? att.duration ?? 1);

        if (typeAttr === 'brake' || typeAttr === 'accel') {
          targets.push({ type: typeAttr, time: timeSec, percent, duration });
        } else if (typeAttr === 'wheel') {
          targets.push({ type: 'wheel', time: timeSec, angle, duration });
        } else if (typeAttr === 'shift_up' || typeAttr === 'shift_down') {
          targets.push({ type: typeAttr, time: timeSec, duration: 0 });
        }
      }
    }
  }

  const allLayers = [].concat(ldx.Layers?.Layer ?? []);
  let details = [];
  for (const layer of allLayers) {
    details = details.concat(layer.Details?.String ?? []);
  }
  for (const d of details) {
    const att = typeof d === 'object' && d !== null ? d : {};
    const id = att.Id ?? att.id;
    const val = att.Value ?? att.value;
    if (id === 'Total Laps') metadata.totalLaps = parseInt(val, 10);
    if (id === 'Fastest Time') metadata.fastestTime = String(val ?? '');
    if (id === 'Fastest Lap') metadata.fastestLap = parseInt(val, 10);
  }

  return { name, mapName, targets, metadata };
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

    const parseFastestTimeToSeconds = (str) => {
      if (!str || typeof str !== 'string') return null;
      const parts = str.trim().split(':');
      if (parts.length === 2) {
        const [min, secStr] = parts;
        const [sec, ms = '0'] = (secStr || '0').replace(',', '.').split('.');
        return (parseInt(min, 10) * 60) + parseInt(sec, 10) + (parseInt(ms, 10) / Math.pow(10, ms.length));
      }
      if (parts.length === 3) {
        return (parseInt(parts[0], 10) * 3600) + (parseInt(parts[1], 10) * 60) + parseFloat(parts[2] || 0);
      }
      return null;
    };

    if (result.targets.length === 0) {
      const fromMeta = result.metadata?.fastestTime ? parseFastestTimeToSeconds(result.metadata.fastestTime) : null;
      const lapDuration = fromMeta ?? (result.mapName === 'Barcelona' ? 102 : 90);
      return {
        type: 'random',
        difficulty: 'medium',
        duration: lapDuration,
        name: result.name,
        mapName: result.mapName
      };
    }

    const computedDuration = Math.max(...result.targets.map((t) => t.time + (t.duration || 1)));
    return {
      targets: result.targets,
      name: result.name,
      mapName: result.mapName,
      duration: computedDuration
    };
  }
};
