// Version publique avec visualisation pour tous et upload admin seulement
let sessionData = [];
let processedData = {};

// Exposer les variables globalement pour les composants
window.sessionData = sessionData;
window.processedData = processedData;
let groupByClass = false;
let selectedSession = '';
let selectedDateFilter = 'all'; // 'all', 'week', 'day'
let isAdmin = false;
let db = null; // Firebase Firestore database

// Variables DOM déclarées plus bas dans le code

// Mot de passe admin simple
const ADMIN_PASSWORD = "admin123";

// Éléments DOM
let fileInput, fileList, analyzeBtn, clearBtn, downloadBtn, resultsSection, loading, categoryStats, driverStats, groupByClassToggle, dataStatus, uploadSection, uploadHeader, uploadContent, fileCount, collapseBtn, sessionSelect, dateFilter, pilotModal, closeModal;
let authSection, adminPassword, loginBtn, logoutBtn, adminControls, authStatus, adminAccessBtn, adminSection, cancelAuthBtn, publicSection;
let adminLayout, adminLoading, analysisResults, resultsStatus, resultsContent;

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
    dateFilter = document.getElementById('dateFilter');
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
    adminSection = document.getElementById('adminSection');
    cancelAuthBtn = document.getElementById('cancelAuthBtn');
    publicSection = document.querySelector('.public-section');
    
    // Nouveaux éléments admin
    adminLayout = document.getElementById('adminLayout');
    adminLoading = document.getElementById('adminLoading');
    analysisResults = document.getElementById('analysisResults');
    resultsStatus = document.getElementById('resultsStatus');
    resultsContent = document.getElementById('resultsContent');
    
    // Éléments de loading
    initialLoading = document.getElementById('initialLoading');

    // Initialiser Firebase
    try {
        const { db: firebaseDb } = await import('./firebase-config.js');
        db = firebaseDb;
        console.log('✅ Firebase initialisé');
    } catch (error) {
        console.log('⚠️ Firebase non disponible, utilisation de localStorage');
    }

    // Event listeners
    if (fileInput) fileInput.addEventListener('change', handleFileSelection);
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeData);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadFromEGT);
    if (groupByClassToggle) groupByClassToggle.addEventListener('change', toggleGroupByClass);
    if (dateFilter) dateFilter.addEventListener('change', handleDateFilterChange);
    if (sessionSelect) sessionSelect.addEventListener('change', handleSessionChange);
    if (collapseBtn) collapseBtn.addEventListener('click', toggleUploadSection);
    if (closeModal) closeModal.addEventListener('click', closePilotModal);
    
    // Authentification
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (adminAccessBtn) adminAccessBtn.addEventListener('click', showAdminAuth);
    if (cancelAuthBtn) cancelAuthBtn.addEventListener('click', hideAdminAuth);
    if (adminPassword) adminPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Fermer la modal en cliquant à l'extérieur
    if (pilotModal) pilotModal.addEventListener('click', function(e) {
        if (e.target === pilotModal) {
            closePilotModal();
        }
    });

    // Masquer les sections admin par défaut
    hideAdminSections();
    
    // Charger les données au démarrage (pour que tout le monde puisse voir)
    loadDataFromStorage();
    
    // Vérifier si on est déjà admin
    checkAdminStatus();
    
    // Initialiser l'état de la checkbox "Grouper par classe"
    if (groupByClassToggle) {
        groupByClassToggle.checked = groupByClass;
    }
    
    // Vérification finale pour s'assurer que les sections admin sont cachées
    setTimeout(() => {
        if (!isAdmin) {
            hideAdminSections();
        }
    }, 100);
    
    // Vérification supplémentaire après un délai plus long
    setTimeout(() => {
        if (!isAdmin) {
            hideAdminSections();
            console.log('🔒 Vérification finale : sections admin masquées');
        }
    }, 500);
});

// Masquer toutes les sections admin
function hideAdminSections() {
    if (adminSection) adminSection.style.display = 'none';
    if (authSection) authSection.style.display = 'none';
    if (adminLayout) adminLayout.style.display = 'none';
    isAdmin = false;
    console.log('🔒 Sections admin masquées');
}

// Afficher l'authentification admin
function showAdminAuth() {
    if (adminSection) adminSection.style.display = 'block';
    if (authSection) authSection.style.display = 'block';
    // S'assurer que le layout admin reste caché
    if (adminLayout) adminLayout.style.display = 'none';
}

function hideAdminAuth() {
    if (adminSection) adminSection.style.display = 'none';
    if (authSection) authSection.style.display = 'none';
    // S'assurer que toutes les sections admin sont masquées
    if (adminControls) adminControls.style.display = 'none';
    if (uploadSection) uploadSection.style.display = 'none';
    isAdmin = false;
    console.log('🔒 Authentification annulée : toutes les sections admin masquées');
}

// Authentification simple
function handleLogin() {
    const password = adminPassword.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        
        // Sauvegarder le statut admin dans localStorage
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        if (authSection) authSection.style.display = 'none';
        if (adminLayout) adminLayout.style.display = 'flex';
        if (authStatus) authStatus.innerHTML = '<div class="auth-status success">✅ Connecté en tant qu\'admin</div>';
        if (adminPassword) adminPassword.value = '';
        
        // Initialiser le panneau de résultats
        updateAnalysisResults('En attente...', 'Aucune analyse effectuée');
        
        // Charger les données depuis le localStorage
        loadDataFromStorage();
    } else {
        if (authStatus) authStatus.innerHTML = '<div class="auth-status error">❌ Mot de passe incorrect</div>';
    }
}

function handleLogout() {
    isAdmin = false;
    
    // Nettoyer le localStorage
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
    
    hideAdminSections();
    if (authStatus) authStatus.innerHTML = '';
    
    // Les données restent visibles pour tous
    loadDataFromStorage();
}

// Vérifier le statut admin au démarrage
function checkAdminStatus() {
    const savedAdminStatus = localStorage.getItem('isAdmin');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    // S'assurer que les sections admin sont cachées par défaut
    hideAdminSections();
    
    if (savedAdminStatus === 'true' && loginTime) {
        // Vérifier si la session n'est pas trop ancienne (24 heures)
        const now = Date.now();
        const sessionAge = now - parseInt(loginTime);
        const maxAge = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
        
        if (sessionAge < maxAge) {
            // Session encore valide, connecter automatiquement
            isAdmin = true;
            if (authSection) authSection.style.display = 'none';
            if (adminControls) adminControls.style.display = 'block';
            if (uploadSection) uploadSection.style.display = 'block';
            console.log('🔐 Reconnexion admin automatique');
        } else {
            // Session expirée, nettoyer
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('adminLoginTime');
            console.log('🔐 Session admin expirée');
        }
    } else {
        // Pas de session admin valide, s'assurer que tout est caché
        isAdmin = false;
        console.log('🔐 Aucune session admin active');
    }
}

