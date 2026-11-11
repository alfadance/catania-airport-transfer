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

// Senza UTM ne' ?da=, l'origine e' la prima pagina della visita (titolare, 2026-11-11): cosi' una richiesta dice quale pagina
// del sito l'ha portata, anche se il visitatore arriva da Google su una pagina di tratta e poi apre il modulo in home.
// "/" e "/index.html" -> "diretto"; "/catania-airport-to-agrigento.html" -> "pagina-catania-airport-to-agrigento".
export function sourceFromPath(pathname) {
  const slug = (pathname || '').replace(/^\/+|\/+$/g, '').replace(/\.html$/, '').replace(/\//g, '-')
    .toLowerCase().replace(/[^a-z0-9-]+/g, '').slice(0, 50);
  return !slug || slug === 'index' ? 'diretto' : `pagina-${slug}`;
}

// The first source wins for the whole visit: a later page without parameters keeps it.
// With `pathname`, a visit with no source yet takes its landing page as source.
export function rememberSource(storage, search, pathname) {
  const fresh = sourceFromSearch(search);
  const landing = () => (pathname === undefined ? '' : sourceFromPath(pathname));
  try {
    if (fresh) {
      storage.setItem(STORE_KEY, fresh);
      return fresh;
    }
    const kept = storage.getItem(STORE_KEY);
    if (kept) return kept;
    const first = landing();
    if (first) storage.setItem(STORE_KEY, first);
    return first;
  } catch {
    return fresh || landing();
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
  if (!source || source === 'diretto' || text.includes('[ref:')) return text;
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
  return rememberSource(window.sessionStorage, window.location.search, window.location.pathname);
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
