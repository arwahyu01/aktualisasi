/* =========================================
   DATA-FLOW.JS — Animated data connection lines,
   pulse nodes, active signal visualization
   ========================================= */

(function() {
  'use strict';

  const CITIES = [
    { name:'Siak / KPU Siak', x:0.175, y:0.32,  type:'highlight' },
    { name:'Medan',            x:0.10,  y:0.08,  type:'major' },
    { name:'Pekanbaru',        x:0.16,  y:0.28,  type:'minor' },
    { name:'Padang',           x:0.13,  y:0.38,  type:'minor' },
    { name:'Palembang',        x:0.18,  y:0.52,  type:'minor' },
    { name:'Jakarta',          x:0.32,  y:0.62,  type:'major' },
    { name:'Bandung',          x:0.38,  y:0.65,  type:'minor' },
    { name:'Semarang',         x:0.44,  y:0.66,  type:'minor' },
    { name:'Surabaya',         x:0.55,  y:0.69,  type:'major' },
    { name:'Pontianak',        x:0.34,  y:0.22,  type:'minor' },
    { name:'Balikpapan',       x:0.48,  y:0.28,  type:'major' },
    { name:'Makassar',         x:0.62,  y:0.42,  type:'major' },
    { name:'Manado',           x:0.66,  y:0.18,  type:'minor' },
    { name:'Jayapura',         x:0.93,  y:0.32,  type:'major' },
    { name:'Ambon',            x:0.75,  y:0.44,  type:'minor' },
    { name:'Tanjung Pinang',   x:0.23,  y:0.19,  type:'minor' }
  ];

  const CONNECTIONS = [
    [0,1],[0,2],[0,3],[0,4],[0,15],
    [0,5],[0,8],[0,10],[0,11],[0,13],
    [1,2],[2,3],[4,5],[5,6],[6,7],
    [7,8],[9,10],[5,9],[10,11],[11,12],[11,13],[11,14],
    [13,14],[8,11],[5,15]
  ];

  class DataFlow {
    constructor(canvas) {
      this.canvas = canvas;
      this.active = false;
      this.intensity = 0.6;
      this.pulseSources = [];
      this.flowEnabled = false;
      this.time = 0;

      this.bindEvents();
    }

    bindEvents() {
      window.addEventListener('opening:dataflow', () => {
        this.flowEnabled = true;
        this.active = true;
      });
    }

    setSlide(index) {
      const intensities = [
        1.0, 0.6, 0.5, 0.5, 0.8,
        0.5, 0.5, 0.5, 1.1, 1.2, 0.3
      ];
      this.intensity = intensities[index] || 0.6;
    }

    draw(ctx, w, h, time) {
      if (!this.active && !this.flowEnabled) return;
      const t = (time || 0) * 0.001;
      this.time = t;

      const scale = Math.min(w, h) * 0.75;
      const ox = (w - scale) / 2;
      const oy = (h - scale) / 2 + scale * 0.02;

      ctx.save();
      ctx.translate(ox, oy);

      const g = this.intensity;
      if (!this.flowEnabled) {
        // Draw at reduced intensity before opening activates
        this.drawConnections(ctx, scale, t, g * 0.3);
        ctx.restore();
        return;
      }

      this.drawConnections(ctx, scale, t, g);
      this.drawNodes(ctx, scale, t, g);

      ctx.restore();
    }

    drawConnections(ctx, scale, t, g) {
      for (const [from, to] of CONNECTIONS) {
        this.drawLine(ctx, CITIES[from], CITIES[to], scale, t, g);
      }
    }

    drawLine(ctx, from, to, scale, t, g) {
      const x1 = from.x * scale;
      const y1 = from.y * scale;
      const x2 = to.x * scale;
      const y2 = to.y * scale;

      const baseAlpha = 0.05 * g;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);

      ctx.save();

      // Subtle base line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(212,175,55,${baseAlpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Data pulse traveling along the line
      if (g > 0.3) {
        const pulseCount = Math.max(1, Math.floor(length / 120));
        for (let i = 0; i < pulseCount; i++) {
          const offset = t * 0.4 + i / pulseCount + (x1 * 0.01);
          const progress = (offset % 1);
          const px = x1 + dx * progress;
          const py = y1 + dy * progress;

          // Pulse glow
          const pulseAlpha = 0.25 * g * (1 - Math.abs(progress - 0.5) * 2);
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212,175,55,${pulseAlpha})`;
          ctx.shadowColor = 'rgba(212,175,55,0.15)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Secondary smaller pulse
          const progress2 = ((offset + 0.3) % 1);
          const px2 = x1 + dx * progress2;
          const py2 = y1 + dy * progress2;
          ctx.beginPath();
          ctx.arc(px2, py2, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,16,46,${pulseAlpha * 0.5})`;
          ctx.fill();
        }
      }

      ctx.restore();
    }

    drawNodes(ctx, scale, t, g) {
      for (const city of CITIES) {
        this.drawNode(ctx, city, scale, t, g);
      }
    }

    drawNode(ctx, city, scale, t, g) {
      const x = city.x * scale;
      const y = city.y * scale;
      const isHL = city.type === 'highlight';
      const isMajor = city.type === 'major';

      const pulse = 1 + 0.2 * Math.sin(t * (isHL ? 2.5 : 1.5));
      const radius = (isHL ? 4.5 : isMajor ? 2.5 : 1.5) * pulse;

      ctx.save();

      // Ripple rings for highlight
      if (isHL) {
        const ringR1 = 14 + 8 * Math.sin(t * 2);
        ctx.beginPath();
        ctx.arc(x, y, ringR1, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212,175,55,${0.12 * (1 + Math.sin(t * 2) * 0.5)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        const ringR2 = 22 + 6 * Math.sin(t * 1.7);
        ctx.beginPath();
        ctx.arc(x, y, ringR2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,16,46,${0.06 * (1 + Math.sin(t * 1.7) * 0.5)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Glow
      const glowRadius = radius * (isHL ? 4 : 2.5);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      const c = isHL ? 'rgba(212,175,55,' : isMajor ? 'rgba(255,255,255,' : 'rgba(255,255,255,';
      grad.addColorStop(0, c + (0.25 * g) + ')');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);

      // Core dot
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHL
        ? `rgba(212,175,55,${0.6 + 0.3 * Math.sin(t * 2)})`
        : isMajor
          ? `rgba(255,255,255,${0.4})`
          : `rgba(255,255,255,${0.2})`;
      ctx.shadowColor = isHL ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)';
      ctx.shadowBlur = isHL ? 12 : 3;
      ctx.fill();
      ctx.shadowBlur = 0;

      // White core for highlight
      if (isHL) {
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.4 * Math.sin(t * 2.5)})`;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  window.DataFlow = DataFlow;
})();
