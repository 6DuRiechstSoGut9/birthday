// Scene 4: flip cards with reasons; hearts burst when every card has been opened.
import { h, s, PASTELS, centerOf } from '../dom.js';
import { confetti } from '../fx/confetti.js';

const ICONS = [
  'M12 21s-7.5-4.6-9.6-9.1C1 8.6 3 5 6.6 5c2.1 0 3.6 1.2 5.4 3.1C13.8 6.2 15.3 5 17.4 5 21 5 23 8.6 21.6 11.9 19.5 16.4 12 21 12 21z',
  'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z',
  'M12 2c.6 4.8 2.4 7.4 8 10-5.6 2.6-7.4 5.2-8 10-.6-4.8-2.4-7.4-8-10 5.6-2.6 7.4-5.2 8-10z',
  'M15.5 2.5A9.5 9.5 0 1 0 21.5 17 8 8 0 0 1 15.5 2.5z',
];

const icon = (i) => s('svg', { class: 'rcard__icon', viewBox: '0 0 24 24', 'aria-hidden': 'true' },
  s('path', { d: ICONS[i % ICONS.length] }));

export function reasons(card, { front }) {
  const { title, hint, done, items } = card.reasons;
  const seen = new Set();
  const counter = h('p', { class: 'reasons__count', 'aria-live': 'polite', text: `0 / ${items.length}` });
  const doneEl = h('p', { class: 'reasons__done', text: done });

  function celebrate(from) {
    doneEl.classList.add('is-in');
    const c = centerOf(from);
    front.add(confetti(c.x, c.y, {
      count: 60, spread: Math.PI * 2, power: 760, shapes: ['heart'], colors: ['#f4a3b7', '#f7b8c8', '#ff8fab', '#f0c96f'],
    }));
  }

  const cards = items.map((text, i) => {
    const btn = h('button', {
      class: 'rcard', type: 'button', 'aria-pressed': 'false', 'data-reveal': true,
      vars: { c: PASTELS[i % PASTELS.length], i: i % 4 },
    }, h('span', { class: 'rcard__inner' },
      h('span', { class: 'rcard__face rcard__front' },
        h('span', { class: 'rcard__num', text: String(i + 1).padStart(2, '0') }), icon(i)),
      h('span', { class: 'rcard__face rcard__back', text })));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(open));
      if (!open || seen.has(i)) return;
      seen.add(i);
      counter.textContent = `${seen.size} / ${items.length}`;
      if (seen.size === items.length) celebrate(btn);
    });
    return btn;
  });

  const el = h('section', { class: 'reasons' },
    h('div', { class: 'reasons__inner' },
      h('h2', { class: 'h2', 'data-reveal': true, text: title }),
      h('p', { class: 'hint', 'data-reveal': true, vars: { i: 1 }, text: hint }),
      h('div', { class: 'cards' }, cards),
      counter,
      doneEl));
  return { el };
}
