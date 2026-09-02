import { container } from '../state.js';

export function renderHomeStage() {
  container.innerHTML = "";

  const isCurrentlyLoading = !window.appLoaded;

  const html = `
    <div class="flex flex-col items-center justify-center h-full min-h-[calc(100dvh-5rem)] w-full px-4 relative overflow-hidden select-none" id="home-root">
      
      <!-- Ambient Circle Backdrop / Loading Indicator -->
      <div id="home-cover-circle"
        class="absolute -z-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full border border-stone-200/80 transition-all duration-700 ${isCurrentlyLoading ? 'loading-circle' : ''}"
        style="background: radial-gradient(circle, rgba(200, 190, 255, 0.12) 0%, rgba(245, 240, 230, 0.05) 50%, transparent 70%);">
      </div>

      <!-- Main Title -->
      <h1 id="home-cover-title"
        class="mb-8 sm:mb-10 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-stone-800 transition-all ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}"
        style="font-family: 'Dancing Script', cursive; line-height: 1.1; letter-spacing: calc(0.04em + 1.5px) !important; --stagger: 0ms;">
        Color Vision
      </h1>

      <!-- Mobile & Desktop Action Buttons -->
      <div id="home-cover-buttons"
        class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-md transition-all ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}"
        style="--stagger: 250ms;">
        <button onclick="window.setMode('test')"
          class="glow-button w-full sm:w-auto flex-1 py-3.5 sm:py-4 px-6 sm:px-8 rounded-full text-white font-bold text-base sm:text-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <span>검사 시작</span>
          <svg class="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
        </button>
        <button onclick="window.setMode('lab')"
          class="w-full sm:w-auto flex-1 py-3 sm:py-3.5 px-6 sm:px-7 rounded-full text-stone-700 hover:text-stone-900 font-bold text-sm sm:text-base border border-stone-300/90 hover:border-stone-500 bg-white/70 hover:bg-white/95 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2">
          <span>색각 랩</span>
        </button>
      </div>

    </div>
  `;

  container.innerHTML = html;

  // Clean any residual snap scroll style or locks
  const existingStyle = document.getElementById('home-snap-style');
  if (existingStyle) existingStyle.remove();

  // Loading sequence controller
  if (isCurrentlyLoading) {
    const loadStartTime = Date.now();
    const MIN_LOAD_TIME = 1200;

    const startTransition = () => {
      const elapsed = Date.now() - loadStartTime;
      const remaining = Math.max(0, MIN_LOAD_TIME - elapsed);

      setTimeout(() => {
        const circle = document.getElementById('home-cover-circle');
        if (circle) {
          circle.classList.remove('loading-circle');
        }

        const title = document.getElementById('home-cover-title');
        const buttons = document.getElementById('home-cover-buttons');

        if (title) {
          title.style.setProperty('--stagger', '0ms');
          title.classList.remove('opacity-0', 'pointer-events-none');
          title.classList.add('animate-focus-in');
        }
        if (buttons) {
          buttons.style.setProperty('--stagger', '250ms');
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

  // Safe dummy cleanup function for app.js
  window.cleanupHomeLoadingScrollLock = () => {};
}
