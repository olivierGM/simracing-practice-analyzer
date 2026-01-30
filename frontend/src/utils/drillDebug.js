/**
 * Mode debug pour les drills : rejeu de scénarios d'inputs et log des jugements.
 * Permet de tester les drills sans inputs réels (pour toi ou pour Playwright).
 *
 * Activation : ?drillDebug=1 dans l'URL (ex. /pedal-wheel-drills?drillDebug=1)
 *
 * Scénario : tableau de keyframes { t, brake?, accelerator?, wheel?, shiftUp?, shiftDown? }
 *   - t = temps du drill en secondes
 *   - brake, accelerator : 0–1 (ex. 0.6 = 60 %)
 *   - wheel : degrés (-175 à 175) pour Drill Complet
 *   - shiftUp, shiftDown : 1 ou true pour déclencher
 * Valeur à un instant T = dernière keyframe avec keyframe.t <= T
 *
 * API exposée sur window.__DRILL_DEBUG__ (pour Playwright) :
 *   setScenario(array), getLog(), clearLog(), isActive(), getValue(time, key)
 */

let scenario = [];
const judgmentLog = [];

function isActive() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('drillDebug') === '1' || params.get('drillDebug') === 'true';
}

function setScenario(next) {
  scenario = (Array.isArray(next) ? next : []).slice().sort((a, b) => a.t - b.t);
  judgmentLog.length = 0;
}

function getValue(time, key) {
  if (!scenario.length) return undefined;
  let last = undefined;
  for (let i = 0; i < scenario.length; i++) {
    if (scenario[i].t <= time && scenario[i][key] !== undefined) {
      last = scenario[i][key];
    }
  }
  return last;
}

function logJudgment(judgment, lane, time, extra = {}) {
  judgmentLog.push({ judgment, lane: lane || 'main', time: time ?? performance.now() / 1000, ...extra });
}

function getLog() {
  return judgmentLog.slice();
}

function clearLog() {
  judgmentLog.length = 0;
}

export const drillDebug = {
  isActive,
  setScenario,
  getValue,
  logJudgment,
  getLog,
  clearLog
};

if (typeof window !== 'undefined') {
  window.__DRILL_DEBUG__ = {
    isActive,
    setScenario,
    getValue,
    logJudgment,
    getLog,
    clearLog
  };
}
