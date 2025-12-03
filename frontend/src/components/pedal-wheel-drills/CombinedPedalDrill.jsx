/**
 * Composant CombinedPedalDrill
 * 
 * Drill combiné : Accélérateur + Frein simultanés
 * Layout empilé verticalement (responsive)
 */

import { useState } from 'react';
import { DDRConfig } from './DDRConfig';
import { DDRStatsBar } from './DDRStatsBar';
import { DualDDRGameplayArea } from './DualDDRGameplayArea';
import { DDRResultsScreen } from './DDRResultsScreen';
import './CombinedPedalDrill.css';

export function CombinedPedalDrill({ 
  acceleratorValue, 
  brakeValue,
  wheelValue,
  shiftUp,
  shiftDown,
  onBack 
}) {
  // État de configuration
  const [showConfig, setShowConfig] = useState(true);
  const [tolerance, setTolerance] = useState(5);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [drillSong, setDrillSong] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  
  // État de jeu
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Stats séparées pour chaque pédale
  const [brakeStats, setBrakeStats] = useState({ score: 0, accuracy: 0 });
  const [throttleStats, setThrottleStats] = useState({ score: 0, accuracy: 0 });
  const [brakeJudgmentCounts, setBrakeJudgmentCounts] = useState({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
  const [throttleJudgmentCounts, setThrottleJudgmentCounts] = useState({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });

  const handleStart = () => {
    setShowConfig(false);
    setIsActive(true);
    setIsPaused(false);
    setShowResults(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setShowResults(true);
  };
  
  const handleRestart = () => {
    setShowResults(false);
    setBrakeStats({ score: 0, accuracy: 0 });
    setThrottleStats({ score: 0, accuracy: 0 });
    setBrakeJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    setThrottleJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    handleStart();
  };
  
  const handleBackToMenu = () => {
    setShowResults(false);
    setBrakeStats({ score: 0, accuracy: 0 });
    setThrottleStats({ score: 0, accuracy: 0 });
    setBrakeJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    setThrottleJudgmentCounts({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
    setShowConfig(true);
  };

  // Si on est en mode configuration
  if (showConfig) {
    return (
      <div className="combined-pedal-drill">
        <DDRConfig
          inputType={'combined'} // Mode combiné
          onInputTypeChange={() => {}} // Pas de changement pour mode combiné
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
                extreme: 'EXTREME',
                insane: 'INSANE',
                insane_plus_1: 'INSANE_PLUS_1',
                insane_plus_2: 'INSANE_PLUS_2'
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
        />
      </div>
    );
  }

  // Écran de résultats
  if (showResults) {
    // Score et accuracy combinés
    const combinedScore = brakeStats.score + throttleStats.score;
    const combinedAccuracy = Math.round((brakeStats.accuracy + throttleStats.accuracy) / 2);
    
    return (
      <DDRResultsScreen
        stats={{ 
          accuracy: combinedAccuracy, 
          score: combinedScore, 
          totalTime: 0 
        }}
        judgmentCounts={{
          PERFECT: brakeJudgmentCounts.PERFECT + throttleJudgmentCounts.PERFECT,
          GREAT: brakeJudgmentCounts.GREAT + throttleJudgmentCounts.GREAT,
          GOOD: brakeJudgmentCounts.GOOD + throttleJudgmentCounts.GOOD,
          OK: brakeJudgmentCounts.OK + throttleJudgmentCounts.OK,
          MISS: brakeJudgmentCounts.MISS + throttleJudgmentCounts.MISS
        }}
        comboInfo={{ current: 0, max: 0 }}
        onRestart={handleRestart}
        onBack={handleBackToMenu}
      />
    );
  }

  // Mode jeu actif
  return (
    <div className="combined-pedal-drill combined-pedal-drill-ddr">
      {/* Header avec contrôles */}
      <div className="drill-header drill-header-compact">
        <button className="drill-back-button" onClick={handleStop}>
          ⏹️
        </button>
        <h3 className="drill-title drill-title-compact">Drill Combiné (Alpha)</h3>
        <button 
          className="drill-button drill-button-pause" 
          onClick={handlePause}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
      </div>

      {/* Section 1: Stats */}
      <DDRStatsBar
        score={brakeStats.score + throttleStats.score}
        accuracy={Math.round((brakeStats.accuracy + throttleStats.accuracy) / 2)}
        timeInZone={0}
        totalTime={0}
      />

      {/* Section 2: Gameplay dual (empilé) */}
      <div className="ddr-gameplay-container">
        <DualDDRGameplayArea
          brakeValue={brakeValue}
          throttleValue={acceleratorValue}
          isActive={isActive && !isPaused}
          isPaused={isPaused}
          difficulty={difficulty}
          tolerance={tolerance}
          audioEnabled={audioEnabled}
          blindMode={blindMode}
          drillSong={drillSong}
          onBrakeStatsUpdate={setBrakeStats}
          onThrottleStatsUpdate={setThrottleStats}
          onBrakeJudgmentUpdate={setBrakeJudgmentCounts}
          onThrottleJudgmentUpdate={setThrottleJudgmentCounts}
        />
      </div>
    </div>
  );
}

