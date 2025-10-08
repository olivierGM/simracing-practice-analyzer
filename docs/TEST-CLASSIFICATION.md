# 📋 GUIDE DE CLASSIFICATION DES TESTS

## 🎯 Règles de placement des tests

### 📁 `tests/e2e/` - Tests End-to-End
**Critères :** Tests complets qui simulent l'utilisation réelle de l'application
- Tests avec Playwright qui ouvrent le navigateur
- Tests qui naviguent entre plusieurs pages/composants
- Tests de validation complète d'une fonctionnalité
- Tests qui vérifient l'intégration entre composants

**Exemples :**
- `test-reorganization.js` ✅ (test complet de l'application)
- `test-dark-mode.html` ✅ (test visuel complet)
- `quick-test.js` ✅ (test rapide E2E)

### 📁 `tests/integration/` - Tests d'Intégration
**Critères :** Tests qui vérifient l'interaction entre modules/fonctions
- Tests qui valident plusieurs fonctions ensemble
- Tests de validation de données
- Tests de configuration et setup
- Tests de scripts utilitaires

**Exemples :**
- `validate-all-features.js` ✅ (validation complète)
- `mcp-validation.js` ✅ (validation MCP)
- `run-validation.js` ✅ (script de validation)

### 📁 `tests/fixtures/` - Données de Test
**Critères :** Fichiers de données pour les tests
- Fichiers JSON de test
- Mock data
- Données de référence
- Templates de test

## 🚫 **ERREURS À ÉVITER**

### ❌ Ne pas mettre à la racine :
- `test-*.js` → Toujours dans `tests/e2e/` ou `tests/integration/`
- `validate-*.js` → Toujours dans `tests/integration/`
- `*test*.html` → Toujours dans `tests/e2e/`

### ✅ Toujours dans le bon dossier :
- Tests Playwright → `tests/e2e/`
- Scripts de validation → `tests/integration/`
- Données de test → `tests/fixtures/`

## 🔍 **Comment classifier un nouveau test ?**

### Questions à se poser :
1. **Le test ouvre-t-il un navigateur ?** → `tests/e2e/`
2. **Le test valide-t-il plusieurs fonctions ensemble ?** → `tests/integration/`
3. **Le test contient-il des données de référence ?** → `tests/fixtures/`
4. **Le test est-il un script utilitaire ?** → `tests/integration/`

## 📝 **Template de nommage**

### Tests E2E :
```
tests/e2e/test-[feature]-[scenario].js
tests/e2e/test-[feature]-[scenario].html
```

### Tests d'intégration :
```
tests/integration/validate-[feature].js
tests/integration/test-[module]-integration.js
```

### Données de test :
```
tests/fixtures/[feature]-test-data.json
tests/fixtures/mock-[component].json
```

## 🎯 **Exemples concrets**

### ✅ Correct :
- `tests/e2e/test-pilot-modal.js` (test Playwright de la modal)
- `tests/integration/validate-consistency.js` (validation des calculs)
- `tests/fixtures/pilot-data.json` (données de test pilote)

### ❌ Incorrect :
- `test-pilot-modal.js` (à la racine)
- `validate-consistency.js` (à la racine)
- `pilot-data.json` (à la racine)

---

**🎯 Règle d'or :** Si c'est un test, il va dans `tests/` avec la bonne sous-catégorie !
