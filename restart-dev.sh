#!/bin/bash

# Script pour nettoyer et redémarrer le serveur de dev

echo "🧹 Nettoyage du cache Vite..."
cd "$(dirname "$0")/frontend"
rm -rf node_modules/.vite
rm -rf dist

echo "🔄 Redémarrage du serveur..."
npm run dev
