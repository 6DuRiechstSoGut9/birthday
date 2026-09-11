// Confetti burst (rectangles, dots or hearts) with drag, gravity and flutter.
import { rand, pick, PASTELS } from '../dom.js';

const GOLD = '#f0c96f';

function heart(ctx, r) {
  ctx.beginPath();
  ctx.moveTo(0, r * 0.9);
  ctx.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.7, -r * 1.5, 0, -r * 0.55);
  ctx.bezierCurveTo(r * 0.7, -r * 1.5, r * 1.6, -r * 0.2, 0, r * 0.9);
  ctx.fill();
}

export function confetti(x, y, opts = {}) {
  const {
    count = 80, angle = -Math.PI / 2, spread = Math.PI / 2, power = 900,
    shapes = ['rect', 'rect', 'circle'], colors = [...PASTELS, GOLD],
  } = opts;

  const parts = Array.from({ length: count }, () => {
    const a = angle + rand(-spread / 2, spread / 2);
    const v = power * rand(0.4, 1);
    const shape = pick(shapes);
    const upright = shape === 'heart';
    return {
      x, y, shape,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      rot: upright ? rand(-0.4, 0.4) : rand(0, 6.3),
      vr: upright ? rand(-1, 1) : rand(-9, 9),
      tilt: rand(0, 6.3),
      vt: rand(4, 10),
      size: upright ? rand(9, 15) : rand(5, 10),
      color: pick(colors),
      life: rand(2.4, 3.8),
    };
  });

  return {
    step(ctx, dt, w, h) {
      const drag = Math.exp(-2.6 * dt);
      let alive = 0;
      for (const p of parts) {
        if (p.life <= 0) continue;
        p.life -= dt;
        p.vx *= drag;
        p.vy = p.vy * drag + 900 * dt;
        p.x += (p.vx + Math.sin(p.tilt) * 24) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.tilt += p.vt * dt;
        if (p.y > h + 40) {
          p.life = 0;
          continue;
        }
        alive++;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 0.7);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'heart') {
          ctx.scale(1, 0.8 + 0.2 * Math.cos(p.tilt));
          heart(ctx, p.size * 0.6);
        } else {
          ctx.scale(1, Math.cos(p.tilt));
          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          }
        }
        ctx.restore();
      }
      return alive > 0;
    },
  };
}
