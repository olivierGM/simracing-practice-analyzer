# Plan de Développement - Outil de Drills Pédales/Volant

## 🎯 Objectif

Créer un outil interactif style "Dance Dance Revolution" pour pratiquer la précision des pédales (accélérateur, frein) et du volant avec des drills de pourcentages, virages et accélérations.

---

## 📋 Vue d'ensemble

### Fonctionnalités principales
1. **Connexion aux périphériques USB** (pédales/volant)
2. **Drills de pourcentages** (20%, 40%, 60%, 80%)
3. **Drills de virages** (gauche/droite avec angles précis)
4. **Drills d'accélération** (courbes de progression)
5. **Interface style DDR** avec feedback visuel en temps réel
6. **Statistiques et scores** (précision, temps de réaction, etc.)

---

## 🏗️ Architecture Technique

### Structure des fichiers
```
frontend/src/
├── components/
│   └── pedal-wheel-drills/
│       ├── PedalWheelDrills.jsx          # Composant principal
│       ├── PedalWheelDrills.css          # Styles
│       ├── DeviceConnector.jsx           # Gestion connexion périphériques
│       ├── DrillSelector.jsx             # Sélection type de drill
│       ├── DrillDisplay.jsx              # Affichage style DDR
│       ├── StatsPanel.jsx                 # Statistiques en temps réel
│       └── hooks/
│           ├── useGamepad.js              # Hook pour Gamepad API
│           └── useDrillEngine.js          # Logique des drills
├── pages/
│   └── PedalWheelDrillsPage.jsx           # Page dédiée
└── services/
    └── gamepadService.js                  # Service de gestion gamepad
```

---

## 🔌 Phase 1 : Connexion aux Périphériques USB

### Option A : Gamepad API (Recommandé)
**Avantages :**
- ✅ Support natif dans tous les navigateurs modernes
- ✅ Pas de permissions spéciales requises
- ✅ Compatible avec la plupart des volants de sim racing (Logitech, Thrustmaster, Fanatec)
- ✅ Simple à implémenter

**Limitations :**
- ⚠️ Les volants doivent être reconnus comme "gamepad" par le système
- ⚠️ Mapping des axes peut varier selon le modèle

**Implémentation :**
```javascript
// Hook useGamepad.js
- Détecter les gamepads connectés
- Lire les axes (accélérateur, frein, volant)
- Normaliser les valeurs (-1 à 1 ou 0 à 1)
- Gérer la déconnexion/reconnexion
```

### Option B : WebHID API (Alternative)
**Avantages :**
- ✅ Accès direct aux périphériques HID personnalisés
- ✅ Plus de contrôle sur les données brutes

**Limitations :**
- ⚠️ Support limité (Chrome/Edge uniquement)
- ⚠️ Nécessite une permission utilisateur explicite
- ⚠️ Plus complexe à implémenter

**Recommandation :** Commencer avec **Gamepad API**, puis ajouter WebHID si nécessaire.

---

## 🎮 Phase 2 : Types de Drills

### 2.1 Drill de Pourcentages
**Objectif :** Maintenir un pourcentage précis (20%, 40%, 60%, 80%)

**Mécanique :**
- Affichage d'une cible (ex: "Maintenir 60%")
- Zone de tolérance (ex: ±5%)
- Feedback visuel :
  - 🟢 Vert = Dans la zone
  - 🟡 Jaune = Proche
  - 🔴 Rouge = Hors zone
- Score basé sur le temps passé dans la zone

**Interface style DDR :**
```
┌─────────────────────────┐
│  CIBLE: 60%             │
│                         │
│  [████████░░] 58%       │ ← Barre de progression
│                         │
│  Zone: 🟢               │ ← Indicateur
│  Temps: 00:05.23        │
│  Score: 1250            │
└─────────────────────────┘
```

### 2.2 Drill de Virages
**Objectif :** Tourner le volant à un angle précis (gauche/droite)

**Mécanique :**
- Affichage d'une direction et d'un angle (ex: "Gauche 45°")
- Zone de tolérance (±5°)
- Feedback visuel avec indicateur de position du volant
- Score basé sur la précision et la vitesse

**Interface :**
```
┌─────────────────────────┐
│  CIBLE: Gauche 45°      │
│                         │
│     ← [████] →          │ ← Indicateur volant
│         ↑               │
│      Position: 43°      │
│                         │
│  Zone: 🟢               │
│  Score: 850             │
└─────────────────────────┘
```

### 2.3 Drill d'Accélération
**Objectif :** Suivre une courbe d'accélération progressive

