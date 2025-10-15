/**
 * Admin Dashboard Integration
 * Composant pour le dashboard EGT Auto Scraper
 */

class AdminDashboard {
    constructor() {
        this.dashboard = null;
        this.isInitialized = false;
        this.performanceChartCanvas = null;
        this.chartInstance = null;
        this.init();
    }

    /**
     * Initialise le composant admin dashboard
     */
    init() {
        try {
            this.dashboard = document.getElementById('egtDashboard');
            this.performanceChartCanvas = document.getElementById('performanceChart');
            
            if (!this.dashboard) {
                console.warn('⚠️ Dashboard EGT non trouvé dans le DOM');
                return;
            }

            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ Admin Dashboard initialisé');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du Admin Dashboard:', error);
        }
    }

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
        // Bouton de scraping manuel
        const triggerBtn = document.getElementById('triggerManualScraping');
        if (triggerBtn) {
            triggerBtn.addEventListener('click', () => this.triggerManualScraping());
        }

        // Bouton de rafraîchissement des logs
        const refreshBtn = document.getElementById('refreshLogs');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadScrapingLogs());
        }
    }

    /**
     * Lance le scraping manuel via Firebase Functions
     */
    async triggerManualScraping() {
        if (!this.checkAdminAccess()) return;
        
        try {
            const triggerBtn = document.getElementById('triggerManualScraping');
            if (triggerBtn) {
                triggerBtn.disabled = true;
                triggerBtn.textContent = '🔄 Lancement...';
            }
            
            console.log('🚀 Lancement du scraping manuel...');
            
            // Appeler la fonction Firebase
            const response = await fetch('https://us-central1-simracing-practice-analyzer.cloudfunctions.net/scrapeEGTManual', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer test',
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Scraping manuel réussi:', result);
                this.updateLastRunStatus(result.result);
                // Actualiser les logs après un délai
                setTimeout(() => {
                    this.loadScrapingLogs();
                }, 2000);
            } else {
                console.error('❌ Erreur lors du scraping:', result.error);
                this.updateLastRunStatus(null, result.error);
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'appel de la fonction:', error);
            this.updateLastRunStatus(null, error.message);
        } finally {
            const triggerBtn = document.getElementById('triggerManualScraping');
            if (triggerBtn) {
                triggerBtn.disabled = false;
                triggerBtn.textContent = '🚀 Lancer Scraping Manuel';
            }
        }
    }

    /**
     * Charge les logs de scraping
     */
    async loadScrapingLogs() {
        try {
            console.log('📋 Chargement des logs de scraping...');
            
            const response = await fetch('https://us-central1-simracing-practice-analyzer.cloudfunctions.net/getScrapingLogs?limit=10');
            const result = await response.json();
            
            if (result.success) {
                this.displayScrapingLogs(result.logs);
                this.updateGlobalStats(result.logs);
                this.renderPerformanceChart(result.logs);
            } else {
                console.error('❌ Erreur lors du chargement des logs:', result.error);
                this.displayScrapingLogs([]);
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'appel des logs:', error);
            this.displayScrapingLogs([]);
        }
    }

    /**
     * Affiche les logs de scraping
     * @param {Array} logs - Liste des logs
     */
    displayScrapingLogs(logs) {
        const logsContainer = document.getElementById('logsContainer');
        if (!logsContainer) return;
        
        if (!logs || logs.length === 0) {
            logsContainer.innerHTML = '<p>Aucun log disponible</p>';
            return;
        }
        
        const logsHtml = logs.map(log => {
            const status = log.status === 'completed' ? 'success' : 
                         log.status === 'failed' ? 'error' : 'warning';
            const statusIcon = log.status === 'completed' ? '✅' : 
                              log.status === 'failed' ? '❌' : '⚠️';
            
            const time = log.timestamp ? this.formatFirestoreTimestamp(log.timestamp).toLocaleString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }) : 'N/A';
            
            const summary = log.scraping ? 
                `${log.scraping.totalSessionsFound || 0} trouvées, ${log.scraping.newSessionsFound || 0} nouvelles` :
                'Pas de données';
            
            return `
                <div class="log-entry ${status}">
                    <div class="log-status">${statusIcon}</div>
                    <div class="log-details">
                        <strong>${log.trigger || 'Scheduled'}</strong> - ${summary}
                        ${log.errors && log.errors.length > 0 ? `<br><small>Erreur: ${log.errors[0]}</small>` : ''}
                    </div>
                    <div class="log-time">${time}</div>
                </div>
            `;
        }).join('');
        
        logsContainer.innerHTML = logsHtml;
    }

    /**
     * Met à jour le statut du dernier run
     * @param {Object} result - Résultat du run
     * @param {string} error - Message d'erreur éventuel
     */
    updateLastRunStatus(result, error = null) {
        const lastRunContent = document.getElementById('lastRunContent');
        if (!lastRunContent) return;
        
        if (error) {
            lastRunContent.innerHTML = `
                <div class="status-content error">
                    <strong>❌ Échec</strong><br>
                    Erreur: ${error}
                </div>
            `;
            return;
        }
        
        if (result) {
            const summary = result.summary;
            lastRunContent.innerHTML = `
                <div class="status-content success">
                    <strong>✅ Succès</strong><br>
                    ${summary.scraped} sessions trouvées<br>
                    ${summary.new} nouvelles sessions<br>
                    ${summary.downloaded} téléchargées<br>
                    Temps: ${(result.executionTime / 1000).toFixed(1)}s
                </div>
            `;
        }
    }

    /**
     * Met à jour les statistiques globales
     * @param {Array} logs - Liste des logs
     */
    updateGlobalStats(logs) {
        if (!logs || logs.length === 0) return;
        
        // Calculer les statistiques
        const totalSessions = logs.reduce((sum, log) => sum + (log.downloads?.successful || 0), 0);
        const successfulRuns = logs.filter(log => log.status === 'completed').length;
        const totalRuns = logs.length;
        const successRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : 0;
        
        // Dernier run
        const lastRun = logs[0];
        const lastRunTime = lastRun?.timestamp ? 
            this.formatFirestoreTimestamp(lastRun.timestamp).toLocaleDateString('fr-FR') : 'N/A';
        
        // Prochain run (estimation - toutes les heures)
        const nextRunTime = new Date(Date.now() + 60 * 60 * 1000).toLocaleDateString('fr-FR');
        
        // Mettre à jour l'affichage
        const totalSessionsEl = document.getElementById('totalSessions');
        const successRateEl = document.getElementById('successRate');
        const lastRunTimeEl = document.getElementById('lastRunTime');
        const nextRunTimeEl = document.getElementById('nextRunTime');
        
        if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
        if (successRateEl) successRateEl.textContent = `${successRate}%`;
        if (lastRunTimeEl) lastRunTimeEl.textContent = lastRunTime;
        if (nextRunTimeEl) nextRunTimeEl.textContent = nextRunTime;
    }

    /**
     * Vérifie l'accès admin
     * @returns {boolean} True si admin
     */
    checkAdminAccess() {
        if (typeof window !== 'undefined' && window.isAdmin) {
            return true;
        }
        
        alert('Seuls les administrateurs peuvent utiliser cette fonctionnalité. Connectez-vous d\'abord.');
        return false;
    }

    /**
     * Affiche le dashboard
     */
    show() {
        if (this.dashboard) {
            this.dashboard.style.display = 'block';
        }
    }

    /**
     * Masque le dashboard
     */
    hide() {
        if (this.dashboard) {
            this.dashboard.style.display = 'none';
        }
    }

    /**
     * Formate un timestamp Firestore en Date JavaScript
     * @param {Object} timestamp - Timestamp Firestore
     * @returns {Date} Date JavaScript
     */
    formatFirestoreTimestamp(timestamp) {
        try {
            // Si c'est un objet Firestore Timestamp avec méthode toDate
            if (timestamp && typeof timestamp.toDate === 'function') {
                return timestamp.toDate();
            }
            
            // Si c'est un objet Firestore Timestamp avec _seconds et _nanoseconds
            if (timestamp && typeof timestamp === 'object' && timestamp._seconds && timestamp._nanoseconds !== undefined) {
                // Convertir les secondes et nanosecondes en millisecondes
                const milliseconds = timestamp._seconds * 1000 + Math.floor(timestamp._nanoseconds / 1000000);
                return new Date(milliseconds);
            }
            
            // Si c'est déjà une Date
            if (timestamp instanceof Date) {
                return timestamp;
            }
            
            // Si c'est un string ou un nombre
            if (timestamp) {
                const date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
            
            // Fallback à la date actuelle
            return new Date();
        } catch (error) {
            console.warn('Erreur lors du formatage du timestamp:', error);
            return new Date();
        }
    }

    /**
     * Rend le graphique de performance avec Chart.js
     * @param {Array} logs - Logs des exécutions
     */
    renderPerformanceChart(logs) {
        if (!this.performanceChartCanvas) {
            console.warn('Canvas du graphique de performance non trouvé');
            return;
        }

        const ctx = this.performanceChartCanvas.getContext('2d');
        
        // Détruire l'instance précédente si elle existe
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Filtrer les logs des 7 derniers jours
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentLogs = logs.filter(log => {
            const logDate = this.formatFirestoreTimestamp(log.timestamp);
            return logDate >= sevenDaysAgo;
        }).reverse(); // Plus ancien en premier

        // Si pas de logs récents, afficher un message
        if (recentLogs.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Aucune donnée récente', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        // Préparer les données
        const labels = recentLogs.map(log => {
            const date = this.formatFirestoreTimestamp(log.timestamp);
            return date.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit' 
            });
        });

        const successfulDownloads = recentLogs.map(log => log.downloads?.successful || 0);
        const failedDownloads = recentLogs.map(log => log.downloads?.failed || 0);
        const totalDownloads = recentLogs.map(log => log.downloads?.total || 0);

        // Créer le graphique
        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Téléchargements Réussis',
                        data: successfulDownloads,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#22c55e',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    },
                    {
                        label: 'Téléchargements Échoués',
                        data: failedDownloads,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    },
                    {
                        label: 'Total Tentatives',
                        data: totalDownloads,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#666',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Nombre de Sessions',
                            color: '#666',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return `📅 ${context[0].label}`;
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                let icon = '';
                                if (context.dataset.label.includes('Réussis')) {
                                    icon = '✅';
                                } else if (context.dataset.label.includes('Échoués')) {
                                    icon = '❌';
                                } else if (context.dataset.label.includes('Total')) {
                                    icon = '📊';
                                }
                                return `${icon} ${context.dataset.label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });

        console.log('📈 Graphique de performance rendu avec succès');
    }

    /**
     * Initialise le dashboard (charge les données)
     */
    initialize() {
        if (this.isInitialized) {
            this.loadScrapingLogs();
        }
    }
}

// Instance globale du dashboard admin
let adminDashboard = null;

/**
 * Initialise le dashboard admin
 */
function initializeAdminDashboard() {
    if (!adminDashboard) {
        adminDashboard = new AdminDashboard();
    }
    return adminDashboard;
}

/**
 * Obtient l'instance du dashboard admin
 */
function getAdminDashboard() {
    return adminDashboard || initializeAdminDashboard();
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminDashboard, initializeAdminDashboard, getAdminDashboard };
}
