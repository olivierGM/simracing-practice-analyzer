# User Story : Drill Combiné (Pédales + Volant)

## 📋 Story Overview

**En tant que** pilote sim racing voulant améliorer ma coordination  
**Je veux** pratiquer des drills qui combinent pédales ET volant simultanément  
**Afin de** développer ma coordination multi-tâche comme en course réelle

---

## 🎯 Objectifs Business

1. **Compléter le système de drills** avec le type le plus avancé
2. **Améliorer l'entraînement** en simulant des situations de course réelles
3. **Augmenter la valeur** de l'outil pour les pilotes sérieux
4. **Préparer** pour des drills de scenarios (ex: trail-braking dans un virage)

---

## 👤 Personas

### Persona 1 : Alex - Pilote Intermédiaire
- **But** : Améliorer son trail-braking (freiner tout en tournant)
- **Pain Point** : Perd du temps en virage car relâche le frein trop tôt
- **Besoin** : Drill qui simule frein + virage progressif

### Persona 2 : Marie - Pilote Débutante
- **But** : Apprendre à coordonner accélérateur et volant en sortie de virage
- **Pain Point** : Sous-vire en accélérant trop fort en sortie
- **Besoin** : Drill qui simule accélération progressive + maintien angle volant

---

## 📝 Acceptance Criteria (Definition of Done)

### Must Have (MVP)

#### 1. Composant CombinedDrill
- [ ] Nouveau composant `CombinedDrill.jsx` créé
- [ ] Interface DDR similaire à `PercentageDrill` mais avec 2 zones
- [ ] Zone gauche : Affichage volant (angle cible)
- [ ] Zone droite : Affichage pédale (pourcentage cible)
- [ ] Les deux cibles peuvent apparaître simultanément

#### 2. Format JSON des Drills Combinés
```json
{
  "name": "Trail-Braking Basique",
  "difficulty": "medium",
  "description": "Freiner tout en tournant le volant",
  "duration": 20,
  "targets": [
    {
      "time": 2.0,
      "wheel": {
        "angle": 45,
        "duration": 2.0,
        "tolerance": 10
      },
      "pedal": {
        "type": "brake",
        "percent": 60,
        "duration": 1.5,
        "tolerance": 10
      }
    }
  ]
}
```

#### 3. Système de Scoring
- [ ] Score séparé pour volant et pédales
- [ ] Bonus si les deux sont réussis en même temps
- [ ] Pénalité si un seul est réussi (coordination manquée)
- [ ] Score global = moyenne pondérée

#### 4. Feedback Visuel
- [ ] Indicateur volant : Cercle avec flèche montrant l'angle actuel vs cible
- [ ] Indicateur pédale : Barre verticale comme `PercentageDrill`
- [ ] Couleurs :
  - 🟢 Vert : Les deux en zone
  - 🟡 Jaune : Un seul en zone
  - 🔴 Rouge : Aucun en zone
- [ ] Texte : "Perfect!" / "Partial" / "Miss"

#### 5. Fichiers JSON de Drills
- [ ] `easy/coordination-simple.json` : Volant puis pédale (séquentiel)
- [ ] `medium/trail-braking-intro.json` : Frein + virage léger
- [ ] `hard/exit-oversteer.json` : Accélération + correction volant

#### 6. Intégration
- [ ] Activer l'option "Drill Combiné" dans `DrillSelector`
- [ ] Ajouter la route dans `PedalWheelDrills.jsx`
- [ ] Tests manuels : Clavier fonctionne
- [ ] Tests manuels : Gamepad fonctionne (si disponible)

### Should Have (V1.1)

#### 7. Drills Avancés
- [ ] `hard/trail-braking-expert.json` : Freinage dégressif + virage progressif
- [ ] `hard/throttle-steering.json` : Accélération + maintien ligne
- [ ] `expert/hairpin-combo.json` : Freinage fort → virage max → accélération

#### 8. Visualisation Améliorée
- [ ] Mini-graphique montrant l'historique des 3 dernières secondes
- [ ] Affichage de la "qualité de coordination" en %
- [ ] Replay des 5 derniers inputs après chaque drill

#### 9. Audio Feedback
- [ ] Son différent pour "Perfect!" vs "Partial"
- [ ] Encouragement vocal : "Great coordination!"
- [ ] Musique de fond spécifique aux drills combinés

### Could Have (Backlog)

#### 10. Modes Avancés
- [ ] Mode "Random" : Cibles aléatoires pour tester réflexes
- [ ] Mode "Endurance" : 5 minutes de cibles continues
- [ ] Mode "Challenge" : Difficulté augmente progressivement

#### 11. Analytics
- [ ] Graphique de progression sur 10 dernières sessions
- [ ] Identification des faiblesses (volant vs pédales)
- [ ] Suggestions de drills personnalisées

