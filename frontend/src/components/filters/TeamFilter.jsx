/**
 * Composant TeamFilter
 *
 * Filtre par équipe (Team Name) avec liste dynamique.
 * Option "Aucune" pour afficher uniquement les pilotes sans équipe.
 */

import './TeamFilter.css';

const VALUE_NONE = '__none__';

export function TeamFilter({ value, onChange, teams = [], hasDriversWithoutTeam = false }) {
  if (teams.length === 0 && !hasDriversWithoutTeam) return null;

  return (
    <div className="filter-group">
      <label htmlFor="teamSelect" className="filter-label">
        Équipe :
      </label>
      <select
        id="teamSelect"
        className="filter-select filter-select-team"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Toutes</option>
        {hasDriversWithoutTeam && (
          <option value={VALUE_NONE}>Aucune</option>
        )}
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
    </div>
  );
}
