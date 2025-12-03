/**
 * Composant DDRResultsScreen
 * 
 * Écran de résultats final style DDR avec note (A+, A, B, C, etc.)
 */

import './DDRResultsScreen.css';

export function DDRResultsScreen({ 
  stats, 
  judgmentCounts, 
  comboInfo,
  onRestart, 
  onBack 
}) {
  /**
   * Calculer la note finale style DDR
   */
  const calculateGrade = () => {
    const { accuracy } = stats;
    
    if (accuracy >= 99) return 'S';
    if (accuracy >= 95) return 'A+';
    if (accuracy >= 90) return 'A';
    if (accuracy >= 85) return 'A-';
    if (accuracy >= 80) return 'B+';
    if (accuracy >= 75) return 'B';
    if (accuracy >= 70) return 'B-';
    if (accuracy >= 65) return 'C+';
    if (accuracy >= 60) return 'C';
    if (accuracy >= 55) return 'C-';
    if (accuracy >= 50) return 'D';
    return 'F';
  };

  /**
   * Obtenir la couleur de la note
   */
  const getGradeColor = (grade) => {
    if (grade === 'S') return '#FFD700'; // Or
    if (grade.startsWith('A')) return '#00FF00'; // Vert
    if (grade.startsWith('B')) return '#00BFFF'; // Bleu
    if (grade.startsWith('C')) return '#FFA500'; // Orange
    if (grade === 'D') return '#FF6347'; // Rouge-orange
    return '#FF0000'; // Rouge
  };

  /**
   * Obtenir le message de félicitations
   */
  const getCongratulationsMessage = (grade) => {
    if (grade === 'S') return 'PERFECT SCORE!';
    if (grade === 'A+' || grade === 'A') return 'EXCELLENT!';
    if (grade === 'A-' || grade === 'B+') return 'GREAT JOB!';
    if (grade === 'B' || grade === 'B-') return 'GOOD WORK!';
    if (grade.startsWith('C')) return 'KEEP PRACTICING!';
    if (grade === 'D') return 'TRY AGAIN!';
    return 'FAILED...';
  };

  const grade = calculateGrade();
  const gradeColor = getGradeColor(grade);
  const message = getCongratulationsMessage(grade);

  // Calculer les pourcentages de jugements
  const totalJudgments = Object.values(judgmentCounts).reduce((sum, count) => sum + count, 0);
  const getPercentage = (count) => totalJudgments > 0 ? ((count / totalJudgments) * 100).toFixed(1) : 0;

  return (
    <div className="ddr-results-screen">
      <div className="ddr-results-container">
        {/* Titre */}
        <h1 className="ddr-results-title">DRILL COMPLETE!</h1>
        
        {/* Message de félicitations */}
        <div className="ddr-results-message">{message}</div>
        
        {/* Note finale */}
        <div className="ddr-results-grade-container">
          <div className="ddr-results-grade-label">GRADE</div>
          <div 
            className="ddr-results-grade" 
            style={{ color: gradeColor, textShadow: `0 0 30px ${gradeColor}` }}
          >
            {grade}
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="ddr-results-stats-main">
          <div className="ddr-results-stat-main">
            <div className="ddr-results-stat-main-label">Score</div>
            <div className="ddr-results-stat-main-value">{stats.score.toLocaleString()}</div>
          </div>
          <div className="ddr-results-stat-main">
            <div className="ddr-results-stat-main-label">Précision</div>
            <div className="ddr-results-stat-main-value">{stats.accuracy}%</div>
          </div>
          <div className="ddr-results-stat-main">
            <div className="ddr-results-stat-main-label">Max Combo</div>
            <div className="ddr-results-stat-main-value">{comboInfo.max}x</div>
          </div>
        </div>

        {/* Détails des jugements */}
        <div className="ddr-results-judgments">
          <h3 className="ddr-results-section-title">Détails des Jugements</h3>
          <div className="ddr-results-judgment-list">
            <div className="ddr-results-judgment-item ddr-results-judgment-perfect">
              <span className="ddr-results-judgment-name">PERFECT</span>
              <span className="ddr-results-judgment-count">{judgmentCounts.PERFECT || 0}</span>
              <span className="ddr-results-judgment-percent">{getPercentage(judgmentCounts.PERFECT || 0)}%</span>
            </div>
            <div className="ddr-results-judgment-item ddr-results-judgment-great">
              <span className="ddr-results-judgment-name">GREAT</span>
              <span className="ddr-results-judgment-count">{judgmentCounts.GREAT || 0}</span>
              <span className="ddr-results-judgment-percent">{getPercentage(judgmentCounts.GREAT || 0)}%</span>
            </div>
            <div className="ddr-results-judgment-item ddr-results-judgment-good">
              <span className="ddr-results-judgment-name">GOOD</span>
              <span className="ddr-results-judgment-count">{judgmentCounts.GOOD || 0}</span>
              <span className="ddr-results-judgment-percent">{getPercentage(judgmentCounts.GOOD || 0)}%</span>
            </div>
            <div className="ddr-results-judgment-item ddr-results-judgment-ok">
              <span className="ddr-results-judgment-name">OK</span>
              <span className="ddr-results-judgment-count">{judgmentCounts.OK || 0}</span>
              <span className="ddr-results-judgment-percent">{getPercentage(judgmentCounts.OK || 0)}%</span>
            </div>
            <div className="ddr-results-judgment-item ddr-results-judgment-miss">
              <span className="ddr-results-judgment-name">MISS</span>
              <span className="ddr-results-judgment-count">{judgmentCounts.MISS || 0}</span>
              <span className="ddr-results-judgment-percent">{getPercentage(judgmentCounts.MISS || 0)}%</span>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="ddr-results-actions">
          <button className="ddr-results-btn ddr-results-btn-restart" onClick={onRestart}>
            🔄 Recommencer
          </button>
          <button className="ddr-results-btn ddr-results-btn-back" onClick={onBack}>
            ⬅️ Menu Principal
          </button>
        </div>
      </div>
    </div>
  );
}

