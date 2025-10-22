/**
 * Composant LapsTable
 * 
 * Tableau de tous les tours du pilote avec tri
 * 
 * TODO: Ajouter les données de tours dans mockData
 */

import { useState } from 'react';
import { formatTime } from '../../utils/formatters';
import './LapsTable.css';

export function LapsTable({ driver }) {
  const [sortColumn, setSortColumn] = useState('lapNumber');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pour l'instant, données mock de tours
  const laps = [
    { lapNumber: 1, S1: 18234, S2: 19456, S3: 20123, S4: 18654, S5: 19234, S6: 17832, totalTime: 113533 },
    { lapNumber: 2, S1: 18123, S2: 19345, S3: 20012, S4: 18543, S5: 19123, S6: 17721, totalTime: 112867 },
    { lapNumber: 3, S1: 18345, S2: 19567, S3: 20234, S4: 18765, S5: 19345, S6: 17943, totalTime: 114199 },
  ];

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="laps-section">
      <h3 className="section-title">Liste des tours</h3>
      
      <div className="laps-table-container">
        <table className="laps-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('lapNumber')}>Tour{getSortIcon('lapNumber')}</th>
              <th onClick={() => handleSort('S1')}>S1{getSortIcon('S1')}</th>
              <th onClick={() => handleSort('S2')}>S2{getSortIcon('S2')}</th>
              <th onClick={() => handleSort('S3')}>S3{getSortIcon('S3')}</th>
              <th onClick={() => handleSort('S4')}>S4{getSortIcon('S4')}</th>
              <th onClick={() => handleSort('S5')}>S5{getSortIcon('S5')}</th>
              <th onClick={() => handleSort('S6')}>S6{getSortIcon('S6')}</th>
              <th onClick={() => handleSort('totalTime')}>Total{getSortIcon('totalTime')}</th>
            </tr>
          </thead>
          <tbody>
            {laps.map(lap => (
              <tr key={lap.lapNumber}>
                <td className="lap-number">{lap.lapNumber}</td>
                <td>{formatTime(lap.S1)}</td>
                <td>{formatTime(lap.S2)}</td>
                <td>{formatTime(lap.S3)}</td>
                <td>{formatTime(lap.S4)}</td>
                <td>{formatTime(lap.S5)}</td>
                <td>{formatTime(lap.S6)}</td>
                <td className="total-time">{formatTime(lap.totalTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

