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
   * Retourne l'icône selon le thème actif (COPIE prod)
   */
  const getIcon = () => {
    switch (currentTheme) {
      case 'dark':
        return '🌙';
      case 'light':
        return '☀️';
      case 'auto':
        return '🖥️'; // Prod utilise 🖥️ pour auto
      default:
        return '🖥️';
    }
  };

  /**
   * Retourne le label pour le tooltip (COPIE prod format)
   */
  const getLabel = () => {
    switch (currentTheme) {
      case 'dark':
        return 'Actuellement: Mode sombre • Cliquer pour: Suivre le système';
      case 'light':
        return 'Actuellement: Mode clair • Cliquer pour: Mode sombre';
      case 'auto':
        return 'Actuellement: Suit le système • Cliquer pour: Mode clair';
      default:
        return 'Basculer le thème';
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

