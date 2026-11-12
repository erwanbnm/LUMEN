// Écran Joueurs et profil public dans l'appli, avec des joueurs fictifs injectés (captures tests/out/jx_*.png)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:375, height:812}, deviceScaleFactor:2});
  await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true;
    if (!localStorage.getItem('chevet.v2')) localStorage.setItem('chevet.v2', JSON.stringify({profile:{name:'Erwan', age:20, avatar:0}, tuto:1, tab:'amis', xp:{his:20000, geo:9000}, rec:{chrono:31, survie:18, avap:22}, badges:{all50:'2026-11-01'}, coll:{tour0:'x'}})); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({path:path.join(OUT, 'jx_' + n + '.png')});
  await p.goto('file://' + path.join(ROOT, 'dist', 'lumen.html')); await p.waitForTimeout(3000);
  await p.evaluate(() => { document.querySelectorAll('.lvup').forEach(e => e.remove());
    const U = Amis.api.users(), now = Date.now();
    U.lea = {pseudo:'Léa', av:'shinigami', ti:'', seen:now - 30000, st:{txp:160000, ok:9200, atl:{f:142, c:120, lp:81, cp:77}, adv:{stars:105}, cd:{bn:'neant', fr:'roi', bd:['all50'], rk:[5, 7, 3, 2, 6, 4, 7, 1], wr:71, pl:120, tw:100, rc:[44, 31, 35, 120], nb:[71, 15], co:['tour0', 'tour1', 'tour2', 'veteran0'], pt:'pet_foudre'}}};
    U.hugo = {pseudo:'Hugo', av:'b5', ti:'fleau', seen:now - 3 * 3600e3, st:{txp:52000, ok:2980, cd:{bn:'boss', fr:'boss', bd:[], rk:[3, 2, 4, 6, 2, 3, 5, 3], wr:58, pl:73, tw:64, rc:[39, 22, 17, 21], nb:[44, 6], co:['boss0'], pt:''}}};
    U.yanis = {pseudo:'Yanis', av:'b3', seen:now - 5 * 86400e3, st:{lvl:6, ok:610}};
    Amis.view = () => Profil.players(); render(); });
  await p.waitForTimeout(300); await shot('liste');
  await p.fill('#jo-q', 'hu'); await p.waitForTimeout(200); const n1 = await p.$$eval('.jl-card', e => e.length); await p.fill('#jo-q', '');
  await p.click('.jl-card[data-see=lea]'); await p.waitForTimeout(400); await shot('profil1');
  await p.evaluate(() => { document.querySelector('.pv').scrollTop = 1200; }); await p.waitForTimeout(200); await shot('profil2');
  await p.click('.pv [data-pc=cmp]'); await p.waitForTimeout(300); await shot('compare');
  await p.click('.pv [data-pc=close]');
  await p.click('.jl-card[data-see=yanis]'); await p.waitForTimeout(300); await shot('ancien');
  const old = await p.$eval('.pv', e => e.innerText.includes('dernière version'));
  await p.click('.pv [data-pc=close]');
  // Un avatar ailleurs (rendu par Amis.api.avatar) ouvre aussi le profil
  await p.evaluate(() => { document.getElementById('app').insertAdjacentHTML('afterbegin', '<div id="tst">' + Amis.api.avatar('hugo', 40) + '</div>'); });
  await p.click('#tst .am-av'); await p.waitForTimeout(300); const ok2 = await p.$('.pv');
  console.log('recherche "hu" :', n1, 'carte(s) · message version :', old, '· avatar ailleurs ouvre le profil :', !!ok2, '· erreurs', errs);
  await b.close();
})();
