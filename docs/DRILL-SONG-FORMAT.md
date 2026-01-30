# Format Drill Song - Structure JSON

## 📝 Structure de Base

Un drill song est un fichier JSON qui définit une séquence d'instructions pour le drill de pourcentages.

### Exemple de Structure

```json
{
  "name": "Drill Test - Séquence Simple",
  "difficulty": "easy",
  "description": "Premier drill pour tester la mécanique de base",
  "duration": 10,
  "targets": [
    {
      "time": 3.0,
      "percent": 80,
      "duration": 1.0
    },
    {
      "time": 4.0,
      "percent": 20,
      "duration": 2.0
    },
    {
      "time": 7.0,
      "percent": 60,
      "duration": 1.5
    },
    {
      "time": 9.0,
      "percent": 40,
      "duration": 1.0
    }
  ]
}
```

## 📊 Champs Requis

### Niveau Racine

- **`name`** (string) : Nom du drill
- **`difficulty`** (string) : Niveau de difficulté (`easy`, `medium`, `hard`)
- **`description`** (string) : Description du drill
- **`duration`** (number, optionnel) : Durée totale du drill en secondes. Si omis, calculé automatiquement
- **`targets`** (array) : Liste des cibles à atteindre

### Cible (Target)

Chaque cible dans le tableau `targets` définit :

- **`time`** (number) : Temps en secondes où la cible commence (0 = début du drill)
- **`percent`** (number) : Pourcentage cible (0-100)
- **`duration`** (number) : Durée en secondes pendant laquelle maintenir ce pourcentage

## 🎯 Exemples de Drill Songs

### Drill Test Simple

```json
{
  "name": "Test - Succession Basique",
  "difficulty": "easy",
  "description": "Drill de test avec 4 pressages simples",
  "duration": 10,
  "targets": [
    {
      "time": 1.0,
      "percent": 80,
      "duration": 1.0
    },
    {
      "time": 3.0,
      "percent": 20,
      "duration": 1.0
    },
    {
      "time": 5.0,
      "percent": 60,
      "duration": 1.0
    },
    {
      "time": 7.0,
      "percent": 40,
      "duration": 1.0
    }
  ]
}
```

### Drill Moyen - Progression

```json
{
  "name": "Progression 20-80",
  "difficulty": "medium",
  "description": "Augmentation progressive du pourcentage",
  "duration": 15,
  "targets": [
    {
      "time": 2.0,
      "percent": 20,
      "duration": 1.5
    },
    {
      "time": 4.5,
      "percent": 40,
      "duration": 1.5
    },
    {
      "time": 7.0,
      "percent": 60,
      "duration": 1.5
    },
    {
      "time": 9.5,
      "percent": 80,
      "duration": 1.5
    }
  ]
}
```

### Drill Difficile - Alternances Rapides

```json
{
  "name": "Alternances Rapides",
  "difficulty": "hard",
  "description": "Changements rapides entre différents pourcentages",
  "duration": 12,
  "targets": [
    {
      "time": 1.0,
      "percent": 80,
      "duration": 0.8
    },
    {
      "time": 2.2,
      "percent": 20,
      "duration": 0.8
    },
    {
      "time": 3.4,
      "percent": 60,
      "duration": 0.8
    },
    {
      "time": 4.6,
      "percent": 40,
      "duration": 0.8
    },
    {
      "time": 5.8,
      "percent": 80,
      "duration": 1.0
    }
  ]
}
```

## 🏗️ Structure Technique

### Validation

Un drill song doit respecter :
- Les temps doivent être croissants
- Les cibles ne doivent pas se chevaucher (time + duration < next time)
- Les pourcentages doivent être entre 0 et 100
- Les durées doivent être positives

### Calcul de la Durée

Si `duration` n'est pas spécifiée au niveau racine, elle est calculée automatiquement :
```javascript
duration = Math.max(...targets.map(t => t.time + t.duration)) + 1
```

## 🎚️ Types de drill et compatibilité (`drillTypes`)

L’app propose trois types de drill. Un drill custom ne fonctionne que pour les types avec lesquels il est compatible.

| Type interne      | Mode dans l’UI              | Description |
|-------------------|-----------------------------|-------------|
| `single_pedal`    | Drill une pédale            | Une seule pédale (frein ou accélérateur), cibles en `percent` uniquement. |
| `brake_accel`     | Frein + Accélérateur        | Deux lanes (frein + accélérateur), cibles avec `type: "brake"` ou `type: "accel"`. |
| `full_combo`      | Drill Complet               | Frein, accélérateur, volant, shifter ; cibles avec `type` et éventuellement `wheelPercent`, etc. |

**Compatibilité :**

- Chaque fichier drill est associé à **un ou plusieurs** de ces types dans le **manifest** de l’app (`drillSongService.js` → `CUSTOM_DRILL_MANIFEST`). Seuls les drills dont `drillTypes` contient le mode actuel sont proposés dans le sélecteur.
- Tu peux aussi ajouter une propriété **`drillTypes`** (optionnelle) dans le JSON pour documenter ou valider la compatibilité :
  - **`drillTypes`** (array de strings, optionnel) : `["single_pedal"]`, `["brake_accel"]`, `["full_combo"]`, ou une combinaison (ex. `["single_pedal", "brake_accel"]` si le même JSON convient à plusieurs modes).

Valeurs autorisées : `single_pedal`, `brake_accel`, `full_combo`.

Exemple pour un drill « une pédale » uniquement :
```json
{
  "name": "Freinage progressif",
  "difficulty": "easy",
  "drillTypes": ["single_pedal"],
  "targets": [ ... ]
}
```

Exemple pour un drill Frein + Accélérateur (avec `type` sur les cibles) :
```json
{
  "name": "Épingles",
  "difficulty": "easy",
  "drillTypes": ["brake_accel"],
  "targets": [
    { "time": 1.0, "percent": 80, "duration": 1.0, "type": "brake" },
    { "time": 2.5, "percent": 20, "duration": 1.0, "type": "accel" }
  ]
}
```

## 📁 Organisation des Fichiers

Les drill songs sont stockés sous `frontend/public/drills/`. Par convention :
- **Drill une pédale** : `easy/`, `medium/`, `hard/` (cibles sans `type` ou percent seul).
- **Frein + Accélérateur** : `brakeaccel/` (cibles avec `type: "brake"` ou `"accel"`).
- **Drill Complet** : `fullcombo/` (cibles avec type + volant/shifter si besoin).

```
frontend/public/drills/
  ├── easy/
  │   ├── progressive-braking.json
  │   ├── progressive-acceleration.json
  │   └── ...
  ├── medium/
  │   └── ...
  ├── hard/
  │   └── ...
  ├── brakeaccel/
  │   ├── hairpin.json
  │   ├── chicane.json
  │   └── ...
  └── fullcombo/
      └── ...
```

L’affichage dans le sélecteur (quels drills sont proposés pour quel mode) est piloté par le **manifest** dans `drillSongService.js` ; le champ `drillTypes` dans le JSON est optionnel (documentation / cohérence).

## 🔄 Métadonnées Additionnelles (Futur)

Pour plus tard, on pourra ajouter :
- **`author`** : Auteur du drill
- **`tags`** : Tags pour catégoriser (ex: ["progression", "alternances"])
- **`bpm`** : Tempo/BPM si applicable
- **`version`** : Version du format

