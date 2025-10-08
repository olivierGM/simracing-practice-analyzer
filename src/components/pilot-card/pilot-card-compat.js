/**
 * PILOT CARD COMPONENT - Version compatible
 * Version compatible avec l'architecture actuelle (sans modules ES6)
 */

// Configuration du composant pilot-card
const PILOT_CARD_CONFIG = {
    // Informations des segments par piste
    trackSegmentInfo: {
        "valencia": {
            "sector1": "Tours 1-4 : Départ, T1, T2, T3, T4",
            "sector2": "Tours 5-8 : T5, T6, T7, T8",
            "sector3": "Tours 9-14 : T9, T10, T11, T12, T13, T14"
        },
        "nurburgring": {
            "sector1": "Tours 1-5 : Départ, T1 (Schumacher S), T2, T3, T4, T5",
            "sector2": "Tours 6-10 : T6, T7, T8, T9, T10",
            "sector3": "Tours 11-15 : T11, T12, T13, T14, T15"
        },
        "donington": {
            "sector1": "Tours 1-4 : Départ, Redgate, Hollywood, Craner Curves, T4",
            "sector2": "Tours 5-8 : T5, T6, T7, T8",
            "sector3": "Tours 9-12 : T9, T10, T11, T12"
        },
        "redbull_ring": {
            "sector1": "Tours 1-3 : Départ, T1, T2, T3",
            "sector2": "Tours 4-6 : T4, T5, T6",
            "sector3": "Tours 7-10 : T7, T8, T9, T10"
        },
        "red_bull_ring": { // Alias pour compatibilité
            "sector1": "Tours 1-3 : Départ, T1, T2, T3",
            "sector2": "Tours 4-6 : T4, T5, T6",
            "sector3": "Tours 7-10 : T7, T8, T9, T10"
        },
        "misano": {
            "sector1": "Tours 1-5 : Départ, T1, T2, T3, T4, T5",
            "sector2": "Tours 6-10 : T6, T7, T8, T9, T10",
            "sector3": "Tours 11-16 : T11, T12, T13, T14, T15, T16"
        },
        "snetterton": {
            "sector1": "Tours 1-4 : Départ, T1, T2, T3, T4",
            "sector2": "Tours 5-8 : T5, T6, T7, T8",
            "sector3": "Tours 9-13 : T9, T10, T11, T12, T13"
        },
        "monza": {
            "sector1": "Tours 1-3 : Départ, T1 (Rettifilo), T2, T3",
            "sector2": "Tours 4-7 : T4, T5, T6, T7",
            "sector3": "Tours 8-11 : T8, T9, T10, T11"
        },
        "zandvoort": {
            "sector1": "Tours 1-4 : Départ, T1, T2, T3, T4",
            "sector2": "Tours 5-9 : T5, T6, T7, T8, T9",
            "sector3": "Tours 10-14 : T10, T11, T12, T13, T14"
        }
    },

    // Messages et textes
    messages: {
        pilotNotFound: 'Pilote non trouvé',
        noDataAvailable: 'Aucune donnée disponible',
        calculatingStats: 'Calcul des statistiques...',
        loadingChart: 'Chargement du graphique...'
    }
};

// Instance globale du composant pilot-card
let pilotCardInstance = null;

/**
 * Classe PilotCard compatible
 */
class PilotCardCompat {
    constructor(config = PILOT_CARD_CONFIG) {
        this.config = config;
        this.modal = null;
        this.currentDriver = null;
        this.currentStats = null;
        this.isInitialized = false;
    }

    /**
     * Initialiser le composant
     */
    init() {
        if (this.isInitialized) {
            console.warn('PilotCard déjà initialisé');
            return;
        }

        this.modal = document.getElementById('pilotModal');
        if (!this.modal) {
            console.error('❌ Modal pilote non trouvée dans le DOM');
            return;
        }

        this.isInitialized = true;
        console.log('✅ PilotCard initialisé');
    }

