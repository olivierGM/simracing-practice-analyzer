/**
 * CONFIGURATION DU COMPOSANT PILOT CARD
 * Contient toutes les configurations spécifiques au composant
 */

export const PILOT_CARD_CONFIG = {
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

    // Configuration des styles
    styles: {
        modal: {
            fullscreen: true,
            zIndex: 1000
        },
        chart: {
            height: '400px',
            responsive: true
        },
        segmentComparator: {
            columns: 4,
            compactMode: true
        }
    },

    // Configuration des calculs
    calculations: {
        consistency: {
            formula: 'Math.max(0, Math.min(100, (1 - coefficientOfVariation * 2) * 100))'
        },
        segmentStats: {
            minLapsForStats: 1
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

export default PILOT_CARD_CONFIG;
