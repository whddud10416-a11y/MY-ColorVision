export const state = {
  mode: 'test',
  stageNumber: 1,
  score: 0,
  userHistory: [],
  tutorialShown: { 1: false, 4: false, 9: false },
  weakness: 'default',
  challengeSequence: [],
  challengeScore: 0,
  challengeTotalScore: 0,
  challengeTimeLeft: 180,
  timerId: null,
  challengeHistory: []
};

export const container = document.getElementById("app");
