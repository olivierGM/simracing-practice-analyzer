#!/bin/bash

echo "🧹 Nettoyage de l'architecture..."

# Créer les dossiers pour organiser les fichiers
echo "📁 Création des dossiers d'organisation..."
mkdir -p assets/images/debug
mkdir -p tests/debug
mkdir -p archive/old-scripts

# Déplacer les screenshots de debug
echo "📸 Déplacement des screenshots de debug..."
mv broken-functionality-diagnostic-fixed.png assets/images/debug/ 2>/dev/null || true
mv css-loading-debug.png assets/images/debug/ 2>/dev/null || true
mv modal-*.png assets/images/debug/ 2>/dev/null || true
mv pilot-modal-bugs.png assets/images/debug/ 2>/dev/null || true
mv final-bugs-validation.png assets/images/debug/ 2>/dev/null || true
mv test-error-screenshot.png assets/images/debug/ 2>/dev/null || true

# Déplacer les anciens scripts vers archive
echo "📦 Archivage des anciens scripts..."
mv script.js archive/old-scripts/ 2>/dev/null || true
mv script-firebase.js archive/old-scripts/ 2>/dev/null || true
mv script-local-server.js archive/old-scripts/ 2>/dev/null || true
mv script-new.js archive/old-scripts/ 2>/dev/null || true
mv server-local.js archive/old-scripts/ 2>/dev/null || true
mv pilot-modal.js archive/old-scripts/ 2>/dev/null || true

# Déplacer les fichiers de test temporaires
echo "🧪 Déplacement des fichiers de test..."
mv test-functionality-simple.html tests/debug/ 2>/dev/null || true
mv test-scroll-real.js tests/debug/ 2>/dev/null || true

# Déplacer feature-selector vers tests
echo "🔧 Déplacement de feature-selector..."
mv feature-selector.html tests/debug/ 2>/dev/null || true

# Résumé
echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "📊 Structure après nettoyage:"
echo "  - Screenshots debug → assets/images/debug/"
echo "  - Anciens scripts → archive/old-scripts/"
echo "  - Tests temporaires → tests/debug/"
echo ""
echo "📁 Dossiers créés:"
ls -d assets/images/debug archive/old-scripts tests/debug 2>/dev/null
echo ""
echo "🔍 Fichiers restants à la racine:"
ls *.js *.html *.css 2>/dev/null | grep -v node_modules

