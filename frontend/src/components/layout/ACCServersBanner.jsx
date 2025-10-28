import { useACCServers } from '../../hooks/useACCServers';
import './ACCServersBanner.css';

/**
 * Composant Banner pour afficher les serveurs ACC actifs
 * Affiché comme un bandeau défilant entre le titre et la bulle "Il y a..."
 * @param {string} trackName - Nom du circuit sélectionné
 */
export function ACCServersBanner({ trackName }) {
  const { servers, loading, error } = useACCServers(trackName);
  
  console.log('🎮 ACCServersBanner - trackName:', trackName);

  if (!trackName) {
    console.log('🎮 ACCServersBanner - No trackName, returning null');
    return null;
  }

  if (error) {
    console.error('Erreur serveurs ACC:', error);
    return null;
  }

  if (loading) {
    console.log('🎮 ACCServersBanner - Loading...');
    return (
      <div className="acc-banner">
        <div className="acc-banner-loading">Chargement serveurs ACC...</div>
      </div>
    );
  }

  if (!servers || servers.length === 0) {
    return null; // Ne rien afficher si aucun serveur
  }

  // Filtrer pour ne garder que la session active
  const getActiveSession = (sessions) => {
    if (!sessions || sessions.length === 0) return null;
    return sessions.find(s => s.active) || null;
  };

  // Formater une session (ex: "R20'")
  const formatSession = (session) => {
    if (!session) return null;
    
    const icons = { Race: 'R', Qualifying: 'Q', Practice: 'P' };
    const icon = icons[session.type] || 'P';
    
    // Afficher seulement la durée totale (ex: "R20'")
    return <span className="session-active">{icon}{session.elapsed_time}'</span>;
  };

  return (
    <div className="acc-banner">
      <div className="acc-banner-icon">🎮</div>
      <div className="acc-banner-servers">
        {servers.map((server, index) => (
          <div key={index} className="acc-banner-server">
            <span className="acc-banner-server-name">{server.name}</span>
            <span className="acc-banner-server-drivers">
              🏎️ {server.drivers}/{server.max_drivers}
            </span>
            <div className="acc-banner-sessions">
              {(() => {
                const activeSession = getActiveSession(server.sessions);
                return activeSession ? (
                  <span className="session-item">
                    {formatSession(activeSession)}
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

