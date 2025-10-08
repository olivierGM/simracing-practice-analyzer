# 🚀 Guide de Déploiement

Ce guide explique comment déployer l'application Sim Racing Practice Analyzer sur GitHub et Firebase.

## 📋 Prérequis

### GitHub
- Compte GitHub avec accès au repository `simracing-practice-analyzer`
- Git configuré avec vos credentials

### Firebase
- Compte Firebase avec le projet `simracing-practice-analyzer`
- Firebase CLI installé : `npm install -g firebase-tools`
- Authentification Firebase : `firebase login`

## 🛠️ Scripts de Déploiement

### 1. Déploiement GitHub uniquement
```bash
./deploy-to-github.sh "Votre message de commit"
```

### 2. Synchronisation Firebase uniquement
```bash
./sync-firebase.sh
```

### 3. Déploiement complet (GitHub + Firebase)
```bash
./deploy-all.sh "Votre message de commit"
```

## 📝 Exemples d'utilisation

### Ajout d'une nouvelle fonctionnalité
```bash
# Après avoir modifié le code
./deploy-all.sh "Ajout du comparateur de segments avec informations des pistes"
```

### Correction de bugs
```bash
./deploy-all.sh "Fix: Correction des couleurs des écarts dans le comparateur"
```

### Mise à jour des styles
```bash
./deploy-all.sh "Update: Amélioration du responsive design mobile"
```

## 🔧 Configuration Manuelle

### Configuration Git
```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

### Configuration Firebase
```bash
firebase login
firebase use simracing-practice-analyzer
```

## 📊 URLs de Déploiement

- **GitHub Repository** : https://github.com/olivierGM/simracing-practice-analyzer
- **Firebase Hosting** : https://simracing-practice-analyzer.web.app

## 🚨 Dépannage

### Erreur de push GitHub
```bash
# Augmenter la taille du buffer
git config http.postBuffer 524288000

# Force push si nécessaire
git push origin main --force
```

### Erreur Firebase
```bash
# Vérifier l'authentification
firebase login

# Vérifier le projet actuel
firebase projects:list
firebase use simracing-practice-analyzer
```

### Fichiers non synchronisés
```bash
# Vérifier le statut
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Votre message"
```

## 📋 Checklist de Déploiement

Avant chaque déploiement, vérifiez :

- [ ] Code testé localement
- [ ] Tests Playwright passés
- [ ] Aucune erreur de console
- [ ] Fonctionnalités validées
- [ ] Responsive design vérifié
- [ ] Message de commit descriptif

## 🔄 Workflow Recommandé

1. **Développement local**
   - Modifier le code
   - Tester les fonctionnalités
   - Valider avec Playwright

2. **Commit et Push**
   ```bash
   ./deploy-all.sh "Description des changements"
   ```

3. **Validation**
   - Vérifier le site Firebase
   - Tester les nouvelles fonctionnalités
   - Valider sur mobile/desktop

## 📚 Ressources

- [Documentation Git](https://git-scm.com/docs)
- [Documentation Firebase](https://firebase.google.com/docs)
- [GitHub Pages](https://pages.github.com/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
