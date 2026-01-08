/**
 * Composant SeasonFilter
 * 
 * Filtre par saison : S12 / S13 / Toutes
 */

import './PeriodFilter.css'; // Utilise le même style que PeriodFilter

export function SeasonFilter({ value, onChange, availableSeasons = [] }) {
  if (availableSeasons.length === 0) {
    return null; // Ne rien afficher si aucune saison disponible
  }

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="filter-group">
      <label htmlFor="seasonFilter" className="filter-label">
        🗓️ Saison :
      </label>
      <select
        id="seasonFilter"
        className="filter-select"
        value={value || 'all'}
        onChange={handleChange}
      >
        <option value="all">Toutes les saisons</option>
        {availableSeasons.map(season => (
          <option key={season} value={season.toString()}>
            Saison {season}
          </option>
        ))}
      </select>
    </div>
  );
}

