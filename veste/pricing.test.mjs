import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { AIRPORT, DIRECT_ROUTES, HOURLY_FARES, HOUR_CHOICES, PALERMO_AIRPORT, bookingMessage, usesBookingSystem, hourlyTerms, bookingRequest, equivalentBags, fare, fits, hasFullName, isInternationalPhone, isNight, quote, tripProblem } from './src/assets/js/pricing.js';

const trip = { mode: 'transfer', from: AIRPORT, to: 'Taormina', date: '2027-06-10', time: '13:45', pax: 2, checked: 1, carry: 0 };
const NOW = new Date('2027-06-01T12:00:00');

test('night rate runs from 22:00 to 05:59', () => {
  assert.deepEqual(['21:59', '22:00', '05:59', '06:00'].map(isNight), [false, true, true, false]);
});

test('fares work in both directions and only for listed airport routes', () => {
  assert.equal(fare(AIRPORT, 'Taormina', 'sedan', '13:00'), 140);
  assert.equal(fare('Taormina', AIRPORT, 'minivan', '23:00'), 245);
  assert.equal(fare('Milazzo', 'Siracusa', 'sedan', '13:00'), null);
  assert.equal(fare(AIRPORT, 'Palermo', 'sedan', '13:00'), null);
});

test('direct routes are priced both ways, outside the booking system', () => {
  assert.equal(fare('Taormina', 'Siracusa', 'sedan', '13:00'), 350);
  assert.equal(fare('Siracusa', 'Taormina', 'minivan', '13:00'), 410);
  assert.equal(fare('Siracusa', 'Taormina', 'sedan', '23:00'), 460);
  assert.equal(fare(AIRPORT, PALERMO_AIRPORT, 'sedan', '13:00'), 500);
  assert.equal(fare(PALERMO_AIRPORT, AIRPORT, 'minivan', '23:00'), 760);
  assert.equal(fare(PALERMO_AIRPORT, 'Taormina', 'minivan', '13:00'), 810);
  assert.equal(fare('Siracusa', PALERMO_AIRPORT, 'sedan', '13:00'), 660);
  assert.equal(fare(AIRPORT, 'Agrigento', 'sedan', '13:00'), 370);
  assert.equal(fare('Agrigento', AIRPORT, 'minivan', '13:00'), 430);
  assert.equal(fare(AIRPORT, 'Agrigento', 'sedan', '23:00'), 490);
  assert.equal(fare(AIRPORT, 'Agrigento', 'minivan', '23:00'), 560);
  assert.equal(usesBookingSystem({ ...trip, to: 'Agrigento' }), false);
  assert.equal(usesBookingSystem({ ...trip, from: 'Taormina', to: 'Siracusa' }), false);
  assert.equal(usesBookingSystem({ ...trip, to: PALERMO_AIRPORT }), false);
  assert.equal(usesBookingSystem(trip), true);
  assert.equal(usesBookingSystem({ ...trip, mode: 'hourly' }), false);
});

test('every direct route has a road line for its map', () => {
  const names = Object.values(JSON.parse(readFileSync(new URL('./data/routes.json', import.meta.url))).tratte).map((route) => route.nome);
  for (const route of DIRECT_ROUTES) assert.ok(names.includes(route.mapName), route.mapName);
});

test('unlisted routes are on request', () => {
  assert.equal(quote({ ...trip, to: 'Palermo' }, 'sedan'), null);
});

test('hourly hire is priced by pickup, hours, vehicle and time', () => {
  const hire = { ...trip, mode: 'hourly', hours: 6 };
  assert.equal(quote(hire, 'sedan'), 350);
  assert.equal(quote({ ...hire, time: '23:00' }, 'sedan'), 460);
  assert.equal(quote({ ...hire, from: 'Taormina', hours: 8 }, 'minivan'), 630);
  assert.equal(quote({ ...hire, hours: 2 }, 'sedan'), null);
});

