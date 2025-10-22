/**
 * Composant SegmentComparator
 * 
 * Compare les temps de segments du pilote avec le meilleur global
 */

import { useMemo } from 'react';
import { findGlobalBestSegments } from '../../services/calculations';
import { formatSegmentTime, formatDelta } from '../../utils/formatters';
import './SegmentComparator.css';

export function SegmentComparator({ driver, allDrivers }) {
  // Trouver les meilleurs segments globaux
  const globalBest = useMemo(() => {
    return findGlobalBestSegments(allDrivers);
  }, [allDrivers]);

  const driverSegments = driver.segments || {};
  const segmentKeys = Object.keys(driverSegments).filter(k => k.startsWith('S'));

  return (
    <div className="segment-section">
      <h3 className="section-title">Comparaison par segment</h3>
      
      <div className="focus-bubble">
        <span className="focus-label">Focus:</span>
        <span className="focus-text">Meilleur pilote vs Meilleur global</span>
      </div>

      <div className="segments-grid">
        {segmentKeys.map(segmentKey => {
          const driverTime = driverSegments[segmentKey];
          const globalTime = globalBest[segmentKey];
          const delta = driverTime - globalTime;
          const isBest = delta === 0;

          return (
            <div key={segmentKey} className={`segment-item ${isBest ? 'best' : ''}`}>
              <div className="segment-header">{segmentKey}</div>
              <div className="segment-time">{formatSegmentTime(driverTime)}</div>
              <div className={`segment-delta ${delta > 0 ? 'slower' : 'faster'}`}>
                {delta === 0 ? '🏆' : formatDelta({ text: (delta / 1000).toFixed(3), className: '' }).text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

