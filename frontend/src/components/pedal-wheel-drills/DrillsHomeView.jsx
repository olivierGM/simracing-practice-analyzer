/**
 * DrillsHomeView
 * Homepage des drills : cartes type en haut, liste des drills en bas, panneau réglages à droite
 */

import { useState, useEffect } from 'react';
import { listDrillSongs, loadDrillSong } from '../../services/drillSongService';
import { DrillsTypeCards } from './DrillsTypeCards';
import { DrillsSettingsPanel } from './DrillsSettingsPanel';
import { DRILL_TYPES } from './DrillSelector';
import './DrillsHomeView.css';

const DIFFICULTY_LABELS = {
  easy: 'Débutant',
  medium: 'Facile',
  hard: 'Moyen',
  extreme: 'Difficile',
  insane: 'Extreme',
  insane_plus_1: 'Insane',
  insane_plus_2: 'Nightmare'
};

const RANDOM_LEVELS = [
  { key: 'medium', label: 'Facile', desc: 'Cibles moyennes, vitesse modérée' },
  { key: 'hard', label: 'Moyen', desc: 'Cibles rapprochées, vitesse rapide' },
  { key: 'extreme', label: 'Difficile', desc: 'Très rapide' },
  { key: 'insane', label: 'Extreme', desc: 'Extrêmement rapide' },
  { key: 'insane_plus_1', label: 'Insane', desc: 'Ultra rapide' },
  { key: 'insane_plus_2', label: 'Nightmare', desc: 'Limite humaine' }
];

/** Mappe le type de drill vers le paramètre listDrillSongs (Accél et Frein = percentage) */
function drillTypeToServiceParam(drillType) {
  const map = {
    [DRILL_TYPES.ACCELERATOR]: 'percentage',
    [DRILL_TYPES.BRAKE]: 'percentage',
    [DRILL_TYPES.BRAKE_ACCEL]: 'brakeaccel',
    [DRILL_TYPES.COMBINED_VERTICAL]: 'fullcombo',
    [DRILL_TYPES.COMBINED_VERTICAL_MOTEK]: 'fullcombo'
  };
  return map[drillType] || 'percentage';
}

/** Drill Song mock pour Drill complet Motek (Story 1 — stub) */
const MOTEK_MOCK_DRILL_SONG = {
  type: 'random',
  difficulty: 'medium',
  duration: 60
};

function getCustomDrillDescription(difficultyLabel) {
  return `Répétition ciblée (${difficultyLabel}).`;
}

