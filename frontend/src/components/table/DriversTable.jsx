/**
 * Composant DriversTable
 * 
 * Tableau principal des pilotes avec :
 * - Header cliquable pour tri
 * - Lignes de pilotes
 * - Support groupement par classe
 */

import { useMemo } from 'react';
import { DriversTableHeader } from './DriversTableHeader';
import { DriverRow } from './DriverRow';
import { CategorySection } from './CategorySection';
import './DriversTable.css';

export function DriversTable({
  drivers,
  sortColumn,
  sortDirection,
  onSort,
  groupByClass,
  onDriverClick
}) {
  // Grouper les pilotes par classe si activé
  const groupedDrivers = useMemo(() => {
    if (!groupByClass) return null;
    
    const groups = {};
    drivers.forEach(driver => {
      const carClass = driver.carClass || 'Autre';
      if (!groups[carClass]) {
        groups[carClass] = [];
      }
      groups[carClass].push(driver);
    });
    
    return groups;
  }, [drivers, groupByClass]);

  if (groupByClass && groupedDrivers) {
    // Vue groupée par classe
    return (
      <div className="drivers-table-container">
        {Object.entries(groupedDrivers).map(([carClass, classDrivers]) => (
          <CategorySection
            key={carClass}
            categoryName={carClass}
            drivers={classDrivers}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            onDriverClick={onDriverClick}
          />
        ))}
      </div>
    );
  }

  // Vue normale (non groupée)
  return (
    <div className="drivers-table-container">
      <table className="driver-table">
        <DriversTableHeader
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        <tbody>
          {drivers.map((driver, index) => (
            <DriverRow
              key={driver.id || index}
              driver={driver}
              position={index + 1}
              onClick={() => onDriverClick(driver)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

