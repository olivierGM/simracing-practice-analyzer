#!/bin/bash

echo "📦 ANALYSE DU BUNDLE - LAZY LOADING"
echo "===================================="
echo ""

cd "/Users/ogmegelas/Documents/practice lap/frontend"

echo "🔨 Build de production..."
npm run build

echo ""
echo "📊 Analyse des chunks JS générés:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh dist/assets/*.js | awk '{print $9, $5}'

echo ""
echo "🔍 Recherche des chunks liés aux drills:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh dist/assets/*[Dd]rill*.js 2>/dev/null | awk '{print "✅", $9, $5}' || echo "⚠️  Aucun chunk drill séparé trouvé"
ls -lh dist/assets/*[Pp]edal*.js 2>/dev/null | awk '{print "✅", $9, $5}' || echo "⚠️  Aucun chunk pedal séparé trouvé"
ls -lh dist/assets/*[Pp]age*.js 2>/dev/null | awk '{print "✅", $9, $5}' || echo "⚠️  Aucun chunk page séparé trouvé"

echo ""
echo "📈 Taille totale du bundle:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
du -sh dist/assets/*.js | awk '{print "Total JS:", $1}'

echo ""
echo "✅ Analyse terminée !"
