// Variables globales
let sessionData = [];
let processedData = {};
let groupByClass = true;
let selectedSession = '';
let db = null; // IndexedDB database

// Éléments DOM
let fileInput, fileList, analyzeBtn, clearBtn, downloadBtn, resultsSection, loading, categoryStats, driverStats, groupByClassToggle, dataStatus, uploadSection, uploadHeader, uploadContent, fileCount, collapseBtn, sessionSelect, pilotModal, closeModal;

// Initialisation quand le DOM est chargé
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

    // Initialiser la base de données
    initDatabase();
    
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
    
    // Fermer la modal en cliquant à l'extérieur
    pilotModal.addEventListener('click', function(e) {
        if (e.target === pilotModal) {
            closePilotModal();
        }
    });
});

// Gestion de la sélection de fichiers
function handleFileSelection(event) {
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

// Télécharger les fichiers depuis EGT Canada
async function downloadFromEGT() {
    try {
        downloadBtn.disabled = true;
        downloadBtn.textContent = '⬇️ Téléchargement...';
        
        // Essayer différents proxies CORS
        const proxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ];
        
        let response;
        let lastError;
        
        for (const proxy of proxies) {
            try {
                const egtApiUrl = `${proxy}http://51.161.118.36:8773/results`;
                response = await fetch(egtApiUrl);
                if (response.ok) break;
            } catch (error) {
                lastError = error;
                continue;
            }
        }
        
        if (!response || !response.ok) {
            throw new Error(`Erreur HTTP: ${response?.status || 'Connexion impossible'}. ${lastError?.message || ''}`);
        }
        
        const html = await response.text();
        
        // Extraire les URLs des fichiers JSON depuis le HTML
        const jsonUrls = extractJsonUrls(html);
        
        if (jsonUrls.length === 0) {
            alert('Aucun fichier JSON trouvé sur le serveur EGT.');
            return;
        }
        
        // Télécharger les fichiers JSON
        const downloadedFiles = await downloadJsonFiles(jsonUrls);
        
        // Traiter les fichiers téléchargés
        await processDownloadedFiles(downloadedFiles);
        
        // Activer le bouton d'analyse
        analyzeBtn.disabled = false;
        
        alert(`✅ ${downloadedFiles.length} fichiers téléchargés avec succès depuis EGT Canada !`);
        
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        
        // Proposer une alternative manuelle
        const manualOption = confirm(
            'Erreur lors du téléchargement automatique: ' + error.message + '\n\n' +
            'Voulez-vous ouvrir la page EGT Canada pour télécharger manuellement les fichiers ?\n\n' +
            'Instructions:\n' +
            '1. Cliquez sur "OK" pour ouvrir la page\n' +
            '2. Téléchargez les fichiers JSON souhaités\n' +
            '3. Utilisez le bouton "Sélectionner des fichiers" pour les charger'
        );
        
        if (manualOption) {
            window.open('http://51.161.118.36:8773/results', '_blank');
        }
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Télécharger depuis EGT';
    }
}

// Extraire les URLs des fichiers JSON depuis le HTML
function extractJsonUrls(html) {
    const urls = [];
    const regex = /\/results\/download\/([^"]+\.json)/g;
    let match;
    
    // Utiliser le même proxy qui a fonctionné pour la page principale
    const workingProxy = 'https://cors-anywhere.herokuapp.com/';
    
    while ((match = regex.exec(html)) !== null) {
        const fileName = decodeURIComponent(match[1]);
        const fullUrl = `${workingProxy}http://51.161.118.36:8773/results/download/${match[1]}`;
        urls.push({ url: fullUrl, fileName: fileName });
    }
    
    return urls;
}

// Télécharger les fichiers JSON
async function downloadJsonFiles(jsonUrls) {
    const downloadedFiles = [];
    
    // Limiter à 10 fichiers pour éviter les timeouts
    const limitedUrls = jsonUrls.slice(0, 10);
    
    for (const { url, fileName } of limitedUrls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const jsonData = await response.json();
                const file = new File([JSON.stringify(jsonData, null, 2)], fileName, {
                    type: 'application/json'
                });
                downloadedFiles.push(file);
            }
        } catch (error) {
            console.warn(`Erreur lors du téléchargement de ${fileName}:`, error);
        }
    }
    
    return downloadedFiles;
}

// Traiter les fichiers téléchargés
async function processDownloadedFiles(files) {
    // Afficher les fichiers téléchargés
    displaySelectedFiles(files);
    
    // Analyser automatiquement les données
    await analyzeData();
}

