/**
 * Hook useDrillEngine
 * 
 * Gère la logique des drills :
 * - Calcul des scores
 * - Détection si l'utilisateur est dans la zone cible
 * - Gestion du timer
 * - Calcul des statistiques
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const DRILL_TYPES = {
  PERCENTAGE: 'percentage',
  BRAKE_ACCEL: 'brakeaccel',
  COMBINED_VERTICAL: 'combined_vertical'
};

export const ZONE_STATUS = {
  IN_TARGET: 'in_target',      // Dans la zone cible (vert)
  CLOSE: 'close',               // Proche de la zone (jaune)
  OUT: 'out'                    // Hors zone (rouge)
};

/**
 * Hook pour gérer un drill de pourcentages
 * @param {Object} options - Options du drill
 * @param {number} options.targetPercent - Pourcentage cible (0-100)
 * @param {number} options.tolerance - Tolérance en pourcentage (défaut: 2)
 * @param {number} options.currentValue - Valeur actuelle (0-1)
 * @param {boolean} options.isActive - Si le drill est actif
 * @returns {Object} État et statistiques du drill
 */
export function usePercentageDrill({ targetPercent, tolerance = 2, currentValue, isActive }) {
  const [score, setScore] = useState(0);
  const [timeInZone, setTimeInZone] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [zoneStatus, setZoneStatus] = useState(ZONE_STATUS.OUT);
  const [accuracy, setAccuracy] = useState(0);
  
  const startTimeRef = useRef(null);
  const lastUpdateRef = useRef(null);
  const inZoneRef = useRef(false);

  // Calculer le statut de la zone
  const calculateZoneStatus = useCallback((value) => {
    const currentPercent = value * 100;
    const diff = Math.abs(currentPercent - targetPercent);
    
    if (diff <= tolerance) {
      return ZONE_STATUS.IN_TARGET;
    } else if (diff <= tolerance * 2) {
      return ZONE_STATUS.CLOSE;
    } else {
      return ZONE_STATUS.OUT;
    }
  }, [targetPercent, tolerance]);

  // Calculer la précision (0-100%)
  const calculateAccuracy = useCallback((value) => {
    const currentPercent = value * 100;
    const diff = Math.abs(currentPercent - targetPercent);
    const maxDiff = tolerance * 2; // Au-delà de 2x la tolérance, précision = 0
    
    if (diff >= maxDiff) {
      return 0;
    }
    
    // Précision décroît linéairement de 100% à 0%
    return Math.max(0, 100 - (diff / maxDiff) * 100);
  }, [targetPercent, tolerance]);

  // Mettre à jour les statistiques
  useEffect(() => {
    if (!isActive) {
      startTimeRef.current = null;
      lastUpdateRef.current = null;
      return;
    }

    const now = Date.now();
    
    if (!startTimeRef.current) {
      startTimeRef.current = now;
      lastUpdateRef.current = now;
      return;
    }

    const deltaTime = (now - lastUpdateRef.current) / 1000; // En secondes
    lastUpdateRef.current = now;
    
    const currentStatus = calculateZoneStatus(currentValue);
    const currentAccuracy = calculateAccuracy(currentValue);
    
    setZoneStatus(currentStatus);
    setAccuracy(currentAccuracy);
    
    // Mettre à jour le temps total
    setTotalTime((now - startTimeRef.current) / 1000);
    
    // Si dans la zone cible, augmenter le score et le temps dans la zone
    if (currentStatus === ZONE_STATUS.IN_TARGET) {
      if (!inZoneRef.current) {
        inZoneRef.current = true;
      }
      setTimeInZone(prev => prev + deltaTime);
      
      // Score = temps dans la zone * précision (max 100 points par seconde)
      const pointsPerSecond = currentAccuracy;
      setScore(prev => prev + (pointsPerSecond * deltaTime));
    } else {
      inZoneRef.current = false;
    }
  }, [currentValue, isActive, calculateZoneStatus, calculateAccuracy]);

  // Réinitialiser le drill
  const reset = useCallback(() => {
    setScore(0);
    setTimeInZone(0);
    setTotalTime(0);
    setZoneStatus(ZONE_STATUS.OUT);
    setAccuracy(0);
    startTimeRef.current = null;
    lastUpdateRef.current = null;
    inZoneRef.current = false;
  }, []);

  return {
    score: Math.round(score),
    timeInZone,
    totalTime,
    zoneStatus,
    accuracy: Math.round(accuracy),
    reset
  };
}

/**
 * Calcule précision et score à partir des jugements (PERFECT/GREAT/GOOD/OK/MISS).
 * Utilisé pour les drills à cibles (Frein+Accél, Drill complet) pour l’écran de résultats.
 */
export function statsFromJudgmentCounts(judgmentCounts) {
  const P = judgmentCounts.PERFECT || 0;
  const G = judgmentCounts.GREAT || 0;
  const Go = judgmentCounts.GOOD || 0;
  const O = judgmentCounts.OK || 0;
  const M = judgmentCounts.MISS || 0;
  const total = P + G + Go + O + M;
  if (total === 0) {
    return { accuracy: 0, score: 0 };
  }
  const hits = P + G + Go + O;
  const accuracy = Math.round((hits / total) * 100);
  const score = Math.round((P * 100 + G * 90 + Go * 75 + O * 50 + M * 0) / total);
  return { accuracy, score };
}

/**
 * Formate le temps en MM:SS.mmm
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

