// Atlas du monde dans l'appli : ouverture depuis Jouer, localiser (bons et mauvais touchers), capitales, XP, sauvegarde, captures 375 px (tests/out/atl_*.png)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:375, height:760}, deviceScaleFactor:2, hasTouch:true});
  await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true;
    if (!localStorage.getItem('chevet.v2')) localStorage.setItem('chevet.v2', JSON.stringify({profile:{name:'Erwan', age:20, avatar:0}, tuto:1, tab:'jouer'})); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({path:path.join(OUT, 'atl_' + n + '.png')});
  await p.goto('file://' + path.join(ROOT, 'dist', 'lumen.html')); await p.waitForTimeout(3500);
  await p.evaluate(() => document.querySelectorAll('.lvup').forEach(e => e.remove()));
  await p.evaluate(() => document.querySelector('[data-atlas]').scrollIntoView({block:'center'})); await shot('jouer');
  const xp0 = await p.evaluate(() => (window.__app.state().xp.geo || 0));
  await p.click('[data-atlas]'); await p.waitForTimeout(300); await shot('accueil');
  await p.click('#atlas [data-at=set-loc]'); await p.click('#atlas [data-set=k][data-v=eu]'); await p.click('#atlas [data-set=n][data-v="10"]'); await shot('reglages');
  await p.click('#atlas [data-at=play-loc]'); await p.waitForTimeout(400); await shot('carte');
  const at = c => p.evaluate(c => { const q = Atlas._test.BY[c], M = Atlas._test.M(), r = document.querySelector('#at-map').getBoundingClientRect(); return [r.left + M.tx + q.x * M.k, r.top + M.ty + q.y * M.k]; }, c);
  for (let i = 0; i < 3; i++) { const want = await p.evaluate(() => Atlas._test.G().list[Atlas._test.G().i]); const [x, y] = await at(want); await p.mouse.click(x, y); await p.waitForTimeout(1100); }
  const want = await p.evaluate(() => Atlas._test.G().list[Atlas._test.G().i]); const other = await p.evaluate(w => Atlas._test.G().list.find(c => c !== w && !Atlas._test.BY[c].s), want); const [ox, oy] = await at(other);
  await p.mouse.click(ox, oy); await p.waitForTimeout(600); await shot('erreur'); await p.waitForTimeout(1900);
  const st = await p.evaluate(() => { const a = window.__app.state().atlas; return {found:Object.keys(a.found).length, ok:a.loc.ok, ko:a.loc.ko, xp:window.__app.state().xp.geo || 0}; });
  console.log('localiser :', JSON.stringify(st), 'XP gagnée', st.xp - xp0);
  await p.click('#atlas [data-at=quit]'); await p.click('#atlas [data-at=set-cap]'); await p.click('#atlas [data-at=play-cap]'); await p.waitForTimeout(200);
  for (let i = 0; i < 2; i++) { await p.click('#atlas [data-ans="0"]'); await p.waitForTimeout(150); if (!i) await shot('capitale'); await p.click('#atlas [data-at=cap-next]'); await p.waitForTimeout(150); }
  await p.click('#atlas [data-at=quit]'); await p.click('#atlas [data-at=stats]'); await shot('stats');
  await p.click('#atlas [data-at=home]'); await p.click('#atlas [data-at=mymap]'); await p.waitForTimeout(300); await shot('ma_carte');
  await p.click('#atlas [data-at=home]'); await p.click('#atlas [data-at=close]'); await p.waitForTimeout(400);
  const after = await p.evaluate(() => ({open:Atlas.isOpen(), saved:!!JSON.parse(localStorage.getItem('chevet.v2')).atlas, card:document.querySelector('[data-atlas] .label') && document.querySelector('[data-atlas] .label').textContent}));
  console.log('fermé et sauvegardé :', JSON.stringify(after)); console.log('erreurs', errs); await b.close();
})();
