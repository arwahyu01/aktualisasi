/* =========================================
   PARTICLES.JS — Elegant mouse-responsive particles
   Single-color floating dots that scatter from cursor
   ========================================= */

(function() {
  'use strict';

  const GOLD = 'rgba(212,175,55,';

  class Particle {
    constructor(w, h) {
      this.reset(w, h);
    }

    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = (Math.random() - 0.5) * 0.15;
      this.size = 1.2 + Math.random() * 2.2;
      this.baseAlpha = 0.15 + Math.random() * 0.25;
      this.alpha = this.baseAlpha;
      // Gentle drift phase
      this.driftAngle = Math.random() * Math.PI * 2;
      this.driftSpeed = 0.003 + Math.random() * 0.006;
      this.driftMag = 0.2 + Math.random() * 0.3;
    }

    update(w, h, mx, my) {
      // Gentle sine-wave drift
      this.driftAngle += this.driftSpeed;
      const dx = Math.cos(this.driftAngle) * this.driftMag * 0.04;
      const dy = Math.sin(this.driftAngle) * this.driftMag * 0.04;

      // Mouse repulsion
      let mfx = 0, mfy = 0;
      if (mx !== undefined && my !== undefined) {
        const rx = this.x - mx;
        const ry = this.y - my;
        const dist = Math.sqrt(rx * rx + ry * ry);
        const repelRadius = 140;
        if (dist < repelRadius && dist > 0.5) {
          const normX = rx / dist;
          const normY = ry / dist;
          const force = (1 - dist / repelRadius) * 4;
          mfx = normX * force;
          mfy = normY * force;
          // Fade near cursor
          const fadeRadius = 80;
          if (dist < fadeRadius) {
            this.alpha = this.baseAlpha * Math.max(0.08, dist / fadeRadius);
          } else {
            this.alpha = this.baseAlpha;
          }
        } else {
          this.alpha = this.baseAlpha;
        }
      }

      this.vx += dx + mfx * 0.1;
      this.vy += dy + mfy * 0.1;

      // Smooth dampening
      this.vx *= 0.96;
      this.vy *= 0.96;

      this.x += this.vx;
      this.y += this.vy;

      // Gentle wrap
      const margin = 50;
      if (this.x < -margin) this.x = w + margin;
      else if (this.x > w + margin) this.x = -margin;
      if (this.y < -margin) this.y = h + margin;
      else if (this.y > h + margin) this.y = -margin;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = GOLD + this.alpha + ')';
      ctx.shadowColor = GOLD + (this.alpha * 0.25) + ')';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  class ParticleSystem {
    constructor() {
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.mx = undefined;
      this.my = undefined;
      this.count = 100;
      this.particles = [];

      document.addEventListener('mousemove', (e) => {
        this.mx = e.clientX;
        this.my = e.clientY;
      }, { passive: true });

      for (let i = 0; i < this.count; i++) {
        this.particles.push(new Particle(this.w, this.h));
      }
    }

    setSlide() {}

    onResize() {
      this.w = window.innerWidth;
      this.h = window.innerHeight;
    }

    draw(ctx) {
      const w = this.w;
      const h = this.h;
      for (const p of this.particles) {
        p.update(w, h, this.mx, this.my);
        p.draw(ctx);
      }
    }
  }

  window.ParticleSystem = ParticleSystem;
})();