    /**
     * Ouvrir la modal avec les détails du pilote
     */
    open(pilotId) {
        if (!this.isInitialized) {
            console.error('❌ PilotCard non initialisé');
            return;
        }

        // Empêcher le scroll du body sur mobile
        document.body.classList.add('modal-open');
        
        const [firstName, lastName, cupCategory] = pilotId.split('_');
        const filteredData = this.getFilteredData();
        const byDriver = filteredData.byDriver || {};
        const driverKey = `${firstName}_${lastName}_${cupCategory}`;
        const driver = byDriver[driverKey];
        
        if (!driver) {
            alert(this.config.messages.pilotNotFound);
            return;
        }
        
        this.currentDriver = driver;
        
        // Calculer les statistiques
        this.currentStats = this.calculatePilotStats(driver, firstName, lastName, cupCategory, byDriver);
        
        // Générer le contenu de la modal
        this.generatePilotContent(firstName, lastName, cupCategory, this.currentStats);
        
        // Afficher la modal
        this.modal.classList.add('show');
        
        console.log(`✅ Modal pilote ouverte pour ${firstName} ${lastName}`);
    }

    /**
     * Fermer la modal
     */
    close() {
        if (!this.isInitialized) return;
        
        document.body.classList.remove('modal-open');
        this.modal.classList.remove('show');
        
        // Nettoyer les références
        this.currentDriver = null;
        this.currentStats = null;
        
        console.log('✅ Modal pilote fermée');
    }

    /**
     * Générer le contenu principal de la modal
     */
    generatePilotContent(firstName, lastName, cupCategory, stats) {
        // Générer le HTML complet de la modal
        const modalContent = `
            <div class="pilot-card">
                <!-- Header du pilote -->
                <div class="pilot-header">
                    <div class="pilot-info">
                        <h2 class="pilot-name">${firstName} ${lastName}</h2>
                        <span class="pilot-category">Catégorie ${cupCategory}</span>
                    </div>
                    <button class="modal-close" onclick="closePilotModal()">×</button>
                </div>

                <!-- Statistiques principales -->
                <div class="pilot-stats-grid">
                    ${this.generateStatsCards(stats)}
                </div>

                <!-- Section graphique de progression -->
                <div class="progression-section">
                    <div class="progression-chart-container" id="progressionChartContainer">
                        <!-- Le graphique sera initialisé ici -->
                        <p>Graphique de progression (en cours de développement)</p>
                    </div>
                </div>

                <!-- Liste des tours -->
                <div class="laps-section">
                    <h3>📊 Détails des Tours</h3>
                    <div class="laps-list">
                        ${this.generateLapsList(stats)}
                    </div>
                </div>

                <!-- Comparateur de segments -->
                <div class="segment-comparator-section">
                    ${this.generateSegmentComparator(stats)}
                </div>
            </div>
        `;
        
        this.modal.innerHTML = modalContent;
        
        // Initialiser le graphique de progression
        this.initProgressionChart(firstName, lastName, cupCategory);
    }

    /**
     * Générer les cartes de statistiques
     */
    generateStatsCards(stats) {
        return `
            <div class="stat-card">
                <h3>🏆 Meilleur Tour</h3>
                <div class="stat-value">${this.formatTime(stats.bestValidTime)}</div>
            </div>
            <div class="stat-card">
                <h3>📊 Moyenne Valide</h3>
                <div class="stat-value">${this.formatTime(stats.averageValidTime)}</div>
            </div>
            <div class="stat-card">
                <h3>💧 Meilleur Wet</h3>
                <div class="stat-value">${this.formatTime(stats.bestWetTime)}</div>
            </div>
            <div class="stat-card">
                <h3>📈 Moyenne Wet</h3>
                <div class="stat-value">${this.formatTime(stats.averageWetTime)}</div>
            </div>
            <div class="stat-card">
                <h3>🎯 Tour Potentiel</h3>
                <div class="stat-value">${this.formatTime(stats.potentialBestTime)}</div>
            </div>
            <div class="stat-card">
                <h3>⚡ Écart au Leader</h3>
                <div class="stat-value">${stats.gapToLeader ? this.formatTime(stats.gapToLeader) : 'N/A'}</div>
            </div>
        `;
    }

