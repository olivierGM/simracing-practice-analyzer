/**
 * PILOT MODAL - Gestion complète de la modal des détails pilote
 * Fichier séparé pour faciliter la maintenance et la compréhension
 */

// Variables globales pour la modal
let pilotModal = null;

/**
 * Initialisation de la modal pilote
 */
function initPilotModal() {
    pilotModal = document.getElementById('pilotModal');
    if (!pilotModal) {
        console.error('❌ Modal pilote non trouvée dans le DOM');
        return;
    }
}

/**
 * Ouvrir la modal avec les détails du pilote
 * @param {string} pilotId - ID du pilote (format: firstName_lastName_cupCategory)
 */
window.openPilotModal = function(pilotId) {
    if (!pilotModal) {
        console.error('❌ Modal pilote non initialisée');
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
        alert('Pilote non trouvé');
        return;
    }
    
    // Calculer les statistiques
    const stats = calculatePilotStats(driver, firstName, lastName, cupCategory, byDriver);
    
    // Mettre à jour le header
    updatePilotHeader(firstName, lastName, cupCategory, stats);
    
    // Générer le contenu de la modal
    generatePilotContent(driver, stats, firstName, lastName, cupCategory);
    
    // Afficher la modal
    pilotModal.style.display = 'block';
}

/**
 * Récupérer tous les laps d'un pilote depuis toutes les sessions
 */
function getAllPilotLaps(firstName, lastName, cupCategory) {
    const sessionData = getFilteredData().sessionData || [];
    const allLaps = [];
    
    
    sessionData.forEach((session, sessionIndex) => {
        
        if (session.laps && Array.isArray(session.laps)) {
            // Trouver le carId du pilote dans cette session
            let pilotCarId = null;
            
            if (session.sessionResult && session.sessionResult.leaderBoardLines) {
                const pilotLine = session.sessionResult.leaderBoardLines.find(line => 
                    line.car && line.car.drivers && line.car.drivers.some(driver => 
                        driver.firstName === firstName && 
                        driver.lastName === lastName &&
                        line.car.cupCategory === parseInt(cupCategory)
                    )
                );
                
                if (pilotLine) {
                    pilotCarId = pilotLine.car.carId;
                }
            }
            
            // Si on a trouvé le carId, récupérer tous les laps de cette voiture
            if (pilotCarId) {
                const pilotLaps = session.laps.filter(lap => lap.carId === pilotCarId);
                
                // Ajouter les métadonnées de session à chaque lap
                pilotLaps.forEach(lap => {
                    allLaps.push({
                        ...lap,
                        sessionDate: session.fileName,
                        trackName: session.trackName || 'Unknown',
                        sessionType: session.sessionType || 'Unknown',
                        isWetSession: session.sessionResult?.isWetSession === true || 
                                     session.sessionResult?.isWetSession === 1 || 
                                     session.sessionResult?.isWetSession === "1" ||
                                     session.isWetSession === true || 
                                     session.isWetSession === 1 || 
                                     session.isWetSession === "1"
                    });
                });
            }
        }
    });
    
    // Trier par date de session puis par ordre dans la session
    allLaps.sort((a, b) => {
        if (a.sessionDate !== b.sessionDate) {
            return a.sessionDate.localeCompare(b.sessionDate);
        }
        return 0; // Garder l'ordre original dans la session
    });
    
    return allLaps;
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
    
    
    return {
        totalLaps,
        validLaps,
        wetLaps,
        categoryPosition,
        categoryDrivers: categoryDrivers.length,
        gapToLeader
    };
}

/**
 * Mettre à jour le header de la modal
 */
function updatePilotHeader(firstName, lastName, cupCategory, stats) {
    const pilotName = document.getElementById('pilotName');
    const pilotCategory = document.getElementById('pilotCategory');
    const pilotPosition = document.getElementById('pilotPosition');
    
    
    if (pilotName) pilotName.textContent = `${firstName} ${lastName}`;
    if (pilotCategory) {
        pilotCategory.textContent = getCategoryName(parseInt(cupCategory));
        pilotCategory.className = `category-badge ${getCategoryClass(parseInt(cupCategory))}`;
    }
    if (pilotPosition) {
        pilotPosition.textContent = `#${stats.categoryPosition}/${stats.categoryDrivers}`;
    }
}

