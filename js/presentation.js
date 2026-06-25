/* =========================================
   PRESENTATION.JS — Navigation, slide control
   ========================================= */

(function() {
  'use strict';

  const track = document.getElementById('slideTrack');
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;
  let transitioning = false;

  // --- Build Nav Dots ---
  const navContainer = document.getElementById('navDots');
  if (navContainer) {
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goTo(i));
      navContainer.appendChild(dot);
    }
  }

  // --- Slide Counter ---
  const currentEl = document.getElementById('currentSlide');
  const totalEl = document.getElementById('totalSlides');
  if (totalEl) totalEl.textContent = String(total).padStart(2, '0');

  // --- Progress Bar ---
  const progressBar = document.getElementById('progressBar');

  // --- Go to specific slide ---
  function goTo(index) {
    if (transitioning || index === current || index < 0 || index >= total) return;
    transitioning = true;
    current = index;

    // Move track
    track.style.transform = 'translateY(-' + (index * 100) + 'vh)';

    // Update dots
    document.querySelectorAll('.nav-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });

    // Update slides active state
    slides.forEach((s, i) => {
      s.classList.toggle('act', i === index);
      s.classList.toggle('active', i === index);
    });

    // Update counter
    if (currentEl) currentEl.textContent = String(index + 1).padStart(2, '0');

    // Update progress
    if (progressBar) progressBar.style.width = ((index + 1) / total * 100) + '%';

    // Trigger animations
    const triggers = []; // no counter slides in current layout
    if (triggers.includes(index)) {
      setTimeout(runCounters, 400);
    }

    setTimeout(() => { transitioning = false; }, 700);
  }

  // --- Keyboard Navigation ---
  document.addEventListener('keydown', function(e) {
    const key = e.key;
    if (key === 'ArrowDown' || key === 'ArrowRight' || key === ' ') {
      e.preventDefault();
      goTo(current + 1);
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      e.preventDefault();
      goTo(current - 1);
    } else if (key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (key === 'End') {
      e.preventDefault();
      goTo(total - 1);
    } else if (key === 'f' || key === 'F') {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  });

  // --- Helper: find nearest scrollable ancestor ---
  function getScrollableParent(el) {
    while (el && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const ov = style.overflowY + style.overflow;
      if ((ov.indexOf('auto') !== -1 || ov.indexOf('scroll') !== -1) && el.scrollHeight > el.clientHeight + 2) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  // --- Mouse Wheel ---
  let wheelTimeout = false;
  document.addEventListener('wheel', function(e) {
    // Don't hijack wheel if target is inside a scrollable container
    if (getScrollableParent(e.target)) return;

    e.preventDefault();
    if (wheelTimeout) return;
    wheelTimeout = true;
    setTimeout(function() { wheelTimeout = false; }, 700);
    
    if (e.deltaY > 0) {
      goTo(current + 1);
    } else {
      goTo(current - 1);
    }
  }, { passive: false });

  // --- Touch Support ---
  let touchStartY = 0;
  let touchTarget = null;
  document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
    touchTarget = e.target;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    // Don't navigate if touch started inside a scrollable container
    if (getScrollableParent(touchTarget)) return;

    const diff = touchStartY - e.changedTouches[0].screenY;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  }, { passive: true });

  // --- Public API ---
  window.presentation = {
    goTo: goTo,
    current: function() { return current; },
    total: total,
    next: function() { goTo(current + 1); },
    prev: function() { goTo(current - 1); }
  };

  // --- Init first slide ---
  slides[0].classList.add('act', 'active');
  if (progressBar) progressBar.style.width = (1 / total * 100) + '%';

})();
