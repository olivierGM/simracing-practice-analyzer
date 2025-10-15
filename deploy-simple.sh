#!/bin/bash

# Script de déploiement simplifié et robuste
# Synchronise tous les fichiers nécessaires et déploie

echo "🚀 Déploiement Sim Racing Practice Analyzer"
echo "=========================================="

# Vérifier qu'on est dans le bon dossier
if [ ! -f "firebase.json" ]; then
    echo "❌ Erreur: firebase.json non trouvé. Exécutez depuis la racine du projet."
    exit 1
fi

echo "📁 Synchronisation des fichiers..."

# Copier tous les fichiers nécessaires (en écrasant les existants)
cp -f index.html deploy/
cp -f script-public.js deploy/
cp -f style.css deploy/
cp -f consistency-analyzer.js deploy/
cp -f progression-chart.js deploy/
cp -f theme-manager.js deploy/

# Copier les composants
if [ -d "src" ]; then
    rm -rf deploy/src
    cp -r src deploy/
fi

echo "✅ Fichiers synchronisés"

# Vérifier que les fichiers critiques sont présents
echo "🔍 Vérification..."
if [ ! -f "deploy/index.html" ]; then
    echo "❌ Erreur: deploy/index.html manquant"
    exit 1
fi

echo "✅ Vérification OK"

# Déployer
echo "🌐 Déploiement Firebase..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DÉPLOIEMENT RÉUSSI !"
    echo "🌐 https://simracing-practice-analyzer.web.app"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi
