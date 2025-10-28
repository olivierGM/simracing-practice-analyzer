/**
 * Composant Analytics Tracker
 * 
 * Track automatiquement les changements de page et le temps passé sur chaque page
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent } from '../../services/analytics';

export function AnalyticsTracker() {
  const location = useLocation();
  const pageStartTimeRef = useRef(Date.now());
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // Si on change de page, tracker le temps passé sur la page précédente
    if (previousPath !== currentPath) {
      const timeSpent = Date.now() - pageStartTimeRef.current;
      const timeSpentSeconds = Math.round(timeSpent / 1000);

      // Tracker le temps passé sur la page précédente (si > 1 seconde pour éviter les bruits)
      if (timeSpentSeconds >= 1) {
        const previousPageName = previousPath === '/' 
          ? 'Home' 
          : previousPath.split('/').filter(Boolean).join(' - ') || 'Unknown';
        
        trackEvent('time_on_page', {
          page_name: previousPageName,
          page_path: previousPath,
          time_spent_seconds: timeSpentSeconds,
          time_spent_formatted: formatTimeSpent(timeSpentSeconds)
        });
      }
    }

    // Track page view pour la nouvelle page
    const pageName = currentPath === '/' 
      ? 'Home' 
      : currentPath.split('/').filter(Boolean).join(' - ') || 'Unknown';
    
    trackPageView(pageName, {
      path: currentPath
    });

    // Réinitialiser le timer pour la nouvelle page
    pageStartTimeRef.current = Date.now();
    previousPathRef.current = currentPath;

    // Cleanup: tracker le temps quand le composant est démonté (utilisateur quitte l'app)
    return () => {
      const finalTimeSpent = Date.now() - pageStartTimeRef.current;
      const finalTimeSpentSeconds = Math.round(finalTimeSpent / 1000);

      if (finalTimeSpentSeconds >= 1) {
        const finalPageName = currentPath === '/' 
          ? 'Home' 
          : currentPath.split('/').filter(Boolean).join(' - ') || 'Unknown';
        
        trackEvent('time_on_page', {
          page_name: finalPageName,
          page_path: currentPath,
          time_spent_seconds: finalTimeSpentSeconds,
          time_spent_formatted: formatTimeSpent(finalTimeSpentSeconds),
          exit: true
        });
      }
    };
  }, [location]);

  return null; // Ce composant ne rend rien
}

/**
 * Formate le temps passé en format lisible (ex: "2m 30s", "45s")
 */
function formatTimeSpent(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}
