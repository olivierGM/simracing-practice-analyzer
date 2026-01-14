# 📊 Proposition : Drill basé sur Télémetry Importée

## 🎯 Objectif

Créer un nouveau type de drill qui permet d'importer une télémetry (télémetrie) d'une session réelle et de s'entraîner à reproduire les actions exactes.

## 📋 Questions à Clarifier

### 1. Format de Télémetry Source
- **ACC (Assetto Corsa Competizione)** : Format `.ld` ou `.json` ?
- **iRacing** : Format `.ibt` ou autre ?
- **Format générique** : CSV avec colonnes (time, brake, throttle, steering, gear) ?
- **Format personnalisé** : JSON structuré ?

### 2. Données Disponibles
Quelles données sont disponibles dans la télémetry ?
- ✅ **Frein** : 0-100% (ou 0-1.0)
- ✅ **Accélérateur** : 0-100% (ou 0-1.0)
- ✅ **Volant** : Angle en degrés (-180° à +180°)
- ✅ **Shifter** : Gear (vitesse) ou shift_up/shift_down events ?
- ✅ **Temps** : Timestamp ou temps relatif ?

### 3. Fonctionnalités Souhaitées
- [ ] **Import simple** : Upload fichier → conversion automatique
- [ ] **Prévisualisation** : Voir la télémetry avant de créer le drill
- [ ] **Sélection de segment** : Choisir une portion de la télémetry (ex: un virage)
- [ ] **Filtrage** : Réduire la fréquence d'échantillonnage (ex: 1 point par seconde)
- [ ] **Mode replay** : Voir les actions originales en temps réel
- [ ] **Mode practice** : S'entraîner à reproduire les actions

## 🏗️ Architecture Proposée

### Phase 1 : Import et Conversion (MVP)

```
┌─────────────────┐
│  Upload File    │  (CSV/JSON)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Telemetry      │  Parse & Validate
│  Parser         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Telemetry      │  Convert to Drill Song Format
│  Converter      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Drill Song     │  { targets: [...] }
│  (JSON)         │
└─────────────────┘
```

### Phase 2 : Composants à Créer

1. **`TelemetryImporter.jsx`**
   - Interface d'upload de fichier
   - Prévisualisation de la télémetry
   - Options de conversion (filtrage, segment)

2. **`telemetryParserService.js`**
   - Parse différents formats (CSV, JSON, ACC)
   - Validation des données
   - Normalisation (0-100%, degrés, etc.)

3. **`telemetryConverterService.js`**
   - Convertit télémetry → drill song format
   - Gestion de la fréquence d'échantillonnage
   - Création des targets avec time/percent/duration

4. **`TelemetryDrill.jsx`**
   - Drill qui utilise le drill song généré
   - Peut réutiliser `FullComboDrill` ou `FullComboVerticalDrill`

## 📝 Format de Télémetry Proposé (CSV)

Format simple et universel :

```csv
time,brake,throttle,steering,gear
0.0,0,0,0,1
0.1,0,0,0,1
0.2,0,0,5,1
0.3,0,0,10,1
0.4,100,0,15,1
0.5,80,0,20,1
0.6,60,0,25,1
0.7,40,20,20,1
0.8,20,40,15,1
0.9,0,60,10,1
1.0,0,80,5,1
1.1,0,100,0,1
```

**Colonnes** :
- `time` : Temps en secondes (relatif, commence à 0)
- `brake` : Frein 0-100%
- `throttle` : Accélérateur 0-100%
- `steering` : Angle volant en degrés (-180 à +180)
- `gear` : Vitesse actuelle (pour détecter shifts)

## 🔄 Conversion Télémetry → Drill Song

### Algorithme de Conversion

```javascript
function convertTelemetryToDrillSong(telemetryData, options = {}) {
  const {
    sampleRate = 1.0,  // 1 point par seconde (réduire la densité)
    minChange = 5,     // Changement minimum pour créer un target (5%)
    minDuration = 0.2  // Durée minimum d'un target (0.2s)
  } = options;

  const targets = [];
  
  // Filtrer par sampleRate
  const sampled = telemetryData.filter((_, i) => i % sampleRate === 0);
  
  // Détecter les changements significatifs
  let currentBrake = null;
  let currentAccel = null;
  let currentWheel = null;
  let currentGear = null;
  let startTime = null;
  
  sampled.forEach((point, index) => {
    const time = point.time;
    
    // Brake targets
    if (currentBrake === null || Math.abs(point.brake - currentBrake) >= minChange) {
      if (currentBrake !== null && startTime !== null) {
        targets.push({
          type: 'brake',
          time: startTime,
          percent: currentBrake,
          duration: time - startTime
        });
      }
      currentBrake = point.brake;
      startTime = time;
    }
    
    // ... même logique pour accel, wheel, gear
  });
  
  return {
    name: 'Telemetry Import',
    difficulty: 'medium',
    description: 'Drill généré depuis télémetry importée',
    duration: Math.max(...sampled.map(p => p.time)),
    targets: targets
  };
}
```

