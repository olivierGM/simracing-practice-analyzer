/**
 * DRIVER TABLE COMPONENT - Logique principale
 * Composant autonome pour la gestion du tableau des pilotes
 */

import { DRIVER_TABLE_CONFIG } from './driver-table.config.js';

class DriverTable {
    constructor(config = DRIVER_TABLE_CONFIG) {
        this.config = config;
        this.container = null;
        this.table = null;
        this.currentData = null;
        this.currentSort = { column: null, direction: 'asc' };
        this.currentFilters = {
            groupByClass: false,
            session: '',
            date: 'all'
        };
        this.isInitialized = false;
    }

    /**
     * Initialiser le composant
     */
    init(containerId = 'driverStats') {
        if (this.isInitialized) {
            console.warn('DriverTable déjà initialisé');
            return;
        }

        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`❌ Conteneur ${containerId} non trouvé dans le DOM`);
            return;
        }

        this.createTable();
        this.bindEvents();
        this.isInitialized = true;
        console.log('✅ DriverTable initialisé');
    }

    /**
     * Créer le tableau
     */
    createTable() {
        const tableHTML = `
            <div class="driver-table-component">
                <!-- Filtres et contrôles -->
                <div class="table-controls">
                    <div class="filters-row">
                        <div class="filter-group">
                            <label for="groupByClassToggle">Grouper par classe:</label>
                            <input type="checkbox" id="groupByClassToggle" class="filter-checkbox">
                        </div>
                        <div class="filter-group">
                            <label for="sessionSelect">Session:</label>
                            <select id="sessionSelect" class="filter-select">
                                <option value="">Toutes les sessions</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="dateFilter">Période:</label>
                            <select id="dateFilter" class="filter-select">
                                <option value="all">Toutes les dates</option>
                                <option value="week">Cette semaine</option>
                                <option value="day">Aujourd'hui</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Statistiques par catégorie -->
                <div class="category-stats" id="categoryStats">
                    <!-- Les statistiques par catégorie seront générées ici -->
                </div>

                <!-- Tableau des pilotes -->
                <div class="table-container">
                    <table class="driver-table" id="driverTable">
                        <thead class="table-header">
                            <tr id="driverTableHeader">
                                <!-- Les en-têtes de colonnes seront générés dynamiquement -->
                            </tr>
                        </thead>
                        <tbody class="table-body" id="driverTableBody">
                            <!-- Les lignes de pilotes seront générées dynamiquement -->
                        </tbody>
                    </table>
                </div>

                <!-- Informations sur les données -->
                <div class="table-info" id="tableInfo">
                    <!-- Informations sur le nombre de pilotes, etc. -->
                </div>
            </div>
        `;
        
        this.container.innerHTML = tableHTML;
        this.table = document.getElementById('driverTable');
    }

    /**
     * Lier les événements
     */
    bindEvents() {
        // Filtres
        const groupByClassToggle = document.getElementById('groupByClassToggle');
        const sessionSelect = document.getElementById('sessionSelect');
        const dateFilter = document.getElementById('dateFilter');

        if (groupByClassToggle) {
            groupByClassToggle.addEventListener('change', (e) => {
                this.currentFilters.groupByClass = e.target.checked;
                this.applyFilters();
            });
        }

        if (sessionSelect) {
            sessionSelect.addEventListener('change', (e) => {
                this.currentFilters.session = e.target.value;
                this.applyFilters();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.currentFilters.date = e.target.value;
                this.applyFilters();
            });
        }

        // Tri des colonnes
        document.addEventListener('click', (e) => {
            if (e.target.closest('th.sortable')) {
                const th = e.target.closest('th');
                const column = th.dataset.column;
                this.sortTable(column);
            }
        });

        // Clic sur les lignes (ouverture de la modal pilote)
        document.addEventListener('click', (e) => {
            if (e.target.closest('tbody tr')) {
                const row = e.target.closest('tr');
                const pilotId = row.dataset.pilotId;
                if (pilotId && window.openPilotModal) {
                    window.openPilotModal(pilotId);
                }
            }
        });
    }

    /**
     * Mettre à jour les données
     */
    updateData(data) {
        this.currentData = data;
        this.populateSessionFilter(data);
        this.renderTable();
    }

    /**
     * Peupler le filtre de session
     */
    populateSessionFilter(data) {
        const sessionSelect = document.getElementById('sessionSelect');
        if (!sessionSelect || !data.sessions) return;

        // Vider les options existantes (garder la première)
        while (sessionSelect.children.length > 1) {
            sessionSelect.removeChild(sessionSelect.lastChild);
        }

        // Ajouter les nouvelles sessions
        data.sessions.forEach(session => {
            const option = document.createElement('option');
            option.value = session.name;
            option.textContent = session.name;
            sessionSelect.appendChild(option);
        });
    }

    /**
     * Rendre le tableau
     */
    renderTable() {
        if (!this.currentData) return;

        this.renderCategoryStats();
        this.renderTableHeader();
        this.renderTableBody();
        this.updateTableInfo();
    }

    /**
     * Rendre les statistiques par catégorie
     */
    renderCategoryStats() {
        const categoryStatsContainer = document.getElementById('categoryStats');
        if (!categoryStatsContainer) return;

        const stats = this.calculateCategoryStats();
        
        const statsHTML = `
            <h3>📊 Statistiques par Catégorie</h3>
            <div class="stats-grid">
                ${Object.entries(stats).map(([category, data]) => `
                    <div class="stat-item">
                        <h4>Catégorie ${category}</h4>
                        <div class="stat-value">
                            ${data.count} pilote${data.count > 1 ? 's' : ''} • 
                            Meilleur: ${this.formatTime(data.bestTime)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        categoryStatsContainer.innerHTML = statsHTML;
    }

    /**
     * Calculer les statistiques par catégorie
     */
    calculateCategoryStats() {
        const stats = {};
        
        Object.values(this.currentData.byDriver || {}).forEach(driver => {
            const category = driver.cupCategory;
            if (!stats[category]) {
                stats[category] = {
                    count: 0,
                    bestTime: Infinity,
                    totalLaps: 0
                };
            }
            
            stats[category].count++;
            if (driver.bestValidTime > 0 && driver.bestValidTime < stats[category].bestTime) {
                stats[category].bestTime = driver.bestValidTime;
            }
            stats[category].totalLaps += driver.totalLaps || 0;
        });
        
        return stats;
    }

    /**
     * Rendre l'en-tête du tableau
     */
    renderTableHeader() {
        const header = document.getElementById('driverTableHeader');
        if (!header) return;

        const columns = this.getVisibleColumns();
        
        const headerHTML = columns.map(column => {
            const config = this.config.columns[column];
            const sortClass = this.currentSort.column === column ? 
                `sort-${this.currentSort.direction}` : '';
            
            return `
                <th class="sortable ${sortClass}" data-column="${column}">
                    ${config.label}
                </th>
            `;
        }).join('');
        
        header.innerHTML = headerHTML;
    }

    /**
     * Obtenir les colonnes visibles
     */
    getVisibleColumns() {
        // Pour l'instant, retourner toutes les colonnes
        // Plus tard, on pourra implémenter la logique responsive
        return Object.keys(this.config.columns);
    }

    /**
     * Rendre le corps du tableau
     */
    renderTableBody() {
        const body = document.getElementById('driverTableBody');
        if (!body) return;

        const drivers = this.getFilteredDrivers();
        const sortedDrivers = this.sortDrivers(drivers);
        
        const bodyHTML = sortedDrivers.map((driver, index) => {
            const pilotId = `${driver.firstName}_${driver.lastName}_${driver.cupCategory}`;
            const position = index + 1;
            
            return this.renderDriverRow(driver, position, pilotId);
        }).join('');
        
        body.innerHTML = bodyHTML;
    }

    /**
     * Rendre une ligne de pilote
     */
    renderDriverRow(driver, position, pilotId) {
        const columns = this.getVisibleColumns();
        
        const cellHTML = columns.map(column => {
            return `<td>${this.formatCellValue(driver, column)}</td>`;
        }).join('');
        
        return `
            <tr data-pilot-id="${pilotId}">
                <td>${position}</td>
                ${cellHTML}
            </tr>
        `;
    }

    /**
     * Formater la valeur d'une cellule
     */
    formatCellValue(driver, column) {
        switch (column) {
            case 'driverName':
                return `
                    <span class="driver-name">${driver.firstName} ${driver.lastName}</span>
                `;
            case 'cupCategory':
                return `<span class="category-badge">${driver.cupCategory}</span>`;
            case 'bestValidTime':
            case 'averageValidTime':
            case 'bestWetTime':
            case 'averageWetTime':
                return `<span class="time-cell">${this.formatTime(driver[column])}</span>`;
            case 'consistencyValid':
            case 'consistencyWet':
            case 'consistencyTotal':
                return this.formatPercentage(driver[column]);
            case 'totalLaps':
            case 'validLaps':
            case 'wetLaps':
                return driver[column] || 0;
            default:
                return driver[column] || '-';
        }
    }

    /**
     * Formater un pourcentage
     */
    formatPercentage(value) {
        if (!value || value === 0) return '<span class="percentage-cell">0%</span>';
        
        const percentage = Math.round(value);
        let className = 'percentage-cell';
        
        if (percentage >= 70) className += ' high';
        else if (percentage >= 40) className += ' medium';
        else className += ' low';
        
        return `<span class="${className}">${percentage}%</span>`;
    }

    /**
     * Obtenir les pilotes filtrés
     */
    getFilteredDrivers() {
        if (!this.currentData || !this.currentData.byDriver) return [];
        
        let drivers = Object.values(this.currentData.byDriver);
        
        // Appliquer les filtres
        if (this.currentFilters.session) {
            // Filtrage par session (à implémenter selon les besoins)
        }
        
        if (this.currentFilters.date !== 'all') {
            // Filtrage par date (à implémenter selon les besoins)
        }
        
        return drivers;
    }

    /**
     * Trier les pilotes
     */
    sortDrivers(drivers) {
        if (!this.currentSort.column) return drivers;
        
        return drivers.sort((a, b) => {
            const column = this.currentSort.column;
            const direction = this.currentSort.direction;
            
            let aValue = a[column];
            let bValue = b[column];
            
            // Gestion des valeurs nulles
            if (aValue === null || aValue === undefined) aValue = 0;
            if (bValue === null || bValue === undefined) bValue = 0;
            
            // Comparaison selon le type
            const columnConfig = this.config.columns[column];
            let comparison = 0;
            
            switch (columnConfig.type) {
                case 'time':
                    comparison = aValue - bValue;
                    break;
                case 'number':
                case 'percentage':
                    comparison = aValue - bValue;
                    break;
                case 'text':
                    comparison = String(aValue).localeCompare(String(bValue));
                    break;
                default:
                    comparison = aValue - bValue;
            }
            
            return direction === 'asc' ? comparison : -comparison;
        });
    }

    /**
     * Trier le tableau
     */
    sortTable(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }
        
        this.renderTable();
    }

    /**
     * Appliquer les filtres
     */
    applyFilters() {
        this.renderTable();
    }

    /**
     * Mettre à jour les informations du tableau
     */
    updateTableInfo() {
        const tableInfo = document.getElementById('tableInfo');
        if (!tableInfo) return;
        
        const drivers = this.getFilteredDrivers();
        const totalDrivers = Object.keys(this.currentData.byDriver || {}).length;
        
        tableInfo.innerHTML = `
            Affichage de ${drivers.length} pilote${drivers.length > 1 ? 's' : ''} 
            sur ${totalDrivers} total
        `;
    }

    /**
     * Formater un temps
     */
    formatTime(timeInMs) {
        if (!timeInMs || timeInMs === 0) return '00:00:000';
        
        const minutes = Math.floor(timeInMs / 60000);
        const seconds = Math.floor((timeInMs % 60000) / 1000);
        const milliseconds = timeInMs % 1000;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
    }

    /**
     * Détruire le composant
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isInitialized = false;
    }
}

// Export pour utilisation en module
export default DriverTable;

// Export pour utilisation globale (compatibilité)
if (typeof window !== 'undefined') {
    window.DriverTable = DriverTable;
}
