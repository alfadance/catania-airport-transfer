// Prova dei tre moduli evento in Chrome, senza inviare niente.
// Uso: SCRATCH=<cartella> node scripts/verifica/eventi-form.mjs <porta>   (sito su http://127.0.0.1:8765/)
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const port = process.argv[2];
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.SCRATCH}/ef-${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map(); ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.result.value;
await send('Page.enable');
// GA4 non si carica senza consenso: un registratore al suo posto, prima che la pagina parta
await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__ga=[];window.gtag=function(){window.__ga.push([].slice.call(arguments))};' });

const PAGES = [
  { file: 'events.html', page: 'hub', storage: 'events_form', etype: 'conference' },
  { file: 'wedding-transfers-taormina.html', page: 'wedding', storage: 'event_form', etype: 'conference' }, // tipo cambiato sulla pagina matrimoni
  { file: 'event-transportation-sicily.html', page: 'events', storage: 'events_form', etype: 'film' },
];
let provate = 0;
try {
  for (const p of PAGES) {
    const url = `http://127.0.0.1:8765/${p.file}`;
    await send('Page.navigate', { url }); await sleep(1500);
    // 1. invio simulato: il salvataggio parte, il pulsante si blocca, nulla viene spedito
    const inviato = await ev(`(()=>{const f=document.querySelector('form[action="request-event.php"]');
      const v={name:'Test Name',agency:'Test Co',country:'UK',email:'t@example.com',etype:${JSON.stringify(p.etype)},date:'1 June',venue:'Taormina',guests:'40',arrival:'catania',message:'prova'};
      for (const k in v) f.elements[k].value=v[k];
      f.addEventListener('submit',e=>e.preventDefault()); f.dispatchEvent(new Event('submit',{cancelable:true}));
      return {page:f.elements.page.value,disabled:f.querySelector('button[type=submit]').disabled,saved:JSON.parse(sessionStorage.getItem(${JSON.stringify(p.storage)})||'{}')}})()`);
    assert.equal(inviato.page, p.page, `${p.file}: valore di page`);
    assert.equal(inviato.disabled, true, `${p.file}: pulsante bloccato`);
    assert.equal(inviato.saved.etype, p.etype, `${p.file}: etype salvato`);
    // 2. ritorno con errore: ricompare tutto, tendina compresa
    await send('Page.navigate', { url: `${url}?event=error` }); await sleep(1500);
    const errore = await ev(`(()=>{const f=document.querySelector('form[action="request-event.php"]');return {etype:f.elements.etype.value,name:f.elements.name.value,box:!document.getElementById('event-error').classList.contains('hidden')}})()`);
    assert.deepEqual(errore, { etype: p.etype, name: 'Test Name', box: true }, `${p.file}: dopo l'errore`);
    // 3. ritorno riuscito: evento GA4 col tipo, memoria svuotata
    await send('Page.navigate', { url: `${url}?event=sent` }); await sleep(1500);
    const riuscito = await ev(`({ga:window.__ga.filter(a=>a[1]==='richiesta_evento').map(a=>a[2]),mem:sessionStorage.getItem(${JSON.stringify(p.storage)}),box:!document.getElementById('event-sent').classList.contains('hidden')})`);
    assert.deepEqual(riuscito.ga, [{ tipo_evento: p.etype }], `${p.file}: evento GA4`);
    assert.equal(riuscito.mem, null, `${p.file}: memoria svuotata`);
    assert.equal(riuscito.box, true, `${p.file}: riquadro di conferma`);
    provate++;
    console.log('ok', p.file);
  }
  // un verde vuoto non conta: devono essere state provate tutte e tre le pagine
  assert.equal(provate, PAGES.length, 'pagine provate');
} finally {
  ws.close(); chrome.kill();
}
process.exit(0);
