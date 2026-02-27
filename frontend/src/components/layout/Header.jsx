/**
 * Composant Header
 *
 * Header principal : titre, dernière session, thème, outils, auth (Connexion / Mon compte), admin.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../theme/ThemeToggle';
import { LastUpdateIndicator } from './LastUpdateIndicator';
import { EGTPracticeServer } from './EGTPracticeServer';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';
import { useTheme } from '../../hooks/useTheme';
import './Header.css';

const THEME_ICONS = { auto: '🖥️', dark: '🌙', light: '☀️' };

const HEADER_NAV = [
  { label: 'Temps', path: '/classement' },
  { label: 'Calendrier', path: '/calendrier' },
  // Classement (résultats) masqué tant que la page n'est pas développée
  // { label: 'Classement', path: '/resultats' },
];

const ACCOUNT_TOOLS = [
  { label: "Mesure d'angles de Rig", path: '/angle-measurement', icon: '📐' },
  { label: 'Drills Pédales & Volant', path: '/pedal-wheel-drills', icon: '🎮' },
  { label: 'Calendrier', path: '/calendrier', icon: '📅' },
];

export function Header({ metadata, trackName, isDrillsPage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isAdmin } = useUserRole();
  const { currentTheme, cycleTheme } = useTheme();
  const [accountOpen, setAccountOpen] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const accountRef = useRef(null);
  const toolsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
        setToolsExpanded(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    if (accountOpen || toolsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountOpen, toolsOpen]);

  const handleAdminClick = () => navigate('/admin');

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    setToolsExpanded(false);
    navigate('/');
  };

  const handleLogoClick = () => navigate(isAuthenticated ? '/classement' : '/');

  return (
    <header className="app-header">
      <div className="header-content header-content--single-row">
        <div className="header-left">
          <h1
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
            title={isAuthenticated ? 'Classement' : 'Accueil'}
            className="header-title-with-logo"
          >
            <img src="/android-chrome-512x512.png" alt="" className="header-logo" aria-hidden />
            <span className="header-title-text">Sim League EGT{isDrillsPage ? ' – Training Drills' : ''}</span>
          </h1>
        </div>

        {!isDrillsPage && isAuthenticated && (
          <nav className="header-nav header-nav--center" aria-label="Navigation principale">
            {HEADER_NAV.map(({ label, path }) => {
              const isActive = location.pathname === path || (path === '/classement' && location.pathname === '/');
              return (
                <button
                  key={path}
                  type="button"
                  className={`header-nav-item ${isActive ? 'header-nav-item--active' : ''}`}
                  onClick={() => navigate(path)}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        )}

        <div className="header-actions">
          {/* Dernière session + 0/64 : visibles en desktop uniquement */}
          {!isDrillsPage && (
            <div className="header-session-info">
              <LastUpdateIndicator metadata={metadata} />
              <EGTPracticeServer trackName={trackName} />
            </div>
          )}
          {!isAuthenticated && <ThemeToggle />}
          {isAuthenticated ? (
            <>
              {/* Outils en bouton standalone à gauche du compte (desktop uniquement) */}
              <div className="header-tools-standalone" ref={toolsRef}>
                <button
                  type="button"
                  className="header-tools-trigger"
                  onClick={() => setToolsOpen((o) => !o)}
                  aria-expanded={toolsOpen}
                  aria-haspopup="true"
                >
                  🔧 Outils
                </button>
                {toolsOpen && (
                  <div className="header-tools-dropdown">
                    {ACCOUNT_TOOLS.map(({ label, path, icon }) => (
                      <button
                        key={path}
                        type="button"
                        className="header-tools-dropdown-item"
                        onClick={() => { setToolsOpen(false); navigate(path); }}
                      >
                        <span aria-hidden>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="header-account" ref={accountRef}>
              <button
                type="button"
                className="header-account-trigger"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                aria-haspopup="true"
                title={user?.email || 'Mon compte'}
              >
                <span className="header-account-avatar" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855"/></svg>
                </span>
                <span className="header-account-label">{user?.email?.split('@')[0] || 'Compte'}</span>
              </button>
              {accountOpen && (
                <div className="header-account-dropdown">
                  <button type="button" onClick={() => { setAccountOpen(false); setToolsExpanded(false); navigate('/account'); }}>
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
                  {/* Outils dans le menu compte : visible en mobile uniquement */}
                  <button
                    type="button"
                    className="header-account-tools-toggle"
                    onClick={() => setToolsExpanded((e) => !e)}
                    aria-expanded={toolsExpanded}
                  >
                    <span>🔧 Outils</span>
                    <span className="header-account-theme-icon" aria-hidden>{toolsExpanded ? '▾' : '▸'}</span>
                  </button>
                  {toolsExpanded && (
                    <div className="header-account-tools-sub">
                      {ACCOUNT_TOOLS.map(({ label, path, icon }) => (
                        <button
                          key={path}
                          type="button"
                          className="header-account-tools-sub-item"
                          onClick={() => { setAccountOpen(false); setToolsExpanded(false); navigate(path); }}
                        >
                          <span aria-hidden>{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => { setAccountOpen(false); setToolsExpanded(false); handleAdminClick(); }}
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
            </>
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

