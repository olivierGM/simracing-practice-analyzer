/**
 * Composant BrakeAccelDrill
 * 
 * Drill combiné Frein + Accélérateur style DDR
 * Interface avec 2 rangées superposées :
 * - Rangée du haut : Accélérateur (vert)
 * - Rangée du bas : Frein (rouge)
 * 
 * Basé sur PercentageDrill mais adapté pour 2 inputs simultanés
 */

import { useState, useCallback } from 'react';
import { DDRStatsBar } from './DDRStatsBar';
import { DDRDualGameplayArea } from './DDRDualGameplayArea';
import { DDRInputsBar } from './DDRInputsBar';
import { DDRResultsScreen } from './DDRResultsScreen';
import { usePercentageDrill, ZONE_STATUS, statsFromJudgmentCounts } from '../../hooks/useDrillEngine';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import './BrakeAccelDrill.css';

export function BrakeAccelDrill({ 
  acceleratorValue, 
  brakeValue,
  wheelValue,
  shiftUp,
  shiftDown,
  onBack,
  initialDrillSong = null,
  initialAudioEnabled = false,
  initialBlindMode = false
}) {
  const [tolerance, setTolerance] = useState(2);
  const [difficulty, setDifficulty] = useState('MEDIUM'); 
  const [drillSong, setDrillSong] = useState(initialDrillSong);
  const [audioEnabled, setAudioEnabled] = useState(initialAudioEnabled);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [blindMode, setBlindMode] = useState(initialBlindMode);
  const [isActive, setIsActive] = useState(!!initialDrillSong);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalJudgmentCounts, setFinalJudgmentCounts] = useState({ 
    PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 
  });

  // Hook de drill pour les stats (on utilise les deux valeurs)
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
    setIsActive(false);
    setIsPaused(false);
    setShowResults(true);
  }, []);
  
  const handleRestart = useCallback(() => {
    setShowResults(false);
    reset();
    setFinalJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    setIsActive(true);
    setIsPaused(false);
  }, [reset]);
  
  const handleBackToMenu = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleJudgmentUpdate = useCallback((judgment) => {
    setFinalJudgmentCounts(prev => ({
      ...prev,
      [judgment]: (prev[judgment] || 0) + 1
    }));
  }, []);

  const resultsStats = (() => {
    const { accuracy: acc, score: sc } = statsFromJudgmentCounts(finalJudgmentCounts);
    return { accuracy: acc, score: sc, totalTime };
  })();

  if (showResults) {
    return (
      <DDRResultsScreen
        stats={resultsStats}
        judgmentCounts={finalJudgmentCounts}
        comboInfo={enhancedDrillAudioService.getComboInfo()}
        onRestart={handleRestart}
        onBack={handleBackToMenu}
      />
    );
  }

  // Mode jeu actif avec 2 rangées
  return (
    <div className="brake-accel-drill brake-accel-drill-ddr">
      {/* Header avec contrôles */}
      <div className="drill-header drill-header-compact">
        <button className="drill-back-button" onClick={handleStop}>
          ⏹️
        </button>
        <h3 className="drill-title drill-title-compact">
          Drill Frein + Accélérateur
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

      {/* Section 2: Gameplay DDR avec 2 rangées */}
      <div className="ddr-dual-gameplay-container">
        <DDRDualGameplayArea
          acceleratorValue={acceleratorValue}
          brakeValue={brakeValue}
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
