# 🏁 Analyseur de Temps - Sim Racing (Version Publique)

## Description

Cette application permet de visualiser les performances des pilotes et les statistiques de course à partir de fichiers JSON. Elle est conçue pour être accessible à tous pour la visualisation, avec un accès administrateur séparé pour l'upload de fichiers.

## Fonctionnalités

### 👥 Accès Public
- **Visualisation des données** : Tous les utilisateurs peuvent voir les statistiques de course
- **Tableau des pilotes** : Classement par meilleur temps valide
- **Statistiques globales** : Nombre de sessions, meilleurs temps, moyennes
- **Filtrage par piste** : Sélection des sessions par piste
- **Groupement par classe** : Pro, AM, Silver

### 🔐 Accès Administrateur
- **Upload de fichiers JSON** : Ajout de nouvelles données de course
- **Gestion des données** : Suppression et mise à jour des données
- **Téléchargement EGT** : Récupération automatique depuis EGT Canada
- **Authentification** : Mot de passe requis pour les fonctions admin

## Utilisation

### Pour les Utilisateurs Publics

1. **Ouvrir l'application** : Accédez à `index.html` dans votre navigateur
2. **Visualiser les données** : Les statistiques s'affichent automatiquement si des données sont disponibles
3. **Filtrer par piste** : Utilisez le menu déroulant pour sélectionner une piste spécifique
4. **Grouper par classe** : Activez/désactivez le groupement des pilotes par catégorie

### Pour les Administrateurs

1. **Se connecter** : Cliquez sur "Accès Admin" et entrez le mot de passe
2. **Uploader des fichiers** : Sélectionnez les fichiers JSON à analyser
3. **Analyser les données** : Cliquez sur "Analyser les données" pour traiter les fichiers
4. **Gérer les données** : Utilisez les boutons pour effacer ou télécharger des données

## Structure des Fichiers

```
practice lap/
├── index.html              # Page principale
├── script-public.js        # Script JavaScript public
├── style.css              # Styles CSS
├── firebase-config.js     # Configuration Firebase (si utilisé)
└── *.json                 # Fichiers de données de course
```

## Configuration

### Mot de Passe Admin
Le mot de passe administrateur par défaut est `admin123`. Pour le modifier, éditez la constante `ADMIN_PASSWORD` dans `script-public.js`.

### Base de Données
L'application utilise Firebase Firestore comme base de données centralisée :
- **Avec Firebase** : Données partagées entre tous les utilisateurs (recommandé)
- **Sans Firebase** : Fallback vers localStorage (données locales)

### Configuration Firebase
1. Suivez le guide `FIREBASE-SETUP.md`
2. Remplacez les clés dans `firebase-config.js`
3. Les données seront automatiquement synchronisées

## Format des Données

L'application accepte les fichiers JSON au format EGT Canada avec les champs suivants :
- `Date` : Date de la session
- `serverName` : Nom du serveur
- `trackName` : Nom de la piste
- `laps` : Tableau des tours avec `laptime` et `isValidForBest`
- `sessionResult` : Résultats de session avec informations des pilotes

## Fonctionnalités Techniques

- **Stockage local** : Utilise localStorage pour persister les données
- **Interface responsive** : S'adapte aux différentes tailles d'écran
- **Tri dynamique** : Colonnes triables dans le tableau des pilotes
- **Filtrage en temps réel** : Mise à jour instantanée des données affichées
- **Gestion des erreurs** : Messages d'erreur informatifs

## Développement

### Ajout de Nouvelles Fonctionnalités
1. Modifiez `script-public.js` pour la logique
2. Ajoutez les styles dans `style.css`
3. Mettez à jour `index.html` si nécessaire

### Déploiement
1. Uploadez tous les fichiers sur votre serveur web
2. Assurez-vous que `index.html` est accessible
3. Configurez le mot de passe admin si nécessaire

## Support

Pour toute question ou problème :
1. Vérifiez la console du navigateur pour les erreurs
2. Assurez-vous que les fichiers JSON sont au bon format
3. Vérifiez que le localStorage n'est pas plein

## Changelog

### Version Publique 1.0
- Interface publique pour la visualisation
- Authentification admin séparée
- Upload de fichiers réservé aux admins
- Messages informatifs pour les données vides
- Interface utilisateur améliorée
