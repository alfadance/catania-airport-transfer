// Fares, vehicle rules and the booking message. No DOM here, so pricing.test.mjs can check it.

export const AIRPORT = 'Catania Airport (CTA)';

// Whole-vehicle prices in euro from Catania Airport, VAT included: [day, night].
export const FARES = {
  Taormina: { sedan: [140, 185], minivan: [185, 245] },
  'Giardini Naxos': { sedan: [130, 170], minivan: [175, 230] },
  Siracusa: { sedan: [140, 185], minivan: [185, 245] },
  Catania: { sedan: [60, 80], minivan: [70, 95] },
  Milazzo: { sedan: [330, 430], minivan: [380, 500] },
};

export const PALERMO_AIRPORT = 'Palermo Airport (PMO)';
const AGRIGENTO = 'Agrigento';

// Other listed routes, both ways: whole-vehicle euro prices, VAT included, [day, night].
// The booking system takes only the routes in FARES, so these go by WhatsApp or email.
export const DIRECT_ROUTES = [
  { between: [AIRPORT, AGRIGENTO], mapName: 'Catania Airport to Agrigento', sedan: [370, 490], minivan: [430, 560] },
  { between: ['Taormina', 'Siracusa'], mapName: 'Taormina to Siracusa', sedan: [350, 460], minivan: [410, 540] },
  { between: [AIRPORT, PALERMO_AIRPORT], mapName: 'Catania Airport to Palermo Airport', sedan: [500, 650], minivan: [580, 760] },
  { between: ['Siracusa', PALERMO_AIRPORT], mapName: 'Siracusa to Palermo Airport', sedan: [660, 860], minivan: [760, 990] },
  { between: ['Taormina', PALERMO_AIRPORT], mapName: 'Taormina to Palermo Airport', sedan: [710, 930], minivan: [810, 1060] },
];

// The price list is the only set of routes the site offers.
export const TOWNS = Object.keys(FARES);
export const PLACES = [AIRPORT, PALERMO_AIRPORT, ...TOWNS, AGRIGENTO];

export const VEHICLES = {
  sedan: { apiName: 'business_sedan', name: 'Business Sedan', model: 'Mercedes-Benz E-Class', pax: 3, bags: 2, bagLimit: 2, img: '/assets/img/sedan-e-class.webp' },
  minivan: { apiName: 'business_minivan', name: 'Business Minivan', model: 'Mercedes-Benz V-Class or equivalent', pax: 7, bags: 8, bagLimit: 10, img: '/assets/img/minivan-vito.webp' },
};

export const MIN_NOTICE_HOURS = 24;
export const MAX_PASSENGERS = 7;
export const HOUR_CHOICES = [3, 4, 5, 6, 8, 10, 12];
export const KM_INCLUDED_PER_HOUR = 20;
// Extras beyond the booked hours and km, in euro, VAT included.
export const HOURLY_EXTRAS = {
  sedan: { hour: 60, km: 1 },
  minivan: { hour: 70, km: 1.5 },
};
export const HOURLY_ROUND_TRIP_RULE = 'Hourly hire must start and end at the same place. For a one-way trip, please book a transfer.';

