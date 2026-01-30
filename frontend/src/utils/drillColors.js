/**
 * Table de couleurs centralisée pour tous les drills
 * (Drill une pédale, Frein + Accélérateur, Drill complet).
 *
 * Une seule échelle pour tous les devices : frein, accélérateur, volant (degrés mappés en %).
 * Modifier les ancres ou le mode ici = même rendu partout.
 *
 * Modes :
 * - gradient : dégradé continu entre les ancres
 * - discrete : couleur par palier (incréments de 5 %)
 */

// --- Configuration : ancres de couleur (0 % à 100 %) ---
// Modifier uniquement ici pour changer les couleurs partout.
// Pour des paliers à 5 %, ajouter des ancres : 0, 5, 10, 15, …, 100.
const PERCENT_ANCHORS = [
  { percent: 0, color: '#666666' },
  { percent: 20, color: '#22B14C' },
  { percent: 40, color: '#EF2B2D' },
  { percent: 60, color: '#FFC600' },
  { percent: 80, color: '#3E75C3' },
  { percent: 100, color: '#F66A00' }
];

/** true = dégradé entre les ancres ; false = paliers discrets (5 %) */
const USE_GRADIENT = true;

/** Plage des degrés volant pour le drill complet (-175 à 175 = même échelle que 0–100 %) */
const WHEEL_DEGREE_MIN = -175;
const WHEEL_DEGREE_MAX = 175;

// --- Helpers ---
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

const ANCHORS_WITH_RGB = PERCENT_ANCHORS.map(({ percent, color }) => ({
  percent,
  color,
  rgb: hexToRgb(color)
}));

function interpolateBetweenAnchors(percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  let lower = ANCHORS_WITH_RGB[0];
  let upper = ANCHORS_WITH_RGB[ANCHORS_WITH_RGB.length - 1];
  for (let j = 0; j < ANCHORS_WITH_RGB.length - 1; j++) {
    if (clamped >= ANCHORS_WITH_RGB[j].percent && clamped <= ANCHORS_WITH_RGB[j + 1].percent) {
      lower = ANCHORS_WITH_RGB[j];
      upper = ANCHORS_WITH_RGB[j + 1];
      break;
    }
  }
  const range = upper.percent - lower.percent;
  const position = range === 0 ? 0 : (clamped - lower.percent) / range;
  const { r: r1, g: g1, b: b1 } = lower.rgb;
  const { r: r2, g: g2, b: b2 } = upper.rgb;
  return `rgb(${Math.round(r1 + (r2 - r1) * position)}, ${Math.round(g1 + (g2 - g1) * position)}, ${Math.round(b1 + (b2 - b1) * position)})`;
}

/** Table par pas de 5 % (0, 5, 10, …, 100) dérivée des ancres pour le mode discret */
const DISCRETE_TABLE_5 = (() => {
  const out = [];
  for (let p = 0; p <= 100; p += 5) {
    out.push({ percent: p, color: interpolateBetweenAnchors(p) });
  }
  return out;
})();

function getColorForPercentInternal(percent, forceGradient) {
  const useGrad = forceGradient ?? USE_GRADIENT;
  const clamped = Math.max(0, Math.min(100, percent));

  if (useGrad) {
    return interpolateBetweenAnchors(clamped);
  }

  const step = 5;
  const nearest = Math.round(clamped / step) * step;
  const clampedNearest = Math.max(0, Math.min(100, nearest));
  const entry = DISCRETE_TABLE_5.find((e) => e.percent === clampedNearest);
  return entry ? entry.color : DISCRETE_TABLE_5[DISCRETE_TABLE_5.length - 1].color;
}

/**
 * Retourne la couleur pour un pourcentage (0–100).
 * Utilisé pour : frein, accélérateur, et toute valeur en %.
 */
export function getColorForPercent(percent) {
  return getColorForPercentInternal(percent, USE_GRADIENT);
}

/**
 * Retourne la couleur pour un angle volant en degrés.
 * Même échelle que les % : (angle - min) / (max - min) * 100 → getColorForPercent.
 */
export function getColorForDegrees(angle, minDeg = WHEEL_DEGREE_MIN, maxDeg = WHEEL_DEGREE_MAX) {
  const range = maxDeg - minDeg;
  if (range <= 0) return getColorForPercent(50);
  const percent = ((angle - minDeg) / range) * 100;
  return getColorForPercent(percent);
}

/** Ancres de la table (lecture seule, pour légende ou debug) */
export function getPercentAnchors() {
  return PERCENT_ANCHORS.slice();
}

/** Table discrète 0, 5, …, 100 (lecture seule) */
export function getDiscreteTable5() {
  return DISCRETE_TABLE_5.slice();
}

/** Mode actuel : true = dégradé, false = paliers 5 % */
export function isGradientMode() {
  return USE_GRADIENT;
}
