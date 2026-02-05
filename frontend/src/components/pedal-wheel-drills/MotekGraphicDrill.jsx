/**
 * MotekGraphicDrill
 *
 * Variante du Drill complet Motek avec visualisation en LIGNES (graphique).
 * Plus facile à comprendre : lignes au lieu de boîtes.
 * Feedback rythme : déviation en ms (trop tôt / parfait / trop tard).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { DDRStatsBar } from './DDRStatsBar';
import { MotekGraphicGameplay } from './MotekGraphicGameplay';
import { DDRInputsBar } from './DDRInputsBar';
import { DDRResultsScreen } from './DDRResultsScreen';
import { usePercentageDrill, statsFromJudgmentCounts } from '../../hooks/useDrillEngine';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import './FullComboVerticalDrill.css';

export function MotekGraphicDrill({
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
  const [tolerance] = useState(2);
  const [drillSong] = useState(initialDrillSong);
  const [audioEnabled, _setAudioEnabled] = useState(initialAudioEnabled);
  const [_blindMode, _setBlindMode] = useState(initialBlindMode);
  const [isActive, setIsActive] = useState(!!initialDrillSong);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalJudgmentCounts, setFinalJudgmentCounts] = useState({
    PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0
  });

  const { score, totalTime, zoneStatus, accuracy, reset } = usePercentageDrill({
    targetPercent: 60,
    tolerance,
    currentValue: acceleratorValue + brakeValue,
    isActive: isActive && !isPaused
  });

  const _handleStart = useCallback(() => {
    setShowResults(false);
    reset();
    setIsActive(true);
    setIsPaused(false);
  }, [reset]);

  const handlePause = useCallback(() => setIsPaused((p) => !p), []);
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
    setIsActive(true);
    setIsPaused(false);
  }, [reset]);

  const handleJudgmentUpdate = useCallback((judgment) => {
    setFinalJudgmentCounts((prev) => ({
      ...prev,
      [judgment]: (prev[judgment] || 0) + 1
    }));
  }, []);

  if (showResults) {
    return (
      <DDRResultsScreen
        stats={resultsStats}
        judgmentCounts={finalJudgmentCounts}
        comboInfo={enhancedDrillAudioService.getComboInfo()}
        onRestart={handleRestart}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="full-combo-vertical-drill full-combo-vertical-drill-ddr motek-graphic-drill" data-testid="motek-graphic-active">
      <div className="drill-header drill-header-compact">
        <button className="drill-back-button" onClick={handleStop}>
          ⏹️
        </button>
        <h3 className="drill-title drill-title-compact">📈 Drill Complet Motek graphique</h3>
        <button className="drill-button drill-button-pause" onClick={handlePause}>
          {isPaused ? '▶️' : '⏸️'}
        </button>
      </div>

      <div className="full-combo-vertical-container">
        <div className="full-combo-vertical-sidebar full-combo-vertical-left">
          <DDRStatsBar
            totalTime={totalTime}
            zoneStatus={zoneStatus}
            accuracy={accuracy}
            score={score}
            vertical={true}
          />
        </div>

        <div className="full-combo-vertical-gameplay">
          <MotekGraphicGameplay
            brakeValue={brakeValue}
            wheelValue={wheelValue}
            acceleratorValue={acceleratorValue}
            shiftUp={shiftUp}
            shiftDown={shiftDown}
            tolerance={tolerance}
            isActive={isActive && !isPaused}
            drillSong={drillSong}
            duration={drillSong?.duration ?? null}
            difficulty={drillSong?.difficulty ?? 'medium'}
            audioEnabled={audioEnabled}
            onJudgmentUpdate={handleJudgmentUpdate}
            onComplete={handleStop}
          />
        </div>

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
