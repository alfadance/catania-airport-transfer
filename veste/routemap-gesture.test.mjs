import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { whenNearView } from './src/assets/js/routemap.js';

// The page map must not start (and download MapLibre) until the visitor does something.
// These tests fake the two browser globals that whenNearView uses.
const EXPECTED_CHECKS = 14;
const originals = { addEventListener: globalThis.addEventListener, IntersectionObserver: globalThis.IntersectionObserver };
after(() => { Object.assign(globalThis, originals); });
let checks = 0;
const is = (actual, expected, message) => { checks += 1; assert.equal(actual, expected, message); };
const GATED = { afterGesture: true };
const tick = () => new Promise((resolve) => setImmediate(resolve));

function fakeBrowser() {
  const listeners = {};
  let observer = null;
  globalThis.addEventListener = (name, fn) => { (listeners[name] ??= []).push(fn); };
  globalThis.IntersectionObserver = class {
    constructor(callback) { observer = callback; }
    observe() {}
  };
  return {
    gesture: (name) => (listeners[name] ?? []).forEach((fn) => fn()),
    near: () => observer([{ isIntersecting: true }]),
    far: () => observer([{ isIntersecting: false }]),
    listening: () => Object.keys(listeners).sort(),
  };
}

function watch() {
  const calls = [];
  return { calls, onEnter: (resuming) => calls.push(['enter', resuming]), onLeave: () => calls.push(['leave']) };
}

test('listens for the five kinds of first gesture', () => {
  const browser = fakeBrowser();
  whenNearView({}, () => {}, () => {}, GATED);
  is(browser.listening().join(','), 'keydown,pointerdown,scroll,touchstart,wheel');
});

test('a map near view does not start before a gesture', async () => {
  const browser = fakeBrowser();
  const { calls, onEnter, onLeave } = watch();
  whenNearView({}, onEnter, onLeave, GATED);
  browser.near();
  await tick();
  is(calls.length, 0, 'no start without a gesture');
});

test('each kind of gesture starts a map that is near view', async () => {
  for (const name of ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll']) {
    const browser = fakeBrowser();
    const { calls, onEnter, onLeave } = watch();
    whenNearView({}, onEnter, onLeave, GATED);
    browser.near();
    browser.gesture(name);
    await tick();
    is(JSON.stringify(calls), '[["enter",false]]', name);
  }
});

test('a gesture first, then the map comes near: it starts at once', async () => {
  const browser = fakeBrowser();
  const { calls, onEnter, onLeave } = watch();
  whenNearView({}, onEnter, onLeave, GATED);
  browser.gesture('wheel');
  browser.near();
  await tick();
  is(JSON.stringify(calls), '[["enter",false]]');
});

test('leaving before the first start does not pause anything', async () => {
  const browser = fakeBrowser();
  const { calls, onEnter, onLeave } = watch();
  whenNearView({}, onEnter, onLeave, GATED);
  browser.near();
  browser.far();
  await tick();
  is(calls.length, 0);
});

test('after the first start, leaving pauses and coming back resumes', async () => {
  const browser = fakeBrowser();
  const { calls, onEnter, onLeave } = watch();
  whenNearView({}, onEnter, onLeave, GATED);
  browser.gesture('pointerdown');
  browser.near();
  await tick();
  browser.far();
  browser.near();
  await tick();
  is(JSON.stringify(calls), '[["enter",false],["leave"],["enter",true]]');
});

test('coming near twice before the gesture starts the map only once', async () => {
  const browser = fakeBrowser();
  const { calls, onEnter, onLeave } = watch();
  whenNearView({}, onEnter, onLeave, GATED);
  browser.near();
  browser.far();
  browser.near();
  browser.gesture('wheel');
  await tick();
  is(JSON.stringify(calls), '[["enter",false]]');
});

test('a map that went far before the gesture does not start', async () => {
  const browser = fakeBrowser();
  const { calls, onEnter, onLeave } = watch();
  whenNearView({}, onEnter, onLeave, GATED);
  browser.near();
  browser.far();
  browser.gesture('wheel');
  await tick();
  is(calls.length, 0);
});

test('without the option the map starts at once, as before', () => {
  const browser = fakeBrowser();
  const { calls, onEnter, onLeave } = watch();
  whenNearView({}, onEnter, onLeave);
  is(browser.listening().length, 0, 'no gesture listener');
  browser.near();
  is(JSON.stringify(calls), '[["enter",false]]', 'no wait, no microtask');
});

test('the checks above really ran', () => {
  is(checks >= EXPECTED_CHECKS, true, `only ${checks} checks ran`);
});