/**
 * Générer le contenu principal de la modal
 */
function generatePilotContent(driver, stats, firstName, lastName, cupCategory) {
    const modalBody = pilotModal.querySelector('.modal-body');
    if (!modalBody) {
        console.error('❌ Modal body non trouvé');
        return;
    }
    
    modalBody.innerHTML = `
        <div class="pilot-info-section">
            <h3>📊 Informations du Pilote</h3>
            <div class="pilot-info-grid">
                <div class="pilot-info-item">
                    <span class="pilot-info-label">Total tours:</span>
                    <span class="pilot-info-value">${stats.totalLaps}</span>
                </div>
                <div class="pilot-info-item">
                    <span class="pilot-info-label">Tours valides:</span>
                    <span class="pilot-info-value">${stats.validLaps}</span>
                </div>
                <div class="pilot-info-item">
                    <span class="pilot-info-label">Tours wet:</span>
                    <span class="pilot-info-value">${stats.wetLaps}</span>
                </div>
                <div class="pilot-info-item">
                    <span class="pilot-info-label">Meilleur temps:</span>
                    <span class="pilot-info-value">${formatTime(driver.bestValidTime || 0)}</span>
                </div>
                <div class="pilot-info-item">
                    <span class="pilot-info-label">Moyenne:</span>
                    <span class="pilot-info-value">${formatTime(driver.averageValidTime || 0)}</span>
                </div>
                <div class="pilot-info-item">
                    <span class="pilot-info-label">Écart au leader:</span>
                    <span class="pilot-info-value">${formatTime(stats.gapToLeader)}</span>
                </div>
                ${generateConsistencyCard(driver, firstName, lastName, cupCategory)}
                ${generateCoefficientCard(driver, firstName, lastName, cupCategory)}
            </div>
        </div>
        
        <!-- Layout en deux colonnes -->
        <div class="modal-content-layout">
            <div class="modal-column-left">
                ${generateLapsSection(driver, firstName, lastName, cupCategory)}
            </div>
            <div class="modal-column-right">
                ${generateProgressionChartSection(driver, firstName, lastName, cupCategory)}
            </div>
        </div>
    `;
    
    // Initialiser le graphique de progression après le rendu
    setTimeout(() => {
        initializeProgressionChart(driver, firstName, lastName, cupCategory);
    }, 100);
}

/**
 * Générer la section des tours
 */
