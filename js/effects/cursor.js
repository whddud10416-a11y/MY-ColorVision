/* ==========================================
   CUSTOM CURSOR — Particle System
   Warm Editorial Design
   ========================================== */
import { isRealMobileDevice } from '../utils/device.js';

function isMobileOrTouchEnv() {
  if (typeof window === 'undefined') return true;
  if (isRealMobileDevice()) return true;
  const ua = navigator.userAgent || '';
  if (/Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1) {
    return true;
  }
  if (window.matchMedia) {
    if (window.matchMedia('(pointer: coarse) and (hover: none)').matches) return true;
    if (window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches) return true;
  }
  return false;
}

export function initCustomCursor() {
  if (isMobileOrTouchEnv()) {
    document.getElementById('cursor-canvas')?.remove();
    document.documentElement.style.cursor = '';
    document.documentElement.classList.remove('has-custom-cursor');
    return () => {};
  }

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
  if (!ctx) { canvas.remove(); throw new Error('Canvas 2D is unavailable'); }

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
  let isRunning  = false;

  function wakeUp() {
    if (!isRunning && !document.hidden) {
      isRunning = true;
      animId = requestAnimationFrame(animate);
    }
  }

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

  // ── Touch guard ──
  let lastTouchTime = 0;
  const onTouchStart = () => {
    lastTouchTime = performance.now();
  };
  window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });

  // ── Mouse events ──
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mousedown', onDown);
  document.addEventListener('mouseup',   onUp);
  const onLeave = () => {
    mouse.x = -200;
    mouse.y = -200;
    wakeUp();
  };
  document.addEventListener('mouseleave', onLeave);

  const onOver = (e) => {
    const el = e.target.closest('button, a, [role="button"], input, label, [draggable="true"], .color-cube, .cvd-btn, .flip-card');
    const newHover = !!el;
    if (isHover !== newHover) {
      isHover = newHover;
      wakeUp();
    }
  };
  document.addEventListener('mouseover', onOver);

  const onVisibilityChange = () => {
    if (!document.hidden) {
      wakeUp();
    } else if (animId) {
      cancelAnimationFrame(animId);
      isRunning = false;
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  function isTouchEvent(e) {
    if (e?.pointerType === 'touch') return true;
    if (e?.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return true;
    if (performance.now() - lastTouchTime < 700) return true;
    return false;
  }

  function onMove(e) {
    if (isTouchEvent(e)) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Record position for line trail
    trail.push({ x: mouse.x, y: mouse.y, t: performance.now() });
    if (trail.length > TRAIL_MAX_LEN) trail.shift();
    wakeUp();
  }

  function onDown(e) {
    if (isTouchEvent(e)) return;
    isDown = true;
    wakeUp();
  }

  function onUp(e) {
    if (isTouchEvent(e)) return;
    isDown = false;
    spawnBurst(e.clientX, e.clientY);
    wakeUp();
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
      const color = PASTEL[i % 3]; // R, G, B 순환
      const angle = (Math.PI * 2 / COUNT) * i + (Math.random() - 0.5) * 0.4;
      const speed = 1.8 + Math.random() * 2.8;

      particles.push({
        type: 'spark',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.2 + Math.random() * 1.6,
        r: color[0], g: color[1], b: color[2],
        alpha: 0.85,
        decay: 0.016 + Math.random() * 0.012,
        gravity: 0.05,
      });
    }
  }

  // ── Helpers ──
  function rgba(r, g, b, a) {
    return `rgba(${r},${g},${b},${Math.max(0, a).toFixed(3)})`;
  }

  // ── Draw: Line trail (잔상) ──
  function drawTrail(now) {
    // Expire old points
    while (trail.length > 0 && (now - trail[0].t) > TRAIL_LIFETIME) {
      trail.shift();
    }

    if (trail.length < 2) return;

    for (let i = 1; i < trail.length; i++) {
      const p0 = trail[i - 1];
      const p1 = trail[i];
      const age = now - p1.t;
      const progress = 1 - Math.min(1, age / TRAIL_LIFETIME); // 1 = new, 0 = old

      const alpha = progress * 0.22;
      const width = 0.8 + progress * 1.6;

      ctx.save();
      ctx.strokeStyle = rgba(60, 50, 40, alpha);
      ctx.lineWidth   = width;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Draw: Cursor dot (3px base) ──
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

  // ── Animation loop with idle sleep for low-spec devices ──
  function animate() {
    const now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lag outer ring toward mouse
    const lag = isHover ? 0.09 : 0.13;
    const dx = mouse.x - ring.x;
    const dy = mouse.y - ring.y;
    ring.x += dx * lag;
    ring.y += dy * lag;

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

    // Idle sleep check: if ring caught up, no particles, no active trail, pause RAF
    const distSq = dx * dx + dy * dy;
    const isIdle = particles.length === 0 && trail.length === 0 && distSq < 0.1 && !isDown;
    if (isIdle) {
      ring.x = mouse.x;
      ring.y = mouse.y;
      isRunning = false;
      animId = null;
    } else {
      animId = requestAnimationFrame(animate);
    }
  }

  wakeUp();

  // ── Cleanup ──
  return function destroy() {
    window.removeEventListener('touchstart', onTouchStart, { capture: true });
    if (animId) cancelAnimationFrame(animId);
    isRunning = false;
    canvas.remove();
    document.documentElement.style.cursor = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mousedown', onDown);
    document.removeEventListener('mouseup',   onUp);
    document.removeEventListener('mouseleave', onLeave);
    document.removeEventListener('mouseover', onOver);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('resize', resize);
  };
}
