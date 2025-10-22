# Phase 2 - Setup et Architecture React

## Objectif

Créer l'architecture React de base et migrer les **premiers composants simples** sans logique métier complexe.

## Structure du Projet

```
frontend/
├── src/
│   ├── components/          # Composants React
│   │   ├── layout/         # Layout, Header, Footer
│   │   ├── theme/          # ThemeToggle
│   │   ├── filters/        # Filtres (période, piste)
│   │   ├── table/          # Tableau des pilotes
│   │   ├── modal/          # Modal pilote
│   │   └── admin/          # Dashboard admin
│   ├── hooks/              # Custom hooks
│   │   ├── useTheme.js
│   │   ├── useFirebase.js
│   │   └── useFilters.js
│   ├── services/           # Logique métier
│   │   ├── firebase.js
│   │   ├── calculations.js  # Potentiel, constance, etc.
│   │   └── timezone.js      # Parsing et formatage dates
│   ├── utils/              # Utilitaires
│   │   ├── formatters.js    # Formatage temps, dates
│   │   └── constants.js     # Constantes
│   ├── styles/             # CSS modules ou styled-components
│   ├── App.jsx             # Composant racine
│   └── main.jsx            # Point d'entrée
├── public/                 # Assets statiques
├── tests/
│   ├── unit/              # Tests unitaires (Vitest)
│   └── e2e/               # Tests Playwright (parité)
├── package.json
├── vite.config.js
└── playwright.config.js
```

## Étape 2.1 - Configuration de Base

### 2.1.1 - Installer les dépendances essentielles

```bash
cd frontend
npm install react-router-dom
npm install firebase
npm install chart.js react-chartjs-2
npm install @heroicons/react  # Pour les icônes
```

### 2.1.2 - Installer les dépendances de développement

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks
npm install -D prettier
```

### 2.1.3 - Configuration ESLint

Créer `.eslintrc.json`:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "warn",
    "no-console": "warn"
  }
}
```

### 2.1.4 - Configuration Prettier

Créer `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 2.1.5 - Configuration Vitest

Modifier `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
})
```

## Étape 2.2 - Migration des Services (Pure Logic)

**Ces fichiers ne contiennent AUCUN React, juste de la logique pure.**

### 2.2.1 - Service Timezone ⚠️ CRITIQUE

`src/services/timezone.js`:
```javascript
/**
 * ⚠️ LOGIQUE CRITIQUE - NE PAS MODIFIER SANS TESTS
 * 
 * Les dates Firestore sont en UTC.
 * On applique un offset de +3h pour aligner avec la perception locale.
 */

/**
 * Parse une date de session depuis Firestore (UTC) 
 * et applique l'offset pour la perception locale
 */
export function parseSessionDate(dateStr) {
  const [date, time] = dateStr.split(' ');
  const [year, month, day] = date.split('-');
  const [hour, minute, second] = time.split(':');
  
  const hourNum = parseInt(hour) + 3; // OFFSET CRITIQUE +3h
  
  return new Date(Date.UTC(
    parseInt(year), 
    parseInt(month) - 1, 
    parseInt(day), 
    hourNum, 
    parseInt(minute), 
    parseInt(second)
  ));
}

/**
 * Formate une date en "Il y a Xh/min/jours"
 */
export function formatUpdateDate(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
}

/**
 * Estime la fin d'une session basée sur le nombre de tours
 */
export function estimateSessionDuration(sessionCount) {
  const baseMinutes = 90;
  const additionalPerSession = 5;
  return baseMinutes + (sessionCount * additionalPerSession);
}

/**
 * Crée un tooltip détaillé pour l'indicateur "Dernière session"
 */
