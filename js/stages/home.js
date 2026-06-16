import { container } from '../state.js';

export function renderHomeStage() {
  container.innerHTML = "";

  const isCurrentlyLoading = !window.appLoaded;

  const html = `
    <div class="flex flex-col w-full" id="home-scroll-root">

      <!-- ══ PAGE 1: Cover ══ -->
      <section class="home-snap-section flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <div id="home-cover-circle" class="absolute -z-10 w-72 h-72 sm:w-[420px] sm:h-[420px] rounded-full border border-stone-200/70 ${isCurrentlyLoading ? 'loading-circle' : ''}" style="background:radial-gradient(circle,rgba(200,190,255,0.1) 0%,transparent 70%);"></div>
        <h1 id="home-cover-title" class="mb-3 text-6xl sm:text-7xl lg:text-8xl font-bold text-stone-800 ${isCurrentlyLoading ? 'opacity-0 pointer-events-none' : 'animate-focus-in'}" style="font-family:'Dancing Script',cursive;line-height:1.1;letter-spacing:calc(0.05em + 1.5px) !important; --stagger: 0ms;">Color Vision</h1>
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
  // Remove top padding from main so snap sections fill the full viewport
  if (mainEl) {
    mainEl.style.paddingTop = '0';
  }
  if (appEl) {
    appEl.style.padding = '0';
    appEl.style.overflowY = 'scroll';
    appEl.style.scrollSnapType = 'y mandatory';
    appEl.style.scrollBehavior = 'smooth';
  }

  // Measure actual visible height after padding removal
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
    const MIN_LOAD_TIME = 1500; // 1.5 seconds minimum delay for layout polish

    // Intercept scroll-triggering user inputs to lock scroll without removing scrollbar gutter
    const preventDefault = (e) => e.preventDefault();
    const preventKeyScroll = (e) => {
      const keys = ['ArrowDown', 'ArrowUp', ' ', 'Spacebar', 'PageDown', 'PageUp', 'Home', 'End'];
      if (keys.includes(e.key)) {
        e.preventDefault();
      }
    };

    if (appEl) {
      appEl.addEventListener('wheel', preventDefault, { passive: false });
      appEl.addEventListener('touchmove', preventDefault, { passive: false });
    }
    window.addEventListener('keydown', preventKeyScroll, { passive: false });

    // Define cleanup routine
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
        // Stop loading spinner
        const circle = document.getElementById('home-cover-circle');
        if (circle) {
          circle.classList.remove('loading-circle');
        }

        // Reveal and focus in text elements with stagger effect
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

        // Restore scroll interactions after animations are complete
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
    // If scrollWidth is greater than clientWidth, we have overflow and need arrows
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

  // Check arrows on load and resize
  updateArrows();
  window.addEventListener('resize', updateArrows);

  // Handle arrows
  if (btnLeft && btnRight) {
    btnLeft.addEventListener('click', () => {
      carousel.scrollBy({ left: -360, behavior: 'smooth' });
    });
    btnRight.addEventListener('click', () => {
      carousel.scrollBy({ left: 360, behavior: 'smooth' });
    });
  }

  // Handle wheel for horizontal scrolling (convert vertical to horizontal)
  carousel.addEventListener('wheel', (e) => {
    // If it's already a horizontal scroll (e.g. trackpad), let it be
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    // Convert vertical to horizontal
    if (e.deltaY !== 0) {
      e.preventDefault();
      carousel.scrollBy({ left: e.deltaY * 1.5, behavior: 'auto' });
    }
  });

  // Handle dynamic flip direction and hover/touch flipping
  const flipCards = document.querySelectorAll('.flip-card');
  const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  flipCards.forEach(card => {
    if (isHoverDevice) {
      // Desktop: flip on hover via JS (NOT CSS :hover) for precise timing control.
      // This prevents the button hover-glitch that occurs when the cursor is already
      // over the button area as the card rotates into view.
      card.addEventListener('mouseenter', (e) => {
        const rect = card.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const deg = e.clientX < center ? '180deg' : '-180deg';
        card.style.setProperty('--flip-deg', deg);
        // Close other cards first
        flipCards.forEach(c => { if (c !== card) c.classList.remove('flipped'); });
        card.classList.add('flipped');
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('flipped');
      });

      // On desktop, clicking a non-button area does nothing extra (hover handles it)
      card.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
        // no-op on desktop — hover controls flip
      });

    } else {
      // Mobile/touch: flip on tap
      card.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;

        if (e.clientX) {
          const rect = card.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const deg = e.clientX < center ? '180deg' : '-180deg';
          card.style.setProperty('--flip-deg', deg);
        }

        // Close other flipped cards
        flipCards.forEach(c => { if (c !== card) c.classList.remove('flipped'); });
        // Toggle current
        card.classList.toggle('flipped');
      });
    }
  });

  // ── Color Vision Deficiency Info Buttons ──
  const CVD_DATA = {
    'R': {
      name: '적색 색각이상 (Protanopia / Protanomaly)',
      color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200',
      cones: { L: 'bad', M: 'ok', S: 'ok' },
      prevalence: { male: 1.0, female: 0.02 },
      confusions: [
        { label: '익은 사과 vs 잎', a: '#CC2200', b: '#2D4A1E' },
        { label: '빨강 vs 짙은 갈색', a: '#EE1111', b: '#3A1A00' },
        { label: '주황 vs 황록', a: '#FF6600', b: '#8B8B00' },
      ],
      desc: '빨간색을 감지하는 장파장(L형) 원추세포에 이상이 생긴 상태입니다. 빨간색이 매우 어둡거나 검은색에 가깝게 보이며, 선명한 붉은색과 짙은 갈색·카키색 구분이 거의 불가능합니다. 교통 신호에서 위치가 아닌 색으로만 구분하기 어렵고, 익은 과일과 덜 익은 과일을 색상으로 판별하기 힘든 경우가 많습니다.',
      types: ['1형 색맹 (Protanopia): L형 원추세포 완전 결여, 적색이 거의 검게 보임', '1형 색약 (Protanomaly): L형 원추세포 감도 크게 저하', '남성 유병률 ~1%, 여성 ~0.02%']
    },
    'G': {
      name: '녹색 색각이상 (Deuteranopia / Deuteranomaly)',
      color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
      cones: { L: 'ok', M: 'bad', S: 'ok' },
      prevalence: { male: 6.0, female: 0.4 },
      confusions: [
        { label: '잔디 vs 낙엽', a: '#228B22', b: '#B8860B' },
        { label: '초록 vs 노랑', a: '#32CD32', b: '#FFD700' },
        { label: '빨강 vs 황갈', a: '#DC143C', b: '#B8860B' },
      ],
      desc: '녹색을 감지하는 중파장(M형) 원추세포에 이상이 생긴 유형으로, 색각이상 중 전 세계적으로 가장 흔합니다. 녹색이 황색·베이지색처럼 보이고 붉은 색조와 혼동되는 경우가 많습니다. 지도·그래프에서 빨강과 초록 범례를 구분하거나 채소 신선도를 색으로 판별하기 어렵습니다.',
      types: ['2형 색맹 (Deuteranopia): M형 원추세포 완전 결여, 적녹 혼동 가장 심함', '2형 색약 (Deuteranomaly): M형 원추세포 감도 저하, 가장 유병률이 높음', '남성 유병률 ~6%, 여성 ~0.4%']
    },
    'B': {
      name: '청색 색각이상 (Tritanopia / Tritanomaly)',
      color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
      cones: { L: 'ok', M: 'ok', S: 'bad' },
      prevalence: { male: 0.01, female: 0.01 },
      confusions: [
        { label: '파랑 vs 초록', a: '#1E90FF', b: '#228B22' },
        { label: '노랑 vs 분홍', a: '#FFD700', b: '#FF69B4' },
        { label: '보라 vs 빨강', a: '#8B008B', b: '#CC0000' },
      ],
      desc: '파란색을 감지하는 단파장(S형) 원추세포에 이상이 있는 유형입니다. 선천성보다 후천성(녹내장·당뇨망막병증·특정 약물)이 더 흔합니다. 하늘과 흰 구름 경계가 불분명하고 파랑↔초록, 노랑↔분홍 혼동이 특징입니다.',
      types: ['3형 색맹 (Tritanopia): S형 원추세포 완전 결여', '3형 색약 (Tritanomaly): S형 원추세포 감도 저하, 후천성 원인 많음', '유병률 남녀 동일 ~0.01% (선천성 기준)']
    },
    'RG': {
      name: '적녹 색각이상 (Red-Green CVD)',
      color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',
      cones: { L: 'bad', M: 'bad', S: 'ok' },
      prevalence: { male: 8.0, female: 0.5 },
      confusions: [
        { label: '신호등 적·녹', a: '#FF2200', b: '#00BB00' },
        { label: '빨강 vs 카키', a: '#CC0000', b: '#6B6B00' },
        { label: '초록 vs 주황', a: '#228B22', b: '#FF8C00' },
      ],
      desc: '색각이상 중 가장 많은 비율을 차지하는 유형으로, 전 세계 남성의 약 8%, 여성의 약 0.5%가 해당합니다. 빨간색과 녹색이 비슷한 갈색·황록색·카키색으로 보여 교통 신호·지도 범례·의료 차트·스포츠 유니폼에서 오인이 발생하기 쉽습니다. X 염색체 연관 열성 유전입니다.',
      types: ['Protanopia/Protanomaly: L형 이상 → 빨강이 매우 어둡게 보임', 'Deuteranopia/Deuteranomaly: M형 이상 → 초록이 황색처럼 보임', '이시하라(Ishihara) 색각 검사로 가장 잘 감별되는 유형']
    },
    'RB': {
      name: '적청 색각이상 (Red-Blue CVD)',
      color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200',
      cones: { L: 'bad', M: 'ok', S: 'bad' },
      prevalence: { male: 0.005, female: 0.005 },
      confusions: [
        { label: '보라 vs 주황', a: '#800080', b: '#FF8C00' },
        { label: '분홍 vs 하늘', a: '#FF69B4', b: '#87CEEB' },
        { label: '자주 vs 황록', a: '#8B0057', b: '#9ACD32' },
      ],
      desc: '빨간색과 파란색 계통을 동시에 구분하기 어려운 매우 드문 복합 유형입니다. 보라·분홍·마젠타 계열 전반에서 혼동이 생깁니다. 대부분 후천성(황반변성·녹내장·약물 부작용)으로 발생하며 전문 안과 검사와 원인 질환 치료가 우선입니다.',
      types: ['L형 + S형 원추세포 동시 이상', '혼동 색상: 보라↔주황, 분홍↔하늘색, 자주↔황록', '후천성 원인: 황반변성, 녹내장, 항말라리아 약물 등']
    },
    'GB': {
      name: '녹청 색각이상 (Green-Blue CVD)',
      color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200',
      cones: { L: 'ok', M: 'bad', S: 'bad' },
      prevalence: { male: 0.003, female: 0.003 },
      confusions: [
        { label: '청록 vs 파랑', a: '#00CED1', b: '#0000CD' },
        { label: '에메랄드 vs 하늘', a: '#50C878', b: '#87CEEB' },
        { label: '올리브 vs 청록', a: '#808000', b: '#20B2AA' },
      ],
      desc: '녹색과 파란색 계통을 구분하기 어려운 유형으로, 차가운 색상 스펙트럼 전반에서 혼동이 발생합니다. 바다색·하늘색·청록색·에메랄드색이 매우 유사하게 보이며, 자연 경관이나 수중 사진에서 색상 다양성을 느끼기 어렵습니다. 선천성은 매우 희귀합니다.',
      types: ['M형 + S형 원추세포 동시 이상: 초록·파랑 계열 전반 혼동', '자연·수중·의료 이미지(MRI·조직검사 염색)에서 혼동 빈도 높음', '선천성 유병률은 전색맹에 준할 만큼 희귀']
    },
    'RGB': {
      name: '전색맹 (Achromatopsia)',
      color: 'text-stone-700', bg: 'bg-stone-100', border: 'border-stone-300',
      cones: { L: 'bad', M: 'bad', S: 'bad' },
      prevalence: { male: 0.003, female: 0.003 },
      confusions: [
        { label: '빨강 vs 녹색', a: '#CC0000', b: '#228B22' },
        { label: '파랑 vs 노랑', a: '#0000CC', b: '#FFD700' },
        { label: '보라 vs 주황', a: '#6600CC', b: '#FF8C00' },
      ],
      desc: '세 종류의 원추세포(L·M·S형) 모두가 기능하지 않아 색상 정보를 전혀 처리하지 못합니다. 세상이 흑백 사진처럼 밝기 차이만 느껴지며, 광과민증(Photophobia)이 거의 항상 동반되고 중심 시력이 0.1~0.3 수준으로 낮습니다. CNGB3·CNGA3 등 유전자 돌연변이에 의한 상염색체 열성 유전이며 유병률은 약 1/30,000~1/50,000입니다.',
      types: ['완전 전색맹: 원추세포 전체 결여, 색상 인식 완전 불가', '불완전 전색맹: 원추세포 잔존하나 기능 극히 미약', '동반 증상: 광과민증, 안진증(눈떨림), 중심 시력 저하']
    }
  };

  // ── Helper: Cone receptor status (horizontal, large) ──
  function renderCones(cones) {
    const labels = { L: '장파장 L', M: '중파장 M', S: '단파장 S' };
    const colors = { L: '#ef4444', M: '#22c55e', S: '#3b82f6' };
    return Object.entries(cones).map(([type, status]) => {
      const col = colors[type];
      const isOk = status === 'ok';
      return `
        <div class="flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-black shadow-md ${isOk ? '' : 'opacity-20 grayscale'}" style="background:${col};">${type}</div>
          <div class="flex flex-col items-center gap-0.5">
            <span class="text-base font-bold" style="color:${isOk ? col : '#cbd5e1'}">${isOk ? '✓' : '✕'}</span>
            <span class="text-xs text-stone-400 text-center leading-snug">${labels[type]}</span>
            <span class="text-[11px] font-semibold" style="color:${isOk ? col : '#94a3b8'}">${isOk ? '정상' : '이상'}</span>
          </div>
        </div>`;
    }).join('');
  }

  // ── Helper: Color confusion swatches (full-width row) ──
  function renderSwatches(confusions) {
    return confusions.map(c => `
      <div class="flex flex-col items-center gap-2 flex-1">
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 rounded-xl shadow-lg border-2 border-white/80" style="background:${c.a}"></div>
          <div class="flex flex-col items-center">
            <span class="text-stone-300 text-lg font-bold leading-none">≈</span>
            <span class="text-[10px] text-stone-400 font-semibold mt-0.5">혼동</span>
          </div>
          <div class="w-12 h-12 rounded-xl shadow-lg border-2 border-white/80" style="background:${c.b}"></div>
        </div>
        <span class="text-xs text-stone-500 text-center leading-snug break-keep px-1">${c.label}</span>
      </div>`).join('');
  }

  // ── Helper: Prevalence bars ──
  function renderPrevalence(prev) {
    const maleW = Math.min(prev.male / 10 * 100, 100).toFixed(1);
    const femaleW = Math.min(prev.female / 10 * 100, 100).toFixed(1);
    const fmt = n => n < 0.01 ? '<0.01%' : n >= 1 ? `${n}%` : `${n}%`;
    return `
      <div class="flex flex-col gap-3 w-full">
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-xs text-stone-500 font-semibold">
            <span>♂ 남성</span><span>${fmt(prev.male)}</span>
          </div>
          <div class="h-4 bg-stone-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-700" style="width:${maleW}%"></div>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-xs text-stone-500 font-semibold">
            <span>♀ 여성</span><span>${fmt(prev.female)}</span>
          </div>
          <div class="h-4 bg-stone-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-700" style="width:${femaleW}%"></div>
          </div>
        </div>
        <span class="text-[11px] text-stone-400">※ 최대 10% 기준 상대값</span>
      </div>`;
  }

  const selected = new Set();
  const infoPanel = document.getElementById('cvd-info-panel');
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

  let infoTimeout1, infoTimeout2, infoTimeout3;

  function renderCVDInfo() {
    const key = ['R', 'G', 'B'].filter(c => selected.has(c)).join('');
    
    clearTimeout(infoTimeout1);
    clearTimeout(infoTimeout2);
    clearTimeout(infoTimeout3);

    // Get current height before modifying
    const currentHeight = infoPanel.getBoundingClientRect().height;
    
    // Fix the height temporarily to current height to prevent sudden jumps
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

              <!-- Badge -->
              <span class="inline-block self-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${d.bg} ${d.color} border ${d.border}">${d.name}</span>

              <!-- Row 1: Cone Status (left) + Prevalence (right) -->
              <div class="flex flex-col sm:flex-row gap-4 justify-center w-full">

                <!-- Cone Status Card -->
                <div class="flex flex-col gap-3 sm:w-56 flex-shrink-0">
                  <span class="text-xs font-bold text-stone-400 uppercase tracking-widest">원추세포 상태</span>
                  <div class="flex justify-around items-start gap-3 py-2">
                    ${renderCones(d.cones)}
                  </div>
                  <p class="text-[11px] text-stone-400 text-center leading-relaxed">흐릿한 원이 기능 이상 수용체입니다</p>
                </div>

                <!-- Prevalence Card -->
                <div class="flex flex-col gap-3 flex-1">
                  <span class="text-xs font-bold text-stone-400 uppercase tracking-widest">성별 유병률</span>
                  <div class="py-1">${renderPrevalence(d.prevalence)}</div>
                </div>
              </div>

              <!-- Row 2: Color Confusion Swatches (full width) -->
              <div class="flex flex-col gap-3 w-full mt-2">
                <span class="text-xs font-bold text-stone-400 uppercase tracking-widest">혼동되는 색상 쌍 — 이 색들이 같아 보입니다</span>
                <div class="flex items-start justify-around gap-3 py-2 flex-wrap">
                  ${renderSwatches(d.confusions)}
              <!-- Information has been simplified -->
            </div>
          `;
        }
      }

      // Measure new height
      infoPanel.style.height = 'auto';
      const newHeight = infoPanel.getBoundingClientRect().height;
      
      // Reset height to current, force reflow, then apply new height
      infoPanel.style.height = `${currentHeight}px`;
      infoPanel.offsetHeight; // force reflow
      
      infoPanel.style.height = `${newHeight}px`;
      infoPanel.style.opacity = '1';

      // After animation, reset height to auto
      infoTimeout2 = setTimeout(() => {
        infoPanel.style.height = 'auto';
        infoPanel.style.overflow = 'visible';
      }, 400);

      // Removed scrollIntoView to prevent bouncing
    }, 200);
  }
}


