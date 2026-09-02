/**
 * colorLabMobile.js
 * Mobile Controls for Color Lab: Floating Action Button, Frosted Glass Slim Dock, R/G/B Cone Toggles & Sliders
 */

export function renderMobileQuickActionsHTML() {
  return `
    <div id="mobile-quick-actions" class="flex lg:hidden gap-2.5 w-full max-w-md mx-auto mb-3 justify-center">
      <button onclick="window.setMode('home')" class="bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors px-4 py-2.5 rounded-xl text-stone-600 font-bold text-xs flex items-center justify-center">홈으로</button>
      <button onclick="document.getElementById('image-input').click()" class="glow-button flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        <span>새 이미지</span>
      </button>
    </div>
  `;
}

export function initMobileControls(core) {
  // Remove any pre-existing floating elements
  const oldFab = document.getElementById("mobile-control-fab");
  if (oldFab) oldFab.remove();
  const oldDock = document.getElementById("mobile-control-dock");
  if (oldDock) oldDock.remove();

  // 1. FAB Button (mounted directly to body for fixed viewport stability)
  const fab = document.createElement("button");
  fab.id = "mobile-control-fab";
  fab.className = "fixed bottom-5 right-5 z-[9999] lg:hidden glow-button w-12 h-12 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 ease-out hidden opacity-0 scale-75 pointer-events-none";
  fab.style.cssText = "position: fixed !important; bottom: 20px !important; right: 20px !important; z-index: 9999 !important;";
  fab.setAttribute("aria-label", "필터 조절");
  fab.innerHTML = `<svg class="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>`;
  document.body.appendChild(fab);

  // 2. Control Dock (mounted directly to body)
  const dock = document.createElement("div");
  dock.id = "mobile-control-dock";
  dock.className = "mobile-glass-dock fixed z-[9999] lg:hidden flex flex-col gap-1.5 transition-all duration-300 ease-out rounded-2xl p-2 shadow-2xl hidden opacity-0 scale-95 translate-y-3 pointer-events-none";
  dock.style.cssText = "position: fixed !important; bottom: 16px !important; left: 0 !important; right: 0 !important; margin-left: auto !important; margin-right: auto !important; width: fit-content !important; min-width: 240px !important; max-width: 90vw !important; z-index: 9999 !important;";

  dock.innerHTML = `
    <!-- Floating Intensity Slider Panel -->
    <div id="mobile-slider-panel" class="mobile-glass-slider hidden p-2 rounded-xl flex flex-col gap-1 animate-in mb-1 w-full">
      <div class="flex justify-between items-center text-[11px]">
        <span class="font-bold text-stone-700">적용 강도</span>
        <span id="mobile-slider-val-label" class="intensity-val font-bold text-stone-800 bg-stone-200/80 px-1.5 py-0.2 rounded text-[10px] border border-stone-300/80">1.00x</span>
      </div>
      <input type="range" min="0" max="2" step="0.01" value="${core.customIntensity}"
             style="--val: ${(core.customIntensity / 2) * 100}; --fill-color: #78716c;"
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

      <!-- Bottom Row: R, G, B Cones + Intensity Toggle + Reset -->
      <div class="flex items-center justify-between gap-2.5 pt-1.5 border-t border-stone-300/60 w-full">
        
        <!-- R, G, B Cone Buttons Group -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button id="dock-btn-r" class="dock-cone-btn w-8 h-8 rounded-full border border-rose-300 text-rose-500 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-xs shrink-0">
            <span class="text-xs font-black leading-none">R</span>
          </button>
          <button id="dock-btn-g" class="dock-cone-btn w-8 h-8 rounded-full border border-emerald-300 text-emerald-600 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-xs shrink-0">
            <span class="text-xs font-black leading-none">G</span>
          </button>
          <button id="dock-btn-b" class="dock-cone-btn w-8 h-8 rounded-full border border-blue-300 text-blue-600 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer select-none shadow-xs shrink-0">
            <span class="text-xs font-black leading-none">B</span>
          </button>
        </div>

        <!-- Intensity Toggle Button -->
        <button id="mobile-intensity-toggle-btn"
          class="py-1 px-2.5 rounded-lg border border-stone-300/90 bg-white/80 hover:bg-white text-[11px] font-bold text-stone-700 flex items-center gap-1 transition-all shadow-xs shrink-0 whitespace-nowrap"
          title="강도 조절">
          <svg class="w-3.5 h-3.5 text-stone-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          <span id="dock-intensity-text" class="text-[11px] font-bold text-stone-900 whitespace-nowrap">${core.customIntensity.toFixed(1)}x</span>
        </button>

        <!-- Reset Button -->
        <button id="dock-btn-reset"
          class="w-8 h-8 rounded-full border border-stone-300/90 bg-white/80 hover:bg-white text-stone-500 hover:text-stone-900 flex items-center justify-center transition-all text-xs font-bold shadow-xs shrink-0"
          title="초기화 (정상)">
          ↺
        </button>

      </div>

    </div>
  `;
  document.body.appendChild(dock);

  // Wire elements
  const dockClose = document.getElementById("mobile-dock-close");
  const intensityToggleBtn = document.getElementById("mobile-intensity-toggle-btn");
  const sliderPanel = document.getElementById("mobile-slider-panel");
  const dockIntensityText = document.getElementById("dock-intensity-text");
  const dockStatus = document.getElementById("mobile-dock-status");
  const slider = dock.querySelector(".intensity-slider");
  const sliderValLabel = document.getElementById("mobile-slider-val-label");

  const mobSimBtn = document.getElementById("mobile-mode-sim-btn");
  const mobCorBtn = document.getElementById("mobile-mode-cor-btn");

  const btnR = document.getElementById("dock-btn-r");
  const btnG = document.getElementById("dock-btn-g");
  const btnB = document.getElementById("dock-btn-b");
  const btnReset = document.getElementById("dock-btn-reset");

  // R, G, B Cone State Tracker: 0: Off, 1: 약 (0.5), 2: 맹 (1.0)
  let coneStates = { R: 0, G: 0, B: 0 };

  function renderConeButtons() {
    if (btnR) {
      if (coneStates.R === 1) {
        btnR.className = "dock-cone-btn w-8 h-8 rounded-full border border-rose-500 bg-rose-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm shrink-0";
        btnR.innerHTML = `<span class="text-xs font-black leading-none">R</span><span class="text-[7px] font-bold leading-none mt-0.5">약</span>`;
      } else if (coneStates.R === 2) {
        btnR.className = "dock-cone-btn w-8 h-8 rounded-full border border-rose-800 bg-rose-800 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ring-1.5 ring-rose-300 shrink-0";
        btnR.innerHTML = `<span class="text-xs font-black leading-none">R</span><span class="text-[7px] font-bold leading-none mt-0.5">맹</span>`;
      } else {
        btnR.className = "dock-cone-btn w-8 h-8 rounded-full border border-rose-300 text-rose-500 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs shrink-0";
        btnR.innerHTML = `<span class="text-xs font-black leading-none">R</span>`;
      }
    }

    if (btnG) {
      if (coneStates.G === 1) {
        btnG.className = "dock-cone-btn w-8 h-8 rounded-full border border-emerald-500 bg-emerald-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm shrink-0";
        btnG.innerHTML = `<span class="text-xs font-black leading-none">G</span><span class="text-[7px] font-bold leading-none mt-0.5">약</span>`;
      } else if (coneStates.G === 2) {
        btnG.className = "dock-cone-btn w-8 h-8 rounded-full border border-emerald-800 bg-emerald-800 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ring-1.5 ring-emerald-300 shrink-0";
        btnG.innerHTML = `<span class="text-xs font-black leading-none">G</span><span class="text-[7px] font-bold leading-none mt-0.5">맹</span>`;
      } else {
        btnG.className = "dock-cone-btn w-8 h-8 rounded-full border border-emerald-300 text-emerald-600 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs shrink-0";
        btnG.innerHTML = `<span class="text-xs font-black leading-none">G</span>`;
      }
    }

    if (btnB) {
      if (coneStates.B === 1) {
        btnB.className = "dock-cone-btn w-8 h-8 rounded-full border border-blue-500 bg-blue-500 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm shrink-0";
        btnB.innerHTML = `<span class="text-xs font-black leading-none">B</span><span class="text-[7px] font-bold leading-none mt-0.5">약</span>`;
      } else if (coneStates.B === 2) {
        btnB.className = "dock-cone-btn w-8 h-8 rounded-full border border-blue-800 bg-blue-800 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ring-1.5 ring-blue-300 shrink-0";
        btnB.innerHTML = `<span class="text-xs font-black leading-none">B</span><span class="text-[7px] font-bold leading-none mt-0.5">맹</span>`;
      } else {
        btnB.className = "dock-cone-btn w-8 h-8 rounded-full border border-blue-300 text-blue-600 bg-white/70 hover:bg-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs shrink-0";
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
      core.setTypeAndSeverity('achromato', 1.0);
      if (dockStatus) dockStatus.textContent = '전색맹';
    } else if (count === 2) {
      if (actR && actG) {
        core.setTypeAndSeverity('redgreen', 0.5);
        if (dockStatus) dockStatus.textContent = '복합(적녹)';
      } else if (actR && actB) {
        core.setTypeAndSeverity('redblue', 0.5);
        if (dockStatus) dockStatus.textContent = '복합(적청)';
      } else if (actG && actB) {
        core.setTypeAndSeverity('greenblue', 0.5);
        if (dockStatus) dockStatus.textContent = '복합(녹청)';
      }
    } else if (count === 1) {
      if (actR) {
        const sev = (coneStates.R === 2) ? 1.0 : 0.5;
        core.setTypeAndSeverity('protan', sev);
        if (dockStatus) dockStatus.textContent = (coneStates.R === 2) ? '적색맹' : '적색약';
      } else if (actG) {
        const sev = (coneStates.G === 2) ? 1.0 : 0.5;
        core.setTypeAndSeverity('deutan', sev);
        if (dockStatus) dockStatus.textContent = (coneStates.G === 2) ? '녹색맹' : '녹색약';
      } else if (actB) {
        const sev = (coneStates.B === 2) ? 1.0 : 0.5;
        core.setTypeAndSeverity('tritan', sev);
        if (dockStatus) dockStatus.textContent = (coneStates.B === 2) ? '청색맹' : '청색약';
      }
    } else {
      core.setTypeAndSeverity('default', 0);
      if (dockStatus) dockStatus.textContent = '정상';
    }

    renderConeButtons();
  }

  function syncConeStatesFromCurrent() {
    coneStates = { R: 0, G: 0, B: 0 };
    if (core.currentType === 'protan') {
      coneStates.R = core.currentSeverity === 1.0 ? 2 : 1;
    } else if (core.currentType === 'deutan') {
      coneStates.G = core.currentSeverity === 1.0 ? 2 : 1;
    } else if (core.currentType === 'tritan') {
      coneStates.B = core.currentSeverity === 1.0 ? 2 : 1;
    } else if (core.currentType === 'redgreen') {
      coneStates.R = 1; coneStates.G = 1;
    } else if (core.currentType === 'redblue') {
      coneStates.R = 1; coneStates.B = 1;
    } else if (core.currentType === 'greenblue') {
      coneStates.G = 1; coneStates.B = 1;
    } else if (core.currentType === 'achromato') {
      coneStates.R = 2; coneStates.G = 2; coneStates.B = 2;
    }
    renderConeButtons();

    if (dockStatus) {
      const map = {
        'default': '정상',
        'protan': core.currentSeverity === 1.0 ? '적색맹' : '적색약',
        'deutan': core.currentSeverity === 1.0 ? '녹색맹' : '녹색약',
        'tritan': core.currentSeverity === 1.0 ? '청색맹' : '청색약',
        'redgreen': '복합(적녹)',
        'redblue': '복합(적청)',
        'greenblue': '복합(녹청)',
        'achromato': '전색맹'
      };
      dockStatus.textContent = map[core.currentType] || '정상';
    }
  }

  function updateMobileModeUI() {
    if (core.currentMode === 'simulate') {
      if (mobSimBtn) mobSimBtn.className = "mode-simulate-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all bg-white text-rose-700 shadow-xs whitespace-nowrap";
      if (mobCorBtn) mobCorBtn.className = "mode-correct-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all text-stone-600 hover:text-stone-900 whitespace-nowrap";
    } else {
      if (mobCorBtn) mobCorBtn.className = "mode-correct-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all bg-white text-indigo-700 shadow-xs whitespace-nowrap";
      if (mobSimBtn) mobSimBtn.className = "mode-simulate-btn py-0.5 px-2 rounded-md text-[11px] font-bold transition-all text-stone-600 hover:text-stone-900 whitespace-nowrap";
    }
  }

  // Transitions
  function openDock() {
    if (fab) {
      fab.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
      fab.classList.add('opacity-0', 'scale-75', 'pointer-events-none');
      setTimeout(() => {
        if (fab.classList.contains('opacity-0')) {
          fab.classList.add('hidden');
        }
      }, 300);
    }

    if (dock) {
      dock.classList.remove('hidden');
      void dock.offsetWidth; // force reflow
      dock.classList.remove('opacity-0', 'scale-95', 'translate-y-3', 'pointer-events-none');
      dock.classList.add('opacity-100', 'scale-100', 'translate-y-0', 'pointer-events-auto');
    }
  }

  function closeDock() {
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

    if (fab) {
      fab.classList.remove('hidden');
      void fab.offsetWidth; // force reflow
      fab.classList.remove('opacity-0', 'scale-75', 'pointer-events-none');
      fab.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
    }
  }

  // Event bindings
  if (fab) fab.addEventListener("click", openDock);
  if (dockClose) dockClose.addEventListener("click", closeDock);

  if (intensityToggleBtn && sliderPanel) {
    intensityToggleBtn.addEventListener("click", () => {
      sliderPanel.classList.toggle("hidden");
    });
  }

  if (mobSimBtn) mobSimBtn.addEventListener("click", () => core.setMode('simulate'));
  if (mobCorBtn) mobCorBtn.addEventListener("click", () => core.setMode('correct'));

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
      core.resetIntensity();
      updateFromConeStates();
    });
  }

  if (slider) {
    slider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (sliderValLabel) sliderValLabel.textContent = val.toFixed(2) + "x";
      if (dockIntensityText) dockIntensityText.textContent = val.toFixed(1) + "x";
      slider.style.setProperty('--val', (val / 2) * 100);
      core.setIntensity(val);
    });
  }

  // Core subscriber
  core.subscribe(() => {
    syncConeStatesFromCurrent();
    updateMobileModeUI();
    if (slider) {
      slider.value = core.customIntensity;
      slider.style.setProperty('--val', (core.customIntensity / 2) * 100);
    }
    if (sliderValLabel) sliderValLabel.textContent = core.customIntensity.toFixed(2) + "x";
    if (dockIntensityText) dockIntensityText.textContent = core.customIntensity.toFixed(1) + "x";
  });

  // Initial Sync
  syncConeStatesFromCurrent();
  updateMobileModeUI();

  return {
    fab,
    dock,
    onImageLoaded: () => {
      if (fab) {
        fab.classList.remove("hidden", "opacity-0", "scale-75", "pointer-events-none");
        fab.classList.add("opacity-100", "scale-100", "pointer-events-auto");
      }
      if (dock) {
        dock.classList.add("hidden", "opacity-0", "scale-95", "translate-y-3", "pointer-events-none");
        dock.classList.remove("opacity-100", "scale-100", "translate-y-0", "pointer-events-auto");
      }
    },
    cleanup: () => {
      if (fab && fab.parentNode) fab.remove();
      if (dock && dock.parentNode) dock.remove();
    }
  };
}
