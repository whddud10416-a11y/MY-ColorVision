import { state, container } from '../state.js';
import { renderNextStage } from '../../app.js';
import { applyDaltonizeToColor } from '../utils/daltonize.js';

export function renderRgbMatchStage() {
  container.innerHTML = "";
  const isChallenge = state.mode === 'challenge';
  const stageIdx = isChallenge ? Math.floor(Math.random() * 6) : state.stageNumber - 9;
  const stageNum = isChallenge ? state.stageNumber : state.stageNumber - 8;
  const totalStages = isChallenge ? 5 : 7;

  const high = () => 180 + Math.floor(Math.random() * 76);
  const mid = () => 100 + Math.floor(Math.random() * 56);
  const low = () => Math.floor(Math.random() * 80);

  let targetR, targetG, targetB;
  switch (stageIdx) {
    case 0: targetR = high(); targetG = low(); targetB = low(); break;
    case 1: targetR = low(); targetG = high(); targetB = low(); break;
    case 2: targetR = low(); targetG = low(); targetB = high(); break;
    case 3: targetR = high(); targetG = high(); targetB = low(); break;
    case 4: targetR = low(); targetG = high(); targetB = high(); break;
    case 5: targetR = high(); targetG = low(); targetB = high(); break;
    default: targetR = mid(); targetG = mid(); targetB = mid(); break;
  }

  let displayTargetR = targetR, displayTargetG = targetG, displayTargetB = targetB;
  if (isChallenge) {
    const [corrR, corrG, corrB] = applyDaltonizeToColor(targetR, targetG, targetB, state.weakness, 0.5, 'correct', 1.0);
    displayTargetR = corrR; displayTargetG = corrG; displayTargetB = corrB;
  }

  const wrapper = document.createElement("div");
  wrapper.classList.add("flex", "flex-col", "items-center", "justify-center", "min-h-full", "w-full", "px-4", "lg:px-8");

  wrapper.innerHTML = `
    <div class="wide-container max-w-6xl mx-auto flex flex-col items-center w-full">
      
      <!-- Header -->
      <div class="text-center mb-2 sm:mb-4 lg:mb-5 w-full animate-in" style="--stagger: 0ms">
        <div class="stage-badge mx-auto mb-2 sm:mb-4">
          <span class="display-font">Step ${stageNum}</span>
           <span class="text-stone-300">/</span>
          <span class="display-font">Step ${totalStages}</span>
        </div>
        <h2 class="display-font text-xl sm:text-3xl lg:text-4xl font-bold text-stone-800 mb-1 sm:mb-3 tracking-tight break-keep">RGB Color Match</h2>
        <p class="text-stone-500 text-xs sm:text-sm break-keep mx-auto max-w-lg mt-1">
          목표 색상과 혼합 색상이 같아지도록 슬라이더를 조절하세요.
        </p>
        ${isChallenge && state.weakness !== 'default' ? '<p class="text-indigo-600 text-xs sm:text-sm font-bold mt-2">✨ 취약 색각 분석 결과에 따른 맞춤형 보정 필터가 적용되었습니다.</p>' : ''}
      </div>

      <!-- Color Display — Always Side-by-Side for intuitive comparison -->
      <div class="flex flex-row gap-2.5 sm:gap-4 w-full max-w-2xl mx-auto mb-3 sm:mb-5 animate-scale-in" style="--stagger: 100ms">
        <!-- Target Color -->
        <div class="flex-1 glass-panel p-2.5 sm:p-4 bg-white/60 border border-stone-200/60 rounded-2xl shadow-xs">
          <p class="display-font text-[10px] sm:text-xs text-stone-400 mb-1.5 sm:mb-2 text-center tracking-widest uppercase">Target</p>
          <div class="color-swatch w-full h-14 sm:h-20 rounded-xl shadow-inner"
               style="background: rgb(${displayTargetR}, ${displayTargetG}, ${displayTargetB})"></div>
          <p class="display-font text-stone-300 text-[10px] sm:text-xs text-center mt-1.5 tracking-wider">RGB(?, ?, ?)</p>
        </div>
        <!-- Your Mix -->
        <div class="flex-1 glass-panel p-2.5 sm:p-4 bg-white/60 border border-stone-200/80 rounded-2xl shadow-xs">
          <p class="display-font text-[10px] sm:text-xs text-stone-400 mb-1.5 sm:mb-2 text-center tracking-widest uppercase">Your Mix</p>
          <div id="user-mix" class="color-swatch w-full h-14 sm:h-20 rounded-xl border border-stone-200 shadow-sm transition-colors duration-150"
               style="background: rgb(128, 128, 128)"></div>
          <p id="user-rgb-val" class="display-font text-stone-500 text-[10px] sm:text-xs text-center mt-1.5 tracking-wider font-semibold">RGB(128, 128, 128)</p>
        </div>
      </div>

      <!-- Sliders -->
      <div id="sliders-box" class="w-full max-w-2xl mx-auto space-y-2 sm:space-y-3 mb-4 sm:mb-6 animate-in" style="--stagger: 200ms"></div>

      <!-- Match Button -->
      <button id="match-btn"
        class="glow-button w-full max-w-md mx-auto py-3.5 sm:py-4 rounded-2xl sm:rounded-full font-bold text-base sm:text-xl text-white animate-in flex justify-center items-center shadow-sm"
        style="--stagger: 300ms">
        색상 매칭 완료
      </button>

    </div>
  `;

  container.appendChild(wrapper);

  // Build sliders
  const slidersBox = wrapper.querySelector('#sliders-box');

  const createSlider = (id, colorLabel) => {
    const labelClass = `slider-label-${colorLabel}`;
    const hexColor = id === 'r' ? '#f87171' : id === 'g' ? '#4ade80' : '#60a5fa';
    const sBox = document.createElement("div");
    sBox.classList.add("glass-panel", "px-3.5", "sm:px-6", "py-2", "sm:py-3", "flex", "items-center", "gap-3", "sm:gap-4", "w-full", "bg-white/60", "border", "border-stone-200/60", "rounded-xl", "shadow-xs");
    sBox.innerHTML = `
      <label class="${labelClass} display-font font-black w-6 sm:w-8 text-xl sm:text-2xl text-center">${colorLabel.toUpperCase()}</label>
      <div class="flex-1 flex items-center gap-2.5 sm:gap-4">
        <input type="range" id="${id}-slider" min="0" max="255" value="128"
               class="w-full h-2 sm:h-2.5 rounded-lg appearance-none cursor-pointer touch-pan-x"
               style="--val: 50.196; --fill-color: ${hexColor};" />
        <span id="${id}-val" class="display-font text-stone-600 text-xs sm:text-sm font-bold w-8 sm:w-9 text-right tabular-nums">128</span>
      </div>
    `;
    return sBox;
  };

  function updateMix() {
    const rInput = document.getElementById("r-slider");
    const gInput = document.getElementById("g-slider");
    const bInput = document.getElementById("b-slider");

    rInput.style.setProperty('--val', (rInput.value / 255) * 100);
    gInput.style.setProperty('--val', (gInput.value / 255) * 100);
    bInput.style.setProperty('--val', (bInput.value / 255) * 100);

    const r = parseInt(rInput.value);
    const g = parseInt(gInput.value);
    const b = parseInt(bInput.value);

    let displayR = r, displayG = g, displayB = b;
    if (isChallenge) {
      const [corrR, corrG, corrB] = applyDaltonizeToColor(r, g, b, state.weakness, 0.5, 'correct', 1.0);
      displayR = corrR; displayG = corrG; displayB = corrB;
    }

    document.getElementById("user-mix").style.background = `rgb(${displayR}, ${displayG}, ${displayB})`;
    document.getElementById("r-val").textContent = r;
    document.getElementById("g-val").textContent = g;
    document.getElementById("b-val").textContent = b;
    document.getElementById("user-rgb-val").textContent = `RGB(${r}, ${g}, ${b})`;
  }

  slidersBox.appendChild(createSlider('r', 'r'));
  slidersBox.appendChild(createSlider('g', 'g'));
  slidersBox.appendChild(createSlider('b', 'b'));

  // Bind slider events
  ['r', 'g', 'b'].forEach(ch => {
    document.getElementById(`${ch}-slider`).oninput = updateMix;
  });
  
  // Initialize initial mix color
  updateMix();

  document.getElementById("match-btn").onclick = () => {
    const r = parseInt(document.getElementById("r-slider").value);
    const g = parseInt(document.getElementById("g-slider").value);
    const b = parseInt(document.getElementById("b-slider").value);
    const distance = Math.sqrt(Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2));
    const threshold = 40;
    const isCorrect = distance < threshold;

    let scoreEarned = 0;
    if (isChallenge) {
      if (distance <= 40) {
        scoreEarned = 20;
      } else if (distance >= 120) {
        scoreEarned = 0;
      } else {
        scoreEarned = Math.round(20 - ((distance - 40) * (20 / 80)));
      }
    }

    const historyEntry = {
      type: 'rgb',
      stage: state.stageNumber,
      correct: { r: targetR, g: targetG, b: targetB },
      user: { r, g, b },
      distance: Math.round(distance),
      threshold: threshold,
      isCorrect,
      scoreEarned
    };

    if (isChallenge) {
      state.challengeHistory.push(historyEntry);
      state.challengeTotalScore += scoreEarned;
      if (isCorrect) state.challengeScore++;
    } else {
      state.userHistory.push(historyEntry);
      if (isCorrect) state.score++;
    }

    state.stageNumber++;
    renderNextStage();
  };
}
