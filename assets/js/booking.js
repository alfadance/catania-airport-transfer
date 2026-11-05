// The booking bar on the home page and the three steps that follow it.
// Transfers go to the booking system, which replies by email with a payment link.
// Hourly hire has no fixed fare there, so the traveller sends that request by WhatsApp or email.
import {
  AIRPORT, HOURLY_ROUND_TRIP_RULE, HOUR_CHOICES, MAX_PASSENGERS, PLACES, TOWNS, VEHICLES,
  bookingMessage, bookingRequest, directRoute, fits, isListedRoute, usesBookingSystem, hourlyTerms, hasFullName, isInternationalPhone, isNightTrip, italyNow, quote, tripProblem,
} from './pricing.js';
import { createRouteMap, loadRoutes, whenNearView } from './routemap.js';

const BOOKING_ENDPOINT = 'https://lsekwlvnlumjxliyysuy.supabase.co/functions/v1/richiesta-privati';
const REQUEST_TIMEOUT_MS = 20000;
const WHATSAPP = '393200528300';
const EMAIL = 'info@cataniaairporttransfer.net';
const DEFAULT_LEAD_DAYS = 2;
const DEFAULT_TIME = '13:45';
const GENERIC_ERROR = `Something went wrong and the request was not sent. Please check the fields, or email us at ${EMAIL}.`;
const BUSY_ERROR = 'Too many requests from this connection. Please try again later, or message us on WhatsApp.';
const FIELD_ERRORS = {
  tratta: 'Choose a town.',
  direzione: 'Choose a direction.',
  mezzo: 'Choose a vehicle.',
  pax: 'Check the number of passengers: up to 3 in the Sedan, up to 7 in the Minivan.',
  bagagli_imbarcati: 'Check the number of checked suitcases (0 to 8).',
  bagagli_mano: 'Check the number of carry-on bags (0 to 4).',
  bagagli: 'Check the luggage: a Sedan takes 2 checked suitcases, from the third you need a Minivan.',
  termini: 'Tick the box to accept the terms and conditions.',
  data: 'Check the date: we need at least 24 hours before pickup.',
  ora: 'Check the pickup time.',
  volo: 'Check the flight number, for example FR1234.',
  indirizzo: 'Add the address (at least 5 characters).',
  nome: 'Enter your first and last name.',
  telefono: 'Enter a valid phone number with country code, for example +44 20 7946 0000.',
  email: 'Check the email address.',
  note: 'Remove special characters from the note.',
  consenso: 'Tick the box to agree to the use of your details.',
};
const PHONE_LIBRARY = '/assets/vendor/libphonenumber-max-1.13.15.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const bar = $('#search');
const problem = $('#search-problem');
const dialog = $('#booking');
const detailsForm = $('#details-form');
const tripMapBox = $('#trip-map');
const tripMap = createRouteMap(tripMapBox);

let mode = 'transfer';
let trip = null;
let vehicle = null;

/* ---------- Search bar ---------- */

