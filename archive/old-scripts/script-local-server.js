// Version avec serveur local au lieu de Firebase
let sessionData = [];
let processedData = {};
let groupByClass = true;
let selectedSession = '';
let isAdmin = false;
let serverUrl = 'http://localhost:3000';

// Mot de passe admin simple
const ADMIN_PASSWORD = "admin123";

// Éléments DOM
let fileInput, fileList, analyzeBtn, clearBtn, downloadBtn, resultsSection, loading, categoryStats, driverStats, groupByClassToggle, dataStatus, uploadSection, uploadHeader, uploadContent, fileCount, collapseBtn, sessionSelect, pilotModal, closeModal;
let authSection, adminPassword, loginBtn, logoutBtn, adminControls, authStatus, adminAccessBtn, cancelAuthBtn, publicSection;

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    // Éléments DOM
    fileInput = document.getElementById('jsonFiles');
    fileList = document.getElementById('fileList');
    analyzeBtn = document.getElementById('analyzeBtn');
    clearBtn = document.getElementById('clearBtn');
    downloadBtn = document.getElementById('downloadBtn');
    resultsSection = document.getElementById('resultsSection');
    loading = document.getElementById('loading');
    categoryStats = document.getElementById('categoryStats');
    driverStats = document.getElementById('driverStats');
    groupByClassToggle = document.getElementById('groupByClassToggle');
    dataStatus = document.getElementById('dataStatus');
    uploadSection = document.getElementById('uploadSection');
    uploadHeader = document.getElementById('uploadHeader');
    uploadContent = document.getElementById('uploadContent');
    fileCount = document.getElementById('fileCount');
    collapseBtn = document.getElementById('collapseBtn');
    sessionSelect = document.getElementById('sessionSelect');
    pilotModal = document.getElementById('pilotModal');
    closeModal = document.getElementById('closeModal');
    
    // Éléments d'authentification
    authSection = document.getElementById('authSection');
    adminPassword = document.getElementById('adminPassword');
    loginBtn = document.getElementById('loginBtn');
    logoutBtn = document.getElementById('logoutBtn');
    adminControls = document.getElementById('adminControls');
    authStatus = document.getElementById('authStatus');
    adminAccessBtn = document.getElementById('adminAccessBtn');
    cancelAuthBtn = document.getElementById('cancelAuthBtn');
    publicSection = document.querySelector('.public-section');

    // Charger les préférences
    loadPreferences();

    // Événements
    fileInput.addEventListener('change', handleFileSelection);
    analyzeBtn.addEventListener('click', analyzeData);
    clearBtn.addEventListener('click', clearAll);
    downloadBtn.addEventListener('click', downloadFromEGT);
    groupByClassToggle.addEventListener('change', toggleGroupByClass);
    uploadHeader.addEventListener('click', toggleUploadSection);
    sessionSelect.addEventListener('change', handleSessionChange);
    closeModal.addEventListener('click', closePilotModal);
    
    // Événements d'authentification
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    adminAccessBtn.addEventListener('click', showAdminAuth);
    cancelAuthBtn.addEventListener('click', hideAdminAuth);
    adminPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Fermer la modal en cliquant à l'extérieur
    pilotModal.addEventListener('click', function(e) {
        if (e.target === pilotModal) {
            closePilotModal();
        }
    });

    // Charger les données au démarrage
    await loadDataFromServer();
});

// Afficher l'authentification admin
function showAdminAuth() {
    authSection.style.display = 'block';
    publicSection.style.display = 'none';
}

// Masquer l'authentification admin
function hideAdminAuth() {
    authSection.style.display = 'none';
    publicSection.style.display = 'block';
}

// Authentification simple
function handleLogin() {
    const password = adminPassword.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        authSection.style.display = 'none';
        adminControls.style.display = 'block';
        uploadSection.style.display = 'block';
        authStatus.innerHTML = '<div class="auth-status success">✅ Connecté en tant qu\'admin</div>';
        adminPassword.value = '';
        
        // Charger les données depuis le serveur
        loadDataFromServer();
    } else {
        authStatus.innerHTML = '<div class="auth-status error">❌ Mot de passe incorrect</div>';
    }
}

