// Version simplifiée avec Firebase
let sessionData = [];
let processedData = {};
let groupByClass = true;
let selectedSession = '';
let isAdmin = false;

// Mot de passe admin simple (à changer en production)
const ADMIN_PASSWORD = "simracing2024";

// Éléments DOM
let fileInput, fileList, analyzeBtn, clearBtn, downloadBtn, resultsSection, loading, categoryStats, driverStats, groupByClassToggle, dataStatus, uploadSection, uploadHeader, uploadContent, fileCount, collapseBtn, sessionSelect, pilotModal, closeModal;
let authSection, adminPassword, loginBtn, logoutBtn, adminControls, authStatus;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
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
});

// Authentification simple
function handleLogin() {
    const password = adminPassword.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        authSection.style.display = 'none';
        adminControls.style.display = 'block';
        authStatus.innerHTML = '<div class="auth-status success">✅ Connecté en tant qu\'admin</div>';
        adminPassword.value = '';
        
        // Charger les données depuis le localStorage
        loadDataFromStorage();
    } else {
        authStatus.innerHTML = '<div class="auth-status error">❌ Mot de passe incorrect</div>';
    }
}

function handleLogout() {
    isAdmin = false;
    authSection.style.display = 'block';
    adminControls.style.display = 'none';
    resultsSection.style.display = 'none';
    authStatus.innerHTML = '';
    
    // Masquer les données sensibles
    sessionData = [];
    processedData = {};
}

// Charger les données depuis le localStorage (simulation de base de données)
function loadDataFromStorage() {
    const savedSessionData = localStorage.getItem('sessionData');
    const savedProcessedData = localStorage.getItem('processedData');
    
    if (savedSessionData && savedProcessedData) {
        try {
            sessionData = JSON.parse(savedSessionData);
            processedData = JSON.parse(savedProcessedData);
            
            displayLoadedFiles();
            populateSessionList();
            displayResults();
            
            console.log(`Données chargées: ${sessionData.length} sessions`);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
        }
    }
}

// Gestion de la sélection de fichiers
function handleFileSelection(event) {
    if (!isAdmin) return;
    
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

// Analyser les données
async function analyzeData() {
    if (!isAdmin) return;
    
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        alert('Veuillez sélectionner des fichiers JSON');
        return;
    }
    
    showLoading(true);
    
    try {
        console.log('Début de l\'analyse de', files.length, 'fichiers');
        
        // Charger les sessions existantes
        const existingSessions = JSON.parse(localStorage.getItem('sessionData') || '[]');
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
        
        // Sauvegarder dans localStorage
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        localStorage.setItem('processedData', JSON.stringify(processedData));
        
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
    const date = sessionData.Date || 'unknown';
    const serverName = sessionData.serverName || 'unknown';
    return `${date}_${serverName}`;
}

// Effacer tout
async function clearAll() {
    if (!isAdmin) return;
    
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
        sessionData = [];
        processedData = {};
        
        // Effacer l'interface
        fileInput.value = '';
        fileList.innerHTML = '';
        resultsSection.style.display = 'none';
        analyzeBtn.disabled = true;
        
        // Effacer le localStorage
        localStorage.removeItem('sessionData');
        localStorage.removeItem('processedData');
        
        // Réinitialiser l'affichage
        updateFileCount(0);
        uploadSection.classList.remove('collapsed');
        dataStatus.style.display = 'none';
        
        console.log('Toutes les données effacées');
        alert('✅ Toutes les données ont été effacées !');
    }
}

// Télécharger depuis EGT (version simplifiée)
async function downloadFromEGT() {
    if (!isAdmin) return;
    
    alert('Fonctionnalité de téléchargement automatique non disponible dans cette version simplifiée.\n\nVeuillez télécharger manuellement les fichiers JSON depuis le site EGT Canada.');
}

// Fonctions utilitaires (garder les mêmes que l'original)
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
    if (isAdmin) {
        displayResults();
    }
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
            <div class="status-icon">🗄️</div>
            <span class="status-text">${sessionData.length} session(s) stockée(s)</span>
        `;
    }
    analyzeBtn.disabled = false;
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
        if (isAdmin) {
            displayResults();
        }
    }
}

// Populer la liste des sessions
function populateSessionList() {
    if (!sessionSelect) return;
    
    sessionSelect.innerHTML = '';
    
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

// Afficher les résultats
function displayResults() {
    if (!isAdmin) return;
    
    displayOverallStats();
    displayDriverStats();
    resultsSection.style.display = 'block';
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
        </div>
    `;
}

// Afficher les statistiques des pilotes
function displayDriverStats() {
    if (!driverStats) return;
    
    const filteredData = getFilteredData();
    const byDriver = filteredData.byDriver || {};
    
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

// Fonction de traitement des données (version simplifiée)
function processSessionData(sessions) {
    const result = {
        overall: { bestValidTime: 0, averageValidTime: 0, bestOverallTime: 0, averageOverallTime: 0, totalLaps: 0, validLaps: 0 },
        byCategory: {},
        byDriver: {}
    };
    
    sessions.forEach(session => {
        if (session.laps && session.sessionResult) {
            session.laps.forEach(lap => {
                const driver = session.sessionResult.find(d => d.carId === lap.carId);
                if (driver) {
                    const driverId = `${driver.firstName}_${driver.lastName}_${driver.cupCategory}`;
                    
                    // Initialiser le pilote
                    if (!result.byDriver[driverId]) {
                        result.byDriver[driverId] = {
                            firstName: driver.firstName,
                            lastName: driver.lastName,
                            cupCategory: driver.cupCategory,
                            bestValidTime: 0,
                            averageValidTime: 0,
                            bestOverallTime: 0,
                            averageOverallTime: 0,
                            totalLaps: 0,
                            validLaps: 0,
                            totalTime: 0,
                            validTime: 0
                        };
                    }
                    
                    // Mettre à jour les statistiques
                    result.byDriver[driverId].totalLaps++;
                    result.byDriver[driverId].totalTime += lap.laptime;
                    
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
    }
    
    return result;
}

// Fonctions de modal (version simplifiée)
function openPilotModal(pilotId) {
    // Version simplifiée - juste un alert
    alert(`Détails du pilote: ${pilotId}\n\nFonctionnalité complète disponible dans la version complète.`);
}

function closePilotModal() {
    if (pilotModal) {
        pilotModal.style.display = 'none';
    }
}