function placeOptions(select, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>${PLACES.map((place) => `<option>${place}</option>`).join('')}`;
}

// Choosing a place with no listed route to the other end moves that end to Catania Airport.
function keepRouteListed(changed, other) {
  if (!changed.value) return;
  if (changed.value === AIRPORT && other.value === AIRPORT) other.value = '';
  else if (changed.value !== AIRPORT && !isListedRoute(changed.value, other.value)) other.value = AIRPORT;
}

function setMode(next) {
  mode = next;
  bar.dataset.mode = next;
  $$('[role=tab]').forEach((tab) => {
    const on = tab.dataset.mode === next;
    tab.classList.toggle('is-on', on);
    tab.setAttribute('aria-selected', String(on));
  });
  $('#from-label').textContent = next === 'hourly' ? 'Start and end' : 'From';
  $('#hourly-rule').hidden = next !== 'hourly';
  problem.textContent = '';
}

function setPassengers(count) {
  const value = Math.min(MAX_PASSENGERS, Math.max(1, count));
  $('#pax').textContent = value;
  $('#pax-less').disabled = value === 1;
  $('#pax-more').disabled = value === MAX_PASSENGERS;
}

function readTrip() {
  return {
    mode,
    from: bar.from.value,
    to: bar.to.value,
    hours: Number(bar.hours.value),
    date: bar.date.value,
    time: bar.time.value,
    pax: Number($('#pax').textContent),
    checked: 0,
    carry: 0,
  };
}

function presetDestination(town, from = AIRPORT) {
  setMode('transfer');
  bar.from.value = from;
  bar.to.value = town;
  problem.textContent = '';
  $('#book').scrollIntoView({ behavior: 'smooth', block: 'center' });
  bar.date.focus({ preventScroll: true });
}

/* ---------- Step 1: vehicle ---------- */

const money = (euro) => `€${euro}`;

function tripSummary() {
  const route = trip.mode === 'hourly' ? `${trip.from}, ${trip.hours} hours` : `${trip.from} to ${trip.to}`;
  return `${route}. ${trip.date} at ${trip.time}. ${trip.pax} passenger${trip.pax > 1 ? 's' : ''}.`;
}

function priceLabel() {
  const total = vehicle ? quote(trip, vehicle) : null;
  return total === null ? '' : money(total);
}

function renderVehicles() {
  const usable = Object.keys(VEHICLES).filter((key) => fits(key, trip.pax, trip.checked, trip.carry));
  if (!usable.includes(vehicle)) vehicle = usable[0] ?? null;
  $('#vehicles').innerHTML = Object.entries(VEHICLES).map(([key, item]) => {
    const total = quote(trip, key);
    const usableNow = usable.includes(key);
    return `<label class="vehicle ${usableNow ? '' : 'is-off'}">
      <input type="radio" name="vehicle" value="${key}" ${key === vehicle ? 'checked' : ''} ${usableNow ? '' : 'disabled'}>
      <img src="${item.img}" alt="" width="104" height="52">
      <span class="vehicle-name"><strong>${item.name}</strong><small>${item.model}</small>
      <small>Up to ${item.pax} passengers, ${item.bags} suitcases</small>
      ${trip.mode === 'hourly' ? `<small class="vehicle-terms">${hourlyTerms(trip.hours, key)}</small>` : ''}</span>
      <span class="vehicle-price">${usableNow ? (total === null ? 'On request' : money(total)) : 'Too small'}</span>
    </label>`;
  }).join('');
  $('#to-details').disabled = !vehicle;
  $('#vehicle-note').textContent = !vehicle
    ? 'That is more than one minivan can take. Message us and we will arrange a larger vehicle.'
    : quote(trip, vehicle) === null
      ? 'We send the price for this trip by email or WhatsApp.'
      : `Whole vehicle, VAT included${isNightTrip(trip) ? ', night rate from 22:00 to 06:00 included' : ''}.${trip.mode === 'hourly' ? ` ${HOURLY_ROUND_TRIP_RULE}` : ''}`;
  tripMap.setPrice(priceLabel());
}

function stepBags(input, change) {
  const next = Math.min(Number(input.max), Math.max(0, Number(input.value) + change));
  input.value = next;
  trip = { ...trip, checked: Number($('#checked').value), carry: Number($('#carry').value) };
  $('#checked-value').textContent = trip.checked;
  $('#carry-value').textContent = trip.carry;
  renderVehicles();
}

/* ---------- Steps ---------- */

async function showTripMap() {
  const direct = directRoute(trip.from, trip.to);
  const name = direct ? direct.mapName : trip.from === AIRPORT ? trip.to : trip.from;
  const route = trip.mode === 'hourly' ? null : (await loadRoutes()).find((item) => item.nome === name);
  if (!route) {
    tripMapBox.hidden = true;
    return;
  }
  tripMapBox.setAttribute('aria-label', `Map of the route from ${trip.from} to ${trip.to}, about ${Math.round(route.km)} kilometres`);
  tripMap.showRoute({
    points: trip.from === (direct ? direct.between[0] : AIRPORT) ? route.coordinate : [...route.coordinate].reverse(),
    fromName: trip.from.replace(/ \([A-Z]{3}\)/, ''),
    toName: trip.to.replace(/ \([A-Z]{3}\)/, ''),
    price: priceLabel(),
  });
}

function showStep(step) {
  $$('.step').forEach((panel) => { panel.hidden = panel.dataset.step !== step; });
  const listed = step === 'done' ? 'send' : step;
  $$('.steps li').forEach((item) => {
    if (item.dataset.step === listed) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  dialog.scrollTop = 0;
}

function openBooking() {
  const current = readTrip();
  const issue = tripProblem(current, italyNow());
  problem.textContent = issue ?? '';
  if (issue) return;
  trip = current;
  vehicle = null;
  $('#checked').value = 0;
  $('#carry').value = 0;
  $('#checked-value').textContent = 0;
  $('#carry-value').textContent = 0;
  $('#trip-summary').textContent = tripSummary();
  renderVehicles();
  $('#address-label').textContent = trip.mode === 'hourly' ? 'Start and end address' : directRoute(trip.from, trip.to) ? 'Pickup and drop-off addresses' : trip.from === AIRPORT ? 'Drop-off address' : 'Pickup address';
  $('#flight-hint').hidden = !trip.from.includes('Airport');
  $('#details-submit').textContent = usesBookingSystem(trip) ? 'Send my request' : 'Continue →';
  showDetailsError('');
  showStep('vehicle');
  dialog.showModal();
  showTripMap().catch(() => { tripMapBox.hidden = true; });
}

function showDetailsError(text) {
  const box = $('#details-error');
  box.textContent = text;
  box.hidden = !text;
  if (text) box.scrollIntoView({ block: 'nearest' });
}

function readDetails() {
  const value = (name) => detailsForm.elements[name].value.trim();
  return {
    name: value('name'), phone: value('phone'), email: value('email'),
    address: value('address'), flight: value('flight'), notes: value('notes'),
    terms: detailsForm.elements.terms.checked,
    consent: detailsForm.elements.consent.checked,
    trap: detailsForm.elements.sito_web.value,
  };
}

function showSend() {
  const text = bookingMessage(trip, vehicle, readDetails());
  const total = quote(trip, vehicle);
  $('#send-total').textContent = total === null ? 'Price on request' : money(total);
  $('#send-summary').textContent = text;
  $('#send-whatsapp').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  const subject = encodeURIComponent('Transfer request');
  $('#send-email').href = `mailto:${EMAIL}?subject=${subject}&body=${encodeURIComponent(text)}`;
  showStep('send');
}

async function sendRequest() {
  const button = $('#details-submit');
  const label = button.textContent;
  button.disabled = true;
  button.textContent = 'Sending…';
  showDetailsError('');
  try {
    const response = await fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingRequest(trip, vehicle, readDetails())),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 200 && body.ok) {
      showConfirmation(body);
    } else if (response.status === 400 && body.errori) {
      const known = Object.keys(body.errori).map((key) => FIELD_ERRORS[key]).filter(Boolean);
      showDetailsError(known.length ? known.join(' ') : GENERIC_ERROR);
    } else {
      showDetailsError(response.status === 429 ? BUSY_ERROR : GENERIC_ERROR);
    }
  } catch {
    showDetailsError(GENERIC_ERROR);
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

function showConfirmation(body) {
  $('#done-reference').textContent = body.codice ? ` (reference ${body.codice})` : '';
  $('#done-price').textContent = body.prezzo ? `€${body.prezzo}` : 'in our email';
  ['address', 'flight', 'notes', 'sito_web'].forEach((name) => { detailsForm.elements[name].value = ''; });
  detailsForm.elements.terms.checked = false;
  detailsForm.elements.consent.checked = false;
  showStep('done');
}

// The system books one way per request, so the return is a second request with the ends swapped.
function bookReturn() {
  dialog.close();
  setMode('transfer');
  bar.from.value = trip.to;
  bar.to.value = trip.from;
  problem.textContent = 'Now choose the date and time of your return trip.';
  $('#book').scrollIntoView({ behavior: 'smooth', block: 'center' });
  bar.date.focus({ preventScroll: true });
}

/* ---------- Start up ---------- */

placeOptions(bar.from, 'Choose a place');
placeOptions(bar.to, 'Choose a place');
bar.from.addEventListener('change', () => keepRouteListed(bar.from, bar.to));
bar.to.addEventListener('change', () => keepRouteListed(bar.to, bar.from));
bar.hours.innerHTML = HOUR_CHOICES.map((hours) => `<option value="${hours}">${hours} hours</option>`).join('');

const firstDay = italyNow();
firstDay.setDate(firstDay.getDate() + DEFAULT_LEAD_DAYS);
const dayText = firstDay.toLocaleDateString('sv-SE');
bar.date.value = dayText;
bar.date.min = italyNow().toLocaleDateString('sv-SE');
bar.time.value = DEFAULT_TIME;
bar.from.value = AIRPORT;
setPassengers(2);

$$('[role=tab]').forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
$('#pax-less').addEventListener('click', () => setPassengers(Number($('#pax').textContent) - 1));
$('#pax-more').addEventListener('click', () => setPassengers(Number($('#pax').textContent) + 1));

bar.addEventListener('submit', (event) => {
  event.preventDefault();
  openBooking();
});

$$('[data-to]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  presetDestination(link.dataset.to, link.dataset.from);
}));
$$('[data-open-hourly]').forEach((link) => link.addEventListener('click', () => setMode('hourly')));

$('#vehicles').addEventListener('change', (event) => {
  vehicle = event.target.value;
  tripMap.setPrice(priceLabel());
});
$$('[data-bag]').forEach((button) => button.addEventListener('click', () => {
  stepBags($(`#${button.dataset.bag}`), Number(button.dataset.change));
}));
$('#to-details').addEventListener('click', () => showStep('details'));
$('#back-to-vehicle').addEventListener('click', () => showStep('vehicle'));
$('#back-to-details').addEventListener('click', () => showStep('details'));
const nameInput = detailsForm.elements.name;
const phoneInput = detailsForm.elements.phone;
nameInput.addEventListener('input', () => {
  nameInput.setCustomValidity(hasFullName(nameInput.value) ? '' : FIELD_ERRORS.nome);
});

