/**
 * Composant SegmentComparator
 * 
 * Compare les temps de segments du pilote avec le meilleur global/classe
 * COPIE de la structure prod avec 4 cartes
 */

import { useMemo } from 'react';
import { calculatePilotSegmentStats, calculateGlobalSegmentStats } from '../../services/calculations';
import './SegmentComparator.css';

export function SegmentComparator({ driver, allDrivers }) {
  // Calculer les stats du pilote
  const pilotStats = useMemo(() => {
    return calculatePilotSegmentStats(driver);
  }, [driver]);

  // Calculer les stats globales et par classe
  const globalStats = useMemo(() => {
    return calculateGlobalSegmentStats(allDrivers);
  }, [allDrivers]);

  if (!pilotStats || !globalStats) {
    return (
      <div className="segment-section">
        <h3>🏁 Comparateur de Segments<span className="info-icon">ℹ️</span></h3>
        <p>Aucune donnée de segments disponible</p>
      </div>
    );
  }

  const categoryStats = globalStats.byCategory[driver.category] || {};

  // Calculer le segment avec le plus de gain potentiel
  const gaps = {
    S1: (pilotStats.bestS1 - (globalStats.global.bestS1 || 0)) * 1000,
    S2: (pilotStats.bestS2 - (globalStats.global.bestS2 || 0)) * 1000,
    S3: (pilotStats.bestS3 - (globalStats.global.bestS3 || 0)) * 1000,
  };

  const maxGapSegment = Object.entries(gaps).reduce((max, [seg, gap]) => 
    gap > max.gap ? { segment: seg, gap } : max
  , { segment: 'S1', gap: gaps.S1 });

  const formatSegmentTime = (ms) => {
    if (!ms) return '--';
    return `${(ms / 1000).toFixed(3)}s`;
  };

  const formatGap = (gap) => {
    if (gap === 0 || isNaN(gap)) return '+0.000s';
    return `${gap > 0 ? '+' : ''}${(gap / 1000).toFixed(3)}s`;
  };

  const renderSegmentRow = (segment, pilotTime, refTime) => {
    // Guard: Si les temps ne sont pas disponibles, ne rien afficher
    if (!pilotTime || !refTime || pilotTime === 0 || refTime === 0) {
      return null;
    }
    
    // Gap en millisecondes (pilote - référence)
    const gap = (pilotTime - refTime) * 1000;
    const isPositive = gap <= 0;
    const gapFormatted = isPositive ? '+' : '' + (Math.abs(gap) / 1000).toFixed(3) + 's';
    
    return (
      <div className="segment-row" key={segment}>
        <span className="segment-name">{segment}:</span>
        <span className="segment-time">{formatSegmentTime(pilotTime)} vs {formatSegmentTime(refTime)}</span>
        <span className={`segment-gap ${isPositive ? 'positive' : 'negative'}`}>{gapFormatted}</span>
        <span className="segment-color">{isPositive ? '🟢' : '🔴'}</span>
      </div>
    );
  };

  return (
    <div className="segment-section">
      <div className="segment-header">
        <h3>🏁 Comparateur de Segments<span className="info-icon">ℹ️</span></h3>
        <div className="segment-focus-hint">
          💡 Focus sur <strong>{maxGapSegment.segment}</strong> pour {formatGap(maxGapSegment.gap)} de gain
        </div>
      </div>

      <div className="segment-grid">
        {/* Carte 1: Meilleur Pilote vs Meilleur Global */}
        <div className="segment-card">
          <h4>📊 Meilleur Pilote vs Meilleur Global</h4>
          {renderSegmentRow('S1', pilotStats.bestS1, globalStats.global.bestS1)}
          {renderSegmentRow('S2', pilotStats.bestS2, globalStats.global.bestS2)}
          {renderSegmentRow('S3', pilotStats.bestS3, globalStats.global.bestS3)}
        </div>

        {/* Carte 2: Meilleur Pilote vs Meilleur Classe */}
        <div className="segment-card">
          <h4>🎯 Meilleur Pilote vs Meilleur Classe</h4>
          {renderSegmentRow('S1', pilotStats.bestS1, categoryStats.bestS1 || 0)}
          {renderSegmentRow('S2', pilotStats.bestS2, categoryStats.bestS2 || 0)}
          {renderSegmentRow('S3', pilotStats.bestS3, categoryStats.bestS3 || 0)}
        </div>

        {/* Carte 3: Moyenne Pilote vs Moyenne Global */}
        <div className="segment-card">
          <h4>📈 Moyenne Pilote vs Moyenne Global</h4>
          {renderSegmentRow('S1', pilotStats.avgS1, globalStats.global.avgS1)}
          {renderSegmentRow('S2', pilotStats.avgS2, globalStats.global.avgS2)}
          {renderSegmentRow('S3', pilotStats.avgS3, globalStats.global.avgS3)}
        </div>

        {/* Carte 4: Moyenne Pilote vs Moyenne Classe */}
        <div className="segment-card">
          <h4>📉 Moyenne Pilote vs Moyenne Classe</h4>
          {renderSegmentRow('S1', pilotStats.avgS1, categoryStats.avgS1 || 0)}
          {renderSegmentRow('S2', pilotStats.avgS2, categoryStats.avgS2 || 0)}
          {renderSegmentRow('S3', pilotStats.avgS3, categoryStats.avgS3 || 0)}
        </div>
      </div>
    </div>
  );
}
