/**
 * Gestionnaire de thèmes pour l'application Sim Racing Analyzer
 * Gère le basculement entre mode sombre et clair avec persistance
 */

class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemPreference();
        this.themeToggle = null;
        this.init();
    }

    /**
     * Initialise le gestionnaire de thèmes
     */
    init() {
        // Appliquer le thème stocké au chargement
        this.applyTheme(this.currentTheme);
        
        // Attendre que le DOM soit chargé pour configurer l'événement
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        this.themeToggle = document.getElementById('themeToggle');
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            this.updateToggleIcon();
        }

        // Écouter les changements de préférence système
        this.setupSystemPreferenceListener();
    }

    /**
     * Configure l'écouteur pour les changements de préférence système
     */
    setupSystemPreferenceListener() {
        try {
            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                
                // Fonction de callback pour les changements
                const handleSystemThemeChange = (e) => {
                    // Ne changer que si l'utilisateur n'a pas de préférence stockée
                    if (!this.getStoredTheme()) {
                        const newTheme = e.matches ? 'dark' : 'light';
                        console.log(`🔄 Préférence système changée vers: ${newTheme}`);
                        this.currentTheme = newTheme;
                        this.applyTheme(newTheme);
                        this.updateToggleIcon();
                    }
                };

                // Écouter les changements
                mediaQuery.addEventListener('change', handleSystemThemeChange);
                
                console.log('👂 Écoute des changements de préférence système activée');
            }
        } catch (error) {
            console.warn('Impossible de configurer l\'écoute des préférences système:', error);
        }
    }

    /**
     * Bascule entre les thèmes sombre et clair
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.storeTheme(this.currentTheme);
        this.updateToggleIcon();
        
        console.log(`🎨 Thème changé vers: ${this.currentTheme}`);
    }

    /**
     * Applique le thème spécifié
     * @param {string} theme - 'light' ou 'dark'
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
    }

    /**
     * Met à jour l'icône du bouton toggle
     */
    updateToggleIcon() {
        if (this.themeToggle) {
            this.themeToggle.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
            this.themeToggle.title = this.currentTheme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair';
        }
    }

    /**
     * Récupère le thème stocké dans localStorage
     * @returns {string|null} Le thème stocké ou null
     */
    getStoredTheme() {
        try {
            return localStorage.getItem('simRacingTheme');
        } catch (error) {
            console.warn('Impossible de récupérer le thème depuis localStorage:', error);
            return null;
        }
    }

    /**
     * Détecte la préférence de thème du système d'exploitation
     * @returns {string} 'light' ou 'dark'
     */
    getSystemPreference() {
        try {
            // Vérifier si le navigateur supporte prefers-color-scheme
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                console.log('🌙 Préférence système détectée: mode sombre');
                return 'dark';
            } else {
                console.log('☀️ Préférence système détectée: mode clair');
                return 'light';
            }
        } catch (error) {
            console.warn('Impossible de détecter la préférence système:', error);
            return 'light'; // Fallback par défaut
        }
    }

    /**
     * Stocke le thème dans localStorage
     * @param {string} theme - Le thème à stocker
     */
    storeTheme(theme) {
        try {
            localStorage.setItem('simRacingTheme', theme);
        } catch (error) {
            console.warn('Impossible de stocker le thème dans localStorage:', error);
        }
    }

    /**
     * Obtient le thème actuel
     * @returns {string} Le thème actuel
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Force l'application d'un thème spécifique
     * @param {string} theme - 'light' ou 'dark'
     */
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.storeTheme(theme);
            this.updateToggleIcon();
        }
    }
}

// Initialiser le gestionnaire de thèmes
const themeManager = new ThemeManager();

// Exposer globalement pour utilisation dans d'autres scripts
window.themeManager = themeManager;

