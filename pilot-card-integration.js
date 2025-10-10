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
    
    // Empêcher le scroll du body et html
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    
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
    generatePilotModalContent(firstName, lastName, cupCategory, stats, filteredData.globalSegmentStats, window.selectedSession || '', driver);
    
    // Afficher la modal
    modal.style.display = 'block';
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
    document.documentElement.classList.remove('modal-open');
    modal.style.display = 'none';
    modal.classList.remove('show');
    
    console.log('✅ Modal pilote fermée');
}

/**
 * Calculer toutes les statistiques du pilote
 */
function calculatePilotStats(driver, firstName, lastName, cupCategory, byDriver) {
    
    // Utiliser les données du driver qui sont déjà calculées correctement
    const totalLaps = driver.lapTimes ? driver.lapTimes.length : 0;
    const validLaps = driver.lapTimes ? driver.lapTimes.filter(lap => lap.isValid || lap.isValidForBest).length : 0;
    const wetLaps = driver.lapTimes ? driver.lapTimes.filter(lap => lap.isWet).length : 0;
    
    // Calculer la position dans la catégorie
    const categoryDrivers = Object.values(byDriver).filter(d => d.cupCategory === parseInt(cupCategory));
    const sortedCategoryDrivers = categoryDrivers.sort((a, b) => (a.bestValidTime || 0) - (b.bestValidTime || 0));
    const categoryPosition = sortedCategoryDrivers.findIndex(d => d.firstName === firstName && d.lastName === lastName) + 1;
    
    // Calculer l'écart au leader de la catégorie (différence entre le meilleur lap du pilote et le meilleur lap du leader)
    const categoryLeader = sortedCategoryDrivers[0];
    const pilotBestTime = driver.bestValidTime || 0;
    const leaderBestTime = categoryLeader?.bestValidTime || 0;
    const gapToLeader = pilotBestTime - leaderBestTime;
    
    // Calculer le meilleur tour potentiel (somme des meilleurs segments)
    const potentialBestTime = calculatePotentialBestTime(driver);
    
    // Calculer les statistiques wet
    const wetLapsData = driver.lapTimes ? driver.lapTimes.filter(lap => {
        const isWet = lap.isWetSession || lap.sessionWet || false;
        const isValid = lap.isValidForBest !== false;
        return isWet && isValid;
    }) : [];
    
    const wetTimes = wetLapsData.map(lap => lap.laptime || lap.time || 0).filter(time => time > 0);
    const bestWetTime = wetTimes.length > 0 ? Math.min(...wetTimes) : 0;
    const averageWetTime = wetTimes.length > 0 ? wetTimes.reduce((sum, time) => sum + time, 0) / wetTimes.length : 0;
    
    // Calculer les statistiques de segments du pilote
    const pilotSegmentStats = calculatePilotSegmentStats(driver);
    
    return {
        totalLaps,
        validLaps,
        wetLaps,
        categoryPosition,
        categoryDrivers: categoryDrivers.length,
        gapToLeader,
        // Ajouter les statistiques nécessaires pour les cartes
        bestValidTime: driver.bestValidTime || 0,
        averageValidTime: driver.averageValidTime || 0,
        bestWetTime: driver.bestWetTime || 0,
        averageWetTime: driver.averageWetTime || 0,
        potentialBestTime: potentialBestTime,
        pilotSegmentStats: pilotSegmentStats
    };
}

/**
 * Calculer les statistiques de segments d'un pilote
 */
