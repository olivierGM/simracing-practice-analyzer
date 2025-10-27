/**
 * Hook pour gérer le thème de l'application
 * 
 * Supporte 3 modes : auto, dark, light
 * Persistance dans localStorage
 */

import { useState, useEffect } from 'react';

const THEMES = ['auto', 'dark', 'light'];

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Charger le thème depuis localStorage au montage
    const saved = localStorage.getItem('theme-preference');
    return saved || 'auto'; // Auto par défaut (comme prod)
  });

  useEffect(() => {
    // Appliquer le thème au DOM
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme-preference', currentTheme);
  }, [currentTheme]);

  /**
   * Passe au thème suivant (auto → dark → light → auto)
   */
  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setCurrentTheme(THEMES[nextIndex]);
  };

  /**
   * Définit un thème spécifique
   */
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

