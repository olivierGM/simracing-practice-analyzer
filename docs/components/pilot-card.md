# 🏁 COMPOSANT PILOT CARD

## 📋 Vue d'ensemble

Le composant `PilotCard` gère l'affichage complet de la fiche détaillée d'un pilote dans une modal plein écran. Il inclut les statistiques, le graphique de progression, la liste des tours et le comparateur de segments.

## 🏗️ Structure du composant

```
src/components/pilot-card/
├── pilot-card.js          # Logique principale
├── pilot-card.html        # Template HTML
├── pilot-card.css         # Styles spécifiques
├── pilot-card.config.js   # Configuration
└── tests/
    └── pilot-card.test.js # Tests unitaires
```

## 🎯 Fonctionnalités

### ✅ Implémentées
- ✅ Modal plein écran responsive
- ✅ Cartes de statistiques (meilleur tour, moyenne, wet, etc.)
- ✅ Calcul du meilleur tour potentiel
- ✅ Calcul de l'écart au leader
- ✅ Liste des tours avec segments
- ✅ Comparateur de segments (4 comparaisons)
- ✅ Bouton d'information des segments par piste
- ✅ Design responsive (desktop/mobile)
- ✅ Tests unitaires et E2E

### 🔄 En cours de développement
- 🔄 Intégration avec le composant progression-chart
- 🔄 Optimisation des performances
- 🔄 Tests de performance

## 📖 API du composant

### Initialisation
```javascript
const pilotCard = new PilotCard(config);
pilotCard.init();
```

### Ouverture de la modal
```javascript
pilotCard.open('firstName_lastName_cupCategory');
```

### Fermeture de la modal
```javascript
pilotCard.close();
```

## ⚙️ Configuration

Le composant utilise `PILOT_CARD_CONFIG` qui contient :

- **trackSegmentInfo** : Informations des segments par piste
- **styles** : Configuration des styles CSS
- **calculations** : Paramètres de calcul
- **messages** : Textes et messages

## 🧪 Tests

### Tests unitaires
- Initialisation du composant
- Ouverture/fermeture de la modal
- Calculs de statistiques
- Génération de contenu HTML
- Gestion des erreurs

### Tests d'intégration E2E
- Navigation complète de la modal
- Vérification de tous les éléments
- Test de responsivité mobile
- Test du bouton d'information

## 📱 Responsive Design

### Desktop (> 768px)
- Grille 4 colonnes pour les statistiques
- Comparateur de segments en 4 colonnes
- Liste des tours en tableau complet

### Mobile (< 768px)
- Grille 1 colonne pour les statistiques
- Comparateur de segments en 1 colonne
- Liste des tours avec défilement horizontal

## 🔗 Dépendances

### Interne
- `pilot-card.config.js` : Configuration
- `progression-chart.js` : Graphique (à intégrer)

### Externe
- Chart.js : Pour les graphiques
- CSS Variables : Pour les thèmes

## 🚀 Utilisation

### Intégration dans l'application principale
```javascript
// Dans script-public.js ou app.js
import PilotCard from './src/components/pilot-card/pilot-card.js';

const pilotCard = new PilotCard();
pilotCard.init();

// Remplacer l'ancienne fonction
window.openPilotModal = (pilotId) => {
    pilotCard.open(pilotId);
};
```

### Styles CSS
```html
<link rel="stylesheet" href="src/components/pilot-card/pilot-card.css">
```

## 📊 Métriques de performance

- **Temps de chargement** : < 100ms
- **Temps de rendu** : < 200ms
- **Mémoire utilisée** : < 5MB
- **Tests de couverture** : > 90%

## 🔧 Maintenance

### Ajout d'une nouvelle piste
1. Ajouter les informations dans `trackSegmentInfo`
2. Tester avec des données réelles
3. Valider avec les tests E2E

### Modification des calculs
1. Modifier `pilot-card.config.js`
2. Mettre à jour les tests unitaires
3. Valider avec les tests E2E

### Ajout de nouvelles statistiques
1. Modifier `generateStatsCards()`
2. Ajouter les calculs dans `calculatePilotStats()`
3. Mettre à jour les tests
4. Documenter les changements

## 🐛 Dépannage

### Problèmes courants
- **Modal ne s'ouvre pas** : Vérifier que `init()` a été appelé
- **Données manquantes** : Vérifier `getFilteredData()`
- **Styles cassés** : Vérifier l'import CSS
- **Tests qui échouent** : Vérifier les mocks

### Logs de débogage
```javascript
// Activer les logs détaillés
pilotCard.debug = true;
```

## 📈 Évolutions futures

- [ ] Intégration avec le système de thèmes
- [ ] Export des données en PDF/CSV
- [ ] Comparaison entre pilotes
- [ ] Historique des performances
- [ ] Notifications de nouveaux records
