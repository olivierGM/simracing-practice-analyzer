# EGT Auto Scraper - Firebase Functions

## 📋 Vue d'ensemble

Ce système automatise la récupération des données de sessions depuis le serveur EGT (http://51.161.118.36:8773/results) et les intègre dans l'application Sim Racing Practice Analyzer.

## 🏗️ Architecture

```
functions/
├── index.js                    # Point d'entrée principal
├── scraper/
│   ├── egt-scraper.js         # Scraping de la page EGT
│   └── download-manager.js    # Gestion des téléchargements
├── firestore/
│   ├── logs-collection.js     # Logs de scraping
│   └── session-storage.js     # Stockage des sessions
└── package.json               # Dépendances
```

## 🚀 Fonctions Disponibles

### 1. **scrapeEGTHourly** (Cron Job)
- **Déclenchement**: Automatique toutes les heures
- **Description**: Scrape et télécharge les nouvelles sessions EGT
- **Logs**: Stockés dans Firestore collection `scraping_logs`

### 2. **scrapeEGTManual** (HTTP)
- **Endpoint**: `POST /scrapeEGTManual`
- **Description**: Déclenchement manuel du scraping
- **Authentification**: Bearer token requis

### 3. **getScrapingLogs** (HTTP)
- **Endpoint**: `GET /getScrapingLogs?limit=50`
- **Description**: Récupère les logs récents de scraping

### 4. **testScraping** (HTTP)
- **Endpoint**: `GET /testScraping`
- **Description**: Test du scraping pour développement

## 📊 Processus de Scraping

1. **Scraping HTML**: Parse la table EGT pour extraire les sessions
2. **Filtrage**: Compare avec les sessions existantes en base
3. **Téléchargement**: Télécharge les nouvelles sessions (délai 5s entre chaque)
4. **Validation**: Vérifie la validité des JSON téléchargés
5. **Sauvegarde**: Stocke les sessions dans Firestore
6. **Logs**: Enregistre tous les détails dans `scraping_logs`

## 🧪 Développement Local

### Installation
```bash
cd functions
npm install
```

### Lancer l'émulateur
```bash
npm run serve
```

### Tester
```bash
# Test simple
curl http://localhost:5001/votre-projet-id/us-central1/testScraping

# Interface Firebase Emulator
http://localhost:4000
```

## 📝 Logs et Monitoring

### Structure des Logs
```javascript
{
  timestamp: "2025-01-14T12:00:00Z",
  runId: "run_1642156800000_abc12",
  status: "completed", // started, completed, failed
  trigger: "scheduled", // scheduled, manual, test
  
  scraping: {
    totalSessionsFound: 20,
    newSessionsFound: 3,
    existingSessionsIgnored: 17
  },
  
  downloads: {
    total: 3,
    successful: 3,
    failed: 0,
    successRate: 100
  },
  
  sessions: {
    downloaded: ["session1", "session2", "session3"],
    failed: []
  },
  
  executionTime: 25000, // ms
  errors: []
}
```

### Collection Firestore
- **sessions**: Sessions téléchargées
- **scraping_logs**: Logs de chaque run
- **processedData**: Données traitées (overall, byCategory, byDriver)

## 🔧 Configuration

### Variables d'environnement
```bash
# Firebase Project ID
FIREBASE_PROJECT_ID=simracing-practice-analyzer

# URL EGT (par défaut)
EGT_URL=http://51.161.118.36:8773/results

# Délai entre téléchargements (ms)
DOWNLOAD_DELAY=5000
```

### Déploiement
```bash
npm run deploy
```

## 🚨 Gestion d'Erreurs

- **Timeout**: 30s pour les requêtes HTTP
- **Retry**: Pas de retry automatique (éviter la surcharge du serveur EGT)
- **Fallback**: Logs d'erreur détaillés pour debugging
- **Rate Limiting**: 5 secondes entre chaque téléchargement

## 📈 Métriques

Le système track automatiquement:
- Nombre de sessions trouvées
- Nouvelles sessions détectées
- Taux de succès des téléchargements
- Temps d'exécution
- Erreurs rencontrées

## 🔐 Sécurité

- Authentification requise pour le déclenchement manuel
- Validation des données JSON avant sauvegarde
- Gestion des erreurs sans exposition d'informations sensibles
- Timeout pour éviter les requêtes bloquantes
