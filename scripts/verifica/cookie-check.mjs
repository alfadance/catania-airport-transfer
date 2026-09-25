import fs from 'node:fs';
const html = fs.readFileSync('C:/Users/sebyv/Documents/catania-airport-transfer/index.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const src = scripts.find(s => s.includes('cat_cookie_consent'));
globalThis.dataLayer = [];
function run(stored, { throws = false, search = '' } = {}) {
  const cls = new Set(['hidden']); let ga = false;
  const banner = { classList: { add: c => cls.add(c), remove: c => cls.delete(c) } };
  const el = id => id === 'cookie-consent-banner' ? banner : { classList: { remove() {} }, addEventListener() {} };
  const ls = { getItem() { if (throws) throw new Error('blocked'); return stored; }, setItem() { if (throws) throw new Error('blocked'); } };
  const g = { document: { getElementById: el, querySelector: () => null, addEventListener() {}, head: { appendChild: () => { ga = true; } }, createElement: () => ({}) },
    localStorage: ls, location: { search, pathname: '/' }, history: { replaceState() {} }, URLSearchParams, window: {} };
  new Function(...Object.keys(g), src)(...Object.values(g));
  return { banner: !cls.has('hidden'), ga };
}
const c = [
  ['nessuna scelta', run(null), { banner: true, ga: false }],
  ['accettato', run('accepted'), { banner: false, ga: true }],
  ['rifiutato', run('rejected'), { banner: false, ga: false }],
  ['accettato + esito modulo', run('accepted', { search: '?rates=sent' }), { banner: false, ga: true }],
  ['nessuna scelta + esito modulo', run(null, { search: '?rates=sent' }), { banner: true, ga: false }],
  ['storage bloccato', run(null, { throws: true }), { banner: true, ga: false }],
];
let ok = true;
for (const [n, got, exp] of c) { const pass = JSON.stringify(got) === JSON.stringify(exp); ok &&= pass; console.log(pass ? 'OK  ' : 'FAIL', n, JSON.stringify(got)); }
process.exit(ok ? 0 : 1);
