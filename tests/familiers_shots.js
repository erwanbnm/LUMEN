// Familiers (boutique, collection, équiper) + page de la Semaine des Familiers (sans serveur)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; window.__noCal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[], log=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3000);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.evaluate(()=>document.querySelector('[data-av-pick="0"]').click()); await p.evaluate(()=>document.querySelector('#pform button[type=submit]').click());
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); S.coins = 5000; S.tab = "boutique"; render(); });
 await p.click('[data-shopseg="pets"]'); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'fam_1_boutique.png'), fullPage:true});
 log.push('familiers affichés : ' + (await p.$$eval('.pet-card', x => x.length)) + ' · boutons d\'achat : ' + (await p.$$eval('[data-pet="buy"]', x => x.map(b => b.dataset.v).join(','))));
 const c0 = await p.evaluate(()=>S.coins); await p.click('[data-pet="buy"][data-v="pet_foudre"]'); await p.waitForTimeout(300);
 log.push('achat Souris Foudre : -' + (c0 - await p.evaluate(()=>S.coins)) + ' · équipé : ' + (await p.evaluate(()=>S.pets.eq)));
 log.push('2e achat impossible : ' + !(await p.$('[data-pet="buy"][data-v="pet_foudre"]')));
 await p.evaluate(()=>{ Familiers.give("pet_cube"); render(); }); await p.click('[data-pet="eq"][data-v="pet_cube"]'); await p.waitForTimeout(200);
 log.push('un seul équipé : ' + (await p.evaluate(()=>S.pets.eq)) + ' · étiquettes « Équipé » : ' + (await p.$$eval('.pet-card .bq-today', x => x.length)));
 log.push('Chiot et Renne pas en vente : ' + !(await p.$('[data-pet="buy"][data-v="pet_scie"]')) + ' ' + !(await p.$('[data-pet="buy"][data-v="pet_renne"]')));
 await p.screenshot({path:path.join(OUT,'fam_2_achete.png')});
 await p.evaluate(()=>{ S.tab = "accueil"; render(); window.scrollTo(0,0); }); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'fam_3_accueil.png')});
 await p.evaluate(()=>{ S.tab = "profil"; render(); window.scrollTo(0,0); }); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'fam_4_profil.png')});
 // Page de l'événement (progression simulée)
 await p.evaluate(()=>{ S.ev = S.ev || {}; S.ev.ch = {fam1:{q:850, spend:6500}}; S.tab = "accueil"; render(); });
 await p.click('.ev-hbtn'); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'fam_5_evenement.png'), fullPage:true});
 log.push('onglets de la page événement : ' + (await p.$$eval('[data-ev="tab"]', x => x.map(b => b.textContent).join(' | '))));
 await p.click('[data-ev="tab"][data-v="frag"]'); await p.waitForTimeout(300); log.push('onglet Halloween : ' + !!(await p.$('.ev-pips')));
 // Familier gagné par un défi : annonce
 await p.evaluate(()=>{ S.evOpen = false; S.tab = "accueil"; Familiers.give("pet_scie"); S.ev.petSeen = {pet_scie:0}; render(); }); await p.waitForTimeout(4600);
 log.push('annonce du familier gagné : ' + !!(await p.$('.ev-unlock'))); await p.screenshot({path:path.join(OUT,'fam_6_gagne.png')});
 console.log(log.join('\n')); console.log(errs); await b.close(); })();
