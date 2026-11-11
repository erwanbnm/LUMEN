// Aventure · Monde 2 (Désert des Rois) + tableau de quêtes : ouverture de l'île, carte, monstres, boss en 3 phases, quêtes (pièces, potion)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:400, height:860}});
  await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true; });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const errs = [], log = []; p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({path:path.join(OUT, 'm2_' + n + '.png')});
  const click = sel => p.evaluate(s => document.querySelector(s).dispatchEvent(new MouseEvent('click', {bubbles:true})), sel);
  await p.addInitScript(() => { if (!localStorage.getItem('chevet.v2')) localStorage.setItem('chevet.v2', JSON.stringify({profile:{name:'Erwan', age:20, avatar:0}, coins:500, settings:{music:false, sfx:false, vol:55},
    adv:{refund:0, seen:[], w:{1:{st:[7,7,3,7,1,3,0], best:[9,10,12,8,15,9,0], done:[1,1,1,1,1,1,0], ok:40, kills:12}}}})); });
  await p.goto('file://' + path.join(ROOT, 'dist', 'lumen.html')); await p.waitForTimeout(3000);
  await p.click('[data-tab="aventure"]'); await p.waitForTimeout(600);
  await click('[data-adv="world"][data-v="2"]'); await p.waitForTimeout(400);
  log.push('désert fermé avant le boss : ' + await p.evaluate(() => !document.querySelector('.av-map-svg')));
  // Tableau de quêtes de la Forêt
  await click('[data-adv="world"][data-v="1"]'); await p.waitForTimeout(500);
  await click('[data-adv="quests"]'); await p.waitForTimeout(500); await shot('1_quetes');
  log.push('quêtes à récupérer : ' + await p.$$eval('[data-adv="claim"]', x => x.map(b => b.dataset.v).join(',')));
  const c0 = await p.evaluate(() => S.coins); await click('[data-adv="claim"][data-v="f1_0"]'); await p.waitForTimeout(300);
  log.push('quête pièces : +' + (await p.evaluate(() => S.coins) - c0));
  await click('[data-adv="claim"][data-v="f1_chrono"]'); await p.waitForTimeout(300);
  log.push('quête potion (hors ligne) : ' + await p.evaluate(() => Potions.has('fifty')) + ' · déjà récupérée : ' + !(await p.$('[data-adv="claim"][data-v="f1_chrono"]')));
  await shot('2_quetes_apres');
  // Boss de la Forêt battu → le Désert s'ouvre
  await p.evaluate(() => { S.adv.w[1].done[6] = 1; S.adv.w[1].st[6] = 7; save(); }); await click('[data-adv="qmap"]'); await click('[data-adv="isl"]'); await p.waitForTimeout(500); await shot('3_iles');
  await click('[data-adv="world"][data-v="2"]'); await p.waitForTimeout(900); await shot('4_carte_bas');
  log.push('carte du désert : ' + await p.$$eval('.av-node', x => x.length) + ' niveaux · titre ' + await p.$eval('.av-t b', x => x.textContent));
  for (const [y, n] of [[700, '5_carte_milieu'], [0, '6_carte_haut']]) { await p.evaluate(y => document.getElementById('av-scroll').scrollTop = y, y); await p.waitForTimeout(300); await shot(n); }
  await click('[data-adv="node"][data-v="0"]'); await p.waitForTimeout(400); await shot('7_panneau');
  await p.evaluate(() => { document.querySelector('.av-sheet') && document.querySelector('[data-adv="close"]').click(); });
  // Les 4 monstres (niveau 4) et le boss
  await p.evaluate(() => { S.adv.w[2] = {st:[0,0,0,0,0,0,0], best:[0,0,0,0,0,0,0], done:[1,1,1,0,0,0,0]}; Aventure._test.start(2, 3); }); await p.waitForTimeout(700); await shot('8_combat_momie');
  for (let m = 1; m < 4; m++) { await p.evaluate(m => { const F = Aventure._test.F(); F.m = m; Aventure._test.show(); }, m); await p.waitForTimeout(400); await shot('9_monstre_' + m); }
  await p.evaluate(() => document.querySelector('[data-adv="quit"]').click()); await p.waitForTimeout(400);
  await p.evaluate(() => { S.adv.w[2].done = [1,1,1,1,1,1,0]; Aventure._test.start(2, 6); }); await p.waitForTimeout(700); await shot('10_boss_1');
  for (let k = 0; k < 7; k++) { await p.waitForFunction(() => document.querySelector('#af-ans button:not([disabled])') || document.querySelector('.af-poster.on'), null, {timeout:20000}); if (await p.$('.af-poster.on')) break;
    await p.evaluate(() => document.querySelector('#af-ans button[data-ans="0"]').click()); await p.waitForTimeout(1350); if (k === 2) await shot('11_boss_2'); if (k === 4) await shot('12_boss_3'); }
  await p.waitForSelector('.af-poster.on', {timeout:9000}); await p.waitForTimeout(1600); await shot('13_victoire');
  log.push('boss du désert : ' + JSON.stringify(await p.evaluate(() => ({done:S.adv.w[2].done[6], st:S.adv.w[2].st[6], titre:!!S.titles.adv2}))));
  log.push('affiche : ' + await p.$eval('.af-paper', x => x.textContent.replace(/\s+/g, ' ').slice(0, 160)));
  await p.evaluate(() => document.querySelector('[data-adv="tomap"]').click()); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.lvup .lv-ok') && document.querySelector('.lvup .lv-ok').click());
  await click('[data-adv="isl"]'); await p.waitForTimeout(500); await shot('14_iles_apres');
  // Skins du 100 % retirés de la boutique
  log.push('skins 100 % : ' + await p.evaluate(() => JSON.stringify([Boutique && skinOf('sparte') && 'sparte', Aventure.pctOf(3), Aventure.pctOf(5)])));
  console.log(log.join('\n')); console.log('erreurs', JSON.stringify(errs)); await b.close();
})();
