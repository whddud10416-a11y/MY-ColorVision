import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContext, SourceTextModule } from 'node:vm';

async function fixture() {
  const images = [], alerts = [], revoked = [], frames = new Map();
  let nextUrl = 0, nextFrame = 0;
  class MockImage {
    constructor() { this.width = 640; this.height = 480; images.push(this); }
  }
  const context = createContext({
    Image: MockImage,
    URL: { createObjectURL: () => `blob:test-${++nextUrl}`, revokeObjectURL: url => revoked.push(url) },
    alert: message => alerts.push(message),
    requestAnimationFrame: callback => { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id)
  });
  const modules = new Map();
  async function load(url) {
    if (modules.has(url.href)) return modules.get(url.href);
    const module = new SourceTextModule(await readFile(url, 'utf8'), { identifier: url.href, context });
    modules.set(url.href, module);
    await module.link((specifier, parent) => load(new URL(specifier, parent.identifier)));
    return module;
  }
  const module = await load(new URL('../js/stages/colorLabCore.js', import.meta.url));
  await module.evaluate();
  const core = new module.namespace.ColorLabCore();
  const ready = [];
  core.onImageReady = (image, callback) => { ready.push(image.src); callback?.(); };
  const helpers = modules.get(new URL('../js/utils/imageInput.js', import.meta.url).href).namespace;
  return { core, helpers, images, alerts, revoked, ready, frames };
}

test('small images retain size while either long axis is bounded without stretching', async () => {
  const { helpers: { boundedImageSize } } = await fixture();
  for (const [width, height, expected] of [
    [400, 300, [400, 300]], [6000, 4000, [1200, 800]],
    [400, 12000, [40, 1200]], [12000, 400, [1200, 40]],
    [1200, 1200, [1200, 1200]], [1, 32768, [1, 1200]]
  ]) {
    const size = boundedImageSize(width, height);
    assert.deepEqual([size.width, size.height], expected);
    assert.ok(size.width * size.height <= 1200 * 1200);
  }
});

test('invalid dimensions, excessive source axes and pixel counts fail before canvas allocation', async () => {
  const { helpers: { boundedImageSize }, core } = await fixture();
  for (const pair of [[0, 1], [1, NaN], [Infinity, 10], [-1, 5], [1.5, 4], [32769, 1], [8193, 8192]]) {
    assert.throws(() => boundedImageSize(...pair));
  }
  const writes = [];
  const canvas = new Proxy({}, { set: (target, key, value) => { writes.push([key, value]); target[key] = value; return true; } });
  core.canvasOrig = core.canvasCorr = canvas;
  core.ctxOrig = { drawImage() { writes.push('draw'); } };
  assert.throws(() => core.setupCanvases({ width: 32769, height: 1 }));
  assert.deepEqual(writes, []);
});

test('supported nonempty files up to 20 MiB are accepted; unsupported and oversized input does not decode', async () => {
  const { helpers: { validateImageFile, IMAGE_LIMITS }, core, images, alerts } = await fixture();
  for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']) {
    validateImageFile({ type, size: IMAGE_LIMITS.fileBytes });
  }
  for (const file of [null, { type: 'image/svg+xml', size: 50 }, { type: 'text/plain', size: 50 },
    { type: 'image/png', size: 0 }, { type: 'image/png', size: IMAGE_LIMITS.fileBytes + 1 }]) core.handleFile(file);
  assert.equal(images.length, 0);
  assert.equal(alerts.length, 5);
});

test('a later sample wins over an already pending file even if the stale decode callback is queued', async () => {
  const { core, images, ready, revoked } = await fixture();
  core.handleFile({ type: 'image/png', size: 100 });
  const staleLoad = images[0].onload;
  core.loadSampleImage('images/plate1.png');
  staleLoad();
  images[1].onload();
  assert.deepEqual(ready, ['images/plate1.png']);
  assert.deepEqual(revoked, ['blob:test-1']);
});

test('a later file wins over a pending sample and releases its object URL exactly once', async () => {
  const { core, images, ready, revoked } = await fixture();
  core.loadSampleImage('images/plate1.png');
  const staleLoad = images[0].onload;
  core.handleFile({ type: 'image/png', size: 100 });
  images[1].onload();
  staleLoad();
  core.dispose();
  assert.deepEqual(ready, ['blob:test-1']);
  assert.deepEqual(revoked, ['blob:test-1']);
});

test('invalid newer input cancels the old decode and keeps its stale error silent', async () => {
  const { core, images, ready, alerts } = await fixture();
  core.loadSampleImage('images/plate1.png');
  const staleLoad = images[0].onload, staleError = images[0].onerror;
  core.handleFile({ type: 'text/plain', size: 100 });
  staleLoad();
  staleError();
  assert.equal(ready.length, 0);
  assert.equal(alerts.length, 1);
});

test('corrupt input releases resources and a subsequent valid image still loads', async () => {
  const { core, images, alerts, ready, revoked } = await fixture();
  core.handleFile({ type: 'image/png', size: 100 });
  images[0].onerror();
  core.loadSampleImage('images/plate2.png');
  images[1].onload();
  assert.equal(alerts.length, 1);
  assert.deepEqual(revoked, ['blob:test-1']);
  assert.deepEqual(ready, ['images/plate2.png']);
});

test('oversized decoded image is rejected before committing the Lab interface', async () => {
  const { core, images, alerts, ready, revoked } = await fixture();
  core.handleFile({ type: 'image/png', size: 100 });
  images[0].width = images[0].height = 10000;
  images[0].onload();
  assert.equal(alerts.length, 1);
  assert.equal(ready.length, 0);
  assert.deepEqual(revoked, ['blob:test-1']);
});

test('dispose cancels decode, animation frames and subscribers; queued callbacks cannot affect the next screen', async () => {
  const { core, images, alerts, ready, revoked, frames } = await fixture();
  let notifications = 0, completions = 0;
  core.subscribe(() => notifications++);
  core.setIntensity(1.1);
  assert.equal(frames.size, 1);
  core.handleFile({ type: 'image/png', size: 100 }, () => completions++);
  const staleLoad = images[0].onload, staleError = images[0].onerror;
  core.dispose();
  core.dispose();
  staleLoad();
  staleError();
  core.loadSampleImage('images/plate1.png');
  core.setIntensity(1.2);
  core.notify();
  assert.equal(frames.size, 0);
  assert.equal(core.listeners.size, 0);
  assert.equal(images.length, 1);
  assert.equal(notifications, 1);
  assert.equal(completions, 0);
  assert.equal(alerts.length, 0);
  assert.equal(ready.length, 0);
  assert.deepEqual(revoked, ['blob:test-1']);
});
