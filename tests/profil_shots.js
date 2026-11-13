// Profil : carte de visite, collections, fiche d'un autre joueur et comparaison (captures 375 px dans tests/out/pf_*.png)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:375, height:812}, deviceScaleFactor:2});
  await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true; });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const shot = n => p.screenshot({path:path.join(OUT, 'pf_' + n + '.png')});
  await p.addInitScript(() => { if (localStorage.getItem('chevet.v2')) return;
    localStorage.setItem('chevet.v2', JSON.stringify({profile:{name:'Erwan', age:20, avatar:0}, tuto:1, tab:'profil', pres:7,
      xp:{his:30000, geo:15000, sci:12000, cin:10000, jeu:8000}, badges:{all50:'2026-11-01', str3:'2026-11-03', his_5:'2026-11-04', his_10:'2026-11-05'},
      tour:{cp:0, best:100, tops:1, claimed:{}, seen:[]}, boss:{played:{}, claimed:{}, seen:[], wins:4, tops:1, total:62}, online:{wins:30, played:50, crowns:1},
      card:{bn:'tour', fr:'boss', bd:[]}})); });
  await p.goto('file://' + path.join(ROOT, 'dist', 'lumen.html')); await p.waitForTimeout(3500); await p.evaluate(() => document.querySelectorAll('.po-drop-v').forEach(e => e.remove())); // potions des paliers déjà atteints
  await p.evaluate(() => { document.querySelectorAll('.lvup').forEach(e => e.remove()); });
  await shot('carte');
  await p.click('[data-seg=badges]'); await p.waitForTimeout(500); await shot('collections');
  await p.evaluate(() => { Amis.api.users().fake1 = {pseudo:'Léa', ti:'champion', av:'b2', st:{lvl:30, txp:160000, ok:9200, tw:{best:72}, adv:{stars:88},
    cd:{bn:'neant', fr:'roi', bd:['all50', 'str3'], rk:[5, 7, 3, 2, 6, 4, 7, 1], wr:71, pl:120, tw:72}}}; Profil.see('fake1'); });
  await p.waitForTimeout(500); await shot('fiche');
  await p.click('.pv [data-pc=cmp]'); await p.waitForTimeout(400); await shot('compare1');
  await p.evaluate(() => { const pv = document.querySelector('.pv'); pv.scrollTop = pv.scrollHeight; }); await p.waitForTimeout(300); await shot('compare2');
  await p.click('.pv [data-pc=close]'); await p.waitForTimeout(200);
  console.log('fiche fermée :', !(await p.$('.pv')), 'erreurs', errs);
  await b.close();
})();
