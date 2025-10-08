/**
 * PILOT CARD INTEGRATION
 * Fichier d'intégration entre l'application principale et le composant pilot-card
 */

// Instance globale du composant pilot-card
let pilotCardInstance = null;

/**
 * Initialiser le composant pilot-card
 */
async function initPilotCardComponent() {
    try {
        // Importer le composant pilot-card
        const { default: PilotCard } = await import('../components/pilot-card/pilot-card.js');
        
        // Créer une instance
        pilotCardInstance = new PilotCard();
        
        // Initialiser le composant
        pilotCardInstance.init();
        
        console.log('✅ Composant pilot-card initialisé avec succès');
        
        // Remplacer la fonction globale openPilotModal
        window.openPilotModal = function(pilotId) {
            if (pilotCardInstance) {
                pilotCardInstance.open(pilotId);
            } else {
                console.error('❌ Composant pilot-card non initialisé');
            }
        };
        
        // Remplacer la fonction globale closePilotModal
        window.closePilotModal = function() {
            if (pilotCardInstance) {
                pilotCardInstance.close();
            } else {
                console.error('❌ Composant pilot-card non initialisé');
            }
        };
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du composant pilot-card:', error);
        
        // Fallback vers l'ancien système
        console.log('🔄 Utilisation du système de fallback...');
        await loadFallbackPilotModal();
        
        return false;
    }
}

/**
 * Charger le système de fallback (ancien pilot-modal.js)
 */
async function loadFallbackPilotModal() {
    try {
        // Charger l'ancien script pilot-modal.js
        const script = document.createElement('script');
        script.src = 'pilot-modal.js';
        script.onload = () => {
            console.log('✅ Système de fallback chargé');
        };
        script.onerror = () => {
            console.error('❌ Impossible de charger le système de fallback');
        };
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement du système de fallback:', error);
    }
}

/**
 * Obtenir l'instance du composant pilot-card
 */
function getPilotCardInstance() {
    return pilotCardInstance;
}

/**
 * Vérifier si le composant pilot-card est disponible
 */
function isPilotCardAvailable() {
    return pilotCardInstance !== null;
}

// Export pour utilisation en module
export {
    initPilotCardComponent,
    getPilotCardInstance,
    isPilotCardAvailable,
    loadFallbackPilotModal
};

// Export pour utilisation globale (compatibilité)
if (typeof window !== 'undefined') {
    window.initPilotCardComponent = initPilotCardComponent;
    window.getPilotCardInstance = getPilotCardInstance;
    window.isPilotCardAvailable = isPilotCardAvailable;
}
