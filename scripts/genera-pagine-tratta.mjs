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

// Pagine aggiunte il 2026-11-07 (SEO: ricerche precise, ciclo 01). Fonti, tutte controllate lo stesso giorno:
// - prezzi: assets/js/pricing.js (stesso dato del modulo in home e di prices.html): Agrigento 370/490 e 430/560, Palermo Airport 500/650 e 580/760;
//   Etna: noleggio a ore con punto di partenza il centro di Catania (solo riferimento di questa escursione), 5 ore, HOURLY_FARES.Catania[5] = sedan 300/390, minivan 360/470, 20 km inclusi per ora;
// - km: assets/routes.json (158.2 e 215.6); Etna: Catania>Etna Sud 34.9 km nella matrice del vault (OSRM 35.3), percorso in assets/route-etna.json;
// - minuti: matrice del vault prezzi/listino-agenzie-2027/tools/distanze.json (CTA|Agrigento 102, CTA|Palermo Apt 138); Etna 66 = massimo fra la cache TomTom del vault (63) e TomTom del 2026-11-07 (63 alle 9:30, 66 alle 16:30).
// Il modulo della home accetta /?to=<luogo>#book e /?mode=hourly#book; il modulo delle pagine di tratta ha solo le prime 5 destinazioni.
// Foto dell'intestazione (generate con Higgsfield il 2026-11-07); posizione del ritaglio nella fascia bassa e larga dell'intestazione.
const FOTO_POS = { agrigento: 'center 10%', 'palermo-airport': 'center 52%', etna: 'center 3%' };
const FOTO = {
  agrigento: 'A black Mercedes-Benz E-Class sedan on a country road in Sicily at sunset, with a Greek temple on the hill behind it',
  'palermo-airport': 'A black Mercedes-Benz E-Class sedan on a motorway through the golden hills of inland Sicily, with the sea on the horizon',
  etna: 'A black Mercedes-Benz V-Class van at a viewpoint on the south slope of Mount Etna, with lava fields and the summit behind it',
};
const EXTRA = {
  agrigento: { km: 158.2, cta: '/?to=Agrigento#book', mappa: 'catania-airport-to-agrigento',
    prezzi: { business_sedan: { giorno: 370, notte: 490 }, business_minivan: { giorno: 430, notte: 560 } } },
  'palermo-airport': { km: 215.6, cta: '/?to=Palermo%20Airport%20(PMO)#book', mappa: 'catania-airport-to-palermo-airport',
    prezzi: { business_sedan: { giorno: 500, notte: 650 }, business_minivan: { giorno: 580, notte: 760 } } },
  etna: { km: 34.9, cta: '/?mode=hourly#book', mappa: 'etna', file: '/assets/route-etna.json',
    prezzi: { business_sedan: { giorno: 300, notte: 390 }, business_minivan: { giorno: 360, notte: 470 } } },
};
TRATTE.push(
  { id: 'agrigento', nome: 'Agrigento', min: 102, via: 'by road across the centre of the island',
    titolo: 'Agrigento',
    testo: ['Agrigento is best known for the Valley of the Temples, a UNESCO World Heritage site with Greek temples on a ridge facing the sea.',
            'It is a long transfer: about 1 hour 40 minutes by car. Many guests break the journey, or book it as a one-way transfer between the east and the south-west of Sicily.'] },
  { id: 'palermo-airport', nome: 'Palermo Airport', min: 138, via: 'by motorway across the island',
    titolo: 'Palermo Airport (PMO)',
    testo: ['Palermo Airport (PMO) is the main airport in the west of Sicily. This transfer is useful if you land in Catania and fly home from Palermo, or the other way round.',
            'It is one of the longest transfers we offer: about 2 hours 20 minutes by car. Plan the pick-up with a margin if you have a flight to catch, and add your flight number to the booking.'] },
  { id: 'etna', nome: 'Mount Etna', min: 66, via: 'to the south side of the volcano', orario: true,
    titolo: 'Mount Etna with a private driver',
    testo: ['Mount Etna is the highest active volcano in Europe and a UNESCO World Heritage site. The south side, around Rifugio Sapienza, is the usual starting point for visits.',
            'We take you there with a chauffeur booked by the hour, starting and ending in the centre of Catania, which is the reference point for this excursion only. Cable car and guided excursions to the higher craters are bought on site and are not included in our price. It is colder on the mountain than on the coast: bring a jacket.'] },
);

