/**
 * device.js
 * Device & Environment Detection Utilities
 */

/**
 * Checks if the current environment is a real mobile/tablet device
 * by inspecting pointer accuracy, hover capability, touch points, and User-Agent.
 * PC browsers with narrowed windows (pointer: fine, hover: hover) evaluate to false.
 */
export function isRealMobileDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const isCoarsePointer = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const noHover = !!(window.matchMedia && window.matchMedia('(hover: none)').matches);
  const hasTouchPoints = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  // PC 브라우저에서 창만 좁힌 경우는 마우스(pointer: fine)이므로 false 반환
  return isMobileUA || (hasTouchPoints && isCoarsePointer && noHover);
}

/**
 * Checks if the current environment is a hover-capable desktop/mouse device.
 */
export function isHoverPointerDevice() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Legacy alias for isRealMobileDevice for backward compatibility.
 */
export function isMobileDevice() {
  return isRealMobileDevice();
}

/**
 * Checks if the current viewport width is in the mobile threshold (< 768px).
 */
export function isMobileViewport(breakpoint = 768) {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoint;
}

/**
 * Layout detection: returns true ONLY when it is an actual mobile device AND viewport is mobile-sized.
 * PC browser resizing preserves desktop UI.
 */
export function isMobileLayout(breakpoint = 768) {
  return isRealMobileDevice() && isMobileViewport(breakpoint);
}
