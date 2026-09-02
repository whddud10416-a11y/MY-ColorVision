/**
 * home.js
 * Entry coordinator for Home Stage (routes to Mobile or Desktop module based on device/layout)
 */
import { isMobileLayout } from '../utils/device.js';
import { renderMobileHome } from './homeMobile.js';
import { renderDesktopHome } from './homeDesktop.js';

let activeLayout = null; // 'mobile' | 'desktop'
let resizeBound = false;

export function renderHomeStage() {
  const isMobile = isMobileLayout();
  activeLayout = isMobile ? 'mobile' : 'desktop';

  if (!resizeBound) {
    resizeBound = true;
    window.addEventListener('resize', () => {
      // Check if we are currently on the home page
      const navHome = document.getElementById('nav-home');
      const isHomeActive = navHome && navHome.classList.contains('active-nav');
      if (!isHomeActive) return;

      const currentlyMobile = isMobileLayout();
      const target = currentlyMobile ? 'mobile' : 'desktop';
      if (activeLayout !== target) {
        renderHomeStage();
      }
    });
  }

  // Clean up any existing locks / styles before rendering
  if (typeof window.cleanupHomeLoadingScrollLock === 'function') {
    window.cleanupHomeLoadingScrollLock();
    window.cleanupHomeLoadingScrollLock = null;
  }
  const snapStyle = document.getElementById('home-snap-style');
  if (snapStyle) snapStyle.remove();

  if (isMobile) {
    renderMobileHome();
  } else {
    renderDesktopHome();
  }
}
