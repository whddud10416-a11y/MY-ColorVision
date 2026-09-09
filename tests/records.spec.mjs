import { test, expect } from '@playwright/test';

const rgbHistory = { type: 'rgb', stage: 1, isCorrect: true, scoreEarned: 20,
  correct: { r: 255, g: 0, b: 180 }, user: { r: 255, g: 0, b: 255 },
  displayCorrect: { r: 255, g: 28, b: 255 }, displayUser: { r: 255, g: 28, b: 255 },
  distance: 0, threshold: 40, scoringVersion: 2 };
const record = (overrides = {}) => ({ name: '기록', score: 20, timeUsed: 60,
  date: '2026-09-10T00:00:00.000Z', scoringVersion: 2, history: [rgbHistory], ...overrides });

async function openChallenge(page, raw = null) {
  if (raw !== null) await page.addInitScript(value => localStorage.setItem('colorLeaderboard', value), raw);
  await page.goto('./');
  await page.waitForFunction(() => window.appLoaded && typeof window.setMode === 'function');
  await page.evaluate(() => window.setMode('challenge'));
  await expect(page.locator('#start-challenge-btn')).toBeVisible();
}

async function renderChallengeResult(page) {
  await page.evaluate(async history => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    const { renderFinalScore } = await import('/MY-ColorVision/js/stages/results.js');
    Object.assign(state, { mode: 'challenge', stageNumber: 6, challengeTotalScore: 20,
      challengeTimeLeft: 120, challengeHistory: [history] });
    renderFinalScore();
  }, rgbHistory);
  await expect(page.locator('#save-record-btn')).toBeVisible();
}

test('untrusted nickname stays text in the table and modal; malformed history is excluded without rewriting storage', async ({ page }) => {
  const payload = '<img src=x onerror="window.__recordXss=1">';
  const raw = JSON.stringify([record({ name: payload, history: [rgbHistory,
    { ...rgbHistory, correct: { r: '0);color:red', g: 0, b: 0 } }] })]);
  await openChallenge(page, raw);
  await expect(page.locator('[data-record-name="0"]')).toHaveText(`${payload} · v2`);
  await expect(page.locator('[data-record-row] img')).toHaveCount(0);
  await page.locator('[data-record-row="0"]').click();
  await expect(page.locator('#modal-title span')).toHaveText(payload);
  await expect(page.locator('#modal-title img')).toHaveCount(0);
  await expect(page.locator('#modal-body > div')).toHaveCount(1);
  const colors = await page.locator('#modal-body [style*="background:rgb"]').evaluateAll(elements => elements.map(element => getComputedStyle(element).backgroundColor));
  expect(colors).toEqual(['rgb(255, 28, 255)', 'rgb(255, 28, 255)']);
  expect(await page.evaluate(() => window.__recordXss)).toBeUndefined();
  expect(await page.evaluate(() => localStorage.getItem('colorLeaderboard'))).toBe(raw);
});

test('record rows and modal work with Enter, Tab, Shift+Tab and Escape focus restoration', async ({ page }) => {
  await openChallenge(page, JSON.stringify([record()]));
  const row = page.locator('[data-record-row="0"]');
  const close = page.getByRole('button', { name: '기록 닫기' });
  await row.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#record-modal')).toHaveAttribute('aria-hidden', 'false');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#modal-body')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#modal-body')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#record-modal')).toHaveAttribute('aria-hidden', 'true');
  await expect(row).toBeFocused();
});

test('invalid JSON reports a recoverable error and remains unchanged when saving is attempted', async ({ page }) => {
  const dialogs = [];
  page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.accept(); });
  await openChallenge(page, '{broken original');
  expect(dialogs.some(message => message.includes('원본 기록은 유지'))).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('colorLeaderboard'))).toBe('{broken original');
  await renderChallengeResult(page);
  await page.locator('#leaderboard-name').fill('재시도');
  await page.locator('#save-record-btn').click();
  await expect(page.locator('#save-record-btn')).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('colorLeaderboard'))).toBe('{broken original');
  expect(dialogs).toHaveLength(2);
});

