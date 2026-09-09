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