function generateLapsSection(driver, firstName, lastName, cupCategory) {
    // Récupérer les vrais tours avec splits depuis les sessions
    const allLaps = getAllPilotLaps(firstName, lastName, cupCategory);
    
    if (allLaps.length === 0) {
        // Fallback: utiliser les lapTimes du driver si aucun lap n'est trouvé dans les sessions
        const driverLaps = driver.lapTimes || [];
        
        if (driverLaps.length === 0) {
            return '<div class="laps-section"><h3>🏁 Détail des Tours</h3><p>Aucun tour disponible</p></div>';
        }
        
        // Utiliser les lapTimes du driver comme fallback
        return `
            <div class="laps-section">
                <h3>🏁 Détail des Tours (${driverLaps.length} tours) - Données limitées</h3>
                <div class="laps-header">
                    <div class="lap-header-item sortable" onclick="sortLapsTable('lapNumber', this)">
                        Tour <span class="sort-indicator">↕️</span>
                    </div>
                    <div class="lap-header-item sortable" onclick="sortLapsTable('datetime', this)">
                        Date/Heure <span class="sort-indicator">↕️</span>
                    </div>
                    <div class="lap-header-item sortable" onclick="sortLapsTable('split1', this)">
                        S1 <span class="sort-indicator">↕️</span>
                    </div>
                    <div class="lap-header-item sortable" onclick="sortLapsTable('split2', this)">
                        S2 <span class="sort-indicator">↕️</span>
                    </div>
                    <div class="lap-header-item sortable" onclick="sortLapsTable('split3', this)">
                        S3 <span class="sort-indicator">↕️</span>
                    </div>
                    <div class="lap-header-item sortable" onclick="sortLapsTable('total', this)">
                        Total <span class="sort-indicator">↕️</span>
                    </div>
                    <div class="lap-header-item sortable" onclick="sortLapsTable('valid', this)">
                        Valide <span class="sort-indicator">↕️</span>
                    </div>
                    <div class="lap-header-item sortable" onclick="sortLapsTable('wet', this)">
                        Wet <span class="sort-indicator">↕️</span>
                    </div>
                </div>
                <div class="laps-list" id="lapsList">
                    ${(() => {
                        const bestTimes = calculateBestTimes(driverLaps);
                        return driverLaps.map((lap, index) => generateLapItem(lap, index, bestTimes)).join('');
                    })()}
                </div>
            </div>
        `;
    }
    
    return `
        <div class="laps-section">
            <h3>🏁 Détail des Tours (${allLaps.length} tours)</h3>
            <div class="laps-header">
                <div class="lap-header-item sortable" onclick="sortLapsTable('lapNumber', this)">
                    Tour <span class="sort-indicator">↕️</span>
                </div>
                <div class="lap-header-item sortable" onclick="sortLapsTable('datetime', this)">
                    Date/Heure <span class="sort-indicator">↕️</span>
                </div>
                <div class="lap-header-item sortable" onclick="sortLapsTable('split1', this)">
                    S1 <span class="sort-indicator">↕️</span>
                </div>
                <div class="lap-header-item sortable" onclick="sortLapsTable('split2', this)">
                    S2 <span class="sort-indicator">↕️</span>
                </div>
                <div class="lap-header-item sortable" onclick="sortLapsTable('split3', this)">
                    S3 <span class="sort-indicator">↕️</span>
                </div>
                <div class="lap-header-item sortable" onclick="sortLapsTable('total', this)">
                    Total <span class="sort-indicator">↕️</span>
                </div>
                <div class="lap-header-item sortable" onclick="sortLapsTable('valid', this)">
                    Valide <span class="sort-indicator">↕️</span>
                </div>
                <div class="lap-header-item sortable" onclick="sortLapsTable('wet', this)">
                    Wet <span class="sort-indicator">↕️</span>
                </div>
            </div>
            <div class="laps-list" id="lapsList">
                ${(() => {
                    const bestTimes = calculateBestTimes(allLaps);
                    return allLaps.map((lap, index) => generateLapItem(lap, index, bestTimes)).join('');
                })()}
            </div>
        </div>
    `;
}

/**
 * Calculer les meilleurs temps pour tous les tours
 */
function calculateBestTimes(allLaps) {
    let bestSplit1 = Infinity;
    let bestSplit2 = Infinity;
    let bestSplit3 = Infinity;
    let bestTotal = Infinity;
    
    allLaps.forEach(lap => {
        const splits = lap.splits || [];
        const lapTime = lap.laptime || lap.time || 0;
        
        // Meilleurs temps par secteur
        if (splits[0] && splits[0] > 0) bestSplit1 = Math.min(bestSplit1, splits[0]);
        if (splits[1] && splits[1] > 0) bestSplit2 = Math.min(bestSplit2, splits[1]);
        if (splits[2] && splits[2] > 0) bestSplit3 = Math.min(bestSplit3, splits[2]);
        
        // Meilleur temps total
        if (lapTime > 0) bestTotal = Math.min(bestTotal, lapTime);
    });
    
    return {
        split1: bestSplit1 === Infinity ? 0 : bestSplit1,
        split2: bestSplit2 === Infinity ? 0 : bestSplit2,
        split3: bestSplit3 === Infinity ? 0 : bestSplit3,
        total: bestTotal === Infinity ? 0 : bestTotal
    };
}

/**
 * Générer un item de tour individuel
 */