## 🎨 Interface Utilisateur

### Étape 1 : Upload
```
┌─────────────────────────────────────┐
│  📊 Import Télémetry                │
├─────────────────────────────────────┤
│                                     │
│  [📁 Choisir un fichier]           │
│  ou glisser-déposer ici            │
│                                     │
│  Formats supportés:                │
│  • CSV (.csv)                      │
│  • JSON (.json)                    │
│  • ACC Telemetry (.ld)             │
│                                     │
└─────────────────────────────────────┘
```

### Étape 2 : Prévisualisation
```
┌─────────────────────────────────────┐
│  📊 Prévisualisation Télémetry      │
├─────────────────────────────────────┤
│                                     │
│  Durée: 45.3s                      │
│  Points: 453                        │
│                                     │
│  [Graphique de la télémetry]       │
│  ┌─────────────────────────────┐   │
│  │  Frein: ████████░░░░░░░░░░  │   │
│  │  Accél: ░░░░░░░░████████░░  │   │
│  │  Volant: ░░░░░░░░░░░░░░░░░░  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Options:                           │
│  ☑ Réduire à 1 point/seconde       │
│  ☐ Sélectionner un segment         │
│  ☐ Filtrer les petits changements  │
│                                     │
│  [Annuler]  [Créer le Drill]       │
│                                     │
└─────────────────────────────────────┘
```

## 🚀 Plan d'Implémentation

### Étape 1 : Parser CSV Simple
- Créer `telemetryParserService.js`
- Parser CSV avec colonnes : time, brake, throttle, steering, gear
- Validation et normalisation

### Étape 2 : Converter
- Créer `telemetryConverterService.js`
- Convertir en format drill song
- Gérer les 4 types d'inputs (brake, accel, wheel, shift)

### Étape 3 : Interface d'Import
- Créer `TelemetryImporter.jsx`
- Upload de fichier
- Prévisualisation basique

### Étape 4 : Intégration
- Ajouter "Import Télémetry" dans `DrillSelector`
- Créer `TelemetryDrill.jsx` (réutilise `FullComboDrill`)
- Sauvegarder le drill song généré (localStorage ou serveur)

## ❓ Questions pour l'Utilisateur

1. **Quel format de télémetry as-tu ?** (CSV, JSON, ACC, iRacing, autre ?)
2. **Quelles données sont disponibles ?** (frein, accel, volant, shifter, temps ?)
3. **Fréquence d'échantillonnage ?** (10Hz, 60Hz, variable ?)
4. **Veux-tu pouvoir sélectionner un segment ?** (ex: juste un virage)
5. **Mode replay souhaité ?** (voir les actions originales en temps réel)

## 📦 Format Drill Song Étendu

Pour supporter le drill complet avec télémetry :

```json
{
  "name": "Telemetry Import - Virage 1",
  "difficulty": "medium",
  "description": "Généré depuis télémetry importée",
  "duration": 12.5,
  "source": "telemetry",
  "targets": [
    {
      "time": 0.0,
      "type": "brake",
      "percent": 0,
      "duration": 0.5
    },
    {
      "time": 0.5,
      "type": "brake",
      "percent": 100,
      "duration": 0.3
    },
    {
      "time": 0.8,
      "type": "wheel",
      "angle": 45,
      "duration": 0.4
    },
    {
      "time": 1.2,
      "type": "accel",
      "percent": 30,
      "duration": 0.3
    },
    {
      "time": 1.5,
      "type": "shift",
      "direction": "up",
      "duration": 0.1
    }
  ]
}
```

## 🎯 Prochaines Étapes

Une fois les questions clarifiées, on peut commencer par :
1. **Parser CSV simple** (MVP)
2. **Converter basique** (1 point/seconde)
3. **Interface d'upload** simple
4. **Intégration avec FullComboDrill**

Ensuite, on peut améliorer avec :
- Support de formats multiples
- Sélection de segments
- Filtrage avancé
- Mode replay
