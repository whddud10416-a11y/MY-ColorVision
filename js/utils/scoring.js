import { applyDaltonizeToColor } from './daltonize.js';

export const RGB_MATCH_THRESHOLD = 40;
export const SCORING_VERSION = 2;

function canonicalRgb(rgb) {
  const [r, g, b] = ['r', 'g', 'b'].map(channel => {
    if (!Number.isFinite(rgb[channel])) throw new TypeError('Invalid RGB channel');
    return Math.min(255, Math.max(0, Math.round(rgb[channel])));
  });
  return { r, g, b };
}

// Filter output defines the transition's destination, not its intermediate color.
export function toDisplayRgb(rgb, filter = {}) {
  const channels = canonicalRgb(rgb);
  const [r, g, b] = applyDaltonizeToColor(
    channels.r, channels.g, channels.b,
    filter.type ?? 'default',
    filter.severity ?? 0.5,
    filter.mode ?? 'correct',
    filter.intensity ?? 1.0
  );
  return { r, g, b };
}

export function gradeRgbMatch(target, user, filter) {
  return gradeDisplayedRgb(toDisplayRgb(target, filter), toDisplayRgb(user, filter));
}

// The browser supplies the colors actually visible at the instant of submission.
export function gradeDisplayedRgb(target, user) {
  const displayCorrect = canonicalRgb(target);
  const displayUser = canonicalRgb(user);
  const distance = Math.hypot(
    displayCorrect.r - displayUser.r,
    displayCorrect.g - displayUser.g,
    displayCorrect.b - displayUser.b
  );
  const isCorrect = distance < RGB_MATCH_THRESHOLD;
  const scoreEarned = isCorrect ? 20 : Math.max(0, Math.min(19,
    Math.round(20 - ((distance - RGB_MATCH_THRESHOLD) * (20 / 80)))
  ));
  return {
    displayCorrect, displayUser, distance, isCorrect, scoreEarned,
    threshold: RGB_MATCH_THRESHOLD,
    scoringVersion: SCORING_VERSION
  };
}