**Mécanique :**
- Affichage d'une courbe cible (ex: 0% → 80% en 3 secondes)
- L'utilisateur doit suivre la courbe
- Score basé sur l'écart avec la courbe cible
- Feedback visuel avec superposition courbe cible vs courbe réelle

**Interface :**
```
┌─────────────────────────┐
│  Courbe d'accélération   │
│                         │
│  100% │     ╱───        │ ← Graphique
│   80% │   ╱             │
│   60% │ ╱               │
│   40% │                 │
│   20% │                 │
│    0% └─────────────────│
│                         │
│  Écart: 2.3%            │
│  Score: 920             │
└─────────────────────────┘
```

### 2.4 Drill Combiné (Avancé)
**Objectif :** Combiner pédales et volant simultanément

**Mécanique :**
- Instructions multiples (ex: "60% accélérateur + Gauche 30°")
- Score basé sur la précision globale
- Niveau de difficulté progressif

---

## 🎨 Phase 3 : Interface Utilisateur

### 3.1 Écran Principal
```
┌─────────────────────────────────────┐
│  🎮 Drills Pédales & Volant         │
├─────────────────────────────────────┤
│                                     │
│  [🔌 Connexion Périphérique]        │
│                                     │
│  Périphérique: Logitech G29         │
│  Statut: ✅ Connecté                 │
│                                     │
│  ┌─────────┐ ┌─────────┐            │
│  │ Pourcen.│ │ Virages │            │
│  │  [20%]  │ │ [Gauche]│            │
│  │  [40%]  │ │ [Droite]│            │
│  │  [60%]  │ │         │            │
│  │  [80%]  │ │         │            │
│  └─────────┘ └─────────┘            │
│                                     │
│  ┌─────────┐ ┌─────────┐            │
│  │ Accélér.│ │ Combiné │            │
│  │ [Courbe]│ │ [Mixte] │            │
│  └─────────┘ └─────────┘            │
│                                     │
│  [📊 Statistiques]                  │
└─────────────────────────────────────┘
```

### 3.2 Écran de Drill (Style DDR)
- **Zone centrale :** Affichage principal du drill avec feedback visuel
- **Barres latérales :** Indicateurs de position (pédales/volant)
- **Scores :** Affichage en temps réel
- **Timer :** Durée du drill
- **Boutons :** Pause, Reset, Retour

### 3.3 Écran de Statistiques
- Graphiques de performance
- Historique des scores
- Tendances (amélioration/dégradation)
- Records personnels

---

## 🔧 Phase 4 : Implémentation Technique

### 4.1 Service Gamepad
```javascript
// services/gamepadService.js
- Détecter les gamepads connectés
- Mapper les axes (accélérateur, frein, volant)
- Normaliser les valeurs
- Gérer les événements de connexion/déconnexion
- Fournir un callback pour les mises à jour
```

### 4.2 Hook useGamepad
```javascript
// hooks/useGamepad.js
- Utiliser Gamepad API
- Polling des données (requestAnimationFrame)
- Retourner les valeurs normalisées
- Gérer l'état de connexion
```

### 4.3 Hook useDrillEngine
```javascript
// hooks/useDrillEngine.js
- Gérer la logique des drills
- Calculer les scores
- Gérer le timer
- Détecter si l'utilisateur est dans la zone cible
- Calculer les statistiques
```

### 4.4 Composant DrillDisplay
```javascript
// components/pedal-wheel-drills/DrillDisplay.jsx
- Afficher le drill actif
- Feedback visuel en temps réel
- Animations style DDR
- Barres de progression
- Indicateurs de zone
```

---

## 📊 Phase 5 : Fonctionnalités Avancées

### 5.1 Système de Scores
- **Précision :** Pourcentage de temps dans la zone cible
- **Temps de réaction :** Délai pour atteindre la cible
- **Consistance :** Écart-type des valeurs
- **Score global :** Combinaison des métriques

### 5.2 Niveaux de Difficulté
- **Facile :** Zone de tolérance large (±10%)
- **Moyen :** Zone de tolérance normale (±5%)
- **Difficile :** Zone de tolérance serrée (±2%)
- **Expert :** Zone de tolérance très serrée (±1%)

### 5.3 Modes de Drill
- **Libre :** Pas de limite de temps
- **Chronométré :** Drill de durée fixe (30s, 60s, 120s)
- **Objectif :** Atteindre un score minimum
- **Séquence :** Série de drills enchaînés

### 5.4 Sauvegarde des Données
- Stocker les scores dans localStorage
- Historique des sessions
- Graphiques de progression
- Export des données (JSON/CSV)

---

## 🧪 Phase 6 : Tests et Validation

