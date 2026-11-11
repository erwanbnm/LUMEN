// Vérifie le chrono de 10 s par question en duel : sans réponse, la question compte comme fausse et le jeu avance seul.
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:430,height:900}}); await p.addInitScript(() => { window.__noPortal = true; window.__noTuto = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3000);
 await p.fill('#p-name','Testeur'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.evaluate(()=>{ const a=window.__app, S=a.state(); S.tab='jouer'; S.session = a.start ? null : null; });
 // Duel « classique » simulé (sans serveur)
 const ok = await p.evaluate(()=>{ const S=window.__app.state(); if (typeof start!=='function') return 'no start'; start('mix', {duel:{id:'test', opp:'x', live:false}}); return !!S.session; });
 console.log('session', ok);
 await p.waitForTimeout(800);
 console.log('affiche:', await p.evaluate(()=>document.getElementById('qleft') && document.getElementById('qleft').textContent));
 await p.screenshot({path: path.join(__dirname,'out','duel_timer_1.png')});
 await p.waitForTimeout(10500);
 console.log('après 11 s:', await p.evaluate(()=>{ const s=window.__app.state().session; return {pos:s.pos, ans:s.steps[0].ans}; }), await p.evaluate(()=>document.querySelector('.verdict b') && document.querySelector('.verdict b').textContent));
 await p.screenshot({path: path.join(__dirname,'out','duel_timer_2.png')});
 await p.waitForTimeout(7500);
 console.log('après lecture:', await p.evaluate(()=>{ const s=window.__app.state().session; return {pos:s.pos}; }));
 console.log(errs); await b.close(); })();
