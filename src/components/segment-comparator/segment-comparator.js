/**
 * SEGMENT COMPARATOR COMPONENT - Logique principale
 * Composant autonome pour la gestion du comparateur de segments
 */

import { SEGMENT_COMPARATOR_CONFIG } from './segment-comparator.config.js';

class SegmentComparator {
    constructor(config = SEGMENT_COMPARATOR_CONFIG) {
        this.config = config;
        this.container = null;
        this.currentData = null;
        this.currentPilot = null;
        this.currentTrack = '';
        this.isInitialized = false;
    }

    /**
     * Initialiser le composant
     */
    init(containerId = 'segmentComparatorSection') {
        if (this.isInitialized) {
            console.warn('SegmentComparator déjà initialisé');
            return;
        }

        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`❌ Conteneur ${containerId} non trouvé dans le DOM`);
            return;
        }

        this.createComparator();
        this.bindEvents();
        this.isInitialized = true;
        console.log('✅ SegmentComparator initialisé');
    }

    /**
     * Créer le comparateur
     */
    createComparator() {
        const comparatorHTML = `
            <div class="segment-comparator-component">
                <!-- En-tête du comparateur -->
                <div class="segment-header">
                    <div class="segment-title-row">
                        <h3>🏁 Comparateur de Segments</h3>
                        <span class="info-icon" id="segmentInfoButton">ℹ️</span>
                    </div>
                    <div class="segment-focus-hint" id="segmentFocusHint">
                        <!-- Le conseil de focus sera généré dynamiquement -->
                    </div>
                </div>

                <!-- Grille des comparaisons -->
                <div class="segment-grid" id="segmentGrid">
                    <!-- Les sections de comparaison seront générées dynamiquement -->
                </div>

                <!-- Informations sur les segments -->
                <div class="segment-info-section" id="segmentInfoSection">
                    <!-- Les informations sur les segments seront affichées ici -->
                </div>
            </div>
        `;
        
        this.container.innerHTML = comparatorHTML;
    }

    /**
     * Lier les événements
     */
    bindEvents() {
        // Bouton d'information des segments
        const infoButton = document.getElementById('segmentInfoButton');
        if (infoButton) {
            infoButton.addEventListener('click', (e) => {
                this.showSegmentInfo(e);
            });
        }

        // Gestion de l'échappement pour fermer le popup
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSegmentInfo();
            }
        });
    }

    /**
     * Mettre à jour les données
     */
    updateData(pilotData, globalData, trackName = '') {
        this.currentData = globalData;
        this.currentPilot = pilotData;
        this.currentTrack = trackName;
        
        if (this.isInitialized) {
            this.renderComparator();
        }
    }

    /**
     * Rendre le comparateur
     */
    renderComparator() {
        if (!this.currentData || !this.currentPilot) {
            this.renderNoData();
            return;
        }

        this.renderComparisons();
        this.renderFocusHint();
        this.renderSegmentInfo();
    }

    /**
     * Rendre les comparaisons
     */
    renderComparisons() {
        const segmentGrid = document.getElementById('segmentGrid');
        if (!segmentGrid) return;

        const pilotStats = this.calculatePilotSegmentStats();
        const globalStats = this.currentData.globalSegmentStats;
        
        if (!globalStats || !globalStats.global || !globalStats.byCategory) {
            segmentGrid.innerHTML = '<div class="segment-section">Données non disponibles</div>';
            return;
        }

        const globalSegmentStats = globalStats.global;
        const classStats = globalStats.byCategory[this.currentPilot.cupCategory];

        if (!classStats) {
            segmentGrid.innerHTML = '<div class="segment-section">Données de classe non disponibles</div>';
            return;
        }

        // Calculer les écarts
        const comparisons = this.calculateComparisons(pilotStats, globalSegmentStats, classStats);
        
        // Rendre les comparaisons
        const comparisonsHTML = Object.entries(comparisons).map(([key, comparison]) => {
            return this.renderComparisonSection(key, comparison);
        }).join('');
        
        segmentGrid.innerHTML = comparisonsHTML;
    }

    /**
     * Calculer les statistiques des segments du pilote
     */
    calculatePilotSegmentStats() {
        if (!this.currentPilot.lapTimes) {
            return { best: { s1: 0, s2: 0, s3: 0 }, average: { s1: 0, s2: 0, s3: 0 } };
        }
        
        const validLaps = this.currentPilot.lapTimes.filter(lap => 
            lap.isValid && lap.splits && lap.splits.length >= 3
        );
        
        if (validLaps.length === 0) {
            return { best: { s1: 0, s2: 0, s3: 0 }, average: { s1: 0, s2: 0, s3: 0 } };
        }
        
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
     * Calculer les comparaisons
     */
    calculateComparisons(pilotStats, globalStats, classStats) {
        return {
            bestPilotVsBestGlobal: {
                title: this.config.comparisons.bestPilotVsBestGlobal.title,
                pilotTimes: pilotStats.best,
                referenceTimes: { s1: globalStats.bestS1, s2: globalStats.bestS2, s3: globalStats.bestS3 },
                gaps: {
                    s1: pilotStats.best.s1 - globalStats.bestS1,
                    s2: pilotStats.best.s2 - globalStats.bestS2,
                    s3: pilotStats.best.s3 - globalStats.bestS3
                }
            },
            bestPilotVsBestClass: {
                title: this.config.comparisons.bestPilotVsBestClass.title,
                pilotTimes: pilotStats.best,
                referenceTimes: { s1: classStats.bestS1, s2: classStats.bestS2, s3: classStats.bestS3 },
                gaps: {
                    s1: pilotStats.best.s1 - classStats.bestS1,
                    s2: pilotStats.best.s2 - classStats.bestS2,
                    s3: pilotStats.best.s3 - classStats.bestS3
                }
            },
            avgPilotVsAvgGlobal: {
                title: this.config.comparisons.avgPilotVsAvgGlobal.title,
                pilotTimes: pilotStats.average,
                referenceTimes: { s1: globalStats.avgS1, s2: globalStats.avgS2, s3: globalStats.avgS3 },
                gaps: {
                    s1: pilotStats.average.s1 - globalStats.avgS1,
                    s2: pilotStats.average.s2 - globalStats.avgS2,
                    s3: pilotStats.average.s3 - globalStats.avgS3
                }
            },
            avgPilotVsAvgClass: {
                title: this.config.comparisons.avgPilotVsAvgClass.title,
                pilotTimes: pilotStats.average,
                referenceTimes: { s1: classStats.avgS1, s2: classStats.avgS2, s3: classStats.avgS3 },
                gaps: {
                    s1: pilotStats.average.s1 - classStats.avgS1,
                    s2: pilotStats.average.s2 - classStats.avgS2,
                    s3: pilotStats.average.s3 - classStats.avgS3
                }
            }
        };
    }

    /**
     * Rendre une section de comparaison
     */
    renderComparisonSection(key, comparison) {
        const { title, pilotTimes, referenceTimes, gaps } = comparison;
        
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
     * Rendre le conseil de focus
     */
    renderFocusHint() {
        const focusHint = document.getElementById('segmentFocusHint');
        if (!focusHint || !this.currentData || !this.currentData.globalSegmentStats) return;

        const globalStats = this.currentData.globalSegmentStats.global;
        const pilotStats = this.calculatePilotSegmentStats();
        
        if (!globalStats) return;

        // Calculer les écarts moyens
        const avgGaps = {
            s1: pilotStats.average.s1 - globalStats.avgS1,
            s2: pilotStats.average.s2 - globalStats.avgS2,
            s3: pilotStats.average.s3 - globalStats.avgS3
        };

        // Trouver le segment le plus problématique
        const worstSegment = Object.keys(avgGaps).reduce((a, b) => 
            avgGaps[a] > avgGaps[b] ? a : b
        );

        const worstGap = avgGaps[worstSegment];
        
        focusHint.innerHTML = `
            💡 Focus sur <strong>${worstSegment.toUpperCase()}</strong> pour +${this.formatSegmentTime(worstGap)}s de gain
        `;
    }

    /**
     * Rendre les informations sur les segments
     */
    renderSegmentInfo() {
        const segmentInfoSection = document.getElementById('segmentInfoSection');
        if (!segmentInfoSection) return;

        if (!this.currentTrack) {
            segmentInfoSection.innerHTML = '';
            return;
        }

        const trackInfo = this.config.trackSegmentInfo[this.currentTrack];
        if (!trackInfo) {
            segmentInfoSection.innerHTML = `
                <h4>Informations sur les segments</h4>
                <div class="segment-info-item">
                    Informations non disponibles pour la piste: ${this.currentTrack}
                </div>
            `;
            return;
        }

        segmentInfoSection.innerHTML = `
            <h4>Informations sur les segments - ${this.currentTrack}</h4>
            <div class="segment-info-item">
                <strong>S1:</strong> ${trackInfo.sector1}
            </div>
            <div class="segment-info-item">
                <strong>S2:</strong> ${trackInfo.sector2}
            </div>
            <div class="segment-info-item">
                <strong>S3:</strong> ${trackInfo.sector3}
            </div>
        `;
    }

    /**
     * Rendre le message "pas de données"
     */
    renderNoData() {
        const segmentGrid = document.getElementById('segmentGrid');
        if (segmentGrid) {
            segmentGrid.innerHTML = `
                <div class="segment-section">
                    ${this.config.messages.noData}
                </div>
            `;
        }
    }

    /**
     * Afficher les informations des segments
     */
    showSegmentInfo(event) {
        event.stopPropagation();
        
        if (!this.currentTrack) {
            console.warn('Aucune piste sélectionnée');
            return;
        }

        const trackInfo = this.config.trackSegmentInfo[this.currentTrack];
        if (!trackInfo) {
            console.warn(`Informations non disponibles pour la piste: ${this.currentTrack}`);
            return;
        }

        // Créer le popup
        const popup = document.createElement('div');
        popup.className = 'consistency-info-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h4>📍 ${this.currentTrack.charAt(0).toUpperCase() + this.currentTrack.slice(1).replace('_', ' ')} - Segments</h4>
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

        // Gérer les événements
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.closeSegmentInfo();
            }
        });

        // Stocker la référence pour le nettoyage
        this.currentPopup = popup;
    }

    /**
     * Fermer les informations des segments
     */
    closeSegmentInfo() {
        if (this.currentPopup) {
            this.currentPopup.remove();
            this.currentPopup = null;
        }
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
        if (gap <= 0) return this.config.icons.positive;
        if (gap <= 0.5) return this.config.icons.medium;
        return this.config.icons.negative;
    }

    /**
     * Détruire le composant
     */
    destroy() {
        if (this.currentPopup) {
            this.closeSegmentInfo();
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.isInitialized = false;
    }
}

// Export pour utilisation en module
export default SegmentComparator;

// Export pour utilisation globale (compatibilité)
if (typeof window !== 'undefined') {
    window.SegmentComparator = SegmentComparator;
}
