import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule } from 'node:vm';

// Load the real browser ES modules without changing the package's CommonJS type.
const modules = new Map();
async function loadModule(url) {
  const key = url.href;
  if (modules.has(key)) return modules.get(key);
  const module = new SourceTextModule(await readFile(url, 'utf8'), { identifier: key });
  modules.set(key, module);
  await module.link((specifier, parent) => loadModule(new URL(specifier, parent.identifier)));
  return module;
}
const scoring = await loadModule(new URL('../js/utils/scoring.js', import.meta.url));
await scoring.evaluate();
const { gradeRgbMatch, gradeDisplayedRgb, toDisplayRgb, RGB_MATCH_THRESHOLD, SCORING_VERSION } = scoring.namespace;
const daltonize = modules.get(new URL('../js/utils/daltonize.js', import.meta.url).href).namespace;
const rgb = (r, g = 0, b = 0) => ({ r, g, b });

test('actual protan clipping collision is a full match in the displayed color space', () => {
  const filter = { type: 'protan', severity: 0.5, mode: 'correct', intensity: 1.0 };
  const grade = gradeRgbMatch(rgb(255, 0, 180), rgb(255, 0, 255), filter);
  assert.deepEqual(grade.displayCorrect, rgb(255, 28, 255));
  assert.deepEqual(grade.displayUser, rgb(255, 28, 255));
  assert.equal(grade.distance, 0);
  assert.equal(grade.isCorrect, true);
  assert.equal(grade.scoreEarned, 20);
  assert.equal(grade.scoringVersion, 2);
});

test('an in-flight transition is graded from the visible snapshot rather than its destination', () => {
  const target = Object.freeze(rgb(128, 128, 128));
  const visible = Object.freeze(rgb(128, 128, 128));
  const destination = rgb(0, 0, 0);
  const submitted = gradeDisplayedRgb(target, visible);
  assert.deepEqual(submitted.displayUser, visible);
  assert.equal(submitted.distance, 0);
  assert.equal(submitted.scoreEarned, 20);
  assert.equal(gradeRgbMatch(target, destination).scoreEarned, 0);
});

test('40 is exclusive and non-passing answers cannot receive 20 points', () => {
  assert.equal(RGB_MATCH_THRESHOLD, 40);
  assert.equal(SCORING_VERSION, 2);
  for (const distance of [0, 35, 39, 40, 41, 44, 119, 120, 121, 255]) {
    const grade = gradeRgbMatch(rgb(0), rgb(distance));
    assert.equal(grade.distance, distance);
    assert.equal(grade.isCorrect, distance < 40);
    assert.equal(grade.scoreEarned === 20, grade.isCorrect);
    assert.equal(grade.threshold, RGB_MATCH_THRESHOLD);
    assert.ok(grade.scoreEarned >= 0 && grade.scoreEarned <= 20);
    assert.ok(Number.isInteger(grade.scoreEarned));
  }
  assert.equal(gradeRgbMatch(rgb(0), rgb(40)).scoreEarned, 19);
  assert.equal(gradeRgbMatch(rgb(0), rgb(120)).scoreEarned, 0);
});

test('Euclidean distance uses all three displayed channels without rounding the pass decision', () => {
  assert.equal(gradeRgbMatch(rgb(0), rgb(23, 23, 23)).isCorrect, true);
  assert.equal(gradeRgbMatch(rgb(0), rgb(24, 23, 23)).isCorrect, false);
  assert.equal(gradeRgbMatch(rgb(0), rgb(3, 4, 0)).distance, 5);
  assert.equal(gradeRgbMatch(rgb(3, 4, 0), rgb(0)).distance, 5);
});

test('score never increases when displayed error increases', () => {
  let previous = 20;
  for (let channel = 0; channel <= 255; channel++) {
    const grade = gradeRgbMatch(rgb(0), rgb(channel, channel, channel));
    assert.ok(grade.scoreEarned <= previous, `distance ${grade.distance}`);
    assert.ok(grade.scoreEarned >= 0 && grade.scoreEarned <= 20);
    assert.equal(grade.scoreEarned === 20, grade.isCorrect);
    previous = grade.scoreEarned;
  }
});

test('rendering and grading share the existing filter result in every supported mode', () => {
  const types = ['default', 'protan', 'deutan', 'tritan', 'achromato', 'redgreen', 'redblue', 'greenblue'];
  const colors = [rgb(0), rgb(255, 255, 255), rgb(128, 128, 128), rgb(255, 0, 180), rgb(12, 204, 91)];
  for (const type of types) {
    for (const mode of ['simulate', 'correct']) {
      const filter = Object.freeze({ type, mode, severity: 0.5, intensity: 1.0 });
      for (const value of colors) {
        const color = Object.freeze({ ...value });
        const expected = daltonize.applyDaltonizeToColor(color.r, color.g, color.b, type, 0.5, mode, 1.0);
        const display = toDisplayRgb(color, filter);
        assert.deepEqual(Object.values(display), Array.from(expected));
        const grade = gradeRgbMatch(color, color, filter);
        assert.deepEqual(grade.displayCorrect, display);
        assert.deepEqual(grade.displayUser, display);
        assert.equal(grade.distance, 0);
        assert.equal(grade.scoreEarned, 20);
      }
    }
  }
});

test('display RGB channels are canonical integer values and invalid input is rejected', () => {
  assert.deepEqual(toDisplayRgb(rgb(-3, 300, 127.5)), rgb(0, 255, 128));
  assert.equal(gradeRgbMatch(rgb(-3, 300, 127.5), rgb(0, 255, 128)).distance, 0);
  assert.throws(() => gradeRgbMatch(rgb(NaN), rgb(0)), TypeError);
  assert.throws(() => toDisplayRgb(rgb(Infinity)), TypeError);
});
