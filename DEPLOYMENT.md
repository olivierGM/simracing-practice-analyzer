# 🚀 Guide de Déploiement - Sim Racing Practice Analyzer

## ⚠️ Problème identifié

Le processus de déploiement précédent avait un défaut majeur :
- **Développement** : dans le dossier racine
- **Déploiement** : depuis le dossier `deploy/`
- **Synchronisation** : manuelle et sujette aux erreurs

## ✅ Solutions implémentées

### Option 1: Script de déploiement simple
```bash
./deploy.sh
```

### Option 2: Script de build et déploiement complet
```bash
./build-and-deploy.sh
```

## 🔧 Recommandations

### Pour les futurs déploiements :

1. **Utiliser les scripts automatisés** au lieu de `firebase deploy` directement
2. **Toujours vérifier** que les modifications sont bien synchronisées
3. **Tester en local** avant de déployer

### Commandes recommandées :

```bash
# Déploiement simple (recommandé pour les corrections rapides)
./deploy.sh

# Déploiement complet avec validation (recommandé pour les releases)
./build-and-deploy.sh
```

## 🔍 Vérifications automatiques

Le script `build-and-deploy.sh` inclut :
- ✅ Validation des fichiers source
- ✅ Nettoyage du dossier deploy
- ✅ Copie automatique des fichiers
- ✅ Vérification du contenu (ex: absence de "Variabilité")
- ✅ Test de présence des fichiers critiques
- ✅ Déploiement Firebase
- ✅ Confirmation de succès

## 🚨 Points d'attention

1. **Toujours exécuter depuis la racine du projet**
2. **Vérifier que Firebase CLI est installé et configuré**
3. **S'assurer d'avoir les permissions de déploiement**

## 📁 Structure des fichiers

```
project-root/
├── src/                          # Fichiers source
├── deploy/                       # Fichiers de déploiement (généré)
├── deploy.sh                     # Script de déploiement simple
├── build-and-deploy.sh          # Script de build complet
├── firebase.json                 # Configuration Firebase
└── DEPLOYMENT.md                 # Ce fichier
```

## 🔄 Workflow recommandé

1. **Développement** dans le dossier racine
2. **Test local** avec serveur HTTP
3. **Commit** des modifications
4. **Déploiement** avec `./build-and-deploy.sh`
5. **Vérification** sur l'URL de production

---

*Dernière mise à jour: $(date)*
