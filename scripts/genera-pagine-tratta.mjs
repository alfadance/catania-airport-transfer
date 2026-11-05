// Genera, per ogni destinazione del modulo di prenotazione privati, i sorgenti della pagina catania-airport-to-<tratta>.html
// nella nuova veste: veste/src/pages/route-<tratta>.page.json (dati della pagina) e route-<tratta>.html (corpo).
// Intestazione, piede, consenso cookie e script comuni li mette il layout; la pagina nella radice la scrive `node veste/build.mjs`.
// Gli stili stanno in veste/src/pages/_route-page.css, la mappa in veste/src/assets/js/route-page.js.
// Uso, dalla radice del sito:  node scripts/genera-pagine-tratta.mjs && node veste/build.mjs
// Dati: assets/prezzi-sito.json (prezzi) e assets/routes-privati.json (km). I minuti vengono dalla matrice
// prezzi/listino-agenzie-2027/tools/distanze.json del vault (CTA|<tratta>, traffico storico tipico, fascia piu' lunga,
// 8/9/2026): se cambiano la', si aggiornano qui sotto.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGINE = join(RADICE, 'veste/src/pages');
const BASE = 'https://cataniaairporttransfer.net';
const prezzi = JSON.parse(readFileSync(join(RADICE, 'assets/prezzi-sito.json'), 'utf8')).tratte;
const km = JSON.parse(readFileSync(join(RADICE, 'assets/routes-privati.json'), 'utf8')).tratte;

// minuti: dalla matrice del vault (CTA -> destinazione). Testi: solo fatti noti e verificabili, nessuna esperienza personale.
const TRATTE = [
  { id: 'taormina', nome: 'Taormina', min: 56, via: 'along the A18 motorway and the Ionian coast',
    titolo: 'Taormina',
    testo: ['Taormina sits on a hillside terrace above the Ionian Sea. Most guests come for its ancient theatre, the main street Corso Umberto and the views of Mount Etna.',
            'Isola Bella and the hilltop village of Castelmola are close by, and Giardini Naxos is on the bay below.'] },
  { id: 'giardini-naxos', nome: 'Giardini Naxos', min: 48, via: 'along the A18 motorway and the Ionian coast',
    titolo: 'Giardini Naxos',
    testo: ['Giardini Naxos lies on a wide bay at the foot of Taormina, with a long seafront. The archaeological site of Naxos, the first Greek colony in Sicily, is here.',
            'From the town, Taormina is a short drive up the hill.'] },
  { id: 'siracusa', nome: 'Siracusa', min: 48, via: 'by motorway towards the south of the island',
    titolo: 'Siracusa (Syracuse)',
    testo: ['The old town of Syracuse, Ortigia, is a small island joined to the mainland by bridges. The Neapolis Archaeological Park, with its Greek theatre, is on the mainland.',
            'Syracuse is on the UNESCO World Heritage list.'] },
  { id: 'catania', nome: 'Catania', min: 22, via: 'to the city centre',
    titolo: 'Catania city centre',
    testo: ['The city centre is the closest destination to the airport. Piazza del Duomo, the Elephant Fountain and the fish market, La Pescheria, are in the old town.',
            'Mount Etna rises behind the city.'] },
  { id: 'milazzo', nome: 'Milazzo', min: 103, via: 'by motorway across the north-east of the island',
    titolo: 'Milazzo',
    testo: ['Milazzo is the port where hydrofoils and ferries leave for the Aeolian Islands. The castle and the Capo Milazzo peninsula are also here.',
            'It is the longest of our five destinations from the airport: plan the departure with some margin if you have a boat to catch.'] },
];

