# 📋 Phase 1 : Documentation & Capture de l'État Actuel

## 🎯 Objectif
Documenter exhaustivement l'application actuelle pour garantir une parité à 100% lors de la migration vers React.

---

## 📦 Livrables

### 1. FEATURES-INVENTORY.md
Inventaire complet de toutes les fonctionnalités actuelles.

### 2. Tests Playwright de Référence
Suite de tests qui documentent et valident tous les comportements.

### 3. Screenshots de Référence
Captures d'écran automatiques de tous les états de l'application.

### 4. Documentation Technique
Notes sur la logique métier, calculs, et comportements spécifiques.

---

## 📝 Tâches Détaillées

### Tâche 1.1 : Créer FEATURES-INVENTORY.md

**Sections à documenter :**

#### A. Interface Principale
- [ ] Header avec titre et description
- [ ] Indicateur "Dernière session : Il y a Xh"
  - Format d'affichage
  - Tooltip avec détails
  - Calcul avec offset +3h
- [ ] Toggle thème (dark/light/system)
  - Icône qui change
  - Persistance localStorage
  - Détection système par défaut
- [ ] Bouton "Se connecter" (admin)

#### B. Filtres et Options
- [ ] Filtre de période
  - À tout moment
  - Dernière semaine
  - Dernière journée
- [ ] Filtre de piste
  - Toutes les pistes
  - Liste dynamique des pistes disponibles
- [ ] Checkbox "Grouper par classe"
  - Active/désactive le groupement
  - Affiche les catégories (Pro, Silver, Am)

#### C. Liste Globale des Pilotes
- [ ] Colonnes affichées :
  - Position (ranking)
  - Pilote (nom)
  - Meilleur temps
  - Moyenne
  - Tours valides
  - Potentiel
  - Gap
  - Const. valide
  - Const. wet
  - Const. total
  - Tours wet
  - Classe (badge coloré)
- [ ] Tri de chaque colonne
  - Clic sur header pour trier
  - Indicateur de tri (↑/↓)
  - Tri ascendant/descendant
- [ ] Responsive
  - Colonnes cachées sur mobile
  - Largeurs adaptatives
- [ ] Clic sur ligne → ouvre modal pilote

#### D. Groupement par Classe
- [ ] Sections par catégorie (Pro, Silver, Am)
- [ ] Titre de catégorie avec badge
- [ ] Ranking par catégorie (1, 2, 3...)
- [ ] Tri indépendant par catégorie
- [ ] Espacement et style

#### E. Modal/Fiche Pilote
- [ ] Header avec nom, classe, position
- [ ] Bouton fermer (X)
- [ ] 4 sections principales :
  
  **Stats du pilote :**
  - Meilleur temps
  - Temps moyen
  - Tours valides
  - Potentiel (meilleur temps possible)
  - Gap au leader
  - Tours wet
  - Constance (avec bulle info)
  
  **Comparateur de segments :**
  - Focus : "Meilleur pilote vs Meilleur global"
  - 3 segments avec barres de progression
  - Temps et delta affichés
  - Bulle info explicative
  
  **Graphique de progression :**
  - 4 lignes :
    - Meilleurs temps (cumulatifs, sans points)
    - Temps globaux
    - Temps dry (valides + invalides)
    - Temps wet (valides + invalides)
  - Tooltip dynamique avec détails de session
  - Légende interactive
  - Axes avec labels
  
  **Liste des tours :**
  - Colonnes : Tour, Date, S1, S2, S3, Total, Valide, Wet
  - Highlighting des meilleurs temps (rouge)
  - Tri par colonne
  - Largeur fixe pour colonnes Valide/Wet (40px)
  - Header avec fond purple et texte blanc
  - Scrollable si trop de tours

- [ ] Modal scrollable si contenu long
- [ ] Background page ne scroll pas quand modal ouverte
- [ ] Responsive (sections côte-à-côte sur desktop)

#### F. Panneau Admin
- [ ] Bouton "Se connecter"
- [ ] Authentification Firebase
- [ ] EGT Auto Scraper Dashboard
  - Collapsible (clic sur header)
  - Stats : Total sessions, Taux succès, Dernier run, Prochain run
  - Graphique de performance (7 jours)
  - Logs d'exécution avec dates/heures
  - Bouton "Lancer Scraping Manuel"
  - Bouton "Actualiser Logs"
- [ ] Bouton "Déconnexion"

#### G. Thèmes (Dark/Light/System)
- [ ] Variables CSS pour thèmes
- [ ] Thème dark par défaut
- [ ] Détection préférence système
- [ ] Toggle cyclique (system → light → dark)
- [ ] Persistance dans localStorage
- [ ] Application instantanée (pas de flash)

---

### Tâche 1.2 : Créer Tests Playwright de Référence

**Fichier : `tests/e2e/prod-reference.spec.js`**

#### Tests à créer :

**Suite 1 : Interface & Navigation**
- [ ] Test : Page se charge sans erreur
- [ ] Test : Tous les éléments principaux sont visibles
- [ ] Test : Indicateur dernière session affiche correctement
- [ ] Test : Toggle thème fonctionne
- [ ] Test : Navigation responsive

