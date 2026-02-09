/**
 * Page Connexion / Inscription
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signUp, loginWithGoogle, error, clearError, isAuthenticated } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = searchParams.get('from') || '/classement';
  const modeSignUp = searchParams.get('mode') === 'signup';

  const [isSignUp, setIsSignUp] = useState(modeSignUp);

  useEffect(() => {
    setIsSignUp(modeSignUp);
  }, [modeSignUp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const ok = isSignUp ? await signUp(email, password) : await login(email, password);
    if (ok) navigate(from);
  };

  const handleGoogleLogin = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      const ok = await loginWithGoogle();
      if (ok) navigate(from);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (isAuthenticated) {
    navigate(from);
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>{isSignUp ? 'Créer un compte' : 'Connexion'}</h1>
        <p className="login-subtitle">
          {isSignUp
            ? 'Vos préférences (thème, mapping, pilote) seront synchronisées sur tous vos appareils.'
            : 'Accédez à votre compte et à vos préférences.'}
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="login-password">Mot de passe</label>
          <input
            id="login-password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isSignUp ? 6 : undefined}
          />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="login-submit">
            {isSignUp ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>
        <div className="login-divider">ou</div>
        <button
          type="button"
          className="login-google"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          {googleLoading ? 'Connexion…' : 'Se connecter avec Google'}
        </button>
        <button
          type="button"
          className="login-toggle-mode"
          onClick={() => {
            setIsSignUp(!isSignUp);
            clearError();
          }}
        >
          {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S\'inscrire'}
        </button>
        <button type="button" className="login-back" onClick={() => navigate(-1)}>
          Retour
        </button>
      </div>
    </div>
  );
}
