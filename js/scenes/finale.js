// Scene 6: night sky, the closing words and fireworks on demand.
import { h } from '../dom.js';
import { whenVisible } from '../reveal.js';
import { fireworks } from '../fx/fireworks.js';

export function finale(card, { back, dusk }) {
  const { title, text, signature, again, restart } = card.finale;
  const el = h('section', { class: 'finale' },
    h('div', { class: 'finale__inner' },
      h('h2', { class: 'finale__title', 'data-reveal': true, text: title }),
      h('p', { class: 'finale__text', 'data-reveal': true, vars: { i: 1 }, text }),
      h('p', { class: 'finale__sign', 'data-reveal': true, vars: { i: 2 }, text: signature }),
      h('div', { class: 'finale__actions', 'data-reveal': true, vars: { i: 3 } },
        h('button', { class: 'pill', type: 'button', text: again, onclick: () => back.add(fireworks({ rockets: 8 })) }),
        h('button', { class: 'pill pill--ghost', type: 'button', text: restart, onclick: () => window.location.reload() }))));

  whenVisible(el, 0.35).then(() => {
    dusk();
    setTimeout(() => back.add(fireworks({ rockets: 8 })), 900);
  });
  return { el };
}
