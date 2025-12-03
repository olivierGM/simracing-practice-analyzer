# Plan de Développement - Drills à Double Pédale (Accélérateur + Frein)

## 🎯 Objectif

Créer des drills avec **accélérateur ET frein simultanés**, affichant deux rangées distinctes (une par pédale) avec le même gameplay style DDR que les drills actuels.

---

## 📋 Vue d'ensemble

### Concept
- **Deux zones de jeu verticales** côte à côte (ou l'une au-dessus de l'autre)
- **Chaque zone** a sa propre barre de progression verticale
- **Cibles indépendantes** qui défilent pour chaque pédale
- **Jugements séparés** pour chaque input (PERFECT, GREAT, GOOD, MISS)
- **Score combiné** basé sur la performance des deux pédales

### Cas d'usage
1. **Trail braking** : Freiner tout en commençant à accélérer
2. **Transitions** : Passer du frein à l'accélérateur avec précision
3. **Heel-toe** : Maintenir freinage constant tout en tapotant l'accélérateur
4. **Dosage simultané** : Contrôler les deux pédales indépendamment

---

## 🎮 Conception de l'Interface

### Layout Option A : Côte à côte (Recommandé)
```
┌────────────────────────────────────────────────────────┐
│                    DRILL: Trail Braking                │
├──────────────────────────┬─────────────────────────────┤
│     FREIN (Brake)        │    ACCÉLÉRATEUR (Throttle)  │
│                          │                              │
│  ┌──────────┐           │           ┌──────────┐      │
│  │  Target  │ ⬇️        │  ⬇️       │  Target  │      │
│  │   80%    │           │           │   40%    │      │
│  └──────────┘           │           └──────────┘      │
│                          │                              │
│  ┌──────────┐           │           ┌──────────┐      │
│  │  Target  │           │           │  Target  │      │
│  │   60%    │           │           │   20%    │      │
│  └──────────┘           │           └──────────┘      │
│                          │                              │
│       ║                  │                  ║           │
│       ║  ← Judgment      │      Judgment →  ║           │
│   ════╬════              │              ════╬════       │
│       ▓▓▓                │                ▓▓▓           │
│       ▓▓▓  ← Progress    │    Progress →  ▓▓▓           │
│       ▓▓▓     Bar        │       Bar      ▓▓▓           │
│       58%                │                38%           │
│                          │                              │
│  PERFECT: 12  MISS: 3    │   PERFECT: 15  MISS: 2      │
└──────────────────────────┴─────────────────────────────┘
```

### Layout Option B : Empilé verticalement
```
┌────────────────────────────────────┐
│       DRILL: Trail Braking         │
├────────────────────────────────────┤
│        FREIN (Brake)               │
│  Target 80% ⬇️  Target 60% ⬇️      │
│        ════╬════                   │
│            ▓▓▓  58%                │
│  PERFECT: 12  MISS: 3              │
├────────────────────────────────────┤
│     ACCÉLÉRATEUR (Throttle)        │
│  Target 40% ⬇️  Target 20% ⬇️      │
│        ════╬════                   │
│            ▓▓▓  38%                │
│  PERFECT: 15  MISS: 2              │
└────────────────────────────────────┘
```

**Recommandation : Option A** pour maximiser l'espace vertical (déjà optimisé).

---

## 🏗️ Architecture Technique

### Structure des composants

```
frontend/src/components/pedal-wheel-drills/
├── DualPedalDrill.jsx              # Nouveau composant principal
├── DualPedalDrill.css              # Styles pour dual layout
├── DualDDRGameplayArea.jsx         # Zone de jeu double
├── DualDDRGameplayArea.css         # Styles gameplay double
└── DualDDRConfig.jsx               # Configuration pour dual drills
```

### Réutilisation du code existant

**À réutiliser :**
- `DDRResultsScreen.jsx` (avec modifications pour 2 scores)
- `DDRStatsBar.jsx` (avec stats séparées par pédale)
- `enhancedDrillAudioService.js` (sons de jugement)
- `useDDRTargets.js` (génération de cibles, instancié 2x)

**À adapter :**
- `DDRGameplayArea.jsx` → Dupliquer pour 2 colonnes
- `PercentageDrill.jsx` → Base pour `DualPedalDrill.jsx`

---

## 📊 Gestion des Données

### Structure des targets pour dual drills

