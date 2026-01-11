#!/bin/bash

echo "🧪 Étape 1/4 - Tests Playwright des logos..."
cd "/Users/ogmegelas/Documents/practice lap"
npx playwright test all-logos-final --reporter=list

if [ $? -eq 0 ]; then
    echo "✅ Tests passés avec succès!"
else
    echo "⚠️  Tests échoués, mais on continue..."
fi

echo ""
echo "📦 Étape 2/4 - Build du frontend..."
cd "/Users/ogmegelas/Documents/practice lap/frontend"
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi!"
else
    echo "❌ Erreur lors du build"
    exit 1
fi

echo ""
echo "🚀 Étape 3/4 - Déploiement Firebase..."
cd "/Users/ogmegelas/Documents/practice lap"
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi!"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

echo ""
echo "🎉 Étape 4/4 - Terminé!"
echo "Visitez votre site en production pour vérifier les logos."
