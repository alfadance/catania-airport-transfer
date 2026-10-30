// Mappa animata Catania Airport -> destinazione per le pagine catania-airport-to-<tratta>.html.
// Stessa grafica e stessa animazione della pagina di prenotazione (book-a-transfer.html): linea di percorso, auto che la percorre,
// cartellini di partenza e arrivo, fumetto del prezzo all'arrivo. Qui la tratta e' fissa (sempre da aeroporto), senza modulo.
// Markup: <div id="trip-map" class="trip-map" data-route="taormina" data-price="140"></div>
// Dati: assets/routes-privati.json (tratte.<id>.nome/km/coordinate). Librerie: assets/vendor/maplibre-gl-4.7.1.{js,css} (self-hosted).
// La mappa parte solo quando entra nello schermo (nessun costo sul caricamento della pagina). Se qualcosa non carica, la mappa sparisce.
(function() {
  var mapEl = document.getElementById('trip-map');
  if (!mapEl) return;
  var ROUTE = mapEl.getAttribute('data-route'), PRICE = mapEl.getAttribute('data-price') || '';
  var BRAND = { night: '#050608', navy: '#1B3F5D', orange: '#EE8211' };
  var CAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#050608" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17H3v-5l2-5h10l3 4h3v6h-2"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M9.5 17h5M5 12h12"/></svg>';
  var MAP = null, CAR = null, POP = null, ANIM = null;

  function hide() { mapEl.hidden = true; if (ANIM) cancelAnimationFrame(ANIM); }
  function loadMaplibre() {
    return new Promise(function(ok, ko) {
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'assets/vendor/maplibre-gl-4.7.1.css'; document.head.appendChild(css);
      var js = document.createElement('script'); js.src = 'assets/vendor/maplibre-gl-4.7.1.js'; js.onload = ok; js.onerror = ko; document.head.appendChild(js);
    });
  }
  function paintStyle(map) {
    map.getStyle().layers.forEach(function(l) {
      try {
        if (l.type === 'background') map.setPaintProperty(l.id, 'background-color', BRAND.night);
        else if (l.type === 'fill') map.setPaintProperty(l.id, 'fill-color', /water/.test(l.id) ? BRAND.navy : /building/.test(l.id) ? '#1E293B' : '#0F172A');
        else if (l.type === 'line') map.setPaintProperty(l.id, 'line-color', /motorway|trunk/.test(l.id) ? '#94A3B8' : /water/.test(l.id) ? BRAND.navy : /boundary/.test(l.id) ? '#475569' : '#334155');
        else if (l.type === 'symbol') { map.setPaintProperty(l.id, 'text-color', '#CBD5E1'); map.setPaintProperty(l.id, 'text-halo-color', BRAND.night); }
      } catch (e) { /* livello senza quella proprieta' */ }
    });
  }
  function pin(text, end) { var d = document.createElement('div'); d.className = 'pin' + (end ? ' end' : ''); d.innerHTML = '<i></i><span></span>'; d.lastChild.textContent = text; return d; }
  function line(coords) { return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }; }
  function lengths(pts) {
    var cum = [0];
    for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot((pts[i][0] - pts[i - 1][0]) * Math.cos(pts[i][1] * Math.PI / 180), pts[i][1] - pts[i - 1][1]));
    return cum;
  }
  function runCar(pts) {
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches, src = MAP.getSource('trip');
    if (POP) POP.classList.remove('on');
    if (still) { src.setData(line(pts)); CAR.setLngLat(pts[pts.length - 1]); if (POP) POP.classList.add('on'); return; }
    var cum = lengths(pts), total = cum[cum.length - 1], DUR = 7000, PAUSE = 1800, t0 = null;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var f = Math.min(((ts - t0) % (DUR + PAUSE)) / DUR, 1);
      f = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;      // parte e arriva piano
      var d = f * total, lo = 0, hi = cum.length - 1;
      while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (cum[mid] <= d) lo = mid; else hi = mid; }
      var u = (d - cum[lo]) / ((cum[hi] - cum[lo]) || 1), pos = [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * u, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * u];
      src.setData(line(pts.slice(0, lo + 1).concat([pos])));
      CAR.setLngLat(pos);
      if (POP) POP.classList.toggle('on', f >= 1);      // arrivata: esce il prezzo; alla ripartenza rientra
      ANIM = requestAnimationFrame(frame);
    }
    ANIM = requestAnimationFrame(frame);
  }
  function start(route) {
    var coords = route.coordinate, a = coords[0], b = coords[coords.length - 1];
    MAP = new maplibregl.Map({ container: mapEl, style: 'https://tiles.openfreemap.org/styles/dark', center: a, zoom: 9, attributionControl: { compact: true }, cooperativeGestures: true });
    MAP.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    MAP.on('error', function() { if (!MAP.loaded()) hide(); });
    MAP.on('load', function() {
      paintStyle(MAP);
      var credits = mapEl.querySelector('.maplibregl-ctrl-attrib');      // i crediti (OpenFreeMap, OpenStreetMap) restano, chiusi dietro l'icona "i"
      if (credits) { credits.classList.remove('maplibregl-compact-show'); credits.removeAttribute('open'); }
      MAP.addSource('base', { type: 'geojson', data: line(coords) });
      MAP.addSource('trip', { type: 'geojson', data: line([a, a]) });
      MAP.addLayer({ id: 'base-line', type: 'line', source: 'base', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#94A3B8', 'line-width': 4, 'line-opacity': .45 } });
      MAP.addLayer({ id: 'trip-edge', type: 'line', source: 'trip', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': BRAND.night, 'line-width': 10 } });
      MAP.addLayer({ id: 'trip-line', type: 'line', source: 'trip', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': BRAND.orange, 'line-width': 5 } });
      var el = document.createElement('div'); el.className = 'car'; el.innerHTML = CAR_SVG;
      CAR = new maplibregl.Marker({ element: el }).setLngLat(a).addTo(MAP);
      MAP.resize();
      var bounds = coords.reduce(function(bb, c) { return bb.extend(c); }, new maplibregl.LngLatBounds(coords[0], coords[0]));
      var narrow = mapEl.clientWidth < 640;
      MAP.fitBounds(bounds, { padding: narrow ? { top: 96, bottom: 56, left: 24, right: 24 } : { top: 96, bottom: 56, left: 64, right: 64 }, duration: 0 });
      // I cartellini si mettono dopo l'inquadratura: ognuno si apre verso l'interno della mappa, cosi' non esce dal bordo.
      var W = mapEl.clientWidth, pa = MAP.project(a), pb = MAP.project(b);
      function side(pt) { return pt.x < W / 2 ? { anchor: 'left', offset: [8, 0] } : { anchor: 'right', offset: [-8, 0] }; }
      var sa = side(pa), sb = side(pb), popY = -28;
      if (Math.abs(pa.x - pb.x) < 200 && Math.abs(pa.y - pb.y) < 48) {      // cartellini quasi sovrapposti: uno sopra e uno sotto il proprio punto
        var aBelow = pa.y >= pb.y;
        sa = aBelow ? { anchor: 'top', offset: [0, 16] } : { anchor: 'bottom', offset: [0, -16] };
        sb = aBelow ? { anchor: 'bottom', offset: [0, -16] } : { anchor: 'top', offset: [0, 16] };
        popY = aBelow ? -64 : -28;
      }
      new maplibregl.Marker({ element: pin('Catania Airport', false), anchor: sa.anchor, offset: sa.offset }).setLngLat(a).addTo(MAP);
      new maplibregl.Marker({ element: pin(route.nome, true), anchor: sb.anchor, offset: sb.offset }).setLngLat(b).addTo(MAP);
      if (PRICE) {
        var shell = document.createElement('div');
        shell.innerHTML = '<div class="pop" aria-hidden="true"><span class="coin" aria-hidden="true">€</span><b></b></div>';
        POP = shell.firstChild; POP.querySelector('b').textContent = PRICE;
        var popX = Math.max(56, Math.min(W - 56, pb.x)) - pb.x;      // il fumetto del prezzo resta dentro la mappa
        new maplibregl.Marker({ element: shell, anchor: 'bottom', offset: [popX, popY] }).setLngLat(b).addTo(MAP);
      }
      runCar(coords);
    });
  }
  function load() {
    Promise.all([loadMaplibre(), fetch('assets/routes-privati.json').then(function(r) { if (!r.ok) throw new Error('routes'); return r.json(); })])
      .then(function(r) { var route = r[1].tratte[ROUTE]; if (!route) throw new Error('route'); start(route); })
      .catch(hide);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) { if (entries[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '200px' });
    io.observe(mapEl);
  } else { load(); }
})();
