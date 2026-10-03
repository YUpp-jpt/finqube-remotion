import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// An original deterministic electronic score. No reference audio is sampled.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public/audio/soundtrack.wav');
const sampleRate = 48000;
const duration = 2722 / 60;
const count = Math.round(duration * sampleRate);
const left = new Float32Array(count);
const right = new Float32Array(count);
const bpm = 120;
const beat = 60 / bpm;
const tau = Math.PI * 2;
const note = midi => 440 * 2 ** ((midi - 69) / 12);
let seed = 0x51f1c0de;
const noise = () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed >>> 0) / 2147483648 - 1;
};

function voice(at, length, generate, gain, pan = 0, echo = false) {
  const start = Math.round(at * sampleRate);
  const size = Math.round(length * sampleRate);
  const l = Math.sqrt((1 - pan) / 2);
  const r = Math.sqrt((1 + pan) / 2);
  for (let j = 0; j < size; j++) {
    const i = start + j;
    if (i < 0 || i >= count) continue;
    const value = generate(j / sampleRate, j) * gain;
    left[i] += value * l;
    right[i] += value * r;
    if (echo) {
      const delay = Math.round(sampleRate * beat * 0.75);
      if (i + delay < count) {left[i + delay] += value * r * 0.22; right[i + delay] += value * l * 0.22;}
      if (i + delay * 2 < count) {left[i + delay * 2] += value * l * 0.08; right[i + delay * 2] += value * r * 0.08;}
    }
  }
}

const roots = [40, 36, 43, 38];
const melody = [0, 7, 12, 7, 3, 7, 10, 14];
const bars = Math.ceil(duration / (beat * 4));
for (let bar = 0; bar < bars; bar++) {
  const rootMidi = roots[Math.floor(bar / 2) % roots.length];
  const at = bar * 4 * beat;
  const density = at >= 38.6667 ? 0.65 : 1;
  [0, 7, 12, 15].forEach((semitone, v) => {
    const freq = note(rootMidi + 12 + semitone);
    voice(at, beat * 4 + 0.35, t => {
      const env = Math.min(1, t / 0.3) * Math.max(0, Math.min(1, (beat * 4 + 0.35 - t) / 0.6));
      return env * (Math.sin(tau * freq * t) + 0.3 * Math.sin(tau * freq * 1.002 * t)) * 0.55;
    }, 0.06 * density, (v - 1.5) * 0.4);
  });
  for (let b = 0; b < 4; b++) {
    const atBeat = at + b * beat;
    voice(atBeat, 0.26, t => (Math.sin(tau * (48 * t + 60 * (1 - Math.exp(-t * 25)) / 25)) * Math.exp(-t * 18) + noise() * Math.exp(-t * 180) * 0.06), 0.65 * density);
    if (b % 2) {
      let filtered = 0;
      voice(atBeat, 0.16, t => {const n = noise(); filtered = filtered * 0.78 + n * 0.22; return (n - filtered) * Math.exp(-t * 36) + Math.sin(tau * 185 * t) * Math.exp(-t * 45) * 0.2;}, 0.16 * density, b === 1 ? -0.1 : 0.1);
    }
    const freq = note(rootMidi + (b === 3 ? 7 : 0));
    voice(atBeat + 0.07, 0.35, t => {
      const env = Math.min(1, t * 150) * Math.exp(-t * 11);
      return env * (Math.sin(tau * freq * t) + Math.sin(tau * freq * 2 * t) * 0.18);
    }, 0.27 * density);
    for (let h = 0; h < 2; h++) {
      let last = 0;
      voice(atBeat + h * beat / 2, 0.08, t => {const n = noise(); const high = n - last; last = n; return high * Math.exp(-t * 70);}, 0.045 * density, h ? 0.48 : -0.48);
    }
  }
  melody.forEach((step, i) => {
    const freq = note(rootMidi + 24 + step);
    voice(at + i * beat / 2, 0.65, t => {
      const env = Math.min(1, t * 180) * Math.exp(-t * 6.5);
      return env * (Math.sin(tau * freq * t) + 0.25 * Math.sin(tau * freq * 2 * t) + 0.1 * Math.sin(tau * freq * 3 * t));
    }, 0.083 * density, Math.sin(i * 2.1) * 0.6, true);
  });
}

// Soft sweeps anchor the principal cuts, with a short tonal arrival.
[3.5, 8, 12, 15.8, 19, 25, 27.5, 29, 32, 36.5, 38.666667].forEach((at, n) => {
  let smooth = 0;
  voice(at - 0.22, 0.4, t => {
    smooth = smooth * 0.9 + noise() * 0.1;
    const envelope = Math.sin(Math.PI * Math.min(1, t / 0.4)) ** 2;
    return smooth * envelope;
  }, 0.35, n % 2 ? -0.4 : 0.4);
  voice(at, 0.23, t => Math.sin(tau * note(79 + n % 3) * t) * Math.exp(-t * 20), 0.055, 0, true);
});
voice(36, 0.09, t => (Math.sin(tau * 1400 * t) + Math.sin(tau * 2100 * t) * 0.3) * Math.exp(-t * 70), 0.12);

let peak = 0;
for (let i = 0; i < count; i++) {
  const t = i / sampleRate;
  const fade = Math.min(1, t / 0.08) * Math.min(1, (duration - t) / 0.35);
  // A gentle saturation joins the instruments without abrupt clipping.
  left[i] = Math.tanh(left[i] * 1.3) * fade;
  right[i] = Math.tanh(right[i] * 1.3) * fade;
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}
const scale = (10 ** (-1.5 / 20)) / peak;
const bytes = count * 4;
const wav = Buffer.alloc(44 + bytes);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + bytes, 4); wav.write('WAVE', 8);
wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22); wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(bytes, 40);
for (let i = 0; i < count; i++) {
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * scale)) * 32767), 44 + i * 4);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * scale)) * 32767), 46 + i * 4);
}
mkdirSync(dirname(output), {recursive: true});
writeFileSync(output, wav);
console.log(`Original soundtrack generated: 48 kHz stereo PCM, ${duration.toFixed(6)} seconds.`);
