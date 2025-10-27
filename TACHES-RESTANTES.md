# 📋 TÂCHES RESTANTES - Tests de Parité

## ✅ TERMINÉ
1. ✅ **Dernière session** - Calculée depuis sessions.Date (commit 8faa3cb)

## ⏳ RESTE À FAIRE

### 2️⃣ UI Header (icône thème, admin panel, titre)
- Comparer visuellement prod vs React
- Fichiers: `Header.jsx`, `Header.css`, `ThemeToggle.jsx`

### 3️⃣ Tri par temps (0/null = pire temps)
- **Problème**: Temps à 0 ou null considérés comme meilleurs
- **Solution**: Dans `useSorting.js`, gérer les valeurs nulles/0 comme Infinity
- **Référence prod**: ligne 959-974 de `script-public.js`

### 4️⃣ Vincent Roy misano - 30 vs 33 pilotes
- **Problème**: React affiche 33 pilotes, prod 30
- **Cause possible**: Pilotes sans données valides inclus dans React
- **À vérifier**: `useProcessedData.js` vs `processSessionData` prod

### 5️⃣ Écart au leader
- **Problème**: Affiche `--:--.---` au lieu du temps
- **Solution**: Calculer l'écart entre `driver.bestValidTime` et le meilleur temps de la piste
- **Fichier**: `frontend/src/components/pilot/PilotStats.jsx` ligne 54

### 6️⃣ Graphique progression
- **Problème**: Logique différente de la prod
- **Solution**: Comparer `ProgressionChart.jsx` avec le code du graphique en prod
- **Référence**: Chercher le code du graphique dans `script-public.js` ou fichiers séparés

### 7️⃣ Segments layout
- **Problème**: 4 cartes en colonne au lieu de 2x2
- **Solution**: CSS grid 2x2 sur grand écran
- **Fichier**: `SegmentComparator.css` - Modifier `.segment-grid`

### 8️⃣ Détail des tours
- **Problème**: Données incorrectes dans le tableau
- **Solution**: Comparer `LapsTable.jsx` avec la prod
- **À vérifier**: Format de `lap.sessionDate`, `lap.isValid`, `lap.isWetSession`

## 🔍 MÉTHODE DE TEST

Pour chaque tâche:
1. Créer un test Playwright `tests/e2e/test-[nom].spec.js`
2. Comparer Prod vs React côte à côte
3. Identifier les différences (logs console, screenshots)
4. Comparer le code React avec `script-public.js`
5. Corriger et commit

## 📝 COMMITS RÉCENTS
- `bffa24e`: Dernière session depuis sessions (première tentative)
- `8faa3cb`: Fix metadata calcul au chargement initial

## 🚀 ÉTAT GLOBAL
- Liste pilotes: ✅ 100% parité
- Fiche pilote structure: ✅ Complète
- Fiche pilote données: ⏳ 7 bugs à corriger

