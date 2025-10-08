/**
 * SEGMENT COMPARATOR COMPONENT CONFIGURATION
 * Configuration du composant segment-comparator
 */

export const SEGMENT_COMPARATOR_CONFIG = {
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

    // Configuration des comparaisons
    comparisons: {
        bestPilotVsBestGlobal: {
            title: '📊 Meilleur Pilote vs Meilleur Global',
            description: 'Compare le meilleur temps du pilote au meilleur temps global'
        },
        bestPilotVsBestClass: {
            title: '🎯 Meilleur Pilote vs Meilleur Classe',
            description: 'Compare le meilleur temps du pilote au meilleur temps de sa classe'
        },
        avgPilotVsAvgGlobal: {
            title: '📈 Moyenne Pilote vs Moyenne Global',
            description: 'Compare la moyenne du pilote à la moyenne globale'
        },
        avgPilotVsAvgClass: {
            title: '📉 Moyenne Pilote vs Moyenne Classe',
            description: 'Compare la moyenne du pilote à la moyenne de sa classe'
        }
    },

    // Configuration des couleurs
    colors: {
        positive: '#10b981', // Vert
        negative: '#ef4444', // Rouge
        neutral: '#6b7280'   // Gris
    },

    // Configuration des icônes
    icons: {
        positive: '🟢',
        medium: '🟡',
        negative: '🔴'
    },

    // Configuration responsive
    responsive: {
        breakpoints: {
            mobile: 768,
            tablet: 1024
        },
        mobileColumns: 1,
        tabletColumns: 2,
        desktopColumns: 4
    },

    // Messages et textes
    messages: {
        noData: 'Aucune donnée disponible pour la comparaison',
        loading: 'Calcul des comparaisons...',
        error: 'Erreur lors du calcul des comparaisons',
        noTrackInfo: 'Informations de piste non disponibles'
    },

    // Configuration des styles
    styles: {
        compact: true,
        showIcons: true,
        showGaps: true,
        highlightWorst: true
    }
};

export default SEGMENT_COMPARATOR_CONFIG;
