// Accès direct depuis chaque quête : on vérifie la destination de chaque bouton, et des captures des boutons retour
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; window.__noCal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[], log=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3000);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.evaluate(()=>document.querySelector('[data-av-pick="0"]').click()); await p.evaluate(()=>document.querySelector('#pform button[type=submit]').click());
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); });
 const setup = wk => p.evaluate(wk => { const q = Quetes.state(); const mk = k => ({k, th:k === "th" ? "sci" : null, p:0, done:false, seen:{his:1}});
   if (wk) q.w.list = ["ok","th","hard","mp","mpw","serie","tower","boss"].map(mk); else q.d.list = ["ok","th","hard","run","combo","mp","mpw","tower","boss"].map(mk);
   q.d.list[0].done = !wk; S.session = null; S.tab = "accueil"; S.questOpen = true; render(); }, wk);
 const where = () => p.evaluate(() => ({tab:S.tab, mode:S.session && S.session.mode, theme:S.session && S.session.theme, diff:S.session && S.session.diff, multi:S.multiView, boss:!!S.bossOpen}));
 for (const wk of [false, true]) {
   await setup(wk); if (wk) await p.click('[data-qs="tab"][data-v="w"]').catch(()=>{});
   await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT, wk ? 'qs_acces_semaine.png' : 'qs_acces_jour.png'), fullPage:true});
   const ks = await p.$$eval('[data-qs="go"]', bs => bs.map(b => b.dataset.v + ":" + b.textContent.trim()));
   const locks = await p.$$eval('.qs-lock', s => s.map(x => x.textContent));
   log.push((wk ? "SEMAINE" : "JOUR") + " boutons : " + ks.join(", ") + (locks.length ? " · infos : " + locks.join(" | ") : ""));
   for (const kv of ks) { const k = kv.split(":")[0];
     await setup(wk); if (wk) await p.click('[data-qs="tab"][data-v="w"]').catch(()=>{}); await p.waitForTimeout(150);
     await p.click(`[data-qs="go"][data-v="${k}"]`); await p.waitForTimeout(300);
     log.push("  " + k + " → " + JSON.stringify(await where())); }
 }
 log.push("progression intacte après les clics : " + (await p.evaluate(() => Quetes.state().d.list.every(m => m.p === 0) && Quetes.state().w.list.every(m => m.p === 0))));
 // captures des boutons retour
 await p.evaluate(() => { S.session = null; S.tab = "accueil"; S.questOpen = true; render(); window.scrollTo(0,0); }); await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT,'retour_quetes.png')});
 await p.evaluate(() => { S.questOpen = false; S.tab = "tour"; render(); }); await p.waitForTimeout(400); await p.evaluate(() => { const b = document.querySelector('[data-tw="rank"]'); if (b) b.click(); }); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'retour_tour.png')});
 await p.evaluate(() => { S.tab = "accueil"; render(); start("chrono"); }); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'retour_jeu.png')});
 console.log(log.join('\n')); console.log(errs); await b.close(); })();
