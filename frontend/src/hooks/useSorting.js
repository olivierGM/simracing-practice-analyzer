/**
 * Hook pour gérer le tri des pilotes
 * 
 * Gère :
 * - Colonne de tri active
 * - Direction (asc/desc)
 * - Application du tri avec memoization
 */

import { useState, useMemo } from 'react';

export function useSorting(items = []) {
  const [sortColumn, setSortColumn] = useState('position');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' ou 'desc'

  /**
   * Change la colonne de tri
   * Si c'est la même colonne, inverse la direction
   */
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Même colonne : inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouvelle colonne : tri ascendant par défaut
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  /**
   * Items triés avec memoization
   */
  const sortedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const sorted = [...items].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      
      // Gérer les valeurs nulles/undefined
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      // Comparaison selon le type
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [items, sortColumn, sortDirection]);

  /**
   * Réinitialise le tri
   */
  const resetSort = () => {
    setSortColumn('position');
    setSortDirection('asc');
  };

  return {
    sortColumn,
    sortDirection,
    sortedItems,
    handleSort,
    resetSort
  };
}

