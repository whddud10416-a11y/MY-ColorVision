import { state } from '../state.js';

let sessionId = 0;
let finished = false;

// Invalidate outgoing controls immediately, before the navigation animation.
export function beginSession() {
  sessionId++;
  finished = false;
  state.challengeDeadline = null;
  return sessionId;
}

export function currentSession() { return sessionId; }

export function finishSession() {
  if (finished) return false;
  finished = true;
  return true;
}

export function createSubmissionGuard() {
  const id = sessionId;
  const mode = state.mode;
  const stage = state.stageNumber;
  let submitted = false;
  return () => {
    if (submitted || finished || id !== sessionId || state.mode !== mode || state.stageNumber !== stage) return false;
    if (mode === 'challenge' && state.challengeDeadline !== null && performance.now() >= state.challengeDeadline) return false;
    submitted = true;
    return true;
  };
}

export function remainingSeconds(deadline, now = performance.now()) {
  return Math.max(0, Math.min(180, Math.ceil((deadline - now) / 1000)));
}
