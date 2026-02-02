# Checklist déploiement

À suivre à chaque déploiement en prod (ou à faire exécuter par l’IA).

1. **Lint** : `cd frontend && npm run lint` → si échec, ne pas continuer.
2. **Build** : `cd frontend && npm run build` → si échec, ne pas déployer.
3. **Deploy** : `firebase deploy --only hosting` (à la racine du repo).
4. **Push** : `git push origin main` (si pas déjà fait).
5. **Smoke rapide** : ouvrir l’app (URL prod), vérifier une page (ex. liste pilotes) et une page drills ; pas d’erreur visible.

En cas d’échec au lint ou au build : remonter l’erreur et ne pas déployer.
