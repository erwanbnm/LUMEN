// Calendrier de connexion (mode sans compte) et potions : fenêtre auto, récupération, jours suivants, potions, double gain, portail
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[], log=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3000);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.evaluate(()=>document.querySelector('[data-av-pick="0"]').click()); await p.evaluate(()=>document.querySelector('#pform button[type=submit]').click());
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); render(); });
 await p.waitForTimeout(2500);
 log.push('fenêtre ouverte automatiquement : ' + !!(await p.$('.cal-modal')));
 if (!(await p.$('.cal-modal'))) await p.evaluate(()=>Calendrier.open());
 await p.screenshot({path:path.join(OUT,'cal_1_fenetre.png')});
 const c0 = await p.evaluate(()=>S.coins);
 await p.click('[data-cal="claim"]'); await p.waitForTimeout(900); await p.screenshot({path:path.join(OUT,'cal_2_animation.png')});
 await p.waitForTimeout(1800);
 log.push('jour 1 : +' + ((await p.evaluate(()=>S.coins)) - c0) + ' pièces');
 await p.evaluate(()=>Calendrier.claim()); await p.waitForTimeout(400);
 log.push('2e récupération le même jour bloquée : ' + ((await p.evaluate(()=>S.cal.n)) === 1));
 await p.screenshot({path:path.join(OUT,'cal_3_apres.png')});
 // jours suivants (on recule la date de dernière récupération pour simuler le lendemain)
 const next = async () => { await p.evaluate(()=>{ S.cal.day -= 1; }); await p.evaluate(()=>Calendrier.open()); await p.click('[data-cal="claim"]'); await p.waitForTimeout(2600); };
 await next(); await next();
 log.push('jour 3 : potion Double XP reçue : ' + (await p.evaluate(()=>Potions.has("xp"))));
 await next(); log.push('jour 4 : potion Double pièces reçue : ' + (await p.evaluate(()=>Potions.has("coin"))));
 await p.evaluate(()=>Calendrier.open()); await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT,'cal_4_jour4.png')});
 await p.evaluate(()=>Calendrier.close());
 // potion déjà possédée : on simule le jour 17 (= case 3) avec la potion XP encore en stock
 await p.evaluate(()=>{ S.cal.n = 16; S.cal.paid = 16; S.cal.day -= 1; });
 const c1 = await p.evaluate(()=>S.coins); await p.evaluate(()=>Calendrier.open()); await p.click('[data-cal="claim"]'); await p.waitForTimeout(800);
 await p.screenshot({path:path.join(OUT,'cal_5_remplacement.png')}); await p.waitForTimeout(2000);
 log.push('case 3 avec potion déjà possédée : +' + ((await p.evaluate(()=>S.coins)) - c1) + ' pièces, toujours 1 seule potion : ' + (await p.evaluate(()=>Potions.has("xp"))));
 // double pièces : gain d'une bonne réponse avant/après activation
 const gain = async () => p.evaluate(()=>{ const id = Object.keys(Q).find(i => !S.q[i] && Q[i][1] === 1); const r = answer(id, true, 0); return r; });
 const g1 = await gain(); await p.evaluate(()=>Calendrier.close()); await p.click('[data-pot="open"]'); await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT,'cal_6_potions.png')});
 await p.click('[data-pot="use"][data-v="coin"]'); await p.click('[data-pot="open"]').catch(()=>{}); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const b = document.querySelector('[data-pot="use"][data-v="xp"]'); if (b) b.click(); }); await p.waitForTimeout(300);
 const g2 = await gain();
 log.push('gain sans potion : ' + JSON.stringify(g1) + ' · avec les deux potions : ' + JSON.stringify(g2));
 log.push('relancer une potion active impossible : ' + (await p.evaluate(()=>{ const u = S.inv.coin.until; Potions.use("coin"); return S.inv.coin.until === u; })));
 await p.evaluate(()=>{ document.querySelectorAll('.pot-sheet,.toast').forEach(e=>e.remove()); render(); window.scrollTo(0,0); }); await p.waitForTimeout(400);
 await p.screenshot({path:path.join(OUT,'cal_7_accueil.png')});
 // portail : ouvert tous les jours
 log.push('portail ouvert les 30 prochains jours : ' + (await p.evaluate(()=>{ let ok = 0; for (let i = 0; i < 30; i++){ const d = new Date(Date.now() + i*864e5); const s = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); if (portalPlan(s).open) ok++; } return ok; })) + '/30');
 log.push('portail ouvert maintenant : ' + (await p.evaluate(()=>portalOpen())));
 console.log(log.join('\n')); console.log(errs); await b.close(); })();
