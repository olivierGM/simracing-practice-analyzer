/**
 * Page Calendrier des évènements
 * Données en dur (itération 1). Plus tard : admin peut uploader le calendrier.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './CalendrierPage.css';

// Données statiques – calendrier Saison 2026
const EVENTS = [
  { round: 'R1', date: '2026-01-22', circuitName: 'Silverstone', trackName: 'Silverstone', description: '60 min, 1 arrêt obligatoire', doublePoints: false },
  { round: 'R2', date: '2026-02-05', circuitName: 'Barcelona', trackName: 'Barcelona', description: '60 min, 1 arrêt obligatoire', doublePoints: false },
  { round: 'R3', date: '2026-02-19', circuitName: 'Watkins Glen', trackName: 'Watkins Glen', description: '60 min, 1 arrêt obligatoire', doublePoints: false },
  { round: 'R4', date: '2026-03-05', circuitName: 'SPA', trackName: 'Spa', description: '90 min, 2 arrêts obligatoires, double points', doublePoints: true },
  { round: 'R5', date: '2026-03-19', circuitName: 'Brands Hatch', trackName: 'Brands Hatch', description: '60 min, 1 arrêt obligatoire', doublePoints: false },
  { round: 'R6', date: '2026-04-02', circuitName: 'Mount Panorama', trackName: 'Mount Panorama', description: '60 min, 1 arrêt obligatoire', doublePoints: false },
  { round: 'R7', date: '2026-04-16', circuitName: 'Laguna Seca', trackName: 'Laguna Seca', description: '60 min, 1 arrêt obligatoire', doublePoints: false },
  { round: 'R8', date: '2026-04-30', circuitName: 'Kyalami', trackName: 'Kyalami', description: '90 min, 2 arrêts obligatoires, double points', doublePoints: true },
];

const RACE_DAY_SCHEDULE = {
  raceDay: 'Jeudi',
  sessionOpens: '19:30 EAST',
  qualifying: '20:10 EAST',
  raceStart: '20:30 EAST',
  raceEnd: '21:30 EAST ou 22:00 EAST',
};

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTHS_FR[m - 1]} ${y}`;
}

export function CalendrierPage() {
  const navigate = useNavigate();

  const sortedEvents = useMemo(() => [...EVENTS].sort((a, b) => a.date.localeCompare(b.date)), []);

  const handleViewClassement = (trackName) => {
    navigate(`/classement?track=${encodeURIComponent(trackName)}`);
  };

  return (
    <div className="calendrier-page">
      <h1 className="calendrier-title">Calendrier des évènements</h1>

      <section className="calendrier-section race-day-schedule">
        <h2>Déroulé du jour de course</h2>
        <ul className="schedule-list">
          <li><strong>Jour de course :</strong> {RACE_DAY_SCHEDULE.raceDay}</li>
          <li><strong>Ouverture session :</strong> {RACE_DAY_SCHEDULE.sessionOpens}</li>
          <li><strong>Qualification :</strong> {RACE_DAY_SCHEDULE.qualifying}</li>
          <li><strong>Départ course :</strong> {RACE_DAY_SCHEDULE.raceStart}</li>
          <li><strong>Fin course :</strong> {RACE_DAY_SCHEDULE.raceEnd}</li>
        </ul>
      </section>

      <section className="calendrier-section events-list">
        <h2>Calendrier des courses</h2>
        <ul className="events-list-ul">
          {sortedEvents.map((event) => (
            <li key={event.round} className="event-card">
              <div className="event-main">
                <span className="event-round">{event.round}</span>
                <span className="event-date">{formatDate(event.date)}</span>
                <span className="event-circuit">{event.circuitName}</span>
                <span className="event-desc">{event.description}</span>
                {event.doublePoints && <span className="event-badge">Double points</span>}
              </div>
              {event.trackName && (
                <button
                  type="button"
                  className="event-link-classement"
                  onClick={() => handleViewClassement(event.trackName)}
                >
                  Voir le classement
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
