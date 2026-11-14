// Salon « Dates », manche « Plus ou moins » : taper une année pendant que les autres joueurs répondent
// (l'écran se met à jour) ne doit ni effacer ni inverser les chiffres. Salon simulé, rien n'est envoyé en ligne.
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const res = [];
  for (const [nm, vp] of [['telephone', {width:375, height:812, isMobile:true, hasTouch:true}], ['pc', {width:1280, height:800}]]) {
    const ctx = await b.newContext({viewport:{width:vp.width, height:vp.height}, isMobile:!!vp.isMobile, hasTouch:!!vp.hasTouch, deviceScaleFactor:2});
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true;
      localStorage.setItem('chevet.v2', JSON.stringify({profile:{name:'Erwan', age:20, avatar:0}, tuto:1, tab:'amis'})); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + path.join(ROOT, 'dist', 'lumen.html')); await p.waitForTimeout(2500);
    await p.evaluate(() => { document.querySelectorAll('.po-drop-v,.lvup').forEach(e => e.remove());
      Salons._test.set({code:'TEST', mode:'pm', state:'play', gid:1, host:'me', players:{me:{n:'Erwan'}, lea:{n:'Léa'}}, fd:{}, sc:{}, g:{qids:['dt3'], start:Date.now() - 1500, seats:['me', 'lea'], over:false}});
      Amis.view = () => Salons.view(); S.tab = 'amis'; render(); });
    await p.waitForTimeout(300);
    await p.click('#sl-guess');
    // On tape 1 9, quelqu'un trouve (l'écran se met à jour), un redessin complet, puis 4 5
    await p.keyboard.type('19', {delay:60});
    await p.evaluate(() => { const r = Salons._room(); r.fd = {0:{lea:2100}}; Salons._test.repaint(); });
    await p.keyboard.type('4', {delay:60});
    await p.evaluate(() => render());
    await p.keyboard.type('5', {delay:60});
    const v = await p.$eval('#sl-guess', e => e.value), focus = await p.evaluate(() => document.activeElement && document.activeElement.id), who = await p.evaluate(() => !!document.querySelector('.pm-who'));
    await p.screenshot({path:path.join(OUT, 'salon_annee_' + nm + '.png')});
    // Valider une mauvaise année : la case se vide et reste prête
    await p.keyboard.press('Enter'); await p.waitForTimeout(200);
    const after = await p.evaluate(() => ({v:document.getElementById('sl-guess') && document.getElementById('sl-guess').value, tries:document.querySelectorAll('.pm-try').length}));
    res.push(`${nm} : tapé « 1945 » → case « ${v} » · focus ${focus === 'sl-guess'} · « qui a trouvé » affiché ${who} · après validation case « ${after.v} », essais ${after.tries} · erreurs ${JSON.stringify(errs)}`);
    await ctx.close();
  }
  console.log(res.join('\n')); await b.close();
})();
