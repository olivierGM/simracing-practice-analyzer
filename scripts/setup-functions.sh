#!/bin/bash

echo "🔥 Configuration des Firebase Functions pour EGT Scraper..."

# Aller dans le dossier functions
cd functions

echo "📦 Installation des dépendances npm..."
npm install

echo "✅ Dépendances installées!"

echo ""
echo "🚀 Commandes disponibles:"
echo "  npm run serve     - Lancer l'émulateur Firebase local"
echo "  npm run deploy    - Déployer les fonctions sur Firebase"
echo "  npm run logs      - Voir les logs des fonctions déployées"
echo ""
echo "📝 Pour tester localement:"
echo "  1. Lancer: npm run serve"
echo "  2. Tester: http://localhost:5001/votre-projet-id/us-central1/testScraping"
echo "  3. Interface: http://localhost:4000 (Firebase Emulator UI)"
echo ""
echo "🎯 Fonctions disponibles:"
echo "  - scrapeEGTHourly  (cron toutes les heures)"
echo "  - scrapeEGTManual  (déclenchement manuel)"
echo "  - getScrapingLogs  (récupérer les logs)"
echo "  - testScraping     (test pour développement)"
