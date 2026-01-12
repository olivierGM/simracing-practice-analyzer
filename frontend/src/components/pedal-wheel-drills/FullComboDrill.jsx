/**
 * Composant FullComboDrill
 * 
 * Drill Complet style DDR avec 4 lanes :
 * - Lane 1 : Frein (rouge)
 * - Lane 2 : Volant (bleu) - angle en degrés
 * - Lane 3 : Accélérateur (vert)
 * - Lane 4 : Shifter (orange) - up/down
 * 
 * Basé sur BrakeAccelDrill mais étendu pour 4 inputs simultanés
 */

import { useState, useCallback } from 'react';
import { DDRConfig } from './DDRConfig';
import { DDRStatsBar } from './DDRStatsBar';
import { DDRFullGameplayArea } from './DDRFullGameplayArea';
import { DDRInputsBar } from './DDRInputsBar';
import { DDRResultsScreen } from './DDRResultsScreen';
import { usePercentageDrill, ZONE_STATUS } from '../../hooks/useDrillEngine';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import './FullComboDrill.css';

export function FullComboDrill({ 
  acceleratorValue, 
  brakeValue,
  wheelValue,
  shiftUp,
  shiftDown,
  onBack 
}) {
  // État de configuration
  const [showConfig, setShowConfig] = useState(true);
  const [tolerance, setTolerance] = useState(5); // Tolérance en % (et degrés pour le volant)
  const [difficulty, setDifficulty] = useState('MEDIUM'); 
  const [drillSong, setDrillSong] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  
  // État de jeu
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalJudgmentCounts, setFinalJudgmentCounts] = useState({ 
    PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 
  });

  // Hook de drill pour les stats (on combine toutes les valeurs)
  const {
    score,
    timeInZone,
    totalTime,
    zoneStatus,
    accuracy,
    reset
  } = usePercentageDrill({
    targetPercent: 60, // Temporaire
    tolerance,
    currentValue: acceleratorValue + brakeValue, // Combiné pour les stats
    isActive: isActive && !isPaused
  });

  const handleStart = useCallback(() => {
    setShowConfig(false);
    setShowResults(false);
    reset();
    setIsActive(true);
    setIsPaused(false);
  }, [reset]);

  const handlePause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleStop = useCallback(() => {
    if (audioEnabled) {
      const success = accuracy > 70;
      enhancedDrillAudioService.playCompletionSound(success);
    }
    
    setIsActive(false);
    setIsPaused(false);
    setShowResults(true);
  }, [audioEnabled, accuracy]);
  
  const handleRestart = useCallback(() => {
    setShowResults(false);
    reset();
    setFinalJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    handleStart();
  }, [reset, handleStart]);
  
  const handleBackToMenu = useCallback(() => {
    setShowResults(false);
    reset();
    setFinalJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    setShowConfig(true);
  }, [reset]);

  const handleJudgmentUpdate = useCallback((judgment) => {
    setFinalJudgmentCounts(prev => ({
      ...prev,
      [judgment]: (prev[judgment] || 0) + 1
    }));
  }, []);

  // Mode configuration
  if (showConfig) {
    return (
      <div className="full-combo-drill">
        <DDRConfig
          inputType="fullcombo" // Nouveau type pour le config
          onInputTypeChange={() => {}} // Pas de changement d'input pour ce drill
          tolerance={tolerance}
          onToleranceChange={setTolerance}
          drillSong={drillSong}
          onDrillSongChange={(songOrMode) => {
            setDrillSong(songOrMode);
            if (songOrMode && songOrMode.type === 'random') {
              const diffMap = {
                easy: 'MEDIUM',
                medium: 'MEDIUM',
                hard: 'HARD',
                extreme: 'EXTREME'
              };
              setDifficulty(diffMap[songOrMode.difficulty] || 'MEDIUM');
            } else if (songOrMode && songOrMode.difficulty) {
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
          showInputTypeSelector={false} // Cacher le sélecteur d'input
          drillType="fullcombo" // Type de drill pour charger les bons JSON
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

  // Mode jeu actif avec 4 lanes
  return (
    <div className="full-combo-drill full-combo-drill-ddr">
      {/* Header avec contrôles */}
      <div className="drill-header drill-header-compact">
        <button className="drill-back-button" onClick={handleStop}>
          ⏹️
        </button>
        <h3 className="drill-title drill-title-compact">
          🎯 Drill Complet
        </h3>
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

      {/* Section 2: Gameplay DDR avec 4 lanes */}
      <div className="ddr-full-gameplay-container">
        <DDRFullGameplayArea
          brakeValue={brakeValue}
          wheelValue={wheelValue}
          acceleratorValue={acceleratorValue}
          shiftUp={shiftUp}
          shiftDown={shiftDown}
          tolerance={tolerance}
          isActive={isActive && !isPaused}
          drillSong={drillSong}
          duration={drillSong && drillSong.duration ? drillSong.duration : null}
          difficulty={drillSong && drillSong.type === 'random' ? drillSong.difficulty : (drillSong && drillSong.difficulty ? drillSong.difficulty : 'medium')}
          audioEnabled={audioEnabled}
          musicEnabled={musicEnabled}
          blindMode={blindMode}
          onJudgmentUpdate={handleJudgmentUpdate}
          onComplete={handleStop}
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
