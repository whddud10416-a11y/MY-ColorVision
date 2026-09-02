/**
 * colorLabDesktop.js
 * Desktop Left 320px Sidebar Controls & Preset Bindings for Color Lab
 */

export function renderDesktopControlsHTML(core) {
  const { currentType, currentSeverity } = core;

  return `
    <div id="desktop-controls" class="hidden lg:flex w-[320px] xl:w-[350px] flex-shrink-0 flex-col gap-2.5 sm:gap-3">
      <!-- Mode Selector -->
      <div class="p-3 sm:p-4 bg-white/70 rounded-2xl border border-stone-200/60 shadow-sm">
        <div class="flex flex-col gap-2">
          <div id="desktop-mode-sim-btn" class="mode-simulate-btn bg-rose-50 border-2 border-rose-300 shadow-sm rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01]">
            <div class="bg-rose-100 p-1.5 rounded-full text-lg">👁️</div>
            <div>
              <h3 class="text-xs sm:text-sm font-black text-rose-700">시각 체험 모드</h3>
              <p class="text-[10px] sm:text-[11px] text-rose-500 mt-0.5 break-keep">색각 이상을 가진 분들의 시야 시뮬레이션</p>
            </div>
          </div>
          
          <div id="desktop-mode-cor-btn" class="mode-correct-btn bg-stone-50 border-2 border-stone-200 rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all opacity-60 hover:opacity-100 hover:bg-indigo-50">
            <div class="bg-indigo-100 p-1.5 rounded-full text-lg">✨</div>
            <div>
              <h3 class="text-xs sm:text-sm font-black text-indigo-700">색상 보정 모드</h3>
              <p class="text-[10px] sm:text-[11px] text-indigo-500 mt-0.5 break-keep">인지 가능한 영역으로 강제 교정</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Presets -->
      <div class="p-3 sm:p-4 bg-white/70 rounded-2xl border border-stone-200/60 shadow-sm">
        <p class="text-xs font-bold text-stone-500 mb-2 tracking-wide">색각 이상 유형 프리셋</p>
        <div id="preset-container" class="flex flex-col gap-1.5">
          <button class="preset-btn py-1.5 px-3 rounded-lg font-bold text-xs border transition-all w-full ${currentType === 'default' ? 'bg-stone-400 text-white border-stone-400' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="default" data-severity="0">정상 (Original)</button>
          
          <div class="grid grid-cols-2 gap-1.5">
            <button class="preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all ${currentType === 'protan' && currentSeverity === 0.5 ? 'bg-rose-600 text-white border-rose-400' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="protan" data-severity="0.5">제1색각 (적색약)</button>
            <button class="preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all ${currentType === 'protan' && currentSeverity === 1.0 ? 'bg-rose-800 text-white border-rose-500' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="protan" data-severity="1.0">제1색각 (적색맹)</button>
            <button class="preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all ${currentType === 'deutan' && currentSeverity === 0.5 ? 'bg-green-600 text-white border-green-400' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="deutan" data-severity="0.5">제2색각 (녹색약)</button>
            <button class="preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all ${currentType === 'deutan' && currentSeverity === 1.0 ? 'bg-green-800 text-white border-green-500' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="deutan" data-severity="1.0">제2색각 (녹색맹)</button>
            <button class="preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all ${currentType === 'tritan' && currentSeverity === 0.5 ? 'bg-blue-600 text-white border-blue-400' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="tritan" data-severity="0.5">제3색각 (청색약)</button>
            <button class="preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all ${currentType === 'tritan' && currentSeverity === 1.0 ? 'bg-blue-800 text-white border-blue-500' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="tritan" data-severity="1.0">제3색각 (청색맹)</button>
            <button class="preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all ${currentType === 'achromato' && currentSeverity === 0.5 ? 'bg-gray-500 text-white border-gray-400' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="achromato" data-severity="0.5">전색약</button>
            <button class="preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all ${currentType === 'achromato' && currentSeverity === 1.0 ? 'bg-gray-700 text-white border-gray-500' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="achromato" data-severity="1.0">전색맹</button>
          </div>

          <div class="grid grid-cols-3 gap-1.5 mt-0.5">
            <button class="preset-btn py-1.5 px-1 rounded-lg font-bold text-[10px] border transition-all ${currentType === 'redgreen' ? 'bg-orange-600 text-white border-orange-400' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="redgreen" data-severity="0.5">복합(적녹)</button>
            <button class="preset-btn py-1.5 px-1 rounded-lg font-bold text-[10px] border transition-all ${currentType === 'redblue' ? 'bg-fuchsia-600 text-white border-fuchsia-400' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="redblue" data-severity="0.5">복합(적청)</button>
            <button class="preset-btn py-1.5 px-1 rounded-lg font-bold text-[10px] border transition-all ${currentType === 'greenblue' ? 'bg-teal-600 text-white border-teal-400' : 'bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300'}" data-type="greenblue" data-severity="0.5">복합(녹청)</button>
          </div>
        </div>
      </div>

      <!-- Intensity Slider (Desktop Only) -->
      <div class="p-3 sm:p-4 bg-white/70 rounded-2xl border border-stone-200/60 shadow-sm">
        <div class="flex justify-between items-center mb-2.5">
          <span class="text-xs font-bold text-stone-500">적용 강도</span>
          <span id="desktop-intensity-val" class="intensity-val display-font text-stone-600 font-bold text-xs bg-stone-200 px-2.5 py-0.5 rounded-lg border border-stone-300">${core.customIntensity.toFixed(1)}x</span>
        </div>
        <input id="desktop-intensity-slider" type="range" min="0" max="2" step="0.01" value="${core.customIntensity}" 
               style="--val: ${(core.customIntensity / 2) * 100}; --fill-color: #78716c;"
               class="intensity-slider w-full h-2 rounded-lg appearance-none cursor-pointer touch-none bg-stone-200 
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:!w-6 [&::-webkit-slider-thumb]:!h-6 
                      [&::-webkit-slider-thumb]:!-mt-[8px] [&::-webkit-slider-thumb]:!bg-stone-500 [&::-webkit-slider-thumb]:!rounded-full 
                      [&::-webkit-slider-thumb]:!shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      </div>

      <!-- Actions -->
      <div class="flex gap-2.5">
        <button onclick="window.setMode('home')" class="bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-colors w-[38%] py-2.5 rounded-xl text-stone-500 hover:text-stone-800 font-bold text-xs sm:text-sm flex justify-center items-center">홈으로</button>
        <button onclick="document.getElementById('image-input').click()" class="glow-button flex-1 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm flex justify-center items-center">
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          새 이미지
        </button>
      </div>
    </div>
  `;
}

