// Quêtes : les compteurs suivent les vraies bonnes réponses, les pièces ne sont données qu'une fois, les coffres une seule fois
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split(String.fromCharCode(10))[1])); const log=[];
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3300);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); S.settings.sfx=false; });
 log.push('quêtes du jour : ' + await p.evaluate(()=>Quetes.state().d.list.map(m=>m.k+(m.th?'('+m.th+')':'')).join(', ')));
 log.push('défis de la semaine : ' + await p.evaluate(()=>Quetes.state().w.list.map(m=>m.k+(m.th?'('+m.th+')':'')).join(', ')));
 await p.screenshot({path:path.join(OUT,'qs_0_accueil.png')});
 // Grand mélange : 10 bonnes réponses
 await p.click('[data-tab="jouer"]'); await p.click('[data-mode="mix"]'); await p.waitForTimeout(300);
 for (let i=0;i<10;i++){ await p.click('[data-ans="0"]'); await p.waitForTimeout(120); const n=await p.$('[data-next]'); if(n) await n.click(); await p.waitForTimeout(120); }
 const st = await p.evaluate(()=>{ const q=Quetes.state(); const g=k=>{const m=q.d.list.concat(q.w.list).find(x=>x.k===k); return m?m.p:'-';}; return {ok_jour:g('ok'), run:g('run'), combo:g('combo'), ok_semaine:q.w.list.find(x=>x.k==='ok').p}; });
 log.push('après 10 bonnes réponses : ' + JSON.stringify(st));
 // On amène les quêtes du jour presque au bout, puis une vraie bonne réponse termine celle des bonnes réponses
 const c0 = await p.evaluate(()=>{ const q=Quetes.state(); q.d.list.forEach(m=>{ m.done=true; m.p=1; }); const m=q.d.list[0]; m.done=false; m.k='ok'; m.p=29; save(); return S.coins; });
 await p.evaluate(()=>{ S.session=null; S.tab='jouer'; render(); });
 await p.click('[data-mode="mix"]'); await p.waitForTimeout(300); await p.click('[data-ans="0"]'); await p.waitForTimeout(300);
 const c1 = await p.evaluate(()=>S.coins);
 log.push('pièces après la 30e bonne réponse : +' + Math.round(c1-c0) + ' (20 de la quête + celles de la question)');
 await p.click('[data-quit]'); await p.click('[data-tab="accueil"]'); await p.waitForTimeout(300);
 await p.screenshot({path:path.join(OUT,'qs_1_accueil_coffre.png')});
 await p.click('[data-qs="openview"]'); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'qs_2_quetes_jour.png'), fullPage:true});
 const c2 = await p.evaluate(()=>S.coins); await p.click('[data-qs="open"]'); await p.waitForTimeout(1700); await p.screenshot({path:path.join(OUT,'qs_3_coffre.png')});
 const c3 = await p.evaluate(()=>S.coins); log.push('coffre du jour : +' + Math.round(c3-c2));
 await p.evaluate(()=>document.querySelectorAll('.tw-fx').forEach(e=>e.remove())); await p.evaluate(()=>render());
 log.push('le coffre peut-il se rouvrir ? ' + (await p.$('[data-qs="open"][data-v="d"]') ? 'OUI (problème)' : 'non (bien)'));
 await p.click('[data-qs="tab"][data-v="w"]'); await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT,'qs_4_semaine.png'), fullPage:true});
 // Tour : les étages gravis comptent
 await p.evaluate(()=>{ S.questOpen=false; render(); }); await p.click('[data-tab="tour"]'); await p.click('[data-tw="start"]'); await p.waitForTimeout(400);
 const before = await p.evaluate(()=>Quetes.state().w.list.find(x=>x.k==='ok').p);
 await p.click('[data-tw="ans"][data-v="0"]'); await p.waitForTimeout(1600);
 log.push('bonne réponse dans la Tour comptée : ' + ((await p.evaluate(()=>Quetes.state().w.list.find(x=>x.k==='ok').p)) === before + 1));
 console.log(log.join('\n')); console.log(errs); await b.close(); })();
