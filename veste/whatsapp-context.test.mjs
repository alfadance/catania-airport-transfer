import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sourceFromSearch, sourceFromPath, rememberSource, routeFromPath, defaultText, withRef, enhanceHref } from './src/assets/js/whatsapp-context.js';

const BASE = 'https://wa.me/393200528300';
const textOf = (href) => new URL(href).searchParams.get('text');
const memory = () => { const data = {}; return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; } }; };
let checks = 0;
const is = (actual, expected, message) => { checks += 1; assert.equal(actual, expected, message); };

test('la fonte nasce da utm_source e utm_medium', () => {
  is(sourceFromSearch('?utm_source=google&utm_medium=gbp&utm_campaign=scheda'), 'google-gbp');
  is(sourceFromSearch('?utm_source=linkedin'), 'linkedin');
  is(sourceFromSearch(''), '');
  is(sourceFromSearch('?utm_medium=gbp'), '', 'senza utm_source non c\'e\' fonte');
});

test('?da=<pagina> dice da quale pagina del sito arriva la richiesta', () => {
  is(sourceFromSearch('?mode=hourly&da=taormina-day-trip'), 'pagina-taormina-day-trip');
  is(sourceFromSearch('?da=Taormina%20Day%3Cscript%3E'), 'pagina-taorminadayscript', 'testo ostile ripulito');
  is(sourceFromSearch('?da='), '', 'da vuoto: nessuna fonte');
  is(sourceFromSearch('?utm_source=google&utm_medium=gbp&da=taormina-day-trip'), 'google-gbp', 'una UTM vince su da');
  is(sourceFromSearch('?da=' + 'a'.repeat(100)), 'pagina-' + 'a'.repeat(30), 'da lungo: 30 caratteri');
  const s = memory();
  is(rememberSource(s, '?da=taormina-day-trip'), 'pagina-taormina-day-trip');
  is(rememberSource(s, ''), 'pagina-taormina-day-trip', 'una pagina senza parametri tiene la fonte');
});

test('la fonte e\' pulita: niente testo ostile nel messaggio', () => {
  is(sourceFromSearch('?utm_source=Goo%20gle%3Cscript%3E&utm_medium=g%26bp'), 'googlescript-gbp');
  is(sourceFromSearch('?utm_source=' + 'a'.repeat(100)).length, 30);
});

test('la prima fonte vale per tutta la visita', () => {
  const s = memory();
  is(rememberSource(s, '?utm_source=google&utm_medium=gbp'), 'google-gbp');
  is(rememberSource(s, ''), 'google-gbp', 'una pagina senza parametri tiene la fonte');
  is(rememberSource(s, '?utm_source=facebook'), 'facebook', 'un nuovo parametro la sostituisce');
  is(rememberSource(memory(), ''), '', 'visita diretta: nessuna fonte');
  is(rememberSource({ getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }, '?utm_source=google'), 'google', 'storage bloccato: usa la fonte della pagina');
});

test('la tratta viene dall\'indirizzo della pagina', () => {
  is(routeFromPath('/catania-airport-to-taormina.html'), 'Taormina');
  is(routeFromPath('/catania-airport-to-giardini-naxos.html'), 'Giardini Naxos');
  is(routeFromPath('/book-a-transfer.html'), '');
  is(routeFromPath('/'), '');
});

test('il testo di base e la fonte in coda', () => {
  is(defaultText('Milazzo'), "Hello, I'd like to book a private transfer from Catania Airport to Milazzo.");
  is(defaultText(''), "Hello, I'd like to book a private transfer.");
  is(withRef('Hello', 'google-gbp'), 'Hello [ref: google-gbp]');
  is(withRef('Hello', ''), 'Hello');
  is(withRef('Hello [ref: a]', 'b'), 'Hello [ref: a]', 'mai due fonti nello stesso messaggio');
});

test('il link WhatsApp porta tratta e fonte, uno qualunque no', () => {
  const ctx = { route: 'Taormina', source: 'google-gbp' };
  is(textOf(enhanceHref(BASE, ctx)), "Hello, I'd like to book a private transfer from Catania Airport to Taormina. [ref: google-gbp]");
  is(textOf(enhanceHref(`${BASE}?text=Hello%2C%20wedding.%20Date%3A%20`, { source: 'linkedin' })), 'Hello, wedding. Date:  [ref: linkedin]', 'il testo che c\'e\' gia\' resta');
  is(textOf(enhanceHref(BASE, {})), "Hello, I'd like to book a private transfer.", 'senza fonte e senza tratta: solo il testo base');
  is(enhanceHref('https://example.com/x', ctx), 'https://example.com/x');
  is(enhanceHref('mailto:info@cataniaairporttransfer.net', ctx), 'mailto:info@cataniaairporttransfer.net');
});

// Origine della richiesta (titolare, 11/11/2026): senza UTM ne' ?da=, conta la prima pagina della visita.
test('senza parametri l\'origine e\' la pagina d\'arrivo', () => {
  is(sourceFromPath('/catania-airport-to-agrigento.html'), 'pagina-catania-airport-to-agrigento');
  is(sourceFromPath('/catania-airport-to-palermo-airport.html'), 'pagina-catania-airport-to-palermo-airport', 'nome lungo intero (34 caratteri)');
  is(sourceFromPath('/contact-us/'), 'pagina-contact-us');
  is(sourceFromPath('/'), 'diretto', 'home senza parametri');
  is(sourceFromPath('/index.html'), 'diretto');
  is(sourceFromPath(''), 'diretto');
  is(sourceFromPath('/Pagina%20<script>.html'), 'pagina-pagina20script', 'testo ostile ripulito');
  is(sourceFromPath('/' + 'a'.repeat(100) + '.html').length, 'pagina-'.length + 50, 'al massimo 50 caratteri dopo pagina-');
});

test('la pagina d\'arrivo vale per tutta la visita, ma una UTM o ?da= vince', () => {
  const s = memory();
  is(rememberSource(s, '', '/catania-airport-to-etna.html'), 'pagina-catania-airport-to-etna');
  is(rememberSource(s, '', '/'), 'pagina-catania-airport-to-etna', 'il modulo in home tiene la pagina d\'arrivo');
  const g = memory();
  is(rememberSource(g, '?utm_source=google&utm_medium=gbp', '/'), 'google-gbp');
  is(rememberSource(g, '', '/catania-airport-to-etna.html'), 'google-gbp', 'la prima origine resta');
  const d = memory();
  is(rememberSource(d, '?da=taormina-day-trip', '/'), 'pagina-taormina-day-trip', '?da= vince sulla pagina');
  is(rememberSource(memory(), '', '/'), 'diretto', 'home senza parametri: diretto');
  is(rememberSource({ getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }, '', '/catania-airport-to-etna.html'), 'pagina-catania-airport-to-etna', 'storage bloccato: usa la pagina');
});

test('"diretto" non finisce nel messaggio WhatsApp', () => {
  is(withRef('Hello', 'diretto'), 'Hello');
  is(withRef('Hello', 'pagina-catania-airport-to-etna'), 'Hello [ref: pagina-catania-airport-to-etna]');
});

test('almeno 37 controlli sono stati eseguiti', () => {
  assert.ok(checks >= 37, `eseguiti ${checks}`);
});