export function initDesktopControls(core) {
  const container = document.getElementById("desktop-controls");
  if (!container) return;

  const simBtn = document.getElementById("desktop-mode-sim-btn");
  const corBtn = document.getElementById("desktop-mode-cor-btn");
  const presetBtns = container.querySelectorAll(".preset-btn");
  const slider = document.getElementById("desktop-intensity-slider");
  const valLabel = document.getElementById("desktop-intensity-val");
  const resultLabel = document.getElementById("result-label");

  function updateActiveButton() {
    presetBtns.forEach(b => {
      b.className = "preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300 w-full";
      if (b.dataset.type === core.currentType && parseFloat(b.dataset.severity) === core.currentSeverity) {
        b.classList.remove('bg-stone-200', 'text-stone-500', 'border-transparent');
        b.classList.add('text-white');
        if (core.currentType === 'protan') b.classList.add('bg-rose-600', 'border-rose-400');
        else if (core.currentType === 'deutan') b.classList.add('bg-green-600', 'border-green-400');
        else if (core.currentType === 'tritan') b.classList.add('bg-blue-600', 'border-blue-400');
        else if (core.currentType === 'achromato') b.classList.add('bg-gray-600', 'border-gray-400');
        else if (core.currentType === 'redgreen') b.classList.add('bg-orange-600', 'border-orange-400');
        else if (core.currentType === 'redblue') b.classList.add('bg-fuchsia-600', 'border-fuchsia-400');
        else if (core.currentType === 'greenblue') b.classList.add('bg-teal-600', 'border-teal-400');
        else b.classList.add('bg-slate-600', 'border-slate-400');
      }
    });
  }

  function updateModeUI() {
    if (core.currentMode === 'simulate') {
      if (simBtn) simBtn.className = "mode-simulate-btn bg-rose-50 border-2 border-rose-300 shadow-sm rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01]";
      if (corBtn) corBtn.className = "mode-correct-btn bg-stone-50 border-2 border-stone-200 rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all opacity-60 hover:opacity-100 hover:bg-indigo-50";
      if (resultLabel) {
        resultLabel.textContent = 'Simulation';
        resultLabel.className = 'text-rose-600 text-xs font-bold mb-2 tracking-wider uppercase display-font';
      }
    } else {
      if (corBtn) corBtn.className = "mode-correct-btn bg-indigo-50 border-2 border-indigo-300 shadow-sm rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01]";
      if (simBtn) simBtn.className = "mode-simulate-btn bg-stone-50 border-2 border-stone-200 rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all opacity-60 hover:opacity-100 hover:bg-rose-50";
      if (resultLabel) {
        resultLabel.textContent = 'Daltonized';
        resultLabel.className = 'text-indigo-600 text-xs font-bold mb-2 tracking-wider uppercase display-font';
      }
    }
  }

  if (simBtn) simBtn.addEventListener("click", () => core.setMode('simulate'));
  if (corBtn) corBtn.addEventListener("click", () => core.setMode('correct'));

  presetBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const type = e.target.dataset.type;
      const severity = parseFloat(e.target.dataset.severity);
      if (type === 'default') {
        core.resetAll();
      } else {
        core.setTypeAndSeverity(type, severity);
      }
    });
  });

  if (slider) {
    slider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (valLabel) valLabel.textContent = val.toFixed(2) + "x";
      slider.style.setProperty('--val', (val / 2) * 100);
      core.setIntensity(val);
    });
  }

  // Subscribe to core updates
  core.subscribe(() => {
    updateActiveButton();
    updateModeUI();
    if (slider) {
      slider.value = core.customIntensity;
      slider.style.setProperty('--val', (core.customIntensity / 2) * 100);
    }
    if (valLabel) {
      valLabel.textContent = core.customIntensity.toFixed(2) + "x";
    }
  });

  // Initial UI sync
  updateActiveButton();
  updateModeUI();
}
