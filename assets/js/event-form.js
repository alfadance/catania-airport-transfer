// Event request form (events, event transportation, wedding transfers). The form posts to request-event.php,
// which sends the visitor back to the same page with ?event=sent or ?event=error.
// On send the fields are kept in sessionStorage, so after an error the visitor finds them filled in again.
// The Google Analytics event for a sent request is handled by consent.js, which only runs it after consent.
const form = document.querySelector('form[action="request-event.php"]');
const FIELDS = ['name', 'agency', 'country', 'email', 'etype', 'date', 'venue', 'guests', 'arrival', 'message'];
const storageKey = form?.dataset.storageKey;

const read = () => {
  try { return JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch { return {}; }
};

if (form) {
  const SPINNER = '<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><span>Sending…</span>';

  form.addEventListener('submit', () => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(FIELDS.map((name) => [name, form.elements[name].value]))));
    } catch {}
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.innerHTML = SPINNER;
    const live = document.getElementById('event-live');
    if (live) live.textContent = 'Sending…';
  });

  const outcome = new URLSearchParams(location.search).get('event');
  if (outcome === 'error') {
    const saved = read();
    FIELDS.forEach((name) => { if (saved[name]) form.elements[name].value = saved[name]; });
  }
  if (outcome === 'sent') {
    try { sessionStorage.removeItem(storageKey); } catch {}
  }
  const box = document.getElementById(`event-${outcome}`);
  if (box) {
    box.hidden = false;
    // Focus after the page has loaded, and without the query string in the address bar.
    const show = () => {
      box.focus();
      history.replaceState(null, '', `${location.pathname}#event-request`);
    };
    if (document.readyState === 'complete') show(); else addEventListener('load', show);
  } else if (outcome === 'sent' || outcome === 'error') {
    history.replaceState(null, '', `${location.pathname}#event-request`);
  }
}
