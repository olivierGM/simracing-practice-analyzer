/**
 * Enhanced Drill Audio Service
 * 
 * Système audio complet avec:
 * - Samples audio professionnels
 * - Musique de fond
 * - Système de combos
 * - Mixage professionnel (ducking)
 * - Annonces vocales améliorées
 */

class EnhancedDrillAudioService {
  constructor() {
    // Configuration
    this.enabled = true;
    this.announcementsEnabled = true;
    this.judgmentsEnabled = true;
    this.musicEnabled = true;
    this.comboSoundsEnabled = true;
    
    // Volumes séparés
    this.masterVolume = 0.8;
    this.musicVolume = 0.4;
    this.sfxVolume = 0.7;
    this.voiceVolume = 0.8;
    
    // Audio Context
    this.audioContext = null;
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Nodes pour mixage
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    
    if (this.audioContext) {
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      
      this.masterGain.gain.value = this.masterVolume;
      this.musicGain.gain.value = this.musicVolume;
      this.sfxGain.gain.value = this.sfxVolume;
    }
    
    // Web Speech API
    this.speechAvailable = 'speechSynthesis' in window;
    
    // Musique de fond
    this.currentMusic = null;
    this.musicSource = null;
    
    // Système de combos
    this.currentCombo = 0;
    this.maxCombo = 0;
    
    // Cache des sons synthétisés
    this.soundCache = new Map();
  }