const eur = (n) => `€${n}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const prezziDi = (id) => prezzi.find((x) => x.id === id).prezzi;

function faq(t, p, kmDest) {
  return [
    [`How long is the drive from Catania Airport to ${t.nome}?`,
      `About ${t.min} minutes by car (${kmDest} km). The time is calculated for a typical weekday with usual traffic in the morning and in the afternoon, and we keep the longer one.`],
    [`How much does the transfer to ${t.nome} cost?`,
      `The price is for the whole vehicle, VAT included. Business Sedan (Mercedes-Benz E-Class, up to 3 passengers): ${eur(p.business_sedan.giorno)} by day, ${eur(p.business_sedan.notte)} at night. Business Minivan (Mercedes-Benz V-Class or equivalent, up to 7 passengers): ${eur(p.business_minivan.giorno)} by day, ${eur(p.business_minivan.notte)} at night. Night is from 22:00 to 06:00. The booking form shows the exact price for your day and time.`,
      `<p>One price for the whole vehicle, VAT included, however many passengers travel.</p>
        <table class="route-table">
          <caption>Prices from Catania Airport to ${esc(t.nome)}, VAT included</caption>
          <thead><tr><th scope="col">Vehicle</th><th scope="col">Day</th><th scope="col">Night</th></tr></thead>
          <tbody>
            <tr><th scope="row">Business Sedan<small>Mercedes-Benz E-Class, up to 3 passengers</small></th><td>${eur(p.business_sedan.giorno)}</td><td>${eur(p.business_sedan.notte)}</td></tr>
            <tr><th scope="row">Business Minivan<small>Mercedes-Benz V-Class or equivalent, up to 7 passengers</small></th><td>${eur(p.business_minivan.giorno)}</td><td>${eur(p.business_minivan.notte)}</td></tr>
          </tbody>
        </table>
        <p>Night rate applies from 22:00 to 06:00. The booking form shows the exact price for your day and time.</p>`],
    ['What if my flight is late?', 'Give us your flight number. We monitor flight status in real time, and your chauffeur adjusts the pick-up time accordingly. With a flight number, free waiting is 60 minutes after landing. Without it, it is 15 minutes.'],
    ['When is my booking confirmed?', 'When you have paid. Until then it is only a request. We send a second email when the booking is confirmed. The payment link works for 24 hours.'],
    [`Can I book the way back from ${t.nome} to the airport?`, 'Yes. Choose "To Catania Airport" in the booking form.'],
  ];
}

function datiPagina(t) {
  const p = prezziDi(t.id);
  const kmDest = Math.round(km[t.id].km);
  const url = `${BASE}/catania-airport-to-${t.id}.html`;
  const domande = faq(t, p, kmDest);
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Book a transfer', item: `${BASE}/book-a-transfer.html` },
        { '@type': 'ListItem', position: 3, name: `Catania Airport to ${t.nome}`, item: url } ] },
      { '@type': 'Service', name: `Private transfer from Catania Airport to ${t.nome}`, serviceType: 'Private chauffeur transfer',
        areaServed: 'Sicily', url,
        provider: { '@type': 'LocalBusiness', name: 'Catania Airport Transfer', url: `${BASE}/`, telephone: '+39 320 052 8300', email: 'info@cataniaairporttransfer.net' },
        offers: { '@type': 'Offer', priceCurrency: 'EUR', price: String(p.business_sedan.giorno), url: `${BASE}/book-a-transfer.html?tratta=${t.id}#book` } },
      { '@type': 'FAQPage', mainEntity: domande.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
  };
  const titolo = `Private Transfer Catania Airport to ${t.nome} | Catania Airport Transfer`;
  const descr = `Private transfer from Catania Airport to ${t.nome}: about ${t.min} minutes, from ${eur(p.business_sedan.giorno)} for the whole vehicle, VAT included. See the price on the form. We reply by email with a payment link.`;
  const head = [
    '<meta property="og:site_name" content="Catania Airport Transfer">',
    `<meta property="og:image" content="${BASE}/assets/og-image.jpg">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="Black chauffeur car at Catania Airport with Mount Etna in the background">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${JSON.stringify(ld).replaceAll('<', '\\u003c')}</script>`,
  ].join('\n');
  return { titolo, descr, head, domande, p, kmDest, url };
}

const CTA = (id) => `/book-a-transfer.html?tratta=${id}#book`;

