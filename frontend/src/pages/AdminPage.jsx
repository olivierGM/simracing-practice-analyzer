/**
 * Page AdminPage - EGT Auto Scraper Dashboard
 * 
 * Panel d'administration complet pour le scraping EGT automatique
 * COPIE du système prod: src/components/admin-dashboard/admin-dashboard-integration.js (lignes 1-530)
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const ADMIN_PASSWORD = 'admin123'; // TODO: Remplacer par variable d'environnement

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Chargement...');
  const navigate = useNavigate();
  const chartRef = useRef(null);

  // Authentification
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setStatus('');
    } else {
      setStatus('❌ Mot de passe incorrect');
    }
    setPassword('');
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword('');
    setLogs([]);
    setStatus('');
    navigate('/');
  };

  // Charger les logs de scraping
  const loadScrapingLogs = async () => {
    try {
      console.log('📋 Chargement des logs de scraping...');
      setLoading(true);
      
      const response = await fetch('https://us-central1-simracing-practice-analyzer.cloudfunctions.net/getScrapingLogs?limit=10');
      const result = await response.json();
      
      if (result.success) {
        setLogs(result.logs || []);
        setStatus('');
      } else {
        console.error('❌ Erreur lors du chargement des logs:', result.error);
        setLogs([]);
        setStatus('❌ Erreur: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'appel des logs:', error);
      setLogs([]);
      setStatus('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lancer scraping manuel
  const triggerManualScraping = async () => {
    try {
      console.log('🚀 Lancement du scraping manuel...');
      setLoading(true);
      setStatus('⏳ Lancement en cours...');
      
      const response = await fetch('https://us-central1-simracing-practice-analyzer.cloudfunctions.net/scrapeEGTManual', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Scraping manuel réussi:', result);
        setStatus('✅ Scraping lancé avec succès!');
        // Actualiser les logs après un délai
        setTimeout(() => {
          loadScrapingLogs();
        }, 2000);
      } else {
        console.error('❌ Erreur lors du scraping:', result.error);
        setStatus('❌ Erreur: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'appel de la fonction:', error);
      setStatus('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculer statistiques globales
  const calculateStats = () => {
    if (!logs || logs.length === 0) return { totalSessions: 0, successRate: 0 };
    
    const totalSessions = logs.reduce((sum, log) => sum + (log.downloads?.successful || 0), 0);
    const successfulRuns = logs.filter(log => log.status === 'completed').length;
    const totalRuns = logs.length;
    const successRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : 0;
    
    return { totalSessions, successRate };
  };

  // Charger les logs à l'authentification
  useEffect(() => {
    if (authenticated) {
      loadScrapingLogs();
    }
  }, [authenticated]);

  // Affichage login
  if (!authenticated) {
    return (
      <div className="container">
        <div className="admin-auth-section">
          <div className="admin-auth-form">
            <h2>🔐 Connexion Admin</h2>
            <p>Accès réservé aux administrateurs pour le dashboard EGT Auto Scraper</p>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe admin"
                className="admin-password-input"
              />
              <button type="submit" className="admin-login-btn">
                Se connecter
              </button>
            </form>
            {status && <p className="upload-status">{status}</p>}
            <button onClick={() => navigate('/')} className="back-to-app-btn">
              ← Retour à l'application
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const lastRun = logs[0];
  const lastRunDate = lastRun?.timestamp ? 
    new Date(lastRun.timestamp._seconds * 1000 + lastRun.timestamp._nanoseconds / 1000000) : null;

  return (
    <div className="container">
      <div className="egt-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h3>🤖 EGT Auto Scraper Dashboard</h3>
            <p>Monitoring du système de scraping automatique</p>
          </div>
          <div className="dashboard-actions">
            <button onClick={() => loadScrapingLogs()} className="btn btn-secondary" disabled={loading}>
              🔄 Actualiser Logs
            </button>
            <button onClick={handleLogout} className="admin-logout-btn">
              Déconnexion
            </button>
          </div>
        </div>
        
        <div className="dashboard-content">
          {/* Contrôles manuels */}
          <div className="manual-controls">
            <button onClick={triggerManualScraping} className="btn btn-primary" disabled={loading}>
              {loading ? '🔄 Lancement...' : '🚀 Lancer Scraping Manuel'}
            </button>
          </div>
          
          {/* Résultats du dernier run */}
          <div className="last-run-status">
            <div className="status-card">
              <h4>📊 Dernier Run</h4>
              <div className="status-content">
                {lastRun ? (
                  <div className={`status-content ${lastRun.status === 'completed' ? 'success' : 'error'}`}>
                    <strong>{lastRun.status === 'completed' ? '✅ Succès' : '❌ Échec'}</strong><br/>
                    {lastRun.summary && (
                      <>
                        {lastRun.summary.scraped || 0} sessions trouvées<br/>
                        {lastRun.summary.new || 0} nouvelles sessions<br/>
                        {lastRun.summary.downloaded || 0} téléchargées
                      </>
                    )}
                    {lastRunDate && (
                      <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                        {lastRunDate.toLocaleString('fr-FR')}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>Chargement...</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Statistiques globales */}
          <div className="global-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalSessions}</div>
                  <div className="stat-label">Sessions Total</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.successRate}%</div>
                  <div className="stat-label">Taux de Succès</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏰</div>
                <div className="stat-content">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Dernier Run</div>
                  <div className="stat-time">{lastRunDate ? lastRunDate.toLocaleDateString('fr-FR') : 'N/A'}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔄</div>
                <div className="stat-content">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Prochain Run</div>
                  <div className="stat-time">~1h</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logs détaillés */}
          <div className="logs-section">
            <h4>📋 Logs des Exécutions</h4>
            {status && <p className="upload-status">{status}</p>}
            <div className="logs-container">
              {logs.length === 0 ? (
                <p>Aucun log disponible</p>
              ) : (
                logs.map((log, index) => {
                  const statusIcon = log.status === 'completed' ? '✅' : 
                                    log.status === 'failed' ? '❌' : '⚠️';
                  const logDate = log.timestamp ? 
                    new Date(log.timestamp._seconds * 1000 + log.timestamp._nanoseconds / 1000000) : null;
                  
                  return (
                    <div key={index} className={`log-entry ${log.status === 'completed' ? 'success' : 'error'}`}>
                      <div className="log-status">{statusIcon}</div>
                      <div className="log-details">
                        <strong>{log.trigger || 'Scheduled'}</strong> - 
                        {log.scraping ? 
                          `${log.scraping.totalSessionsFound || 0} trouvées, ${log.scraping.newSessionsFound || 0} nouvelles` :
                          'Pas de données'}
                        {log.errors && log.errors.length > 0 && (
                          <br/><small>Erreur: {log.errors[0]}</small>
                        )}
                      </div>
                      <div className="log-time">
                        {logDate ? logDate.toLocaleString('fr-FR') : 'N/A'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
