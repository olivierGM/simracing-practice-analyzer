import { useState, useEffect, useRef } from 'react';
import { useACCServers } from '../../hooks/useACCServers';
import { useEGTPracticeServer } from '../../hooks/useEGTPracticeServer';
import './ACCServersBanner.css';

/**
 * Composant Banner pour afficher les serveurs ACC actifs
 * Affiché comme un bandeau défilant entre le titre et la bulle "Il y a..."
 * @param {string} trackName - Nom du circuit sélectionné
 */
export function ACCServersBanner({ trackName }) {
  // ⚠️ IMPORTANT: Tous les hooks doivent être appelés AVANT tout return conditionnel
  const { servers, loading, error } = useACCServers(trackName);
  const { server: egtServer } = useEGTPracticeServer(trackName);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [animationPaused, setAnimationPaused] = useState(false);
  const serversContainerRef = useRef(null);
  const serversListRef = useRef(null);
  
  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Gestion du drag pour mobile - pause l'animation CSS lors du touch
  useEffect(() => {
    if (!isMobile || !serversContainerRef.current || !serversListRef.current) return;

    const container = serversContainerRef.current;
    const _serversList = serversListRef.current;
    let resumeTimeout = null;
    let _touchStartTime = 0;
    let _isTouching = false;

    // Détecter le début d'un touch
    const handleTouchStart = () => {
      _isTouching = true;
      _touchStartTime = Date.now();
      setIsDragging(true);
      setAnimationPaused(true);
      
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    };

    const handleTouchEnd = () => {
      _isTouching = false;
      
      // Reprendre l'animation après 2 secondes d'inactivité
      resumeTimeout = setTimeout(() => {
        setIsDragging(false);
        setAnimationPaused(false);
      }, 2000);
    };

    // Écouter les événements touch
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
      }
    };
  }, [isMobile]);


  // Maintenant on peut faire les returns conditionnels APRÈS tous les hooks
  if (!trackName) {
    console.log('🎮 ACCServersBanner - No trackName, returning null');
    return null;
  }

  if (error) {
    console.error('Erreur serveurs ACC:', error);
    return null;
  }

  if (loading) {
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

  // Construire la liste alternée pour mobile : EGT, Serveurs, EGT, Serveurs
  // Sur desktop, afficher seulement une fois
  let serversToDisplay = [];
  
  if (isMobile) {
    // Mobile: alterner EGT et serveurs pour une animation fluide
    const allItems = [];
    if (egtServer && egtServer.hasPractice) {
      allItems.push(egtServer);
    }
    allItems.push(...servers);
    
    // Dupliquer le pattern pour créer une boucle infinie
    serversToDisplay = [...allItems, ...allItems];
  } else {
    // Desktop: afficher EGT en premier puis les serveurs (une seule fois)
    if (egtServer && egtServer.hasPractice) {
      serversToDisplay = [egtServer, ...servers];
    } else {
      serversToDisplay = servers;
    }
  }

  return (
    <div className="acc-banner">
      <div className="acc-banner-icon">🎮</div>
      <div 
        className="acc-banner-servers-container"
        ref={serversContainerRef}
      >
        <div 
          className={`acc-banner-servers ${isMobile && !animationPaused && !isDragging ? 'auto-scrolling' : ''}`}
          ref={serversListRef}
        >
          {serversToDisplay.map((item, index) => {
            // Si l'item est le serveur EGT (a une propriété hasPractice)
            if (item.hasPractice && item.drivers !== undefined) {
              return (
                <div key={`egt-${index}`} className="acc-banner-server acc-banner-server-egt">
                  <img 
                    src="/logo egt.webp" 
                    alt="EGT" 
                    className="acc-banner-egt-logo"
                    loading="lazy"
                  />
                  <span className="acc-banner-server-drivers">
                    {item.drivers}/{item.max_drivers}
                  </span>
                </div>
              );
            }
            
            // Sinon, c'est un serveur ACC normal
            return (
              <div key={`server-${index}`} className="acc-banner-server">
                <span className="acc-banner-server-name">{item.name}</span>
                <span className="acc-banner-server-drivers">
                  🏎️ {item.drivers}/{item.max_drivers}
                </span>
                <div className="acc-banner-sessions">
                  {(() => {
                    const activeSession = getActiveSession(item.sessions);
                    return activeSession ? (
                      <span className="session-item">
                        {formatSession(activeSession)}
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

