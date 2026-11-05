// I prezzi che il browser mostra nella home (veste/src/assets/js/pricing.js) devono essere gli stessi che il server usa per la richiesta
// (assets/prezzi-sito.json, copia di supabase/functions/richiesta-privati/prezzi-sito.json del vault, generata da prezzi/motore/esporta-prezzi-sito.mjs).
// Se un prezzo cambia in un posto solo, il cliente vedrebbe una cifra e la richiesta ne userebbe un'altra: questo test lo ferma.
// Uso, dalla radice del sito:  node --test veste/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FARES, RETURN_DISCOUNT, VEHICLES, isNight } from './src/assets/js/pricing.js';

const server = JSON.parse(readFileSync(new URL('../assets/prezzi-sito.json', import.meta.url), 'utf8'));
const idOf = (town) => town.toLowerCase().replaceAll(' ', '-');
const CONTROLLI_MINIMI = 14;      // 1 (tratte) + 10 (5 tratte x 2 mezzi) + 1 (fascia notturna) + 1 (mezzi)
let controlli = 0;
const uguali = (a, b, msg) => { controlli += 1; assert.deepEqual(a, b, msg); };

test('le tratte del browser sono le stesse del server', () => {
  uguali(Object.keys(FARES).map(idOf).sort(), server.tratte.map((t) => t.id).sort());
});

test('ogni prezzo, per tratta e per mezzo, giorno e notte, e\' uguale nel browser e sul server', () => {
  for (const [town, perVehicle] of Object.entries(FARES)) {
    const tratta = server.tratte.find((t) => t.id === idOf(town));
    assert.ok(tratta, `tratta ${town} assente sul server`);
    for (const [vehicle, [day, night]] of Object.entries(perVehicle)) {
      const prezzi = tratta.prezzi[VEHICLES[vehicle].apiName];
      assert.ok(prezzi, `${town}: mezzo ${vehicle} assente sul server`);
      uguali([day, night], [prezzi.giorno, prezzi.notte], `${town} ${vehicle}`);
    }
  }
});

test('la fascia notturna del browser e\' quella del server', () => {
  const [from, to] = server.fascia_notturna.split('-');
  uguali([isNight(from), isNight('21:59'), isNight('05:59'), isNight(to)], [true, false, true, false], `fascia ${server.fascia_notturna}`);
});

test('i mezzi del browser sono quelli che il server accetta', () => {
  uguali(Object.values(VEHICLES).map((v) => v.apiName).sort(), ['business_minivan', 'business_sedan']);
});

test("lo sconto del ritorno e' lo stesso nel browser e sul server", () => {
  uguali(RETURN_DISCOUNT, server.sconto_ritorno);
});

test('il test ha davvero confrontato i prezzi', () => {
  assert.ok(controlli >= CONTROLLI_MINIMI, `controlli eseguiti: ${controlli}`);
});