function generateLapItem(lap, index, bestTimes = null) {
    
    const splits = lap.splits || [];
    const statusIcons = generateStatusIcons(lap);
    
    // Utiliser les métadonnées de session ajoutées par getAllPilotLaps
    const dateTimeString = lap.sessionDate ? formatSessionDateTime(lap.sessionDate) : '--/--/-- --:--';
    const trackName = lap.trackName || 'Session';
    
    // Données pour le tri
    const lapTime = lap.laptime || lap.time || 0;
    const isValid = lap.isValidForBest !== false;
    const isWet = lap.isWetSession || lap.sessionWet || false;
    
    // Créer un timestamp pour le tri par date/heure
    let dateTimeSort = 0;
    if (lap.sessionDate) {
        const match = lap.sessionDate.match(/(\d{6})_(\d{6})/);
        if (match) {
            const dateStr = match[1];
            const timeStr = match[2];
            const year = 2000 + parseInt(dateStr.substring(0, 2));
            const month = parseInt(dateStr.substring(2, 4)) - 1;
            const day = parseInt(dateStr.substring(4, 6));
            const hour = parseInt(timeStr.substring(0, 2));
            const minute = parseInt(timeStr.substring(2, 4));
            const second = parseInt(timeStr.substring(4, 6));
            dateTimeSort = new Date(year, month, day, hour, minute, second).getTime();
        }
    }
    
    return `
        <div class="lap-item" 
             data-lap-number="${index + 1}"
             data-datetime="${dateTimeSort}"
             data-total-time="${lapTime}"
             data-is-valid="${isValid}"
             data-is-wet="${isWet}">
            <div class="lap-number">${index + 1}</div>
            <div class="lap-datetime">${dateTimeString}</div>
            <div class="lap-split-1 ${bestTimes && splits[0] === bestTimes.split1 ? 'best-time' : ''}" data-split1-time="${splits[0] || 0}">${splits[0] ? formatTime(splits[0]) : '-'}</div>
            <div class="lap-split-2 ${bestTimes && splits[1] === bestTimes.split2 ? 'best-time' : ''}" data-split2-time="${splits[1] || 0}">${splits[1] ? formatTime(splits[1]) : '-'}</div>
            <div class="lap-split-3 ${bestTimes && splits[2] === bestTimes.split3 ? 'best-time' : ''}" data-split3-time="${splits[2] || 0}">${splits[2] ? formatTime(splits[2]) : '-'}</div>
            <div class="lap-total ${bestTimes && lapTime === bestTimes.total ? 'best-time' : ''}">${formatTime(lapTime)}</div>
            <div class="lap-valid">${isValid ? '✅' : '❌'}</div>
            <div class="lap-wet">${isWet ? '🌧️' : '☀️'}</div>
        </div>
    `;
}

/**
 * Générer les icônes de statut
 */
function generateStatusIcons(lap) {
    const statusIcons = [];
    
    // Utiliser les bonnes propriétés selon la structure des données
    if (lap.isValidForBest !== false) { // Par défaut valide si pas spécifié
        statusIcons.push('<span class="status-icon status-valid">✅</span>');
    } else {
        statusIcons.push('<span class="status-icon status-invalid">❌</span>');
    }
    
    // Vérifier si la session était wet (utiliser les métadonnées ajoutées par getAllPilotLaps)
    if (lap.isWetSession || lap.sessionWet) {
        statusIcons.push('<span class="status-icon status-wet">🌧️</span>');
    }
    
    return statusIcons;
}

/**
 * Formater la date/heure de session
 */
