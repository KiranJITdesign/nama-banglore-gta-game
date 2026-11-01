export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambienceGain = null;
    this.isMuted = false;
    this.volume = 0.8;
    this.ambienceSource = null;
    this.lastFootstepTime = 0;

    // Vehicle Engine Audio Nodes
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;

    // Police Siren Audio Nodes
    this.sirenOsc = null;
    this.sirenLFO = null;
    this.sirenGain = null;
    this.isSirenPlaying = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported in this environment.', e);
    }
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Procedural Footstep sound
   */
  playFootstep(isSprinting = false) {
    if (!this.ctx) return;
    const now = performance.now();
    const minInterval = isSprinting ? 240 : 380;
    if (now - this.lastFootstepTime < minInterval) return;
    this.lastFootstepTime = now;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isSprinting ? 650 : 480, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  /**
   * Procedural Jump sound
   */
  playJump() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Procedural Landing impact sound
   */
  playLand() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Procedural UI click
   */
  playClick() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * AUTHENTIC KARNATAKA POLICE WHISTLE (Double Shrill Blast)
   */
  playPoliceWhistle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const playTrill = (startTime, dur) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(2450, startTime);
      osc2.frequency.setValueAtTime(2780, startTime);

      // Rapid trill flutter
      lfo.frequency.setValueAtTime(18, startTime);
      lfoGain.gain.setValueAtTime(80, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.24, startTime + 0.03);
      gain.gain.setValueAtTime(0.24, startTime + dur - 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(startTime);
      osc2.start(startTime);
      lfo.start(startTime);
      osc1.stop(startTime + dur);
      osc2.stop(startTime + dur);
      lfo.stop(startTime + dur);
    };

    playTrill(t, 0.2);
    playTrill(t + 0.25, 0.3);
  }

  /**
   * AUTHENTIC BMTC BUS PNEUMATIC AIR HORN
   */
  playBusHorn(distance = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const atten = Math.max(0.05, 1.0 / (1.0 + distance * 0.04));

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, t); // A3

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(330, t); // E4 (Fifth)

    osc3.type = 'square';
    osc3.frequency.setValueAtTime(440, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    const vol = 0.35 * atten;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.04);
    gain.gain.setValueAtTime(vol, t + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);
    osc1.stop(t + 0.6);
    osc2.stop(t + 0.6);
    osc3.stop(t + 0.6);
  }

  /**
   * AUTHENTIC CAR ELECTRIC HORN
   */
  playCarHorn(distance = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const atten = Math.max(0.05, 1.0 / (1.0 + distance * 0.04));

    const playBeep = (startTime, duration) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(440, startTime);
      osc2.frequency.setValueAtTime(554, startTime);

      const vol = 0.22 * atten;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
      gain.gain.setValueAtTime(vol, startTime + duration - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    playBeep(t, 0.16);
    playBeep(t + 0.22, 0.18);
  }

  /**
   * AUTHENTIC BENGALURU AUTO-RICKSHAW HORN
   */
  playAutoHorn(distance = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const atten = Math.max(0.05, 1.0 / (1.0 + distance * 0.04));

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(520, t);
    osc2.frequency.setValueAtTime(650, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, t);
    filter.Q.setValueAtTime(2.8, t);

    const vol = 0.25 * atten;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.28);
    osc2.stop(t + 0.28);
  }

  playHorn(distance = 0) {
    this.playAutoHorn(distance);
  }

  /**
   * VEHICLE ENGINE REALTIME SOUND SYNTHESIS
   */
  startEngine(type = 'car') {
    if (!this.ctx || this.isEngineRunning) return;
    try {
      const t = this.ctx.currentTime;

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';

      const baseFreq = type === 'bus' ? 45 : (type === 'auto' ? 70 : 55);
      this.engineOsc1.frequency.setValueAtTime(baseFreq, t);
      this.engineOsc2.frequency.setValueAtTime(baseFreq * 0.5, t);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(type === 'bus' ? 320 : 450, t);

      this.engineGain.gain.setValueAtTime(0.01, t);
      this.engineGain.gain.linearRampToValueAtTime(0.18, t + 0.2);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
      this.vehicleType = type;
    } catch (e) {
      console.warn('Could not start vehicle engine audio.', e);
    }
  }

  updateEngine(speed, maxSpeed, isAccelerating) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc1) return;
    const t = this.ctx.currentTime;

    const ratio = Math.max(0, Math.min(1.0, Math.abs(speed) / (maxSpeed || 80)));
    const baseFreq = this.vehicleType === 'bus' ? 45 : (this.vehicleType === 'auto' ? 70 : 55);

    // RPM ramp
    const currentFreq = baseFreq + ratio * 140 + (isAccelerating ? 25 : 0);
    this.engineOsc1.frequency.setTargetAtTime(currentFreq, t, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(currentFreq * 0.5, t, 0.08);

    // Filter opening with speed
    const cutoff = (this.vehicleType === 'bus' ? 320 : 450) + ratio * 600;
    this.engineFilter.frequency.setTargetAtTime(cutoff, t, 0.08);

    // Volume modulation
    const vol = 0.14 + (isAccelerating ? 0.08 : 0) + ratio * 0.06;
    this.engineGain.gain.setTargetAtTime(vol, t, 0.08);
  }

  stopEngine() {
    if (!this.ctx || !this.isEngineRunning) return;
    try {
      const t = this.ctx.currentTime;
      if (this.engineGain) {
        this.engineGain.gain.linearRampToValueAtTime(0.001, t + 0.15);
      }
      setTimeout(() => {
        if (this.engineOsc1) {
          this.engineOsc1.stop();
          this.engineOsc1.disconnect();
          this.engineOsc1 = null;
        }
        if (this.engineOsc2) {
          this.engineOsc2.stop();
          this.engineOsc2.disconnect();
          this.engineOsc2 = null;
        }
        this.isEngineRunning = false;
      }, 180);
    } catch (e) {
      console.warn('Error stopping engine audio.', e);
      this.isEngineRunning = false;
    }
  }

  /**
   * CRASH IMPACT SOUND
   */
  playCrash(severity = 1.0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Noise impact
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 * severity, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * severity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);

    // Metallic crunch tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.22);

    oscGain.gain.setValueAtTime(0.35 * severity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * GTA-STYLE WASTED SOUND
   */
  playWastedSound() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, t);
    osc1.frequency.exponentialRampToValueAtTime(32, t + 1.2);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, t);
    osc2.frequency.exponentialRampToValueAtTime(45, t + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, t);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.5);
    osc2.stop(t + 1.5);
  }

  /**
   * POLICE DUAL-TONE OSCILLATING SIREN (WAIL / YELP)
   */
  startSiren(distance = 10) {
    if (!this.ctx || this.isSirenPlaying) return;
    try {
      const t = this.ctx.currentTime;
      const atten = Math.max(0.08, 1.0 / (1.0 + distance * 0.05));

      // Main Siren Oscillator (Sawtooth/Triangle blend)
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenOsc.type = 'sawtooth';
      this.sirenOsc.frequency.setValueAtTime(750, t);

      // Low Frequency Oscillator (LFO) for authentic rising/falling wail
      this.sirenLFO = this.ctx.createOscillator();
      this.sirenLFO.type = 'sine';
      this.sirenLFO.frequency.setValueAtTime(0.85, t); // 0.85 Hz wail cycle

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(220, t); // Pitch swing +/- 220 Hz (530 Hz to 970 Hz)

      this.sirenLFO.connect(lfoGain);
      lfoGain.connect(this.sirenOsc.frequency);

      // Filter to take edge off
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      this.sirenGain = this.ctx.createGain();
      this.sirenGain.gain.setValueAtTime(0.01, t);
      this.sirenGain.gain.linearRampToValueAtTime(0.28 * atten, t + 0.3);

      this.sirenOsc.connect(filter);
      filter.connect(this.sirenGain);
      this.sirenGain.connect(this.masterGain);

      this.sirenOsc.start();
      this.sirenLFO.start();
      this.isSirenPlaying = true;
    } catch (e) {
      console.warn('Could not start police siren.', e);
    }
  }

  updateSiren(distance = 10) {
    if (!this.ctx || !this.isSirenPlaying || !this.sirenGain) return;
    const atten = Math.max(0.05, 1.0 / (1.0 + distance * 0.04));
    this.sirenGain.gain.setTargetAtTime(0.28 * atten, this.ctx.currentTime, 0.1);
  }

  stopSiren() {
    if (!this.ctx || !this.isSirenPlaying) return;
    try {
      const t = this.ctx.currentTime;
      if (this.sirenGain) {
        this.sirenGain.gain.linearRampToValueAtTime(0.001, t + 0.3);
      }
      setTimeout(() => {
        if (this.sirenOsc) {
          this.sirenOsc.stop();
          this.sirenOsc.disconnect();
          this.sirenOsc = null;
        }
        if (this.sirenLFO) {
          this.sirenLFO.stop();
          this.sirenLFO.disconnect();
          this.sirenLFO = null;
        }
        this.isSirenPlaying = false;
      }, 350);
    } catch (e) {
      console.warn('Error stopping siren.', e);
      this.isSirenPlaying = false;
    }
  }

  /**
   * PUNCH / MELEE IMPACT SOUND
   */
  playPunch() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  /**
   * PROPERTY SMASH / DESTRUCTION SOUND
   */
  playPropSmash() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Metallic crunch noise
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, t);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  /**
   * Urban Bengaluru Ambience
   */
  startAmbience() {
    if (!this.ctx || this.ambienceSource) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      this.ambienceSource = this.ctx.createBufferSource();
      this.ambienceSource.buffer = buffer;
      this.ambienceSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      this.ambienceSource.connect(filter);
      filter.connect(this.ambienceGain);

      this.ambienceSource.start();
    } catch (e) {
      console.warn('Could not start city ambience.', e);
    }
  }
}
