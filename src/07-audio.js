class AudioManager {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.musicTimer = 0;
  }

  start() {
    if (this.context) return;
    let AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
  }

  beep(freq, time, type, volume) {
    if (!this.enabled) return;
    this.start();
    if (!this.context) return;

    let osc = this.context.createOscillator();
    let gain = this.context.createGain();
    osc.type = type || "square";
    osc.frequency.value = freq;
    gain.gain.value = volume || 0.03;
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + time);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + time);
  }

  blockSound(kind) {
    if (kind === "stone") this.beep(120, 0.08, "triangle", 0.045);
    else if (kind === "wood") this.beep(190, 0.08, "square", 0.035);
    else if (kind === "dirt") this.beep(90, 0.07, "sine", 0.035);
    else this.beep(160, 0.06, "square", 0.03);
  }

  ui() {
    this.beep(440, 0.04, "sine", 0.025);
  }

  hurt() {
    this.beep(70, 0.18, "sawtooth", 0.06);
  }

  explosion() {
    this.beep(55, 0.35, "sawtooth", 0.08);
  }

  update(delta, sky) {
    this.musicTimer -= delta;
    if (this.musicTimer <= 0 && sky && sky.timeOfDay > 0.22 && sky.timeOfDay < 0.78) {
      this.musicTimer = 8 + Math.random() * 8;
      let notes = [220, 261.63, 329.63, 392];
      let note = notes[Math.floor(Math.random() * notes.length)];
      this.beep(note, 0.42, "sine", 0.015);
      setTimeout(() => this.beep(note * 1.5, 0.3, "sine", 0.012), 180);
    }
  }
}

window.AudioManager = AudioManager;
