const STORAGE_KEY = 'colorLeaderboard';
const MAX_RECORDS = 1000;
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const inRange = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const integerInRange = (value, min, max) => Number.isInteger(value) && inRange(value, min, max);
const validRgb = value => isObject(value) && ['r', 'g', 'b'].every(channel => integerInRange(value[channel], 0, 255));
const copyRgb = value => ({ r: value.r, g: value.g, b: value.b });
const validHues = value => Array.isArray(value) && value.length >= 2 && value.length <= 10 && value.every(hue => inRange(hue, 0, 360));

// Stored records are untrusted. Return only the fields that the result UI needs.
export function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(0, 15).flatMap(item => {
    if (!isObject(item) || !integerInRange(item.stage, 1, 15) || typeof item.isCorrect !== 'boolean') return [];
    const clean = { type: item.type, stage: item.stage, isCorrect: item.isCorrect,
      scoreEarned: integerInRange(item.scoreEarned, 0, 20) ? item.scoreEarned : 0 };
    if (item.type === 'sort') {
      if (!validHues(item.correct) || !validHues(item.user) || item.correct.length !== item.user.length) return [];
      return [{ ...clean, correct: [...item.correct], user: [...item.user], themeName: typeof item.themeName === 'string' ? item.themeName.slice(0, 80) : '색상 정렬' }];
    }
    if (item.type === 'rgb') {
      if (!validRgb(item.correct) || !validRgb(item.user) || !inRange(item.distance, 0, 442)) return [];
      return [{ ...clean, correct: copyRgb(item.correct), user: copyRgb(item.user), distance: item.distance,
        threshold: inRange(item.threshold, 1, 442) ? item.threshold : 40,
        displayCorrect: copyRgb(validRgb(item.displayCorrect) ? item.displayCorrect : item.correct),
        displayUser: copyRgb(validRgb(item.displayUser) ? item.displayUser : item.user) }];
    }
    if (item.type === 'ishihara') {
      if (!integerInRange(item.correct, 0, 999) || !(integerInRange(item.user, 0, 999) || item.user === null)) return [];
      return [{ ...clean, correct: item.correct, user: item.user }];
    }
    return [];
  });
}

function normalizeEntry(entry, sourceIndex) {
  if (!isObject(entry) || typeof entry.name !== 'string' || !entry.name.trim() ||
      !integerInRange(entry.score, 0, 100) || !integerInRange(entry.timeUsed, 0, 180) ||
      typeof entry.date !== 'string' || entry.date.length > 40 || !Number.isFinite(Date.parse(entry.date))) return null;
  const scoringVersion = entry.scoringVersion === undefined ? 1 : entry.scoringVersion;
  if (!integerInRange(scoringVersion, 1, 10000)) return null;
  return { name: entry.name.slice(0, 80), score: entry.score, timeUsed: entry.timeUsed, date: entry.date,
    scoringVersion, history: sanitizeHistory(entry.history), sourceIndex, sourceFingerprint: JSON.stringify(entry) };
}

function readStorage(storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    const raw = target.getItem(STORAGE_KEY);
    const items = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(items)) return { error: '저장된 기록 형식을 읽을 수 없습니다. 원본 기록은 유지됩니다.' };
    return { storage: target, items };
  } catch {
    return { error: '기록을 읽을 수 없습니다. 브라우저 저장 설정을 확인해주세요. 원본 기록은 유지됩니다.' };
  }
}

export function readLeaderboard(storage) {
  const result = readStorage(storage);
  if (result.error) return { entries: [], error: result.error };
  return { entries: result.items.slice(0, MAX_RECORDS).map(normalizeEntry).filter(Boolean),
    error: result.items.length > MAX_RECORDS ? '기록이 너무 많아 처음 1,000개만 표시합니다. 원본 기록은 유지됩니다.' : null };
}

export function rankLeaderboard(entries) {
  // Different scoring versions are distinct competitions, including their ranks.
  const sorted = [...entries].sort((a, b) => b.scoringVersion - a.scoringVersion ||
    b.score - a.score || a.timeUsed - b.timeUsed || Date.parse(b.date) - Date.parse(a.date));
  let previousVersion;
  let rank = 0;
  return sorted.map(entry => {
    rank = entry.scoringVersion === previousVersion ? rank + 1 : 1;
    previousVersion = entry.scoringVersion;
    return { ...entry, rank };
  });
}

export function saveLeaderboardRecord(record, storage) {
  if (!isObject(record) || typeof record.name !== 'string' || record.name.trim().length > 10 || !normalizeEntry(record, 0)) {
    return { error: '저장할 기록을 확인할 수 없습니다.' };
  }
  const result = readStorage(storage);
  if (result.error) return { error: result.error };
  if (result.items.length >= MAX_RECORDS) return { error: '기록이 1,000개에 도달했습니다. 필요 없는 기록을 직접 삭제한 뒤 다시 시도해주세요.' };
  try {
    // Keep every original item, including older or partially damaged records.
    result.storage.setItem(STORAGE_KEY, JSON.stringify([...result.items, { ...record, name: record.name.trim() }]));
    return { error: null };
  } catch {
    return { error: '기록을 저장하지 못했습니다. 브라우저 저장 공간과 설정을 확인해주세요.' };
  }
}

export function deleteLeaderboardRecord(entry, storage) {
  const result = readStorage(storage);
  if (result.error) return { error: result.error };
  if (!entry || JSON.stringify(result.items[entry.sourceIndex]) !== entry.sourceFingerprint) {
    return { error: '기록이 변경되었습니다. 화면을 다시 열어 확인해주세요.' };
  }
  try {
    result.storage.setItem(STORAGE_KEY, JSON.stringify(result.items.filter((_, index) => index !== entry.sourceIndex)));
    return { error: null };
  } catch {
    return { error: '기록을 삭제하지 못했습니다. 브라우저 저장 설정을 확인해주세요.' };
  }
}
