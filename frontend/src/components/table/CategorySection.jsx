/**
 * Composant CategorySection
 * 
 * Section pour une catégorie de voiture (groupement par classe)
 * Contient son propre tableau avec ranking qui recommence à 1
 */

import { DriversTableHeader } from './DriversTableHeader';
import { DriverRow } from './DriverRow';
import './CategorySection.css';

export function CategorySection({
  categoryName,
  drivers,
  sortColumn,
  sortDirection,
  onSort,
  onDriverClick
}) {
  return (
    <div className="category-section">
      <h3 className="category-title">{categoryName}</h3>
      
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
              position={index + 1} // Ranking recommence à 1 pour chaque catégorie
              onClick={() => onDriverClick(driver)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

