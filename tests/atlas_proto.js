// Maquette Atlas du monde : captures 375 px (tests/out/at_*.png) et vérification des touchers sur la carte
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:375, height:760}, deviceScaleFactor:2, hasTouch:true});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({path:path.join(OUT, 'at_' + n + '.png')});
  await p.goto('file://' + path.join(ROOT, 'prototypes', 'atlas.html')); await p.waitForTimeout(800);
  await shot('accueil');
  await p.click('[data-go=set-loc]'); await p.waitForTimeout(200); await p.click('[data-set=n][data-v="20"]'); await shot('reglages');
  await p.click('[data-go=play-loc]'); await p.waitForTimeout(400); await shot('carte');
  // Centre écran d'un pays
  const at = c => p.evaluate(c => { const q = BY[c], r = document.querySelector('#map').getBoundingClientRect(); return [r.left + M.tx + q.x * M.k, r.top + M.ty + q.y * M.k]; }, c);
  let ok = 0; const BYs = c => c;
  for (let i = 0; i < 4; i++) { const want = await p.evaluate(() => G.list[G.i]); const [x, y] = await at(want); const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.dataset.c || e.tagName); }, [x, y]); if (hit !== want) console.log('raté', want, BYs(want), 'touché', hit, Math.round(x), Math.round(y)); await p.mouse.click(x, y); await p.waitForTimeout(150); if (i === 0) await shot('bon'); await p.waitForTimeout(1000); ok = await p.evaluate(() => G.ok); }
  console.log('bonnes réponses en touchant le centre :', ok, '/ 4');
  // Une erreur : on touche un autre pays
  const want = await p.evaluate(() => G.list[G.i]); const other = await p.evaluate(w => G.list.find(c => c !== w && !BY[c].s), want); const [ox, oy] = await at(other);
  await p.mouse.click(ox, oy); await p.waitForTimeout(700); await shot('erreur'); await p.waitForTimeout(1800);
  // Zoom à la molette puis déplacement
  await p.mouse.move(190, 420); await p.mouse.wheel(0, -300); await p.waitForTimeout(200); await shot('zoom');
  await p.click('[data-go=quit]'); await p.click('[data-go=set-cap]'); await p.click('[data-go=play-cap]'); await p.waitForTimeout(200); await shot('capitale');
  await p.click('[data-ans="0"]'); await p.waitForTimeout(200); await shot('capitale_rep');
  await p.click('[data-go=quit]'); await p.click('[data-go=mymap]'); await p.waitForTimeout(300); await shot('ma_carte');
  await p.click('[data-go=home]'); await p.click('[data-go=stats]'); await shot('stats');
  await p.click('[data-go=home]'); await p.click('[data-go=rank]'); await shot('classement');
  console.log('erreurs', errs); await b.close();
})();