// Charger les données depuis Firebase (visible pour tous)
async function loadDataFromStorage() {
    // Afficher le loading initial
    showInitialLoading(true);
    
    // S'assurer que les sections admin restent cachées si pas authentifié
    if (!isAdmin) {
        hideAdminSections();
    }
    
    if (db) {
        // Utiliser Firebase - TOUJOURS charger depuis Firestore (pas de cache local)
        try {
            const { collection, getDocs, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            console.log('🔄 Chargement des données depuis Firestore...');
            
            // Charger les sessions depuis Firestore
            const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
            sessionData = [];
            sessionsSnapshot.forEach(doc => {
                sessionData.push(doc.data());
            });
            
            // Toujours re-traiter les données depuis Firestore pour s'assurer de la cohérence
            if (sessionData.length > 0) {
                console.log('🔄 Traitement des données depuis Firestore...');
                processedData = processSessionData(sessionData);
                
                // Essayer de sauvegarder les données traitées avec la nouvelle méthode
                try {
                    await saveProcessedDataToFirestore(processedData);
                } catch (saveError) {
                    console.warn('⚠️ Impossible de sauvegarder les données traitées:', saveError.message);
                    // Ce n'est pas critique car on retraite toujours depuis les sessions brutes
                }
            } else {
                processedData = { overall: {}, byCategory: {}, byDriver: {} };
            }
            
            // Mettre à jour les variables globales
            window.sessionData = sessionData;
            window.processedData = processedData;
            
            console.log(`📊 ${sessionData.length} sessions chargées depuis Firestore`);
            updateDataStatus('☁️ Firestore (temps réel)');
            
            // Afficher les résultats après le chargement des données
            displayResults();
        } catch (error) {
            console.error('Erreur Firebase:', error);
            // En cas d'erreur Firebase, afficher un message d'erreur au lieu d'utiliser localStorage
            sessionData = [];
            processedData = { overall: {}, byCategory: {}, byDriver: {} };
            showNoDataMessage();
            updateDataStatus('❌ Erreur de connexion Firestore');
            return;
        }
    } else {
        // Si Firebase n'est pas disponible, afficher un message d'erreur
        console.error('Firebase non disponible');
        sessionData = [];
        processedData = { overall: {}, byCategory: {}, byDriver: {} };
        showNoDataMessage();
        updateDataStatus('❌ Firebase non configuré');
        return;
    }
    
    if (sessionData.length > 0) {
        updateSessionSelect(); // Définir selectedSession d'abord
        displayResults(); // Puis afficher les résultats filtrés
    }
    
    // Masquer le loading initial
    showInitialLoading(false);
}

// Fonction supprimée - on utilise maintenant uniquement Firestore pour éviter les incohérences

// Gestion des fichiers
async function handleFileSelection() {
    if (!isAdmin) {
        alert('Seuls les administrateurs peuvent sélectionner des fichiers. Connectez-vous d\'abord.');
        return;
    }
    
    const files = Array.from(fileInput.files);
    
    if (files.length > 0) {
        // Afficher le nombre de fichiers sélectionnés
        if (fileCount) {
            fileCount.textContent = `${files.length} fichier(s) sélectionné(s)`;
            fileCount.style.fontWeight = 'bold';
            fileCount.style.color = '#FF9800';
        }
        
        // Démarrer automatiquement l'analyse
        console.log('🚀 Démarrage automatique de l\'analyse...');
        await analyzeData();
    } else {
        // Réinitialiser l'affichage si aucun fichier
        if (fileCount) {
            fileCount.textContent = '';
        }
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
        }
    }
}

// Mettre à jour le panneau de résultats d'analyse
function updateAnalysisResults(status, content) {
    if (resultsStatus) {
        resultsStatus.textContent = status;
        resultsStatus.className = 'results-status';
        
        if (status.includes('En cours')) {
            resultsStatus.classList.add('processing');
        } else if (status.includes('Succès') || status.includes('Terminé')) {
            resultsStatus.classList.add('success');
        } else if (status.includes('Erreur') || status.includes('Échec')) {
            resultsStatus.classList.add('error');
        }
    }
    
    if (resultsContent) {
        resultsContent.innerHTML = content;
    }
}

// Afficher/masquer le loading admin
function showAdminLoading(show) {
    if (adminLoading) {
        adminLoading.style.display = show ? 'block' : 'none';
    }
}

// Afficher/masquer le loading initial
function showInitialLoading(show) {
    if (initialLoading) {
        initialLoading.style.display = show ? 'flex' : 'none';
    }
}

// Analyser les données
async function analyzeData() {
    if (!isAdmin) {
        updateAnalysisResults('Erreur', 'Seuls les administrateurs peuvent analyser des fichiers. Connectez-vous d\'abord.');
        return;
    }
    
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        updateAnalysisResults('Erreur', 'Veuillez sélectionner des fichiers JSON');
        return;
    }
    
    // Mettre à jour le statut et afficher le loading
    updateAnalysisResults('En cours...', 'Analyse des fichiers en cours...');
    showAdminLoading(true);
    
    try {
        console.log('Début de l\'analyse de', files.length, 'fichiers');
        
        // Charger les sessions existantes depuis Firestore
        console.log('🔄 Chargement des sessions existantes depuis Firestore...');
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
        sessionData = [];
        sessionsSnapshot.forEach(doc => {
            sessionData.push(doc.data());
        });
        
        let newSessionsCount = 0;
        let duplicateSessionsCount = 0;
        
        // Traiter seulement les nouveaux fichiers
        const newSessions = [];
        for (const file of files) {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Vérifier si la session existe déjà
            const sessionId = generateSessionId(data);
            const exists = sessionData.some(session => generateSessionId(session) === sessionId);
            
            if (!exists) {
                newSessions.push(data);
                sessionData.push(data); // Ajouter à la liste complète
                newSessionsCount++;
                console.log(`✅ Nouvelle session: ${sessionId}`);
            } else {
                duplicateSessionsCount++;
                console.log(`⚠️ Doublon ignoré: ${sessionId}`);
            }
        }
        
        // Si il y a de nouvelles sessions, traiter seulement celles-ci et fusionner
        if (newSessions.length > 0) {
            console.log(`🔄 Traitement de ${newSessions.length} nouvelles sessions...`);
            const newProcessedData = processSessionData(newSessions);
            
            // Charger les données traitées existantes
            const existingProcessedData = await loadProcessedDataFromFirestore();
            
            if (existingProcessedData) {
                // Fusionner les nouvelles données avec les existantes
                processedData = mergeProcessedData(existingProcessedData, newProcessedData);
            } else {
                // Si pas de données existantes, traiter tout
                console.log('🔄 Aucune donnée existante, traitement complet...');
                processedData = processSessionData(sessionData);
            }
        } else {
            console.log('📊 Aucune nouvelle session, utilisation des données existantes');
            // Charger les données traitées existantes
            processedData = await loadProcessedDataFromFirestore() || processSessionData(sessionData);
        }
        
        // Mettre à jour les variables globales
        window.sessionData = sessionData;
        window.processedData = processedData;
        
        // Sauvegarder
        await saveDataToStorage();
        
        // Afficher les résultats
        displayResults();
        
        // Après un upload, sélectionner la piste la plus récente
        updateSessionSelect();
        
        // Afficher le résumé dans le panneau de résultats
        const summaryContent = `
            <div class="analysis-summary">
                <h4>✅ Analyse terminée avec succès !</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">Nouvelles sessions:</span>
                        <span class="stat-value success">${newSessionsCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Doublons ignorés:</span>
                        <span class="stat-value warning">${duplicateSessionsCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total sessions:</span>
                        <span class="stat-value info">${sessionData.length}</span>
                    </div>
                </div>
                <div class="summary-actions">
                    <p>Les données ont été analysées et sauvegardées. Vous pouvez maintenant consulter les résultats dans la section principale.</p>
                </div>
            </div>
        `;
        updateAnalysisResults('Succès', summaryContent);
        
    } catch (error) {
        console.error('Erreur lors de l\'analyse des données:', error);
        updateAnalysisResults('Erreur', `Erreur lors de l'analyse des données: ${error.message}`);
    } finally {
        showLoading(false);
        showAdminLoading(false);
    }
}

