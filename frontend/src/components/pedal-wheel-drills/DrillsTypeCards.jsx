/**
 * DrillsTypeCards
 * 4 cartes : Accélérateur, Frein, Accélérateur + Frein, Drill complet.
 * Icônes SVG (fond vraiment transparent, pas de PNG généré).
 */

import { DRILL_TYPES } from './DrillSelector';
import './DrillsTypeCards.css';

const DRILL_OPTIONS = [
  { type: DRILL_TYPES.ACCELERATOR, label: 'Accélérateur', subtitle: 'Contrôle en pourcentage unique', available: true },
  { type: DRILL_TYPES.BRAKE, label: 'Frein', subtitle: 'Contrôle en pourcentage unique', available: true },
  { type: DRILL_TYPES.BRAKE_ACCEL, label: 'Accélérateur + Frein', subtitle: 'Pistes de frein et d\'accélération', available: true },
  { type: DRILL_TYPES.COMBINED_VERTICAL, label: 'Drill Complet', subtitle: 'Frein, accélérateur, volant combinés', available: true, tag: 'En construction' }
];

/** Pédale + jauge 50 % — dégradés, style carte sombre/orange */
function IconSinglePedal({ color }) {
  const id = `pedal-grad-${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg className="drills-type-card-svg" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
        <filter id="icon-glow">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Jauge : cercle + arc rempli à 50 % */}
      <circle cx="32" cy="22" r="15" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
      <path d="M 32 7 A 15 15 0 0 1 44 22" stroke={`url(#${id})`} strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#icon-glow)" />
      <text x="32" y="24" textAnchor="middle" style={{ fontSize: 9, fontWeight: 700 }} fill="rgba(255,255,255,0.9)">50%</text>
      {/* Pédale avec dégradé et relief */}
      <rect x="18" y="38" width="28" height="18" rx="5" fill="rgba(0,0,0,0.3)" />
      <rect x="18" y="38" width="28" height="18" rx="5" fill={`url(#${id})`} />
      <rect x="20" y="40" width="24" height="12" rx="3" fill="rgba(0,0,0,0.25)" />
    </svg>
  );
}

/** Deux barres frein/accél — dégradés, fond sombre type carte */
function IconBrakeAccel() {
  return (
    <svg className="drills-type-card-svg" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="brake-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#b71c1c" />
          <stop offset="100%" stopColor="#e53935" />
        </linearGradient>
        <linearGradient id="accel-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#2e7d32" />
          <stop offset="100%" stopColor="#4caf50" />
        </linearGradient>
      </defs>
      {/* Barre frein */}
      <rect x="10" y="12" width="20" height="44" rx="6" fill="rgba(255,255,255,0.06)" />
      <rect x="10" y="30" width="20" height="26" rx="6" fill="url(#brake-grad)" />
      {/* Barre accél */}
      <rect x="34" y="12" width="20" height="44" rx="6" fill="rgba(255,255,255,0.06)" />
      <rect x="34" y="30" width="20" height="26" rx="6" fill="url(#accel-grad)" />
    </svg>
  );
}

/** Drill complet — setup cockpit stylisé, volant + pédales + palettes */
function IconFullCombo() {
  const cx = 32;
  const cy = 25;
  const r = 15;
  return (
    <svg className="drills-type-card-svg" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="fullcombo-wheel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,152,0,0.6)" />
        </linearGradient>
      </defs>
      {/* Palettes — en arrière-plan */}
      <rect x="4" y="18" width="7" height="14" rx="3" fill="rgba(255,152,0,0.25)" />
      <rect x="53" y="18" width="7" height="14" rx="3" fill="rgba(255,152,0,0.25)" />
      {/* Volant */}
      <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
      <circle cx={cx} cy={cy} r={r} stroke="url(#fullcombo-wheel)" strokeWidth="2.5" fill="none" />
      <circle cx={cx} cy={cy} r={r - 5} stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
      <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <line x1={cx - 4} y1={cy + 3} x2={cx + 4} y2={cy - 3} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      {/* Pédales — barres colorées connectées */}
      <rect x="14" y="42" width="10" height="16" rx="4" fill="rgba(0,0,0,0.25)" />
      <rect x="14" y="45" width="10" height="13" rx="2" fill="#c62828" />
      <rect x="40" y="42" width="10" height="16" rx="4" fill="rgba(0,0,0,0.25)" />
      <rect x="40" y="45" width="10" height="13" rx="2" fill="#2e7d32" />
      <line x1="24" y1="51" x2="40" y2="51" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 2" />
    </svg>
  );
}

function CardIcon({ type, selected }) {
  const glowClass = selected ? 'drills-type-card-svg-selected' : '';
  switch (type) {
    case DRILL_TYPES.ACCELERATOR:
      return (
        <span className={glowClass} style={{ color: '#66bb6a' }}>
          <IconSinglePedal color="#66bb6a" />
        </span>
      );
    case DRILL_TYPES.BRAKE:
      return (
        <span className={glowClass} style={{ color: '#e53935' }}>
          <IconSinglePedal color="#e53935" />
        </span>
      );
    case DRILL_TYPES.BRAKE_ACCEL:
      return (
        <span className={glowClass}>
          <IconBrakeAccel />
        </span>
      );
    case DRILL_TYPES.COMBINED_VERTICAL:
      return (
        <span className={glowClass} style={{ color: 'rgba(255,255,255,0.9)' }}>
          <IconFullCombo />
        </span>
      );
    default:
      return null;
  }
}

export function DrillsTypeCards({ selectedType, onSelectType }) {
  return (
    <div className="drills-type-cards">
      {DRILL_OPTIONS.map((option) => (
        <button
          key={option.type}
          type="button"
          className={`drills-type-card ${selectedType === option.type ? 'drills-type-card-selected' : ''} ${!option.available ? 'drills-type-card-disabled' : ''}`}
          onClick={() => option.available && onSelectType(option.type)}
          disabled={!option.available}
          title={option.subtitle}
        >
          {option.tag && (
            <span className="drills-type-card-tag">{option.tag}</span>
          )}
          <div className="drills-type-card-icon-wrap">
            <CardIcon type={option.type} selected={selectedType === option.type} />
          </div>
          <div className="drills-type-card-label">{option.label}</div>
          <div className="drills-type-card-subtitle">{option.subtitle}</div>
        </button>
      ))}
    </div>
  );
}
