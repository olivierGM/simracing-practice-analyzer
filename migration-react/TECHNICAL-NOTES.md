# 📘 Documentation Technique - Notes de Migration

**Application :** Sim Racing Practice Analyzer  
**Version :** Vanilla JS → React + Vite  
**Date :** 2025-10-15

---

## 🗂️ Structure des Données Firebase

### Firestore Collections

#### 1. `processedData/current/sessions`
Stocke les données des sessions de pratique analysées.

**Structure d'un document de session :**
```javascript
{
  sessionId: "251010_151020_FP",  // Format: YYMMDD_HHMMSS_TYPE
  trackName: "Valencia",
  sessionDate: Timestamp,          // Firebase Timestamp
  laps: [
    {
      lapNumber: 1,
      lapTime: 89456,                // Millisecondes
      sector1: 29123,
      sector2: 30234,
      sector3: 30099,
      isValid: true,
      isWet: false,
      driverName: "Pilot Name",
      category: "Pro"                // Pro, Silver, Am
    },
    // ... plus de tours
  ]
}
```

#### 2. `processedData/current/pilots` (Sub-collections)
Les données de pilotes sont stockées sous forme de sous-collections pour éviter la limite de 1MB par document.

**Structure :**
```
processedData/
  └── current/
      ├── metadata (document)
      │   └── lastUpdate: Timestamp
      └── pilots/ (collection)
          ├── chunk_0 (document)
          │   └── pilots: [ {pilotData}, ... ]
          ├── chunk_1 (document)
          │   └── pilots: [ {pilotData}, ... ]
          └── ...
```

**Structure d'un pilote dans un chunk :**
```javascript
{
  name: "Pilot Name",
  category: "Pro",
  bestLapTime: 89456,
  averageLapTime: 90123,
  validLaps: 42,
  wetLaps: 12,
  potentialBestLap: 88999,    // Somme des 3 meilleurs segments
  gapToLeader: 1234,          // Millisecondes, 0 si leader
  consistency: 92.5,          // Pourcentage
  bestSegments: {
    sector1: 29100,
    sector2: 29850,
    sector3: 30049
  },
  lapTimes: [
    {
      lapTime: 89456,
      sector1: 29123,
      sector2: 30234,
      sector3: 30099,
      isValid: true,
      isWet: false,
      sessionDate: Timestamp,
      sessionFileName: "251010_151020_FP.json"
    },
    // ... tous les tours du pilote
  ]
}
```

#### 3. `scraperLogs/` (collection)
Logs d'exécution de l'auto-scraper EGT.

**Structure :**
```javascript
{
  runId: "2025-10-15T14:00:00Z",
  timestamp: Timestamp,
  status: "success" | "failure" | "partial",
  sessionsFound: 12,
  sessionsDownloaded: 3,
  sessionsDuplicate: 9,
  errors: [],
  duration: 45000,  // Millisecondes
  details: {
    newSessions: ["251010_151020_FP", "251010_182030_Q"],
    failedDownloads: []
  }
}
```

#### 4. `scraperStats/global` (document)
Statistiques globales du scraper.

**Structure :**
```javascript
{
  totalRuns: 245,
  totalSuccess: 230,
  totalFailures: 15,
  totalSessionsScraped: 1234,
  lastRunDate: Timestamp,
  nextScheduledRun: Timestamp,
  last7Days: [
    { date: "2025-10-15", success: 5, failures: 0 },
    { date: "2025-10-14", success: 3, failures: 1 },
    // ... 7 jours
  ]
}
```

---

## 🧮 Logique Métier Critique

### 1. Calcul de Constance (Consistency)

La constance mesure la régularité des temps d'un pilote. Elle est basée sur le **Coefficient of Variation (CV)**.

#### Formule :
```javascript
function calculateConsistency(lapTimes) {
  if (lapTimes.length < 2) return 100;

  // 1. Calculer la moyenne
  const mean = lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;

  // 2. Calculer l'écart-type
  const squaredDiffs = lapTimes.map(time => Math.pow(time - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / lapTimes.length;
  const stdDev = Math.sqrt(variance);

  // 3. Calculer le Coefficient of Variation (CV)
  const cv = (stdDev / mean) * 100;

  // 4. Inverser pour obtenir la constance (100% = parfait)
  const consistency = Math.max(0, 100 - cv);

  return Math.round(consistency * 10) / 10; // Arrondi à 1 décimale
}
```

#### Échelle de Constance (stricte) :
```javascript
function getConsistencyLevel(consistency) {
  if (consistency >= 95) return { level: 'Excellent', icon: '🟢', class: 'excellent' };
  if (consistency >= 90) return { level: 'Bon', icon: '🟡', class: 'good' };
  if (consistency >= 80) return { level: 'Moyen', icon: '🟠', class: 'medium' };
  return { level: 'Faible', icon: '🔴', class: 'poor' };
}
```

