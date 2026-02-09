/**
 * Hook pour gérer le thème de l'application
 *
 * Supporte 3 modes : auto, dark, light
 * Persistance : localStorage + Firestore quand l'utilisateur est connecté (sync multi-appareils)
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/firebase';

const THEMES = ['auto', 'dark', 'light'];

export function useTheme() {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme-preference');
    return saved || 'dark';
  });
  const syncedFromFirestore = useRef(false);
  const lastThemeWrittenToFirestore = useRef(null);
  const initialSyncDone = useRef(false);

  // Appliquer au DOM + localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme-preference', currentTheme);
  }, [currentTheme]);

  // Au login : charger le thème depuis Firestore ; au logout : réinitialiser
  useEffect(() => {
    if (!user?.uid) {
      syncedFromFirestore.current = false;
      lastThemeWrittenToFirestore.current = null;
      initialSyncDone.current = false;
      return;
    }
    if (syncedFromFirestore.current) return;
    let cancelled = false;
    getUserProfile(user.uid).then((profile) => {
      if (cancelled) return;
      initialSyncDone.current = true;
      if (profile?.theme) {
        syncedFromFirestore.current = true;
        lastThemeWrittenToFirestore.current = profile.theme;
        setCurrentTheme(profile.theme);
      } else {
        lastThemeWrittenToFirestore.current = currentTheme;
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- currentTheme intentionally omitted to avoid overwriting Firestore on first sync
  }, [user?.uid]);

  // Après chargement profil : quand l'utilisateur change le thème, mettre à jour Firestore
  useEffect(() => {
    if (!user?.uid || !initialSyncDone.current || lastThemeWrittenToFirestore.current === currentTheme) return;
    lastThemeWrittenToFirestore.current = currentTheme;
    updateUserProfile(user.uid, { theme: currentTheme }).catch((err) => {
      console.warn('Theme sync to Firestore failed:', err);
    });
  }, [user?.uid, currentTheme]);

  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setCurrentTheme(THEMES[nextIndex]);
  };

  const setTheme = (theme) => {
    if (THEMES.includes(theme)) {
      setCurrentTheme(theme);
    }
  };

  return {
    currentTheme,
    cycleTheme,
    setTheme,
    themes: THEMES
  };
}