function handleLogout() {
    isAdmin = false;
    authSection.style.display = 'none';
    adminControls.style.display = 'none';
    uploadSection.style.display = 'none';
    publicSection.style.display = 'block';
    authStatus.innerHTML = '';
    
    // Les données restent visibles pour tous
    loadDataFromServer();
}

// Charger les données depuis le serveur local
async function loadDataFromServer() {
    try {
        const response = await fetch(`${serverUrl}/api/data`);
        if (response.ok) {
            const data = await response.json();
            sessionData = data.sessions || [];
            processedData = data.processedData || {};
            
            displayLoadedFiles();
            populateSessionList();
            displayResults();
            
            console.log(`Données chargées depuis le serveur local: ${sessionData.length} sessions`);
        } else {
            throw new Error('Serveur non disponible');
        }
    } catch (error) {
        console.error('Erreur lors du chargement depuis le serveur:', error);
        // Fallback vers localStorage
        loadDataFromLocalStorage();
    }
}

// Fallback vers localStorage
function loadDataFromLocalStorage() {
    const savedSessionData = localStorage.getItem('sessionData');
    const savedProcessedData = localStorage.getItem('processedData');
    
    if (savedSessionData && savedProcessedData) {
        try {
            sessionData = JSON.parse(savedSessionData);
            processedData = JSON.parse(savedProcessedData);
            
            displayLoadedFiles();
            populateSessionList();
            displayResults();
            
            console.log(`Données chargées depuis localStorage: ${sessionData.length} sessions`);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            showNoDataMessage();
        }
    } else {
        showNoDataMessage();
    }
}

// Sauvegarder les données sur le serveur
async function saveDataToServer() {
    try {
        const response = await fetch(`${serverUrl}/api/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessions: sessionData,
                processedData: processedData
            })
        });
        
        if (response.ok) {
            console.log('Données sauvegardées sur le serveur local');
        } else {
            throw new Error('Erreur de sauvegarde');
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde sur le serveur:', error);
        // Fallback vers localStorage
        saveDataToLocalStorage();
    }
}

// Sauvegarder dans localStorage (backup)
function saveDataToLocalStorage() {
    try {
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        localStorage.setItem('processedData', JSON.stringify(processedData));
        console.log('Données sauvegardées dans localStorage (backup)');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
}

// Afficher un message quand il n'y a pas de données
function showNoDataMessage() {
    if (categoryStats) {
        categoryStats.innerHTML = `
            <div class="no-data-message">
                <div class="no-data-icon">📊</div>
                <h3>Aucune donnée disponible</h3>
                <p>Les données de course seront affichées ici une fois qu'un administrateur aura uploadé des fichiers JSON.</p>
                <p>Contactez un administrateur pour ajouter des données de course.</p>
            </div>
        `;
    }
    
    if (driverStats) {
        driverStats.innerHTML = `
            <div class="no-data-message">
                <div class="no-data-icon">🏁</div>
                <h3>Aucun pilote trouvé</h3>
                <p>Les statistiques des pilotes apparaîtront ici une fois que des données auront été chargées.</p>
            </div>
        `;
    }
}

// Gestion de la sélection de fichiers (admin seulement)
function handleFileSelection(event) {
    if (!isAdmin) {
        alert('Seuls les administrateurs peuvent uploader des fichiers. Connectez-vous d\'abord.');
        return;
    }
    
    const files = Array.from(event.target.files);
    fileList.innerHTML = '';
    
    files.forEach(file => {
        if (file.type === 'application/json') {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            `;
            fileList.appendChild(fileItem);
        }
    });
    
    updateFileCount(files.length);
    analyzeBtn.disabled = files.length === 0;
}

