/**
 * Composant FullComboVerticalDrill
 * 
 * Drill Complet VERTICAL style DDR avec 4 lanes en colonnes :
 * - Lane 1 : Frein (rouge)
 * - Lane 2 : Volant (bleu) - angle en degrés
 * - Lane 3 : Accélérateur (vert)
 * - Lane 4 : Shifter (orange) - up/down
 * 
 * Lanes en colonnes, cibles défilent du haut vers le bas.
 * Stats bar à gauche, Inputs bar à droite.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { DDRConfig } from './DDRConfig';
import { DDRStatsBar } from './DDRStatsBar';
import { DDRFullGameplayAreaVertical } from './DDRFullGameplayAreaVertical';
import { DDRInputsBar } from './DDRInputsBar';
import { DDRResultsScreen } from './DDRResultsScreen';
import { usePercentageDrill, ZONE_STATUS, statsFromJudgmentCounts } from '../../hooks/useDrillEngine';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import './FullComboVerticalDrill.css';

export function FullComboVerticalDrill({ 
  acceleratorValue, 
  brakeValue,
  wheelValue,
  shiftUp,
  shiftDown,
  onBack 
}) {
  // État de configuration
  const [showConfig, setShowConfig] = useState(true);
  const [tolerance, setTolerance] = useState(2);
  const [difficulty, setDifficulty] = useState('MEDIUM'); 
  const [drillSong, setDrillSong] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false); // Temporairement désactivé
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  
  // État de jeu
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalJudgmentCounts, setFinalJudgmentCounts] = useState({ 
    PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 
  });

  // Hook de drill pour les stats
  const {
    score,
    timeInZone,
    totalTime,
    zoneStatus,
    accuracy,
    reset
  } = usePercentageDrill({
    targetPercent: 60,
    tolerance,
    currentValue: acceleratorValue + brakeValue,
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

  const resultsStats = (() => {
    const { accuracy: acc, score: sc } = statsFromJudgmentCounts(finalJudgmentCounts);
    return { accuracy: acc, score: sc, totalTime };
  })();

  const playedCompletionSoundRef = useRef(false);
  useEffect(() => {
    if (showResults && audioEnabled && !playedCompletionSoundRef.current) {
      playedCompletionSoundRef.current = true;
      enhancedDrillAudioService.playCompletionSound(resultsStats.accuracy > 70);
    }
    if (!showResults) playedCompletionSoundRef.current = false;
  }, [showResults, audioEnabled, resultsStats.accuracy]);
  
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
      <div className="full-combo-vertical-drill">
        <DDRConfig
          inputType="fullcombo"
          onInputTypeChange={() => {}}
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
          showInputTypeSelector={false}
          drillType="fullcombo"
        />
      </div>
    );
  }

  // Écran de résultats (accuracy/score dérivés des jugements, pas du hook usePercentageDrill)
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

  // Mode jeu actif avec layout VERTICAL (colonnes)
  return (
    <div className="full-combo-vertical-drill full-combo-vertical-drill-ddr">
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

      {/* Layout vertical : Stats Left | Gameplay Center | Inputs Right */}
      <div className="full-combo-vertical-container">
        {/* Stats à gauche */}
        <div className="full-combo-vertical-sidebar full-combo-vertical-left">
          <DDRStatsBar
            totalTime={totalTime}
            zoneStatus={zoneStatus}
            accuracy={accuracy}
            score={score}
            vertical={true}
          />
        </div>

        {/* Gameplay au centre avec 4 lanes côte à côte */}
        <div className="full-combo-vertical-gameplay">
          <DDRFullGameplayAreaVertical
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

        {/* Inputs à droite */}
        <div className="full-combo-vertical-sidebar full-combo-vertical-right">
          <DDRInputsBar
            accelerator={acceleratorValue}
            brake={brakeValue}
            wheel={wheelValue}
            shiftUp={shiftUp}
            shiftDown={shiftDown}
            vertical={true}
          />
        </div>
      </div>
    </div>
  );
}
