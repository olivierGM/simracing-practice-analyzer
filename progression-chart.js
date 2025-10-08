/**
 * Classe pour gérer les graphiques de progression des pilotes
 * Utilise Chart.js pour afficher l'évolution des temps de tour
 */
class ProgressionChart {
    constructor() {
        this.chart = null;
        this.canvas = null;
        this.ctx = null;
        this.data = [];
        this.filteredData = [];
        this.featureEnabled = true;
        
        this.defaultConfig = {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution des Temps de Tour',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const timeInMs = context.parsed.y;
                                const formattedTime = this.formatTime(timeInMs);
                                return `${context.dataset.label}: ${formattedTime}`;
                            }.bind(this)
                        }
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Sessions'
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Temps'
                        },
                        reverse: true,
                        ticks: {
                            callback: function(value) {
                                const formatted = this.formatTime(value);
                                console.log(`Y-axis tick callback: ${value} -> ${formatted}`);
                                return formatted;
                            }.bind(this),
                            stepSize: 5000,
                            maxTicksLimit: 8
                        },
                        // Utiliser la nouvelle API de Chart.js 4.x
                        afterBuildTicks: function(axis) {
                            axis.ticks.forEach(tick => {
                                tick.label = this.formatTime(tick.value);
                            });
                        }.bind(this),
                        type: 'linear',
                        beginAtZero: false
                    }
                }
            }
        };
    }

    async init(lapData, firstName, lastName, cupCategory) {
        try {
            await this.waitForChartJs();
            
            console.log('📊 Initialisation du graphique de progression...');
            
            this.canvas = document.getElementById('progressionChart');
            if (!this.canvas) {
                console.error('❌ Canvas progressionChart non trouvé');
                return;
            }
            
            this.ctx = this.canvas.getContext('2d');
            
            this.data = lapData || [];
            this.filteredData = this.prepareData(this.data);
            
            if (this.filteredData.length === 0) {
                this.showFallbackMessage('Aucune donnée de tour disponible');
                return;
            }
            
            const chartData = this.generateChartData();
            const finalConfig = this.mergeConfig(this.defaultConfig, {
                data: chartData
            });
            
            this.chart = new Chart(this.ctx, finalConfig);
            
            console.log('✅ Graphique de progression initialisé avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du graphique:', error);
            this.showFallbackMessage('Erreur lors du chargement du graphique');
        }
    }

    async waitForChartJs() {
        const maxAttempts = 10;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (typeof Chart !== 'undefined') {
                console.log('✅ Chart.js chargé');
                return;
            }
            
            console.log(`⏳ Attente de Chart.js... (tentative ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        throw new Error('Chart.js non disponible après 10 tentatives');
    }

    showFallbackMessage(message) {
        if (this.canvas) {
            this.canvas.style.display = 'none';
            
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'chart-fallback';
            fallbackDiv.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #666; background: #f5f5f5; border-radius: 8px;">
                    <p>📈 ${message}</p>
                </div>
            `;
            
            this.canvas.parentNode.insertBefore(fallbackDiv, this.canvas);
        }
    }

    prepareData(lapData) {
        if (!lapData || lapData.length === 0) {
            return [];
        }

        const sessionsPerGroup = 10;
        const groupedSessions = new Map();
        
        lapData.forEach((lap, index) => {
            let sessionDate = lap.sessionDate;
            if (!sessionDate || isNaN(new Date(sessionDate).getTime())) {
                const baseDate = new Date();
                baseDate.setDate(baseDate.getDate() - (lapData.length - index));
                sessionDate = baseDate.toISOString();
            }
            
            const groupIndex = Math.floor(index / sessionsPerGroup);
            const groupKey = `Session ${groupIndex + 1}`;
            const lapTime = lap.laptime || lap.time || 0;
            
            if (!groupedSessions.has(groupKey)) {
                groupedSessions.set(groupKey, {
                    sessionLabel: `Session ${groupIndex + 1}`,
                    sessionDate: sessionDate,
                    lapTimes: [],
                    isValid: lap.isValid || false,
                    isWet: lap.isWetSession || lap.sessionWet || false,
                    trackName: lap.trackName || 'Track',
                    groupIndex: groupIndex
                });
            }
            
            if (lapTime > 0) {
                groupedSessions.get(groupKey).lapTimes.push(lapTime);
            }
        });
        
        const sessions = Array.from(groupedSessions.values())
            .sort((a, b) => a.groupIndex - b.groupIndex)
            .map(session => {
            const lapTimes = session.lapTimes;
            if (lapTimes.length === 0) return null;

            const bestTime = Math.min(...lapTimes);
            const averageTime = lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;
            const medianTime = this.calculateMedian(lapTimes);

            return {
                ...session,
                bestTime,
                averageTime,
                medianTime,
                lapCount: lapTimes.length,
                lapTimes
            };
        }).filter(session => session !== null);

        return sessions.sort((a, b) => {
            const dateA = new Date(a.sessionDate || 0);
            const dateB = new Date(b.sessionDate || 0);
            return dateA - dateB;
        });
    }

    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        } else {
            return sorted[middle];
        }
    }

    calculateMovingAverage(data, windowSize = 3) {
        const movingAverages = [];
        
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const end = i + 1;
            const window = data.slice(start, end);
            const average = window.reduce((sum, value) => sum + value, 0) / window.length;
            movingAverages.push(average);
        }
        
        return movingAverages;
    }

    formatSessionDate(sessionDate) {
        if (!sessionDate) return 'Session';
        
        try {
            const date = new Date(sessionDate);
            if (isNaN(date.getTime())) {
                return 'Session';
            }
            
            return date.toLocaleDateString('fr-FR', {
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Session';
        }
    }

    formatTime(timeInMs) {
        if (!timeInMs || timeInMs === 0) return '00:00:000';
        
        const minutes = Math.floor(timeInMs / 60000);
        const seconds = Math.floor((timeInMs % 60000) / 1000);
        const milliseconds = timeInMs % 1000;
        
        const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
        
        // Debug: afficher le formatage
        console.log(`formatTime(${timeInMs}) = ${formatted}`);
        
        return formatted;
    }

    generateChartData() {
        if (this.filteredData.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = this.filteredData.map(item => this.formatSessionDate(item.sessionDate));
        const bestTimes = this.filteredData.map(item => item.bestTime);
        const averageTimes = this.filteredData.map(item => item.averageTime);
        
        const windowSize = Math.min(this.filteredData.length, 5);
        const movingAverages = this.calculateMovingAverage(bestTimes, windowSize);

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Meilleur temps',
                    data: bestTimes,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Temps moyen',
                    data: averageTimes,
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: `Moyenne mobile (${windowSize} sessions)`,
                    data: movingAverages,
                    borderColor: '#ffd93d',
                    backgroundColor: 'rgba(255, 217, 61, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    borderDash: [5, 5]
                }
            ]
        };
    }

    mergeConfig(defaultConfig, customConfig) {
        const merged = JSON.parse(JSON.stringify(defaultConfig));
        
        if (customConfig.data) {
            merged.data = customConfig.data;
        }
        
        if (customConfig.options) {
            merged.options = {
                ...merged.options,
                ...customConfig.options
            };
            
            if (customConfig.options.plugins) {
                merged.options.plugins = {
                    ...merged.options.plugins,
                    ...customConfig.options.plugins
                };
            }
        }
        
        return merged;
    }

    update(newData) {
        if (!this.chart) return;
        
        this.data = newData || [];
        this.filteredData = this.prepareData(this.data);
        
        const chartData = this.generateChartData();
        
        this.chart.data = chartData;
        this.chart.update('active');
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// Exporter la classe globalement
window.ProgressionChart = ProgressionChart;

console.log('📊 Classe ProgressionChart chargée');