import { state, container } from '../state.js';
import { sortStageThemes } from '../data.js';
import { renderNextStage } from '../../app.js';
import { hslToRgb, applyDaltonizeToColor } from '../utils/daltonize.js';

export function renderColorSortStage() {
  const isChallenge = state.mode === 'challenge';
  const themeIdx = isChallenge ? (Math.floor(Math.random() * 5) + 4) : state.stageNumber;
  const theme = sortStageThemes[themeIdx];
  const stageNum = isChallenge ? state.stageNumber : state.stageNumber - 3;
  const totalStages = 5;

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-full w-full px-4 lg:px-8">
      <div class="wide-container max-w-6xl mx-auto flex flex-col items-center">
        
        <!-- Header -->
        <div class="text-center mb-8 sm:mb-10 lg:mb-12 w-full animate-in" style="--stagger: 0ms">
          <div class="stage-badge mx-auto mb-4 sm:mb-5">
            <span class="display-font">Step ${stageNum}</span>
            <span class="text-stone-300">/</span>
            <span class="display-font">Step ${totalStages}</span>
          </div>
          <h2 class="display-font text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-stone-800 mb-4 tracking-tight break-keep">${theme.name}</h2>
          <p class="text-stone-500 text-sm sm:text-base font-medium break-keep mb-2">${theme.desc}</p>
          <p class="text-stone-400 text-xs sm:text-sm break-keep">* 명도나 채도가 아닌 '색상(Hue)'의 자연스러운 흐름을 맞추는 테스트입니다.</p>
          ${isChallenge && state.weakness !== 'default' ? '<p class="text-indigo-600 text-xs sm:text-sm font-bold mt-2">✨ 취약 색각 분석 결과에 따른 맞춤형 보정 필터가 적용되었습니다.</p>' : ''}
        </div>

        <!-- Color Cubes — Wide -->
        <div id="sort-box" class="flex w-full max-w-5xl justify-between gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-10 lg:mb-12 animate-scale-in" style="--stagger: 150ms"></div>

        <!-- Confirm Button -->
        <button id="confirm-sort-btn" class="glow-button w-full max-w-md mx-auto py-3 sm:py-4 rounded-2xl sm:rounded-[1.5rem] font-bold text-lg sm:text-xl lg:text-2xl text-white animate-in flex justify-center items-center" style="--stagger: 350ms">
          정렬 완료
        </button>
        
      </div>
    </div>
  `;

  const box = document.getElementById("sort-box");
  let selectedCube = null;

  const currentHues = [...theme.hues];
  for (let i = currentHues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentHues[i], currentHues[j]] = [currentHues[j], currentHues[i]];
  }

  currentHues.forEach((h, idx) => {
    const d = document.createElement("div");
    
    if (isChallenge) {
      const [r, g, b] = hslToRgb(h, 70, 50);
      const [corrR, corrG, corrB] = applyDaltonizeToColor(r, g, b, state.weakness, 0.5, 'correct', 1.0);
      d.style.background = `rgb(${corrR}, ${corrG}, ${corrB})`;
    } else {
      d.style.background = `hsl(${h}, 70%, 50%)`;
    }
    
    d.classList.add(
      "color-cube", "flex-1", "min-w-0",
      "h-32", "sm:h-44", "lg:h-52", "xl:h-56",
      "rounded-xl", "sm:rounded-2xl", "lg:rounded-[1.5rem]",
      "cursor-grab", "active:cursor-grabbing",
      "touch-none", "animate-scale-in"
    );
    d.style.setProperty('--stagger', `${200 + idx * 60}ms`);
    d.dataset.hue = h;
    d.setAttribute("aria-label", `Color angle ${h} degree cube`);

    d.onclick = () => {
      if (selectedCube === null) {
        selectedCube = d;
        d.classList.add("selected-cube");
      } else if (selectedCube === d) {
        d.classList.remove("selected-cube");
        selectedCube = null;
      } else {
        const temp = document.createElement("div");
        d.parentNode.insertBefore(temp, d);
        selectedCube.parentNode.insertBefore(d, selectedCube);
        temp.parentNode.insertBefore(selectedCube, temp);
        temp.remove();

        selectedCube.classList.remove("selected-cube");
        selectedCube = null;
      }
    };

    box.appendChild(d);
  });

  document.getElementById("confirm-sort-btn").onclick = () => {
    const currentOrder = Array.from(box.querySelectorAll('div')).map(d => parseInt(d.dataset.hue));
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(theme.hues) ||
      JSON.stringify(currentOrder) === JSON.stringify([...theme.hues].reverse());

    let scoreEarned = 0;
    if (isChallenge) {
      let matchForward = 0;
      let matchReverse = 0;
      const reverseHues = [...theme.hues].reverse();
      for(let i=0; i<5; i++) {
        if (currentOrder[i] === theme.hues[i]) matchForward++;
        if (currentOrder[i] === reverseHues[i]) matchReverse++;
      }
      scoreEarned = Math.max(matchForward, matchReverse) * 4;
    }

    const historyEntry = {
      type: 'sort',
      stage: state.stageNumber,
      themeName: theme.name,
      correct: theme.hues,
      user: currentOrder,
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

  new Sortable(box, {
    animation: 200,
    ghostClass: 'opacity-50',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    onStart: () => {
      if (selectedCube) {
        selectedCube.classList.remove("selected-cube");
        selectedCube = null;
      }
    }
  });
}