function formatSessionDateTime(fileName) {
    if (!fileName) return '--/--/-- --:--';
    
    // Extraire la date/heure du nom de fichier (format: YYMMDD_HHMMSS)
    const match = fileName.match(/(\d{6})_(\d{6})/);
    if (match) {
        const dateStr = match[1];
        const timeStr = match[2];
        const year = 2000 + parseInt(dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4)) - 1;
        const day = parseInt(dateStr.substring(4, 6));
        const hour = parseInt(timeStr.substring(0, 2));
        const minute = parseInt(timeStr.substring(2, 4));
        const second = parseInt(timeStr.substring(4, 6));
        
        const sessionDate = new Date(year, month, day, hour, minute, second);
        
        return sessionDate.toLocaleString('fr-FR', { 
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
    
    return fileName; // Retourner le nom de fichier si le format n'est pas reconnu
}

/**
 * Générer l'affichage des segments
 */
function generateSplitsDisplay(splits) {
    
    if (!splits || splits.length === 0) {
        return '<span class="split-time">-</span>';
    }
    
    return splits.map((split, splitIndex) => `
        <div class="split-container">
            <span class="split-label">S${splitIndex + 1}:</span>
            <span class="split-time">${formatTime(split)}</span>
        </div>
    `).join('');
}

/**
 * Fermer la modal pilote
 */
window.closePilotModal = function() {
    if (pilotModal) {
        pilotModal.style.display = 'none';
        
        // Restaurer le scroll du body
        document.body.classList.remove('modal-open');
    }
}

/**
 * Générer la carte d'analyse de consistance
 */
function generateConsistencyCard(driver, firstName, lastName, cupCategory) {
    // Récupérer tous les laps du pilote
    const allLaps = getAllPilotLaps(firstName, lastName, cupCategory);
    const lapTimes = allLaps.map(lap => lap.laptime || lap.time || 0).filter(time => time > 0);
    
    if (lapTimes.length === 0) {
        return `
            <div class="pilot-info-item">
                <span class="pilot-info-label">
                    Consistance
                    <span class="info-icon" onclick="showConsistencyInfo(event)">ℹ️</span>
                </span>
                <span class="pilot-info-value">N/A</span>
            </div>
        `;
    }
    
    // Calculer les statistiques de consistance
    const consistencyStats = window.consistencyAnalyzer.calculateConsistency(lapTimes);
    const scoreClass = window.consistencyAnalyzer.getScoreClass(consistencyStats.score);
    const consistencyIcon = window.consistencyAnalyzer.getConsistencyIcon(consistencyStats.score);
    
    return `
        <div class="pilot-info-item">
            <span class="pilot-info-label">
                Consistance
                <span class="info-icon" onclick="showConsistencyInfo(event)">ℹ️</span>
            </span>
            <span class="pilot-info-value ${scoreClass}">${consistencyIcon} ${consistencyStats.score}%</span>
        </div>
    `;
}

/**
 * Générer la carte du coefficient de variation
 */
function generateCoefficientCard(driver, firstName, lastName, cupCategory) {
    // Récupérer tous les laps du pilote
    const allLaps = getAllPilotLaps(firstName, lastName, cupCategory);
    const lapTimes = allLaps.map(lap => lap.laptime || lap.time || 0).filter(time => time > 0);
    
    if (lapTimes.length === 0) {
        return `
            <div class="pilot-info-item">
                <span class="pilot-info-label">
                    Variabilité
                    <span class="info-icon" onclick="showConsistencyInfo(event)">ℹ️</span>
                </span>
                <span class="pilot-info-value">N/A</span>
            </div>
        `;
    }
    
    // Calculer les statistiques de consistance
    const consistencyStats = window.consistencyAnalyzer.calculateConsistency(lapTimes);
    const cvClass = getCVClass(consistencyStats.coefficient);
    const cvIcon = getCVIcon(consistencyStats.coefficient);
    
    return `
        <div class="pilot-info-item">
            <span class="pilot-info-label">
                Variabilité
                <span class="info-icon" onclick="showConsistencyInfo(event)">ℹ️</span>
            </span>
            <span class="pilot-info-value ${cvClass}">${cvIcon} ${consistencyStats.coefficient}%</span>
        </div>
    `;
}

/**
 * Obtenir la classe CSS pour le coefficient de variation
 */
function getCVClass(coefficient) {
    if (coefficient < 2) return 'excellent';
    if (coefficient < 5) return 'good';
    if (coefficient < 10) return 'average';
    return 'poor';
}

/**
 * Obtenir l'icône pour le coefficient de variation
 */
function getCVIcon(coefficient) {
    if (coefficient < 2) return '🎯'; // Très consistant
    if (coefficient < 5) return '📊'; // Consistant
    if (coefficient < 10) return '📈'; // Variable
    return '⚠️'; // Très variable
}

/**
 * Afficher la popup d'information sur la consistance
 */
function showConsistencyInfo(event) {
    event.stopPropagation();
    
    // Créer la popup d'information
    const popup = document.createElement('div');
    popup.className = 'consistency-info-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h4>📊 Analyse de Consistance</h4>
                <button class="popup-close" onclick="closeConsistencyInfo()">×</button>
            </div>
            <div class="popup-body">
                <div class="info-section">
                    <h5>🎯 Score de Consistance (0-100%)</h5>
                    <p>Plus le score est élevé, plus le pilote est consistant dans ses temps de tour.</p>
                    <ul>
                        <li><span class="score-excellent">🏆 80-100%</span> : Excellent (très consistant)</li>
                        <li><span class="score-good">⭐ 60-79%</span> : Bon (assez consistant)</li>
                        <li><span class="score-average">📊 40-59%</span> : Moyen (variable)</li>
                        <li><span class="score-poor">⚠️ 0-39%</span> : Faible (peu consistant)</li>
                    </ul>
                </div>
                <div class="info-section">
                    <h5>📈 Coefficient de Variation (CV)</h5>
                    <p>Mesure la variabilité relative des temps. Plus le CV est bas, plus le pilote est consistant.</p>
                    <ul>
                        <li><strong>CV < 2%</strong> : Très consistant</li>
                        <li><strong>CV 2-5%</strong> : Consistant</li>
                        <li><strong>CV 5-10%</strong> : Variable</li>
                        <li><strong>CV > 10%</strong> : Très variable</li>
                    </ul>
                </div>
                <div class="info-section">
                    <h5>🧮 Calcul</h5>
                    <p>Le score est calculé comme : <code>100 - (CV × 2)</code></p>
                    <p>Le CV est : <code>(Écart-type ÷ Moyenne) × 100</code></p>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter au body
    document.body.appendChild(popup);
    
    // Animation d'apparition
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);
}

/**
 * Fermer la popup d'information
 */
function closeConsistencyInfo() {
    const popup = document.querySelector('.consistency-info-popup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
}

// Fermer la popup en cliquant à l'extérieur
document.addEventListener('click', function(event) {
    const popup = document.querySelector('.consistency-info-popup');
    if (popup && !popup.contains(event.target)) {
        closeConsistencyInfo();
    }
});

// Initialiser la modal au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initPilotModal();
    
});

