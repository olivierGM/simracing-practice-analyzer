/**
 * VALIDATION GÉNÉRALE DE TOUTES LES FONCTIONNALITÉS
 * Script principal pour valider toutes les fonctionnalités du site
 */

const TestFramework = require('./test-framework');
const validateProgressionChart = require('./validation-progression-chart');

class FeatureValidator {
    constructor() {
        this.framework = null;
        this.validationResults = [];
    }

    /**
     * Initialiser le validateur
     */
    async init() {
        console.log('🚀 INITIALISATION DU VALIDATEUR DE FONCTIONNALITÉS');
        console.log('================================================');
        
        this.framework = new TestFramework();
        await this.framework.init();
        await this.framework.gotoProduction();
        
        console.log('✅ Validateur initialisé');
    }

    /**
     * Valider les fonctionnalités de base
     */
    async validateBasicFeatures() {
        console.log('\n📋 VALIDATION DES FONCTIONNALITÉS DE BASE');
        console.log('==========================================');
        
        const basicTests = [
            {
                name: 'Site accessible',
                test: async (page) => {
                    const title = await page.title();
                    if (!title.includes('Analyseur de Temps')) {
                        throw new Error('Titre de page incorrect');
                    }
                    return { title };
                }
            },
            {
                name: 'Firebase configuré',
                test: async (page) => {
                    const firebaseStatus = await page.evaluate(() => {
                        return typeof window.db !== 'undefined';
                    });
                    if (!firebaseStatus) {
                        throw new Error('Firebase non configuré');
                    }
                    return { firebaseConfigured: true };
                }
            },
            {
                name: 'Données chargées',
                test: async (page) => {
                    const dataStatus = await page.evaluate(() => {
                        if (typeof window.getFilteredData !== 'function') {
                            return { error: 'getFilteredData non disponible' };
                        }
                        const data = window.getFilteredData();
                        return {
                            sessions: data.sessionData ? data.sessionData.length : 0,
                            drivers: data.byDriver ? Object.keys(data.byDriver).length : 0
                        };
                    });
                    
                    if (dataStatus.sessions === 0) {
                        throw new Error('Aucune session chargée');
                    }
                    return dataStatus;
                }
            },
            {
                name: 'Interface utilisateur',
                test: async (page) => {
                    await this.framework.checkElementExists('#driverStats', 'Section statistiques pilotes');
                    await this.framework.checkElementExists('#categoryStats', 'Section statistiques catégories');
                    await this.framework.checkElementExists('#pilotModal', 'Modal pilote');
                    return { uiElements: true };
                }
            }
        ];

        for (const test of basicTests) {
            try {
                const result = await this.framework.runTest(test.name, test.test);
                this.validationResults.push({
                    category: 'basic',
                    test: test.name,
                    status: 'PASS',
                    result: result
                });
            } catch (error) {
                this.validationResults.push({
                    category: 'basic',
                    test: test.name,
                    status: 'FAIL',
                    error: error.message
                });
            }
        }
    }

    /**
     * Valider les fonctionnalités avancées
     */
    async validateAdvancedFeatures() {
        console.log('\n🔧 VALIDATION DES FONCTIONNALITÉS AVANCÉES');
        console.log('===========================================');
        
        const advancedTests = [
            {
                name: 'Graphique de progression',
                test: async (page) => {
                    // Utiliser la validation spécialisée
                    await validateProgressionChart();
                    return { progressionChart: 'validated' };
                }
            },
            {
                name: 'Modal pilote',
                test: async (page) => {
                    const pilotKey = await page.evaluate(() => {
                        const data = window.getFilteredData();
                        const byDriver = data.byDriver || {};
                        const driverKeys = Object.keys(byDriver);
                        return driverKeys.length > 0 ? driverKeys[0] : null;
                    });
                    
                    if (!pilotKey) {
                        throw new Error('Aucun pilote disponible');
                    }
                    
                    await page.evaluate((key) => {
                        window.openPilotModal(key);
                    }, pilotKey);
                    
                    await page.waitForTimeout(2000);
                    
                    const modalVisible = await page.locator('#pilotModal').isVisible();
                    if (!modalVisible) {
                        throw new Error('Modal pilote non visible');
                    }
                    
                    return { modalOpened: true, pilotKey };
                }
            },
            {
                name: 'Analyse de consistance',
                test: async (page) => {
                    await this.framework.checkGlobalVariable('ConsistencyAnalyzer', 'Analyseur de consistance');
                    return { consistencyAnalyzer: 'available' };
                }
            }
        ];

        for (const test of advancedTests) {
            try {
                const result = await this.framework.runTest(test.name, test.test);
                this.validationResults.push({
                    category: 'advanced',
                    test: test.name,
                    status: 'PASS',
                    result: result
                });
            } catch (error) {
                this.validationResults.push({
                    category: 'advanced',
                    test: test.name,
                    status: 'FAIL',
                    error: error.message
                });
            }
        }
    }

