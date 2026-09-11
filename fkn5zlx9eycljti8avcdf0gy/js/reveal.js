// Scroll-driven reveals: [data-reveal] elements get .is-in once they enter the viewport.

export function observeReveal(root) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  for (const el of root.querySelectorAll('[data-reveal]')) io.observe(el);
}

/** Resolves the first time `el` is at least `threshold` visible. */
export function whenVisible(el, threshold = 0.5) {
  return new Promise((resolve) => {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      resolve();
    }, { threshold });
    io.observe(el);
  });
}
