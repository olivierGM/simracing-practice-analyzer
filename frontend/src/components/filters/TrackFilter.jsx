/**
 * Composant TrackFilter
 *
 * Filtre par circuit avec liste dynamique (valeurs brutes en arrière-plan, noms formatés à l'affichage).
 */

import { formatCircuitDisplayName } from '../../utils/formatters';
import './TrackFilter.css';

export function TrackFilter({ value, onChange, tracks = [] }) {
  return (
    <div className="filter-group">
      <label htmlFor="sessionSelect" className="filter-label">
        🏁 Circuit :
      </label>
      <select
        id="sessionSelect"
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {tracks.map((track) => (
          <option key={track} value={track}>
            {formatCircuitDisplayName(track)}
          </option>
        ))}
      </select>
    </div>
  );
}

