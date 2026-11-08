// Adds the route and the source to every WhatsApp link, so a chat arrives already written and the owner sees where it comes from.
// The source comes from the UTM parameters of the first page of the visit (kept for the session), e.g. "google-gbp" or "whatsapp-catalogo".
const WHATSAPP = '393200528300';
const STORE_KEY = 'cat-source';
const BASE = `https://wa.me/${WHATSAPP}`;

const clean = (value) => value.toLowerCase().replace(/[^a-z0-9-]+/g, '').slice(0, 30);

export function sourceFromSearch(search) {
  const params = new URLSearchParams(search);
  const source = clean(params.get('utm_source') || '');
  if (!source) {
    // ?da=<pagina>: il link di una pagina del sito verso il modulo dice da quale pagina arriva la richiesta (senza UTM, che sporcherebbero Analytics).
    const page = clean(params.get('da') || '');
    return page ? `pagina-${page}` : '';
  }
  const medium = clean(params.get('utm_medium') || '');
  return medium ? `${source}-${medium}` : source;
}

// The first source wins for the whole visit: a later page without parameters keeps it.
export function rememberSource(storage, search) {
  const fresh = sourceFromSearch(search);
  try {
    if (fresh) storage.setItem(STORE_KEY, fresh);
    return fresh || storage.getItem(STORE_KEY) || '';
  } catch {
    return fresh;
  }
}

// /catania-airport-to-giardini-naxos.html -> "Giardini Naxos"
export function routeFromPath(pathname) {
  const match = /^\/catania-airport-to-([a-z-]+)\.html$/.exec(pathname);
  if (!match) return '';
  return match[1].split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}

export function defaultText(route) {
  return route
    ? `Hello, I'd like to book a private transfer from Catania Airport to ${route}.`
    : "Hello, I'd like to book a private transfer.";
}

export function withRef(text, source) {
  if (!source || text.includes('[ref:')) return text;
  return `${text} [ref: ${source}]`;
}

// Returns the link with the message filled in; any other link comes back unchanged.
export function enhanceHref(href, { route = '', source = '' } = {}) {
  if (!href.startsWith(BASE)) return href;
  let text = '';
  try {
    text = new URL(href).searchParams.get('text') || '';
  } catch {
    return href;
  }
  return `${BASE}?text=${encodeURIComponent(withRef(text || defaultText(route), source))}`;
}

export function currentSource() {
  return rememberSource(window.sessionStorage, window.location.search);
}

function enhancePage() {
  const context = { route: routeFromPath(location.pathname), source: currentSource() };
  document.querySelectorAll(`a[href^="${BASE}"]`).forEach((link) => {
    link.href = enhanceHref(link.getAttribute('href'), context);
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest?.(`a[href^="${BASE}"]`) && window.gtag) {
      window.gtag('event', 'contatto_whatsapp', { route: context.route || 'none', source: context.source || 'direct' });
    }
  });
}

if (typeof document !== 'undefined') enhancePage();
