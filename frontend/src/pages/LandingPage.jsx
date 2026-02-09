/**
 * Page d'accueil publique (landing) – Sim League EGT
 * Style vitrine : hero visuel, features en cartes, CTA
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getManufacturerLogoUrl, getManufacturerName } from '../services/carManufacturerService';
import './LandingPage.css';

/** Lignes fictives pour le mockup (position, nom, carModel ID, classe, meilleur, moyenne) */
const LANDING_PREVIEW_ROWS = [
  { pos: 1, name: 'Jean Dupont', carModel: 7, category: 'pro', best: '1:42.350', avg: '1:42.950' },
  { pos: 2, name: 'Marie Martin', carModel: 2, category: 'pro', best: '1:42.891', avg: '1:43.210' },
  { pos: 3, name: 'Pierre Bernard', carModel: 1, category: 'silver', best: '1:43.124', avg: '1:43.580' },
  { pos: 4, name: 'Sophie Leroy', carModel: 1, category: 'silver', best: '1:43.502', avg: '1:43.920' },
  { pos: 5, name: 'Lucas Petit', carModel: 3, category: 'amateur', best: '1:44.210', avg: '1:44.650' },
  { pos: 6, name: 'Emma Dubois', carModel: 5, category: 'amateur', best: '1:44.887', avg: '1:45.120' },
];

const FEATURES = [
  {
    icon: '🏁',
    title: 'Classements par catégorie',
    text: 'Pro, Silver, Amateur — suivez les temps par classe et par piste.',
  },
  {
    icon: '📊',
    title: 'Segments & meilleur tour',
    text: 'Analyse segment par segment et visualisez votre tour potentiel.',
  },
  {
    icon: '📈',
    title: 'Graphiques de progression',
    text: 'Évolution des temps, consistance et tendances en un coup d’œil.',
  },
  {
    icon: '🎮',
    title: 'Drills pédales & volant',
    text: 'Entraînement structuré avec mapping personnalisé de ton setup.',
  },
  {
    icon: '☁️',
    title: 'Préférences synchronisées',
    text: 'Thème, mapping et pilote lié — la même config sur tous tes appareils.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/classement', { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg" aria-hidden />
        <div className="landing-hero-content">
          <img src="/android-chrome-512x512.png" alt="" className="landing-hero-logo" width="120" height="120" />
          <h1 className="landing-hero-title">Sim League EGT</h1>
          <p className="landing-hero-tagline">
            Suivez les performances de votre ligue de sim racing.
          </p>
          <p className="landing-hero-pitch">
            Classements, analyse des segments, graphiques de progression et consistance.
            <br />
            Connectez-vous pour accéder aux données de votre ligue.
          </p>
          <div className="landing-hero-cta">
            <button type="button" className="landing-cta-btn landing-cta-btn--primary" onClick={() => navigate('/login')}>
              Se connecter
            </button>
            <button type="button" className="landing-cta-btn landing-cta-btn--secondary" onClick={() => navigate('/login?mode=signup')}>
              Créer un compte
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-features-inner">
          <h2 className="landing-features-title">Tout pour piloter en ligue</h2>
          <p className="landing-features-intro">
            Une seule app pour suivre les temps, comparer les pilotes et progresser.
          </p>
          <div className="landing-features-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="landing-feature-card">
                <span className="landing-feature-icon" aria-hidden>{f.icon}</span>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-text">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Preview / mockup : faux classement avec noms fictifs */}
      <section className="landing-preview">
        <div className="landing-preview-inner">
          <h2 className="landing-preview-title">Votre ligue, vos stats</h2>
          <div className="landing-preview-mockup">
            <div className="landing-preview-mockup-bar">
              <span className="landing-preview-dot" />
              <span className="landing-preview-dot" />
              <span className="landing-preview-dot" />
            </div>
            <div className="landing-preview-mockup-content">
              <div className="landing-preview-table-wrap">
                <table className="landing-preview-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Pilote</th>
                      <th>Marque</th>
                      <th>Classe</th>
                      <th>Meilleur valide</th>
                      <th>Moyenne valide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LANDING_PREVIEW_ROWS.map((row) => (
                      <tr key={row.pos}>
                        <td>{row.pos}</td>
                        <td>{row.name}</td>
                        <td>
                          <span className="landing-manufacturer-icon" title={getManufacturerName(row.carModel)}>
                            <img
                              src={getManufacturerLogoUrl(row.carModel)}
                              alt={getManufacturerName(row.carModel)}
                              className="landing-manufacturer-logo"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (!e.target.nextElementSibling) {
                                  const fallback = document.createElement('span');
                                  fallback.className = 'landing-manufacturer-fallback';
                                  fallback.textContent = getManufacturerName(row.carModel).charAt(0);
                                  e.target.parentNode.appendChild(fallback);
                                }
                              }}
                            />
                          </span>
                        </td>
                        <td><span className={`landing-badge ${row.category}`}>{row.category === 'pro' ? 'PRO' : row.category === 'silver' ? 'SILVER' : 'AMATEUR'}</span></td>
                        <td>{row.best}</td>
                        <td>{row.avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="landing-cta-block">
        <div className="landing-cta-block-inner">
          <h2 className="landing-cta-block-title">Prêt à rejoindre ?</h2>
          <p className="landing-cta-block-text">Créez un compte ou connectez-vous pour accéder à votre ligue.</p>
          <button type="button" className="landing-cta-btn landing-cta-btn--primary landing-cta-btn--large" onClick={() => navigate('/login')}>
            Accéder à Sim League EGT
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p className="landing-footer-text">Sim League EGT — Ligues de sim racing</p>
      </footer>
    </div>
  );
}
