/**
 * MotekGraphicGameplay
 *
 * Visualisation en LIGNES au lieu de boîtes — plus facile à comprendre.
 * X = temps, Y = valeur (% ou angle).
 * Ligne cible (gris) + ligne input actuel (colorée).
 * Feedback rythme : déviation en ms (trop tôt / parfait / trop tard).
 */

import { useState, useEffect, useRef } from 'react';
import { useDDRFullTargets } from '../../hooks/useDDRFullTargets';
import enhancedDrillAudioService from '../../services/enhancedDrillAudioService';
import { drillDebug } from '../../utils/drillDebug';
import './MotekGraphicGameplay.css';

const WINDOW_SEC = 8;
const WHEEL_RANGE = 175;

function targetsToPolyline(targets, type, minT, rangeT) {
  if (!targets?.length || rangeT <= 0) return '';
  const toX = (t) => ((t - minT) / rangeT) * 100;
  const toYBrake = (v) => 100 - (v / 100) * 100;
  const toYWheel = (v) => 50 - (v / WHEEL_RANGE) * 50;
  const toYAccel = (v) => 100 - (v / 100) * 100;
  const toY = type === 'wheel' ? toYWheel : type === 'brake' ? toYBrake : toYAccel;

  const pts = [];
  let prevX = toX(0);
  let prevY = type === 'accel' ? toY(100) : toY(type === 'wheel' ? 0 : 0);
  pts.push(`${Math.max(0, prevX)},${prevY}`);

  targets.forEach((t) => {
    const val = type === 'wheel' ? (t.angle ?? 0) : (t.percent ?? 0);
    const y = toY(val);
    const xStart = toX(t.time);
    const xEnd = toX(t.time + (t.duration ?? 1));
    if (xStart > 0) pts.push(`${xStart},${prevY}`);
    pts.push(`${xStart},${y}`);
    pts.push(`${xEnd},${y}`);
    prevX = xEnd;
    prevY = y;
  });
  pts.push(`${Math.min(100, prevX)},${prevY}`);
  return pts.join(' ');
}

