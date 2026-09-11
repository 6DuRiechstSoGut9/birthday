// Ambient falling sakura-like petals for the background stage.
import { rand, pick } from '../dom.js';

const COLORS = ['#f9c6d3', '#f7b3c6', '#ffd6c4', '#fbd3e0', '#e9c8f2'];

function spawn(w, h, anywhere) {
  return {
    x: rand(-20, w + 20),
    y: anywhere ? rand(-h, h) : rand(-60, -20),
    size: rand(6, 13),
    vy: rand(28, 60),
    vx: rand(-12, 18),
    sway: rand(18, 46),
    swayF: rand(0.6, 1.4),
    rot: rand(0, Math.PI * 2),
    vr: rand(-1.2, 1.2),
    flipF: rand(0.8, 2.2),
    t: rand(0, 10),
    color: pick(COLORS),
    alpha: rand(0.55, 0.9),
  };
}

function drawPetal(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(s * 0.95, s * 0.45, s * 0.75, -s * 0.8, s * 0.12, -s);
  ctx.lineTo(0, -s * 0.72);
  ctx.lineTo(-s * 0.12, -s);
  ctx.bezierCurveTo(-s * 0.75, -s * 0.8, -s * 0.95, s * 0.45, 0, s);
  ctx.fill();
}

export function petals(count) {
  const items = [];
  let seeded = false;
  return {
    step(ctx, dt, w, h) {
      if (!seeded) {
        for (let i = 0; i < count; i++) items.push(spawn(w, h, true));
        seeded = true;
      }
      for (const p of items) {
        p.t += dt;
        p.y += p.vy * dt;
        p.x += (p.vx + Math.sin(p.t * p.swayF) * p.sway) * dt;
        p.rot += p.vr * dt;
        if (p.y > h + 30 || p.x < -60 || p.x > w + 60) Object.assign(p, spawn(w, h, false));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.sin(p.t * p.flipF)));
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        drawPetal(ctx, p.size);
        ctx.restore();
      }
    },
  };
}
