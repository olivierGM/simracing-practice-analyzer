#!/bin/bash

echo "🔍 Analyse des composants non utilisés..."
echo ""
echo "Architecture actuelle (hybride):"
echo "  ✅ CSS dans src/components/ - UTILISÉS (chargés dans index.html)"
echo "  ❌ JS dans src/components/ - NON UTILISÉS"
echo "  ✅ *-integration.js à la racine - UTILISÉS"
echo ""

# Créer le dossier archive pour les composants non utilisés
mkdir -p archive/components-unused

echo "📦 Archivage des fichiers JS non utilisés..."

# Archiver les fichiers .js des composants (garder les .css)
mv src/components/pilot-card/pilot-card.js archive/components-unused/ 2>/dev/null && echo "  ✅ pilot-card.js"
mv src/components/pilot-card/pilot-card.html archive/components-unused/ 2>/dev/null && echo "  ✅ pilot-card.html"
mv src/components/pilot-card/pilot-card-compat.js archive/components-unused/ 2>/dev/null && echo "  ✅ pilot-card-compat.js"

mv src/components/driver-table/driver-table.js archive/components-unused/ 2>/dev/null && echo "  ✅ driver-table.js"
mv src/components/driver-table/driver-table.html archive/components-unused/ 2>/dev/null && echo "  ✅ driver-table.html"

mv src/components/segment-comparator/segment-comparator.js archive/components-unused/ 2>/dev/null && echo "  ✅ segment-comparator.js"
mv src/components/segment-comparator/segment-comparator.html archive/components-unused/ 2>/dev/null && echo "  ✅ segment-comparator.html"

# Archiver src/shared/ qui n'est pas utilisé
mv src/shared archive/components-unused/ 2>/dev/null && echo "  ✅ src/shared/"

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "📁 Structure finale de src/:"
find src -type f -name "*.css" -o -name "*.config.js" -o -name "*.test.js" | head -20
echo ""
echo "📦 Fichiers archivés dans:"
echo "  archive/components-unused/"
ls -la archive/components-unused/ 2>/dev/null | head -15

