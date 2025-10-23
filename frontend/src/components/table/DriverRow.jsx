/**
 * Composant DriverRow
 * 
 * Ligne individuelle d'un pilote dans le tableau
 * COPIE EXACTE de la structure prod (script-public.js lignes 979-1026)
 */

import { formatTime } from '../../utils/formatters';
import { getCategoryName, getCategoryClass } from '../../services/calculations';
import './DriverRow.css';

export function DriverRow({ driver, position, onClick }) {
  /**
   * Formate la consistance en pourcentage
   */
  const formatConsistency = (consistency) => {
    if (!consistency || consistency === 0) return '0%';
    return `${consistency}%`;
  };

  return (
    <tr onClick={onClick}>
      <td>{position}</td>
      <td>{driver.name}</td>
      <td>
        <span className={`category-badge ${getCategoryClass(driver.category)}`}>
          {getCategoryName(driver.category)}
        </span>
      </td>
      <td data-value={driver.totalLaps || 0}>{driver.totalLaps || 0}</td>
      <td data-value={driver.validLaps || 0}>{driver.validLaps || 0}</td>
      <td data-value={driver.bestValidTime || 0}>{formatTime(driver.bestValidTime || 0)}</td>
      <td data-value={driver.averageValidTime || 0}>{formatTime(driver.averageValidTime || 0)}</td>
      <td data-value={driver.validConsistency || 0}>{formatConsistency(driver.validConsistency)}</td>
      <td data-value={driver.bestWetTime || 0}>{formatTime(driver.bestWetTime || 0)}</td>
      <td data-value={driver.averageWetTime || 0}>{formatTime(driver.averageWetTime || 0)}</td>
      <td data-value={driver.wetConsistency || 0}>{formatConsistency(driver.wetConsistency)}</td>
      <td data-value={driver.bestOverallTime || 0}>{formatTime(driver.bestOverallTime || 0)}</td>
      <td data-value={driver.averageOverallTime || 0}>{formatTime(driver.averageOverallTime || 0)}</td>
      <td data-value={driver.totalConsistency || 0}>{formatConsistency(driver.totalConsistency)}</td>
    </tr>
  );
}
