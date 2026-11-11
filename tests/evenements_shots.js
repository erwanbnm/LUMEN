// Événement « La Nuit des Ombres » + jetons rares (sans serveur : inventaire simulé)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[], log=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3000);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.evaluate(()=>document.querySelector('[data-av-pick="0"]').click()); await p.evaluate(()=>document.querySelector('#pform button[type=submit]').click());
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); S.coins = 3000; render(); window.scrollTo(0,0); }); await p.waitForTimeout(400);
 await p.screenshot({path:path.join(OUT,'ev_1_accueil.png')});
 log.push('événement en cours : ' + (await p.evaluate(()=>!!Evenements.cur())) + ' · bouton accueil : ' + !!(await p.$('.ev-hbtn')));
 // Croque-Rêves retiré : remboursé
 await p.evaluate(()=>{ S.skins.croque = "2026-11-01"; S.profile.skin = "croque"; }); await p.waitForTimeout(4500);
 log.push('Croque-Rêves remboursé : ' + (await p.evaluate(()=>S.coins)) + ' pièces (3000 + 1100 attendu), porté : ' + (await p.evaluate(()=>S.profile.skin)) + ', visible en collection : ' + (await p.evaluate(()=>Boutique.collectionView().includes("Croque"))));
 // Page de l'événement (progression simulée)
 await p.evaluate(()=>{ S.skins.zombie = "2026-11-02"; S.ev.frag = {hw26:{campeur:4, ev_pomme:2, ev_carnet:5}}; });
 await p.click('.ev-hbtn'); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'ev_2_page.png'), fullPage:true});
 // Fragment trouvé + personnage complet
 await p.evaluate(()=>{ const el = document.createElement("div"); el.className = "ev-frag"; el.innerHTML = '<span><b>+1 fragment</b> · Le Spectre à la Pomme <i>3/6</i></span>'; document.body.appendChild(el); });
 await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,'ev_3_fragment.png')});
 await p.evaluate(()=>{ document.querySelectorAll('.ev-frag').forEach(e=>e.remove()); S.skins.ev_carnet = "2026-11-11"; S.ev.seen.ev_carnet = 0; save(); }); await p.waitForTimeout(4600);
 log.push('fenêtre « personnage débloqué » : ' + !!(await p.$('.ev-unlock'))); await p.screenshot({path:path.join(OUT,'ev_4_debloque.png')});
 await p.evaluate(()=>{ const b = document.querySelector('[data-evu="wear"]'); if (b) b.click(); }); log.push('porté : ' + (await p.evaluate(()=>S.profile.skin)));
 // Collection : origine « Événement temporaire »
 await p.evaluate(()=>{ S.evOpen = false; S.tab = "boutique"; render(); }); await p.click('[data-shopseg="collection"]'); await p.click('[data-bq="how"][data-v="event"]'); await p.waitForTimeout(300);
 await p.screenshot({path:path.join(OUT,'ev_5_collection.png'), fullPage:true});
 // Boutique : jetons (sans compte : achat sur l'appareil)
 await p.click('[data-shopseg="skins"]'); await p.waitForTimeout(300);
 const c0 = await p.evaluate(()=>S.coins); await p.click('[data-evb="fifty"]'); await p.waitForTimeout(300);
 log.push('achat 50/50 : -' + (c0 - await p.evaluate(()=>S.coins)) + ' pièces, possédé : ' + (await p.evaluate(()=>Potions.has("fifty"))));
 await p.evaluate(()=>{ Evenements.buy("fifty"); }); log.push('2e achat bloqué : ' + (c0 - await p.evaluate(()=>S.coins) === 1000));
 await p.evaluate(()=>{ document.querySelector('.ev-toks').scrollIntoView({block:"center"}); }); await p.waitForTimeout(200); await p.screenshot({path:path.join(OUT,'ev_6_boutique.png')});
 // 50/50 en Survie
 await p.evaluate(()=>{ S.tab = "jouer"; render(); start("survie"); }); await p.waitForTimeout(400);
 log.push('bouton jeton en Survie : ' + !!(await p.$('[data-fifty]'))); await p.screenshot({path:path.join(OUT,'ev_7_survie.png')});
 await p.click('[data-fifty]'); await p.waitForTimeout(300);
 log.push('réponses retirées : ' + (await p.$$eval('.choice.gone', x => x.length)) + ' · bonne réponse visible : ' + (await p.evaluate(()=>!document.querySelector('.choice[data-ans="0"]').classList.contains('gone'))) + ' · jeton consommé : ' + !(await p.evaluate(()=>Potions.has("fifty"))));
 await p.screenshot({path:path.join(OUT,'ev_8_apres5050.png')});
 // pas en Chrono
 await p.evaluate(()=>{ Potions.give("fifty"); leaveSession(); start("chrono"); }); await p.waitForTimeout(300); log.push('pas de jeton en Chrono : ' + !(await p.$('[data-fifty]')));
 await p.evaluate(()=>{ leaveSession(); S.tab = "tour"; render(); Tour.click({dataset:{tw:"start"}}); }); await p.waitForTimeout(500);
 log.push('bouton jeton dans la Tour : ' + !!(await p.$('[data-tw="fifty"]'))); await p.click('[data-tw="fifty"]'); await p.waitForTimeout(300);
 log.push('Tour : réponses retirées ' + (await p.$$eval('.choice.gone', x => x.length))); await p.screenshot({path:path.join(OUT,'ev_9_tour.png')});
 // palier 30 sans compte
 await p.evaluate(()=>{ Evenements.tower(30); }); log.push('palier 30 : 50/50 reçu ' + (await p.evaluate(()=>Potions.has("fifty"))) + ', 2e fois ignorée ' + (await p.evaluate(()=>{ const c = S.coins; Evenements.tower(30); return S.coins === c; })));
 console.log(log.join('\n')); console.log(errs); await b.close(); })();
