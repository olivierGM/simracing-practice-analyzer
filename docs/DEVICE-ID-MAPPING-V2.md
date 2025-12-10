# Device ID-Based Mapping v2 🎮

## ✅ **C'EST FAIT !**

Le système a été modifié pour utiliser **l'ID du device** au lieu de son **index** !

---

## 🎯 **Ce qui a changé**

### **Avant (v1 - Index-based) :**
```javascript
{
  axisMappings: {
    "0": {  // ← Index du gamepad (changeait si ordre de branchement changeait)
      "1": { type: "accelerator", invert: false }
    }
  }
}
```

### **Après (v2 - ID-based) :**
```javascript
{
  version: 2,
  axisMappings: {
    "SimJack Pedals (Vendor: 046d Product: c262)": {  // ← ID du device (fixe !)
      axes: {
        "1": { type: "accelerator", invert: false },
        "2": { type: "brake", invert: false }
      },
      _lastKnownIndex: 0  // Pour debug seulement
    }
  }
}
```

---

## 🚀 **Avantages**

✅ **Plus besoin de brancher dans le même ordre**
- Tes pédales SimJack seront trouvées automatiquement
- Peu importe que tu branches le Simagic avant ou après

✅ **Résistant aux changements**
- Redémarre ton PC → Ça marche
- Débranche/rebranche des devices → Ça marche
- Change les ports USB → Ça marche

✅ **Migration automatique**
- Ta config actuelle sera automatiquement convertie
- Pas besoin de reconfigurer si tu as déjà tout assigné

---

## 📋 **Comment Tester**

### **Étape 1 : Ouvre l'app**
https://simracing-practice-analyzer.web.app/pedal-wheel-drills

### **Étape 2 : Va dans la config**
- Clique sur "⚙️ Configuration" pour l'ouvrir
- Tu devrais voir tes devices connectés

### **Étape 3A : Si tu as déjà une config (migration automatique)**

1. **Teste d'abord** :
   - Appuie sur tes pédales SimJack
   - Regarde les barres de test en temps réel
   - **Si ça marche** → Migration réussie ! 🎉
   - **Si ça ne marche pas** → Passe à l'étape 3B

2. **Si ça ne marche pas** :
   - C'est normal, la migration nécessite que tous tes devices soient branchés dans le même ordre qu'avant
   - Passe à l'étape 3B pour réassigner

### **Étape 3B : Réassigner (une dernière fois !)**

1. Clique sur **"Assigner"** à côté de "⚡ Accélérateur"
2. **Appuie sur l'accélérateur** de tes pédales SimJack
3. L'app détectera automatiquement et assignera
4. Répète pour **"🛑 Frein"**
5. Répète pour toutes les autres fonctions

**Important :** Le système va maintenant sauvegarder par **device ID** au lieu d'index !

### **Étape 4 : Teste le changement d'ordre**

1. **Débranche** tous tes devices
2. **Rebranche** dans un **ordre différent** :
   - Exemple : Shifter d'abord, puis Simagic, puis SimJack
3. **Refresh** la page
4. **Va dans la config**
5. **Teste tes pédales** → Ça devrait toujours marcher ! ✅

---

## 🔍 **Debug**

### **Si tes pédales ne sont toujours pas détectées :**

1. **Ouvre la page de debug** :
   - https://simracing-practice-analyzer.web.app/gamepad-debug
   - OU clique sur "🔍 Debug Gamepads" dans la config

2. **Vérifie** :
   - Est-ce que tes pédales SimJack apparaissent ?
   - Quel est leur ID exact ?
   - Est-ce qu'elles réagissent quand tu appuies ?

3. **Si elles apparaissent** :
   - Retourne à la config
   - Réassigne-les manuellement
   - Maintenant ça devrait marcher peu importe l'ordre

4. **Si elles n'apparaissent pas** :
   - Problème de driver/connexion USB
   - Teste sur https://gamepad-tester.com/
   - Si ça ne marche pas là non plus → Problème hardware/driver

---

## 📊 **Scénarios Testés**

### **Scénario 1 : Migration automatique**

```
État avant :
  - Config v1 avec SimJack à l'index 0
  - SimJack est toujours à l'index 0

Résultat :
  ✅ Migration automatique vers v2
  ✅ Fonctionne immédiatement sans reconfiguration
```

### **Scénario 2 : Ordre a changé depuis la dernière config**

```
État avant :
  - Config v1 avec SimJack à l'index 0
  - SimJack est maintenant à l'index 3

Résultat :
  ⚠️ Migration ne peut pas trouver le bon device
  ✅ Tu dois réassigner une fois
  ✅ Après ça, fonctionne peu importe l'ordre
```

### **Scénario 3 : Plusieurs devices identiques**

```
Devices :
  - 2x "USB Gamepad (Vendor: 0810 Product: 0001)"

Résultat :
  ⚠️ Les deux ont le même ID
  ✅ Le système utilise le premier trouvé
  💡 Solution : Débrancher un, configurer l'autre, puis rebrancher
```

---

## 🎯 **Ce qui est résolu**

✅ **Ton problème principal** : SimJack vs Simagic qui changeait l'index
✅ **Shifter générique** : Trouvé par son ID même si l'ordre change
✅ **Handbrake générique** : Trouvé par son ID même si l'ordre change
✅ **Haptics** : Peuvent rester branchés, ne causent plus de problème

---

## 💡 **Note Importante**

**Cas limite (rare) :** Si tu as **deux devices exactement identiques** (même nom, même vendor, même product ID), le système prendra le premier trouvé.

**Solution pour ce cas :**
1. Débrancher le device #2
2. Configurer le device #1
3. Rebrancher le device #2
4. Si nécessaire, utiliser des profils différents (feature à venir)

Mais honnêtement, qui a deux SimJack branchés en même temps ? 😄

---

## 🚀 **Résumé**

**Avant :** Tu devais brancher dans le même ordre ou reconfigurer
**Maintenant :** Branche dans n'importe quel ordre, ça marche !

**Action requise :** 
- Si migration échoue → Réassigner une fois
- Après ça → Liberté totale ! 🎉

**URL de test :**
https://simracing-practice-analyzer.web.app/pedal-wheel-drills

**Bon test ! 🎮**

