# Architecture du Projet - Sim Racing Practice Analyzer

## 📁 Structure des Dossiers

```
simracing-practice-analyzer/
│
├── 📁 assets/                      # Ressources statiques
│   ├── data/                       # Fichiers JSON de sessions
│   ├── images/                     # Images et screenshots
│   │   ├── screenshots/            # Screenshots de validation
│   │   └── debug/                  # Screenshots de debug
│   └── reports/                    # Rapports de tests
│
├── 📁 src/                         # Code source des composants
│   ├── components/                 # Composants modulaires
│   │   ├── pilot-card/            # Composant fiche pilote
│   │   ├── driver-table/          # Composant tableau pilotes
│   │   └── segment-comparator/    # Composant comparateur segments
│   └── shared/                     # Code partagé
│
├── 📁 scripts/                     # Scripts de déploiement
│   ├── sync-firebase.sh           # Déploiement Firebase
│   ├── deploy-all.sh              # Déploiement complet
│   ├── deploy-to-github.sh        # Déploiement GitHub Pages
│   └── DEPLOYMENT.md              # Documentation déploiement
│
├── 📁 tests/                       # Tests
│   ├── e2e/                       # Tests end-to-end
│   ├── integration/               # Tests d'intégration
│   └── debug/                     # Fichiers de test temporaires
│
├── 📁 docs/                        # Documentation
│   ├── components/                # Docs des composants
│   ├── DEMARRAGE-RAPIDE.md
│   ├── FIREBASE-SETUP.md
│   └── ...
│
├── 📁 deploy/                      # Dossier de déploiement Firebase
│
├── 📁 archive/                     # Fichiers archivés
│   └── old-scripts/               # Anciens scripts obsolètes
│
└── 📄 Fichiers racine              # Fichiers principaux
    ├── index.html                 # Page principale
    ├── style.css                  # Styles globaux
    ├── script-public.js           # Script principal production
    ├── firebase-config.js         # Configuration Firebase
    ├── consistency-analyzer.js    # Analyseur de consistance
    ├── progression-chart.js       # Classe ProgressionChart
    ├── theme-manager.js           # Gestionnaire de thème
    ├── chart.min.js              # Bibliothèque Chart.js
    ├── pilot-card-integration.js  # Intégration pilot-card
    ├── driver-table-integration.js # Intégration driver-table
    ├── segment-comparator-integration.js # Intégration segment-comparator
    ├── package.json              # Dépendances npm
    ├── playwright.config.js      # Configuration Playwright
    └── README.md                 # Documentation principale
```

## 🔧 Fichiers Principaux

### Page HTML
- **index.html** - Point d'entrée de l'application

### Scripts Chargés (dans l'ordre)
1. **Chart.js** (CDN) - Bibliothèque de graphiques
2. **theme-manager.js** - Gestion du thème clair/sombre
3. **consistency-analyzer.js** - Analyse de la consistance des pilotes
4. **progression-chart.js** - Classe pour graphiques de progression
5. **firebase-config.js** - Configuration Firebase (module)
6. **script-public.js** - Script principal (module)
7. **pilot-card-integration.js** - Intégration composant fiche pilote
8. **driver-table-integration.js** - Intégration composant tableau
9. **segment-comparator-integration.js** - Intégration comparateur segments

### Styles
- **style.css** - Styles globaux de l'application
- **src/components/*/**.css** - Styles spécifiques aux composants

## 🎯 Architecture des Composants

### Composant Pilot Card
```
src/components/pilot-card/
├── pilot-card.js          # Logique du composant
├── pilot-card.css         # Styles du composant
├── pilot-card.html        # Template HTML
├── pilot-card.config.js   # Configuration
└── pilot-card-compat.js   # Compatibilité legacy
```

### Composant Driver Table
```
src/components/driver-table/
├── driver-table.js        # Logique du composant
├── driver-table.css       # Styles du composant
├── driver-table.html      # Template HTML
└── driver-table.config.js # Configuration
```

### Composant Segment Comparator
```
src/components/segment-comparator/
├── segment-comparator.js        # Logique du composant
├── segment-comparator.css       # Styles du composant
├── segment-comparator.html      # Template HTML
└── segment-comparator.config.js # Configuration
```

## 🔄 Flux de Données

1. **Chargement** : Firebase récupère les données JSON depuis Firestore
2. **Traitement** : `script-public.js` traite les données de sessions
3. **Affichage** : Les composants affichent les données
4. **Intégration** : Les fichiers `*-integration.js` connectent les composants à l'app

## 📦 Déploiement

### Firebase Hosting
```bash
./scripts/sync-firebase.sh
```

Copie les fichiers vers `deploy/` et déploie sur Firebase.

### Structure Déployée
```
deploy/
├── index.html
├── style.css
├── script-public.js
├── *-integration.js
├── *.js (helpers)
├── src/                # Composants
├── assets/             # Ressources
└── firebase.json       # Config Firebase
```

## 🧪 Tests

- **tests/e2e/** - Tests Playwright end-to-end
- **tests/integration/** - Tests d'intégration
- **tests/debug/** - Fichiers de test temporaires

## 📋 Fichiers Archivés

**archive/old-scripts/** contient les anciens scripts obsolètes :
- `script.js` - Ancien script principal
- `script-firebase.js` - Ancien script Firebase
- `script-local-server.js` - Ancien serveur local
- `script-new.js` - Version intermédiaire
- `server-local.js` - Serveur de dev
- `pilot-modal.js` - Ancien système de modal

Ces fichiers sont gardés pour référence mais ne sont plus utilisés.

## 🎨 Styles

### Hiérarchie CSS
1. **style.css** - Styles globaux et layout principal
2. **src/components/*/**.css** - Styles spécifiques aux composants
3. Variables CSS définies dans `style.css`

### Variables Principales
- `--bg-primary` - Background principal
- `--bg-secondary` - Background secondaire
- `--text-primary` - Couleur texte principal
- `--primary` - Couleur primaire (mauve)
- `--accent-color` - Couleur d'accent

## 📝 Documentation

- **README.md** - Documentation principale
- **docs/** - Documentation détaillée
  - `DEMARRAGE-RAPIDE.md` - Guide de démarrage
  - `FIREBASE-SETUP.md` - Configuration Firebase
  - `DEPLOYMENT.md` - Guide de déploiement
  - `components/*.md` - Documentation des composants
- **COMPARAISON-UI.md** - Comparaison ancienne/nouvelle UI
- **TESTS-UNITAIRES-VALIDATION.md** - Documentation des tests

## 🚀 Développement

### Démarrage
```bash
# Installer les dépendances
npm install

# Lancer le serveur local (si configuré)
npm run dev

# Déployer sur Firebase
./scripts/sync-firebase.sh
```

### Structure de Commit
- 🐛 Fix bugs
- ✨ Nouvelles fonctionnalités
- 🔧 Configuration
- 📝 Documentation
- 🎨 Styles/UI
- ♻️ Refactoring

## 🎯 Prochaines Étapes

- [ ] Migrer les anciens scripts vers composants si nécessaire
- [ ] Nettoyer les dépendances inutilisées
- [ ] Optimiser les performances
- [ ] Ajouter plus de tests unitaires

