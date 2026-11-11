// Captures : trophée de la Tour, carte du Boss dans Jouer, les 4 boss
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split(String.fromCharCode(10))[1]));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3300);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); });
 await p.click('[data-tab="tour"]'); await p.waitForTimeout(600); await p.screenshot({path:path.join(OUT,'boss_0_tour_trophee.png')});
 await p.click('[data-tw="rank"]'); await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,'boss_1_classement_tour.png')});
 await p.click('[data-tab="jouer"]'); await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,'boss_2_carte_jouer.png')});
 await p.click('[data-bs="open"]'); await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,'boss_3_ecran_boss.png'), fullPage:true});
 await p.evaluate(()=>{ document.querySelector('#app').innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#140A24;padding:10px;border-radius:20px">' + ['ogre','colosse','spectre','ombre'].map(k=>'<div style="display:grid;place-items:center;background:radial-gradient(circle at 50% 70%,#3A1450,#140A24 75%);border-radius:16px">'+Boss.svg(k,170)+'</div>').join('') + '</div>'; });
 await p.waitForTimeout(300); await p.screenshot({path:path.join(OUT,'boss_4_les_4_boss.png')});
 console.log(errs); await b.close(); })();
