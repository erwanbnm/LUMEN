// Règles de la Tour : montée réelle, palier payé une seule fois, chute au palier, pas de question répétée dans une montée
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const log=[];
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3300);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); S.settings.sfx=false; });
 await p.click('[data-tab="tour"]'); await p.click('[data-tw="start"]');
 const coins0 = await p.evaluate(()=>S.coins);
 // monte 10 étages en répondant juste
 for (let f=1; f<=10; f++){ await p.waitForSelector('[data-tw="ans"][data-v="0"]:not([disabled])',{timeout:8000}); await p.click('[data-tw="ans"][data-v="0"]'); await p.waitForTimeout(f<10?2200:2600); }
 const cp = await p.evaluate(()=>({cp:S.tour.cp, claimed:Object.keys(S.tour.claimed), used:S.tourRun && S.tourRun.used.length, uniq:S.tourRun && new Set(S.tourRun.used).size}));
 log.push('après l\'étage 10 : ' + JSON.stringify(cp));
 const coins1 = await p.evaluate(()=>S.coins);
 log.push('pièces gagnées au palier 10 (+ XP des questions) : ' + Math.round(coins1-coins0));
 await p.click('[data-tw="cont"]'); await p.waitForTimeout(500);
 // se trompe à l'étage 11 → retombe au palier 10
 await p.click('[data-tw="ans"]:not([data-v="0"])'); await p.waitForTimeout(2400);
 log.push('après une erreur à l\'étage 11 : palier ' + await p.evaluate(()=>S.tour.cp) + ', montée en cours : ' + await p.evaluate(()=>!!S.tourRun));
 await p.evaluate(()=>document.querySelectorAll('.tw-fx').forEach(e=>e.remove()));
 // retente : recommence à 11 ; on force un retour à 10 pour vérifier que le palier n'est pas payé deux fois
 await p.evaluate(()=>{ S.tour.cp = 0; save(); render(); });
 await p.click('[data-tw="start"]');
 const c2 = await p.evaluate(()=>S.coins);
 for (let f=1; f<=10; f++){ await p.waitForSelector('[data-tw="ans"][data-v="0"]:not([disabled])',{timeout:8000}); await p.click('[data-tw="ans"][data-v="0"]'); await p.waitForTimeout(f<10?2200:2600); }
 const c3 = await p.evaluate(()=>S.coins);
 log.push('2e passage au palier 10 : récompense versée ? ' + (await p.evaluate(()=>!!document.querySelector('.tw-cp-gain')) ? 'OUI (problème)' : 'non (bien)') + ', pièces gagnées (XP seulement) : ' + Math.round(c3-c2));
 // rechargement en pleine montée = retour au palier
 await p.click('[data-tw="cont"]'); await p.waitForTimeout(400); await p.reload(); await p.waitForTimeout(3800);
 log.push('après rechargement en pleine montée : montée en cours = ' + await p.evaluate(()=>!!S.tourRun) + ', palier = ' + await p.evaluate(()=>S.tour.cp));
 console.log(log.join('\n')); console.log(errs); await b.close(); })();
