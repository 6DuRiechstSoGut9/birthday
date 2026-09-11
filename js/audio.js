// Background music from the decrypted payload (blob: URL) with a floating toggle button.
import { h } from './dom.js';

export function createMusic(media, label = '♪') {
  if (!media) return null;
  const audio = new Audio();
  audio.src = URL.createObjectURL(new Blob([media.bytes], { type: media.type }));
  audio.loop = true;
  audio.preload = 'auto';

  const button = h('button', { class: 'music', type: 'button', 'aria-label': label, title: label, 'aria-pressed': 'false' },
    h('span', { class: 'music__bars', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')));
  const setPressed = (on) => button.setAttribute('aria-pressed', String(on));
  audio.addEventListener('play', () => setPressed(true));
  audio.addEventListener('pause', () => setPressed(false));

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

  // Must be called inside a user gesture (the seal tap / the button), or browsers block playback.
  function play() {
    fadeIn();
    audio.play()?.catch(() => setPressed(false));
  }

  button.addEventListener('click', () => (audio.paused ? play() : audio.pause()));
  return { play, button };
}
