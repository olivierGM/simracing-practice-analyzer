/**
 * Service DrillAudioService
 * 
 * Gère les sons pour les drills (annonces de pourcentages, jugements)
 * Utilise Web Speech API pour la synthèse vocale
 */

class DrillAudioService {
  constructor() {
    this.enabled = true;
    this.announcementsEnabled = true;
    this.judgmentsEnabled = true;
    this.volume = 0.7;
    
    // Vérifier si Web Speech API est disponible
    this.speechAvailable = 'speechSynthesis' in window;
    
    // Sons de jugement (fréquences pour beep)
    this.audioContext = null;
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**
   * Activer/désactiver tous les sons
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Activer/désactiver les annonces de pourcentages
   */
  setAnnouncementsEnabled(enabled) {
    this.announcementsEnabled = enabled;
  }

  /**
   * Activer/désactiver les sons de jugement
   */
  setJudgmentsEnabled(enabled) {
    this.judgmentsEnabled = enabled;
  }

  /**
   * Définir le volume (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Annoncer un pourcentage à l'avance
   */
  announcePercentage(percent) {
    if (!this.enabled || !this.announcementsEnabled || !this.speechAvailable) {
      return;
    }

    // Annuler les annonces en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(percent.toString());
    utterance.rate = 1.2; // Un peu plus rapide
    utterance.pitch = 1.0;
    utterance.volume = this.volume * 0.8; // Un peu moins fort que les jugements
    utterance.lang = 'en-US';

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Jouer un son de jugement (PERFECT, GREAT, GOOD, MISS)
   */
  playJudgmentSound(judgment) {
    if (!this.enabled || !this.judgmentsEnabled) {
      return;
    }

    // Utiliser des beeps avec différentes fréquences
    if (this.audioContext) {
      this.playBeep(judgment);
    }

    // Optionnel: Annoncer vocalement aussi
    if (this.speechAvailable && judgment === 'PERFECT') {
      const utterance = new SpeechSynthesisUtterance('Perfect');
      utterance.rate = 1.5;
      utterance.pitch = 1.2;
      utterance.volume = this.volume * 0.6;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Jouer un beep avec une fréquence spécifique
   */
  playBeep(judgment) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Fréquences et durées selon le jugement
    let frequency, duration, type;
    switch (judgment) {
      case 'PERFECT':
        frequency = 880; // A5 - Aigu et positif
        duration = 0.15;
        type = 'sine';
        break;
      case 'GREAT':
        frequency = 660; // E5 - Moyen-aigu
        duration = 0.12;
        type = 'sine';
        break;
      case 'GOOD':
        frequency = 523; // C5 - Moyen
        duration = 0.1;
        type = 'sine';
        break;
      case 'OK':
        frequency = 392; // G4 - Moyen-grave
        duration = 0.1;
        type = 'sine';
        break;
      case 'MISS':
        frequency = 220; // A3 - Grave et négatif
        duration = 0.2;
        type = 'sawtooth'; // Son plus dur
        break;
      default:
        return;
    }

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Envelope pour éviter les clics
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Nettoyer les ressources
   */
  cleanup() {
    if (this.speechAvailable) {
      window.speechSynthesis.cancel();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Instance singleton
const drillAudioService = new DrillAudioService();

export default drillAudioService;

