/* Short arpeggios synthesised on the fly — no audio files to ship, and the
   pitch direction carries the meaning: rising for rewards, falling for the
   miss penalty. Silently no-ops if the browser blocks AudioContext. */

const CUES = {
  complete:    [[523, 0], [659, 0.12], [784, 0.24]],
  levelup:     [[261, 0], [329, 0.1], [392, 0.2], [523, 0.32], [784, 0.46]],
  achievement: [[440, 0], [554, 0.13], [659, 0.26], [880, 0.42]],
  bonus:       [[784, 0], [880, 0.1], [988, 0.22], [1047, 0.36]],
  penalty:     [[220, 0], [196, 0.15], [165, 0.3]],
};

export function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    (CUES[type] || []).forEach(([freq, delay]) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.55);
    });
  } catch {
    // Autoplay policy or an unsupported browser — sound is never load-bearing.
  }
}
