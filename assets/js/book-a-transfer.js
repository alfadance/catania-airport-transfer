// Modulo per i privati (spostato dal vecchio book-a-transfer.html, logica invariata): invia JSON alla funzione Supabase richiesta-privati.
  // Modulo per i privati: invia JSON alla funzione di Supabase `richiesta-privati`.
  // Il prezzo che si vede qui viene da assets/prezzi-sito.json, lo stesso file che la funzione usa per calcolarlo: il server ricalcola sempre e non si fida del browser.
  (function() {
    var ENDPOINT = 'https://lsekwlvnlumjxliyysuy.supabase.co/functions/v1/richiesta-privati';
    var MAX_PAX = { business_sedan: 3, business_minivan: 7 };
    var SEDAN_BAGS = 2;   // un Sedan porta 2 bagagli imbarcati; dal terzo serve il Minivan
    var form = document.getElementById('book-form');
    if (!form) return;
    var sent = document.getElementById('book-sent');
    var errBox = document.getElementById('book-error');
    var errText = document.getElementById('book-error-text');
    var live = document.getElementById('book-live');
    var button = form.querySelector('button[type="submit"]');
    var buttonLabel = button.innerHTML;
    var GENERIC = errText.textContent;
    var FIELD_MESSAGE = {
      tratta: 'Choose a town.', direzione: 'Choose a direction.', mezzo: 'Choose a vehicle.',
      pax: 'Check the number of passengers: up to 3 in the Sedan, up to 7 in the Minivan.',
      bagagli_imbarcati: 'Check the number of checked suitcases (0 to 8).', bagagli_mano: 'Check the number of carry-on bags (0 to 4).',
      bagagli: 'Check the luggage: a Sedan takes 2 checked suitcases, from the third you need a Minivan.',
      termini: 'Tick the box to accept the terms and conditions.',
      data: 'Check the date: we need at least 24 hours before pickup.', ora: 'Check the pickup time.',
      volo: 'Check the flight number, for example FR1234.', indirizzo: 'Add the address (at least 5 characters).',
      nome: 'Enter your first and last name.', telefono: 'Enter a valid phone number with country code, for example +44 20 7946 0000.',
      email: 'Check the email address.', note: 'Remove special characters from the note.',
      consenso: 'Tick the box to agree to the use of your details.'
    };

    // La data minima e' domani (ora del browser); il server controlla le 24 ore esatte in ora italiana.
    var tomorrow = new Date(Date.now() + 864e5);
    form.elements.data.min = tomorrow.getFullYear() + '-' + String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + String(tomorrow.getDate()).padStart(2, '0');

    // Bagagli equivalenti: imbarcati + bagagli a mano / 2, arrotondato per eccesso (2 a mano = 1 imbarcato).
    function equivalentBags() {
      var checked = Number(form.elements.bagagli_imbarcati.value) || 0, carry = Number(form.elements.bagagli_mano.value) || 0;
      return checked + Math.ceil(carry / 2);
    }
    function syncDirection() {
      var from = form.elements.direzione.value === 'da_aeroporto';
      document.getElementById('address-label').textContent = from ? 'Drop-off address' : 'Pickup address';
      document.getElementById('flight-hint').classList.toggle('hidden', !from);
    }
    function syncVehicle() {
      var select = form.elements.mezzo, note = document.getElementById('vehicle-note');
      var needsMinivan = equivalentBags() > SEDAN_BAGS;
      select.querySelector('[value=business_sedan]').disabled = needsMinivan;
      if (needsMinivan && select.value !== 'business_minivan') select.value = 'business_minivan';
      note.textContent = needsMinivan ? 'More than 2 checked suitcases need a Minivan. We chose it for you.' : '';
      note.classList.toggle('hidden', !needsMinivan);
      if (typeof updateTrip === 'function') updateTrip();
      var max = MAX_PAX[select.value] || 7;
      form.elements.pax.max = max;
      if (Number(form.elements.pax.value) > max) form.elements.pax.value = max;
    }
    // ---- Prezzo e mappa ------------------------------------------------------------------------------------------------------
    var VEHICLES = {
      business_sedan: { src: '/assets/veicoli/sedan-e-class.webp', w: 720, h: 337, alt: 'Black Mercedes-Benz E-Class saloon', name: 'Business Sedan', sub: 'Mercedes-Benz E-Class', cap: 'Up to 3 passengers' },
      business_minivan: { src: '/assets/veicoli/minivan-vito.webp', w: 720, h: 399, alt: 'Black Mercedes-Benz minivan', name: 'Business Minivan', sub: 'Mercedes-Benz V-Class or equivalent', cap: 'Up to 7 passengers' }
    };
    var DATA = null, MAP = null, CAR = null, ANIM = null, MAPLIB = null, MAP_BROKEN = false, POP = null, POP_TEXT = '';
    function setPop(text) {
      POP_TEXT = text || '';
      if (!POP) return;
      POP.hidden = !POP_TEXT;
      POP.querySelector('b').textContent = POP_TEXT;
      if (!POP_TEXT) POP.classList.remove('on');
    }
    var BRAND = { night: '#050608', navy: '#1B3F5D', orange: '#EE8211' };
    var CAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#050608" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17H3v-5l2-5h10l3 4h3v6h-2"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M9.5 17h5M5 12h12"/></svg>';
    function loadJson(url) { return fetch(url).then(function(r) { if (!r.ok) throw new Error(url); return r.json(); }); }
    function ensureData() {
      if (!DATA) DATA = Promise.all([loadJson('/assets/prezzi-sito.json'), loadJson('/assets/routes-privati.json')]).then(function(a) { return { prices: a[0], routes: a[1] }; });
      return DATA;
    }
    // Stessa regola della funzione: notte dalle 22:00 alle 05:59, ora italiana del ritiro.
    function isNight(time) { var m = /^(\d{2}):(\d{2})$/.exec(time); return m ? (+m[1] * 60 + +m[2] >= 1320 || +m[1] * 60 + +m[2] < 360) : null; }
    function priceFor(prices, town, vehicle, time) {
      var t = prices.tratte.filter(function(x) { return x.id === town; })[0], night = isNight(time);
      var p = t && t.prezzi[vehicle];
      return p && night !== null ? { eur: night ? p.notte : p.giorno, night: night } : null;
    }
    function loadMaplibre() {
      if (MAPLIB) return MAPLIB;
      MAPLIB = new Promise(function(ok, ko) {
        var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/assets/vendor/maplibre-gl-4.7.1.css'; document.head.appendChild(css);
        var js = document.createElement('script'); js.src = '/assets/vendor/maplibre-gl-4.7.1.js'; js.onload = ok; js.onerror = ko; document.head.appendChild(js);
      });
      return MAPLIB;
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
    function pin(text, end) { var d = document.createElement('div'); d.className = 'bk-pin' + (end ? ' end' : ''); d.innerHTML = '<i></i><span></span>'; d.lastChild.textContent = text; return d; }
    function stopCar() { if (ANIM) cancelAnimationFrame(ANIM); ANIM = null; }
    function line(coords) { return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }; }
    function bearingPoints(pts) {
      var cum = [0];
      for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot((pts[i][0] - pts[i - 1][0]) * Math.cos(pts[i][1] * Math.PI / 180), pts[i][1] - pts[i - 1][1]));
      return cum;
    }
    function runCar(pts) {
      stopCar();
      var still = matchMedia('(prefers-reduced-motion: reduce)').matches, src = MAP.getSource('trip');
      if (POP) POP.classList.remove('on');
      if (still) { src.setData(line(pts)); CAR.setLngLat(pts[pts.length - 1]); if (POP) POP.classList.add('on'); return; }
      var cum = bearingPoints(pts), total = cum[cum.length - 1], DUR = 7000, PAUSE = 1800, t0 = null;
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var f = Math.min(((ts - t0) % (DUR + PAUSE)) / DUR, 1);
        f = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;      // parte e arriva piano
        var d = f * total, lo = 0, hi = cum.length - 1;
        while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (cum[mid] <= d) lo = mid; else hi = mid; }
        var u = (d - cum[lo]) / ((cum[hi] - cum[lo]) || 1), pos = [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * u, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * u];
        src.setData(line(pts.slice(0, lo + 1).concat([pos])));
        CAR.setLngLat(pos);
        if (POP && POP_TEXT) POP.classList.toggle('on', f >= 1);      // arrivata: esce il prezzo; alla ripartenza rientra
        ANIM = requestAnimationFrame(frame);
      }
      ANIM = requestAnimationFrame(frame);
    }
    function showRoute(route, fromAirport) {
      var mapEl = document.getElementById('trip-map');
      if (MAP_BROKEN) { mapEl.hidden = true; return; }
      loadMaplibre().then(function() {
        var coords = fromAirport ? route.coordinate : route.coordinate.slice().reverse();
        var a = coords[0], b = coords[coords.length - 1], town = route.nome;
        function draw() {
          MAP.resize();
          MAP.__pins.forEach(function(m) { m.remove(); });
          var bounds = coords.reduce(function(bb, c) { return bb.extend(c); }, new maplibregl.LngLatBounds(coords[0], coords[0]));
          var narrow = MAP.getContainer().clientWidth < 640;
          MAP.fitBounds(bounds, { padding: narrow ? { top: 96, bottom: 56, left: 24, right: 24 } : { top: 96, bottom: 56, left: 64, right: 64 }, duration: 0 });
          // I cartellini si mettono dopo l'inquadratura: ognuno si apre verso l'interno della mappa, cosi' non esce dal bordo.
          var W = MAP.getContainer().clientWidth, pa = MAP.project(a), pb = MAP.project(b);
          function side(pt) { return pt.x < W / 2 ? { anchor: 'left', offset: [8, 0] } : { anchor: 'right', offset: [-8, 0] }; }
          var sa = side(pa), sb = side(pb), popY = -28;
          if (Math.abs(pa.x - pb.x) < 200 && Math.abs(pa.y - pb.y) < 48) {      // cartellini quasi sovrapposti: uno sopra e uno sotto il proprio punto
            var aBelow = pa.y >= pb.y;
            sa = aBelow ? { anchor: 'top', offset: [0, 16] } : { anchor: 'bottom', offset: [0, -16] };
            sb = aBelow ? { anchor: 'bottom', offset: [0, -16] } : { anchor: 'top', offset: [0, 16] };
            popY = aBelow ? -64 : -28;
          }
          MAP.__pins = [
            new maplibregl.Marker({ element: pin(fromAirport ? 'Catania Airport' : town, false), anchor: sa.anchor, offset: sa.offset }).setLngLat(a).addTo(MAP),
            new maplibregl.Marker({ element: pin(fromAirport ? town : 'Catania Airport', true), anchor: sb.anchor, offset: sb.offset }).setLngLat(b).addTo(MAP)
          ];
          var shell = document.createElement('div');
          shell.innerHTML = '<div class="bk-pop" aria-hidden="true" hidden><span class="bk-coin" aria-hidden="true">€</span><b></b></div>';
          POP = shell.firstChild;
          var popX = Math.max(56, Math.min(W - 56, pb.x)) - pb.x;      // il fumetto del prezzo resta dentro la mappa
          MAP.__pins.push(new maplibregl.Marker({ element: shell, anchor: 'bottom', offset: [popX, popY] }).setLngLat(b).addTo(MAP));
          setPop(POP_TEXT);
          MAP.getSource('base').setData(line(coords));
          runCar(coords);
        }
        if (!MAP) {
          MAP = new maplibregl.Map({ container: mapEl, style: 'https://tiles.openfreemap.org/styles/dark', center: a, zoom: 9, attributionControl: { compact: true }, cooperativeGestures: true });
          MAP.__pins = [];
          MAP.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
          MAP.on('error', function() { if (!MAP.loaded()) { MAP_BROKEN = true; stopCar(); mapEl.hidden = true; } });
          MAP.on('load', function() {
            paintStyle(MAP);
            var credits = mapEl.querySelector('.maplibregl-ctrl-attrib');      // i crediti restano (OpenFreeMap, OpenStreetMap) ma chiusi, con l'icona "i"
            if (credits) { credits.classList.remove('maplibregl-compact-show'); credits.removeAttribute('open'); }
            MAP.addSource('base', { type: 'geojson', data: line([a, b]) });
            MAP.addSource('trip', { type: 'geojson', data: line([a, a]) });
            MAP.addLayer({ id: 'base-line', type: 'line', source: 'base', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#94A3B8', 'line-width': 4, 'line-opacity': .45 } });
            MAP.addLayer({ id: 'trip-edge', type: 'line', source: 'trip', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': BRAND.night, 'line-width': 10 } });
            MAP.addLayer({ id: 'trip-line', type: 'line', source: 'trip', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': BRAND.orange, 'line-width': 5 } });
            var el = document.createElement('div'); el.className = 'bk-car'; el.innerHTML = CAR_SVG;
            CAR = new maplibregl.Marker({ element: el }).setLngLat(a).addTo(MAP);
            MAP.__ready = true;
            draw();
          });
          MAP.__draw = draw;
        } else if (MAP.__ready) { draw(); }
        MAP.__draw = draw;
      }).catch(function() { MAP_BROKEN = true; mapEl.hidden = true; });
    }
    var shownRoute = '';
    function updateTrip() {
      var el = form.elements, town = el.tratta.value, card = document.getElementById('trip-card');
      if (!town) { card.classList.add('hidden'); stopCar(); shownRoute = ''; return; }
      card.classList.remove('hidden');
      ensureData().then(function(d) {
        var route = d.routes.tratte[town], fromAirport = el.direzione.value === 'da_aeroporto';
        var priceEl = document.getElementById('trip-eur'), sub = document.getElementById('trip-sub'), pick = document.getElementById('trip-pick');
        document.getElementById('trip-from').textContent = fromAirport ? 'Catania Airport' : route.nome;
        document.getElementById('trip-to').textContent = fromAirport ? route.nome : 'Catania Airport';
        document.getElementById('trip-km').textContent = 'About ' + Math.round(route.km) + ' km by road';
        document.getElementById('trip-map').setAttribute('aria-label', 'Map of the route between Catania Airport and ' + route.nome + ', about ' + Math.round(route.km) + ' kilometres');
        var p = priceFor(d.prices, town, el.mezzo.value, el.ora.value);
        priceEl.textContent = p ? '€' + p.eur : '';
        setPop(p ? String(p.eur) : '');
        var veh = VEHICLES[el.mezzo.value], vbox = document.getElementById('trip-vehicle'), vimg = document.getElementById('trip-vimg');
        if (veh) {
          if (vimg.getAttribute('src') !== veh.src) { vimg.src = veh.src; vimg.width = veh.w; vimg.height = veh.h; vimg.classList.remove('is-in'); void vimg.offsetWidth; vimg.classList.add('is-in'); }
          vimg.alt = veh.alt;
          document.getElementById('trip-vname').textContent = veh.name;
          var vsub = document.getElementById('trip-vsub'); vsub.textContent = veh.sub + ' '; var capEl = document.createElement('span'); capEl.className = 'cap'; capEl.innerHTML = '<span class="ico ico-pax" aria-hidden="true"></span>'; capEl.appendChild(document.createTextNode(veh.cap)); vsub.appendChild(capEl);
          vbox.hidden = false;
        } else { vbox.hidden = true; }       // il simbolo € sta gia' nella moneta del fumetto
        sub.textContent = p ? 'VAT included, whole vehicle' + (p.night ? ', night rate (22:00 to 06:00) included' : '') : '';
        pick.textContent = 'Choose a vehicle and a pickup time to see the price.';
        pick.classList.toggle('hidden', !!p);
        var key = town + '|' + el.direzione.value;
        if (key !== shownRoute) { shownRoute = key; showRoute(route, fromAirport); }
      }).catch(function() {
        document.getElementById('trip-eur').textContent = '';
        document.getElementById('trip-sub').textContent = '';
        var pick = document.getElementById('trip-pick'); pick.textContent = 'We send you the price by email.'; pick.classList.remove('hidden');
      });
    }
    form.addEventListener('change', function(e) {
      if (e.target.name === 'direzione') syncDirection();
      if (e.target.name === 'mezzo') syncVehicle();
      if (/^(tratta|direzione|mezzo|ora)$/.test(e.target.name)) updateTrip();
    });
    form.addEventListener('input', function(e) {
      if (e.target.name === 'bagagli_imbarcati' || e.target.name === 'bagagli_mano') syncVehicle();
      if (e.target.name === 'telefono' || e.target.name === 'nome') e.target.setCustomValidity('');
      if (e.target.name === 'ora') updateTrip();
    });

    // Nome e cognome: almeno due parole. Telefono: libphonenumber (carico solo alla prima interazione; se non carica, controlla il server).
    var phoneLoading = null;
    function loadPhoneLib() {
      if (window.libphonenumber || phoneLoading) return;
      phoneLoading = true;
      var s = document.createElement('script');
      s.src = '/assets/vendor/libphonenumber-max-1.13.15.js';
      s.onerror = function() { phoneLoading = null; };
      document.head.appendChild(s);
    }
    form.addEventListener('focusin', loadPhoneLib, { once: true });
    function validateName() {
      var f = form.elements.nome, ok = f.value.trim().split(/\s+/).filter(Boolean).length >= 2;
      f.setCustomValidity(ok ? '' : FIELD_MESSAGE.nome);
      return ok;
    }
    function validatePhone() {
      var f = form.elements.telefono, v = f.value.trim(), ok, parsed = null;
      if (window.libphonenumber) {
        parsed = v.charAt(0) === '+' ? libphonenumber.parsePhoneNumberFromString(v) : null;
        ok = !!(parsed && parsed.isValid());
        if (ok) f.value = parsed.formatInternational();
      } else {
        ok = /^\+[0-9 ()./-]{7,22}$/.test(v);
      }
      f.setCustomValidity(ok ? '' : FIELD_MESSAGE.telefono);
      return ok;
    }
    form.elements.telefono.addEventListener('blur', function() { if (this.value.trim()) validatePhone(); });
    form.elements.nome.addEventListener('blur', function() { if (this.value.trim()) validateName(); });

    function hideBoxes() {
      sent.classList.add('hidden'); errBox.classList.add('hidden');
      [].slice.call(form.querySelectorAll('[aria-invalid]')).forEach(function(f) { f.removeAttribute('aria-invalid'); });
    }
    form.addEventListener('input', function(e) { e.target.removeAttribute && e.target.removeAttribute('aria-invalid'); });
    function showError(text) {
      errText.textContent = text;
      errBox.classList.remove('hidden');
      errBox.focus();
    }
    function busy(on) {
      button.disabled = on;
      if (on) {
        // Lucide "loader-circle" (ISC): gira solo senza prefers-reduced-motion
        button.innerHTML = '<svg class="bk-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><span>Sending…</span>';
        live.textContent = 'Sending…';
      } else {
        button.innerHTML = buttonLabel;
      }
    }
    // Mostra ogni campo sbagliato con il suo messaggio, in inglese, nel riquadro d'errore.
    function fieldProblems(keys) {
      var list = keys.map(function(k) { return FIELD_MESSAGE[k]; }).filter(Boolean);
      var first = keys.map(function(k) { return form.elements[k]; }).find(Boolean);
      keys.forEach(function(k) { var f = form.elements[k]; if (f && f.setAttribute) { f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', 'book-error'); } });
      showError(list.length ? list.join(' ') : GENERIC);
      if (first && first.focus) first.focus();
    }
    function read() {
      var el = form.elements;
      return {
        tratta: el.tratta.value, direzione: el.direzione.value, mezzo: el.mezzo.value,
        pax: Number(el.pax.value), bagagli: equivalentBags(),
        bagagli_imbarcati: Number(el.bagagli_imbarcati.value), bagagli_mano: Number(el.bagagli_mano.value),
        data: el.data.value, ora: el.ora.value, volo: el.volo.value.trim(),
        indirizzo: el.indirizzo.value.trim(), nome: el.nome.value.trim(),
        telefono: el.telefono.value.trim(), email: el.email.value.trim(),
        note: el.note.value.trim(), consenso: el.consenso.checked, termini: el.termini.checked, sito_web: el.sito_web.value
      };
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (button.disabled) return;
      hideBoxes();
      // Il browser controlla i campi obbligatori e i formati prima dell'invio.
      validateName(); validatePhone();
      if (!form.checkValidity()) {
        var bad = [].slice.call(form.elements).filter(function(f) { return f.name && f.willValidate && !f.validity.valid; });
        fieldProblems(bad.map(function(f) { return f.name; }));
        return;
      }
      busy(true);
      var ctrl = new AbortController();
      var timer = setTimeout(function() { ctrl.abort(); }, 20000);
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(read()),
        signal: ctrl.signal
      }).then(function(r) {
        return r.json().catch(function() { return {}; }).then(function(body) { return { status: r.status, body: body }; });
      }).then(function(res) {
        busy(false);
        if (res.status === 200 && res.body.ok) {
          document.getElementById('book-ref').textContent = res.body.codice ? ' (reference ' + res.body.codice + ')' : '';
          document.getElementById('book-price').textContent = res.body.prezzo ? '\u20AC' + res.body.prezzo : 'in our email';
          sent.classList.remove('hidden');
          sent.focus();
          live.textContent = 'Request sent.';
          form.reset();
          syncDirection();
          syncVehicle();
          updateTrip();
          if (window.gtag) window.gtag('event', 'richiesta_privati');
        } else if (res.status === 400 && res.body.errori) {
          fieldProblems(Object.keys(res.body.errori));
        } else if (res.status === 429) {
          showError('Too many requests from this connection. Please try again later, or message us on WhatsApp.');
        } else {
          showError(GENERIC);
        }
      }).catch(function() {
        busy(false);
        showError(GENERIC);
      }).finally(function() { clearTimeout(timer); });
    });
  })();

  // Arrivo da una pagina di destinazione (catania-airport-to-<tratta>.html): la tratta e' gia' scelta nel modulo.
  (function() {
    var q = new URLSearchParams(location.search).get('tratta'), f = document.getElementById('book-form');
    if (!q || !f || !f.elements.tratta) return;
    var ok = [].some.call(f.elements.tratta.options, function(o) { return o.value === q; });
    if (ok) { f.elements.tratta.value = q; f.elements.tratta.dispatchEvent(new Event('change', { bubbles: true })); }
  })();
