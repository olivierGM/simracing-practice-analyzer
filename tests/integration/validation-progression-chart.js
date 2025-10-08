/**
 * VALIDATION DU GRAPHIQUE DE PROGRESSION
 * Tests automatisés pour valider le fonctionnement du graphique
 */

const TestFramework = require('./test-framework');

async function validateProgressionChart() {
    console.log('🎯 VALIDATION DU GRAPHIQUE DE PROGRESSION');
    console.log('==========================================');
    
    const framework = new TestFramework();
    
    try {
        // Initialiser le framework
        await framework.init();
        await framework.gotoProduction();
        
        // Test 1: Vérifier que Chart.js est chargé
        await framework.runTest('Chart.js chargé', async (page) => {
            await framework.checkFunctionExists('Chart', 'Chart.js');
            return { status: 'Chart.js disponible' };
        });
        
        // Test 2: Vérifier que ProgressionChart est disponible
        await framework.runTest('ProgressionChart disponible', async (page) => {
            await framework.checkGlobalVariable('ProgressionChart', 'Classe ProgressionChart');
            return { status: 'ProgressionChart disponible' };
        });
        
        // Test 3: Vérifier que les données sont chargées
        await framework.runTest('Données chargées', async (page) => {
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
            
            if (dataStatus.drivers === 0) {
                throw new Error('Aucun pilote chargé');
            }
            
            return dataStatus;
        });
        
        // Test 4: Vérifier qu'un pilote peut être trouvé
        await framework.runTest('Pilote disponible', async (page) => {
            const pilotInfo = await page.evaluate(() => {
                const data = window.getFilteredData();
                const byDriver = data.byDriver || {};
                const driverKeys = Object.keys(byDriver);
                
                if (driverKeys.length === 0) {
                    return { error: 'Aucun pilote trouvé' };
                }
                
                const firstDriverKey = driverKeys[0];
                const driver = byDriver[firstDriverKey];
                
                return {
                    driverKey: firstDriverKey,
                    firstName: driver.firstName,
                    lastName: driver.lastName,
                    cupCategory: driver.cupCategory
                };
            });
            
            if (pilotInfo.error) {
                throw new Error(pilotInfo.error);
            }
            
            return pilotInfo;
        });
        
        // Test 5: Vérifier que getAllPilotLaps fonctionne
        await framework.runTest('getAllPilotLaps fonctionne', async (page) => {
            const lapsInfo = await page.evaluate(() => {
                if (typeof window.getAllPilotLaps !== 'function') {
                    return { error: 'getAllPilotLaps non disponible' };
                }
                
                const data = window.getFilteredData();
                const byDriver = data.byDriver || {};
                const driverKeys = Object.keys(byDriver);
                
                if (driverKeys.length === 0) {
                    return { error: 'Aucun pilote disponible' };
                }
                
                const [firstName, lastName, cupCategory] = driverKeys[0].split('_');
                const laps = window.getAllPilotLaps(firstName, lastName, parseInt(cupCategory));
                
                return {
                    lapsFound: laps.length,
                    firstLap: laps.length > 0 ? Object.keys(laps[0]) : []
                };
            });
            
            if (lapsInfo.error) {
                throw new Error(lapsInfo.error);
            }
            
            if (lapsInfo.lapsFound === 0) {
                throw new Error('Aucun tour trouvé pour le pilote');
            }
            
            return lapsInfo;
        });
        
        // Test 6: Vérifier que le modal peut être ouvert
        await framework.runTest('Modal pilote s\'ouvre', async (page) => {
            const pilotKey = await page.evaluate(() => {
                const data = window.getFilteredData();
                const byDriver = data.byDriver || {};
                const driverKeys = Object.keys(byDriver);
                return driverKeys.length > 0 ? driverKeys[0] : null;
            });
            
            if (!pilotKey) {
                throw new Error('Aucun pilote disponible pour ouvrir le modal');
            }
            
            // Ouvrir le modal
            await page.evaluate((key) => {
                window.openPilotModal(key);
            }, pilotKey);
            
            // Attendre que le modal s'ouvre
            await page.waitForTimeout(3000);
            
            // Vérifier que le modal est visible
            await framework.checkElementVisible('#pilotModal', 'Modal pilote');
            
            return { pilotKey, modalOpened: true };
        });
        
        // Test 7: Vérifier que le canvas du graphique existe
        await framework.runTest('Canvas du graphique existe', async (page) => {
            await framework.checkElementExists('#progressionChart', 'Canvas du graphique');
            return { canvasExists: true };
        });
        
        // Test 8: Vérifier que le graphique est initialisé
        await framework.runTest('Graphique initialisé', async (page) => {
            const chartState = await page.evaluate(() => {
                const canvas = document.getElementById('progressionChart');
                if (!canvas) {
                    return { error: 'Canvas non trouvé' };
                }
                
                const chart = Chart.getChart(canvas);
                if (!chart) {
                    return { error: 'Graphique non initialisé' };
                }
                
                return {
                    canvasVisible: canvas.style.display !== 'none',
                    chartExists: true,
                    labels: chart.data.labels.length,
                    datasets: chart.data.datasets.length,
                    datasetsInfo: chart.data.datasets.map(ds => ({
                        label: ds.label,
                        dataLength: ds.data.length,
                        borderColor: ds.borderColor
                    }))
                };
            });
            
            if (chartState.error) {
                throw new Error(chartState.error);
            }
            
            if (!chartState.canvasVisible) {
                throw new Error('Canvas du graphique non visible');
            }
            
            if (chartState.labels === 0) {
                throw new Error('Aucun label (session) dans le graphique');
            }
            
            if (chartState.datasets === 0) {
                throw new Error('Aucun dataset dans le graphique');
            }
            
            return chartState;
        });
        
        // Test 9: Vérifier que le graphique est interactif
        await framework.runTest('Graphique interactif', async (page) => {
            const interactivity = await page.evaluate(() => {
                const canvas = document.getElementById('progressionChart');
                if (!canvas) return { error: 'Canvas non trouvé' };
                
                const chart = Chart.getChart(canvas);
                if (!chart) return { error: 'Graphique non trouvé' };
                
                // Vérifier que tous les datasets ont des données
                const allDatasetsHaveData = chart.data.datasets.every(ds => ds.data.length > 0);
                
                // Vérifier que les données sont valides (pas de NaN ou null)
                const allDataValid = chart.data.datasets.every(ds => 
                    ds.data.every(value => value !== null && value !== undefined && !isNaN(value))
                );
                
                return {
                    allDatasetsHaveData,
                    allDataValid,
                    isInteractive: allDatasetsHaveData && allDataValid
                };
            });
            
            if (interactivity.error) {
                throw new Error(interactivity.error);
            }
            
            if (!interactivity.isInteractive) {
                throw new Error('Graphique non interactif - données manquantes ou invalides');
            }
            
            return interactivity;
        });
        
        // Test 10: Vérifier qu'il n'y a pas d'erreurs dans la console
        await framework.runTest('Aucune erreur console', async (page) => {
            await framework.checkNoConsoleErrors();
            return { noErrors: true };
        });
        
        // Prendre une capture d'écran finale
        await framework.takeScreenshot('progression-chart-final');
        
        // Générer et sauvegarder le rapport
        const reportFile = await framework.saveReport();
        
        console.log('\n🎉 VALIDATION TERMINÉE AVEC SUCCÈS !');
        console.log('=====================================');
        console.log(`📊 Rapport sauvegardé: ${reportFile}`);
        
        return reportFile;
        
    } catch (error) {
        console.error('❌ ERREUR LORS DE LA VALIDATION:', error.message);
        
        // Prendre une capture d'écran d'erreur
        await framework.takeScreenshot('progression-chart-error');
        
        // Sauvegarder le rapport même en cas d'erreur
        const reportFile = await framework.saveReport();
        console.log(`📊 Rapport d'erreur sauvegardé: ${reportFile}`);
        
        throw error;
        
    } finally {
        await framework.cleanup();
    }
}

// Exécuter la validation si le script est appelé directement
if (require.main === module) {
    validateProgressionChart().catch(console.error);
}

module.exports = validateProgressionChart;
