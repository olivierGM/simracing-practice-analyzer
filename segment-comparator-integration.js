/**
 * SEGMENT COMPARATOR INTEGRATION - Version d'intégration directe
 * Intégration directe du composant segment-comparator avec l'architecture existante
 */

// Configuration du composant segment-comparator
const SEGMENT_COMPARATOR_CONFIG = {
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
    comparisons: {
        bestPilotVsBestGlobal: {
            title: '📊 Meilleur Pilote vs Meilleur Global'
        },
        bestPilotVsBestClass: {
            title: '🎯 Meilleur Pilote vs Meilleur Classe'
        },
        avgPilotVsAvgGlobal: {
            title: '📈 Moyenne Pilote vs Moyenne Global'
        },
        avgPilotVsAvgClass: {
            title: '📉 Moyenne Pilote vs Moyenne Classe'
        }
    },
    icons: {
        positive: '🟢',
        medium: '🟡',
        negative: '🔴'
    }
};

// Variables globales
let segmentComparatorInitialized = false;

/**
 * Initialiser le composant segment-comparator
 */
function initSegmentComparator() {
    if (segmentComparatorInitialized) {
        console.log('✅ Composant segment-comparator déjà initialisé');
        return;
    }
    
    console.log('🚀 Initialisation du composant segment-comparator...');
    
    // Remplacer la fonction de génération du comparateur
    window.generateSegmentComparator = function(pilotSegmentStats, globalSegmentStats, cupCategory, trackName) {
        return generateSegmentComparatorWithComponent(pilotSegmentStats, globalSegmentStats, cupCategory, trackName);
    };
    
    segmentComparatorInitialized = true;
    console.log('✅ Composant segment-comparator initialisé avec succès');
}

/**
 * Générer le comparateur de segments avec le composant
 */
function generateSegmentComparatorWithComponent(pilotStats, globalStats, cupCategory, trackName) {
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
        <div class="segment-comparator-component">
            <!-- En-tête du comparateur -->
            <div class="segment-header">
                <div class="segment-title-row">
                    <h3>🏁 Comparateur de Segments${infoButton}</h3>
                </div>
                <div class="segment-focus-hint">
                    💡 Focus sur <strong>${worstSegment.toUpperCase()}</strong> pour +${formatSegmentTime(avgPilotVsAvgGlobal[worstSegment])}s de gain
                </div>
            </div>

            <!-- Grille des comparaisons -->
            <div class="segment-grid">
                ${generateComparisonSection(
                    SEGMENT_COMPARATOR_CONFIG.comparisons.bestPilotVsBestGlobal.title,
                    pilotStats.best, 
                    { s1: globalSegmentStats.bestS1, s2: globalSegmentStats.bestS2, s3: globalSegmentStats.bestS3 },
                    bestPilotVsBestGlobal
                )}
                ${generateComparisonSection(
                    SEGMENT_COMPARATOR_CONFIG.comparisons.bestPilotVsBestClass.title,
                    pilotStats.best, 
                    { s1: classStats.bestS1, s2: classStats.bestS2, s3: classStats.bestS3 },
                    bestPilotVsBestClass
                )}
                ${generateComparisonSection(
                    SEGMENT_COMPARATOR_CONFIG.comparisons.avgPilotVsAvgGlobal.title,
                    pilotStats.average, 
                    { s1: globalSegmentStats.avgS1, s2: globalSegmentStats.avgS2, s3: globalSegmentStats.avgS3 },
                    avgPilotVsAvgGlobal
                )}
                ${generateComparisonSection(
                    SEGMENT_COMPARATOR_CONFIG.comparisons.avgPilotVsAvgClass.title,
                    pilotStats.average, 
                    { s1: classStats.avgS1, s2: classStats.avgS2, s3: classStats.avgS3 },
                    avgPilotVsAvgClass
                )}
            </div>

            <!-- Informations sur les segments -->
            <div class="segment-info-section">
                ${generateSegmentInfo(trackName)}
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
 * Générer les informations sur les segments
 */
function generateSegmentInfo(trackName) {
    if (!trackName) return '';
    
    const trackInfo = SEGMENT_COMPARATOR_CONFIG.trackSegmentInfo[trackName];
    if (!trackInfo) {
        return `
            <h4>Informations sur les segments</h4>
            <div class="segment-info-item">
                Informations non disponibles pour la piste: ${trackName}
            </div>
        `;
    }

    return `
        <h4>Informations sur les segments - ${trackName}</h4>
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
    if (gap <= 0) return SEGMENT_COMPARATOR_CONFIG.icons.positive;
    if (gap <= 0.5) return SEGMENT_COMPARATOR_CONFIG.icons.medium;
    return SEGMENT_COMPARATOR_CONFIG.icons.negative;
}

// Initialiser le composant quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initSegmentComparator();
    }, 1000);
});

// Fonction de vérification de disponibilité
function isSegmentComparatorAvailable() {
    return segmentComparatorInitialized;
}