// Formatage de la taille de fichier
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Analyse des données
async function analyzeData() {
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        alert('Veuillez sélectionner des fichiers JSON');
        return;
    }
    
    showLoading(true);
    
    try {
        console.log('Début de l\'analyse de', files.length, 'fichiers');
        
        // Charger les sessions existantes depuis la base de données
        const existingSessions = await getAllSessions();
        console.log(`📊 Sessions existantes dans la base de données: ${existingSessions.length}`);
        sessionData = [...existingSessions];
        processedData = { overall: {}, byCategory: {}, byDriver: {} };
        
        let newSessionsCount = 0;
        let duplicateSessionsCount = 0;
        let totalSessionsBefore = sessionData.length;
        
        // Lire tous les fichiers JSON
        for (const file of files) {
            console.log('Lecture du fichier:', file.name);
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Vérifier si la session existe déjà
            const sessionId = generateSessionId(data);
            console.log(`Analyse du fichier ${file.name}:`);
            console.log(`- Date: ${data.Date}`);
            console.log(`- Server: ${data.serverName}`);
            console.log(`- ID généré: ${sessionId}`);
            
            const exists = await sessionExists(data);
            
            if (!exists) {
                // Nouvelle session - l'ajouter
                sessionData.push(data);
                await saveSession(data);
                newSessionsCount++;
                console.log(`✅ Nouvelle session ajoutée: ${sessionId}`);
            } else {
                // Session déjà existante
                duplicateSessionsCount++;
                console.log(`⚠️ Session déjà existante ignorée: ${sessionId}`);
            }
        }
        
        console.log('Fichiers lus avec succès, traitement des données...');
        
        // Traiter les données
        processedData = processSessionData(sessionData);
        
        console.log('Données traitées:', processedData);
        
        // Sauvegarder les données traitées dans IndexedDB
        await saveProcessedData(processedData);
        
        // Afficher les fichiers chargés
        displayLoadedFiles();
        
        // Populer la liste des courses
        populateSessionList();
        
        // Afficher les résultats
        displayResults();
        
        // Afficher un message de statut détaillé
        const totalSessionsAfter = sessionData.length;
        console.log(`📈 Résumé de l'analyse:`);
        console.log(`- Sessions avant: ${totalSessionsBefore}`);
        console.log(`- Fichiers uploadés: ${files.length}`);
        console.log(`- Nouvelles sessions: ${newSessionsCount}`);
        console.log(`- Doublons ignorés: ${duplicateSessionsCount}`);
        console.log(`- Sessions totales après: ${totalSessionsAfter}`);
        
        if (newSessionsCount > 0 || duplicateSessionsCount > 0) {
            let message = `📊 Analyse terminée:\n`;
            message += `- Fichiers uploadés: ${files.length}\n`;
            message += `- Sessions avant: ${totalSessionsBefore}\n`;
            message += `- Nouvelles sessions: ${newSessionsCount}\n`;
            if (duplicateSessionsCount > 0) {
                message += `- Doublons ignorés: ${duplicateSessionsCount}\n`;
            }
            message += `- Total sessions: ${totalSessionsAfter}`;
            alert(message);
        }
        
        showLoading(false);
        
    } catch (error) {
        console.error('Erreur détaillée lors de l\'analyse:', error);
        console.error('Stack trace:', error.stack);
        alert('Erreur lors de l\'analyse des données: ' + error.message);
        showLoading(false);
    }
}

