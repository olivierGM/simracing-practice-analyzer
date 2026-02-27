/**
 * Génère un fichier .ics (iCalendar) avec tous les événements du calendrier.
 * Créneau : ouverture session (pratique) → fin de course (selon 60 ou 90 min).
 * Importable dans Google Calendar, Outlook, Apple Calendar, etc.
 */

function escapeIcsText(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

/** Parse "19:30 EAST" ou "20:30" → { hour: 19, minute: 30 } */
function parseTime(str) {
  if (!str || typeof str !== 'string') return { hour: 19, minute: 30 };
  const match = str.trim().match(/^(\d{1,2}):(\d{2})/);
  if (match) return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
  return { hour: 19, minute: 30 };
}

/** Fin de course : 22:00 si course 90 min, sinon 21:30 */
function getRaceEndTime(ev) {
  const is90min = /90\s*min/.test(ev.description || '');
  return is90min ? { hour: 22, minute: 0 } : { hour: 21, minute: 30 };
}

/** Format date + heure pour .ics (YYYYMMDDTHHMMSS) */
function formatIcsDateTime(y, m, day, hour, minute) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${y}${pad(m)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
}

/** Heure du Québec (Eastern) : suit automatiquement EST / EDT selon la date */
const TZ_EAST = 'America/Toronto';

/** Préfixe du titre des événements : ligue + saison */
const LEAGUE_TITLE_PREFIX = 'EGT - S13';

export function buildIcsContent(events, raceDaySchedule = {}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sim League EGT//Calendrier//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const sessionStart = parseTime(raceDaySchedule.sessionOpens);

  events.forEach((ev) => {
    const [y, m, d] = ev.date.split('-').map(Number);
    const raceEnd = getRaceEndTime(ev);

    const dtStart = formatIcsDateTime(y, m, d, sessionStart.hour, sessionStart.minute);
    const dtEnd = formatIcsDateTime(y, m, d, raceEnd.hour, raceEnd.minute);

    const summary = `${LEAGUE_TITLE_PREFIX} - ${ev.round} – ${ev.circuitName}`;
    let desc = ev.description || '';
    if (raceDaySchedule.raceDay) {
      desc += ` — Jour de course : ${raceDaySchedule.raceDay}.`;
    }
    if (raceDaySchedule.sessionOpens) {
      desc += ` Ouverture session ${raceDaySchedule.sessionOpens}, qualif ${raceDaySchedule.qualifying || ''}, course ${raceDaySchedule.raceStart || ''} → fin ${raceEnd.hour}:${String(raceEnd.minute).padStart(2, '0')}.`;
    }

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.round}-${ev.date}@simleague-egt`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;TZID=${TZ_EAST}:${dtStart}`);
    lines.push(`DTEND;TZID=${TZ_EAST}:${dtEnd}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    if (desc) lines.push(`DESCRIPTION:${escapeIcsText(desc)}`);
    if (ev.doublePoints) lines.push('CATEGORIES:Double points');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(events, raceDaySchedule, filename = 'sim-league-calendrier.ics') {
  const ics = buildIcsContent(events, raceDaySchedule);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
