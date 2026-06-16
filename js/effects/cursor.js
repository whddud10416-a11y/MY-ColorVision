/* ==========================================
   CUSTOM CURSOR — Particle System
   Warm Editorial Design
   ========================================== */

export function initCustomCursor() {
  // ── Canvas Setup ──
  const canvas = document.createElement('canvas');
  canvas.id = 'cursor-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 99999;
  `;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── State ──
  const mouse = { x: -200, y: -200 };
  const ring  = { x: -200, y: -200 };   // lagged outer ring
  let particles  = [];
  let isDown     = false;
  let isHover    = false;
  let animId     = null;

  // ── Line Trail ──
  // Stores {x, y, t} history. Drawn as a fading stroke.
  const TRAIL_MAX_LEN  = 28;   // max number of points kept
  const TRAIL_LIFETIME = 340;  // ms a point lives
  let trail = [];              // [{ x, y, t }]

  // ── Pastel RGB palette for burst ──
  const PASTEL = [
    [255, 180, 180], // pastel red
    [180, 255, 180], // pastel green
    [180, 180, 255], // pastel blue
  ];

  // ── Mouse events ──
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mousedown', onDown);
  document.addEventListener('mouseup',   onUp);
  document.addEventListener('mouseleave', () => {
    mouse.x = -200;
    mouse.y = -200;
  });

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('button, a, [role="button"], input, label, [draggable="true"], .color-cube, .cvd-btn, .flip-card');
    isHover = !!el;
  });

  function onMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Record position for line trail
    trail.push({ x: mouse.x, y: mouse.y, t: performance.now() });
    if (trail.length > TRAIL_MAX_LEN) trail.shift();
  }

  function onDown() { isDown = true; }

  function onUp(e) {
    isDown = false;
    spawnBurst(e.clientX, e.clientY);
  }

  // ── Burst factory — 파스텔 RGB 12개 ──
  function spawnBurst(x, y) {
    const COUNT = 12; // 총 12개: R×4, G×4, B×4

    // Ring ripple
    particles.push({
      type: 'ripple',
      x, y,
      r: 180, g: 180, b: 200,
      radius: 0,
      maxRadius: 100,
      alpha: 0.6,
      decay: 0.015,
      lineWidth: 1.4,
    });

    // Burst: 12개를 RGB 순서로 4개씩 배분
    for (let i = 0; i < COUNT; i++) {
      const [r, g, b] = PASTEL[i % 3];          // 0,1,2 순환
      const angle     = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed     = 2.8 + Math.random() * 4.5;

      particles.push({
        type:    'burst',
        x, y,
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed,
        r, g, b,
        alpha:   0.90 + Math.random() * 0.10,
        size:    3 + Math.random() * 3.5,
        decay:   0.020 + Math.random() * 0.015,
        gravity: 0.09 + Math.random() * 0.05,
      });
    }
  }

  // ── Helpers ──
  function rgba(r, g, b, a) {
    return `rgba(${r},${g},${b},${Math.max(0, a).toFixed(3)})`;
  }

  // ── Draw: Line Trail (베지어 곡선 잔상) ──
  function drawTrail(now) {
    // Prune expired points
    trail = trail.filter(p => now - p.t < TRAIL_LIFETIME);
    if (trail.length < 3) return;

    // Pre-compute midpoints — these become the actual curve anchors.
    // Using adjacent midpoints as start/end of each quadratic segment
    // keeps the curve smooth through every recorded point.
    const mids = [];
    for (let i = 0; i < trail.length - 1; i++) {
      mids.push({
        x: (trail[i].x + trail[i + 1].x) / 2,
        y: (trail[i].y + trail[i + 1].y) / 2,
      });
    }

    // Draw each segment as: moveTo(mid[i]) → quadraticCurveTo(pt[i+1], mid[i+1])
    for (let i = 0; i < mids.length - 1; i++) {
      const ctrl = trail[i + 1];           // original point → control point
      const m0   = mids[i];               // segment start (midpoint)
      const m1   = mids[i + 1];           // segment end   (midpoint)

      // Age-based alpha: newer segments are more opaque
      const age   = 1 - (now - ctrl.t) / TRAIL_LIFETIME;
      const alpha = Math.max(0, age * 0.52);

      // Thickness: tapers at tail, slightly thicker near head
      const t  = (i + 1) / mids.length;  // 0 = tail, 1 = head
      const lw = 0.8 + t * 1.8;

      ctx.save();
      ctx.strokeStyle = rgba(80, 65, 50, alpha);
      ctx.lineWidth   = lw;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      ctx.moveTo(m0.x, m0.y);
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, m1.x, m1.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Draw: Cursor dot ──
  function drawCursorDot(x, y) {
    const size  = isDown ? 2.5 : isHover ? 4.5 : 3;
    const alpha = isDown ? 1.0 : 0.9;
    const color = isHover ? rgba(100, 80, 60, alpha) : rgba(50, 40, 30, alpha);

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Draw: Cursor ring (15px base) ──
  function drawCursorRing(x, y) {
    const targetR = isDown ? 9 : isHover ? 22 : 15;
    const alpha   = isDown ? 0.9 : isHover ? 0.35 : 0.50;
    const lw      = isHover ? 1.5 : 1.2;

    ctx.save();
    ctx.strokeStyle = rgba(60, 50, 40, alpha);
    ctx.lineWidth   = lw;

    if (isHover) {
      ctx.fillStyle = rgba(60, 50, 40, 0.06);
      ctx.beginPath();
      ctx.arc(x, y, targetR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, targetR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── Animation loop ──
  function animate() {
    animId = requestAnimationFrame(animate);
    const now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lag outer ring toward mouse
    const lag = isHover ? 0.09 : 0.13;
    ring.x += (mouse.x - ring.x) * lag;
    ring.y += (mouse.y - ring.y) * lag;

    // 1) Line trail (잔상) — drawn first, below everything
    drawTrail(now);

    // 2) Particles (burst + ripple)
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (p.type === 'ripple') {
        p.radius += (p.maxRadius - p.radius) * 0.06;
        p.alpha  -= p.decay;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }

        ctx.save();
        ctx.strokeStyle = rgba(p.r, p.g, p.b, p.alpha);
        ctx.lineWidth   = p.lineWidth;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        continue;
      }

      // Physics
      p.x  += p.vx;
      p.y  += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.vx *= 0.97;
      p.alpha -= p.decay;

      if (p.alpha <= 0) { particles.splice(i, 1); continue; }

      const drawSize = p.size * (0.4 + p.alpha * 0.6);

      ctx.save();
      ctx.fillStyle = rgba(p.r, p.g, p.b, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.4, drawSize), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3) Cursor on top
    drawCursorRing(ring.x, ring.y);
    drawCursorDot(mouse.x, mouse.y);
  }

  animate();

  // ── Cleanup ──
  return function destroy() {
    cancelAnimationFrame(animId);
    canvas.remove();
    document.documentElement.style.cursor = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mousedown', onDown);
    document.removeEventListener('mouseup',   onUp);
  };
}