```javascript
// Exemple : Trail braking
const dualDrillSong = {
  name: "Trail Braking - Virage Type",
  duration: 30,
  brake_targets: [
    { time: 0, percentage: 100, duration: 2 },
    { time: 2, percentage: 80, duration: 1.5 },
    { time: 3.5, percentage: 60, duration: 1 },
    // ...
  ],
  throttle_targets: [
    { time: 4, percentage: 20, duration: 1 },
    { time: 5, percentage: 40, duration: 1.5 },
    { time: 6.5, percentage: 60, duration: 2 },
    // ...
  ],
  // Synchronisation optionnelle
  sync_points: [
    { time: 3.5, brake: 60, throttle: 0 },  // Point de transition
    { time: 4.5, brake: 40, throttle: 30 }, // Overlap
  ]
};
```

### Format JSON des drills

```json
{
  "name": "Trail Braking - Virage Type",
  "description": "Pratiquer le trail braking avec transition fluide",
  "difficulty": "medium",
  "duration": 30,
  "type": "dual_pedal",
  "brake_targets": [
    { "time": 0, "percentage": 100, "duration": 2 }
  ],
  "throttle_targets": [
    { "time": 4, "percentage": 20, "duration": 1 }
  ]
}
```

---

## 🎯 Modes de Drill

### 1. Mode Trail Braking
**Objectif :** Apprendre à maintenir le freinage tout en commençant à accélérer

**Exemple de séquence :**
1. Frein 100% → 80% (2s)
2. Frein 80% → 60% (1.5s)
3. **Transition** : Frein 60% + Accélérateur 20% (0.5s)
4. Frein 40% + Accélérateur 40% (1s)
5. Frein 0% + Accélérateur 80% (1.5s)

### 2. Mode Heel-Toe (Rétrogradage)
**Objectif :** Maintenir pression constante sur frein tout en tapotant accélérateur

**Exemple de séquence :**
1. Frein 80% constant
2. Accélérateur : Burst 60% (0.2s) → 0%
3. Répéter 3-4 fois
4. Relâcher frein progressivement

### 3. Mode Transitions Rapides
**Objectif :** Passer rapidement d'une pédale à l'autre

**Exemple de séquence :**
1. Frein 100% (1s)
2. Frein 0% / Accélérateur 100% (0.5s)
3. Accélérateur 0% / Frein 100% (0.5s)
4. Répéter avec variations

### 4. Mode Random Dual
**Objectif :** Cibles aléatoires pour les deux pédales

**Caractéristiques :**
- Génération continue de cibles pour chaque pédale
- Possibilité d'overlap ou de séparation
- Difficulté variable selon les paramètres

---

## 🔧 Implémentation Technique

### Phase 1 : Composant DualDDRGameplayArea

```javascript
// DualDDRGameplayArea.jsx
export function DualDDRGameplayArea({
  brakeValue,         // 0-1
  throttleValue,      // 0-1
  brakeTargets,       // Array de targets pour frein
  throttleTargets,    // Array de targets pour accélérateur
  isActive,
  isPaused,
  difficulty,
  tolerance,
  audioEnabled,
  blindMode,
  onDrillEnd
}) {
  // État pour chaque pédale
  const [brakeJudgments, setBrakeJudgments] = useState([]);
  const [throttleJudgments, setThrottleJudgments] = useState([]);
  
  // Scores séparés
  const [brakeScore, setBrakeScore] = useState(0);
  const [throttleScore, setThrottleScore] = useState(0);
  
  // Combos séparés
  const [brakeCombo, setBrakeCombo] = useState(0);
  const [throttleCombo, setThrottleCombo] = useState(0);
  
  return (
    <div className="dual-ddr-gameplay-area">
      {/* Colonne gauche : Frein */}
      <div className="ddr-column ddr-column-brake">
        <h3 className="ddr-column-title">🛑 FREIN</h3>
        <DDRGameplayColumn
          currentValue={brakeValue}
          targets={brakeTargets}
          judgments={brakeJudgments}
          onJudgment={(judgment) => handleBrakeJudgment(judgment)}
          colorTheme="brake" // Rouge
          {...commonProps}
        />
      </div>
      
      {/* Colonne droite : Accélérateur */}
      <div className="ddr-column ddr-column-throttle">
        <h3 className="ddr-column-title">⚡ ACCÉLÉRATEUR</h3>
        <DDRGameplayColumn
          currentValue={throttleValue}
          targets={throttleTargets}
          judgments={throttleJudgments}
          onJudgment={(judgment) => handleThrottleJudgment(judgment)}
          colorTheme="throttle" // Vert
          {...commonProps}
        />
      </div>
    </div>
  );
}
```

### Phase 2 : Hook useDualDDRTargets

