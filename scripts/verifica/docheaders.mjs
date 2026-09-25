import { spawn } from 'node:child_process';
const [,, url, port] = process.argv;
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.SCRATCH}/dh-${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms)); let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(); const out = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  if (m.method === 'Network.responseReceived' && m.params.type === 'Document') { const r = m.params.response; out.push({ url: r.url, status: r.status, protocol: r.protocol, fromDiskCache: r.fromDiskCache, fromServiceWorker: r.fromServiceWorker, remote: r.remoteIPAddress, h: Object.fromEntries(Object.entries(r.headers).filter(([k]) => /cache|modified|proxy|server|encoding|age|date|vary|alt-svc/i.test(k))) }); }
  if (m.method === 'Network.requestWillBeSentExtraInfo') out.push({ reqHeaders: Object.fromEntries(Object.entries(m.params.headers).filter(([k]) => /accept|user-agent|cache|pragma|sec-/i.test(k))) }); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Network.enable'); await send('Page.enable'); await send('Page.navigate', { url }); await sleep(5000);
console.log(JSON.stringify(out.slice(0, 3), null, 1)); ws.close(); chrome.kill(); process.exit(0);
