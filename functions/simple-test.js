/**
 * Test simple du scraper EGT sans dépendances externes
 */

const https = require('https');
const http = require('http');

/**
 * Fonction utilitaire pour faire des requêtes HTTP simples
 */
function fetchHtml(url) {
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
 * Parse simple du HTML pour extraire les sessions
 */
function parseSessions(html) {
    const sessions = [];
    
    console.log('🔍 Debug: Recherche des patterns...');
    
    // Chercher les lignes de table avec row-link (plus flexible)
    const rowMatches = html.match(/<tr[^>]*class="[^"]*row-link[^"]*"[^>]*>[\s\S]*?<\/tr>/gi);
    
    if (!rowMatches) {
        console.log('⚠️ Aucune ligne row-link trouvée avec regex complexe');
        
        // Essayer une approche plus simple
        const simpleMatches = html.match(/<tr[^>]*>[\s\S]*?row-link[\s\S]*?<\/tr>/gi);
        if (simpleMatches) {
            console.log(`📋 ${simpleMatches.length} lignes trouvées avec regex simple`);
            return parseSessionsFromRows(simpleMatches);
        }
        
        // Dernière tentative: chercher juste "row-link"
        const basicMatches = html.split('<tr').filter(line => line.includes('row-link'));
        if (basicMatches.length > 0) {
            console.log(`📋 ${basicMatches.length} lignes trouvées avec split`);
            const rows = basicMatches.map(line => '<tr' + line + '</tr>');
            return parseSessionsFromRows(rows);
        }
        
        return sessions;
    }
    
    console.log(`📋 ${rowMatches.length} lignes row-link trouvées`);
    return parseSessionsFromRows(rowMatches);
}

/**
 * Parse les sessions à partir d'un array de lignes HTML
 */
function parseSessionsFromRows(rows) {
    const sessions = [];
    
    rows.forEach((row, index) => {
        try {
            console.log(`\n🔍 Parsing ligne ${index + 1}:`);
            
            // Extraire le contenu des cellules TD (plus robuste)
            const tdMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
            
            if (tdMatches && tdMatches.length >= 4) {
                // Extraire le texte de chaque cellule (gérer les balises imbriquées)
                const cells = tdMatches.map(td => {
                    return td.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                });
                
                console.log(`  Cellules trouvées: ${cells.length}`);
                console.log(`  Date: "${cells[0]}"`);
                console.log(`  Type: "${cells[1]}"`);
                console.log(`  Track: "${cells[2]}"`);
                
                const dateText = cells[0];
                const sessionType = cells[1];
                const trackName = cells[2];
                
                // Chercher le lien de téléchargement (plus flexible)
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
                    const session = {
                        id: `${trackName}_${dateText}`,
                        date: dateText,
                        sessionType: sessionType,
                        trackName: trackName,
                        downloadUrl: downloadUrl,
                        scrapedAt: new Date().toISOString()
                    };
                    
                    sessions.push(session);
                    console.log(`✅ Session ${index + 1}: ${session.id}`);
                    console.log(`     URL: ${downloadUrl}`);
                } else {
                    console.log(`⚠️ Ligne ${index + 1} incomplète - Date:"${dateText}" Track:"${trackName}" Type:"${sessionType}" URL:"${downloadUrl}"`);
                }
            } else {
                console.log(`⚠️ Ligne ${index + 1}: Pas assez de cellules (${tdMatches ? tdMatches.length : 0})`);
            }
        } catch (error) {
            console.error(`❌ Erreur ligne ${index + 1}:`, error.message);
        }
    });
    
    return sessions;
}

/**
 * Test principal
 */
async function testSimpleScraper() {
    console.log('🧪 Test simple du scraper EGT...\n');
    
    try {
        // 1. Récupérer la page HTML
        console.log('📋 Étape 1: Récupération de la page EGT...');
        const html = await fetchHtml('http://51.161.118.36:8773/results');
        console.log(`✅ Page récupérée (${html.length} caractères)`);
        
        // 2. Parser les sessions
        console.log('\n📋 Étape 2: Parsing des sessions...');
        const sessions = parseSessions(html);
        
        console.log(`\n📊 Résultats:`);
        console.log(`  Total sessions trouvées: ${sessions.length}`);
        
        if (sessions.length > 0) {
            console.log('\n📋 Premières sessions:');
            sessions.slice(0, 3).forEach((session, index) => {
                console.log(`  ${index + 1}. ${session.id}`);
                console.log(`     Date: ${session.date}`);
                console.log(`     Track: ${session.trackName}`);
                console.log(`     Type: ${session.sessionType}`);
                console.log(`     URL: ${session.downloadUrl}`);
            });
        }
        
        console.log('\n🎉 Test terminé avec succès !');
        
    } catch (error) {
        console.error('\n❌ Erreur lors du test:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Lancer le test
testSimpleScraper();
