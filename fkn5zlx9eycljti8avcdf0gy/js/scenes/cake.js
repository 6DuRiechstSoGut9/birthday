// Scene 5: make a wish and tap the candles out; the evening falls and fireworks start.
import { h, s, rand, pick, PASTELS } from '../dom.js';
import { fireworks } from '../fx/fireworks.js';

const HEART = 'M0 3.2C-3.8.4-5.6-1.6-5.6-3.6-5.6-5.3-4.3-6.5-2.8-6.5-1.6-6.5-.6-5.8 0-4.8.6-5.8 1.6-6.5 2.8-6.5 4.3-6.5 5.6-5.3 5.6-3.6 5.6-1.6 3.8.4 0 3.2Z';
const SPRINKLES = ['#f19bb3', '#b8a2ea', '#8fd3b8', '#f7c96b', '#8cc4f0'];

function frosting(x, y, w, depth, color) {
  const parts = [s('rect', { x, y, width: w, height: depth, rx: 10, fill: color })];
  for (let dx = 10; dx < w - 16; dx += rand(16, 26)) {
    const dw = rand(9, 14);
    parts.push(s('rect', { x: x + dx, y: y + depth - 10, width: dw, height: rand(12, 28), rx: dw / 2, fill: color }));
  }
  return parts;
}

function pearls(x, y, w) {
  const out = [];
  for (let cx = x + 10; cx < x + w - 6; cx += 15) out.push(s('circle', { cx, cy: y, r: 3.4, fill: '#fff' }));
  return out;
}

function sprinkles(x0, y0, w, hgt, n) {
  return Array.from({ length: n }, () => {
    const x = rand(x0, x0 + w);
    const y = rand(y0, y0 + hgt);
    return s('rect', { x, y, width: 7, height: 2.4, rx: 1.2, fill: pick(SPRINKLES), transform: `rotate(${rand(0, 180).toFixed(0)} ${x + 3.5} ${y + 1.2})` });
  });
}

function cakeSvg() {
  return s('svg', { class: 'cake__svg', viewBox: '0 0 300 250', 'aria-hidden': 'true' },
    s('ellipse', { cx: 150, cy: 234, rx: 140, ry: 13, fill: '#ffffff' }),
    s('ellipse', { cx: 150, cy: 231, rx: 128, ry: 8, fill: '#f8e3ea' }),
    s('rect', { x: 34, y: 148, width: 232, height: 84, rx: 16, fill: '#f7c3cf' }),
    frosting(34, 146, 232, 20, '#fff4f6'),
    Array.from({ length: 6 }, (_, i) => s('path', { d: HEART, fill: '#ef9ab0', transform: `translate(${62 + i * 35} ${198 + (i % 2) * 8}) scale(1.3)` })),
    pearls(34, 226, 232),
    s('rect', { x: 70, y: 92, width: 160, height: 60, rx: 14, fill: '#ffd9c4' }),
    frosting(70, 90, 160, 16, '#fffaf4'),
    sprinkles(80, 118, 140, 22, 16),
    pearls(70, 147, 160));
}

export function cake(card, { back, dusk, gate }) {
  const n = card.cake.candles;
  const step = n > 1 ? Math.min(10, 40 / (n - 1)) : 0;
  let lit = n;
  const done = h('p', { class: 'cake__done', text: card.cake.done });
  const tap = card.cake.tap ? h('p', { class: 'cake__tap', text: card.cake.tap }) : null;

  function celebrate() {
    gate.open(); // the finale exists only after the wish
    dusk();
    done.classList.add('is-in');
    setTimeout(() => back.add(fireworks({ rockets: 9 })), 1200);
  }

  const candles = Array.from({ length: n }, (_, i) => {
    const candle = h('button', {
      class: 'candle', type: 'button', 'aria-label': `🕯 ${i + 1} / ${n}`,
      vars: {
        x: `${50 + (i - (n - 1) / 2) * step}%`,
        w: `${Math.min(6.5, step * 0.7 || 6.5)}%`,
        h: (17 + (i % 2) * 3 + rand(-1, 1)).toFixed(1),
        c: pick(PASTELS),
        d: `${rand(-1.6, 0).toFixed(2)}s`,
      },
    }, h('span', { class: 'candle__stick' }), h('span', { class: 'candle__flame' }), h('span', { class: 'candle__smoke' }));
    candle.addEventListener('click', () => {
      if (candle.classList.contains('is-out')) return;
      candle.classList.add('is-out');
      candle.setAttribute('aria-disabled', 'true');
      if (--lit > 0) return;
      tap?.classList.add('is-done');
      setTimeout(celebrate, 900);
    });
    return candle;
  });

  const el = h('section', { class: 'cake' },
    h('div', { class: 'cake__inner' },
      h('h2', { class: 'h2', 'data-reveal': true, text: card.cake.title }),
      h('p', { class: 'hint', 'data-reveal': true, vars: { i: 1 }, text: card.cake.hint }),
      tap,
      h('div', { class: 'cake__wrap', 'data-reveal': true, vars: { i: 2 } }, cakeSvg(), h('div', { class: 'candles' }, candles)),
      done));

  return { el };
}
