/**
 * Composant DriversTableHeader
 * 
 * Header du tableau avec colonnes triables
 */

import { TABLE_COLUMNS } from '../../utils/constants';
import './DriversTableHeader.css';

export function DriversTableHeader({ sortColumn, sortDirection, onSort, hasWetTimes = false }) {
  /**
   * Retourne l'icône de tri pour une colonne (COPIE EXACTE de la prod)
   * Prod affiche toujours ↕ et change la direction au click
   */
  const getSortIcon = (column) => {
    if (!column.sortable) return '';
    return ' ↕';
  };

  // Filtrer les colonnes wet si aucun wet time n'existe
  const visibleColumns = hasWetTimes 
    ? TABLE_COLUMNS 
    : TABLE_COLUMNS.filter(col => 
        col.key !== 'bestWetTime' && 
        col.key !== 'averageWetTime' && 
        col.key !== 'wetConsistency'
      );

  return (
    <thead>
      <tr>
        {visibleColumns.map(column => (
          <th
            key={column.key}
            className={column.sortable ? 'sortable' : ''}
            onClick={() => column.sortable && onSort(column.key)}
          >
            <span className="th-inner">
              {column.iconOnly ? <span className="icon-only-header">{column.label}</span> : column.label}
              {column.sortable && <span className="sort-indicator">↕</span>}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

