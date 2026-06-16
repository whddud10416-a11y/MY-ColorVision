import { container } from '../state.js';
import { renderNextStage } from '../../app.js';

export function renderTutorialStage(type) {
  let desc;
  if (type === 'ishihara') {
    desc = "컬러 도트 사이에서 <strong class='font-bold text-stone-800'>구별되는 숫자를 선택</strong>하는 가장 기본적인 색각 검사입니다.<br>색각 능력이 정상이라면 쉽게 읽을 수 있습니다.";
  } else if (type === 'sort') {
    desc = "주어진 5개의 <strong class='font-bold text-stone-800'>컬러 큐브를 드래그</strong>하여, 색상이 물 흐르듯 자연스럽게 변천되도록 순서를 맞추세요.<br>(반전된 색상 배열도 정답으로 인정됩니다)";
  } else {
    desc = "좌측의 목표 색상과 완전히 똑같아지도록<br>아래의 <strong class='font-bold text-stone-800'>R/G/B 슬라이더를 미세조정</strong>하세요.<br>3차원 색상 오차가 35 미만일 경우에만 통과로 인정됩니다.";
  }

  container.innerHTML = `
    <div class="flex items-center justify-center min-h-full w-full px-4">
      <div class="wide-container w-full max-w-6xl mx-auto flex justify-center">
        <!-- Flex container: column on mobile, row on desktop -->
        <div class="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 animate-scale-in w-full max-w-5xl" style="--stagger: 0ms">
            
            <!-- Description Field (Left on Desktop) -->
            <div class="p-6 sm:p-8 lg:p-10 w-full lg:flex-1 text-center lg:text-left flex items-center min-w-0">
              <p class="text-lg sm:text-xl lg:text-2xl text-stone-500 leading-relaxed break-keep w-full">${desc}</p>
            </div>
            
            <!-- Button (Right on Desktop) -->
            <div class="flex-shrink-0 w-full lg:w-auto flex items-center justify-center">
              <button id="start-btn" 
                class="glow-button px-10 sm:px-14 py-4 lg:py-6 rounded-2xl lg:rounded-[1.5rem] font-bold text-lg lg:text-2xl text-white w-full lg:w-auto whitespace-nowrap flex justify-center items-center animate-pulse-glow">
                <span class="display-font">${type === 'ishihara' ? '검사 시작' : '검사 계속'}</span>
              </button>
            </div>
            
        </div>
      </div>
    </div>
  `;
  document.getElementById("start-btn").onclick = () => renderNextStage();
}
