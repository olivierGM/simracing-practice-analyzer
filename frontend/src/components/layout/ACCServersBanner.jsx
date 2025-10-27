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

  return (
    <div className="acc-banner">
      <div className="acc-banner-icon">🎮</div>
      <div className="acc-banner-servers">
        {servers.map((server, index) => (
          <div key={index} className="acc-banner-server">
            <span className="acc-banner-server-name">{server.name}</span>
            <span className="acc-banner-server-drivers">{server.drivers} pilotes</span>
          </div>
        ))}
      </div>
    </div>
  );
}