// Whole-vehicle prices in euro for a chauffeur by the hour, VAT included: [day, night].
// 3 hours minimum, with 20 km included per hour. Update this table when prices change.
export const HOURLY_FARES = {
  [AIRPORT]: {
    3: { sedan: [175, 230], minivan: [210, 275] },
    4: { sedan: [300, 390], minivan: [350, 460] },
    5: { sedan: [300, 390], minivan: [350, 460] },
    6: { sedan: [350, 460], minivan: [420, 550] },
    8: { sedan: [460, 600], minivan: [560, 730] },
    10: { sedan: [580, 760], minivan: [690, 900] },
    12: { sedan: [690, 900], minivan: [830, 1080] },
  },
  Taormina: {
    3: { sedan: [230, 300], minivan: [280, 370] },
    4: { sedan: [290, 380], minivan: [350, 460] },
    5: { sedan: [350, 460], minivan: [420, 550] },
    6: { sedan: [410, 540], minivan: [490, 640] },
    8: { sedan: [520, 680], minivan: [630, 820] },
    10: { sedan: [640, 840], minivan: [760, 990] },
    12: { sedan: [750, 980], minivan: [900, 1170] },
  },
  'Giardini Naxos': {
    3: { sedan: [220, 290], minivan: [265, 350] },
    4: { sedan: [280, 370], minivan: [340, 450] },
    5: { sedan: [340, 450], minivan: [410, 540] },
    6: { sedan: [400, 520], minivan: [480, 630] },
    8: { sedan: [510, 670], minivan: [610, 800] },
    10: { sedan: [630, 820], minivan: [750, 980] },
    12: { sedan: [740, 970], minivan: [890, 1160] },
  },
  Siracusa: {
    3: { sedan: [220, 290], minivan: [280, 370] },
    4: { sedan: [370, 490], minivan: [490, 640] },
    5: { sedan: [370, 490], minivan: [490, 640] },
    6: { sedan: [400, 520], minivan: [490, 640] },
    8: { sedan: [510, 670], minivan: [630, 820] },
    10: { sedan: [630, 820], minivan: [760, 990] },
    12: { sedan: [740, 970], minivan: [900, 1170] },
  },
  Catania: {
    3: { sedan: [185, 245], minivan: [220, 290] },
    4: { sedan: [300, 390], minivan: [350, 460] },
    5: { sedan: [300, 390], minivan: [360, 470] },
    6: { sedan: [360, 470], minivan: [430, 560] },
    8: { sedan: [480, 630], minivan: [570, 750] },
    10: { sedan: [590, 770], minivan: [710, 930] },
    12: { sedan: [710, 930], minivan: [840, 1100] },
  },
  Milazzo: {
    3: { sedan: [290, 380], minivan: [360, 470] },
    4: { sedan: [350, 460], minivan: [430, 560] },
    5: { sedan: [410, 540], minivan: [500, 650] },
    6: { sedan: [460, 600], minivan: [570, 750] },
    8: { sedan: [580, 760], minivan: [710, 930] },
    10: { sedan: [690, 900], minivan: [840, 1100] },
    12: { sedan: [810, 1060], minivan: [980, 1280] },
  },
};

const NIGHT_STARTS = 22;
const NIGHT_ENDS = 6;

export function isNight(time) {
  const hour = Number(String(time).split(':')[0]);
  return hour >= NIGHT_STARTS || hour < NIGHT_ENDS;
}

export const directRoute = (a, b) => DIRECT_ROUTES.find(({ between }) => a !== b && between.includes(a) && between.includes(b));

const isFareRoute = (from, to) => (from === AIRPORT && Boolean(FARES[to])) || (to === AIRPORT && Boolean(FARES[from]));

export const isListedRoute = (from, to) => isFareRoute(from, to) || Boolean(directRoute(from, to));

export const usesBookingSystem = (trip) => trip.mode !== 'hourly' && isFareRoute(trip.from, trip.to);

export function fare(from, to, vehicle, time) {
  const direct = directRoute(from, to);
  if (direct) return direct[vehicle][isNight(time) ? 1 : 0];
  const town = from === AIRPORT ? to : to === AIRPORT ? from : null;
  const prices = FARES[town]?.[vehicle];
  return prices ? prices[isNight(time) ? 1 : 0] : null;
}

// Two carry-on bags count as one checked suitcase.
export const equivalentBags = (checked, carry) => checked + Math.ceil(carry / 2);

export const fits = (vehicle, pax, checked, carry) =>
  pax <= VEHICLES[vehicle].pax && equivalentBags(checked, carry) <= VEHICLES[vehicle].bagLimit;

// Returns the euro price, or null when the trip has no listed fare (price on request).
export function quote(trip, vehicle) {
  if (trip.mode === 'hourly') {
    const prices = HOURLY_FARES[trip.from]?.[trip.hours]?.[vehicle];
    return prices ? prices[isNight(trip.time) ? 1 : 0] : null;
  }
  return fare(trip.from, trip.to, vehicle, trip.time);
}

