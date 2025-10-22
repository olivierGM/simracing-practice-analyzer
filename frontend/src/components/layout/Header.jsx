/**
 * Composant Header
 * 
 * Header principal de l'application avec :
 * - Titre
 * - Indicateur dernière session
 * - Toggle thème
 * - Bouton login admin
 */

import { ThemeToggle } from '../theme/ThemeToggle';
import { LastUpdateIndicator } from './LastUpdateIndicator';
import './Header.css';

export function Header({ metadata, onLoginClick }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Sim Racing Practice Analyzer</h1>
        
        <div className="header-actions">
          <LastUpdateIndicator metadata={metadata} />
          <ThemeToggle />
          <button
            id="loginBtn"
            className="login-btn"
            onClick={onLoginClick}
            aria-label="Connexion admin"
          >
            🔐 Admin
          </button>
        </div>
      </div>
    </header>
  );
}

