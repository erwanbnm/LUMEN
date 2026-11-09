// Captures du prototype de la Bombe (prototypes/bombe.html)
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:420,height:880}});
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split(String.fromCharCode(10)).slice(1,6).join(' ')));
 await p.goto('file://'+path.join(ROOT,'prototypes','bombe.html')); await p.waitForTimeout(3300);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.click('[data-tab="amis"]'); await p.waitForTimeout(600);
 await p.screenshot({path:path.join(OUT,'bombe_0.png')});
 await p.evaluate(()=>BombeProto.open()); await p.click('[data-bp="create"]');
 await p.click('[data-bp-inv="0"]'); await p.click('[data-bp-inv="1"]'); await p.click('[data-bp-inv="2"]'); await p.waitForTimeout(3200);
 await p.fill('#bpmsg','Prêts pour la bombe ?'); await p.press('#bpmsg','Enter'); await p.waitForTimeout(1500);
 await p.evaluate(()=>{document.activeElement.blur();document.getElementById('bp').scrollTop=0}); await p.screenshot({path:path.join(OUT,'bombe_1_salon.png'), fullPage:false});
 await p.click('[data-bp="go"]'); await p.waitForTimeout(700);
 await p.evaluate(()=>{document.activeElement&&document.activeElement.blur();document.getElementById('bp').scrollTop=0}); await p.screenshot({path:path.join(OUT,'bombe_2_table.png'), fullPage:false});
 let boomShot=false;
 for (let k=0;k<500;k++){
   const st = await p.evaluate(()=>{ const r=document.getElementById('bp'); return r && r.querySelector('.boom') ? 'boom' : r && r.querySelector('[data-bp=again]') ? 'end' : 'play'; });
   if (st==='boom' && !boomShot){ await p.evaluate(()=>document.getElementById('bp').scrollTop=0); await p.screenshot({path:path.join(OUT,'bombe_3_boum.png'), fullPage:false}); boomShot=true; }
   if (st==='end') break;
   const all = await p.$$('[data-bp-ans]:not([disabled])'); if (all.length) await all[Math.floor(Math.random()*all.length)].click();
   if (k===20 && await p.$('[data-bp-emo="😂"]')) await p.click('[data-bp-emo="😂"]');
   await p.waitForTimeout(250);
 }
 await p.evaluate(()=>document.getElementById('bp').scrollTop=0); await p.screenshot({path:path.join(OUT,'bombe_4_fin.png'), fullPage:false});
 console.log('boom vu', boomShot, errs); await b.close(); })();