// Sauvegarder les données traitées par sections
async function saveProcessedDataToFirestore(processedData) {
    const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Sauvegarder chaque section séparément
    const sections = {
        overall: processedData.overall,
        byCategory: processedData.byCategory,
        byDriver: processedData.byDriver
    };
    
    for (const [sectionName, sectionData] of Object.entries(sections)) {
        const docRef = doc(db, 'processedData', sectionName);
        await setDoc(docRef, sectionData);
        console.log(`📊 Section ${sectionName} sauvegardée`);
    }
    
    // Sauvegarder les métadonnées
    const metadata = {
        lastUpdate: new Date().toISOString(),
        totalSessions: Object.keys(processedData.byDriver || {}).length,
        sections: Object.keys(sections)
    };
    await setDoc(doc(db, 'processedData', 'metadata'), metadata);
    console.log('📊 Métadonnées sauvegardées');
}

// Sauvegarder seulement les données essentielles (fallback)
async function saveEssentialDataToFirestore(processedData) {
    const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Créer une version allégée des données
    const essentialData = {
        overall: {
            totalSessions: processedData.overall?.totalSessions || 0,
            totalLaps: processedData.overall?.totalLaps || 0,
            bestTime: processedData.overall?.bestTime || 0
        },
        summary: {
            categories: Object.keys(processedData.byCategory || {}),
            totalDrivers: Object.keys(processedData.byDriver || {}).length,
            lastUpdate: new Date().toISOString()
        }
    };
    
    await setDoc(doc(db, 'processedData', 'essential'), essentialData);
    console.log('📊 Données essentielles sauvegardées (fallback)');
}

// Fusionner les données traitées existantes avec les nouvelles
function mergeProcessedData(existingData, newData) {
    console.log('🔄 Fusion des données traitées...');
    
    const merged = {
        overall: mergeOverallData(existingData.overall, newData.overall),
        byCategory: mergeCategoryData(existingData.byCategory, newData.byCategory),
        byDriver: mergeDriverData(existingData.byDriver, newData.byDriver)
    };
    
    console.log('✅ Données fusionnées avec succès');
    return merged;
}

// Fusionner les données globales
function mergeOverallData(existing, newData) {
    if (!existing) return newData;
    if (!newData) return existing;
    
    return {
        totalSessions: existing.totalSessions + newData.totalSessions,
        totalLaps: existing.totalLaps + newData.totalLaps,
        bestTime: Math.min(existing.bestTime || Infinity, newData.bestTime || Infinity),
        // Ajouter d'autres champs selon vos besoins
        ...existing,
        ...newData,
        totalSessions: existing.totalSessions + newData.totalSessions,
        totalLaps: existing.totalLaps + newData.totalLaps
    };
}

// Fusionner les données par catégorie
function mergeCategoryData(existing, newData) {
    if (!existing) return newData;
    if (!newData) return existing;
    
    const merged = { ...existing };
    
    for (const [category, data] of Object.entries(newData)) {
        if (merged[category]) {
            // Fusionner les données existantes avec les nouvelles
            merged[category] = {
                ...merged[category],
                ...data,
                totalSessions: merged[category].totalSessions + data.totalSessions,
                totalLaps: merged[category].totalLaps + data.totalLaps,
                bestTime: Math.min(merged[category].bestTime || Infinity, data.bestTime || Infinity)
            };
        } else {
            merged[category] = data;
        }
    }
    
    return merged;
}

// Fusionner les données par pilote
function mergeDriverData(existing, newData) {
    if (!existing) return newData;
    if (!newData) return existing;
    
    const merged = { ...existing };
    
    for (const [driverKey, driverData] of Object.entries(newData)) {
        if (merged[driverKey]) {
            // Fusionner les données du pilote existant avec les nouvelles
            merged[driverKey] = {
                ...merged[driverKey],
                ...driverData,
                totalLaps: merged[driverKey].totalLaps + driverData.totalLaps,
                validLaps: merged[driverKey].validLaps + driverData.validLaps,
                wetLaps: merged[driverKey].wetLaps + driverData.wetLaps,
                // Fusionner les lapTimes
                lapTimes: [...(merged[driverKey].lapTimes || []), ...(driverData.lapTimes || [])],
                validLapTimes: [...(merged[driverKey].validLapTimes || []), ...(driverData.validLapTimes || [])],
                wetLapTimes: [...(merged[driverKey].wetLapTimes || []), ...(driverData.wetLapTimes || [])],
                // Recalculer les meilleurs temps
                bestValidTime: Math.min(merged[driverKey].bestValidTime || Infinity, driverData.bestValidTime || Infinity),
                bestWetTime: Math.min(merged[driverKey].bestWetTime || Infinity, driverData.bestWetTime || Infinity),
                // Recalculer les moyennes
                averageValidTime: calculateAverageTime([...(merged[driverKey].validLapTimes || []), ...(driverData.validLapTimes || [])]),
                averageWetTime: calculateAverageTime([...(merged[driverKey].wetLapTimes || []), ...(driverData.wetLapTimes || [])])
            };
        } else {
            merged[driverKey] = driverData;
        }
    }
    
    return merged;
}

// Fonction utilitaire pour calculer la moyenne des temps
function calculateAverageTime(times) {
    if (times.length === 0) return 0;
    const validTimes = times.filter(t => t > 0);
    if (validTimes.length === 0) return 0;
    return validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
}

