// Work with us: choosing a role opens the form. Agencies use the rates form on the server; the others send by WhatsApp or email.
import { openMessage } from './messaging.js';

const ROLES = {
  agency: { label: 'Travel agency or tour operator', title: 'Request the 2027 agency rates', company: 'Company', place: 'Country', message: 'Anything we should know? (optional)', hint: 'Destinations, typical group size, season' },
  driver: { label: 'NCC driver or transfer company', title: 'Apply as a driver or transfer company', company: 'Company or licence holder', place: 'Town or area', message: 'Your licence and vehicles', hint: 'NCC licence, vehicles, towns you cover' },
  hotel: { label: 'Hotel, villa or B&B', title: 'Transfers for your guests', company: 'Name of the property', place: 'Town', message: 'What do your guests need?', hint: 'Number of rooms, usual airports, season' },
  planner: { label: 'Events and weddings', title: 'Transport for your event', company: 'Company', place: 'Town or area', message: 'About your event', hint: 'Type of event, dates, number of guests' },
};

const $ = (id) => document.getElementById(id);
const form = $('partner-form');
const links = [...document.querySelectorAll('[data-role]')];
let role = null;

function chooseRole(name, { scroll = true } = {}) {
  const item = ROLES[name];
  if (!item) return;
  role = name;
  const isAgency = name === 'agency';
  links.forEach((link) => link.closest('.partner-card').classList.toggle('is-on', link.dataset.role === name));
  $('partner-prompt').hidden = true;
  $('partner-card').hidden = false;
  $('partner-sent').hidden = true;
  $('partner-title').textContent = item.title;
  $('company-label').textContent = item.company;
  $('place-label').textContent = item.place;
  $('message-label').textContent = item.message;
  form.elements.message.placeholder = item.hint;
  form.elements.message.required = !isAgency;
  form.elements.how.disabled = !isAgency;
  $('how-field').hidden = !isAgency;
  $('post-buttons').hidden = !isAgency;
  $('app-buttons').hidden = isAgency;
  if (scroll) $('apply').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

links.forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  history.replaceState(null, '', link.getAttribute('href'));
  chooseRole(link.dataset.role);
}));

form.addEventListener('submit', (event) => {
  if (role === 'agency') return;
  event.preventDefault();
  const value = (name) => form.elements[name].value.trim();
  const { label } = ROLES[role];
  const text = `Work with us: ${label}\nName: ${value('name')}\nCompany: ${value('agency')}\nPlace: ${value('country')}\nEmail: ${value('email')}\n\n${value('message')}`;
  openMessage(event.submitter?.value, `Work with us: ${label} - ${value('agency')}`, text);
  $('partner-sent').hidden = false;
});

const query = new URLSearchParams(location.search);
chooseRole(query.get('role'), { scroll: false });
const result = { sent: $('rates-sent'), error: $('rates-error') }[query.get('rates')];
if (result) {
  result.hidden = false;
  addEventListener('load', () => result.focus());
}
