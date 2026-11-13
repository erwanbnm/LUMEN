// Potions dans l'appli (sans compte, tout sur l'appareil) : paliers déjà atteints, sac, activation, calendrier, boutique.
// Captures : tests/out/pz_*.png
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:375, height:812}, deviceScaleFactor:2});
  await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true;
    if (!localStorage.getItem('chevet.v2')) { const found = {}; for (let i = 0; i < 30; i++) found['x' + i] = 1;
      localStorage.setItem('chevet.v2', JSON.stringify({profile:{name:'Erwan', age:20, avatar:0}, tuto:1, tab:'accueil', coins:2000, tour:{best:52, cp:50, claimed:{}}, atlas:{found}, badges:{all500:'2026-11-01'}, inv:{xp:{got:5}}})); } });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({path:path.join(OUT, 'pz_' + n + '.png')});
  await p.goto('file://' + path.join(ROOT, 'dist', 'lumen.html')); await p.waitForTimeout(2500);
  await p.evaluate(() => { document.querySelectorAll('.lvup').forEach(e => e.remove()); Potions.tick(true); }); await p.waitForTimeout(1500);
  const r1 = await p.evaluate(() => ({pot:S.pot, coins:S.coins, pop:!!document.querySelector('.po-drop-v')}));
  console.log('paliers déjà atteints :', JSON.stringify(r1.pot), '· pièces', r1.coins, '· fenêtre', r1.pop);
  await shot('trouve');
  // Ferme les fenêtres une à une (la file d'attente les montre ensuite)
  for (let i = 0; i < 8; i++) { const x = await p.$('.po-drop-v [data-dr=later]'); if (!x) { await p.waitForTimeout(1200); if (!(await p.$('.po-drop-v'))) break; continue; } await x.click(); await p.waitForTimeout(300); }
  await p.evaluate(() => { render(); }); await p.waitForTimeout(300); await shot('accueil');
  await p.click('[data-pot=open]'); await p.waitForTimeout(300); await shot('sac');
  await p.click('[data-pot=sel][data-v="xp:r"]'); await p.waitForTimeout(150); await p.click('[data-pot=act]'); await p.waitForTimeout(200);
  await p.click('[data-pot=sel][data-v="xp:c"]'); await p.waitForTimeout(150); await p.click('[data-pot=act]'); await p.waitForTimeout(200);
  const r2 = await p.evaluate(() => ({m:Potions.mult('xp'), c:Potions.mult('coin'), left:Math.round(Potions.left('xp') / 6e4), pot:S.pot}));
  console.log('après 2 activations : ×', r2.m, '(pièces ×', r2.c + ') · reste', r2.left, 'min ·', JSON.stringify(r2.pot));
  await shot('sac_actif');
  await p.click('[data-pot=tab][data-v=tiers]'); await p.waitForTimeout(200); await shot('paliers');
  await p.evaluate(() => { document.querySelector('.pot-sheet .cal-box').scrollTop = 900; }); await p.waitForTimeout(150); await shot('paliers2');
  await p.click('.pot-sheet [data-pot=close]'); await p.waitForTimeout(200); await shot('entete');
  // XP doublée sur une bonne réponse
  const r3 = await p.evaluate(() => { const id = Object.keys(Q).find(k => !S.q[k] && Q[k][1] === 1), x0 = S.xp[Q[id][0]] || 0; answer(id, true, 0); return {gain:(S.xp[Q[id][0]] || 0) - x0, base:XP_LVL[1]}; });
  console.log('XP gagnée avec Double XP :', r3.gain, '(normal :', r3.base + ')');
  // Calendrier : jour 2 = potion
  await p.evaluate(() => { S.cal = {n:1, day:1, paid:1}; Calendrier.open(); }); await p.waitForTimeout(400); await shot('calendrier');
  await p.click('[data-cal=claim]'); await p.waitForTimeout(1500); await shot('calendrier_pris');
  const r4 = await p.evaluate(() => S.pot['xp:c']); console.log('après le jour 2 du calendrier, Double XP commune :', r4);
  await p.evaluate(() => Calendrier.close());
  // Coffre légendaire : épique au choix
  await p.evaluate(() => Potions.choose('e', e => Potions.reward('qw', 'chest', {d:'2026-11-13', w:'2026-11-09', e}, 'Coffre légendaire'))); await p.waitForTimeout(400); await shot('choix');
  await p.click('[data-ch=coin]'); await p.waitForTimeout(900); await shot('epique');
  const r5 = await p.evaluate(() => S.pot['coin:e']); console.log('épique au choix (pièces) :', r5);
  await p.evaluate(() => { document.querySelectorAll('.po-drop-v').forEach(e => e.remove()); S.tab = 'boutique'; render(); }); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelectorAll('.po-drop-v').forEach(e => e.remove()));
  await p.waitForTimeout(300); const sb = await p.$('.ev-toks'); if (sb) { await sb.scrollIntoViewIfNeeded(); await p.waitForTimeout(200); await shot('boutique'); }
  await p.evaluate(() => document.querySelectorAll('.po-drop-v').forEach(e => e.remove())); const c0 = await p.evaluate(() => S.coins); await p.click('[data-evb=coin]'); await p.waitForTimeout(300);
  const r6 = await p.evaluate(() => ({coins:S.coins, n:S.pot['coin:c']})); console.log('achat Double pièces commune :', c0, '→', r6.coins, 'pièces · dans le sac', r6.n);
  console.log('erreurs', errs); await b.close();
})();