test('hourly terms show the included km and both extra prices', () => {
  assert.equal(hourlyTerms(8, 'sedan'), '160 km included. Extra hour €60, extra km €1.00.');
  assert.equal(hourlyTerms(3, 'minivan'), '60 km included. Extra hour €70, extra km €1.50.');
  const details = { name: 'Ann Lee', phone: '+44 1', email: 'a@b.c', address: 'Hotel X' };
  const text = bookingMessage({ ...trip, mode: 'hourly', hours: 8, from: 'Taormina' }, 'sedan', details);
  for (const part of ['Start and end: Taormina', '160 km included', '€520']) assert.ok(text.includes(part), part);
});

test('every pickup has every duration, and a longer hire never costs less', () => {
  for (const hours of Object.values(HOURLY_FARES)) {
    assert.deepEqual(Object.keys(hours).map(Number), HOUR_CHOICES);
    for (const vehicle of ['sedan', 'minivan']) {
      const days = HOUR_CHOICES.map((h) => hours[h][vehicle][0]);
      assert.deepEqual(days, [...days].sort((a, b) => a - b));
    }
  }
});

test('two carry-on bags count as one suitcase, and a sedan takes two', () => {
  assert.equal(equivalentBags(1, 3), 3);
  assert.equal(fits('sedan', 3, 2, 0), true);
  assert.equal(fits('sedan', 3, 2, 1), false);
  assert.equal(fits('sedan', 4, 0, 0), false);
  assert.equal(fits('minivan', 7, 8, 4), true);
});

test('searches are checked for route, notice and return order', () => {
  assert.equal(tripProblem(trip, NOW), null);
  assert.match(tripProblem({ ...trip, to: AIRPORT }, NOW), /different/);
  assert.match(tripProblem({ ...trip, from: 'Milazzo', to: 'Siracusa' }, NOW), /price list/);
  assert.match(tripProblem({ ...trip, from: PALERMO_AIRPORT, to: 'Milazzo' }, NOW), /price list/);
  assert.match(tripProblem({ ...trip, from: 'Taormina', to: 'Agrigento' }, NOW), /price list/);
  assert.equal(tripProblem({ ...trip, from: 'Siracusa', to: 'Taormina' }, NOW), null);
  assert.equal(tripProblem({ ...trip, from: 'Taormina', to: AIRPORT }, NOW), null);
  assert.match(tripProblem({ ...trip, date: '2027-06-02', time: '11:59' }, NOW), /24 hours/);
  assert.equal(tripProblem({ ...trip, date: '2027-06-02', time: '12:00' }, NOW), null);
});

test('the booking system gets its own route, direction and vehicle names', () => {
  const details = { name: 'Ann Lee', phone: '+44 1', email: 'a@b.c', address: 'Hotel X', flight: 'FR1', notes: '', consent: true, terms: true, trap: '' };
  const toAirport = { ...trip, from: 'Giardini Naxos', to: AIRPORT, checked: 1, carry: 3 };
  const request = bookingRequest(toAirport, 'minivan', details);
  assert.equal(request.tratta, 'giardini-naxos');
  assert.equal(request.direzione, 'verso_aeroporto');
  assert.equal(request.mezzo, 'business_minivan');
  assert.equal(request.bagagli, 3);
  assert.equal(request.indirizzo, 'Hotel X');
  assert.equal(request.sito_web, '');
  assert.equal(bookingRequest(trip, 'sedan', details).direzione, 'da_aeroporto');
});

test('names need two words and phones a country code', () => {
  assert.equal(hasFullName('Ann'), false);
  assert.equal(hasFullName('Ann Lee'), true);
  assert.equal(isInternationalPhone('020 7946 0000'), false);
  assert.equal(isInternationalPhone('+44 20 7946 0000'), true);
});

test('the message carries the trip, the price and the traveller', () => {
  const text = bookingMessage(trip, 'sedan', { name: 'Ann', phone: '+44 1', email: 'a@b.c', address: 'Hotel X' });
  for (const part of ['Taormina', '€140', 'Ann', 'Hotel X']) assert.ok(text.includes(part), part);
  assert.ok(!text.includes('Flight:'));
});
