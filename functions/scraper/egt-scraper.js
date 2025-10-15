/**
 * EGT Scraper - Parse la page EGT pour extraire les sessions disponibles
 */

const https = require('https');
const http = require('http');

/**
 * Fonction utilitaire pour faire des requêtes HTTP simples
 * @param {string} url - URL à récupérer
 * @returns {Promise<string>} Contenu HTML
 */
function fetchWithRetry(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
 * Parse le HTML pour extraire les sessions (sans dépendances externes)
 * @param {string} html - Contenu HTML de la page EGT
 * @returns {Array} Liste des sessions
 */
function parseSessionsFromHtml(html) {
    const sessions = [];
    
    // Chercher les lignes de table avec row-link
    const rowMatches = html.match(/<tr[^>]*class="[^"]*row-link[^"]*"[^>]*>[\s\S]*?<\/tr>/gi);
    
    if (!rowMatches) {
        console.log('⚠️ Aucune ligne row-link trouvée');
        return sessions;
    }
    
    rowMatches.forEach((row, index) => {
        try {
            // Extraire le contenu des cellules TD
            const tdMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
            
            if (tdMatches && tdMatches.length >= 4) {
                // Extraire le texte de chaque cellule
                const cells = tdMatches.map(td => {
                    return td.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                });
                
                const dateText = cells[0];
                const sessionType = cells[1];
                const trackName = cells[2];
                
                // Chercher le lien de téléchargement
                const downloadMatches = [
                    row.match(/href="([^"]*download[^"]*\.json)"/),
                    row.match(/href='([^']*download[^']*\.json)'/),
                    row.match(/href=([^\s>]*download[^\s>]*\.json)/)
                ];
                
                let downloadUrl = null;
                for (const match of downloadMatches) {
                    if (match && match[1]) {
                        downloadUrl = match[1].startsWith('http') 
                            ? match[1] 
                            : `http://51.161.118.36:8773${match[1]}`;
                        break;
                    }
                }
                
                if (downloadUrl && dateText && trackName && sessionType) {
                    // Parser la date
                    const parsedDate = parseEGTDate(dateText);
                    
                    // Générer l'ID de session (même logique que le frontend)
                    const sessionId = generateSessionId({
                        trackName: trackName,
                        Date: parsedDate
                    });
                    
                    const session = {
                        id: sessionId,
                        date: parsedDate,
                        dateText: dateText,
                        sessionType: sessionType,
                        trackName: trackName,
                        downloadUrl: downloadUrl,
                        scrapedAt: new Date().toISOString()
                    };
                    
                    sessions.push(session);
                    console.log(`✅ Session trouvée: ${sessionId} (${dateText})`);
                }
            }
        } catch (error) {
            console.error(`❌ Erreur lors du parsing de la ligne ${index}:`, error.message);
        }
    });
    
    return sessions;
}

/**
 * Scrape la page EGT pour extraire les informations des sessions
 * @returns {Promise<Array>} Liste des sessions disponibles
 */
async function scrapeEGTPage() {
    try {
        console.log('🕷️ Début du scraping de la page EGT...');
        
        // URL de la page EGT
        const egtUrl = 'http://51.161.118.36:8773/results';
        
        // Récupérer le contenu HTML de la page
        const response = await fetchWithRetry(egtUrl);
        
        // Parser le HTML avec regex (plus simple, pas de dépendances externes)
        const sessions = parseSessionsFromHtml(response);
        
        console.log(`🎯 Total de ${sessions.length} sessions trouvées`);
        return sessions;
        
    } catch (error) {
        console.error('❌ Erreur lors du scraping EGT:', error.message);
        throw error;
    }
}

/**
 * Parse la date EGT au format "Tue, 14 Oct 2025 12:42:50 UTC"
 * @param {string} dateText - Texte de la date depuis EGT
 * @returns {string} Date au format ISO
 */
function parseEGTDate(dateText) {
    try {
        // Parser la date EGT avec une approche simple (sans moment.js)
        const date = new Date(dateText);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
        
        console.warn(`⚠️ Impossible de parser la date: ${dateText}`);
        return new Date().toISOString(); // Fallback à la date actuelle
        
    } catch (error) {
        console.error(`❌ Erreur lors du parsing de la date ${dateText}:`, error.message);
        return new Date().toISOString();
    }
}

/**
 * Normalise une date pour qu'elle soit cohérente
 * @param {string} dateString - Date à normaliser
 * @returns {string} Date normalisée
 */
function normalizeDate(dateString) {
    if (!dateString) return new Date().toISOString();
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return new Date().toISOString();
        }
        
        // Normaliser : enlever les millisecondes et garder seulement les secondes
        return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    } catch (error) {
        console.error(`Erreur lors de la normalisation de la date ${dateString}:`, error.message);
        return new Date().toISOString();
    }
}

/**
 * Normalise un nom de piste pour qu'il soit cohérent
 * @param {string} trackName - Nom de la piste à normaliser
 * @returns {string} Nom de piste normalisé
 */
function normalizeTrackName(trackName) {
    if (!trackName) return 'unknown';
    
    // Convertir en minuscules et remplacer les espaces par des underscores
    return trackName.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

/**
 * Génère un ID unique pour une session (même logique que le frontend)
 * Utilise la normalisation pour assurer la cohérence entre EGT et JSON
 * @param {Object} session - Objet session avec trackName et Date
 * @returns {string} ID unique de la session
 */
function generateSessionId(session) {
    const normalizedTrackName = normalizeTrackName(session.trackName);
    const normalizedDate = normalizeDate(session.Date);
    return `${normalizedTrackName}_${normalizedDate}`;
}

/**
 * Filtre les sessions pour ne garder que les nouvelles (pas déjà téléchargées)
 * @param {Array} scrapedSessions - Sessions trouvées par le scraping
 * @param {Array} existingSessions - Sessions déjà existantes en base
 * @returns {Array} Sessions nouvelles à télécharger
 */
function filterNewSessions(scrapedSessions, existingSessions) {
    // Créer un Set des IDs existants pour une recherche plus rapide
    const existingIds = new Set();
    
    existingSessions.forEach(session => {
        // Essayer différentes façons d'obtenir l'ID de session
        let sessionId = null;
        
        // 1. ID depuis les métadonnées de scraping
        if (session._scrapedMetadata && session._scrapedMetadata.originalSessionId) {
            sessionId = session._scrapedMetadata.originalSessionId;
        }
        // 2. ID généré à partir des données de la session
        else if (session.trackName && session.Date) {
            sessionId = generateSessionId({ trackName: session.trackName, Date: session.Date });
        }
        // 3. ID depuis le nom de fichier
        else if (session.fileName) {
            sessionId = session.fileName.replace('.json', '');
        }
        
        if (sessionId) {
            existingIds.add(sessionId);
        }
    });
    
    console.log(`📊 ${existingIds.size} sessions existantes trouvées en base`);
    
    const newSessions = scrapedSessions.filter(session => {
        const sessionId = session.id;
        if (existingIds.has(sessionId)) {
            console.log(`⚠️ Session déjà existante ignorée: ${sessionId}`);
            return false;
        }
        return true;
    });
    
    console.log(`🆕 ${newSessions.length} nouvelles sessions à télécharger sur ${scrapedSessions.length} trouvées`);
    return newSessions;
}

module.exports = {
    scrapeEGTPage,
    parseEGTDate,
    generateSessionId,
    filterNewSessions
};
