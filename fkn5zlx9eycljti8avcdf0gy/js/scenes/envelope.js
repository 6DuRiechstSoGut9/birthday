// Scene 1: pastel envelope with a wax seal. Tapping the seal opens it and starts everything.
import { h, s, wait, centerOf, reducedMotion } from '../dom.js';
import { confetti } from '../fx/confetti.js';

function sealSvg(initial) {
  const points = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const r = 46 + Math.sin(a * 9) * 1.8 + Math.sin(a * 23 + 1.3);
    points.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return s('svg', { class: 'seal__svg', viewBox: '0 0 100 100', 'aria-hidden': 'true' },
    s('defs', null, s('radialGradient', { id: 'wax', cx: '36%', cy: '30%', r: '78%' },
      s('stop', { offset: '0', 'stop-color': '#f6a9bc' }),
      s('stop', { offset: '0.55', 'stop-color': '#dc7892' }),
      s('stop', { offset: '1', 'stop-color': '#b5536f' }))),
    s('polygon', { points: points.join(' '), fill: 'url(#wax)' }),
    s('circle', { cx: 50, cy: 50, r: 35, fill: 'none', stroke: '#fbd3dd', 'stroke-width': 1.3, 'stroke-dasharray': '1.5 3', opacity: 0.85 }),
    s('text', { class: 'seal__letter', x: 50, y: 52, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, initial));
}

export function envelope(card, { front, onOpen }) {
  const seal = h('button', { class: 'seal', type: 'button', 'aria-label': card.envelope.hint }, sealSvg(card.initial));
  const el = h('div', { class: 'envelope-screen' },
    h('p', { class: 'env-to', text: card.envelope.to }),
    h('div', { class: 'env' },
      h('div', { class: 'env__back' }),
      h('div', { class: 'env__letter' }, h('span', { class: 'env__letter-name', text: card.name })),
      h('div', { class: 'env__pocket' }),
      h('div', { class: 'env__flap' }),
      seal),
    h('p', { class: 'env-hint', text: card.envelope.hint }));

  const revealed = new Promise((resolve) => {
    seal.addEventListener('click', async () => {
      onOpen(); // synchronous on purpose: audio.play() needs the user gesture
      const c = centerOf(seal);
      front.add(confetti(c.x, c.y, { count: 46, spread: Math.PI * 2, power: 520 }));
      el.classList.add('is-open');
      seal.disabled = true;
      await wait(reducedMotion ? 400 : 2100);
      el.classList.add('is-gone');
      resolve();
      await wait(1000);
      el.remove();
    }, { once: true });
  });

  return { el, revealed };
}
