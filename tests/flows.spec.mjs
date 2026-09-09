import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  // Exercise the local application even when its optional CDNs are unavailable.
  await page.route('https://**/*', route => route.fulfill({
    status: 200,
    contentType: route.request().resourceType() === 'stylesheet' ? 'text/css' : 'application/javascript',
    body: ''
  }));
  await page.goto('/MY-ColorVision/');
  await page.waitForFunction(() => window.appLoaded === true);
});

async function mode(page, name) {
  await page.evaluate(name => window.setMode(name), name);
  if (name === 'test') await expect(page.locator('#start-btn')).toBeVisible();
  if (name === 'challenge') await expect(page.locator('#start-challenge-btn')).toBeVisible();
}

async function seedTestStage(page, stage) {
  await mode(page, 'test');
  await page.evaluate(async stage => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    state.stageNumber = stage;
    state.tutorialShown = { 1: true, 4: true, 9: true };
    const { renderNextStage } = await import('/MY-ColorVision/app.js');
    renderNextStage();
  }, stage);
  const selector = stage <= 3 ? '#btn-box button' : stage <= 8 ? '#confirm-sort-btn' : '#match-btn';
  await expect(page.locator(selector).first()).toBeEnabled();
}

async function stateSnapshot(page) {
  return page.evaluate(async () => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    return JSON.parse(JSON.stringify(state));
  });
}

