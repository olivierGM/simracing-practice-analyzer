#!/usr/bin/env node

/**
 * SCRIPT PRINCIPAL DE VALIDATION
 * Exécute tous les tests de validation automatiquement
 */

const validateAllFeatures = require('./validate-all-features');
const validateWithMCP = require('./mcp-validation');
const validateProgressionChart = require('./validation-progression-chart');

async function runCompleteValidation() {
    console.log('🚀 VALIDATION COMPLÈTE DU SITE');
    console.log('===============================');
    console.log('Ce script va exécuter tous les tests de validation automatiquement.\n');
    
    const startTime = Date.now();
    const results = {
        timestamp: new Date().toISOString(),
        startTime: startTime,
        validations: []
    };
    
    try {
        // 1. Validation des fonctionnalités de base
        console.log('📋 ÉTAPE 1: Validation des fonctionnalités de base');
        console.log('==================================================');
        const basicValidation = await validateAllFeatures();
        results.validations.push({
            type: 'basic-features',
            status: 'completed',
            result: basicValidation
        });
        
        // 2. Validation MCP
        console.log('\n🔧 ÉTAPE 2: Validation MCP');
        console.log('===========================');
        const mcpValidation = await validateWithMCP();
        results.validations.push({
            type: 'mcp-validation',
            status: 'completed',
            result: mcpValidation
        });
        
        // 3. Validation spécialisée du graphique
        console.log('\n📊 ÉTAPE 3: Validation spécialisée du graphique');
        console.log('===============================================');
        const chartValidation = await validateProgressionChart();
        results.validations.push({
            type: 'progression-chart',
            status: 'completed',
            result: chartValidation
        });
        
        // Calculer le temps total
        const totalTime = Date.now() - startTime;
        results.totalTime = totalTime;
        results.status = 'SUCCESS';
        
        // Sauvegarder le rapport final
        const fs = require('fs');
        const finalReport = `complete-validation-report-${Date.now()}.json`;
        fs.writeFileSync(finalReport, JSON.stringify(results, null, 2));
        
        console.log('\n🎉 VALIDATION COMPLÈTE TERMINÉE AVEC SUCCÈS !');
        console.log('==============================================');
        console.log(`⏱️  Temps total: ${totalTime}ms`);
        console.log(`📊 Rapport final: ${finalReport}`);
        console.log('\n✅ Toutes les fonctionnalités sont validées et fonctionnelles !');
        
        return finalReport;
        
    } catch (error) {
        const totalTime = Date.now() - startTime;
        results.totalTime = totalTime;
        results.status = 'FAILED';
        results.error = error.message;
        
        // Sauvegarder le rapport d'erreur
        const fs = require('fs');
        const errorReport = `validation-error-report-${Date.now()}.json`;
        fs.writeFileSync(errorReport, JSON.stringify(results, null, 2));
        
        console.error('\n❌ VALIDATION ÉCHOUÉE !');
        console.error('=======================');
        console.error(`⏱️  Temps écoulé: ${totalTime}ms`);
        console.error(`❌ Erreur: ${error.message}`);
        console.error(`📊 Rapport d'erreur: ${errorReport}`);
        
        throw error;
    }
}

// Exécuter la validation complète
if (require.main === module) {
    runCompleteValidation().catch(console.error);
}

module.exports = runCompleteValidation;
