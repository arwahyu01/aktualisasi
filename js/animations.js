/* =========================================
   ANIMATIONS.JS — Counters, bar fills, effects
   ========================================= */

/**
 * Animate a number counter from 0 to target.
 * @param {HTMLElement} el - Element to update
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 */
function animateCounter(el, target, duration) {
  if (!el || isNaN(target)) return;
  const hasPercent = el.textContent.includes('%') || el.dataset.pct === 'true';
  const hasRp = el.textContent.includes('Rp');
  const start = performance.now();
  const from = 0;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(from + (target - from) * eased);
    
    if (hasRp) {
      el.textContent = 'Rp ' + current.toLocaleString('id-ID');
    } else {
      el.textContent = current + (hasPercent ? '%' : '');
    }
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target + (hasPercent ? '%' : '') + (hasRp ? '' : '');
      el.dataset.animated = 'true';
    }
  }
  requestAnimationFrame(step);
}

/**
 * Run all counter animations in the current slide.
 */
function runCounters() {
  const counters = document.querySelectorAll('.slide.active .counter, .sl.act .counter');
  counters.forEach(el => {
    if (el.dataset.animated === 'true') return;
    const target = parseInt(el.dataset.t || el.dataset.target);
    const dur = parseInt(el.dataset.dur) || 1200;
    if (!isNaN(target)) animateCounter(el, target, dur);
  });
}

/**
 * Trigger bar fill animations in the active slide.
 */
function runBarFills() {
  const fills = document.querySelectorAll('.slide.active .value-fill, .sl.act .value-fill');
  fills.forEach(el => {
    const w = el.dataset.w || el.dataset.width;
    if (w) {
      setTimeout(() => { el.style.width = w + '%'; }, 200);
    }
  });
}

/**
 * Initialize particle effects on the cover slide.
 */
function initParticles(container) {
  if (!container) return;
  const count = 6;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'fparticle';
    p.style.left = (15 + Math.random() * 70) + '%';
    p.style.top = (20 + Math.random() * 60) + '%';
    p.style.animationDelay = (Math.random() * 5) + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    p.style.background = Math.random() > 0.5 ? 'var(--gold)' : 'var(--red)';
    container.appendChild(p);
  }
}
