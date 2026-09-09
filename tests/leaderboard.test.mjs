import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The source is a browser module; keep package.json's CommonJS setting intact.
const source = await readFile(new URL('../js/utils/leaderboard.js', import.meta.url), 'utf8');
const { sanitizeHistory, readLeaderboard, rankLeaderboard, saveLeaderboardRecord, deleteLeaderboardRecord } =
  await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

function memoryStorage(raw = null) {
  return {
    raw, writes: 0,
    getItem() { return this.raw; },
    setItem(_key, value) { this.writes++; this.raw = value; }
  };
}
const rgbHistory = (overrides = {}) => ({ type: 'rgb', stage: 1, isCorrect: true,
  correct: { r: 255, g: 0, b: 180 }, user: { r: 255, g: 0, b: 255 },
  displayCorrect: { r: 255, g: 28, b: 255 }, displayUser: { r: 255, g: 28, b: 255 },
  distance: 0, threshold: 40, scoreEarned: 20, ...overrides });
const record = (overrides = {}) => ({ name: '플레이어', score: 20, timeUsed: 60,
  date: '2026-09-10T00:00:00.000Z', scoringVersion: 2, history: [rgbHistory()], ...overrides });

test('empty storage is readable and reading never writes', () => {
  const storage = memoryStorage();
  assert.deepEqual(readLeaderboard(storage), { entries: [], error: null });
  assert.equal(storage.raw, null);
  assert.equal(storage.writes, 0);
});

test('malformed JSON and wrong root types remain byte-for-byte unchanged on read/save/delete', () => {
  for (const raw of ['{broken', '', 'null', '{}', '42', '"records"']) {
    const storage = memoryStorage(raw);
    assert.ok(readLeaderboard(storage).error);
    assert.ok(saveLeaderboardRecord(record(), storage).error);
    assert.ok(deleteLeaderboardRecord({}, storage).error);
    assert.equal(storage.raw, raw);
    assert.equal(storage.writes, 0);
  }
});

test('invalid base fields are excluded from display, while valid records survive mixed data', () => {
  const invalid = [null, 12, {}, record({ score: 101 }), record({ score: '20' }),
    record({ score: NaN }), record({ timeUsed: -1 }), record({ timeUsed: 181 }),
    record({ timeUsed: 1.5 }), record({ name: '' }), record({ name: {} }),
    record({ date: 'not-a-date' }), record({ scoringVersion: 0 })];
  const storage = memoryStorage(JSON.stringify([record(), ...invalid]));
  const original = storage.raw;
  const { entries, error } = readLeaderboard(storage);
  assert.equal(error, null);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].name, '플레이어');
  assert.equal(storage.raw, original);
  assert.equal(storage.writes, 0);
});

test('legacy no-history records remain visible as v1, with independent version ranks', () => {
  const legacy = record({ name: '이전', score: 100 });
  delete legacy.history;
  delete legacy.scoringVersion;
  const storage = memoryStorage(JSON.stringify([legacy, record({ score: 20 }), record({ score: 80 })]));
  const ranked = rankLeaderboard(readLeaderboard(storage).entries);
  assert.deepEqual(ranked.map(item => [item.scoringVersion, item.score, item.rank]), [[2, 80, 1], [2, 20, 2], [1, 100, 1]]);
  assert.deepEqual(ranked[2].history, []);
  assert.equal(storage.writes, 0);
});

test('saving preserves every old or damaged raw item instead of silently migrating or deleting it', () => {
  const old = record({ score: 99, history: undefined, scoringVersion: undefined });
  const damaged = { name: '남길 원본', history: 'broken', otherData: { future: true } };
  const originalItems = JSON.parse(JSON.stringify([old, null, damaged]));
  const storage = memoryStorage(JSON.stringify(originalItems));
  assert.equal(saveLeaderboardRecord(record({ name: '새 기록' }), storage).error, null);
  const items = JSON.parse(storage.raw);
  assert.deepEqual(items.slice(0, 3), originalItems);
  assert.equal(items[3].scoringVersion, 2);
  assert.equal(items[0].score, 99);
});

