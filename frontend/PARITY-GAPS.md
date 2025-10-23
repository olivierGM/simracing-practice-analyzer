# Écarts de Parité : React vs Production

## 🔴 CRITIQUES (Breaking differences)

### 1. Click sur Pilote
- **PROD:** Ouvre un MODAL (reste sur `https://simracing-practice-analyzer.web.app/`)
- **REACT:** Navigation vers `/circuit/misano/pilote/Mederick_Dumas_0`
- **ACTION:** Remplacer le routing par un modal

### 2. Colonnes du Tableau
#### PROD (14 colonnes):
1. Pos
2. Pilote ↕
3. Classe ↕ (badge coloré PRO/SILVER/AMATEUR)
4. Tours ↕ (total)
5. Tours Valides ↕
6. Meilleur valide ↕
7. Moyenne valide ↕
8. Const. valide ↕ (%)
9. Meilleur wet ↕
10. Moyenne wet ↕
11. Const. wet ↕ (%)
12. Meilleur total ↕
13. Moyenne total ↕
14. Const. total ↕ (%)

#### REACT (7 colonnes):
1. Position ↑
2. Pilote
3. Meilleur temps
4. Potentiel
5. Constance
6. Tours valides
7. Dernière session

**ACTION:** Réécrire `DriversTable` pour correspondre EXACTEMENT aux 14 colonnes de prod

### 3. Calcul de Consistance
- **PROD:** Utilise `calculateConsistency(lapTimes, bestTime, avgTime)` - retourne un %
- **REACT:** Utilise écart-type brut (pas de % ni référence au bestTime)
- **ACTION:** Copier la fonction `calculateConsistency` de script-public.js

## 🟠 IMPORTANTES (UI/UX differences)

### 4. Filtres
- **PROD:** 
  - `dateFilter` (id) avec classe `date-filter`
  - `sessionSelect` (id) avec classe `session-select`
- **REACT:** 
  - `periodFilter` (id) avec classe `filter-select`
  - `trackFilter` (id) avec classe `filter-select`
- **ACTION:** Renommer les IDs et classes pour correspondre

### 5. Header de colonnes
- **PROD:** Headers ont `class="sortable"` et `onclick="sortTable(N, 'type')"`
- **REACT:** Headers ont `class="table-header sortable"`
- **ACTION:** Ajuster les classes pour correspondre

### 6. Cellules du tableau
- **PROD:** Pas de classes spécifiques sur `<td>`, mais `data-value` attributes
- **REACT:** Classes `cell-position`, `cell-name`, etc.
- **ACTION:** Supprimer les classes CSS custom, ajouter `data-value`

### 7. Badge de Classe
- **PROD:** `<span class="category-badge pro">PRO</span>` (ou silver/amateur)
- **REACT:** N'existe pas encore
- **ACTION:** Ajouter les badges avec les bonnes classes

## 🟡 MINEURES (Style differences)

### 8. Ordre des colonnes
- **PROD:** Position en première colonne
- **REACT:** Position en première colonne ✅
- **STATUS:** OK

### 9. Format des temps
- **PROD:** `01:34.087` (avec minutes)
- **REACT:** `1:26.507` (format similaire)
- **ACTION:** Vérifier que le format est identique (padding zeros)

### 10. Groupement par classe
- **PROD:** Option `groupByClass` avec tableaux séparés par classe
- **REACT:** `groupByClass` existe mais pas testé
- **ACTION:** Valider que le groupement fonctionne exactement pareil

## ✅ FONCTIONNEL (Working correctly)

- ✅ 47 pilotes affichés (données Firebase)
- ✅ Header avec titre
- ✅ Theme toggle
- ✅ Table responsive
- ✅ Tri des colonnes
- ✅ Gradient violet background

## 📋 PLAN D'ACTION

### Phase 1: Tableau (PRIORITÉ 1)
1. [ ] Copier `calculateConsistency` de script-public.js
2. [ ] Réécrire `DriversTableHeader` avec les 14 colonnes
3. [ ] Réécrire `DriverRow` avec les 14 colonnes
4. [ ] Ajouter `data-value` attributes
5. [ ] Ajouter badges de classe colorés
6. [ ] Tester le tri sur toutes les colonnes

### Phase 2: Modal (PRIORITÉ 1)
1. [ ] Créer `PilotModal.jsx` (copier structure de prod)
2. [ ] Remplacer routing par modal
3. [ ] Tester l'ouverture/fermeture

### Phase 3: Filtres (PRIORITÉ 2)
1. [ ] Renommer `periodFilter` → `dateFilter`
2. [ ] Renommer `trackFilter` → `sessionSelect`
3. [ ] Ajuster les classes CSS

### Phase 4: Validation (PRIORITÉ 3)
1. [ ] Tests Playwright complets
2. [ ] Comparaison visuelle (screenshots)
3. [ ] Validation fonctionnelle end-to-end

