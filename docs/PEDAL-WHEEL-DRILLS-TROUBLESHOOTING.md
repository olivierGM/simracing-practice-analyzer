# Guide de Dépannage - Drills Pédales & Volant

## Problème : Mon volant n'est pas détecté

### Moza R9 et autres volants Direct Drive

Le **Moza R9** (et certains autres volants Direct Drive) peuvent ne pas être automatiquement reconnus comme "gamepad standard" par le navigateur. Voici les étapes de dépannage :

#### 1. Vérifier la reconnaissance Windows

1. Ouvrir **Paramètres Windows** → **Périphériques** → **Contrôleurs de jeu USB**
2. Vérifier que le **Moza R9** apparaît dans la liste
3. Si absent :
   - Installer ou redémarrer **MOZA Pit House**
   - Vérifier que le firmware est à jour
   - Redémarrer l'ordinateur

#### 2. Activer le gamepad dans le navigateur

**Important :** Le navigateur ne détecte que les gamepads "activés". Pour activer :

1. Connecter le volant et les pédales
2. **Appuyer sur un bouton du volant** OU **bouger une pédale**
3. Le navigateur devrait maintenant détecter le périphérique

#### 3. Vérifier le navigateur

- **Chrome/Edge** : Meilleur support de la Gamepad API
- **Firefox** : Support correct
- **Safari** : Support limité (non recommandé)

Assurez-vous d'utiliser une version récente du navigateur.

#### 4. Si le volant n'est toujours pas détecté

**Le Moza R9 peut nécessiter l'API WebHID** (à implémenter) :

- Certains volants Direct Drive ne sont pas reconnus comme gamepads standard
- L'API WebHID permet d'accéder directement aux périphériques HID
- Support actuellement limité à Chrome/Edge
- Nécessite une permission utilisateur explicite

### SimJack et autres pédales

Les pédales **SimJack** sont généralement bien reconnues si elles sont connectées via USB et reconnues par Windows comme contrôleur de jeu.

**Vérifications :**
1. Les pédales apparaissent dans "Contrôleurs de jeu USB" ?
2. Les pédales sont-elles activées (bouger une pédale) ?
3. Le navigateur est-il à jour ?

---

## Problème : Les valeurs ne sont pas correctes

### Mapping des axes incorrect

Le mapping des axes peut varier selon le modèle de volant. Actuellement, le mapping par défaut est :

- **Axe 0** : Volant (gauche/droite)
- **Axe 1** : Accélérateur
- **Axe 2** : Frein
- **Axe 3** : Embrayage (si présent)

**Solution :** Utiliser la section "Données brutes" pour vérifier quel axe correspond à quoi, puis ajuster le mapping dans `gamepadService.js` si nécessaire.

### Valeurs inversées

Si les valeurs sont inversées (ex: accélérateur à 0% quand enfoncé) :

1. Vérifier dans les données brutes si la valeur est négative
2. Ajuster le paramètre `invert` dans `normalizePedal()` dans `gamepadService.js`

---

## Problème : Latence ou valeurs qui sautent

### Performance

- Le polling se fait via `requestAnimationFrame` (60 FPS)
- Si les valeurs sautent, vérifier :
  - Les performances du navigateur
  - Les autres onglets ouverts
  - Les extensions de navigateur qui pourraient interférer

### Calibration

Certains volants nécessitent une calibration dans leur logiciel (ex: MOZA Pit House) avant d'être utilisés dans le navigateur.

---

## Support des différents modèles

### Volants testés et compatibles

- ✅ **Logitech G29/G920** : Compatible (gamepad standard)
- ✅ **Thrustmaster T300** : Compatible (gamepad standard)
- ✅ **Fanatec CSL** : Compatible (gamepad standard)
- ⚠️ **Moza R9** : Peut nécessiter WebHID (selon configuration)
- ⚠️ **Simucube** : Peut nécessiter WebHID (selon configuration)

### Pédales testées

- ✅ **SimJack** : Compatible si reconnues comme gamepad
- ✅ **Logitech G29** : Compatible (intégrées au volant)
- ✅ **Thrustmaster T3PA** : Compatible

---

## Prochaines étapes

Si ton volant n'est pas détecté avec la Gamepad API, nous devrons implémenter le support **WebHID API** :

1. Détection des périphériques HID
2. Demande de permission utilisateur
3. Lecture directe des données HID
4. Mapping personnalisé pour chaque modèle

**Note :** WebHID est actuellement supporté uniquement par Chrome/Edge.

---

## Aide supplémentaire

Si tu rencontres toujours des problèmes :

1. Vérifier la console du navigateur (F12) pour les erreurs
2. Vérifier les données brutes dans l'interface (section "Debug")
3. Tester avec un autre navigateur
4. Vérifier que MOZA Pit House fonctionne correctement

