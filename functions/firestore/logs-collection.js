/**
 * Firestore Logs Collection - Gestion des logs de scraping
 */

const admin = require('firebase-admin');

/**
 * Crée un log de run de scraping
 * @param {Object} runData - Données du run
 * @returns {Promise<string>} ID du log créé
 */
async function createScrapingLog(runData) {
    try {
        const logEntry = {
        timestamp: new Date(), // Utiliser Date.now() au lieu de serverTimestamp() pour éviter les doublons
        runId: generateRunId(),
        status: runData.status || 'started', // started, completed, failed
        trigger: runData.trigger || 'scheduled', // scheduled, manual
        
        // Données du scraping
        scraping: {
            totalSessionsFound: runData.totalSessionsFound || 0,
            newSessionsFound: runData.newSessionsFound || 0,
            existingSessionsIgnored: runData.existingSessionsIgnored || 0
        },
        
        // Données du téléchargement
        downloads: {
            total: runData.downloadsTotal || 0,
            successful: runData.downloadsSuccessful || 0,
            failed: runData.downloadsFailed || 0,
            successRate: runData.downloadsSuccessRate || 0
        },
        
        // Détails des sessions
        sessions: {
            downloaded: runData.downloadedSessions || [],
            failed: runData.failedSessions || []
        },
        
        // Erreurs et métadonnées
        errors: runData.errors || [],
        executionTime: runData.executionTime || 0,
        serverResponse: runData.serverResponse || null,
        
        // Informations système
        environment: {
            nodeVersion: process.version,
            timestamp: new Date().toISOString()
        }
    };
    
    const docRef = await admin.firestore()
        .collection('scraping_logs')
        .add(logEntry);
    
    console.log(`📝 Log créé avec l'ID: ${docRef.id}`);
    return docRef.id;
    
    } catch (error) {
        console.error('❌ Erreur lors de la création du log:', error);
        throw error;
    }
}

/**
 * Met à jour un log existant
 * @param {string} logId - ID du log à mettre à jour
 * @param {Object} updateData - Données à mettre à jour
 */
async function updateScrapingLog(logId, updateData) {
    try {
        await admin.firestore()
            .collection('scraping_logs')
            .doc(logId)
            .update({
                ...updateData,
                lastUpdated: new Date() // Utiliser Date.now() au lieu de serverTimestamp()
            });
        
        console.log(`📝 Log ${logId} mis à jour`);
    } catch (error) {
        console.error(`❌ Erreur lors de la mise à jour du log ${logId}:`, error);
        throw error;
    }
}

/**
 * Récupère les logs récents
 * @param {number} limit - Nombre de logs à récupérer
 * @returns {Promise<Array>} Liste des logs
 */
async function getRecentLogs(limit = 50) {
    try {
        const snapshot = await admin.firestore()
            .collection('scraping_logs')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        
        const logs = [];
        snapshot.forEach(doc => {
            logs.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return logs;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des logs:', error);
        throw error;
    }
}

/**
 * Récupère le dernier log de scraping
 * @returns {Promise<Object|null>} Dernier log ou null
 */
async function getLastScrapingLog() {
    try {
        const snapshot = await admin.firestore()
            .collection('scraping_logs')
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return null;
        }
        
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du dernier log:', error);
        return null;
    }
}

/**
 * Génère un ID unique pour un run
 * @returns {string} ID unique du run
 */
function generateRunId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `run_${timestamp}_${random}`;
}

/**
 * Crée un log d'erreur simple
 * @param {string} errorMessage - Message d'erreur
 * @param {string} trigger - Type de déclenchement
 * @returns {Promise<string>} ID du log créé
 */
async function createErrorLog(errorMessage, trigger = 'scheduled') {
    return await createScrapingLog({
        status: 'failed',
        trigger: trigger,
        errors: [errorMessage],
        executionTime: 0,
        scraping: {
            totalSessionsFound: 0,
            newSessionsFound: 0,
            existingSessionsIgnored: 0
        },
        downloads: {
            total: 0,
            successful: 0,
            failed: 0,
            successRate: 0
        },
        sessions: {
            downloaded: [],
            failed: []
        }
    });
}

module.exports = {
    createScrapingLog,
    updateScrapingLog,
    getRecentLogs,
    getLastScrapingLog,
    createErrorLog,
    generateRunId
};
