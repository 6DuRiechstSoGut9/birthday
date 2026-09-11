// Entry point: key from the URL fragment → fetch + decrypt the payload → render the story.
// Without a valid key the page is indistinguishable from the site's plain 404 page.
import { parseKey, decrypt, unpackPayload } from './crypto.js';
import { h, wait, rand, reducedMotion } from './dom.js';
import { observeReveal } from './reveal.js';
import { createStage } from './fx/stage.js';
import { petals } from './fx/petals.js';
import { grain } from './fx/grain.js';
import { createMusic } from './audio.js';
import { envelope } from './scenes/envelope.js';
import { hero } from './scenes/hero.js';
import { letter } from './scenes/letter.js';
import { reasons } from './scenes/reasons.js';
import { cake } from './scenes/cake.js';
import { finale } from './scenes/finale.js';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

function notFound() {
  document.querySelector('link[rel="stylesheet"]')?.remove();
  document.documentElement.className = '';
  document.documentElement.lang = 'en';
  document.title = '404 Not Found';
  document.body.replaceChildren(h('h1', { text: '404 Not Found' }));
}

async function loadCard(key) {
  const res = await fetch('d.bin', { cache: 'no-cache', credentials: 'omit' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return unpackPayload(await decrypt(key, new Uint8Array(await res.arrayBuffer())));
}

function fontsReady(card) {
  const sample = `${card.name}${card.initial}${card.hero.greeting}`;
  const faces = ['400 1em "Great Vibes"', 'italic 500 1em "Cormorant Garamond"', '400 1em "Nunito"', '500 1em "Caveat"'];
  return Promise.race([Promise.all(faces.map((f) => document.fonts.load(f, sample))), wait(3000)]).catch(() => {});
}

function night() {
  return h('div', { class: 'night', 'aria-hidden': 'true' }, Array.from({ length: 70 }, () => h('i', {
    vars: { x: `${rand(0, 100)}%`, y: `${rand(0, 80)}%`, s: `${rand(1, 2.8).toFixed(1)}px`, t: `${rand(1.4, 3.8).toFixed(1)}s`, d: `${rand(-4, 0).toFixed(1)}s` },
  })));
}

function start(card, media) {
  document.title = card.pageTitle;
  const back = createStage('fx--back');
  const front = createStage('fx--front');
  const music = createMusic(media, card.music?.label);
  // Confetti flies in front of the content; fireworks burst in the sky behind it.
  const ctx = { front, back, dusk: () => document.body.classList.add('dusk') };

  const heroScene = hero(card, ctx);
  const story = h('main', { class: 'story' },
    heroScene.el, letter(card).el, reasons(card, ctx).el, cake(card, ctx).el, finale(card, ctx).el);
  const env = envelope(card, { front, onOpen: () => music?.play() });

  document.body.replaceChildren(...[
    h('div', { class: 'blobs', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')),
    night(), back.canvas, grain(), story, front.canvas, env.el, music?.button,
  ].filter(Boolean));
  document.body.classList.add('locked');
  back.add(petals(reducedMotion ? 6 : window.innerWidth < 700 ? 16 : 28));

  env.revealed.then(() => {
    window.scrollTo(0, 0);
    document.body.classList.remove('locked');
    document.body.classList.add('opened');
    observeReveal(story);
    heroScene.play();
  });
}

// Hosts without custom headers (GitHub Pages) cannot send `frame-ancestors`/X-Frame-Options,
// so refuse to decrypt anything when the page is embedded in a frame.
function framed() {
  try {
    return window.top !== window.self;
  } catch {
    return true;
  }
}

async function boot() {
  if (framed()) return notFound();
  const key = parseKey(location.hash);
  if (!key) return notFound();
  document.documentElement.classList.add('on');
  let payload;
  try {
    payload = await loadCard(key);
  } catch {
    return notFound();
  }
  await fontsReady(payload.data);
  start(payload.data, payload.media);
}

boot();
