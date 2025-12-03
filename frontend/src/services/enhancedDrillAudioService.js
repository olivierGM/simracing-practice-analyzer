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
    this.musicLoopTimeout = null;
    
    // Vraies musiques (hébergées localement ou CDN)
    this.currentMusicIndex = 0;
    
    // Playlist de musiques (on utilisera des musiques synthétiques améliorées pour l'instant)
    // À remplacer par de vraies musiques MP3 plus tard
    this.musicThemes = [
      {
        name: 'Arcade Energy',
        melody: [440, 523, 659, 784, 659, 523, 440, 392],
        bass: [220, 220, 165, 165],
        bpm: 145
      },
      {
        name: 'Racing Rush',
        melody: [523, 659, 784, 880, 784, 659, 523, 494],
        bass: [262, 262, 196, 196],
        bpm: 155
      },
      {
        name: 'Retro Drive',
        melody: [392, 494, 587, 698, 587, 494, 392, 349],
        bass: [196, 196, 147, 147],
        bpm: 140
      },
      {
        name: 'Neon Circuit',
        melody: [659, 784, 880, 1047, 880, 784, 659, 587],
        bass: [330, 330, 247, 247],
        bpm: 150
      }
    ];
    
    // Système de combos
    this.currentCombo = 0;
    this.maxCombo = 0;
    
    // Countdown
    this.countdownInProgress = false;
    
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
    // Le volume sera appliqué aux prochaines notes
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  // ==================== MUSIQUE DE FOND ====================

  /**
   * Démarrer la musique de fond (musique synthétique améliorée)
   */
  startMusic(tempo = 'medium') {
    if (!this.enabled || !this.musicEnabled || !this.audioContext) return;
    
    this.stopMusic();
    
    // Choisir un thème musical aléatoire
    this.currentMusicIndex = Math.floor(Math.random() * this.musicThemes.length);
    const theme = this.musicThemes[this.currentMusicIndex];
    
    const beatDuration = 60 / theme.bpm;
    
    this.musicLoopTimeout = null;
    this.currentTheme = theme;
    this.playMusicLoop(beatDuration, 0);
    
    console.log(`🎵 Playing: ${theme.name} (${theme.bpm} BPM)`);
  }

  playMusicLoop(beatDuration, beatIndex) {
    if (!this.enabled || !this.musicEnabled || !this.currentTheme) return;
    
    const now = this.audioContext.currentTime;
    const theme = this.currentTheme;
    
    // Basse kick (beat principal)
    const bassNote = theme.bass[beatIndex % theme.bass.length];
    this.playKick(now, bassNote);
    
    // Hi-hat (rythme rapide)
    for (let i = 0; i < 4; i++) {
      this.playHiHat(now + (beatDuration / 4) * i);
    }
    
    // Mélodie
    const melodyNote = theme.melody[beatIndex % theme.melody.length];
    this.playMelodyNote(now, melodyNote);
    
    // Boucler
    this.musicLoopTimeout = setTimeout(() => {
      if (this.enabled && this.musicEnabled) {
        this.playMusicLoop(beatDuration, beatIndex + 1);
      }
    }, beatDuration * 1000);
  }

  playKick(time, frequency = 150) {
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.frequency.setValueAtTime(frequency, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    gain.gain.setValueAtTime(this.musicVolume * 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.start(time);
    osc.stop(time + 0.3);
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
    gain.connect(this.sfxGain);
    
    gain.gain.setValueAtTime(this.musicVolume * 0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.start(time);
    osc.stop(time + 0.05);
  }

  playMelodyNote(time, frequency) {
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.value = frequency;
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    gain.gain.setValueAtTime(this.musicVolume * 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
    
    osc.start(time);
    osc.stop(time + 0.25);
  }

  stopMusic() {
    // Arrêter la boucle de musique
    if (this.musicLoopTimeout) {
      clearTimeout(this.musicLoopTimeout);
      this.musicLoopTimeout = null;
    }
    this.currentTheme = null;
  }
  
  /**
   * Passer à la musique suivante
   */
  nextTrack() {
    if (!this.enabled || !this.musicEnabled) return;
    
    this.currentMusicIndex = (this.currentMusicIndex + 1) % this.musicThemes.length;
    this.startMusic();
  }

  // ==================== DUCKING (baisse musique pour voix) ====================

  duckMusic(duration = 0.5) {
    // Pour la musique synthétique, on baisse temporairement le volume
    const originalVolume = this.musicVolume;
    this.musicVolume = originalVolume * 0.3;
    
    // Remonter après
    setTimeout(() => {
      this.musicVolume = originalVolume;
    }, duration * 1000);
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
    
    // Marquer qu'un countdown est en cours
    this.countdownInProgress = true;
    
    const counts = ['3', '2', '1', 'GO!'];
    let index = 0;
    
    const speakNext = () => {
      // Si le countdown a été annulé, arrêter
      if (!this.countdownInProgress) {
        return;
      }
      
      if (index >= counts.length) {
        this.countdownInProgress = false;
        if (callback) callback();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(counts[index]);
      utterance.rate = 1.3; // Plus rapide
      utterance.pitch = index === 3 ? 1.4 : 1.0;
      utterance.volume = this.voiceVolume;
      utterance.lang = 'en-US';
      
      utterance.onend = () => {
        index++;
        if (index < counts.length) {
          setTimeout(speakNext, index === 3 ? 100 : 500); // Réduit de 800ms à 500ms
        } else if (callback) {
          this.countdownInProgress = false;
          callback();
        }
      };
      
      // Son de beep pour chaque compte
      if (index < 3) {
        this.playBeep(800, 0.08);
      } else {
        this.playBeep(1200, 0.12);
      }
      
      window.speechSynthesis.speak(utterance);
    };
    
    speakNext();
  }
  
  cancelCountdown() {
    this.countdownInProgress = false;
    if (this.speechAvailable) {
      window.speechSynthesis.cancel();
    }
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

