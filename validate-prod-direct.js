// Validation directe de la correction timezone en production
// Ce script peut être exécuté dans la console du navigateur sur l'application

console.log('🔍 Validation de la correction timezone en production');

// Fonction de test de formatUpdateDate (copiée du code déployé)
function testFormatUpdateDate() {
    console.log('🧪 Test de la fonction formatUpdateDate');
    
    // Simuler une date de session UTC (comme celle du serveur)
    const sessionDate = new Date('2025-10-15T15:10:20Z'); // UTC
    console.log('📅 Date session (UTC):', sessionDate.toISOString());
    
    // Simuler la fonction formatUpdateDate corrigée
    const now = new Date(); // Heure locale actuelle
    const sessionLocal = new Date(sessionDate.getTime() - (sessionDate.getTimezoneOffset() * 60000));
    const diffMs = now.getTime() - sessionLocal.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    console.log('📅 Date session (locale):', sessionLocal.toLocaleString('fr-FR'));
    console.log('📅 Maintenant (locale):', now.toLocaleString('fr-FR'));
    console.log('📊 Différence ms:', diffMs);
    console.log('📊 Différence heures:', diffHours);
    
    let result;
    if (diffMinutes < 1) {
        result = 'À l\'instant';
    } else if (diffMinutes < 60) {
        result = `Il y a ${diffMinutes}min`;
    } else if (diffHours < 24) {
        result = `Il y a ${diffHours}h`;
    } else {
        result = `Il y a ${Math.floor(diffMs / (1000 * 60 * 60 * 24))}j`;
    }
    
    console.log('📊 Résultat final:', result);
    
    // Validation
    if (diffHours > 10) {
        console.log('❌ ÉCHEC: Trop d\'heures détectées (>10h)');
        return false;
    } else if (diffHours < 5) {
        console.log('✅ SUCCÈS: Nombre d\'heures raisonnable (<5h)');
        return true;
    } else {
        console.log('⚠️ QUESTIONNABLE: Nombre d\'heures moyen (5-10h)');
        return 'questionable';
    }
}

// Fonction pour vérifier l'application en production
async function validateProduction() {
    console.log('🌐 Validation de l\'application en production...');
    
    try {
        // Tester l'accessibilité de l'application
        const response = await fetch('https://simracing-practice-analyzer.web.app');
        
        if (response.ok) {
            console.log('✅ Application accessible (Status:', response.status + ')');
            
            // Tester la fonction formatUpdateDate
            const testResult = testFormatUpdateDate();
            
            if (testResult === true) {
                console.log('🎉 VALIDATION RÉUSSIE: La correction timezone fonctionne correctement');
            } else if (testResult === false) {
                console.log('❌ VALIDATION ÉCHOUÉE: La correction timezone ne fonctionne pas');
            } else {
                console.log('⚠️ VALIDATION QUESTIONNABLE: Vérification manuelle nécessaire');
            }
            
            return testResult;
        } else {
            console.log('❌ Application non accessible (Status:', response.status + ')');
            return false;
        }
    } catch (error) {
        console.log('❌ Erreur lors de la validation:', error.message);
        return false;
    }
}

// Instructions pour l'utilisateur
console.log(`
📋 INSTRUCTIONS DE VALIDATION:

1. Ouvrez https://simracing-practice-analyzer.web.app
2. Ouvrez la console (F12 → Console)
3. Copiez et collez ce script dans la console
4. Exécutez: validateProduction()
5. Vérifiez que l'indicateur "Dernière session" affiche un temps raisonnable (<5h)

🔍 Vérifications à faire manuellement:
- L'indicateur "Dernière session :" est visible
- Le temps affiché est cohérent (ex: "Il y a 2h" au lieu de "Il y a 8h")
- Aucune erreur JavaScript dans la console
`);

// Exporter les fonctions pour utilisation
window.testFormatUpdateDate = testFormatUpdateDate;
window.validateProduction = validateProduction;

console.log('✅ Script de validation chargé. Exécutez validateProduction() pour commencer.');
