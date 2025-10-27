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
        <div className="header-titles">
          <h1>🏁 Analyseur de Temps - Sim Racing</h1>
          <p>Analysez les performances par classe et pilote</p>
        </div>
        
        <div className="header-actions">
          <LastUpdateIndicator metadata={metadata} />
          <ThemeToggle />
          <button
            id="loginBtn"
            className="login-btn"
            onClick={onLoginClick}
            aria-label="Connexion admin"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}

