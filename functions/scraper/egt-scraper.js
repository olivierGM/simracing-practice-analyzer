/**
 * EGT Scraper - Parse la page EGT pour extraire les sessions disponibles
 */

const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const moment = require('moment');

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
        
        // Parser le HTML avec Cheerio
        const $ = cheerio.load(response);
        const sessions = [];
        
        // Trouver toutes les lignes de la table (row-link)
        $('tr.row-link').each((index, element) => {
            try {
                const $row = $(element);
                const cells = $row.find('td');
                
                if (cells.length >= 4) {
                    // Extraire les informations de chaque colonne
                    const dateText = $(cells[0]).text().trim();
                    const sessionType = $(cells[1]).text().trim();
                    const trackName = $(cells[2]).text().trim();
                    const entrants = $(cells[3]).text().trim();
                    
                    // Extraire le lien de téléchargement (dernière colonne)
                    const downloadLink = $(cells[cells.length - 1]).find('a').attr('href');
                    
                    if (downloadLink && dateText && trackName && sessionType) {
                        // Parser la date
                        const parsedDate = parseEGTDate(dateText);
                        
                        // Construire l'URL complète du téléchargement
                        const fullDownloadUrl = downloadLink.startsWith('http') 
                            ? downloadLink 
                            : `http://51.161.118.36:8773${downloadLink}`;
                        
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
                            entrants: entrants,
                            downloadUrl: fullDownloadUrl,
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
        // Parser la date EGT avec moment.js
        const parsed = moment.utc(dateText, 'ddd, DD MMM YYYY HH:mm:ss [UTC]');
        
        if (parsed.isValid()) {
            return parsed.toISOString();
        } else {
            // Fallback: essayer d'autres formats
            const fallbackParsed = moment.utc(dateText);
            if (fallbackParsed.isValid()) {
                return fallbackParsed.toISOString();
            }
        }
        
        console.warn(`⚠️ Impossible de parser la date: ${dateText}`);
        return new Date().toISOString(); // Fallback à la date actuelle
        
    } catch (error) {
        console.error(`❌ Erreur lors du parsing de la date ${dateText}:`, error.message);
        return new Date().toISOString();
    }
}

/**
 * Génère un ID unique pour une session (même logique que le frontend)
 * @param {Object} session - Objet session avec trackName et Date
 * @returns {string} ID unique de la session
 */
function generateSessionId(session) {
    const trackName = session.trackName || 'Unknown';
    const date = session.Date || new Date().toISOString();
    return `${trackName}_${date}`;
}

/**
 * Filtre les sessions pour ne garder que les nouvelles (pas déjà téléchargées)
 * @param {Array} scrapedSessions - Sessions trouvées par le scraping
 * @param {Array} existingSessions - Sessions déjà existantes en base
 * @returns {Array} Sessions nouvelles à télécharger
 */
function filterNewSessions(scrapedSessions, existingSessions) {
    const existingIds = existingSessions.map(session => generateSessionId(session));
    
    const newSessions = scrapedSessions.filter(session => {
        const isNew = !existingIds.includes(session.id);
        if (!isNew) {
            console.log(`⚠️ Session déjà existante ignorée: ${session.id}`);
        }
        return isNew;
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
