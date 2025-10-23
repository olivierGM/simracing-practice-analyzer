/**
 * Composant TrackFilter
 * 
 * Filtre par piste avec liste dynamique
 */

import './TrackFilter.css';

export function TrackFilter({ value, onChange, tracks = [] }) {
  return (
    <div className="filter-group">
      <label htmlFor="sessionSelect" className="filter-label">
        🏁 Piste :
      </label>
      <select
        id="sessionSelect"
        className="session-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {tracks.map(track => (
          <option key={track} value={track}>
            {track}
          </option>
        ))}
      </select>
    </div>
  );
}

