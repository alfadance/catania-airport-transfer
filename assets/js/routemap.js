// The brand's dark road map: real route lines, a car that drives them and the price on arrival.
const BRAND = { night: '#050608', navy: '#1B3F5D', orange: '#EE8211' };
const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';
const DRIVE_MS = 7000;
const PAUSE_MS = 1800;
const CLOSE_PINS_X = 200;
const CLOSE_PINS_Y = 48;
const CAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#050608" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17H3v-5l2-5h10l3 4h3v6h-2"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/></svg>';

let library = null;
let routes = null;

function loadLibrary() {
  library ??= new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/assets/vendor/maplibre-gl-4.7.1.css';
    document.head.append(css);
    const js = document.createElement('script');
    js.src = '/assets/vendor/maplibre-gl-4.7.1.js';
    js.onload = resolve;
    js.onerror = reject;
    document.head.append(js);
  });
  return library;
}

export function loadRoutes() {
  routes ??= fetch('/assets/routes.json').then((response) => {
    if (!response.ok) throw new Error('routes.json');
    return response.json();
  }).then((data) => Object.values(data.tratte));
  return routes;
}

function lineColour(id) {
  if (/motorway|trunk/.test(id)) return '#94A3B8';
  if (/water/.test(id)) return BRAND.navy;
  return /boundary/.test(id) ? '#475569' : '#334155';
}

function fillColour(id) {
  if (/water/.test(id)) return BRAND.navy;
  return /building/.test(id) ? '#1E293B' : '#0F172A';
}

function paintBrand(map) {
  for (const { id, type } of map.getStyle().layers) {
    try {
      if (type === 'background') map.setPaintProperty(id, 'background-color', BRAND.night);
      if (type === 'fill') map.setPaintProperty(id, 'fill-color', fillColour(id));
      if (type === 'line') map.setPaintProperty(id, 'line-color', lineColour(id));
      if (type === 'symbol') {
        map.setPaintProperty(id, 'text-color', '#CBD5E1');
        map.setPaintProperty(id, 'text-halo-color', BRAND.night);
      }
    } catch {
      // Some layers lack that paint property; the base style's colour is fine for them.
    }
  }
}

const lineFeature = (coordinates) => ({ type: 'Feature', geometry: { type: 'LineString', coordinates } });
const multiLine = (coordinates) => ({ type: 'Feature', geometry: { type: 'MultiLineString', coordinates } });

function pinElement(text, isEnd, labelOnLeft) {
  const pin = document.createElement('div');
  pin.className = `map-pin${isEnd ? ' end' : ''}${labelOnLeft ? ' flip' : ''}`;
  const dot = document.createElement('i');
  const label = document.createElement('span');
  label.textContent = text;
  pin.append(dot, label);
  return pin;
}

function distances(points) {
  const totals = [0];
  for (let i = 1; i < points.length; i += 1) {
    const dx = (points[i][0] - points[i - 1][0]) * Math.cos((points[i][1] * Math.PI) / 180);
    totals.push(totals[i - 1] + Math.hypot(dx, points[i][1] - points[i - 1][1]));
  }
  return totals;
}

function positionAt(points, totals, distance) {
  let low = 0;
  let high = totals.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (totals[middle] <= distance) low = middle;
    else high = middle;
  }
  const part = (distance - totals[low]) / ((totals[high] - totals[low]) || 1);
  const position = [
    points[low][0] + (points[high][0] - points[low][0]) * part,
    points[low][1] + (points[high][1] - points[low][1]) * part,
  ];
  return { position, travelled: points.slice(0, low + 1).concat([position]) };
}