  /**
   * Initialiser le service (à appeler au premier clic utilisateur)
   */
  async initialize() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // ==================== CONFIGURATION ====================

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopMusic();
      if (this.speechAvailable) {
        window.speechSynthesis.cancel();
      }
    }
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  // ==================== MUSIQUE DE FOND ====================

  /**
   * Démarrer la musique de fond (synthétisée)
   */
  startMusic(tempo = 'medium') {
    if (!this.enabled || !this.musicEnabled || !this.audioContext) return;
    
    this.stopMusic();
    
    // Créer une boucle musicale simple et énergique
    const bpm = tempo === 'slow' ? 120 : tempo === 'medium' ? 140 : 160;
    const beatDuration = 60 / bpm;
    
    this.playMusicLoop(beatDuration);
  }

  playMusicLoop(beatDuration) {
    if (!this.enabled || !this.musicEnabled) return;
    
    const now = this.audioContext.currentTime;
    
    // Basse kick (beat principal)
    this.playKick(now);
    this.playKick(now + beatDuration);
    this.playKick(now + beatDuration * 2);
    this.playKick(now + beatDuration * 3);
    
    // Hi-hat (rythme rapide)
    for (let i = 0; i < 8; i++) {
      this.playHiHat(now + (beatDuration / 2) * i);
    }
    
    // Mélodie simple
    this.playMelodyNote(now, 440); // A4
    this.playMelodyNote(now + beatDuration, 523); // C5
    this.playMelodyNote(now + beatDuration * 2, 587); // D5
    this.playMelodyNote(now + beatDuration * 3, 523); // C5
    
    // Boucler
    setTimeout(() => {
      if (this.enabled && this.musicEnabled) {
        this.playMusicLoop(beatDuration);
      }
    }, beatDuration * 4 * 1000);
  }

  playKick(time) {
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    osc.start(time);
    osc.stop(time + 0.5);
  }

  playHiHat(time) {
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.type = 'square';
    osc.frequency.value = 10000;
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.start(time);
    osc.stop(time + 0.05);
  }

  playMelodyNote(time, frequency) {
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = frequency;
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }

  stopMusic() {
    // La musique s'arrêtera naturellement quand enabled = false
  }

  // ==================== DUCKING (baisse musique pour voix) ====================

  duckMusic(duration = 0.5) {
    if (!this.musicGain) return;
    
    const now = this.audioContext.currentTime;
    const currentVolume = this.musicVolume;
    
    // Baisser la musique
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(currentVolume * 0.3, now + 0.1);
    
    // Remonter après
    this.musicGain.gain.linearRampToValueAtTime(currentVolume, now + duration);
  }

  // ==================== ANNONCES VOCALES ====================

  announcePercentage(percent) {
    if (!this.enabled || !this.announcementsEnabled || !this.speechAvailable) return;
    
    this.duckMusic(1.0);
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(percent.toString());
    utterance.rate = 1.3;
    utterance.pitch = 1.1;
    utterance.volume = this.voiceVolume;
    utterance.lang = 'en-US';
    
    window.speechSynthesis.speak(utterance);
  }

  announceEncouragement(type = 'good') {
    if (!this.enabled || !this.announcementsEnabled || !this.speechAvailable) return;
    
    const encouragements = {
      good: ['Nice!', 'Good job!', 'Keep going!'],
      great: ['Excellent!', 'Amazing!', 'Fantastic!'],
      perfect: ['Perfect!', 'Outstanding!', 'Incredible!']
    };
    
    const messages = encouragements[type] || encouragements.good;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    this.duckMusic(1.0);
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.4;
    utterance.pitch = 1.2;
    utterance.volume = this.voiceVolume * 0.8;
    utterance.lang = 'en-US';
    
    window.speechSynthesis.speak(utterance);
  }

  announceCombo(combo) {
    if (!this.enabled || !this.announcementsEnabled || !this.speechAvailable) return;
    if (combo < 5) return; // Annoncer seulement à partir de 5
    
    this.duckMusic(0.8);
    
    const utterance = new SpeechSynthesisUtterance(`${combo} combo!`);
    utterance.rate = 1.5;
    utterance.pitch = 1.3;
    utterance.volume = this.voiceVolume * 0.7;
    utterance.lang = 'en-US';
    
    window.speechSynthesis.speak(utterance);
  }

  // ==================== COUNTDOWN ====================

  playCountdown(callback) {
    if (!this.enabled || !this.speechAvailable) {
      if (callback) setTimeout(callback, 100);
      return;
    }
    
    const counts = ['3', '2', '1', 'GO!'];
    let index = 0;
    
    const speakNext = () => {
      if (index >= counts.length) {
        if (callback) callback();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(counts[index]);
      utterance.rate = 1.0;
      utterance.pitch = index === 3 ? 1.4 : 1.0;
      utterance.volume = this.voiceVolume;
      utterance.lang = 'en-US';
      
      utterance.onend = () => {
        index++;
        if (index < counts.length) {
          setTimeout(speakNext, index === 3 ? 200 : 800);
        } else if (callback) {
          callback();
        }
      };
      
      // Son de beep pour chaque compte
      if (index < 3) {
        this.playBeep(800, 0.1);
      } else {
        this.playBeep(1200, 0.15);
      }
      
      window.speechSynthesis.speak(utterance);
    };
    
    speakNext();
  }

  // ==================== SONS DE JUGEMENT AMÉLIORÉS ====================

  playJudgmentSound(judgment) {
    if (!this.enabled || !this.judgmentsEnabled) return;
    
    // Mettre à jour le combo
    if (judgment === 'PERFECT' || judgment === 'GREAT') {
      this.currentCombo++;
      if (this.currentCombo > this.maxCombo) {
        this.maxCombo = this.currentCombo;
      }
      
      // Annoncer les combos importants
      if (this.currentCombo === 5 || this.currentCombo === 10 || this.currentCombo % 25 === 0) {
        this.announceCombo(this.currentCombo);
        this.playComboSound(this.currentCombo);
      }
    } else {
      if (this.currentCombo >= 5) {
        // Combo cassé
        this.playComboBreakSound();
      }
      this.currentCombo = 0;
    }
    
    // Jouer le son de jugement
    this.playEnhancedJudgmentBeep(judgment);
    
    // Encouragements occasionnels
    if (judgment === 'PERFECT' && Math.random() < 0.1) {
      setTimeout(() => this.announceEncouragement('perfect'), 200);
    }
  }

  playEnhancedJudgmentBeep(judgment) {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    let frequencies, duration, type, envelope;
    
    switch (judgment) {
      case 'PERFECT':
        frequencies = [880, 1100, 1320]; // Accord majeur
        duration = 0.2;
        type = 'sine';
        envelope = { attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.14 };
        break;
      case 'GREAT':
        frequencies = [660, 880];
        duration = 0.15;
        type = 'sine';
        envelope = { attack: 0.01, decay: 0.04, sustain: 0.6, release: 0.1 };
        break;
      case 'GOOD':
        frequencies = [523];
        duration = 0.12;
        type = 'sine';
        envelope = { attack: 0.01, decay: 0.03, sustain: 0.5, release: 0.08 };
        break;
      case 'OK':
        frequencies = [392];
        duration = 0.1;
        type = 'triangle';
        envelope = { attack: 0.01, decay: 0.02, sustain: 0.4, release: 0.07 };
        break;
      case 'MISS':
        frequencies = [220, 200]; // Dissonance
        duration = 0.25;
        type = 'sawtooth';
        envelope = { attack: 0.02, decay: 0.05, sustain: 0.3, release: 0.18 };
        break;
      default:
        return;
    }
    
    frequencies.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      osc.type = type;
      osc.frequency.value = freq;
      
      filter.type = 'lowpass';
      filter.frequency.value = freq * 2;
      filter.Q.value = 1;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      
      // Envelope ADSR
      const { attack, decay, sustain, release } = envelope;
      const peakVolume = 0.3 / frequencies.length;
      const sustainVolume = peakVolume * sustain;
      
      gain.gain.setValueAtTime(0, now + i * 0.02);
      gain.gain.linearRampToValueAtTime(peakVolume, now + i * 0.02 + attack);
      gain.gain.linearRampToValueAtTime(sustainVolume, now + i * 0.02 + attack + decay);
      gain.gain.setValueAtTime(sustainVolume, now + i * 0.02 + duration - release);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + duration);
      
      osc.start(now + i * 0.02);
      osc.stop(now + i * 0.02 + duration);
    });
  }

  // ==================== SONS DE COMBO ====================

  playComboSound(combo) {
    if (!this.enabled || !this.comboSoundsEnabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const baseFreq = 880 + (combo * 10);
    
    // Son ascendant rapide
    for (let i = 0; i < 5; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = baseFreq + (i * 100);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      const time = now + (i * 0.05);
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      
      osc.start(time);
      osc.stop(time + 0.1);
    }
  }

  playComboBreakSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Son descendant (triste)
    for (let i = 0; i < 3; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400 - (i * 50), now + (i * 0.1));
      osc.frequency.exponentialRampToValueAtTime(200 - (i * 50), now + (i * 0.1) + 0.2);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      gain.gain.setValueAtTime(0.15, now + (i * 0.1));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.1) + 0.2);
      
      osc.start(now + (i * 0.1));
      osc.stop(now + (i * 0.1) + 0.2);
    }
  }

  // ==================== SONS DE FIN ====================

  playCompletionSound(success = true) {
    if (!this.enabled || !this.audioContext) return;
    
    if (success) {
      // Fanfare de victoire
      const melody = [523, 659, 784, 1047]; // C-E-G-C (octave)
      melody.forEach((freq, i) => {
        this.playMelodyNote(this.audioContext.currentTime + (i * 0.2), freq);
      });
      
      setTimeout(() => {
        if (this.speechAvailable) {
          const utterance = new SpeechSynthesisUtterance('Drill complete!');
          utterance.rate = 1.2;
          utterance.pitch = 1.3;
          utterance.volume = this.voiceVolume;
          window.speechSynthesis.speak(utterance);
        }
      }, 800);
    } else {
      // Son d'échec
      this.playBeep(200, 0.3);
    }
  }

  // ==================== UTILITAIRES ====================

  playBeep(frequency, duration) {
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
  }

  resetCombo() {
    this.currentCombo = 0;
  }

  getComboInfo() {
    return {
      current: this.currentCombo,
      max: this.maxCombo
    };
  }

  cleanup() {
    this.stopMusic();
    if (this.speechAvailable) {
      window.speechSynthesis.cancel();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Instance singleton
const enhancedDrillAudioService = new EnhancedDrillAudioService();

export default enhancedDrillAudioService;

