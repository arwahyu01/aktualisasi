/* =========================================
   MAP-ANIMATION.JS — Holographic map wireframe overlay
   Animated edge glow, region pulse, scan effects
   ========================================= */

(function() {
  'use strict';

  class MapAnimation {
    constructor(canvas) {
      this.canvas = canvas;
      this.slideIndex = 0;
      this.scanPos = 0;
      this.active = false;
      this.siakPulse = 0;
      this.wireframePhase = 0;
    }

    setSlide(index) {
      this.slideIndex = index;
    }

    draw(ctx, w, h, time) {
      const t = (time || 0) * 0.001;
      const scale = Math.min(w, h) * 0.75;
      const ox = (w - scale) / 2;
      const oy = (h - scale) / 2 + scale * 0.02;

      this.scanPos = (Math.sin(t * 0.25) * 0.5 + 0.5);
      this.wireframePhase = (t * 0.1) % 1;

      const slideGlows = [
        { i:1.0 }, { i:0.5 }, { i:0.6 }, { i:0.5 },
        { i:0.5 }, { i:0.7 }, { i:0.5 }, { i:0.5 },
        { i:0.5 }, { i:1.2 }, { i:1.3 }, { i:0.3 }
      ];
      const g = slideGlows[this.slideIndex] || { i: 0.5 };

      ctx.save();
      ctx.translate(ox, oy);

      // Wireframe bounding box
      this.drawBoundingWireframe(ctx, scale, t, g);

      // Coordinate crosshairs
      this.drawCoordinateGrid(ctx, scale, t, g);

      // Scan line
      this.drawScanLine(ctx, scale, t, g);

      // Siak pulse effect
      this.drawSiakPulse(ctx, scale, t, g);

      // Hologram flicker (subtle grid noise)
      if (g.i > 0.5) {
        this.drawHologramNoise(ctx, scale, t, g);
      }

      ctx.restore();
    }

    drawBoundingWireframe(ctx, scale, t, g) {
      const margin = scale * 0.05;
      const w = scale - margin * 2;
      const h = scale - margin * 2;
      const pulse = 0.6 + 0.4 * Math.sin(t * 0.5);

      ctx.save();

      // Outer box with glow
      ctx.strokeStyle = `rgba(212,175,55,${0.03 * g.i * pulse})`;
      ctx.lineWidth = 0.5;
      ctx.shadowColor = `rgba(212,175,55,${0.02 * g.i})`;
      ctx.shadowBlur = 10;
      ctx.strokeRect(margin, margin, w, h);
      ctx.shadowBlur = 0;

      // Inner box (subtle)
      ctx.strokeStyle = `rgba(200,16,46,${0.015 * g.i * pulse})`;
      ctx.lineWidth = 0.3;
      ctx.strokeRect(margin + 10, margin + 10, w - 20, h - 20);

      // Mid-point cross
      const cx = scale / 2;
      const cy = scale / 2;
      ctx.strokeStyle = `rgba(212,175,55,${0.01 * g.i})`;
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy); ctx.lineTo(cx + 30, cy);
      ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy + 30);
      ctx.stroke();

      ctx.restore();
    }

    drawCoordinateGrid(ctx, scale, t, g) {
      ctx.save();
      const divisions = 5;
      const step = scale / divisions;
      const alpha = 0.008 * g.i * (0.7 + 0.3 * Math.sin(t * 0.3));

      ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
      ctx.lineWidth = 0.3;
      ctx.setLineDash([3, 6]);

      for (let i = 1; i < divisions; i++) {
        const pos = step * i;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(scale, pos);
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.restore();
    }

    drawScanLine(ctx, scale, t, g) {
      const sy = this.scanPos * scale;
      ctx.save();

      // Scan glow band
      const grad = ctx.createLinearGradient(0, sy - 15, 0, sy + 15);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.4, `rgba(212,175,55,${0.03 * g.i})`);
      grad.addColorStop(0.5, `rgba(212,175,55,${0.05 * g.i})`);
      grad.addColorStop(0.6, `rgba(200,16,46,${0.02 * g.i})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, sy - 15, scale, 30);

      // Fine line
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(scale, sy);
      ctx.strokeStyle = `rgba(212,175,55,${0.04 * g.i})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    }

    drawSiakPulse(ctx, scale, t, g) {
      // Siak position (roughly)
      const sx = 0.175 * scale;
      const sy = 0.32 * scale;

      ctx.save();

      // Expanding rings
      for (let i = 0; i < 3; i++) {
        const phase = (this.wireframePhase + i / 3) % 1;
        const radius = phase * scale * 0.35;
        const alpha = (1 - phase) * 0.04 * g.i;

        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.restore();
    }

    drawHologramNoise(ctx, scale, t, g) {
      ctx.save();
      const count = 12;
      const alpha = 0.005 * g.i;

      for (let i = 0; i < count; i++) {
        const x = Math.random() * scale;
        const y = Math.random() * scale;
        const size = 1 + Math.random() * 3;

        ctx.fillStyle = `rgba(212,175,55,${alpha * (0.5 + Math.random() * 0.5)})`;
        ctx.fillRect(x, y, size, 1);
      }

      ctx.restore();
    }
  }

  window.MapAnimation = MapAnimation;
})();
