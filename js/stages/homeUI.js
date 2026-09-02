/**
 * homeUI.js
 * SVG visualization components for home stage (cones, prevalence, confusion swatches)
 */

export function renderCones(cones) {
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

export function renderSwatches(confusions) {
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

export function renderPrevalence(prev) {
  const maleW = Math.min(prev.male / 10 * 100, 100).toFixed(1);
  const femaleW = Math.min(prev.female / 10 * 100, 100).toFixed(1);
  const fmt = n => n < 0.01 ? '<0.01%' : `${n}%`;
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
