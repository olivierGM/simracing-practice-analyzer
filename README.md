# 🏎️ Sim Racing Practice Analyzer

Application web avancée pour analyser les données de pratique de sim racing avec des fonctionnalités complètes d'analyse des performances.

## 🌟 Fonctionnalités Principales

### 📊 Analyse des Performances
- **Statistiques complètes** par pilote et par classe
- **Graphiques de progression** avec Chart.js
- **Analyse de consistance** (temps valides, wet, total)
- **Comparateur de segments** avec informations détaillées par piste
- **Meilleur tour potentiel** (somme des meilleurs segments)

### 🏁 Segments et Pistes
- **8 pistes supportées** : Valencia, Nürburgring, Donington, Red Bull Ring, Misano, Snetterton, Monza, Zandvoort
- **Informations détaillées** sur les segments de chaque piste
- **Comparaison globale vs classe** pour chaque segment

### 🎨 Interface Moderne
- **Design responsive** (mobile, tablet, desktop)
- **Thèmes par piste** avec couleurs personnalisées
- **Mode sombre/clair** automatique
- **Modals pleine page** avec navigation optimisée

### 🔐 Administration
- **Interface admin sécurisée** avec authentification
- **Upload de fichiers JSON** multiples
- **Détection des doublons** automatique
- **Données persistantes** (localStorage)

## 🚀 Installation et Déploiement

### Option 1: Firebase Hosting (Recommandé)

1. **Cloner le repository**
   ```bash
   git clone https://github.com/olivierGM/simracing-practice-analyzer.git
   cd simracing-practice-analyzer
   ```

2. **Installer Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Configurer le projet**
   ```bash
   firebase init hosting
   # Sélectionner le projet existant
   # Dossier public: deploy
   ```

4. **Déployer**
   ```bash
   cp -r *.html *.css *.js *.json deploy/
   firebase deploy
   ```

### Option 2: GitHub Pages

1. **Fork** ce repository
2. **Activer GitHub Pages** dans Settings > Pages
3. **Source** : Deploy from a branch > main > / (root)

## 🛠️ Configuration

### Mot de passe Admin
```javascript
const ADMIN_PASSWORD = "votre-mot-de-passe";
```

### Pistes Supportées
Le système supporte automatiquement ces pistes avec leurs segments :
- `valencia` - Tours 1-4, 5-8, 9-14
- `nurburgring` - Tours 1-5, 6-10, 11-15
- `donington` - Tours 1-4, 5-8, 9-12
- `red_bull_ring` - Tours 1-3, 4-6, 7-10
- `misano` - Tours 1-5, 6-10, 11-16
- `snetterton` - Tours 1-4, 5-8, 9-13
- `monza` - Tours 1-3, 4-7, 8-11
- `zandvoort` - Tours 1-4, 5-8, 9-14

## 📱 Utilisation

### Pour les Administrateurs
1. **Connexion** avec le mot de passe admin
2. **Upload** des fichiers JSON de sessions
3. **Analyse** automatique des données
4. **Gestion** des doublons et erreurs

### Pour les Pilotes
1. **Consultation** des statistiques générales
2. **Ouverture** de la fiche détaillée d'un pilote
3. **Analyse** des segments et progression
4. **Comparaison** avec les autres pilotes

## 🔧 Structure du Projet

```
├── index.html              # Page principale
├── script-public.js        # Logique principale (version publique)
├── pilot-modal.js          # Modal détaillée des pilotes
├── progression-chart.js    # Graphiques Chart.js
├── consistency-analyzer.js # Analyse de consistance
├── theme-manager.js        # Gestion des thèmes
├── style.css              # Styles CSS complets
├── firebase-config.js     # Configuration Firebase
├── deploy/                # Dossier de déploiement Firebase
└── README.md              # Documentation
```

## 📊 Formats de Données

### Structure JSON Attendue
```json
{
  "laps": [
    {
      "carId": 1008,
      "driverIndex": 0,
      "isValidForBest": true,
      "laptime": 115637,
      "splits": [55570, 43125, 16942]
    }
  ],
  "trackName": "nurburgring",
  "sessionType": "FP",
  "Date": "2024-09-25T14:43:18.000Z"
}
```

## 🎯 Fonctionnalités Avancées

### Comparateur de Segments
- **4 types de comparaisons** : Meilleur vs Global/Classe, Moyenne vs Global/Classe
- **Informations détaillées** sur les tours de chaque segment
- **Couleurs d'écart** : Vert (meilleur), Rouge (plus lent)

### Analyse de Consistance
- **3 métriques** : Temps valides, temps wet, temps total
- **Calculs statistiques** : Écart-type, coefficient de variation
- **Scores 0-100%** avec icônes visuelles

### Graphiques de Progression
- **Évolution temporelle** des temps de tour
- **Format temps** : mm:ss:mmm
- **Filtres** par session et type de tour

## 🔒 Sécurité

- **Authentification** côté client pour l'admin
- **Données locales** (localStorage)
- **Validation** des fichiers uploadés
- **Gestion d'erreurs** robuste

## 🚀 Évolutions Futures

- [ ] Base de données Firebase
- [ ] Authentification JWT
- [ ] API REST
- [ ] Notifications temps réel
- [ ] Export des données (CSV, PDF)
- [ ] Analyse prédictive
- [ ] Comparaison multi-sessions

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- **Issues GitHub** : [Créer une issue](https://github.com/olivierGM/simracing-practice-analyzer/issues)
- **Email** : [Votre email]

---

**Développé avec ❤️ pour la communauté sim racing**