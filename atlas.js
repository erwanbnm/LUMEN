/* ---------- Atlas du monde (onglet Jouer) : localiser les pays sur la carte, trouver les capitales ----------
   Maquette validée par Erwan : prototypes/atlas.html. Carte : content/atlas_data.js (ATLAS, Natural Earth, domaine public, 197 pays).
   S'ouvre par-dessus l'appli comme le Casino (#atlas). Sauvegarde : S.atlas. Gains : XP de Géographie, pièces, quêtes, badges,
   titre GLOBE-TROTTEUR. Classements « Atlas · pays » et « Atlas · capitales » (amis.js, publiés par ping : st.atl). */
const Atlas = (() => {
  const C = ATLAS.c, BY = {}; C.forEach(p => BY[p.c] = p);
  const CONT = {all:"Monde entier", eu:"Europe", af:"Afrique", as:"Asie", am:"Amériques", oc:"Océanie"};
  const DIFF = {0:"Tous", 1:"Très connus", 2:"Moins connus", 3:"Difficiles"};
  const XP_T = [0, 10, 20, 30];
  const A = () => { S.atlas = S.atlas || {}; const a = S.atlas;
    ["found", "capOk", "miss"].forEach(k => a[k] = a[k] || {}); ["loc", "cap"].forEach(k => a[k] = a[k] || {ok:0, ko:0, best:0, games:0}); a.set = a.set || {k:"eu", n:10, t:0}; return a; };
  const capPool = () => C.filter(p => p.cap);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const deN = n => n.startsWith("le ") ? "du " + n.slice(3) : n.startsWith("les ") ? "des " + n.slice(4) : "de " + n;
  const pct = o => o.ok + o.ko ? Math.round(o.ok / (o.ok + o.ko) * 100) : 0;
  let root = null, view = "home", G = null, M = null, rankTab = "loc";
  const $ = s => root.querySelector(s);

  /* ---------- Ouverture ---------- */
  function open(){
    if (!root) { root = document.createElement("div"); root.id = "atlas"; document.body.appendChild(root);
      root.addEventListener("click", onClick); }
    view = "home"; G = null; root.hidden = false; document.body.classList.add("in-atlas"); paint(); root.scrollTop = 0;
    try { Music.sfx("tab1"); } catch(e){}
  }
  function close(){ if (!root) return; root.hidden = true; document.body.classList.remove("in-atlas"); G = null; M = null;
    try { checkBadges(); save(); } catch(e){} try { render(); } catch(e){} try { flushLevelUp(); } catch(e){} }

  /* ---------- Carte : dessin, déplacement, zoom ---------- */
  function mapSVG(dim){
    const a = A(), f = c => a.found[c] ? "found" : "";
    const paths = C.filter(p => p.d).map(p => `<path class="at-ct ${f(p.c)} ${dim && !dim(p) ? "dim" : ""}" data-c="${p.c}" d="${p.d}"/>`).join("");
    const dots = C.filter(p => p.s).map(p => `<circle class="at-dot ${f(p.c)} ${dim && !dim(p) ? "dim" : ""}" data-c="${p.c}" cx="${p.x}" cy="${p.y}" r="3"/>`).join("");
    return `<div class="at-map" id="at-map"><svg id="at-svg" aria-label="Carte du monde"><defs><pattern id="at-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="1"/></pattern></defs>
      <rect class="at-sea" width="100%" height="100%"/><rect width="100%" height="100%" fill="url(#at-grid)"/>
      <g id="at-g"><path class="at-other" d="${ATLAS.other}"/>${paths}<g id="at-dots">${dots}</g><g id="at-fx"></g></g></svg>
      <div class="at-zb"><button data-z="1" aria-label="Zoomer">+</button><button data-z="-1" aria-label="Dézoomer">−</button><button data-z="0" aria-label="Recentrer">⌂</button></div></div>`;
  }
  function initMap(box){
    const el = $("#at-map"), svg = $("#at-svg"), r = el.getBoundingClientRect(); M = {w:r.width, h:r.height, k:1, tx:0, ty:0, box};
    fit(box); apply();
    const pts = new Map(); let start = null, moved = false, pinch = null;
    svg.addEventListener("pointerdown", e => { try { svg.setPointerCapture(e.pointerId); } catch(err){} pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 1) { start = {x:e.clientX, y:e.clientY, tx:M.tx, ty:M.ty}; moved = false; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = {d:Math.hypot(a[0] - b[0], a[1] - b[1]), k:M.k, tx:M.tx, ty:M.ty, cx:(a[0] + b[0]) / 2, cy:(a[1] + b[1]) / 2}; moved = true; } });
    svg.addEventListener("pointermove", e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), rr = el.getBoundingClientRect(); zoomAt(pinch.cx - rr.left, pinch.cy - rr.top, pinch.k * d / pinch.d, pinch); return; }
      if (pts.size === 1 && start) { const dx = e.clientX - start.x, dy = e.clientY - start.y; if (Math.abs(dx) + Math.abs(dy) > 8) moved = true; if (moved) { M.tx = start.tx + dx; M.ty = start.ty + dy; clamp(); apply(); } } });
    const up = e => { const was = pts.has(e.pointerId); pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
      if (was && pts.size === 0 && !moved && e.type === "pointerup") tap(e.clientX, e.clientY);
      if (pts.size === 1) { const [p] = [...pts.values()]; start = {x:p[0], y:p[1], tx:M.tx, ty:M.ty}; } };
    svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
    svg.addEventListener("wheel", e => { e.preventDefault(); const rr = el.getBoundingClientRect(); zoomAt(e.clientX - rr.left, e.clientY - rr.top, M.k * (e.deltaY < 0 ? 1.25 : .8)); }, {passive:false});
  }
  function fit(b){ const bw = b[2] - b[0], bh = b[3] - b[1]; M.k = Math.min(M.w / bw, M.h / bh) * .96; M.tx = M.w / 2 - (b[0] + bw / 2) * M.k; M.ty = M.h / 2 - (b[1] + bh / 2) * M.k; }
  function clamp(){ const minK = Math.min(M.w / ATLAS.w, M.h / ATLAS.h); M.k = Math.max(minK * .9, Math.min(60, M.k));
    const W = ATLAS.w * M.k, H = ATLAS.h * M.k; M.tx = Math.min(M.w * .5, Math.max(M.w * .5 - W, M.tx)); M.ty = Math.min(M.h * .5, Math.max(M.h * .5 - H, M.ty)); }
  function zoomAt(px, py, k, base){ const b = base || M, k0 = b.k, nk = Math.max(.3, Math.min(60, k)); M.tx = px - (px - b.tx) * nk / k0; M.ty = py - (py - b.ty) * nk / k0; M.k = nk; clamp(); apply(); }
  function apply(){ const g = $("#at-g"); if (!g) return; g.setAttribute("transform", `translate(${M.tx.toFixed(1)} ${M.ty.toFixed(1)}) scale(${M.k.toFixed(4)})`);
    const r = Math.min(7, 2.4 + M.k * 1.1) / M.k; root.querySelectorAll("#at-dots circle").forEach(c => c.setAttribute("r", r.toFixed(2))); }
  function flyTo(p){ if (p.s || M.k > 2) { const nk = Math.max(M.k, p.s ? 8 : 3); M.tx = M.w / 2 - p.x * nk; M.ty = M.h / 2 - p.y * nk; M.k = nk; clamp(); apply(); } }
  function pulse(code){ const p = BY[code], fx = $("#at-fx"); if (!fx) return; const r = Math.max(4, 22 / M.k);
    fx.insertAdjacentHTML("beforeend", `<circle class="at-ring" cx="${p.x}" cy="${p.y}" r="${r}" style="stroke-width:${(3 / M.k).toFixed(2)}"/>`); setTimeout(() => { const c = fx.firstElementChild; c && c.remove(); }, 1600); }
  // Le pays sous le doigt, sinon un petit pays tout proche (18 px)
  function pick(x, y){
    const el = document.elementFromPoint(x, y), c = el && el.dataset && el.dataset.c; if (c) return c;
    const rr = $("#at-map").getBoundingClientRect(); let best = null, bd = 18;
    C.filter(p => p.s).forEach(p => { const d = Math.hypot(rr.left + M.tx + p.x * M.k - x, rr.top + M.ty + p.y * M.k - y); if (d < bd) { bd = d; best = p.c; } });
    return best;
  }
  // Le pays demandé est-il à moins de 12 px du doigt ?
  function near(code, x, y){
    const els = [...root.querySelectorAll(`path[data-c="${code}"]`)], svg = $("#at-svg"), rr = $("#at-map").getBoundingClientRect();
    for (let a = 0; a < 12; a++) for (const r of [6, 12]) { const pt = svg.createSVGPoint();
      pt.x = (x + Math.cos(a / 12 * Math.PI * 2) * r - rr.left - M.tx) / M.k; pt.y = (y + Math.sin(a / 12 * Math.PI * 2) * r - rr.top - M.ty) / M.k;
      if (els.some(e => e.isPointInFill(pt))) return true; }
    return false;
  }

  /* ---------- Gains : XP de Géographie, pièces, quêtes ---------- */
  function gain(p, first){
    const th = "geo", before = themeLvl(th).L, accBefore = Profil.pres();
    const xp = Math.round(XP_T[p.t] * (first ? 1 : .35)) * (typeof PM === "function" ? PM("xp") : 1);
    const coins = (first ? 1 : .5) * (typeof PM === "function" ? PM("coin") : 1);
    S.xp[th] = (S.xp[th] || 0) + xp; S.coins += coins; G.xp += xp; G.coins += coins;
    if (typeof Quetes !== "undefined") try { Quetes.ev("ok", {th, lvl:p.t}); } catch(e){}
    const after = themeLvl(th).L, accAfter = Profil.pres();
    if (after > before) levelUp(after, THEMES[th].n, `Tu deviens ${rank(after)}.`);
    if (accAfter.P > accBefore.P) Profil.check(); else if (accAfter.L > accBefore.L) levelUp(accAfter.L, "Ton profil", "Tu montes en grade. Continue comme ça !");
  }

  /* ---------- Écrans ---------- */
  function home(){
    const a = A(), nf = Object.keys(a.found).length, nc = Object.keys(a.capOk).length, capN = capPool().length;
    return `<div class="at-top"><button class="at-back" data-at="close" aria-label="Fermer l'Atlas">✕</button><span class="at-kick">Jouer</span></div>
      <header class="at-hd"><div class="at-globe">${globeSVG()}</div><div><h1>Atlas du monde</h1><p>Colorie le monde pays par pays, et deviens incollable sur les capitales.</p></div></header>
      <div class="at-prog"><div><b>${nf}<small>/${C.length}</small></b><span>pays trouvés</span><i style="--p:${nf / C.length * 100}"></i></div><div><b>${nc}<small>/${capN}</small></b><span>capitales réussies</span><i style="--p:${nc / capN * 100}"></i></div></div>
      <button class="at-mode m1" data-at="set-loc"><span class="at-mi">${pinSVG()}</span><span><b>Localiser un pays</b><small>Touche le pays demandé sur le planisphère. Chaque pays trouvé devient rouge.</small><em>Réussite ${pct(a.loc)} % · record ${a.loc.best}</em></span></button>
      <button class="at-mode m2" data-at="set-cap"><span class="at-mi">${capSVG()}</span><span><b>Trouver la capitale</b><small>Quiz à 4 réponses, des capitales les plus connues aux plus pointues.</small><em>Réussite ${pct(a.cap)} % · record ${a.cap.best}</em></span></button>
      <div class="at-row3"><button class="at-btn ghost" data-at="mymap">🗺️ Ma carte</button><button class="at-btn ghost" data-at="stats">📊 Statistiques</button><button class="at-btn ghost" data-at="rank">🏆 Classements</button></div>`;
  }
  const poolFor = (mode, k, t) => (mode === "cap" ? capPool() : C).filter(p => (k === "all" || p.k === k) && (!t || p.t === t));
  function settings(mode){
    const a = A(), st = a.set, pool = poolFor(mode, st.k, st.t), chip = (k, v, l, on) => `<button class="at-chip ${on ? "on" : ""}" data-set="${k}" data-v="${v}">${l}</button>`;
    const left = pool.filter(p => !(mode === "loc" ? a.found : a.capOk)[p.c]).length;
    return `<div class="at-top"><button class="at-back" data-at="home" aria-label="Retour">←</button><h2>${mode === "loc" ? "Localiser un pays" : "Trouver la capitale"}</h2></div>
      <div class="at-card"><span class="at-lab">Continent</span><div class="at-chips">${Object.keys(CONT).map(k => chip("k", k, CONT[k], st.k === k)).join("")}</div></div>
      <div class="at-card"><span class="at-lab">Difficulté</span><div class="at-chips">${[0, 1, 2, 3].map(t => chip("t", t, DIFF[t], st.t === t)).join("")}</div></div>
      <div class="at-card"><span class="at-lab">Combien de ${mode === "loc" ? "pays" : "questions"} ?</span><div class="at-chips">${[10, 20, 50].filter(n => n < pool.length).map(n => chip("n", n, n, st.n === n)).join("")}${chip("n", 0, `Tout (${pool.length})`, st.n === 0 || st.n >= pool.length)}</div>
        <p class="at-sm">${pool.length} ${mode === "loc" ? "pays" : "capitales"} dans cette sélection · ${left} encore jamais ${mode === "loc" ? "trouvés" : "réussies"} (ils passent en premier).</p></div>
      <button class="at-btn big" data-at="${mode === "loc" ? "play-loc" : "play-cap"}" ${pool.length ? "" : "disabled"}>C'est parti !</button>`;
  }
  function start(mode){
    const a = A(), st = a.set, pool = poolFor(mode, st.k, st.t), done = mode === "loc" ? a.found : a.capOk;
    const order = shuffle(pool.filter(p => !done[p.c])).concat(shuffle(pool.filter(p => done[p.c])));
    const list = (st.n && st.n < order.length ? order.slice(0, st.n) : order).map(p => p.c);
    G = {mode, list, i:0, ok:0, streak:0, best:0, miss:[], news:0, lock:false, k:st.k, xp:0, coins:0, opts:null};
    view = mode; paint();
  }
  const ptop = () => `<div class="at-ptop"><button class="at-back" data-at="quit" aria-label="Arrêter la partie">✕</button><div class="at-pbar"><i style="width:${G.i / G.list.length * 100}%"></i></div><span class="at-pc">${G.i + 1}/${G.list.length}</span></div>`;
  const pfoot = () => `<div class="at-pfoot"><span>✔ ${G.ok}</span><span>🔥 série ${G.streak}</span></div>`;
  function locScreen(){
    const p = BY[G.list[G.i]];
    return `<div class="at-play">${ptop()}<div class="at-ask"><span>Où se trouve…</span><b>${esc(cap1(p.n))} ?</b><em id="at-fb"></em></div>${mapSVG(q => G.k === "all" || q.k === G.k)}${pfoot()}</div>`;
  }
  function tap(x, y){
    const a = A();
    if (view === "mymap") { const c = pick(x, y); if (c) $("#at-fb").textContent = a.found[c] ? "✔ " + cap1(BY[c].n) : "Pas encore trouvé"; return; }
    if (view !== "loc" || !G || G.lock) return;
    let c = pick(x, y); if (!c) return;
    const want = G.list[G.i], fb = $("#at-fb");
    if (c !== want && near(want, x, y)) c = want;
    G.lock = true;
    if (c === want) {
      const first = !a.found[c]; G.ok++; G.streak++; G.best = Math.max(G.best, G.streak); a.loc.ok++; if (first) { a.found[c] = today(); G.news++; }
      gain(BY[c], first);
      root.querySelectorAll(`[data-c="${c}"]`).forEach(e => e.classList.add("found", "pop")); pulse(c); fb.className = "good"; fb.textContent = "Bravo !";
      try { Music.sfx("ok"); } catch(e){}
      setTimeout(next, 900);
    } else {
      G.streak = 0; a.loc.ko++; a.miss[want] = (a.miss[want] || 0) + 1; G.miss.push(want);
      root.querySelectorAll(`[data-c="${c}"]`).forEach(e => { e.classList.add("wrong"); setTimeout(() => e.classList.remove("wrong"), 900); });
      fb.className = "bad"; fb.textContent = `Raté : ça, c'est ${BY[c].n}. Le voici !`;
      flyTo(BY[want]); root.querySelectorAll(`[data-c="${want}"]`).forEach(e => e.classList.add("show")); pulse(want);
      try { Music.sfx("ko"); } catch(e){}
      setTimeout(next, 2200);
    }
    save();
  }
  function next(){ if (!G || view !== "loc") return; G.i++; G.lock = false; if (G.i >= G.list.length) return finish(); const keep = M && {k:M.k, tx:M.tx, ty:M.ty}; paint(); if (keep) { Object.assign(M, keep); apply(); } }
  function capScreen(){
    const p = BY[G.list[G.i]];
    if (!G.opts || G.opts.q !== p.c) { const same = shuffle(capPool().filter(q => q.c !== p.c && q.k === p.k && q.cap !== p.cap)), near_ = same.filter(q => Math.abs(q.t - p.t) <= 1);
      G.opts = {q:p.c, list:shuffle([p.cap].concat((near_.length >= 3 ? near_ : same).slice(0, 3).map(q => q.cap))), ans:null}; }
    const o = G.opts, done = o.ans !== null, good = done && o.list[o.ans] === p.cap;
    return `<div class="at-play cap">${ptop()}<div class="at-q"><span class="at-lv lv${p.t}">${DIFF[p.t]}</span><b>Quelle est la capitale ${esc(deN(p.n))} ?</b></div>
      <div class="at-answers">${o.list.map((x, i) => `<button class="at-ans ${done ? (x === p.cap ? "good" : i === o.ans ? "bad" : "off") : ""}" data-ans="${i}" ${done ? "disabled" : ""}>${esc(x)}</button>`).join("")}</div>
      ${done ? `<div class="at-expl ${good ? "good" : "bad"}"><b>${good ? "Bonne réponse !" : "Raté…"}</b> ${esc(p.cap)} est la capitale ${esc(deN(p.n))}.</div><button class="at-btn big" data-at="cap-next">${G.i + 1 < G.list.length ? "Question suivante" : "Voir le bilan"}</button>` : ""}${pfoot()}</div>`;
  }
  function capAnswer(i){
    const a = A(), p = BY[G.list[G.i]], o = G.opts; if (o.ans !== null) return; o.ans = i;
    if (o.list[i] === p.cap) { const first = !a.capOk[p.c]; G.ok++; G.streak++; G.best = Math.max(G.best, G.streak); a.cap.ok++; if (first) { a.capOk[p.c] = today(); G.news++; } gain(p, first); try { Music.sfx("ok"); } catch(e){} }
    else { G.streak = 0; a.cap.ko++; G.miss.push(p.c); try { Music.sfx("ko"); } catch(e){} }
    save(); paint();
  }
  function finish(){ const m = A()[G.mode]; m.games++; m.best = Math.max(m.best, G.ok); save(); try { checkBadges(); } catch(e){} view = "end"; paint(); try { Music.sfx("win"); } catch(e){} }
  function endScreen(){
    const n = G.list.length, p = Math.round(G.ok / n * 100);
    return `<div class="at-end"><div class="at-medal">${p >= 80 ? "🏆" : p >= 50 ? "⭐" : "🌍"}</div><h2>${G.ok} / ${n}</h2><p>${p} % de réussite · meilleure série ${G.best}</p>
      <div class="at-gain"><span>+${Math.round(G.xp)} XP Géographie</span><span>+${fmtC(G.coins)} pièces</span>${G.news ? `<span class="new">${G.news} ${G.mode === "loc" ? (G.news > 1 ? "nouveaux pays" : "nouveau pays") + " en rouge" : G.news > 1 ? "nouvelles capitales" : "nouvelle capitale"}</span>` : ""}</div>
      ${G.miss.length ? `<div class="at-card"><span class="at-lab">À revoir</span><div class="at-miss">${[...new Set(G.miss)].map(c => `<span>${esc(cap1(BY[c].n))}${G.mode === "cap" ? " · " + esc(BY[c].cap) : ""}</span>`).join("")}</div></div>` : ""}
      <button class="at-btn big" data-at="${G.mode === "loc" ? "play-loc" : "play-cap"}">Rejouer</button><button class="at-btn ghost" data-at="home">Retour à l'Atlas</button></div>`;
  }
  const contRows = (pool, done) => ["eu", "af", "as", "am", "oc"].map(k => { const t = pool.filter(p => p.k === k), f = t.filter(p => done[p.c]).length;
    return `<div class="at-crow"><span>${CONT[k]}</span><span class="at-meter"><i style="width:${f / t.length * 100}%"></i></span><b>${f}/${t.length}</b></div>`; }).join("");
  function myMap(){
    return `<div class="at-top"><button class="at-back" data-at="home" aria-label="Retour">←</button><h2>Ma carte</h2></div><div class="at-ask small"><em id="at-fb">Touche un pays pour voir son nom (seulement s'il est trouvé).</em></div>${mapSVG()}<div class="at-card">${contRows(C, A().found)}</div>`;
  }
  function stats(){
    const a = A(), miss = Object.keys(a.miss).filter(c => BY[c]).sort((x, y) => a.miss[y] - a.miss[x]).slice(0, 6);
    const box = (t, o, v, l) => `<div class="at-card"><span class="at-lab">${t}</span><div class="at-sg"><div><b>${v}</b><small>${l}</small></div><div><b>${pct(o)} %</b><small>réussite</small></div><div><b>${o.best}</b><small>meilleur score</small></div><div><b>${o.games}</b><small>parties</small></div></div></div>`;
    return `<div class="at-top"><button class="at-back" data-at="home" aria-label="Retour">←</button><h2>Statistiques</h2></div>
      ${box("Localiser un pays", a.loc, Object.keys(a.found).length + "/" + C.length, "pays trouvés")}${box("Trouver la capitale", a.cap, Object.keys(a.capOk).length + "/" + capPool().length, "capitales réussies")}
      <div class="at-card"><span class="at-lab">Pays trouvés par continent</span>${contRows(C, a.found)}</div>
      <div class="at-card"><span class="at-lab">Capitales par continent</span>${contRows(capPool(), a.capOk)}</div>
      <div class="at-card"><span class="at-lab">Les pays où tu te trompes le plus</span>${miss.length ? `<div class="at-miss">${miss.map(c => `<span>${esc(cap1(BY[c].n))} · ${a.miss[c]}×</span>`).join("")}</div>` : `<p class="at-sm">Rien pour l'instant : joue une partie !</p>`}</div>`;
  }
  function rankView(){
    const api = typeof Amis !== "undefined" && Amis.api, users = api ? api.users() : {}, me = api && api.me && api.me();
    if (!api || !me || !Object.keys(users).length) return `<div class="at-top"><button class="at-back" data-at="home" aria-label="Retour">←</button><h2>Classements</h2></div>
      <div class="at-card"><p class="at-sm" style="font-size:14px">Connecte-toi dans l'onglet Multi pour comparer ton Atlas avec tes amis.</p></div>`;
    const key = rankTab === "loc" ? "f" : "c", pk = rankTab === "loc" ? "lp" : "cp";
    const rows = Object.keys(users).map(id => { const s = id === api.uid() ? stats_() : ((users[id].st && users[id].st.atl) || {}); return {id, v:+s[key] || 0, p:+s[pk] || 0}; })
      .filter(r => r.v > 0 || r.id === api.uid()).sort((x, y) => y.v - x.v || y.p - x.p);
    return `<div class="at-top"><button class="at-back" data-at="home" aria-label="Retour">←</button><h2>Classements</h2></div>
      <div class="at-chips at-tabs"><button class="at-chip ${rankTab === "loc" ? "on" : ""}" data-rank="loc">Atlas · pays</button><button class="at-chip ${rankTab === "cap" ? "on" : ""}" data-rank="cap">Atlas · capitales</button></div>
      <div class="at-card">${rows.map((r, i) => `<div class="at-rrow ${r.id === api.uid() ? "me" : ""}"><span class="at-pos ${i < 3 ? "gold" : ""}">${i + 1}</span>${api.avatar(r.id, 40)}<div class="grow"><b>${esc(api.pseudoOf(r.id))}</b><small>${r.p} % de réussite</small></div><b class="at-pts">${r.v}<small>/${rankTab === "loc" ? C.length : capPool().length}</small></b></div>`).join("")}</div>
      <p class="at-sm">Le classement se met à jour quand chacun ouvre l'appli.</p>`;
  }
  // Ce que je publie (ping) : pays trouvés, capitales réussies, réussite
  function stats_(){ const a = A(); return {f:Object.keys(a.found).length, c:Object.keys(a.capOk).length, lp:pct(a.loc), cp:pct(a.cap)}; }

  /* ---------- Petits dessins ---------- */
  function globeSVG(){ return `<svg viewBox="0 0 120 120"><circle cx="60" cy="64" r="48" fill="#2B1D3A"/><circle cx="60" cy="60" r="48" fill="#4A8BF0" stroke="#2B1D3A" stroke-width="4"/><path d="M30 40 Q42 30 52 38 Q58 50 48 56 Q40 64 44 76 Q34 72 28 60 Z M64 24 Q80 26 88 40 Q78 44 72 38 Q64 36 64 24 Z M70 58 Q86 54 94 66 Q90 84 76 90 Q72 76 66 70 Z" fill="#5AE8A0" stroke="#2B1D3A" stroke-width="3" stroke-linejoin="round"/><circle cx="54" cy="47" r="5" fill="#E0243C" stroke="#2B1D3A" stroke-width="2.5"/><path d="M28 36 Q38 22 54 18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/></svg>`; }
  function pinSVG(){ return `<svg viewBox="0 0 60 60"><path d="M30 6 C18 6 10 15 10 26 C10 40 30 56 30 56 C30 56 50 40 50 26 C50 15 42 6 30 6Z" fill="#E0243C" stroke="#2B1D3A" stroke-width="3.5"/><circle cx="30" cy="25" r="8" fill="#fff" stroke="#2B1D3A" stroke-width="3"/><path d="M18 18 Q21 12 28 10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/></svg>`; }
  function capSVG(){ return `<svg viewBox="0 0 60 60"><path d="M10 50 H50 V45 H10Z" fill="#FFD23F" stroke="#2B1D3A" stroke-width="3"/>${[14, 22, 30, 38, 46].map(x => `<rect x="${x - 2.5}" y="27" width="5" height="18" fill="#FFF0C0" stroke="#2B1D3A" stroke-width="2"/>`).join("")}<path d="M8 27 L30 12 L52 27Z" fill="#FFD23F" stroke="#2B1D3A" stroke-width="3" stroke-linejoin="round"/><path d="M30 12 V4 L40 7 L30 10" fill="#E0243C" stroke="#2B1D3A" stroke-width="2"/></svg>`; }
  // Carte de l'onglet Jouer
  const card = () => { const a = A(), nf = Object.keys(a.found).length;
    return `<button class="mode wide at-entry" data-atlas="1"><span class="mi">${globeSVG()}</span><h3>Atlas du monde</h3><p>Localise les pays sur la carte et trouve les capitales.</p><span class="label">${nf}/${C.length} pays · ${Object.keys(a.capOk).length}/${capPool().length} capitales</span></button>`; };

  /* ---------- Rendu et clics ---------- */
  function paint(){
    if (!root) return;
    root.innerHTML = `<div class="at-in ${view}">${view === "home" ? home() : view === "set-loc" ? settings("loc") : view === "set-cap" ? settings("cap") : view === "loc" ? locScreen() : view === "cap" ? capScreen() : view === "end" ? endScreen() : view === "mymap" ? myMap() : view === "stats" ? stats() : rankView()}</div>`;
    if (view === "loc") initMap(G.k === "all" ? [0, 0, ATLAS.w, ATLAS.h] : ATLAS.box[G.k]);
    if (view === "mymap") initMap([0, 0, ATLAS.w, ATLAS.h]);
  }
  function onClick(e){
    const see = e.target.closest("[data-see]"); if (see && !e.target.closest("button") && typeof Profil !== "undefined") return Profil.see(see.dataset.see, true);
    const b = e.target.closest("button"); if (!b || b.disabled) return; const d = b.dataset;
    if (d.z !== undefined && M) { if (d.z === "0") { fit(M.box); clamp(); apply(); } else zoomAt(M.w / 2, M.h / 2, M.k * (d.z === "1" ? 1.6 : .62)); return; }
    if (d.set) { A().set[d.set] = d.set === "k" ? d.v : +d.v; save(); return paint(); }
    if (d.ans !== undefined) return capAnswer(+d.ans);
    if (d.rank) { rankTab = d.rank; return paint(); }
    const go = d.at; if (!go) return;
    try { Music.sfx("tap"); } catch(err){}
    if (go === "close") return close();
    if (go === "play-loc" || go === "play-cap") return start(go === "play-loc" ? "loc" : "cap");
    if (go === "cap-next") { G.i++; G.opts = null; return G.i >= G.list.length ? finish() : paint(); }
    if (go === "quit") { if (G && G.i > 0) { const m = A()[G.mode]; m.games++; m.best = Math.max(m.best, G.ok); save(); } view = "home"; G = null; return paint(); }
    view = go; root.scrollTop = 0; paint();
  }

  /* ---------- Badges et titre ---------- */
  const TITLE = {id:"globe", n:"GLOBE-TROTTEUR", a:"#7AE8FF", b:"#0A4A8A", f:"#FFFFFF"};
  const foundIn = k => C.filter(p => p.k === k && S.atlas && S.atlas.found && S.atlas.found[p.c]).length;
  [["atl_eu", "or", "eu", "Europe"], ["atl_af", "platine", "af", "Afrique"], ["atl_as", "platine", "as", "Asie"], ["atl_am", "or", "am", "Amériques"], ["atl_oc", "or", "oc", "Océanie"]].forEach(([id, tier, k, n]) => {
    const goal = C.filter(p => p.k === k).length;
    BADGES.push({id, g:"L'Atlas", tier, icon:"geo", name:`Atlas · ${n}`, desc:`Trouver sur la carte les ${goal} pays : ${n}`, coins:150, goal, cur:() => foundIn(k)}); });
  BADGES.push({id:"atl_all", g:"L'Atlas", tier:"diamant", icon:"geo", name:"Le monde entier", desc:`Trouver les ${C.length} pays sur la carte (titre GLOBE-TROTTEUR)`, coins:500, goal:C.length, cur:() => { const n = S.atlas && S.atlas.found ? Object.keys(S.atlas.found).length : 0; if (n >= C.length) { S.titles = S.titles || {}; S.titles.globe = S.titles.globe || today(); } return n; }});
  [["atl_c50", "argent", 50], ["atl_c100", "or", 100], ["atl_call", "diamant", capPool().length]].forEach(([id, tier, goal]) =>
    BADGES.push({id, g:"L'Atlas", tier, icon:"cap", name:goal === capPool().length ? "Toutes les capitales" : `${goal} capitales`, desc:`Réussir ${goal} capitales différentes dans l'Atlas`, coins:goal >= 150 ? 400 : goal >= 100 ? 150 : 60, goal, cur:() => S.atlas && S.atlas.capOk ? Object.keys(S.atlas.capOk).length : 0}));

  return {open, close, isOpen:() => !!(root && !root.hidden), card, stats:stats_, titles:{globe:TITLE}, _test:{BY, M:() => M, G:() => G}};
})();