**Exemples :**
- Pilote avec temps très réguliers (89.1, 89.2, 89.3) → Constance ~99%
- Pilote avec temps variables (88.5, 90.2, 92.1) → Constance ~85%
- Pilote très irrégulier (87.0, 95.0, 89.0) → Constance ~70%

---

### 2. Calcul du Potentiel (Potential Best Lap)

Le potentiel représente le meilleur temps théorique qu'un pilote pourrait réaliser en combinant ses 3 meilleurs segments.

#### Formule :
```javascript
function calculatePotentialBestLap(allLaps) {
  const bestS1 = Math.min(...allLaps.map(lap => lap.sector1));
  const bestS2 = Math.min(...allLaps.map(lap => lap.sector2));
  const bestS3 = Math.min(...allLaps.map(lap => lap.sector3));

  return bestS1 + bestS2 + bestS3;
}
```

**Note importante :** Tous les tours sont considérés (valides ET invalides) car un segment rapide peut être réalisé même sur un tour invalide.

**Exemple :**
- Meilleur S1 : 29.100s (tour 15)
- Meilleur S2 : 29.850s (tour 8)
- Meilleur S3 : 30.049s (tour 23)
- **Potentiel = 1:28.999**

---

### 3. Calcul du Gap au Leader

Le gap représente l'écart de temps entre le meilleur tour d'un pilote et le meilleur tour absolu.

#### Formule :
```javascript
function calculateGapToLeader(pilotBestTime, leaderBestTime) {
  if (pilotBestTime === leaderBestTime) {
    return { isLeader: true, gap: 0 };
  }

  const gapMs = pilotBestTime - leaderBestTime;
  return { isLeader: false, gap: gapMs };
}
```

**Format d'affichage :**
```javascript
function formatGap(gap, isLeader) {
  if (isLeader) return 'Leader';
  
  const seconds = (gap / 1000).toFixed(3);
  return `+${seconds}`;
}
```

**Exemple :**
- Leader : 1:28.456
- Pilote A : 1:29.234 → Gap : +0.778
- Pilote B : 1:28.456 → Gap : Leader

---

### 4. Timezone et Parsing des Dates

Les noms de fichiers JSON contiennent la date/heure de la session au format `YYMMDD_HHMMSS_TYPE.json`.

#### Problématique :
- Les heures dans les noms de fichiers sont en **UTC** (serveur)
- Les sessions réelles se déroulent en **EAST** (approximativement UTC+3h)
- L'indicateur "Dernière session" doit afficher le temps depuis la session réelle

#### Solution : Offset de +3h

```javascript
function parseSessionDate(filename) {
  // Exemple: "251010_151020_FP.json"
  const match = filename.match(/(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  
  if (!match) return null;

  const [_, year, month, day, hour, minute, second] = match;
  
  // Créer la date en UTC
  const utcDate = new Date(Date.UTC(
    2000 + parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  ));

  // Ajouter +3h pour obtenir l'heure locale de la session
  const localDate = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));

  return localDate;
}
```

#### Calcul de la durée écoulée :

```javascript
function formatUpdateDate(sessionDate) {
  const now = new Date();
  const diffMs = now.getTime() - sessionDate.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'Il y a 1 jour';
  } else {
    return `Il y a ${diffDays} jours`;
  }
}
```

**Exemple :**
- Fichier : `251010_151020_FP.json`
- Heure UTC serveur : 15:10:20
- Heure locale session (UTC+3h) : 18:10:20
- Heure actuelle : 20:30:00
- **Affichage : "Il y a 2h"**

---

### 5. Meilleurs Temps Cumulatifs (Graphique)

La ligne "Meilleurs temps" dans le graphique de progression affiche une évolution **cumulative** : le meilleur temps reste constant jusqu'à ce qu'un nouveau record soit battu.

#### Logique :

```javascript
function calculateCumulativeBestTimes(laps) {
  const cumulativeBest = [];
  let currentBest = Infinity;

  // Trier les tours par date
  const sortedLaps = [...laps].sort((a, b) => a.sessionDate - b.sessionDate);

  for (const lap of sortedLaps) {
    // Mettre à jour le meilleur si ce tour est plus rapide
    if (lap.isValid && lap.lapTime < currentBest) {
      currentBest = lap.lapTime;
    }

    cumulativeBest.push({
      date: lap.sessionDate,
      time: currentBest === Infinity ? null : currentBest
    });
  }

  return cumulativeBest;
}
```

