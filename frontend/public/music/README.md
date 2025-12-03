# 🎵 Musiques de Fond - Drill de Pourcentages

## 📁 Fichiers requis

Place tes musiques électro ici (format MP3) :

- `track1.mp3` - Electric Energy (145 BPM) - Énergique
- `track2.mp3` - Speed Rush (155 BPM) - Rapide
- `track3.mp3` - Neon Drive (140 BPM) - Groove
- `track4.mp3` - Turbo Mode (160 BPM) - Intense

## 🎼 Recommandations

**Style** : Électro / Techno / EDM  
**Durée** : 2-4 minutes (en boucle)  
**BPM** : 140-160 (pour l'énergie)  
**Format** : MP3 (128-320 kbps)

## 🔍 Où trouver des musiques gratuites ?

### Option 1 : Kevin MacLeod (Incompetech)
- Site : https://incompetech.com/music/royalty-free/music.html
- Filtre : Electronic / Techno
- Licence : Creative Commons (attribution)
- Recommandations :
  - "Cipher" (Électro intense)
  - "Hyperfun" (Électro rapide)
  - "Rocket" (Techno énergique)
  - "Volatile Reaction" (Électro sombre)

### Option 2 : Free Music Archive
- Site : https://freemusicarchive.org
- Filtre : Electronic / Techno
- Licence : Varie (vérifier)

### Option 3 : YouTube Audio Library
- Site : https://studio.youtube.com (Audio Library)
- Filtre : Electronic
- Licence : Gratuit, pas d'attribution

### Option 4 : Purple Planet Music
- Site : https://www.purple-planet.com
- Section : Electronic / Techno
- Licence : Gratuit (attribution optionnelle)

## ⚙️ Comment ça marche

1. Télécharge 4 musiques électro
2. Renomme-les : `track1.mp3`, `track2.mp3`, `track3.mp3`, `track4.mp3`
3. Place-les dans ce dossier (`frontend/public/music/`)
4. Rebuild le projet : `npm run build`
5. Redéploie : `firebase deploy`

Le jeu choisira une musique aléatoire au démarrage de chaque drill !

## 📝 Attribution (si requis)

Si tu utilises des musiques de Kevin MacLeod, ajoute dans les crédits :
```
Music by Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
```

## 🎮 Test en local

Pour tester :
```bash
npm run dev
```

Les musiques doivent être accessibles à :
- http://localhost:5173/music/track1.mp3
- http://localhost:5173/music/track2.mp3
- etc.