// Traitement des données de session
function processSessionData(sessions) {
    const result = {
        byCategory: {},
        byDriver: {},
        overall: {
            totalLaps: 0,
            validLaps: 0,
            bestValidTime: Infinity,
            bestOverallTime: Infinity,
            totalValidTime: 0,
            totalOverallTime: 0,
            // Statistiques wet
            wetLaps: 0,
            wetValidLaps: 0,
            bestWetValidTime: Infinity,
            bestWetOverallTime: Infinity,
            totalWetValidTime: 0,
            totalWetOverallTime: 0
        }
    };
    
    sessions.forEach(session => {
        const laps = session.laps || [];
        const leaderBoard = session.sessionResult?.leaderBoardLines || [];
        const isWetSession = session.sessionResult?.isWetSession === 1;
        
        // Créer un mapping carId -> pilote (avec playerId unique)
        const driverMap = {};
        leaderBoard.forEach(line => {
            const car = line.car;
            const driver = car.drivers[0];
            driverMap[car.carId] = {
                carId: car.carId,
                firstName: driver.firstName,
                lastName: driver.lastName,
                playerId: driver.playerId,
                cupCategory: car.cupCategory,
                categoryName: getCategoryName(car.cupCategory)
            };
        });
        
        // Traiter chaque tour
        laps.forEach(lap => {
            const driver = driverMap[lap.carId];
            if (!driver) return;
            
            const lapTime = lap.laptime;
            const isValid = lap.isValidForBest;
            
            // Initialiser les structures si nécessaire
            if (!result.byCategory[driver.cupCategory]) {
                result.byCategory[driver.cupCategory] = {
                    name: driver.categoryName,
                    totalLaps: 0,
                    validLaps: 0,
                    bestValidTime: Infinity,
                    bestOverallTime: Infinity,
                    totalValidTime: 0,
                    totalOverallTime: 0,
                    drivers: [],
                    // Statistiques wet
                    wetLaps: 0,
                    wetValidLaps: 0,
                    bestWetValidTime: Infinity,
                    bestWetOverallTime: Infinity,
                    totalWetValidTime: 0,
                    totalWetOverallTime: 0
                };
            }
            
            if (!result.byDriver[driver.playerId]) {
                result.byDriver[driver.playerId] = {
                    ...driver,
                    totalLaps: 0,
                    validLaps: 0,
                    bestValidTime: Infinity,
                    bestOverallTime: Infinity,
                    totalValidTime: 0,
                    totalOverallTime: 0,
                    lapTimes: [],
                    // Statistiques wet
                    wetLaps: 0,
                    wetValidLaps: 0,
                    bestWetValidTime: Infinity,
                    bestWetOverallTime: Infinity,
                    totalWetValidTime: 0,
                    totalWetOverallTime: 0
                };
            }
            
            // Mettre à jour les statistiques globales
            result.overall.totalLaps++;
            result.overall.totalOverallTime += lapTime;
            if (isValid) {
                result.overall.validLaps++;
                result.overall.totalValidTime += lapTime;
                if (lapTime < result.overall.bestValidTime) {
                    result.overall.bestValidTime = lapTime;
                }
            }
            if (lapTime < result.overall.bestOverallTime) {
                result.overall.bestOverallTime = lapTime;
            }
            
            // Statistiques wet
            if (isWetSession) {
                result.overall.wetLaps++;
                result.overall.totalWetOverallTime += lapTime;
                if (isValid) {
                    result.overall.wetValidLaps++;
                    result.overall.totalWetValidTime += lapTime;
                    if (lapTime < result.overall.bestWetValidTime) {
                        result.overall.bestWetValidTime = lapTime;
                    }
                }
                if (lapTime < result.overall.bestWetOverallTime) {
                    result.overall.bestWetOverallTime = lapTime;
                }
            }
            
            // Mettre à jour les statistiques par catégorie
            const category = result.byCategory[driver.cupCategory];
            category.totalLaps++;
            category.totalOverallTime += lapTime;
            if (!category.drivers.includes(driver.playerId)) {
                category.drivers.push(driver.playerId);
            }
            if (isValid) {
                category.validLaps++;
                category.totalValidTime += lapTime;
                if (lapTime < category.bestValidTime) {
                    category.bestValidTime = lapTime;
                }
            }
            if (lapTime < category.bestOverallTime) {
                category.bestOverallTime = lapTime;
            }
            
            // Statistiques wet par catégorie
            if (isWetSession) {
                category.wetLaps++;
                category.totalWetOverallTime += lapTime;
                if (isValid) {
                    category.wetValidLaps++;
                    category.totalWetValidTime += lapTime;
                    if (lapTime < category.bestWetValidTime) {
                        category.bestWetValidTime = lapTime;
                    }
                }
                if (lapTime < category.bestWetOverallTime) {
                    category.bestWetOverallTime = lapTime;
                }
            }
            
            // Mettre à jour les statistiques par pilote
            const driverStats = result.byDriver[driver.playerId];
            driverStats.totalLaps++;
            driverStats.totalOverallTime += lapTime;
            driverStats.lapTimes.push({ time: lapTime, valid: isValid, wet: isWetSession });
            if (isValid) {
                driverStats.validLaps++;
                driverStats.totalValidTime += lapTime;
                if (lapTime < driverStats.bestValidTime) {
                    driverStats.bestValidTime = lapTime;
                }
            }
            if (lapTime < driverStats.bestOverallTime) {
                driverStats.bestOverallTime = lapTime;
            }
            
            // Statistiques wet par pilote
            if (isWetSession) {
                driverStats.wetLaps++;
                driverStats.totalWetOverallTime += lapTime;
                if (isValid) {
                    driverStats.wetValidLaps++;
                    driverStats.totalWetValidTime += lapTime;
                    if (lapTime < driverStats.bestWetValidTime) {
                        driverStats.bestWetValidTime = lapTime;
                    }
                }
                if (lapTime < driverStats.bestWetOverallTime) {
                    driverStats.bestWetOverallTime = lapTime;
                }
            }
        });
    });
    
    // Calculer les moyennes
    Object.keys(result.byCategory).forEach(categoryId => {
        const category = result.byCategory[categoryId];
        category.avgValidTime = category.validLaps > 0 ? category.totalValidTime / category.validLaps : 0;
        category.avgOverallTime = category.totalLaps > 0 ? category.totalOverallTime / category.totalLaps : 0;
        category.avgWetValidTime = category.wetValidLaps > 0 ? category.totalWetValidTime / category.wetValidLaps : 0;
        category.avgWetOverallTime = category.wetLaps > 0 ? category.totalWetOverallTime / category.wetLaps : 0;
    });
    
    Object.keys(result.byDriver).forEach(carId => {
        const driver = result.byDriver[carId];
        driver.avgValidTime = driver.validLaps > 0 ? driver.totalValidTime / driver.validLaps : 0;
        driver.avgOverallTime = driver.totalLaps > 0 ? driver.totalOverallTime / driver.totalLaps : 0;
        driver.avgWetValidTime = driver.wetValidLaps > 0 ? driver.totalWetValidTime / driver.wetValidLaps : 0;
        driver.avgWetOverallTime = driver.wetLaps > 0 ? driver.totalWetOverallTime / driver.wetLaps : 0;
    });
    
    result.overall.avgValidTime = result.overall.validLaps > 0 ? result.overall.totalValidTime / result.overall.validLaps : 0;
    result.overall.avgOverallTime = result.overall.totalLaps > 0 ? result.overall.totalOverallTime / result.overall.totalLaps : 0;
    result.overall.avgWetValidTime = result.overall.wetValidLaps > 0 ? result.overall.totalWetValidTime / result.overall.wetValidLaps : 0;
    result.overall.avgWetOverallTime = result.overall.wetLaps > 0 ? result.overall.totalWetOverallTime / result.overall.wetLaps : 0;
    
    return result;
}

