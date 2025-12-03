/**
 * Composant DrillSongSelector
 * 
 * Sélecteur de drill song (comme une playlist de chansons)
 * Combine les modes Random (par difficulté) et tous les drill songs customs
 */

import { useState, useEffect } from 'react';
import { listDrillSongs, loadDrillSong } from '../../services/drillSongService';
import './DrillSongSelector.css';

const DIFFICULTY_LABELS = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
  extreme: 'Extreme',
  insane: 'Insane',
  insane_plus_1: 'Insane +1',
  insane_plus_2: 'Insane +2'
};

const TOLERANCE_BY_DIFFICULTY = {
  easy: 10,
  medium: 5,
  hard: 2,
  extreme: 2,
  insane: 1.5,
  insane_plus_1: 1,
  insane_plus_2: 0.5
};

export function DrillSongSelector({ onSelectDrillSong, onSelectDifficulty }) {
  const [allDrillSongs, setAllDrillSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState('random-easy'); // ID du mode/song sélectionné
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    loadAllDrillSongs();
  }, []);

  const loadAllDrillSongs = async () => {
    setLoading(true);
    try {
      // Charger les drill songs de toutes les difficultés
      const easySongs = await listDrillSongs('easy');
      const mediumSongs = await listDrillSongs('medium');
      const hardSongs = await listDrillSongs('hard');
      
      // Combiner tous les songs avec leur difficulté
      const allSongs = [
        ...easySongs.map(s => ({ ...s, difficulty: 'easy' })),
        ...mediumSongs.map(s => ({ ...s, difficulty: 'medium' })),
        ...hardSongs.map(s => ({ ...s, difficulty: 'hard' }))
      ];
      
      setAllDrillSongs(allSongs);
      
      // Par défaut, sélectionner Random Easy
      handleSelectRandom('easy');
    } catch (error) {
      console.error('Error loading drill songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRandom = (difficultyKey) => {
    setSelectedMode(`random-${difficultyKey}`);
    setSelectedSong(null);
    
    // Notifier le changement de difficulté pour la vitesse (pas la tolérance)
    if (onSelectDifficulty) {
      const difficultyMap = {
        easy: 'EASY',
        medium: 'MEDIUM',
        hard: 'HARD',
        extreme: 'EXTREME',
        insane: 'INSANE',
        insane_plus_1: 'INSANE_PLUS_1',
        insane_plus_2: 'INSANE_PLUS_2'
      };
      onSelectDifficulty(difficultyMap[difficultyKey]);
    }
    
    if (onSelectDrillSong) {
      onSelectDrillSong({ type: 'random', difficulty: difficultyKey });
    }
  };

  const handleSelectSong = async (songPath, songDifficulty) => {
    try {
      const song = await loadDrillSong(songPath);
      setSelectedSong(song);
      setSelectedMode(songPath);
      
      // Notifier le changement de difficulté pour la vitesse (pas la tolérance)
      if (onSelectDifficulty) {
        const difficultyMap = {
          easy: 'EASY',
          medium: 'MEDIUM',
          hard: 'HARD'
        };
        const finalDifficulty = songDifficulty || song.difficulty;
        onSelectDifficulty(difficultyMap[finalDifficulty] || 'EASY');
      }
      
      if (onSelectDrillSong) {
        onSelectDrillSong(song);
      }
    } catch (error) {
      console.error('Error loading selected drill song:', error);
    }
  };

  if (loading) {
    return (
      <div className="drill-song-selector">
        <p>Chargement des drills...</p>
      </div>
    );
  }

  return (
    <div className="drill-song-selector">
      <label className="drill-song-selector-label">Mode de Drill:</label>
      
      <div className="drill-songs-list">
        {/* Options Random par difficulté */}
        <div className="drill-song-section">
          <h4 className="drill-song-section-title">🎲 Mode Aléatoire</h4>
          {['easy', 'medium', 'hard', 'extreme', 'insane', 'insane_plus_1', 'insane_plus_2'].map(diffKey => (
            <button
              key={`random-${diffKey}`}
              className={`drill-song-item drill-song-item-random ${selectedMode === `random-${diffKey}` ? 'drill-song-item-selected' : ''}`}
              onClick={() => handleSelectRandom(diffKey)}
            >
              <div className="drill-song-info">
                <div className="drill-song-name">Random {DIFFICULTY_LABELS[diffKey]}</div>
                <div className="drill-song-description">
                  {diffKey === 'easy' && 'Cibles plus longues et espacées - Vitesse lente'}
                  {diffKey === 'medium' && 'Cibles moyennes et espacées - Vitesse modérée'}
                  {diffKey === 'hard' && 'Cibles courtes et rapprochées - Vitesse rapide'}
                  {diffKey === 'extreme' && 'Gaps réduits, beaucoup de mouvement - Très rapide'}
                  {diffKey === 'insane' && 'Cibles très courtes, gaps minimaux - Extrêmement rapide'}
                  {diffKey === 'insane_plus_1' && 'Cibles ultra-courtes, gaps quasi-nuls - Fou'}
                  {diffKey === 'insane_plus_2' && 'Limite humaine - Réflexes surhumains requis'}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Drill Songs Customs */}
        {allDrillSongs.length > 0 && (
          <div className="drill-song-section">
            <h4 className="drill-song-section-title">🎵 Drill Songs ({allDrillSongs.length})</h4>
            {allDrillSongs.map((song) => (
              <button
                key={song.path}
                className={`drill-song-item ${selectedMode === song.path ? 'drill-song-item-selected' : ''}`}
                onClick={() => handleSelectSong(song.path, song.difficulty)}
              >
                <div className="drill-song-info">
                  <div className="drill-song-name">{song.name}</div>
                  <div className="drill-song-description">
                    {DIFFICULTY_LABELS[song.difficulty]} - Drill song personnalisé
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {selectedMode.startsWith('random-') && (
        <div className="drill-song-details">
          <div className="drill-song-detail-item">
            <span className="drill-song-detail-label">Mode:</span>
            <span className="drill-song-detail-value">Génération continue</span>
          </div>
          <div className="drill-song-detail-item">
            <span className="drill-song-detail-label">Difficulté:</span>
            <span className="drill-song-detail-value">
              {DIFFICULTY_LABELS[selectedMode.split('-')[1]]}
            </span>
          </div>
          <div className="drill-song-detail-item">
            <span className="drill-song-detail-label">Vitesse:</span>
            <span className="drill-song-detail-value">
              {selectedMode.split('-')[1] === 'easy' ? 'Lente' : selectedMode.split('-')[1] === 'medium' ? 'Modérée' : 'Rapide'}
            </span>
          </div>
        </div>
      )}

      {selectedSong && (
        <div className="drill-song-details">
          <div className="drill-song-detail-item">
            <span className="drill-song-detail-label">Durée:</span>
            <span className="drill-song-detail-value">{selectedSong.duration.toFixed(1)}s</span>
          </div>
          <div className="drill-song-detail-item">
            <span className="drill-song-detail-label">Cibles:</span>
            <span className="drill-song-detail-value">{selectedSong.targets.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
