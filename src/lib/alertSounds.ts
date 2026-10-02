/**
 * Procedural synthesizers for timer completion alerts
 */

export function playAlertSound(type: 'bell' | 'marimba' | 'singing_bowl' | 'gentle_chime' | 'digital' | 'none', volume = 0.8) {
  if (type === 'none' || volume <= 0) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.setValueAtTime(volume, ctx.currentTime);
    master.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'bell': {
        // Deep zen meditation bell
        const f0 = 440;
        const freqs = [f0, f0 * 1.5, f0 * 2, f0 * 2.76, f0 * 4.07];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(0.3 / (idx + 1), now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 3.6);
        });
        break;
      }
      case 'singing_bowl': {
        // Singing bowl resonance
        [329.63, 659.25, 987.77].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(0.25 / (idx + 1), now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 4.6);
        });
        break;
      }
      case 'marimba': {
        // Cheerful wooden marimba arpeggio (C5 - E5 - G5 - C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.12;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.35, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + 0.65);
        });
        break;
      }
      case 'gentle_chime': {
        // Soft windchime cascade
        const notes = [880, 1174.66, 1318.51, 1760];
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.14;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.2, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + 1.3);
        });
        break;
      }
      case 'digital': {
        // Crisp double beep
        [0, 0.15].forEach((offset) => {
          const t = now + offset;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, t);
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
          osc.connect(g);
          g.connect(master);
          osc.start(t);
          osc.stop(t + 0.09);
        });
        break;
      }
    }
  } catch (e) {
    console.warn('Audio alert error:', e);
  }
}
