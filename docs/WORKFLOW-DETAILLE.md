# Workflow détaillé (référence)

Ce document est la version détaillée du workflow. **La règle appliquée automatiquement par l’IA à chaque fois est dans `.cursor/rules/`** (règle courte). Utilise ce doc pour les rappels explicites (« suis le workflow détaillé ») ou pour la checklist humaine.

---

## Quand s’applique le workflow détaillé

- Créer une nouvelle fonctionnalité, modifier du code, corriger des bugs, refactoriser.
- Ne pas appliquer pour : questions, demandes d’info, analyses sans modification.

---

## Développement (qualité de code)

- Écrire des fonctions claires et testables ; vérifier que la fonctionnalité marche avant le reste.
- **Référence visuelle avant UI** : avant de coder une feature UI, capturer 2–3 screenshots Playwright de la prod, documenter les sélecteurs et valeurs attendues.
- **Format des données en premier** : avant une logique de formatage, extraire un JSON de 2–3 cas réels, écrire un test avec valeurs attendues, puis implémenter.
- Exécuter les tests unitaires et Playwright si applicable ; pas d’erreur console. Tous les tests doivent passer avant commit.

---

## Commit

- Un commit par fonctionnalité terminée ; message clair. Ne jamais committer du code non testé.
- Si > 3 fichiers modifiés : diviser en micro-commits, message explicite sur le scope.
- Template suggéré : `type: Description courte` puis éventuellement Validation / Impact.

---

## Déploiement

- Avant déploiement : lint puis build (voir règle courte). En cas d’échec, ne pas déployer.
- Après déploiement : smoke rapide (ouvrir l’app, une page liste, une page drills). Checklist complète : `docs/DEPLOIEMENT.md`.
- À chaque livraison sur main : mettre à jour `CHANGELOG.md` (date, thème, 2–3 lignes).
- Avant modification, communiquer les risques (CSS/thèmes, déploiement, logique de tri) en une phrase si pertinent.

---

## Branches et dette

- **Branches feature** : merger ou archiver les branches obsolètes pour éviter la confusion et les oublis de merge. Éviter d’accumuler beaucoup de branches ouvertes.
- **Après un revert** : documenter en 2 lignes dans `CHANGELOG.md` (section « Lessons learned ») : quoi, pourquoi, quoi faire différemment.

---

## Messages de commit

- Préfixes : `feat`, `fix`, `refactor`, `docs`. Description claire. Si grosse livraison, optionnel une ligne `Validation: …`.

---

## Métriques de succès

- 0 bug de synchronisation en prod ; max 1 revert par feature ; 100 % des tests passent avant commit ; communication proactive des risques.
