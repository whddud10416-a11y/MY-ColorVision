import { container } from '../state.js';
import { createSubmissionGuard } from '../utils/session.js';
import { readLeaderboard, rankLeaderboard, deleteLeaderboardRecord } from '../utils/leaderboard.js';

export function renderChallengeIntro() {
  const acceptStart = createSubmissionGuard();
  container.innerHTML = "";

  const { entries, error: storageError } = readLeaderboard();
  const top10 = rankLeaderboard(entries).slice(0, 10);

  const top10Html = top10.map((entry, idx) => {
    let rankStyle = "text-stone-600 font-medium";
    let rankMedal = `${entry.rank}`;
    if(entry.rank === 1) { rankStyle = "text-yellow-400 font-bold"; rankMedal = "🥇 1"; }
    else if(entry.rank === 2) { rankStyle = "text-stone-400 font-bold"; rankMedal = "🥈 2"; }
    else if(entry.rank === 3) { rankStyle = "text-amber-600 font-bold"; rankMedal = "🥉 3"; }
    
    const dateStr = new Date(entry.date).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' });
    const timeStr = `${Math.floor(entry.timeUsed / 60)}분 ${String(entry.timeUsed % 60).padStart(2, '0')}초`;
    
    return `
      <tr class="border-b border-stone-200 hover:bg-stone-100 transition-colors group cursor-pointer" data-record-row="${idx}" tabindex="0" onclick="window.showRecordModal(${idx})" title="기록 보기 (Enter 또는 Space)">
        <td class="py-3 px-4 text-center ${rankStyle}">${rankMedal}</td>
        <td class="py-3 px-4 font-medium text-stone-800 group-hover:text-indigo-600 transition-colors" data-record-name="${idx}"></td>
        <td class="py-3 px-4 text-right font-black text-emerald-600">${entry.score}점</td>
        <td class="py-3 px-4 text-right text-sm text-stone-500">${timeStr}</td>
        <td class="py-3 px-4 text-right text-xs text-stone-400">${dateStr}</td>
        <td class="py-3 px-4 text-center">
          <button onclick="event.stopPropagation(); window.deleteRecord(${idx});" class="text-stone-400 hover:text-rose-500 hover:scale-110 transition-all font-bold text-base w-6 h-6 flex items-center justify-center rounded-full hover:bg-rose-50 mx-auto" title="기록 삭제" aria-label="이 기록 삭제">&times;</button>
        </td>
      </tr>
    `;
  }).join('');

  const leaderboardHtml = top10.length === 0 ? `
    <p class="text-center text-stone-400 py-8">아직 기록이 없습니다. 첫 번째 랭커가 되어보세요!</p>
  ` : `
    <div class="overflow-x-auto w-full">
      <table class="w-full text-left border-collapse min-w-[500px]">
        <thead>
          <tr class="border-b border-stone-200 text-stone-500 text-xs sm:text-sm">
            <th class="py-3 px-4 w-16 text-center">순위</th>
            <th class="py-3 px-4">닉네임</th>
            <th class="py-3 px-4 text-right">점수</th>
            <th class="py-3 px-4 text-right w-24">소요 시간</th>
            <th class="py-3 px-4 text-right w-32">기록일</th>
            <th class="py-3 px-4 w-12 text-center"></th>
          </tr>
        </thead>
        <tbody>
          ${top10Html}
        </tbody>
      </table>
    </div>
  `;

  const html = `
    <div class="flex flex-col items-center justify-center min-h-full w-full px-4 lg:px-8 py-6 sm:py-10">
      <div class="wide-container max-w-4xl mx-auto w-full relative">
        
        <!-- Hero Section -->
        <div class="text-center animate-in mb-10 sm:mb-12" style="--stagger: 0ms">
          <h2 class="display-font text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-800 mb-6 tracking-tight">Color Challenge</h2>
          <p class="text-stone-500 text-sm sm:text-base max-w-2xl mx-auto break-keep leading-relaxed mb-8">
            총 5문항(색상 배열 및 RGB 매칭)으로 구성된 <strong class="font-bold text-stone-800">이 브라우저의 기록 모드</strong>입니다.<br>
            제한시간 <span class="text-amber-600 font-bold">3분</span> 내에 최대한 정확하게 문제를 해결하여 <strong class="font-bold text-stone-800">최고 점수에 도전</strong>하세요.<br>
            각 문항은 20점 만점이며, 정확도에 따라 부분 점수가 책정됩니다.
          </p>
          <button id="start-challenge-btn" class="glow-button px-10 py-4 sm:px-14 sm:py-5 rounded-full text-white font-bold text-lg sm:text-2xl shadow-lg hover:scale-105 transition-transform flex justify-center items-center mx-auto">
            챌린지 시작
          </button>
        </div>

        <!-- Leaderboard -->
        <div class="w-full max-w-2xl mx-auto animate-in pt-4" style="--stagger: 150ms">
          <h3 class="display-font text-xl sm:text-2xl font-bold text-stone-800 mb-6 flex items-center justify-center gap-3">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 9v3a5 5 0 0010 0V9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 17v4"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 21h8"/></svg>
            명예의 전당
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 9v3a5 5 0 0010 0V9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 17v4"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 21h8"/></svg>
          </h3>
          <p class="text-center text-xs text-stone-400 mb-4 pb-2 border-b border-stone-100">이 브라우저의 기록입니다. 규칙(v1·v2)별 순위이며, 행을 선택하면 상세 기록을 볼 수 있습니다.</p>
          ${leaderboardHtml}
        </div>

        <!-- Record Modal -->
        <div id="record-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-hidden="true" inert class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300">
          <div class="bg-white rounded-[2rem] w-[90%] max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl transform scale-95 transition-transform duration-300" id="record-modal-content" onclick="event.stopPropagation()">
            <!-- Header -->
            <div class="px-6 py-5 border-b border-stone-200 flex justify-between items-center bg-stone-50/50">
              <h3 class="display-font text-xl font-bold text-stone-800 flex items-center gap-2 tracking-tight" id="modal-title">
                플레이 기록
              </h3>
              <button onclick="window.closeRecordModal()" aria-label="기록 닫기" class="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center hover:bg-stone-300 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <!-- Body -->
            <div class="p-6 overflow-y-auto bg-stone-50/30 flex-1 hide-scrollbar" id="modal-body" tabindex="0" aria-label="상세 플레이 기록">
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  container.innerHTML = html;
  container.querySelectorAll('[data-record-name]').forEach(cell => {
    const entry = top10[Number(cell.dataset.recordName)];
    cell.textContent = `${entry.name} · v${entry.scoringVersion}`;
  });
  container.querySelectorAll('[data-record-row]').forEach(row => {
    row.addEventListener('keydown', event => {
      if (event.target === row && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        window.showRecordModal(Number(row.dataset.recordRow));
      }
    });
  });

  document.getElementById("start-challenge-btn").onclick = () => {
    if (!acceptStart()) return;
    if (window.startChallengeTimer) {
      window.startChallengeTimer();
    }
  };

  window.deleteRecord = (idx) => {
    if (confirm("이 기록을 삭제하시겠습니까?")) {
      const entryToDelete = top10[idx];
      if (!entryToDelete) return;

      const result = deleteLeaderboardRecord(entryToDelete);
      if (result.error) return alert(result.error);
      window.setMode('challenge');
    }
  };

  // Close modal when clicking outside
  document.getElementById('record-modal').onclick = () => {
    window.closeRecordModal();
  };

  let previousFocus = null;
  window.closeRecordModal = () => {
    const modal = document.getElementById('record-modal');
    const content = document.getElementById('record-modal-content');
    if(modal) {
      modal.classList.add('opacity-0', 'pointer-events-none');
      content.classList.remove('scale-100');
      content.classList.add('scale-95');
      modal.inert = true;
      modal.setAttribute('aria-hidden', 'true');
      if (previousFocus?.isConnected) previousFocus.focus();
    }
  };

  window.showRecordModal = (idx) => {
    const entry = top10[idx];
    if (!entry) return;
    const modal = document.getElementById('record-modal');
    const content = document.getElementById('record-modal-content');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    previousFocus = document.activeElement;
    const nameSpan = document.createElement('span');
    nameSpan.className = 'text-indigo-600';
    nameSpan.textContent = entry.name;
    title.replaceChildren(document.createTextNode('🏆 '), nameSpan, document.createTextNode('님의 플레이 기록'));

    if (!entry.history || entry.history.length === 0) {
      body.innerHTML = `<div class="text-center py-10 text-stone-400 font-medium">이전 버전의 기록이라 상세 데이터가 존재하지 않습니다.</div>`;
    } else {
      body.innerHTML = entry.history.map((h, i) => {
        const isCorrect = h.isCorrect;
        const icon = isCorrect 
          ? `<div class="bg-emerald-500/20 text-emerald-500 p-1.5 rounded-full"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>`
          : `<div class="bg-rose-500/20 text-rose-500 p-1.5 rounded-full"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg></div>`;
          
        let detailsHtml = '';
        if (h.type === 'sort') {
           detailsHtml = `
             <div class="flex flex-col gap-2 w-full mt-3 px-1">
               <div class="flex items-center gap-2"><span class="text-[10px] font-bold text-stone-400 w-8 text-right shrink-0 uppercase tracking-wider">정답</span><div class="flex h-4 w-full rounded-md overflow-hidden">${h.correct.map(c => `<div class="flex-1 h-full border border-stone-200" style="background:hsl(${c},70%,50%)"></div>`).join('')}</div></div>
               <div class="flex items-center gap-2"><span class="text-[10px] font-bold text-stone-400 w-8 text-right shrink-0 uppercase tracking-wider">제출</span><div class="flex h-4 w-full rounded-md overflow-hidden">${h.user.map(c => `<div class="flex-1 h-full border border-stone-200" style="background:hsl(${c},70%,50%)"></div>`).join('')}</div></div>
             </div>
           `;
        } else if (h.type === 'rgb') {
           detailsHtml = `
             <div class="flex flex-col gap-2 w-full mt-3 px-1">
               <div class="flex items-center gap-3">
                 <div class="flex flex-col gap-1 items-center flex-1">
                   <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider">정답 색상</span>
                   <div class="w-full h-8 rounded-lg shadow-inner border border-stone-200" style="background:rgb(${h.displayCorrect.r},${h.displayCorrect.g},${h.displayCorrect.b})"></div>
                 </div>
                 <div class="flex flex-col gap-1 items-center flex-1">
                   <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider">제출 색상</span>
                   <div class="w-full h-8 rounded-lg shadow-inner border ${isCorrect ? 'border-emerald-400/40' : 'border-rose-400/40'}" style="background:rgb(${h.displayUser.r},${h.displayUser.g},${h.displayUser.b})"></div>
                 </div>
               </div>
               ${!isCorrect ? `<div class="text-right text-[11px] mt-1 text-rose-400 font-bold tracking-wider">오차값: ${h.distance}</div>` : ''}
             </div>
           `;
        }

        return `
          <div class="bg-white border ${isCorrect ? 'border-emerald-100' : 'border-rose-100'} rounded-2xl p-4 mb-4 shadow-sm relative overflow-hidden">
             <div class="absolute top-0 left-0 bottom-0 w-1 ${isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}"></div>
             <div class="flex items-center justify-between mb-1 pl-2 border-b border-stone-100 pb-2">
               <div class="flex items-center gap-2">
                 ${icon}
                 <span class="font-bold text-stone-700 display-font">Stage ${i + 1}</span>
                 <span class="text-xs text-stone-500 font-medium ml-1">${h.type === 'sort' ? '색상 정렬' : 'RGB 매칭'}</span>
               </div>
               <span class="text-sm font-black ${isCorrect ? 'text-emerald-500' : 'text-stone-400'}">${h.scoreEarned}점</span>
             </div>
             <div class="pl-2">
               ${detailsHtml}
             </div>
          </div>
        `;
      }).join('');
    }

    modal.classList.remove('opacity-0', 'pointer-events-none');
    content.classList.remove('scale-95');
    content.classList.add('scale-100');
    modal.inert = false;
    modal.setAttribute('aria-hidden', 'false');
    content.querySelector('button').focus();
  };

  document.getElementById('record-modal').addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      window.closeRecordModal();
    } else if (event.key === 'Tab') {
      const modal = event.currentTarget;
      const focusable = [...modal.querySelectorAll('button, input, select, textarea, a[href], [tabindex]')]
        .filter(element => !element.disabled && element.tabIndex >= 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    }
  });
  if (storageError) alert(storageError);
}
