/**
 * Composant Header
 *
 * Header principal : titre, dernière session, thème, outils, auth (Connexion / Mon compte), admin.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../theme/ThemeToggle';
import { LastUpdateIndicator } from './LastUpdateIndicator';
import { EGTPracticeServer } from './EGTPracticeServer';
import { ToolsMenu } from './ToolsMenu';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';
import { useTheme } from '../../hooks/useTheme';
import './Header.css';

const THEME_ICONS = { auto: '🖥️', dark: '🌙', light: '☀️' };

export function Header({ metadata, trackName, isDrillsPage }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isAdmin } = useUserRole();
  const { currentTheme, cycleTheme } = useTheme();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    if (accountOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountOpen]);

  const handleAdminClick = () => navigate('/admin');

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    navigate('/');
  };

  const handleLogoClick = () => navigate(isAuthenticated ? '/classement' : '/');

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-titles">
          <h1
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
            title={isAuthenticated ? 'Classement' : 'Accueil'}
            className="header-title-with-logo"
          >
            <img src="/android-chrome-512x512.png" alt="" className="header-logo" aria-hidden />
            Sim League EGT{isDrillsPage ? ' – Training Drills' : ''}
          </h1>
          {!isDrillsPage && <p>Analysez les performances par classe et pilote</p>}
        </div>

        <div className="header-actions">
          <EGTPracticeServer trackName={trackName} />
          <LastUpdateIndicator metadata={metadata} />
          <ToolsMenu navigate={navigate} />
          {!isAuthenticated && <ThemeToggle />}
          {isAuthenticated ? (
            <div className="header-account" ref={accountRef}>
              <button
                type="button"
                className="header-account-trigger"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                aria-haspopup="true"
              >
                {user?.email?.split('@')[0] || 'Compte'}
              </button>
              {accountOpen && (
                <div className="header-account-dropdown">
                  <button type="button" onClick={() => { setAccountOpen(false); navigate('/account'); }}>
                    Mon compte
                  </button>
                  <button
                    type="button"
                    className="header-account-theme"
                    onClick={() => cycleTheme()}
                    title={`Thème : ${currentTheme} • Cliquer pour changer`}
                  >
                    <span>Thème</span>
                    <span className="header-account-theme-icon" aria-hidden>{THEME_ICONS[currentTheme] ?? '🖥️'}</span>
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => { setAccountOpen(false); handleAdminClick(); }}
                      aria-label="Administration"
                    >
                      Admin
                    </button>
                  )}
                  <button type="button" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="header-login-link"
              onClick={() => navigate('/login')}
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