// Returns controls for one map. If the library or the tiles fail, the box hides and the page carries on.
export function createRouteMap(box) {
  let map = null;
  let ready = null;
  let frame = null;
  let markers = [];
  let priceChip = null;
  let priceText = '';
  let current = null;

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
  }

  function hide() {
    stop();
    box.hidden = true;
  }

  function open() {
    ready ??= loadLibrary().then(() => new Promise((resolve) => {
      map = new window.maplibregl.Map({
        container: box,
        style: STYLE_URL,
        attributionControl: { compact: true },
        cooperativeGestures: true,
        center: [15.07, 37.47],
        zoom: 8,
      });
      map.on('error', () => {
        if (!map.loaded()) hide();
      });
      map.on('load', () => {
        paintBrand(map);
        box.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
        const rounded = { 'line-cap': 'round', 'line-join': 'round' };
        map.addSource('base', { type: 'geojson', data: multiLine([]) });
        map.addSource('trip', { type: 'geojson', data: lineFeature([]) });
        map.addLayer({ id: 'base-line', type: 'line', source: 'base', layout: rounded, paint: { 'line-color': '#94A3B8', 'line-width': 4, 'line-opacity': 0.55 } });
        map.addLayer({ id: 'trip-edge', type: 'line', source: 'trip', layout: rounded, paint: { 'line-color': BRAND.night, 'line-width': 10 } });
        map.addLayer({ id: 'trip-line', type: 'line', source: 'trip', layout: rounded, paint: { 'line-color': BRAND.orange, 'line-width': 5 } });
        resolve();
      });
    })).catch(hide);
    return ready;
  }

  function clearMarkers() {
    markers.forEach((marker) => marker.remove());
    markers = [];
    priceChip = null;
  }

  function addMarker(element, lngLat, options) {
    const marker = new window.maplibregl.Marker({ element, ...options }).setLngLat(lngLat).addTo(map);
    markers.push(marker);
    return marker;
  }

  function frameRoute(points, padding) {
    const start = new window.maplibregl.LngLatBounds(points[0], points[0]);
    map.resize();
    map.fitBounds(points.reduce((bounds, point) => bounds.extend(point), start), { padding, duration: 0 });
  }

  function placePins(start, end, fromName, toName) {
    const width = box.clientWidth;
    const a = map.project(start);
    const b = map.project(end);
    const side = (point) => (point.x < width / 2 ? { anchor: 'left', offset: [-6, 0] } : { anchor: 'right', offset: [6, 0] });
    let sideA = side(a);
    let sideB = side(b);
    if (Math.abs(a.x - b.x) < CLOSE_PINS_X && Math.abs(a.y - b.y) < CLOSE_PINS_Y) {
      const startBelow = a.y >= b.y;
      sideA = startBelow ? { anchor: 'top', offset: [0, 16] } : { anchor: 'bottom', offset: [0, -16] };
      sideB = startBelow ? { anchor: 'bottom', offset: [0, -16] } : { anchor: 'top', offset: [0, 16] };
    }
    addMarker(pinElement(fromName, false, sideA.anchor === 'right'), start, sideA);
    addMarker(pinElement(toName, true, sideB.anchor === 'right'), end, sideB);
    priceChip = document.createElement('div');
    priceChip.className = 'map-price';
    priceChip.hidden = true;
    priceChip.textContent = priceText;
    addMarker(priceChip, end, { anchor: 'bottom', offset: [0, -28] });
  }

  function drive(points) {
    stop();
    const source = map.getSource('trip');
    const carElement = document.createElement('div');
    carElement.className = 'map-car';
    carElement.innerHTML = CAR_SVG;
    const car = addMarker(carElement, points[0], {});

    const arrive = (arrived) => {
      if (priceChip) priceChip.hidden = !(arrived && priceText);
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      source.setData(lineFeature(points));
      car.setLngLat(points.at(-1));
      arrive(true);
      return;
    }
    const totals = distances(points);
    const length = totals.at(-1);
    let started = null;
    const step = (time) => {
      started ??= time;
      const linear = Math.min(((time - started) % (DRIVE_MS + PAUSE_MS)) / DRIVE_MS, 1);
      const eased = linear < 0.5 ? 2 * linear * linear : 1 - ((-2 * linear + 2) ** 2) / 2;
      const { position, travelled } = positionAt(points, totals, eased * length);
      source.setData(lineFeature(travelled));
      car.setLngLat(position);
      arrive(linear >= 1);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  async function showRoute({ points, fromName, toName, price = '', padding = 56 }) {
    current = { points, fromName, toName, padding };
    priceText = price;
    box.hidden = false;
    await open();
    if (!map || box.hidden || current?.points !== points) return;
    stop();
    clearMarkers();
    frameRoute(points, padding);
    map.getSource('base').setData(multiLine([points]));
    placePins(points[0], points.at(-1), fromName, toName);
    drive(points);
  }

  async function showAll(lines, padding = 40) {
    box.hidden = false;
    await open();
    if (!map || box.hidden) return;
    clearMarkers();
    frameRoute(lines.flat(), padding);
    map.getSource('base').setData(multiLine(lines));
    map.getSource('trip').setData(multiLine(lines));
    lines.forEach((line) => {
      const end = document.createElement('div');
      end.className = 'map-pin end';
      end.append(document.createElement('i'));
      addMarker(end, line.at(-1), {});
    });
  }

  function setPrice(text) {
    priceText = text;
    if (!priceChip) return;
    priceChip.textContent = text;
    if (!text) priceChip.hidden = true;
  }

  return {
    showRoute,
    showAll,
    setPrice,
    stop,
    resume() {
      if (current && map && !frame) showRoute({ ...current, price: priceText });
    },
  };
}

// The first thing a visitor does. With `afterGesture` the page shows a still picture of the map until then:
// MapLibre (800 KB) and its tiles are not downloaded, so a visit with no gesture (a speed test) never pays for them.
const FIRST_GESTURES = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'];

// Starts a page map when it scrolls near view (and, with `afterGesture`, the visitor has done something),
// and pauses its car when it leaves.
export function whenNearView(box, onEnter, onLeave, { afterGesture = false } = {}) {
  let started = false;
  let near = false;
  let gestured = !afterGesture;
  const enter = () => {
    onEnter(started);
    started = true;
  };
  if (afterGesture) {
    // One wait only, so coming near twice before the gesture cannot start the map twice. It starts only if still near.
    new Promise((resolve) => {
      for (const name of FIRST_GESTURES) addEventListener(name, resolve, { once: true, passive: true });
    }).then(() => {
      gestured = true;
      if (near) enter();
    });
  }
  new IntersectionObserver(([entry]) => {
    near = entry.isIntersecting;
    if (near) {
      if (gestured) enter();
    } else if (started) {
      onLeave();
    }
  }, { rootMargin: '200px' }).observe(box);
}
