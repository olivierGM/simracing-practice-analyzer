#!/bin/bash

# Script de synchronisation avec Firebase
# Usage: ./sync-firebase.sh

echo "🔥 Synchronisation avec Firebase..."

# Copier les fichiers vers le dossier deploy
echo "📁 Copie des fichiers vers deploy/..."
cp *.html deploy/
cp *.css deploy/
cp *.js deploy/
cp *.json deploy/

# Copier les assets
echo "📁 Copie des assets vers deploy/..."
cp -r assets/ deploy/

# Aller dans le dossier deploy
cd deploy

# Déployer sur Firebase
echo "🚀 Déploiement Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "✅ Déploiement Firebase réussi !"
    echo "🌐 Site: https://simracing-practice-analyzer.web.app"
else
    echo "❌ Erreur lors du déploiement Firebase"
    exit 1
fi

# Retourner au dossier parent
cd ..
