// ---------------------------------------------------------------------------
// Synthesized sound design via the Web Audio API — no external audio files,
// no licensing concerns, tiny footprint. Every "sound" below is a short
// envelope-shaped tone (or a few stacked tones) built at call time.
//
// Browsers block audio until a user gesture, so the AudioContext is created
// lazily on the first call to `unlock()` (wired to the first pointerdown/
// keydown in the app).
// ---------------------------------------------------------------------------

const MUTE_KEY = 'byf_muted_v1';

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.muted = this._readMuted();
  }

  _readMuted() {
    try {
      return window.localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  }

  _writeMuted(value) {
    try {
      window.localStorage.setItem(MUTE_KEY, value ? '1' : '0');
    } catch {
      /* ignore quota/availability errors — muting is a nice-to-have */
    }
  }

  /** Must be called from within a user-gesture event handler at least once. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return; // Web Audio unsupported — game still works silently.
    this.ctx = new Ctx();

    // A firm limiter on the output so we can push individual sound gains
    // much harder (for a louder, punchier feel on kiosk/tablet speakers)
    // without the mix hard-clipping into harsh digital distortion.
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 6;
    this.compressor.ratio.value = 16;
    this.compressor.attack.value = 0.001;
    this.compressor.release.value = 0.25;
    this.compressor.connect(this.ctx.destination);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 1.4;
    this.masterGain.connect(this.compressor);
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted) {
    this.muted = muted;
    this._writeMuted(muted);
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1.4, this.ctx.currentTime, 0.02);
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Play one tone: a short oscillator burst with an attack/decay envelope.
   * @param {object} opts
   * @param {number} opts.freq - starting frequency (Hz)
   * @param {number} [opts.endFreq] - optional pitch glide target
   * @param {OscillatorType} [opts.type] - waveform
   * @param {number} [opts.duration] - seconds
   * @param {number} [opts.gain] - peak volume 0-1
   * @param {number} [opts.delay] - seconds from now to start
   */
  _tone({ freq, endFreq, type = 'sine', duration = 0.15, gain = 0.25, delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t0 + duration);

    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + Math.min(0.015, duration / 4));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  /** Soft UI tap — used for general button presses. */
  click() {
    this._tone({ freq: 720, type: 'sine', duration: 0.06, gain: 0.18 });
  }

  /** Asset card selected — a bright, rising two-note chime. */
  select() {
    this._tone({ freq: 523.25, type: 'sine', duration: 0.09, gain: 0.22 });
    this._tone({ freq: 783.99, type: 'sine', duration: 0.14, gain: 0.2, delay: 0.06 });
  }

  /** Asset card deselected — a soft descending tone. */
  deselect() {
    this._tone({ freq: 523.25, endFreq: 349.23, type: 'sine', duration: 0.12, gain: 0.16 });
  }

  /** Insufficient budget / invalid action. */
  error() {
    this._tone({ freq: 220, type: 'square', duration: 0.09, gain: 0.14 });
    this._tone({ freq: 174.61, type: 'square', duration: 0.14, gain: 0.14, delay: 0.09 });
  }

  /** Screen-to-screen transition swoosh. */
  transition() {
    this._tone({ freq: 300, endFreq: 900, type: 'sine', duration: 0.22, gain: 0.12 });
  }

  /**
   * A real game-show-style tension riser played once, right as the wheel
   * starts spinning — several staggered bandpass-noise swells that climb in
   * both pitch and volume across the spin (a genuine "riser" build, the way
   * EDM drops or game-show reveals build anticipation), a rising two-tone
   * drone underneath for body, and a pulse train that both speeds up AND
   * gets louder toward the end, like a heartbeat/drumroll tightening right
   * before the big reveal. Considerably bigger than a single soft drone —
   * meant to actually feel exciting while the wheel spins, not just present.
   * @param {number} durationSec - should match the wheel's spin animation duration
   */
  wheelSuspense(durationSec = 4.2) {
    if (!this.ctx || this.muted) return;
    // Rising riser: each swell is brighter (higher filter sweep) and louder
    // than the last, staggered across the spin. A single _noise envelope
    // caps its attack at duration/3, so a multi-second crescendo has to be
    // composed from a staggered sequence like this — same approach the
    // hurricane/flood beds use for their continuous wind/water sound.
    const swellCount = 7;
    for (let i = 0; i < swellCount; i++) {
      const frac = i / (swellCount - 1);
      const t = frac * durationSec * 0.82;
      const swellDur = durationSec / swellCount + 0.35;
      this._noise({
        duration: swellDur,
        gain: 0.09 + frac * 0.24,
        filterType: 'bandpass',
        filterFreq: 250 + frac * 2200,
        filterEndFreq: 400 + frac * 2600,
        filterQ: 0.7,
        delay: t,
        attack: swellDur * 0.3,
      });
    }
    // Rising two-tone drone underneath for body/pitch lift across the whole spin.
    this._tone({ freq: 90, endFreq: 240, type: 'sawtooth', duration: durationSec, gain: 0.08 });
    this._tone({ freq: 135, endFreq: 360, type: 'triangle', duration: durationSec, gain: 0.06 });
    // Crescendo of pulses that speed up AND get louder toward the end.
    const pulseCount = 20;
    for (let i = 0; i < pulseCount; i++) {
      const frac = i / pulseCount;
      const t = Math.pow(frac, 0.5) * durationSec;
      const gain = 0.08 + frac * 0.2;
      this._tone({ freq: 220 + frac * 120, type: 'sine', duration: 0.07, gain, delay: t });
      this._noise({ duration: 0.02, gain: 0.06 + frac * 0.16, filterType: 'highpass', filterFreq: 3500, delay: t, attack: 0.001 });
    }
  }

  /**
   * Single tick of the spinning wheel passing a segment boundary — a sharp,
   * mechanical "clack" (a quick click tone plus a tiny noise transient),
   * like a real peg wheel, with a little random pitch variation per tick so
   * a long spin doesn't sound like the exact same robotic blip repeating.
   */
  wheelTick() {
    const freq = 1000 + Math.random() * 300;
    this._tone({ freq, type: 'square', duration: 0.025, gain: 0.2 });
    this._noise({ duration: 0.02, gain: 0.16, filterType: 'highpass', filterFreq: 4000, attack: 0.001 });
  }

  /**
   * Wheel coming to rest on a result — a big "game show reveal" sting: a
   * sharp impact thud, a bright bell/glockenspiel-like "ding" layer (several
   * close high harmonics decaying fast), a fuller four-note descending
   * brass-like stab (was three notes), and a bigger sparkle/crash texture —
   * so landing on a disaster actually feels like a dramatic reveal moment
   * instead of two soft triangle notes.
   */
  wheelLand() {
    this._noise({ duration: 0.14, gain: 0.55, filterType: 'lowpass', filterFreq: 2000, drive: 0.55, attack: 0.002 });
    this._tone({ freq: 100, endFreq: 35, type: 'sine', duration: 0.4, gain: 0.44 });
    [1568, 1975.5, 2349.3].forEach((freq, i) => {
      this._tone({ freq, type: 'sine', duration: 0.5, gain: 0.24 - i * 0.04, delay: 0.02 });
    });
    [880, 698.46, 523.25, 392].forEach((freq, i) => {
      this._tone({ freq, type: 'sawtooth', duration: 0.24, gain: 0.3, delay: 0.05 + i * 0.08 });
    });
    this._crackle({ count: 16, delayRange: [0.05, 0.6], durationRange: [0.03, 0.08], gainRange: [0.14, 0.28], freqRange: [3500, 8000], filterType: 'highpass' });
  }

  /**
   * Builds a soft-clip waveshaping curve — used to add "grit"/distortion to
   * impact noise so crashes and crunches read as real destruction rather
   * than clean, synthetic-sounding filtered static.
   * @param {number} amount - 0 = no added grit, higher = more aggressive clip
   */
  _distortionCurve(amount = 0) {
    const n = 512;
    const curve = new Float32Array(n);
    const k = amount * 60;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Short filtered burst of white noise with an attack/decay envelope — the
   * textured counterpart to `_tone`, used to build crackle/rumble/impact
   * sounds that a pure oscillator can't convincingly produce.
   * @param {object} opts
   * @param {number} [opts.duration] - seconds
   * @param {number} [opts.gain] - peak volume 0-1
   * @param {BiquadFilterType} [opts.filterType]
   * @param {number} [opts.filterFreq] - filter cutoff/center frequency (Hz)
   * @param {number} [opts.filterEndFreq] - optional filter sweep target, for
   *   gust/flyby/rising-water effects (e.g. a jet passing overhead)
   * @param {number} [opts.filterQ]
   * @param {number} [opts.delay] - seconds from now to start
   * @param {number} [opts.attack] - seconds to ramp up to peak gain
   * @param {number} [opts.drive] - 0-1+, adds waveshaper grit/crunch before
   *   filtering (for metal/impact textures) — 0 or omitted stays clean
   */
  _noise({
    duration = 0.3,
    gain = 0.2,
    filterType = 'lowpass',
    filterFreq = 1200,
    filterEndFreq,
    filterQ = 1,
    delay = 0,
    attack = 0.01,
    drive = 0,
  }) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const bufferSize = Math.max(1, Math.ceil(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, t0);
    if (filterEndFreq) filter.frequency.exponentialRampToValueAtTime(Math.max(filterEndFreq, 1), t0 + duration);
    filter.Q.value = filterQ;

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + Math.min(attack, duration / 3));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    if (drive > 0) {
      const shaper = this.ctx.createWaveShaper();
      shaper.curve = this._distortionCurve(drive);
      shaper.oversample = '2x';
      src.connect(shaper);
      shaper.connect(filter);
    } else {
      src.connect(filter);
    }
    filter.connect(env);
    env.connect(this.masterGain);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  }

  /**
   * Fires a cluster of randomized short noise bursts — glass shards, embers,
   * raindrops, debris — so repeated textures sound organic and chaotic
   * rather than like the same sample looped on a fixed grid.
   * @param {object} opts
   * @param {number} [opts.count]
   * @param {[number,number]} [opts.delayRange] - seconds
   * @param {[number,number]} [opts.durationRange] - seconds
   * @param {[number,number]} [opts.gainRange] - 0-1
   * @param {[number,number]} [opts.freqRange] - Hz, filter center/cutoff
   * @param {BiquadFilterType} [opts.filterType]
   * @param {number} [opts.filterQ]
   * @param {number} [opts.drive]
   */
  _crackle({
    count = 8,
    delayRange = [0, 0.6],
    durationRange = [0.03, 0.08],
    gainRange = [0.15, 0.3],
    freqRange = [3000, 7000],
    filterType = 'highpass',
    filterQ = 1,
    drive = 0,
  }) {
    for (let i = 0; i < count; i++) {
      this._noise({
        duration: durationRange[0] + Math.random() * (durationRange[1] - durationRange[0]),
        gain: gainRange[0] + Math.random() * (gainRange[1] - gainRange[0]),
        filterType,
        filterFreq: freqRange[0] + Math.random() * (freqRange[1] - freqRange[0]),
        filterQ,
        delay: delayRange[0] + Math.random() * (delayRange[1] - delayRange[0]),
        drive,
      });
    }
  }

  /**
   * A genuine wailing two-tone siren — built from real frequency automation
   * (`setValueCurveAtTime`, ramping smoothly between two pitches) rather
   * than a metronome of identical blips, so security/medical alarms read
   * as an actual siren instead of a beeping timer.
   * @param {object} opts
   * @param {number} [opts.lowFreq] - Hz, bottom of the wail
   * @param {number} [opts.highFreq] - Hz, top of the wail
   * @param {number} [opts.cycleDuration] - seconds per up-down wail cycle
   * @param {number} [opts.cycles] - number of full wail cycles
   * @param {OscillatorType} [opts.type]
   * @param {number} [opts.gain]
   * @param {number} [opts.delay]
   */
  _siren({ lowFreq = 500, highFreq = 1000, cycleDuration = 0.5, cycles = 3, type = 'sawtooth', gain = 0.3, delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const totalDuration = cycleDuration * cycles;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;

    const stepsPerCycle = 32;
    const curve = new Float32Array(stepsPerCycle * cycles + 1);
    for (let c = 0; c < cycles; c++) {
      for (let s = 0; s < stepsPerCycle; s++) {
        const phase = s / stepsPerCycle;
        const wail = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
        curve[c * stepsPerCycle + s] = lowFreq + wail * (highFreq - lowFreq);
      }
    }
    curve[stepsPerCycle * cycles] = lowFreq;
    osc.frequency.setValueCurveAtTime(curve, t0, totalDuration);

    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + 0.05);
    env.gain.setValueAtTime(gain, Math.max(t0 + 0.05, t0 + totalDuration - 0.12));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + totalDuration);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(t0);
    osc.stop(t0 + totalDuration + 0.05);
  }

  /**
   * Dramatic "the disaster just hit" sting played once when the Damage
   * Assessment screen reveals a new outcome, before the per-asset reveal
   * chimes. Every disaster (keyed by its `key` in gameConfig.js — not just
   * its broader `category`) gets its own distinct sound built as a small
   * narrative arc — lead-in, impact, settle — using distortion (`drive`)
   * for grit on the core hits and randomized burst clusters (`_crackle`)
   * for organic texture (glass, embers, rain, debris) instead of a few
   * clean repeated tones. Tuned to be clearly audible, long enough to read
   * as a real event (roughly 1.9-3.9s), and grittier/messier on impact
   * sounds specifically so a collision reads like an actual crash rather
   * than a synthesized blip. No external audio files, so it stays tiny and
   * license-free like the rest of the engine.
   * @param {string} disasterKey - a DISASTERS[].key from gameConfig.js
   */
  disasterImpact(disasterKey) {
    switch (disasterKey) {
      case 'hurricane':
        // Continuous wind bed (overlapping low bandpass bursts) plus a
        // real wavering "howl" — a triangle tone sweeping back and forth
        // between two pitches like wind whistling around a house — under
        // a heavy landfall boom and a second surging gust, now followed by
        // a third gust wave as the storm keeps rolling through — ~3.4s.
        this._crackle({ count: 6, delayRange: [0, 1.9], durationRange: [0.35, 0.55], gainRange: [0.18, 0.28], freqRange: [200, 600], filterType: 'bandpass', filterQ: 1.2 });
        this._tone({ freq: 380, endFreq: 300, type: 'triangle', duration: 0.5, gain: 0.1 });
        this._tone({ freq: 320, endFreq: 420, type: 'triangle', duration: 0.5, gain: 0.09, delay: 0.5 });
        this._tone({ freq: 400, endFreq: 280, type: 'triangle', duration: 0.5, gain: 0.08, delay: 1.0 });
        this._tone({ freq: 65, endFreq: 40, type: 'sine', duration: 1.0, gain: 0.26 });
        this._noise({ duration: 0.5, gain: 0.5, filterType: 'lowpass', filterFreq: 320, drive: 0.5, delay: 0.9, attack: 0.02 });
        this._tone({ freq: 45, type: 'sine', duration: 0.75, gain: 0.44, delay: 0.95 });
        this._noise({ duration: 0.9, gain: 0.26, filterType: 'bandpass', filterFreq: 200, filterEndFreq: 600, filterQ: 0.7, delay: 1.3, attack: 0.2 });
        this._tone({ freq: 55, endFreq: 30, type: 'sine', duration: 0.85, gain: 0.2, delay: 1.3 });
        this._crackle({ count: 5, delayRange: [1.9, 2.7], durationRange: [0.3, 0.5], gainRange: [0.14, 0.22], freqRange: [200, 550], filterType: 'bandpass', filterQ: 1.1 });
        this._tone({ freq: 340, endFreq: 260, type: 'triangle', duration: 0.45, gain: 0.08, delay: 1.9 });
        this._noise({ duration: 0.7, gain: 0.24, filterType: 'bandpass', filterFreq: 180, filterEndFreq: 500, filterQ: 0.7, delay: 2.05, attack: 0.15 });
        this._tone({ freq: 42, endFreq: 26, type: 'sine', duration: 0.65, gain: 0.18, delay: 2.1 });
        break;

      case 'fire':
        // Full rebuild — no more low rumble tone (that read as generic
        // impact/rumble, not fire). Instead: a continuous "roar" bed made
        // of overlapping mid-bandpass bursts long enough to blend into a
        // sustained whoosh, a dense high-passed pop layer for the classic
        // crackle texture, and a couple of bigger resonant "log crack"
        // bursts with drive/grit — the combination is what actually reads
        // as fire. Extended further to keep roaring/crackling longer — ~3.1s.
        this._crackle({ count: 8, delayRange: [0, 2.6], durationRange: [0.3, 0.5], gainRange: [0.16, 0.26], freqRange: [500, 1600], filterType: 'bandpass', filterQ: 0.9 });
        this._crackle({ count: 26, delayRange: [0, 2.9], durationRange: [0.02, 0.06], gainRange: [0.18, 0.36], freqRange: [2200, 5200], filterType: 'highpass', drive: 0.15 });
        this._crackle({ count: 4, delayRange: [0.3, 2.7], durationRange: [0.06, 0.12], gainRange: [0.34, 0.46], freqRange: [900, 2200], filterType: 'bandpass', filterQ: 4, drive: 0.4 });
        break;

      case 'vehicle_accident':
        // Built as a real crash narrative rather than a single blip: tires
        // screech in, metal crunches hard (distorted for real "crunch"
        // texture) with a sub-bass gut-punch, a 14-shard randomized glass
        // shower rains down, a stuck horn drones on and fades, a second
        // smaller bounce-impact hits, then debris rattles and settles for
        // longer — ~2.8s total.
        this._tone({ freq: 1400, endFreq: 250, type: 'sawtooth', duration: 0.4, gain: 0.3 });
        this._noise({ duration: 0.38, gain: 0.18, filterType: 'bandpass', filterFreq: 700, filterEndFreq: 300, filterQ: 3, delay: 0.02 });
        this._noise({ duration: 0.4, gain: 0.62, filterType: 'lowpass', filterFreq: 1200, drive: 0.8, attack: 0.002, delay: 0.42 });
        this._tone({ freq: 100, endFreq: 32, type: 'sine', duration: 0.6, gain: 0.5, delay: 0.43 });
        this._noise({ duration: 0.22, gain: 0.36, filterType: 'bandpass', filterFreq: 500, filterQ: 5, drive: 0.6, delay: 0.43 });
        this._crackle({ count: 14, delayRange: [0.46, 1.15], durationRange: [0.02, 0.06], gainRange: [0.12, 0.34], freqRange: [3500, 7500], filterType: 'highpass', drive: 0.25 });
        this._tone({ freq: 420, type: 'sawtooth', duration: 1.7, gain: 0.15, delay: 0.5 });
        this._noise({ duration: 0.16, gain: 0.32, filterType: 'lowpass', filterFreq: 1000, drive: 0.4, delay: 0.78, attack: 0.004 });
        this._tone({ freq: 85, endFreq: 36, type: 'sine', duration: 0.28, gain: 0.24, delay: 0.79 });
        this._crackle({ count: 8, delayRange: [1.1, 2.3], durationRange: [0.04, 0.09], gainRange: [0.08, 0.18], freqRange: [500, 1800], filterType: 'bandpass', filterQ: 8, drive: 0.15 });
        this._crackle({ count: 4, delayRange: [2.1, 2.7], durationRange: [0.03, 0.07], gainRange: [0.05, 0.12], freqRange: [500, 1500], filterType: 'bandpass', filterQ: 6, drive: 0.1 });
        break;

      case 'flood':
        // Rain patters in (denser, randomized), a continuous rushing-water
        // bed made of several overlapping swells (not one flat rise), then
        // a deep undertow tone settles, with a second wave of rain trailing
        // off at the end — ~2.9s.
        this._crackle({ count: 16, delayRange: [0, 1.6], durationRange: [0.04, 0.09], gainRange: [0.16, 0.32], freqRange: [4500, 8000], filterType: 'highpass' });
        this._crackle({ count: 5, delayRange: [0, 1.8], durationRange: [0.35, 0.55], gainRange: [0.2, 0.3], freqRange: [200, 550], filterType: 'lowpass', filterQ: 0.8 });
        this._noise({ duration: 1.9, gain: 0.38, filterType: 'lowpass', filterFreq: 250, filterEndFreq: 600, attack: 0.35 });
        this._tone({ freq: 70, endFreq: 42, type: 'sine', duration: 2.0, gain: 0.3 });
        this._crackle({ count: 8, delayRange: [1.7, 2.6], durationRange: [0.04, 0.09], gainRange: [0.12, 0.24], freqRange: [4000, 7500], filterType: 'highpass' });
        break;

      case 'medical_abroad':
        // A plane flyby (bandpass noise sweeping up then receding, like an
        // engine passing overhead), then a real wailing ambulance-style
        // siren (not discrete beeps), then one final urgent tone — the
        // "overseas" and "emergency" halves of the event, now genuinely
        // alarming, with one extra siren cycle for length — ~3.9s.
        this._noise({ duration: 0.8, gain: 0.38, filterType: 'bandpass', filterFreq: 300, filterEndFreq: 1600, filterQ: 1.1, attack: 0.12 });
        this._noise({ duration: 0.7, gain: 0.32, filterType: 'bandpass', filterFreq: 1600, filterEndFreq: 240, filterQ: 1.1, delay: 0.75, attack: 0.05 });
        this._siren({ lowFreq: 600, highFreq: 950, cycleDuration: 0.45, cycles: 4, type: 'sawtooth', gain: 0.28, delay: 1.5 });
        this._tone({ freq: 1000, type: 'sine', duration: 0.2, gain: 0.3, delay: 3.4 });
        break;

      case 'storm_boat':
        // A long, held foghorn blast over a continuous choppy-water bed
        // (several overlapping low swells, not two flat slaps), then one
        // big wave crashes over the hull, then a second smaller wave rocks
        // the boat as it settles — ~2.9s.
        this._crackle({ count: 6, delayRange: [0, 2.2], durationRange: [0.3, 0.5], gainRange: [0.14, 0.22], freqRange: [250, 550], filterType: 'lowpass', filterQ: 0.8 });
        this._tone({ freq: 130, type: 'sine', duration: 1.7, gain: 0.42, delay: 0.02 });
        this._tone({ freq: 130, type: 'triangle', duration: 1.7, gain: 0.18, delay: 0.02 });
        this._noise({ duration: 0.4, gain: 0.5, filterType: 'lowpass', filterFreq: 700, drive: 0.3, delay: 1.8, attack: 0.02 });
        this._tone({ freq: 70, endFreq: 40, type: 'sine', duration: 0.45, gain: 0.28, delay: 1.8 });
        this._noise({ duration: 0.3, gain: 0.32, filterType: 'lowpass', filterFreq: 600, drive: 0.2, delay: 2.35, attack: 0.02 });
        this._tone({ freq: 60, endFreq: 32, type: 'sine', duration: 0.35, gain: 0.18, delay: 2.35 });
        break;

      case 'business_interruption':
        // A bigger cascading "systems failing" sequence — four glitching
        // stages tumbling downward in pitch (was three, now longer and
        // more dramatic) before a long, deep final flatline fade — extended
        // with a fifth stage and a longer fade-out — ~3.4s.
        this._tone({ freq: 520, endFreq: 320, type: 'triangle', duration: 0.22, gain: 0.34 });
        this._noise({ duration: 0.05, gain: 0.24, filterType: 'highpass', filterFreq: 3200, drive: 0.4, delay: 0.24 });
        this._tone({ freq: 340, endFreq: 220, type: 'triangle', duration: 0.4, gain: 0.32, delay: 0.3 });
        this._noise({ duration: 0.05, gain: 0.22, filterType: 'highpass', filterFreq: 2800, drive: 0.35, delay: 0.72 });
        this._tone({ freq: 240, endFreq: 150, type: 'triangle', duration: 0.5, gain: 0.28, delay: 0.78 });
        this._noise({ duration: 0.04, gain: 0.18, filterType: 'highpass', filterFreq: 2400, drive: 0.3, delay: 1.3 });
        this._tone({ freq: 160, endFreq: 95, type: 'triangle', duration: 0.55, gain: 0.24, delay: 1.36 });
        this._noise({ duration: 0.035, gain: 0.14, filterType: 'highpass', filterFreq: 2000, drive: 0.2, delay: 1.9 });
        this._tone({ freq: 100, endFreq: 40, type: 'triangle', duration: 0.7, gain: 0.18, delay: 1.95 });
        this._noise({ duration: 0.03, gain: 0.1, filterType: 'highpass', filterFreq: 1700, drive: 0.15, delay: 2.6 });
        this._tone({ freq: 60, endFreq: 22, type: 'triangle', duration: 0.75, gain: 0.13, delay: 2.65 });
        break;

      case 'theft':
        // A window pried open (a scrape then a crack), then a real
        // wailing security siren — not a metronome of blips — extended one
        // more cycle for length — ~2.7s.
        this._noise({ duration: 0.3, gain: 0.14, filterType: 'bandpass', filterFreq: 2000, filterQ: 4, attack: 0.1 });
        this._noise({ duration: 0.06, gain: 0.3, filterType: 'highpass', filterFreq: 6000, delay: 0.3 });
        this._siren({ lowFreq: 550, highFreq: 950, cycleDuration: 0.4, cycles: 5, type: 'square', gain: 0.26, delay: 0.5 });
        break;

      case 'fender_bender':
        // Still clearly smaller than the full crash (no glass), but no
        // longer a blink-and-miss-it blip: screech, a real thump, a
        // startled horn tap, and a couple of rattly settle bursts — ~1.9s.
        this._tone({ freq: 1300, endFreq: 280, type: 'sawtooth', duration: 0.32, gain: 0.32 });
        this._noise({ duration: 0.24, gain: 0.42, filterType: 'lowpass', filterFreq: 1100, drive: 0.35, delay: 0.3, attack: 0.008 });
        this._tone({ freq: 90, endFreq: 45, type: 'sine', duration: 0.24, gain: 0.22, delay: 0.31 });
        this._tone({ freq: 400, type: 'square', duration: 0.25, gain: 0.14, delay: 0.62 });
        this._noise({ duration: 0.14, gain: 0.2, filterType: 'bandpass', filterFreq: 700, filterQ: 6, delay: 0.95 });
        this._noise({ duration: 0.1, gain: 0.13, filterType: 'bandpass', filterFreq: 600, filterQ: 6, delay: 1.2 });
        this._noise({ duration: 0.08, gain: 0.09, filterType: 'bandpass', filterFreq: 550, filterQ: 6, delay: 1.5 });
        break;

      case 'wildfire':
        // The biggest fire treatment — same roar-bed/pop/crack recipe as
        // `fire` but wider, denser, and longer to read as a much larger
        // blaze, plus a faint deep undertone (far quieter than the old
        // rumble-only version) purely for scale, extended further to read
        // as a much longer-burning blaze — ~3.6s.
        this._crackle({ count: 11, delayRange: [0, 3.3], durationRange: [0.35, 0.6], gainRange: [0.2, 0.32], freqRange: [400, 1400], filterType: 'bandpass', filterQ: 0.8 });
        this._crackle({ count: 34, delayRange: [0, 3.4], durationRange: [0.03, 0.08], gainRange: [0.22, 0.4], freqRange: [1900, 4800], filterType: 'highpass', drive: 0.2 });
        this._crackle({ count: 6, delayRange: [0.3, 3.2], durationRange: [0.08, 0.16], gainRange: [0.38, 0.52], freqRange: [700, 2000], filterType: 'bandpass', filterQ: 4, drive: 0.5 });
        this._tone({ freq: 55, endFreq: 30, type: 'sine', duration: 2.8, gain: 0.2 });
        break;

      case 'storm_system':
        // A howling wind bed under a hard thunderclap (distorted for a
        // harder crack), a long rolling rumble, then two more distant
        // cracks rolling through like an echo — bigger and more layered
        // since this one hits four assets at once, with a third, more
        // distant echo of thunder rolling out at the very end — ~3.8s.
        this._crackle({ count: 8, delayRange: [0, 3.0], durationRange: [0.3, 0.5], gainRange: [0.14, 0.22], freqRange: [220, 600], filterType: 'bandpass', filterQ: 1.0 });
        this._noise({ duration: 0.15, gain: 0.6, filterType: 'lowpass', filterFreq: 2200, drive: 0.7, attack: 0.001 });
        this._noise({ duration: 1.8, gain: 0.34, filterType: 'lowpass', filterFreq: 160, delay: 0.08, attack: 0.08 });
        this._noise({ duration: 1.3, gain: 0.24, filterType: 'bandpass', filterFreq: 260, filterEndFreq: 650, filterQ: 0.6, delay: 0.16 });
        this._tone({ freq: 52, endFreq: 30, type: 'sine', duration: 1.7, gain: 0.36, delay: 0.09 });
        this._noise({ duration: 0.1, gain: 0.42, filterType: 'lowpass', filterFreq: 2000, drive: 0.5, delay: 0.95, attack: 0.001 });
        this._tone({ freq: 48, endFreq: 26, type: 'sine', duration: 0.8, gain: 0.28, delay: 0.96 });
        this._noise({ duration: 0.08, gain: 0.32, filterType: 'lowpass', filterFreq: 1800, drive: 0.35, delay: 1.9, attack: 0.001 });
        this._noise({ duration: 0.8, gain: 0.16, filterType: 'lowpass', filterFreq: 140, delay: 1.95, attack: 0.06 });
        this._noise({ duration: 0.06, gain: 0.22, filterType: 'lowpass', filterFreq: 1600, drive: 0.25, delay: 2.8, attack: 0.001 });
        this._noise({ duration: 0.65, gain: 0.12, filterType: 'lowpass', filterFreq: 130, delay: 2.85, attack: 0.05 });
        break;

      case 'home_invasion':
        // A harder door-bash (distorted for extra weight) with a second
        // splintering hit as the door gives, then a real wailing siren —
        // faster and more aggressive than theft's — more intense than the
        // simple break-in, siren extended one more cycle — ~2.7s.
        this._noise({ duration: 0.3, gain: 0.65, filterType: 'lowpass', filterFreq: 1300, drive: 0.75, attack: 0.002 });
        this._tone({ freq: 95, endFreq: 30, type: 'sine', duration: 0.55, gain: 0.48, delay: 0.01 });
        this._noise({ duration: 0.18, gain: 0.4, filterType: 'lowpass', filterFreq: 1200, drive: 0.5, delay: 0.36, attack: 0.004 });
        this._crackle({ count: 5, delayRange: [0.4, 0.7], durationRange: [0.03, 0.07], gainRange: [0.12, 0.24], freqRange: [3000, 6000], filterType: 'highpass', drive: 0.2 });
        this._siren({ lowFreq: 650, highFreq: 1100, cycleDuration: 0.3, cycles: 6, type: 'square', gain: 0.3, delay: 0.85 });
        break;

      default:
        this._tone({ freq: 200, endFreq: 100, type: 'sine', duration: 0.9, gain: 0.34 });
    }
  }

  /** Damage-assessment reveal per asset — distinct tones for covered vs not. */
  revealCovered() {
    this._tone({ freq: 587.33, type: 'sine', duration: 0.12, gain: 0.2 });
    this._tone({ freq: 880, type: 'sine', duration: 0.16, gain: 0.18, delay: 0.07 });
  }

  revealUncovered() {
    this._tone({ freq: 392, endFreq: 261.63, type: 'sawtooth', duration: 0.22, gain: 0.15 });
  }

  /** Final results reveal — a small triumphant three-note run. */
  successChime() {
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      this._tone({ freq, type: 'sine', duration: 0.2, gain: 0.22, delay: i * 0.09 });
    });
  }

  /**
   * Big celebratory fanfare for a strong result (Protection Score 50% or
   * higher) — made bigger, louder, and considerably longer (~0.9s -> ~2.2s):
   * a six-note ascending run (was four) doubled with a lower harmony layer
   * for a fuller "chord" feel, two overlapping high shimmer sweeps held
   * longer, a broad swelling bandpass-noise "crowd roar" bed (the closest a
   * pure-synthesis engine gets to an actual cheering sound), and a denser,
   * longer sparkle/crackle layer — paired with the bigger confetti burst
   * (raining pieces + corner cannon-bursts) on the Results screen.
   */
  cheerChime() {
    // Bigger ascending fanfare — six notes instead of four, louder.
    [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51].forEach((freq, i) => {
      this._tone({ freq, type: 'sine', duration: 0.28, gain: 0.34, delay: i * 0.085 });
    });
    // Lower harmony layer under the run, for a fuller/louder chord feel.
    [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
      this._tone({ freq, type: 'triangle', duration: 0.55, gain: 0.18, delay: i * 0.085 });
    });
    // Two overlapping high shimmer sweeps, held longer than the old single one.
    this._tone({ freq: 1318.51, endFreq: 2093, type: 'triangle', duration: 0.9, gain: 0.26, delay: 0.55 });
    this._tone({ freq: 1046.5, endFreq: 1568, type: 'sine', duration: 0.75, gain: 0.2, delay: 0.65 });
    // Crowd-like cheering swell — a broad bandpass noise rising and holding,
    // the closest approximation of an actual crowd roar this engine can do.
    this._noise({ duration: 1.6, gain: 0.36, filterType: 'bandpass', filterFreq: 900, filterEndFreq: 2200, filterQ: 0.6, delay: 0.05, attack: 0.5 });
    this._noise({ duration: 1.3, gain: 0.24, filterType: 'bandpass', filterFreq: 1800, filterEndFreq: 3200, filterQ: 0.5, delay: 0.3, attack: 0.4 });
    // Denser, longer sparkle/crackle bed (confetti-popper texture), spread
    // across almost 2s instead of the old ~0.6s window.
    this._crackle({ count: 20, delayRange: [0.2, 1.9], durationRange: [0.03, 0.08], gainRange: [0.14, 0.28], freqRange: [4000, 8000], filterType: 'highpass' });
  }

  /**
   * A classic descending "sad trombone" motif for a weaker result
   * (Protection Score under 50%) — four clearly-separated wah-wah-wah-wahhh
   * notes sliding downward, ending on a long held low glide with a sub-bass
   * layer underneath for a "deflating" finish. Made considerably louder and
   * longer than a single soft tone (~0.85s -> ~1.9s, gain roughly doubled)
   * so it reads as an unmistakable, obviously-sad cue rather than something
   * players might miss — while still using a mellow triangle wave rather
   * than anything harsh or buzzy, since this is just game feedback, not a
   * real financial outcome.
   */
  sadTone() {
    this._tone({ freq: 392, endFreq: 349.23, type: 'triangle', duration: 0.3, gain: 0.36 });
    this._tone({ freq: 349.23, endFreq: 311.13, type: 'triangle', duration: 0.3, gain: 0.34, delay: 0.28 });
    this._tone({ freq: 293.66, endFreq: 261.63, type: 'triangle', duration: 0.32, gain: 0.32, delay: 0.56 });
    this._tone({ freq: 246.94, endFreq: 164.81, type: 'triangle', duration: 1.0, gain: 0.38, delay: 0.86 });
    this._tone({ freq: 130.81, endFreq: 65, type: 'sine', duration: 1.0, gain: 0.28, delay: 0.86 });
  }
}

export const soundEngine = new SoundEngine();
