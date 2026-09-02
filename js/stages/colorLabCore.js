/**
 * colorLabCore.js
 * Core engine for Color Lab: state management, canvas rendering, pixel math, and image file loading.
 */
import { processPixels } from '../utils/daltonize.js';

export class ColorLabCore {
  constructor(initialWeakness = 'default') {
    this.currentType = (initialWeakness !== 'default' && ['protan', 'deutan', 'tritan', 'redgreen', 'redblue', 'greenblue'].includes(initialWeakness))
      ? initialWeakness
      : 'default';
    this.currentSeverity = 0.5;
    this.currentMode = (initialWeakness !== 'default') ? 'correct' : 'simulate';
    this.customIntensity = 1.0;
    this.originalImageObj = null;

    this.canvasOrig = null;
    this.canvasCorr = null;
    this.ctxOrig = null;
    this.ctxCorr = null;

    this.rafId = null;
    this.listeners = new Set();
  }

  initCanvases(canvasOrigEl, canvasCorrEl) {
    this.canvasOrig = canvasOrigEl;
    this.canvasCorr = canvasCorrEl;
    this.ctxOrig = canvasOrigEl.getContext('2d');
    this.ctxCorr = canvasCorrEl.getContext('2d', { willReadFrequently: true });
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const cb of this.listeners) {
      cb(this);
    }
  }

  setTypeAndSeverity(type, severity) {
    this.currentType = type;
    this.currentSeverity = severity;
    this.applyCorrection();
    this.notify();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.applyCorrection();
    this.notify();
  }

  setIntensity(intensity) {
    this.customIntensity = intensity;
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        this.applyCorrection();
      });
    }
    this.notify();
  }

  resetIntensity() {
    this.customIntensity = 1.0;
    this.applyCorrection();
    this.notify();
  }

  setupCanvases(img) {
    const MAX_WIDTH = 1200;
    let w = img.width, h = img.height;
    if (w > MAX_WIDTH) {
      h = Math.floor(h * (MAX_WIDTH / w));
      w = MAX_WIDTH;
    }
    this.canvasOrig.width = w;
    this.canvasOrig.height = h;
    this.canvasCorr.width = w;
    this.canvasCorr.height = h;
    this.ctxOrig.drawImage(img, 0, 0, w, h);
  }

  adjustCanvasSize() {
    if (!this.originalImageObj || !this.canvasOrig || !this.canvasCorr) return;

    const isDesktop = window.innerWidth >= 1024;
    const canvasContainer = document.getElementById("canvas-container");
    const wrapperTarget = document.getElementById("canvas-inner-wrapper");
    const cardOrig = document.getElementById("card-original");
    const cardCorr = document.getElementById("card-corrected");
    if (!canvasContainer || !wrapperTarget) return;

    const imgW = this.originalImageObj.width;
    const imgH = this.originalImageObj.height;
    const isLandscape = imgW > imgH;
    const aspectRatio = imgW / imgH;

    if (!isDesktop) {
      // Mobile / Tablet (< 1024px): Natural responsive width & auto height
      wrapperTarget.className = "flex flex-col gap-3 w-full";
      if (cardOrig) cardOrig.className = "w-full p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";
      if (cardCorr) cardCorr.className = "w-full p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";

      this.canvasOrig.style.width = '100%';
      this.canvasOrig.style.height = 'auto';
      this.canvasOrig.style.maxWidth = '100%';
      this.canvasOrig.style.maxHeight = 'none';

      this.canvasCorr.style.width = '100%';
      this.canvasCorr.style.height = 'auto';
      this.canvasCorr.style.maxWidth = '100%';
      this.canvasCorr.style.maxHeight = 'none';
      return;
    }

    // Desktop (>= 1024px):
    const windowH = window.innerHeight;
    const headerBox = document.getElementById("lab-header-box");
    const headerBottom = headerBox ? headerBox.getBoundingClientRect().bottom : 100;
    const bottomBuffer = 28;
    const availableH = Math.max(200, windowH - headerBottom - bottomBuffer);
    const containerW = canvasContainer.clientWidth || (window.innerWidth - 380);

    let maxCanvasH, maxCanvasW, targetW, targetH;

    if (isLandscape) {
      wrapperTarget.className = "flex flex-col gap-2.5 w-full items-center justify-center";
      if (cardOrig) cardOrig.className = "w-full p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";
      if (cardCorr) cardCorr.className = "w-full p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";

      const totalOverheadH = 2 * 44 + 10;
      maxCanvasH = Math.max(80, Math.floor((availableH - totalOverheadH) / 2));
      maxCanvasW = Math.max(120, containerW - 32);

      targetH = maxCanvasH;
      targetW = targetH * aspectRatio;

      if (targetW > maxCanvasW) {
        targetW = maxCanvasW;
        targetH = targetW / aspectRatio;
      }
    } else {
      wrapperTarget.className = "flex flex-row gap-3 sm:gap-4 w-full items-center justify-center";
      if (cardOrig) cardOrig.className = "flex-1 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";
      if (cardCorr) cardCorr.className = "flex-1 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center bg-white/70 border border-stone-200/60 shadow-sm min-w-0";

      const totalOverheadH = 44 + 8;
      maxCanvasH = Math.max(120, availableH - totalOverheadH);
      maxCanvasW = Math.max(100, Math.floor((containerW - 32) / 2));

      targetH = maxCanvasH;
      targetW = targetH * aspectRatio;

      if (targetW > maxCanvasW) {
        targetW = maxCanvasW;
        targetH = targetW / aspectRatio;
      }
    }

    targetW = Math.round(targetW);
    targetH = Math.round(targetH);

    this.canvasOrig.style.width = `${targetW}px`;
    this.canvasOrig.style.height = `${targetH}px`;
    this.canvasOrig.style.maxWidth = '100%';
    this.canvasOrig.style.maxHeight = '100%';

    this.canvasCorr.style.width = `${targetW}px`;
    this.canvasCorr.style.height = `${targetH}px`;
    this.canvasCorr.style.maxWidth = '100%';
    this.canvasCorr.style.maxHeight = '100%';
  }

  applyCorrection() {
    if (!this.originalImageObj || !this.ctxCorr || !this.canvasOrig || !this.canvasCorr) return;
    this.ctxCorr.drawImage(this.canvasOrig, 0, 0);
    const imageData = this.ctxCorr.getImageData(0, 0, this.canvasCorr.width, this.canvasCorr.height);
    const processed = processPixels(imageData, this.currentType, this.currentSeverity, this.currentMode, this.customIntensity);
    this.ctxCorr.putImageData(processed, 0, 0);
  }

  onImageReady(img, onLoadedCallback) {
    this.originalImageObj = img;
    this.setupCanvases(img);

    const uploadArea = document.getElementById("upload-area");
    const labInterface = document.getElementById("lab-interface");
    if (uploadArea) uploadArea.classList.add("hidden");
    if (labInterface) labInterface.classList.remove("hidden");

    const headerDesc = document.getElementById("lab-header-desc");
    if (headerDesc) headerDesc.classList.add("lg:hidden");
    const headerTitle = document.getElementById("lab-header-title");
    if (headerTitle) headerTitle.classList.add("lg:text-2xl", "lg:mb-0");
    const headerBox = document.getElementById("lab-header-box");
    if (headerBox) headerBox.classList.add("lg:mb-2");

    this.adjustCanvasSize();
    this.applyCorrection();
    this.notify();

    if (typeof onLoadedCallback === 'function') {
      onLoadedCallback();
    }
  }

  handleFile(file, onLoadedCallback) {
    if (!file || !file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => this.onImageReady(img, onLoadedCallback);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  loadSampleImage(src, onLoadedCallback) {
    const img = new Image();
    img.onload = () => this.onImageReady(img, onLoadedCallback);
    img.src = src;
  }
}
