/**
 * Composant DriversTableHeader
 * 
 * Header du tableau avec colonnes triables
 */

import { TABLE_COLUMNS } from '../../utils/constants';
import './DriversTableHeader.css';

export function DriversTableHeader({ sortColumn, sortDirection, onSort }) {
  /**
   * Retourne l'icône de tri pour une colonne (COPIE EXACTE de la prod)
   * Prod affiche toujours ↕ et change la direction au click
   */
  const getSortIcon = (column) => {
    if (!column.sortable) return '';
    return ' ↕';
  };

  return (
    <thead>
      <tr>
        {TABLE_COLUMNS.map(column => (
          <th
            key={column.key}
            className={column.sortable ? 'sortable' : ''}
            onClick={() => column.sortable && onSort(column.key)}
          >
            {column.label}
            {column.sortable && <span className="sort-indicator">↕</span>}
          </th>
        ))}
      </tr>
    </thead>
  );
}

