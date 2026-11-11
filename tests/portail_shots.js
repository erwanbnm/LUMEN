// Captures du nouveau portail (faille rouge) : carte d'accueil, pop-up, écran de jeu
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noCal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3000);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.evaluate(()=>document.querySelector('[data-av-pick="0"]').click()); await p.evaluate(()=>document.querySelector('#pform button[type=submit]').click());
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); portalToday(); S.portal.force = true; save(); render(); }); await p.waitForTimeout(2200);
 await p.screenshot({path:path.join(OUT,'portail_1_accueil_popup.png')});
 await p.evaluate(()=>{ document.querySelectorAll('.am-inv').forEach(e=>e.remove()); }); await p.waitForTimeout(200);
 await p.screenshot({path:path.join(OUT,'portail_2_accueil.png')});
 await p.click('.portal-card'); await p.waitForTimeout(700); await p.screenshot({path:path.join(OUT,'portail_3_jeu.png')});
 await p.click('.choice'); await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,'portail_4_reponse.png')});
 console.log(errs); await b.close(); })();
