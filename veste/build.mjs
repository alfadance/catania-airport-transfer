// Nuova veste del sito: mette intestazione e piede condivisi attorno a ogni pagina e scrive file statici nella radice del sito.
// Uso, dalla radice del sito:  node veste/build.mjs
// I file generati si committano (come assets/tailwind.css): il deploy controlla che siano aggiornati (node veste/build.mjs, poi git diff).
//
// Scrive: index.html, contact-us/index.html, partners/index.html, altre pagine elencate in `pages` (una per modello in veste/src),
//         assets/styles.css (veste/src/styles.css + ogni veste/src/pages/*.css, in ordine alfabetico),
//         assets/js, assets/img, assets/fonts, assets/vendor, assets/routes.json (dati del motore di prenotazione).
// Non sovrascrive i file che esistono gia' in assets/ (le altre pagine del sito li usano): copia solo quelli nuovi.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOURLY_EXTRAS, KM_INCLUDED_PER_HOUR } from './src/assets/js/pricing.js';

const veste = dirname(fileURLToPath(import.meta.url));
const site = join(veste, '..');
const read = (path) => readFileSync(join(veste, path), 'utf8');

const SITE = 'https://cataniaairporttransfer.net';

// Le tariffe a ore stanno in pricing.js; ogni pagina le prende da li', quindi non possono discordare.
const HOURLY_VALUES = {
  '{{km-per-hour}}': String(KM_INCLUDED_PER_HOUR),
  '{{sedan-extra-hour}}': `€${HOURLY_EXTRAS.sedan.hour}`,
  '{{sedan-extra-km}}': `€${HOURLY_EXTRAS.sedan.km.toFixed(2)}`,
  '{{minivan-extra-hour}}': `€${HOURLY_EXTRAS.minivan.hour}`,
  '{{minivan-extra-km}}': `€${HOURLY_EXTRAS.minivan.km.toFixed(2)}`,
};
const fillHourlyValues = (text) => Object.entries(HOURLY_VALUES).reduce((out, [key, value]) => out.replaceAll(key, value), text);
const footer = read('src/footer.html');
const header = read('src/header.html');

// Script comuni a ogni pagina, nell'ordine in cui si caricano.
const COMMON_SCRIPTS = ['site.js', 'consent.js'];
const scriptTag = (name) => `<script type="module" src="/assets/js/${name}"></script>`;

// `head`: righe in piu' per <head> (es. noindex). `script`: file in assets/js solo di quella pagina, o nessuno.
// `bodyClass` e `current` sono facoltativi. `faq-booking` si riempie solo se il corpo lo cita.
function render({ body, title, description, path, current, script, head = '' }) {
  const scripts = [...COMMON_SCRIPTS, ...(script ? [script] : [])].map(scriptTag).join('\n');
  let html = read('src/layout.html')
    .replace('{{header}}', header)
    .replace('{{footer}}', footer)
    .replace('{{body}}', read(body))
    .replace('{{faq-booking}}', read('src/faq-booking.html'))
    .replace('{{head}}', head)
    .replace('{{scripts}}', scripts)
    .replaceAll('{{title}}', title)
    .replaceAll('{{description}}', description)
    .replaceAll('{{url}}', SITE + path);
  if (current) html = html.replace(`data-nav="${current}"`, 'aria-current="page"');
  return fillHourlyValues(html.replace(/ data-nav="\w+"/g, ''));
}

const corePages = [
  {
    out: 'index.html',
    path: '/',
    body: 'src/home.html',
    current: 'home',
    script: 'booking.js',
    title: 'Catania Airport Transfer | Private Transfers in Sicily',
    description: 'Fixed-price private airport transfers across Sicily from Catania Airport. Flights tracked, licensed drivers, and a chauffeur by the hour.',
  },
  {
    out: 'contact-us/index.html',
    path: '/contact-us/',
    body: 'src/contact.html',
    current: 'contact',
    script: 'contact.js',
    title: 'Contact us | Catania Airport Transfer',
    description: 'Talk to Catania Airport Transfer by WhatsApp, phone or email about a private transfer anywhere in Sicily.',
  },
  {
    out: 'partners/index.html',
    path: '/partners/',
    body: 'src/partners.html',
    current: 'partners',
    script: 'partners.js',
    title: 'Work with us | Catania Airport Transfer',
    description: 'For travel agencies, NCC drivers, hotels and event planners: work with a licensed private transfer operator across Sicily.',
  },
];

// Le pagine vecchie riadattate stanno in veste/src/pages: <nome>.page.json (out, path, title, description, body, script?, head?, current?),
// <nome>.html (il corpo) e <nome>.css (gli stili). Un file per pagina: chi lavora su una pagina non tocca le altre.
function adaptedPages() {
  const dir = join(veste, 'src/pages');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => name.endsWith('.page.json')).sort()
    .map((name) => JSON.parse(read(`src/pages/${name}`)));
}

export const pages = [...corePages, ...adaptedPages()];

// Copia i file di src/assets che non esistono ancora in assets/: mai sovrascrivere (ne' cancellare) quello che c'e'.
function copyNew(fromDir, toDir) {
  mkdirSync(toDir, { recursive: true });
  for (const entry of readdirSync(fromDir, { withFileTypes: true })) {
    const from = join(fromDir, entry.name);
    const to = join(toDir, entry.name);
    if (entry.isDirectory()) copyNew(from, to);
    else if (!existsSync(to)) cpSync(from, to);
  }
}

// Gli stili di una pagina vecchia riadattata stanno in veste/src/pages/<nome>.css: un file per pagina, nessun conflitto fra chi li scrive.
function stylesheet() {
  const dir = join(veste, 'src/pages');
  const extra = existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.css')).sort() : [];
  return [read('src/styles.css'), ...extra.map((name) => `\n/* pages/${name} */\n${read(`src/pages/${name}`)}`)].join('\n');
}

export function build() {
  copyNew(join(veste, 'src/assets'), join(site, 'assets'));
  writeFileSync(join(site, 'assets/styles.css'), stylesheet());
  cpSync(join(veste, 'data/routes.json'), join(site, 'assets/routes.json'));
  for (const page of pages) {
    const target = join(site, page.out);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, render(page));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
