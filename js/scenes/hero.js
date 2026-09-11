// Scene 2: greeting + her name letter by letter, confetti cannons and poppable balloons.
import { h, s, rand, pick, PASTELS, reducedMotion } from '../dom.js';
import { confetti } from '../fx/confetti.js';

const BALLOON = 'M30 3C47 3 56 17 56 33C56 51 43 64 30 67C17 64 4 51 4 33C4 17 13 3 30 3Z';

function defs() {
  return s('svg', { class: 'defs', 'aria-hidden': 'true', width: 0, height: 0 },
    s('defs', null, s('radialGradient', { id: 'balloon-shade', cx: '35%', cy: '30%', r: '80%' },
      s('stop', { offset: '0.5', 'stop-color': '#fff', 'stop-opacity': 0 }),
      s('stop', { offset: '1', 'stop-color': '#7a3a55', 'stop-opacity': 0.25 }))));
}

function balloonSvg(color) {
  return s('svg', { class: 'balloon__svg', viewBox: '0 0 60 118', 'aria-hidden': 'true' },
    s('path', { d: 'M30 70C25 80 35 86 30 96S27 108 31 118', fill: 'none', stroke: '#d8b4c2', 'stroke-width': 1.2 }),
    s('path', { d: 'M26 72L34 72L30 66Z', fill: color }),
    s('path', { d: BALLOON, fill: color }),
    s('path', { d: BALLOON, fill: 'url(#balloon-shade)' }),
    s('ellipse', { cx: 19, cy: 22, rx: 5.5, ry: 10, fill: '#fff', opacity: 0.55, transform: 'rotate(-28 19 22)' }));
}

function balloon(front, initial) {
  const color = pick(PASTELS);
  const el = h('div', {
    class: 'balloon',
    vars: {
      x: `${rand(2, 86).toFixed(1)}%`, size: `${rand(46, 78).toFixed(0)}px`,
      dur: `${rand(11, 19).toFixed(1)}s`, delay: initial ? `${rand(-14, -1).toFixed(1)}s` : '0s',
      sway: `${rand(2.6, 4.2).toFixed(1)}s`,
    },
  }, balloonSvg(color));
  el.addEventListener('pointerdown', () => {
    if (el.classList.contains('is-popped')) return;
    const r = el.getBoundingClientRect();
    front.add(confetti(r.left + r.width / 2, r.top + r.width * 0.55, {
      count: 28, spread: Math.PI * 2, power: 420, colors: [color, '#ffffff', '#f0c96f'],
    }));
    el.classList.add('is-popped');
    setTimeout(() => el.replaceWith(balloon(front, false)), 350);
  });
  return el;
}

export function hero(card, { front }) {
  const balloons = h('div', { class: 'balloons', 'aria-hidden': 'true' });
  const chars = Array.from(card.name, (ch, i) => h('span', { class: 'char', vars: { i }, text: ch }));
  const el = h('section', { class: 'hero' },
    defs(),
    balloons,
    h('div', { class: 'hero__glow', 'aria-hidden': 'true' }),
    h('p', { class: 'hero__greet', text: card.hero.greeting }),
    h('h1', { class: 'hero__name', 'aria-label': card.name, vars: { len: chars.length } }, chars),
    h('p', { class: 'hero__sub', text: card.hero.subtitle }),
    h('div', { class: 'hero__scroll' }, h('span', { text: card.hero.scrollHint }), h('i', { class: 'chev' })));

  function play() {
    if (!reducedMotion) {
      const count = window.innerWidth < 700 ? 6 : 9;
      balloons.append(...Array.from({ length: count }, () => balloon(front, true)));
    }
    setTimeout(() => {
      const { width, height } = front.size();
      const big = { spread: 0.9, count: reducedMotion ? 30 : 110, power: 1700 };
      front.add(confetti(0, height * 0.85, { ...big, angle: -Math.PI * 0.32 }));
      front.add(confetti(width, height * 0.85, { ...big, angle: -Math.PI * 0.68 }));
    }, 900);
  }

  return { el, play };
}
