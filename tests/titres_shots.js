// Titres : boutique, achat, affichage sous le pseudo, LOOSER DU JOUR après 4 erreurs
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:430,height:900}}); await p.addInitScript(() => { window.__noPortal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3300);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); S.coins = 2000; save(); render(); });
 await p.click('[data-tab="boutique"]'); await p.click('[data-shopseg="titres"]'); await p.waitForTimeout(300);
 await p.click('[data-tbuy="kingnorth"]'); await p.waitForTimeout(300);
 await p.screenshot({path:path.join(OUT,'titres_boutique.png'), fullPage:true});
 console.log('titre porté :', await p.evaluate(()=>myTitle()), '| pièces :', await p.evaluate(()=>S.coins));
 // 4 erreurs d'affilée en Grand mélange
 await p.click('[data-tab="jouer"]'); await p.click('[data-mode="mix"]'); await p.waitForTimeout(300);
 for (let k = 0; k < 4; k++) { await p.evaluate(()=>{ const b=[...document.querySelectorAll('[data-ans]:not([disabled])')].find(x=>x.dataset.ans!=="0"); b && b.click(); }); await p.waitForTimeout(200); const n = await p.$('[data-next]'); if (n) await n.click(); await p.waitForTimeout(200); }
 console.log('après 4 erreurs :', await p.evaluate(()=>myTitle()));
 await p.screenshot({path:path.join(OUT,'titres_looser.png')});
 console.log(errs); await b.close(); })();
