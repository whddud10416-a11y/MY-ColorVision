import { container } from '../state.js';
import { processPixels } from '../utils/daltonize.js';

export function renderColorLab(initialWeakness) {
  let currentType = initialWeakness !== 'default' ? initialWeakness : 'default';
  let currentSeverity = 0.5; // default to anomaly
  let currentMode = initialWeakness !== 'default' ? 'correct' : 'simulate'; // 'simulate' | 'correct'
  let customIntensity = 1.0; // for slider
  let originalImageObj = null;

  // Map string weakness to preset type
  if (currentType !== 'default' && !['protan', 'deutan', 'tritan', 'redgreen', 'redblue', 'greenblue'].includes(currentType)) {
    currentType = 'default';
  }

  // Cleanup any previous resize listener
  if (typeof window.cleanupColorLab === 'function') {
    window.cleanupColorLab();
    window.cleanupColorLab = null;
  }
  const oldFab = document.getElementById("mobile-control-fab");
  if (oldFab) oldFab.remove();
  const oldDock = document.getElementById("mobile-control-dock");
  if (oldDock) oldDock.remove();

  container.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.classList.add("w-full", "min-h-full", "px-3", "sm:px-6", "lg:px-8", "py-2", "sm:py-4", "lg:py-2", "flex", "flex-col", "justify-start", "lg:justify-center");

  const html = `
    <div class="wide-container max-w-7xl mx-auto w-full flex flex-col items-center">
      
      <!-- Header -->
      <div id="lab-header-box" class="text-center mb-4 sm:mb-6 lg:mb-3 animate-in w-full" style="--stagger: 0ms">
        <h2 id="lab-header-title" class="display-font text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-stone-800 tracking-tight">Color Lab</h2>
        <p id="lab-header-desc" class="text-stone-500 text-xs sm:text-sm max-w-2xl mx-auto break-keep leading-relaxed">
          정밀 검사 결과를 바탕으로 시각적으로 인지하기 어려운 색상을 보정합니다.<br>
          이미지를 통해 색각 이상을 <strong class="font-bold text-stone-800">체험</strong>하거나 <strong class="font-bold text-stone-800">보정</strong>해보세요.
        </p>
      </div>

      <!-- Upload Area -->
      <div id="upload-area" class="w-full max-w-2xl mx-auto my-auto p-10 sm:p-14 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-200/20 transition-all animate-scale-in rounded-[2rem]" style="--stagger: 100ms; border: 2px dashed #E0D9CF;">
        <svg class="w-12 h-12 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        <span class="text-stone-600 font-bold text-lg mb-2 text-center">클릭하여 이미지 업로드 또는 드래그 앤 드롭</span>
        <span class="text-stone-400 text-sm">JPG, PNG 형식 지원</span>
        <input type="file" id="image-input" class="hidden" accept="image/*" />
      </div>

      <!-- Lab Interface (Hidden initially) -->
      <div id="lab-interface" class="w-full hidden animate-in" style="--stagger: 0ms">
        
        <!-- Mobile Quick Actions Bar (홈으로 / 새 이미지) -->
        <div class="flex lg:hidden gap-2.5 w-full max-w-md mx-auto mb-3 justify-center">
          <button onclick="window.setMode('home')" class="bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors px-4 py-2.5 rounded-xl text-stone-600 font-bold text-xs flex items-center justify-center">홈으로</button>
          <button onclick="document.getElementById('image-input').click()" class="glow-button flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <span>새 이미지</span>
          </button>
        </div>

        <!-- Responsive layout: Side-by-side on desktop (lg: 1024px+), Canvas only on mobile -->
        <div class="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-6 items-start justify-center w-full pb-20 lg:pb-0">
          
          <!-- Desktop Left Panel: Controls (hidden on mobile, visible on desktop) -->
          <div class="hidden lg:flex w-[320px] xl:w-[350px] flex-shrink-0 flex-col gap-2.5 sm:gap-3">
            
            <!-- Mode Selector -->
            <div class="p-3 sm:p-4 bg-white/70 rounded-2xl border border-stone-200/60 shadow-sm">
              <div class="flex flex-col gap-2">
                <div class="mode-simulate-btn bg-rose-50 border-2 border-rose-300 shadow-sm rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01]">
                  <div class="bg-rose-100 p-1.5 rounded-full text-lg">👁️</div>
                  <div>
                    <h3 class="text-xs sm:text-sm font-black text-rose-700">시각 체험 모드</h3>
                    <p class="text-[10px] sm:text-[11px] text-rose-500 mt-0.5 break-keep">색각 이상을 가진 분들의 시야 시뮬레이션</p>
                  </div>
                </div>
                
                <div class="mode-correct-btn bg-stone-50 border-2 border-stone-200 rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all opacity-60 hover:opacity-100 hover:bg-indigo-50">
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
                <span class="intensity-val display-font text-stone-600 font-bold text-xs bg-stone-200 px-2.5 py-0.5 rounded-lg border border-stone-300">1.0x</span>
              </div>
              <input type="range" min="0" max="2" step="0.01" value="1.0" 
                     style="--val: 50; --fill-color: #78716c;"
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
          
          <!-- Right Panel: Canvases -->
          <div id="canvas-container" class="flex-1 w-full min-w-0 flex flex-col gap-4 items-center justify-center">
            <div id="canvas-inner-wrapper" class="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center items-center">
              
              <!-- Original Canvas Card -->
              <div id="card-original" class="flex-1 w-full sm:w-auto p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0">
                <span class="text-stone-500 text-xs font-bold mb-2 tracking-wider uppercase display-font">Original</span>
                <div class="canvas-box flex items-center justify-center overflow-hidden w-full">
                  <canvas id="canvas-original" class="rounded-xl shadow-inner bg-stone-100 transition-all duration-300"></canvas>
                </div>
              </div>

              <!-- Corrected / Simulation Canvas Card -->
              <div id="card-corrected" class="flex-1 w-full sm:w-auto p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0">
                <span id="result-label" class="text-indigo-600 text-xs font-bold mb-2 tracking-wider uppercase display-font">Simulation</span>
                <div class="canvas-box flex items-center justify-center overflow-hidden w-full">
                  <canvas id="canvas-corrected" class="rounded-xl shadow-md bg-stone-100 transition-all duration-300"></canvas>
                </div>
              </div>

            </div>
          </div>
          
        </div>

        <!-- Floating Action Button for Controls on Mobile (원형 아이콘 전용, 뷰포트 고정, 페이드 인/아웃) -->
        <button id="mobile-control-fab"
          class="fixed bottom-5 right-5 z-[9999] lg:hidden glow-button w-12 h-12 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 ease-out hidden opacity-0 scale-75 pointer-events-none"
          style="position: fixed !important; bottom: 20px !important; right: 20px !important; z-index: 9999 !important;"
          aria-label="필터 조절">
          <svg class="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
        </button>

        <!-- Mobile Compact Floating Control Dock (초슬림 반투명 글래스형 도크, 좌우 길이 컴팩트화) -->
        <div id="mobile-control-dock"
          class="mobile-glass-dock fixed z-[9999] lg:hidden flex flex-col gap-1.5 transition-all duration-300 ease-out rounded-2xl p-2 shadow-2xl hidden opacity-0 scale-95 translate-y-3 pointer-events-none"
          style="position: fixed !important; bottom: 16px !important; left: 0 !important; right: 0 !important; margin-left: auto !important; margin-right: auto !important; width: fit-content !important; min-width: 240px !important; max-width: 90vw !important; z-index: 9999 !important;">
          
          <!-- Floating Intensity Slider Panel (버튼 누르면 열리는 슬라이더 패널) -->
          <div id="mobile-slider-panel" class="mobile-glass-slider hidden p-2 rounded-xl flex flex-col gap-1 animate-in mb-1 w-full">
            <div class="flex justify-between items-center text-[11px]">
              <span class="font-bold text-stone-700">적용 강도</span>
              <span id="mobile-slider-val-label" class="intensity-val font-bold text-stone-800 bg-stone-200/80 px-1.5 py-0.2 rounded text-[10px] border border-stone-300/80">1.00x</span>
            </div>
            <input type="range" min="0" max="2" step="0.01" value="1.0"
                   style="--val: 50; --fill-color: #78716c;"
                   class="intensity-slider w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-stone-200
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:!w-4 [&::-webkit-slider-thumb]:!h-4
                          [&::-webkit-slider-thumb]:!-mt-[5px] [&::-webkit-slider-thumb]:!bg-stone-600 [&::-webkit-slider-thumb]:!rounded-full
                          [&::-webkit-slider-thumb]:!shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          </div>

          <!-- Main Floating Dock Inner Content -->
          <div class="flex flex-col gap-1.5 w-full">
            
            <!-- Top Row: Mode Switch & Korean Status & Close -->
            <div class="flex items-center justify-between gap-2.5 w-full">
              <!-- Mode Toggle (체험 / 보정) -->
              <div class="flex items-center p-0.5 bg-stone-300/60 rounded-lg shrink-0">
                <button id="mobile-mode-sim-btn" class="mode-simulate-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all bg-white text-rose-700 shadow-xs whitespace-nowrap">
                  👁️ 체험
                </button>
                <button id="mobile-mode-cor-btn" class="mode-correct-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all text-stone-600 hover:text-stone-900 whitespace-nowrap">
                  ✨ 보정
                </button>
              </div>

              <!-- Status Badge (순수 한글 표기, 말줄임표 제거) -->
              <div class="text-center shrink-0">
                <span id="mobile-dock-status" class="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/80 text-stone-800 border border-stone-300/70 whitespace-nowrap shadow-xs">
                  정상
                </span>
              </div>

              <!-- Close/Minimize Button -->
              <button id="mobile-dock-close" class="w-5 h-5 rounded-full bg-stone-300/70 hover:bg-stone-400 text-stone-600 text-[11px] font-bold flex items-center justify-center transition-colors shrink-0" title="닫기">&times;</button>
            </div>

            <!-- Bottom Row: R, G, B Cones + Intensity Toggle (아이콘과 수치값만) + Reset (맨 우측으로 이동) -->
            <div class="flex items-center justify-between gap-2.5 pt-1.5 border-t border-stone-300/60 w-full">
              
              <!-- R, G, B Cone Buttons Group -->
              <div class="flex items-center gap-1.5 shrink-0">
                <!-- R Button -->
                <button id="dock-btn-r" class="dock-cone-btn w-8 h-8 rounded-full border border-rose-300 text-rose-500 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-xs shrink-0">
                  <span class="text-xs font-black leading-none">R</span>
                </button>

                <!-- G Button -->
                <button id="dock-btn-g" class="dock-cone-btn w-8 h-8 rounded-full border border-emerald-300 text-emerald-600 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-xs shrink-0">
                  <span class="text-xs font-black leading-none">G</span>
                </button>

                <!-- B Button -->
                <button id="dock-btn-b" class="dock-cone-btn w-8 h-8 rounded-full border border-blue-300 text-blue-600 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-xs shrink-0">
                  <span class="text-xs font-black leading-none">B</span>
                </button>
              </div>

              <!-- Intensity Toggle Button (글자 "강도" 없이 아이콘 + 수치값만) -->
              <button id="mobile-intensity-toggle-btn"
                class="py-1 px-2.5 rounded-lg border border-stone-300/90 bg-white/80 hover:bg-white text-[11px] font-bold text-stone-700 flex items-center gap-1 transition-all shadow-xs shrink-0 whitespace-nowrap"
                title="강도 조절">
                <svg class="w-3.5 h-3.5 text-stone-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                <span id="dock-intensity-text" class="text-[11px] font-bold text-stone-900 whitespace-nowrap">1.0x</span>
              </button>

              <!-- Reset Button (맨 우측으로 위치 변경) -->
              <button id="dock-btn-reset"
                class="w-8 h-8 rounded-full border border-stone-300/90 bg-white/80 hover:bg-white text-stone-500 hover:text-stone-900 flex items-center justify-center transition-all text-xs font-bold shadow-xs shrink-0"
                title="초기화 (정상)">
                ↺
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  `;

  wrapper.innerHTML = html;
  container.appendChild(wrapper);

  // Setup Elements
  const uploadArea = document.getElementById("upload-area");
  const fileInput = document.getElementById("image-input");
  const labInterface = document.getElementById("lab-interface");
  const canvasOrig = document.getElementById("canvas-original");
  const canvasCorr = document.getElementById("canvas-corrected");
  const ctxOrig = canvasOrig.getContext("2d");
  const ctxCorr = canvasCorr.getContext("2d", { willReadFrequently: true });

  let rafId = null;
  let isDragging = false;
  const sliders = document.querySelectorAll(".intensity-slider");
  const intensityVals = document.querySelectorAll(".intensity-val");
  const presetBtns = document.querySelectorAll(".preset-btn");
  const modeSimulateBtns = document.querySelectorAll(".mode-simulate-btn");
  const modeCorrectBtns = document.querySelectorAll(".mode-correct-btn");
  const resultLabel = document.getElementById("result-label");

  // Mobile Floating Dock & FAB Elements
  const fab = document.getElementById("mobile-control-fab");
  const dock = document.getElementById("mobile-control-dock");

  // Move FAB and Dock directly to document.body so they are 100% viewport-fixed and never scroll with #app
  if (fab && fab.parentNode !== document.body) document.body.appendChild(fab);
  if (dock && dock.parentNode !== document.body) document.body.appendChild(dock);

  const dockClose = document.getElementById("mobile-dock-close");
  const intensityToggleBtn = document.getElementById("mobile-intensity-toggle-btn");
  const sliderPanel = document.getElementById("mobile-slider-panel");
  const dockIntensityText = document.getElementById("dock-intensity-text");
  const dockStatus = document.getElementById("mobile-dock-status");

  function openDock() {
    // Hide FAB with fade out
    if (fab) {
      fab.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
      fab.classList.add('opacity-0', 'scale-75', 'pointer-events-none');
      setTimeout(() => {
        if (fab.classList.contains('opacity-0')) {
          fab.classList.add('hidden');
        }
      }, 300);
    }

    // Show Dock with fade in
    if (dock) {
      dock.classList.remove('hidden');
      void dock.offsetWidth; // Force reflow
      dock.classList.remove('opacity-0', 'scale-95', 'translate-y-3', 'pointer-events-none');
      dock.classList.add('opacity-100', 'scale-100', 'translate-y-0', 'pointer-events-auto');
    }
  }

  function closeDock() {
    // Hide Dock with fade out
    if (dock) {
      dock.classList.remove('opacity-100', 'scale-100', 'translate-y-0', 'pointer-events-auto');
      dock.classList.add('opacity-0', 'scale-95', 'translate-y-3', 'pointer-events-none');
      setTimeout(() => {
        if (dock.classList.contains('opacity-0')) {
          dock.classList.add('hidden');
          if (sliderPanel) sliderPanel.classList.add('hidden');
        }
      }, 300);
    }

    // Show FAB with fade in
    if (fab) {
      fab.classList.remove('hidden');
      void fab.offsetWidth; // Force reflow
      fab.classList.remove('opacity-0', 'scale-75', 'pointer-events-none');
      fab.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
    }
  }

  if (fab) fab.addEventListener("click", openDock);
  if (dockClose) dockClose.addEventListener("click", closeDock);

  if (intensityToggleBtn && sliderPanel) {
    intensityToggleBtn.addEventListener("click", () => {
      sliderPanel.classList.toggle("hidden");
    });
  }

  // R, G, B Cone State Tracker
  // 0: Off (정상), 1: 약 (0.5), 2: 맹 (1.0)
  let coneStates = { R: 0, G: 0, B: 0 };

  function renderConeButtons() {
    const btnR = document.getElementById("dock-btn-r");
    const btnG = document.getElementById("dock-btn-g");
    const btnB = document.getElementById("dock-btn-b");

    if (btnR) {
      if (coneStates.R === 1) {
        btnR.className = "dock-cone-btn w-8 h-8 rounded-full border border-rose-500 bg-rose-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm";
        btnR.innerHTML = `<span class="text-xs font-black leading-none">R</span><span class="text-[7px] font-bold leading-none mt-0.5">약</span>`;
      } else if (coneStates.R === 2) {
        btnR.className = "dock-cone-btn w-8 h-8 rounded-full border border-rose-800 bg-rose-800 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ring-1.5 ring-rose-300";
        btnR.innerHTML = `<span class="text-xs font-black leading-none">R</span><span class="text-[7px] font-bold leading-none mt-0.5">맹</span>`;
      } else {
        btnR.className = "dock-cone-btn w-8 h-8 rounded-full border border-rose-300 text-rose-500 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs";
        btnR.innerHTML = `<span class="text-xs font-black leading-none">R</span>`;
      }
    }

    if (btnG) {
      if (coneStates.G === 1) {
        btnG.className = "dock-cone-btn w-8 h-8 rounded-full border border-emerald-500 bg-emerald-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm";
        btnG.innerHTML = `<span class="text-xs font-black leading-none">G</span><span class="text-[7px] font-bold leading-none mt-0.5">약</span>`;
      } else if (coneStates.G === 2) {
        btnG.className = "dock-cone-btn w-8 h-8 rounded-full border border-emerald-800 bg-emerald-800 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ring-1.5 ring-emerald-300";
        btnG.innerHTML = `<span class="text-xs font-black leading-none">G</span><span class="text-[7px] font-bold leading-none mt-0.5">맹</span>`;
      } else {
        btnG.className = "dock-cone-btn w-8 h-8 rounded-full border border-emerald-300 text-emerald-600 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs";
        btnG.innerHTML = `<span class="text-xs font-black leading-none">G</span>`;
      }
    }

    if (btnB) {
      if (coneStates.B === 1) {
        btnB.className = "dock-cone-btn w-8 h-8 rounded-full border border-blue-500 bg-blue-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm";
        btnB.innerHTML = `<span class="text-xs font-black leading-none">B</span><span class="text-[7px] font-bold leading-none mt-0.5">약</span>`;
      } else if (coneStates.B === 2) {
        btnB.className = "dock-cone-btn w-8 h-8 rounded-full border border-blue-800 bg-blue-800 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ring-1.5 ring-blue-300";
        btnB.innerHTML = `<span class="text-xs font-black leading-none">B</span><span class="text-[7px] font-bold leading-none mt-0.5">맹</span>`;
      } else {
        btnB.className = "dock-cone-btn w-8 h-8 rounded-full border border-blue-300 text-blue-600 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs";
        btnB.innerHTML = `<span class="text-xs font-black leading-none">B</span>`;
      }
    }
  }

  function updateFromConeStates() {
    const actR = coneStates.R > 0;
    const actG = coneStates.G > 0;
    const actB = coneStates.B > 0;
    const count = (actR ? 1 : 0) + (actG ? 1 : 0) + (actB ? 1 : 0);

    if (count === 3) {
      // 전체 다 선택 시: 전색맹
      currentType = 'achromato';
      currentSeverity = 1.0;
      if (dockStatus) dockStatus.textContent = '전색맹';
    } else if (count === 2) {
      // 2개 조합: 적녹 / 적청 / 녹청
      if (actR && actG) {
        currentType = 'redgreen';
        currentSeverity = 0.5;
        if (dockStatus) dockStatus.textContent = '복합(적녹)';
      } else if (actR && actB) {
        currentType = 'redblue';
        currentSeverity = 0.5;
        if (dockStatus) dockStatus.textContent = '복합(적청)';
      } else if (actG && actB) {
        currentType = 'greenblue';
        currentSeverity = 0.5;
        if (dockStatus) dockStatus.textContent = '복합(녹청)';
      }
    } else if (count === 1) {
      // 1개 단독: 1번 누르면 색약(0.5), 한번 더 누르면 색맹(1.0)
      if (actR) {
        currentType = 'protan';
        currentSeverity = (coneStates.R === 2) ? 1.0 : 0.5;
        if (dockStatus) dockStatus.textContent = (coneStates.R === 2) ? '적색맹' : '적색약';
      } else if (actG) {
        currentType = 'deutan';
        currentSeverity = (coneStates.G === 2) ? 1.0 : 0.5;
        if (dockStatus) dockStatus.textContent = (coneStates.G === 2) ? '녹색맹' : '녹색약';
      } else if (actB) {
        currentType = 'tritan';
        currentSeverity = (coneStates.B === 2) ? 1.0 : 0.5;
        if (dockStatus) dockStatus.textContent = (coneStates.B === 2) ? '청색맹' : '청색약';
      }
    } else {
      // 전체 해제: 정상
      currentType = 'default';
      currentSeverity = 0;
      if (dockStatus) dockStatus.textContent = '정상';
    }

    renderConeButtons();
    updateActiveButton();
    applyCorrection();
  }

  function syncConeStatesFromCurrent() {
    if (currentType === 'protan') {
      coneStates = { R: currentSeverity === 1.0 ? 2 : 1, G: 0, B: 0 };
    } else if (currentType === 'deutan') {
      coneStates = { R: 0, G: currentSeverity === 1.0 ? 2 : 1, B: 0 };
    } else if (currentType === 'tritan') {
      coneStates = { R: 0, G: 0, B: currentSeverity === 1.0 ? 2 : 1 };
    } else if (currentType === 'redgreen') {
      coneStates = { R: 1, G: 1, B: 0 };
    } else if (currentType === 'redblue') {
      coneStates = { R: 1, G: 0, B: 1 };
    } else if (currentType === 'greenblue') {
      coneStates = { R: 0, G: 1, B: 1 };
    } else if (currentType === 'achromato') {
      coneStates = { R: 1, G: 1, B: 1 };
    } else {
      coneStates = { R: 0, G: 0, B: 0 };
    }
    renderConeButtons();
    if (dockStatus) {
      const map = {
        'default': '정상',
        'protan': currentSeverity === 1.0 ? '적색맹' : '적색약',
        'deutan': currentSeverity === 1.0 ? '녹색맹' : '녹색약',
        'tritan': currentSeverity === 1.0 ? '청색맹' : '청색약',
        'redgreen': '복합(적녹)',
        'redblue': '복합(적청)',
        'greenblue': '복합(녹청)',
        'achromato': '전색맹'
      };
      dockStatus.textContent = map[currentType] || '정상';
    }
  }

  // Attach R, G, B and Reset click listeners
  const btnR = document.getElementById("dock-btn-r");
  const btnG = document.getElementById("dock-btn-g");
  const btnB = document.getElementById("dock-btn-b");
  const btnReset = document.getElementById("dock-btn-reset");

  if (btnR) {
    btnR.addEventListener("click", () => {
      coneStates.R = (coneStates.R + 1) % 3;
      updateFromConeStates();
    });
  }
  if (btnG) {
    btnG.addEventListener("click", () => {
      coneStates.G = (coneStates.G + 1) % 3;
      updateFromConeStates();
    });
  }
  if (btnB) {
    btnB.addEventListener("click", () => {
      coneStates.B = (coneStates.B + 1) % 3;
      updateFromConeStates();
    });
  }
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      coneStates = { R: 0, G: 0, B: 0 };
      updateFromConeStates();
    });
  }

  // Initial UI state update based on user test results
  updateActiveButton();
  syncConeStatesFromCurrent();
  setMode(currentMode);

  // Dynamic canvas sizing for Desktop (PC) without causing page scrolling
  function adjustCanvasSize() {
    if (!originalImageObj) return;

    const isDesktop = window.innerWidth >= 1024;
    const canvasContainer = document.getElementById("canvas-container");
    const wrapperTarget = document.getElementById("canvas-inner-wrapper");
    const cardOrig = document.getElementById("card-original");
    const cardCorr = document.getElementById("card-corrected");
    if (!canvasOrig || !canvasCorr || !canvasContainer || !wrapperTarget) return;

    const imgW = originalImageObj.width;
    const imgH = originalImageObj.height;
    const isLandscape = imgW > imgH;
    const aspectRatio = imgW / imgH;

    if (!isDesktop) {
      // Mobile / Tablet (< 1024px): Natural responsive width & auto height
      wrapperTarget.className = "flex flex-col gap-3 w-full";
      if (cardOrig) cardOrig.className = "w-full p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";
      if (cardCorr) cardCorr.className = "w-full p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";

      canvasOrig.style.width = '100%';
      canvasOrig.style.height = 'auto';
      canvasOrig.style.maxWidth = '100%';
      canvasOrig.style.maxHeight = 'none';

      canvasCorr.style.width = '100%';
      canvasCorr.style.height = 'auto';
      canvasCorr.style.maxWidth = '100%';
      canvasCorr.style.maxHeight = 'none';
      return;
    }

    // Desktop (>= 1024px):
    const windowH = window.innerHeight;
    const headerBox = document.getElementById("lab-header-box");
    const headerBottom = headerBox ? headerBox.getBoundingClientRect().bottom : 100;
    
    // Bottom buffer so nothing touches the bottom edge
    const bottomBuffer = 28;
    const availableH = Math.max(200, windowH - headerBottom - bottomBuffer);
    const containerW = canvasContainer.clientWidth || (window.innerWidth - 380);

    let maxCanvasH, maxCanvasW, targetW, targetH;

    if (isLandscape) {
      // 가로가 긴 이미지 -> 상하(flex-col) 배치
      wrapperTarget.className = "flex flex-col gap-2.5 w-full items-center justify-center";
      if (cardOrig) cardOrig.className = "w-full p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";
      if (cardCorr) cardCorr.className = "w-full p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";

      // 2개의 캔버스가 상하로 배치되므로, 각 캔버스가 가질 수 있는 최대 높이는 availableH의 약 절반
      const totalOverheadH = 2 * 44 + 10; // 2 cards padding & label (~44px each) + gap between cards (10px)
      maxCanvasH = Math.max(80, Math.floor((availableH - totalOverheadH) / 2));
      maxCanvasW = Math.max(120, containerW - 32);

      targetH = maxCanvasH;
      targetW = targetH * aspectRatio;

      if (targetW > maxCanvasW) {
        targetW = maxCanvasW;
        targetH = targetW / aspectRatio;
      }
    } else {
      // 세로형 또는 정사각형 이미지 -> 좌우(flex-row) 배치
      wrapperTarget.className = "flex flex-row gap-3 sm:gap-4 w-full items-center justify-center";
      if (cardOrig) cardOrig.className = "flex-1 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";
      if (cardCorr) cardCorr.className = "flex-1 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";

      const cardOverheadH = 56;
      maxCanvasH = Math.max(160, availableH - cardOverheadH);
      const gap = 16;
      const cardInnerPadding = 32;
      maxCanvasW = Math.max(120, ((containerW - gap) / 2) - cardInnerPadding);

      targetW = maxCanvasW;
      targetH = targetW / aspectRatio;

      if (targetH > maxCanvasH) {
        targetH = maxCanvasH;
        targetW = targetH * aspectRatio;
      }
      if (targetW > maxCanvasW) {
        targetW = maxCanvasW;
        targetH = targetW / aspectRatio;
      }
    }

    const finalW = Math.max(60, Math.floor(targetW));
    const finalH = Math.max(60, Math.floor(targetH));

    // Apply calculated dimensions to both canvases
    canvasOrig.style.width = `${finalW}px`;
    canvasOrig.style.height = `${finalH}px`;
    canvasOrig.style.maxWidth = '100%';
    canvasOrig.style.maxHeight = `${maxCanvasH}px`;
    canvasOrig.style.objectFit = 'contain';

    canvasCorr.style.width = `${finalW}px`;
    canvasCorr.style.height = `${finalH}px`;
    canvasCorr.style.maxWidth = '100%';
    canvasCorr.style.maxHeight = `${maxCanvasH}px`;
    canvasCorr.style.objectFit = 'contain';
  }

  // Register window resize listener
  window.addEventListener('resize', adjustCanvasSize);
  window.cleanupColorLab = () => {
    window.removeEventListener('resize', adjustCanvasSize);
    if (fab && fab.parentNode) fab.parentNode.removeChild(fab);
    if (dock && dock.parentNode) dock.parentNode.removeChild(dock);
  };

  // Events
  uploadArea.addEventListener("click", () => fileInput.click());
  uploadArea.addEventListener("dragover", (e) => { e.preventDefault(); uploadArea.style.borderColor = '#A39E96'; });
  uploadArea.addEventListener("dragleave", () => uploadArea.style.borderColor = '#E0D9CF');
  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#E0D9CF';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  });
  
  function setMode(mode) {
    currentMode = mode;
    if (mode === 'simulate') {
       modeSimulateBtns.forEach(btn => {
         if (btn.id !== 'mobile-mode-sim-btn') {
           btn.className = "mode-simulate-btn bg-rose-50 border-2 border-rose-300 shadow-sm rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01]";
         }
       });
       modeCorrectBtns.forEach(btn => {
         if (btn.id !== 'mobile-mode-cor-btn') {
           btn.className = "mode-correct-btn bg-stone-50 border-2 border-stone-200 rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all opacity-60 hover:opacity-100 hover:bg-indigo-50";
         }
       });
       if (resultLabel) {
         resultLabel.textContent = 'Simulation';
         resultLabel.className = 'text-rose-600 text-xs font-bold mb-2 tracking-wider uppercase display-font';
       }
    } else {
       modeCorrectBtns.forEach(btn => {
         if (btn.id !== 'mobile-mode-cor-btn') {
           btn.className = "mode-correct-btn bg-indigo-50 border-2 border-indigo-300 shadow-sm rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01]";
         }
       });
       modeSimulateBtns.forEach(btn => {
         if (btn.id !== 'mobile-mode-sim-btn') {
           btn.className = "mode-simulate-btn bg-stone-50 border-2 border-stone-200 rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all opacity-60 hover:opacity-100 hover:bg-rose-50";
         }
       });
       if (resultLabel) {
         resultLabel.textContent = 'Daltonized';
         resultLabel.className = 'text-indigo-600 text-xs font-bold mb-2 tracking-wider uppercase display-font';
       }
    }

    const mobSimBtn = document.getElementById("mobile-mode-sim-btn");
    const mobCorBtn = document.getElementById("mobile-mode-cor-btn");
    if (mobSimBtn && mobCorBtn) {
      if (mode === 'simulate') {
        mobSimBtn.className = "mode-simulate-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all bg-white text-rose-700 shadow-xs";
        mobCorBtn.className = "mode-correct-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all text-stone-600 hover:text-stone-900";
      } else {
        mobCorBtn.className = "mode-correct-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all bg-white text-indigo-700 shadow-xs";
        mobSimBtn.className = "mode-simulate-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all text-stone-600 hover:text-stone-900";
      }
    }

    applyCorrection();
  }

  modeSimulateBtns.forEach(btn => btn.addEventListener("click", () => setMode('simulate')));
  modeCorrectBtns.forEach(btn => btn.addEventListener("click", () => setMode('correct')));

  presetBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      currentType = e.target.dataset.type;
      currentSeverity = parseFloat(e.target.dataset.severity);
      updateActiveButton();
      syncConeStatesFromCurrent();
      applyCorrection();
    });
  });

  sliders.forEach(slider => {
    slider.addEventListener("input", (e) => {
      customIntensity = parseFloat(e.target.value);
      intensityVals.forEach(val => val.textContent = customIntensity.toFixed(2) + "x");
      if (dockIntensityText) dockIntensityText.textContent = customIntensity.toFixed(1) + "x";
      
      sliders.forEach(s => {
        if (s !== e.target) s.value = customIntensity;
        s.style.setProperty('--val', (customIntensity / 2) * 100);
      });

      if (!isDragging) isDragging = true;

      // Schedule render on the next animation frame
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          applyCorrection();
        });
      }
    });

    // On release: ensure final correct state is rendered fully
    ['change', 'pointerup', 'touchend'].forEach(evt => {
      slider.addEventListener(evt, () => {
        isDragging = false;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        applyCorrection();
      });
    });
  });

  function updateActiveButton() {
    presetBtns.forEach(b => {
      b.className = "preset-btn py-1.5 px-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border transition-all bg-stone-200 text-stone-500 border-transparent hover:bg-stone-300 w-full";
      
      if (b.dataset.type === currentType && parseFloat(b.dataset.severity) === currentSeverity) {
        b.classList.remove('bg-stone-200', 'text-stone-500', 'border-transparent');
        b.classList.add('text-white');
        if (currentType === 'protan') b.classList.add('bg-rose-600', 'border-rose-400');
        else if (currentType === 'deutan') b.classList.add('bg-green-600', 'border-green-400');
        else if (currentType === 'tritan') b.classList.add('bg-blue-600', 'border-blue-400');
        else if (currentType === 'achromato') b.classList.add('bg-gray-600', 'border-gray-400');
        else if (currentType === 'redgreen') b.classList.add('bg-orange-600', 'border-orange-400');
        else if (currentType === 'redblue') b.classList.add('bg-fuchsia-600', 'border-fuchsia-400');
        else if (currentType === 'greenblue') b.classList.add('bg-teal-600', 'border-teal-400');
        else b.classList.add('bg-slate-600', 'border-slate-400');
      }
    });
  }

  function handleFile(file) {
    if (!file.type.startsWith('image/')) return alert('이미지 파일만 업로드 가능합니다.');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalImageObj = img;
        setupCanvases(img);
        labInterface.classList.remove("hidden");
        uploadArea.classList.add("hidden");

        // Compact header on desktop after upload to maximize screen space
        const headerDesc = document.getElementById("lab-header-desc");
        if (headerDesc) headerDesc.classList.add("lg:hidden");
        const headerTitle = document.getElementById("lab-header-title");
        if (headerTitle) headerTitle.classList.add("lg:text-2xl", "lg:mb-0");
        const headerBox = document.getElementById("lab-header-box");
        if (headerBox) headerBox.classList.add("lg:mb-2");
        if (fab) {
          fab.classList.remove("hidden", "opacity-0", "scale-75", "pointer-events-none");
          fab.classList.add("opacity-100", "scale-100", "pointer-events-auto");
        }
        if (dock) {
          dock.classList.add("hidden", "opacity-0", "scale-95", "translate-y-3", "pointer-events-none");
          dock.classList.remove("opacity-100", "scale-100", "translate-y-0", "pointer-events-auto");
        }

        adjustCanvasSize();
        applyCorrection();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function setupCanvases(img) {
    const MAX_WIDTH = 1200;
    let w = img.width, h = img.height;
    if (w > MAX_WIDTH) {
      h = Math.floor(h * (MAX_WIDTH / w));
      w = MAX_WIDTH;
    }
    canvasOrig.width = w; canvasOrig.height = h;
    canvasCorr.width = w; canvasCorr.height = h;
    ctxOrig.drawImage(img, 0, 0, w, h);
  }

  // Full resolution render
  function applyCorrection() {
    if (!originalImageObj) return;
    ctxCorr.drawImage(canvasOrig, 0, 0);
    const imageData = ctxCorr.getImageData(0, 0, canvasCorr.width, canvasCorr.height);
    const processed = processPixels(imageData, currentType, currentSeverity, currentMode, customIntensity);
    ctxCorr.putImageData(processed, 0, 0);
  }
}