    /**
     * Valider les performances
     */
    async validatePerformance() {
        console.log('\n⚡ VALIDATION DES PERFORMANCES');
        console.log('==============================');
        
        const performanceTests = [
            {
                name: 'Temps de chargement',
                test: async (page) => {
                    const startTime = Date.now();
                    await page.reload({ waitUntil: 'domcontentloaded' });
                    await page.waitForTimeout(3000);
                    const loadTime = Date.now() - startTime;
                    
                    if (loadTime > 10000) {
                        throw new Error(`Temps de chargement trop long: ${loadTime}ms`);
                    }
                    
                    return { loadTime };
                }
            },
            {
                name: 'Mémoire utilisée',
                test: async (page) => {
                    const memoryInfo = await page.evaluate(() => {
                        if (performance.memory) {
                            return {
                                usedJSHeapSize: performance.memory.usedJSHeapSize,
                                totalJSHeapSize: performance.memory.totalJSHeapSize
                            };
                        }
                        return { memoryInfo: 'not available' };
                    });
                    
                    return memoryInfo;
                }
            }
        ];

        for (const test of performanceTests) {
            try {
                const result = await this.framework.runTest(test.name, test.test);
                this.validationResults.push({
                    category: 'performance',
                    test: test.name,
                    status: 'PASS',
                    result: result
                });
            } catch (error) {
                this.validationResults.push({
                    category: 'performance',
                    test: test.name,
                    status: 'FAIL',
                    error: error.message
                });
            }
        }
    }

    /**
     * Générer le rapport final
     */
    generateFinalReport() {
        const totalTests = this.validationResults.length;
        const passedTests = this.validationResults.filter(r => r.status === 'PASS').length;
        const failedTests = this.validationResults.filter(r => r.status === 'FAIL').length;
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) + '%' : '0%'
            },
            results: this.validationResults,
            categories: {
                basic: this.validationResults.filter(r => r.category === 'basic'),
                advanced: this.validationResults.filter(r => r.category === 'advanced'),
                performance: this.validationResults.filter(r => r.category === 'performance')
            }
        };
        
        return report;
    }

    /**
     * Sauvegarder le rapport final
     */
    async saveFinalReport() {
        const report = this.generateFinalReport();
        const filename = `validation-report-${Date.now()}.json`;
        
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        
        console.log(`📊 Rapport final sauvegardé: ${filename}`);
        return filename;
    }

    /**
     * Nettoyer
     */
    async cleanup() {
        if (this.framework) {
            await this.framework.cleanup();
        }
    }
}

/**
 * Fonction principale de validation
 */
async function validateAllFeatures() {
    const validator = new FeatureValidator();
    
    try {
        await validator.init();
        
        await validator.validateBasicFeatures();
        await validator.validateAdvancedFeatures();
        await validator.validatePerformance();
        
        const reportFile = await validator.saveFinalReport();
        
        console.log('\n🎉 VALIDATION COMPLÈTE TERMINÉE !');
        console.log('==================================');
        console.log(`📊 Rapport final: ${reportFile}`);
        
        return reportFile;
        
    } catch (error) {
        console.error('❌ ERREUR LORS DE LA VALIDATION:', error.message);
        throw error;
    } finally {
        await validator.cleanup();
    }
}

// Exécuter la validation si le script est appelé directement
if (require.main === module) {
    validateAllFeatures().catch(console.error);
}

module.exports = validateAllFeatures;
