/**
 * Firebase Functions - EGT Auto Scraper
 * Point d'entrée principal pour les fonctions Firebase
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiser Firebase Admin (nécessaire pour les fonctions)
admin.initializeApp();

// Imports des modules de scraping
const { scrapeEGTPage, filterNewSessions } = require('./scraper/egt-scraper');
const { downloadMultipleSessions } = require('./scraper/download-manager');
const { getExistingSessions, saveMultipleSessions, updateProcessedData } = require('./firestore/session-storage');
const { createScrapingLog, updateScrapingLog, createErrorLog } = require('./firestore/logs-collection');

/**
 * Fonction principale de scraping EGT
 * Exécutée automatiquement toutes les heures ou manuellement
 */
async function runEGTScraping(trigger = 'scheduled') {
    const startTime = Date.now();
    let logId = null;
    
    try {
        console.log(`🚀 Début du scraping EGT (trigger: ${trigger})`);
        
        // Créer le log initial
        logId = await createScrapingLog({
            status: 'started',
            trigger: trigger
        });
        
        // 1. Scraper la page EGT
        console.log('📋 Étape 1: Scraping de la page EGT...');
        const scrapedSessions = await scrapeEGTPage();
        
        // 2. Récupérer les sessions existantes
        console.log('📋 Étape 2: Récupération des sessions existantes...');
        const existingSessions = await getExistingSessions();
        
        // 3. Filtrer les nouvelles sessions
        console.log('📋 Étape 3: Filtrage des nouvelles sessions...');
        const newSessions = filterNewSessions(scrapedSessions, existingSessions);
        
        // 4. Télécharger les nouvelles sessions
        let downloadResults = { successful: [], failed: [], summary: { total: 0, successful: 0, failed: 0, successRate: 0 } };
        
        if (newSessions.length > 0) {
            console.log('📋 Étape 4: Téléchargement des nouvelles sessions...');
            downloadResults = await downloadMultipleSessions(newSessions, 5000); // 5 secondes entre chaque
        } else {
            console.log('📋 Étape 4: Aucune nouvelle session à télécharger');
        }
        
        // 5. Sauvegarder les sessions téléchargées
        let saveResults = { saved: 0, failed: 0, errors: [] };
        
        if (downloadResults.successful.length > 0) {
            console.log('📋 Étape 5: Sauvegarde des sessions téléchargées...');
            const sessionsToSave = downloadResults.successful.map(item => item.data);
            saveResults = await saveMultipleSessions(sessionsToSave);
        } else {
            console.log('📋 Étape 5: Aucune session à sauvegarder');
        }
        
        // 6. Mettre à jour les données traitées (si nouvelles sessions)
        if (saveResults.saved > 0) {
            console.log('📋 Étape 6: Mise à jour des données traitées...');
            // TODO: Intégrer la logique de processSessionData du frontend
            // Pour l'instant, on laisse le frontend s'occuper de ça
            console.log('⚠️ Mise à jour des données traitées à implémenter');
        }
        
        // Calculer le temps d'exécution
        const executionTime = Date.now() - startTime;
        
        // Mettre à jour le log avec les résultats
        await updateScrapingLog(logId, {
            status: 'completed',
            executionTime: executionTime,
            
            scraping: {
                totalSessionsFound: scrapedSessions.length,
                newSessionsFound: newSessions.length,
                existingSessionsIgnored: scrapedSessions.length - newSessions.length
            },
            
            downloads: {
                total: downloadResults.summary.total,
                successful: downloadResults.summary.successful,
                failed: downloadResults.summary.failed,
                successRate: downloadResults.summary.successRate
            },
            
            sessions: {
                downloaded: downloadResults.successful.map(item => item.sessionId),
                failed: downloadResults.failed.map(item => item.sessionId)
            },
            
            saveResults: saveResults
        });
        
        console.log(`✅ Scraping EGT terminé avec succès en ${executionTime}ms`);
        console.log(`📊 Résumé: ${downloadResults.summary.successful} téléchargements réussis, ${downloadResults.summary.failed} échecs`);
        
        return {
            success: true,
            executionTime: executionTime,
            summary: {
                scraped: scrapedSessions.length,
                new: newSessions.length,
                downloaded: downloadResults.summary.successful,
                saved: saveResults.saved,
                failed: downloadResults.summary.failed
            }
        };
        
    } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error('❌ Erreur lors du scraping EGT:', error);
        
        // Créer un log d'erreur
        await createErrorLog(error.message, trigger);
        
        // Mettre à jour le log existant si il existe
        if (logId) {
            await updateScrapingLog(logId, {
                status: 'failed',
                executionTime: executionTime,
                errors: [error.message]
            });
        }
        
        throw error;
    }
}

