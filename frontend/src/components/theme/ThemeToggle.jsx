/**
 * Composant ThemeToggle
 * 
 * Toggle pour changer de thème (auto/dark/light)
 * Cycle à travers les 3 thèmes
 */

import { useTheme } from '../../hooks/useTheme';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { currentTheme, cycleTheme } = useTheme();

  /**
   * Retourne l'icône selon le thème actif
   */
  const getIcon = () => {
    switch (currentTheme) {
      case 'dark':
        return '🌙';
      case 'light':
        return '☀️';
      case 'auto':
        return '🌓';
      default:
        return '🌙';
    }
  };

  /**
   * Retourne le label pour le tooltip
   */
  const getLabel = () => {
    switch (currentTheme) {
      case 'dark':
        return 'Mode sombre';
      case 'light':
        return 'Mode clair';
      case 'auto':
        return 'Mode automatique';
      default:
        return 'Thème';
    }
  };

  return (
    <button
      id="themeToggle"
      className="theme-toggle"
      onClick={cycleTheme}
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  );
}

