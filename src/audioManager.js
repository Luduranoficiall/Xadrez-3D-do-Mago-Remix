/**
 * Wizard Chess Audio Engine - Web Audio API Procedural Synthesizer
 * Provides Gothic Ambiance (howling wind, cathedral stone resonance)
 * and Spell Effects (piece shatter explosions, stone/wood impacts, spell chimes)
 * with zero external asset dependencies or network latency.
 */

class WizardChessAudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambianceGain = null;
    this.sfxGain = null;

    // Independent toggle states with localStorage persistence
    const savedAmbiance = typeof localStorage !== 'undefined' ? localStorage.getItem('wc_ambiance_enabled') : null;
    const savedSfx = typeof localStorage !== 'undefined' ? localStorage.getItem('wc_sfx_enabled') : null;

    this.ambianceEnabled = savedAmbiance !== 'false'; // default true
    this.sfxEnabled = savedSfx !== 'false';           // default true

    this.isAmbianceRunning = false;
    this.windSource = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.dripTimer = null;
  }

  /**
   * Lazily ensure AudioContext is instantiated and running
   */
  ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();

        // Master output bus
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Gothic Ambiance bus
        this.ambianceGain = this.ctx.createGain();
        this.ambianceGain.gain.setValueAtTime(this.ambianceEnabled ? 0.32 : 0.0001, this.ctx.currentTime);
        this.ambianceGain.connect(this.masterGain);

        // Spell SFX bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.8 : 0.0001, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        if (this.ambianceEnabled) {
          this.startAmbiance();
        }
      } catch (err) {
        console.warn('AudioContext creation failed:', err);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Start procedural Gothic Ambiance (Wind howling through cathedral arches & subterranean drone)
   */
  startAmbiance() {
    if (this.isAmbianceRunning || !this.ctx) return;
    this.isAmbianceRunning = true;

    try {
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 1. Cathedral Wind - 5-second looped pinkish noise with dynamic LFO filter
      const bufferSize = ctx.sampleRate * 5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      this.windSource = ctx.createBufferSource();
      this.windSource.buffer = noiseBuffer;
      this.windSource.loop = true;

      // Resonant bandpass filter simulating cathedral acoustics
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(320, now);
      windFilter.Q.setValueAtTime(2.2, now);

      // Slow LFO for howling wind swells
      const windLfo = ctx.createOscillator();
      windLfo.type = 'sine';
      windLfo.frequency.setValueAtTime(0.09, now); // ~11s cycle

      const windLfoGain = ctx.createGain();
      windLfoGain.gain.setValueAtTime(160, now);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);

      this.windSource.connect(windFilter);
      windFilter.connect(this.ambianceGain);

      this.windSource.start(0);
      windLfo.start(0);
      this.windLfo = windLfo;

      // 2. Subterranean stone resonance drone (deep 48Hz + 72Hz fifth)
      this.droneOsc1 = ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(48, now);

      this.droneOsc2 = ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(72.2, now);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.18, now);

      this.droneOsc1.connect(droneGain);
      this.droneOsc2.connect(droneGain);
      droneGain.connect(this.ambianceGain);

      this.droneOsc1.start(0);
      this.droneOsc2.start(0);

      // 3. Periodic cathedral echo / stone drip chime (every 9-16s)
      const scheduleNextEcho = () => {
        if (!this.isAmbianceRunning) return;
        const delay = 8000 + Math.random() * 8000;
        this.dripTimer = setTimeout(() => {
          if (this.isAmbianceRunning && this.ambianceEnabled) {
            this.playCathedralEchoPing();
          }
          scheduleNextEcho();
        }, delay);
      };
      scheduleNextEcho();

    } catch (e) {
      console.warn('Error starting gothic ambiance:', e);
    }
  }

  /**
   * Cathedral cavernous stone echo ping
   */
  playCathedralEchoPing() {
    if (!this.ctx || !this.ambianceEnabled) return;
    try {
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const freq = 650 + Math.random() * 400;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.92, now + 1.8);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(6.0, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambianceGain);

      osc.start(now);
      osc.stop(now + 2.3);
    } catch (e) {}
  }

  /**
   * Stop Gothic Ambiance
   */
  stopAmbiance() {
    if (!this.isAmbianceRunning) return;
    this.isAmbianceRunning = false;
    if (this.dripTimer) {
      clearTimeout(this.dripTimer);
      this.dripTimer = null;
    }
    try {
      if (this.windSource) {
        this.windSource.stop();
        this.windSource.disconnect();
        this.windSource = null;
      }
      if (this.windLfo) {
        this.windLfo.stop();
        this.windLfo.disconnect();
        this.windLfo = null;
      }
      if (this.droneOsc1) {
        this.droneOsc1.stop();
        this.droneOsc1.disconnect();
        this.droneOsc1 = null;
      }
      if (this.droneOsc2) {
        this.droneOsc2.stop();
        this.droneOsc2.disconnect();
        this.droneOsc2 = null;
      }
    } catch (e) {}
  }

  /**
   * Toggle Gothic Ambiance on/off
   */
  toggleAmbiance(forceState = null) {
    this.ensureContext();
    const next = forceState !== null ? Boolean(forceState) : !this.ambianceEnabled;
    this.ambianceEnabled = next;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('wc_ambiance_enabled', String(this.ambianceEnabled));
    }

    if (this.ctx && this.ambianceGain) {
      const now = this.ctx.currentTime;
      this.ambianceGain.gain.cancelScheduledValues(now);
      if (this.ambianceEnabled) {
        if (!this.isAmbianceRunning) {
          this.startAmbiance();
        }
        this.ambianceGain.gain.linearRampToValueAtTime(0.32, now + 0.8);
      } else {
        this.ambianceGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
      }
    }

    this.updateUI();
    return this.ambianceEnabled;
  }

  /**
   * Toggle Spell Effects on/off
   */
  toggleSfx(forceState = null) {
    this.ensureContext();
    const next = forceState !== null ? Boolean(forceState) : !this.sfxEnabled;
    this.sfxEnabled = next;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('wc_sfx_enabled', String(this.sfxEnabled));
    }

    if (this.ctx && this.sfxGain) {
      const now = this.ctx.currentTime;
      this.sfxGain.gain.cancelScheduledValues(now);
      this.sfxGain.gain.linearRampToValueAtTime(this.sfxEnabled ? 0.8 : 0.0001, now + 0.15);
    }

    this.updateUI();
    return this.sfxEnabled;
  }

  /**
   * Synchronize UI buttons and aria attributes
   */
  updateUI() {
    const btnAmbiance = document.getElementById('btn-toggle-ambiance');
    if (btnAmbiance) {
      btnAmbiance.classList.toggle('active', this.ambianceEnabled);
      btnAmbiance.setAttribute('aria-pressed', String(this.ambianceEnabled));
      const pill = btnAmbiance.querySelector('.audio-status-pill');
      if (pill) pill.textContent = this.ambianceEnabled ? 'ON' : 'OFF';
    }

    const btnSfx = document.getElementById('btn-toggle-sfx');
    if (btnSfx) {
      btnSfx.classList.toggle('active', this.sfxEnabled);
      btnSfx.setAttribute('aria-pressed', String(this.sfxEnabled));
      const pill = btnSfx.querySelector('.audio-status-pill');
      if (pill) pill.textContent = this.sfxEnabled ? 'ON' : 'OFF';
    }
  }

  // =========================================================================
  // SPELL EFFECTS: Shatter, Wood/Stone Impacts, Spell Chimes, Checks
  // =========================================================================

  /**
   * Wood & Stone impact thud when a piece moves or lands on a square
   */
  playImpactSound(heavy = false) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Deep Sub Thud (wood/marble altar thud)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      const startFreq = heavy ? 160 : 130;
      const endFreq = heavy ? 38 : 46;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.14);

      oscGain.gain.setValueAtTime(heavy ? 0.9 : 0.65, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.22 : 0.16));

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.23);

      // 2. High transient stone click (friction / contact clack)
      const clickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
      const clickData = clickBuf.getChannelData(0);
      for (let i = 0; i < clickData.length; i++) {
        clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
      }
      const clickSource = ctx.createBufferSource();
      clickSource.buffer = clickBuf;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(1400, now);
      clickFilter.Q.setValueAtTime(3.5, now);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.4, now);

      clickSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.sfxGain);

      clickSource.start(now);
    } catch (e) {}
  }

  /**
   * Violent Stone & Crystal Shatter sound when a wizard chess piece is destroyed
   */
  playShatterSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Initial explosive impact & snap (crack!)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(480, now);
      snapOsc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

      snapGain.gain.setValueAtTime(1.0, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      snapOsc.connect(snapGain);
      snapGain.connect(this.sfxGain);
      snapOsc.start(now);
      snapOsc.stop(now + 0.19);

      // 2. Violent Stone Crunch & Debris Burst (Filtered white noise burst)
      const noiseDur = 0.55;
      const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseDur), ctx.sampleRate);
      const nData = noiseBuf.getChannelData(0);
      for (let i = 0; i < nData.length; i++) {
        const env = Math.exp(-i / (ctx.sampleRate * 0.12));
        nData[i] = (Math.random() * 2 - 1) * env;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuf;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(380, now + 0.45);
      noiseFilter.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.85, now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noiseSource.start(now);

      // 3. Shard Resonance (4 high, dissonant stone/crystal rings decaying over 0.7s)
      const shardFreqs = [720, 1180, 1920, 2750];
      shardFreqs.forEach((freq, idx) => {
        const sOsc = ctx.createOscillator();
        const sGain = ctx.createGain();
        sOsc.type = 'sine';
        sOsc.frequency.setValueAtTime(freq + (Math.random() * 40 - 20), now);

        const decay = 0.4 + idx * 0.12;
        sGain.gain.setValueAtTime(0.28 / (idx + 1), now + 0.02);
        sGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        sOsc.connect(sGain);
        sGain.connect(this.sfxGain);

        sOsc.start(now + 0.015 * idx);
        sOsc.stop(now + decay + 0.02);
      });

      // 4. Secondary micro-debris scattering aftershocks
      [0.08, 0.15, 0.22].forEach((delay) => {
        setTimeout(() => {
          if (!this.sfxEnabled || !this.ctx) return;
          this.playImpactSound(false);
        }, delay * 1000);
      });

    } catch (e) {}
  }

  /**
   * Piece selection / mystical hover chime
   */
  playSelectSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  /**
   * Spell cast / magic hum effect
   */
  playSpellCastSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.28);
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.28);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.linearRampToValueAtTime(2200, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {}
  }

  /**
   * Check indicator sound - Gothic ominous bell
   */
  playCheckSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [146.8, 220.0, 293.7]; // D minor cathedral bell
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.35 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 1.7);
      });
    } catch (e) {}
  }

  /**
   * Checkmate sound - Grand cathedral death toll
   */
  playCheckmateSound() {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [98.0, 146.8, 196.0, 246.9]; // Deep solemn Gothic chord
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.4 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 3.0);
      });
    } catch (e) {}
  }
}

export const audioManager = new WizardChessAudioManager();