    /**
     * Générer la liste des tours
     */
    generateLapsList(stats) {
        if (!stats.laps || stats.laps.length === 0) {
            return '<p class="no-data">Aucun tour disponible</p>';
        }

        const lapsHeader = `
            <div class="laps-header">
                <span>Tour</span>
                <span>Total</span>
                <span>S1</span>
                <span>S2</span>
                <span>S3</span>
                <span>Valide</span>
                <span>Wet</span>
            </div>
        `;

        const lapsItems = stats.laps.map(lap => this.generateLapItem(lap)).join('');
        
        return lapsHeader + lapsItems;
    }

    /**
     * Générer un élément de tour
     */
    generateLapItem(lap) {
        const isValidClass = lap.isValid ? 'valid' : 'invalid';
        const isWetClass = lap.isWet ? 'wet' : 'dry';
        
        return `
            <div class="lap-item ${isValidClass} ${isWetClass}">
                <span>${lap.lapNumber}</span>
                <span>${this.formatTime(lap.laptime)}</span>
                <span>${this.formatTime(lap.splits[0])}</span>
                <span>${this.formatTime(lap.splits[1])}</span>
                <span>${this.formatTime(lap.splits[2])}</span>
                <span>${lap.isValid ? '✓' : '✗'}</span>
                <span>${lap.isWet ? '💧' : '☀️'}</span>
            </div>
        `;
    }

    /**
     * Générer le comparateur de segments
     */
    generateSegmentComparator(stats) {
        const pilotSegmentStats = this.calculatePilotSegmentStats(this.currentDriver);
        const globalSegmentStats = this.getFilteredData().globalSegmentStats;
        const trackName = window.selectedSession || '';
        
        return this.createSegmentComparatorHTML(pilotSegmentStats, globalSegmentStats, stats.cupCategory, trackName);
    }

    /**
     * Créer le HTML du comparateur de segments
     */
    createSegmentComparatorHTML(pilotStats, globalStats, cupCategory, trackName) {
        if (!globalStats || !globalStats.global || !globalStats.byCategory) {
            return '<div class="segment-comparator">Comparateur de segments (données non disponibles)</div>';
        }

        const globalSegmentStats = globalStats.global;
        const classStats = globalStats.byCategory[cupCategory];

        if (!classStats) {
            return '<div class="segment-comparator">Comparateur de segments (données de classe non disponibles)</div>';
        }

        // Calculer les écarts
        const bestPilotVsBestGlobal = {
            s1: pilotStats.best.s1 - globalSegmentStats.bestS1,
            s2: pilotStats.best.s2 - globalSegmentStats.bestS2,
            s3: pilotStats.best.s3 - globalSegmentStats.bestS3
        };

        const bestPilotVsBestClass = {
            s1: pilotStats.best.s1 - classStats.bestS1,
            s2: pilotStats.best.s2 - classStats.bestS2,
            s3: pilotStats.best.s3 - classStats.bestS3
        };

        const avgPilotVsAvgGlobal = {
            s1: pilotStats.average.s1 - globalSegmentStats.avgS1,
            s2: pilotStats.average.s2 - globalSegmentStats.avgS2,
            s3: pilotStats.average.s3 - globalSegmentStats.avgS3
        };

        const avgPilotVsAvgClass = {
            s1: pilotStats.average.s1 - classStats.avgS1,
            s2: pilotStats.average.s2 - classStats.avgS2,
            s3: pilotStats.average.s3 - classStats.avgS3
        };

        // Trouver le segment le plus problématique
        const worstSegment = Object.keys(avgPilotVsAvgGlobal).reduce((a, b) => 
            avgPilotVsAvgGlobal[a] > avgPilotVsAvgGlobal[b] ? a : b
        );

        const infoButton = `<span class="info-icon" onclick="showSegmentInfo(event, '${trackName}')">ℹ️</span>`;

        return `
            <div class="segment-comparator">
                <div class="segment-header">
                    <div class="segment-title-row">
                        <h3>🏁 Comparateur de Segments${infoButton}</h3>
                    </div>
                    <div class="segment-focus-hint">
                        💡 Focus sur <strong>${worstSegment.toUpperCase()}</strong> pour +${this.formatSegmentTime(avgPilotVsAvgGlobal[worstSegment])}s de gain
                    </div>
                </div>
                <div class="segment-grid">
                    ${this.generateComparisonSection(
                        '📊 Meilleur Pilote vs Meilleur Global', 
                        pilotStats.best, 
                        { s1: globalSegmentStats.bestS1, s2: globalSegmentStats.bestS2, s3: globalSegmentStats.bestS3 },
                        bestPilotVsBestGlobal
                    )}
                    ${this.generateComparisonSection(
                        '🎯 Meilleur Pilote vs Meilleur Classe', 
                        pilotStats.best, 
                        { s1: classStats.bestS1, s2: classStats.bestS2, s3: classStats.bestS3 },
                        bestPilotVsBestClass
                    )}
                    ${this.generateComparisonSection(
                        '📈 Moyenne Pilote vs Moyenne Global', 
                        pilotStats.average, 
                        { s1: globalSegmentStats.avgS1, s2: globalSegmentStats.avgS2, s3: globalSegmentStats.avgS3 },
                        avgPilotVsAvgGlobal
                    )}
                    ${this.generateComparisonSection(
                        '📉 Moyenne Pilote vs Moyenne Classe', 
                        pilotStats.average, 
                        { s1: classStats.avgS1, s2: classStats.avgS2, s3: classStats.avgS3 },
                        avgPilotVsAvgClass
                    )}
                </div>
            </div>
        `;
    }

