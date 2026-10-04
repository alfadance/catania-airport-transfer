// Controlli statici delle pagine evento: i tre moduli restano identici nei campi, il menu ha una voce sola,
// l'hub e' in Tailwind ma non e' ne' indicizzabile ne' in sitemap. Uso: node --test scripts/verifica/eventi-check.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, ROOT), 'utf8');

const FORM_PAGES = [
  { file: 'events.html', page: 'hub' },
  { file: 'wedding-transfers-taormina.html', page: 'wedding' },
  { file: 'event-transportation-sicily.html', page: 'events' },
];
const ETYPES = ['wedding', 'conference', 'show', 'film', 'corporate', 'other'];
const FIELDS = ['agency', 'arrival', 'country', 'date', 'email', 'etype', 'guests', 'message', 'name', 'venue', 'website'];

function formOf(html) {
  const found = html.match(/<form action="request-event\.php"[\s\S]*?<\/form>/g) || [];
  assert.equal(found.length, 1, 'esattamente un modulo request-event.php');
  return found[0];
}
const headerOf = (html) => (html.match(/<header[\s\S]*?<\/header>/) || [''])[0];

for (const { file, page } of FORM_PAGES) {
  test(`${file}: stessi campi degli altri moduli`, () => {
    const form = formOf(read(file));
    const names = [...form.matchAll(/<(?:input|select|textarea)\b[^>]*?\sname="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(names.filter((n) => n !== 'page').sort(), FIELDS);
  });

  test(`${file}: campo nascosto page=${page}`, () => {
    const form = formOf(read(file));
    assert.match(form, new RegExp(`<input type="hidden" name="page" value="${page}">`));
    assert.doesNotMatch(form, /name="form"/, 'il vecchio campo form non va piu\' mandato');
  });

  test(`${file}: tendina etype con le sei opzioni nell'ordine`, () => {
    const select = (formOf(read(file)).match(/<select name="etype"[\s\S]*?<\/select>/) || [''])[0];
    const values = [...select.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
    assert.deepEqual(values, ['', ...ETYPES]);
  });

  test(`${file}: lo script salva etype e manda tipo_evento a GA4`, () => {
    const html = read(file);
    assert.match(html, /var FIELDS = \[[^\]]*'etype'[^\]]*\];/);
    assert.match(html, /window\.gtag\('event', 'richiesta_evento', \{ tipo_evento: tipo \}\)/);
  });
}

test('la pagina matrimoni parte con Wedding scelto', () => {
  assert.match(read('wedding-transfers-taormina.html'), /<option value="wedding" selected>/);
});

for (const file of ['index.html', 'privacy.html']) {
  test(`${file}: menu con una sola voce Events`, () => {
    const header = headerOf(read(file));
    assert.match(header, /href="events\.html"/);
    assert.doesNotMatch(header, /href="wedding-transfers-taormina\.html"/);
    assert.doesNotMatch(header, /href="event-transportation-sicily\.html"/);
  });
  test(`${file}: il piede di pagina porta hub, matrimoni e eventi aziendali`, () => {
    const html = read(file);
    for (const href of ['events.html', 'wedding-transfers-taormina.html', 'event-transportation-sicily.html']) {
      assert.ok(html.includes(`<a href="${href}" class="footer-link w-full">`), `footer: ${href}`);
    }
  });
}

for (const file of ['wedding-transfers-taormina.html', 'event-transportation-sicily.html']) {
  test(`${file}: la testata rimanda all'hub`, () => {
    assert.match(headerOf(read(file)), /href="events\.html"/);
  });
}

test('Tailwind conosce l\'hub', () => {
  assert.match(read('tailwind.config.cjs'), /'\.\/events\.html'/);
});

test('l\'hub non si posiziona: noindex,follow, fuori dalla sitemap, scansionabile', () => {
  // decisione del titolare, 2026-10-04: una pagina per intento; l'hub serve solo a scegliere il tipo di evento
  assert.match(read('events.html'), /<meta name="robots" content="noindex,follow" \/>/);
  assert.doesNotMatch(read('sitemap.xml'), /events\.html/);
  // un Disallow impedirebbe a Google di leggere il noindex
  assert.doesNotMatch(read('robots.txt'), /^\s*Disallow:\s*\/events/im);
});

test('hub: title proprio, canonical proprio, nessun FAQPage, nessun testo vietato', () => {
  const hub = read('events.html');
  const titleOf = (f) => (read(f).match(/<title>([^<]+)<\/title>/) || [])[1];
  assert.ok(titleOf('events.html'), 'title presente');
  for (const other of ['index.html', 'wedding-transfers-taormina.html', 'event-transportation-sicily.html']) {
    assert.notEqual(titleOf('events.html'), titleOf(other), `title diverso da ${other}`);
  }
  assert.match(hub, /<link rel="canonical" href="https:\/\/cataniaairporttransfer\.net\/events\.html" \/>/);
  assert.equal((hub.match(/<h1[\s>]/g) || []).length, 1, 'un solo h1');
  assert.doesNotMatch(hub, /FAQPage/);
  assert.doesNotMatch(hub, /120\+|no hidden extras|partner network/i);
  assert.match(hub, /href="wedding-transfers-taormina\.html"/);
  assert.match(hub, /href="event-transportation-sicily\.html"/);
});

for (const { file } of FORM_PAGES) {
  test(`${file}: ogni link #ancora ha il suo bersaglio`, () => {
    const html = read(file);
    const morti = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))]
      .filter((a) => !html.includes(`id="${a}"`));
    assert.deepEqual(morti, []);
  });
}

test('deploy.yml versiona il CSS di ogni pagina HTML che lo carica', () => {
  const yml = read('.github/workflows/deploy.yml');
  const step = yml.slice(yml.indexOf('Version the CSS URL'));
  assert.ok(step.length > 0, 'passo "Version the CSS URL" presente');
  const pagine = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && read(f).includes('href="assets/tailwind.css"'));
  assert.ok(pagine.length >= 5, 'trovate le pagine che caricano il CSS');
  for (const f of pagine) {
    // una volta nel ciclo che riscrive l'indirizzo, una volta nel conteggio finale
    assert.ok(step.split(f).length - 1 >= 2, `${f}: manca nel passo che versiona il CSS`);
  }
});
