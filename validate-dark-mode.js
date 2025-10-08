/**
 * Script de validation automatisé pour le mode sombre/clair
 * Utilise Playwright pour tester l'interface utilisateur
 */

const { chromium } = require('playwright');

async function validateDarkMode() {
    console.log('🧪 Démarrage de la validation automatisée du mode sombre/clair...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Test 1: Charger la page principale
        console.log('📄 Chargement de la page principale...');
        await page.goto('http://localhost:8000/index.html');
        await page.waitForLoadState('networkidle');
        
        // Test 2: Vérifier que le bouton toggle existe
        console.log('🔍 Vérification du bouton toggle...');
        const toggleButton = await page.$('#themeToggle');
        if (!toggleButton) {
            throw new Error('Bouton toggle non trouvé');
        }
        console.log('✅ Bouton toggle trouvé');
        
        // Test 3: Vérifier l'état initial
        console.log('🎨 Vérification de l\'état initial...');
        const initialTheme = await page.evaluate(() => {
            return window.themeManager ? window.themeManager.getCurrentTheme() : null;
        });
        console.log(`Thème initial: ${initialTheme}`);
        
        // Test 4: Tester le basculement
        console.log('🔄 Test du basculement de thème...');
        await toggleButton.click();
        await page.waitForTimeout(500); // Attendre la transition
        
        const newTheme = await page.evaluate(() => {
            return window.themeManager ? window.themeManager.getCurrentTheme() : null;
        });
        console.log(`Thème après basculement: ${newTheme}`);
        
        if (newTheme === initialTheme) {
            throw new Error('Le basculement de thème ne fonctionne pas');
        }
        console.log('✅ Basculement de thème fonctionne');
        
        // Test 5: Vérifier l'attribut data-theme
        console.log('🏷️ Vérification de l\'attribut data-theme...');
        const dataTheme = await page.getAttribute('html', 'data-theme');
        if (dataTheme !== newTheme) {
            throw new Error(`Attribut data-theme incorrect: ${dataTheme} vs ${newTheme}`);
        }
        console.log('✅ Attribut data-theme correct');
        
        // Test 6: Vérifier la persistance
        console.log('💾 Test de persistance...');
        const storedTheme = await page.evaluate(() => {
            return localStorage.getItem('simRacingTheme');
        });
        if (storedTheme !== newTheme) {
            throw new Error(`Persistance incorrecte: ${storedTheme} vs ${newTheme}`);
        }
        console.log('✅ Persistance fonctionne');
        
        // Test 7: Vérifier l'icône du bouton
        console.log('🎯 Vérification de l\'icône du bouton...');
        const buttonText = await toggleButton.textContent();
        const expectedIcon = newTheme === 'light' ? '🌙' : '☀️';
        if (buttonText !== expectedIcon) {
            throw new Error(`Icône incorrecte: ${buttonText} vs ${expectedIcon}`);
        }
        console.log('✅ Icône du bouton correcte');
        
        // Test 8: Vérifier les variables CSS
        console.log('🎨 Vérification des variables CSS...');
        const cssVariables = await page.evaluate(() => {
            const computedStyle = getComputedStyle(document.documentElement);
            return {
                bgSecondary: computedStyle.getPropertyValue('--bg-secondary'),
                textPrimary: computedStyle.getPropertyValue('--text-primary'),
                borderColor: computedStyle.getPropertyValue('--border-color')
            };
        });
        
        if (!cssVariables.bgSecondary || !cssVariables.textPrimary) {
            throw new Error('Variables CSS manquantes');
        }
        console.log('✅ Variables CSS disponibles');
        
        // Test 9: Recharger la page pour vérifier la persistance
        console.log('🔄 Test de persistance après rechargement...');
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const persistedTheme = await page.evaluate(() => {
            return window.themeManager ? window.themeManager.getCurrentTheme() : null;
        });
        
        if (persistedTheme !== newTheme) {
            throw new Error(`Thème non persisté après rechargement: ${persistedTheme} vs ${newTheme}`);
        }
        console.log('✅ Persistance après rechargement fonctionne');
        
        // Test 10: Tester la page de test
        console.log('🧪 Test de la page de test...');
        await page.goto('http://localhost:8000/test-dark-mode.html');
        await page.waitForLoadState('networkidle');
        
        const testPageTheme = await page.evaluate(() => {
            return window.themeManager ? window.themeManager.getCurrentTheme() : null;
        });
        
        if (testPageTheme !== newTheme) {
            throw new Error(`Thème non cohérent entre les pages: ${testPageTheme} vs ${newTheme}`);
        }
        console.log('✅ Cohérence entre les pages');
        
        console.log('\n🎉 Tous les tests sont passés ! Le mode sombre/clair fonctionne parfaitement.');
        return true;
        
    } catch (error) {
        console.error('❌ Test échoué:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// Exécuter la validation si le script est appelé directement
if (require.main === module) {
    validateDarkMode().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { validateDarkMode };
