/**
 * Aetheris Web Audio Procedural Sound Engine
 * Synthesizes natural ambiences (rain, ocean, fire, cafe, noise, binaural beats)
 * and ambient lofi chords purely in-browser without external audio dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeGenerators: Map<string, { gain: GainNode; nodes: AudioNode[]; stop: () => void }> = new Map();
  private isMuted: boolean = false;
  private masterVol: number = 0.8;

  // Lofi music generator state
  private musicGain: GainNode | null = null;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVol = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime, 0.05);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.masterVol, this.ctx.currentTime, 0.05);
    }
  }

  public setTrackVolume(id: string, volume: number) {
    const gen = this.activeGenerators.get(id);
    if (gen && this.ctx) {
      gen.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public stopTrack(id: string) {
    const gen = this.activeGenerators.get(id);
    if (gen) {
      try {
        gen.stop();
      } catch (e) {
        // ignore
      }
      this.activeGenerators.delete(id);
    }
  }

  public stopAll() {
    this.activeGenerators.forEach((gen) => {
      try {
        gen.stop();
      } catch (e) {}
    });
    this.activeGenerators.clear();
    this.stopMusic();
  }

  public startTrack(id: string, synthType: string, volume: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.activeGenerators.has(id)) {
      this.setTrackVolume(id, volume);
      return;
    }

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    trackGain.connect(this.masterGain);

    const nodes: AudioNode[] = [];
    let stopFn = () => {};

    switch (synthType) {
      case 'rain':
        stopFn = this.createRain(this.ctx, trackGain, nodes);
        break;
      case 'thunder':
        stopFn = this.createThunder(this.ctx, trackGain, nodes);
        break;
      case 'ocean':
        stopFn = this.createOcean(this.ctx, trackGain, nodes);
        break;
      case 'wind':
        stopFn = this.createWind(this.ctx, trackGain, nodes);
        break;
      case 'fire':
        stopFn = this.createFireplace(this.ctx, trackGain, nodes);
        break;
      case 'cafe':
        stopFn = this.createCafe(this.ctx, trackGain, nodes);
        break;
      case 'vinyl':
        stopFn = this.createVinyl(this.ctx, trackGain, nodes);
        break;
      case 'white_noise':
        stopFn = this.createWhiteNoise(this.ctx, trackGain, nodes);
        break;
      case 'pink_noise':
        stopFn = this.createPinkNoise(this.ctx, trackGain, nodes);
        break;
      case 'brown_noise':
        stopFn = this.createBrownNoise(this.ctx, trackGain, nodes);
        break;
      case 'binaural_432':
        stopFn = this.createBinaural(this.ctx, trackGain, nodes);
        break;
      case 'singing_bowl':
        stopFn = this.createSingingBowl(this.ctx, trackGain, nodes);
        break;
      default:
        stopFn = this.createPinkNoise(this.ctx, trackGain, nodes);
    }

    this.activeGenerators.set(id, { gain: trackGain, nodes, stop: stopFn });
  }

  // --- Procedural Generators ---

  private createWhiteNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createPinkNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createBrownNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  private createRain(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const buffer = this.createPinkNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Highpass to eliminate heavy mud, lowpass to simulate steady shower
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(450, ctx.currentTime);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2800, ctx.currentTime);

    source.connect(hp);
    hp.connect(lp);
    lp.connect(target);
    source.start();

    // Random droplet clicks
    const dropletInterval = setInterval(() => {
      if (Math.random() > 0.4 && ctx.state === 'running') {
        const drop = ctx.createOscillator();
        const dropGain = ctx.createGain();
        drop.frequency.setValueAtTime(1400 + Math.random() * 2200, ctx.currentTime);
        drop.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
        dropGain.gain.setValueAtTime(0.018 * Math.random(), ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        drop.connect(dropGain);
        dropGain.connect(target);
        drop.start();
        drop.stop(ctx.currentTime + 0.05);
      }
    }, 120);

    nodes.push(source, hp, lp);
    return () => {
      clearInterval(dropletInterval);
      try { source.stop(); } catch (e) {}
    };
  }

  private createThunder(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const rainBuf = this.createBrownNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = rainBuf;
    source.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(200, ctx.currentTime);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.25, ctx.currentTime);

    source.connect(lp);
    lp.connect(rumbleGain);
    rumbleGain.connect(target);
    source.start();

    // Periodic deep thunder crackle & swell
    const interval = setInterval(() => {
      if (ctx.state === 'running' && Math.random() > 0.6) {
        const now = ctx.currentTime;
        rumbleGain.gain.cancelScheduledValues(now);
        rumbleGain.gain.setValueAtTime(0.2, now);
        rumbleGain.gain.linearRampToValueAtTime(0.9, now + 1.2);
        rumbleGain.gain.exponentialRampToValueAtTime(0.2, now + 5.0);
      }
    }, 7000);

    nodes.push(source, lp, rumbleGain);
    return () => {
      clearInterval(interval);
      try { source.stop(); } catch (e) {}
    };
  }

  private createOcean(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const buffer = this.createPinkNoiseBuffer(ctx, 5);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    const swellGain = ctx.createGain();
    swellGain.gain.setValueAtTime(0.3, ctx.currentTime);

    // LFO for wave swelling
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec ocean swell

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.35, ctx.currentTime);

    lfo.connect(swellGain.gain);
    source.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(target);

    source.start();
    lfo.start();
    nodes.push(source, filter, swellGain, lfo, lfoGain);

    return () => {
      try {
        source.stop();
        lfo.stop();
      } catch (e) {}
    };
  }

  private createWind(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const buffer = this.createPinkNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(420, ctx.currentTime);
    bp.Q.setValueAtTime(3.0, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);

    lfo.connect(bp.frequency);
    source.connect(bp);
    bp.connect(target);

    source.start();
    lfo.start();
    nodes.push(source, bp, lfo, lfoGain);

    return () => {
      try {
        source.stop();
        lfo.stop();
      } catch (e) {}
    };
  }

  private createFireplace(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const brownBuffer = this.createBrownNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = brownBuffer;
    source.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(180, ctx.currentTime);

    source.connect(lp);
    lp.connect(target);
    source.start();

    // Wood pops and crackles
    const crackleInterval = setInterval(() => {
      if (ctx.state === 'running' && Math.random() > 0.3) {
        const pop = ctx.createOscillator();
        const popGain = ctx.createGain();
        pop.type = 'triangle';
        pop.frequency.setValueAtTime(600 + Math.random() * 1200, ctx.currentTime);
        popGain.gain.setValueAtTime(0.12 * Math.random(), ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02 + Math.random() * 0.04);
        pop.connect(popGain);
        popGain.connect(target);
        pop.start();
        pop.stop(ctx.currentTime + 0.06);
      }
    }, 90);

    nodes.push(source, lp);
    return () => {
      clearInterval(crackleInterval);
      try { source.stop(); } catch (e) {}
    };
  }

  private createCafe(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const buffer = this.createPinkNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filtered background murmur
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(550, ctx.currentTime);
    bp.Q.setValueAtTime(1.5, ctx.currentTime);

    source.connect(bp);
    bp.connect(target);
    source.start();

    // Occasional gentle porcelain cup clink
    const clinkInterval = setInterval(() => {
      if (ctx.state === 'running' && Math.random() > 0.7) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3200 + Math.random() * 800, ctx.currentTime);
        g.gain.setValueAtTime(0.02, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.connect(g);
        g.connect(target);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      }
    }, 3500);

    nodes.push(source, bp);
    return () => {
      clearInterval(clinkInterval);
      try { source.stop(); } catch (e) {}
    };
  }

  private createVinyl(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const buffer = this.createPinkNoiseBuffer(ctx, 3);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(3000, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);

    source.connect(hp);
    hp.connect(gain);
    gain.connect(target);
    source.start();

    // Subtle 33rpm periodic tick
    const tickInterval = setInterval(() => {
      if (ctx.state === 'running' && Math.random() > 0.4) {
        const click = ctx.createOscillator();
        const cg = ctx.createGain();
        click.frequency.setValueAtTime(800 + Math.random() * 1400, ctx.currentTime);
        cg.gain.setValueAtTime(0.015, ctx.currentTime);
        cg.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.01);
        click.connect(cg);
        cg.connect(target);
        click.start();
        click.stop(ctx.currentTime + 0.02);
      }
    }, 1800);

    nodes.push(source, hp, gain);
    return () => {
      clearInterval(tickInterval);
      try { source.stop(); } catch (e) {}
    };
  }

  private createWhiteNoise(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const buffer = this.createWhiteNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    source.connect(gain);
    gain.connect(target);
    source.start();
    nodes.push(source, gain);
    return () => { try { source.stop(); } catch (e) {} };
  }

  private createPinkNoise(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const buffer = this.createPinkNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(target);
    source.start();
    nodes.push(source);
    return () => { try { source.stop(); } catch (e) {} };
  }

  private createBrownNoise(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    const buffer = this.createBrownNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(target);
    source.start();
    nodes.push(source);
    return () => { try { source.stop(); } catch (e) {} };
  }

  private createBinaural(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    // 432 Hz carrier + 40 Hz gamma focus difference
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(216, ctx.currentTime);
    osc2.frequency.setValueAtTime(220, ctx.currentTime);

    const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panner1) panner1.pan.setValueAtTime(-0.8, ctx.currentTime);
    if (panner2) panner2.pan.setValueAtTime(0.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);

    if (panner1 && panner2) {
      osc1.connect(panner1);
      panner1.connect(gain);
      osc2.connect(panner2);
      panner2.connect(gain);
    } else {
      osc1.connect(gain);
      osc2.connect(gain);
    }
    gain.connect(target);

    osc1.start();
    osc2.start();
    nodes.push(osc1, osc2, gain);
    return () => {
      try {
        osc1.stop();
        osc2.stop();
      } catch (e) {}
    };
  }

  private createSingingBowl(ctx: AudioContext, target: GainNode, nodes: AudioNode[]): () => void {
    // Tibetan singing bowl harmonic drone
    const f0 = 261.63; // Middle C fundamental
    const harmonics = [1, 2.76, 5.4, 8.9];
    const oscs: OscillatorNode[] = [];

    harmonics.forEach((h, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f0 * h, ctx.currentTime);
      g.gain.setValueAtTime(0.06 / (i + 1), ctx.currentTime);
      osc.connect(g);
      g.connect(target);
      osc.start();
      oscs.push(osc);
      nodes.push(osc, g);
    });

    return () => {
      oscs.forEach((o) => {
        try { o.stop(); } catch (e) {}
      });
    };
  }

  // --- Ambient Lo-Fi Music Generator ---
  public startMusic(volume = 0.6) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    // Warm lush chord progressions (e.g., Dmaj9 - Bm7 - Gmaj7 - A7sus)
    const chordProgressions = [
      [293.66, 369.99, 440.0, 554.37, 659.25], // Dmaj9
      [246.94, 293.66, 369.99, 440.0],         // Bm7
      [196.00, 246.94, 293.66, 369.99, 440.0], // Gmaj7
      [220.00, 293.66, 329.63, 392.00],        // A7sus4
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.ctx || !this.musicGain || !this.isMusicPlaying) return;
      const notes = chordProgressions[chordIdx % chordProgressions.length];
      chordIdx++;
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle'; // Warm rhodes / electric piano feel
        osc.frequency.setValueAtTime(freq, now + i * 0.08); // slight strum

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.045, now + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.musicGain);

        osc.start(now + i * 0.08);
        osc.stop(now + 4.2);
      });
    };

    playChord();
    this.musicInterval = setInterval(playChord, 3600);
  }

  public setMusicVolume(vol: number) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public getMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }
}

export const soundEngine = new SoundEngine();