// Analyser les données (admin seulement)
async function analyzeData() {
    if (!isAdmin) {
        alert('Seuls les administrateurs peuvent analyser des fichiers. Connectez-vous d\'abord.');
        return;
    }
    
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        alert('Veuillez sélectionner des fichiers JSON');
        return;
    }
    
    showLoading(true);
    
    try {
        console.log('Début de l\'analyse de', files.length, 'fichiers');
        
        // Charger les sessions existantes
        const existingSessions = sessionData.slice();
        sessionData = [...existingSessions];
        processedData = { overall: {}, byCategory: {}, byDriver: {} };
        
        let newSessionsCount = 0;
        let duplicateSessionsCount = 0;
        
        // Lire tous les fichiers JSON
        for (const file of files) {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Vérifier si la session existe déjà
            const sessionId = generateSessionId(data);
            const exists = sessionData.some(session => generateSessionId(session) === sessionId);
            
            if (!exists) {
                sessionData.push(data);
                newSessionsCount++;
                console.log(`✅ Nouvelle session: ${sessionId}`);
            } else {
                duplicateSessionsCount++;
                console.log(`⚠️ Doublon ignoré: ${sessionId}`);
            }
        }
        
        // Traiter les données
        processedData = processSessionData(sessionData);
        
        // Sauvegarder sur le serveur (et localStorage comme backup)
        await saveDataToServer();
        saveDataToLocalStorage();
        
        // Afficher les résultats
        displayLoadedFiles();
        populateSessionList();
        displayResults();
        
        // Message de statut
        let message = `📊 Analyse terminée:\n`;
        message += `- Fichiers uploadés: ${files.length}\n`;
        message += `- Nouvelles sessions: ${newSessionsCount}\n`;
        if (duplicateSessionsCount > 0) {
            message += `- Doublons ignorés: ${duplicateSessionsCount}\n`;
        }
        message += `- Total sessions: ${sessionData.length}`;
        alert(message);
        
        showLoading(false);
        
    } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
        alert('Erreur lors de l\'analyse des données: ' + error.message);
        showLoading(false);
    }
}

// Générer un ID unique
function generateSessionId(sessionData) {
    const date = sessionData.Date || sessionData.sessionResult?.sessionDate || 'unknown';
    const serverName = sessionData.serverName || 'unknown';
    const trackName = sessionData.trackName || 'unknown';
    return `${date}_${serverName}_${trackName}`;
}

// Effacer tout (admin seulement)
async function clearAll() {
    if (!isAdmin) {
        alert('Seuls les administrateurs peuvent effacer les données. Connectez-vous d\'abord.');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
        sessionData = [];
        processedData = {};
        
        // Effacer l'interface
        fileInput.value = '';
        fileList.innerHTML = '';
        resultsSection.style.display = 'none';
        analyzeBtn.disabled = true;
        
        // Effacer le serveur et localStorage
        try {
            await fetch(`${serverUrl}/api/data`, { method: 'DELETE' });
        } catch (error) {
            console.error('Erreur lors de l\'effacement sur le serveur:', error);
        }
        localStorage.removeItem('sessionData');
        localStorage.removeItem('processedData');
        
        // Réinitialiser l'affichage
        updateFileCount(0);
        uploadSection.classList.remove('collapsed');
        dataStatus.style.display = 'none';
        
        // Afficher le message de données vides
        showNoDataMessage();
        
        console.log('Toutes les données effacées (serveur + localStorage)');
        alert('✅ Toutes les données ont été effacées !');
    }
}

// Télécharger depuis EGT (admin seulement)
async function downloadFromEGT() {
    if (!isAdmin) {
        alert('Seuls les administrateurs peuvent télécharger des fichiers. Connectez-vous d\'abord.');
        return;
    }
    
    alert('Fonctionnalité de téléchargement automatique non disponible dans cette version simplifiée.\n\nVeuillez télécharger manuellement les fichiers JSON depuis le site EGT Canada.');
}

