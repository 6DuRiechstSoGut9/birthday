// Soft paper grain: a noise tile painted as a canvas pattern (no image URLs needed under CSP).
import { h } from '../dom.js';

export function grain() {
  const canvas = h('canvas', { class: 'grain', 'aria-hidden': 'true' });
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + Math.random() * 145;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);

  const ctx = canvas.getContext('2d');
  let w = 0;
  let hgt = 0;
  function draw() {
    if (window.innerWidth <= w && window.innerHeight <= hgt) return;
    w = Math.max(w, window.innerWidth);
    hgt = Math.max(hgt, window.innerHeight);
    canvas.width = w;
    canvas.height = hgt;
    ctx.fillStyle = ctx.createPattern(tile, 'repeat');
    ctx.fillRect(0, 0, w, hgt);
  }
  window.addEventListener('resize', draw);
  draw();
  return canvas;
}
