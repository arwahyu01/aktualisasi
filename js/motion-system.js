/* =========================================
   MOTION-SYSTEM.JS — Parallax depth, mouse tracking,
   floating motion controller
   ========================================= */

(function() {
  'use strict';

  class MotionSystem {
    constructor() {
      this.mouseX = 0;
      this.mouseY = 0;
      this.targetX = 0;
      this.targetY = 0;
      this.currentX = 0;
      this.currentY = 0;
      this.active = true;
      this.rafId = null;

      this.bindEvents();
      this.animate();
    }

    bindEvents() {
      // Track mouse position as normalized coordinates (-1 to 1)
      document.addEventListener('mousemove', (e) => {
        this.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetY = (e.clientY / window.innerHeight) * 2 - 1;
      });

      // Pause on touch devices
      document.addEventListener('touchstart', () => {
        this.active = false;
      }, { passive: true });
    }

    animate() {
      // Smooth dampened tracking
      this.currentX += (this.targetX - this.currentX) * 0.03;
      this.currentY += (this.targetY - this.currentY) * 0.03;

      // Apply parallax to depth layers
      if (this.active) {
        this.applyParallax();
      }

      this.rafId = requestAnimationFrame(() => this.animate());
    }

    applyParallax() {
      const px = this.currentX;
      const py = this.currentY;

      // Deep layer — moves slowest (most distant)
      const deepEls = document.querySelectorAll('.parallax-deep');
      deepEls.forEach(el => {
        const dx = px * -8;
        const dy = py * -5;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      // Mid layer
      const midEls = document.querySelectorAll('.parallax-mid');
      midEls.forEach(el => {
        const dx = px * -4;
        const dy = py * -3;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      // Near layer — most responsive
      const nearEls = document.querySelectorAll('.parallax-near');
      nearEls.forEach(el => {
        const dx = px * -2;
        const dy = py * -1.5;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      // Ambient lights — subtle movement
      const ambientEls = document.querySelectorAll('.ambient-mouse');
      ambientEls.forEach(el => {
        const dx = px * -3;
        const dy = py * -2;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      // Floor grid — very subtle
      const floorEl = document.querySelector('.floor-grid-perspective');
      if (floorEl) {
        const dx = px * -1.5;
        const dy = py * -1;
        floorEl.style.transform = `rotateX(75deg) translate(${dx}px, ${dy}px)`;
      }
    }

    destroy() {
      this.active = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  // Init on DOM ready
  let motionSystem;
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        motionSystem = new MotionSystem();
      });
    } else {
      motionSystem = new MotionSystem();
    }
  }

  window.MotionSystem = {
    init: init,
    instance: () => motionSystem
  };

  init();
})();
