/**
 * PILOT CARD COMPONENT - Logique principale
 * Composant autonome pour la gestion de la fiche pilote
 */

import { PILOT_CARD_CONFIG } from './pilot-card.config.js';

class PilotCard {
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
     * @param {string} pilotId - ID du pilote (format: firstName_lastName_cupCategory)
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
        
        // Mettre à jour le header
        this.updatePilotHeader(firstName, lastName, cupCategory, this.currentStats);
        
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
     * Mettre à jour le header du pilote
     */
    updatePilotHeader(firstName, lastName, cupCategory, stats) {
        const pilotName = document.getElementById('pilotName');
        const pilotCategory = document.getElementById('pilotCategory');
        
        if (pilotName) {
            pilotName.textContent = `${firstName} ${lastName}`;
        }
        
        if (pilotCategory) {
            pilotCategory.textContent = `Catégorie ${cupCategory}`;
        }
    }

    /**
     * Générer le contenu principal de la modal
     */
    generatePilotContent(firstName, lastName, cupCategory, stats) {
        const pilotStatsGrid = document.getElementById('pilotStatsGrid');
        const lapsList = document.getElementById('lapsList');
        const segmentComparatorSection = document.getElementById('segmentComparatorSection');
        
        if (pilotStatsGrid) {
            pilotStatsGrid.innerHTML = this.generateStatsCards(stats);
        }
        
        if (lapsList) {
            lapsList.innerHTML = this.generateLapsList(stats);
        }
        
        if (segmentComparatorSection) {
            segmentComparatorSection.innerHTML = this.generateSegmentComparator(stats);
        }
        
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
        // Logique extraite du pilot-modal.js original
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
     * Créer le HTML du comparateur de segments
     */
    createSegmentComparatorHTML(pilotStats, globalStats, cupCategory, trackName) {
        // Logique extraite du pilot-modal.js original
        // Cette méthode sera complétée dans la prochaine étape
        return '<div class="segment-comparator">Comparateur de segments (en cours de développement)</div>';
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
     * Obtenir les données filtrées (méthode à implémenter selon le contexte)
     */
    getFilteredData() {
        // Cette méthode dépend du contexte global de l'application
        // Elle sera connectée aux données globales dans l'intégration
        return window.getFilteredData ? window.getFilteredData() : { byDriver: {}, globalSegmentStats: {} };
    }
}

// Export pour utilisation en module
export default PilotCard;

// Export pour utilisation globale (compatibilité)
if (typeof window !== 'undefined') {
    window.PilotCard = PilotCard;
}
