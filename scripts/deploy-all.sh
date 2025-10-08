#!/bin/bash

# Script de déploiement complet (GitHub + Firebase)
# Usage: ./deploy-all.sh "Message de commit"

echo "🚀 Déploiement complet (GitHub + Firebase)..."

# Vérifier si un message de commit est fourni
if [ -z "$1" ]; then
    echo "❌ Veuillez fournir un message de commit"
    echo "Usage: ./deploy-all.sh \"Votre message de commit\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo "📝 Message de commit: $COMMIT_MESSAGE"

# 1. Synchroniser avec Firebase
echo ""
echo "🔥 Étape 1: Synchronisation Firebase..."
./sync-firebase.sh

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la synchronisation Firebase"
    exit 1
fi

# 2. Déployer sur GitHub
echo ""
echo "🌐 Étape 2: Déploiement GitHub..."
./deploy-to-github.sh "$COMMIT_MESSAGE"

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du déploiement GitHub"
    exit 1
fi

echo ""
echo "🎉 Déploiement complet réussi !"
echo "📊 GitHub: https://github.com/olivierGM/simracing-practice-analyzer"
echo "🌐 Firebase: https://simracing-practice-analyzer.web.app"
