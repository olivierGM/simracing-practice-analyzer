# 🔥 Configuration Firebase pour l'Application Sim Racing

## Pourquoi Firebase ?

Firebase permet de centraliser les données de course dans une base de données cloud, accessible à tous les utilisateurs de l'application, peu importe où ils se trouvent.

## Étapes de Configuration

### 1. Créer un Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Nommez votre projet (ex: "simracing-practice")
4. Activez Google Analytics (optionnel)
5. Créez le projet

### 2. Activer Firestore Database

1. Dans votre projet Firebase, allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Mode test" (pour commencer)
4. Sélectionnez une région proche de vous
5. Créez la base de données

### 3. Configurer les Règles de Sécurité

Dans l'onglet "Règles" de Firestore, remplacez le contenu par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture à tous
    match /{document=**} {
      allow read: if true;
    }
    
    // Permettre l'écriture seulement aux admins (pour l'instant, tous)
    match /{document=**} {
      allow write: if true;
    }
  }
}
```

### 4. Obtenir les Clés de Configuration

1. Allez dans "Paramètres du projet" (icône d'engrenage)
2. Dans l'onglet "Général", trouvez "Vos applications"
3. Cliquez sur "Ajouter une application" > "Web"
4. Nommez votre app (ex: "Sim Racing App")
5. Copiez les clés de configuration

### 5. Mettre à Jour le Fichier de Configuration

Remplacez les valeurs dans `firebase-config.js` :

```javascript
const firebaseConfig = {
  apiKey: "votre-vraie-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "votre-sender-id",
  appId: "votre-app-id"
};
```

## Structure des Données dans Firebase

### Collection `sessions`
Chaque document représente une session de course :
- **ID** : `{date}_{serverName}_{trackName}`
- **Données** : Objet JSON complet de la session

### Collection `processedData`
Document unique contenant les données traitées :
- **ID** : `current`
- **Données** : Statistiques calculées (pilotes, catégories, etc.)

## Avantages de Firebase

### ✅ Centralisation
- Toutes les données sont stockées dans le cloud
- Accessible depuis n'importe où
- Synchronisation automatique

### ✅ Partage
- Tous les utilisateurs voient les mêmes données
- Mise à jour en temps réel
- Pas de duplication locale

### ✅ Sauvegarde
- Données sauvegardées automatiquement
- Pas de perte de données
- Historique des modifications

## Test de l'Application

1. **Sans Firebase** : L'application utilise localStorage (données locales)
2. **Avec Firebase** : L'application utilise la base de données cloud

### Indicateurs Visuels
- ☁️ = Données depuis Firebase (centralisé)
- 💾 = Données depuis localStorage (local)

## Dépannage

### Erreur "Firebase not initialized"
- Vérifiez que les clés de configuration sont correctes
- Assurez-vous que Firestore est activé
- Vérifiez les règles de sécurité

### Données ne se synchronisent pas
- Vérifiez la connexion internet
- Vérifiez les règles de sécurité Firestore
- Regardez la console du navigateur pour les erreurs

## Coûts Firebase

- **Gratuit** : Jusqu'à 1 Go de stockage et 50 000 lectures/écritures par jour
- **Payant** : Au-delà des limites gratuites (très généreux pour une app de course)

## Sécurité Avancée (Optionnel)

Pour une sécurité renforcée, vous pouvez :
1. Activer l'authentification Firebase
2. Créer des utilisateurs admin
3. Restreindre l'écriture aux admins authentifiés

## Support

Si vous rencontrez des problèmes :
1. Vérifiez la console du navigateur
2. Consultez la [documentation Firebase](https://firebase.google.com/docs)
3. Vérifiez que votre projet Firebase est bien configuré