function corpo(t, d) {
  const { p, kmDest, domande } = d;
  const cta = CTA(t.id);
  const faqHtml = domande.map(([q, a, html]) => `
      <details>
        <summary>${esc(q)}</summary>
        ${html ? `<div class="route-answer">${html}</div>` : `<p>${esc(a)}</p>`}
      </details>`).join('');
  const altre = TRATTE.filter((x) => x.id !== t.id).map((x) => {
    const px = prezziDi(x.id).business_sedan.giorno;
    return `
      <a class="place-row" href="/catania-airport-to-${x.id}.html"><span><strong>Catania Airport to ${esc(x.nome)}</strong><small>About ${x.min} min · ${Math.round(km[x.id].km)} km</small></span><b class="row-price"><small>From</small> ${eur(px)}</b></a>`;
  }).join('');
  return `<div class="dark hero-band">
  <section class="page-hero wrap route-hero" aria-labelledby="route-title">
    <h1 id="route-title">Catania Airport to ${esc(t.nome)}</h1>
    <p class="sub">A private transfer with a chauffeur. About ${t.min} minutes by car ${esc(t.via)}. Choose your day, time and car and the price shows at once. We reply by email with a payment link.</p>
    <div class="route-actions"><a class="solid-button" href="${cta}">See the price and book</a></div>
  </section>
</div>

<main id="content">
  <section id="about" class="section wrap route-about" aria-labelledby="route-about-title">
    <div class="route-side">
      <h2 id="route-about-title">${esc(t.titolo)}</h2>
      <div class="route-card">
        <div id="trip-map" class="map-box route-map" data-route="${t.id}" data-price="${p.business_sedan.giorno}" role="img" aria-label="Map of the route between Catania Airport and ${esc(t.nome)}, about ${kmDest} kilometres"></div>
        <p class="route-trip"><strong>Catania Airport</strong> to <strong>${esc(t.nome)}</strong><br>About ${kmDest} km by road</p>
      </div>
    </div>
    <div class="route-main">
      <dl class="route-facts">
        <div><dt>Drive time</dt><dd>${t.min} min<small>${kmDest} km, typical weekday</small></dd></div>
        <div><dt>Business Sedan, up to 3</dt><dd>${eur(p.business_sedan.giorno)}<small>${eur(p.business_sedan.notte)} at night</small></dd></div>
        <div><dt>Business Minivan, up to 7</dt><dd>${eur(p.business_minivan.giorno)}<small>${eur(p.business_minivan.notte)} at night</small></dd></div>
      </dl>
      <p>Prices are for the whole vehicle, VAT included. Night rate applies from 22:00 to 06:00.</p>
${t.testo.map((x) => `      <p>${esc(x)}</p>`).join('\n')}
      <p>Book at least 24 hours before pickup. Add your flight number in the form: we follow your flight, and with a flight number free waiting is 60 minutes after landing.</p>
      <p><a class="solid-button" href="${cta}">Book Catania Airport to ${esc(t.nome)}</a></p>
    </div>
  </section>

  <section id="faq" class="section wrap faq route-faq" aria-labelledby="route-faq-title">
    <h2 id="route-faq-title">Questions about this transfer</h2>${faqHtml}
  </section>

  <section class="section wrap route-others" aria-labelledby="route-others-title">
    <h2 id="route-others-title">Other destinations</h2>
    <div class="place-list">${altre}
    </div>
  </section>
</main>
`;
}

const json = (obj) => `${JSON.stringify(obj, null, 2)}\n`;

for (const t of TRATTE) {
  const d = datiPagina(t);
  writeFileSync(join(PAGINE, `route-${t.id}.html`), corpo(t, d), 'utf8');
  writeFileSync(join(PAGINE, `route-${t.id}.page.json`), json({
    out: `catania-airport-to-${t.id}.html`,
    path: `/catania-airport-to-${t.id}.html`,
    title: d.titolo,
    description: d.descr,
    body: `src/pages/route-${t.id}.html`,
    script: 'route-page.js',
    head: d.head,
  }), 'utf8');
  console.log('scritto', t.id);
}
