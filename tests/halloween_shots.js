// Capture de la boutique : section Halloween
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:430,height:900}}); await p.addInitScript(() => { window.__noPortal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3300);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.click('[data-tab="boutique"]'); await p.waitForTimeout(500);
 const lab = await p.$('text=Édition Halloween'); if (lab) await lab.scrollIntoViewIfNeeded();
 await p.evaluate(()=>window.scrollBy(0,-60)); await p.waitForTimeout(300);
 await p.screenshot({path:path.join(OUT,'halloween.png')});
 console.log(errs); await b.close(); })();