```javascript
// hooks/useDualDDRTargets.js
export function useDualDDRTargets(drillSong, difficulty, isActive) {
  const [brakeTargets, setBrakeTargets] = useState([]);
  const [throttleTargets, setThrottleTargets] = useState([]);
  
  // Générer ou charger les targets pour chaque pédale
  useEffect(() => {
    if (drillSong.type === 'dual_pedal') {
      // Charger depuis le drill song
      setBrakeTargets(drillSong.brake_targets);
      setThrottleTargets(drillSong.throttle_targets);
    } else if (drillSong.type === 'dual_random') {
      // Générer aléatoirement
      const { brake, throttle } = generateDualRandomTargets(difficulty);
      setBrakeTargets(brake);
      setThrottleTargets(throttle);
    }
  }, [drillSong, difficulty]);
  
  // Mettre à jour les positions des targets
  // ... logique similaire à useDDRTargets mais pour 2 listes
  
  return {
    brakeTargets,
    throttleTargets,
    // ... autres états
  };
}
```

### Phase 3 : Écran de résultats dual

```javascript
// Modifications à DDRResultsScreen.jsx
export function DDRResultsScreen({
  stats,
  brakeJudgmentCounts,    // Nouveau
  throttleJudgmentCounts, // Nouveau
  brakeComboInfo,         // Nouveau
  throttleComboInfo,      // Nouveau
  onRestart,
  onBack
}) {
  // Calculer les notes séparées
  const brakeGrade = calculateGrade(brakeAccuracy);
  const throttleGrade = calculateGrade(throttleAccuracy);
  const overallGrade = calculateGrade((brakeAccuracy + throttleAccuracy) / 2);
  
  return (
    <div className="ddr-results-screen">
      {/* Note globale */}
      <div className="ddr-results-grade">{overallGrade}</div>
      
      {/* Stats séparées */}
      <div className="ddr-results-dual-stats">
        <div className="ddr-results-pedal-stats brake-stats">
          <h3>🛑 FREIN</h3>
          <div className="pedal-grade">{brakeGrade}</div>
          {/* Judgments pour frein */}
        </div>
        
        <div className="ddr-results-pedal-stats throttle-stats">
          <h3>⚡ ACCÉLÉRATEUR</h3>
          <div className="pedal-grade">{throttleGrade}</div>
          {/* Judgments pour accélérateur */}
        </div>
      </div>
      
      {/* ... reste */}
    </div>
  );
}
```

---

## 🎨 Design & UX

### Thèmes de couleurs

**Frein (Brake) :**
- Couleur principale : `#FF4444` (Rouge)
- Progress bar : Gradient rouge
- Judgment line : Rouge vif
- Targets : Bordure rouge

**Accélérateur (Throttle) :**
- Couleur principale : `#44FF44` (Vert)
- Progress bar : Gradient vert
- Judgment line : Vert vif
- Targets : Bordure verte

### Animations
- Cibles défilent **synchronisées** ou **indépendantes** selon le drill
- Jugements apparaissent dans leur colonne respective
- Combo counter séparé pour chaque pédale
- Indicateur visuel quand les deux pédales sont actives simultanément

---

## 📁 Fichiers de Drill à Créer

### Dossier : `/frontend/public/drills/dual/`

**Trail Braking :**
```
dual/
├── trail-braking-easy.json
├── trail-braking-medium.json
└── trail-braking-hard.json
```

**Heel-Toe :**
```
dual/
├── heel-toe-basic.json
├── heel-toe-rapid.json
└── heel-toe-complex.json
```

**Transitions :**
```
dual/
├── transitions-slow.json
├── transitions-fast.json
└── transitions-extreme.json
```

---

## 🔄 Intégration avec l'existant

### Modifications à DrillSelector

```javascript
// DrillSelector.jsx
const DRILL_TYPES = {
  PERCENTAGE: 'percentage',      // Existant (single pedal)
  DUAL_PEDAL: 'dual_pedal',     // Nouveau
  CORNER: 'corner',              // Futur
  ACCELERATION: 'acceleration'   // Futur
};
```

### Modifications à PedalWheelDrills

```javascript
// PedalWheelDrills.jsx
{selectedDrill === DRILL_TYPES.PERCENTAGE && (
  <PercentageDrill {...props} />
)}

{selectedDrill === DRILL_TYPES.DUAL_PEDAL && (
  <DualPedalDrill {...props} />
)}
```

---

## ✅ Checklist d'implémentation

### Phase 1 : Structure de base
- [ ] Créer `DualPedalDrill.jsx`
- [ ] Créer `DualDDRGameplayArea.jsx`
- [ ] Créer CSS pour layout dual
- [ ] Adapter `useDualDDRTargets` hook

