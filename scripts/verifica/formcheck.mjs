import { spawn } from 'node:child_process';
const port = process.argv[2];
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.SCRATCH}/fc-${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms)); let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async e => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.result.value;
await send('Page.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:8765/' }); await sleep(1500);
// invio simulato: si intercetta il submit prima che parta, così nessuna email viene inviata
const r1 = await ev(`(()=>{const f=document.querySelector('form[action="request-rates.php"]');
 f.elements.name.value='Test Name'; f.elements.agency.value='Test Co'; f.elements.country.value='UK'; f.elements.email.value='t@example.com'; f.elements.how.value='wtm'; f.elements.message.value='Taormina, 8 pax';
 f.addEventListener('submit', e=>e.preventDefault()); f.dispatchEvent(new Event('submit',{cancelable:true}));
 const b=f.querySelector('button[type=submit]'); return {disabled:b.disabled,label:b.textContent.trim(),saved:sessionStorage.getItem('rates_form')}})()`);
console.log('invio:', JSON.stringify(r1));
await send('Page.navigate', { url: 'http://127.0.0.1:8765/?rates=error' }); await sleep(1500);
const r2 = await ev(`(()=>{const f=document.querySelector('form[action="request-rates.php"]');return {name:f.elements.name.value,how:f.elements.how.value,message:f.elements.message.value,errorVisible:!document.getElementById('rates-error').classList.contains('hidden')}})()`);
console.log('dopo errore:', JSON.stringify(r2));
await send('Page.navigate', { url: 'http://127.0.0.1:8765/?rates=sent' }); await sleep(1500);
console.log('dopo invio riuscito, memoria:', await ev(`sessionStorage.getItem('rates_form')`));
ws.close(); chrome.kill(); process.exit(0);
