/**
 * Composant DriverRow
 * 
 * Ligne individuelle d'un pilote dans le tableau
 */

import { formatTime, formatDate } from '../../utils/formatters';
import './DriverRow.css';

export function DriverRow({ driver, position, onClick }) {
  return (
    <tr className="driver-row" onClick={onClick}>
      <td className="cell-position">{position}</td>
      <td className="cell-name">{driver.name}</td>
      <td className="cell-time">{formatTime(driver.bestTime)}</td>
      <td className="cell-time">{formatTime(driver.potential)}</td>
      <td className="cell-consistency">
        {driver.consistency ? `${(driver.consistency / 1000).toFixed(3)}s` : '-'}
      </td>
      <td className="cell-number">{driver.validLaps || 0}</td>
      <td className="cell-date">{driver.lastSession ? formatDate(driver.lastSession) : '-'}</td>
    </tr>
  );
}