### Phase 2 : Logique de jeu
- [ ] Gérer 2 streams de targets indépendants
- [ ] Calculer jugements pour chaque pédale séparément
- [ ] Gérer combos séparés
- [ ] Calculer scores combinés

### Phase 3 : UI/UX
- [ ] Thèmes de couleurs (rouge/vert)
- [ ] Titres des colonnes
- [ ] Stats en temps réel pour chaque pédale
- [ ] Écran de résultats avec stats séparées

### Phase 4 : Drills
- [ ] Créer drills Trail Braking (easy/medium/hard)
- [ ] Créer drills Heel-Toe (basic/rapid/complex)
- [ ] Créer drills Transitions (slow/fast/extreme)
- [ ] Mode Random Dual

### Phase 5 : Audio
- [ ] Sons de jugement pour chaque pédale
- [ ] Annonces vocales adaptées ("Brake Perfect!", "Throttle Miss!")
- [ ] Musique de fond (réutiliser existant)

### Phase 6 : Tests
- [ ] Tests Playwright pour dual layout
- [ ] Tests de détection simultanée
- [ ] Tests de calcul de scores
- [ ] Validation sur différents écrans

---

## 🚀 Plan d'implémentation (Étapes)

### Étape 1 : Prototype minimal (1-2h)
1. Dupliquer `DDRGameplayArea` → `DualDDRGameplayArea`
2. Layout CSS côte à côte (2 colonnes)
3. Afficher 2 barres de progression
4. Tester avec inputs statiques

### Étape 2 : Logique de base (2-3h)
1. Implémenter `useDualDDRTargets`
2. Générer targets séparés pour chaque pédale
3. Détecter hits/misses pour les 2 pédales
4. Afficher jugements dans chaque colonne

### Étape 3 : Drills personnalisés (2-3h)
1. Créer format JSON pour dual drills
2. Créer 1-2 drills de test (Trail Braking)
3. Charger et afficher les drills
4. Tester gameplay complet

### Étape 4 : Polish (2-3h)
1. Écran de résultats avec stats séparées
2. Thèmes de couleurs distincts
3. Animations et feedback
4. Audio adapté

### Étape 5 : Tests & Validation (1-2h)
1. Tests Playwright
2. Tests manuels
3. Ajustements finaux
4. Déploiement

**Total estimé : 8-13 heures**

---

## 💡 Améliorations futures

### Synchronisation avancée
- Indicateur visuel quand les 2 pédales doivent être actives
- Mode "overlap obligatoire" pour trail braking avancé

### Visualisation
- Graphique en temps réel montrant brake vs throttle
- Replay après le drill
- Comparaison avec ligne idéale

### Modes spéciaux
- **Mode Practice** : Ralenti pour apprendre
- **Mode Ghost** : Comparer avec meilleure performance
- **Mode Challenge** : Objectifs spécifiques (ex: pas plus de 3 MISS)

---

## 📝 Notes de design

### Pourquoi layout côte à côte ?
- ✅ Maximise l'espace vertical (déjà optimisé)
- ✅ Séparation claire entre les 2 inputs
- ✅ Facilite la lecture simultanée
- ✅ Permet des transitions visuelles entre colonnes

### Gestion de l'espace
- Layout doit s'adapter aux petits écrans (stacking vertical sur mobile)
- Chaque colonne doit avoir minimum 300px de largeur
- Garder le header ultra-compact (déjà fait)

### Accessibilité
- Thèmes de couleurs distincts et contrastés
- Option pour daltoniens (rouge/bleu au lieu de rouge/vert)
- Taille de texte ajustable
- Mode haute visibilité

---

## 🎯 Objectifs de performance

### Précision
- Tolérance par défaut : ±5%
- Détection à 60 FPS minimum
- Latency < 16ms entre input et feedback

### Scores
- **S Rank** : 99%+ accuracy sur les 2 pédales
- **A Rank** : 90-99% accuracy
- **B Rank** : 80-90% accuracy
- **C Rank** : 70-80% accuracy
- **F** : < 70% accuracy

---

## 📚 Ressources

### Références
- Current `DDRGameplayArea.jsx` implementation
- Current `useDDRTargets.js` hook
- Guitar Hero / Rock Band (dual-input gameplay)
- Real sim racing techniques (trail braking, heel-toe)

### Assets nécessaires
- Icônes : 🛑 (brake), ⚡ (throttle)
- Sons : Reuse existing judgment sounds
- Musique : Reuse existing background tracks

---

**Document créé le :** 2025-12-03
**Dernière mise à jour :** 2025-12-03
**Status :** 📋 Planification

