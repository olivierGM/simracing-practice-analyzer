/**
 * DRIVER TABLE INTEGRATION - Version d'intégration directe
 * Intégration directe du composant driver-table avec l'architecture existante
 */

// Configuration du composant driver-table
const DRIVER_TABLE_CONFIG = {
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
    messages: {
        noData: 'Aucune donnée disponible',
        loading: 'Chargement des données...'
    }
};

// Variables globales
let driverTableInitialized = false;

/**
 * Initialiser le composant driver-table
 */
function initDriverTable() {
    if (driverTableInitialized) {
        console.log('✅ Composant driver-table déjà initialisé');
        return;
    }
    
    console.log('🚀 Initialisation du composant driver-table...');
    
    // Remplacer les fonctions globales existantes
    window.displayDriverStatsAll = function(data) {
        displayDriverStatsWithComponent(data, false);
    };
    
    window.displayDriverStatsByCategory = function(data) {
        displayDriverStatsWithComponent(data, true);
    };
    
    driverTableInitialized = true;
    console.log('✅ Composant driver-table initialisé avec succès');
}

/**
 * Afficher les statistiques des pilotes avec le composant
 */
function displayDriverStatsWithComponent(data, groupByClass = false) {
    const container = document.getElementById('driverStats');
    if (!container) {
        console.error('❌ Conteneur driverStats non trouvé');
        return;
    }
    
    // Générer le HTML du composant driver-table
    const tableHTML = `
        <div class="driver-table-component">
            <!-- Filtres et contrôles -->
            <div class="table-controls">
                <div class="filters-row">
                    <div class="filter-group">
                        <label for="groupByClassToggle">Grouper par classe:</label>
                        <input type="checkbox" id="groupByClassToggle" class="filter-checkbox" ${groupByClass ? 'checked' : ''}>
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
                ${generateCategoryStats(data)}
            </div>

            <!-- Tableau des pilotes -->
            <div class="table-container">
                <table class="driver-table" id="driverTable">
                    <thead class="table-header">
                        ${generateTableHeader()}
                    </thead>
                    <tbody class="table-body" id="driverTableBody">
                        ${generateTableBody(data, groupByClass)}
                    </tbody>
                </table>
            </div>

            <!-- Informations sur les données -->
            <div class="table-info" id="tableInfo">
                ${generateTableInfo(data)}
            </div>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    
    // Lier les événements
    bindDriverTableEvents();
    
    console.log('✅ Tableau des pilotes généré avec le composant');
}

/**
 * Générer les statistiques par catégorie
 */
function generateCategoryStats(data) {
    if (!data || !data.byDriver) return '<p>Aucune donnée disponible</p>';
    
    const stats = {};
    
    Object.values(data.byDriver).forEach(driver => {
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
    
    const statsHTML = Object.entries(stats).map(([category, data]) => `
        <div class="stat-item">
            <h4>Catégorie ${category}</h4>
            <div class="stat-value">
                ${data.count} pilote${data.count > 1 ? 's' : ''} • 
                Meilleur: ${formatTime(data.bestTime)}
            </div>
        </div>
    `).join('');
    
    return `
        <h3>📊 Statistiques par Catégorie</h3>
        <div class="stats-grid">
            ${statsHTML}
        </div>
    `;
}

/**
 * Générer l'en-tête du tableau
 */
function generateTableHeader() {
    const columns = Object.keys(DRIVER_TABLE_CONFIG.columns);
    
    const headerHTML = columns.map(column => {
        const config = DRIVER_TABLE_CONFIG.columns[column];
        return `<th class="sortable" data-column="${column}">${config.label}</th>`;
    }).join('');
    
    return `<tr><th>Pos</th>${headerHTML}</tr>`;
}

/**
 * Générer le corps du tableau
 */
function generateTableBody(data, groupByClass = false) {
    if (!data || !data.byDriver) return '';
    
    let drivers = Object.values(data.byDriver);
    
    // Trier par meilleur temps valide
    drivers = drivers.sort((a, b) => {
        const aTime = a.bestValidTime || Infinity;
        const bTime = b.bestValidTime || Infinity;
        return aTime - bTime;
    });
    
    // Grouper par classe si demandé
    if (groupByClass) {
        const groupedDrivers = {};
        drivers.forEach(driver => {
            const category = driver.cupCategory;
            if (!groupedDrivers[category]) {
                groupedDrivers[category] = [];
            }
            groupedDrivers[category].push(driver);
        });
        
        let bodyHTML = '';
        Object.entries(groupedDrivers).forEach(([category, categoryDrivers]) => {
            bodyHTML += generateCategorySection(category, categoryDrivers);
        });
        return bodyHTML;
    } else {
        return generateDriversRows(drivers);
    }
}

/**
 * Générer une section de catégorie
 */
function generateCategorySection(category, drivers) {
    const categoryHeader = `
        <tr class="category-header">
            <td colspan="14" class="category-title">Catégorie ${category} (${drivers.length} pilote${drivers.length > 1 ? 's' : ''})</td>
        </tr>
    `;
    
    const driversRows = generateDriversRows(drivers, 1);
    
    return categoryHeader + driversRows;
}

/**
 * Générer les lignes des pilotes
 */
function generateDriversRows(drivers, startPosition = 1) {
    return drivers.map((driver, index) => {
        const position = startPosition + index;
        const pilotId = `${driver.firstName}_${driver.lastName}_${driver.cupCategory}`;
        
        return generateDriverRow(driver, position, pilotId);
    }).join('');
}

/**
 * Générer une ligne de pilote
 */
function generateDriverRow(driver, position, pilotId) {
    const columns = Object.keys(DRIVER_TABLE_CONFIG.columns);
    
    const cellHTML = columns.map(column => {
        return `<td>${formatCellValue(driver, column)}</td>`;
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
function formatCellValue(driver, column) {
    switch (column) {
        case 'driverName':
            return `<span class="driver-name">${driver.firstName} ${driver.lastName}</span>`;
        case 'cupCategory':
            return `<span class="category-badge">${driver.cupCategory}</span>`;
        case 'bestValidTime':
        case 'averageValidTime':
        case 'bestWetTime':
        case 'averageWetTime':
            return `<span class="time-cell">${formatTime(driver[column])}</span>`;
        case 'consistencyValid':
        case 'consistencyWet':
        case 'consistencyTotal':
            return formatPercentage(driver[column]);
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
function formatPercentage(value) {
    if (!value || value === 0) return '<span class="percentage-cell">0%</span>';
    
    const percentage = Math.round(value);
    let className = 'percentage-cell';
    
    if (percentage >= 70) className += ' high';
    else if (percentage >= 40) className += ' medium';
    else className += ' low';
    
    return `<span class="${className}">${percentage}%</span>`;
}

/**
 * Générer les informations du tableau
 */
function generateTableInfo(data) {
    if (!data || !data.byDriver) return 'Aucune donnée disponible';
    
    const driverCount = Object.keys(data.byDriver).length;
    return `Affichage de ${driverCount} pilote${driverCount > 1 ? 's' : ''}`;
}

/**
 * Lier les événements du tableau
 */
function bindDriverTableEvents() {
    // Tri des colonnes
    document.addEventListener('click', (e) => {
        if (e.target.closest('th.sortable')) {
            const th = e.target.closest('th');
            const column = th.dataset.column;
            if (column) {
                sortDriverTable(column);
            }
        }
    });
    
    // Clic sur les lignes (ouverture de la modal pilote)
    document.addEventListener('click', (e) => {
        if (e.target.closest('tbody tr') && !e.target.closest('th')) {
            const row = e.target.closest('tr');
            const pilotId = row.dataset.pilotId;
            if (pilotId && window.openPilotModal) {
                window.openPilotModal(pilotId);
            }
        }
    });
    
    // Filtres
    const groupByClassToggle = document.getElementById('groupByClassToggle');
    if (groupByClassToggle) {
        groupByClassToggle.addEventListener('change', (e) => {
            const data = getFilteredData();
            if (data) {
                displayDriverStatsWithComponent(data, e.target.checked);
            }
        });
    }
}

/**
 * Trier le tableau des pilotes
 */
function sortDriverTable(column) {
    const data = getFilteredData();
    if (!data) return;
    
    const tbody = document.getElementById('driverTableBody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Exclure les en-têtes de catégorie
    const dataRows = rows.filter(row => !row.classList.contains('category-header'));
    
    const sortedRows = dataRows.sort((a, b) => {
        const aValue = getCellValue(a, column);
        const bValue = getCellValue(b, column);
        
        const columnConfig = DRIVER_TABLE_CONFIG.columns[column];
        
        switch (columnConfig.type) {
            case 'time':
            case 'number':
            case 'percentage':
                return aValue - bValue;
            case 'text':
                return String(aValue).localeCompare(String(bValue));
            default:
                return aValue - bValue;
        }
    });
    
    // Reconstruire le tableau
    const categoryRows = rows.filter(row => row.classList.contains('category-header'));
    const newRows = [...categoryRows, ...sortedRows];
    
    tbody.innerHTML = newRows.map(row => row.outerHTML).join('');
}

/**
 * Obtenir la valeur d'une cellule
 */
function getCellValue(row, column) {
    const columns = Object.keys(DRIVER_TABLE_CONFIG.columns);
    const columnIndex = columns.indexOf(column) + 1; // +1 car on a la colonne position
    const cell = row.children[columnIndex];
    
    if (!cell) return 0;
    
    const columnConfig = DRIVER_TABLE_CONFIG.columns[column];
    
    switch (columnConfig.type) {
        case 'time':
            return parseTime(cell.textContent);
        case 'number':
        case 'percentage':
            return parseFloat(cell.textContent) || 0;
        case 'text':
            return cell.textContent;
        default:
            return cell.textContent;
    }
}

/**
 * Parser un temps
 */
function parseTime(timeStr) {
    if (!timeStr || timeStr === '00:00:000') return 0;
    
    const parts = timeStr.split(':');
    if (parts.length !== 3) return 0;
    
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    const milliseconds = parseInt(parts[2]) || 0;
    
    return minutes * 60000 + seconds * 1000 + milliseconds;
}

/**
 * Formater un temps
 */
function formatTime(timeInMs) {
    if (!timeInMs || timeInMs === 0) return '00:00:000';
    
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const milliseconds = timeInMs % 1000;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}

// Initialiser le composant quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initDriverTable();
    }, 1000);
});

// Fonction de vérification de disponibilité
function isDriverTableAvailable() {
    return driverTableInitialized;
}
