// ********************************** Jest Setup **********************************
// Loaded automatically by react-scripts before every test file.

import '@testing-library/jest-dom';

// ********************************** Media Element Stubs **********************************
// jsdom does not implement HTMLMediaElement playback. Sound.js calls play() and
// chains .catch() on the result, so play() must return a resolved promise or the
// component throws on render.
//
// These are plain functions rather than jest.fn(), because react-scripts enables
// resetMocks, which would strip the implementation off a jest.fn before each test
// and leave play() returning undefined again.
window.HTMLMediaElement.prototype.play = function play() {
  return Promise.resolve();
};
window.HTMLMediaElement.prototype.pause = function pause() {};
