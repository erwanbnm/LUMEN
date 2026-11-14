// Captures du mode La Tour : la tour, une question, la porte, un palier, la chute, le sommet
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split(String.fromCharCode(10))[1]));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3300); await p.addStyleTag({content:'.po-drop-v{display:none!important}'}); // potions des paliers déjà atteints
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); S.tour = {cp:30, best:34, claimed:{10:"x",20:"x",30:"x"}, seen:[], wk:"", wbest:0, wt:0}; save(); });
 await p.click('[data-tab="tour"]'); await p.waitForTimeout(800);
 await p.screenshot({path:path.join(OUT,'tour_1_tour.png')});
 await p.click('[data-tw="start"]'); await p.waitForTimeout(700);
 await p.screenshot({path:path.join(OUT,'tour_2_question.png')});
 // bonne réponse : la porte s'ouvre
 await p.click('[data-tw="ans"][data-v="0"]'); await p.waitForTimeout(1350); await p.screenshot({path:path.join(OUT,'tour_3_porte.png')});
 await p.waitForTimeout(1500);
 // on saute à l'étage 40 pour voir le palier
 await p.evaluate(()=>{ S.tourRun.floor = 40; S.tourRun.qid = Object.keys(Q).find(id=>Q[id][1]===3&&Q[id][2].length===4); S.tourRun.ans = undefined; render(); });
 await p.click('[data-tw="ans"][data-v="0"]'); await p.waitForTimeout(3000);
 await p.screenshot({path:path.join(OUT,'tour_4_palier.png')});
 await p.click('[data-tw="cont"]'); await p.waitForTimeout(600);
 // mauvaise réponse : la chute
 const wrong = await p.$('[data-tw="ans"]:not([data-v="0"])'); await wrong.click(); await p.waitForTimeout(2300);
 await p.screenshot({path:path.join(OUT,'tour_5_chute.png')});
 await p.evaluate(()=>document.querySelectorAll('.tw-fx').forEach(e=>e.remove()));
 // sommet
 await p.evaluate(()=>{ S.tour.cp = 50; render(); }); await p.click('[data-tw="start"]'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ S.tour.cp = 90; S.tourRun.floor = 100; S.tourRun.qid = Object.keys(Q).find(id=>Q[id][1]===3&&Q[id][2].length===4); S.tourRun.ans = undefined; S.tourRun.dl = Date.now()+30000; render(); });
 await p.click('[data-tw="ans"][data-v="0"]'); await p.waitForTimeout(3600);
 await p.screenshot({path:path.join(OUT,'tour_6_sommet.png')});
 await p.evaluate(()=>document.querySelectorAll('.tw-fx').forEach(e=>e.remove())); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const s=document.getElementById('tw-shaft'); s.scrollTop = 0; }); await p.waitForTimeout(300);
 await p.screenshot({path:path.join(OUT,'tour_7_haut.png')});
 console.log(errs); await b.close(); })();
