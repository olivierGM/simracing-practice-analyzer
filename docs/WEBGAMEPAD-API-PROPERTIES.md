# WebGamepad API - Propriétés Disponibles

## 🎮 Objet Gamepad Complet

Quand tu branches un device, la WebGamepad API retourne un objet `Gamepad` avec ces propriétés :

```javascript
{
  // ===== IDENTIFICATION =====
  id: "USB Gamepad (Vendor: 046d Product: c262)",  // String - Nom + Vendor ID + Product ID
  index: 0,                                         // Number - Index du gamepad (0, 1, 2, ...)
  
  // ===== CONNEXION =====
  connected: true,                                  // Boolean - Est connecté ?
  
  // ===== MAPPING =====
  mapping: "standard",                              // String - "standard", "" (empty), ou autre
  
  // ===== AXES (Joysticks, pédales, volant) =====
  axes: [
    0.0,        // Float entre -1.0 et 1.0 (axe 0)
    -0.5,       // Float entre -1.0 et 1.0 (axe 1)
    0.8,        // Float entre -1.0 et 1.0 (axe 2)
    // ... jusqu'à N axes
  ],
  
  // ===== BOUTONS =====
  buttons: [
    {
      pressed: false,    // Boolean - Est pressé ?
      touched: false,    // Boolean - Est touché ? (pour boutons tactiles)
      value: 0.0         // Float entre 0.0 et 1.0 (pression analogique)
    },
    {
      pressed: true,
      touched: true,
      value: 1.0
    },
    // ... jusqu'à N boutons
  ],
  
  // ===== TIMESTAMP =====
  timestamp: 1702123456789.123,  // DOMHighResTimeStamp - Dernière mise à jour
  
  // ===== VIBRATION (si supporté) =====
  vibrationActuator: {           // Null si pas supporté
    type: "dual-rumble",         // Type de vibration
    playEffect: function() {}    // Fonction pour déclencher vibration
  } || null,
  
  // ===== HAPTIC FEEDBACK (si supporté) =====
  hapticActuators: [             // Array vide si pas supporté
    {
      type: "vibration",
      // ... propriétés haptic
    }
  ] || []
}
```

---

## 📊 Propriétés en Détail

### **`id` (String) - LA CLÉ**

C'est la propriété qu'on utilise pour identifier le device !

**Format varie selon OS et device :**

**Windows :**
```javascript
"USB Gamepad (Vendor: 0810 Product: 0001)"  // Generic
"Logitech G920 (Vendor: 046d Product: c262)"
"Xbox 360 Controller (XInput STANDARD GAMEPAD)"
```

**Mac :**
```javascript
"SimJack Pedals"
"Logitech G920 Racing Wheel"
"USB Gamepad"
```

**Linux :**
```javascript
"Microsoft X-Box 360 pad"
"Logitech G920 Driving Force Racing Wheel USB"
```

⚠️ **IMPORTANT :** 
- Pas d'UUID unique par device physique
- Deux devices identiques = même ID
- Format peut changer selon driver/OS

---

### **`index` (Number)**

Index temporaire assigné par le navigateur.

```javascript
index: 0  // Premier gamepad détecté
index: 1  // Deuxième gamepad détecté
// etc.
```

⚠️ **CHANGE** :
- Si tu débranche/rebranche
- Si tu changes l'ordre de connexion
- Si tu redémarres

---

### **`axes` (Array<Float>)**

Valeurs des axes analogiques.

```javascript
axes: [
  0.0,      // Axe 0 : Centré
  -1.0,     // Axe 1 : Complètement à gauche/haut
  1.0,      // Axe 2 : Complètement à droite/bas
  0.5       // Axe 3 : Mi-chemin
]
```

**Plage :** `-1.0` à `+1.0`

**Utilisation typique :**
- Axe 0 : Volant (gauche/droite)
- Axe 1 : Accélérateur (haut/bas)
- Axe 2 : Frein (haut/bas)
- Axe 3 : Embrayage (si présent)

---

### **`buttons` (Array<GamepadButton>)**

État des boutons.

```javascript
buttons: [
  {
    pressed: true,   // Bouton enfoncé
    touched: true,   // Bouton touché (tactile)
    value: 1.0       // Pression complète
  },
  {
    pressed: false,
    touched: false,
    value: 0.0       // Pas pressé
  },
  {
    pressed: true,
    touched: true,
    value: 0.5       // À moitié pressé (gâchette analogique)
  }
]
```

