// A full-viewport canvas that runs particle systems. A system is `{ step(ctx, dt, w, h) }`;
// returning false from step() removes it. The loop sleeps when nothing is running.
import { h } from '../dom.js';

export function createStage(className) {
  const canvas = h('canvas', { class: `fx ${className}`, 'aria-hidden': 'true' });
  const ctx = canvas.getContext('2d');
  const systems = new Set();
  let width = 0;
  let height = 0;
  let raf = 0;
  let last = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    ctx.clearRect(0, 0, width, height);
    for (const system of systems) {
      ctx.save();
      if (system.step(ctx, dt, width, height) === false) systems.delete(system);
      ctx.restore();
    }
    raf = systems.size ? requestAnimationFrame(frame) : 0;
    if (!raf) ctx.clearRect(0, 0, width, height);
  }

  function add(system) {
    systems.add(system);
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    return system;
  }

  window.addEventListener('resize', resize);
  resize();
  return { canvas, add, size: () => ({ width, height }) };
}