// Obtenir le nom de la catégorie
function getCategoryName(cupCategory) {
    switch (cupCategory) {
        case 0: return 'Pro';
        case 2: return 'AM';
        case 3: return 'Silver';
        default: return 'Inconnue';
    }
}

// Obtenir la classe CSS pour la catégorie
function getCategoryClass(cupCategory) {
    switch (cupCategory) {
        case 0: return 'category-pro';
        case 2: return 'category-am';
        case 3: return 'category-silver';
        default: return '';
    }
}

// Charger les préférences
async function loadPreferences() {
    const savedGroupByClass = localStorage.getItem('groupByClass');
    
    if (savedGroupByClass !== null) {
        groupByClass = savedGroupByClass === 'true';
        groupByClassToggle.checked = groupByClass;
    }
    
    // Charger les données depuis IndexedDB
    try {
        const savedSessions = await getAllSessions();
        const savedProcessedData = await getProcessedData();
        
        if (savedSessions.length > 0 && savedProcessedData) {
            sessionData = savedSessions;
            processedData = savedProcessedData;
            
            // Afficher les fichiers chargés
            displayLoadedFiles();
            
            // Populer la liste des courses
            populateSessionList();
            
            // Afficher les résultats
            displayResults();
            
            console.log(`Données chargées depuis IndexedDB: ${savedSessions.length} sessions`);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données depuis IndexedDB:', error);
        // Fallback vers localStorage si IndexedDB échoue
        const savedSessionData = localStorage.getItem('sessionData');
        const savedProcessedData = localStorage.getItem('processedData');
        
        if (savedSessionData && savedProcessedData) {
            try {
                sessionData = JSON.parse(savedSessionData);
                processedData = JSON.parse(savedProcessedData);
                
                displayLoadedFiles();
                populateSessionList();
                displayResults();
                
                console.log('Données chargées depuis le localStorage (fallback)');
            } catch (fallbackError) {
                console.error('Erreur lors du chargement des données (fallback):', fallbackError);
                clearPersistedData();
            }
        }
    }
}

// ===== GESTION DE LA BASE DE DONNÉES INDEXEDDB =====

// Initialiser la base de données IndexedDB
async function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SimRacingDB', 1);
        
        request.onerror = () => {
            console.error('Erreur lors de l\'ouverture de la base de données:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('Base de données IndexedDB initialisée');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            
            // Créer le store pour les sessions
            if (!database.objectStoreNames.contains('sessions')) {
                const sessionStore = database.createObjectStore('sessions', { keyPath: 'id' });
                sessionStore.createIndex('date', 'date', { unique: false });
                sessionStore.createIndex('serverName', 'serverName', { unique: false });
                sessionStore.createIndex('trackName', 'trackName', { unique: false });
            }
            
            // Créer le store pour les données traitées
            if (!database.objectStoreNames.contains('processedData')) {
                database.createObjectStore('processedData', { keyPath: 'id' });
            }
        };
    });
}

// Générer un ID unique basé sur la date et le nom du serveur
function generateSessionId(sessionData) {
    const date = sessionData.Date || sessionData.sessionResult?.sessionDate || sessionData.sessionDate || 'unknown';
    const serverName = sessionData.serverName || 'unknown';
    return `${date}_${serverName}`;
}

// Vérifier si une session existe déjà
async function sessionExists(sessionData) {
    if (!db) return false;
    
    const id = generateSessionId(sessionData);
    const transaction = db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    
    return new Promise((resolve) => {
        const request = store.get(id);
        request.onsuccess = () => {
            resolve(!!request.result);
        };
        request.onerror = () => {
            resolve(false);
        };
    });
}

// Sauvegarder une session dans la base de données
async function saveSession(sessionData) {
    if (!db) return false;
    
    const id = generateSessionId(sessionData);
    const sessionToSave = {
        id: id,
        date: sessionData.Date || sessionData.sessionResult?.sessionDate || sessionData.sessionDate,
        serverName: sessionData.serverName,
        trackName: sessionData.trackName,
        data: sessionData,
        addedAt: new Date().toISOString()
    };
    
    const transaction = db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    
    return new Promise((resolve, reject) => {
        const request = store.put(sessionToSave);
        request.onsuccess = () => {
            console.log(`Session sauvegardée: ${id}`);
            resolve(true);
        };
        request.onerror = () => {
            console.error('Erreur lors de la sauvegarde:', request.error);
            reject(request.error);
        };
    });
}

// Récupérer toutes les sessions de la base de données
async function getAllSessions() {
    if (!db) return [];
    
    const transaction = db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const sessions = request.result.map(item => item.data);
            resolve(sessions);
        };
        request.onerror = () => {
            console.error('Erreur lors de la récupération des sessions:', request.error);
            reject(request.error);
        };
    });
}

// Sauvegarder les données traitées
async function saveProcessedData(processedData) {
    if (!db) return false;
    
    const transaction = db.transaction(['processedData'], 'readwrite');
    const store = transaction.objectStore('processedData');
    
    return new Promise((resolve, reject) => {
        const request = store.put({
            id: 'current',
            data: processedData,
            savedAt: new Date().toISOString()
        });
        request.onsuccess = () => {
            console.log('Données traitées sauvegardées');
            resolve(true);
        };
        request.onerror = () => {
            console.error('Erreur lors de la sauvegarde des données traitées:', request.error);
            reject(request.error);
        };
    });
}

