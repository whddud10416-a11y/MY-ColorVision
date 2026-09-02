/**
 * homeMobile.js
 * Mobile Home Stage (Circle loading indicator, Noto Serif title, Test/Lab buttons)
 */
import { container } from '../state.js';

export function renderMobileHome() {
  container.innerHTML = "";

  const appEl = document.getElementById('app');
  const mainEl = document.querySelector('main');
  if (appEl) {
    appEl.style.overflowY = '';
    appEl.style.scrollSnapType = '';
    appEl.style.scrollBehavior = '';
    appEl.style.padding = '';
    appEl.scrollTop = 0;
  }
  if (mainEl) {
    mainEl.style.paddingTop = '';
  }

  const isCurrentlyLoading = !window.appLoaded;

  const html = `
    <div class="flex flex-col items-center justify-center h-full min-h-[calc(100dvh-5rem)] w-full px-4 relative overflow-hidden select-none text-center" id="home-root">
      
      <!-- Ambient Circle Backdrop / Loading Indicator -->
      <div id="home-cover-circle"
        class="absolute -z-10 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full border border-stone-200/80 transition-all duration-700 ${isCurrentlyLoading ? 'loading-circle' : ''}"
        style="background: radial-gradient(circle, rgba(200, 190, 255, 0.12) 0%, rgba(245, 240, 230, 0.05) 50%, transparent 70%);">
      </div>

      <!-- Main Title -->
      <h1 id="home-cover-title"
        class="mb-2 text-4xl sm:text-6xl md:text-7xl font-bold text-stone-800 text-center w-full px-2 tracking-tight transition-all ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}"
        style="font-family: 'Noto Serif KR', serif !important; line-height: 1.15; letter-spacing: calc(0.04em + 1px) !important; text-align: center !important; --stagger: 0ms;">
        Color Vision
      </h1>

      <p id="home-cover-subtitle"
        class="text-stone-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-3 transition-all ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}"
        style="--stagger: 150ms;">
        색각 능력 진단 플랫폼
      </p>

      <p id="home-cover-desc"
        class="text-stone-500 text-xs sm:text-sm max-w-xs mx-auto break-keep leading-relaxed mb-6 sm:mb-8 transition-all ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}"
        style="--stagger: 300ms;">
        색각 이상은 단순한 시력 문제가 아닌,<br>세상을 인지하는 또 다른 방식입니다.
      </p>

      <!-- Mobile Action Buttons (Test & Lab only) -->
      <div id="home-cover-buttons"
        class="flex flex-col items-center justify-center gap-3 w-full max-w-xs transition-all ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}"
        style="--stagger: 450ms;">
        <button onclick="window.setMode('test')"
          class="glow-button w-full py-3.5 px-6 rounded-full text-white font-bold text-base shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center">
          Test
        </button>
        <button onclick="window.setMode('lab')"
          class="w-full py-3 px-6 rounded-full text-stone-700 hover:text-stone-900 font-bold text-sm border border-stone-300/90 hover:border-stone-500 bg-white/70 hover:bg-white/95 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xs flex items-center justify-center">
          Lab
        </button>
      </div>

    </div>
  `;

  container.innerHTML = html;

  if (isCurrentlyLoading) {
    const loadStartTime = Date.now();
    const MIN_LOAD_TIME = 1200;

    const startTransition = () => {
      const elapsed = Date.now() - loadStartTime;
      const remaining = Math.max(0, MIN_LOAD_TIME - elapsed);

      setTimeout(() => {
        const circle = document.getElementById('home-cover-circle');
        if (circle) circle.classList.remove('loading-circle');

        const title = document.getElementById('home-cover-title');
        const subtitle = document.getElementById('home-cover-subtitle');
        const desc = document.getElementById('home-cover-desc');
        const buttons = document.getElementById('home-cover-buttons');

        if (title) {
          title.style.setProperty('--stagger', '0ms');
          title.classList.remove('opacity-0', 'pointer-events-none');
          title.classList.add('animate-focus-in');
        }
        if (subtitle) {
          subtitle.style.setProperty('--stagger', '150ms');
          subtitle.classList.remove('opacity-0', 'pointer-events-none');
          subtitle.classList.add('animate-focus-in');
        }
        if (desc) {
          desc.style.setProperty('--stagger', '300ms');
          desc.classList.remove('opacity-0', 'pointer-events-none');
          desc.classList.add('animate-focus-in');
        }
        if (buttons) {
          buttons.style.setProperty('--stagger', '450ms');
          buttons.classList.remove('opacity-0', 'pointer-events-none');
          buttons.classList.add('animate-focus-in');
        }
      }, remaining);
    };

    const onAppLoaded = () => {
      document.removeEventListener('app-loaded', onAppLoaded);
      startTransition();
    };

    if (window.appLoaded) {
      startTransition();
    } else {
      document.addEventListener('app-loaded', onAppLoaded);
    }
  }

  window.cleanupHomeLoadingScrollLock = () => {};
}