### 6.1 Tests Unitaires
- Service gamepad
- Calculs de scores
- Logique des drills
- Normalisation des valeurs

### 6.2 Tests d'Intégration
- Connexion/déconnexion de périphériques
- Changement de drill
- Calcul des statistiques

### 6.3 Tests E2E (Playwright)
- Navigation dans l'outil
- Sélection d'un drill
- Affichage des données
- Gestion des erreurs (périphérique non connecté)

### 6.4 Tests Manuels
- Tester avec différents modèles de volants
- Valider la précision des lectures
- Vérifier les performances (FPS, latence)

---

## 🚀 Plan d'Implémentation (Phases)

### Phase 1 : Foundation (Semaine 1)
- [ ] Créer la structure de fichiers
- [ ] Implémenter le service gamepad de base
- [ ] Créer le hook useGamepad
- [ ] Page de base avec connexion périphérique
- [ ] Tests de connexion avec différents volants

### Phase 2 : Drill de Pourcentages (Semaine 2)
- [ ] Composant DrillSelector
- [ ] Composant DrillDisplay pour pourcentages
- [ ] Logique de calcul de score
- [ ] Interface style DDR
- [ ] Tests unitaires

### Phase 3 : Drill de Virages (Semaine 3)
- [ ] Extension du DrillDisplay pour virages
- [ ] Logique de calcul d'angle
- [ ] Interface avec indicateur de volant
- [ ] Tests

### Phase 4 : Drill d'Accélération (Semaine 4)
- [ ] Composant de graphique (Chart.js ou similaire)
- [ ] Logique de courbe cible
- [ ] Calcul d'écart avec la courbe
- [ ] Tests

### Phase 5 : Statistiques et Polish (Semaine 5)
- [ ] Composant StatsPanel
- [ ] Sauvegarde dans localStorage
- [ ] Graphiques de progression
- [ ] Amélioration UI/UX
- [ ] Tests E2E

### Phase 6 : Fonctionnalités Avancées (Semaine 6)
- [ ] Drill combiné
- [ ] Niveaux de difficulté
- [ ] Modes de drill
- [ ] Export des données
- [ ] Documentation

---

## 🎯 Critères de Succès

### Fonctionnels
- ✅ Détection et connexion automatique des volants
- ✅ Lectures précises des axes (pédales/volant)
- ✅ Tous les types de drills fonctionnels
- ✅ Calculs de scores corrects
- ✅ Interface intuitive et responsive

### Techniques
- ✅ Performance : 60 FPS minimum
- ✅ Latence : < 16ms (1 frame)
- ✅ Compatibilité : Chrome, Firefox, Edge
- ✅ Tests : Couverture > 80%

### UX
- ✅ Feedback visuel clair et immédiat
- ✅ Instructions claires pour chaque drill
- ✅ Statistiques compréhensibles
- ✅ Design cohérent avec le reste de l'app

---

## 🔍 Points d'Attention

### Limitations Techniques
1. **Gamepad API :** Polling nécessaire (pas d'événements natifs)
2. **Mapping des axes :** Peut varier selon le modèle de volant
3. **Latence :** Dépend de la fréquence de polling
4. **Compatibilité :** Tous les volants ne sont pas reconnus comme gamepads

### Solutions
1. Utiliser `requestAnimationFrame` pour le polling (60 FPS)
2. Permettre la calibration manuelle des axes
3. Afficher les valeurs brutes pour le debug
4. Documenter les modèles de volants testés

---

## 📚 Ressources

### APIs Web
- [Gamepad API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)
- [WebHID API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)

### Bibliothèques Utiles
- **Chart.js** : Pour les graphiques de courbes
- **Framer Motion** : Pour les animations (optionnel)

### Documentation
- Mapping des axes pour différents volants
- Guide d'utilisation pour les utilisateurs
- FAQ sur la compatibilité

---

## 🎨 Design Mockups (À créer)

1. **Écran de connexion** : Détection et sélection du périphérique
2. **Menu principal** : Sélection des drills
3. **Écran de drill** : Interface style DDR avec feedback
4. **Écran de stats** : Graphiques et historique

---

## ✅ Checklist de Démarrage

- [x] Créer la branche `feature/pedal-wheel-drills`
- [ ] Créer la structure de fichiers
- [ ] Implémenter le service gamepad de base
- [ ] Tester avec un volant réel
- [ ] Créer la page de base
- [ ] Ajouter la route dans App.jsx
- [ ] Ajouter le lien dans ToolsMenu.jsx

---

**Prochaine étape :** Commencer par la Phase 1 (Foundation) avec l'implémentation du service gamepad de base.

