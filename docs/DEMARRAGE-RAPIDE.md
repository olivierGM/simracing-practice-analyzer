# 🚀 Démarrage Rapide - Sim Racing Analyzer

## Option 1 : Mode Simple (localStorage) - RECOMMANDÉ

### ✅ **Le Plus Simple**
1. **Ouvrez `index.html`** directement dans votre navigateur
2. **C'est tout !** L'application fonctionne avec localStorage

### 🔧 **Pour les Admins**
1. Cliquez sur "🔐 Accès Admin"
2. Entrez le mot de passe : `admin123`
3. Uploadez vos fichiers JSON
4. Les données sont sauvegardées localement

---

## Option 2 : Serveur Local (partage de données)

### 📋 **Prérequis**
- Node.js installé sur votre machine
- Terminal/Invite de commandes

### 🛠️ **Installation**
```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur
npm start
```

### 🌐 **Utilisation**
1. **Serveur** : http://localhost:3000
2. **API** : http://localhost:3000/api/data
3. **Partage** : Tous les utilisateurs voient les mêmes données

### 📁 **Fichiers**
- `server-local.js` : Serveur Express
- `package.json` : Dépendances Node.js
- `script-local-server.js` : Script avec serveur local

---

## Option 3 : Firebase (cloud)

### 🌐 **Configuration**
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un projet
3. Activez Firestore Database
4. Copiez les clés dans `firebase-config.js`

### 📝 **Activation**
Remplacez dans `firebase-config.js` :
```javascript
const firebaseConfig = {
  apiKey: "votre-vraie-api-key",
  // ... autres clés
};
```

---

## 🎯 **Recommandation**

### **Pour Commencer** → Option 1 (localStorage)
- Aucune installation requise
- Fonctionne immédiatement
- Parfait pour tester

### **Pour Partager** → Option 2 (serveur local)
- Données centralisées
- Partage entre utilisateurs
- Installation simple

### **Pour Production** → Option 3 (Firebase)
- Données dans le cloud
- Accessible de partout
- Plus de configuration

---

## 🔄 **Changer de Mode**

### **localStorage → Serveur Local**
1. Remplacez `script-public.js` par `script-local-server.js` dans `index.html`
2. Démarrez le serveur : `npm start`
3. Ouvrez http://localhost:3000

### **localStorage → Firebase**
1. Configurez Firebase
2. Remplacez les clés dans `firebase-config.js`
3. L'application détecte automatiquement Firebase

---

## 🆘 **Dépannage**

### **Erreur "Cannot read properties"**
- Vérifiez que les fichiers JSON sont au bon format
- Regardez la console du navigateur

### **Serveur ne démarre pas**
- Vérifiez que Node.js est installé
- Exécutez `npm install` d'abord

### **Firebase ne fonctionne pas**
- Vérifiez les clés de configuration
- Assurez-vous que Firestore est activé

---

## 📊 **Indicateurs Visuels**

- 💾 = localStorage (données locales)
- 🖥️ = Serveur local (données partagées)
- ☁️ = Firebase (données cloud)

---

## 🎮 **Test Rapide**

1. **Ouvrez l'application**
2. **Connectez-vous en admin** (mot de passe : `admin123`)
3. **Uploadez un fichier JSON** (ex: `250918_170112_FP.json`)
4. **Vérifiez les résultats** dans le tableau des pilotes

**C'est parti ! 🏁**
