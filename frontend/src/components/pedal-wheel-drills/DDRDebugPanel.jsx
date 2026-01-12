/**
 * Panneau de debug pour visualiser l'état du drill en temps réel
 * Utile pour diagnostiquer les problèmes de cibles qui ne défilent pas
 */

import './DDRDebugPanel.css';

export function DDRDebugPanel({
  currentTime,
  accelTargets,
  brakeTargets,
  acceleratorValue,
  brakeValue,
  isActive,
  drillSong,
  duration
}) {
  // Calculer les cibles visibles (dans les prochaines 5 secondes)
  const upcomingAccelTargets = accelTargets.filter(t => 
    t.time >= currentTime && t.time <= currentTime + 5
  );
  
  const upcomingBrakeTargets = brakeTargets.filter(t => 
    t.time >= currentTime && t.time <= currentTime + 5
  );
  
  // Calculer la durée totale (comme dans le hook)
  const totalDuration = drillSong ? drillSong.duration : duration;
  
  // Trouver la dernière cible
  const lastAccelTime = accelTargets.length > 0 ? accelTargets[accelTargets.length - 1].time : 0;
  const lastBrakeTime = brakeTargets.length > 0 ? brakeTargets[brakeTargets.length - 1].time : 0;
  const lastTargetTime = Math.max(lastAccelTime, lastBrakeTime);
  
  return (
    <div className="ddr-debug-panel">
      <div className="debug-section">
        <div className="debug-label">Time:</div>
        <div className="debug-value">{currentTime.toFixed(2)}s</div>
      </div>
      
      <div className="debug-section">
        <div className="debug-label">Active:</div>
        <div className="debug-value">{isActive ? '✅' : '❌'}</div>
      </div>
      
      <div className="debug-section">
        <div className="debug-label">Accel:</div>
        <div className="debug-value">{(acceleratorValue * 100).toFixed(0)}%</div>
      </div>
      
      <div className="debug-section">
        <div className="debug-label">Brake:</div>
        <div className="debug-value">{(brakeValue * 100).toFixed(0)}%</div>
      </div>
      
      <div className="debug-section">
        <div className="debug-label">Accel Targets Total:</div>
        <div className="debug-value">{accelTargets.length}</div>
      </div>
      
      <div className="debug-section">
        <div className="debug-label">Brake Targets Total:</div>
        <div className="debug-value">{brakeTargets.length}</div>
      </div>
      
      <div className="debug-section">
        <div className="debug-label">Next 5s Accel:</div>
        <div className="debug-value">{upcomingAccelTargets.length}</div>
      </div>
      
      <div className="debug-section">
        <div className="debug-label">Next 5s Brake:</div>
        <div className="debug-value">{upcomingBrakeTargets.length}</div>
      </div>
      
      <div className="debug-section" style={{borderTop: '2px solid #FFD700', marginTop: '8px', paddingTop: '8px'}}>
        <div className="debug-label">Total Duration:</div>
        <div className="debug-value">{totalDuration ? `${totalDuration}s` : 'N/A'}</div>
      </div>
      
      <div className="debug-section">
        <div className="debug-label">Last Target At:</div>
        <div className="debug-value">{lastTargetTime.toFixed(1)}s</div>
      </div>
      
      <div className="debug-section">
        <div className="debug-label">Will End At:</div>
        <div className="debug-value" style={{color: currentTime >= (totalDuration || 999) ? '#FF0000' : '#00FF00'}}>
          {currentTime >= (totalDuration || 999) ? '🔴 NOW!' : `${(totalDuration || 0).toFixed(1)}s`}
        </div>
      </div>
      
      {upcomingAccelTargets.length > 0 && (
        <div className="debug-section debug-section-targets">
          <div className="debug-label">Next Accel:</div>
          <div className="debug-targets">
            {upcomingAccelTargets.slice(0, 3).map(t => (
              <div key={t.id} className="debug-target">
                t={t.time.toFixed(1)}s {t.percent}%
              </div>
            ))}
          </div>
        </div>
      )}
      
      {upcomingBrakeTargets.length > 0 && (
        <div className="debug-section debug-section-targets">
          <div className="debug-label">Next Brake:</div>
          <div className="debug-targets">
            {upcomingBrakeTargets.slice(0, 3).map(t => (
              <div key={t.id} className="debug-target">
                t={t.time.toFixed(1)}s {t.percent}%
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
