#!/bin/bash

# Script pour lancer le test automatique du drill Frein + Accélérateur
# Capture automatiquement toutes les infos et screenshots

echo "🎬 Lancement du test automatique du drill Frein + Accélérateur..."
echo ""

cd "$(dirname "$0")"

# Créer le dossier de debug s'il n'existe pas
mkdir -p assets/images/debug

# Lancer le test
npx playwright test tests/e2e/brake-accel-drill-auto-test.spec.js --reporter=list

echo ""
echo "✅ Test terminé!"
echo ""
echo "📸 Screenshots sauvegardés dans: assets/images/debug/"
echo ""
echo "Fichiers créés:"
ls -lh assets/images/debug/auto-test-*.png 2>/dev/null | tail -20

echo ""
echo "📊 Pour voir les logs complets, scroll up dans le terminal"
