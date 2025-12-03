# Spécifications UI - Interface de Jeu Drill de Pourcentages
## Version Finale Validée

---

## ✅ Points Validés

1. ✅ **Section inputs** : Ultra compacte en bas (~40-50px), juste les valeurs essentielles
2. ✅ **Zone d'approche** : Zone verte claire qui indique "Préparez-vous, la cible arrive!"
3. ✅ **Hauteur de barre** = Pourcentage cible (20%, 40%, 60%, 80%)
4. ✅ **Largeur de barre** = Durée à maintenir cette valeur (ex: 1s, 2s, 3s)

---

## 📐 Structure Complète

### 1. Section Haute (Stats) - ~100px
- 4 métriques en ligne : Temps, Zone, Précision, Score
- Style compact, toujours visible

### 2. Section Centrale (Gameplay DDR) - ~500-600px
- Zone de défilement avec barres qui arrivent de droite
- Zone d'approche (vert clair) avant la barre de jugement
- Barre de jugement à gauche avec feedback Hit/Miss
- Indicateur de valeur actuelle en bas

### 3. Section Basse (Inputs) - ~40-50px MAXIMUM
- Format ultra compact : `⚡ 80%  │  🛑 40%  │  🎮 30°  │  ⬆️ OFF  │  ⬇️ OFF`
- Une seule ligne horizontale
- Pas de barres visuelles, juste icône + valeur
- Discret, ne doit pas distraire

---

## 🎯 Mécanique des Barres

### Dimensions
- **Hauteur** : Correspond au pourcentage cible
  - 20% = Barre à 20% de la hauteur de la zone de jeu
  - 40% = Barre à 40% de la hauteur
  - 60% = Barre à 60% de la hauteur
  - 80% = Barre à 80% de la hauteur

- **Largeur** : Correspond à la durée à maintenir
  - Exemple : Barre de 200px = maintenir pendant 2 secondes (à vitesse fixe)
  - Plus la barre est large, plus il faut maintenir longtemps

### Zone d'Approche
- **Position** : Juste avant la barre de jugement (côté droit)
- **Largeur** : ~15-20% de la zone de jeu (environ 1 seconde)
- **Couleur** : Vert clair semi-transparent (`rgba(76, 175, 80, 0.2)`)
- **Fonction** : Signaler que la cible approche, l'utilisateur peut se préparer

### Exemple Visuel

```
Zone de jeu (hauteur = 500px)

    100% ────────────────────────────────────────┐
                                                  │
     80% ────────────────────────────────────────┤ ← Barre 80% (hauteur)
         [████████] ← Largeur = 2 secondes      │
     60% ────────────────────────────────────────┤ ← Barre 60% (hauteur)
         [████] ← Largeur = 1 seconde           │
     40% ────────────────────────────────────────┤ ← Barre 40% (hauteur)
         [████████████] ← Largeur = 3 secondes  │
     20% ────────────────────────────────────────┤ ← Barre 20% (hauteur)
         [██] ← Largeur = 0.5 secondes          │
      0% ────────────────────────────────────────┘

         ┌─────────────────────────────────────┐
         │  Zone d'Approche (vert clair)       │
         │  "La cible arrive dans 1 seconde!"  │
         └─────────────────────────────────────┘
         
         ┌─────────────────────────────────────┐
         │  Barre de Jugement                  │
         │  [Hit] [Hit] [Miss] [Hit]          │
         └─────────────────────────────────────┘
```

---

## 🎨 Section Inputs Compacte - Design Final

### Option 1 : Texte Simple (Recommandé)
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ 80%  │  🛑 40%  │  🎮 30°  │  ⬆️ OFF  │  ⬇️ OFF            │
└─────────────────────────────────────────────────────────────────┘
```

### Option 2 : Avec Mini-Barres (Si espace disponible)
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ [████░░] 80%  │  🛑 [██░░] 40%  │  🎮 [███░░] 30°        │
└─────────────────────────────────────────────────────────────────┘
```

**Style** :
- Fond très discret (noir/gris foncé)
- Texte petit (12-14px)
- Espacement minimal
- Bordure fine en haut pour séparer du gameplay

---

## ⚙️ Configuration

### Options Disponibles
1. **Mode de Difficulté** :
   - Facile : ±10%
   - Moyen : ±5%
   - Difficile : ±2%

2. **Pédale** :
   - Accélérateur
   - Frein

3. **Durée** :
   - Libre
   - 30 secondes
   - 60 secondes
   - 120 secondes

---

## 🎬 Séquence de Jeu

1. **Configuration** : Sélection mode, pédale, durée
2. **Countdown** : 3... 2... 1... GO!
3. **Jeu** :
   - Cibles défilent de droite à gauche
   - Zone d'approche = préparation
   - Barre de jugement = maintenir la valeur pendant la largeur de la barre
   - Feedback immédiat (Hit/Miss)
4. **Fin** : Résultats + Rejouer/Retour

---

## 📏 Dimensions Finales

```
┌─────────────────────────────────────────────────┐
│  Stats (100px)                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Gameplay DDR (500-600px)                      │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  Inputs (40-50px MAX)                          │
└─────────────────────────────────────────────────┘
```

---

**Design validé - Prêt pour implémentation** ✅

