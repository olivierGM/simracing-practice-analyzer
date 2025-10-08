/**
 * DRIVER TABLE COMPONENT CONFIGURATION
 * Configuration du composant driver-table
 */

export const DRIVER_TABLE_CONFIG = {
    // Configuration des colonnes
    columns: {
        position: { label: 'Pos', sortable: true, type: 'number' },
        driverName: { label: 'Pilote', sortable: true, type: 'text' },
        cupCategory: { label: 'Catégorie', sortable: true, type: 'text' },
        bestValidTime: { label: 'Meilleur Valide', sortable: true, type: 'time' },
        averageValidTime: { label: 'Moyenne Valide', sortable: true, type: 'time' },
        bestWetTime: { label: 'Meilleur Wet', sortable: true, type: 'time' },
        averageWetTime: { label: 'Moyenne Wet', sortable: true, type: 'time' },
        totalLaps: { label: 'Total Tours', sortable: true, type: 'number' },
        validLaps: { label: 'Tours Valides', sortable: true, type: 'number' },
        wetLaps: { label: 'Tours Wet', sortable: true, type: 'number' },
        consistencyValid: { label: 'Cons. Valide', sortable: true, type: 'percentage' },
        consistencyWet: { label: 'Cons. Wet', sortable: true, type: 'percentage' },
        consistencyTotal: { label: 'Cons. Total', sortable: true, type: 'percentage' }
    },

    // Configuration des filtres
    filters: {
        groupByClass: { enabled: true, default: false },
        dateFilter: { enabled: true, options: ['all', 'week', 'day'] },
        sessionFilter: { enabled: true, default: '' }
    },

    // Configuration du tri
    sorting: {
        defaultColumn: 'bestValidTime',
        defaultDirection: 'asc'
    },

    // Configuration responsive
    responsive: {
        breakpoints: {
            mobile: 768,
            tablet: 1024
        },
        mobileColumns: ['position', 'driverName', 'bestValidTime', 'consistencyValid'],
        tabletColumns: ['position', 'driverName', 'bestValidTime', 'averageValidTime', 'consistencyValid']
    },

    // Messages et textes
    messages: {
        noData: 'Aucune donnée disponible',
        loading: 'Chargement des données...',
        error: 'Erreur lors du chargement des données',
        noResults: 'Aucun résultat trouvé pour les filtres sélectionnés'
    },

    // Configuration des styles
    styles: {
        table: {
            striped: true,
            hover: true,
            bordered: true
        },
        rows: {
            clickable: true,
            highlight: true
        }
    }
};

export default DRIVER_TABLE_CONFIG;
