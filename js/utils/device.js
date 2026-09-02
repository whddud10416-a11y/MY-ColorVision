/**
 * device.js
 * Device & Environment Detection Utilities
 */

/**
 * Checks if the current environment is a real mobile/tablet device
 * by inspecting User-Agent tokens and touchscreen pointer hardware.
 */
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const hasTouch = (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
  const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  return isMobileUA || (hasTouch && isCoarsePointer);
}

/**
 * Checks if the current viewport width is in the mobile threshold (< 768px).
 */
export function isMobileViewport(breakpoint = 768) {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoint;
}

/**
 * Hybrid detection: true if actual mobile device OR viewport is mobile sized.
 * This allows both real mobile phones and PC responsive testing (resizing browser) to work seamlessly.
 */
export function isMobileLayout(breakpoint = 768) {
  return isMobileDevice() || isMobileViewport(breakpoint);
}
