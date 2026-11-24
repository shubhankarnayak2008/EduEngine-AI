/**
 * Pure Web Audio API Ambient Sound Synthesizer & Pomodoro Bell
 * Generates Rain, Lo-Fi Pink Noise, Brown Focus Noise, and Alpha Waves (40Hz)
 * Works offline, no external audio file dependencies!
 */

class AmbientSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.currentTrack = null;
    this.nodes = [];
    this.gainNode = null;
    this.volume = 0.5;
    this.isPlaying = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.05);
    }
  }

  stop() {
    this.nodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.nodes = [];
    this.currentTrack = null;
    this.isPlaying = false;
  }

  playRain() {
    this.init();
    this.stop();

    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink/Rain noise generator
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to simulate soft raindrops hitting window
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, this.audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.gainNode);
    noiseSource.start();

    this.nodes.push(noiseSource, filter);
    this.currentTrack = 'rain';
    this.isPlaying = true;
  }

  playBrownNoise() {
    this.init();
    this.stop();

    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 2.5; // Gain compensation
    }

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);

    source.connect(filter);
    filter.connect(this.gainNode);
    source.start();

    this.nodes.push(source, filter);
    this.currentTrack = 'brown';
    this.isPlaying = true;
  }

  playAlphaBeats() {
    this.init();
    this.stop();

    // 40Hz binaural/isochronic beat generator for deep focus
    const carrierOsc = this.audioCtx.createOscillator();
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    const carrierGain = this.audioCtx.createGain();

    carrierOsc.type = 'sine';
    carrierOsc.frequency.setValueAtTime(220, this.audioCtx.currentTime); // Gentle A3 warm tone

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(40, this.audioCtx.currentTime); // 40Hz Gamma/Alpha focus
    lfoGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);

    lfo.connect(carrierGain.gain);
    carrierOsc.connect(carrierGain);
    carrierGain.connect(this.gainNode);

    carrierOsc.start();
    lfo.start();

    this.nodes.push(carrierOsc, lfo, lfoGain, carrierGain);
    this.currentTrack = 'alpha';
    this.isPlaying = true;
  }

  playLofi() {
    this.init();
    this.stop();

    // Multi-oscillator warm chord pad
    const freqs = [196.00, 246.94, 293.66, 392.00]; // G Major 7th warm chord
    freqs.forEach(f => {
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.audioCtx.currentTime);

      noteGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start();
      this.nodes.push(osc, noteGain);
    });

    this.currentTrack = 'lofi';
    this.isPlaying = true;
  }

  playChime() {
    this.init();
    // Pleasant Tibetan Singing Bowl / notification chime
    const osc = this.audioCtx.createOscillator();
    const chimeGain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5 note
    osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.1);

    chimeGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.8);

    osc.connect(chimeGain);
    chimeGain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 1.8);
  }
}

export const ambientAudio = new AmbientSoundEngine();