export function MotekGraphicGameplay({
  brakeValue,
  wheelValue,
  acceleratorValue,
  shiftUp,
  shiftDown,
  tolerance,
  isActive,
  drillSong,
  duration,
  difficulty,
  audioEnabled,
  onJudgmentUpdate,
  onComplete
}) {
  const [judgmentCounts, setJudgmentCounts] = useState({ PERFECT: 0, GREAT: 0, GOOD: 0, OK: 0, MISS: 0 });
  const [rhythmFeedback, setRhythmFeedback] = useState(null);
  const rhythmFeedbackTimeout = useRef(null);

  const {
    brakeTargets,
    wheelTargets,
    accelTargets,
    shiftTargets,
    currentTime,
    isComplete,
    markTargetHit,
    markTargetMiss
  } = useDDRFullTargets({
    isActive,
    drillSong,
    duration,
    difficulty,
    onComplete
  });

  const effectiveBrake = drillDebug.isActive() ? (drillDebug.getValue(currentTime, 'brake') ?? brakeValue) : brakeValue;
  const effectiveWheel = drillDebug.isActive() ? (drillDebug.getValue(currentTime, 'wheel') ?? wheelValue) : wheelValue;
  const effectiveAccel = drillDebug.isActive() ? (drillDebug.getValue(currentTime, 'accelerator') ?? acceleratorValue) : acceleratorValue;
  const effectiveShiftUp = drillDebug.isActive() ? (drillDebug.getValue(currentTime, 'shiftUp') ?? shiftUp) : shiftUp;
  const effectiveShiftDown = drillDebug.isActive() ? (drillDebug.getValue(currentTime, 'shiftDown') ?? shiftDown) : shiftDown;
  const wheelDeg = (effectiveWheel ?? 0) * WHEEL_RANGE;

  const totalDuration = drillSong?.duration || duration || 90;
  const minT = Math.max(0, currentTime - 0.5);
  const maxT = Math.min(totalDuration, currentTime + WINDOW_SEC);
  const rangeT = maxT - minT || 1;

  const checkJudgment = (targetValue, currentVal, tol) => {
    const diff = Math.abs(targetValue - currentVal);
    if (diff <= tol * 0.3) return 'PERFECT';
    if (diff <= tol * 0.6) return 'GREAT';
    if (diff <= tol) return 'GOOD';
    if (diff <= tol * 1.5) return 'OK';
    return 'MISS';
  };
  const wheelTol = 5;

  useEffect(() => {
    if (!isActive) return;
    brakeTargets.filter((t) => !t.hit && !t.missed).forEach((target) => {
      const dt = target.time - currentTime;
      if (dt >= -0.05 && dt <= 0.15) {
        const judgment = checkJudgment(target.percent, (effectiveBrake ?? 0) * 100, tolerance);
        const deviationMs = Math.round(dt * 1000);
        markTargetHit(target.id, 'brake', judgment, 0);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound(judgment);
        onJudgmentUpdate(judgment);
        setJudgmentCounts((p) => ({ ...p, [judgment]: (p[judgment] || 0) + 1 }));
        setRhythmFeedback({ text: deviationMs === 0 ? 'Parfait!' : deviationMs > 0 ? `Trop tôt ${deviationMs}ms` : `Trop tard ${-deviationMs}ms`, ok: Math.abs(deviationMs) < 50 });
        if (rhythmFeedbackTimeout.current) clearTimeout(rhythmFeedbackTimeout.current);
        rhythmFeedbackTimeout.current = setTimeout(() => setRhythmFeedback(null), 600);
      } else if (dt < -0.2) markTargetMiss(target.id, 'brake');
    });
    wheelTargets.filter((t) => !t.hit && !t.missed).forEach((target) => {
      const dt = target.time - currentTime;
      if (dt >= -0.05 && dt <= 0.15) {
        const judgment = checkJudgment(target.angle, wheelDeg, wheelTol);
        const deviationMs = Math.round(dt * 1000);
        markTargetHit(target.id, 'wheel', judgment, 0);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound(judgment);
        onJudgmentUpdate(judgment);
        setJudgmentCounts((p) => ({ ...p, [judgment]: (p[judgment] || 0) + 1 }));
        setRhythmFeedback({ text: deviationMs === 0 ? 'Parfait!' : deviationMs > 0 ? `Trop tôt ${deviationMs}ms` : `Trop tard ${-deviationMs}ms`, ok: Math.abs(deviationMs) < 50 });
        if (rhythmFeedbackTimeout.current) clearTimeout(rhythmFeedbackTimeout.current);
        rhythmFeedbackTimeout.current = setTimeout(() => setRhythmFeedback(null), 600);
      } else if (dt < -0.2) markTargetMiss(target.id, 'wheel');
    });
    accelTargets.filter((t) => !t.hit && !t.missed).forEach((target) => {
      const dt = target.time - currentTime;
      if (dt >= -0.05 && dt <= 0.15) {
        const judgment = checkJudgment(target.percent, (effectiveAccel ?? 0) * 100, tolerance);
        const deviationMs = Math.round(dt * 1000);
        markTargetHit(target.id, 'accel', judgment, 0);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound(judgment);
        onJudgmentUpdate(judgment);
        setJudgmentCounts((p) => ({ ...p, [judgment]: (p[judgment] || 0) + 1 }));
        setRhythmFeedback({ text: deviationMs === 0 ? 'Parfait!' : deviationMs > 0 ? `Trop tôt ${deviationMs}ms` : `Trop tard ${-deviationMs}ms`, ok: Math.abs(deviationMs) < 50 });
        if (rhythmFeedbackTimeout.current) clearTimeout(rhythmFeedbackTimeout.current);
        rhythmFeedbackTimeout.current = setTimeout(() => setRhythmFeedback(null), 600);
      } else if (dt < -0.2) markTargetMiss(target.id, 'accel');
    });
    shiftTargets.filter((t) => !t.hit && !t.missed).forEach((target) => {
      const dt = target.time - currentTime;
      const correctButton = (target.type === 'shift_up' && effectiveShiftUp) || (target.type === 'shift_down' && effectiveShiftDown);
      if (dt >= -0.05 && dt <= 0.15 && correctButton) {
        const timeDiff = Math.abs(dt);
        const judgment = timeDiff <= 0.05 ? 'PERFECT' : timeDiff <= 0.1 ? 'GREAT' : timeDiff <= 0.15 ? 'GOOD' : 'OK';
        const deviationMs = Math.round(dt * 1000);
        markTargetHit(target.id, 'shift', judgment, 0);
        if (audioEnabled) enhancedDrillAudioService.playJudgmentSound(judgment);
        onJudgmentUpdate(judgment);
        setJudgmentCounts((p) => ({ ...p, [judgment]: (p[judgment] || 0) + 1 }));
        setRhythmFeedback({ text: deviationMs === 0 ? 'Parfait!' : deviationMs > 0 ? `Trop tôt ${deviationMs}ms` : `Trop tard ${-deviationMs}ms`, ok: Math.abs(deviationMs) < 50 });
        if (rhythmFeedbackTimeout.current) clearTimeout(rhythmFeedbackTimeout.current);
        rhythmFeedbackTimeout.current = setTimeout(() => setRhythmFeedback(null), 600);
      } else if (dt < -0.2) markTargetMiss(target.id, 'shift');
    });
    return () => { if (rhythmFeedbackTimeout.current) clearTimeout(rhythmFeedbackTimeout.current); };
  }, [isActive, currentTime, brakeTargets, wheelTargets, accelTargets, shiftTargets, effectiveBrake, effectiveWheel, effectiveAccel, effectiveShiftUp, effectiveShiftDown, tolerance, audioEnabled]);

  const x = (t) => ((t - minT) / rangeT) * 100;
  const brakeY = (v) => 100 - (v / 100) * 100;
  const wheelY = (v) => 50 - (v / WHEEL_RANGE) * 50;
  const accelY = (v) => 100 - (v / 100) * 100;

  return (
    <div className="motek-graphic-gameplay" data-testid="motek-graphic-active">
      <div className="motek-graphic-rhythm-feedback">
        {rhythmFeedback && (
          <span className={`motek-graphic-rhythm-text ${rhythmFeedback.ok ? 'ok' : 'off'}`}>
            {rhythmFeedback.text}
          </span>
        )}
        <span className="motek-graphic-time">{currentTime.toFixed(1)}s</span>
      </div>

      <div className="motek-graphic-charts">
        <div className="motek-graphic-chart">
          <div className="motek-graphic-chart-label">Frein %</div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="motek-graphic-svg">
            <polyline
              className="motek-graphic-target"
              fill="none"
              stroke="rgba(244,67,54,0.5)"
              strokeWidth="0.6"
              points={targetsToPolyline(brakeTargets, 'brake', minT, rangeT)}
            />
            <line x1={x(currentTime)} x2={x(currentTime)} y1="0" y2="100" className="motek-graphic-now" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <line x1={x(currentTime)} x2={x(currentTime) + 2} y1={brakeY((effectiveBrake ?? 0) * 100)} y2={brakeY((effectiveBrake ?? 0) * 100)} className="motek-graphic-input" stroke="#e53935" strokeWidth="0.6" />
          </svg>
        </div>
        <div className="motek-graphic-chart">
          <div className="motek-graphic-chart-label">Volant °</div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="motek-graphic-svg">
            <polyline
              className="motek-graphic-target"
              fill="none"
              stroke="rgba(33,150,243,0.5)"
              strokeWidth="0.6"
              points={targetsToPolyline(wheelTargets, 'wheel', minT, rangeT)}
            />
            <line x1={x(currentTime)} x2={x(currentTime)} y1="0" y2="100" className="motek-graphic-now" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <line x1={x(currentTime)} x2={x(currentTime) + 2} y1={wheelY(wheelDeg)} y2={wheelY(wheelDeg)} className="motek-graphic-input" stroke="#2196f3" strokeWidth="0.6" />
          </svg>
        </div>
        <div className="motek-graphic-chart">
          <div className="motek-graphic-chart-label">Accél %</div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="motek-graphic-svg">
            <polyline
              className="motek-graphic-target"
              fill="none"
              stroke="rgba(76,175,80,0.5)"
              strokeWidth="0.6"
              points={targetsToPolyline(accelTargets, 'accel', minT, rangeT)}
            />
            <line x1={x(currentTime)} x2={x(currentTime)} y1="0" y2="100" className="motek-graphic-now" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <line x1={x(currentTime)} x2={x(currentTime) + 2} y1={accelY((effectiveAccel ?? 0) * 100)} y2={accelY((effectiveAccel ?? 0) * 100)} className="motek-graphic-input" stroke="#4caf50" strokeWidth="0.6" />
          </svg>
        </div>
        <div className="motek-graphic-chart motek-graphic-chart-shift">
          <div className="motek-graphic-chart-label">Shifter ↑↓</div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="motek-graphic-svg">
            {shiftTargets.map((t) => {
              const tx = x(t.time);
              if (tx < -5 || tx > 105) return null;
              const isUp = t.type === 'shift_up';
              return (
                <line
                  key={t.id}
                  x1={tx}
                  y1={isUp ? 20 : 80}
                  x2={tx}
                  y2={isUp ? 35 : 65}
                  className={`motek-graphic-shift-marker ${t.hit ? 'hit' : ''} ${t.missed ? 'missed' : ''}`}
                  stroke={isUp ? '#ff9800' : '#ff5722'}
                  strokeWidth="1.2"
                />
              );
            })}
            <line x1={x(currentTime)} x2={x(currentTime)} y1="0" y2="100" className="motek-graphic-now" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
          </svg>
        </div>
      </div>

      <p className="motek-graphic-legend">
        Ligne grise = cible à suivre · Ligne colorée = ton input · Barre verticale = temps actuel · Tu vois le rythme?
      </p>
    </div>
  );
}
