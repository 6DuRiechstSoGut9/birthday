// Scene 3: the personal letter on paper, paragraphs revealed on scroll.
import { h, s } from '../dom.js';

// Hand-drawn closing flourish with a heart; strokes are drawn when it scrolls into view.
function flourish() {
  const stroke = (d, extra) => s('path', { d, pathLength: 1, ...extra });
  return s('svg', { class: 'paper__flourish', viewBox: '0 0 240 40', 'aria-hidden': 'true', 'data-reveal': true, vars: { i: 1 } },
    stroke('M10 22C38 22 58 9 86 18C96 21 103 25 108 21'),
    stroke('M230 22C202 22 182 9 154 18C144 21 137 25 132 21'),
    stroke('M120 31C108 23 103 15 109 10C114 6 119 9 120 13C121 9 126 6 131 10C137 15 132 23 120 31Z', { class: 'heart' }),
    s('circle', { cx: 6, cy: 22, r: 2 }),
    s('circle', { cx: 234, cy: 22, r: 2 }));
}

export function letter(card) {
  const { title, paragraphs, signature } = card.letter;
  const el = h('section', { class: 'letter' },
    h('article', { class: 'paper', 'data-reveal': true },
      h('h2', { class: 'paper__title', text: title }),
      paragraphs.map((p, i) => h('p', { class: 'paper__p', 'data-reveal': true, vars: { i: i + 1 }, text: p })),
      flourish(),
      signature ? h('p', { class: 'paper__sign', 'data-reveal': true, vars: { i: 2 }, text: signature }) : null));
  return { el };
}
