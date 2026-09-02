/**
 * homeDesktop.js
 * Desktop Home Stage (Cover, 3x2 CVD Explorer, Feature Cards, 3-page Snap Scroll)
 */
import { container } from '../state.js';
import { CVD_DATA } from '../data/cvdData.js';
import { renderCones, renderSwatches, renderPrevalence } from './homeUI.js';

export function renderDesktopHome() {
  container.innerHTML = "";

  const isCurrentlyLoading = !window.appLoaded;

  const html = `
    <div class="flex flex-col w-full" id="home-scroll-root">

      <!-- ══ PAGE 1: Cover ══ -->
      <section class="home-snap-section flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <div id="home-cover-circle" class="absolute -z-10 w-72 h-72 sm:w-[420px] sm:h-[420px] rounded-full border border-stone-200/70 ${isCurrentlyLoading ? 'loading-circle' : ''}" style="background:radial-gradient(circle,rgba(200,190,255,0.1) 0%,transparent 70%);"></div>
        <h1 id="home-cover-title" class="mb-3 text-6xl sm:text-7xl lg:text-8xl font-bold text-stone-800 text-center tracking-tight ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}" style="font-family:'Noto Serif KR',serif !important;line-height:1.15;letter-spacing:calc(0.04em + 1px) !important; text-align: center !important; --stagger: 0ms;">Color Vision</h1>
        <p id="home-cover-subtitle" class="text-stone-400 text-sm sm:text-base font-semibold tracking-[0.22em] uppercase mb-6 ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}" style="--stagger: 300ms;">색각 능력 진단 플랫폼</p>
        <p id="home-cover-desc" class="text-stone-500 text-sm sm:text-base max-w-lg mx-auto break-keep leading-relaxed mb-10 ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}" style="--stagger: 600ms;">
          색각 이상은 단순한 시력 문제가 아닌,<br>세상을 인지하는 또 다른 방식입니다.
        </p>
        <div id="home-cover-scroll" class="${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}" style="--stagger: 900ms;">
          <div class="flex flex-col items-center gap-1.5 animate-bounce">
            <span class="text-[11px] text-stone-400 tracking-widest uppercase">Scroll</span>
            <svg class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </section>

      <!-- ══ PAGE 2: CVD Explorer ══ -->
      <section class="home-snap-section flex flex-col items-center justify-center px-4 lg:px-8 overflow-y-auto">
        <div class="max-w-5xl mx-auto w-full flex flex-col gap-5 py-8">
          <div class="text-center">
            <h2 class="display-font text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-800 mb-6">What is Color Vision</h2>
            <p class="text-stone-500 text-sm sm:text-base max-w-2xl mx-auto break-keep leading-relaxed">
              특정 원추세포(Cone Cell)의 기능 이상으로 발생합니다. R·G·B 버튼을 조합해 각 유형의 상세 정보를 확인해보세요.
            </p>
          </div>
          <div class="w-full flex flex-col items-center gap-6 mt-4">
            <div class="flex flex-col items-center gap-2">
              <div class="flex gap-4">
                <button id="cvd-btn-R" class="cvd-btn w-12 h-12 sm:w-14 sm:h-14 rounded-full font-black text-base sm:text-lg border-2 border-rose-300 text-rose-400 hover:text-rose-400 bg-transparent hover:bg-rose-50 transition-all" data-color="R">R</button>
                <button id="cvd-btn-G" class="cvd-btn w-12 h-12 sm:w-14 sm:h-14 rounded-full font-black text-base sm:text-lg border-2 border-emerald-300 text-emerald-500 hover:text-emerald-500 bg-transparent hover:bg-emerald-50 transition-all" data-color="G">G</button>
                <button id="cvd-btn-B" class="cvd-btn w-12 h-12 sm:w-14 sm:h-14 rounded-full font-black text-base sm:text-lg border-2 border-blue-300 text-blue-400 hover:text-blue-400 bg-transparent hover:bg-blue-50 transition-all" data-color="B">B</button>
              </div>
              <span class="text-xs text-stone-400 break-keep text-center mt-1">색상을 하나 이상 선택해보세요</span>
            </div>
            <div id="cvd-info-panel" class="min-h-[60px] flex flex-col items-center justify-center text-center max-w-2xl w-full">
              <p class="text-stone-400 text-sm italic">버튼을 선택하면 관련 색각 이상 정보가 표시됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ PAGE 3: Feature Cards ══ -->
      <section class="home-snap-section flex flex-col items-center justify-center px-4 lg:px-8">
        <div class="max-w-5xl mx-auto w-full flex flex-col gap-5">
          <div class="text-center">
            <h2 class="display-font text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-800 mb-6">Search</h2>
            <p class="text-stone-400 text-sm">상세 설명을 보려면 카드를 선택하세요.</p>
          </div>
          <div class="relative w-full" style="clip-path: inset(-80px 0);">
            <button id="carousel-left" class="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-stone-600 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-stone-200 rounded-full w-12 h-12 flex items-center justify-center transition-all hover:scale-105" style="opacity:0;pointer-events:none;">
              <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div id="cards-carousel" class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 sm:gap-6 px-4 sm:px-8 py-4 lg:justify-center">

              <!-- Card 1: Test -->
              <div class="flip-card perspective-1000 flex-none w-[80vw] sm:w-[280px] lg:w-[300px] h-[300px] sm:h-[340px] snap-center cursor-pointer group">
                <div class="flip-card-inner preserve-3d relative w-full h-full rounded-2xl">
                  <div class="backface-hidden absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                    <div class="w-14 h-14 text-stone-600 flex items-center justify-center mb-4"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></div>
                    <h3 class="display-font text-xl font-bold text-stone-800 mb-2">Test</h3>
                    <p class="text-stone-500 text-sm break-keep leading-relaxed">15단계의 검사로 색각 능력을 정밀하게<br>측정합니다.</p>
                  </div>
                  <div class="backface-hidden rotate-y-180 absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                    <h3 class="display-font text-xl font-bold text-stone-800 mb-3">Test</h3>
                    <p class="text-stone-500 text-sm break-keep leading-relaxed mb-6">검사는 약 3~5분 소요됩니다. 화면 밝기를 최대로 설정해주세요.</p>
                    <button onclick="window.setMode('test')" class="glow-button px-6 py-2.5 rounded-full text-white font-bold text-base w-full">입장</button>
                  </div>
                </div>
              </div>

              <!-- Card 2: Lab -->
              <div class="flip-card perspective-1000 flex-none w-[80vw] sm:w-[280px] lg:w-[300px] h-[300px] sm:h-[340px] snap-center cursor-pointer group">
                <div class="flip-card-inner preserve-3d relative w-full h-full rounded-2xl">
                  <div class="backface-hidden absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                    <div class="w-14 h-14 text-stone-600 flex items-center justify-center mb-4"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg></div>
                    <h3 class="display-font text-xl font-bold text-stone-800 mb-2">Lab</h3>
                    <p class="text-stone-500 text-sm break-keep leading-relaxed">다른 이들의 시야를 직접 체험하고 색상을 보정해 볼 수 있습니다.</p>
                  </div>
                  <div class="backface-hidden rotate-y-180 absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                    <h3 class="display-font text-xl font-bold text-stone-800 mb-3">Lab</h3>
                    <p class="text-stone-500 text-sm break-keep leading-relaxed mb-6">이미지에 필터를 적용하여<br>실시간으로 확인하세요</p>
                    <button onclick="window.setMode('lab')" class="glow-button px-6 py-2.5 rounded-full text-white font-bold text-base w-full">입장</button>
                  </div>
                </div>
              </div>

              <!-- Card 3: Challenge -->
              <div class="flip-card perspective-1000 flex-none w-[80vw] sm:w-[280px] lg:w-[300px] h-[300px] sm:h-[340px] snap-center cursor-pointer group">
                <div class="flip-card-inner preserve-3d relative w-full h-full rounded-2xl">
                  <div class="backface-hidden absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                    <div class="w-14 h-14 text-stone-600 flex items-center justify-center mb-4"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 9v3a5 5 0 0010 0V9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 17v4"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 21h8"/></svg></div>
                    <h3 class="display-font text-xl font-bold text-stone-800 mb-2">Play</h3>
                    <p class="text-stone-500 text-sm break-keep leading-relaxed">제한시간 내에 색상 퍼즐을 해결하고 리더보드에 이름을 남기세요.</p>
                  </div>
                  <div class="backface-hidden rotate-y-180 absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                    <h3 class="display-font text-xl font-bold text-stone-800 mb-3">Play</h3>
                    <p class="text-stone-500 text-sm break-keep leading-relaxed mb-6">총 5문항, 제한시간 3분. 최고 점수를 달성하세요!</p>
                    <button onclick="window.setMode('challenge')" class="glow-button px-6 py-2.5 rounded-full text-white font-bold text-base w-full">입장</button>
                  </div>
                </div>
              </div>

            </div>
            <button id="carousel-right" class="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-stone-600 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-stone-200 rounded-full w-12 h-12 flex items-center justify-center transition-all hover:scale-105" style="opacity:0;pointer-events:none;">
              <svg class="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>

    </div><!-- /root -->
  `;

  container.innerHTML = html;

  // ── Snap scroll setup ──
  const appEl = document.getElementById('app');
  const mainEl = document.querySelector('main');
  if (mainEl) {
    mainEl.style.paddingTop = '0';
  }
  if (appEl) {
    appEl.style.padding = '0';
    appEl.style.overflowY = 'scroll';
    appEl.style.scrollSnapType = 'y mandatory';
    appEl.style.scrollBehavior = 'smooth';
  }

  const sectionH = mainEl ? mainEl.clientHeight : (appEl ? appEl.clientHeight : window.innerHeight);

  const existingStyle = document.getElementById('home-snap-style');
  if (existingStyle) existingStyle.remove();
  const style = document.createElement('style');
  style.id = 'home-snap-style';
  style.textContent = `
    .home-snap-section {
      height: ${sectionH}px;
      flex-shrink: 0;
      scroll-snap-align: start;
      scroll-snap-stop: always;
    }
  `;
  document.head.appendChild(style);

  // ── Loading sequence transition controller ──
  if (isCurrentlyLoading) {
    const loadStartTime = Date.now();
    const MIN_LOAD_TIME = 1500;

    const preventDefault = (e) => e.preventDefault();
    const preventKeyScroll = (e) => {
      const keys = ['ArrowDown', 'ArrowUp', ' ', 'Spacebar', 'PageDown', 'PageUp', 'Home', 'End'];
      if (keys.includes(e.key)) e.preventDefault();
    };

    if (appEl) {
      appEl.addEventListener('wheel', preventDefault, { passive: false });
      appEl.addEventListener('touchmove', preventDefault, { passive: false });
    }
    window.addEventListener('keydown', preventKeyScroll, { passive: false });

    window.cleanupHomeLoadingScrollLock = () => {
      if (appEl) {
        appEl.removeEventListener('wheel', preventDefault);
        appEl.removeEventListener('touchmove', preventDefault);
      }
      window.removeEventListener('keydown', preventKeyScroll);
    };

    const startTransition = () => {
      const elapsed = Date.now() - loadStartTime;
      const remaining = Math.max(0, MIN_LOAD_TIME - elapsed);

      setTimeout(() => {
        const circle = document.getElementById('home-cover-circle');
        if (circle) circle.classList.remove('loading-circle');

        const title = document.getElementById('home-cover-title');
        const subtitle = document.getElementById('home-cover-subtitle');
        const desc = document.getElementById('home-cover-desc');
        const scroll = document.getElementById('home-cover-scroll');

        if (title) {
          title.style.setProperty('--stagger', '0ms');
          title.classList.remove('opacity-0', 'pointer-events-none');
          title.classList.add('animate-focus-in');
        }
        if (subtitle) {
          subtitle.style.setProperty('--stagger', '300ms');
          subtitle.classList.remove('opacity-0', 'pointer-events-none');
          subtitle.classList.add('animate-focus-in');
        }
        if (desc) {
          desc.style.setProperty('--stagger', '600ms');
          desc.classList.remove('opacity-0', 'pointer-events-none');
          desc.classList.add('animate-focus-in');
        }
        if (scroll) {
          scroll.style.setProperty('--stagger', '900ms');
          scroll.classList.remove('opacity-0', 'pointer-events-none');
          scroll.classList.add('animate-focus-in');
        }

        setTimeout(() => {
          if (typeof window.cleanupHomeLoadingScrollLock === 'function') {
            window.cleanupHomeLoadingScrollLock();
            window.cleanupHomeLoadingScrollLock = null;
          }
        }, 2100);
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

  // Setup Carousel Interactions
  const carousel = document.getElementById('cards-carousel');
  const btnLeft = document.getElementById('carousel-left');
  const btnRight = document.getElementById('carousel-right');

  const updateArrows = () => {
    if (!carousel || !btnLeft || !btnRight) return;
    if (carousel.scrollWidth > carousel.clientWidth + 5) {
      btnLeft.style.opacity = '1';
      btnLeft.style.pointerEvents = 'auto';
      btnRight.style.opacity = '1';
      btnRight.style.pointerEvents = 'auto';
    } else {
      btnLeft.style.opacity = '0';
      btnLeft.style.pointerEvents = 'none';
      btnRight.style.opacity = '0';
      btnRight.style.pointerEvents = 'none';
    }
  };

  updateArrows();
  window.addEventListener('resize', updateArrows);

  if (btnLeft && btnRight) {
    btnLeft.addEventListener('click', () => {
      carousel.scrollBy({ left: -360, behavior: 'smooth' });
    });
    btnRight.addEventListener('click', () => {
      carousel.scrollBy({ left: 360, behavior: 'smooth' });
    });
  }

  if (carousel) {
    carousel.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY !== 0) {
        e.preventDefault();
        carousel.scrollBy({ left: e.deltaY * 1.5, behavior: 'auto' });
      }
    });
  }

  // Handle dynamic flip direction and hover/touch flipping
  const flipCards = document.querySelectorAll('.flip-card');
  const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  flipCards.forEach(card => {
    if (isHoverDevice) {
      card.addEventListener('mouseenter', (e) => {
        const rect = card.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const deg = e.clientX < center ? '180deg' : '-180deg';
        card.style.setProperty('--flip-deg', deg);
        flipCards.forEach(c => { if (c !== card) c.classList.remove('flipped'); });
        card.classList.add('flipped');
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('flipped');
      });

      card.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
      });
    } else {
      card.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
        if (e.clientX) {
          const rect = card.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const deg = e.clientX < center ? '180deg' : '-180deg';
          card.style.setProperty('--flip-deg', deg);
        }
        flipCards.forEach(c => { if (c !== card) c.classList.remove('flipped'); });
        card.classList.toggle('flipped');
      });
    }
  });

  // CVD Explorer logic
  initCVDExplorer();
}