test('nicknames remain plain text data, and nested HTML/CSS payloads cannot enter rendered history', () => {
  const payload = '<img src=x onerror=alert(1)>';
  const malicious = [rgbHistory({ correct: { r: '0);color:red', g: 0, b: 0 } }),
    rgbHistory({ distance: '<img>' }), rgbHistory({ isCorrect: 'false' }),
    { type: 'sort', stage: 2, isCorrect: false, correct: ['0);color:red', 30], user: [0, 30] },
    { type: 'ishihara', stage: '<img>', correct: 12, user: 12, isCorrect: true }];
  const storage = memoryStorage(JSON.stringify([record({ name: payload, history: [rgbHistory(), ...malicious] })]));
  const entry = readLeaderboard(storage).entries[0];
  assert.equal(entry.name, payload);
  assert.equal(entry.history.length, 1);
  assert.ok(Object.values(entry.history[0].correct).every(Number.isFinite));
});

test('history validates arrays and retains displayed colors separately from raw inputs', () => {
  for (const value of [null, {}, 3, 'history']) assert.deepEqual(sanitizeHistory(value), []);
  const [color] = sanitizeHistory([rgbHistory()]);
  assert.deepEqual(color.displayCorrect, color.displayUser);
  assert.notDeepEqual(color.correct, color.user);
  const [legacyColor] = sanitizeHistory([rgbHistory({ displayCorrect: undefined, displayUser: undefined })]);
  assert.deepEqual(legacyColor.displayCorrect, legacyColor.correct);
  assert.deepEqual(legacyColor.displayUser, legacyColor.user);
  assert.equal(sanitizeHistory([rgbHistory({ user: { r: 0, g: Infinity, b: 0 } })]).length, 0);
  const sort = { type: 'sort', stage: 2, isCorrect: false, correct: [0, 30], user: [30, 0], scoreEarned: 4 };
  assert.equal(sanitizeHistory([sort]).length, 1);
  assert.equal(sanitizeHistory([{ ...sort, user: [30] }]).length, 0);
  assert.equal(sanitizeHistory(Array(30).fill(rgbHistory())).length, 15);
});

test('storage getter/read failures and write failures return recoverable errors', () => {
  const inaccessible = { getItem() { throw new Error('SecurityError'); } };
  assert.ok(readLeaderboard(inaccessible).error);
  assert.ok(saveLeaderboardRecord(record(), inaccessible).error);
  const storage = memoryStorage(JSON.stringify([record()]));
  const original = storage.raw;
  const entry = readLeaderboard(storage).entries[0];
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.ok(saveLeaderboardRecord(record(), storage).error);
  assert.ok(deleteLeaderboardRecord(entry, storage).error);
  assert.equal(storage.raw, original);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
  try { assert.ok(readLeaderboard().error); }
  finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('deletion requires the same source record and preserves unrelated malformed entries', () => {
  const damaged = { untouched: '<img>' };
  const storage = memoryStorage(JSON.stringify([damaged, record()]));
  const entry = readLeaderboard(storage).entries[0];
  assert.equal(deleteLeaderboardRecord(entry, storage).error, null);
  assert.deepEqual(JSON.parse(storage.raw), [damaged]);
  storage.raw = JSON.stringify([damaged, record({ score: 40 })]);
  const before = storage.raw;
  assert.ok(deleteLeaderboardRecord(entry, storage).error);
  assert.equal(storage.raw, before);
});

test('record limits and invalid new names reject writes without deleting older records', () => {
  const storage = memoryStorage(JSON.stringify(Array(1000).fill(record())));
  const original = storage.raw;
  assert.ok(saveLeaderboardRecord(record(), storage).error);
  assert.equal(storage.raw, original);
  const empty = memoryStorage();
  assert.ok(saveLeaderboardRecord(record({ name: '12345678901' }), empty).error);
  assert.ok(saveLeaderboardRecord(record({ name: '   ' }), empty).error);
  assert.equal(empty.raw, null);
});
