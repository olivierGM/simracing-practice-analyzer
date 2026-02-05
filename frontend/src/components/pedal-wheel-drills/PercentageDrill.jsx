/**
 * Composant PercentageDrill
 * 
 * Drill de pourcentages style DDR avec interface de jeu
 * - Section haute : Stats
 * - Section centrale : Gameplay DDR avec barres qui défilent
 * - Section basse : Inputs compacts
 */

import { useState, useEffect } from 'react';
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
  onBack,
  initialDrillSong = null,
  initialAudioEnabled = false,
  initialBlindMode = false,
  initialInputType = 'brake'
}) {
  const [inputType] = useState(initialInputType);
  const [tolerance] = useState(2);
  const [, _setDifficulty] = useState('MEDIUM');
  const [drillSong] = useState(initialDrillSong);
  const [audioEnabled, _setAudioEnabled] = useState(initialAudioEnabled);
  const [musicEnabled, _setMusicEnabled] = useState(false);
  const [blindMode, _setBlindMode] = useState(initialBlindMode);
  const [isActive, setIsActive] = useState(!!initialDrillSong);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalJudgmentCounts, setFinalJudgmentCounts] = useState({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });

  useEffect(() => {
    if (!initialDrillSong) onBack();
  }, [initialDrillSong, onBack]);

  // Valeur actuelle selon le type d'input
  const currentValue = inputType === 'accelerator' ? acceleratorValue : brakeValue;

  // Hook de drill pour les stats
  const {
    score,
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

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    // Jouer le son de fin
    if (audioEnabled) {
      const _comboInfo = enhancedDrillAudioService.getComboInfo();
      const success = accuracy > 70; // Considérer comme succès si >70% de précision
      enhancedDrillAudioService.playCompletionSound(success);
    }
    
    // Afficher l'écran de résultats
    setIsActive(false);
    setIsPaused(false);
    setShowResults(true);
  };
  
  const handleRestart = () => {
    setShowResults(false);
    reset();
    setFinalJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    setIsActive(true);
    setIsPaused(false);
  };

  const handleBackToMenu = () => {
    onBack();
  };


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
      <div className="drill-header drill-header-compact">
        <button className="drill-back-button" onClick={handleStop}>
          ⏹️
        </button>
        <h3 className="drill-title drill-title-compact">Drill de Pourcentages</h3>
        <button 
          className="drill-button drill-button-pause" 
          onClick={handlePause}
        >
          {isPaused ? '▶️' : '⏸️'}
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
          inputType={inputType}
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
