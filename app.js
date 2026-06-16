import { state } from './js/state.js';
import { renderIshiharaStage } from './js/stages/ishihara.js';
import { renderColorSortStage } from './js/stages/colorSort.js';
import { renderRgbMatchStage } from './js/stages/rgbMatch.js';
import { renderFinalScore } from './js/stages/results.js';
import { renderTutorialStage } from './js/stages/tutorial.js';
import { renderColorLab } from './js/stages/colorLab.js';
import { initLiquidGlass } from './js/effects/liquidGlass.js';
import { initInteractions, refreshInteractions } from './js/effects/interactions.js';
import { renderChallengeIntro } from './js/stages/challengeIntro.js';
import { renderHomeStage } from './js/stages/home.js';
import { initCustomCursor } from './js/effects/cursor.js';

// ==========================================
// 이펙트 시스템 초기화
// ==========================================
function initEffects() {
  // Load Three.js dynamically using ES Modules
  import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js')
    .then(THREE => {
      window.THREE = THREE;
      initLiquidGlass();
    })
    .catch(err => {
      console.warn('Three.js ES module failed to load, skipping WebGL effects', err);
    });

  // Init cursor glow & interactions (no Three.js dependency)
  initInteractions();

  // Custom cursor with particle effects — only on hover-capable (non-touch) devices
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.style.cursor = 'none';
    initCustomCursor();
  }
}

// ==========================================
// 모드 설정 및 라우팅
// ==========================================
function updateNavUI(mode) {
  const navBar = document.querySelector('nav');
  if (navBar) {
    navBar.style.display = mode === 'home' ? 'none' : 'flex';
  }

  const modes = ['home', 'test', 'lab', 'challenge'];
  modes.forEach(m => {
    const btn = document.getElementById(`nav-${m}`);
    if (!btn) return;
    if (m === mode) {
      btn.className = "text-sm sm:text-base font-bold transition-all text-stone-800";
    } else {
      btn.className = "text-sm sm:text-base font-bold transition-all text-stone-400 hover:text-stone-800";
    }
  });
}

// ==========================================
// 진행 상태 바
// ==========================================
function removeProgressBar() {
  const existing = document.getElementById('progress-bar-container');
  if (existing) existing.remove();
}

function renderProgressBar() {
  removeProgressBar();

  const isTest = state.mode === 'test';
  const isChallenge = state.mode === 'challenge';

  if (!isTest && !isChallenge) return;

  const totalStages = isTest ? 15 : 5;
  const current = state.stageNumber;

  if ((isTest && current > 15) || (isChallenge && current > 5)) return;

  const percent = ((current - 1) / totalStages) * 100;

  const sections = isTest ? [
    { name: '이시하라', start: 1, end: 3 },
    { name: '색상 정렬', start: 4, end: 8 },
    { name: 'RGB 매칭', start: 9, end: 15 },
  ] : [
    { name: '챌린지', start: 1, end: 5 },
  ];

  const currentSection = sections.find(s => current >= s.start && current <= s.end);
  const sectionLabel = currentSection ? currentSection.name : '';
  const sectionStage = currentSection ? (current - currentSection.start + 1) : 0;
  const sectionTotal = currentSection ? (currentSection.end - currentSection.start + 1) : 0;
  const prevPercent = Math.max(0, ((current - 2) / totalStages) * 100);

  const bar = document.createElement('div');
  bar.id = 'progress-bar-container';
  bar.className = 'w-1/2 mx-auto mb-4 px-2';
  bar.innerHTML = `
    <div class="flex items-center justify-between mb-1">
      <span class="text-[10px] font-semibold text-stone-400 tracking-wide">${sectionLabel} ${sectionStage}/${sectionTotal}</span>
      <span class="text-[10px] text-stone-300">${current} / ${totalStages}</span>
    </div>
    <div class="relative w-full h-1 bg-stone-200 rounded-full overflow-hidden">
      <div id="progress-fill" class="absolute top-0 left-0 h-full bg-stone-400 rounded-full"></div>
    </div>
  `;

  // Insert at the top of .wide-container to span full content width
  const wideContainer = document.querySelector('.wide-container');
  if (wideContainer) {
    wideContainer.insertBefore(bar, wideContainer.firstChild);
    const fill = document.getElementById('progress-fill');
    if (fill) {
      // Set previous position instantly (no transition)
      fill.style.transition = 'none';
      fill.style.width = `${prevPercent}%`;
      // Force layout recalculation
      fill.offsetWidth;
      // Now animate to current position
      fill.style.transition = 'width 1.2s ease-in-out';
      fill.style.width = `${percent}%`;
    }
  }
}

