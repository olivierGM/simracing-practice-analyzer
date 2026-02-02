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
import { EGTPracticeServer } from './EGTPracticeServer';
import { ToolsMenu } from './ToolsMenu';
import './Header.css';

export function Header({ metadata, trackName, isDrillsPage }) {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-titles">
          <h1
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
            title="Retour à l'accueil"
            className="header-title-with-logo"
          >
            <img src="/android-chrome-512x512.png" alt="" className="header-logo" aria-hidden />
            Analyseur de Temps EGT{isDrillsPage ? ' - Training Drills' : ''}
          </h1>
          {!isDrillsPage && <p>Analysez les performances par classe et pilote</p>}
        </div>
        
        <div className="header-actions">
          <EGTPracticeServer trackName={trackName} />
          <LastUpdateIndicator metadata={metadata} />
          <ToolsMenu navigate={navigate} />
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