// Fermer la modal en cliquant à l'extérieur
document.addEventListener('click', function(event) {
    if (pilotModal && event.target === pilotModal) {
        closePilotModal();
    }
});

// Fermer la modal avec la touche Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && pilotModal && pilotModal.style.display === 'block') {
        closePilotModal();
    }
});

/**
 * Trier le tableau des laps
 */
window.sortLapsTable = function(column, headerElement) {
    const lapsList = document.getElementById('lapsList');
    if (!lapsList) return;
    
    const lapItems = Array.from(lapsList.children);
    if (lapItems.length === 0) return;
    
    // Déterminer l'ordre de tri
    const currentSort = headerElement.getAttribute('data-sort') || 'none';
    const newSort = currentSort === 'asc' ? 'desc' : 'asc';
    
    // Réinitialiser tous les indicateurs de tri
    document.querySelectorAll('.laps-header .sort-indicator').forEach(indicator => {
        indicator.textContent = '↕️';
    });
    
    // Mettre à jour l'indicateur de la colonne courante
    const indicator = headerElement.querySelector('.sort-indicator');
    indicator.textContent = newSort === 'asc' ? '↑' : '↓';
    headerElement.setAttribute('data-sort', newSort);
    
    // Trier les éléments
    lapItems.sort((a, b) => {
        let valueA, valueB;
        
        switch (column) {
            case 'lapNumber':
                valueA = parseInt(a.getAttribute('data-lap-number'));
                valueB = parseInt(b.getAttribute('data-lap-number'));
                break;
                
            case 'datetime':
                valueA = parseInt(a.getAttribute('data-datetime'));
                valueB = parseInt(b.getAttribute('data-datetime'));
                break;
                
            case 'total':
                valueA = parseInt(a.getAttribute('data-total-time'));
                valueB = parseInt(b.getAttribute('data-total-time'));
                // Les temps de 0 doivent être en dernier
                if (valueA === 0 && valueB !== 0) return 1;
                if (valueB === 0 && valueA !== 0) return -1;
                break;
                
            case 'split1':
                valueA = parseInt(a.querySelector('.lap-split-1').getAttribute('data-split1-time')) || 0;
                valueB = parseInt(b.querySelector('.lap-split-1').getAttribute('data-split1-time')) || 0;
                // Les temps de 0 doivent être en dernier
                if (valueA === 0 && valueB !== 0) return 1;
                if (valueB === 0 && valueA !== 0) return -1;
                break;
                
            case 'split2':
                valueA = parseInt(a.querySelector('.lap-split-2').getAttribute('data-split2-time')) || 0;
                valueB = parseInt(b.querySelector('.lap-split-2').getAttribute('data-split2-time')) || 0;
                // Les temps de 0 doivent être en dernier
                if (valueA === 0 && valueB !== 0) return 1;
                if (valueB === 0 && valueA !== 0) return -1;
                break;
                
            case 'split3':
                valueA = parseInt(a.querySelector('.lap-split-3').getAttribute('data-split3-time')) || 0;
                valueB = parseInt(b.querySelector('.lap-split-3').getAttribute('data-split3-time')) || 0;
                // Les temps de 0 doivent être en dernier
                if (valueA === 0 && valueB !== 0) return 1;
                if (valueB === 0 && valueA !== 0) return -1;
                break;
                
            case 'valid':
                valueA = a.querySelector('.lap-valid').textContent.includes('✅') ? 1 : 0;
                valueB = b.querySelector('.lap-valid').textContent.includes('✅') ? 1 : 0;
                break;
                
            case 'wet':
                valueA = a.querySelector('.lap-wet').textContent.includes('🌧️') ? 1 : 0;
                valueB = b.querySelector('.lap-wet').textContent.includes('🌧️') ? 1 : 0;
                break;
                
            case 'status':
                // Trier par validité puis par wet
                const validA = a.getAttribute('data-is-valid') === 'true';
                const validB = b.getAttribute('data-is-valid') === 'true';
                const wetA = a.getAttribute('data-is-wet') === 'true';
                const wetB = b.getAttribute('data-is-wet') === 'true';
                
                // Priorité: valide > invalide, puis non-wet > wet
                if (validA !== validB) {
                    valueA = validA ? 1 : 0;
                    valueB = validB ? 1 : 0;
                } else {
                    valueA = wetA ? 0 : 1;
                    valueB = wetB ? 0 : 1;
                }
                break;
                
            default:
                return 0;
        }
        
        if (newSort === 'asc') {
            return valueA - valueB;
        } else {
            return valueB - valueA;
        }
    });
    
    // Réorganiser les éléments dans le DOM
    lapItems.forEach((item, index) => {
        // Mettre à jour le numéro de tour affiché
        const lapNumberElement = item.querySelector('.lap-number');
        if (lapNumberElement) {
            lapNumberElement.textContent = index + 1;
        }
        lapsList.appendChild(item);
    });
    
};

