# Plan de nettoyage

## Fichiers de test de debug à supprimer (root)
- consistenty-analyzer.js
- progression-chart.js
- theme-manager.js
- prod-*.png (screenshots de debug)
- react-app-*.png
- timezone-check.png
- firebase-connected.png
- firestore-test.png
- validation-prod-timezone-final.png
- debug-state.png

## Fichiers de test de debug (deploy/)
- Tous les test-*.js dans deploy/
- quick-test.js dans deploy/

## Fichiers de test inutilisés (tests/)
### Debug temporaires
- debug/*.html, *.js (tests de scroll)
- e2e/*debug*.spec.js (debug-segment-comparator, debug-all-dates, etc.)
- e2e/*-simple.js (quick tests)
- e2e/test-*.js non-spec (anciens tests integration)

### Tests de validation spécifiques (garder uniquement ceux nécessaires)
- compare-*.spec.js (garder quelques-uns pour référence)
- inspect-*.spec.js (supprimer, debug temporaire)
- quick-*.spec.js (supprimer)

## Archive à vérifier
- archive/components-unused/ (anciens composants)
- archive/old-scripts/ (anciens scripts)

## Documentation obsolète
- migration-react/ (garder juste le résumé)
- docs/ (vérifier ce qui est encore pertinent)
