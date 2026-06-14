/* =========================================
   OPENING-SEQUENCE.JS — Cinematic opening animation
   6-phase timed reveal with blur-in, scale,
   light sweep, and particle burst effects
   ========================================= */

(function() {
  'use strict';

  class OpeningSequence {
    constructor() {
      this.completed = false;
      this.phases = [
        { id: 'flash',       label: 'Flash burst',          time: 0    },
        { id: 'ambient',     label: 'Ambient glow ramp',    time: 500  },
        { id: 'mapreveal',   label: 'Map blur-in + backlight', time: 1000 },
        { id: 'dataflow',    label: 'Data flow + particles', time: 1600 },
        { id: 'cards',       label: 'Cover slide-up scale', time: 2200 },
        { id: 'title',       label: 'Title glow reveal',    time: 2800 },
        { id: 'sweep',       label: 'Light sweep final',    time: 3400 },
        { id: 'complete',    label: 'Opening done',         time: 4200 }
      ];
      this.duration = 4400;
      this.startTime = null;
      this.rafId = null;
      this.flashEl = document.getElementById('openingFlash');

      // Hide cover content and map initially
      document.querySelectorAll('.cover-right, .cover-photo').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px) scale(0.92)';
        el.style.filter = 'blur(8px)';
      });

      // Hide map initially — will fade in via animation
      const mapImg = document.querySelector('.h-map-img');
      if (mapImg) {
        mapImg.style.opacity = '0';
        mapImg.style.transition = 'none';
      }
    }

    start() {
      this.setPhase('flash', false);
      this.setPhase('ambient', false);
      this.setPhase('mapreveal', false);
      this.setPhase('dataflow', false);
      this.setPhase('cards', false);
      this.setPhase('sweep', false);
      this.setPhase('title', false);

      this.startTime = performance.now();
      this.tick(this.startTime);
    }

    setPhase(id, active) {
      if (!active) return;

      switch (id) {
        case 'flash':
          // White flash burst: quick brighten then fade
          if (this.flashEl) {
            this.flashEl.style.animation = 'openingFlash 0.8s ease-out forwards';
          }
          break;

        case 'ambient':
          // Ramp up ambient glow intensities
          document.querySelectorAll('.light-glow-red, .light-glow-gold, .light-riau').forEach(el => {
            el.style.transition = 'opacity 1.2s cubic-bezier(0.22,1,0.36,1)';
            el.style.opacity = '1';
          });
          break;

        case 'mapreveal':
          // Map blur-in: apply animation class
          const mapImg = document.querySelector('.h-map-img');
          if (mapImg) {
            mapImg.style.animation = 'mapBlurIn 1.8s cubic-bezier(0.22,1,0.36,1) forwards';
          }
          // Trigger map backlight pulse via event
          window.dispatchEvent(new CustomEvent('opening:siak'));
          break;

        case 'dataflow':
          // Enable data flow rendering
          window.dispatchEvent(new CustomEvent('opening:dataflow'));
          // Particles burst
          window.dispatchEvent(new CustomEvent('opening:burst'));
          break;

        case 'cards':
          // Cover content reveal with scale + blur-in
          document.querySelectorAll('.cover-right, .cover-photo').forEach(el => {
            el.style.animation = 'coverReveal 1.2s cubic-bezier(0.22,1,0.36,1) forwards';
          });
          // Header entrance
          const header = document.querySelector('.global-header');
          if (header) {
            header.style.animationPlayState = 'running';
          }
          break;

        case 'title':
          // Title glow reveal
          document.querySelectorAll('.cover-title .highlight').forEach(el => {
            el.style.animation = 'titleGlowIn 1.2s cubic-bezier(0.22,1,0.36,1) forwards';
          });
          break;

        case 'sweep':
          // Cinematic light sweep across screen
          const sweep = document.querySelector('.light-beam-sweep');
          if (sweep) {
            sweep.classList.add('opening-sweep');
          }
          break;

        case 'complete':
          const mapImg2 = document.querySelector('.h-map-img');
          if (mapImg2) {
            mapImg2.style.animation = '';
            mapImg2.style.opacity = '';
          }
          window.dispatchEvent(new CustomEvent('opening:complete'));
          this.completed = true;
          break;
      }
    }

    tick(now) {
      const elapsed = now - this.startTime;

      for (const phase of this.phases) {
        if (elapsed >= phase.time && !phase._activated) {
          phase._activated = true;
          this.setPhase(phase.id, true);
        }
      }

      if (elapsed < this.duration) {
        this.rafId = requestAnimationFrame((t) => this.tick(t));
      } else {
        this.completed = true;
        for (const phase of this.phases) {
          if (!phase._activated) {
            this.setPhase(phase.id, true);
          }
        }
        window.dispatchEvent(new CustomEvent('opening:complete'));
      }
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  let sequence;
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        sequence = new OpeningSequence();
        setTimeout(() => sequence.start(), 200);
      });
    } else {
      sequence = new OpeningSequence();
      setTimeout(() => sequence.start(), 200);
    }
  }

  window.OpeningSequence = {
    init: init,
    restart: () => {
      if (sequence) sequence.destroy();
      init();
    }
  };

  init();
})();
