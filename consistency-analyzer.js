/**
 * Analyseur de Consistance pour Sim Racing Analyzer
 * Calcule le coefficient de variation et la régularité des pilotes
 */

class ConsistencyAnalyzer {
    constructor() {
        this.chartColors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
    }

    /**
     * Calcule le coefficient de variation pour un pilote
     * @param {Array} lapTimes - Tableau des temps de tour en millisecondes
     * @returns {Object} Statistiques de consistance
     */
    calculateConsistency(lapTimes) {
        if (!lapTimes || lapTimes.length === 0) {
            return {
                coefficient: 0,
                score: 0,
                mean: 0,
                stdDev: 0,
                min: 0,
                max: 0,
                range: 0,
                validLaps: 0
            };
        }

        // Filtrer les tours valides (exclure les temps de 0)
        const validLaps = lapTimes.filter(time => time > 0);
        
        if (validLaps.length === 0) {
            return {
                coefficient: 0,
                score: 0,
                mean: 0,
                stdDev: 0,
                min: 0,
                max: 0,
                range: 0,
                validLaps: 0
            };
        }

        // Calculs statistiques
        const mean = validLaps.reduce((sum, time) => sum + time, 0) / validLaps.length;
        const variance = validLaps.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / validLaps.length;
        const stdDev = Math.sqrt(variance);
        const coefficient = mean > 0 ? (stdDev / mean) * 100 : 0;
        
        const min = Math.min(...validLaps);
        const max = Math.max(...validLaps);
        const range = max - min;

        // Score de consistance (0-100, plus bas = plus consistant)
        // Plus le coefficient de variation est bas, plus le score est élevé
        const score = Math.max(0, 100 - (coefficient * 2));

        return {
            coefficient: Math.round(coefficient * 100) / 100,
            score: Math.round(score * 100) / 100,
            mean: Math.round(mean),
            stdDev: Math.round(stdDev),
            min: Math.round(min),
            max: Math.round(max),
            range: Math.round(range),
            validLaps: validLaps.length
        };
    }

    /**
     * Génère un graphique de distribution des temps
     * @param {Array} lapTimes - Tableau des temps de tour
     * @param {string} containerId - ID du conteneur pour le graphique
     * @param {string} pilotName - Nom du pilote
     */
    generateDistributionChart(lapTimes, containerId, pilotName = 'Pilote') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const stats = this.calculateConsistency(lapTimes);
        
        // Créer l'histogramme simple avec HTML/CSS
        const histogram = this.createHistogram(lapTimes, stats);
        
        container.innerHTML = `
            <div class="consistency-chart">
                <h4>📊 Distribution des Temps - ${pilotName}</h4>
                <div class="chart-stats">
                    <div class="stat-item">
                        <span class="stat-label">Score Consistance:</span>
                        <span class="stat-value ${this.getScoreClass(stats.score)}">${stats.score}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Coefficient Variation:</span>
                        <span class="stat-value">${stats.coefficient}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Écart-type:</span>
                        <span class="stat-value">${this.formatTime(stats.stdDev)}</span>
                    </div>
                </div>
                <div class="histogram-container">
                    ${histogram}
                </div>
            </div>
        `;
    }

    /**
     * Crée un histogramme simple des temps de tour
     * @param {Array} lapTimes - Tableau des temps de tour
     * @param {Object} stats - Statistiques calculées
     * @returns {string} HTML de l'histogramme
     */
    createHistogram(lapTimes, stats) {
        const validLaps = lapTimes.filter(time => time > 0);
        if (validLaps.length === 0) return '<p>Aucune donnée disponible</p>';

        // Créer des bins pour l'histogramme
        const bins = this.createBins(validLaps, 10);
        const maxCount = Math.max(...bins.map(bin => bin.count));

        return `
            <div class="histogram">
                ${bins.map(bin => `
                    <div class="histogram-bar" style="height: ${(bin.count / maxCount) * 100}%">
                        <div class="bar-fill"></div>
                        <div class="bar-label">${this.formatTime(bin.center)}</div>
                        <div class="bar-count">${bin.count}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Crée des bins pour l'histogramme
     * @param {Array} lapTimes - Temps de tour
     * @param {number} numBins - Nombre de bins
     * @returns {Array} Bins avec centre et count
     */
    createBins(lapTimes, numBins = 10) {
        const min = Math.min(...lapTimes);
        const max = Math.max(...lapTimes);
        const binWidth = (max - min) / numBins;
        
        const bins = Array(numBins).fill(0).map((_, i) => ({
            center: min + (i + 0.5) * binWidth,
            count: 0
        }));

        lapTimes.forEach(time => {
            const binIndex = Math.min(Math.floor((time - min) / binWidth), numBins - 1);
            bins[binIndex].count++;
        });

        return bins;
    }

    /**
     * Obtient la classe CSS pour le score de consistance
     * @param {number} score - Score de consistance (0-100)
     * @returns {string} Classe CSS
     */
    getScoreClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'average';
        return 'poor';
    }

    /**
     * Formate un temps en millisecondes en format mm:ss.fff
     * @param {number} timeMs - Temps en millisecondes
     * @returns {string} Temps formaté
     */
    formatTime(timeMs) {
        const totalSeconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((timeMs % 1000) / 10);
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }

    /**
     * Compare la consistance de plusieurs pilotes
     * @param {Array} pilots - Tableau des pilotes avec leurs temps
     * @returns {Array} Pilotes triés par consistance
     */
    comparePilotsConsistency(pilots) {
        return pilots.map(pilot => ({
            ...pilot,
            consistency: this.calculateConsistency(pilot.lapTimes || [])
        })).sort((a, b) => b.consistency.score - a.consistency.score);
    }

    /**
     * Génère un résumé de consistance pour la liste principale
     * @param {Object} stats - Statistiques de consistance
     * @returns {string} HTML du résumé
     */
    generateConsistencySummary(stats) {
        const scoreClass = this.getScoreClass(stats.score);
        const consistencyIcon = this.getConsistencyIcon(stats.score);
        
        return `
            <div class="consistency-summary">
                <span class="consistency-icon">${consistencyIcon}</span>
                <span class="consistency-score ${scoreClass}">${stats.score}%</span>
                <span class="consistency-coeff">CV: ${stats.coefficient}%</span>
            </div>
        `;
    }

    /**
     * Obtient l'icône de consistance selon le score
     * @param {number} score - Score de consistance
     * @returns {string} Icône
     */
    getConsistencyIcon(score) {
        if (score >= 80) return '🏆';
        if (score >= 60) return '⭐';
        if (score >= 40) return '📊';
        return '⚠️';
    }
}

// Initialiser l'analyseur de consistance
const consistencyAnalyzer = new ConsistencyAnalyzer();

// Exposer globalement
window.consistencyAnalyzer = consistencyAnalyzer;

