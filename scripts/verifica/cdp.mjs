// Headless Chrome via CDP: measures the live page at a given viewport. Read-only.
import { spawn } from 'node:child_process';
const [,, url, width = '390', height = '844', mobile = '1', port = '9333'] = process.argv;
const dir = process.env.SCRATCH + '/chrome-prof-' + port;
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result.result.value ?? r.result; };
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: +width, height: +height, deviceScaleFactor: mobile === '1' ? 3 : 1, mobile: mobile === '1' });
if (mobile === '1') await send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 750e3 / 8 });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
window.__m={lcp:null,lcpEl:null,cls:0,shifts:[]};
new PerformanceObserver(l=>{for(const e of l.getEntries()){__m.lcp=e.startTime;__m.lcpEl=(e.element&&(e.element.tagName+' '+(e.element.currentSrc||e.url||e.element.className||'').toString().slice(0,90)))}}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries()){if(!e.hadRecentInput){__m.cls+=e.value;__m.shifts.push([e.value,(e.sources||[]).map(s=>s.node&&s.node.nodeName+'.'+(s.node.className||'').toString().slice(0,40))])}}}).observe({type:'layout-shift',buffered:true});` });
await send('Page.navigate', { url });
await sleep(9000);
const early = await ev(`JSON.stringify({lcp:__m.lcp,lcpEl:__m.lcpEl,cls:__m.cls,shifts:__m.shifts,
 res:performance.getEntriesByType('resource').map(r=>[r.name.replace(location.origin,''),r.initiatorType,r.transferSize,r.renderBlockingStatus,Math.round(r.responseEnd)]),
 nav:(p=>({ttfb:Math.round(p.responseStart),dcl:Math.round(p.domContentLoadedEventEnd),load:Math.round(p.loadEventEnd),size:p.transferSize}))(performance.getEntriesByType('navigation')[0]),
 fcp:(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime})`);
console.log('EARLY', early);
// scroll whole page to trigger lazy stuff, then run audit
await ev(`(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}scrollTo(0,0)})()`);
await sleep(1500);
const audit = await ev(`(()=>{
const lum=c=>{const m=c.match(/[\\d.]+/g).map(Number);const [r,g,b]=m.slice(0,3).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*r+0.7152*g+0.0722*b};
const alpha=c=>{const m=c.match(/[\\d.]+/g);return m.length>3?+m[3]:1};
const bgOf=el=>{while(el){const s=getComputedStyle(el);if(s.backgroundImage!=='none'&&!s.backgroundImage.startsWith('url'))return 'gradient';if(alpha(s.backgroundColor)>0.5)return s.backgroundColor;el=el.parentElement}return 'rgb(5,6,8)'};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return +(((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2))};
const vis=el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
const out={};
out.vw=innerWidth;out.scrollW=document.documentElement.scrollWidth;out.overflow=document.documentElement.scrollWidth>innerWidth;
out.wide=[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&vis(e)).slice(0,8).map(e=>e.tagName+'.'+(e.className||'').toString().slice(0,60)+' r='+Math.round(e.getBoundingClientRect().right));
out.small=[...document.querySelectorAll('a,button,summary,input,select,textarea')].filter(vis).map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),(e.innerText||e.getAttribute('aria-label')||e.name||e.tagName).trim().slice(0,40)]}).filter(([w,h])=>w<44||h<44);
out.imgs=[...document.images].map(i=>[i.currentSrc.split('/').pop(),i.getAttribute('width'),i.getAttribute('height'),i.loading,i.naturalWidth,Math.round(i.getBoundingClientRect().width)]);
out.bgImgs=[...document.querySelectorAll('[style*=background-image]')].length;
out.headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>h.tagName+':'+h.innerText.trim().slice(0,40));
out.noName=[...document.querySelectorAll('a,button')].filter(e=>!(e.innerText.trim()||e.getAttribute('aria-label')||e.querySelector('img[alt]'))).map(e=>e.outerHTML.slice(0,80));
out.deadLinks=[...document.querySelectorAll('a[href="#"]')].map(a=>a.getAttribute('aria-label')||a.innerText.trim());
out.unlabeled=[...document.querySelectorAll('input,select,textarea')].filter(e=>!(e.labels&&e.labels.length)&&!e.getAttribute('aria-label')).map(e=>e.name);
const seen=new Map();
for(const el of document.querySelectorAll('body *')){ if(!vis(el))continue; const t=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim(); if(!t)continue;
 const s=getComputedStyle(el);const bg=bgOf(el);if(bg==='gradient')continue;const r=ratio(s.color,bg);const fs=parseFloat(s.fontSize);const large=fs>=24||(fs>=18.66&&+s.fontWeight>=700);
 const need=large?3:4.5; if(r<need){const k=s.color+' on '+bg+' '+fs+'px';if(!seen.has(k))seen.set(k,[r,need,t.slice(0,40)])}}
out.contrastFails=[...seen].map(([k,v])=>k+' => '+v[0]+' (need '+v[1]+') "'+v[2]+'"');
const cs=(sel)=>{const e=document.querySelector(sel);if(!e)return null;const s=getComputedStyle(e);return s.color+' on '+bgOf(e)+' = '+ratio(s.color,bgOf(e))};
out.samples={body:cs('#about p.text-slate-800'),cta:cs('a.bg-brandOrange'),kicker:cs('#about p.text-brandOrange'),heroH1:cs('h1 span'),footer:cs('footer p.text-slate-400'),muted:cs('#reviews p.text-slate-600')};
let rm=false,fv=false;for(const sh of document.styleSheets){try{for(const r of sh.cssRules){const t=r.cssText;if(t.includes('prefers-reduced-motion'))rm=true;if(t.includes(':focus-visible'))fv=true}}catch(e){}}
out.reducedMotionRule=rm;out.focusVisibleRule=fv;
const inp=document.querySelector('input[name=name]');inp.focus();const fs=getComputedStyle(inp);out.inputFocus=fs.outlineStyle+' '+fs.outlineWidth+' border '+fs.borderColor+' shadow '+fs.boxShadow;
const b=document.querySelector('button[type=submit]');b.focus();const bs=getComputedStyle(b);out.buttonFocus=bs.outlineStyle+' '+bs.outlineWidth+' '+bs.outlineColor;
out.banner=!document.getElementById('cookie-consent-banner').classList.contains('hidden');
out.fonts=[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.weight);
out.domNodes=document.querySelectorAll('*').length;
return JSON.stringify(out);})()`);
console.log('AUDIT', audit);
ws.close(); chrome.kill();
