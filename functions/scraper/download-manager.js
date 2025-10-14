/**
 * Download Manager - Gère le téléchargement des sessions EGT avec délais
 */

const https = require('https');
const http = require('http');

/**
 * Fonction utilitaire pour télécharger du JSON
 * @param {string} url - URL du JSON
 * @returns {Promise<Object>} Données JSON
 */
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 30000
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve(data);
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

/**
 * Télécharge une session JSON depuis EGT
 * @param {Object} session - Objet session avec downloadUrl
 * @param {number} delayMs - Délai en millisecondes avant le téléchargement
 * @returns {Promise<Object>} Données JSON de la session
 */
async function downloadSession(session, delayMs = 5000) {
    try {
        console.log(`⏳ Attente de ${delayMs}ms avant téléchargement de ${session.id}...`);
        await sleep(delayMs);
        
        console.log(`📥 Téléchargement de ${session.id}...`);
        
        const response = await fetchJson(session.downloadUrl);
        
        // Parser et valider le JSON
        let jsonData;
        try {
            jsonData = typeof response === 'string' ? JSON.parse(response) : response;
        } catch (parseError) {
            throw new Error(`JSON invalide reçu: ${parseError.message}`);
        }
        
        // Valider la structure basique du JSON
        if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Données JSON invalides ou vides');
        }
        
        // Ajouter des métadonnées de scraping
        jsonData._scrapedMetadata = {
            scrapedAt: session.scrapedAt,
            downloadUrl: session.downloadUrl,
            originalSessionId: session.id
        };
        
        console.log(`✅ Téléchargement réussi: ${session.id}`);
        return jsonData;
        
    } catch (error) {
        console.error(`❌ Erreur lors du téléchargement de ${session.id}:`, error.message);
        throw error;
    }
}

/**
 * Télécharge plusieurs sessions avec délai entre chaque
 * @param {Array} sessions - Liste des sessions à télécharger
 * @param {number} delayBetweenDownloads - Délai entre chaque téléchargement (ms)
 * @returns {Promise<Array>} Liste des sessions téléchargées avec succès
 */
async function downloadMultipleSessions(sessions, delayBetweenDownloads = 5000) {
    const downloadedSessions = [];
    const failedSessions = [];
    
    console.log(`🚀 Début du téléchargement de ${sessions.length} sessions...`);
    
    for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i];
        
        try {
            // Délai avant chaque téléchargement (sauf le premier)
            const delay = i === 0 ? 0 : delayBetweenDownloads;
            
            const jsonData = await downloadSession(session, delay);
            
            downloadedSessions.push({
                sessionId: session.id,
                data: jsonData,
                success: true,
                downloadedAt: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`❌ Échec du téléchargement de ${session.id}:`, error.message);
            
            failedSessions.push({
                sessionId: session.id,
                error: error.message,
                success: false,
                failedAt: new Date().toISOString()
            });
        }
    }
    
    console.log(`📊 Résultats du téléchargement:`);
    console.log(`   ✅ Succès: ${downloadedSessions.length}`);
    console.log(`   ❌ Échecs: ${failedSessions.length}`);
    
    return {
        successful: downloadedSessions,
        failed: failedSessions,
        summary: {
            total: sessions.length,
            successful: downloadedSessions.length,
            failed: failedSessions.length,
            successRate: sessions.length > 0 ? (downloadedSessions.length / sessions.length * 100).toFixed(1) : 0
        }
    };
}

/**
 * Télécharge une session unique (pour tests ou retry)
 * @param {string} sessionId - ID de la session
 * @param {string} downloadUrl - URL de téléchargement
 * @returns {Promise<Object>} Données JSON de la session
 */
async function downloadSingleSession(sessionId, downloadUrl) {
    const session = {
        id: sessionId,
        downloadUrl: downloadUrl,
        scrapedAt: new Date().toISOString()
    };
    
    return await downloadSession(session, 0);
}

/**
 * Utilitaire pour créer un délai
 * @param {number} ms - Millisecondes à attendre
 * @returns {Promise} Promise qui se résout après le délai
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    downloadSession,
    downloadMultipleSessions,
    downloadSingleSession,
    sleep
};