function generateChallengeSequence() {
  let seq = ['sort', 'rgb']; // 최소 하나씩
  const types = ['sort', 'rgb'];
  for (let i = 0; i < 3; i++) {
    seq.push(types[Math.floor(Math.random() * 2)]);
  }
  return seq.sort(() => Math.random() - 0.5);
}

let isTransitioning = false;
function transitionPage(callback) {
  const appEl = document.getElementById('app');
  if (!appEl || isTransitioning) {
    callback();
    return;
  }
  isTransitioning = true;
  appEl.style.opacity = '0';
  appEl.style.filter = 'blur(12px)';
  appEl.style.transform = 'scale(0.98)';
  setTimeout(() => {
    callback();
    requestAnimationFrame(() => {
      appEl.style.opacity = '1';
      appEl.style.filter = 'blur(0px)';
      appEl.style.transform = 'scale(1)';
      setTimeout(() => { isTransitioning = false; }, 500);
    });
  }, 400);
}

export function setMode(newMode) {
  transitionPage(() => {
    if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
    const timerUI = document.getElementById('challenge-timer');
    if (timerUI) timerUI.style.display = 'none';
    removeProgressBar();

  // Reset scroll lock and restore padding (home stage removes padding for snap scroll)
  const appEl = document.getElementById('app');
  const mainEl = document.querySelector('main');
  if (appEl) {
    appEl.style.overflowY = '';   // 인라인 스타일 제거 → Tailwind overflow-y-auto 복원
    appEl.style.scrollSnapType = '';
    appEl.style.scrollBehavior = '';
    appEl.style.padding = '';
    appEl.scrollTop = 0;
  }
  if (mainEl) {
    mainEl.style.paddingTop = '';
  }
  const snapStyle = document.getElementById('home-snap-style');
  if (snapStyle) snapStyle.remove();

  state.mode = newMode;
  updateNavUI(newMode);

  if (newMode === 'home') {
    renderHomeStage();
    requestAnimationFrame(() => refreshInteractions());
  } else if (newMode === 'test') {
    state.stageNumber = 1;
    state.score = 0;
    state.userHistory = [];
    state.tutorialShown = { 1: false, 4: false, 9: false };
    renderNextStage();
  } else if (newMode === 'lab') {
    renderColorLab(state.weakness);
    requestAnimationFrame(() => refreshInteractions());
    } else if (newMode === 'challenge') {
      state.challengeScore = 0;
      state.challengeTotalScore = 0;
      state.stageNumber = 1;
      state.challengeHistory = [];
      state.challengeTimeLeft = 180;
      renderChallengeIntro();
      requestAnimationFrame(() => refreshInteractions());
    }
  });
}

window.setMode = setMode;

