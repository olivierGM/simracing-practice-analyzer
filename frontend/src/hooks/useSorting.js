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
      
      // Liste des colonnes de temps où 0/null = PIRE temps (comme prod)
      const timeColumns = [
        'bestValidTime', 'potentialTime', 'averageValidTime', 'gapToLeader',
        'S1', 'S2', 'S3', 'totalTime', 'laptime'
      ];
      const isTimeColumn = timeColumns.includes(sortColumn);
      
      // Pour les temps : 0, null, undefined = PIRE (toujours en dernier si tri croissant)
      if (isTimeColumn) {
        const aIsInvalid = aVal === null || aVal === undefined || aVal === 0;
        const bIsInvalid = bVal === null || bVal === undefined || bVal === 0;
        
        if (aIsInvalid && bIsInvalid) return 0; // Les deux invalides, égaux
        if (aIsInvalid) return sortDirection === 'asc' ? 1 : -1; // a invalide, après b
        if (bIsInvalid) return sortDirection === 'asc' ? -1 : 1; // b invalide, après a
      } else {
        // Pour les autres colonnes : null/undefined en dernier (comportement normal)
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
      }
      
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