async function prepareCorrectAnswer(page, type) {
  const buttonIndex = await page.evaluate(async type => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    const data = await import('/MY-ColorVision/js/data.js');
    if (type === 'ishihara') {
      const answer = String(data.ishiharaData[state.stageNumber].answer);
      return [...document.querySelectorAll('#btn-box button')].findIndex(button => button.textContent.trim() === answer);
    }
    if (type === 'sort') {
      const title = document.querySelector('#app h2').textContent;
      const theme = Object.values(data.sortStageThemes).find(theme => theme.name === title);
      const box = document.getElementById('sort-box');
      theme.hues.forEach((hue, index) => {
        const current = box.querySelectorAll('.color-cube')[index];
        const desired = box.querySelector(`[data-hue="${hue}"]`);
        if (current !== desired) { current.click(); desired.click(); }
      });
    } else if (type === 'rgb') {
      // With the default filter, the shown target is the direct slider target.
      const target = getComputedStyle(document.querySelector('.color-swatch')).backgroundColor.match(/\d+/g).map(Number);
      ['r', 'g', 'b'].forEach((channel, index) => {
        const input = document.getElementById(`${channel}-slider`);
        input.value = target[index];
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
    return 0;
  }, type);
  if (type === 'rgb') {
    const target = await page.locator('.color-swatch').first().evaluate(swatch => getComputedStyle(swatch).backgroundColor);
    // A correct-answer fixture must wait until the visible transition has matched.
    await expect(page.locator('#user-mix')).toHaveCSS('background-color', target);
  }
  return buttonIndex;
}

async function answer(page, type) {
  const selector = type === 'ishihara' ? '#btn-box button' : type === 'sort' ? '#confirm-sort-btn' : '#match-btn';
  await expect(page.locator(selector).first()).toBeEnabled();
  const buttonIndex = await prepareCorrectAnswer(page, type);
  await page.locator(selector).nth(buttonIndex).click();
}

test('Test retains all 15 stages, tutorials, scoring and one history record per question', async ({ page }) => {
  await mode(page, 'test');
  for (let stage = 1; stage <= 15; stage++) {
    if ([1, 4, 9].includes(stage)) {
      await expect(page.locator('#start-btn')).toBeEnabled();
      await page.locator('#start-btn').click();
    }
    await answer(page, stage <= 3 ? 'ishihara' : stage <= 8 ? 'sort' : 'rgb');
    await expect.poll(async () => (await stateSnapshot(page)).userHistory.length).toBe(stage);
  }
  await expect(page.locator('#toggle-details-btn')).toBeVisible();
  const result = await stateSnapshot(page);
  expect(result.stageNumber).toBe(16);
  expect(result.score).toBe(15);
  expect(result.userHistory.map(entry => entry.stage)).toEqual(Array.from({ length: 15 }, (_, index) => index + 1));
  expect(result.userHistory.filter(entry => entry.type === 'ishihara')).toHaveLength(3);
  expect(result.userHistory.filter(entry => entry.type === 'sort')).toHaveLength(5);
  expect(result.userHistory.filter(entry => entry.type === 'rgb')).toHaveLength(7);
  expect(result.userHistory.every(entry => entry.isCorrect)).toBe(true);
});

test('tutorial and every answer handler reject same-turn duplicate submissions', async ({ page }) => {
  await mode(page, 'test');
  const tutorial = await page.evaluate(() => {
    const button = document.getElementById('start-btn');
    const submit = button.onclick;
    submit(); submit();
    return button.disabled;
  });
  expect(tutorial).toBe(true);
  await expect(page.locator('#btn-box button')).toHaveCount(3);
  expect((await stateSnapshot(page)).userHistory).toHaveLength(0);

  for (const [stage, type, selector] of [[1, 'ishihara', '#btn-box button'], [4, 'sort', '#confirm-sort-btn'], [9, 'rgb', '#match-btn']]) {
    await seedTestStage(page, stage);
    const buttonIndex = await prepareCorrectAnswer(page, type);
    const accepted = await page.evaluate(({ selector, buttonIndex }) => {
      const button = document.querySelectorAll(selector)[buttonIndex];
      const submit = button.onclick;
      submit(); submit(); submit();
      return button.disabled;
    }, { selector, buttonIndex });
    expect(accepted).toBe(true);
    const result = await stateSnapshot(page);
    expect(result.stageNumber).toBe(stage + 1);
    expect(result.userHistory).toHaveLength(1);
    expect(result.userHistory[0].stage).toBe(stage);
    expect(result.score).toBe(1);
  }
});

test('RGB swatches and grading keep the rendered filter when later state changes', async ({ page }) => {
  await mode(page, 'challenge');
  await page.evaluate(async () => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    const { renderRgbMatchStage } = await import('/MY-ColorVision/js/stages/rgbMatch.js');
    state.weakness = 'protan';
    state.challengeSequence = ['rgb', 'rgb', 'rgb', 'rgb', 'rgb'];
    // Reproduce the audited raw target (255, 0, 180) through the real generator.
    const random = Math.random;
    const values = [0.99, 0.999, 0, 0];
    Math.random = () => values.shift() ?? 0;
    try { renderRgbMatchStage(); } finally { Math.random = random; }
    state.weakness = 'default';
    ['r', 'g', 'b'].forEach((channel, index) => {
      const input = document.getElementById(`${channel}-slider`);
      input.value = [255, 0, 255][index];
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  await expect(page.getByLabel('R', { exact: true })).toHaveAttribute('id', 'r-slider');
  await expect(page.getByLabel('G', { exact: true })).toHaveAttribute('id', 'g-slider');
  await expect(page.getByLabel('B', { exact: true })).toHaveAttribute('id', 'b-slider');
  await expect(page.locator('.color-swatch').first()).toHaveCSS('background-color', 'rgb(255, 28, 255)');
  await expect(page.locator('#user-mix')).toHaveCSS('background-color', 'rgb(255, 28, 255)');
  await page.locator('#match-btn').click();
  const result = await stateSnapshot(page);
  expect(result.challengeHistory).toHaveLength(1);
  const entry = result.challengeHistory[0];
  expect(entry.correct).toEqual({ r: 255, g: 0, b: 180 });
  expect(entry.user).toEqual({ r: 255, g: 0, b: 255 });
  expect(entry.displayCorrect).toEqual(entry.displayUser);
  expect(entry.filter.type).toBe('protan');
  expect(entry.distance).toBe(0);
  expect(entry.isCorrect).toBe(true);
  expect(entry.scoreEarned).toBe(20);
  expect(entry.scoringVersion).toBe(2);
});

test('an immediate RGB submission records the visible transition color without changing its animation', async ({ page }) => {
  await seedTestStage(page, 9);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('#user-mix')).toHaveCSS('background-color', 'rgb(128, 128, 128)');
  await expect(page.locator('#user-mix')).toHaveCSS('transition-duration', '0.15s');
  const submitted = await page.evaluate(async () => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    const mix = document.getElementById('user-mix');
    const classes = mix.className;
    ['r', 'g', 'b'].forEach(channel => {
      const input = document.getElementById(`${channel}-slider`);
      input.value = 0;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const visible = getComputedStyle(mix).backgroundColor;
    document.getElementById('match-btn').onclick();
    return {
      visible,
      entry: state.userHistory[0],
      classesBefore: classes,
      classesAfter: mix.className,
      transitionDuration: getComputedStyle(mix).transitionDuration
    };
  });
  expect(submitted.visible).not.toBe('rgb(0, 0, 0)');
  const [r, g, b] = submitted.visible.match(/[\d.]+/g).map(Number);
  expect(submitted.entry.displayUser).toEqual({ r, g, b });
  expect(submitted.entry.user).toEqual({ r: 0, g: 0, b: 0 });
  expect(submitted.classesAfter).toBe(submitted.classesBefore);
  expect(submitted.transitionDuration).toBe('0.15s');
});

test('latest navigation wins and outgoing controls cannot mutate a new Test session', async ({ page }) => {
  await seedTestStage(page, 1);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.evaluate(() => {
    const oldSubmit = document.querySelector('#btn-box button').onclick;
    oldSubmit(); // Queues the outgoing question transition.
    window.setMode('lab');
    window.setMode('test');
    oldSubmit();
    window.__outgoingSubmit = oldSubmit;
  });
  await page.clock.runFor(1000);
  await expect(page.locator('#start-btn')).toBeVisible();
  await page.evaluate(() => window.__outgoingSubmit());
  const result = await stateSnapshot(page);
  expect(result.mode).toBe('test');
  expect(result.stageNumber).toBe(1);
  expect(result.userHistory).toHaveLength(0);
  expect(result.score).toBe(0);
  await expect(page.locator('#sort-box, #sliders-box')).toHaveCount(0);
});

test('sorting keeps tap behavior and supports keyboard reverse answers without Sortable', async ({ page }) => {
  await seedTestStage(page, 4);
  expect(await page.evaluate(() => typeof window.Sortable)).toBe('undefined');
  const cubes = page.locator('#sort-box .color-cube');
  await expect(cubes).toHaveCount(5);
  expect(await cubes.evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label'))))
    .toEqual(['1번 칸', '2번 칸', '3번 칸', '4번 칸', '5번 칸']);
  const original = await cubes.evaluateAll(nodes => nodes.map(node => Number(node.dataset.hue)));
  await cubes.first().focus();
  await page.keyboard.press('Enter');
  await expect(cubes.first()).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(cubes.first()).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  expect(await cubes.evaluateAll(nodes => nodes.map(node => Number(node.dataset.hue))))
    .toEqual([original[1], original[0], ...original.slice(2)]);
  await expect(cubes.first()).toBeFocused();
  await expect(page.locator('.selected-cube')).toHaveCount(0);

  const reversed = await page.evaluate(async () => {
    const { sortStageThemes } = await import('/MY-ColorVision/js/data.js');
    return [...sortStageThemes[4].hues].reverse();
  });
  for (let index = 0; index < reversed.length; index++) {
    const order = await cubes.evaluateAll(nodes => nodes.map(node => Number(node.dataset.hue)));
    const desiredIndex = order.indexOf(reversed[index]);
    if (desiredIndex === index) continue;
    await cubes.nth(index).focus();
    await page.keyboard.press('Enter');
    for (let step = index; step < desiredIndex; step++) await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
  }
  await page.locator('#confirm-sort-btn').click();
  const result = await stateSnapshot(page);
  expect(result.userHistory[0].user).toEqual(reversed);
  expect(result.userHistory[0].isCorrect).toBe(true);
  expect(result.score).toBe(1);
  await page.evaluate(() => window.setMode('lab'));
  await expect.poll(() => page.evaluate(() => window.cleanupColorSort === null)).toBe(true);
});

async function startChallenge(page) {
  await mode(page, 'challenge');
  await page.evaluate(() => {
    const start = document.getElementById('start-challenge-btn').onclick;
    start(); start();
  });
  await expect(page.locator('#timer-text')).toHaveText('03:00');
  const result = await stateSnapshot(page);
  expect(result.challengeSequence).toHaveLength(5);
  expect(result.challengeSequence).toContain('sort');
  expect(result.challengeSequence).toContain('rgb');
  expect(result.challengeTimeLeft).toBe(180);
  return result.challengeSequence;
}

test('Play keeps five questions, 180 seconds and a single completed result', async ({ page }) => {
  const sequence = await startChallenge(page);
  for (let index = 0; index < sequence.length; index++) {
    await answer(page, sequence[index]);
    await expect.poll(async () => (await stateSnapshot(page)).challengeHistory.length).toBe(index + 1);
  }
  await expect(page.locator('#save-record-btn')).toHaveCount(1);
  const result = await stateSnapshot(page);
  expect(result.stageNumber).toBe(6);
  expect(result.challengeHistory.map(entry => entry.stage)).toEqual([1, 2, 3, 4, 5]);
  expect(result.challengeTotalScore).toBe(100);
  expect(result.challengeScore).toBe(5);
  expect(result.timerId).toBe(null);
  await expect(page.locator('#challenge-timer')).toBeHidden();
});

test('countdown corrects elapsed time and expired controls cannot submit', async ({ page }) => {
  await startChallenge(page);
  await page.evaluate(async () => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    state.challengeDeadline = performance.now() + 25000;
  });
  await expect(page.locator('#timer-text')).toHaveText('00:25');
  await expect(page.locator('#timer-text')).toHaveClass(/text-rose-600/);
  await page.evaluate(async () => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    const submit = document.querySelector('#confirm-sort-btn, #match-btn').onclick;
    state.challengeDeadline = performance.now() - 1;
    submit(); submit();
    window.__expiredSubmit = submit;
  });
  await expect(page.locator('#save-record-btn')).toHaveCount(1);
  await page.evaluate(() => { window.__expiredSubmit(); window.__expiredSubmit(); });
  const result = await stateSnapshot(page);
  expect(result.challengeTimeLeft).toBe(0);
  expect(result.timerId).toBe(null);
  expect(result.challengeHistory).toHaveLength(0);
  expect(result.challengeTotalScore).toBe(0);
  await expect(page.locator('#save-record-btn')).toHaveCount(1);
});

test('last answer and timeout racing with a transition finish exactly once', async ({ page }) => {
  await page.clock.install();
  const sequence = await startChallenge(page);
  for (let index = 0; index < 4; index++) {
    await answer(page, sequence[index]);
    await expect.poll(async () => (await stateSnapshot(page)).challengeHistory.length).toBe(index + 1);
  }
  const type = sequence[4];
  await expect(page.locator(type === 'sort' ? '#confirm-sort-btn' : '#match-btn')).toBeEnabled();
  await prepareCorrectAnswer(page, type);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(async () => {
    const { state } = await import('/MY-ColorVision/js/state.js');
    window.__resultRenders = 0;
    new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1 && (node.id === 'save-record-btn' || node.querySelector('#save-record-btn'))) window.__resultRenders++;
        }
      }
    }).observe(document.getElementById('app'), { childList: true });
    state.challengeDeadline = performance.now() + 50;
    const submit = document.querySelector('#confirm-sort-btn, #match-btn').onclick;
    submit(); submit();
    window.__lastSubmit = submit;
  });
  await page.clock.runFor(1000);
  await expect(page.locator('#save-record-btn')).toHaveCount(1);
  await page.evaluate(() => window.__lastSubmit());
  const result = await stateSnapshot(page);
  expect(result.challengeHistory).toHaveLength(5);
  expect(result.challengeTotalScore).toBe(100);
  expect(result.challengeScore).toBe(5);
  expect(result.timerId).toBe(null);
  expect(await page.evaluate(() => window.__resultRenders)).toBe(1);
  await expect(page.locator('#save-record-btn')).toHaveCount(1);
});
