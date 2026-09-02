import { state, container } from '../state.js';
import { ishiharaData } from '../data.js';
import { renderNextStage } from '../../app.js';

export function renderIshiharaStage(stage) {
  container.innerHTML = "";
  const data = ishiharaData[stage];

  const wrapper = document.createElement("div");
  wrapper.classList.add("flex", "items-center", "justify-center", "min-h-full", "w-full", "px-4");

  wrapper.innerHTML = `
    <div class="wide-container mx-auto relative w-full">
      <!-- Layout container matching progress bar width (w-1/2 on desktop) -->
      <div class="flex flex-col lg:flex-row items-center justify-between w-full lg:w-1/2 mx-auto gap-4 sm:gap-6 lg:gap-0 mt-1 sm:mt-4">
        
        <!-- Picture Set -->
        <div class="flex flex-col items-center animate-slide-left w-full lg:w-auto">
          <div class="stage-badge mx-auto mb-2 sm:mb-4">
            <span class="display-font">Step ${stage}</span>
            <span class="text-stone-300">/</span>
            <span class="display-font">Ishihara Test</span>
          </div>
          <div class="p-1 sm:p-3 mb-1 sm:mb-4 max-w-sm mx-auto flex justify-center items-center">
            <img src="images/plate${stage}.png" 
                 alt="이시하라 테스트 이미지"
                 class="w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain mix-blend-multiply"
                 style="--stagger: 100ms" />
          </div>
        </div>
        
        <!-- Button Set -->
        <div class="flex flex-col items-center justify-center animate-slide-right w-full lg:w-auto" style="--stagger: 200ms">
          <div class="w-full max-w-sm lg:max-w-[220px] flex flex-col items-center">
            <p class="text-stone-600 text-sm sm:text-base font-medium mb-1 text-center w-full">보이는 숫자를 선택하세요</p>
            <p class="display-font text-stone-400 text-xs text-center mb-3 sm:mb-5 w-full">Choose the number you see</p>
            <div id="btn-box" class="grid grid-cols-3 gap-2.5 sm:gap-3 w-full lg:flex lg:flex-col lg:gap-4"></div>
          </div>
        </div>
        
      </div>
    </div>
  `;

  container.appendChild(wrapper);

  const btnBox = wrapper.querySelector('#btn-box');
  data.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerHTML = `<span class="display-font text-xl sm:text-2xl lg:text-3xl font-bold">${opt}</span>`;
    btn.classList.add(
      "glow-button", "text-white", "py-3", "sm:py-4",
      "rounded-xl", "sm:rounded-2xl",
      "w-full", "flex", "justify-center", "items-center",
      "animate-scale-in"
    );
    btn.style.setProperty('--stagger', `${300 + i * 80}ms`);
    btn.onclick = () => {
      const isCorrect = (opt === data.answer);
      state.userHistory.push({ type: 'ishihara', stage, correct: data.answer, user: opt, isCorrect });
      if (isCorrect) state.score++;
      state.stageNumber++;
      renderNextStage();
    };
    btnBox.appendChild(btn);
  });
}