**`value` :**
- `0.0` = Pas pressé
- `1.0` = Complètement pressé
- Entre les deux = Pression partielle (gâchettes analogiques)

---

### **`mapping` (String)**

Indique le type de mapping.

```javascript
mapping: "standard"  // Layout standard (Xbox-like)
mapping: ""          // Layout custom/non-standard
```

**"standard" signifie :**
- Bouton 0 = A (Xbox) / X (PlayStation)
- Bouton 1 = B (Xbox) / O (PlayStation)
- etc.

Pour les volants/pédales : Souvent `""` (vide) car pas de standard.

---

### **`timestamp` (DOMHighResTimeStamp)**

Moment de la dernière mise à jour.

```javascript
timestamp: 1702123456789.123  // Millisecondes depuis epoch
```

Utilisé pour détecter si les valeurs ont changé.

---

### **`vibrationActuator` (Object | null)**

Support de vibration (force feedback).

```javascript
vibrationActuator: {
  type: "dual-rumble",
  playEffect: function(type, params) {
    // Déclenche vibration
  }
}
```

**Souvent `null`** pour les pédales/volants sans force feedback.

---

## 🔍 Ce qui N'EXISTE PAS (malheureusement)

❌ **Pas d'UUID unique** : Rien pour identifier un device physique spécifique
❌ **Pas de numéro de série** : Impossible de différencier deux devices identiques
❌ **Pas de port USB** : On ne sait pas sur quel port il est branché
❌ **Pas de manufacturer distinct** : Vendor ID est dans la string `id`, pas séparé
❌ **Pas de product ID distinct** : Product ID est dans la string `id`, pas séparé

---

## 💡 Ce qu'on PEUT Utiliser pour Différencier

### **1. ID (avec Vendor/Product)**
```javascript
"SimJack Pedals (Vendor: 046d Product: c262)"  // Unique si devices différents
"USB Gamepad (Vendor: 0810 Product: 0001)"     // Générique
```

### **2. Nombre d'axes**
```javascript
axes.length  // 2, 3, 4, etc.
```

### **3. Nombre de boutons**
```javascript
buttons.length  // 0, 8, 12, etc.
```

### **4. Pattern d'utilisation** (notre fingerprint)
```javascript
{
  axisCount: 3,
  buttonCount: 0,
  usedAxes: [1, 2]  // Quels axes sont assignés
}
```

### **5. lastKnownIndex** (hint)
```javascript
_lastKnownIndex: 2  // Était à l'index 2 avant
```

---

## 📋 Exemple Complet (Real-World)

**SimJack Pedals sur Windows :**
```javascript
{
  id: "USB Gamepad (Vendor: 0810 Product: 0001)",
  index: 0,
  connected: true,
  mapping: "",
  axes: [-0.023, 0.5, 0.8],  // 3 axes (repos, mi-accél, frein 80%)
  buttons: [],                // Pas de boutons
  timestamp: 1702123456789.123,
  vibrationActuator: null,
  hapticActuators: []
}
```

**Shifter Générique sur Windows :**
```javascript
{
  id: "USB Gamepad (Vendor: 0810 Product: 0001)",  // MÊME ID !
  index: 1,
  connected: true,
  mapping: "",
  axes: [0.0, 0.0],           // 2 axes
  buttons: [
    { pressed: false, touched: false, value: 0 },
    { pressed: false, touched: false, value: 0 },
    // ... 12 boutons total
  ],
  timestamp: 1702123456790.456,
  vibrationActuator: null,
  hapticActuators: []
}
```

**Différences :**
- ✅ `axes.length` : 3 vs 2
- ✅ `buttons.length` : 0 vs 12
- ❌ `id` : IDENTIQUE

---

## 🎯 Conclusion

**Ce qu'on a :**
- `id` (pas toujours unique)
- `index` (change)
- `axes` (valeurs + count)
- `buttons` (état + count)
- `mapping`
- `timestamp`

**Ce qu'on n'a pas :**
- UUID unique
- Numéro de série
- Port USB
- Manufacturer séparé
- Product séparé

**Notre stratégie :**
1. Utiliser `id` comme clé primaire
2. Ajouter slot `#N` si collision
3. Utiliser fingerprint (axes count, buttons count, used axes) pour matcher
4. Utiliser `lastKnownIndex` comme hint

---

C'est tout ce que la WebGamepad API nous donne ! 😅




