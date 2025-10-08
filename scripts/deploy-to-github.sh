#!/bin/bash

# Script de déploiement vers GitHub
# Usage: ./deploy-to-github.sh "Message de commit"

echo "🚀 Déploiement vers GitHub..."

# Vérifier si un message de commit est fourni
if [ -z "$1" ]; then
    echo "❌ Veuillez fournir un message de commit"
    echo "Usage: ./deploy-to-github.sh \"Votre message de commit\""
    exit 1
fi

COMMIT_MESSAGE="$1"

# Ajouter tous les fichiers
echo "📁 Ajout des fichiers..."
git add .

# Commit avec le message fourni
echo "💾 Commit des changements..."
git commit -m "$COMMIT_MESSAGE"

# Push vers GitHub
echo "🌐 Push vers GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi !"
    echo "🔗 Repository: https://github.com/olivierGM/simracing-practice-analyzer"
else
    echo "❌ Erreur lors du push"
    exit 1
fi