window.startChallengeTimer = function () {
  state.challengeSequence = generateChallengeSequence();
  state.stageNumber = 1;
  state.challengeTimeLeft = 180;
  state.challengeTotalScore = 0;
  state.challengeHistory = [];

  const TOTAL_TIME = 180;
  const CIRCUMFERENCE = 50.265; // 2 * pi * 8

  let timerUI = document.getElementById('challenge-timer');
  if (!timerUI) {
    timerUI = document.createElement('div');
    timerUI.id = 'challenge-timer';
    timerUI.className = 'fixed top-6 right-4 sm:top-6 sm:right-6 z-50 flex flex-col items-center gap-1.5 pointer-events-none drop-shadow-md';
    timerUI.innerHTML = `
      <div class="relative w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full border-2 border-white shadow-sm overflow-hidden">
        <svg viewBox="0 0 32 32" class="w-full h-full -rotate-90">
          <circle r="16" cx="16" cy="16" fill="#fef3c7" />
          <circle id="timer-pie" r="8" cx="16" cy="16" fill="transparent" stroke="#f59e0b" stroke-width="16" stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="0" style="transition: stroke-dashoffset 1s linear, stroke 0.3s;" />
        </svg>
      </div>
      <div id="timer-text" class="font-sans text-[11px] sm:text-xs font-bold text-amber-600 bg-white/90 px-2.5 py-0.5 rounded-full shadow-sm border border-amber-100 transition-colors duration-300">03:00</div>
    `;
    document.body.appendChild(timerUI);
  }

  const pie = document.getElementById('timer-pie');
  const text = document.getElementById('timer-text');

  timerUI.style.display = 'flex';
  text.textContent = '03:00';
  pie.setAttribute('stroke', '#f59e0b'); // amber-500
  pie.setAttribute('stroke-dashoffset', '0');
  text.classList.remove('text-rose-600', 'border-rose-200');
  text.classList.add('text-amber-600', 'border-amber-100');
  timerUI.classList.remove('animate-pulse');

  if (state.timerId) clearInterval(state.timerId);

  state.timerId = setInterval(() => {
    state.challengeTimeLeft--;

    if (state.challengeTimeLeft <= 0) {
      clearInterval(state.timerId);
      state.timerId = null;
      state.challengeTimeLeft = 0;
      text.textContent = '00:00';
      pie.setAttribute('stroke-dashoffset', CIRCUMFERENCE);
      renderFinalScore(); // 강제 종료
    } else {
      const m = String(Math.floor(state.challengeTimeLeft / 60)).padStart(2, '0');
      const s = String(state.challengeTimeLeft % 60).padStart(2, '0');
      text.textContent = `${m}:${s}`;

      const offset = CIRCUMFERENCE * (1 - (state.challengeTimeLeft / TOTAL_TIME));
      pie.setAttribute('stroke-dashoffset', offset);

      if (state.challengeTimeLeft === 30) {
        pie.setAttribute('stroke', '#ef4444'); // rose-500
        text.classList.remove('text-amber-600', 'border-amber-100');
        text.classList.add('text-rose-600', 'border-rose-200');
        timerUI.classList.add('animate-pulse');
      }
    }
  }, 1000);

  renderNextStage();
};

// ==========================================
// 메인 컨트롤 함수 (다른 모듈에서 export해서 사용)
// ==========================================
export function renderNextStage() {
  transitionPage(() => {
    if (state.mode === 'test') {
      // Tutorial pages — no progress bar
      if (state.stageNumber === 1 && !state.tutorialShown[1]) {
        state.tutorialShown[1] = true;
        renderTutorialStage('ishihara');
        removeProgressBar();
        refreshInteractions();
        return;
      }
    if (state.stageNumber === 4 && !state.tutorialShown[4]) {
      state.tutorialShown[4] = true;
      renderTutorialStage('sort');
      removeProgressBar();
      refreshInteractions();
      return;
    }
    if (state.stageNumber === 9 && !state.tutorialShown[9]) {
      state.tutorialShown[9] = true;
      renderTutorialStage('rgb');
      removeProgressBar();
      refreshInteractions();
      return;
    }

    // Actual test stages
    if (state.stageNumber <= 3) renderIshiharaStage(state.stageNumber);
    else if (state.stageNumber <= 8) renderColorSortStage();
    else if (state.stageNumber <= 15) renderRgbMatchStage();
    else {
      removeProgressBar();
      renderFinalScore();
      requestAnimationFrame(() => refreshInteractions());
      return;
    }

  } else if (state.mode === 'challenge') {
    if (state.stageNumber <= 5) {
      const type = state.challengeSequence[state.stageNumber - 1];
      if (type === 'sort') renderColorSortStage();
      else if (type === 'rgb') renderRgbMatchStage();
    } else {
      if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
      const timerUI = document.getElementById('challenge-timer');
      if (timerUI) timerUI.style.display = 'none';
      removeProgressBar();
      renderFinalScore();
      requestAnimationFrame(() => refreshInteractions());
      return;
    }
  }

    // Show progress bar only for actual test/challenge stages
    renderProgressBar();
    requestAnimationFrame(() => refreshInteractions());
  });
}

// ==========================================
// 앱 실행
// ==========================================
initEffects();
setMode('home');
