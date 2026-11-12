// Maquette « Joueurs » : captures 375 px (tests/out/jo_*.png)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:375, height:812}, deviceScaleFactor:2});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({path:path.join(OUT, 'jo_' + n + '.png')});
  await p.goto('file://' + path.join(ROOT, 'prototypes', 'joueurs.html')); await p.waitForTimeout(800);
  await shot('hub');
  await p.click('[data-go=players]'); await p.waitForTimeout(300); await shot('liste');
  await p.fill('#jl-q', 'ch'); await p.waitForTimeout(200); await shot('recherche');
  await p.fill('#jl-q', ''); await p.click('[data-f=on]'); await p.waitForTimeout(200); await shot('en_ligne');
  await p.click('[data-f=all]'); await p.click('[data-see=lea]'); await p.waitForTimeout(400); await shot('profil1');
  await p.evaluate(() => { const v = document.querySelector('.pv'); v.scrollTop = 900; }); await p.waitForTimeout(200); await shot('profil2');
  await p.evaluate(() => { const v = document.querySelector('.pv'); v.scrollTop = 99999; }); await p.waitForTimeout(200); await shot('profil3');
  await p.click('.pv [data-cmp]'); await p.waitForTimeout(300); await shot('compare');
  await p.click('.pv [data-close]'); await p.click('[data-go=else]'); await p.waitForTimeout(300); await shot('ailleurs');
  console.log('erreurs', errs); await b.close();
})();
