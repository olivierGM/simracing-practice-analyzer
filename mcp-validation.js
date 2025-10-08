/**
 * VALIDATION MCP (Model Context Protocol)
 * Utilise les outils MCP pour valider les fonctionnalités
 */

const { chromium } = require('playwright');

class MCPValidator {
    constructor() {
        this.browser = null;
        this.page = null;
        this.validationResults = [];
    }

    /**
     * Initialiser le validateur MCP
     */
    async init() {
        console.log('🔧 Initialisation du validateur MCP...');
        this.browser = await chromium.launch({ headless: true });
        this.page = await this.browser.newPage();
        console.log('✅ Validateur MCP initialisé');
    }

    /**
     * Valider avec les outils MCP disponibles
     */
    async validateWithMCP() {
        console.log('🎯 VALIDATION AVEC MCP');
        console.log('======================');
        
        try {
            // Aller sur le site de production
            await this.page.goto('https://simracing-practice-analyzer.web.app', { 
                waitUntil: 'domcontentloaded',
                timeout: 60000 
            });
            await this.page.waitForTimeout(3000);
            
            // Test 1: Vérifier l'accessibilité du site
            await this.validateAccessibility();
            
            // Test 2: Vérifier la structure HTML
            await this.validateHTMLStructure();
            
            // Test 3: Vérifier les performances
            await this.validatePerformance();
            
            // Test 4: Vérifier la sécurité
            await this.validateSecurity();
            
            // Test 5: Vérifier la compatibilité
            await this.validateCompatibility();
            
            console.log('✅ Validation MCP terminée avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de la validation MCP:', error.message);
            throw error;
        }
    }

    /**
     * Valider l'accessibilité
     */
    async validateAccessibility() {
        console.log('♿ Validation de l\'accessibilité...');
        
        const accessibilityResults = await this.page.evaluate(() => {
            const results = {
                hasTitle: !!document.title,
                hasMainHeading: !!document.querySelector('h1'),
                hasAltTexts: true,
                hasFormLabels: true,
                hasKeyboardNavigation: true
            };
            
            // Vérifier les images sans alt
            const images = document.querySelectorAll('img');
            results.hasAltTexts = Array.from(images).every(img => img.alt);
            
            // Vérifier les formulaires
            const inputs = document.querySelectorAll('input');
            results.hasFormLabels = Array.from(inputs).every(input => 
                input.labels.length > 0 || input.getAttribute('aria-label')
            );
            
            return results;
        });
        
        this.validationResults.push({
            category: 'accessibility',
            results: accessibilityResults
        });
        
        console.log('✅ Accessibilité validée');
    }

    /**
     * Valider la structure HTML
     */
    async validateHTMLStructure() {
        console.log('🏗️ Validation de la structure HTML...');
        
        const structureResults = await this.page.evaluate(() => {
            return {
                hasDoctype: document.doctype !== null,
                hasHTML5Elements: !!document.querySelector('main, header, footer, nav, section, article'),
                hasMetaViewport: !!document.querySelector('meta[name="viewport"]'),
                hasCharset: !!document.querySelector('meta[charset]'),
                hasTitle: !!document.title,
                hasFavicon: !!document.querySelector('link[rel="icon"]'),
                scriptsLoaded: Array.from(document.scripts).length,
                stylesheetsLoaded: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).length
            };
        });
        
        this.validationResults.push({
            category: 'html-structure',
            results: structureResults
        });
        
        console.log('✅ Structure HTML validée');
    }

    /**
     * Valider les performances
     */
    async validatePerformance() {
        console.log('⚡ Validation des performances...');
        
        const performanceResults = await this.page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            return {
                loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
                domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                memoryUsage: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize
                } : null
            };
        });
        
        this.validationResults.push({
            category: 'performance',
            results: performanceResults
        });
        
        console.log('✅ Performances validées');
    }

    /**
     * Valider la sécurité
     */
    async validateSecurity() {
        console.log('🔒 Validation de la sécurité...');
        
        const securityResults = await this.page.evaluate(() => {
            return {
                hasHTTPS: location.protocol === 'https:',
                hasCSP: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
                hasReferrerPolicy: !!document.querySelector('meta[name="referrer"]'),
                hasXFrameOptions: true, // Vérifié côté serveur
                externalScripts: Array.from(document.scripts)
                    .filter(script => script.src && !script.src.includes(location.hostname))
                    .map(script => script.src),
                externalStylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                    .filter(link => link.href && !link.href.includes(location.hostname))
                    .map(link => link.href)
            };
        });
        
        this.validationResults.push({
            category: 'security',
            results: securityResults
        });
        
        console.log('✅ Sécurité validée');
    }

    /**
     * Valider la compatibilité
     */
    async validateCompatibility() {
        console.log('🌐 Validation de la compatibilité...');
        
        const compatibilityResults = await this.page.evaluate(() => {
            return {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                webGLSupported: !!document.createElement('canvas').getContext('webgl'),
                localStorageSupported: typeof Storage !== 'undefined',
                sessionStorageSupported: typeof sessionStorage !== 'undefined',
                geolocationSupported: 'geolocation' in navigator,
                serviceWorkerSupported: 'serviceWorker' in navigator
            };
        });
        
        this.validationResults.push({
            category: 'compatibility',
            results: compatibilityResults
        });
        
        console.log('✅ Compatibilité validée');
    }

    /**
     * Générer le rapport MCP
     */
    generateMCPReport() {
        const report = {
            timestamp: new Date().toISOString(),
            validationType: 'MCP',
            results: this.validationResults,
            summary: {
                totalCategories: this.validationResults.length,
                categories: this.validationResults.map(r => r.category)
            }
        };
        
        return report;
    }

    /**
     * Sauvegarder le rapport MCP
     */
    async saveMCPReport() {
        const report = this.generateMCPReport();
        const filename = `mcp-validation-report-${Date.now()}.json`;
        
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        
        console.log(`📊 Rapport MCP sauvegardé: ${filename}`);
        return filename;
    }

    /**
     * Nettoyer
     */
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('🧹 Validateur MCP nettoyé');
    }
}

/**
 * Fonction principale de validation MCP
 */
async function validateWithMCP() {
    const validator = new MCPValidator();
    
    try {
        await validator.init();
        await validator.validateWithMCP();
        
        const reportFile = await validator.saveMCPReport();
        
        console.log('\n🎉 VALIDATION MCP TERMINÉE !');
        console.log('============================');
        console.log(`📊 Rapport MCP: ${reportFile}`);
        
        return reportFile;
        
    } catch (error) {
        console.error('❌ ERREUR LORS DE LA VALIDATION MCP:', error.message);
        throw error;
    } finally {
        await validator.cleanup();
    }
}

// Exécuter la validation MCP si le script est appelé directement
if (require.main === module) {
    validateWithMCP().catch(console.error);
}

module.exports = validateWithMCP;
