#!/bin/bash

# Script pour tester visuellement le drill Frein + Accélérateur
# Lance Playwright avec screenshots

echo "🎬 Lancement du test visuel du drill Frein + Accélérateur..."
echo ""

cd "$(dirname "$0")"

# Lancer le test avec headed mode (visible) et reporter détaillé
npx playwright test tests/e2e/brake-accel-drill-visual-debug.spec.js --headed --reporter=list

echo ""
echo "📸 Screenshots sauvegardés dans: assets/images/debug/"
echo ""
echo "Fichiers créés:"
ls -lh assets/images/debug/brake-accel-*.png 2>/dev/null || echo "Aucun screenshot trouvé"
