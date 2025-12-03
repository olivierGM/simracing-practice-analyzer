# Format Drill Song - Structure JSON

## 📝 Structure de Base

Un drill song est un fichier JSON qui définit une séquence d'instructions pour le drill de pourcentages.

### Exemple de Structure

```json
{
  "name": "Drill Test - Succession Simple",
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

## 📁 Organisation des Fichiers

Les drill songs seront stockés dans :
```
frontend/public/drills/
  ├── easy/
  │   ├── test-succession.json
  │   ├── progression-20-80.json
  │   └── ...
  ├── medium/
  │   └── ...
  └── hard/
      └── ...
```

## 🔄 Métadonnées Additionnelles (Futur)

Pour plus tard, on pourra ajouter :
- **`author`** : Auteur du drill
- **`tags`** : Tags pour catégoriser (ex: ["progression", "alternances"])
- **`bpm`** : Tempo/BPM si applicable
- **`version`** : Version du format

