// Animation d'un badge débloqué : on joue une vraie partie, puis on force deux badges pour voir le pop-up
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:430,height:900}}); await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3300);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); });
 // pendant une partie : pas de pop-up
 await p.click('[data-tab="jouer"]'); await p.click('[data-mode="mix"]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const b = BADGES.find(x=>x.tier==='or'); bdQueue.push(b); flushLevelUp(); });
 await p.waitForTimeout(900);
 console.log('pop-up pendant la partie :', await p.$('.bdup') ? 'OUI (problème)' : 'non (bien)');
 await p.click('[data-quit]'); await p.waitForTimeout(1200);
 console.log('pop-up après la partie :', await p.$('.bdup') ? 'oui (bien)' : 'NON (problème)');
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); lvOpen=false; bdQueue.push(BADGES.find(x=>x.tier==='argent'), BADGES.find(x=>x.tier==='bronze'), BADGES.find(x=>x.tier==='platine')); flushLevelUp(); });
 await p.waitForTimeout(1700); await p.screenshot({path:path.join(OUT,'badge_up.png')});
 console.log(errs); await b.close(); })();