// Fonctions utilitaires
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showLoading(show) {
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

// Charger les préférences
function loadPreferences() {
    const savedGroupByClass = localStorage.getItem('groupByClass');
    if (savedGroupByClass !== null) {
        groupByClass = savedGroupByClass === 'true';
        if (groupByClassToggle) {
            groupByClassToggle.checked = groupByClass;
        }
    }
}

// Toggle groupement par classe
function toggleGroupByClass() {
    groupByClass = groupByClassToggle.checked;
    localStorage.setItem('groupByClass', groupByClass);
    displayResults();
}

// Afficher les fichiers chargés
function displayLoadedFiles() {
    if (sessionData.length === 0) return;
    
    fileList.innerHTML = '';
    sessionData.forEach((session, index) => {
        const fileName = session.SessionFile || `Session ${index + 1}`;
        const sessionId = generateSessionId(session);
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-name">${fileName}</span>
            <span class="file-size">${sessionId}</span>
        `;
        fileList.appendChild(fileItem);
    });
    
    updateFileCount(sessionData.length);
    
    if (dataStatus) {
        dataStatus.style.display = 'block';
        dataStatus.innerHTML = `
            <div class="status-icon">🖥️</div>
            <span class="status-text">${sessionData.length} session(s) depuis le serveur local</span>
        `;
    }
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
    }
}

// Mettre à jour le compteur de fichiers
function updateFileCount(count) {
    if (fileCount) {
        if (count > 0) {
            fileCount.textContent = count;
            fileCount.style.display = 'inline-block';
        } else {
            fileCount.style.display = 'none';
        }
    }
}

// Toggle section upload
function toggleUploadSection() {
    if (uploadSection) {
        uploadSection.classList.toggle('collapsed');
    }
}

// Gestion du changement de session
function handleSessionChange() {
    if (sessionSelect) {
        selectedSession = sessionSelect.value;
        displayResults();
    }
}

// Populer la liste des sessions
function populateSessionList() {
    if (!sessionSelect) return;
    
    sessionSelect.innerHTML = '';
    
    if (sessionData.length === 0) {
        const option = document.createElement('option');
        option.value = 'all';
        option.textContent = 'Aucune session disponible';
        sessionSelect.appendChild(option);
        return;
    }
    
    // Grouper les sessions par piste
    const sessionsByTrack = {};
    sessionData.forEach(session => {
        const trackName = session.trackName || 'Unknown';
        if (!sessionsByTrack[trackName]) {
            sessionsByTrack[trackName] = [];
        }
        sessionsByTrack[trackName].push(session);
    });
    
    // Créer les options
    Object.keys(sessionsByTrack).forEach(trackName => {
        const option = document.createElement('option');
        option.value = trackName;
        option.textContent = `${trackName} (${sessionsByTrack[trackName].length} sessions)`;
        sessionSelect.appendChild(option);
    });
    
    // Sélectionner la première piste par défaut
    if (Object.keys(sessionsByTrack).length > 0) {
        selectedSession = Object.keys(sessionsByTrack)[0];
        sessionSelect.value = selectedSession;
    }
}

// Afficher les résultats (visible pour tous)
function displayResults() {
    if (sessionData.length === 0) {
        showNoDataMessage();
        return;
    }
    
    displayOverallStats();
    displayDriverStats();
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
}

// Afficher les statistiques globales
function displayOverallStats() {
    if (!categoryStats) return;
    
    const filteredData = getFilteredData();
    const overall = filteredData.overall || {};
    
    categoryStats.innerHTML = `
        <div class="compact-stats-grid">
            <div class="compact-stat-card">
                <div class="compact-stat-icon">🏁</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Sessions</div>
                    <div class="compact-stat-value">${sessionData.length}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">⏱️</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Meilleur temps</div>
                    <div class="compact-stat-value">${formatTime(overall.bestValidTime || 0)}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">📊</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Moyenne valide</div>
                    <div class="compact-stat-value">${formatTime(overall.averageValidTime || 0)}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">👥</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Pilotes</div>
                    <div class="compact-stat-value">${Object.keys(filteredData.byDriver || {}).length}</div>
                </div>
            </div>
        </div>
    `;
}

// Afficher les statistiques des pilotes
function displayDriverStats() {
    if (!driverStats) return;
    
    const filteredData = getFilteredData();
    const byDriver = filteredData.byDriver || {};
    
    if (Object.keys(byDriver).length === 0) {
        driverStats.innerHTML = `
            <div class="no-data-message">
                <div class="no-data-icon">🏁</div>
                <h3>Aucun pilote trouvé</h3>
                <p>Les statistiques des pilotes apparaîtront ici une fois que des données auront été chargées.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="driver-table-container"><table class="driver-table"><thead><tr>';
    html += '<th>Pilote</th><th>Classe</th><th>Meilleur valide</th><th>Moyenne valide</th><th>Meilleur total</th><th>Moyenne total</th>';
    html += '</tr></thead><tbody>';
    
    // Trier les pilotes par meilleur temps valide
    const sortedDrivers = Object.values(byDriver).sort((a, b) => (a.bestValidTime || 0) - (b.bestValidTime || 0));
    
    sortedDrivers.forEach(driver => {
        const categoryClass = getCategoryClass(driver.cupCategory);
        html += `<tr onclick="openPilotModal('${driver.firstName}_${driver.lastName}_${driver.cupCategory}')">`;
        html += `<td>${driver.firstName} ${driver.lastName}</td>`;
        html += `<td><span class="category-badge ${categoryClass}">${getCategoryName(driver.cupCategory)}</span></td>`;
        html += `<td data-value="${driver.bestValidTime || 0}">${formatTime(driver.bestValidTime || 0)}</td>`;
        html += `<td data-value="${driver.averageValidTime || 0}">${formatTime(driver.averageValidTime || 0)}</td>`;
        html += `<td data-value="${driver.bestOverallTime || 0}">${formatTime(driver.bestOverallTime || 0)}</td>`;
        html += `<td data-value="${driver.averageOverallTime || 0}">${formatTime(driver.averageOverallTime || 0)}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    driverStats.innerHTML = html;
}

// Fonctions utilitaires
function getFilteredData() {
    if (selectedSession && selectedSession !== 'all') {
        const filteredSessions = sessionData.filter(session => session.trackName === selectedSession);
        return processSessionData(filteredSessions);
    }
    return processedData;
}

function formatTime(milliseconds) {
    if (!milliseconds || milliseconds === 0) return '--:--.---';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.round(milliseconds % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function getCategoryName(category) {
    switch (category) {
        case 0: return 'Pro';
        case 2: return 'AM';
        case 3: return 'Silver';
        default: return 'Unknown';
    }
}

function getCategoryClass(category) {
    switch (category) {
        case 0: return 'category-pro';
        case 2: return 'category-am';
        case 3: return 'category-silver';
        default: return '';
    }
}

// Fonction de traitement des données
function processSessionData(sessions) {
    const result = {
        overall: { bestValidTime: 0, averageValidTime: 0, bestOverallTime: 0, averageOverallTime: 0, totalLaps: 0, validLaps: 0 },
        byCategory: {},
        byDriver: {}
    };
    
    sessions.forEach(session => {
        if (session.laps && session.sessionResult && session.sessionResult.leaderBoardLines) {
            // Créer un mapping carId -> pilote
            const driverMap = {};
            session.sessionResult.leaderBoardLines.forEach(line => {
                const car = line.car;
                const driver = car.drivers[0];
                driverMap[car.carId] = {
                    firstName: driver.firstName,
                    lastName: driver.lastName,
                    cupCategory: car.cupCategory,
                    carModel: car.carModel
                };
            });
            
            session.laps.forEach(lap => {
                const driverInfo = driverMap[lap.carId];
                if (driverInfo) {
                    const driverId = `${driverInfo.firstName}_${driverInfo.lastName}_${driverInfo.cupCategory}`;
                    
                    // Initialiser le pilote
                    if (!result.byDriver[driverId]) {
                        result.byDriver[driverId] = {
                            firstName: driverInfo.firstName,
                            lastName: driverInfo.lastName,
                            cupCategory: driverInfo.cupCategory,
                            carModel: driverInfo.carModel,
                            bestValidTime: 0,
                            averageValidTime: 0,
                            bestOverallTime: 0,
                            averageOverallTime: 0,
                            totalLaps: 0,
                            validLaps: 0,
                            totalTime: 0,
                            validTime: 0,
                            lapTimes: [] // Ajouter pour le graphique
                        };
                    }
                    
                    // Mettre à jour les statistiques
                    result.byDriver[driverId].totalLaps++;
                    result.byDriver[driverId].totalTime += lap.laptime;
                    result.byDriver[driverId].lapTimes.push({ time: lap.laptime, valid: lap.isValidForBest });
                    
                    if (lap.isValidForBest) {
                        result.byDriver[driverId].validLaps++;
                        result.byDriver[driverId].validTime += lap.laptime;
                        
                        if (result.byDriver[driverId].bestValidTime === 0 || lap.laptime < result.byDriver[driverId].bestValidTime) {
                            result.byDriver[driverId].bestValidTime = lap.laptime;
                        }
                    }
                    
                    if (result.byDriver[driverId].bestOverallTime === 0 || lap.laptime < result.byDriver[driverId].bestOverallTime) {
                        result.byDriver[driverId].bestOverallTime = lap.laptime;
                    }
                }
            });
        }
    });
    
    // Calculer les moyennes
    Object.values(result.byDriver).forEach(driver => {
        if (driver.totalLaps > 0) {
            driver.averageOverallTime = driver.totalTime / driver.totalLaps;
        }
        if (driver.validLaps > 0) {
            driver.averageValidTime = driver.validTime / driver.validLaps;
        }
    });
    
    // Calculer les statistiques globales
    const allDrivers = Object.values(result.byDriver);
    if (allDrivers.length > 0) {
        result.overall.bestValidTime = Math.min(...allDrivers.map(d => d.bestValidTime || Infinity));
        result.overall.bestOverallTime = Math.min(...allDrivers.map(d => d.bestOverallTime || Infinity));
        result.overall.totalLaps = allDrivers.reduce((sum, d) => sum + d.totalLaps, 0);
        result.overall.validLaps = allDrivers.reduce((sum, d) => sum + d.validLaps, 0);
        
        // Calculer les moyennes globales
        if (result.overall.validLaps > 0) {
            result.overall.averageValidTime = allDrivers.reduce((sum, d) => sum + d.validTime, 0) / result.overall.validLaps;
        }
        if (result.overall.totalLaps > 0) {
            result.overall.averageOverallTime = allDrivers.reduce((sum, d) => sum + d.totalTime, 0) / result.overall.totalLaps;
        }
    }
    
    return result;
}

// Fonctions de modal
function openPilotModal(pilotId) {
    const filteredData = getFilteredData();
    
    // Trouver le pilote par ID (format: firstName_lastName_cupCategory)
    const pilot = Object.values(filteredData.byDriver).find(driver => 
        `${driver.firstName}_${driver.lastName}_${driver.cupCategory}` === pilotId
    );
    
    if (!pilot) {
        console.error('Pilote non trouvé:', pilotId);
        return;
    }
    
    // Remplir les informations personnelles
    const fullName = `${pilot.firstName} ${pilot.lastName}`;
    document.getElementById('pilotName').textContent = fullName;
    document.getElementById('pilotFullName').textContent = fullName;
    document.getElementById('pilotCategory').textContent = getCategoryName(pilot.cupCategory);
    document.getElementById('pilotRaceNumber').textContent = pilot.raceNumber || '-';
    document.getElementById('pilotCarModel').textContent = pilot.carModel || '-';
    
    // Remplir les statistiques de performance
    document.getElementById('bestValidTime').textContent = formatTime(pilot.bestValidTime);
    document.getElementById('avgValidTime').textContent = formatTime(pilot.averageValidTime);
    document.getElementById('bestOverallTime').textContent = formatTime(pilot.bestOverallTime);
    document.getElementById('avgOverallTime').textContent = formatTime(pilot.averageOverallTime);
    document.getElementById('validLaps').textContent = pilot.validLaps;
    document.getElementById('totalLaps').textContent = pilot.totalLaps;
    
    // Remplir les statistiques wet
    document.getElementById('wetValidLaps').textContent = pilot.wetValidLaps || 0;
    document.getElementById('bestWetTime').textContent = pilot.bestWetValidTime ? formatTime(pilot.bestWetValidTime) : '-';
    
    // Calculer les métriques avancées
    const lapTimes = pilot.lapTimes || [];
    const validLapTimes = lapTimes.filter(lap => lap.valid).map(lap => lap.time);
    
    // Consistance (écart-type des temps valides)
    const consistency = calculateConsistency(validLapTimes);
    document.getElementById('consistency').textContent = consistency;
    
    // Amélioration (différence entre premier et dernier quartile)
    const improvement = calculateImprovement(validLapTimes);
    document.getElementById('improvement').textContent = improvement;
    
    // Tours dans les 1% du meilleur temps
    const top1Percent = calculateTop1Percent(validLapTimes, pilot.bestValidTime);
    document.getElementById('top1Percent').textContent = top1Percent;
    
    // Position dans la catégorie
    const categoryPosition = getCategoryPosition(pilot, filteredData);
    document.getElementById('categoryPosition').textContent = categoryPosition;
    
    // Écart avec le leader de la catégorie
    const gapToLeader = getGapToLeader(pilot, filteredData);
    document.getElementById('gapToLeader').textContent = gapToLeader;
    
    // Créer le graphique des tours
    createLapsChart(validLapTimes);
    
    // Afficher la modal
    pilotModal.style.display = 'flex';
}

function closePilotModal() {
    if (pilotModal) {
        pilotModal.style.display = 'none';
    }
}

// Calculer la consistance (écart-type en pourcentage)
function calculateConsistency(lapTimes) {
    if (lapTimes.length < 2) return '-';
    
    const avg = lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;
    const variance = lapTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / lapTimes.length;
    const stdDev = Math.sqrt(variance);
    const consistency = ((stdDev / avg) * 100).toFixed(1);
    
    return `${consistency}%`;
}

// Calculer l'amélioration (différence entre premier et dernier quartile)
function calculateImprovement(lapTimes) {
    if (lapTimes.length < 4) return '-';
    
    const sorted = [...lapTimes].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const improvement = q3 - q1;
    
    return formatTime(improvement);
}

// Calculer les tours dans les 1% du meilleur temps
function calculateTop1Percent(lapTimes, bestTime) {
    if (lapTimes.length === 0 || !bestTime) return '0';
    
    const threshold = bestTime * 1.01; // 1% plus lent que le meilleur
    const topLaps = lapTimes.filter(time => time <= threshold).length;
    const percentage = ((topLaps / lapTimes.length) * 100).toFixed(1);
    
    return `${topLaps} (${percentage}%)`;
}

// Obtenir la position dans la catégorie
function getCategoryPosition(pilot, data) {
    const categoryDrivers = Object.values(data.byDriver)
        .filter(driver => driver.cupCategory === pilot.cupCategory)
        .sort((a, b) => a.bestValidTime - b.bestValidTime);
    
    const position = categoryDrivers.findIndex(driver => 
        driver.firstName === pilot.firstName && 
        driver.lastName === pilot.lastName && 
        driver.cupCategory === pilot.cupCategory
    ) + 1;
    
    const total = categoryDrivers.length;
    
    return `${position}/${total}`;
}

// Obtenir l'écart avec le leader de la catégorie
function getGapToLeader(pilot, data) {
    const categoryDrivers = Object.values(data.byDriver)
        .filter(driver => driver.cupCategory === pilot.cupCategory)
        .sort((a, b) => a.bestValidTime - b.bestValidTime);
    
    if (categoryDrivers.length === 0) return '-';
    
    const leader = categoryDrivers[0];
    const gap = pilot.bestValidTime - leader.bestValidTime;
    
    if (gap === 0) return 'Leader';
    return `+${formatTime(gap)}`;
}

// Créer le graphique des tours
function createLapsChart(lapTimes) {
    const canvas = document.getElementById('lapsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (lapTimes.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Aucune donnée de tour', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    const minTime = Math.min(...lapTimes);
    const maxTime = Math.max(...lapTimes);
    const timeRange = maxTime - minTime;
    
    // Dessiner les axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    // Axe Y (temps)
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // Axe X (tours)
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Dessiner la ligne des temps
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    lapTimes.forEach((time, index) => {
        const x = padding + (index / (lapTimes.length - 1)) * chartWidth;
        const y = canvas.height - padding - ((time - minTime) / timeRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Dessiner les points
    ctx.fillStyle = '#667eea';
    lapTimes.forEach((time, index) => {
        const x = padding + (index / (lapTimes.length - 1)) * chartWidth;
        const y = canvas.height - padding - ((time - minTime) / timeRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Ajouter les labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Label du meilleur temps
    ctx.fillText(`Meilleur: ${formatTime(minTime)}`, canvas.width / 2, 20);
}
