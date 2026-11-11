// Aventure (Monde 1) : remboursement du parc, îles, carte, panneau, combats (classique, chrono, survie, boss), étoiles, Casino
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:400, height:860}});
  await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true; });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const errs = [], log = []; p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({path:path.join(OUT, 'av_' + n + '.png')});
  // Une ancienne sauvegarde avec un parc construit (maison niveau 2 = 140 pièces, casino niveau 1 = 100, un banc 25 et un piano 90 → 355, remboursé 178)
  await p.addInitScript(() => { if (!localStorage.getItem('chevet.v2')) localStorage.setItem('chevet.v2', JSON.stringify({profile:{name:'Erwan', age:20, avatar:0}, coins:500, parc:{map:{maison:2, casino:1}, garden:[{id:'banc'}], inside:[{id:'piano'}], wheelDay:''}, settings:{music:false, sfx:false, vol:55}})); });
  await p.goto('file://' + path.join(ROOT, 'dist', 'lumen.html')); await p.waitForTimeout(3200);
  log.push('remboursement : ' + JSON.stringify(await p.evaluate(() => [S.adv.refund, Math.round(S.coins)])) + ' (attendu 178, 678)');
  await p.evaluate(() => { document.querySelectorAll('.lvup').forEach(e => e.remove()); });
  log.push('onglets : ' + await p.$$eval('#tabs button', x => x.map(b => b.textContent.trim()).join(' | ')));
  await p.click('[data-tab="aventure"]'); await p.waitForTimeout(900); await shot('1_iles');
  await p.evaluate(() => document.querySelector('[data-adv="world"][data-v="1"]').dispatchEvent(new MouseEvent('click', {bubbles:true}))); await p.waitForTimeout(900); await shot('2_carte');
  log.push('niveaux sur la carte : ' + await p.$$eval('.av-node', x => x.length) + ' · taverne : ' + !!(await p.$('.av-tav')));
  await p.evaluate(() => document.querySelector('[data-adv="node"][data-v="1"]').dispatchEvent(new MouseEvent('click', {bubbles:true}))); await p.waitForTimeout(500);
  log.push('niveau 2 verrouillé : ' + await p.$eval('[data-adv="play"]', x => x.disabled)); await shot('3_verrou');
  await p.evaluate(() => document.querySelector('[data-adv="node"][data-v="0"]').dispatchEvent(new MouseEvent('click', {bubbles:true}))); await p.waitForTimeout(500); await shot('4_panneau');
  // Combat classique : 9 bonnes réponses, 1 erreur
  await p.click('[data-adv="play"]'); await p.waitForTimeout(800); await shot('5_combat');
  // Répond (bonne réponse = data-ans 0) dès qu'une question est prête ; après le motif, bonnes réponses jusqu'à l'affiche de fin
  const ansAll = async (pattern) => { for (let k = 0; k < 40; k++) {
    await p.waitForFunction(() => document.querySelector('#af-ans button:not([disabled])') || document.querySelector('.af-poster.on'), null, {timeout:25000});
    if (await p.$('.af-poster.on')) break;
    const ok = k < pattern.length ? pattern[k] : 1;
    await p.evaluate(v => { const b = document.querySelector(`#af-ans button[data-ans="${v}"]:not([disabled])`); if (b) b.click(); }, ok ? 0 : 1);
    await p.waitForFunction(() => !document.querySelector('#af-ans button:not([disabled])') || document.querySelector('.af-poster.on'), null, {timeout:5000}).catch(() => {});
  } };
  await p.waitForSelector('#af-ans button'); await p.click('#af-ans button[data-ans="0"]'); await p.waitForTimeout(330); await shot('6_coup');
  await p.waitForTimeout(1100); await p.click('#af-ans button[data-ans="2"]'); await p.waitForTimeout(450); await shot('7_riposte');
  await p.waitForTimeout(1600);
  await ansAll([1,1,1,1,1,1,1,1]);
  await p.waitForSelector('.af-poster.on', {timeout:9000}); await p.waitForTimeout(1600); await shot('8_victoire');
  log.push('niveau 1 : ' + JSON.stringify(await p.evaluate(() => ({st:S.adv.w[1].st[0], done:S.adv.w[1].done[0], best:S.adv.w[1].best[0]}))));
  await p.click('[data-adv="tomap"]'); await p.waitForTimeout(800); await shot('9_carte_apres');
  // Chrono, Survie et Boss directement (test)
  const run = async (i, pattern, name) => { await p.evaluate(i => { S.adv.w[1].done = S.adv.w[1].done.map((d, k) => k < i ? 1 : d); Aventure._test.start(1, i); }, i); await p.waitForTimeout(700); await shot(name + '_a'); await ansAll(pattern); await p.waitForSelector('.af-poster.on', {timeout:70000}); await p.waitForTimeout(1500); await shot(name + '_b');
    const r = await p.evaluate(i => ({st:S.adv.w[1].st[i], done:S.adv.w[1].done[i]}), i); await p.click('[data-adv="tomap"]'); await p.waitForTimeout(500); return r; };
  log.push('survie (3 erreurs) : ' + JSON.stringify(await run(4, [1,0,1,0,1,0,1,1], '10_survie')));
  log.push('boss (7 bonnes, 1 erreur) : ' + JSON.stringify(await run(6, [1,1,1,0,1,1,1,1], '11_boss')) + ' · titre ' + await p.evaluate(() => !!S.titles.adv1));
  await p.evaluate(() => { Aventure._test.start(1, 6); }); await p.waitForTimeout(600);
  for (let k = 0; k < 3; k++) { await p.waitForSelector('#af-ans button:not([disabled])'); await p.evaluate(() => document.querySelector('#af-ans button[data-ans="0"]').click()); await p.waitForTimeout(1300); } await p.waitForTimeout(500); await shot('12_boss_phase2');
  await p.click('[data-adv="quit"]'); await p.waitForTimeout(500);
  // Chrono : réponses rapides pendant 60 s
  await p.evaluate(() => Aventure._test.start(1, 2)); await p.waitForTimeout(600); await shot('13_chrono');
  const t0 = Date.now(); while (Date.now() - t0 < 64000 && !(await p.$('.af-poster.on'))) { const bt = await p.$('#af-ans button[data-ans="0"]:not([disabled])'); if (bt) await p.evaluate(() => { const x = document.querySelector("#af-ans button[data-ans=\"0\"]:not([disabled])"); if (x) x.click(); }); await p.waitForTimeout(250); }
  await p.waitForTimeout(1500); await shot('14_chrono_fin'); log.push('chrono : ' + JSON.stringify(await p.evaluate(() => ({st:S.adv.w[1].st[2], ok:Aventure._test.F() && Aventure._test.F().ok}))));
  await p.click('[data-adv="tomap"]'); await p.waitForTimeout(600);
  // Questions : pas de doublon dans une partie, difficulté
  log.push('listes : ' + JSON.stringify(await p.evaluate(() => { const L = {mode:'c', mix:[.85, .15, 0], sp:{k:'hard'}}; let dup = 0, lv = {1:0, 2:0, 3:0}; for (let k = 0; k < 50; k++) { const l = Aventure._test.makeList(L, 10).map(x => x.id); if (new Set(l).size !== l.length) dup++; l.forEach(id => lv[Q[id][1]]++); } return {doublons:dup, niveaux:lv}; })));
  // Casino
  // après le boss de la Forêt, le bateau mène au Désert : on revient dans la Forêt pour le Casino
  await p.evaluate(() => { const b = document.querySelector('[data-adv="isl"]'); if (b) b.click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('.av-isl[data-v="1"]').dispatchEvent(new MouseEvent('click', {bubbles:true}))); await p.waitForTimeout(600);
  await p.evaluate(() => { scrollTo(0, 0); document.querySelector('[data-adv="casino"]').dispatchEvent(new MouseEvent('click', {bubbles:true})); }); await p.waitForTimeout(500); await shot('15_casino');
  await p.click('[data-g="open"][data-v="roue"]'); await p.waitForTimeout(300); const c0 = await p.evaluate(() => S.coins); await p.click('[data-g="spin"]'); await p.waitForTimeout(4600); await shot('16_roue');
  log.push('roue : +' + (await p.evaluate(() => S.coins) - c0) + ' · 2e tour bloqué : ' + await p.$eval('[data-g="spin"]', x => x.disabled));
  await p.click('[data-g="hall"]'); await p.click('[data-g="open"][data-v="blackjack"]'); await p.click('[data-g="deal"]'); await p.waitForTimeout(300); await shot('17_blackjack');
  await p.click('[data-g="hall"]').catch(() => {}); await p.evaluate(() => document.querySelector('[data-g="hall"]') && document.querySelector('[data-g="hall"]').click());
  await p.click('[data-g="open"][data-v="roulette"]'); await p.click('[data-g="color"][data-v="rouge"]'); await p.click('[data-g="roulette"]'); await p.waitForTimeout(2600); log.push('roulette : ' + await p.$eval('.gmsg', x => x.textContent));
  await p.click('[data-g="hall"]'); await p.click('[data-g="open"][data-v="courses"]'); await p.click('[data-g="horse"][data-v="0"]'); await p.click('[data-g="race"]'); await p.waitForTimeout(6200); log.push('courses : ' + await p.$eval('.gmsg', x => x.textContent));
  await p.click('[data-g="hall"]'); await p.click('[data-g="close"]'); await p.waitForTimeout(400);
  log.push('retour à la forêt : ' + !!(await p.$('.av-map-svg')));
  // Écran large
  await p.setViewportSize({width:1200, height:800}); await p.waitForTimeout(400); await shot('18_ordinateur');
  console.log(log.join('\n')); console.log('erreurs', JSON.stringify(errs)); await b.close();
})();
