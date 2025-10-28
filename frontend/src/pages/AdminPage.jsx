/**
 * Page AdminPage - EGT Auto Scraper Dashboard
 * 
 * Panel d'administration complet pour le scraping EGT automatique
 * COPIE du système prod: src/components/admin-dashboard/admin-dashboard-integration.js (lignes 1-530)
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { trackAdminAction } from '../services/analytics';
import './AdminPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ADMIN_PASSWORD = 'admin123'; // TODO: Remplacer par variable d'environnement

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Chargement...');
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Authentification
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setStatus('');
      trackAdminAction('login', { success: true });
    } else {
      setStatus('❌ Mot de passe incorrect');
      trackAdminAction('login', { success: false });
    }
    setPassword('');
  };

  const handleLogout = () => {
    trackAdminAction('logout');
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
      trackAdminAction('scraping_trigger', { manual: true });
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

  // Rendre le graphique de performance
  useEffect(() => {
    if (logs.length > 0 && chartRef.current) {
      renderPerformanceChart(logs);
    }
  }, [logs]);

  const renderPerformanceChart = (chartLogs) => {
    if (!chartRef.current) {
      console.warn('Canvas du graphique de performance non trouvé');
      return;
    }

    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Filtrer les logs des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLogs = chartLogs.filter(log => {
      const logDate = log.timestamp ? 
        new Date(log.timestamp._seconds * 1000 + log.timestamp._nanoseconds / 1000000) :
        new Date();
      return logDate >= sevenDaysAgo;
    }).reverse();

    if (recentLogs.length === 0) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Aucune donnée récente', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    const labels = recentLogs.map(log => {
      const logDate = log.timestamp ? 
        new Date(log.timestamp._seconds * 1000 + log.timestamp._nanoseconds / 1000000) :
        new Date();
      return logDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    });

    const successfulDownloads = recentLogs.map(log => log.downloads?.successful || 0);
    const failedDownloads = recentLogs.map(log => log.downloads?.failed || 0);
    const totalDownloads = recentLogs.map(log => log.downloads?.total || 0);

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Téléchargements Réussis',
            data: successfulDownloads,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#22c55e',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5
          },
          {
            label: 'Téléchargements Échoués',
            data: failedDownloads,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5
          },
          {
            label: 'Total Tentatives',
            data: totalDownloads,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
              color: '#666',
              font: { size: 12, weight: 'bold' }
            },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          },
          y: {
            title: {
              display: true,
              text: 'Nombre de Sessions',
              color: '#666',
              font: { size: 12, weight: 'bold' }
            },
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#3b82f6',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(context) { return `📅 ${context[0].label}`; },
              label: function(context) {
                const value = context.parsed.y;
                let icon = '';
                if (context.dataset.label.includes('Réussis')) { icon = '✅'; }
                else if (context.dataset.label.includes('Échoués')) { icon = '❌'; }
                else if (context.dataset.label.includes('Total')) { icon = '📊'; }
                return `${icon} ${context.dataset.label}: ${value}`;
              }
            }
          }
        }
      }
    });
    console.log('📈 Graphique de performance rendu avec succès');
  };

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
          
          {/* Graphique de performance */}
          <div className="performance-chart">
            <h4>📈 Performances (7 derniers jours)</h4>
            <canvas ref={chartRef} width="400" height="200"></canvas>
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
                        {log.scraping ? (
                          `${log.scraping.totalSessionsFound || 0} trouvées, ${log.scraping.newSessionsFound || 0} nouvelles`
                        ) : (
                          'Pas de données'
                        )}
                        {log.errors && log.errors.length > 0 && (
                          <>
                            <br/><small>Erreur: {log.errors[0]}</small>
                          </>
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
