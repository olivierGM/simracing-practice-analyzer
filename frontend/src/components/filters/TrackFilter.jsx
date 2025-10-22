/**
 * Composant TrackFilter
 * 
 * Filtre par piste avec liste dynamique
 */

import './TrackFilter.css';

export function TrackFilter({ value, onChange, tracks = [] }) {
  return (
    <div className="filter-group">
      <label htmlFor="trackFilter" className="filter-label">
        🏁 Piste :
      </label>
      <select
        id="trackFilter"
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">Toutes les pistes</option>
        {tracks.map(track => (
          <option key={track} value={track}>
            {track}
          </option>
        ))}
      </select>
    </div>
  );
}

