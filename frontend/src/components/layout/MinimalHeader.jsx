/**
 * Header minimal pour la landing et la page login (logo + Connexion)
 */

import { useNavigate } from 'react-router-dom';
import './Header.css';

export function MinimalHeader() {
  const navigate = useNavigate();

  return (
    <header className="app-header app-header--minimal">
      <div className="header-content">
        <div className="header-titles">
          <h1
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
            title="Accueil"
            className="header-title-with-logo"
          >
            <img src="/android-chrome-512x512.png" alt="" className="header-logo" aria-hidden />
            <span className="header-title-text">Sim League EGT</span>
          </h1>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="header-login-link"
            onClick={() => navigate('/login')}
          >
            Connexion
          </button>
        </div>
      </div>
    </header>
  );
}