**Exemple de courbe :**
```
Temps (s)
  91 ┤         
  90 ┤  ●──────────
  89 ┤         ●────────●────
  88 ┤                    ●───
     └────────────────────────> Date
     Session 1, 2, 3, 4, 5, 6
```

**Note :** Pas de points sur cette ligne (seulement la courbe).

---

### 6. Tri Multi-Colonnes

Le tri doit gérer correctement les différents types de données et les valeurs manquantes.

#### Implémentation :

```javascript
function sortTable(column, direction) {
  const rows = [...document.querySelectorAll('.driver-row')];

  rows.sort((a, b) => {
    const aValue = a.getAttribute(`data-${column}`);
    const bValue = b.getAttribute(`data-${column}`);

    // Gérer les valeurs nulles/undefined
    if (aValue === null || aValue === 'null') {
      return direction === 'asc' ? 1 : -1;
    }
    if (bValue === null || bValue === 'null') {
      return direction === 'asc' ? -1 : 1;
    }

    // Tri numérique (temps, pourcentages, nombres)
    if (column.includes('time') || column.includes('consistency') || column.includes('laps')) {
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // Tri alphabétique
    const comparison = aValue.localeCompare(bValue, 'fr');
    return direction === 'asc' ? comparison : -comparison;
  });

  // Réinsérer les lignes triées dans le DOM
  const tbody = document.querySelector('.driver-table tbody');
  rows.forEach(row => tbody.appendChild(row));
}
```

**Règles de tri :**
- `null`/`undefined` : toujours en fin de liste (tri croissant)
- Temps : tri numérique en millisecondes
- Pourcentages : tri numérique
- Noms : tri alphabétique avec locale française
- Ordre par défaut : croissant au premier clic, décroissant au second

---

### 7. Filtres Combinés

Les filtres de période et de piste peuvent être combinés. Voici la logique de filtrage :

```javascript
function applyFilters(pilots, periodFilter, trackFilter) {
  return pilots.filter(pilot => {
    // Filtre de période
    let periodMatch = true;
    if (periodFilter !== 'all') {
      const now = Date.now();
      const hasRecentLap = pilot.lapTimes.some(lap => {
        const lapDate = lap.sessionDate.toMillis();
        const ageMs = now - lapDate;

        if (periodFilter === 'week') {
          return ageMs <= 7 * 24 * 60 * 60 * 1000;
        } else if (periodFilter === 'day') {
          return ageMs <= 24 * 60 * 60 * 1000;
        }
        return true;
      });

      periodMatch = hasRecentLap;
    }

    // Filtre de piste
    let trackMatch = true;
    if (trackFilter !== 'all') {
      trackMatch = pilot.lapTimes.some(lap => lap.trackName === trackFilter);
    }

    return periodMatch && trackMatch;
  });
}
```

**Après filtrage :** Toutes les stats (meilleur temps, moyenne, constance) doivent être **recalculées** uniquement avec les tours filtrés.

---

## 🎨 CSS & Styling

### Variables CSS pour Thèmes

Les thèmes sont gérés via des CSS Custom Properties (variables CSS).

#### Thème Light (`:root`)
```css
:root {
  --background-primary: #ffffff;
  --background-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --accent-color: #8b5cf6;
  --border-color: #e0e0e0;
  --hover-bg: #f0f0f0;
  --modal-bg: #ffffff;
  --table-header-bg: #8b5cf6;
  --table-header-text: #ffffff;
  --badge-pro: #ef4444;
  --badge-silver: #9ca3af;
  --badge-am: #3b82f6;
}
```

#### Thème Dark (`[data-theme="dark"]`)
```css
[data-theme="dark"] {
  --background-primary: #1a1a1a;
  --background-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --accent-color: #a78bfa;
  --border-color: #404040;
  --hover-bg: #3a3a3a;
  --modal-bg: #2d2d2d;
  --table-header-bg: #8b5cf6;
  --table-header-text: #ffffff;
  /* Badges identiques */
}
```

### Media Queries Importantes

#### Mobile First
```css
/* Base : Mobile (< 480px) */
.driver-table th:nth-child(4),
.driver-table th:nth-child(6),
.driver-table th:nth-child(7),
.driver-table th:nth-child(8),
.driver-table th:nth-child(9),
.driver-table th:nth-child(10),
.driver-table th:nth-child(11) {
  display: none;
}

/* Tablet (481px - 768px) */
@media (min-width: 481px) {
  .driver-table th:nth-child(4),
  .driver-table th:nth-child(5) {
    display: table-cell;
  }
}

/* Desktop (> 768px) */
@media (min-width: 769px) {
  .driver-table th {
    display: table-cell;
  }
}
```

