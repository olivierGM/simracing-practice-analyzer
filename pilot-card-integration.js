/**
 * PILOT CARD INTEGRATION - Version d'intégration directe
 * Intégration directe du composant pilot-card avec l'architecture existante
 */

// Configuration du composant pilot-card
const PILOT_CARD_CONFIG = {
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
        "red_bull_ring": {
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
    messages: {
        pilotNotFound: 'Pilote non trouvé',
        noDataAvailable: 'Aucune donnée disponible'
    }
};

// Variables globales
let pilotCardInitialized = false;

/**
 * Initialiser le composant pilot-card
 */
function initPilotCard() {
    if (pilotCardInitialized) {
        console.log('✅ Composant pilot-card déjà initialisé');
        return;
    }
    
    console.log('🚀 Initialisation du composant pilot-card...');
    
    // Remplacer la fonction globale openPilotModal
    window.openPilotModal = function(pilotId) {
        openPilotModalWithComponent(pilotId);
    };
    
    // Remplacer la fonction globale closePilotModal
    window.closePilotModal = function() {
        closePilotModalWithComponent();
    };
    
    // Ajouter les fonctions d'information des segments
    window.showSegmentInfo = function(event, trackName) {
        showSegmentInfoPopup(event, trackName);
    };
    
    window.closeSegmentInfo = function() {
        closeSegmentInfoPopup();
    };
    
    pilotCardInitialized = true;
    console.log('✅ Composant pilot-card initialisé avec succès');
}

/**
 * Ouvrir la modal pilote avec le composant
 */
function openPilotModalWithComponent(pilotId) {
    const modal = document.getElementById('pilotModal');
    if (!modal) {
        console.error('❌ Modal pilote non trouvée');
        return;
    }
    
    // Empêcher le scroll du body sur mobile
    document.body.classList.add('modal-open');
    
    const [firstName, lastName, cupCategory] = pilotId.split('_');
    const filteredData = getFilteredData();
    const byDriver = filteredData.byDriver || {};
    const driverKey = `${firstName}_${lastName}_${cupCategory}`;
    const driver = byDriver[driverKey];
    
    if (!driver) {
        alert(PILOT_CARD_CONFIG.messages.pilotNotFound);
        return;
    }
    
    // Calculer les statistiques
    const stats = calculatePilotStats(driver, firstName, lastName, cupCategory, byDriver);
    
    // Générer le contenu de la modal
    generatePilotModalContent(firstName, lastName, cupCategory, stats);
    
    // Afficher la modal
    modal.classList.add('show');
    
    console.log(`✅ Modal pilote ouverte pour ${firstName} ${lastName}`);
}

/**
 * Fermer la modal pilote
 */
function closePilotModalWithComponent() {
    const modal = document.getElementById('pilotModal');
    if (!modal) return;
    
    document.body.classList.remove('modal-open');
    modal.classList.remove('show');
    
    console.log('✅ Modal pilote fermée');
}

/**
 * Générer le contenu de la modal pilote
 */
function generatePilotModalContent(firstName, lastName, cupCategory, stats) {
    const modal = document.getElementById('pilotModal');
    if (!modal) return;
    
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
                ${generateStatsCards(stats)}
            </div>

            <!-- Section graphique de progression -->
            <div class="progression-section">
                <div class="progression-chart-container" id="progressionChartContainer">
                    <p>Graphique de progression (en cours de développement)</p>
                </div>
            </div>

            <!-- Liste des tours -->
            <div class="laps-section">
                <h3>📊 Détails des Tours</h3>
                <div class="laps-list">
                    ${generateLapsList(stats)}
                </div>
            </div>

            <!-- Comparateur de segments -->
            <div class="segment-comparator-section">
                ${generateSegmentComparator(stats, firstName, lastName, cupCategory)}
            </div>
        </div>
    `;
    
    modal.innerHTML = modalContent;
}

/**
 * Générer les cartes de statistiques
 */
function generateStatsCards(stats) {
    return `
        <div class="stat-card">
            <h3>🏆 Meilleur Tour</h3>
            <div class="stat-value">${formatTime(stats.bestValidTime)}</div>
        </div>
        <div class="stat-card">
            <h3>📊 Moyenne Valide</h3>
            <div class="stat-value">${formatTime(stats.averageValidTime)}</div>
        </div>
        <div class="stat-card">
            <h3>💧 Meilleur Wet</h3>
            <div class="stat-value">${formatTime(stats.bestWetTime)}</div>
        </div>
        <div class="stat-card">
            <h3>📈 Moyenne Wet</h3>
            <div class="stat-value">${formatTime(stats.averageWetTime)}</div>
        </div>
        <div class="stat-card">
            <h3>🎯 Tour Potentiel</h3>
            <div class="stat-value">${formatTime(stats.potentialBestTime)}</div>
        </div>
        <div class="stat-card">
            <h3>⚡ Écart au Leader</h3>
            <div class="stat-value">${stats.gapToLeader ? formatTime(stats.gapToLeader) : 'N/A'}</div>
        </div>
    `;
}

/**
 * Générer la liste des tours
 */
function generateLapsList(stats) {
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

    const lapsItems = stats.laps.map(lap => generateLapItem(lap)).join('');
    
    return lapsHeader + lapsItems;
}

/**
 * Générer un élément de tour
 */
function generateLapItem(lap) {
    const isValidClass = lap.isValid ? 'valid' : 'invalid';
    const isWetClass = lap.isWet ? 'wet' : 'dry';
    
    return `
        <div class="lap-item ${isValidClass} ${isWetClass}">
            <span>${lap.lapNumber}</span>
            <span>${formatTime(lap.laptime)}</span>
            <span>${formatTime(lap.splits[0])}</span>
            <span>${formatTime(lap.splits[1])}</span>
            <span>${formatTime(lap.splits[2])}</span>
            <span>${lap.isValid ? '✓' : '✗'}</span>
            <span>${lap.isWet ? '💧' : '☀️'}</span>
        </div>
    `;
}

/**
 * Générer le comparateur de segments
 */
function generateSegmentComparator(stats, firstName, lastName, cupCategory) {
    const driver = getCurrentDriver(firstName, lastName, cupCategory);
    if (!driver) return '<div class="segment-comparator">Comparateur de segments (données non disponibles)</div>';
    
    const pilotSegmentStats = calculatePilotSegmentStats(driver);
    const globalSegmentStats = getFilteredData().globalSegmentStats;
    const trackName = window.selectedSession || '';
    
    return createSegmentComparatorHTML(pilotSegmentStats, globalSegmentStats, cupCategory, trackName);
}

/**
 * Créer le HTML du comparateur de segments
 */
function createSegmentComparatorHTML(pilotStats, globalStats, cupCategory, trackName) {
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
                    💡 Focus sur <strong>${worstSegment.toUpperCase()}</strong> pour +${formatSegmentTime(avgPilotVsAvgGlobal[worstSegment])}s de gain
                </div>
            </div>
            <div class="segment-grid">
                ${generateComparisonSection(
                    '📊 Meilleur Pilote vs Meilleur Global', 
                    pilotStats.best, 
                    { s1: globalSegmentStats.bestS1, s2: globalSegmentStats.bestS2, s3: globalSegmentStats.bestS3 },
                    bestPilotVsBestGlobal
                )}
                ${generateComparisonSection(
                    '🎯 Meilleur Pilote vs Meilleur Classe', 
                    pilotStats.best, 
                    { s1: classStats.bestS1, s2: classStats.bestS2, s3: classStats.bestS3 },
                    bestPilotVsBestClass
                )}
                ${generateComparisonSection(
                    '📈 Moyenne Pilote vs Moyenne Global', 
                    pilotStats.average, 
                    { s1: globalSegmentStats.avgS1, s2: globalSegmentStats.avgS2, s3: globalSegmentStats.avgS3 },
                    avgPilotVsAvgGlobal
                )}
                ${generateComparisonSection(
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
function generateComparisonSection(title, pilotTimes, referenceTimes, gaps) {
    return `
        <div class="segment-section">
            <h4>${title}</h4>
            <div class="segment-row">
                <span class="segment-name">S1:</span>
                <span class="segment-time">${formatSegmentTime(pilotTimes.s1)}s vs ${formatSegmentTime(referenceTimes.s1)}s</span>
                <span class="segment-gap ${gaps.s1 <= 0 ? 'positive' : 'negative'}">${gaps.s1 >= 0 ? '+' : ''}${formatSegmentTime(gaps.s1)}s</span>
                <span class="segment-color">${getGapColor(gaps.s1)}</span>
            </div>
            <div class="segment-row">
                <span class="segment-name">S2:</span>
                <span class="segment-time">${formatSegmentTime(pilotTimes.s2)}s vs ${formatSegmentTime(referenceTimes.s2)}s</span>
                <span class="segment-gap ${gaps.s2 <= 0 ? 'positive' : 'negative'}">${gaps.s2 >= 0 ? '+' : ''}${formatSegmentTime(gaps.s2)}s</span>
                <span class="segment-color">${getGapColor(gaps.s2)}</span>
            </div>
            <div class="segment-row">
                <span class="segment-name">S3:</span>
                <span class="segment-time">${formatSegmentTime(pilotTimes.s3)}s vs ${formatSegmentTime(referenceTimes.s3)}s</span>
                <span class="segment-gap ${gaps.s3 <= 0 ? 'positive' : 'negative'}">${gaps.s3 >= 0 ? '+' : ''}${formatSegmentTime(gaps.s3)}s</span>
                <span class="segment-color">${getGapColor(gaps.s3)}</span>
            </div>
        </div>
    `;
}

/**
 * Formater un temps de segment
 */
function formatSegmentTime(timeInMs) {
    if (!timeInMs || timeInMs === 0) return '0.000';
    return (timeInMs / 1000).toFixed(3);
}

/**
 * Obtenir la couleur du gap
 */
function getGapColor(gap) {
    if (gap <= 0) return '🟢';
    if (gap <= 0.5) return '🟡';
    return '🔴';
}

/**
 * Obtenir le pilote actuel
 */
function getCurrentDriver(firstName, lastName, cupCategory) {
    const filteredData = getFilteredData();
    const byDriver = filteredData.byDriver || {};
    const driverKey = `${firstName}_${lastName}_${cupCategory}`;
    return byDriver[driverKey];
}

/**
 * Afficher le popup d'information des segments
 */
function showSegmentInfoPopup(event, trackName) {
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
            closeSegmentInfoPopup();
        }
    });
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeSegmentInfoPopup();
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    popup._cleanup = () => {
        document.removeEventListener('keydown', handleEscape);
    };
}

/**
 * Fermer le popup d'information des segments
 */
function closeSegmentInfoPopup() {
    const popup = document.querySelector('.consistency-info-popup');
    if (popup) {
        if (popup._cleanup) {
            popup._cleanup();
        }
        popup.remove();
    }
}

// Initialiser le composant quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initPilotCard();
    }, 1000);
});

// Fonction de vérification de disponibilité
function isPilotCardAvailable() {
    return pilotCardInitialized;
}