/**
 * Générer la section du graphique de progression
 */
function generateProgressionChartSection(driver, firstName, lastName, cupCategory) {
    // Vérifier si la fonctionnalité est activée
    if (!window.ProgressionChart) {
        return '<div class="progression-chart-section"><p>📈 Graphique de progression non disponible</p></div>';
    }
    
    return `
        <div class="progression-chart-section">
            <canvas id="progressionChart" width="800" height="390"></canvas>
        </div>
    `;
}

/**
 * Initialiser le graphique de progression
 */
function initializeProgressionChart(driver, firstName, lastName, cupCategory) {
    try {
        // Vérifier si la fonctionnalité est activée
        if (!window.ProgressionChart) {
            console.log('📈 ProgressionChart non disponible');
            return;
        }

        // Récupérer les données des tours
        const allLaps = getAllPilotLaps(firstName, lastName, cupCategory);
        
        if (allLaps.length === 0) {
            console.log('📈 Aucune donnée de tour pour le graphique');
            return;
        }

        // Créer l'instance du graphique
        const progressionChart = new ProgressionChart();
        
        // Initialiser le graphique
        progressionChart.init(allLaps, firstName, lastName, cupCategory);

        // Stocker l'instance globalement
        window.currentProgressionChart = progressionChart;
        
        console.log('✅ Graphique de progression initialisé');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du graphique:', error);
    }
}

