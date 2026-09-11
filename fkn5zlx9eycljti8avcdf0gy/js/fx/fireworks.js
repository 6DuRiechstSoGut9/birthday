// Pastel fireworks: rockets rise and burst into rings, peonies or hearts.
import { rand, pick } from '../dom.js';

const COLORS = ['#ffb3c7', '#ffd6a5', '#cdb4ff', '#a0e7c8', '#fff3b0', '#ff8fab', '#bde0fe', '#f7d488'];
const GRAVITY = 380;

function heartPoint(t) {
  return {
    x: 16 * Math.sin(t) ** 3,
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
  };
}

export function fireworks({ rockets = 7, spacing = 0.5 } = {}) {
  const shells = [];
  const sparks = [];
  let launched = 0;
  let clock = 0;
  let next = 0;

  function launch(w, h) {
    const ty = rand(h * 0.12, h * 0.42);
    shells.push({
      x: rand(w * 0.15, w * 0.85), y: h + 10, vx: rand(-25, 25),
      vy: -Math.sqrt(2 * GRAVITY * (h + 10 - ty)) * 1.02,
      ty, color: pick(COLORS), kind: pick(['ring', 'peony', 'peony', 'heart']),
    });
  }

  function explode(sh) {
    const n = sh.kind === 'heart' ? 72 : Math.round(rand(64, 96));
    const speed = rand(170, 250);
    const accent = pick(COLORS);
    for (let i = 0; i < n; i++) {
      let vx;
      let vy;
      if (sh.kind === 'heart') {
        const p = heartPoint((i / n) * Math.PI * 2);
        vx = (p.x / 16) * speed;
        vy = (p.y / 16) * speed;
      } else {
        const a = (i / n) * Math.PI * 2 + rand(-0.06, 0.06);
        const v = speed * (sh.kind === 'ring' ? rand(0.92, 1) : rand(0.35, 1));
        vx = Math.cos(a) * v;
        vy = Math.sin(a) * v;
      }
      const life = rand(1.1, 1.9);
      sparks.push({ x: sh.x, y: sh.y, vx, vy, life, max: life, color: i % 3 ? sh.color : accent, glitter: Math.random() < 0.25 });
    }
  }

  return {
    step(ctx, dt, w, h) {
      clock += dt;
      if (launched < rockets && clock >= next) {
        launch(w, h);
        launched++;
        next = clock + rand(spacing * 0.6, spacing * 1.4);
      }
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (let i = shells.length - 1; i >= 0; i--) {
        const sh = shells[i];
        sh.vy += GRAVITY * dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = sh.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(sh.x - sh.vx * 0.05, sh.y - sh.vy * 0.05);
        ctx.lineTo(sh.x, sh.y);
        ctx.stroke();
        if (sh.y <= sh.ty || sh.vy >= -30) {
          explode(sh);
          shells.splice(i, 1);
        }
      }

      const drag = Math.exp(-1.6 * dt);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life -= dt;
        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        p.vx *= drag;
        p.vy = p.vy * drag + 110 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const k = p.life / p.max;
        let alpha = Math.min(1, k * 1.6);
        if (p.glitter && Math.random() < 0.5) alpha *= 0.2;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha * 0.25;
        ctx.lineWidth = 6 * k + 1;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 0.06, p.y - p.vy * 0.06);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2 * k + 0.6;
        ctx.stroke();
      }
      return launched < rockets || shells.length > 0 || sparks.length > 0;
    },
  };
}