test('saving twice adds one v2 record and retains legacy records without details', async ({ page }) => {
  const legacy = record({ name: '이전', score: 100, history: undefined, scoringVersion: undefined });
  await openChallenge(page, JSON.stringify([legacy]));
  await expect(page.locator('[data-record-name="0"]')).toHaveText('이전 · v1');
  await renderChallengeResult(page);
  await page.locator('#leaderboard-name').fill('한 번');
  await page.locator('#save-record-btn').evaluate(button => { button.click(); button.click(); });
  await expect(page.locator('#start-challenge-btn')).toBeVisible();
  const entries = await page.evaluate(() => JSON.parse(localStorage.getItem('colorLeaderboard')));
  expect(entries).toHaveLength(2);
  expect(entries[0]).toEqual(JSON.parse(JSON.stringify(legacy)));
  expect(entries[1].name).toBe('한 번');
  expect(entries[1].scoringVersion).toBe(2);
  await expect(page.locator('[data-record-name="0"]')).toHaveText('한 번 · v2');
  await expect(page.locator('[data-record-name="1"]')).toHaveText('이전 · v1');
  const ranks = await page.locator('tbody tr td:first-child').allTextContents();
  expect(ranks).toEqual(['🥇 1', '🥇 1']);
});

test('write failure leaves the original record intact, re-enables save and permits retry', async ({ page }) => {
  const raw = JSON.stringify([record({ name: '보존' })]);
  const dialogs = [];
  page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.accept(); });
  await openChallenge(page, raw);
  await renderChallengeResult(page);
  await page.evaluate(() => {
    window.originalRecordSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  });
  await page.locator('#leaderboard-name').fill('다시');
  await page.locator('#save-record-btn').click();
  await expect(page.locator('#save-record-btn')).toBeEnabled();
  expect(dialogs[0]).toContain('저장하지 못했습니다');
  expect(await page.evaluate(() => localStorage.getItem('colorLeaderboard'))).toBe(raw);
  await page.evaluate(() => { Storage.prototype.setItem = window.originalRecordSetItem; });
  await page.locator('#save-record-btn').click();
  await expect(page.locator('#start-challenge-btn')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('colorLeaderboard')).length)).toBe(2);
});

test('test results summarize task performance without inferring a clinical type, including after retry', async ({ page }) => {
  await openChallenge(page);
  await page.evaluate(async () => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    const { renderFinalScore } = await import('/MY-ColorVision/js/stages/results.js');
    Object.assign(state, { mode: 'test', score: 0, stageNumber: 16, weakness: 'default', userHistory: [{
      type: 'rgb', stage: 9, isCorrect: false, scoreEarned: 0,
      correct: { r: 255, g: 0, b: 0 }, user: { r: 0, g: 0, b: 0 }, distance: 255, threshold: 40
    }] });
    renderFinalScore();
  });
  await expect(page.locator('#app')).toContainText('15문항 중 0문항');
  await expect(page.locator('#app')).not.toContainText(/정상 \(Normal\)|심각한|Protan|성향이 의심/);
  expect(await page.evaluate(async () => (await import('/MY-ColorVision/js/state.js')).state.weakness)).toBe('default');
  await page.getByRole('button', { name: '다시 검사', exact: true }).click();
  await page.waitForFunction(async () => (await import('/MY-ColorVision/js/state.js')).state.stageNumber === 1);
  await page.evaluate(async () => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    const { renderFinalScore } = await import('/MY-ColorVision/js/stages/results.js');
    Object.assign(state, { score: 15, stageNumber: 16, userHistory: [
      ...Array.from({ length: 3 }, (_, index) => ({ type: 'ishihara', stage: index + 1, correct: 12, user: 12, isCorrect: true })),
      ...Array.from({ length: 5 }, (_, index) => ({ type: 'sort', stage: index + 4, correct: [0, 30], user: [0, 30], isCorrect: true })),
      ...Array.from({ length: 7 }, (_, index) => ({ type: 'rgb', stage: index + 9, correct: { r: 0, g: 0, b: 0 }, user: { r: 0, g: 0, b: 0 }, distance: 0, isCorrect: true }))
    ] });
    renderFinalScore();
  });
  await expect(page.locator('#app')).toContainText('숫자 판독 3/3 · 색상 정렬 5/5 · RGB 매칭 7/7');
  await expect(page.locator('#app')).not.toContainText(/정상 \(Normal\)|심각한|Protan|성향이 의심/);
  await page.getByRole('button', { name: '색상 보정 실험실 가기' }).click();
  await page.waitForFunction(async () => (await import('/MY-ColorVision/js/state.js')).state.mode === 'lab');
  expect(await page.evaluate(async () => (await import('/MY-ColorVision/js/state.js')).state.weakness)).toBe('default');
});