// Récupérer les données traitées
async function getProcessedData() {
    if (!db) return null;
    
    const transaction = db.transaction(['processedData'], 'readonly');
    const store = transaction.objectStore('processedData');
    
    return new Promise((resolve, reject) => {
        const request = store.get('current');
        request.onsuccess = () => {
            resolve(request.result ? request.result.data : null);
        };
        request.onerror = () => {
            console.error('Erreur lors de la récupération des données traitées:', request.error);
            reject(request.error);
        };
    });
}

// Vider la base de données
async function clearDatabase() {
    if (!db) return;
    
    const transaction = db.transaction(['sessions', 'processedData'], 'readwrite');
    
    return new Promise((resolve, reject) => {
        const sessionStore = transaction.objectStore('sessions');
        const processedStore = transaction.objectStore('processedData');
        
        const sessionRequest = sessionStore.clear();
        const processedRequest = processedStore.clear();
        
        let completed = 0;
        const checkComplete = () => {
            completed++;
            if (completed === 2) {
                console.log('Base de données vidée');
                resolve();
            }
        };
        
        sessionRequest.onsuccess = checkComplete;
        processedRequest.onsuccess = checkComplete;
        sessionRequest.onerror = () => reject(sessionRequest.error);
        processedRequest.onerror = () => reject(processedRequest.error);
    });
}

// Toggle groupement par classe
function toggleGroupByClass() {
    groupByClass = groupByClassToggle.checked;
    localStorage.setItem('groupByClass', groupByClass);
    refreshDisplay();
}


// Rafraîchir l'affichage
function refreshDisplay() {
    if (Object.keys(processedData).length > 0) {
        displayResults();
    }
}

// Affichage des résultats
function displayResults() {
    resultsSection.style.display = 'block';
    displayOverallStats();
    displayDriverStats();
    
    // Collapse automatique de la section d'upload
    autoCollapseUploadSection();
}

// Affichage des statistiques globales
function displayOverallStats() {
    const filteredData = getFilteredData();
    const stats = filteredData.overall;
    
    categoryStats.innerHTML = `
        <div class="compact-stats-grid">
            <div class="compact-stat-card">
                <div class="compact-stat-icon">🏁</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Tours totaux</div>
                    <div class="compact-stat-value">${stats.totalLaps}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">✅</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Tours valides</div>
                    <div class="compact-stat-value">${stats.validLaps}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">⚡</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Meilleur valide</div>
                    <div class="compact-stat-value">${formatTime(stats.bestValidTime)}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">📊</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Moyenne valide</div>
                    <div class="compact-stat-value">${formatTime(stats.avgValidTime)}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">🎯</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Meilleur global</div>
                    <div class="compact-stat-value">${formatTime(stats.bestOverallTime)}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">📈</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Moyenne globale</div>
                    <div class="compact-stat-value">${formatTime(stats.avgOverallTime)}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">🌧️</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Tours Wet</div>
                    <div class="compact-stat-value">${stats.wetLaps || 0}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">💧</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Wet valides</div>
                    <div class="compact-stat-value">${stats.wetValidLaps || 0}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">🏆</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Meilleur Wet</div>
                    <div class="compact-stat-value">${stats.bestWetValidTime ? formatTime(stats.bestWetValidTime) : '-'}</div>
                </div>
            </div>
            <div class="compact-stat-card">
                <div class="compact-stat-icon">📉</div>
                <div class="compact-stat-content">
                    <div class="compact-stat-title">Moyenne Wet</div>
                    <div class="compact-stat-value">${stats.avgWetValidTime ? formatTime(stats.avgWetValidTime) : '-'}</div>
                </div>
            </div>
        </div>
    `;
}


