// Prova datata di una pagina web: screenshot JPEG a pagina intera con una fascia in cima che riporta data, ora UTC
// e indirizzo, più un controllo del testo (indirizzo email presente, pagina pertinente alla Sicilia, rifiuti espliciti
// di messaggi commerciali). Uso: SCRATCH=<dir> node prova-pagina.mjs <url> <out.jpg> <port> [email da cercare]
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const [,, url, out, port, email] = process.argv;
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.SCRATCH}/pp-${port}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms)); let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async e => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.result?.value;
await send('Page.enable');
await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url }); await sleep(9000);
const e = (email || '').toLowerCase();
const info = await ev(`(()=>{const t=document.body?document.body.innerText:'';const low=t.toLowerCase();
 const hrefs=[...document.querySelectorAll('a[href^="mailto:"]')].map(a=>a.getAttribute('href').toLowerCase());
 return {finalUrl:location.href,title:document.title,chars:t.length,
  email:${JSON.stringify(e)}?(low.includes(${JSON.stringify(e)})||hrefs.some(h=>h.includes(${JSON.stringify(e)}))):null,
  sicily:(low.match(/sicily|sicilia|taormina|palermo|siracusa|syracuse|catania/g)||[]).length,
  rifiuto:(low.match(/unsolicited|no solicitation|do not solicit|not accept (marketing|commercial|sales)|no (marketing|sales) (emails|calls)/g)||[])}})()`);
const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
await ev(`(()=>{const b=document.createElement('div');b.textContent=${JSON.stringify('Saved ' + stamp + '  |  ')}+location.href;
 b.style.cssText='position:absolute;top:0;left:0;right:0;z-index:2147483647;background:#fff;color:#000;font:14px/1.4 monospace;padding:6px 10px;border-bottom:2px solid #000';
 document.body.style.position='relative';document.body.prepend(b);return true})()`);
await ev(`(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0);return true})()`);
await sleep(1500);
const h = Math.min(await ev('document.documentElement.scrollHeight'), 12000);
const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 55, captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1280, height: h, scale: 1 } });
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log(JSON.stringify({ url, saved: stamp, out: out.split('/').pop(), ...info }));
ws.close(); chrome.kill(); process.exit(0);
