// Puts the shared header and footer around each page and writes plain static files to dist/.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const read = (path) => readFileSync(join(root, path), 'utf8');

const SITE = 'https://cataniaairporttransfer.net';
const footer = read('src/footer.html');
const header = read('src/header.html');

function render({ body, title, description, path, current, script }) {
  let html = read('src/layout.html')
    .replace('{{header}}', header)
    .replace('{{footer}}', footer)
    .replace('{{body}}', read(body))
    .replaceAll('{{title}}', title)
    .replaceAll('{{description}}', description)
    .replaceAll('{{url}}', SITE + path)
    .replace('{{script}}', script);
  html = html.replace(`data-nav="${current}"`, 'aria-current="page"');
  return html.replace(/ data-nav="\w+"/g, '');
}

const pages = [
  {
    out: 'index.html',
    path: '/',
    body: 'src/home.html',
    current: 'home',
    script: 'booking.js',
    title: 'Catania Airport Transfer | Private Transfers in Sicily',
    description: 'Fixed-price private airport transfers across Sicily from Catania Airport. Flights tracked, licensed drivers, and a chauffeur by the hour.',
  },
  {
    out: 'contact-us/index.html',
    path: '/contact-us/',
    body: 'src/contact.html',
    current: 'contact',
    script: 'contact.js',
    title: 'Contact us | Catania Airport Transfer',
    description: 'Talk to Catania Airport Transfer by WhatsApp, phone or email about a private transfer anywhere in Sicily.',
  },
];

rmSync(dist, { recursive: true, force: true });
// The current site's other pages stay at their own addresses: terms, privacy, payment return, routes, forms.
cpSync(join(root, 'legacy'), dist, { recursive: true });
cpSync(join(root, 'src/assets'), join(dist, 'assets'), { recursive: true });
cpSync(join(root, 'src/styles.css'), join(dist, 'assets/styles.css'));
cpSync(join(root, 'data/routes.json'), join(dist, 'assets/routes.json'));
for (const page of pages) {
  const target = join(dist, page.out);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, render(page));
}
