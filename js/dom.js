// Tiny DOM builders. Text only ever goes through textContent / text nodes: there is no HTML
// parsing anywhere in the app, and Trusted Types (CSP) would block it if there were.

const SVG_NS = 'http://www.w3.org/2000/svg';

function apply(el, props) {
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = v;
    else if (k === 'vars') {
      // CSSOM writes are allowed by `style-src 'self'`; inline style attributes are not.
      for (const [name, val] of Object.entries(v)) el.style.setProperty(`--${name}`, String(val));
    } else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
}

function build(el, props, children) {
  apply(el, props);
  el.append(...children.flat(Infinity).filter((c) => c != null && c !== false));
  return el;
}

export const h = (tag, props, ...children) => build(document.createElement(tag), props, children);
export const s = (tag, attrs, ...children) => build(document.createElementNS(SVG_NS, tag), attrs, children);

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const rand = (min, max) => min + Math.random() * (max - min);
export const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const PASTELS = ['#f7b8c8', '#ffd0b0', '#cdb8f0', '#b5e3cf', '#fbe7a1', '#f4a3b7', '#b8d8f5'];

/** Center of an element in viewport coordinates. */
export function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
