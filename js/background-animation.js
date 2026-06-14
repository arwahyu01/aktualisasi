/* =========================================
   BACKGROUND-ANIMATION.JS — Canvas orchestrator
   Coordinates DataFlow + MapAnimation + Particles
   ========================================= */

(function() {
  'use strict';

  class BackgroundAnimation {
    constructor() {
      this.canvas = document.getElementById('mapCanvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.dataFlow = new DataFlow(this.canvas);
      this.mapAnim = new MapAnimation(this.canvas);
      this.particles = new ParticleSystem();
      this.slideIndex = 0;
      this.lastSlideIndex = -1;
      this.rafId = null;
      this.openingDone = false;

      this.resize();
      this.bindEvents();
      this.animate();
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = window.innerWidth + 'px';
      this.canvas.style.height = window.innerHeight + 'px';
      this.ctx.scale(dpr, dpr);
      this.particles.onResize();
    }

    bindEvents() {
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.resize(), 200);
      });

      window.addEventListener('opening:complete', () => {
        this.openingDone = true;
      });
    }

    getActiveSlideIndex() {
      const active = document.querySelector('.slide.active');
      if (!active) return 0;
      const idx = parseInt(active.dataset.index);
      return isNaN(idx) ? 0 : idx;
    }

    animate(time) {
      const idx = this.getActiveSlideIndex();
      if (idx !== this.lastSlideIndex) {
        this.slideIndex = idx;
        this.lastSlideIndex = idx;
        this.dataFlow.setSlide(idx);
        this.mapAnim.setSlide(idx);
        this.particles.setSlide(idx);
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      const ctx = this.ctx;

      ctx.clearRect(0, 0, w, h);

      // Layer 1: Riau hotspot glow (always on)
      const riauGlow = ctx.createRadialGradient(
        w * 0.175, h * 0.35, 0,
        w * 0.175, h * 0.35, w * 0.35
      );
      riauGlow.addColorStop(0, 'rgba(212,175,55,0.035)');
      riauGlow.addColorStop(0.3, 'rgba(200,16,46,0.02)');
      riauGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = riauGlow;
      ctx.fillRect(0, 0, w, h);

      // Layer 2: Data flow network
      this.dataFlow.draw(ctx, w, h, time || 0);

      // Layer 3: Holographic map wireframe overlay
      this.mapAnim.draw(ctx, w, h, time || 0);

      // Layer 4: Floating particles
      this.particles.draw(ctx);

      this.rafId = requestAnimationFrame((t) => this.animate(t));
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new BackgroundAnimation());
    } else {
      new BackgroundAnimation();
    }
  }

  init();
})();
