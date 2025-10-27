/**
 * Composant Header
 * 
 * Header principal de l'application avec :
 * - Titre
 * - Indicateur dernière session
 * - Toggle thème
 * - Bouton login admin
 */

import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../theme/ThemeToggle';
import { LastUpdateIndicator } from './LastUpdateIndicator';
import './Header.css';

export function Header({ metadata }) {
  const navigate = useNavigate();
  
  const handleAdminClick = () => {
    navigate('/admin');
  };

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
            onClick={handleAdminClick}
            aria-label="Connexion admin"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}

