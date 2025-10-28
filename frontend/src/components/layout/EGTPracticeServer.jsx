import { useEGTPracticeServer } from '../../hooks/useEGTPracticeServer';
import './EGTPracticeServer.css';

/**
 * Composant pour afficher le serveur de pratique EGT
 * Affiche le logo EGT avec le nombre de pilotes (ex: 0/50)
 * @param {string} trackName - Nom du circuit sélectionné
 */
export function EGTPracticeServer({ trackName }) {
  const { server, loading, error } = useEGTPracticeServer(trackName);

  if (!trackName) {
    return null;
  }

  if (error) {
    console.error('Erreur serveur EGT:', error);
    return null;
  }

  // Si on charge, afficher logo + spinner + max_drivers
  if (loading) {
    // Si on a déjà le max_drivers d'un appel précédent, l'afficher
    const maxDrivers = server?.max_drivers || '50'; // Valeur par défaut si pas encore chargé
    return (
      <div className="egt-practice-server">
        <img 
          src="/logo egt.webp" 
          alt="EGT" 
          className="egt-logo"
          loading="lazy"
        />
        <span className="egt-practice-info">
          <span className="egt-loading-spinner"></span>/{maxDrivers}
        </span>
      </div>
    );
  }

  if (!server || !server.hasPractice) {
    return null; // Ne rien afficher si aucun serveur EGT ou pas de Practice active
  }

  return (
    <div className="egt-practice-server">
      <img 
        src="/logo egt.webp" 
        alt="EGT" 
        className="egt-logo"
        loading="lazy"
      />
      <span className="egt-practice-info">
        {server.drivers}/{server.max_drivers}
      </span>
    </div>
  );
}