    /**
     * Générer une section de comparaison
     */
    generateComparisonSection(title, pilotTimes, referenceTimes, gaps) {
        return `
            <div class="segment-section">
                <h4>${title}</h4>
                <div class="segment-row">
                    <span class="segment-name">S1:</span>
                    <span class="segment-time">${this.formatSegmentTime(pilotTimes.s1)}s vs ${this.formatSegmentTime(referenceTimes.s1)}s</span>
                    <span class="segment-gap ${gaps.s1 <= 0 ? 'positive' : 'negative'}">${gaps.s1 >= 0 ? '+' : ''}${this.formatSegmentTime(gaps.s1)}s</span>
                    <span class="segment-color">${this.getGapColor(gaps.s1)}</span>
                </div>
                <div class="segment-row">
                    <span class="segment-name">S2:</span>
                    <span class="segment-time">${this.formatSegmentTime(pilotTimes.s2)}s vs ${this.formatSegmentTime(referenceTimes.s2)}s</span>
                    <span class="segment-gap ${gaps.s2 <= 0 ? 'positive' : 'negative'}">${gaps.s2 >= 0 ? '+' : ''}${this.formatSegmentTime(gaps.s2)}s</span>
                    <span class="segment-color">${this.getGapColor(gaps.s2)}</span>
                </div>
                <div class="segment-row">
                    <span class="segment-name">S3:</span>
                    <span class="segment-time">${this.formatSegmentTime(pilotTimes.s3)}s vs ${this.formatSegmentTime(referenceTimes.s3)}s</span>
                    <span class="segment-gap ${gaps.s3 <= 0 ? 'positive' : 'negative'}">${gaps.s3 >= 0 ? '+' : ''}${this.formatSegmentTime(gaps.s3)}s</span>
                    <span class="segment-color">${this.getGapColor(gaps.s3)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Formater un temps de segment
     */
    formatSegmentTime(timeInMs) {
        if (!timeInMs || timeInMs === 0) return '0.000';
        return (timeInMs / 1000).toFixed(3);
    }

    /**
     * Obtenir la couleur du gap
     */
    getGapColor(gap) {
        if (gap <= 0) return '🟢';
        if (gap <= 0.5) return '🟡';
        return '🔴';
    }

    /**
     * Initialiser le graphique de progression
     */
    initProgressionChart(firstName, lastName, cupCategory) {
        // Cette fonction sera implémentée en utilisant le composant progression-chart
        console.log('📊 Initialisation du graphique de progression...');
    }

    /**
     * Calculer les statistiques du pilote
     */
    calculatePilotStats(driver, firstName, lastName, cupCategory, allDrivers) {
        const stats = {
            firstName,
            lastName,
            cupCategory,
            bestValidTime: driver.bestValidTime || 0,
            averageValidTime: driver.averageValidTime || 0,
            bestWetTime: driver.bestWetTime || 0,
            averageWetTime: driver.averageWetTime || 0,
            totalLaps: driver.totalLaps || 0,
            validLaps: driver.validLaps || 0,
            wetLaps: driver.wetLaps || 0,
            laps: driver.lapTimes || []
        };

        // Calculer le meilleur tour potentiel
        stats.potentialBestTime = this.calculatePotentialBestTime(driver);

        // Calculer l'écart au leader
        stats.gapToLeader = this.calculateGapToLeader(driver, allDrivers, cupCategory);

        return stats;
    }

    /**
     * Calculer le meilleur tour potentiel
     */
    calculatePotentialBestTime(driver) {
        if (!driver.lapTimes || driver.lapTimes.length === 0) return 0;
        
        const validLaps = driver.lapTimes.filter(lap => lap.isValid && lap.splits && lap.splits.length >= 3);
        if (validLaps.length === 0) return 0;
        
        const bestS1 = Math.min(...validLaps.map(lap => lap.splits[0]));
        const bestS2 = Math.min(...validLaps.map(lap => lap.splits[1]));
        const bestS3 = Math.min(...validLaps.map(lap => lap.splits[2]));
        
        return bestS1 + bestS2 + bestS3;
    }

    /**
     * Calculer l'écart au leader
     */
    calculateGapToLeader(driver, allDrivers, cupCategory) {
        const categoryDrivers = Object.values(allDrivers).filter(d => d.cupCategory === cupCategory);
        const sortedCategoryDrivers = categoryDrivers
            .filter(d => d.bestValidTime > 0)
            .sort((a, b) => a.bestValidTime - b.bestValidTime);
        
        if (sortedCategoryDrivers.length === 0 || driver.bestValidTime === 0) {
            return null;
        }
        
        const leader = sortedCategoryDrivers[0];
        return driver.bestValidTime - leader.bestValidTime;
    }

    /**
     * Calculer les statistiques des segments du pilote
     */
    calculatePilotSegmentStats(driver) {
        if (!driver.lapTimes) return { best: { s1: 0, s2: 0, s3: 0 }, average: { s1: 0, s2: 0, s3: 0 } };
        
        const validLaps = driver.lapTimes.filter(lap => lap.isValid && lap.splits && lap.splits.length >= 3);
        if (validLaps.length === 0) return { best: { s1: 0, s2: 0, s3: 0 }, average: { s1: 0, s2: 0, s3: 0 } };
        
        const s1Times = validLaps.map(lap => lap.splits[0]);
        const s2Times = validLaps.map(lap => lap.splits[1]);
        const s3Times = validLaps.map(lap => lap.splits[2]);
        
        return {
            best: {
                s1: Math.min(...s1Times),
                s2: Math.min(...s2Times),
                s3: Math.min(...s3Times)
            },
            average: {
                s1: s1Times.reduce((sum, time) => sum + time, 0) / s1Times.length,
                s2: s2Times.reduce((sum, time) => sum + time, 0) / s2Times.length,
                s3: s3Times.reduce((sum, time) => sum + time, 0) / s3Times.length
            }
        };
    }

    /**
     * Formater un temps en millisecondes
     */
    formatTime(timeInMs) {
        if (!timeInMs || timeInMs === 0) return '00:00:000';
        
        const minutes = Math.floor(timeInMs / 60000);
        const seconds = Math.floor((timeInMs % 60000) / 1000);
        const milliseconds = timeInMs % 1000;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
    }

    /**
     * Obtenir les données filtrées
     */
    getFilteredData() {
        return window.getFilteredData ? window.getFilteredData() : { byDriver: {}, globalSegmentStats: {} };
    }
}

/**
 * Initialiser le composant pilot-card
 */
function initPilotCardCompat() {
    try {
        // Créer une instance
        pilotCardInstance = new PilotCardCompat();
        
        // Initialiser le composant
        pilotCardInstance.init();
        
        console.log('✅ Composant pilot-card (compatible) initialisé avec succès');
        
        // Remplacer la fonction globale openPilotModal
        window.openPilotModal = function(pilotId) {
            if (pilotCardInstance) {
                pilotCardInstance.open(pilotId);
            } else {
                console.error('❌ Composant pilot-card non initialisé');
            }
        };
        
        // Remplacer la fonction globale closePilotModal
        window.closePilotModal = function() {
            if (pilotCardInstance) {
                pilotCardInstance.close();
            } else {
                console.error('❌ Composant pilot-card non initialisé');
            }
        };
        
        // Fonctions d'information des segments
        window.showSegmentInfo = function(event, trackName) {
            event.stopPropagation();
            
            const trackInfo = PILOT_CARD_CONFIG.trackSegmentInfo[trackName];
            if (!trackInfo) {
                console.warn(`Informations non disponibles pour la piste: ${trackName}`);
                return;
            }
            
            const popup = document.createElement('div');
            popup.className = 'consistency-info-popup';
            popup.innerHTML = `
                <div class="popup-content">
                    <div class="popup-header">
                        <h4>📍 ${trackName.charAt(0).toUpperCase() + trackName.slice(1).replace('_', ' ')} - Segments</h4>
                        <button class="popup-close" onclick="closeSegmentInfo()">×</button>
                    </div>
                    <div class="popup-body">
                        <div class="info-section">
                            <h5>🏁 Segment 1 (S1)</h5>
                            <p>${trackInfo.sector1}</p>
                        </div>
                        <div class="info-section">
                            <h5>🏁 Segment 2 (S2)</h5>
                            <p>${trackInfo.sector2}</p>
                        </div>
                        <div class="info-section">
                            <h5>🏁 Segment 3 (S3)</h5>
                            <p>${trackInfo.sector3}</p>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            setTimeout(() => {
                popup.classList.add('show');
            }, 10);
            
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    closeSegmentInfo();
                }
            });
            
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeSegmentInfo();
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            popup._cleanup = () => {
                document.removeEventListener('keydown', handleEscape);
            };
        };

        window.closeSegmentInfo = function() {
            const popup = document.querySelector('.consistency-info-popup');
            if (popup) {
                if (popup._cleanup) {
                    popup._cleanup();
                }
                popup.remove();
            }
        };
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du composant pilot-card:', error);
        return false;
    }
}

/**
 * Obtenir l'instance du composant pilot-card
 */
function getPilotCardInstance() {
    return pilotCardInstance;
}

/**
 * Vérifier si le composant pilot-card est disponible
 */
function isPilotCardAvailable() {
    return pilotCardInstance !== null;
}

// Initialiser automatiquement quand le script est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que tous les scripts soient chargés
    setTimeout(() => {
        initPilotCardCompat();
    }, 2000);
});

// Initialiser aussi après un délai supplémentaire pour s'assurer que tout est prêt
setTimeout(() => {
    if (!window.isPilotCardAvailable || !window.isPilotCardAvailable()) {
        console.log('🔄 Tentative d\'initialisation tardive du composant pilot-card...');
        initPilotCardCompat();
    }
}, 5000);

// Export pour utilisation globale
window.PilotCardCompat = PilotCardCompat;
window.initPilotCardCompat = initPilotCardCompat;
window.getPilotCardInstance = getPilotCardInstance;
window.isPilotCardAvailable = isPilotCardAvailable;
