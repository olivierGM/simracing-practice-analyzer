#!/bin/bash

# Script de déploiement automatisé pour Sim Racing Practice Analyzer
# Ce script synchronise les fichiers source vers le dossier deploy/ puis déploie

echo "🚀 Début du processus de déploiement..."

# Vérifier qu'on est dans le bon dossier
if [ ! -f "firebase.json" ]; then
    echo "❌ Erreur: firebase.json non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

echo "📁 Synchronisation des fichiers source vers deploy/..."

# Supprimer l'ancien dossier deploy/src s'il existe
if [ -d "deploy/src" ]; then
    rm -rf deploy/src
    echo "   🗑️ Ancien dossier deploy/src supprimé"
fi

# Copier tous les fichiers nécessaires vers deploy/
echo "   📋 Copie des fichiers source..."
cp -r src/ deploy/
cp consistency-analyzer.js deploy/
cp progression-chart.js deploy/
cp script-public.js deploy/
cp style.css deploy/
cp index.html deploy/
cp theme-manager.js deploy/

# Copier les fichiers de configuration Firebase s'ils existent
if [ -f "firebase-config.js" ]; then
    cp firebase-config.js deploy/
fi

# Copier les autres fichiers statiques nécessaires
if [ -d "themes" ]; then
    cp -r themes/ deploy/
fi

echo "   ✅ Fichiers synchronisés"

# Vérifier que les fichiers critiques sont présents
echo "🔍 Vérification des fichiers critiques..."
if [ ! -f "deploy/index.html" ]; then
    echo "❌ Erreur: deploy/index.html manquant"
    exit 1
fi

if [ ! -f "deploy/src/components/pilot-card/pilot-card-integration.js" ]; then
    echo "❌ Erreur: pilot-card-integration.js manquant"
    exit 1
fi

echo "   ✅ Tous les fichiers critiques présents"

# Déployer avec Firebase
echo "🌐 Déploiement vers Firebase..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi !"
    echo "🌐 Application disponible sur: https://simracing-practice-analyzer.web.app"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

echo "🎉 Processus de déploiement terminé avec succès !"