export const isNightTrip = (trip) => isNight(trip.time);

// Compares wall-clock times in Italy, wherever the traveller's device is.
export function italyNow(now = new Date()) {
  return new Date(now.toLocaleString('sv-SE', { timeZone: 'Europe/Rome' }).replace(' ', 'T'));
}

export function hoursUntil(date, time, now = italyNow()) {
  return (new Date(`${date}T${time}`) - now) / 3_600_000;
}

// Returns the first problem with the search, or null when it can go ahead.
export function tripProblem(trip, now = italyNow()) {
  if (!trip.from) return 'Choose where we pick you up.';
  if (trip.mode !== 'hourly') {
    if (!trip.to) return 'Choose your destination.';
    if (trip.from === trip.to) return 'Pickup and destination must be different.';
    if (!isListedRoute(trip.from, trip.to)) return 'That route is not in our price list. Please contact us for a quote.';
  }
  if (!trip.date || !trip.time) return 'Choose a pickup date and time.';
  if (hoursUntil(trip.date, trip.time, now) < MIN_NOTICE_HOURS) {
    return `Online requests need at least ${MIN_NOTICE_HOURS} hours' notice. For less notice, message us on WhatsApp.`;
  }
  return null;
}

export const hasFullName = (name) => name.trim().split(/\s+/).filter(Boolean).length >= 2;
export const isInternationalPhone = (phone) => /^\+[0-9 ()./-]{7,22}$/.test(phone.trim());

// The request the booking system expects. It recalculates the price itself.
export function bookingRequest(trip, vehicle, details) {
  const town = trip.from === AIRPORT ? trip.to : trip.from;
  return {
    tratta: town.toLowerCase().replaceAll(' ', '-'),
    direzione: trip.from === AIRPORT ? 'da_aeroporto' : 'verso_aeroporto',
    mezzo: VEHICLES[vehicle].apiName,
    pax: trip.pax,
    bagagli: equivalentBags(trip.checked, trip.carry),
    bagagli_imbarcati: trip.checked,
    bagagli_mano: trip.carry,
    data: trip.date,
    ora: trip.time,
    volo: details.flight,
    indirizzo: details.address,
    nome: details.name,
    telefono: details.phone,
    email: details.email,
    note: details.notes,
    consenso: details.consent,
    termini: details.terms,
    sito_web: details.trap,
  };
}

export const includedKm = (hours) => hours * KM_INCLUDED_PER_HOUR;

export function hourlyTerms(hours, vehicle) {
  const { hour, km } = HOURLY_EXTRAS[vehicle];
  return `${includedKm(hours)} km included. Extra hour €${hour}, extra km €${km.toFixed(2)}.`;
}

export function bookingMessage(trip, vehicle, details) {
  const total = quote(trip, vehicle);
  const lines = ['Hello, I would like to request a private transfer in Sicily.', ''];
  if (trip.mode === 'hourly') {
    lines.push(`Chauffeur by the hour: ${trip.hours} hours`, `Start and end: ${trip.from}`, hourlyTerms(trip.hours, vehicle));
  } else {
    lines.push(`From: ${trip.from}`, `To: ${trip.to}`);
  }
  lines.push(`Date and time: ${trip.date} at ${trip.time} (Italian time)`);
  lines.push(
    `Passengers: ${trip.pax}`,
    `Bags: ${trip.checked} checked, ${trip.carry} carry-on`,
    `Vehicle: ${VEHICLES[vehicle].name}`,
    total === null ? 'Price: on request' : `Price shown: €${total}, VAT included, whole vehicle`,
    '',
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    `Email: ${details.email}`,
    `Address: ${details.address}`,
  );
  if (details.flight) lines.push(`Flight: ${details.flight}`);
  if (details.notes) lines.push(`Notes: ${details.notes}`);
  return lines.join('\n');
}
