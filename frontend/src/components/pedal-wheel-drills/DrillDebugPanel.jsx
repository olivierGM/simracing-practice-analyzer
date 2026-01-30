/**
 * Panneau debug pour les drills : scénario d'inputs et log des jugements.
 * Visible uniquement avec ?drillDebug=1 dans l'URL.
 */

import { useState, useEffect, useCallback } from 'react';
import { drillDebug } from '../../utils/drillDebug';
import './DrillDebugPanel.css';

const EXAMPLE_SCENARIO = [
  { t: 2.5, brake: 0.2 },
  { t: 3.5, brake: 0.6 },
  { t: 4.0, brake: 0 }
];

export function DrillDebugPanel() {
  const [scenarioJson, setScenarioJson] = useState(JSON.stringify(EXAMPLE_SCENARIO, null, 2));
  const [log, setLog] = useState([]);
  const [error, setError] = useState(null);

  const refreshLog = useCallback(() => {
    setLog(drillDebug.getLog());
  }, []);

  useEffect(() => {
    if (!drillDebug.isActive()) return;
    const interval = setInterval(refreshLog, 500);
    return () => clearInterval(interval);
  }, [refreshLog]);

  const handleApply = () => {
    setError(null);
    try {
      const parsed = JSON.parse(scenarioJson);
      drillDebug.setScenario(parsed);
      setLog(drillDebug.getLog());
    } catch (e) {
      setError(e.message || 'JSON invalide');
    }
  };

  const handleClearLog = () => {
    drillDebug.clearLog();
    setLog([]);
  };

  if (!drillDebug.isActive()) return null;

  return (
    <div className="drill-debug-panel">
      <div className="drill-debug-panel-header">
        <span className="drill-debug-panel-title">🔧 Debug Drills</span>
      </div>
      <div className="drill-debug-panel-body">
        <label className="drill-debug-label">Scénario (keyframes t, brake, accelerator, wheel)</label>
        <textarea
          className="drill-debug-textarea"
          value={scenarioJson}
          onChange={(e) => setScenarioJson(e.target.value)}
          rows={6}
          placeholder={JSON.stringify(EXAMPLE_SCENARIO, null, 2)}
        />
        {error && <div className="drill-debug-error">{error}</div>}
        <div className="drill-debug-actions">
          <button type="button" className="drill-debug-btn" onClick={handleApply}>
            Appliquer
          </button>
          <button type="button" className="drill-debug-btn drill-debug-btn-secondary" onClick={handleClearLog}>
            Vider le log
          </button>
        </div>
        <label className="drill-debug-label">Log des jugements</label>
        <div className="drill-debug-log">
          {log.length === 0 ? (
            <div className="drill-debug-log-empty">Démarre un drill pour voir les jugements ici.</div>
          ) : (
            log.map((entry, i) => (
              <div key={i} className={`drill-debug-log-entry drill-debug-log-${(entry.judgment || '').toLowerCase()}`}>
                <span className="drill-debug-log-time">{entry.time != null ? entry.time.toFixed(2) : '—'}s</span>
                <span className="drill-debug-log-lane">{entry.lane}</span>
                <span className="drill-debug-log-judgment">{entry.judgment}</span>
                {entry.targetPercent != null && <span>{entry.targetPercent}%</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
