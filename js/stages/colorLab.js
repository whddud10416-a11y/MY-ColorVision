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
        
        <!-- Responsive layout: Stacked on mobile, side-by-side on desktop (lg: 1024px+) -->
        <div class="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-6 items-start justify-center w-full pb-20 lg:pb-0">
          
          <!-- Left Panel: Controls -->
          <div class="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0 flex flex-col gap-2.5 sm:gap-3">
            
            <!-- Mode Selector -->
            <div class="p-3 sm:p-4 bg-white/70 rounded-2xl border border-stone-200/60 shadow-sm">
              <div class="flex flex-col gap-2">
                <div id="mode-simulate" class="bg-rose-50 border-2 border-rose-300 shadow-sm rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01]">
                  <div class="bg-rose-100 p-1.5 rounded-full text-lg">👁️</div>
                  <div>
                    <h3 class="text-xs sm:text-sm font-black text-rose-700">시각 체험 모드</h3>
                    <p class="text-[10px] sm:text-[11px] text-rose-500 mt-0.5 break-keep">색각 이상을 가진 분들의 시야 시뮬레이션</p>
                  </div>
                </div>
                
                <div id="mode-correct" class="bg-stone-50 border-2 border-stone-200 rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all opacity-60 hover:opacity-100 hover:bg-indigo-50">
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
            <div class="p-3 sm:p-4 bg-white/70 rounded-2xl border border-stone-200/60 shadow-sm hidden lg:block">
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
            
            <!-- Intensity Slider (Mobile Only) -->
            <div class="p-3 sm:p-4 w-full bg-white/70 rounded-2xl border border-stone-200/60 shadow-sm lg:hidden">
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
  const modeSimulateBtn = document.getElementById("mode-simulate");
  const modeCorrectBtn = document.getElementById("mode-correct");
  const resultLabel = document.getElementById("result-label");

  // Initial UI state update based on user test results
  updateActiveButton();
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
       modeSimulateBtn.className = "bg-rose-50 border-2 border-rose-300 shadow-sm rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01]";
       modeCorrectBtn.className = "bg-stone-50 border-2 border-stone-200 rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all opacity-60 hover:opacity-100 hover:bg-indigo-50";
       resultLabel.textContent = 'Simulation';
       resultLabel.className = 'text-rose-600 text-xs font-bold mb-2 tracking-wider uppercase display-font';
    } else {
       modeCorrectBtn.className = "bg-indigo-50 border-2 border-indigo-300 shadow-sm rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01]";
       modeSimulateBtn.className = "bg-stone-50 border-2 border-stone-200 rounded-xl p-2.5 sm:p-3 cursor-pointer flex items-center gap-3 transition-all opacity-60 hover:opacity-100 hover:bg-rose-50";
       resultLabel.textContent = 'Daltonized';
       resultLabel.className = 'text-indigo-600 text-xs font-bold mb-2 tracking-wider uppercase display-font';
    }
    applyCorrection();
  }

  modeSimulateBtn.addEventListener("click", () => setMode('simulate'));
  modeCorrectBtn.addEventListener("click", () => setMode('correct'));

  presetBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      currentType = e.target.dataset.type;
      currentSeverity = parseFloat(e.target.dataset.severity);
      updateActiveButton();
      applyCorrection();
    });
  });

  sliders.forEach(slider => {
    slider.addEventListener("input", (e) => {
      customIntensity = parseFloat(e.target.value);
      intensityVals.forEach(val => val.textContent = customIntensity.toFixed(2) + "x");
      
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