/**
 * Configurer les filtres du graphique
 */
function setupChartFilters(allLaps) {
    const trackFilter = document.getElementById('trackFilter');
    const weatherFilter = document.getElementById('weatherFilter');
    const resetBtn = document.getElementById('resetChartFilters');

    if (!trackFilter || !weatherFilter || !resetBtn) return;

    // Remplir le filtre des pistes avec seulement la piste sélectionnée
    const tracks = [...new Set(allLaps.map(lap => lap.trackName).filter(Boolean))];
    const currentTrack = tracks[0]; // Prendre la première piste (qui devrait être la seule)
    
    if (currentTrack) {
        trackFilter.innerHTML = `<option value="${currentTrack}">${currentTrack}</option>`;
        trackFilter.value = currentTrack; // Sélectionner par défaut
    } else {
        trackFilter.innerHTML = '<option value="">Aucune piste</option>';
    }

    // Event listeners pour les filtres
    trackFilter.addEventListener('change', applyChartFilters);
    weatherFilter.addEventListener('change', applyChartFilters);
    resetBtn.addEventListener('click', resetChartFilters);
}

/**
 * Appliquer les filtres du graphique
 */
function applyChartFilters() {
    if (!window.currentProgressionChart) return;

    const trackFilter = document.getElementById('trackFilter');
    const weatherFilter = document.getElementById('weatherFilter');

    if (!trackFilter || !weatherFilter) return;

    const filters = {};
    
    if (trackFilter.value) {
        filters.trackName = trackFilter.value;
    }
    
    if (weatherFilter.value !== '') {
        filters.weather = weatherFilter.value === 'true';
    }

    window.currentProgressionChart.applyFilters(filters);
    displayChartStats(window.currentProgressionChart);
}

/**
 * Réinitialiser les filtres du graphique
 */
function resetChartFilters() {
    const trackFilter = document.getElementById('trackFilter');
    const weatherFilter = document.getElementById('weatherFilter');

    // Ne pas réinitialiser le filtre de piste (garder la piste sélectionnée)
    // if (trackFilter) trackFilter.value = '';
    if (weatherFilter) weatherFilter.value = '';

    if (window.currentProgressionChart) {
        // Appliquer seulement le filtre de piste (pas de reset complet)
        const filters = {};
        if (trackFilter && trackFilter.value) {
            filters.trackName = trackFilter.value;
        }
        window.currentProgressionChart.applyFilters(filters);
        displayChartStats(window.currentProgressionChart);
    }
}

/**
 * Afficher les statistiques du graphique
 */
function displayChartStats(progressionChart) {
    const statsContainer = document.getElementById('chartStats');
    if (!statsContainer || !progressionChart) return;

    const stats = progressionChart.getStatistics();
    if (!stats) {
        statsContainer.innerHTML = '<p>Aucune statistique disponible</p>';
        return;
    }

    const improvementText = stats.improvement < 0 
        ? `Amélioration de ${formatTime(Math.abs(stats.improvement))}`
        : stats.improvement > 0 
            ? `Régression de ${formatTime(stats.improvement)}`
            : 'Pas de changement';

    statsContainer.innerHTML = `
        <div class="chart-stat-item">
            <span class="stat-label">🏆 Meilleur temps personnel:</span>
            <span class="stat-value">${formatTime(stats.personalBest)}</span>
        </div>
        <div class="chart-stat-item">
            <span class="stat-label">📊 Moyenne des meilleurs temps:</span>
            <span class="stat-value">${formatTime(stats.averageBest)}</span>
        </div>
        <div class="chart-stat-item">
            <span class="stat-label">📈 Évolution:</span>
            <span class="stat-value">${improvementText}</span>
        </div>
        <div class="chart-stat-item">
            <span class="stat-label">📅 Sessions analysées:</span>
            <span class="stat-value">${stats.sessionCount}</span>
        </div>
        <div class="chart-stat-item">
            <span class="stat-label">🏁 Total tours:</span>
            <span class="stat-value">${stats.totalLaps}</span>
        </div>
    `;
}

