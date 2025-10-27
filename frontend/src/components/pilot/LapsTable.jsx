/**
 * Composant LapsTable
 * 
 * Tableau de tous les tours du pilote avec tri (COPIE de la prod)
 * Colonnes: Tour, Date, Total, S1, S2, S3, Valide, Wet
 */

import { useState, useMemo } from 'react';
import { formatTime } from '../../utils/formatters';
import './LapsTable.css';

export function LapsTable({ driver }) {
  const [sortColumn, setSortColumn] = useState('lapNumber');
  const [sortDirection, setSortDirection] = useState('desc'); // Descending by default (dernier tour en premier)

  // Extraire les tours depuis driver.lapTimes
  const laps = useMemo(() => {
    if (!driver.lapTimes || driver.lapTimes.length === 0) return [];
    
    return driver.lapTimes.map((lap, index) => {
      // Format du fileName: YYMMDD_HHMMSS_FP
      // Ex: 251026_194700_FP = 25 Oct 2025 19:47:00
      const sessionDate = lap.sessionDate || '--';
      let formattedDate = sessionDate;
      if (sessionDate !== '--' && sessionDate.length >= 13) {
        const year = '20' + sessionDate.substring(0, 2);
        const month = sessionDate.substring(2, 4);
        const day = sessionDate.substring(4, 6);
        const hour = sessionDate.substring(7, 9);
        const minute = sessionDate.substring(9, 11);
        const second = sessionDate.substring(11, 13);
        formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }
      
      return {
        lapNumber: index + 1,
        date: formattedDate,
        totalTime: lap.time || lap.laptime || 0,
        S1: lap.splits && lap.splits[0] ? lap.splits[0] : 0,
        S2: lap.splits && lap.splits[1] ? lap.splits[1] : 0,
        S3: lap.splits && lap.splits[2] ? lap.splits[2] : 0,
        isValid: lap.isValid || false,
        isWet: lap.isWet || false,
      };
    });
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
      
      // Pour les dates (strings), comparer alphabétiquement
      if (sortColumn === 'date') {
        return sortDirection === 'asc' 
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
      
      // Pour les temps : 0 = PIRE (comme prod)
      const timeColumns = ['totalTime', 'S1', 'S2', 'S3'];
      if (timeColumns.includes(sortColumn)) {
        const aIsInvalid = aVal === 0 || aVal === null || aVal === undefined;
        const bIsInvalid = bVal === 0 || bVal === null || bVal === undefined;
        
        if (aIsInvalid && bIsInvalid) return 0;
        if (aIsInvalid) return sortDirection === 'asc' ? 1 : -1;
        if (bIsInvalid) return sortDirection === 'asc' ? -1 : 1;
      }
      
      // Pour les nombres
      const comparison = aVal - bVal;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [laps, sortColumn, sortDirection]);

  const getSortIcon = (column) => {
    if (sortColumn !== column) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="laps-section">
      <h3>🏁 Détail des Tours ({laps.length} tours)</h3>
      
      <div className="laps-table-container">
        <table className="laps-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('lapNumber')} className="sortable">
                Tour ⬍{getSortIcon('lapNumber')}
              </th>
              <th onClick={() => handleSort('date')} className="sortable">
                Date{getSortIcon('date')}
              </th>
              <th onClick={() => handleSort('totalTime')} className="sortable">
                Total{getSortIcon('totalTime')}
              </th>
              <th onClick={() => handleSort('S1')} className="sortable">
                S1{getSortIcon('S1')}
              </th>
              <th onClick={() => handleSort('S2')} className="sortable">
                S2{getSortIcon('S2')}
              </th>
              <th onClick={() => handleSort('S3')} className="sortable">
                S3{getSortIcon('S3')}
              </th>
              <th>Valide</th>
              <th>Wet</th>
            </tr>
          </thead>
          <tbody>
            {sortedLaps.map(lap => (
              <tr key={lap.lapNumber}>
                <td className="lap-number">{lap.lapNumber}</td>
                <td className="lap-date">{lap.date}</td>
                <td className="total-time">{formatTime(lap.totalTime)}</td>
                <td>{formatTime(lap.S1)}</td>
                <td>{formatTime(lap.S2)}</td>
                <td>{formatTime(lap.S3)}</td>
                <td className="valid-indicator">{lap.isValid ? '✓' : ''}</td>
                <td className="wet-indicator">{lap.isWet ? '🌧️' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