// Charger les données traitées depuis Firestore
async function loadProcessedDataFromFirestore() {
    const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    try {
        // Essayer de charger les données complètes
        const overallDoc = await getDoc(doc(db, 'processedData', 'overall'));
        const byCategoryDoc = await getDoc(doc(db, 'processedData', 'byCategory'));
        const byDriverDoc = await getDoc(doc(db, 'processedData', 'byDriver'));
        
        if (overallDoc.exists() && byCategoryDoc.exists() && byDriverDoc.exists()) {
            processedData = {
                overall: overallDoc.data(),
                byCategory: byCategoryDoc.data(),
                byDriver: byDriverDoc.data()
            };
            console.log('📊 Données complètes chargées depuis Firestore');
            return true;
        }
        
        // Fallback: charger les données essentielles
        const essentialDoc = await getDoc(doc(db, 'processedData', 'essential'));
        if (essentialDoc.exists()) {
            console.log('📊 Données essentielles chargées depuis Firestore (fallback)');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Erreur lors du chargement des données traitées:', error);
        return false;
    }
}

// Sauvegarder les données
async function saveDataToStorage() {
    if (db) {
        // Sauvegarder sur Firebase
        try {
            const { collection, addDoc, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Sauvegarder les sessions
            const sessionsCollection = collection(db, 'sessions');
            for (const session of sessionData) {
                const sessionId = generateSessionId(session);
                await setDoc(doc(sessionsCollection, sessionId), session);
            }
            
            // Débugger la taille des données avant sauvegarde
            const dataSize = JSON.stringify(processedData).length;
            console.log(`📊 Taille des données traitées: ${(dataSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`📊 Nombre de sessions: ${sessionData.length}`);
            console.log(`📊 Nombre de pilotes: ${Object.keys(processedData.byDriver || {}).length}`);
            
            // Sauvegarder les données traitées par sections pour éviter la limite de 1MB
            if (dataSize > 1000000) { // Si plus de ~1MB
                console.log('⚠️ Données trop volumineuses, utilisation du mode par sections');
                try {
                    await saveProcessedDataToFirestore(processedData);
                } catch (saveError) {
                    console.error('Erreur lors de la sauvegarde par sections:', saveError);
                    // Fallback: essayer de sauvegarder seulement les métadonnées essentielles
                    await saveEssentialDataToFirestore(processedData);
                }
            } else {
                // Si les données sont petites, utiliser l'ancienne méthode
                console.log('✅ Données de taille acceptable, sauvegarde normale');
                await setDoc(doc(db, 'processedData', 'current'), processedData);
            }
            
            console.log('📊 Données sauvegardées sur Firestore');
            updateDataStatus('☁️ Firestore (temps réel)');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde Firestore:', error);
            alert('Erreur lors de la sauvegarde: ' + error.message);
        }
    } else {
        alert('Firebase non disponible - impossible de sauvegarder');
    }
}

// Fonction supprimée - on utilise maintenant uniquement Firestore

// Effacer toutes les données
async function clearAll() {
    if (!isAdmin) {
        alert('Seuls les administrateurs peuvent effacer les données. Connectez-vous d\'abord.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
        return;
    }
    
    try {
        sessionData = [];
        processedData = { overall: {}, byCategory: {}, byDriver: {} };
        
        if (db) {
            // Effacer Firebase
            const { collection, getDocs, doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Supprimer toutes les sessions
            const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
            for (const docSnapshot of sessionsSnapshot.docs) {
                await deleteDoc(docSnapshot.ref);
            }
            
            // Supprimer les données traitées
            // Supprimer tous les documents de données traitées
            const documentsToDelete = ['current', 'overall', 'byCategory', 'byDriver', 'metadata', 'essential'];
            
            for (const docName of documentsToDelete) {
                try {
                    await deleteDoc(doc(db, 'processedData', docName));
                } catch (error) {
                    // Ignorer les erreurs si le document n'existe pas
                    console.log(`📄 Document ${docName} non trouvé (normal)`);
                }
            }
            
            console.log('🗑️ Données Firebase effacées');
        }
        
        // localStorage n'est plus utilisé pour les données (seulement pour le statut admin)
        
        // Réinitialiser l'interface
        if (resultsSection) resultsSection.style.display = 'none';
        if (fileList) fileList.innerHTML = '';
        if (fileInput) fileInput.value = '';
        if (analyzeBtn) analyzeBtn.disabled = true;
        
        alert('Toutes les données ont été effacées');
        
    } catch (error) {
        console.error('Erreur lors de l\'effacement des données:', error);
        alert('Erreur lors de l\'effacement: ' + error.message);
    }
}

// Télécharger depuis EGT
function downloadFromEGT() {
    if (!isAdmin) {
        alert('Seuls les administrateurs peuvent télécharger depuis EGT. Connectez-vous d\'abord.');
        return;
    }
    
    alert('Fonctionnalité de téléchargement EGT à implémenter');
}

// Basculer le groupement par classe
function toggleGroupByClass() {
    if (groupByClassToggle) {
        groupByClass = groupByClassToggle.checked;
        // Plus de sauvegarde dans localStorage - le paramètre reste en mémoire pendant la session
        displayResults();
    }
}

// Afficher les fichiers chargés
function displayLoadedFiles() {
    // S'assurer que les sections admin restent cachées si pas authentifié
    if (!isAdmin) {
        hideAdminSections();
        return; // Ne pas afficher les fichiers si pas admin
    }
    
    // S'assurer que le layout admin est visible
    if (adminLayout) adminLayout.style.display = 'flex';
    
    // Afficher seulement le nombre de fichiers au lieu de la liste complète
    if (fileCount) {
        const totalFiles = sessionData.length;
        const totalLaps = sessionData.reduce((sum, session) => sum + (session.laps ? session.laps.length : 0), 0);
        fileCount.textContent = `${totalFiles} fichier(s) • ${totalLaps} tours`;
        fileCount.style.fontWeight = 'bold';
        fileCount.style.color = '#4CAF50';
    }
    
    // Masquer la liste détaillée des fichiers
    if (fileList) {
        fileList.innerHTML = '';
        fileList.style.display = 'none';
    }
}

// Afficher les résultats
function displayResults() {
    // S'assurer que les sections admin restent cachées si pas authentifié
    if (!isAdmin) {
        hideAdminSections();
    }
    
    // Mettre à jour les variables globales
    window.sessionData = sessionData;
    window.processedData = processedData;
    
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
                <h3>🏁 Total Tours</h3>
                <div class="stat-value">${overall.totalLaps || 0}</div>
            </div>
            <div class="compact-stat-card">
                <h3>✅ Tours Valides</h3>
                <div class="stat-value">${overall.validLaps || 0}</div>
            </div>
            <div class="compact-stat-card">
                <h3>🏆 Meilleur Temps</h3>
                <div class="stat-value">${formatTime(overall.bestValidTime || 0)}</div>
            </div>
            <div class="compact-stat-card">
                <h3>📊 Moyenne</h3>
                <div class="stat-value">${formatTime(overall.averageValidTime || 0)}</div>
            </div>
            <div class="compact-stat-card">
                <h3>🌧️ Tours Wet</h3>
                <div class="stat-value">${overall.wetLaps || 0}</div>
            </div>
            <div class="compact-stat-card">
                <h3>👥 Pilotes</h3>
                <div class="stat-value">${Object.keys(filteredData.byDriver || {}).length}</div>
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
    
    if (groupByClass) {
        displayDriverStatsByClass(byDriver);
    } else {
        displayDriverStatsAll(byDriver);
    }
}

function displayDriverStatsAll(byDriver) {
    let html = '<div class="driver-table-container"><table class="driver-table"><thead><tr>';
    html += '<th>Pos</th>'; // Colonne de position
    html += '<th onclick="sortTable(0, \'text\')" class="sortable">Pilote <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(1, \'text\')" class="sortable">Classe <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(2, \'number\')" class="sortable">Tours <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(3, \'number\')" class="sortable">Tours Valides <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(4, \'time\')" class="sortable">Meilleur valide <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(5, \'time\')" class="sortable">Moyenne valide <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(6, \'percentage\')" class="sortable">Cons. valide <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(7, \'time\')" class="sortable">Meilleur wet <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(8, \'time\')" class="sortable">Moyenne wet <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(9, \'percentage\')" class="sortable">Cons. wet <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(10, \'time\')" class="sortable">Meilleur total <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(11, \'time\')" class="sortable">Moyenne total <span class="sort-indicator">↕</span></th>';
    html += '<th onclick="sortTable(12, \'percentage\')" class="sortable">Cons. total <span class="sort-indicator">↕</span></th>';
    html += '</tr></thead><tbody>';
    
    // Trier les pilotes par meilleur temps valide (les temps à 0 en dernier)
    const sortedDrivers = Object.values(byDriver).sort((a, b) => {
        const timeA = a.bestValidTime || 0;
        const timeB = b.bestValidTime || 0;
        
        // Si les deux temps sont à 0, garder l'ordre original
        if (timeA === 0 && timeB === 0) return 0;
        
        // Si seul A est à 0, A va en dernier
        if (timeA === 0) return 1;
        
        // Si seul B est à 0, B va en dernier
        if (timeB === 0) return -1;
        
        // Sinon, trier normalement par temps
        return timeA - timeB;
    });
    
    sortedDrivers.forEach((driver, index) => {
        const position = index + 1; // Position commence à 1
        const categoryClass = getCategoryClass(parseInt(driver.cupCategory));
        html += `<tr onclick="openPilotModal('${driver.firstName}_${driver.lastName}_${driver.cupCategory}')">`;
        html += `<td>${position}</td>`; // Colonne de position
        html += `<td>${driver.firstName} ${driver.lastName}</td>`;
        html += `<td><span class="category-badge ${categoryClass}">${getCategoryName(parseInt(driver.cupCategory))}</span></td>`;
        html += `<td data-value="${driver.totalLaps || 0}">${driver.totalLaps || 0}</td>`;
        html += `<td data-value="${driver.validLaps || 0}">${driver.validLaps || 0}</td>`;
        html += `<td data-value="${driver.bestValidTime || 0}">${formatTime(driver.bestValidTime || 0)}</td>`;
        html += `<td data-value="${driver.averageValidTime || 0}">${formatTime(driver.averageValidTime || 0)}</td>`;
        
        // Consistance valide
        const validConsistency = calculateConsistency(driver.validLapTimes || [], driver.bestValidTime, driver.averageValidTime);
        // Debug log
        console.log(`Consistance valide pour ${driver.firstName} ${driver.lastName}:`, {
            validLapTimes: driver.validLapTimes?.length || 0,
            bestValidTime: driver.bestValidTime,
            averageValidTime: driver.averageValidTime,
            result: validConsistency
        });
        html += `<td data-value="${validConsistency}">${validConsistency}%</td>`;
        
        html += `<td data-value="${driver.bestWetTime || 0}">${formatTime(driver.bestWetTime || 0)}</td>`;
        html += `<td data-value="${driver.averageWetTime || 0}">${formatTime(driver.averageWetTime || 0)}</td>`;
        
        // Consistance wet
        const wetConsistency = calculateConsistency(driver.wetLapTimes || [], driver.bestWetTime, driver.averageWetTime);
        // Debug log
        console.log(`Consistance wet pour ${driver.firstName} ${driver.lastName}:`, {
            wetLapTimes: driver.wetLapTimes?.length || 0,
            bestWetTime: driver.bestWetTime,
            averageWetTime: driver.averageWetTime,
            result: wetConsistency
        });
        html += `<td data-value="${wetConsistency}">${wetConsistency}%</td>`;
        
        html += `<td data-value="${driver.bestOverallTime || 0}">${formatTime(driver.bestOverallTime || 0)}</td>`;
        html += `<td data-value="${driver.averageOverallTime || 0}">${formatTime(driver.averageOverallTime || 0)}</td>`;
        
        // Consistance total
        const totalConsistency = calculateConsistency(driver.allLapTimes || [], driver.bestOverallTime, driver.averageOverallTime);
        // Debug log
        console.log(`Consistance total pour ${driver.firstName} ${driver.lastName}:`, {
            allLapTimes: driver.allLapTimes?.length || 0,
            bestOverallTime: driver.bestOverallTime,
            averageOverallTime: driver.averageOverallTime,
            result: totalConsistency
        });
        html += `<td data-value="${totalConsistency}">${totalConsistency}%</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    driverStats.innerHTML = html;
}

function displayDriverStatsByClass(byDriver) {
    // Grouper les pilotes par classe
    const driversByClass = {};
    Object.values(byDriver).forEach(driver => {
        const category = driver.cupCategory;
        if (!driversByClass[category]) {
            driversByClass[category] = [];
        }
        driversByClass[category].push(driver);
    });
    
    let html = '<div class="driver-table-container">';
    
    // Afficher chaque classe séparément dans l'ordre souhaité
    const categoryOrder = [0, 3, 2]; // Pro, Silver, Amateur
    const sortedCategories = Object.keys(driversByClass).sort((a, b) => {
        const aIndex = categoryOrder.indexOf(parseInt(a));
        const bIndex = categoryOrder.indexOf(parseInt(b));
        return aIndex - bIndex;
    });
    
    sortedCategories.forEach(category => {
        const drivers = driversByClass[category].sort((a, b) => {
            const timeA = a.bestValidTime || 0;
            const timeB = b.bestValidTime || 0;
            
            // Si les deux temps sont à 0, garder l'ordre original
            if (timeA === 0 && timeB === 0) return 0;
            
            // Si seul A est à 0, A va en dernier
            if (timeA === 0) return 1;
            
            // Si seul B est à 0, B va en dernier
            if (timeB === 0) return -1;
            
            // Sinon, trier normalement par temps
            return timeA - timeB;
        });
        const categoryNumber = parseInt(category); // Convertir en nombre
        const categoryClass = getCategoryClass(categoryNumber);
        const categoryName = getCategoryName(categoryNumber);
        
        html += `<div class="category-section">`;
        html += `<h3 class="category-title"><span class="category-badge ${categoryClass}">${categoryName}</span></h3>`;
        html += `<table class="driver-table"><thead><tr>`;
        html += '<th>Pos</th>'; // Colonne de position
        html += '<th onclick="sortTable(0, \'text\')" class="sortable">Pilote <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(1, \'number\')" class="sortable">Tours <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(2, \'number\')" class="sortable">Tours Valides <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(3, \'time\')" class="sortable">Meilleur valide <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(4, \'time\')" class="sortable">Moyenne valide <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(5, \'percentage\')" class="sortable">Cons. valide <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(6, \'time\')" class="sortable">Meilleur wet <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(7, \'time\')" class="sortable">Moyenne wet <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(8, \'percentage\')" class="sortable">Cons. wet <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(9, \'time\')" class="sortable">Meilleur total <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(10, \'time\')" class="sortable">Moyenne total <span class="sort-indicator">↕</span></th>';
        html += '<th onclick="sortTable(11, \'percentage\')" class="sortable">Cons. total <span class="sort-indicator">↕</span></th>';
        html += '</tr></thead><tbody>';
        
        drivers.forEach((driver, index) => {
            const position = index + 1; // Position dans la catégorie
            html += `<tr onclick="openPilotModal('${driver.firstName}_${driver.lastName}_${driver.cupCategory}')">`;
            html += `<td>${position}</td>`; // Colonne de position
            html += `<td>${driver.firstName} ${driver.lastName}</td>`;
            html += `<td data-value="${driver.totalLaps || 0}">${driver.totalLaps || 0}</td>`;
            html += `<td data-value="${driver.validLaps || 0}">${driver.validLaps || 0}</td>`;
            html += `<td data-value="${driver.bestValidTime || 0}">${formatTime(driver.bestValidTime || 0)}</td>`;
            html += `<td data-value="${driver.averageValidTime || 0}">${formatTime(driver.averageValidTime || 0)}</td>`;
            
            // Consistance valide
            const validConsistency = calculateConsistency(driver.validLapTimes || [], driver.bestValidTime, driver.averageValidTime);
            // Debug log
            console.log(`Consistance valide pour ${driver.firstName} ${driver.lastName}:`, {
                validLapTimes: driver.validLapTimes?.length || 0,
                bestValidTime: driver.bestValidTime,
                averageValidTime: driver.averageValidTime,
                result: validConsistency
            });
            html += `<td data-value="${validConsistency}">${validConsistency}%</td>`;
            
            html += `<td data-value="${driver.bestWetTime || 0}">${formatTime(driver.bestWetTime || 0)}</td>`;
            html += `<td data-value="${driver.averageWetTime || 0}">${formatTime(driver.averageWetTime || 0)}</td>`;
            
            // Consistance wet
            const wetConsistency = calculateConsistency(driver.wetLapTimes || [], driver.bestWetTime, driver.averageWetTime);
            // Debug log
            console.log(`Consistance wet pour ${driver.firstName} ${driver.lastName}:`, {
                wetLapTimes: driver.wetLapTimes?.length || 0,
                bestWetTime: driver.bestWetTime,
                averageWetTime: driver.averageWetTime,
                result: wetConsistency
            });
            html += `<td data-value="${wetConsistency}">${wetConsistency}%</td>`;
            
            html += `<td data-value="${driver.bestOverallTime || 0}">${formatTime(driver.bestOverallTime || 0)}</td>`;
            html += `<td data-value="${driver.averageOverallTime || 0}">${formatTime(driver.averageOverallTime || 0)}</td>`;
            
            // Consistance total
            const totalConsistency = calculateConsistency(driver.allLapTimes || [], driver.bestOverallTime, driver.averageOverallTime);
            // Debug log
            console.log(`Consistance total pour ${driver.firstName} ${driver.lastName}:`, {
                allLapTimes: driver.allLapTimes?.length || 0,
                bestOverallTime: driver.bestOverallTime,
                averageOverallTime: driver.averageOverallTime,
                result: totalConsistency
            });
            html += `<td data-value="${totalConsistency}">${totalConsistency}%</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
    });
    
    html += '</div>';
    driverStats.innerHTML = html;
}

// Fonctions utilitaires
function getFilteredData() {
    // Toujours commencer avec toutes les sessions
    let filteredSessions = [...sessionData];
    let hasFilters = false;
    
    // Filtrer par piste
    if (selectedSession && selectedSession !== 'all') {
        filteredSessions = filteredSessions.filter(session => session.trackName === selectedSession);
        hasFilters = true;
    }
    
    // Filtrer par date
    if (selectedDateFilter !== 'all') {
        const now = new Date();
        const cutoffDate = new Date();
        
        switch (selectedDateFilter) {
            case 'week':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'day':
                cutoffDate.setDate(now.getDate() - 1);
                break;
        }
        
        filteredSessions = filteredSessions.filter(session => {
            const sessionDate = parseSessionDate(session.fileName || session.SessionFile);
            return sessionDate && sessionDate >= cutoffDate;
        });
        hasFilters = true;
    }
    
    // Si des filtres sont appliqués, retraiter les données
    if (hasFilters) {
        const processed = processSessionData(filteredSessions);
        return {
            ...processed,
            sessionData: filteredSessions
        };
    }
    
    // Aucun filtre appliqué, retourner les données originales
    return {
        ...processedData,
        sessionData: sessionData
    };
}

// Fonction pour parser la date d'une session depuis le nom de fichier
function parseSessionDate(fileName) {
    if (!fileName) return null;
    
    // Format attendu: YYMMDD_HHMMSS_FP.json
    const match = fileName.match(/(\d{6})_(\d{6})/);
    if (match) {
        const dateStr = match[1];
        const timeStr = match[2];
        
        const year = 2000 + parseInt(dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4)) - 1; // Les mois commencent à 0
        const day = parseInt(dateStr.substring(4, 6));
        const hour = parseInt(timeStr.substring(0, 2));
        const minute = parseInt(timeStr.substring(2, 4));
        const second = parseInt(timeStr.substring(4, 6));
        
        return new Date(year, month, day, hour, minute, second);
    }
    
    return null;
}

// Gestionnaire pour le changement de filtre de dates
function handleDateFilterChange() {
    if (dateFilter) {
        selectedDateFilter = dateFilter.value;
        displayResults();
        console.log(`📅 Filtre de dates changé: ${selectedDateFilter}`);
    }
}

// Rendre les fonctions accessibles globalement pour pilot-modal.js
window.getFilteredData = getFilteredData;
window.formatTime = formatTime;
window.getCategoryName = getCategoryName;
window.getCategoryClass = getCategoryClass;

// Rendre selectedSession accessible
Object.defineProperty(window, 'selectedSession', {
    get: function() { return selectedSession; },
    set: function(value) { selectedSession = value; }
});

// Rendre les fonctions accessibles globalement
window.sortTable = sortTable;
window.calculateConsistency = calculateConsistency;

function formatTime(milliseconds) {
    if (!milliseconds || milliseconds === 0) return '--:--.---';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.round(milliseconds % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Calculer le pourcentage de consistance
 * @param {Array} lapTimes - Tableau des temps de tour
 * @param {number} bestTime - Meilleur temps
 * @param {number} averageTime - Temps moyen
 * @returns {number} Pourcentage de consistance
 */
function calculateConsistency(lapTimes, bestTime, averageTime) {
    if (!lapTimes || lapTimes.length === 0 || !bestTime || !averageTime || averageTime === 0) {
        return 0;
    }
    
    // Calculer l'écart type
    const variance = lapTimes.reduce((sum, time) => {
        const diff = time - averageTime;
        return sum + (diff * diff);
    }, 0) / lapTimes.length;
    
    const standardDeviation = Math.sqrt(variance);
    
    // Calculer le coefficient de variation (écart type / moyenne)
    const coefficientOfVariation = standardDeviation / averageTime;
    
    // Consistance = (1 - coefficient_de_variation) * 100
    // Mais on ajuste pour avoir des résultats plus réalistes
    const consistency = Math.max(0, Math.min(100, (1 - coefficientOfVariation * 2) * 100));
    
    return Math.round(consistency * 100) / 100; // Arrondir à 2 décimales
}

function getCategoryName(category) {
    switch (category) {
        case 0: return 'PRO';
        case 2: return 'AMATEUR';
        case 3: return 'SILVER';
        default: return `Catégorie ${category}`;
    }
}

function getCategoryClass(category) {
    switch (category) {
        case 0: return 'category-pro';
        case 2: return 'category-amateur';
        case 3: return 'category-silver';
        default: return 'category-default';
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
            // Préserver le fileName pour la modal pilote
            const sessionFileName = session.fileName || session.SessionFile || 'Unknown';
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
            
            // Détecter si la session est wet (peut être true/false ou 1/0)
            const isWetSession = session.sessionResult?.isWetSession === true || 
                                session.sessionResult?.isWetSession === 1 || 
                                session.sessionResult?.isWetSession === "1" ||
                                session.isWetSession === true || 
                                session.isWetSession === 1 || 
                                session.isWetSession === "1";
            // console.log(`🌧️ Session ${session.trackName}: sessionResult.isWetSession = ${session.sessionResult?.isWetSession}, session.isWetSession = ${session.isWetSession}, detected = ${isWetSession}`);
            
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
                            bestWetTime: 0,
                            averageWetTime: 0,
                            totalLaps: 0,
                            validLaps: 0,
                            wetLaps: 0,
                            totalTime: 0,
                            validTime: 0,
                            wetTime: 0,
                            // Tableaux de temps pour le calcul de consistance
                            validLapTimes: [],
                            wetLapTimes: [],
                            allLapTimes: [],
                            lapTimes: []
                        };
                    }
                    
                    // Utiliser isWetSession pour déterminer si le tour est wet
                    const isWet = isWetSession;
                    
                    // Ajouter le tour à la liste avec les segments
                    result.byDriver[driverId].lapTimes.push({
                        time: lap.laptime,
                        isValid: lap.isValidForBest,
                        isWet: isWet,
                        splits: lap.splits || [], // Ajouter les segments
                        sessionDate: sessionFileName // Ajouter la date de session
                    });
                    
                    // Mettre à jour les statistiques
                    result.byDriver[driverId].totalLaps++;
                    result.byDriver[driverId].totalTime += lap.laptime;
                    result.byDriver[driverId].allLapTimes.push(lap.laptime);
                    
                    if (isWet) {
                        result.byDriver[driverId].wetLaps++;
                        result.byDriver[driverId].wetTime += lap.laptime;
                        result.byDriver[driverId].wetLapTimes.push(lap.laptime);
                        
                        if (result.byDriver[driverId].bestWetTime === 0 || lap.laptime < result.byDriver[driverId].bestWetTime) {
                            result.byDriver[driverId].bestWetTime = lap.laptime;
                        }
                        // console.log(`🌧️ Tour wet ajouté pour ${driverInfo.firstName} ${driverInfo.lastName}: ${result.byDriver[driverId].wetLaps} tours wet`);
                    }
                    
                    if (lap.isValidForBest) {
                        result.byDriver[driverId].validLaps++;
                        result.byDriver[driverId].validTime += lap.laptime;
                        result.byDriver[driverId].validLapTimes.push(lap.laptime);
                        
                        if (result.byDriver[driverId].bestValidTime === 0 || lap.laptime < result.byDriver[driverId].bestValidTime) {
                            result.byDriver[driverId].bestValidTime = lap.laptime;
                        }
                    }
                    
                    if (result.byDriver[driverId].bestOverallTime === 0 || lap.laptime < result.byDriver[driverId].bestOverallTime) {
                        result.byDriver[driverId].bestOverallTime = lap.laptime;
                    }
                }
            });
            
            // Ajouter le fileName à la session pour la modal pilote
            session.fileName = sessionFileName;
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
        if (driver.wetLaps > 0) {
            driver.averageWetTime = driver.wetTime / driver.wetLaps;
        }
    });
    
    // Calculer les statistiques globales
    const allDrivers = Object.values(result.byDriver);
    if (allDrivers.length > 0) {
        result.overall.bestValidTime = Math.min(...allDrivers.map(d => d.bestValidTime || Infinity));
        result.overall.bestOverallTime = Math.min(...allDrivers.map(d => d.bestOverallTime || Infinity));
        result.overall.totalLaps = allDrivers.reduce((sum, d) => sum + d.totalLaps, 0);
        result.overall.validLaps = allDrivers.reduce((sum, d) => sum + d.validLaps, 0);
        result.overall.wetLaps = allDrivers.reduce((sum, d) => sum + (d.wetLaps || 0), 0);
        // console.log(`🌧️ Tours wet globaux calculés: ${result.overall.wetLaps}`);
        
        // Calculer les moyennes globales
        if (result.overall.validLaps > 0) {
            result.overall.averageValidTime = allDrivers.reduce((sum, d) => sum + d.validTime, 0) / result.overall.validLaps;
        }
        if (result.overall.totalLaps > 0) {
            result.overall.averageOverallTime = allDrivers.reduce((sum, d) => sum + d.totalTime, 0) / result.overall.totalLaps;
        }
    }
    
    // Calculer les statistiques globales des segments
    result.globalSegmentStats = calculateGlobalSegmentStats(result);
    
    return result;
}

// Générer un ID unique pour une session
function generateSessionId(session) {
    const trackName = session.trackName || 'Unknown';
    const date = session.Date || new Date().toISOString();
    return `${trackName}_${date}`;
}

// Afficher le message "aucune donnée"
function showNoDataMessage() {
    if (driverStats) {
        driverStats.innerHTML = `
            <div class="no-data-message">
                <div class="no-data-icon">📊</div>
                <h3>Aucune donnée disponible</h3>
                <p>Uploadez des fichiers JSON pour commencer l'analyse des performances.</p>
            </div>
        `;
    }
}

// Mettre à jour le statut des données
function updateDataStatus(status) {
    if (dataStatus) {
        dataStatus.style.display = 'block';
        const statusText = dataStatus.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = status;
        }
    }
}

// Afficher/masquer le loading
function showLoading(show) {
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

// Basculer la section d'upload
function toggleUploadSection() {
    if (uploadContent && collapseBtn) {
        const isCollapsed = uploadContent.style.display === 'none';
        uploadContent.style.display = isCollapsed ? 'block' : 'none';
        const icon = collapseBtn.querySelector('.collapse-icon');
        if (icon) {
            icon.textContent = isCollapsed ? '▼' : '▲';
        }
    }
}

// Gérer le changement de session
function handleSessionChange() {
    if (sessionSelect) {
        selectedSession = sessionSelect.value;
        applyTrackTheme(selectedSession);
        displayResults();
        console.log(`🏁 Piste changée: ${selectedSession}`);
    }
}

// Obtenir la piste avec la session la plus récente
function getMostRecentTrack() {
    if (!sessionData || sessionData.length === 0) return null;
    
    let mostRecentTrack = null;
    let mostRecentDate = new Date(0); // Date très ancienne
    
    sessionData.forEach(session => {
        if (session.Date) {
            const sessionDate = new Date(session.Date);
            if (sessionDate > mostRecentDate) {
                mostRecentDate = sessionDate;
                mostRecentTrack = session.trackName;
            }
        }
    });
    
    return mostRecentTrack;
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
    
    console.log(`🎨 Thème appliqué: ${trackName}`);
}

// Mettre à jour le sélecteur de sessions
function updateSessionSelect() {
    if (!sessionSelect) return;
    
    // S'assurer que les sections admin restent cachées si pas authentifié
    if (!isAdmin) {
        hideAdminSections();
    }
    
    // Obtenir toutes les pistes uniques
    const uniqueTracks = [...new Set(sessionData.map(session => session.trackName))];
    
    if (uniqueTracks.length > 0) {
        // Vider le sélecteur
        sessionSelect.innerHTML = '';
        
        // Ajouter toutes les pistes disponibles
        uniqueTracks.forEach(track => {
            const option = document.createElement('option');
            option.value = track;
            option.textContent = track;
            sessionSelect.appendChild(option);
        });
        
        // Sélectionner automatiquement la piste avec la session la plus récente
        const mostRecentTrack = getMostRecentTrack();
        if (mostRecentTrack) {
            selectedSession = mostRecentTrack;
            sessionSelect.value = mostRecentTrack;
            applyTrackTheme(mostRecentTrack);
            console.log(`🏁 Piste sélectionnée automatiquement: ${mostRecentTrack}`);
        } else {
            // Si pas de piste récente, sélectionner la première
            selectedSession = uniqueTracks[0];
            sessionSelect.value = selectedSession;
            applyTrackTheme(selectedSession);
            console.log(`🏁 Première piste sélectionnée: ${selectedSession}`);
        }
    } else {
        sessionSelect.innerHTML = '<option value="">Aucune piste disponible</option>';
    }
}

// Fonctions de modal - Maintenant dans pilot-modal.js

// Fonctions de modal supprimées - Maintenant dans pilot-modal.js

// Les fonctions de modal seront initialisées par les composants
console.log('🔄 Attente de l\'initialisation des composants...');

// Variables pour le tri
let currentSortColumn = -1;
let currentSortDirection = 'asc';

// Fonction de tri des colonnes
function sortTable(columnIndex, dataType) {
    // Trouver toutes les tables de pilotes
    const tables = document.querySelectorAll('.driver-table');
    if (tables.length === 0) return;
    
    // Déterminer la direction du tri
    if (currentSortColumn === columnIndex) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortDirection = 'asc';
        currentSortColumn = columnIndex;
    }
    
    // Trier chaque table
    tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Trier les lignes
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].getAttribute('data-value') || a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].getAttribute('data-value') || b.cells[columnIndex].textContent.trim();
            
            let comparison = 0;
            
            switch (dataType) {
                case 'number':
                    comparison = parseFloat(aValue) - parseFloat(bValue);
                    break;
                case 'time':
                    // Pour les temps, on compare les valeurs numériques (millisecondes)
                    const timeA = parseFloat(aValue);
                    const timeB = parseFloat(bValue);
                    
                    // Si les deux temps sont à 0, garder l'ordre original
                    if (timeA === 0 && timeB === 0) {
                        comparison = 0;
                    }
                    // Si seul A est à 0, A va en dernier
                    else if (timeA === 0) {
                        comparison = 1;
                    }
                    // Si seul B est à 0, B va en dernier
                    else if (timeB === 0) {
                        comparison = -1;
                    }
                    // Sinon, trier normalement par temps
                    else {
                        comparison = timeA - timeB;
                    }
                    break;
                case 'percentage':
                    // Pour les pourcentages, on compare les valeurs numériques
                    const percentA = parseFloat(aValue.replace('%', ''));
                    const percentB = parseFloat(bValue.replace('%', ''));
                    
                    // Si les deux pourcentages sont à 0, garder l'ordre original
                    if (percentA === 0 && percentB === 0) {
                        comparison = 0;
                    }
                    // Si seul A est à 0, A va en dernier (0% est la pire consistance)
                    else if (percentA === 0) {
                        comparison = 1;
                    }
                    // Si seul B est à 0, B va en dernier
                    else if (percentB === 0) {
                        comparison = -1;
                    }
                    // Sinon, trier normalement par pourcentage
                    else {
                        comparison = percentA - percentB;
                    }
                    break;
                case 'text':
                default:
                    comparison = aValue.localeCompare(bValue);
                    break;
            }
            
            return currentSortDirection === 'asc' ? comparison : -comparison;
        });
        
        // Réorganiser les lignes dans le DOM
        rows.forEach(row => tbody.appendChild(row));
    });
    
    // Mettre à jour les indicateurs de tri
    updateSortIndicators(columnIndex, currentSortDirection);
}

// Mettre à jour les indicateurs de tri
function updateSortIndicators(activeColumn, direction) {
    const indicators = document.querySelectorAll('.sort-indicator');
    indicators.forEach((indicator, index) => {
        if (index === activeColumn) {
            indicator.textContent = direction === 'asc' ? '↑' : '↓';
            indicator.style.color = '#667eea';
        } else {
            indicator.textContent = '↕';
            indicator.style.color = '#999';
        }
    });
}

/**
 * Calculer les statistiques globales des segments (toutes catégories et par catégorie)
 * @param {Object} data - Données traitées
 * @returns {Object} Statistiques des segments
 */
function calculateGlobalSegmentStats(data) {
    const segmentStats = {
        global: { allS1: [], allS2: [], allS3: [] }, // Toutes catégories confondues
        byCategory: {} // Par catégorie
    };
    
    // Collecter tous les segments de tous les pilotes
    Object.values(data.byDriver).forEach(driver => {
        const category = driver.cupCategory;
        
        // Initialiser la catégorie si nécessaire
        if (!segmentStats.byCategory[category]) {
            segmentStats.byCategory[category] = {
                allS1: [],
                allS2: [],
                allS3: []
            };
        }
        
        // Collecter tous les segments valides
        if (driver.lapTimes) {
            driver.lapTimes.forEach(lap => {
                if (lap.splits && lap.splits.length >= 3 && lap.isValid) {
                    // Ajouter aux statistiques globales (toutes catégories)
                    segmentStats.global.allS1.push(lap.splits[0]);
                    segmentStats.global.allS2.push(lap.splits[1]);
                    segmentStats.global.allS3.push(lap.splits[2]);
                    
                    // Ajouter aux statistiques par catégorie
                    segmentStats.byCategory[category].allS1.push(lap.splits[0]);
                    segmentStats.byCategory[category].allS2.push(lap.splits[1]);
                    segmentStats.byCategory[category].allS3.push(lap.splits[2]);
                }
            });
        }
    });
    
    // Calculer les statistiques globales (toutes catégories)
    const globalStats = segmentStats.global;
    if (globalStats.allS1.length > 0) {
        globalStats.bestS1 = Math.min(...globalStats.allS1);
        globalStats.avgS1 = globalStats.allS1.reduce((sum, time) => sum + time, 0) / globalStats.allS1.length;
    }
    
    if (globalStats.allS2.length > 0) {
        globalStats.bestS2 = Math.min(...globalStats.allS2);
        globalStats.avgS2 = globalStats.allS2.reduce((sum, time) => sum + time, 0) / globalStats.allS2.length;
    }
    
    if (globalStats.allS3.length > 0) {
        globalStats.bestS3 = Math.min(...globalStats.allS3);
        globalStats.avgS3 = globalStats.allS3.reduce((sum, time) => sum + time, 0) / globalStats.allS3.length;
    }
    
    // Calculer les statistiques pour chaque catégorie
    Object.keys(segmentStats.byCategory).forEach(category => {
        const stats = segmentStats.byCategory[category];
        
        if (stats.allS1.length > 0) {
            stats.bestS1 = Math.min(...stats.allS1);
            stats.avgS1 = stats.allS1.reduce((sum, time) => sum + time, 0) / stats.allS1.length;
        }
        
        if (stats.allS2.length > 0) {
            stats.bestS2 = Math.min(...stats.allS2);
            stats.avgS2 = stats.allS2.reduce((sum, time) => sum + time, 0) / stats.allS2.length;
        }
        
        if (stats.allS3.length > 0) {
            stats.bestS3 = Math.min(...stats.allS3);
            stats.avgS3 = stats.allS3.reduce((sum, time) => sum + time, 0) / stats.allS3.length;
        }
    });
    
    console.log('Statistiques globales des segments calculées:', segmentStats);
    return segmentStats;
}