---

## 🏗️ Architecture Technique

### Nouveaux Fichiers à Créer

```
frontend/src/components/pedal-wheel-drills/
├── CombinedDrill.jsx          # Composant principal
├── CombinedDrill.css          # Styles
├── CombinedDDRArea.jsx        # Zone de jeu DDR combinée
├── CombinedDDRArea.css        # Styles zone de jeu
├── CombinedInputDisplay.jsx   # Affichage volant + pédale simultané
└── CombinedInputDisplay.css   # Styles affichage

frontend/public/drills/combined/
├── easy/
│   └── coordination-simple.json
├── medium/
│   ├── trail-braking-intro.json
│   └── throttle-control.json
└── hard/
    ├── trail-braking-expert.json
    ├── exit-oversteer.json
    └── hairpin-combo.json
```

### Hooks Existants à Réutiliser

- ✅ `useMappedGamepads` : Lecture des inputs volant + pédales
- ✅ `useDrillEngine` : Logique de scoring (à étendre)
- ⚠️ `useDDRTargets` : À dupliquer/étendre pour gérer 2 types de cibles

### Services Existants à Réutiliser

- ✅ `drillAudioService` : Sons de feedback
- ✅ `deviceMappingService` : Mapping des axes
- ✅ `keyboardService` : Support clavier progressif

---

## 📊 Système de Scoring Détaillé

### Calcul du Score par Cible

```
Pour chaque cible combinée :

1. Score Volant (0-100)
   - Dans zone de tolérance : 100 points
   - Écart < 5° supplémentaire : 80 points
   - Écart < 10° supplémentaire : 50 points
   - Sinon : 0 points

2. Score Pédale (0-100)
   - Dans zone de tolérance : 100 points
   - Écart < 5% supplémentaire : 80 points
   - Écart < 10% supplémentaire : 50 points
   - Sinon : 0 points

3. Bonus de Coordination
   - Les deux à 100 : +20 points bonus
   - Les deux >= 80 : +10 points bonus
   - Un seul >= 80 : -10 points (pénalité coordination)
   - Aucun >= 50 : -20 points (pénalité lourde)

4. Score Final Cible
   score = (scoreVolant + scorePédale) / 2 + bonusCoordination
   score = clamp(score, 0, 120) // Max 120 points par cible
```

### Étoiles (Rating)

- ⭐⭐⭐ (3 étoiles) : Score >= 90%
- ⭐⭐ (2 étoiles) : Score >= 70%
- ⭐ (1 étoile) : Score >= 50%
- 💀 (Échec) : Score < 50%

---

## 🎨 Maquette UI (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Trail-Braking Basique              ⏱️  00:12  🌟🌟🌟     │
│  Score: 1250 | Précision: 85% | Combo: x3                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │   VOLANT 🎮      │              │   FREIN 🛑       │     │
│  │                  │              │                  │     │
│  │      ╱           │              │  ████████░░░     │     │
│  │     ● ← 45°      │              │   60% ─────►     │     │
│  │    ╱  ╲          │              │                  │     │
│  │   ╱    ╲         │              │   Target: 60%    │     │
│  │  Actuel: 43°     │              │   Actuel: 58%    │     │
│  │                  │              │                  │     │
│  │  🟢 PERFECT!     │              │  🟢 PERFECT!     │     │
│  └──────────────────┘              └──────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Zone d'approche ▓▓▓▓▓░░░░ Prochaine cible →       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  ⚡ Inputs:  🎮 43°  │  🛑 58%  │  ⚡ 0%  │  ⬆️ OFF  │  ⬇️ OFF │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Plan de Test

### Tests Manuels (Prioritaires)

#### Test 1 : Drill Simple Séquentiel
**Setup** : Charger `coordination-simple.json`  
**Actions** :
1. Attendre première cible volant (2s)
2. Tourner à gauche 30°
3. Maintenir 1 seconde
4. Attendre deuxième cible pédale (5s)
5. Appuyer frein à 50%
6. Maintenir 1 seconde

**Résultat attendu** :
- ✅ Score volant : ~100 points
- ✅ Score pédale : ~100 points
- ✅ Score total : ~200 points (100%)
- ✅ 3 étoiles ⭐⭐⭐

#### Test 2 : Drill Simultané (Trail-Braking)
**Setup** : Charger `trail-braking-intro.json`  
**Actions** :
1. Attendre cible combinée (2s)
2. Tourner gauche 45° ET freiner 60% EN MÊME TEMPS
3. Maintenir les deux pendant 1.5 secondes

**Résultat attendu** :
- ✅ Affichage des 2 zones simultanément
- ✅ Feedback "PERFECT!" si coordination bonne
- ✅ Bonus de +20 points
- ✅ Score total : ~120 points pour cette cible

