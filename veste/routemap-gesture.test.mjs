import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { whenNearView } from './src/assets/js/routemap.js';

// The page map must not start (and download MapLibre) until the visitor does something.
// These tests fake the two browser globals that whenNearView uses.
const EXPECTED_CHECKS = 34; // 14 for whenNearView, 1 for route-page.js, 1 + 2 per route page (9 pages)
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

// Route pages (catania-airport-to-<route>.html): the same wait, and a still picture of each route until the map starts.
const VESTE = new URL('./', import.meta.url);
const read = (path) => readFileSync(new URL(path, VESTE), 'utf8');
const ROUTE_PAGES = readdirSync(new URL('src/pages/', VESTE)).filter((name) => /^route-.+\.html$/.test(name));

test('the route page map waits for a gesture', () => {
  is(/whenNearView\([\s\S]*\{ afterGesture: true \}\);/.test(read('src/assets/js/route-page.js')), true, 'route-page.js passes afterGesture');
});

test('every route page has its still picture, declared in the CSS and present on disk', () => {
  const css = read('src/pages/_route-page.css');
  is(ROUTE_PAGES.length >= 9, true, `only ${ROUTE_PAGES.length} route pages found`);
  for (const page of ROUTE_PAGES) {
    const route = read(`src/pages/${page}`).match(/id="trip-map"[^>]*data-route="([^"]+)"/)?.[1];
    const image = `/assets/img/map-trip-${route}.webp`;
    is(css.includes(`.route-map[data-route="${route}"] { background-image: url(${image}); }`), true, `${page}: no CSS rule for ${image}`);
    is(existsSync(new URL(`src${image}`, VESTE)), true, `${page}: ${image} missing in veste/src`);
  }
});

test('the checks above really ran', () => {
  is(checks >= EXPECTED_CHECKS, true, `only ${checks} checks ran`);
});
