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
  
  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll automatique pour mobile
  useEffect(() => {
    // Vérifier les conditions de base
    if (!isMobile || animationPaused || isDragging) return;
    
    // Attendre que le container soit monté et que les serveurs soient chargés
    if (!serversContainerRef.current || !servers || servers.length === 0) {
      // Réessayer après un court délai si les données ne sont pas encore prêtes
      const timeout = setTimeout(() => {
        if (serversContainerRef.current && servers && servers.length > 0) {
          // Forcer un re-render pour déclencher le useEffect
          setIsMobile(window.innerWidth <= 768);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }

    const container = serversContainerRef.current;
    let animationFrameId = null;
    const scrollSpeed = 0.5; // pixels par frame

    const autoScroll = () => {
      // Vérifier que les conditions sont toujours valides
      if (animationPaused || isDragging || !container || !isMobile) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        return;
      }
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // Si pas assez de contenu pour scroller, ne rien faire
      if (maxScroll <= 0) {
        animationFrameId = requestAnimationFrame(autoScroll);
        return;
      }
      
      // Si on arrive à la fin, revenir au début (boucle infinie)
      if (container.scrollLeft >= maxScroll - 1) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += scrollSpeed;
      }
      
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Démarrer l'animation après un court délai pour s'assurer que le DOM est prêt
    const startTimeout = setTimeout(() => {
      animationFrameId = requestAnimationFrame(autoScroll);
    }, 100);

    return () => {
      clearTimeout(startTimeout);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMobile, animationPaused, isDragging, servers]);

  // Gestion du drag pour mobile
  useEffect(() => {
    if (!isMobile || !serversContainerRef.current) return;

    const container = serversContainerRef.current;
    let startX = 0;
    let scrollLeft = 0;
    let isTouching = false;
    let resumeTimeout = null;

    const handleTouchStart = (e) => {
      isTouching = true;
      setIsDragging(true);
      setAnimationPaused(true);
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft || 0;
      
      // Annuler le timeout de reprise s'il existe
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    };

    const handleTouchMove = (e) => {
      if (!isTouching) return;
      e.preventDefault();
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      isTouching = false;
      setIsDragging(false);
      
      // Après 2 secondes d'inactivité, reprendre l'animation
      resumeTimeout = setTimeout(() => {
        setAnimationPaused(false);
      }, 2000);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
      }
    };
  }, [isMobile]);
  
  console.log('🎮 ACCServersBanner - trackName:', trackName);

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
        <div className="acc-banner-servers">
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