// Affichage des statistiques par pilote
function displayDriverStats() {
    const filteredData = getFilteredData();
    let drivers = Object.values(filteredData.byDriver);
    
    // Trier tous les pilotes par meilleur temps valide
    drivers.sort((a, b) => a.bestValidTime - b.bestValidTime);
    
    // Créer le HTML
    let tableHTML = `
        <table class="driver-table" id="driverTable">
            <thead>
                <tr>
                    <th class="sortable" data-sort="name">Pilote <span class="sort-arrow">↕</span></th>
                    <th class="sortable" data-sort="category">Classe <span class="sort-arrow">↕</span></th>
                    <th class="sortable" data-sort="totalLaps">Tours <span class="sort-arrow">↕</span></th>
                    <th class="sortable" data-sort="validLaps">Valides <span class="sort-arrow">↕</span></th>
                    <th class="sortable" data-sort="bestValidTime">Meilleur (valide) <span class="sort-arrow">↕</span></th>
                    <th class="sortable" data-sort="bestOverallTime">Meilleur (tous) <span class="sort-arrow">↕</span></th>
                    <th class="sortable" data-sort="avgValidTime">Moyenne (valide) <span class="sort-arrow">↕</span></th>
                    <th class="sortable" data-sort="avgOverallTime">Moyenne (tous) <span class="sort-arrow">↕</span></th>
                    <th class="sortable" data-sort="bestWetValidTime">Meilleur Wet (valide) <span class="sort-arrow">↕</span></th>
                    <th class="sortable" data-sort="avgWetValidTime">Moyenne Wet (valide) <span class="sort-arrow">↕</span></th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (groupByClass) {
        // Grouper les pilotes par classe
        // Créer les groupes de pilotes par catégorie dans l'ordre souhaité
        const driversByCategory = {};
        const categoryOrder = [0, 3, 2]; // Pro, Silver, AM
        
        // Initialiser les catégories dans l'ordre
        categoryOrder.forEach(catId => {
            driversByCategory[catId] = [];
        });
        
        // Remplir les catégories
        drivers.forEach(driver => {
            const catId = driver.cupCategory;
            if (driversByCategory[catId]) {
                driversByCategory[catId].push(driver);
            }
        });
        
        // Trier les pilotes dans chaque classe par meilleur temps valide
        Object.keys(driversByCategory).forEach(catId => {
            driversByCategory[catId].sort((a, b) => a.bestValidTime - b.bestValidTime);
        });
        
        // Afficher les groupes par classe
        categoryOrder.forEach(catId => {
            if (driversByCategory[catId] && driversByCategory[catId].length > 0) {
                const categoryName = getCategoryName(catId);
                tableHTML += `
                    <tr class="category-header">
                        <td colspan="8" class="category-title">
                            <span class="category-badge ${getCategoryClass(catId)}">${categoryName}</span>
                            <span class="driver-count">${driversByCategory[catId].length} pilote(s)</span>
                        </td>
                    </tr>
                `;
                
                driversByCategory[catId].forEach(driver => {
                    const driverId = `${driver.firstName}_${driver.lastName}_${driver.cupCategory}`;
                    tableHTML += `
                        <tr class="driver-row" data-category="${catId}">
                            <td class="driver-name clickable" onclick="openPilotModal('${driverId}')" style="cursor: pointer; color: #667eea; text-decoration: underline;">${driver.firstName} ${driver.lastName}</td>
                            <td><span class="category-badge ${getCategoryClass(driver.cupCategory)}">${driver.categoryName}</span></td>
                            <td class="sort-value" data-value="${driver.totalLaps}">${driver.totalLaps}</td>
                            <td class="sort-value" data-value="${driver.validLaps}">${driver.validLaps}</td>
                            <td class="sort-value" data-value="${driver.bestValidTime}">${formatTime(driver.bestValidTime)}</td>
                            <td class="sort-value" data-value="${driver.bestOverallTime}">${formatTime(driver.bestOverallTime)}</td>
                            <td class="sort-value" data-value="${driver.avgValidTime}">${formatTime(driver.avgValidTime)}</td>
                            <td class="sort-value" data-value="${driver.avgOverallTime}">${formatTime(driver.avgOverallTime)}</td>
                            <td class="sort-value" data-value="${driver.bestWetValidTime}">${formatTime(driver.bestWetValidTime)}</td>
                            <td class="sort-value" data-value="${driver.avgWetValidTime}">${formatTime(driver.avgWetValidTime)}</td>
                        </tr>
                    `;
                });
            }
        });
    } else {
        // Vue globale - tous les pilotes dans un seul tableau
        drivers.forEach(driver => {
            const driverId = `${driver.firstName}_${driver.lastName}_${driver.cupCategory}`;
            tableHTML += `
                <tr class="driver-row" data-category="${driver.cupCategory}">
                    <td class="driver-name clickable" onclick="openPilotModal('${driverId}')" style="cursor: pointer; color: #667eea; text-decoration: underline;">${driver.firstName} ${driver.lastName}</td>
                    <td><span class="category-badge ${getCategoryClass(driver.cupCategory)}">${driver.categoryName}</span></td>
                    <td class="sort-value" data-value="${driver.totalLaps}">${driver.totalLaps}</td>
                    <td class="sort-value" data-value="${driver.validLaps}">${driver.validLaps}</td>
                    <td class="sort-value" data-value="${driver.bestValidTime}">${formatTime(driver.bestValidTime)}</td>
                    <td class="sort-value" data-value="${driver.bestOverallTime}">${formatTime(driver.bestOverallTime)}</td>
                    <td class="sort-value" data-value="${driver.avgValidTime}">${formatTime(driver.avgValidTime)}</td>
                    <td class="sort-value" data-value="${driver.avgOverallTime}">${formatTime(driver.avgOverallTime)}</td>
                    <td class="sort-value" data-value="${driver.bestWetValidTime}">${formatTime(driver.bestWetValidTime)}</td>
                    <td class="sort-value" data-value="${driver.avgWetValidTime}">${formatTime(driver.avgWetValidTime)}</td>
                </tr>
            `;
        });
    }
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    driverStats.innerHTML = tableHTML;
    
    // Ajouter les événements de tri
    addSortingEvents();
}

// Ajouter les événements de tri
function addSortingEvents() {
    const sortableHeaders = document.querySelectorAll('.sortable');
    let currentSort = { column: null, direction: 'asc' };
    
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortColumn = header.dataset.sort;
            const table = document.getElementById('driverTable');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('.driver-row'));
            
            // Déterminer la direction du tri
            if (currentSort.column === sortColumn) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.direction = 'asc';
            }
            currentSort.column = sortColumn;
            
            // Mettre à jour les flèches
            sortableHeaders.forEach(h => {
                const arrow = h.querySelector('.sort-arrow');
                arrow.textContent = '↕';
                arrow.style.color = '';
            });
            const currentArrow = header.querySelector('.sort-arrow');
            currentArrow.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
            currentArrow.style.color = '#667eea';
            
            // Trier les lignes
            rows.sort((a, b) => {
                let aValue, bValue;
                
                if (sortColumn === 'name') {
                    aValue = a.querySelector('.driver-name').textContent.toLowerCase();
                    bValue = b.querySelector('.driver-name').textContent.toLowerCase();
                } else if (sortColumn === 'category') {
                    aValue = parseInt(a.dataset.category);
                    bValue = parseInt(b.dataset.category);
                } else {
                    // Trouver la cellule avec la bonne colonne
                    const columnIndex = Array.from(header.parentNode.children).indexOf(header);
                    const aCell = a.children[columnIndex];
                    const bCell = b.children[columnIndex];
                    aValue = parseFloat(aCell.dataset.value) || 0;
                    bValue = parseFloat(bCell.dataset.value) || 0;
                }
                
                if (aValue < bValue) return currentSort.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
            
            if (groupByClass) {
                // Réorganiser les lignes en gardant les groupes
                const categoryHeaders = Array.from(tbody.querySelectorAll('.category-header'));
                const categoryGroups = {};
                
                // Grouper les lignes par catégorie
                rows.forEach(row => {
                    const category = row.dataset.category;
                    if (!categoryGroups[category]) {
                        categoryGroups[category] = [];
                    }
                    categoryGroups[category].push(row);
                });
                
                // Vider le tbody
                tbody.innerHTML = '';
                
                // Réinsérer les groupes dans l'ordre
                const sortCategoryOrder = [0, 3, 2]; // Pro, Silver, AM
                sortCategoryOrder.forEach(catId => {
                    const header = categoryHeaders.find(h => h.querySelector(`[data-category="${catId}"]`));
                    if (header && categoryGroups[catId]) {
                        tbody.appendChild(header);
                        categoryGroups[catId].forEach(row => tbody.appendChild(row));
                    }
                });
            } else {
                // Vue globale - réorganiser simplement les lignes
                tbody.innerHTML = '';
                rows.forEach(row => tbody.appendChild(row));
            }
        });
        
        // Style pour indiquer que c'est cliquable
        header.style.cursor = 'pointer';
        header.style.userSelect = 'none';
    });
}

// Formatage du temps (millisecondes vers mm:ss.mmm)
function formatTime(milliseconds) {
    if (milliseconds === Infinity || milliseconds === 0) return '--:--.---';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const ms = Math.round(milliseconds % 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Affichage du loading
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    analyzeBtn.disabled = show;
}

// Sauvegarder les données dans localStorage
function saveDataToStorage() {
    try {
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        localStorage.setItem('processedData', JSON.stringify(processedData));
        console.log('Données sauvegardées dans localStorage');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        // Si le localStorage est plein, on peut essayer de nettoyer
        if (error.name === 'QuotaExceededError') {
            alert('Espace de stockage insuffisant. Les données ne seront pas sauvegardées.');
        }
    }
}

// Afficher les fichiers chargés
function displayLoadedFiles() {
    if (sessionData.length === 0) return;
    
    console.log(`📋 Affichage de ${sessionData.length} sessions dans l'interface`);
    
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
        
        // Debug pour chaque session
        console.log(`  ${index + 1}. ${fileName} - ${sessionId}`);
    });
    
    updateFileCount(sessionData.length);
    
    // Mettre à jour le statut de la base de données
    if (dataStatus) {
        dataStatus.style.display = 'block';
        dataStatus.innerHTML = `
            <div class="status-icon">🗄️</div>
            <span class="status-text">${sessionData.length} session(s) stockée(s) dans la base de données</span>
        `;
    }
    analyzeBtn.disabled = false;
}

