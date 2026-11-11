// Aventure · test d'un monde (2 à 5) : ouverture de l'île, carte, panneau, les 4 monstres, boss en 3 phases, victoire, titre.
// Usage : node tests/aventure_monde.js 3   (captures dans tests/out/mN_*.png)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out'), N = +(process.argv[2] || 2);
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:400, height:860}});
  await p.addInitScript(() => { window.__noPortal = true; window.__noCal = true; });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const errs = [], log = []; p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({path:path.join(OUT, `m${N}_${n}.png`)});
  const click = sel => p.evaluate(s => document.querySelector(s).dispatchEvent(new MouseEvent('click', {bubbles:true})), sel);
  await p.addInitScript(n => { if (localStorage.getItem('chevet.v2')) return; const w = {}; for (let k = 1; k < n; k++) w[k] = {st:[7,7,7,7,7,7,7], best:[9,9,12,9,15,9,3], done:[1,1,1,1,1,1,1]};
    localStorage.setItem('chevet.v2', JSON.stringify({profile:{name:'Erwan', age:20, avatar:0}, coins:500, settings:{music:false, sfx:false, vol:55}, adv:{refund:0, seen:[], w}})); }, N);
  await p.goto('file://' + path.join(ROOT, 'dist', 'lumen.html')); await p.waitForTimeout(3000);
  await p.click('[data-tab="aventure"]'); await p.waitForTimeout(600); await shot('1_iles');
  await click(`[data-adv="world"][data-v="${N}"]`); await p.waitForTimeout(900); await shot('2_carte_bas');
  log.push('carte : ' + await p.$$eval('.av-node', x => x.length) + ' niveaux · ' + await p.$eval('.av-t b', x => x.textContent));
  for (const [y, n] of [[700, '3_carte_milieu'], [0, '4_carte_haut']]) { await p.evaluate(y => document.getElementById('av-scroll').scrollTop = y, y); await p.waitForTimeout(300); await shot(n); }
  await click('[data-adv="node"][data-v="0"]'); await p.waitForTimeout(400); await shot('5_panneau');
  await p.evaluate(() => document.querySelector('[data-adv="close"]').click());
  // Les monstres : un niveau classique dont la liste contient les 4 monstres du monde
  const lv = await p.evaluate(n => { const W = Aventure._test.WS(n); W.done = [1,1,1,1,1,1,0]; return [3, 5, 0, 1].find(i => true); }, N);
  await p.evaluate(([n, i]) => Aventure._test.start(n, i), [N, 3]); await p.waitForTimeout(700); await shot('6_combat');
  const nm = await p.evaluate(() => Aventure._test.F().mons.length);
  for (let m = 1; m < Math.min(4, nm); m++) { await p.evaluate(m => { Aventure._test.F().m = m; Aventure._test.show(); }, m); await p.waitForTimeout(350); await shot('7_monstre_' + m); }
  await p.evaluate(() => document.querySelector('[data-adv="quit"]').click()); await p.waitForTimeout(400);
  await p.evaluate(n => Aventure._test.start(n, 6), N); await p.waitForTimeout(700); await shot('8_boss_1');
  for (let k = 0; k < 7; k++) { await p.waitForFunction(() => document.querySelector('#af-ans button:not([disabled])') || document.querySelector('.af-poster.on'), null, {timeout:20000}); if (await p.$('.af-poster.on')) break;
    await p.evaluate(() => document.querySelector('#af-ans button[data-ans="0"]').click()); await p.waitForTimeout(1350); if (k === 2) await shot('9_boss_2'); if (k === 4) await shot('10_boss_3'); }
  await p.waitForSelector('.af-poster.on', {timeout:9000}); await p.waitForTimeout(1600); await shot('11_victoire');
  log.push('boss : ' + JSON.stringify(await p.evaluate(n => ({done:S.adv.w[n].done[6], st:S.adv.w[n].st[6], titre:!!S.titles['adv' + n], pct:Aventure.pctOf(n)}), N)));
  log.push('affiche : ' + await p.$eval('.af-paper', x => x.textContent.replace(/\s+/g, ' ').slice(0, 170)));
  console.log(log.join('\n')); console.log('erreurs', JSON.stringify(errs)); await b.close();
})();
