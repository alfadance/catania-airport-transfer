// Cookie consent and Google Analytics. Nothing is loaded from Google until the visitor accepts.
const CONSENT_KEY = 'cat_cookie_consent';
const GA_ID = 'G-7F7QCJJL8S';
const banner = document.getElementById('cookie-consent-banner');

// Storage blocked (private browsing, cookies off): treated as "no choice made".
let consent = null;
try { consent = localStorage.getItem(CONSENT_KEY); } catch {}
const store = (value) => { try { localStorage.setItem(CONSENT_KEY, value); } catch {} };

function loadGA() {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

// Opened from "Cookie preferences": focus goes to the banner and, after the choice, back to the button.
let opener = null;
const showBanner = () => { if (banner) banner.hidden = false; };
function hideBanner() {
  if (banner) banner.hidden = true;
  if (opener) { opener.focus(); opener = null; }
}

function choose(value) {
  store(value);
  if (value === 'accepted') loadGA();
  hideBanner();
}

document.addEventListener('click', (event) => {
  if (event.target.closest?.('a[href^="mailto:"]') && window.gtag) window.gtag('event', 'contatto_email');
});

if (consent === 'accepted') loadGA();
else if (consent !== 'rejected') showBanner();

// Result of the rates form: request-rates.php sends the visitor back with ?rates=sent or ?rates=error.
if (new URLSearchParams(location.search).get('rates') === 'sent' && window.gtag) window.gtag('event', 'richiesta_tariffe');

// Result of the event forms (request-event.php): ?event=sent. Read before event-form.js empties the saved fields.
if (new URLSearchParams(location.search).get('event') === 'sent' && window.gtag) {
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem('events_form') || sessionStorage.getItem('event_form') || '{}'); } catch {}
  window.gtag('event', 'richiesta_evento', { tipo_evento: saved.etype || 'unknown' });
}

document.getElementById('cookie-consent-accept')?.addEventListener('click', () => choose('accepted'));
document.getElementById('cookie-consent-reject')?.addEventListener('click', () => choose('rejected'));
document.getElementById('cookie-consent-manage')?.addEventListener('click', (event) => {
  opener = event.currentTarget;
  showBanner();
  banner?.focus();
});