// Mettre à jour le compteur de fichiers
function updateFileCount(count) {
    if (count > 0) {
        fileCount.textContent = count;
        fileCount.style.display = 'inline-block';
    } else {
        fileCount.style.display = 'none';
    }
}

// Toggle de la section d'upload
function toggleUploadSection() {
    uploadSection.classList.toggle('collapsed');
}

// Collapse automatique après analyse
function autoCollapseUploadSection() {
    if (sessionData.length > 0) {
        uploadSection.classList.add('collapsed');
    }
}

// Gestion du changement de course
function handleSessionChange() {
    selectedSession = sessionSelect.value;
    applyTrackTheme(selectedSession);
    refreshDisplay();
}

// Appliquer le thème de couleur selon la piste
function applyTrackTheme(trackName) {
    // Supprimer toutes les classes de thème existantes
    document.body.classList.remove('theme-donington', 'theme-nurburgring', 'theme-silverstone', 'theme-spa', 'theme-default');
    
    // Appliquer le thème correspondant
    if (trackName === 'donington') {
        document.body.classList.add('theme-donington');
    } else if (trackName === 'nurburgring') {
        document.body.classList.add('theme-nurburgring');
    } else if (trackName === 'silverstone') {
        document.body.classList.add('theme-silverstone');
    } else if (trackName === 'spa') {
        document.body.classList.add('theme-spa');
    } else {
        document.body.classList.add('theme-default');
    }
}

