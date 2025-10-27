/**
 * Composant Header
 * 
 * Header principal de l'application avec :
 * - Titre
 * - Indicateur dernière session
 * - Toggle thème
 * - Bouton login admin
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../theme/ThemeToggle';
import { LastUpdateIndicator } from './LastUpdateIndicator';
import { ACCServersBanner } from './ACCServersBanner';
import { useFilters } from '../../hooks/useFilters';
import './Header.css';

export function Header({ metadata, drivers = [], sessions = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer le circuit sélectionné depuis l'URL ou les filtres
  const { trackFilter } = useFilters(drivers, sessions);
  
  const handleAdminClick = () => {
    navigate('/admin');
  };

  // Afficher le bandeau seulement sur la page d'accueil
  const isHomePage = location.pathname === '/';

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
      
      {/* Bandeau des serveurs ACC (uniquement sur la page d'accueil) */}
      {isHomePage && <ACCServersBanner trackName={trackFilter} />}
    </header>
  );
}

