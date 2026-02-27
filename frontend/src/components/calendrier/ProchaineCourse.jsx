/**
 * Affiche la prochaine course et le temps restant (dans X jours, demain, aujourd’hui).
 */

import { useMemo } from 'react';
import './ProchaineCourse.css';

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function diffDays(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const eventDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  return Math.floor((eventDate - today) / (24 * 60 * 60 * 1000));
}

function formatCountdown(days) {
  if (days < 0) return null;
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days <= 7) return `Dans ${days} jours`;
  if (days <= 14) return `Dans environ 2 semaines`;
  return `Dans ${days} jours`;
}

export function ProchaineCourse({ events = [], raceDaySchedule }) {
  const next = useMemo(() => {
    const today = todayStr();
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.find((ev) => ev.date >= today) || null;
  }, [events]);

  if (!next) {
    return (
      <div className="prochaine-course prochaine-course--none">
        <span className="prochaine-course-label">Prochaine course</span>
        <p className="prochaine-course-text">Aucune course à venir dans le calendrier.</p>
      </div>
    );
  }

  const days = diffDays(next.date);
  const countdown = days >= 0 ? formatCountdown(days) : null;

  return (
    <div className="prochaine-course">
      <span className="prochaine-course-label">Prochaine course</span>
      <p className="prochaine-course-event">
        <strong>{next.round} – {next.circuitName}</strong>
        {next.doublePoints && <span className="prochaine-course-badge">Double points</span>}
      </p>
      <p className="prochaine-course-meta">
        {countdown && <span className="prochaine-course-countdown">{countdown}</span>}
        <span className="prochaine-course-date">
          {new Date(next.date + 'T12:00:00').toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </p>
      {raceDaySchedule && (
        <p className="prochaine-course-schedule">
          {raceDaySchedule.raceDay} · Session {raceDaySchedule.sessionOpens} · Course {raceDaySchedule.raceStart}
        </p>
      )}
    </div>
  );
}