const CTA = (id) => EXTRA[id]?.cta ?? `/book-a-transfer.html?tratta=${id}#book`;
const eur = (n) => `€${n}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const prezziDi = (id) => EXTRA[id]?.prezzi ?? prezzi.find((x) => x.id === id).prezzi;
const kmDi = (id) => EXTRA[id]?.km ?? km[id].km;

function faq(t, p, kmDest) {
  if (t.orario) return faqEtna(t, p, kmDest);
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

function faqEtna(t, p, kmDest) {
  return [
    ['How long is the drive from the centre of Catania to Mount Etna?',
      `About ${t.min} minutes by car to the south side, around Rifugio Sapienza (${kmDest} km). The time is calculated for a typical weekday, and we keep the longer one.`],
    ['How much does a private driver to Mount Etna cost?',
      `We hire the vehicle with a chauffeur by the hour, from and back to the centre of Catania. Five hours: Business Sedan (up to 3 passengers) ${eur(p.business_sedan.giorno)} by day and ${eur(p.business_sedan.notte)} at night; Business Minivan (up to 7 passengers) ${eur(p.business_minivan.giorno)} by day and ${eur(p.business_minivan.notte)} at night. The price is for the whole vehicle, VAT included. Each hour includes 20 km. The booking form shows the price for other durations.`],
    ['Are the cable car and the excursions included?',
      'No. Cable car tickets and guided excursions to the higher craters are bought on site, and they are not in our price. Your driver takes you to the starting point and waits for you.'],
    ['What if my flight is late?', 'Give us your flight number. We monitor flight status in real time, and your chauffeur adjusts the pick-up time accordingly. With a flight number, free waiting is 60 minutes after landing. Without it, it is 15 minutes.'],
    ['When is my booking confirmed?', 'When you have paid. Until then it is only a request. We send a second email when the booking is confirmed. The payment link works for 24 hours.'],
  ];
}

function datiPagina(t) {
  const p = prezziDi(t.id);
  const kmDest = Math.round(kmDi(t.id));
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
        offers: { '@type': 'Offer', priceCurrency: 'EUR', price: String(p.business_sedan.giorno), url: `${BASE}${CTA(t.id)}` } },
      { '@type': 'FAQPage', mainEntity: domande.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
  };
  const titolo = t.orario ? 'Private Driver to Mount Etna from Catania | Catania Airport Transfer' : `Private Transfer Catania Airport to ${t.nome} | Catania Airport Transfer`;
  const descr = t.orario ? `Private driver to Mount Etna from Catania: about ${t.min} minutes to the south side, 5 hours from ${eur(p.business_sedan.giorno)} for the whole vehicle, VAT included. Cable car not included. We reply by email with a payment link.` : `Private transfer from Catania Airport to ${t.nome}: about ${t.min} minutes, from ${eur(p.business_sedan.giorno)} for the whole vehicle, VAT included. See the price on the form. We reply by email with a payment link.`;
  const head = [
    ...(FOTO_POS[t.id] ? [`<link rel="preload" as="image" href="/assets/img/tratta-${t.id}-1200.webp" imagesrcset="/assets/img/tratta-${t.id}-640.webp 640w, /assets/img/tratta-${t.id}-1200.webp 1200w" imagesizes="100vw">`] : []),
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


// "Other destinations": una scheda per destinazione (nome, tempo e km, prezzo), l'escursione a ore dell'Etna per ultima e scura.
// Barra arancione in alto su ogni scheda (accento di marca come forma, mai come testo su chiaro). Stesso elenco in tutte le pagine di tratta.
function listaAltre(idPagina) {
  return TRATTE.filter((x) => x.id !== idPagina).sort((x, y) => Number(!!x.orario) - Number(!!y.orario)).map((x) => {
    const px = prezziDi(x.id).business_sedan.giorno;
    const dati = `About ${x.min} min · ${Math.round(kmDi(x.id))} km`;
    return x.orario
      ? `
      <a class="dest-card dest-card--excursion" href="/catania-airport-to-${x.id}.html"><small>By the hour</small><strong>Mount Etna</strong><span>${dati}</span><b><i>5 hours from</i> ${eur(px)}</b></a>`
      : `
      <a class="dest-card" href="/catania-airport-to-${x.id}.html"><small>Catania Airport to</small><strong>${esc(x.nome)}</strong><span>${dati}</span><b><i>From</i> ${eur(px)}</b></a>`;
  }).join('');
}

function corpo(t, d) {
  const { p, kmDest, domande } = d;
  const cta = CTA(t.id);
  const faqHtml = domande.map(([q, a, html]) => `
      <details>
        <summary>${esc(q)}</summary>
        ${html ? `<div class="route-answer">${html}</div>` : `<p>${esc(a)}</p>`}
      </details>`).join('');
  const altre = listaAltre(t.id);
  return `<div class="dark hero-band${FOTO_POS[t.id] ? ' hero-foto' : ''}"${FOTO_POS[t.id] ? ` style="--foto: url('/assets/img/tratta-${t.id}-1200.webp'); --foto-sm: url('/assets/img/tratta-${t.id}-640.webp'); --foto-pos: ${FOTO_POS[t.id]}"` : ''}>
  <section class="page-hero wrap route-hero" aria-labelledby="route-title">
    <h1 id="route-title">${t.orario ? esc(t.titolo) : `Catania Airport to ${esc(t.nome)}`}</h1>
    <p class="sub">${t.orario ? 'A private driver for Mount Etna, booked by the hour from the centre of Catania.' : `A private transfer from Catania Airport to ${esc(t.nome)} with a chauffeur.`} About ${t.min} minutes by car ${esc(t.via)}. Choose your day, time and car and the price shows at once. We reply by email with a payment link.</p>
    <div class="route-actions"><a class="solid-button" href="${cta}">See the price and book</a></div>
  </section>
