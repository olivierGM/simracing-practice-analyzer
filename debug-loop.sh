#!/bin/bash

# Script de feedback loop automatique pour debugger le drill
# Lance le test, capture tout, et affiche les résultats

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  🔬 FEEDBACK LOOP AUTOMATIQUE - Drill Brake+Accel                 ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# Créer le dossier de debug
mkdir -p assets/images/debug

# Nettoyer les anciens fichiers
rm -f assets/images/debug/loop-*.png
rm -f assets/images/debug/loop-report.json

echo "🧹 Nettoyage des anciens fichiers de debug..."
echo ""

# Lancer le test avec output complet
npx playwright test tests/e2e/brake-accel-debug-loop.spec.js --reporter=list --workers=1

EXIT_CODE=$?

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  📊 RÉSUMÉ DU TEST                                                  ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Afficher les fichiers créés
echo "📸 Screenshots générés:"
ls -lh assets/images/debug/loop-*.png 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
echo ""

# Afficher le rapport JSON s'il existe
if [ -f "assets/images/debug/loop-report.json" ]; then
    echo "📄 Rapport JSON disponible: assets/images/debug/loop-report.json"
    echo ""
    
    # Extraire les infos clés avec jq si disponible
    if command -v jq &> /dev/null; then
        echo "🔑 Infos clés du rapport:"
        echo "   Crashed: $(jq -r '.drillCrashed' assets/images/debug/loop-report.json)"
        echo "   Crashed At: $(jq -r '.crashedAt' assets/images/debug/loop-report.json)ms"
        echo "   Console Errors: $(jq -r '.consoleErrors | length' assets/images/debug/loop-report.json)"
        echo "   Page Errors: $(jq -r '.pageErrors | length' assets/images/debug/loop-report.json)"
        echo ""
    fi
fi

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ TEST RÉUSSI - Le drill fonctionne correctement!"
else
    echo "❌ TEST ÉCHOUÉ - Le drill a des problèmes"
    echo ""
    echo "📋 Pour analyser:"
    echo "   1. Consulte les logs ci-dessus"
    echo "   2. Regarde assets/images/debug/loop-report.json"
    echo "   3. Examine les screenshots dans assets/images/debug/"
fi

echo ""
exit $EXIT_CODE
