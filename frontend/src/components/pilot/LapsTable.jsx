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
    
    return driver.lapTimes.map((lap, index) => ({
      lapNumber: index + 1,
      date: lap.sessionDate || '--',
      totalTime: lap.laptime || 0,
      S1: lap.splits && lap.splits[0] ? lap.splits[0] : 0,
      S2: lap.splits && lap.splits[1] ? lap.splits[1] : 0,
      S3: lap.splits && lap.splits[2] ? lap.splits[2] : 0,
      isValid: lap.isValid || false,
      isWet: lap.isWetSession || false,
    }));
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