/**
 * Fonction Firebase déclenchée par un cron job (toutes les heures)
 */
exports.scrapeEGTHourly = functions.pubsub
    .schedule('0 * * * *') // Toutes les heures à la minute 0
    .timeZone('America/Montreal')
    .onRun(async (context) => {
        console.log('⏰ Déclenchement automatique du scraping EGT');
        return await runEGTScraping('scheduled');
    });

/**
 * Fonction Firebase pour déclenchement manuel (HTTP)
 */
exports.scrapeEGTManual = functions.https.onRequest(async (req, res) => {
    // Ajouter les headers CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    
    // Vérifier la méthode HTTP
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
    }
    
    // Vérifier l'authentification (optionnel, pour sécuriser)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentification requise' });
    }
    
    try {
        console.log('🎯 Déclenchement manuel du scraping EGT');
        const result = await runEGTScraping('manual');
        
        res.status(200).json({
            success: true,
            message: 'Scraping EGT exécuté avec succès',
            result: result
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du scraping manuel:', error);
        
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Erreur lors du scraping EGT'
        });
    }
});

/**
 * Fonction Firebase pour récupérer les logs récents
 */
exports.getScrapingLogs = functions.https.onRequest(async (req, res) => {
    // Ajouter les headers CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    
    try {
        const { getRecentLogs } = require('./firestore/logs-collection');
        const limit = parseInt(req.query.limit) || 50;
        
        const logs = await getRecentLogs(limit);
        
        res.status(200).json({
            success: true,
            logs: logs
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des logs:', error);
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Fonction Firebase pour récupérer les serveurs ACC actifs
 * Proxy pour contourner les restrictions CORS
 */
exports.getACCServers = functions.https.onRequest(async (req, res) => {
    // Ajouter les headers CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    
    try {
        const { track, limit = 25 } = req.query;
        
        if (!track) {
            return res.status(400).json({
                success: false,
                error: 'Le paramètre track est requis'
            });
        }
        
        // URL de l'API ACC Status
        const url = `https://acc-status.jonatan.net/api/v2/acc/servers?limit=${limit}&skip=0&sort[drivers]=-1&mode=public&track=${track}&safety_rating[min]=0&safety_rating[max]=100&offline=false`;
        
        console.log(`🎮 Récupération des serveurs ACC pour le circuit: ${track}`);
        
        // Faire l'appel HTTP depuis le serveur
        const https = require('https');
        const http = require('http');
        const axios = require('axios');
        
        const response = await axios.get(url);
        
        if (response.status !== 200) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Filtrer pour garder seulement les serveurs avec des joueurs
        const servers = response.data.servers || [];
        const activeServers = servers
            .filter(server => server.drivers > 0)
            .slice(0, 3)
            .map(server => ({
                name: server.name ? server.name.substring(0, 20) : 'Serveur',
                drivers: server.drivers,
                max_drivers: server.max_drivers || 30,
                sessions: server.sessions || []
            }));
        
        console.log(`✅ ${activeServers.length} serveur(s) trouvé(s) pour ${track}`);
        
        res.status(200).json({
            success: true,
            servers: activeServers
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des serveurs ACC:', error);
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Fonction de test pour développement local
 */
exports.testScraping = functions.https.onRequest(async (req, res) => {
    try {
        console.log('🧪 Test du scraping EGT');
        const result = await runEGTScraping('test');
        
        res.status(200).json({
            success: true,
            message: 'Test du scraping réussi',
            result: result
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
