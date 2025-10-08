/**
 * Script de validation de l'application Sim Racing
 * Utilise les outils MCP browser pour tester automatiquement
 */

const { chromium } = require('playwright');

async function validateApplication() {
    console.log('🚀 Démarrage de la validation de l\'application...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // 1. Naviguer vers l'application
        console.log('📱 Navigation vers l\'application...');
        await page.goto('https://simracing-practice-analyzer.web.app', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000); // Attendre 3 secondes pour le chargement complet
        
        // 2. Vérifier que l'application se charge
        console.log('🔍 Vérification du chargement...');
        const title = await page.textContent('h1');
        console.log(`✅ Titre trouvé: ${title}`);
        
        // 3. Vérifier les éléments principaux
        const adminBtn = await page.locator('#adminAccessBtn');
        const sessionSelect = await page.locator('#sessionSelect');
        
        await page.waitForSelector('#adminAccessBtn', { timeout: 10000 });
        
        if (await adminBtn.isVisible()) {
            console.log('✅ Bouton admin présent');
        }
        
        if (await sessionSelect.isVisible()) {
            console.log('✅ Sélecteur de session présent');
        }
        
        // 4. Tester l'accès admin
        console.log('🔐 Test de l\'accès admin...');
        await adminBtn.click();
        await page.waitForSelector('#authSection', { state: 'visible' });
        
        const passwordInput = page.locator('#adminPassword');
        await passwordInput.fill('admin123');
        
        const loginBtn = page.locator('#loginBtn');
        await loginBtn.click();
        
        await page.waitForTimeout(1000);
        
        const uploadSection = page.locator('#uploadSection');
        if (await uploadSection.isVisible()) {
            console.log('✅ Authentification admin réussie');
        }
        
        // 5. Vérifier l'affichage des données
        console.log('📊 Vérification des données...');
        const driverStats = page.locator('#driverStats');
        if (await driverStats.isVisible()) {
            const driverRows = await driverStats.locator('tbody tr').count();
            console.log(`✅ ${driverRows} pilotes affichés`);
            
            if (driverRows > 0) {
                // 6. Tester la modal pilote
                console.log('👤 Test de la modal pilote...');
                const firstDriverRow = driverStats.locator('tbody tr').first();
                await firstDriverRow.click();
                
                await page.waitForSelector('#pilotModal', { state: 'visible' });
                
                const pilotName = await page.textContent('#pilotName');
                const pilotCategory = await page.textContent('#pilotCategory');
                const pilotPosition = await page.textContent('#pilotPosition');
                
                console.log(`✅ Modal ouverte pour: ${pilotName}`);
                console.log(`   - Catégorie: ${pilotCategory}`);
                console.log(`   - Position: ${pilotPosition}`);
                
                // Vérifier que la position n'est pas "0 sur 0"
                if (!pilotPosition.includes('0/0')) {
                    console.log('✅ Position correctement calculée');
                } else {
                    console.log('❌ Position affichée comme "0 sur 0"');
                }
                
                // 7. Vérifier les statistiques du pilote
                const totalLaps = await page.textContent('.pilot-info-item:nth-child(1) .pilot-info-value');
                const validLaps = await page.textContent('.pilot-info-item:nth-child(2) .pilot-info-value');
                const wetLaps = await page.textContent('.pilot-info-item:nth-child(3) .pilot-info-value');
                
                console.log('✅ Statistiques du pilote:');
                console.log(`   - Total tours: ${totalLaps}`);
                console.log(`   - Tours valides: ${validLaps}`);
                console.log(`   - Tours wet: ${wetLaps}`);
                
                // 8. Vérifier la section des tours
                const lapsSection = page.locator('.laps-section');
                if (await lapsSection.isVisible()) {
                    const lapItems = await lapsSection.locator('.lap-item').count();
                    console.log(`✅ ${lapItems} tours affichés`);
                    
                    if (lapItems > 0) {
                        const firstLap = lapsSection.locator('.lap-item').first();
                        const lapNumber = await firstLap.locator('.lap-number').textContent();
                        const lapDateTime = await firstLap.locator('.lap-datetime').textContent();
                        const lapTotal = await firstLap.locator('.lap-total').textContent();
                        
                        console.log('✅ Premier tour:');
                        console.log(`   - Numéro: ${lapNumber}`);
                        console.log(`   - Date/Heure: ${lapDateTime}`);
                        console.log(`   - Temps: ${lapTotal}`);
                    }
                }
                
                // 9. Tester le tri des colonnes
                console.log('🔄 Test du tri des colonnes...');
                const totalHeader = page.locator('.laps-header .sortable:nth-child(4)');
                if (await totalHeader.isVisible()) {
                    await totalHeader.click();
                    await page.waitForTimeout(300);
                    
                    const sortIndicator = await totalHeader.locator('.sort-indicator').textContent();
                    if (sortIndicator === '↑' || sortIndicator === '↓') {
                        console.log('✅ Tri des colonnes fonctionne');
                    }
                }
                
                // Fermer la modal
                const closeBtn = page.locator('.close-modal');
                await closeBtn.click();
                console.log('✅ Modal fermée');
            }
        }
        
        console.log('🎉 Validation terminée avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors de la validation:', error);
    } finally {
        await browser.close();
    }
}

// Exécuter la validation
validateApplication().catch(console.error);
