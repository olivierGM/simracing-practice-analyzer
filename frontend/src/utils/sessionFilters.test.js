/**
 * Tests du filtre par type de session (FP / Q / R).
 */
import { describe, it, expect } from 'vitest';
import { filterSessionsBySessionType } from './sessionFilters';

describe('filterSessionsBySessionType', () => {
  const sessions = [
    { sessionType: 'FP', trackName: 'Spa' },
    { sessionType: 'Q', trackName: 'Spa' },
    { sessionType: 'R', trackName: 'Spa' },
    { sessionType: 'fp', trackName: 'Monza' },
    { sessionType: '  R  ', trackName: 'Monza' },
    { sessionType: '', trackName: 'Nurburgring' },
    { trackName: 'Zandvoort' },
  ];

  it('retourne toutes les sessions quand sessionTypeFilter est vide', () => {
    expect(filterSessionsBySessionType(sessions, '')).toEqual(sessions);
    expect(filterSessionsBySessionType(sessions, null)).toEqual(sessions);
    expect(filterSessionsBySessionType(sessions, undefined)).toEqual(sessions);
  });

  it('filtre par FP (insensible à la casse)', () => {
    const result = filterSessionsBySessionType(sessions, 'FP');
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.sessionType)).toEqual(['FP', 'fp']);
  });

  it('filtre par Q', () => {
    const result = filterSessionsBySessionType(sessions, 'Q');
    expect(result).toHaveLength(1);
    expect(result[0].sessionType).toBe('Q');
  });

  it('filtre par R (trim appliqué)', () => {
    const result = filterSessionsBySessionType(sessions, 'R');
    expect(result).toHaveLength(2);
    expect(result.every((s) => String(s.sessionType).trim().toUpperCase() === 'R')).toBe(true);
  });

  it('retourne un tableau vide si sessions invalide', () => {
    expect(filterSessionsBySessionType(null, 'FP')).toEqual([]);
    expect(filterSessionsBySessionType(undefined, 'Q')).toEqual([]);
  });
});
