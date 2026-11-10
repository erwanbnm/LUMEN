// Captures et vérifications de la nouvelle boutique : boutique du jour, prestige, parchemin, collection, achats interdits
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[], log=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3000);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); S.coins = 20000; S.skins.sabreur = "x"; S.skins.chimiste = "x"; save(); });
 await p.click('[data-tab="boutique"]'); await p.waitForTimeout(600);
 await p.screenshot({path:path.join(OUT,'bq_1_boutique.png')}); await p.screenshot({path:path.join(OUT,'bq_2_boutique_full.png'), fullPage:true});
 // achat d'un perso hors boutique du jour : refusé
 const notToday = await p.evaluate(()=>{ const d = Boutique.daily(); return SHOP_SKINS.map(s=>s.id).find(id => Boutique.info(id).how==="shop" && !d.includes(id) && !S.skins[id]); });
 const c0 = await p.evaluate(()=>S.coins);
 await p.evaluate(id => { const bt = document.createElement('button'); bt.dataset.buy = id; document.body.appendChild(bt); bt.click(); }, notToday);
 log.push('achat hors boutique refusé : ' + (await p.evaluate(id => !S.skins[id], notToday)) + ' (pièces ' + c0 + ' -> ' + (await p.evaluate(()=>S.coins)) + ')');
 // achat d'un perso du jour
 const d0 = await p.evaluate(()=>Boutique.daily().find(id=>!S.skins[id]));
 if (d0) { await p.click(`[data-buy="${d0}"]`); log.push('achat du jour ' + d0 + ' : ' + (await p.evaluate(id=>!!S.skins[id], d0))); }
 // prestige
 await p.click('[data-buy="empereur"]'); log.push('prestige acheté : ' + (await p.evaluate(()=>!!S.skins.empereur)));
 // parchemin
 await p.click('[data-bq="reveal"]'); await p.waitForTimeout(300); log.push('secret révélé : ' + JSON.stringify(await p.evaluate(()=>S.revealed)));
 await p.screenshot({path:path.join(OUT,'bq_3_parchemin.png')});
 // défi permanent : série de 30
 await p.evaluate(()=>{ Quetes.ev("combo", {v:30}); }); log.push('Petit Dragon débloqué par la série de 30 : ' + (await p.evaluate(()=>!!S.skins.dragon)));
 // tirage identique pour tous : on recharge, même sélection
 const dA = await p.evaluate(()=>Boutique.daily().join(','));
 await p.evaluate(()=>{ document.querySelectorAll('.toast,.tw-fx').forEach(e=>e.remove()); });
 await p.click('[data-shopseg="collection"]'); await p.waitForTimeout(500); await p.evaluate(()=>window.scrollTo(0,0));
 await p.screenshot({path:path.join(OUT,'bq_4_collection.png')});
 await p.click('[data-bq="how"][data-v="secret"]'); await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT,'bq_5_collection_secrets.png'), fullPage:true});
 await p.click('[data-bq="how"][data-v="all"]'); await p.click('[data-bq="rar"][data-v="myth"]'); await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT,'bq_6_mythiques.png'), fullPage:true});
 await p.reload(); await p.waitForTimeout(2500); log.push('même sélection après rechargement : ' + ((await p.evaluate(()=>Boutique.daily().join(','))) === dA) + ' (' + dA + ')');
 console.log(log.join('\n')); console.log(errs); await b.close(); })();
