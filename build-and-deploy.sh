#!/bin/bash

# Script de build et déploiement complet
# Inclut la validation, le build et le déploiement

set -e  # Arrêter en cas d'erreur

echo "🔧 Build et déploiement de Sim Racing Practice Analyzer"
echo "=================================================="

# Fonction pour afficher les étapes
step() {
    echo ""
    echo "📋 Étape: $1"
    echo "----------------------------------------"
}

# Étape 1: Validation des fichiers source
step "Validation des fichiers source"
if [ ! -f "index.html" ]; then
    echo "❌ index.html manquant"
    exit 1
fi

if [ ! -f "script-public.js" ]; then
    echo "❌ script-public.js manquant"
    exit 1
fi

if [ ! -d "src/components" ]; then
    echo "❌ Dossier src/components manquant"
    exit 1
fi

echo "✅ Tous les fichiers source présents"

# Étape 2: Nettoyage du dossier deploy
step "Nettoyage du dossier deploy"
if [ -d "deploy" ]; then
    echo "🗑️ Suppression du contenu du dossier deploy..."
    find deploy -type f -not -path "deploy/.firebase/*" -not -name ".firebaserc" -not -name "firebase.json" -delete
    find deploy -type d -empty -delete
fi

# Étape 3: Build - Copie des fichiers
step "Build - Copie des fichiers"
echo "📁 Copie des fichiers source..."

# Copier tous les fichiers nécessaires
cp -r src/ deploy/
cp consistency-analyzer.js deploy/
cp progression-chart.js deploy/
cp script-public.js deploy/
cp style.css deploy/
cp index.html deploy/
cp theme-manager.js deploy/

# Copier les fichiers de configuration
if [ -f "firebase-config.js" ]; then
    cp firebase-config.js deploy/
fi

# Copier les thèmes s'ils existent
if [ -d "themes" ]; then
    cp -r themes/ deploy/
fi

# Copier Chart.js si nécessaire
if [ -f "chart.min.js" ]; then
    cp chart.min.js deploy/
fi

echo "✅ Build terminé"

# Étape 4: Validation du build
step "Validation du build"
echo "🔍 Vérification des fichiers critiques dans deploy/..."

critical_files=(
    "deploy/index.html"
    "deploy/script-public.js"
    "deploy/style.css"
    "deploy/src/components/pilot-card/pilot-card-integration.js"
    "deploy/src/components/driver-table/driver-table-integration.js"
)

for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier manquant: $file"
        exit 1
    fi
done

echo "✅ Tous les fichiers critiques présents"

# Étape 5: Test rapide (optionnel)
step "Test rapide du contenu"
echo "🧪 Vérification du contenu des fichiers modifiés..."

# Vérifier que "Variabilité" n'est plus présent
if grep -r "Variabilité" deploy/src/ 2>/dev/null; then
    echo "❌ ATTENTION: 'Variabilité' encore présent dans le build !"
    exit 1
fi

# Vérifier que "Constance" est présent
if ! grep -r "Constance" deploy/src/ 2>/dev/null; then
    echo "❌ ATTENTION: 'Constance' manquant dans le build !"
    exit 1
fi

echo "✅ Contenu validé"

# Étape 6: Déploiement
step "Déploiement Firebase"
echo "🌐 Déploiement vers Firebase Hosting..."

firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DÉPLOIEMENT RÉUSSI !"
    echo "=================================================="
    echo "🌐 Application: https://simracing-practice-analyzer.web.app"
    echo "📊 Console: https://console.firebase.google.com/project/simracing-practice-analyzer/overview"
    echo ""
    echo "✅ Toutes les modifications ont été déployées avec succès"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi
