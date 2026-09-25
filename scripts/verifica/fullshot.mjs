// Screenshot a pagina intera + rettangoli delle <img>, via CDP. Uso: node fullshot.mjs url width mobile(0/1) out port
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const [,, url, width, mobile, out, port] = process.argv;
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.SCRATCH}/fs-${port}`, '--hide-scrollbars', '--disable-lcd-text', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms)); let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async e => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.result.value;
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +width, height: 900, deviceScaleFactor: 1, mobile: mobile === '1' });
await send('Page.navigate', { url }); await sleep(3000);
await ev(`localStorage.setItem('cat_cookie_consent','rejected'); document.getElementById('cookie-consent-banner')?.classList.add('hidden'); true`);
await ev(`(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}scrollTo(0,0)})()`); await ev(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>null)}))`); await sleep(500);
const h = await ev('document.documentElement.scrollHeight');
const imgs = await ev(`JSON.stringify([...document.images].map(i=>{const r=i.getBoundingClientRect();return [r.left,r.top+scrollY,r.width,r.height]}))`);
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: +width, height: h, scale: 1 } });
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64')); fs.writeFileSync(out + '.imgs.json', imgs);
console.log('ok', width, h); ws.close(); chrome.kill(); process.exit(0);
