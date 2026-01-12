#!/bin/bash

# Script pour tester le binding du clutch avec Playwright

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         🔬 TEST PLAYWRIGHT - VALIDATION CLUTCH BINDING             ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que le dev server est lancé
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "⚠️  ERREUR : Le dev server ne répond pas sur http://localhost:5173"
  echo "   Lancez d'abord : cd frontend && npm run dev"
  exit 1
fi

echo "✅ Dev server détecté sur http://localhost:5173"
echo ""

# Créer le dossier pour les screenshots si nécessaire
mkdir -p assets/images/debug

# Lancer le test
echo "🧪 Lancement du test..."
echo ""

npx playwright test tests/e2e/validate-clutch-binding.spec.js --headed

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                       📊 TEST TERMINÉ                               ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📸 Screenshots générés dans assets/images/debug/"
echo "   - clutch-config-panel.png"
echo "   - clutch-full-config.png"
echo ""
