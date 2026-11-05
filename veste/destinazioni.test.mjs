// Le 5 pagine catania-airport-to-<tratta>.html devono mostrare i prezzi di assets/prezzi-sito.json (gli stessi che il server usa per la richiesta),
// portare al modulo con la tratta giusta e restare complete (titolo, canonical, dati strutturati, domande).
// Legge le pagine gia' costruite nella radice: prima `node veste/build.mjs`. Uso, dalla radice del sito:  node --test veste/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leggi = (percorso) => readFileSync(new URL(`../${percorso}`, import.meta.url), 'utf8');
const server = JSON.parse(leggi('assets/prezzi-sito.json')).tratte;
const km = JSON.parse(leggi('assets/routes-privati.json')).tratte;
const TRATTE = ['taormina', 'giardini-naxos', 'siracusa', 'catania', 'milazzo'];
const CONTROLLI_MINIMI = 10 + 5 * 17;   // 10 (elenco e pagine) + almeno 17 per tratta
let controlli = 0;
const uguali = (a, b, msg) => { controlli += 1; assert.equal(a, b, msg); };
const vero = (cond, msg) => { controlli += 1; assert.ok(cond, msg); };

// Prezzi scritti in una zona della pagina, nell'ordine in cui compaiono: "€140".
const prezziIn = (html) => [...html.matchAll(/€(\d+)/g)].map((m) => Number(m[1]));
const zona = (html, da, a) => {
  const inizio = html.indexOf(da);
  return html.slice(inizio, html.indexOf(a, inizio));
};

test('le tratte del server sono le 5 pagine', () => {
  uguali(server.map((t) => t.id).sort().join(), [...TRATTE].sort().join());
  for (const id of TRATTE) vero(readFileSync(new URL(`../catania-airport-to-${id}.html`, import.meta.url)), `pagina ${id} mancante`);
});

for (const id of TRATTE) {
  test(`${id}: prezzi, link, dati strutturati`, () => {
    const html = leggi(`catania-airport-to-${id}.html`);
    const { business_sedan: s, business_minivan: m } = server.find((t) => t.id === id).prezzi;
    const attesi = [s.giorno, s.notte, m.giorno, m.notte];

    // 1. Riquadro dei fatti (sotto la mappa): giorno e notte, Sedan e Minivan.
    const fatti = zona(html, 'class="route-facts"', '</dl>');
    uguali(prezziIn(fatti).join(), [s.giorno, s.notte, m.giorno, m.notte].join(), `${id}: fatti`);
    // 2. Tabella nella risposta sul costo: stessi quattro prezzi.
    const tabella = zona(html, '<table class="route-table"', '</table>');
    uguali(prezziIn(tabella).join(), [s.giorno, s.notte, m.giorno, m.notte].join(), `${id}: tabella`);
    // 3. Testo della risposta (dati strutturati) e dato Offer.
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    const risposta = ld['@graph'].find((x) => x['@type'] === 'FAQPage').mainEntity.find((q) => /cost/.test(q.name)).acceptedAnswer.text;
    uguali(prezziIn(risposta).join(), attesi.join(), `${id}: risposta nel JSON-LD`);
    uguali(ld['@graph'].find((x) => x['@type'] === 'Service').offers.price, String(s.giorno), `${id}: Offer`);
    // 4. Prezzo mostrato sulla mappa.
    vero(html.includes(`data-price="${s.giorno}"`), `${id}: prezzo sulla mappa`);
    // 5. Descrizione: "from €X".
    vero(html.includes(`from €${s.giorno} for the whole vehicle`), `${id}: descrizione`);
    // 6. Link "Book" verso il modulo con la tratta, e nient'altro che porti altrove.
    const book = [...html.matchAll(/href="(\/book-a-transfer\.html[^"]*)"/g)].map((x) => x[1]);
    vero(book.length >= 2, `${id}: link Book`);
    for (const href of book) uguali(href, `/book-a-transfer.html?tratta=${id}#book`, `${id}: link Book`);
    // 7. Km, canonical, og:url, titolo, intestazione, domande.
    vero(html.includes(`${Math.round(km[id].km)} km`), `${id}: km`);
    vero(html.includes(`<link rel="canonical" href="https://cataniaairporttransfer.net/catania-airport-to-${id}.html">`), `${id}: canonical`);
    vero(html.includes('<meta property="og:image" content="https://cataniaairporttransfer.net/assets/og-image.jpg">'), `${id}: og:image`);
    vero(/<title>Private Transfer Catania Airport to [^<]+ \| Catania Airport Transfer<\/title>/.test(html), `${id}: titolo`);
    uguali((html.match(/<details>/g) ?? []).length, 5, `${id}: domande`);
    uguali((html.match(/<h1[ >]/g) ?? []).length, 1, `${id}: un solo h1`);
    vero(/<script type="module" src="\/assets\/js\/route-page\.js">/.test(html), `${id}: script della mappa`);
    vero(!/[—–]/.test(zona(html, '<main', '</main>')), `${id}: niente trattini lunghi nel testo`);
    // 8. Collegamento alle altre 4 destinazioni.
    uguali(TRATTE.filter((x) => x !== id && html.includes(`href="/catania-airport-to-${x}.html"`)).length, 4, `${id}: altre destinazioni`);
  });
}

test('il numero minimo di controlli e\' stato eseguito', () => {
  assert.ok(controlli >= CONTROLLI_MINIMI, `eseguiti ${controlli} controlli, ne servono almeno ${CONTROLLI_MINIMI}`);
});
