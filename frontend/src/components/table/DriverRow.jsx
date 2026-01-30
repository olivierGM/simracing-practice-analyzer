/**
 * Composant DriverRow
 * 
 * Ligne individuelle d'un pilote dans le tableau
 * COPIE EXACTE de la structure prod (script-public.js lignes 979-1026)
 */

import { formatTime } from '../../utils/formatters';
import { getCategoryName, getCategoryClass } from '../../services/calculations';
import { getManufacturerLogoUrl, getManufacturerName } from '../../services/carManufacturerService';
import './DriverRow.css';

export function DriverRow({ driver, position, onClick, hasWetTimes = false }) {
  /**
   * Formate la consistance en pourcentage
   */
  const formatConsistency = (consistency) => {
    if (!consistency || consistency === 0) return '0%';
    return `${consistency}%`;
  };

  // Définir l'ordre des colonnes (même ordre que TABLE_COLUMNS)
  const cells = [
    { key: 'position', content: position },
    { key: 'name', content: driver.name },
    { 
      key: 'manufacturer', 
      content: (
        <span className="manufacturer-icon" title={driver.carModel ? getManufacturerName(driver.carModel) : 'Marque inconnue'}>
          <img 
            src={getManufacturerLogoUrl(driver.carModel)} 
            alt={getManufacturerName(driver.carModel)}
            className="manufacturer-logo"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              if (!e.target.nextSibling) {
                const fallback = document.createElement('span');
                fallback.className = 'manufacturer-fallback';
                fallback.textContent = getManufacturerName(driver.carModel).charAt(0).toUpperCase();
                e.target.parentNode.appendChild(fallback);
              }
            }}
          />
        </span>
      )
    },
    { key: 'teamName', content: driver.teamName || '—', dataValue: driver.teamName || '' },
    { 
      key: 'category', 
      content: (
        <span className={`category-badge ${getCategoryClass(driver.category)}`}>
          {getCategoryName(driver.category)}
        </span>
      )
    },
    { key: 'totalLaps', content: driver.totalLaps || 0, dataValue: driver.totalLaps || 0 },
    { key: 'validLaps', content: driver.validLaps || 0, dataValue: driver.validLaps || 0 },
    { key: 'bestValidTime', content: formatTime(driver.bestValidTime || 0), dataValue: driver.bestValidTime || 0 },
    { key: 'bestPotentialTime', content: formatTime(driver.bestPotentialTime || 0), dataValue: driver.bestPotentialTime || 0 },
    { key: 'averageValidTime', content: formatTime(driver.averageValidTime || 0), dataValue: driver.averageValidTime || 0 },
    { key: 'validConsistency', content: formatConsistency(driver.validConsistency), dataValue: driver.validConsistency || 0 },
    { key: 'bestWetTime', content: formatTime(driver.bestWetTime || 0), dataValue: driver.bestWetTime || 0 },
    { key: 'averageWetTime', content: formatTime(driver.averageWetTime || 0), dataValue: driver.averageWetTime || 0 },
    { key: 'wetConsistency', content: formatConsistency(driver.wetConsistency), dataValue: driver.wetConsistency || 0 },
    { key: 'bestOverallTime', content: formatTime(driver.bestOverallTime || 0), dataValue: driver.bestOverallTime || 0 },
    { key: 'averageOverallTime', content: formatTime(driver.averageOverallTime || 0), dataValue: driver.averageOverallTime || 0 },
    { key: 'totalConsistency', content: formatConsistency(driver.totalConsistency), dataValue: driver.totalConsistency || 0 },
  ];

  // Filtrer les colonnes wet si aucun wet time n'existe
  const visibleCells = hasWetTimes 
    ? cells 
    : cells.filter(cell => 
        cell.key !== 'bestWetTime' && 
        cell.key !== 'averageWetTime' && 
        cell.key !== 'wetConsistency'
      );

  return (
    <tr onClick={onClick}>
      {visibleCells.map((cell, index) => (
        <td 
          key={cell.key} 
          data-value={cell.dataValue !== undefined ? cell.dataValue : undefined}
          className={cell.key === 'name' ? 'cell-name' : undefined}
        >
          {cell.content}
        </td>
      ))}
    </tr>
  );
}
