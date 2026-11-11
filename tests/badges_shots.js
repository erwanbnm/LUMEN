// Ouvre l'onglet Badges du profil et capture les erreurs
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:430,height:900}}); await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split(String.fromCharCode(10)).slice(1,4).join(' ')));
 p.on('console', m => { if (m.type()==='error') errs.push('console: '+m.text()); });
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3300);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.click('[data-tab="profil"]'); await p.waitForTimeout(400);
 await p.click('[data-seg="badges"]'); await p.waitForTimeout(600);
 await p.screenshot({path:path.join(OUT,'badges.png')});
 console.log('seg actif :', await p.evaluate(()=>document.querySelector('[data-seg][aria-pressed="true"]') && document.querySelector('[data-seg][aria-pressed="true"]').dataset.seg));
 console.log(errs); await b.close(); })();
