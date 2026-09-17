import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('https://**/*',route=>route.fulfill({status:200,body:''}));
  await page.goto('/MY-ColorVision/');
  await page.waitForFunction(()=>window.appLoaded);
});

test('an outgoing Play start cannot cancel a newer navigation during its animation',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>window.setMode('challenge'));
  await expect(page.locator('#start-challenge-btn')).toBeVisible();
  await page.evaluate(()=>{
    document.getElementById('nav-test').click();
    document.getElementById('start-challenge-btn').click();
  });
  await expect(page.locator('#start-btn')).toBeVisible();
  const state=await page.evaluate(async()=>{const{state}=await import('/MY-ColorVision/js/state.js');return {mode:state.mode,timer:state.timerId,deadline:state.challengeDeadline};});
  expect(state).toEqual({mode:'test',timer:null,deadline:null});
});

test('cursor and button spring handlers remain functional across modes',async({page})=>{
  await page.evaluate(()=>window.setMode('lab'));
  await expect(page.locator('#btn-sample-1')).toBeVisible();
  await expect(page.locator('#cursor-canvas')).toHaveCount(1);
  const button=page.locator('.glow-button').first();
  await button.dispatchEvent('mouseenter');
  await page.waitForTimeout(120);
  expect(await page.evaluate(()=>document.querySelectorAll('#cursor-canvas').length)).toBe(1);
});

test('custom cursor is disabled on mobile and touch events do not create cursor canvas', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await context.newPage();
  await mobilePage.route('https://**/*', route => route.fulfill({ status: 200, body: '' }));
  await mobilePage.goto('/MY-ColorVision/');
  await mobilePage.waitForFunction(() => window.appLoaded);

  expect(await mobilePage.locator('#cursor-canvas').count()).toBe(0);
  expect(await mobilePage.evaluate(() => document.documentElement.classList.contains('has-custom-cursor'))).toBe(false);

  await mobilePage.tap('body');
  await mobilePage.dispatchEvent('body', 'mousemove', { clientX: 150, clientY: 150 });
  await mobilePage.waitForTimeout(100);

  expect(await mobilePage.locator('#cursor-canvas').count()).toBe(0);
  expect(await mobilePage.evaluate(() => document.documentElement.classList.contains('has-custom-cursor'))).toBe(false);
  await context.close();
});


