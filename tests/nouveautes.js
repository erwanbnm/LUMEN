const {chromium} = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, {recursive:true});
const THREE_DIR = path.dirname(require.resolve('three/package.json'));
(async()=>{ const b = await chromium.launch({args:['--use-gl=swiftshader']}); const p = await b.newPage({viewport:{width:400,height:860}, colorScheme:'dark'}); await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true; }); // pas de pop-up du Portail pendant les tests
 await p.route('**/three.min.js', r => r.fulfill({path:path.join(THREE_DIR,'build/three.min.js'), contentType:'application/javascript'})); await p.route('**/OrbitControls.js', r => r.fulfill({path:path.join(THREE_DIR,'examples/js/controls/OrbitControls.js'), contentType:'application/javascript'}));
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split('\n')[1]));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3500);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="12"]'); await p.click('#pform button[type=submit]');
 await p.click('[data-tab="accueil"]'); await p.click('[data-mot]'); await p.waitForTimeout(300);
 const el = await p.$('.motj'); await el.screenshot({path:path.join(OUT,'n1.png')});
 await p.click('.tabs [data-tab="jouer"]'); await p.click('[data-diff="expert"]'); await p.waitForTimeout(300);
 const d = await p.$('.diff'); await d.screenshot({path:path.join(OUT,'n2.png')});
 await p.click('[data-serie="his"]');
 const lv = await p.evaluate(()=>window.__app.state().session.steps.map(s=>Q[s.id][1]).join(''));
 console.log('expert levels', lv);
 for (let k=0;k<10;k++){ await p.click('[data-ans="0"]'); const n=await p.$('[data-next]'); if(n) await n.click(); }
 await p.click('[data-end]');
 await p.click('[data-mode="qad"]'); await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT,'n3.png')});
 await p.click('[data-quit]');
 await p.click('.tabs [data-tab="profil"]'); await p.click('[data-seg="badges"]'); await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT,'n4.png')});
 console.log('succ', await p.evaluate(()=>JSON.stringify(window.__app.state().succ)));
 console.log(errs); await b.close(); })();
