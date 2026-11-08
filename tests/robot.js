const {chromium} = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive:true});
const THREE_DIR = path.dirname(require.resolve('three/package.json'));
(async()=>{ const b = await chromium.launch({args:['--use-gl=swiftshader']}); const p = await b.newPage({viewport:{width:1280,height:800}});
 await p.route('**/three.min.js', r => r.fulfill({path:path.join(THREE_DIR,'build/three.min.js'), contentType:'application/javascript'}));
 await p.route('**/OrbitControls.js', r => r.fulfill({path:path.join(THREE_DIR,'examples/js/controls/OrbitControls.js'), contentType:'application/javascript'}));
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split('\n').slice(1,3).join(' ')));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3500);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 // visit parc first
 await p.click('[data-tab="parc"]'); await p.waitForTimeout(1500); await p.click('#back'); await p.waitForTimeout(300);
 const modes=['daily','serie','serie','mix','survie','revoir','serie','chrono'];
 for (const m of modes){
   await p.evaluate(()=>{ const s=window.__app.state(); s.session=null; s.tab='jouer'; window.__app.save(); });
   await p.click('[data-tab="jouer"]');
   const sel = m==='daily'?'[data-start="daily"]':m==='serie'?'[data-serie="geo"]':`[data-mode="${m}"]`;
   const el = await p.$(sel); if(!el || await el.isDisabled()) { console.log('skip',m); continue; }
   await el.click(); let n=0, ok=false;
   for (let k=0;k<60;k++){
     const before = await p.evaluate(()=>document.querySelector('#app').innerHTML.length+':'+JSON.stringify(window.__app.state().session&&[window.__app.state().session.pos,window.__app.state().session.done]));
     const ans = await p.$$('[data-ans]:not([disabled])');
     if (ans.length) { await ans[Math.floor(Math.random()*ans.length)].click(); n++; }
     else { const nx = await p.$('[data-next]'); if (nx) await nx.click(); else { const e = await p.$('[data-end]'); if (e){ await e.click(); ok=true; break;} else if (m!=='chrono') { console.log('STUCK',m, await p.evaluate(()=>document.querySelector('#app').innerText.slice(0,200))); break; } } }
     await p.waitForTimeout(m==='chrono'?1300:40);
   }
   console.log(m,'answers',n,'ended',ok);
 }
 console.log(errs); await b.close(); })();
