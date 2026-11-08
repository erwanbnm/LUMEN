g=open('parc/game.js',encoding='utf-8').read()
def R(a,b):
    global g
    assert a in g, a[:80]; g=g.replace(a,b)
R('''const KEY = "lumen.parc.v1";
const BLANK = () => ({coins:600, map:{}, garden:[], inside:[], night:false, wheelDay:"", chest:false});
let S; try { S = Object.assign(BLANK(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch(e){ S = BLANK(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };''','''// L'état du parc vit dans la sauvegarde de l'appli ; les pièces sont communes
const S = new Proxy({}, {
  get:(_, k) => k === "coins" ? window.__app.state().coins : window.__app.state().parc[k],
  set:(_, k, v) => { if (k === "coins") window.__app.state().coins = v; else window.__app.state().parc[k] = v; return true; }
});
const save = () => window.__app.save();''')
R('''  if (b.id === "back") { if (cur.key === "home" && cur.mode === "inside") return cur.outside(); return goWorld("map"); }''','''  if (b.id === "back") { if (cur.key === "home" && cur.mode === "inside") return cur.outside(); if (cur.key === "map") return close(); return goWorld("map"); }''')
R('''  if (b.id === "gift") { S.coins += 200; save(); toast("+200 pièces de test"); return ui(); }
  if (b.id === "reset") { S = BLANK(); save(); location.reload(); }
''','')
R('''  $("back").hidden = cur.key === "map";
  $("back").textContent = cur.key === "home" && cur.mode === "inside" ? "Retour au jardin" : "Retour au parc";''','''  $("back").hidden = false;
  $("back").textContent = cur.key === "map" ? "Quitter le parc" : cur.key === "home" && cur.mode === "inside" ? "Retour au jardin" : "Retour au parc";''')
R('''  renderer.render(cur.scene, camera); requestAnimationFrame(loop);
}''','''  renderer.render(cur.scene, camera); if (running) requestAnimationFrame(loop);
}
let running = false, booted = false;
function open(){
  $("parc").hidden = false; document.body.classList.add("in-parc");
  if (!booted) { booted = true; boot(); } else { resize(); ui(); }
  if (window.__parcHero) window.__parcHero();
  if (!running) { running = true; clock.getDelta(); requestAnimationFrame(loop); }
}
function close(){
  if (G_.busy) return; $("game").hidden = true;
  running = false; $("parc").hidden = true; document.body.classList.remove("in-parc");
  window.__app.checkBadges(); window.__app.close();
}''')
R('''  resize(); goWorld("map", true); loop();''','''  resize(); goWorld("map", true);''')
R('S.coins -= price; S.map[id] = l+1;','S.coins -= price; window.__app.spend(price); S.map[id] = l+1;')
R('S.coins += ITEMS[entry.id].p; toast','S.coins += ITEMS[entry.id].p; window.__app.spend(-ITEMS[entry.id].p); toast')
R('S.coins -= it.p; lastAdded','S.coins -= it.p; window.__app.spend(it.p); lastAdded')
R('[[CREATURES.find(c => c.n==="Voile") || CREATURES[0], -3, 4], [RIXY, 3, 5]]','[[window.__app.hero(), -3, 4], [RIXY, 3, 5]]')
R('''walkers.push({g, sp, target:g.position.clone(), wait:Math.random()*2, ph:Math.random()*6}); });''','''walkers.push({g, sp, c, target:g.position.clone(), wait:Math.random()*2, ph:Math.random()*6}); });
  // Le personnage équipé se promène dans le jardin
  window.__parcHero = () => { const h = window.__app.hero(), w = walkers[0]; if (w && w.c !== h) { w.sp.material.map = creatureTexture(h); w.sp.material.needsUpdate = true; w.c = h; } };''')
g=g.replace('/*__GAMES__*/', open('parc/games.js',encoding='utf-8').read())
open('parc_app.js','w',encoding='utf-8').write('const Parc = (function(){\nif (!window.THREE) return {open(){ window.__app.close(); }, close(){}};\n'+g+'\nreturn {open, close};\n})();\n')