#### Test 3 : Coordination Ratée
**Setup** : Charger `trail-braking-intro.json`  
**Actions** :
1. Attendre cible combinée
2. Tourner correctement MAIS ne pas freiner
3. Ou freiner correctement MAIS ne pas tourner

**Résultat attendu** :
- ⚠️ Feedback "PARTIAL" (jaune)
- ⚠️ Pénalité de -10 points
- ⚠️ Message : "Coordination manquée"

### Tests Automatisés (Optionnel)

- Unit test : `calculateCombinedScore()`
- Unit test : `isBothTargetsInZone()`
- Integration test : Charger un JSON combiné
- E2E test : Compléter un drill combiné avec clavier

---

## 📅 Timeline Estimée

### Phase 1 : Fondation (2-3h)
- ✅ Créer la story (fait)
- [ ] Créer `CombinedDrill.jsx` de base
- [ ] Réutiliser composants DDR existants
- [ ] Format JSON validé avec 1 drill de test

### Phase 2 : Scoring & Logic (2-3h)
- [ ] Étendre `useDrillEngine` pour gérer 2 cibles
- [ ] Implémenter calcul de score combiné
- [ ] Implémenter bonus/pénalités de coordination
- [ ] Tests unitaires du scoring

### Phase 3 : UI & Feedback (2-3h)
- [ ] Créer `CombinedInputDisplay` avec 2 zones
- [ ] Feedback visuel (couleurs + texte)
- [ ] Animations de transition
- [ ] Responsive mobile

### Phase 4 : Contenu & Polish (1-2h)
- [ ] Créer 5 drills JSON (easy/medium/hard)
- [ ] Intégrer dans DrillSelector
- [ ] Tests manuels complets
- [ ] Documentation utilisateur

**Total estimé : 7-11 heures**

---

## 🚀 Déploiement

### Checklist Avant Merge

- [ ] Tous les tests manuels passent
- [ ] Le clavier fonctionne en mode progressif
- [ ] Au moins 3 drills JSON créés (easy/medium/hard)
- [ ] Aucun bug bloquant
- [ ] Code review fait (auto-review OK)
- [ ] Documentation à jour
- [ ] Commit messages clairs

### Rollout Plan

1. **Merge dans `main`** après validation
2. **Deploy sur Firebase** (build + deploy)
3. **Annonce** : Nouveau drill combiné disponible !
4. **Monitoring** : Vérifier les logs d'erreurs
5. **Feedback** : Recueillir retours utilisateurs

---

## 💡 Notes Techniques

### Défis Potentiels

1. **Performance** : 2 animations simultanées (60 FPS requis)
   - Solution : Réutiliser le même `requestAnimationFrame`

2. **Complexité UI** : Afficher 2 cibles clairement
   - Solution : Split screen vertical (50/50)

3. **Scoring Fair** : Pas pénaliser si une cible arrive avant l'autre
   - Solution : Timer séparé pour chaque cible

4. **Mobile** : Écran trop petit pour 2 zones
   - Solution : Empiler verticalement sur mobile

### Réutilisation de Code

- ✅ 80% du code de `PercentageDrill` peut être réutilisé
- ✅ Les composants DDR existants sont modulaires
- ✅ Le système de scoring est extensible

---

## 🎓 Apprentissages pour l'Utilisateur

### Compétences Développées

1. **Coordination** : Gérer 2 inputs simultanément
2. **Trail-Braking** : Technique essentielle en course
3. **Sortie de virage** : Accélération + maintien ligne
4. **Réflexes** : Ajustements rapides
5. **Fluidité** : Mouvements combinés sans à-coups

### Progression Recommandée

```
Débutant
  ↓
Easy: Coordination simple (séquentiel)
  ↓
Medium: Trail-braking intro (simultané facile)
  ↓
Medium: Throttle control (accélération + volant)
  ↓
Hard: Trail-braking expert (précision haute)
  ↓
Hard: Exit oversteer (correction rapide)
  ↓
Expert: Hairpin combo (enchaînement complet)
```

---

## 📚 Références

- [Trail-Braking Explained](https://driver61.com/uni/trail-braking/)
- [DDR Game Mechanics](https://en.wikipedia.org/wiki/Dance_Dance_Revolution)
- [Coordination Training](https://www.simracingsetup.com/training)

---

**Story créée le** : 2026-01-12  
**Créée par** : Assistant AI  
**Pour** : Feature Combined Drills  
**Branche** : `feature/combined-drills`

---

## ✅ Validation de la Story

**À remplir avant de commencer l'implémentation :**

- [ ] Story lue et comprise
- [ ] Acceptance criteria clairs
- [ ] Maquettes UI validées
- [ ] Timeline réaliste
- [ ] Prêt à coder !

**Validé par** : _________________  
**Date** : _________________
