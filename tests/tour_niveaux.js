// Rééquilibrage de la Tour : vérifie le tirage (mélange de niveaux, gardiens, pas deux questions dures ni deux fois le même
// thème d'affilée, temps selon la question) en simulant 200 montées, puis estime le nombre d'essais par tranche.
// Capture d'un étage gardien : tests/out/tour_gardien.png
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({channel:'msedge'}); const p = await b.newPage({viewport:{width:375, height:812}, deviceScaleFactor:2});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; window.__noCal = true;
    localStorage.setItem('chevet.v2', JSON.stringify({profile:{name:'Erwan', age:20, avatar:0}, tuto:1, tab:'tour', tour:{cp:40, best:47, claimed:{10:1, 20:1, 30:1, 40:1}, seen:[]}})); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + path.join(ROOT, 'dist', 'lumen.html')); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => {
    const X = Tour._test, P = X.pools(), sizes = {}; Object.keys(P).forEach(k => sizes[k] = P[k].length);
    const counts = {}, bad = {hardPair:0, sameTh:0, guard:0}, times = {};
    S.tour.seen = [];
    for (let run = 0; run < 200; run++) {
      S.tourRun = {floor:1, used:[], t0:0, plan:{}};
      let prev = null, prevL = null;
      for (let f = 1; f <= 100; f++) {
        const id = X.pickFor(f, new Set(S.tourRun.used)), l = X.lvlOf(id), b = Math.ceil(f / 10);
        S.tourRun.used.push(id); S.tourRun.qid = id; S.tour.seen.push(id); if (S.tour.seen.length > 900) S.tour.seen.shift();
        counts[b] = counts[b] || {}; counts[b][l] = (counts[b][l] || 0) + 1;
        if (prevL && (prevL === "D" || prevL === "E") && (l === "D" || l === "E") && f % 10 !== 1) bad.hardPair++;
        if (prev && Q[prev][0] === Q[id][0]) bad.sameTh++;
        if (f % 10 === 0 && l !== X.MIX[b][1] && !(X.MIX[b][1] === "E" && l === "D")) bad.guard++;
        times[l] = X.qTime(f, id);
        prev = id; prevL = l;
      }
    }
    S.tourRun = null;
    return {sizes, counts, bad, times};
  });
  console.log('Questions disponibles par niveau :', JSON.stringify(r.sizes));
  console.log('Temps par niveau :', JSON.stringify(r.times));
  console.log('Contrôles (doivent être 0) :', JSON.stringify(r.bad));
  // Estimation des essais (réussite supposée : A 95 %, B 82 %, C 66 %, D 55 %, E 45 %)
  const acc = {A:.95, B:.82, C:.66, D:.55, E:.45}; let tot = 0;
  for (let b = 1; b <= 10; b++) { const c = r.counts[b], n = Object.values(c).reduce((a, x) => a + x, 0);
    const mix = Object.keys(c).sort().map(k => `${k} ${(c[k] / n * 10).toFixed(1)}`).join(' · ');
    // probabilité de réussir la tranche = produit des réussites sur le plan moyen
    let s = 1; Object.keys(c).forEach(k => { s *= Math.pow(acc[k], c[k] / n * 10); }); tot += 1 / s;
    console.log(`étages ${(b - 1) * 10 + 1}-${b * 10} : ${mix}  → environ ${(1 / s).toFixed(0)} essais`); }
  console.log('montées estimées pour finir la Tour :', Math.round(tot));
  // Capture d'un gardien : montée depuis le palier 40, on saute à l'étage 50
  await p.evaluate(() => { document.querySelectorAll('.po-drop-v,.lvup').forEach(e => e.remove()); S.tab = 'tour'; render(); });
  await p.waitForTimeout(300); await p.click('[data-tw=start]').catch(() => {}); await p.waitForTimeout(400);
  await p.evaluate(() => { const r = S.tourRun; if (r) { r.floor = 50; r.qid = Tour._test.pickFor(50, new Set()); r.dl = Date.now() + 30000; render(); } }); await p.waitForTimeout(300);
  await p.screenshot({path:path.join(OUT, 'tour_gardien.png')});
  console.log('erreurs', errs); await b.close();
})();
