/**
 * Service Analytics
 * 
 * Wrapper pour Firebase Analytics avec tracking des événements de l'application
 */

import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from './firebase';

let analytics = null;

// Initialiser Analytics une fois que l'app est prête
function initAnalytics() {
  if (typeof window === 'undefined') return null; // SSR check
  
  if (!analytics) {
    try {
      // Utiliser l'app Firebase existante
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics initialisé');
    } catch (error) {
      console.warn('⚠️ Erreur lors de l\'initialisation d\'Analytics:', error);
    }
  }
  return analytics;
}

/**
 * Track un événement personnalisé
 * @param {string} eventName - Nom de l'événement
 * @param {Object} params - Paramètres de l'événement
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return; // SSR check
  
  const analyticsInstance = initAnalytics();
  if (analyticsInstance) {
    try {
      logEvent(analyticsInstance, eventName, params);
      console.log('📊 Analytics Event:', eventName, params);
    } catch (error) {
      console.warn('⚠️ Erreur lors du tracking:', error);
    }
  }
}

/**
 * Track un changement de page (navigation)
 * @param {string} pageName - Nom de la page
 * @param {Object} params - Paramètres supplémentaires
 */
export function trackPageView(pageName, params = {}) {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href,
    ...params
  });
}

/**
 * Track le sélection d'un pilote
 * @param {string} pilotName - Nom du pilote
 * @param {string} trackName - Nom de la piste
 * @param {string} category - Catégorie du pilote
 */
export function trackPilotClick(pilotName, trackName, category) {
  trackEvent('select_pilot', {
    pilot_name: pilotName,
    track_name: trackName,
    category: category
  });
}

/**
 * Track un changement de filtre
 * @param {string} filterType - Type de filtre ('period', 'track', 'group_by_class')
 * @param {string} filterValue - Valeur du filtre
 */
export function trackFilterChange(filterType, filterValue) {
  trackEvent('filter_change', {
    filter_type: filterType,
    filter_value: filterValue
  });
}

/**
 * Track un tri de colonne
 * @param {string} columnName - Nom de la colonne
 * @param {string} direction - Direction du tri ('asc', 'desc')
 */
export function trackSort(columnName, direction) {
  trackEvent('sort_column', {
    column_name: columnName,
    sort_direction: direction
  });
}

/**
 * Track une action admin
 * @param {string} action - Action effectuée ('login', 'logout', 'upload', 'scraping_trigger')
 * @param {Object} params - Paramètres supplémentaires
 */
export function trackAdminAction(action, params = {}) {
  trackEvent('admin_action', {
    action: action,
    ...params
  });
}

/**
 * Track une interaction avec le banner ACC Servers
 * @param {string} action - Action ('view', 'click_server')
 * @param {string} serverName - Nom du serveur (optionnel)
 */
export function trackACCServer(action, serverName = null) {
  trackEvent('acc_server_interaction', {
    action: action,
    server_name: serverName
  });
}

// Initialiser au chargement du module
if (typeof window !== 'undefined') {
  initAnalytics();
}
