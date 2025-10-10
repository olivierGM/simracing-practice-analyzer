# Plan de Nettoyage - Architecture

## 📁 Structure Cible

```
/
├── assets/              ✅ GARDER (data, images, reports)
├── deploy/              ✅ GARDER (Firebase deployment)
├── docs/                ✅ GARDER (documentation)
├── scripts/             ✅ GARDER (deployment scripts)
├── src/                 ✅ GARDER (composants)
├── tests/               ✅ GARDER (tests e2e et integration)
├── node_modules/        ✅ GARDER (dependencies)
├── test-results/        ✅ GARDER (résultats tests)
├── index.html           ✅ GARDER (page principale)
├── firebase-config.js   ✅ GARDER (config Firebase)
├── style.css            ✅ GARDER (styles principaux)
├── script-public.js     ✅ GARDER (script principal production)
├── chart.min.js         ✅ GARDER (Chart.js)
├── consistency-analyzer.js ✅ GARDER (analyseur de consistance)
├── progression-chart.js ✅ GARDER (classe ProgressionChart)
├── theme-manager.js     ✅ GARDER (gestionnaire de thème)
├── package.json         ✅ GARDER
├── playwright.config.js ✅ GARDER
├── README.md            ✅ GARDER
├── .gitignore           ✅ GARDER
└── *.md (docs racine)   ✅ GARDER
```

## 🗑️ Fichiers à Déplacer/Supprimer

### Scripts de développement obsolètes
- `script.js` → ❓ Vérifier si utilisé, sinon supprimer
- `script-firebase.js` → ❓ Vérifier si utilisé, sinon supprimer
- `script-local-server.js` → ❓ Vérifier si utilisé, sinon supprimer
- `script-new.js` → ❓ Vérifier si utilisé, sinon supprimer
- `server-local.js` → ❓ Vérifier si utilisé, sinon supprimer

### Fichiers d'intégration (maintenant dans src/)
- `pilot-card-integration.js` → ✅ GARDER (fichier d'intégration actif)
- `driver-table-integration.js` → ✅ GARDER (fichier d'intégration actif)
- `segment-comparator-integration.js` → ✅ GARDER (fichier d'intégration actif)

### Anciens fichiers
- `pilot-modal.js` → ⚠️ Ancien système, remplacé par pilot-card-integration.js

### Screenshots de debug
- `broken-functionality-diagnostic-fixed.png` → 🗑️ Déplacer vers assets/images/debug/
- `css-loading-debug.png` → 🗑️ Déplacer vers assets/images/debug/
- `modal-*.png` (5 fichiers) → 🗑️ Déplacer vers assets/images/debug/
- `pilot-modal-bugs.png` → 🗑️ Déplacer vers assets/images/debug/
- `final-bugs-validation.png` → 🗑️ Déplacer vers assets/images/debug/
- `test-error-screenshot.png` → 🗑️ Déplacer vers assets/images/debug/

### Fichiers de test temporaires
- `test-functionality-simple.html` → 🗑️ Déplacer vers tests/debug/
- `test-scroll-real.js` → 🗑️ Supprimer (temporaire)

### Fichiers HTML de dev
- `feature-selector.html` → ❓ Vérifier utilité, peut-être déplacer vers tests/

## 🎯 Actions Proposées

1. **Créer** `assets/images/debug/` pour les screenshots de debug
2. **Créer** `tests/debug/` pour les fichiers de test temporaires
3. **Déplacer** les screenshots vers `assets/images/debug/`
4. **Vérifier** l'utilisation des scripts obsolètes
5. **Supprimer** les fichiers temporaires
6. **Documenter** l'architecture finale

Voulez-vous que je procède au nettoyage ?