export function createSessionTooltip(sessionStartDate, sessionCount) {
  const durationMinutes = estimateSessionDuration(sessionCount);
  const sessionEndDate = new Date(sessionStartDate.getTime() + (durationMinutes * 60000));
  
  const formatDate = (date) => date.toLocaleString('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  return `Dernière session:\n` +
         `• Début: ${formatDate(sessionStartDate)}\n` +
         `• Durée estimée: ${durationMinutes}min\n` +
         `• Fin estimée: ${formatDate(sessionEndDate)}\n` +
         `• Nombre de sessions: ${sessionCount}`;
}
```

**Tests unitaires** (`tests/unit/timezone.test.js`):
```javascript
import { describe, it, expect } from 'vitest';
import { parseSessionDate, formatUpdateDate } from '../../src/services/timezone';

describe('Timezone Service', () => {
  it('parseSessionDate applique l\'offset de +3h', () => {
    const input = '2025-10-15 12:00:00';
    const result = parseSessionDate(input);
    
    // 12:00 UTC + 3h = 15:00 UTC
    expect(result.getUTCHours()).toBe(15);
  });
  
  it('formatUpdateDate affiche "Il y a Xh" correctement', () => {
    const twoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000));
    expect(formatUpdateDate(twoHoursAgo)).toBe('Il y a 2h');
  });
});
```

### 2.2.2 - Service Calculations

`src/services/calculations.js`:
```javascript
/**
 * Calcule le temps potentiel (somme des meilleurs segments)
 */
export function calculatePotential(segments) {
  return Object.keys(segments).reduce((sum, key) => {
    if (key.startsWith('S') && !key.includes('Best')) {
      return sum + segments[key];
    }
    return sum;
  }, 0);
}

/**
 * Calcule la constance (écart-type des temps de tours valides)
 */
export function calculateConsistency(validLaps) {
  if (!validLaps || validLaps.length < 2) return 0;
  
  const times = validLaps.map(lap => lap.totalTime);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
  
  return Math.sqrt(variance);
}

/**
 * Détermine le focus du comparateur de segments
 */
export function getSegmentComparatorFocus(selectedDriver, allDrivers) {
  const driverBest = selectedDriver.segments;
  const globalBest = findGlobalBestSegments(allDrivers);
  
  return {
    primary: driverBest,
    secondary: globalBest,
    label: 'Meilleur pilote vs Meilleur global'
  };
}

function findGlobalBestSegments(drivers) {
  const globalBest = {};
  
  drivers.forEach(driver => {
    Object.entries(driver.segments).forEach(([key, value]) => {
      if (!globalBest[key] || value < globalBest[key]) {
        globalBest[key] = value;
      }
    });
  });
  
  return globalBest;
}
```

### 2.2.3 - Service Firebase

`src/services/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBOyMeW0kxC3d9pP5VsYr2czQfBJQYdjTs",
  authDomain: "simracing-practice-analyzer.firebaseapp.com",
  projectId: "simracing-practice-analyzer",
  storageBucket: "simracing-practice-analyzer.appspot.com",
  messagingSenderId: "377068056867",
  appId: "1:377068056867:web:your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Récupère les résultats depuis Storage
 */
export async function fetchResults() {
  const storageRef = ref(storage, 'results/latest/combined_results.json');
  const url = await getDownloadURL(storageRef);
  const response = await fetch(url);
  return await response.json();
}

/**
 * Récupère les métadonnées depuis Firestore
 */
export async function fetchMetadata() {
  const docRef = doc(db, 'results', 'latest');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  }
  throw new Error('No metadata found');
}

/**
 * Login admin
 */
export async function loginAdmin(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Logout admin
 */
export async function logoutAdmin() {
  return await signOut(auth);
}
```

## Étape 2.3 - Migration des Hooks

### 2.3.1 - useTheme Hook

`src/hooks/useTheme.js`:
```javascript
import { useState, useEffect } from 'react';

const THEMES = ['auto', 'dark', 'light'];

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme-preference') || 'dark';
  });

  useEffect(() => {
    // Appliquer le thème au DOM
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme-preference', currentTheme);
  }, [currentTheme]);

  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setCurrentTheme(THEMES[nextIndex]);
  };

  return { currentTheme, cycleTheme, themes: THEMES };
}
```

### 2.3.2 - useFilters Hook

`src/hooks/useFilters.js`:
```javascript
import { useState, useMemo } from 'react';

