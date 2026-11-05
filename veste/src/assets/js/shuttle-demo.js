// Animation of the worked example on the wedding page, two scenes. Everything is computed from the time t
// (minutes from the start of the scene), so the slider and Play show the same state.
// Times: 25 min each way on arrival (loaded), 20 on the return, 8 to load.
const root = document.getElementById('shuttle-demo');

if (root) {
  const $ = (id) => document.getElementById(id);
  const clock = $('sd-clock'), count = $('sd-count'), countLabel = $('sd-count-label'), caption = $('sd-caption');
  const btn = $('sd-play'), slider = $('sd-time'), from = $('sd-from'), to = $('sd-to');
  const buses = [...root.querySelectorAll('[data-bus]')], lanes = [...root.querySelectorAll('[data-lane]')];
  const badges = [...root.querySelectorAll('[data-badge]')], icons = [...root.querySelectorAll('[data-icon] svg')];
  const tabs = [...root.querySelectorAll('[data-scene]')];
  const GUESTS = 50;

  function dots(id) {
    const box = $(id);
    return Array.from({ length: GUESTS }, () => {
      const dot = document.createElement('span');
      dot.className = 'sd-dot';
      box.appendChild(dot);
      return dot;
    });
  }
  const hotel = dots('sd-hotel'), venue = dots('sd-venue');
  const hhmm = (base, t) => {
    const m = (base + Math.floor(t)) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  };

  // Scene 0, arrival: from the hotel (p = 0) to the villa (p = 1). t = 0 at 13:30.
  const arrival = {
    base: 810, max: 90, endAt: 78, speed: 0.005, label: 'At the venue', from: '13:30', to: '15:00',
    pos: (b, t) => (t < 25 ? t / 25 : t < 45 ? 1 - (t - 25) / 20 : t < 53 ? 0 : t < 78 ? (t - 53) / 25 : 1),
    back: (b, t) => t >= 25 && t < 45,
    aboard: (b, t) => (t < 25 ? 19 : t < 47 ? 0 : t < 78 ? 6 : 0),
    hotel: (t) => (t < 0.5 ? 50 : t < 47 ? 12 : 0),
    venue: (t) => (t < 25 ? 0 : t < 78 ? 38 : 50),
    count: (t) => (t < 25 ? 0 : t < 78 ? 38 : 50),
    say: (t) => {
      if (t < 25) return 'Trip 1: each minibus carries 19 guests to the venue. It takes 25 minutes.';
      if (t < 45) return '38 guests are at the venue. The minibuses drive back to the hotel.';
      if (t < 53) return 'Loading the last 12 guests.';
      if (t < 78) return 'Trip 2: the last 12 guests ride to the venue.';
      return 'All 50 guests are at the venue at 14:48, 12 minutes before the 15:00 deadline.';
    },
  };

  // Scene 1, return: from the villa (p = 1) to the hotel (p = 0). t = 0 at 23:20. One departure about every 25 minutes, in turn.
  const DEP = [10, 35, 63, 88, 116, 141], LOAD = [10, 8, 9, 7, 9, 7], BUSOF = [0, 1, 0, 1, 0, 1];
  const last = (b, t) => {
    let k = -1;
    for (let i = 0; i < DEP.length; i++) if (BUSOF[i] === b && DEP[i] <= t) k = i;
    return k;
  };
  const sum = (test) => LOAD.reduce((n, load, i) => (test(i) ? n + load : n), 0);
  const ret = {
    base: 1400, max: 170, endAt: 166, speed: 0.0085, label: 'Back at the hotel', from: '23:20', to: '02:10',
    pos: (b, t) => {
      const k = last(b, t);
      if (k < 0) return 1;
      const d = t - DEP[k];
      return d < 25 ? 1 - d / 25 : d < 45 ? (d - 25) / 20 : 1;
    },
    back: (b, t) => { const k = last(b, t); return k >= 0 && t - DEP[k] < 25; },
    aboard: (b, t) => {
      for (let i = 0; i < DEP.length; i++) if (BUSOF[i] === b && t >= DEP[i] - 3 && t < DEP[i] + 25) return LOAD[i];
      return 0;
    },
    hotel: (t) => GUESTS - sum((i) => DEP[i] + 25 <= t),
    venue: (t) => GUESTS - sum((i) => DEP[i] - 3 <= t),
    count: (t) => sum((i) => DEP[i] + 25 <= t),
    say: (t) => {
      let k = -1;
      for (let i = 0; i < DEP.length; i++) if (DEP[i] - 3 <= t) k = i;
      if (k < 0) return 'The party is still on. Both minibuses wait at the venue.';
      if (t >= 166) return 'All 50 guests are back at the hotel. With a departure about every 25 minutes, guests are not tied to a single time.';
      return `Departure ${k + 1} of 6, at ${hhmm(1400, DEP[k])}: ${LOAD[k]} guests ride back to the hotel.`;
    },
  };

  // In the return scene the dots fill the other way round: the villa starts full and the hotel empty.
  const scenes = [arrival, ret];
  let cur = 0, sc = arrival, t = 0, playing = false, lastTs = 0, raf = 0, widths = [];
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const measure = () => { widths = lanes.map((lane) => Math.max(0, lane.clientWidth - 40)); };
  function render() {
    clock.textContent = hhmm(sc.base, t);
    count.textContent = sc.count(t);
    caption.textContent = sc.say(t);
    slider.value = t;
    if (!playing) slider.setAttribute('aria-valuetext', hhmm(sc.base, t));
    buses.forEach((bus, i) => { bus.style.transform = `translateX(${Math.round(sc.pos(i, t) * widths[i])}px)`; });
    icons.forEach((icon, i) => { icon.style.transform = sc.back(i, t) ? 'scaleX(-1)' : ''; });
    badges.forEach((badge, i) => { const a = sc.aboard(i, t); badge.textContent = a; badge.hidden = a === 0; });
    const h = sc.hotel(t), v = sc.venue(t);
    hotel.forEach((dot, i) => dot.classList.toggle('is-on', cur === 0 ? i < h : i < GUESTS - h));
    venue.forEach((dot, i) => dot.classList.toggle('is-on', i < v));
    btn.textContent = playing ? 'Pause' : (t >= sc.endAt ? 'Replay' : 'Play');
  }
  function frame(ts) {
    if (!playing) return;
    const dt = lastTs ? Math.max(0, ts - lastTs) : 0;
    lastTs = ts;
    t = Math.min(sc.endAt, t + dt * sc.speed);
    if (t >= sc.endAt) playing = false;
    render();
    if (playing) raf = requestAnimationFrame(frame);
  }
  function play() {
    if (t >= sc.endAt) t = 0;
    playing = true;
    lastTs = 0;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
    render();
  }
  function stop() {
    playing = false;
    cancelAnimationFrame(raf);
  }
  function setScene(i, autoplay) {
    cur = i; sc = scenes[i]; t = 0;
    stop();
    tabs.forEach((tab, j) => tab.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
    slider.max = sc.max; from.textContent = sc.from; to.textContent = sc.to; countLabel.textContent = sc.label;
    if (autoplay) play(); else { t = sc.endAt; render(); }
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => { if (i !== cur) setScene(i, !still); }));
  btn.addEventListener('click', () => { if (playing) { stop(); render(); } else play(); });
  slider.addEventListener('input', () => {
    stop();
    t = parseFloat(slider.value);
    slider.setAttribute('aria-valuetext', hhmm(sc.base, t));
    render();
  });
  addEventListener('resize', () => { measure(); render(); });

  root.hidden = false;
  measure();
  if (still || !('IntersectionObserver' in window)) {
    t = sc.endAt;
    render();
  } else {
    render();
    // Starts on its own the first time most of it is on screen.
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { io.disconnect(); play(); }
    }, { threshold: 0.6 });
    io.observe(root);
  }
}
