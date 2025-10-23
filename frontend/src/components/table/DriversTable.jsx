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
  // Grouper les pilotes par classe si activé (COPIE de la prod)
  const groupedDrivers = useMemo(() => {
    if (!groupByClass) return null;
    
    const groups = {};
    drivers.forEach(driver => {
      // Utiliser cupCategory (0=PRO, 2=AMATEUR, 3=SILVER)
      const categoryNum = driver.category;
      const categoryName = categoryNum === 0 ? 'PRO' : 
                          categoryNum === 3 ? 'SILVER' : 
                          categoryNum === 2 ? 'AMATEUR' : 'Autre';
      
      if (!groups[categoryNum]) {
        groups[categoryNum] = {
          name: categoryName,
          drivers: []
        };
      }
      groups[categoryNum].drivers.push(driver);
    });
    
    return groups;
  }, [drivers, groupByClass]);

  if (groupByClass && groupedDrivers) {
    // Vue groupée par classe (ordre: PRO, SILVER, AMATEUR comme en prod)
    const categoryOrder = [0, 3, 2]; // PRO, SILVER, AMATEUR
    const orderedCategories = categoryOrder.filter(cat => groupedDrivers[cat]);
    
    return (
      <div className="drivers-table-container">
        {orderedCategories.map(categoryNum => {
          const group = groupedDrivers[categoryNum];
          return (
            <CategorySection
              key={categoryNum}
              categoryName={group.name}
              drivers={group.drivers}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              onDriverClick={onDriverClick}
            />
          );
        })}
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