#### Modal Responsive
```css
/* Mobile : sections empilées */
.pilot-bottom-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Desktop : sections côte-à-côte */
@media (min-width: 769px) {
  .pilot-bottom-container {
    flex-direction: row;
  }

  .progression-section {
    flex: 1 1 60%;
  }

  .laps-section {
    flex: 0 1 40%;
    min-width: 525px;
  }
}
```

### Classes Utilitaires

#### Badges de Classe
```css
.class-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.class-badge.pro {
  background-color: var(--badge-pro);
  color: white;
}

.class-badge.silver {
  background-color: var(--badge-silver);
  color: white;
}

.class-badge.am {
  background-color: var(--badge-am);
  color: white;
}
```

#### Highlighting
```css
.best-time {
  color: #ef4444;
  font-weight: 600;
}

.driver-row:hover {
  background-color: var(--hover-bg);
  cursor: pointer;
}
```

---

## 🔧 Intégrations Externes

### Chart.js Configuration Spécifique

#### Graphique de Progression (Modal Pilote)

```javascript
const chartConfig = {
  type: 'line',
  data: {
    labels: dates, // Dates des sessions
    datasets: [
      {
        label: 'Meilleurs temps',
        data: cumulativeBestTimes,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        pointRadius: 0, // Pas de points
        borderWidth: 2,
        tension: 0.1
      },
      {
        label: 'Temps globaux',
        data: allTimes,
        borderColor: '#3b82f6',
        pointRadius: 3,
        borderWidth: 2
      },
      {
        label: 'Temps dry',
        data: dryTimes,
        borderColor: '#10b981',
        pointRadius: 3,
        borderWidth: 2
      },
      {
        label: 'Temps wet',
        data: wetTimes,
        borderColor: '#f59e0b',
        pointRadius: 3,
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'var(--text-primary)',
          usePointStyle: true
        }
      },
      tooltip: {
        // Tooltip dynamique
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].label);
            return date.toLocaleString('fr-FR');
          },
          label: (context) => {
            const label = context.dataset.label;
            const value = formatTime(context.parsed.y);
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-primary)',
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          color: 'var(--border-color)'
        }
      },
      y: {
        ticks: {
          color: 'var(--text-primary)',
          callback: (value) => formatTime(value)
        },
        grid: {
          color: 'var(--border-color)'
        }
      }
    }
  }
};
```

#### Graphique Admin Dashboard

```javascript
const adminChartConfig = {
  type: 'bar',
  data: {
    labels: last7Days.map(d => d.date),
    datasets: [
      {
        label: 'Succès',
        data: last7Days.map(d => d.success),
        backgroundColor: '#10b981'
      },
      {
        label: 'Échecs',
        data: last7Days.map(d => d.failures),
        backgroundColor: '#ef4444'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-primary)'
        }
      }
    },
    scales: {
      x: {
        stacked: false,
        ticks: { color: 'var(--text-primary)' }
      },
      y: {
        beginAtZero: true,
        ticks: { 
          color: 'var(--text-primary)',
          stepSize: 1
        }
      }
    }
  }
};
```

---

## 🔐 Sécurité et Authentification

### Firebase Authentication

```javascript
// Vérification admin
async function checkAdminStatus(user) {
  if (!user) return false;

  // Vérifier dans Firestore si l'email est dans la whitelist
  const adminDoc = await db.collection('admins').doc(user.email).get();
  return adminDoc.exists;
}

// Login
async function loginAsAdmin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const result = await firebase.auth().signInWithPopup(provider);
  
  const isAdmin = await checkAdminStatus(result.user);
  if (isAdmin) {
    window.isAdmin = true;
    showAdminPanel();
  } else {
    alert('Accès refusé');
    firebase.auth().signOut();
  }
}
```

---

## 📝 Notes Importantes pour la Migration React

### Points d'Attention

1. **État Global :**
   - Utiliser Context API ou Redux pour `isAdmin`, `theme`, `filters`
   - Éviter prop drilling

2. **Chargement des Données :**
   - Implémenter loading states pour chaque requête Firestore
   - Gérer les erreurs réseau

3. **Performance :**
   - Mémoriser les calculs lourds (constance, potentiel) avec `useMemo`
   - Virtualiser la liste des tours si > 100 tours

4. **Routing :**
   - `/` → Home (liste globale)
   - `/pilot/:id` → Fiche pilote
   - `/admin` → Panneau admin (protégé)

5. **Tests :**
   - Réutiliser les tests Playwright de référence
   - Comparer screenshots pixel par pixel

---

**Document créé le :** 2025-10-15  
**Dernière mise à jour :** 2025-10-15  
**Statut :** ✅ Documentation technique complète

