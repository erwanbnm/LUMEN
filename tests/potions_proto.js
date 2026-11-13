// Maquette « Potions » : captures 375 px (tests/out/po_*.png)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:375, height:812}, deviceScaleFactor:2});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.continue());
  const shot = n => p.screenshot({path:path.join(OUT, 'po_' + n + '.png')});
  const go = async id => { await p.evaluate(i => { document.documentElement.style.scrollBehavior = 'auto'; const e = document.getElementById(i); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 50); }, id); await p.waitForTimeout(400); };
  await p.goto('file://' + path.join(ROOT, 'prototypes', 'potions.html')); await p.waitForTimeout(1200);
  await shot('flacons');
  await go('s-hd'); await shot('entete_sac');
  await go('s-sac'); await p.evaluate(() => scrollBy(0, 160)); await p.waitForTimeout(200); await shot('sac');
  await p.click('[data-sl="xp,e"]'); await p.waitForTimeout(150); await p.click('[data-sl="coin,e"]'); await p.waitForTimeout(150); await p.click('[data-use]'); await p.waitForTimeout(200);
  await p.click('[data-sl="xp,r"]'); await p.click('[data-use]'); await p.click('[data-sl="xp,r"]'); await p.waitForTimeout(200); await shot('sac_actif');
  await go('s-hd'); await shot('entete_actif');
  await go('s-dr'); await p.click('[data-dr="r,coin"]'); await p.waitForTimeout(1000); await shot('trouve_rare'); await p.click('.drop [data-close]:not([data-now])');
  await p.click('[data-dr="e,xp"]'); await p.waitForTimeout(1000); await shot('trouve_epique'); await p.click('.drop [data-close]:not([data-now])');
  await go('s-pa'); await shot('paliers1'); await p.evaluate(() => scrollBy(0, 600)); await p.waitForTimeout(200); await shot('paliers2');
  await go('s-ca'); await shot('calendrier');
  console.log('erreurs', errs); await b.close();
})();
