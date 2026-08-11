// ********************************** Vitest Setup **********************************
// Loaded before every test file via the setupFiles entry in vite.config.js.

import '@testing-library/jest-dom/vitest';

// ********************************** Media Element Stubs **********************************
// jsdom does not implement HTMLMediaElement playback. Sound.jsx calls play() and
// chains .catch() on the result, so play() must return a resolved promise or the
// component throws on render.
//
// These are plain functions rather than vi.fn(), because restoreMocks is enabled
// and would strip the implementation between tests, leaving play() undefined again.
window.HTMLMediaElement.prototype.play = function play() {
  return Promise.resolve();
};
window.HTMLMediaElement.prototype.pause = function pause() {};
