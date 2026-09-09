import { test, expect, devices } from '@playwright/test';
import { PNG } from 'pngjs';

const BASE_URL = 'http://127.0.0.1:4173/MY-ColorVision/';
function imageFile(width = 64, height = 32, color = [32, 150, 210]) {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data.set([...color, 255], i);
  }
  return { name: 'lab-fixture.png', mimeType: 'image/png', buffer: PNG.sync.write(png) };
}

async function openLab(page) {
  // External font/Sortable availability must not decide a Lab functional test.
  await page.route(/^https:\/\/(?:fonts\.|cdn\.)/, route => route.abort());
  await page.goto(BASE_URL);
  await page.evaluate(() => window.setMode('lab'));
  await expect(page.locator('#upload-area')).toBeVisible();
}

async function expectCanvas(page, width, height) {
  await expect(page.locator('#lab-interface')).toBeVisible();
  await expect(page.locator('#canvas-original')).toHaveAttribute('width', String(width));
  await expect(page.locator('#canvas-original')).toHaveAttribute('height', String(height));
  await expect(page.locator('#canvas-corrected')).toHaveAttribute('width', String(width));
  await expect(page.locator('#canvas-corrected')).toHaveAttribute('height', String(height));
}

async function rejectFile(page, file) {
  const message = new Promise(resolve => page.once('dialog', async dialog => {
    const text = dialog.message();
    await dialog.accept();
    resolve(text);
  }));
  await page.locator('#image-input').setInputFiles(file);
  return message;
}

test('Lab upload, both modes and intensity work from the keyboard with the same layout', async ({ page }) => {
  await openLab(page);
  const upload = page.locator('#upload-area');
  await expect(upload).toHaveAttribute('role', 'button');
  await upload.focus();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.keyboard.press('Enter');
  await (await chooserPromise).setFiles(imageFile());
  await expectCanvas(page, 64, 32);

  const correction = page.locator('#desktop-mode-cor-btn');
  await correction.focus();
  await page.keyboard.press('Space');
  await expect(correction).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#result-label')).toHaveText('Daltonized');
  const simulation = page.locator('#desktop-mode-sim-btn');
  await simulation.focus();
  await page.keyboard.press('Enter');
  await expect(simulation).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#result-label')).toHaveText('Simulation');

  const slider = page.locator('#desktop-intensity-slider');
  await expect(slider).toHaveAccessibleName('적용 강도');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('1.01');
  await expect(page.locator('#desktop-intensity-val')).toHaveText('1.01x');
});

test('a tall upload is bounded on both axes while preserving aspect ratio', async ({ page }) => {
  await openLab(page);
  await page.locator('#image-input').setInputFiles(imageFile(100, 4000));
  await expectCanvas(page, 30, 1200);
  const stats = await page.locator('#canvas-original').evaluate(canvas => ({
    pixels: canvas.width * canvas.height,
    color: Array.from(canvas.getContext('2d').getImageData(0, 0, 1, 1).data)
  }));
  expect(stats.pixels).toBeLessThanOrEqual(1200 * 1200);
  expect(stats.color).toEqual([32, 150, 210, 255]);
});

test('unsupported and corrupt uploads explain the error and allow recovery', async ({ page }) => {
  await openLab(page);
  expect(await rejectFile(page, { name: 'not-image.txt', mimeType: 'text/plain', buffer: Buffer.from('plain text') }))
    .toContain('지원하는 이미지');
  await expect(page.locator('#upload-area')).toBeVisible();
  expect(await rejectFile(page, { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('broken PNG bytes') }))
    .toContain('손상되었거나');
  await expect(page.locator('#upload-area')).toBeVisible();
  await page.locator('#image-input').setInputFiles(imageFile());
  await expectCanvas(page, 64, 32);
  // Same-file selection must also work after the input value is cleared.
  await page.locator('#image-input').setInputFiles(imageFile(48, 24));
  await expectCanvas(page, 48, 24);
});

test('a newer upload wins over an older sample response', async ({ page }) => {
  await openLab(page);
  let heldRoute;
  const requestHeld = new Promise(resolve => {
    page.route('**/images/plate1.png', route => { heldRoute = route; resolve(); });
  });
  await page.locator('#btn-sample-1').click();
  await requestHeld;
  await page.locator('#image-input').setInputFiles(imageFile(64, 32));
  await expectCanvas(page, 64, 32);
  await heldRoute.fulfill({ contentType: 'image/png', body: imageFile(16, 16).buffer });
  await page.waitForLoadState('networkidle');
  await expectCanvas(page, 64, 32);
});

test('leaving Lab invalidates its pending image before a new Lab instance is mounted', async ({ page }) => {
  await openLab(page);
  let heldRoute;
  const requestHeld = new Promise(resolve => {
    page.route('**/images/plate1.png', route => { heldRoute = route; resolve(); });
  });
  await page.locator('#btn-sample-1').click();
  await requestHeld;
  await page.locator('#nav-home').click();
  await expect(page.locator('#canvas-original')).toHaveCount(0);
  await page.evaluate(() => window.setMode('lab'));
  await expect(page.locator('#upload-area')).toBeVisible();
  await heldRoute.fulfill({ contentType: 'image/png', body: imageFile(16, 16).buffer });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#upload-area')).toBeVisible();
  await expect(page.locator('#lab-interface')).toBeHidden();
  await page.locator('#image-input').setInputFiles(imageFile(80, 40));
  await expectCanvas(page, 80, 40);
});

test('touch/mobile RGB cycles and combinations retain their original behavior and dock cleans up', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await openLab(page);
    expect(await page.evaluate(() => ({
      coarse: matchMedia('(pointer: coarse)').matches,
      noHover: matchMedia('(hover: none)').matches,
      touch: navigator.maxTouchPoints > 0
    }))).toEqual({ coarse: true, noHover: true, touch: true });
    await page.locator('#image-input').setInputFiles(imageFile());
    const fab = page.locator('#mobile-control-fab');
    await expect(fab).toBeVisible();
    await fab.tap();
    await expect(fab).toHaveAttribute('aria-expanded', 'true');
    const red = page.locator('#dock-btn-r'), green = page.locator('#dock-btn-g'), blue = page.locator('#dock-btn-b');
    const status = page.locator('#mobile-dock-status');
    await red.tap();
    await expect(status).toHaveText('적색약');
    await red.tap();
    await expect(status).toHaveText('적색맹');
    await red.tap();
    await expect(status).toHaveText('정상');
    await expect(red).toHaveAttribute('aria-pressed', 'false');
    await red.tap();
    await green.tap();
    await expect(status).toHaveText('복합(적녹)');
    await blue.tap();
    await expect(status).toHaveText('전색맹');
    await red.tap();
    await expect(status).toHaveText('복합(녹청)');
    await page.locator('#dock-btn-reset').tap();
    await expect(status).toHaveText('정상');
    await page.locator('#mobile-intensity-toggle-btn').tap();
    await expect(page.locator('#mobile-slider-panel')).toBeVisible();
    await expect(page.locator('#mobile-slider-panel input')).toHaveAccessibleName('적용 강도');
    await page.locator('#mobile-dock-close').tap();
    await expect(fab).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#mobile-control-dock')).toBeHidden();
    await expect(page.locator('#mobile-control-dock')).toHaveJSProperty('inert', true);
    await fab.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#mobile-mode-sim-btn')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(fab).toBeFocused();
    await page.locator('#nav-home').click();
    await expect(page.locator('#mobile-control-fab')).toHaveCount(0);
    await expect(page.locator('#mobile-control-dock')).toHaveCount(0);
  } finally {
    await context.close();
  }
});
