/**
 * Test rapide du mode sombre/clair
 * À exécuter dans la console du navigateur
 */

console.log('🧪 Test rapide du mode sombre/clair...');

// Vérifications de base
const checks = [
    {
        name: 'ThemeManager disponible',
        test: () => typeof window.themeManager !== 'undefined'
    },
    {
        name: 'Bouton toggle présent',
        test: () => document.getElementById('themeToggle') !== null
    },
    {
        name: 'Attribut data-theme',
        test: () => document.documentElement.hasAttribute('data-theme')
    },
    {
        name: 'Variables CSS',
        test: () => {
            const style = getComputedStyle(document.documentElement);
            return style.getPropertyValue('--bg-secondary') !== '';
        }
    }
];

let allPassed = true;

checks.forEach((check, index) => {
    try {
        const result = check.test();
        console.log(`${result ? '✅' : '❌'} ${index + 1}. ${check.name}`);
        if (!result) allPassed = false;
    } catch (error) {
        console.log(`❌ ${index + 1}. ${check.name} - Erreur: ${error.message}`);
        allPassed = false;
    }
});

// Test de basculement
if (allPassed && window.themeManager) {
    console.log('\n🔄 Test de basculement...');
    const initialTheme = window.themeManager.getCurrentTheme();
    window.themeManager.toggleTheme();
    const newTheme = window.themeManager.getCurrentTheme();
    
    if (newTheme !== initialTheme) {
        console.log('✅ Basculement fonctionne');
        console.log(`   ${initialTheme} → ${newTheme}`);
    } else {
        console.log('❌ Basculement ne fonctionne pas');
        allPassed = false;
    }
}

console.log(`\n📊 Résultat: ${allPassed ? '✅ TOUS LES TESTS PASSÉS' : '❌ CERTAINS TESTS ONT ÉCHOUÉ'}`);

if (allPassed) {
    console.log('🎉 Le mode sombre/clair fonctionne correctement !');
} else {
    console.log('⚠️ Vérifiez les erreurs ci-dessus.');
}
