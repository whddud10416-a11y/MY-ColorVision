import { state, container } from '../state.js';
import { sanitizeHistory, saveLeaderboardRecord } from '../utils/leaderboard.js';
import { RGB_MATCH_THRESHOLD, SCORING_VERSION } from '../utils/scoring.js';

const escapeText = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export function toggleDetails() {
  const section = document.getElementById("details-section");
  const btn = document.getElementById("toggle-details-btn");
  if (!section || !btn) return;
  section.classList.toggle("hidden");
  btn.setAttribute('aria-expanded', String(!section.classList.contains('hidden')));
  if (section.classList.contains("hidden")) {
    btn.innerHTML = "상세 결과(오답 노트) 펼치기 ▼";
  } else {
    btn.innerHTML = "상세 결과(오답 노트) 접기 ▲";
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

window.toggleDetails = toggleDetails;
window.goToColorLab = () => {
  window.setMode('lab'); // Route via app.js
};

export function renderFinalScore() {
  const isChallenge = state.mode === 'challenge';
  const score = isChallenge ? state.challengeTotalScore : state.score;
  const total = isChallenge ? 100 : 15;
  const percentageScore = isChallenge ? score : Math.round((score / total) * 100);
  const historyList = sanitizeHistory(isChallenge ? state.challengeHistory : state.userHistory);

  let resultTitle = "";
  let resultDesc = "";
  let resultColor = "";
  let resultGlow = "";

  if (isChallenge) {
    if (score === 100) {
      resultTitle = "완벽함! (Perfect)";
      resultDesc = "모든 챌린지를 게임의 허용 오차 범위 안에서 통과했습니다!";
      resultColor = "text-emerald-400";
      resultGlow = "rgba(16, 185, 129, 0.3)";
    } else if (score >= 80) {
      resultTitle = "훌륭함 (Great)";
      resultDesc = "대부분의 챌린지를 성공적으로 높은 정확도로 수행했습니다.";
      resultColor = "text-amber-400";
      resultGlow = "rgba(245, 158, 11, 0.3)";
    } else if (score >= 60) {
      resultTitle = "나쁘지 않음 (Good)";
      resultDesc = "무난하게 마쳤으나 더 나은 기록에 도전해보세요.";
      resultColor = "text-amber-400";
      resultGlow = "rgba(245, 158, 11, 0.3)";
    } else {
      resultTitle = "노력 필요 (Needs Practice)";
      resultDesc = "이번 기록을 확인하고 색상 과제에 다시 도전해보세요.";
      resultColor = "text-rose-400";
      resultGlow = "rgba(244, 63, 94, 0.3)";
    }
  } else {
    if (score >= 13) {
      resultTitle = "과제 완료 (Completed)";
      resultDesc = `이번 색상 과제에서 15문항 중 ${score}문항을 통과했습니다.<br>교육·체험 결과이며, 색각 이상 여부나 유형을 진단하지 않습니다.`;
      resultColor = "text-emerald-400";
      resultGlow = "rgba(16, 185, 129, 0.3)";
    } else if (score >= 9) {
      resultTitle = "과제 완료 (Completed)";
      resultDesc = `이번 색상 과제에서 15문항 중 ${score}문항을 통과했습니다.<br>교육·체험 결과이며, 색각 이상 여부나 유형을 진단하지 않습니다.`;
      resultColor = "text-amber-400";
      resultGlow = "rgba(245, 158, 11, 0.3)";
    } else {
      resultTitle = "과제 완료 (Completed)";
      resultDesc = `이번 색상 과제에서 15문항 중 ${score}문항을 통과했습니다.<br>교육·체험 결과이며, 색각 이상 여부나 유형을 진단하지 않습니다.`;
      resultColor = "text-rose-400";
      resultGlow = "rgba(244, 63, 94, 0.3)";
    }
  }

  // Summarize performance only; RGB input error cannot identify a clinical type.
  const weaknessColor = 'text-emerald-400';
  const weaknessDesc = isChallenge ? '색상 과제의 게임 점수입니다. 색각 진단 결과가 아닙니다.' :
    [['ishihara', '숫자 판독', 3], ['sort', '색상 정렬', 5], ['rgb', 'RGB 매칭', 7]]
      .map(([type, label, count]) => `${label} ${historyList.filter(item => item.type === type && item.isCorrect).length}/${count}`)
      .join(' · ');

  let html = `
    <div class="flex flex-col items-center justify-start min-h-full w-full px-4 lg:px-8 py-6 sm:py-10">
      <div class="wide-container max-w-5xl mx-auto text-center">

        <!-- Hero Score Section -->
        <div class="animate-in mb-10 sm:mb-14" style="--stagger: 0ms">
          <div class="stage-badge mx-auto mb-6">
            <span class="display-font">${isChallenge ? 'CHALLENGE RESULT' : 'RESULT'}</span>
            <span class="text-stone-300">|</span>
            <span>${isChallenge ? '종합 점수' : `총 15단계 중 ${score}개 통과`}</span>
          </div>
          
          <p class="hero-score text-8xl sm:text-9xl lg:text-[10rem] ${resultColor} mb-4 sm:mb-6"
             style="text-shadow: 0 0 60px ${resultGlow};">
             ${percentageScore}<span class="text-3xl sm:text-5xl ml-1 sm:ml-2 text-stone-400" style="text-shadow: none;">점</span>
          </p>
          
          <h3 class="display-font text-xl sm:text-3xl lg:text-4xl font-bold ${resultColor} mb-4 sm:mb-6 break-keep">${resultTitle}</h3>
          <p class="text-stone-600 text-sm sm:text-lg leading-relaxed break-keep max-w-2xl mx-auto">${resultDesc}</p>
        </div>
  `;

  if (!isChallenge) {
    html += `
        <!-- Weakness Analysis Card -->
        <div class="glass-panel glass-panel-interactive p-6 sm:p-8 mb-8 max-w-2xl mx-auto text-left animate-in" style="--stagger: 150ms">
          <h4 class="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            과제별 수행 결과
          </h4>
          <p class="text-sm sm:text-base text-stone-600"><span class="font-bold ${weaknessColor}">${weaknessDesc}</span> 화면과 조명에 따라 수행 결과가 달라질 수 있습니다.</p>
          <button onclick="window.goToColorLab()" class="mt-4 w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm text-center">색상 보정 실험실 가기 &rarr;</button>
        </div>
    `;
  } else {
    html += `
        <div class="glass-panel p-4 sm:p-6 mb-8 max-w-2xl mx-auto text-center animate-in" style="--stagger: 150ms">
           <p class="text-sm sm:text-base text-stone-600"><span class="font-bold ${weaknessColor}">${weaknessDesc}</span></p>
        </div>
    `;
    
    // Leaderboard Input
    const timeUsed = 180 - state.challengeTimeLeft;
    const timeStr = `${Math.floor(timeUsed / 60)}분 ${String(timeUsed % 60).padStart(2, '0')}초`;
    
    html += `
        <div class="glass-panel p-6 sm:p-8 mb-8 max-w-xl mx-auto text-center animate-in" style="--stagger: 200ms">
          <h4 class="text-xl font-bold text-stone-800 mb-4">🏆 이 브라우저에 기록 남기기</h4>
          <p class="text-stone-600 text-sm mb-6">최종 점수 <span class="font-bold text-amber-600">${score}점</span> (소요시간: ${timeStr})</p>
          
          <div class="flex gap-2">
            <input type="text" id="leaderboard-name" aria-label="기록에 사용할 닉네임" placeholder="닉네임을 입력하세요 (최대 10자)" maxlength="10" class="flex-1 px-4 py-3 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 focus:outline-none focus:border-stone-500 transition-colors">
            <button id="save-record-btn" class="bg-stone-800 hover:bg-stone-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">기록</button>
          </div>
        </div>
    `;
  }

  html += `
        <!-- Toggle Details -->
        <button onclick="window.toggleDetails()" id="toggle-details-btn" aria-expanded="false" aria-controls="details-section" class="text-stone-500 hover:text-stone-800 transition pb-1 border-b border-stone-300 mb-8 mt-2 mx-auto inline-block animate-in" style="--stagger: 250ms">상세 결과(오답 노트) 펼치기 ▼</button>
      </div>
  `;

  const getStatusAssets = (isCorrect) => {
    return {
      icon: isCorrect
        ? `<div class="bg-emerald-500/20 text-emerald-400 p-2 rounded-full border border-emerald-500/50"><svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>`
        : `<div class="bg-rose-500/20 text-rose-400 p-2 rounded-full border border-rose-500/50"><svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg></div>`,
      text: isCorrect
        ? '<span class="text-emerald-400 font-bold ml-3 text-lg">통과</span>'
        : '<span class="text-rose-400 font-bold ml-3 text-lg">오답</span>',
      borderColor: isCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'
    };
  };

  const renderIshiharaResult = (history) => {
    const status = getStatusAssets(history.isCorrect);
    return `
      <div class="result-card w-full bg-stone-50 rounded-2xl border ${status.borderColor} shadow-sm relative overflow-hidden p-4 sm:p-5">
        <div class="flex items-center gap-3">
          ${status.icon}
          <div class="flex-1 min-w-0">
            <h4 class="text-sm sm:text-base font-bold text-stone-700 leading-tight">
              <span class="display-font">Stage ${isChallenge ? history.stage : history.stage}</span><br>이시하라
            </h4>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <div class="text-center">
              <p class="text-[10px] text-stone-400 mb-0.5">정답</p>
              <div class="display-font text-lg sm:text-xl font-black text-emerald-400">${history.correct}</div>
            </div>
            <span class="text-stone-300 text-xs">→</span>
            <div class="text-center">
              <p class="text-[10px] text-stone-400 mb-0.5">선택</p>
              <div class="display-font text-lg sm:text-xl font-black ${history.isCorrect ? 'text-emerald-400' : 'text-rose-400'}">${history.user === null ? '모르겠음' : history.user}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const renderSortResult = (history) => {
    const status = getStatusAssets(history.isCorrect);
    const renderColorRow = (hues) => `
      <div class="flex w-full h-12 sm:h-16 gap-1.5">
        ${hues.map((h, i) => `<div style="background:hsl(${h}, 70%, 50%)" class="flex-1 h-full shadow-inner border border-stone-200 ${i === 0 ? 'rounded-l-xl' : (i === hues.length - 1 ? 'rounded-r-xl' : '')}"></div>`).join('')}
      </div>
    `;
    const stageStr = isChallenge ? history.stage : history.stage - 3;

    return `
      <div class="result-card w-full bg-stone-50 rounded-[2rem] border ${status.borderColor} shadow-sm p-5 sm:p-6 lg:p-8">
        <div class="flex items-center mb-8 border-b border-stone-200 pb-4">
          ${status.icon}
          <h4 class="text-lg sm:text-xl font-bold text-stone-700 ml-4 flex-1">
            <span class="display-font">Stage ${stageStr}</span> — ${escapeText(history.themeName)}
          </h4>
          ${isChallenge ? `<span class="mr-4 text-emerald-400 font-bold">${history.scoreEarned}점</span>` : ''}
          ${!history.isCorrect && !isChallenge ? '<span class="flex h-5 w-5 relative mr-1 mt-0.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span class="relative inline-flex rounded-full h-5 w-5 bg-rose-500 justify-center items-center text-white text-[10px] font-bold">!</span></span>' : ''}
          ${!isChallenge ? status.text : ''}
        </div>
        <div class="space-y-8 px-1">
          <div class="relative">
            <p class="text-sm font-bold text-stone-600 mb-3 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-emerald-400"></div> 완벽한 정답 배열</p>
            ${renderColorRow(history.correct)}
          </div>
          <div class="relative">
            <p class="text-sm font-bold text-stone-600 mb-3 flex items-center gap-2"><div class="w-2 h-2 rounded-full ${history.isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}"></div> 나의 제출 배열</p>
            ${renderColorRow(history.user)}
          </div>
        </div>
      </div>
    `;
  };

  const renderRgbResult = (history) => {
    const status = getStatusAssets(history.isCorrect);
    const { correct, user, displayCorrect, displayUser, isCorrect } = history;
    const stageStr = isChallenge ? history.stage : history.stage - 8;

    const sliderCompareHtml = (colorName, colorClass, correctVal, userVal) => {
      const correctP = (correctVal / 255) * 100;
      const userP = (userVal / 255) * 100;
      const diff = Math.abs(correctVal - userVal);
      const warningText = diff > 40 ? `오차: ${diff}` : '';

      return `
        <div class="w-full mb-7 last:mb-0 px-2 lg:px-4">
          <div class="flex justify-between items-end mb-2">
            <span class="display-font font-black text-${colorClass}-400 text-sm uppercase tracking-wider">${colorName}</span>
            ${warningText ? `<span class="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-md">${warningText}</span>` : ''}
          </div>
          <div class="relative w-full h-8 bg-stone-200 rounded-lg overflow-visible border border-stone-300 shadow-inner">
             <div class="absolute top-0 bottom-0 bg-${colorClass}-600 rounded-lg z-10 transition-all duration-1000" style="width: ${userP}%;"></div>
             <div class="absolute top-[-2px] bottom-[-2px] w-1 bg-stone-500 z-20 shadow-[0_0_6px_rgba(0,0,0,0.3)]" style="left: ${correctP}%; margin-left: -2px;"></div>
             <div class="absolute -bottom-5 text-[9px] text-stone-500 whitespace-nowrap z-20 transform -translate-x-1/2 font-medium" style="left: ${correctP}%;">▼ 정답 (${correctVal})</div>
             <div class="absolute top-0 bottom-0 text-[9px] text-white font-bold whitespace-nowrap z-30 flex items-center" style="left: 6px;">내 선택 (${userVal})</div>
          </div>
        </div>
      `;
    };

    return `
      <div class="result-card result-card-full w-full bg-stone-50 rounded-[2rem] border ${status.borderColor} shadow-sm relative overflow-hidden p-5 sm:p-6 lg:p-8">

        
        <div class="flex items-center mb-6 border-b border-stone-200 pb-4">
          ${status.icon}
          <h4 class="text-base sm:text-lg font-bold text-stone-700 ml-4 flex-1">
            <span class="display-font">Stage ${stageStr}</span> — RGB 매칭 · 입력값
          </h4>
          ${isChallenge ? `<span class="mr-4 text-emerald-400 font-bold">${history.scoreEarned}점</span>` : ''}
          ${(!isChallenge && history.isCorrect) ? status.text : (!isChallenge ? `<div class="text-right leading-tight"><span class="text-stone-400 text-[10px] block font-medium mb-0.5">내 오차값</span><span class="display-font text-xl lg:text-2xl font-black text-rose-400">${history.distance}</span></div>` : `<div class="text-right leading-tight"><span class="text-stone-400 text-[10px] block font-medium mb-0.5">내 오차값</span><span class="display-font text-xl lg:text-2xl font-black text-rose-400">${history.distance}</span></div>`)}
        </div>

        <div class="flex flex-row w-full gap-1.5 mb-8 px-2 lg:px-4">
          <div class="flex-[1] text-center">
            <p class="text-[11px] sm:text-xs text-stone-500 mb-2.5 font-medium">정답 색상</p>
            <div class="w-full h-10 sm:h-12 rounded-l-xl shadow-inner border border-stone-200" style="background:rgb(${displayCorrect.r}, ${displayCorrect.g}, ${displayCorrect.b})"></div>
          </div>
          <div class="flex-[1] text-center">
            <p class="text-[11px] sm:text-xs text-stone-500 mb-2.5 font-medium">내가 조합한 색상</p>
            <div class="w-full h-10 sm:h-12 rounded-r-xl shadow-inner border ${isCorrect ? 'border-emerald-500/50' : 'border-rose-500/50'}" style="background:rgb(${displayUser.r}, ${displayUser.g}, ${displayUser.b})"></div>
          </div>
        </div>
        
        <div class="w-full">
          ${sliderCompareHtml('Red', 'red', correct.r, user.r)}
          ${sliderCompareHtml('Green', 'emerald', correct.g, user.g)}
          ${sliderCompareHtml('Blue', 'blue', correct.b, user.b)}
        </div>
      </div>
    `;
  };

  html += `
      <div id="details-section" class="hidden text-left w-full pt-10 mt-6 border-t border-stone-300 wide-container max-w-5xl mx-auto px-2">
        <h3 class="display-font text-2xl sm:text-3xl font-bold text-stone-700 mb-10 flex items-center gap-3 tracking-tight">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          상세 결과 (오답 노트)
        </h3>
  `;

  // Group by type
  const ishiharaResults = historyList.filter(h => h.type === 'ishihara');
  const sortResults = historyList.filter(h => h.type === 'sort');
  const rgbResults = historyList.filter(h => h.type === 'rgb');

  // ── Ishihara Section
  if (ishiharaResults.length > 0) {
    html += `
      <div class="mb-10">
        <h4 class="display-font text-lg sm:text-xl font-bold text-stone-500 mb-5 flex items-center gap-2 tracking-wide">
          <span class="w-1.5 h-6 rounded-full bg-amber-400/60 inline-block"></span>
          숫자 판독 과제
        </h4>
        <div class="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3">
          ${ishiharaResults.map(h => `<div class="w-full sm:w-[calc(33.333%-0.5rem)] min-w-[250px] max-w-[400px]">${renderIshiharaResult(h)}</div>`).join('')}
        </div>
      </div>
    `;
  }

  // ── Color Sort Section
  if (sortResults.length > 0) {
    html += `
      <div class="mb-10">
        <h4 class="display-font text-lg sm:text-xl font-bold text-stone-500 mb-5 flex items-center gap-2 tracking-wide">
          <span class="w-1.5 h-6 rounded-full bg-violet-400/60 inline-block"></span>
          색상 정렬
        </h4>
        <div class="flex flex-col gap-4">
          ${sortResults.map(h => renderSortResult(h)).join('')}
        </div>
      </div>
    `;
  }

  // ── RGB Match Section
  if (rgbResults.length > 0) {
    html += `
      <div class="mb-10">
        <h4 class="display-font text-lg sm:text-xl font-bold text-stone-500 mb-5 flex items-center tracking-wide">
          <span class="w-1.5 h-6 rounded-full bg-cyan-400/60 inline-block mr-2"></span>
          RGB 색상 매칭
          <span class="ml-3 text-[11px] font-normal text-stone-400 tracking-normal hidden sm:inline-block leading-tight">(게임 기준: 표시색 거리 ${RGB_MATCH_THRESHOLD} 미만 통과)</span>
        </h4>
        <div class="flex flex-col lg:flex-row lg:flex-wrap lg:justify-center gap-4">
          ${rgbResults.map(h => `<div class="w-full lg:w-[calc(50%-0.5rem)] max-w-2xl">${renderRgbResult(h)}</div>`).join('')}
        </div>
      </div>
    `;
  }

  const retryText = isChallenge ? '챌린지 다시' : '다시 검사';
  const retryAction = isChallenge ? "window.setMode('challenge')" : "window.setMode('test')";

  html += `
      </div>
      <div class="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-8 pb-12 w-full max-w-xl mx-auto px-4">
        <button onclick="window.setMode('home')" class="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full text-stone-700 hover:text-stone-900 font-bold text-base border border-stone-300 bg-white/80 hover:bg-white shadow-xs transition-all flex justify-center items-center">홈으로</button>
        <button onclick="${retryAction}" class="glow-button w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 rounded-full text-white font-bold text-base sm:text-lg shadow-sm flex justify-center items-center">${retryText}</button>
      </div>
  `;
  container.innerHTML = html;

  if (isChallenge) {
    const saveBtn = document.getElementById("save-record-btn");
    const nameInput = document.getElementById("leaderboard-name");
    
    if (saveBtn && nameInput) {
      let saved = false;
      saveBtn.onclick = () => {
        if (saved || saveBtn.disabled) return;
        const name = nameInput.value.trim();
        if (!name) return alert("닉네임을 입력해주세요.");
        saveBtn.disabled = true;
        const result = saveLeaderboardRecord({
          name: name,
          score: state.challengeTotalScore,
          timeUsed: Math.max(0, Math.min(180, 180 - state.challengeTimeLeft)),
          date: new Date().toISOString(),
          history: state.challengeHistory,
          scoringVersion: SCORING_VERSION
        });
        if (result.error) {
          saveBtn.disabled = false;
          alert(result.error);
          return;
        }
        saved = true;
        window.setMode('challenge');
      };
    }
  }
}