// Populer la liste des courses
function populateSessionList() {
    sessionSelect.innerHTML = '';
    
    if (sessionData.length > 0) {
        // Grouper les sessions par piste
        const sessionsByTrack = {};
        sessionData.forEach((session) => {
            const trackName = session.trackName || 'Piste inconnue';
            if (!sessionsByTrack[trackName]) {
                sessionsByTrack[trackName] = [];
            }
            sessionsByTrack[trackName].push(session);
        });
        
        // Créer une option par piste
        const trackNames = Object.keys(sessionsByTrack);
        trackNames.forEach(trackName => {
            const trackSessions = sessionsByTrack[trackName];
            const sessionCount = trackSessions.length;
            
            const option = document.createElement('option');
            option.value = trackName;
            option.textContent = `${trackName} (${sessionCount} session${sessionCount > 1 ? 's' : ''})`;
            sessionSelect.appendChild(option);
        });
        
        // Sélectionner par défaut la piste avec les résultats les plus récents
        if (trackNames.length > 0) {
            const mostRecentTrack = getMostRecentTrack(sessionsByTrack);
            selectedSession = mostRecentTrack;
            sessionSelect.value = mostRecentTrack;
            applyTrackTheme(mostRecentTrack);
        }
    } else if (sessionData.length === 1) {
        // Une seule session, sélectionner automatiquement
        const trackName = sessionData[0].trackName || 'Piste inconnue';
        selectedSession = trackName;
        sessionSelect.value = trackName;
        applyTrackTheme(trackName);
    }
}

// Obtenir la piste avec les résultats les plus récents
function getMostRecentTrack(sessionsByTrack) {
    let mostRecentTrack = null;
    let mostRecentDate = new Date(0); // Date très ancienne
    
    Object.keys(sessionsByTrack).forEach(trackName => {
        const trackSessions = sessionsByTrack[trackName];
        
        // Trouver la session la plus récente de cette piste
        trackSessions.forEach(session => {
            if (session.Date) {
                const sessionDate = new Date(session.Date);
                if (sessionDate > mostRecentDate) {
                    mostRecentDate = sessionDate;
                    mostRecentTrack = trackName;
                }
            }
        });
    });
    
    // Si aucune date trouvée, prendre la première piste
    return mostRecentTrack || Object.keys(sessionsByTrack)[0];
}

// Obtenir les données filtrées par course
function getFilteredData() {
    // Vérifier si c'est un nom de piste (toutes les sessions de cette piste)
    const sessionsByTrack = {};
    sessionData.forEach((session, index) => {
        const trackName = session.trackName || 'Piste inconnue';
        if (!sessionsByTrack[trackName]) {
            sessionsByTrack[trackName] = [];
        }
        sessionsByTrack[trackName].push(session);
    });
    
    if (sessionsByTrack[selectedSession]) {
        // Toutes les sessions de cette piste
        return processSessionData(sessionsByTrack[selectedSession]);
    }
    
    // Session spécifique
    const sessionIndex = parseInt(selectedSession);
    if (sessionIndex >= 0 && sessionIndex < sessionData.length) {
        return processSessionData([sessionData[sessionIndex]]);
    }
    
    // Par défaut, retourner toutes les données
    return processedData;
}

// Effacer les données persistées
function clearPersistedData() {
    localStorage.removeItem('sessionData');
    localStorage.removeItem('processedData');
    localStorage.removeItem('groupByClass');
    console.log('Données persistées effacées');
}

// Effacer tout
async function clearAll() {
    try {
        // Vider la base de données IndexedDB
        await clearDatabase();
        
        // Réinitialiser l'interface
        fileInput.value = '';
        fileList.innerHTML = '';
        resultsSection.style.display = 'none';
        analyzeBtn.disabled = true;
        sessionData = [];
        processedData = {};
        
        // Réinitialiser l'affichage
        updateFileCount(0);
        uploadSection.classList.remove('collapsed');
        dataStatus.style.display = 'none';
        
        // Effacer aussi les données persistées du localStorage
        clearPersistedData();
        
        console.log('Toutes les données effacées (IndexedDB + localStorage)');
        alert('✅ Toutes les données ont été effacées avec succès !');
        
    } catch (error) {
        console.error('Erreur lors de l\'effacement des données:', error);
        alert('Erreur lors de l\'effacement des données: ' + error.message);
    }
}

// Ouvrir la modal de détail du pilote
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
    document.getElementById('avgValidTime').textContent = formatTime(pilot.avgValidTime);
    document.getElementById('bestOverallTime').textContent = formatTime(pilot.bestOverallTime);
    document.getElementById('avgOverallTime').textContent = formatTime(pilot.avgOverallTime);
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

// Fermer la modal
function closePilotModal() {
    pilotModal.style.display = 'none';
}

// Obtenir le nom de la catégorie
function getCategoryName(category) {
    const categories = {
        0: 'Pro',
        2: 'AM',
        3: 'Silver'
    };
    return categories[category] || 'Inconnue';
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