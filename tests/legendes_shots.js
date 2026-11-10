// Planche de comparaison : nouveaux personnages Légendes à côté du Veilleur du Nord et du Capitaine de Paille
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1000,height:900}}); await p.addInitScript(() => { window.__noPortal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(2500);
 await p.evaluate(()=>{ const all = [skinOf("nord")].concat(LEGEND_SKINS);
   document.body.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:14px;background:#F7EEFF;font-family:sans-serif">' + all.map(s => '<div style="display:grid;place-items:center;gap:6px;background:#fff;border-radius:20px;padding:10px;border:2px solid #E8D8F8">' + creatureSVG(s, 190) + '<b>' + s.n + '</b></div>').join('') + '</div>'; });
 await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'legendes_lot1.png'), fullPage:true});
 console.log(errs); await b.close(); })();
