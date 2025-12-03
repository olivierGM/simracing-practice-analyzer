/**
 * Composant PercentageDrill
 * 
 * Drill de pourcentages style DDR avec interface de jeu
 * - Section haute : Stats
 * - Section centrale : Gameplay DDR avec barres qui défilent
 * - Section basse : Inputs compacts
 */

import { useState } from 'react';
import { DDRConfig, DIFFICULTY_MODES } from './DDRConfig';
import { DDRStatsBar } from './DDRStatsBar';
import { DDRGameplayArea } from './DDRGameplayArea';
import { DDRInputsBar } from './DDRInputsBar';
import { DDRResultsScreen } from './DDRResultsScreen';
import { usePercentageDrill, ZONE_STATUS } from '../../hooks/useDrillEngine';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import './PercentageDrill.css';

export function PercentageDrill({ 
  acceleratorValue, 
  brakeValue,
  wheelValue,
  shiftUp,
  shiftDown,
  onBack 
}) {
  // État de configuration
  const [showConfig, setShowConfig] = useState(true);
  const [inputType, setInputType] = useState('accelerator'); // 'accelerator' ou 'brake'
  const [tolerance, setTolerance] = useState(5); // Tolérance en % (champ séparé pour tester)
  const [difficulty, setDifficulty] = useState('MEDIUM'); // Difficulté pour les modes Random (vitesse, durée, etc.)
  const [drillSong, setDrillSong] = useState(null); // Drill song sélectionné ou { type: 'random', difficulty: 'medium' }
  const [audioEnabled, setAudioEnabled] = useState(true); // Sons activés
  const [musicEnabled, setMusicEnabled] = useState(false); // Musique de fond (désactivée par défaut)
  const [blindMode, setBlindMode] = useState(false); // Mode blind (cacher barre verticale)
  
  // État de jeu
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalJudgmentCounts, setFinalJudgmentCounts] = useState({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });

  // Valeur actuelle selon le type d'input
  const currentValue = inputType === 'accelerator' ? acceleratorValue : brakeValue;

  // Hook de drill pour les stats
  const {
    score,
    timeInZone,
    totalTime,
    zoneStatus,
    accuracy,
    reset
  } = usePercentageDrill({
    targetPercent: 60, // Temporaire, sera géré par les cibles DDR
    tolerance,
    currentValue,
    isActive: isActive && !isPaused
  });

  const handleStart = () => {
    setShowConfig(false);
    setShowResults(false);
    reset();
    
    // Démarrer directement le jeu
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    
    // Jouer le son de fin
    if (audioEnabled) {
      const comboInfo = enhancedDrillAudioService.getComboInfo();
      const success = accuracy > 70; // Considérer comme succès si >70% de précision
      enhancedDrillAudioService.playCompletionSound(success);
    }
    
    // Afficher l'écran de résultats
    setShowResults(true);
  };
  
  const handleRestart = () => {
    setShowResults(false);
    reset();
    setFinalJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    handleStart();
  };
  
  const handleBackToMenu = () => {
    setShowResults(false);
    reset();
    setFinalJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    setShowConfig(true);
  };

  // Si on est en mode configuration
  if (showConfig || !isActive) {
    return (
      <div className="percentage-drill">
        <DDRConfig
          inputType={inputType}
          onInputTypeChange={setInputType}
          tolerance={tolerance}
          onToleranceChange={setTolerance}
          drillSong={drillSong}
          onDrillSongChange={(songOrMode) => {
            setDrillSong(songOrMode);
            // Si c'est un mode random, extraire la difficulté pour la vitesse
            if (songOrMode && songOrMode.type === 'random') {
              const diffMap = {
                easy: 'MEDIUM',
                medium: 'MEDIUM',
                hard: 'HARD',
                extreme: 'EXTREME',
                insane: 'INSANE',
                insane_plus_1: 'INSANE_PLUS_1',
                insane_plus_2: 'INSANE_PLUS_2'
              };
              setDifficulty(diffMap[songOrMode.difficulty] || 'MEDIUM');
            } else if (songOrMode && songOrMode.difficulty) {
              // Si c'est un drill song, utiliser sa difficulté pour la vitesse
              const diffMap = {
                easy: 'MEDIUM',
                medium: 'MEDIUM',
                hard: 'HARD'
              };
              setDifficulty(diffMap[songOrMode.difficulty] || 'MEDIUM');
            }
          }}
          onDifficultyChange={setDifficulty}
          audioEnabled={audioEnabled}
          onAudioEnabledChange={setAudioEnabled}
          musicEnabled={musicEnabled}
          onMusicEnabledChange={setMusicEnabled}
          blindMode={blindMode}
          onBlindModeChange={setBlindMode}
          onStart={handleStart}
          onBack={onBack}
        />
      </div>
    );
  }

  // Écran de résultats
  if (showResults) {
    return (
      <DDRResultsScreen
        stats={{ accuracy, score, totalTime }}
        judgmentCounts={finalJudgmentCounts}
        comboInfo={enhancedDrillAudioService.getComboInfo()}
        onRestart={handleRestart}
        onBack={handleBackToMenu}
      />
    );
  }

  // Mode jeu actif
  return (
    <div className="percentage-drill percentage-drill-ddr">
      {/* Header avec contrôles */}
      <div className="drill-header">
        <button className="drill-back-button" onClick={handleStop}>
          ⏹️ Arrêter
        </button>
        <h2 className="drill-title">📊 Drill de Pourcentages</h2>
        <button 
          className="drill-button drill-button-pause" 
          onClick={handlePause}
        >
          {isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
        </button>
      </div>

      {/* Section 1: Stats */}
      <DDRStatsBar
        totalTime={totalTime}
        zoneStatus={zoneStatus}
        accuracy={accuracy}
        score={score}
      />

      {/* Section 2: Gameplay DDR */}
      <div className="ddr-gameplay-container">
        <DDRGameplayArea
          currentValue={currentValue}
          tolerance={tolerance}
          isActive={isActive && !isPaused}
          drillSong={drillSong}
          duration={drillSong && drillSong.duration ? drillSong.duration : null}
          difficulty={drillSong && drillSong.type === 'random' ? drillSong.difficulty : (drillSong && drillSong.difficulty ? drillSong.difficulty : 'medium')}
          audioEnabled={audioEnabled}
          musicEnabled={musicEnabled}
          blindMode={blindMode}
          onJudgmentUpdate={(judgment) => {
            setFinalJudgmentCounts(prev => ({
              ...prev,
              [judgment]: (prev[judgment] || 0) + 1
            }));
          }}
          onComplete={() => {
            // Le drill song est terminé, arrêter automatiquement
            handleStop();
          }}
        />
      </div>

      {/* Section 3: Inputs compacts */}
      <DDRInputsBar
        accelerator={acceleratorValue}
        brake={brakeValue}
        wheel={wheelValue}
        shiftUp={shiftUp}
        shiftDown={shiftDown}
      />
    </div>
  );
}
