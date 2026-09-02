/**
 * colorLab.js
 * Entry coordinator for Color Lab stage.
 * Assembles layout, handles file/sample loading, and bridges core engine with desktop/mobile UI modules.
 */
import { container } from '../state.js';
import { ColorLabCore } from './colorLabCore.js';
import { renderDesktopControlsHTML, initDesktopControls } from './colorLabDesktop.js';
import { renderMobileQuickActionsHTML, initMobileControls } from './colorLabMobile.js';

export function renderColorLab(initialWeakness) {
  // Cleanup any previous lab instance
  if (typeof window.cleanupColorLab === 'function') {
    window.cleanupColorLab();
    window.cleanupColorLab = null;
  }

  const core = new ColorLabCore(initialWeakness);

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

      <!-- Upload Area with Quick Sample Image Testing -->
      <div id="upload-area" class="w-full max-w-2xl mx-auto my-auto p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-200/20 transition-all animate-scale-in rounded-[2rem]" style="--stagger: 100ms; border: 2px dashed #E0D9CF;">
        <svg class="w-12 h-12 text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        <span class="text-stone-700 font-bold text-base sm:text-lg mb-1 text-center">클릭하여 이미지 업로드 또는 드래그 앤 드롭</span>
        <span class="text-stone-400 text-xs sm:text-sm mb-5">JPG, PNG 형식 지원</span>
        <input type="file" id="image-input" class="hidden" accept="image/*" />

        <!-- Quick Sample Images for Instant Testing (탐색기 없이 바로 시험 가능) -->
        <div class="w-full pt-4 border-t border-stone-200/80 flex flex-col items-center gap-2.5">
          <span class="text-xs text-stone-500 font-semibold">💡 준비된 샘플 이미지로 바로 테스트해보세요</span>
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <button id="btn-sample-1" type="button" class="py-2 px-3.5 rounded-xl border border-stone-300 bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
              <span>샘플 1 (색각판 12)</span>
            </button>
            <button id="btn-sample-2" type="button" class="py-2 px-3.5 rounded-xl border border-stone-300 bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span>샘플 2 (색각판 74)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Lab Interface (Hidden initially) -->
      <div id="lab-interface" class="w-full hidden animate-in" style="--stagger: 0ms">
        
        <!-- Mobile Quick Actions Bar (홈으로 / 새 이미지) -->
        ${renderMobileQuickActionsHTML()}

        <!-- Responsive layout: Side-by-side on desktop (lg: 1024px+), Canvas only on mobile -->
        <div class="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-6 items-start justify-center w-full pb-20 lg:pb-0">
          
          <!-- Desktop Left Panel -->
          ${renderDesktopControlsHTML(core)}

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

      </div>
    </div>
  `;

  wrapper.innerHTML = html;
  container.appendChild(wrapper);

  // Setup Canvases
  const canvasOrig = document.getElementById("canvas-original");
  const canvasCorr = document.getElementById("canvas-corrected");
  core.initCanvases(canvasOrig, canvasCorr);

  // Initialize Desktop and Mobile UI Modules
  initDesktopControls(core);
  const mobileHandlers = initMobileControls(core);

  // Setup File Upload & Drag-and-Drop
  const uploadArea = document.getElementById("upload-area");
  const fileInput = document.getElementById("image-input");

  if (uploadArea && fileInput) {
    uploadArea.addEventListener("click", (e) => {
      // If clicked sample buttons, prevent triggering file picker
      if (e.target.closest("#btn-sample-1") || e.target.closest("#btn-sample-2")) return;
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        core.handleFile(e.target.files[0], mobileHandlers.onImageLoaded);
      }
    });

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("bg-stone-200/40");
    });
    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("bg-stone-200/40");
    });
    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("bg-stone-200/40");
      if (e.dataTransfer.files.length > 0) {
        core.handleFile(e.dataTransfer.files[0], mobileHandlers.onImageLoaded);
      }
    });
  }

  // Bind Sample Image Quick-Load Buttons
  const btnSample1 = document.getElementById("btn-sample-1");
  const btnSample2 = document.getElementById("btn-sample-2");

  if (btnSample1) {
    btnSample1.addEventListener("click", (e) => {
      e.stopPropagation();
      core.loadSampleImage("images/plate1.png", mobileHandlers.onImageLoaded);
    });
  }
  if (btnSample2) {
    btnSample2.addEventListener("click", (e) => {
      e.stopPropagation();
      core.loadSampleImage("images/plate2.png", mobileHandlers.onImageLoaded);
    });
  }

  // Window Resize & Cleanup Handler
  const onResize = () => {
    core.adjustCanvasSize();
  };
  window.addEventListener('resize', onResize);

  window.cleanupColorLab = () => {
    window.removeEventListener('resize', onResize);
    mobileHandlers.cleanup();
  };
}
