# Calendrier des évènements – Spec (itération 1)

## Données : en dur dans le composant

- **Pas de fichier JSON** pour cette itération.
- Tu fournis la liste (circuits + dates) ici ; elle sera intégrée en **constante dans le composant** (ex. dans `CalendrierPage.jsx`).
- Plus tard : évolution possible (ex. admin ligue upload calendrier).

## Structure de chaque évènement (en dur)

```js
const EVENTS = [
  { date: '2025-03-15', circuitName: 'Spa-Francorchamps', trackName: 'Spa' }, // trackName optionnel pour lien classement
  // ...
];
```

- **date** : chaîne `YYYY-MM-DD` (ou Date), affichée formatée (ex. "15 mars 2025").
- **circuitName** : libellé affiché.
- **trackName** (optionnel) : si présent, afficher un lien "Voir le classement" vers `/classement` avec filtre piste.

## Navigation

- Menu **Outils** (Header) : nouvel item **Calendrier** → route `/calendrier`.

## Page

- Titre : "Calendrier des évènements".
- Liste des évènements triés par date (ordre à définir : prochain en premier ou chronologique).
- Par ligne : date formatée + nom circuit + lien "Voir le classement" si `trackName` présent.

## Fichiers

- Créer : `frontend/src/pages/CalendrierPage.jsx` (liste + constante `EVENTS` en tête du fichier).
- Créer : `frontend/src/pages/CalendrierPage.css`.
- Modifier : `App.jsx` (route), `ToolsMenu.jsx` (entrée Calendrier).

Mockup visuel : `calendrier-evenements-mockup.png` (généré dans les assets du projet Cursor ; copie possible dans `docs/` si besoin).