export function useFilters(drivers) {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [groupByClass, setGroupByClass] = useState(false);

  // Extraction des pistes uniques
  const availableTracks = useMemo(() => {
    const tracks = new Set();
    drivers.forEach(driver => {
      if (driver.track) tracks.add(driver.track);
    });
    return Array.from(tracks).sort();
  }, [drivers]);

  // Application des filtres
  const filteredDrivers = useMemo(() => {
    let result = [...drivers];

    // Filtre par période
    if (periodFilter === 'day') {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      result = result.filter(d => new Date(d.lastSession) > oneDayAgo);
    } else if (periodFilter === 'week') {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      result = result.filter(d => new Date(d.lastSession) > oneWeekAgo);
    }

    // Filtre par piste
    if (trackFilter !== 'all') {
      result = result.filter(d => d.track === trackFilter);
    }

    return result;
  }, [drivers, periodFilter, trackFilter]);

  return {
    periodFilter,
    setPeriodFilter,
    trackFilter,
    setTrackFilter,
    groupByClass,
    setGroupByClass,
    availableTracks,
    filteredDrivers,
  };
}
```

### 2.3.3 - useFirebaseData Hook

`src/hooks/useFirebaseData.js`:
```javascript
import { useState, useEffect } from 'react';
import { fetchResults, fetchMetadata } from '../services/firebase';

export function useFirebaseData() {
  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [resultsData, metaData] = await Promise.all([
          fetchResults(),
          fetchMetadata()
        ]);
        
        setData(resultsData);
        setMetadata(metaData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, metadata, loading, error };
}
```

## Étape 2.4 - Premier Composant : ThemeToggle

`src/components/theme/ThemeToggle.jsx`:
```javascript
import { useTheme } from '../../hooks/useTheme';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { currentTheme, cycleTheme } = useTheme();

  const getIcon = () => {
    switch (currentTheme) {
      case 'dark': return '🌙';
      case 'light': return '☀️';
      case 'auto': return '🌓';
      default: return '🌙';
    }
  };

  return (
    <button
      id="themeToggle"
      className="theme-toggle"
      onClick={cycleTheme}
      title={`Mode: ${currentTheme}`}
    >
      {getIcon()}
    </button>
  );
}
```

## Étape 2.5 - Composant Header

`src/components/layout/Header.jsx`:
```javascript
import { ThemeToggle } from '../theme/ThemeToggle';
import { LastUpdateIndicator } from './LastUpdateIndicator';
import './Header.css';

export function Header({ metadata, onLoginClick }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>Sim Racing Practice Analyzer</h1>
        
        <div className="header-actions">
          <LastUpdateIndicator metadata={metadata} />
          <ThemeToggle />
          <button id="loginBtn" className="login-btn" onClick={onLoginClick}>
            🔐 Admin
          </button>
        </div>
      </div>
    </header>
  );
}
```

## Checklist Phase 2

### ✅ Configuration
- [ ] Installer toutes les dépendances
- [ ] Configurer ESLint + Prettier
- [ ] Configurer Vitest
- [ ] Configurer Playwright pour React

### ✅ Services (Pure Logic)
- [ ] Migrer timezone.js avec tests unitaires ⚠️
- [ ] Migrer calculations.js avec tests
- [ ] Migrer firebase.js
- [ ] Migrer formatters.js

### ✅ Hooks
- [ ] useTheme avec persistance localStorage
- [ ] useFilters avec memoization
- [ ] useFirebaseData avec loading states

### ✅ Composants de Base
- [ ] ThemeToggle (simple, pas de logique métier)
- [ ] Header avec LastUpdateIndicator
- [ ] Filters (période + piste)
- [ ] LoadingSpinner

### ✅ Tests de Parité
- [ ] Test Playwright: ThemeToggle fonctionne identique à prod
- [ ] Test Playwright: Header affiche correctement
- [ ] Test Playwright: LastUpdateIndicator calcule bien le temps

## Prochaine Étape

Une fois Phase 2 complétée, on passera à **Phase 3** pour migrer les composants complexes :
- Tableau des pilotes avec tri
- Groupement par classe
- Modal pilote avec graphique

---

**Estimation**: Phase 2 = 2-3 heures de travail
**Prêt à commencer** ! 🚀

