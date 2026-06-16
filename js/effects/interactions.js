// ═══════════════════════════════════════════
// Cursor Glow + Button Hover Glow + Spring Physics
// ═══════════════════════════════════════════

let isActive = false;
let cursorGlow = null;
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;
let rafId = null;

// ── Cursor Glow Follower ──
function updateCursorGlow() {
  if (!isActive) return;
  
  // Lerp — smooth follow with damping
  glowX += (mouseX - glowX) * 0.06;
  glowY += (mouseY - glowY) * 0.06;
  
  if (cursorGlow) {
    cursorGlow.style.transform = `translate(${glowX - 300}px, ${glowY - 300}px)`;
  }
  
  rafId = requestAnimationFrame(updateCursorGlow);
}

function onGlobalMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  if (cursorGlow && cursorGlow.style.opacity === '0') {
    cursorGlow.style.opacity = '1';
  }
}

// ── Button Hover — Cursor Position Glow ──
function onButtonMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
}

// ── Glass Panel — Cursor Tracking ──
function onPanelMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
}

// ── Spring Physics for hover scale ──
class SpringAnimation {
  constructor(element) {
    this.el = element;
    this.current = 1;
    this.target = 1;
    this.velocity = 0;
    this.stiffness = 0.15;
    this.damping = 0.7;
    this.animating = false;
    
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.update = this.update.bind(this);
    
    element.addEventListener('mouseenter', this.onEnter);
    element.addEventListener('mouseleave', this.onLeave);
    element.addEventListener('mousedown', this.onDown);
    element.addEventListener('mouseup', this.onUp);
  }
  
  onEnter() {
    this.target = 1.04;
    this.startAnimation();
  }
  
  onLeave() {
    this.target = 1;
    this.startAnimation();
  }
  
  onDown() {
    this.target = 0.97;
    this.velocity = -0.02;
    this.startAnimation();
  }
  
  onUp() {
    this.target = 1.04;
    this.velocity = 0.01;
    this.startAnimation();
  }
  
  startAnimation() {
    if (!this.animating) {
      this.animating = true;
      this.update();
    }
  }
  
  update() {
    const force = (this.target - this.current) * this.stiffness;
    this.velocity += force;
    this.velocity *= this.damping;
    this.current += this.velocity;
    
    this.el.style.transform = `scale(${this.current.toFixed(4)})`;
    
    if (Math.abs(this.velocity) > 0.0001 || Math.abs(this.target - this.current) > 0.0001) {
      requestAnimationFrame(this.update);
    } else {
      this.current = this.target;
      this.el.style.transform = `scale(${this.target})`;
      this.animating = false;
    }
  }
  
  destroy() {
    this.el.removeEventListener('mouseenter', this.onEnter);
    this.el.removeEventListener('mouseleave', this.onLeave);
    this.el.removeEventListener('mousedown', this.onDown);
    this.el.removeEventListener('mouseup', this.onUp);
  }
}

const springs = [];

// ── Public API ──

export function initInteractions() {
  if (isActive) return;
  isActive = true;
  
  cursorGlow = document.getElementById('cursor-glow');
  window.addEventListener('mousemove', onGlobalMouseMove, { passive: true });
  rafId = requestAnimationFrame(updateCursorGlow);
}

export function refreshInteractions() {
  // Clean up old springs
  springs.forEach(s => s.destroy());
  springs.length = 0;
  
  // Re-bind glow-button hover tracking
  document.querySelectorAll('.glow-button').forEach(btn => {
    btn.addEventListener('mousemove', onButtonMouseMove, { passive: true });
    
    // Only apply spring to non-slim buttons (not inline small ones)
    if (!btn.classList.contains('no-spring')) {
      springs.push(new SpringAnimation(btn));
    }
  });
  
  // Re-bind glass-panel interactive hover tracking
  document.querySelectorAll('.glass-panel-interactive').forEach(panel => {
    panel.addEventListener('mousemove', onPanelMouseMove, { passive: true });
  });
}

export function destroyInteractions() {
  if (!isActive) return;
  isActive = false;
  
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  
  window.removeEventListener('mousemove', onGlobalMouseMove);
  
  springs.forEach(s => s.destroy());
  springs.length = 0;
  
  if (cursorGlow) {
    cursorGlow.style.opacity = '0';
  }
}
