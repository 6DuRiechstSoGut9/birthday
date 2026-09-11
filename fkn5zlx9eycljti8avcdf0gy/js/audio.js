// Background music: fetched and decrypted separately from the card, so the envelope never waits
// for megabytes of audio. Playback is unlocked during the tap (iOS only allows that).
import { h } from './dom.js';
import { decrypt } from './crypto.js';

function silentWav(ms = 250, rate = 8000) {
  const samples = Math.round((rate * ms) / 1000);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const ascii = (offset, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, 'data');
  view.setUint32(40, samples * 2, true);
  return new Uint8Array(buffer);
}

export function createMusic(type, key, label = '♪') {
  if (!type) return null;

  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = URL.createObjectURL(new Blob([silentWav()], { type: 'audio/wav' }));

  const button = h('button', { class: 'music', type: 'button', 'aria-label': label, title: label, 'aria-pressed': 'false' },
    h('span', { class: 'music__bars', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')));
  const setPressed = (on) => button.setAttribute('aria-pressed', String(on));

  let trackUrl = null;
  let wanted = false;

  let fade = 0;
  function fadeIn(ms = 2500) {
    cancelAnimationFrame(fade);
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      audio.volume = k * k; // ignored on iOS, where volume is read-only
      if (k < 1) fade = requestAnimationFrame(tick);
    };
    audio.volume = 0;
    fade = requestAnimationFrame(tick);
  }

  function playTrack() {
    if (audio.src !== trackUrl) {
      audio.src = trackUrl;
      audio.loop = true;
    }
    fadeIn();
    audio.play().then(() => setPressed(true), () => setPressed(false));
  }

  // Must be called inside a user gesture: unlocks the element even before the track arrives.
  function play() {
    wanted = true;
    if (trackUrl) return playTrack();
    audio.play().then(() => setPressed(true), () => {});
  }

  button.addEventListener('click', () => {
    if (trackUrl && !audio.paused) {
      wanted = false;
      audio.pause();
      setPressed(false);
      return;
    }
    play();
  });

  (async () => {
    const res = await fetch('m.bin', { credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = await decrypt(key, new Uint8Array(await res.arrayBuffer()));
    trackUrl = URL.createObjectURL(new Blob([bytes], { type }));
    if (wanted) playTrack();
  })().catch(() => button.remove());

  return { play, button };
}