</div>

<main id="content">
  <section id="about" class="section wrap route-about" aria-labelledby="route-about-title">
    <div class="route-side">
      <h2 id="route-about-title">${esc(t.titolo)}</h2>
      <div class="route-card">
        <div id="trip-map" class="map-box route-map" data-route="${EXTRA[t.id]?.mappa ?? t.id}"${EXTRA[t.id]?.file ? ` data-route-file="${EXTRA[t.id].file}"` : ''} data-price="${p.business_sedan.giorno}" role="img" aria-label="Map of the route between ${t.orario ? 'Catania' : 'Catania Airport'} and ${esc(t.nome)}, about ${kmDest} kilometres"></div>
        <p class="route-trip"><strong>${t.orario ? 'Catania centre' : 'Catania Airport'}</strong> to <strong>${esc(t.nome)}</strong><br>About ${kmDest} km by road</p>
      </div>
    </div>
    <div class="route-main">
      <dl class="route-facts">
        <div><dt>Drive time</dt><dd>${t.min} min<small>${kmDest} km, typical weekday</small></dd></div>
        <div><dt>Business Sedan, up to 3</dt><dd>${eur(p.business_sedan.giorno)}<small>${t.orario ? '5 hours · ' : ''}${eur(p.business_sedan.notte)} at night</small></dd></div>
        <div><dt>Business Minivan, up to 7</dt><dd>${eur(p.business_minivan.giorno)}<small>${t.orario ? '5 hours · ' : ''}${eur(p.business_minivan.notte)} at night</small></dd></div>
      </dl>
      <p>Prices are for the whole vehicle, VAT included.${t.orario ? ' They are for 5 hours by the hour, from and back to the centre of Catania, with 20 km included per hour. Other durations are in the booking form.' : ''} Night rate applies from 22:00 to 06:00.</p>
${t.orario ? '' : `      <p>Looking for a taxi from Catania Airport to ${esc(t.nome)}? This is a private transfer with a licensed chauffeur (NCC), not a street taxi: you book in advance, the price is fixed and we follow your flight.</p>\n`}${t.testo.map((x) => `      <p>${esc(x)}</p>`).join('\n')}
      <p>Book at least 24 hours before pickup. Add your flight number in the form: we follow your flight, and with a flight number free waiting is 60 minutes after landing.</p>
      <p><a class="solid-button" href="${cta}">${t.orario ? 'Book a driver for Mount Etna' : `Book Catania Airport to ${esc(t.nome)}`}</a></p>
    </div>
  </section>

  <section id="faq" class="section wrap faq route-faq" aria-labelledby="route-faq-title">
    <h2 id="route-faq-title">Questions about this transfer</h2>${faqHtml}
  </section>

  <section class="section wrap route-others" aria-labelledby="route-others-title">
    <h2 id="route-others-title">Other destinations</h2>
    <div class="dest-grid">${altre}
    </div>
  </section>
</main>
`;
}

const json = (obj) => `${JSON.stringify(obj, null, 2)}\n`;

// Le cinque pagine esistenti hanno ritocchi fatti a mano (commit ebe8392: parole di ricerca, icone): non si rigenerano.
// Questo generatore scrive solo le pagine con dati in EXTRA. Per rigenerare le altre va prima riportato nel generatore ogni ritocco.
for (const t of TRATTE.filter((x) => EXTRA[x.id])) {
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

// Le pagine esistenti: si riscrive solo il blocco "Other destinations", con lo stesso markup delle pagine nuove.
for (const id of ['taormina', 'giardini-naxos', 'siracusa', 'catania', 'milazzo']) {
  const file = join(PAGINE, `route-${id}.html`);
  const testo = readFileSync(file, 'utf8');
  const crlf = testo.includes('\r\n');
  const norm = testo.replace(/\r\n/g, '\n');
  const nuovo = norm.replace(/<div class="(?:place-list|dest-grid)">[\s\S]*?\n    <\/div>/, `<div class="dest-grid">${listaAltre(id)}\n    </div>`);
  if (nuovo === norm) { console.log('invariato', id); continue; }
  writeFileSync(file, crlf ? nuovo.replace(/\n/g, '\r\n') : nuovo, 'utf8');
  console.log('elenco aggiornato', id);
}