function calculatePilotSegmentStats(driver) {
    if (!driver.lapTimes) {
        return {
            best: { s1: 0, s2: 0, s3: 0 },
            average: { s1: 0, s2: 0, s3: 0 }
        };
    }
    
    const validLaps = driver.lapTimes.filter(lap => lap.isValid && lap.splits && lap.splits.length >= 3);
    if (validLaps.length === 0) {
        return {
            best: { s1: 0, s2: 0, s3: 0 },
            average: { s1: 0, s2: 0, s3: 0 }
        };
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
 * Calculer le meilleur tour potentiel (somme des meilleurs segments)
 */
function calculatePotentialBestTime(driver) {
    if (!driver.lapTimes) return 0;
    
    const validLaps = driver.lapTimes.filter(lap => lap.isValid && lap.splits && lap.splits.length >= 3);
    if (validLaps.length === 0) return 0;
    
    const s1Times = validLaps.map(lap => lap.splits[0]);
    const s2Times = validLaps.map(lap => lap.splits[1]);
    const s3Times = validLaps.map(lap => lap.splits[2]);
    
    const bestS1 = Math.min(...s1Times);
    const bestS2 = Math.min(...s2Times);
    const bestS3 = Math.min(...s3Times);
    
    return bestS1 + bestS2 + bestS3;
}

/**
 * Formater un temps
 */
function formatTime(timeInMs) {
    if (!timeInMs || timeInMs === 0) return '--:--.---';
    
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const milliseconds = timeInMs % 1000;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Générer le contenu de la modal pilote
 */
// Fonction pour mapper les catégories numériques vers les noms
function getCategoryName(categoryNumber) {
    // Convertir en nombre si c'est une chaîne
    const num = parseInt(categoryNumber);
    
    const categoryMap = {
        0: 'Pro',
        1: 'Amateur', 
        2: 'Silver',
        3: 'Bronze'
    };
    
    // Debug pour voir ce qui se passe
    console.log(`🔍 getCategoryName debug: input="${categoryNumber}", parsed=${num}, isNaN=${isNaN(num)}, result="${categoryMap[num]}"`);
    
    // Vérifier si la conversion a réussi et si la valeur existe
    if (!isNaN(num) && categoryMap[num] !== undefined) {
        return categoryMap[num];
    }
    
    return `Catégorie ${categoryNumber}`;
}

function generatePilotModalContent(firstName, lastName, cupCategory, stats, globalSegmentStats, trackName, driver) {
    console.log('🔧 generatePilotModalContent appelée avec:', { firstName, lastName, cupCategory, stats, globalSegmentStats, trackName });
    
    // Debug spécifique pour la catégorie
    console.log(`🔍 Debug catégorie: cupCategory="${cupCategory}", type=${typeof cupCategory}, getCategoryName result="${getCategoryName(cupCategory)}"`);
    
    const modal = document.getElementById('pilotModal');
    if (!modal) {
        console.error('❌ Modal non trouvée!');
        return;
    }
    
    console.log('✅ Modal trouvée, génération du contenu...');
    
    try {
        const modalContent = `
        <div class="pilot-card">
            <!-- Header du pilote -->
            <div class="pilot-header">
                <div class="pilot-info">
                    <h2 class="pilot-name">${firstName} ${lastName}</h2>
                    <div class="pilot-details">
                        <span class="pilot-category">${getCategoryName(cupCategory)}</span>
                        <span class="pilot-position">#${stats.categoryPosition}/${stats.categoryDrivers}</span>
                    </div>
                </div>
                <button class="modal-close" onclick="closePilotModal()">×</button>
            </div>

            <!-- Statistiques principales -->
            <div class="pilot-stats-grid">
                ${generateStatsCards(stats)}
            </div>

            <!-- Comparateur de segments -->
            <div class="segment-comparator-section">
                ${generateSegmentComparator(stats.pilotSegmentStats, globalSegmentStats, cupCategory, trackName)}
            </div>

            <!-- Section laps et graphique côte à côte -->
            <div class="laps-chart-container">
                <!-- Liste des tours -->
                <div class="laps-section">
                    <h3>📊 Détails des Tours</h3>
                    <div class="laps-list">
                        ${generateLapsList(driver)}
                    </div>
                </div>

                <!-- Section graphique de progression -->
                <div class="progression-section">
                    <div class="progression-chart-container" id="progressionChartContainer">
                        <canvas id="progressionChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('📝 Contenu généré, longueur:', modalContent.length);
    console.log('📝 Aperçu du contenu:', modalContent.substring(0, 200) + '...');
    
    modal.innerHTML = modalContent;
    console.log('✅ HTML injecté dans la modal');
    
    // Vérifier immédiatement après l'injection
    setTimeout(() => {
        const currentHTML = modal.innerHTML;
        console.log('🔍 HTML de la modal après injection, longueur:', currentHTML.length);
        console.log('🔍 Aperçu HTML après injection:', currentHTML.substring(0, 200) + '...');
    }, 100);
    
        // Initialiser le graphique après avoir ajouté le HTML
        setTimeout(() => {
            initializeProgressionChart(firstName, lastName, driver);
        }, 100);
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération du contenu de la modal:', error);
        console.error('❌ Stack trace:', error.stack);
    }
}

/**
 * Générer les cartes de statistiques
 */
function generateStatsCards(stats) {
    return `
        <div class="stat-card">
            <div class="stat-title">🏆 Meilleur Tour</div>
            <div class="stat-value">${formatTime(stats.bestValidTime)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">📊 Moyenne Valide</div>
            <div class="stat-value">${formatTime(stats.averageValidTime)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">💧 Meilleur Wet</div>
            <div class="stat-value">${formatTime(stats.bestWetTime)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">📈 Moyenne Wet</div>
            <div class="stat-value">${formatTime(stats.averageWetTime)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">🎯 Tour Potentiel</div>
            <div class="stat-value">${formatTime(stats.potentialBestTime)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">⚡ Écart au Leader</div>
            <div class="stat-value">${stats.gapToLeader ? formatTime(stats.gapToLeader) : 'N/A'}</div>
        </div>
    `;
}

/**
 * Générer la liste des tours
 */
function generateLapsList(driver) {
    if (!driver || !driver.lapTimes || driver.lapTimes.length === 0) {
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

    const lapsItems = driver.lapTimes.map((lap, index) => generateLapItem(lap, index)).join('');
    
    return lapsHeader + lapsItems;
}

/**
 * Générer un élément de tour
 */
function generateLapItem(lap, index) {
    const lapTime = lap.laptime || lap.time || 0;
    const isValid = lap.isValidForBest !== false;
    const isWet = lap.isWetSession || lap.sessionWet || false;
    
    const isValidClass = isValid ? 'valid' : 'invalid';
    const isWetClass = isWet ? 'wet' : 'dry';
    
    return `
        <div class="lap-item ${isValidClass} ${isWetClass}">
            <span>${index + 1}</span>
            <span>${lapTime > 0 ? formatTime(lapTime) : '--:--.---'}</span>
            <span>${lap.splits && lap.splits[0] ? formatTime(lap.splits[0]) : '--'}</span>
            <span>${lap.splits && lap.splits[1] ? formatTime(lap.splits[1]) : '--'}</span>
            <span>${lap.splits && lap.splits[2] ? formatTime(lap.splits[2]) : '--'}</span>
            <span>${isValid ? '✓' : '✗'}</span>
            <span>${isWet ? '💧' : '☀️'}</span>
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

/**
 * Générer le comparateur de segments
 */
function generateSegmentComparator(pilotSegmentStats, globalSegmentStats, cupCategory, trackName) {
    console.log('🏁 generateSegmentComparator appelée avec:', { pilotSegmentStats, globalSegmentStats, cupCategory, trackName });
    
    if (!pilotSegmentStats || !globalSegmentStats) {
        console.log('❌ Données manquantes pour le comparateur');
        return '<p>Comparateur de segments (données non disponibles)</p>';
    }
    
    console.log('✅ Données disponibles, génération du comparateur...');
    
    // Informations sur les segments de la piste
    const trackSegmentInfo = {
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
    };
    
    const infoButton = trackSegmentInfo[trackName] ? 
        `<span class="info-icon" onclick="showSegmentInfo(event, '${trackName}')">ℹ️</span>` : '';
    
    // Récupérer les statistiques globales et par catégorie
    const globalStats = globalSegmentStats.global;
    const classStats = globalSegmentStats.byCategory[cupCategory];
    
    if (!globalStats || !classStats) {
        console.log('❌ Statistiques globales ou par catégorie manquantes');
        return '<p>Comparateur de segments (statistiques non disponibles)</p>';
    }
    
    // Calculer les différences pour chaque section
    const bestPilotVsBestGlobal = {
        s1: pilotSegmentStats.best.s1 - globalStats.bestS1,
        s2: pilotSegmentStats.best.s2 - globalStats.bestS2,
        s3: pilotSegmentStats.best.s3 - globalStats.bestS3
    };
    
    const bestPilotVsBestClass = {
        s1: pilotSegmentStats.best.s1 - classStats.bestS1,
        s2: pilotSegmentStats.best.s2 - classStats.bestS2,
        s3: pilotSegmentStats.best.s3 - classStats.bestS3
    };
    
    const avgPilotVsAvgGlobal = {
        s1: pilotSegmentStats.average.s1 - globalStats.avgS1,
        s2: pilotSegmentStats.average.s2 - globalStats.avgS2,
        s3: pilotSegmentStats.average.s3 - globalStats.avgS3
    };
    
    const avgPilotVsAvgClass = {
        s1: pilotSegmentStats.average.s1 - classStats.avgS1,
        s2: pilotSegmentStats.average.s2 - classStats.avgS2,
        s3: pilotSegmentStats.average.s3 - classStats.avgS3
    };
    
    // Trouver le segment le plus problématique (le plus lent)
    const worstSegment = avgPilotVsAvgGlobal.s1 > avgPilotVsAvgGlobal.s2 && avgPilotVsAvgGlobal.s1 > avgPilotVsAvgGlobal.s3 ? 'S1' :
                        avgPilotVsAvgGlobal.s2 > avgPilotVsAvgGlobal.s3 ? 'S2' : 'S3';
    
    // Fonction utilitaire pour formater les temps
    const formatSegmentTime = (time) => {
        if (time === 0) return '0.000s';
        return (time / 1000).toFixed(3) + 's';
    };
    
    // Fonction utilitaire pour obtenir la couleur du gap
    const getGapColor = (gap) => {
        if (gap <= 0) return 'positive';
        return 'negative';
    };
    
    // Fonction pour générer une section de comparaison
    const generateComparisonSection = (title, gaps, pilotTimes, referenceTimes) => {
        return `
            <div class="segment-section">
                <h4>${title}</h4>
                <div class="segment-row">
                    <span class="segment-name">S1:</span>
                    <span class="segment-time">${formatSegmentTime(pilotTimes.s1)} vs ${formatSegmentTime(referenceTimes.s1)}</span>
                    <span class="segment-gap ${getGapColor(gaps.s1)}">${gaps.s1 <= 0 ? '+' : ''}${formatSegmentTime(Math.abs(gaps.s1))}</span>
                    <span class="segment-color">${gaps.s1 <= 0 ? '🟢' : '🔴'}</span>
                </div>
                <div class="segment-row">
                    <span class="segment-name">S2:</span>
                    <span class="segment-time">${formatSegmentTime(pilotTimes.s2)} vs ${formatSegmentTime(referenceTimes.s2)}</span>
                    <span class="segment-gap ${getGapColor(gaps.s2)}">${gaps.s2 <= 0 ? '+' : ''}${formatSegmentTime(Math.abs(gaps.s2))}</span>
                    <span class="segment-color">${gaps.s2 <= 0 ? '🟢' : '🔴'}</span>
                </div>
                <div class="segment-row">
                    <span class="segment-name">S3:</span>
                    <span class="segment-time">${formatSegmentTime(pilotTimes.s3)} vs ${formatSegmentTime(referenceTimes.s3)}</span>
                    <span class="segment-gap ${getGapColor(gaps.s3)}">${gaps.s3 <= 0 ? '+' : ''}${formatSegmentTime(Math.abs(gaps.s3))}</span>
                    <span class="segment-color">${gaps.s3 <= 0 ? '🟢' : '🔴'}</span>
                </div>
            </div>
        `;
    };
    
    return `
        <div class="segment-comparator">
            <div class="segment-header">
                <div class="segment-title-row">
                    <h3>🏁 Comparateur de Segments${infoButton}</h3>
                </div>
                <div class="segment-focus-hint">
                    💡 Focus sur <strong>${worstSegment}</strong> pour +-${formatSegmentTime(Math.abs(avgPilotVsAvgGlobal[worstSegment.toLowerCase()]))} de gain
                </div>
            </div>
            <div class="segment-grid">
                ${generateComparisonSection('📊 Meilleur Pilote vs Meilleur Global', bestPilotVsBestGlobal, pilotSegmentStats.best, globalStats)}
                ${generateComparisonSection('🎯 Meilleur Pilote vs Meilleur Classe', bestPilotVsBestClass, pilotSegmentStats.best, classStats)}
                ${generateComparisonSection('📈 Moyenne Pilote vs Moyenne Global', avgPilotVsAvgGlobal, pilotSegmentStats.average, globalStats)}
                ${generateComparisonSection('📉 Moyenne Pilote vs Moyenne Classe', avgPilotVsAvgClass, pilotSegmentStats.average, classStats)}
            </div>
        </div>
    `;
}

/**
 * Initialiser le graphique de progression
 */
function initializeProgressionChart(firstName, lastName, driver) {
    const canvas = document.getElementById('progressionChart');
    if (!canvas || typeof Chart === 'undefined') {
        console.warn('Canvas ou Chart.js non disponible pour le graphique de progression');
        return;
    }
    
    try {
        // Utiliser ProgressionChart si disponible
        if (typeof ProgressionChart !== 'undefined') {
            const progressionChart = new ProgressionChart();
            progressionChart.init(driver.lapTimes || [], firstName, lastName, driver.cupCategory);
            window.currentProgressionChart = progressionChart;
            console.log('✅ Graphique de progression initialisé avec ProgressionChart');
        } else {
            // Fallback: créer un graphique simple avec les données du pilote
            const laps = driver.lapTimes || [];
            const validLaps = laps.filter(lap => lap.isValid || lap.isValidForBest);
            
            if (validLaps.length === 0) {
                console.warn('Aucun tour valide pour le graphique');
                return;
            }
            
            // Préparer les données pour le graphique
            const labels = validLaps.map((_, index) => `Tour ${index + 1}`);
            const data = validLaps.map(lap => lap.laptime);
            
            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${firstName} ${lastName}`,
                        data: data,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function(value) {
                                    return formatTime(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${formatTime(context.parsed.y)}`;
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Graphique de progression initialisé avec Chart.js');
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du graphique:', error);
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