// The full phone rules load when the traveller reaches the details step. Until then, or if they fail, the simple check applies
// and the booking system still checks the number itself.
function checkPhone() {
  const value = phoneInput.value.trim();
  const library = window.libphonenumber;
  const parsed = library && value.startsWith('+') ? library.parsePhoneNumberFromString(value) : null;
  const valid = library ? Boolean(parsed?.isValid()) : isInternationalPhone(value);
  phoneInput.setCustomValidity(valid ? '' : FIELD_ERRORS.telefono);
  return valid ? parsed : null;
}

document.getElementById('to-details').addEventListener('click', () => {
  const script = document.createElement('script');
  script.src = PHONE_LIBRARY;
  script.onload = () => { if (phoneInput.value) checkPhone(); };
  document.head.append(script);
}, { once: true });
phoneInput.addEventListener('input', checkPhone);
phoneInput.addEventListener('change', () => {
  const parsed = checkPhone();
  if (parsed) phoneInput.value = parsed.formatInternational();
});
detailsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (usesBookingSystem(trip)) sendRequest();
  else showSend();
});
$('#book-return').addEventListener('click', bookReturn);
$$('[data-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('close', () => tripMap.stop());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

/* ---------- Maps on the page ---------- */

const sampleBox = $('#sample-map');
const sampleMap = createRouteMap(sampleBox);
whenNearView(sampleBox, (resuming) => {
  if (resuming) {
    sampleMap.resume();
    return;
  }
  loadRoutes().then((all) => {
    const route = all.find((item) => item.nome === 'Taormina');
    sampleMap.showRoute({ points: route.coordinate, fromName: 'Catania Airport', toName: 'Taormina', padding: { top: 48, right: 56, bottom: 130, left: 56 } });
  }).catch(() => { sampleBox.hidden = true; });
}, () => sampleMap.stop());

const allBox = $('#all-routes-map');
const allMap = createRouteMap(allBox);
whenNearView(allBox, (resuming) => {
  if (resuming) return;
  loadRoutes().then((all) => allMap.showAll(all.map((item) => item.coordinate))).catch(() => { allBox.hidden = true; });
}, () => {});

// Links from other pages arrive as /?to=Taormina#book.
const query = new URLSearchParams(location.search);
const wanted = query.get('to');
const wantedFrom = query.get('from');
if (PLACES.includes(wanted)) presetDestination(wanted, PLACES.includes(wantedFrom) ? wantedFrom : AIRPORT);
if (new URLSearchParams(location.search).get('mode') === 'hourly') setMode('hourly');