export function DrillsHomeView({
  onStartDrill,
  mappingConfig,
  onMappingConfigChange
}) {
  const [selectedType, setSelectedType] = useState(DRILL_TYPES.ACCELERATOR);
  const [allDrillSongs, setAllDrillSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drillMode, setDrillMode] = useState(''); // '' = aucun | 'random' | 'custom'
  const [selectedRandomLevel, setSelectedRandomLevel] = useState('');
  const [selectedSongPath, setSelectedSongPath] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const serviceParam = drillTypeToServiceParam(selectedType);
  const inputTypeParam = (selectedType === DRILL_TYPES.ACCELERATOR && 'accelerator') ||
    (selectedType === DRILL_TYPES.BRAKE && 'brake') || null;

  useEffect(() => {
    let cancelled = false;

    // Drill complet Motek : pas de liste JSON, source mock
    if (selectedType === DRILL_TYPES.COMBINED_VERTICAL_MOTEK) {
      setLoading(false);
      setAllDrillSongs([]);
      setDrillMode('motek');
      setSelectedRandomLevel('');
      setSelectedSongPath('');
      setSelectedSong(null);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const easy = await listDrillSongs('easy', serviceParam, inputTypeParam);
        const medium = await listDrillSongs('medium', serviceParam, inputTypeParam);
        const hard = await listDrillSongs('hard', serviceParam, inputTypeParam);
        if (cancelled) return;
        setAllDrillSongs([
          ...easy.map(s => ({ ...s, difficulty: 'easy' })),
          ...medium.map(s => ({ ...s, difficulty: 'medium' })),
          ...hard.map(s => ({ ...s, difficulty: 'hard' }))
        ]);
        setDrillMode('');
        setSelectedRandomLevel('');
        setSelectedSongPath('');
        setSelectedSong(null);
      } catch (e) {
        if (!cancelled) console.error('Error loading drill songs:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [serviceParam, inputTypeParam, selectedType]);

  const handleRandomLevelChange = (e) => {
    const key = e.target.value;
    setSelectedRandomLevel(key);
    setDrillMode(key ? 'random' : '');
    setSelectedSongPath('');
    setSelectedSong(null);
  };

  const handleSelectCustomSong = async (path) => {
    setSelectedSongPath(path);
    setDrillMode('custom');
    try {
      const song = await loadDrillSong(path);
      setSelectedSong(song);
    } catch (err) {
      console.error('Error loading drill song:', err);
      setSelectedSong(null);
    }
  };

  const handleStart = () => {
    let drillSong;
    if (selectedType === DRILL_TYPES.COMBINED_VERTICAL_MOTEK || drillMode === 'motek') {
      drillSong = MOTEK_MOCK_DRILL_SONG;
    } else if (drillMode === 'custom' && selectedSong) {
      drillSong = selectedSong;
    } else {
      drillSong = {
        type: 'random',
        difficulty: selectedRandomLevel,
        duration: 60
      };
    }
    const inputType = (selectedType === DRILL_TYPES.ACCELERATOR && 'accelerator') ||
      (selectedType === DRILL_TYPES.BRAKE && 'brake') || null;
    onStartDrill(selectedType, {
      drillSong,
      audioEnabled,
      blindMode,
      inputType
    });
  };

  const isMotekType = selectedType === DRILL_TYPES.COMBINED_VERTICAL_MOTEK;
  const canStart = isMotekType
    ? drillMode === 'motek'
    : (drillMode === 'random' && selectedRandomLevel) || (drillMode === 'custom' && selectedSong);

  return (
    <div className="drills-home-layout">
      <main className="drills-home-main">
        <div className="drills-home-view">
          <DrillsTypeCards
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />

          <section className="drills-home-list-section">
            <div className="drills-home-list-heading">
              <h2 className="drills-home-list-title">Choisir le drill</h2>
              <button
                type="button"
                className="drills-home-settings-button"
                onClick={() => setSettingsOpen(true)}
                aria-label="Ouvrir les réglages"
              >
                ⚙️ Réglages
              </button>
            </div>
            <div className="drills-home-list drills-home-list-all" data-testid="drills-list">
              {loading && (
                <p className="drills-home-loading">Chargement…</p>
              )}
              {!loading && isMotekType && (
                <div
                  role="button"
                  tabIndex={0}
                  className="drills-home-list-item drills-home-list-item-motek drills-home-list-item-selected"
                  data-testid="drill-motek-demo"
                  onClick={() => setDrillMode('motek')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setDrillMode('motek');
                    }
                  }}
                >
                  <span className="drills-home-list-item-name">Mode démo (mock)</span>
                  <span className="drills-home-list-item-desc">Exercice minimal pour valider l’intégration</span>
                </div>
              )}
              {!loading && !isMotekType && (
                <>
                  <div className="drills-home-random-row">
                    <div
                      role="button"
                      tabIndex={0}
                      className={`drills-home-list-item drills-home-list-item-random ${drillMode === 'random' ? 'drills-home-list-item-selected' : ''}`}
                      onClick={() => {
                        setDrillMode('random');
                        setSelectedSongPath('');
                        setSelectedSong(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDrillMode('random');
                          setSelectedSongPath('');
                          setSelectedSong(null);
                        }
                      }}
                    >
                      <span className="drills-home-list-item-name">Mode aléatoire</span>
                    </div>
                    <div
                      className={`drills-home-list-item drills-home-list-item-dropdown-wrap ${drillMode === 'random' ? 'drills-home-list-item-selected' : ''}`}
                    >
                      <select
                        className="drills-home-list-item-select"
                        value={selectedRandomLevel}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRandomLevelChange(e);
                        }}
                        aria-label="Choisir la difficulté"
                        title="Choisir la difficulté pour le mode aléatoire"
                      >
                        <option value="">Choisir la difficulté</option>
                        {RANDOM_LEVELS.map(({ key, label, desc }) => (
                          <option key={key} value={key}>
                            {label} — {desc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {allDrillSongs.length > 0 && (
                    <>
                      <span className="drills-home-list-group-label">Exercices personnalisés</span>
                      {allDrillSongs.map((song) => (
                        <button
                          key={song.path}
                          type="button"
                          className={`drills-home-list-item ${drillMode === 'custom' && selectedSongPath === song.path ? 'drills-home-list-item-selected' : ''}`}
                          onClick={() => handleSelectCustomSong(song.path)}
                        >
                          <span className="drills-home-list-item-name">{song.name}</span>
                          <span className="drills-home-list-item-desc">
                            {getCustomDrillDescription(DIFFICULTY_LABELS[song.difficulty] || song.difficulty)}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
            <div className="drills-home-actions">
            <button
              type="button"
              className="drills-home-start-button"
              onClick={handleStart}
              disabled={loading || !canStart}
              data-testid="drill-start-button"
            >
              Lancer le drill
            </button>
          </div>
        </section>
        </div>
      </main>

      <aside className={`drills-settings-sidebar ${settingsOpen ? 'drills-settings-sidebar-open' : ''}`}>
        <DrillsSettingsPanel
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          audioEnabled={audioEnabled}
          onAudioEnabledChange={setAudioEnabled}
          blindMode={blindMode}
          onBlindModeChange={setBlindMode}
          mappingConfig={mappingConfig}
          onMappingConfigChange={onMappingConfigChange}
        />
      </aside>
    </div>
  );
}
