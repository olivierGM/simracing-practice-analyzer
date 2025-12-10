# Debug Collision Windows - SimJack vs Shifter

## Problème Rapporté

**Sur Windows uniquement :**
- Pédalier SimJack seul → ✅ Fonctionne
- Pédalier SimJack + Shifter générique → ❌ Le shifter "remplace" le pédalier dans l'app
- Dans les jeux → ✅ Fonctionne (les jeux utilisent DirectInput, pas WebGamepad API)

**Sur Mac :**
- Tout fonctionne ✅

---

## Hypothèse

Les deux devices ont probablement le **MÊME ID** sur Windows dans la WebGamepad API :

```javascript
// Ce qui se passe probablement :
Gamepad #0: "USB Gamepad" ou "Generic USB Joystick"  // SimJack
Gamepad #1: "USB Gamepad" ou "Generic USB Joystick"  // Shifter (MÊME ID!)
```

Sur Mac, les IDs sont peut-être plus descriptifs :
```javascript
Gamepad #0: "SimJack Pedals"
Gamepad #1: "Generic USB Shifter"
```

---

## Action à Faire

1. **Sur Windows, va sur** : https://simracing-practice-analyzer.web.app/gamepad-debug
2. **Branche UNIQUEMENT le pédalier SimJack**
   - Note l'ID exact
3. **Branche EN PLUS le shifter**
   - Note l'ID du shifter
   - Vérifie s'ils ont le MÊME ID

**Envoie-moi les IDs exacts et je pourrai implémenter le fix.**

---

## Solution Planifiée

Si les IDs sont identiques, j'implémenterai le système de "slot" :

```javascript
// Au lieu de :
"USB Gamepad": { axes: {...} }

// Sauvegarder :
"USB Gamepad #1": { axes: {...}, _fingerprint: { usedAxes: [1,2] } }  // Pédales
"USB Gamepad #2": { axes: {...}, _fingerprint: { usedAxes: [0] } }     // Shifter
```

Et au moment de chercher, utiliser un "fingerprint" des axes pour différencier.

