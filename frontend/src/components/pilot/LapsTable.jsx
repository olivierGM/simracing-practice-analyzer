/**
 * Composant LapsTable
 * 
 * Tableau de tous les tours du pilote avec tri (COPIE de la prod)
 * Utilise GRID au lieu de TABLE comme la prod
 */

import { useState, useMemo } from 'react';
import { formatTime } from '../../utils/formatters';
import './LapsTable.css';

export function LapsTable({ driver }) {
  const [sortColumn, setSortColumn] = useState('lapNumber');
  const [sortDirection, setSortDirection] = useState('desc'); // Descending by default

  // Extraire les tours et calculer les meilleurs temps
  const { laps, bestTimes } = useMemo(() => {
    if (!driver.lapTimes || driver.lapTimes.length === 0) return { laps: [], bestTimes: null };
    
    let bestSplit1 = Infinity, bestSplit2 = Infinity, bestSplit3 = Infinity, bestTotal = Infinity;
    
    const lapsData = driver.lapTimes.map((lap, index) => {
      const sessionDate = lap.sessionDate || '';
      let formattedDate = sessionDate;
      if (sessionDate && sessionDate.length >= 13) {
        // Format: YYMMDD_HHMMSS -> DD/MM/YY HH:MM
        const year = '20' + sessionDate.substring(0, 2);
        const month = sessionDate.substring(2, 4);
        const day = sessionDate.substring(4, 6);
        const hour = sessionDate.substring(7, 9);
        const minute = sessionDate.substring(9, 11);
        formattedDate = `${day}/${month}/${year.substring(2)} ${hour}:${minute}`;
      } else {
        formattedDate = '--';
      }
      
      const splits = lap.splits || [];
      const lapTime = lap.time || lap.laptime || 0;
      
      // Track meilleurs temps
      if (splits[0] && splits[0] > 0) bestSplit1 = Math.min(bestSplit1, splits[0]);
      if (splits[1] && splits[1] > 0) bestSplit2 = Math.min(bestSplit2, splits[1]);
      if (splits[2] && splits[2] > 0) bestSplit3 = Math.min(bestSplit3, splits[2]);
      if (lapTime > 0) bestTotal = Math.min(bestTotal, lapTime);
      
      return {
        lapNumber: index + 1,
        date: formattedDate,
        totalTime: lapTime,
        S1: splits[0] || 0,
        S2: splits[1] || 0,
        S3: splits[2] || 0,
        isValid: lap.isValid || false,
        isWet: lap.isWet || false,
      };
    });
    
    return {
      laps: lapsData,
      bestTimes: {
        S1: bestSplit1 === Infinity ? 0 : bestSplit1,
        S2: bestSplit2 === Infinity ? 0 : bestSplit2,
        S3: bestSplit3 === Infinity ? 0 : bestSplit3,
        total: bestTotal === Infinity ? 0 : bestTotal
      }
    };
  }, [driver.lapTimes]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Trier les tours
  const sortedLaps = useMemo(() => {
    if (laps.length === 0) return [];
    
    const sorted = [...laps].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      
      if (sortColumn === 'date') {
        return sortDirection === 'asc' 
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
      
      const timeColumns = ['totalTime', 'S1', 'S2', 'S3'];
      if (timeColumns.includes(sortColumn)) {
        const aIsInvalid = aVal === 0 || aVal === null || aVal === undefined;
        const bIsInvalid = bVal === 0 || bVal === null || bVal === undefined;
        
        if (aIsInvalid && bIsInvalid) return 0;
        if (aIsInvalid) return sortDirection === 'asc' ? 1 : -1;
        if (bIsInvalid) return sortDirection === 'asc' ? -1 : 1;
      }
      
      const comparison = aVal - bVal;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [laps, sortColumn, sortDirection]);

  const getSortIcon = (column) => {
    if (sortColumn !== column) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (laps.length === 0) {
    return (
      <div className="laps-section">
        <h3>🏁 Détail des Tours</h3>
        <p>Aucun tour disponible</p>
      </div>
    );
  }

  return (
    <div className="laps-section">
      <h3>🏁 Détail des Tours ({laps.length} tours)</h3>
      
      {/* Header avec grid comme prod */}
      <div className="laps-header">
        <div className="lap-header-item sortable" onClick={() => handleSort('lapNumber')}>
          Tour <span className="sort-indicator">{getSortIcon('lapNumber')}</span>
        </div>
        <div className="lap-header-item sortable" onClick={() => handleSort('date')}>
          Date/Heure <span className="sort-indicator">{getSortIcon('date')}</span>
        </div>
        <div className="lap-header-item sortable" onClick={() => handleSort('S1')}>
          S1 <span className="sort-indicator">{getSortIcon('S1')}</span>
        </div>
        <div className="lap-header-item sortable" onClick={() => handleSort('S2')}>
          S2 <span className="sort-indicator">{getSortIcon('S2')}</span>
        </div>
        <div className="lap-header-item sortable" onClick={() => handleSort('S3')}>
          S3 <span className="sort-indicator">{getSortIcon('S3')}</span>
        </div>
        <div className="lap-header-item sortable" onClick={() => handleSort('totalTime')}>
          Total <span className="sort-indicator">{getSortIcon('totalTime')}</span>
        </div>
        <div className="lap-header-item">Valide</div>
        <div className="lap-header-item">Wet</div>
      </div>
      
      {/* List avec grid comme prod */}
      <div className="laps-list">
        {sortedLaps.map((lap, index) => (
          <div key={index} className="lap-item">
            <div className="lap-number">{lap.lapNumber}</div>
            <div className="lap-datetime">{lap.date}</div>
            <div className={`lap-split-1 ${bestTimes && lap.S1 === bestTimes.S1 ? 'best-time' : ''}`}>
              {lap.S1 > 0 ? formatTime(lap.S1) : '-'}
            </div>
            <div className={`lap-split-2 ${bestTimes && lap.S2 === bestTimes.S2 ? 'best-time' : ''}`}>
              {lap.S2 > 0 ? formatTime(lap.S2) : '-'}
            </div>
            <div className={`lap-split-3 ${bestTimes && lap.S3 === bestTimes.S3 ? 'best-time' : ''}`}>
              {lap.S3 > 0 ? formatTime(lap.S3) : '-'}
            </div>
            <div className={`lap-total ${bestTimes && lap.totalTime === bestTimes.total ? 'best-time' : ''}`}>
              {formatTime(lap.totalTime)}
            </div>
            <div className="lap-valid">{lap.isValid ? '✅' : '❌'}</div>
            <div className="lap-wet">{lap.isWet ? '🌧️' : '☀️'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
