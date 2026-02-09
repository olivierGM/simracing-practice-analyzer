# Plan : Home page publique et routes protégées

## Nom de l’app

- **Sim League** (deux mots, séparés). Pas d’emphase sur le branding pour l’instant ; on met ce nom de l’avant à la place de « Analyseur de Temps EGT ».

## Objectif

- **Home page publique** : une vraie page d’accueil qui présente l’app (suivre votre ligue de sim racing) et incite à se connecter.
- **Connexion obligatoire** pour accéder au reste de l’app (classement, fiches pilotes, drills, etc.).

---

## 1. Nouvelle home page (landing) à `/`

- **URL** : `/` (publique, pas de login requis).
- **Contenu proposé** :
  - **Hero** : titre **« Sim League »** + sous-titre (ex. « Suivez les performances de votre ligue de sim racing »).
  - **Pitch** : 2–3 phrases sur l’app (classements, analyse par pilote et par piste, progression, consistance, etc.).
  - **Fonctionnalités** (liste ou blocs courts) : ex. classements par classe, segments, graphiques de progression, drills pédales/volant, thème et préférences synchronisées.
  - **CTA** : boutons « Se connecter » et « Créer un compte » (ou « S’inscrire ») → lien vers `/login`.
- **Header** : version allégée (logo + lien « Connexion »), sans données live ni outils.
- **Pas de chargement Firestore** sur cette page (pas besoin des sessions pour afficher le contenu statique).

---

## 2. Déplacer la page « liste des pilotes » vers `/classement`

- **Actuellement** : le contenu de `HomePage` (liste des pilotes, filtres, tableau) est à `/`.
- **Après** :
  - Ce contenu reste dans un composant (ex. `ClassementPage` ou renommage de `HomePage`) mais est servi à la route **`/classement`**.
  - `/classement` devient la page principale de l’app une fois connecté (tableau de bord / classement).

Tous les liens internes qui pointent vers « la liste » (retour liste, menu, etc.) devront cibler **`/classement`** au lieu de `/`.

---

## 3. Routes protégées (obligation de se connecter)

- **Public** (sans auth) :
  - `/` — nouvelle home (landing).
  - `/login` — connexion / inscription.
- **Protégées** (rediriger vers `/login?from=<url>` si non connecté) :
  - `/classement` — liste des pilotes (ex-HomePage).
  - `/circuit/:circuitId/pilote/:pilotId` — fiche pilote.
  - `/account` — mon compte.
  - `/pedal-wheel-drills` — drills pédales & volant.
  - `/angle-measurement` — mesure d’angles.
  - `/gamepad-debug` — debug gamepad.
- **Admin** : `/admin` reste avec son propre flux d’auth (mot de passe local ou Firebase admin), on ne change pas la logique actuelle.

Implémentation typique : un composant **`ProtectedRoute`** (ou wrapper) qui utilise `useAuth()`. Si `!isAuthenticated`, faire `<Navigate to={`/login?from=${location.pathname}`} replace />`, sinon rendre l’enfant (la page). Envelopper chaque route protégée avec ce composant.

---

## 4. Redirections et navigation

- **Après login réussi** : rediriger vers le paramètre `from` (ex. `from=/classement`) s’il est présent, sinon vers **`/classement`** (plus vers `/`).
- **Liens à mettre à jour** (exemples) :
  - Header : clic sur le logo → aller à `/` (landing) ou, si connecté, à `/classement` (au choix ; une option simple : logo → `/` pour tout le monde).
  - « Retour à l’accueil » / « Retour à la liste » dans l’app (PilotePage, AccountPage, AdminPage, etc.) → **`/classement`**.
  - Menu outils, liens internes qui pointaient vers la liste → **`/classement`**.
- **Page 404** : pas de changement nécessaire ; reste accessible sans auth si on veut.

---

## 5. Header selon le contexte

- **Sur `/` (landing)** : header minimal (logo + « Connexion »). Pas de LastUpdateIndicator, pas de ToolsMenu, pas de thème (ou thème basique si déjà chargé).
- **Sur les routes protégées** : header actuel (logo, indicateur dernière session, outils, thème, compte/admin).
- **Sur `/login`** : soit le même header minimal que la home, soit pas de header (page centrée). À trancher (recommandation : même header minimal que `/` pour cohérence).

---

## 6. Résumé des changements techniques

| Élément | Action |
|--------|--------|
| **Nouvelle page** | Créer `LandingPage.jsx` (ou `HomeLanding.jsx`) pour `/` avec hero, pitch, features, CTA vers `/login`. |
| **Route liste** | Déplacer le contenu actuel de `HomePage` vers la route `/classement` (même composant renommé en `ClassementPage` ou garder `HomePage` et l’utiliser uniquement sur `/classement`). |
| **Protection** | Composant `ProtectedRoute` qui vérifie `useAuth().isAuthenticated` et redirige vers `/login?from=...` si non connecté. Envelopper les routes listées au §3. |
| **App.jsx** | Route `/` → landing ; route `/classement` → page classement (avec `ProtectedRoute`). Toutes les autres routes app (fiche pilote, account, drills, etc.) enveloppées dans `ProtectedRoute`. |
| **Header** | Prendre en compte `location.pathname` (ou une prop) : si `pathname === '/'`, afficher la version minimal ; sinon afficher le header complet. |
| **Liens** | Remplacer les `navigate('/')` et liens « liste » par `navigate('/classement')` dans PilotePage, AccountPage, AdminPage, Header (pour le lien « retour liste » / accès classement). |
| **Login** | Après succès, redirection vers `searchParams.get('from')` ou `/classement` par défaut. |

---

## 7. Ordre d’implémentation suggéré

1. Créer le composant **`ProtectedRoute`** et l’intégrer autour d’une seule route (ex. `/classement`) pour valider le flux.
2. Créer la **landing** à `/` et déplacer la liste vers **`/classement`** (routes + contenu).
3. Envelopper **toutes** les routes protégées avec `ProtectedRoute`.
4. Adapter le **Header** (minimal vs complet) selon la route.
5. Mettre à jour **tous les liens** (retour liste, logo, etc.) vers `/classement` où il faut.
6. Ajuster la **redirection après login** (`from` ou `/classement`).
7. Vérifier **Admin** et **404** (comportement inchangé ou voulu).

---

## 8. Contenu texte suggéré pour la landing (à adapter)

- **Titre** : « Sim League » (nom de l’app, pas d’emphase branding pour l’instant).
- **Sous-titre** : « Suivez les performances de votre ligue de sim racing. »
- **Pitch** : « Classements par pilote et par piste, analyse des segments, graphiques de progression et consistance. Connectez-vous pour accéder aux données de votre ligue. »
- **Features** (ex.) : Classements par catégorie • Segments et meilleur tour potentiel • Graphiques de progression • Drills pédales & volant • Préférences synchronisées.

Tu peux ajouter une section « En savoir plus » si tu veux personnaliser.
