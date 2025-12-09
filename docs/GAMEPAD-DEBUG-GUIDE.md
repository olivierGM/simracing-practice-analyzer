# Guide de Debug pour Problèmes de Détection de Gamepads

## 🎯 Problème

Vous avez des problèmes de détection de vos pédales SimJack après avoir connecté de nouveaux devices (shifter, handbrake, haptics) ?

## ✅ Solution

J'ai créé une **page de debug dédiée** pour diagnostiquer et résoudre ce problème.

---

## 📋 Instructions Pas à Pas

### 1. Accéder à la Page de Debug

**Option A : Depuis l'app**
1. Allez sur : https://simracing-practice-analyzer.web.app/pedal-wheel-drills
2. Cliquez sur "Configuration" pour développer le panneau
3. Cliquez sur le bouton **"🔍 Debug Gamepads"** en haut à droite
4. Une nouvelle page s'ouvrira

**Option B : Directement**
1. Ouvrez : https://simracing-practice-analyzer.web.app/gamepad-debug
2. Vous verrez tous les gamepads détectés en temps réel

---

### 2. Identifier vos Devices

La page de debug affiche **TOUS** les gamepads connectés avec :
- **Nom du device** (ex: "SimJack Pedals", "Logitech Shifter", etc.)
- **Index du gamepad** (ex: #0, #1, #2, etc.)
- **Nombre d'axes et boutons**
- **Valeurs en temps réel** pour chaque axe

#### Comment identifier vos pédales SimJack :

1. **Appuyez sur l'accélérateur** → Regardez quel gamepad affiche un changement de valeur
2. **Appuyez sur le frein** → Vérifiez que c'est le même gamepad
3. **Notez le nom et l'index** du gamepad (ex: "SimJack Pedals - #1")

#### Pour les autres devices :

- **Shifter** : Bougez le levier → voir quel gamepad réagit
- **Handbrake** : Tirez le frein à main → voir quel gamepad réagit
- **Haptics** : Si vos moteurs de vibration apparaissent comme un gamepad, c'est **normal** - ils ne doivent simplement pas être assignés dans la configuration

---

### 3. Configurer vos Devices

Une fois que vous avez identifié vos pédales SimJack :

1. Retournez à : https://simracing-practice-analyzer.web.app/pedal-wheel-drills
2. Ouvrez le panneau **"⚙️ Configuration"**
3. Cliquez sur **"Assigner"** pour chaque fonction :
   - **Accélérateur** → Cliquez, puis appuyez sur l'accélérateur SimJack
   - **Frein** → Cliquez, puis appuyez sur le frein SimJack
   - **Volant** → Cliquez, puis tournez le volant
   - etc.

4. L'app détectera automatiquement **quel device et quel axe** correspond à chaque fonction
5. Vérifiez avec les barres de test en temps réel que tout fonctionne

---

## 🔧 Problèmes Courants et Solutions

### Problème 1 : Mes pédales SimJack n'apparaissent pas du tout

**Causes possibles :**
- Les pédales ne sont pas reconnues par l'ordinateur
- Problème de pilote/driver
- Câble USB défectueux

**Solutions :**
1. **Déconnectez tous les devices USB**
2. **Reconnectez UNIQUEMENT les pédales SimJack**
3. **Attendez 5 secondes**
4. **Rafraîchissez la page de debug**
5. Si elles apparaissent maintenant, reconnectez les autres devices un par un

### Problème 2 : J'ai deux "pédaliers" qui apparaissent

**Cause :**
- Vos haptics (moteurs de vibration) sont probablement reconnus comme un gamepad

**Solution :**
- C'est **normal** ! Ne les assignez simplement pas dans la configuration
- Assignez **uniquement** vos vraies pédales SimJack
- L'app peut gérer plusieurs gamepads sans problème

### Problème 3 : Les pédales fonctionnent dans les jeux mais pas sur le site

**Causes possibles :**
- Les jeux utilisent des API différentes (DirectInput vs WebGamepad API)
- Certains drivers ne sont pas compatibles avec le navigateur web

**Solutions :**
1. **Testez sur un autre navigateur** (Chrome, Edge, Firefox)
2. **Testez sur** : https://gamepad-tester.com/ pour vérifier la compatibilité WebGamepad API
3. Si ça ne fonctionne sur aucun navigateur, le problème vient du driver

### Problème 4 : Les valeurs sont inversées (0% quand j'appuie, 100% au repos)

**Solution :**
- Dans la configuration, cliquez sur le bouton **"↪️ Normal"** à côté de la fonction
- Ça deviendra **"↩️ Inversé"** et corrigera le problème

---

## 🎮 Comprendre le Système

### Comment l'App Détecte les Gamepads

1. L'app utilise la **WebGamepad API** du navigateur
2. Cette API expose **tous** les gamepads connectés
3. Chaque gamepad reçoit un **index** (0, 1, 2, etc.)
4. L'ordre des index dépend de **l'ordre de connexion** des devices
5. L'app permet d'**assigner manuellement** chaque fonction à n'importe quel axe de n'importe quel gamepad

### Pourquoi l'Ordre de Connexion est Important

Quand vous connectez :
1. **Pédales** → Index 0
2. **Volant** → Index 1
3. **Shifter** → Index 2
4. **Handbrake** → Index 3
5. **Haptics** → Index 4

Si vous reconnectez dans un autre ordre, les index changent !

**Solution :** Utilisez l'assignation manuelle pour que l'app sache toujours quel device est quoi, peu importe l'ordre.

---

## 📞 Besoin d'Aide ?

Si le problème persiste :

1. **Prenez des captures d'écran** de la page de debug montrant tous les gamepads
2. **Notez** :
   - Quel navigateur vous utilisez (Chrome, Edge, Firefox, Safari)
   - Quelle version de l'OS (Windows, macOS, Linux)
   - Si les pédales fonctionnent sur gamepad-tester.com
3. **Partagez** ces infos pour un diagnostic plus précis

---

## 🎯 Résumé

✅ **Page de debug** : https://simracing-practice-analyzer.web.app/gamepad-debug
✅ **Identifiez** vos pédales SimJack en les bougeant
✅ **Assignez** manuellement chaque fonction dans la configuration
✅ **Ignorez** les haptics s'ils apparaissent comme un gamepad
✅ **Testez** avec les barres de progression en temps réel

**L'app supporte plusieurs gamepads sans problème - il suffit de les assigner correctement !** 🚀

