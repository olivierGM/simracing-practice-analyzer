# Changelog

Résumé des livraisons sur `main`. À chaque release : date, thème, 2–3 lignes.

---

## [Non publié]

- (À remplir à la prochaine livraison)

## 2026-02-09 (suite)

- **Header desktop** : Dernière session + module 0/64 de nouveau dans la barre titre en desktop ; Outils en bouton à gauche du compte. En mobile : titre « Sim League EGT » masqué jusqu’à 900px pour éviter l’overlap avec la nav.
- **Déploiement** : Lint + build OK ; déployé sur Firebase Hosting.

## 2026-02-09

- **Header & page temps** : Max-width 1422px (header + container). Dernière session et module 0/64 déplacés sur la page des temps. Nav « Classement » masquée. Mobile : titre texte masqué, compte en icône ronde, filtres repliables (fermés par défaut).
- **Filtres** : Encadré avec coins arrondis, « Grouper par classe » sur la même ligne. Période « Personnalisé » : encadré visuel regroupant le select et les deux champs date.
- **Validation** : Lint + build OK ; déployé sur Firebase Hosting.

## 2026-02-05 (suite)

- **Rôles admin** : Cog admin visible uniquement pour rôle `admin` (Firestore). Route `/admin` protégée par AdminRoute. Suppression du mot de passe admin ; accès par compte + rôle. Rétrocompatibilité pour cow.killa@gmail.com (persistance du rôle si manquant).
- **Déploiement** : Lint + build OK ; déployé sur Firebase Hosting.

## 2026-02-05

- **Sim League EGT** : Nom affiché « Sim League EGT » partout (landing, header, titre). Thème sombre par défaut (`:root` + useTheme). Suppression du bypass « voir classement sans connexion » : accès protégé uniquement par session.
- **Landing hero** : Nouvelle image hero GT3 en épingle (locale, `landing-hero-gt3-hairpin-1.png`) ; plus d’image Unsplash.
- **Déploiement** : Lint + build OK ; déployé sur Firebase Hosting (https://simracing-practice-analyzer.web.app).

## 2026-01-30 (soir)

- **Lint + prod** : Correction lint (unused vars, no-undef) ; analytics désactivée en local ; abréviations équipes DSP/RCM ; comparateur segments sur tours valides uniquement.

## 2026-02-02

- **Logo app + potentiel** : Logo dans le header (android-chrome), favicon onglet ; meilleur temps potentiel calculé sur segments des tours valides uniquement.
- **Drill Motek** : Layout compact « En construction » (3 boutons empilés), drill graphique, sample Barcelona, correction timer.

## 2026-01-31

- **Drill complet Motek** : Stories 1–5 (ExerciseSource, connecteur .ldx, UI upload, E2E) ; nouvelles favicons.

## 2026-01-30

- **Drills** : Refonte page drills (homepage, scroll, titre), drillTypes, harmonisation pédales/volant.
- **Liste globale** : Meilleur potentiel, Équipe, filtre Équipe, colonne # ; retrait colonnes Const. total / Moyenne total.

---

## Lessons learned

Après un **revert** ou un incident : ajouter ici 2 lignes (quoi, pourquoi, quoi faire différemment).

- **2025-12-09** – Revert « Plan complet drills à double pédale » : idée commitée puis annulée. À l’avenir : valider le scope avant un gros commit ou faire une branche dédiée.