function initCVDExplorer() {
  const selected = new Set();
  const infoPanel = document.getElementById('cvd-info-panel');
  if (!infoPanel) return;

  const ringColorMap = { R: 'ring-rose-400', G: 'ring-emerald-400', B: 'ring-blue-400' };
  const bgColorMap = { R: 'bg-rose-400', G: 'bg-emerald-500', B: 'bg-blue-400' };
  const textColorMap = { R: 'text-rose-400', G: 'text-emerald-500', B: 'text-blue-400' };

  document.querySelectorAll('.cvd-btn').forEach(btn => {
    btn.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease';
    btn.addEventListener('click', () => {
      const c = btn.dataset.color;
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => { btn.style.transform = ''; }, 150);
      if (selected.has(c)) {
        selected.delete(c);
        btn.classList.remove('ring-2', 'ring-offset-1', ringColorMap[c], bgColorMap[c], 'text-white');
        btn.classList.add('bg-transparent', textColorMap[c]);
      } else {
        selected.add(c);
        btn.classList.remove('bg-transparent', textColorMap[c]);
        btn.classList.add('ring-2', 'ring-offset-1', ringColorMap[c], bgColorMap[c], 'text-white');
      }
      renderCVDInfo();
    });
  });

  let infoTimeout1, infoTimeout2;

  function renderCVDInfo() {
    const key = ['R', 'G', 'B'].filter(c => selected.has(c)).join('');
    clearTimeout(infoTimeout1);
    clearTimeout(infoTimeout2);

    const currentHeight = infoPanel.getBoundingClientRect().height;
    infoPanel.style.height = `${currentHeight}px`;
    infoPanel.style.transition = 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
    infoPanel.style.opacity = '0';
    infoPanel.style.overflow = 'hidden';

    infoTimeout1 = setTimeout(() => {
      if (!key) {
        infoPanel.innerHTML = `<p class="text-stone-400 text-sm italic py-2">버튼을 선택하면 관련 색각 이상 정보가 표시됩니다.</p>`;
      } else {
        const d = CVD_DATA[key];
        if (d) {
          infoPanel.innerHTML = `
            <div class="flex flex-col items-center text-center gap-5 pt-4">
              <span class="inline-block self-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${d.bg} ${d.color} border ${d.border}">${d.name}</span>
              <div class="flex flex-col sm:flex-row gap-4 justify-center w-full">
                <div class="flex flex-col gap-3 sm:w-56 flex-shrink-0">
                  <span class="text-xs font-bold text-stone-400 uppercase tracking-widest">원추세포 상태</span>
                  <div class="flex justify-around items-start gap-3 py-2">${renderCones(d.cones)}</div>
                  <p class="text-[11px] text-stone-400 text-center leading-relaxed">흐릿한 원이 기능 이상 수용체입니다</p>
                </div>
                <div class="flex flex-col gap-3 flex-1">
                  <span class="text-xs font-bold text-stone-400 uppercase tracking-widest">성별 유병률</span>
                  <div class="py-1">${renderPrevalence(d.prevalence)}</div>
                </div>
              </div>
              <div class="flex flex-col gap-3 w-full mt-2">
                <span class="text-xs font-bold text-stone-400 uppercase tracking-widest">혼동되는 색상 쌍 — 이 색들이 같아 보입니다</span>
                <div class="flex items-start justify-around gap-3 py-2 flex-wrap">${renderSwatches(d.confusions)}</div>
              </div>
            </div>
          `;
        }
      }

      infoPanel.style.height = 'auto';
      const newHeight = infoPanel.getBoundingClientRect().height;
      infoPanel.style.height = `${currentHeight}px`;
      infoPanel.offsetHeight;
      infoPanel.style.height = `${newHeight}px`;
      infoPanel.style.opacity = '1';

      infoTimeout2 = setTimeout(() => {
        infoPanel.style.height = 'auto';
        infoPanel.style.overflow = 'visible';
      }, 400);
    }, 200);
  }
}