**Suite 2 : Filtres**
- [ ] Test : Filtre "À tout moment" affiche tous les pilotes
- [ ] Test : Filtre "Dernière semaine" filtre correctement
- [ ] Test : Filtre "Dernière journée" filtre correctement
- [ ] Test : Filtre piste affiche les bonnes pistes
- [ ] Test : Combinaison de filtres fonctionne

**Suite 3 : Tri**
- [ ] Test : Tri par Position (croissant/décroissant)
- [ ] Test : Tri par Pilote (alphabétique)
- [ ] Test : Tri par Meilleur temps (numérique)
- [ ] Test : Tri par Moyenne
- [ ] Test : Tri par Tours valides
- [ ] Test : Tri par Constance
- [ ] Test : Données persistent après tri (pas de perte)

**Suite 4 : Groupement par Classe**
- [ ] Test : Groupement affiche les catégories
- [ ] Test : Ranking par catégorie (1, 2, 3...)
- [ ] Test : Tri dans chaque catégorie fonctionne
- [ ] Test : Désactiver le groupement revient à la vue globale

**Suite 5 : Modal Pilote**
- [ ] Test : Clic sur pilote ouvre la modal
- [ ] Test : Toutes les sections sont présentes
- [ ] Test : Stats du pilote affichées correctement
- [ ] Test : Graphique de progression se charge
- [ ] Test : Liste des tours affichée
- [ ] Test : Tri des tours fonctionne
- [ ] Test : Comparateur de segments affiché
- [ ] Test : Boutons info (constance, segments) fonctionnent
- [ ] Test : Bouton fermer (X) ferme la modal
- [ ] Test : Background ne scroll pas

**Suite 6 : Admin Panel**
- [ ] Test : Login admin fonctionne
- [ ] Test : Dashboard EGT s'affiche
- [ ] Test : Collapse/expand dashboard
- [ ] Test : Stats affichées correctement
- [ ] Test : Graphique de performance se charge
- [ ] Test : Logs d'exécution affichés
- [ ] Test : Bouton scraping manuel fonctionne
- [ ] Test : Déconnexion fonctionne

**Suite 7 : Console & Erreurs**
- [ ] Test : Aucune erreur JavaScript
- [ ] Test : Aucun warning critique
- [ ] Test : Firebase connecté correctement

---

### Tâche 1.3 : Capturer Screenshots de Référence

**Dossier : `migration-react/reference/screenshots/`**

#### Screenshots à capturer automatiquement :

**Vues Globales :**
1. `01-home-default.png` - Vue par défaut au chargement
2. `02-home-grouped.png` - Avec groupement par classe
3. `03-home-dark.png` - Thème dark
4. `04-home-light.png` - Thème light

**Filtres :**
5. `05-filter-week.png` - Filtre dernière semaine
6. `06-filter-day.png` - Filtre dernière journée
7. `07-filter-track.png` - Filtre par piste

**Tri :**
8. `08-sort-position.png` - Tri par position
9. `09-sort-time.png` - Tri par temps
10. `10-sort-grouped.png` - Tri avec groupement

**Modal Pilote :**
11. `11-pilot-modal-full.png` - Modal complète
12. `12-pilot-stats.png` - Section stats
13. `13-pilot-chart.png` - Graphique progression
14. `14-pilot-laps.png` - Liste des tours
15. `15-pilot-segments.png` - Comparateur segments
16. `16-pilot-dark.png` - Modal en dark mode

**Admin :**
17. `17-admin-login.png` - Écran de login
18. `18-admin-dashboard.png` - Dashboard complet
19. `19-admin-collapsed.png` - Dashboard collapsed
20. `20-admin-logs.png` - Logs d'exécution

**Mobile :**
21. `21-mobile-home.png` - Vue mobile
22. `22-mobile-modal.png` - Modal mobile
23. `23-mobile-admin.png` - Admin mobile

---

### Tâche 1.4 : Documentation Technique

**Fichier : `migration-react/TECHNICAL-NOTES.md`**

#### Sections à documenter :

**A. Structure des Données**
- Format Firebase Firestore
- Structure des sessions
- Structure des pilotes
- Calculs pré-processés

**B. Logique Métier Critique**
- Calcul de constance (CV inversé)
- Calcul du potentiel (somme 3 meilleurs segments)
- Calcul du gap au leader
- Timezone : offset +3h pour sessions
- Meilleurs temps cumulatifs (graphique)

**C. Comportements Spécifiques**
- Tri : comment gérer les null/undefined
- Filtres : logique de combinaison
- Groupement : ranking par catégorie
- Modal : empêcher scroll du background
- Thème : système > localStorage > dark par défaut

**D. Intégrations Externes**
- Firebase Authentication
- Firebase Firestore (lecture)
- Firebase Functions (auto-scraper)
- Chart.js (configuration spécifique)

**E. CSS & Styling**
- Variables CSS pour thèmes
- Media queries importantes
- Classes utilitaires
- Grilles et layouts spécifiques

---

## ✅ Checklist de Validation Phase 1

Avant de passer à la Phase 2, valider :

- [ ] FEATURES-INVENTORY.md complet et relu
- [ ] Tous les tests Playwright de référence passent
- [ ] Au moins 20 screenshots de référence capturés
- [ ] Documentation technique complète
- [ ] Aucune fonctionnalité oubliée
- [ ] Aucune erreur dans les tests
- [ ] Screenshots de bonne qualité
- [ ] Plan approuvé et compris

---

**Prêt à commencer la Phase 1 ?** 🚀

