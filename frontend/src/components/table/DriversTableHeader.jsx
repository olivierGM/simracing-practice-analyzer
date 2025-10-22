/**
 * Composant DriversTableHeader
 * 
 * Header du tableau avec colonnes triables
 */

import { TABLE_COLUMNS } from '../../utils/constants';
import './DriversTableHeader.css';

export function DriversTableHeader({ sortColumn, sortDirection, onSort }) {
  /**
   * Retourne l'icône de tri pour une colonne
   */
  const getSortIcon = (columnKey) => {
    if (sortColumn !== columnKey) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <thead>
      <tr>
        {TABLE_COLUMNS.map(column => (
          <th
            key={column.key}
            className={`table-header ${column.sortable ? 'sortable' : ''}`}
            onClick={() => column.sortable && onSort(column.key)}
            title={column.sortable ? 'Cliquer pour trier' : ''}
          >
            {column.label}{getSortIcon(column.key)}
          </th>
        ))}
      </tr>
    </thead>
  );
}

