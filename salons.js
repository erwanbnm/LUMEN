/* ---------- Salons privés (onglet JcJ) : La Bombe et le Quiz à plusieurs ----------
   Un salon = un document Firestore rooms/{CODE} (4 lettres) + un chat rooms/{CODE}/chat.
   Bombe : l'hôte sert d'arbitre (il choisit les questions, gère le temps et l'explosion) ;
   celui qui a la bombe écrit sa réponse. Quiz : tout le monde joue les mêmes questions au même rythme,
   calculé à partir de l'heure de départ (pas besoin d'arbitre).
   Si un joueur quitte (ou ne donne plus signe de vie), la partie s'arrête. */
const Salons = (() => {
  const A = () => Amis.api;
  const EMO = ["😂","👍","😱","🤫","🔥","😈"];
  const MAXP = 6, Q_TIME = 10, Q_FAST = 8, FAST_AFTER = 12, QUIZ_SHOW = 4;
  let room = null, code = null, unsubRoom = null, unsubChat = null, unsubInv = null, chat = [], tick = null, hbTimer = null;
  let jumpTop = false, offset = 0, view = "lobby", msg = "", draft = "", busy = false, lastKey = "", shownInv = {}, bubbles = [], drive = false;
  const db = () => A().db(), uid = () => A().uid();
  const FV = () => A().fb().firestore.FieldValue;
  const now = () => Date.now() + offset; // les téléphones sont à l'heure (réglage automatique) : on s'y fie
  const isHost = () => room && room.host === uid();
  const seats = () => room ? Object.keys(room.players || {}).filter(id => !room.players[id].out).sort((a, b) => room.players[a].j - room.players[b].j) : [];
  // Présence mesurée avec MON horloge : on note quand le signal de vie d'un joueur change (les téléphones peuvent ne pas être à la même heure)
  const lastHb = {}, seenAt = {};
  const quiet = id => id === uid() ? 0 : Date.now() - (seenAt[id] || Date.now());
  const live = () => seats().filter(id => quiet(id) < 35000);
  const pName = id => (room && room.players[id] && room.players[id].p) || A().pseudoOf(id);
  const letters = () => Array.from({length:4}, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random()*24)]).join("");
  const lvls = d => d === "facile" ? [1] : d === "difficile" ? [2,3] : [1,2];
  const fresh = (d, not) => Object.keys(Q).filter(id => !(Q[id][6] && Q[id][6].t) && Q[id][2].length === 4 && lvls(d).includes(Q[id][1]) && !(not && not.has(id)));
  // On évite les questions déjà tombées pour n'importe quel joueur du salon (dans ses dernières parties de salon)
  const SEEN_MAX = 800;
  const seenStr = () => (S.slSeen || []).slice(-SEEN_MAX).join(",");
  function markSeen(ids){ S.slSeen = S.slSeen || []; const have = new Set(S.slSeen); ids.forEach(id => { if (id && !have.has(id)) { S.slSeen.push(id); have.add(id); } }); if (S.slSeen.length > SEEN_MAX) S.slSeen = S.slSeen.slice(-SEEN_MAX); }
  function avoidSet(extra){
    const set = new Set(extra || []);
    if (room) Object.values(room.players || {}).forEach(pl => String(pl.seen || "").split(",").forEach(id => id && set.add(id)));
    (S.slSeen || []).forEach(id => set.add(id));
    return set;
  }
  const pickOne = (d, used) => { let p = fresh(d, avoidSet(used)); if (!p.length) p = fresh(d, new Set(used || [])); return p[Math.floor(Math.random()*p.length)]; };
  function publishSeen(){ if (code && uid()) db().doc("rooms/" + code).update({["players." + uid() + ".seen"]: seenStr()}).catch(() => {}); }
  const qTime = g => g.turn > FAST_AFTER ? Q_FAST : Q_TIME;
  const shuffle4 = () => [0,1,2,3].sort(() => Math.random() - .5);
  const myAv = () => (S.profile && S.profile.skin && ownsSkin(S.profile.skin) && S.profile.skin) || ("b" + ((S.profile && S.profile.avatar) || 0));
  const myPseudo = () => { const u = A().users()[uid()]; return (u && u.pseudo) || (S.profile && S.profile.name) || "Moi"; };

  /* --- Statistiques locales et badges --- */
  const stats = () => { S.salons = S.salons || {played:0, bomb:0, quiz:0, hosted:0, clean:0, chat:0, done:{}}; return S.salons; };

  /* --- Créer, rejoindre, quitter --- */
  async function create(){
    let c = letters();
    for (let i = 0; i < 5 && (await db().doc("rooms/" + c).get()).exists; i++) c = letters();
    await db().doc("rooms/" + c).set({code:c, host:uid(), created:Date.now(), state:"lobby", mode:"bombe", nq:20, diff:"normal", inv:[], gid:0,
      players:{[uid()]: {p:myPseudo(), av:myAv(), j:Date.now(), hb:Date.now(), seen:seenStr()}}});
    stats().hosted++; save(); checkBadges();
    enter(c);
  }
  async function join(c){
    c = (c || "").toUpperCase().replace(/[^A-Z]/g, "");
    if (c.length !== 4) throw "Le code fait 4 lettres.";
    const snap = await db().doc("rooms/" + c).get();
    if (!snap.exists) throw "Aucun salon avec ce code.";
    const r = snap.data();
    if (r.state === "closed") throw "Ce salon est fermé.";
    if (!r.players[uid()]) {
      if (r.state !== "lobby") throw "La partie a déjà commencé dans ce salon.";
      if (Object.keys(r.players).filter(id => !r.players[id].out).length >= MAXP) throw "Le salon est complet (6 joueurs).";
    }
    await db().doc("rooms/" + c).update({["players." + uid()]: {p:myPseudo(), av:myAv(), j:(r.players[uid()] && r.players[uid()].j) || Date.now(), hb:Date.now(), seen:seenStr()}});
    enter(c);
  }
  function enter(c){
    leaveListeners(); code = c; view = "lobby"; chat = []; msg = ""; S.salonCode = c; save();
    unsubRoom = db().doc("rooms/" + c).onSnapshot(s => onRoom(s), () => {});
    unsubChat = db().collection("rooms/" + c + "/chat").orderBy("at", "desc").limit(40).onSnapshot(s => {
      const before = chat.length; chat = s.docs.map(d => d.data()).reverse();
      s.docChanges().forEach(ch => { const m = ch.doc.data(); if (ch.type === "added" && m.e && before) showBubble(m.u, m.e); });
      paintChat();
    }, () => {});
    clearInterval(hbTimer); hbTimer = setInterval(heartbeat, 15000); heartbeat();
    clearInterval(tick); tick = setInterval(loop, 250);
    render(); window.scrollTo(0, 0);
  }
  function heartbeat(){ if (code && uid() && document.visibilityState === "visible") db().doc("rooms/" + code).update({["players." + uid() + ".hb"]: Date.now()}).catch(() => {}); }
  // De retour dans l'appli (après être allé envoyer le code à un ami, par exemple) : signal de vie tout de suite
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") heartbeat(); });
  async function leave(){
    const c = code, r = room;
    leaveListeners(); room = null; code = null; S.salonCode = null; save();
    if (c && r && r.players && r.players[uid()]) {
      const up = {["players." + uid() + ".out"]: true};
      if (r.state === "play") Object.assign(up, {state:"end", "g.over":true, "g.why":myPseudo() + " a quitté la partie."});
      if (r.host === uid()) { const rest = Object.keys(r.players).filter(id => id !== uid() && !r.players[id].out); if (rest.length) up.host = rest[0]; else up.state = "closed"; }
      await db().doc("rooms/" + c).update(up).catch(() => {});
    }
    render();
  }
  function leaveListeners(){ [unsubRoom, unsubChat].forEach(f => f && f()); unsubRoom = unsubChat = null; clearInterval(tick); clearInterval(hbTimer); try { Music.fuse(0); } catch(e){} }

  /* --- Réception du salon --- */
  function onRoom(s){
    if (!s.exists) { room = null; msg = "Ce salon n'existe plus."; return render(); }
    const r = s.data(), me = r.players[uid()];
    const prev = room; room = r;
    Object.keys(r.players || {}).forEach(id => { const hb = r.players[id].hb; if (lastHb[id] !== hb || !seenAt[id]) { lastHb[id] = hb; seenAt[id] = Date.now(); } });
    if (!me || me.out) { leaveListeners(); room = null; code = null; S.salonCode = null; save(); msg = "Tu as quitté le salon."; return render(); }
    if (r.state === "play" && (!prev || prev.state !== "play" || prev.gid !== r.gid)) { view = "game"; jumpTop = true; if (typeof Quetes !== "undefined") Quetes.newRun(); }
    if (r.state === "end" && prev && prev.state === "play") { jumpTop = true; setTimeout(podium, r.mode === "bombe" ? 1800 : 300); }
    if (r.state === "end" && view === "game") rewards();
    // Animation et son quand la bombe explose
    const g = r.g || {}, pg = (prev && prev.g) || {};
    if (r.state === "play" && r.mode === "bombe" && g.qid && g.qid !== pg.qid) markSeen([g.qid]);
    if (r.state === "play" && (r.mode === "quiz" || r.mode === "pm") && g.qids && (!prev || prev.gid !== r.gid)) markSeen(g.qids);
    if (r.mode === "bombe" && g.phase !== pg.phase) {
      if (g.phase === "boom") boomFx();
      else if (g.phase === "reveal") try { Music.sfx(g.good ? "ok" : "ko"); } catch(e){}
    }
    const key = JSON.stringify([r.state, r.mode, r.nq, r.diff, r.host, Object.keys(r.players).map(id => [id, !!r.players[id].out]), r.inv, g.phase, g.turn, g.holder, g.fuse, g.qid, g.over, g.ans && g.ans.v, r.sc, r.fd]);
    if (key !== lastKey) { lastKey = key; repaint(); }
  }
  // Ne redessine que l'écran du salon (sans casser une partie solo en cours)
  function repaint(){
    if (S.tab !== "amis") return;
    const typing = document.activeElement && document.activeElement.id === "sl-msg", guessing = document.activeElement && document.activeElement.id === "sl-guess", y = window.scrollY;
    if (guessing && patchPm()) return;
    const ob = document.querySelector(".sl-bomb"), from = ob && ob.getBoundingClientRect();
    window.__quiet = true; render(); window.scrollTo(0, jumpTop ? 0 : y); jumpTop = false;
    const nb = document.querySelector(".sl-bomb");
    if (from && nb && nb.animate) { const to = nb.getBoundingClientRect(), dx = from.left - to.left, dy = from.top - to.top;
      if (Math.abs(dx) + Math.abs(dy) > 4) nb.animate([{transform:`translate(${dx}px,${dy}px)`}, {transform:`translate(${dx/2}px,${dy/2 - 46}px) rotate(200deg)`, offset:.5}, {transform:"none"}], {duration:650, easing:"cubic-bezier(.4,0,.3,1)"}); }
    if (typing) { const i = document.getElementById("sl-msg"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
    if (guessing) { const i = document.getElementById("sl-guess"); if (i) i.focus(); }
    const c = document.getElementById("sl-chat"); if (c) c.scrollTop = 1e6;
  }

  /* --- Boucle : chronos, arbitrage de l'hôte, présence --- */
  function loop(){
    if (!room || !code) return;
    const g = room.g || {};
    const hiss = room.state === "play" && room.mode === "bombe" && g.phase === "ask" && S.tab === "amis" && view === "game";
    Music.fuse(hiss ? [1, .8, .6, .45][g.fuse] || .45 : 0);
    if (typeof stressUpdate === "function") stressUpdate();
    if (room.state === "play" && room.mode === "bombe") {
      const left = Math.max(0, (g.dl || 0) - now());
      setBar(left, qTime(g));
      if (isHost() && !drive) referee(g);
    }
    if (room.state === "play" && (room.mode === "quiz" || room.mode === "pm")) quizTick();
    // Plus de nouvelles d'un joueur depuis 40 s : la partie s'arrête (l'hôte s'en charge)
    if (room.state === "play" && isHost() && !drive) {
      const gone = (g.seats || seats()).find(id => id !== uid() && room.players[id] && !room.players[id].out && !(g.hearts && g.hearts[id] <= 0) && quiet(id) > 50000);
      if (gone) upd({state:"end", "g.over":true, "g.why":pName(gone) + " a quitté la partie."});
    }
    if (room.state === "play" && !isHost() && room.players[room.host] && quiet(room.host) > 55000 && !g.over) {
      room.state = "end"; room.g = Object.assign({}, g, {over:true, why:"L'hôte ne répond plus."}); rewards(); repaint();
    }
  }
  function setBar(left, total){ const b = document.getElementById("sl-bar"), t = document.getElementById("sl-left");
    if (b) b.style.width = Math.min(100, left / (total * 10)) + "%"; if (t) t.textContent = Math.ceil(left / 1000) + " s"; }
  const upd = o => { drive = true; return db().doc("rooms/" + code).update(o).catch(e => console.warn("Salon : écriture refusée", e && e.message)).then(() => { drive = false; }); };

  /* --- La Bombe --- */
  function startBomb(){
    const ids = live(), hearts = {}, ok = {};
    ids.forEach(id => { hearts[id] = 3; ok[id] = 0; });
    const holder = ids[Math.floor(Math.random()*ids.length)], qid = pickOne(room.diff, []);
    return upd({state:"play", gid:(room.gid || 0) + 1, g:{holder, fuse:3, turn:1, qid, ord:shuffle4(), dl:now() + Q_TIME*1000, phase:"ask", ans:null, hearts, ok, used:[qid], seats:ids, over:false}});
  }
  const nextSeat = (g, id) => { const s = g.seats.filter(x => g.hearts[x] > 0), i = s.indexOf(id); return s[(i + 1) % s.length]; };
  function referee(g){
    if (g.over) return;
    const t = now();
    if (g.phase === "ask") {
      const a = g.ans && g.ans.turn === g.turn ? g.ans : null;
      if (!a && t < g.dl + 600) return; // petite marge pour le réseau
      const ok = !!a && a.v === 0, h = g.holder, ng = {phase:"reveal", good:ok, ans:a || {u:h, v:-1, turn:g.turn}, next:t + 1600};
      if (ok) ng["ok." + h] = (g.ok[h] || 0) + 1;
      else if (g.fuse > 0) ng.fuse = g.fuse - 1;
      else { ng.phase = "boom"; ng["hearts." + h] = g.hearts[h] - 1; ng.fuse = 3; ng.next = t + 2300; }
      const o = {}; Object.keys(ng).forEach(k => o["g." + k] = ng[k]);
      if (ng.phase === "boom" && g.hearts[h] - 1 <= 0) { o["g.over"] = true; o["g.loser"] = h; o.state = "end"; }
      return upd(o);
    }
    if ((g.phase === "reveal" || g.phase === "boom") && t >= g.next) {
      const holder = g.phase === "reveal" && !g.good ? g.holder : nextSeat(g, g.holder);
      const qid = pickOne(room.diff, g.used.slice(-300));
      return upd({"g.phase":"ask", "g.holder":holder, "g.turn":g.turn + 1, "g.qid":qid, "g.ord":shuffle4(), "g.ans":null, "g.used":FV().arrayUnion(qid),
        "g.dl":t + (g.turn + 1 > FAST_AFTER ? Q_FAST : Q_TIME)*1000});
    }
  }
  function bombAnswer(v){
    const g = room.g; if (!g || g.phase !== "ask" || g.holder !== uid() || (g.ans && g.ans.turn === g.turn)) return;
    room.g.ans = {u:uid(), v, turn:g.turn}; // affichage immédiat
    try { answer(g.qid, v === 0, 0); noteAnswer(v === 0); } catch(e){}
    db().doc("rooms/" + code).update({"g.ans":{u:uid(), v, turn:g.turn}}).catch(() => {});
    repaint();
  }
  function boomFx(){
    try { Music.fuse(0); Music.sfx("boom"); navigator.vibrate && navigator.vibrate([80, 40, 180]); } catch(e){}
    const f = document.createElement("div"); f.className = "sl-flash"; document.body.appendChild(f); setTimeout(() => f.remove(), 600);
  }

  /* --- Quiz à plusieurs : même rythme pour tous, calculé depuis l'heure de départ --- */
  const PER = (Q_TIME + QUIZ_SHOW) * 1000;
  // Mode Dates : surtout des « Avant ou après ? » (10 s), et environ une fois sur cinq un « Plus ou moins » (30 s)
  const PM_TIME = 30, PM_SHOW = 6, AV_TIME = 10, AV_SHOW = 4;
  const kindOf = id => String(id).startsWith("dt") ? "p" : "a";
  const dur = k => (k === "p" ? PM_TIME + PM_SHOW : AV_TIME + AV_SHOW) * 1000, win = k => (k === "p" ? PM_TIME : AV_TIME) * 1000;
  const evOf = id => EV[+id.slice(2)];
  const yr = y => y < 0 ? -y + " av. J.-C." : String(y);
  function startQuiz(){
    const ids = live(), used = new Set(), qids = [];
    const avoid = avoidSet(); let pool = fresh(room.diff, avoid); if (pool.length < room.nq) pool = fresh(room.diff);
    pool.sort(() => Math.random() - .5);
    for (let i = 0; i < room.nq; i++) { const q = pool[i]; used.add(q); qids.push(q); }
    const sc = {}; ids.forEach(id => sc[id] = {ok:0, pos:0});
    return upd({state:"play", gid:(room.gid || 0) + 1, sc, g:{qids, start:now() + 3500, seats:ids, ords:qids.map(() => shuffle4().join("")), over:false}}); // Firestore refuse les listes dans des listes : l'ordre est stocké en texte (« 2031 »)
  }
  function startPM(){
    const ids = live(), avoid = avoidSet(), n = Math.min(30, room.nq || 10);
    // Environ 20 % de « Plus ou moins » (au moins un), jamais en première manche
    const np = Math.max(1, Math.round(n * .2)), kinds = Array(n).fill("a");
    const spots = Array.from({length:n - 1}, (_, i) => i + 1).sort(() => Math.random() - .5).slice(0, np); spots.forEach(i => kinds[i] = "p");
    let dts = DATES.map((_, i) => "dt" + i).filter(id => !avoid.has(id)); if (dts.length < np) dts = DATES.map((_, i) => "dt" + i);
    dts.sort(() => Math.random() - .5);
    // Avant / Après : deux événements d'années différentes, paire jamais vue par les joueurs si possible
    const pairs = [], usedEv = new Set();
    const pair = () => { for (let k = 0; k < 400; k++) { const x = Math.floor(Math.random()*EV.length), y = Math.floor(Math.random()*EV.length);
      if (x === y || EV[x][1] === EV[y][1] || usedEv.has(x) && usedEv.has(y)) continue; const id = "ev" + x + "-ev" + y;
      if (avoid.has(id) && k < 300) continue; usedEv.add(x); usedEv.add(y); return id; } return "ev0-ev1"; };
    const qids = kinds.map(k => k === "p" ? dts.pop() : pair());
    return upd({state:"play", gid:(room.gid || 0) + 1, fd:{}, g:{qids, start:now() + 3500, seats:ids, over:false}});
  }
  // Mes réponses pour la manche en cours (sur ce téléphone)
  let pm = {k:"", tries:[], found:false, av:undefined};
  const pmKey = i => room.gid + ":" + i, pmCur = i => { const k = pmKey(i); if (pm.k !== k) pm = {k, tries:[], found:false, av:undefined}; return pm; };
  function pmGuess(v){
    const g = room.g, p = quizPos(); if (!g || p.i < 0 || !p.inQ || kindOf(g.qids[p.i]) !== "p") return;
    const st = pmCur(p.i); if (st.found || !Number.isFinite(v)) return;
    const y = DATES[+g.qids[p.i].slice(2)][2];
    st.tries.push(v);
    if (v === y) { st.found = true; try { Music.sfx("ok"); } catch(e){}
      db().doc("rooms/" + code).update({["fd." + p.i + "." + uid()]: p.r}).catch(() => {}); }
    else try { Music.sfx("tap"); } catch(e){}
    pmDraft = ""; repaint(); setTimeout(() => { const i = document.getElementById("sl-guess"); if (i) i.focus(); }, 30);
  }
  // Avant / Après : v = 0 (avant) ou 1 (après) ; une bonne réponse est enregistrée avec son temps
  function avAnswer(v){
    const g = room.g, p = quizPos(); if (!g || p.i < 0 || !p.inQ || kindOf(g.qids[p.i]) !== "a") return;
    const st = pmCur(p.i); if (st.av !== undefined) return; st.av = v;
    const [x, y] = g.qids[p.i].split("-").map(evOf), good = (y[1] < x[1] ? 0 : 1) === v;
    if (good) db().doc("rooms/" + code).update({["fd." + p.i + "." + uid()]: p.r}).catch(() => {});
    noteAnswer(good);
    repaint();
  }
  let pmDraft = "";
  // Met à jour la manche « Plus ou moins » autour de la case de saisie, sans la toucher (elle garde le focus, le clavier et le curseur)
  function patchPm(){
    const old = document.querySelector(".sl-q.pm-bonus"), form = document.getElementById("sl-pm"); if (!old || !form || !room || !room.g) return false;
    const tmp = document.createElement("div"); tmp.innerHTML = pmView();
    const nw = tmp.querySelector(".sl-q.pm-bonus"), nf = nw && nw.querySelector("#sl-pm"), h = q => (q.querySelector("h2") || {}).textContent;
    if (!nf || h(nw) !== h(old)) return false;
    [...old.children].forEach(c => { if (c !== form) c.remove(); });
    const kids = [...nw.children], fi = kids.indexOf(nf);
    kids.forEach((c, i) => { if (c === nf) return; if (i < fi) old.insertBefore(c, form); else old.appendChild(c); });
    const ob = document.querySelector(".sl-board"), nb = tmp.querySelector(".sl-board"); if (ob && nb) ob.replaceWith(nb);
    const inp = document.getElementById("sl-guess"); if (inp && inp.value !== pmDraft) inp.value = pmDraft;
    return true;
  }
  // Points d'une manche. Plus ou moins : 1er 3 pts, 2e 2 pts, les autres 1 pt. Avant/Après : le plus rapide 2 pts, les autres 1 pt.
  function pmRound(i){ const f = (room.fd && room.fd[i]) || {}, pmK = room.g && room.g.qids && kindOf(room.g.qids[i]) === "p";
    return Object.keys(f).sort((a, b) => f[a] - f[b]).map((id, k) => ({id, t:f[id], pts:pmK ? (k === 0 ? 3 : k === 1 ? 2 : 1) : (k === 0 ? 2 : 1)})); }
  function pmView(){
    const g = room.g, p = quizPos(), n = g.qids.length;
    const board = `<div class="sl-board">${ranking().map((r, i) => `<span class="${r.id === uid() ? "me" : ""}">${i + 1}. ${esc(pName(r.id))} <b>${r.a}</b></span>`).join("")}</div>`;
    let body;
    if (p.e < 0) body = `<div class="card stack" style="text-align:center"><b>Les dates commencent dans <span id="sl-left">${Math.ceil(-p.e/1000)} s</span></b><span class="muted">${n} manches · surtout « Avant ou après ? », parfois « Plus ou moins »</span></div>`;
    else {
      const i = Math.min(p.i, n - 1), id = g.qids[i], st = pmCur(i), finders = pmRound(i);
      const left = p.inQ ? p.w - p.r : 0;
      const head = (chip, lab) => `<div class="row between"><span class="chip">${chip}</span><span class="label" id="sl-left">${p.inQ ? Math.ceil(left/1000) + " s" : ""}</span></div>
        <div class="timer" style="margin:8px 0 0"><i id="sl-bar" style="width:${p.inQ ? left/(p.w/100) : 0}%"></i></div><div class="label" style="margin-top:8px">${lab} · manche ${i + 1}/${n}</div>`;
      const who = finders.length ? `<div class="pm-who">${finders.map(f => `<span>${esc(pName(f.id))} · ${(f.t/1000).toFixed(1)} s · +${f.pts}</span>`).join("")}</div>` : "";
      if (kindOf(id) === "a") {
        const [x, y] = id.split("-").map(evOf), right = y[1] < x[1] ? 0 : 1, mine = st.av;
        const btn = (v, label) => { let c = "choice av-btn"; if (!p.inQ) c += v === right ? " right" : v === mine ? " wrong" : " dim"; else if (mine !== undefined) c += v === mine ? " picked" : " dim";
          return `<button class="${c}" data-sl="av" data-v="${v}" ${p.inQ && mine === undefined ? "" : "disabled"}>${label}</button>`; };
        body = `<article class="card q sl-q">${head("⏳ Avant ou après ?", "Avant ou après")}
          <div class="av-ref"><span>${esc(x[0])}</span><b>${yr(x[1])}</b></div>
          <h2 style="text-align:center">${esc(y[0])}</h2>
          <div class="av-row">${btn(0, "⬅ Avant")}${btn(1, "Après ➡")}</div>
          ${!p.inQ ? `<div class="pm-year">${yr(y[1])}</div><p class="sl-status">${mine === right ? `<b class="sl-good">Bien vu !</b>` : `<b class="sl-bad">${mine === undefined ? "Trop tard !" : "Raté !"}</b>`}</p>` : ""}${who}</article>`;
      } else {
        const d = DATES[+id.slice(2)];
        const tries = st.tries.slice().reverse().map(v => `<span class="pm-try ${v === d[2] ? "ok" : ""}">${v} ${v === d[2] ? "✓" : v < d[2] ? "↑ c'est plus" : "↓ c'est moins"}</span>`).join("");
        body = `<article class="card q sl-q pm-bonus">${head("🎯 Plus ou moins · bonus", "Trouve l'année exacte")}<h2>${esc(d[1])}</h2>
          ${p.inQ && !st.found ? `<form class="pm-form" id="sl-pm"><input id="sl-guess" type="text" inputmode="numeric" maxlength="6" placeholder="Ton année" value="${esc(pmDraft)}" autocomplete="off" autocorrect="off" spellcheck="false"><button class="btn" type="submit">Valider</button></form>` : ""}
          ${p.inQ && st.found ? `<p class="sl-status"><b class="sl-good">Trouvé en ${st.tries.length} essai${st.tries.length > 1 ? "s" : ""} ! Attends les autres…</b></p>` : ""}
          ${!p.inQ ? `<div class="pm-year">${d[2]}</div><p class="sl-status">${st.found ? `<b class="sl-good">Bien joué !</b>` : `<b class="sl-bad">Pas trouvé cette fois.</b>`}</p><p class="muted" style="margin:6px 0 0;text-align:center">${esc(d[3])}</p>` : ""}
          ${tries ? `<div class="pm-tries">${tries}</div>` : ""}${who}</article>`;
      }
    }
    return `<section class="stack sl-game"><div class="row between"><span class="label">Dates · salon ${room.code}</span><button class="quit" data-sl="leave">Quitter</button></div>
      ${table(null, null, 0, false)}${board}${body}${emoBar()}${chatHTML(true)}</section>`;
  }
  let quizMine = {}, quizIdx = -2;
  // Où en est-on ? i = manche, inQ = on peut encore répondre, r = temps écoulé dans la manche, w = temps pour répondre
  function quizPos(){
    const g = room.g, e = now() - g.start;
    if (room.mode !== "pm") return {i:Math.floor(e / PER), inQ:(e % PER) < Q_TIME*1000, e, r:e % PER, w:Q_TIME*1000};
    if (e < 0) return {i:-1, inQ:false, e, r:e, w:0};
    let t = 0;
    for (let i = 0; i < g.qids.length; i++) { const k = kindOf(g.qids[i]), d = dur(k);
      if (e < t + d) return {i, inQ:e - t < win(k), e, r:e - t, w:win(k)}; t += d; }
    return {i:g.qids.length, inQ:false, e, r:0, w:0};
  }
  function quizTick(){
    const g = room.g; if (!g || !g.qids || g.over) return;
    const p = quizPos();
    if (p.i >= g.qids.length) { if (isHost() && !drive) upd({state:"end", "g.over":true}); return; }
    const k = p.e < 0 ? -1 : p.i * 2 + (p.inQ ? 0 : 1);
    if (k !== quizIdx) { quizIdx = k; pmDraft = ""; repaint(); }
    if (p.e >= 0) setBar(p.inQ ? p.w - p.r : 0, (p.w || 1000) / 1000);
    else { const t = document.getElementById("sl-left"); if (t) t.textContent = Math.ceil(-p.e / 1000) + " s"; }
  }
  function quizAnswer(v){
    const g = room.g, p = quizPos(); if (!g || p.i < 0 || !p.inQ || quizMine[g.qids[p.i] + room.gid] !== undefined) return;
    quizMine[g.qids[p.i] + room.gid] = v; const ok = v === 0;
    try { answer(g.qids[p.i], ok, 0); noteAnswer(ok); } catch(e){}
    const cur = (room.sc && room.sc[uid()]) || {ok:0, pos:0};
    db().doc("rooms/" + code).update({["sc." + uid()]: {ok:cur.ok + (ok ? 1 : 0), pos:p.i + 1}}).catch(() => {});
    repaint();
  }

  /* --- Récompenses de fin de partie (une seule fois par partie) --- */
  function rewards(){
    const st = stats(), k = code + "#" + room.gid; if (!room.gid || st.done[k]) return; st.done[k] = 1;
    const ks = Object.keys(st.done); if (ks.length > 60) delete st.done[ks[0]];
    const rk = ranking(); if (!rk.length) return;
    const win = rk[0].id === uid() && !room.g.why;
    st.played++;
    if (win && room.mode === "bombe") { st.bomb++; if (room.g.hearts && room.g.hearts[uid()] === 3) st.clean++; }
    if (win && room.mode === "quiz") st.quiz++;
    if (win && room.mode === "pm") st.pm = (st.pm || 0) + 1;
    const coins = room.g.why ? 10 : win ? 60 : 20; S.coins += coins; publishSeen();
    if (typeof Quetes !== "undefined" && !room.g.why) Quetes.mpDone("s" + k, win);
    toasts.push(`<b>${win ? "Victoire !" : "Partie terminée"}</b> · +${coins} pièces`);
    save(); checkBadges();
  }
  function ranking(){
    const g = room.g || {}, ids = g.seats || seats();
    if (room.mode === "bombe") return ids.map(id => ({id, a:(g.hearts && g.hearts[id]) || 0, b:(g.ok && g.ok[id]) || 0})).sort((x, y) => y.a - x.a || y.b - x.b);
    if (room.mode === "pm") { const pts = {}, tm = {}; ids.forEach(id => { pts[id] = 0; tm[id] = 0; });
      Object.keys(room.fd || {}).forEach(i => pmRound(i).forEach(f => { if (f.id in pts) { pts[f.id] += f.pts; tm[f.id] += f.t; } }));
      return ids.map(id => ({id, a:pts[id], b:tm[id]})).sort((x, y) => y.a - x.a || x.b - y.b); }
    return ids.map(id => ({id, a:(room.sc && room.sc[id] && room.sc[id].ok) || 0, b:0})).sort((x, y) => y.a - x.a);
  }

  /* --- Podium de fin : le 3e, puis le 2e, puis le gagnant tombe du ciel --- */
  function podium(){
    if (!room || !room.g || document.querySelector(".sl-pod")) return;
    try { Music.fuse(0); } catch(e){}
    const rk = ranking().slice(0, 3), g = room.g, win = rk[0];
    if (!win || g.why) return; // partie interrompue : pas de podium
    const order = rk.length === 3 ? [2, 0, 1] : rk.length === 2 ? [1, 0] : [0];
    const score = r => room.mode === "bombe" ? `<span class="sl-hp">${"♥".repeat(r.a) || "💥"}</span>` : room.mode === "pm" ? `<span>${r.a} point${r.a > 1 ? "s" : ""}</span>` : `<span>${r.a} bonne${r.a > 1 ? "s" : ""} réponse${r.a > 1 ? "s" : ""}</span>`;
    const cols = order.map(i => `<div class="sl-pcol r${i + 1}"><div class="who">${i === 0 ? `<span class="crown">👑</span>` : ""}${A().avatar(rk[i].id, i === 0 ? 92 : 70)}<b>${esc(pName(rk[i].id))}</b>${A().title(rk[i].id, "xs")}${score(rk[i])}</div><div class="step">${i + 1}</div></div>`).join("");
    const colors = ["#FF5FA2", "#FFD23F", "#7FD8BE", "#8FB8F0", "#FFFFFF"];
    const conf = Array.from({length:36}, (_, k) => `<i class="sl-conf" style="left:${Math.random()*100}%;background:${colors[k % 5]};animation-delay:${2.3 + Math.random()*1.4}s;animation-duration:${2.2 + Math.random()*1.6}s"></i>`).join("");
    const el = document.createElement("div"); el.className = "sl-pod"; el.setAttribute("role", "dialog");
    el.innerHTML = conf + `<div class="sl-podium">${cols}</div><h2>${win.id === uid() ? "Tu as gagné !" : esc(pName(win.id)) + " gagne !"}</h2>
      <p class="sub">${room.mode === "bombe" && g.loser ? "💥 " + esc(pName(g.loser)) + " n'a plus de cœur." : "Bravo à tous !"}</p>
      <button class="btn sub" style="max-width:320px">Continuer</button>`;
    el.querySelector("button").onclick = () => { el.remove(); flushLevelUp(); }; // les badges gagnés s'affichent ensuite
    document.body.appendChild(el);
    if (S.settings.sfx !== false) { [1000, 1500].slice(0, rk.length - 1).forEach(t => setTimeout(() => { try { Music.sfx("drop"); } catch(e){} }, t + 600)); setTimeout(() => { try { Music.sfx("win"); } catch(e){} }, 2500); }
  }

  /* --- Chat et émotes --- */
  function send(t, e){
    if (!code) return; const m = {u:uid(), p:myPseudo(), at:Date.now()}; if (t) m.t = t.slice(0, 120); if (e) m.e = e;
    db().collection("rooms/" + code + "/chat").add(m).catch(() => {});
    if (t) { stats().chat++; save(); }
    if (e) showBubble(uid(), e, true);
  }
  function showBubble(u, e, mine){
    if (!mine && u === uid()) return;
    const el = document.querySelector(`[data-seat="${u}"]`); if (!el) return;
    const b = document.createElement("span"); b.className = "sl-bubble"; b.textContent = e; el.appendChild(b); setTimeout(() => b.remove(), 1900);
  }
  function chatHTML(mini){
    return `<div class="card sl-chatbox"><div class="label">Chat du salon</div>
      <div class="sl-chat" id="sl-chat" ${mini ? 'style="max-height:58px"' : ""}>${chat.filter(m => m.t).map(m => `<p><b>${esc(m.p)}</b> ${esc(m.t)}</p>`).join("") || `<p class="muted">Écris un petit mot à tes amis…</p>`}</div>
      <form class="sl-chatrow" id="sl-form"><input id="sl-msg" maxlength="120" placeholder="Ton message" autocomplete="off" value="${esc(draft)}"><button class="btn small" type="submit">Envoyer</button></form></div>`;
  }
  function paintChat(){ const c = document.getElementById("sl-chat"); if (!c) return;
    c.innerHTML = chat.filter(m => m.t).map(m => `<p><b>${esc(m.p)}</b> ${esc(m.t)}</p>`).join("") || `<p class="muted">Écris un petit mot à tes amis…</p>`; c.scrollTop = 1e6; }

  /* --- Invitations --- */
  function listen(){
    if (unsubInv) unsubInv();
    unsubInv = db().collection("rooms").where("inv", "array-contains", uid()).onSnapshot(s => {
      s.docs.forEach(d => { const r = d.data();
        if (r.state === "lobby" && Date.now() - r.created < 3600e3 && !shownInv[r.code] && code !== r.code && !(r.players[uid()] && !r.players[uid()].out)) { shownInv[r.code] = 1; inviteBanner(r); } });
    }, () => {});
    // Retour dans le salon après un rechargement de la page
    if (S.salonCode && !code) join(S.salonCode).catch(() => { S.salonCode = null; save(); });
  }
  function inviteBanner(r){
    if (S.settings.sfx !== false) try { Music.sfx("level"); navigator.vibrate && navigator.vibrate([90, 60, 90]); } catch(e){}
    const el = document.createElement("div"); el.className = "am-inv"; el.setAttribute("role", "alertdialog");
    el.innerHTML = `<button class="am-x" data-sl="x" aria-label="Fermer">×</button>
      <div class="row" style="gap:10px;align-items:center;flex-wrap:nowrap">${A().avatar(r.host, 40)}<div class="stack" style="gap:2px;min-width:0"><b>${esc(A().pseudoOf(r.host))} t'invite dans son salon !</b><span>${r.mode === "bombe" ? "💣 La Bombe" : "Quiz à plusieurs"} · code ${r.code}</span></div></div>
      <div class="row"><button class="btn small" data-sl="join" data-v="${r.code}">Rejoindre</button><button class="btn small ghost" data-sl="x">Plus tard</button></div>`;
    document.body.appendChild(el); setTimeout(() => el.remove(), 90000);
  }

  /* --- Affichage --- */
  function entry(){
    return `<div class="card stack sl-entry"><div class="row between" style="align-items:center"><div class="stack" style="gap:2px"><b>Salons privés</b><span class="muted" style="font-size:13.5px">La Bombe ou un quiz, de 2 à 6 amis.</span></div><span style="font-size:30px" aria-hidden="true">💣</span></div>
      ${msg ? `<p class="am-err">${esc(msg)}</p>` : ""}
      <button class="btn" data-sl="create" ${busy ? "disabled" : ""}>Créer un salon</button>
      <form class="sl-chatrow" id="sl-join"><input id="sl-code" maxlength="4" placeholder="Code (ex. FHBU)" autocomplete="off" style="text-transform:uppercase"><button class="btn small ghost" type="submit" ${busy ? "disabled" : ""}>Rejoindre</button></form></div>`;
  }
  const seg = (k, opts) => `<div class="sl-seg">${opts.map(([v, l]) => `<button data-sl="set" data-k="${k}" data-v="${v}" aria-pressed="${room[k] == v}" ${isHost() ? "" : "disabled"}>${l}</button>`).join("")}</div>`;
  function lobbyView(){
    const ids = seats(), friends = Object.keys(A().users()).filter(id => id !== uid() && !ids.includes(id));
    const last = room.state === "end" && room.g ? resultCard() : "";
    return `<section class="stack">
      <div class="row between"><h1 class="big" style="margin:0">Salon</h1><button class="quit" data-sl="leave">Quitter</button></div>
      ${last}
      <div class="card stack" style="text-align:center;gap:4px"><div class="label">Code du salon</div><div class="sl-code">${room.code}</div><span class="muted" style="font-size:13.5px">Tes amis le tapent dans JcJ › Salons privés.</span></div>
      <div class="card stack"><div class="label">Joueurs (${ids.length}/${MAXP})</div>
        ${ids.map(id => `<div class="am-row">${A().avatar(id, 40)}<div class="grow stack" style="gap:3px"><b>${esc(pName(id))}${id === uid() ? " (toi)" : ""}</b>${A().title(id, "xs")}</div>${id === room.host ? `<span class="chip">Hôte</span>` : ""}</div>`).join("")}
        ${isHost() && friends.length && ids.length < MAXP ? `<div class="label" style="margin-top:6px">Inviter</div>${friends.map(id => `<div class="am-row">${A().avatar(id, 34)}<b class="grow">${esc(A().pseudoOf(id))}</b><button class="chip-btn" data-sl="inv" data-v="${id}" ${(room.inv || []).includes(id) ? "disabled" : ""}>${(room.inv || []).includes(id) ? "Invité" : "Inviter"}</button></div>`).join("")}` : ""}
      </div>
      <div class="card stack"><div class="label">Mode</div>${seg("mode", [["bombe", "💣 La Bombe"], ["quiz", "Quiz"], ["pm", "⏳ Dates"]])}
        ${room.mode === "pm" ? `<div class="label">Nombre de manches : ${room.nq}</div><div class="row">${[10,15,20,30].map(n => `<button class="chip-btn ${room.nq === n ? "on" : ""}" data-sl="set" data-k="nq" data-v="${n}" aria-pressed="${room.nq === n}" ${isHost() ? "" : "disabled"}>${n}</button>`).join("")}</div>
          <p class="muted" style="margin:0;font-size:13.5px">Surtout des « Avant ou après ? » : un événement est donné avec son année, dis si l'autre s'est passé avant ou après (10 s, le plus rapide gagne 2 points, les autres 1). Environ une fois sur cinq, un bonus « Plus ou moins » : trouve l'année exacte (30 s, 3, 2 puis 1 point). Tout le monde joue en même temps.</p>`
        : room.mode === "quiz" ? `<div class="label">Nombre de questions : ${room.nq}</div><div class="row">${[10,20,30,40,50].map(n => `<button class="chip-btn ${room.nq === n ? "on" : ""}" data-sl="set" data-k="nq" data-v="${n}" aria-pressed="${room.nq === n}" ${isHost() ? "" : "disabled"}>${n}</button>`).join("")}</div>
          <p class="muted" style="margin:0;font-size:13.5px">Tout le monde répond en même temps aux mêmes questions, 10 secondes chacune. Le plus de bonnes réponses gagne.</p>`
        : `<p class="muted" style="margin:0;font-size:13.5px">Chacun a 3 cœurs. Bonne réponse : tu passes la bombe au suivant. Mauvaise réponse : la mèche brûle. Après 3 erreurs, la suivante fait exploser la bombe et coûte un cœur. 10 secondes pour répondre, puis 8. La partie s'arrête dès qu'un joueur n'a plus de cœur.</p>`}
        ${room.mode === "pm" ? "" : `<div class="label">Difficulté</div>${seg("diff", [["facile", "Facile"], ["normal", "Normal"], ["difficile", "Difficile"]])}`}
        <span class="muted" style="font-size:13.5px">Thèmes : tous.</span></div>
      ${chatHTML()}
      ${isHost() ? `<button class="btn" data-sl="start" ${ids.length < 2 ? "disabled" : ""}>${ids.length < 2 ? "En attente d'un ami…" : room.state === "end" ? "Rejouer" : "Lancer la partie"}</button>` : `<p class="muted" style="text-align:center">En attente que ${esc(pName(room.host))} lance la partie…</p>`}
    </section>`;
  }
  function resultCard(){
    const rk = ranking(), g = room.g;
    const title = g.why ? g.why : room.mode === "bombe" ? (g.loser ? `💥 ${esc(pName(g.loser))} n'a plus de cœur.` : "Partie terminée.") : room.mode === "pm" ? "Partie de Dates terminée." : "Quiz terminé.";
    return `<div class="card stack sl-res"><b>${title}</b>${rk.map((r, i) => `<div class="am-row"><span class="am-pos ${i === 0 ? "gold" : ""}">${i + 1}</span>${A().avatar(r.id, 36)}<b class="grow">${esc(pName(r.id))}</b><span class="muted">${room.mode === "bombe" ? `<span class="sl-hp">${"♥".repeat(r.a)}</span> · ${r.b} justes` : room.mode === "pm" ? r.a + " points" : r.a + " bonnes réponses"}</span></div>`).join("")}</div>`;
  }
  function seatPos(i, n, mine){ const k = (i - mine + n) % n, a = Math.PI/2 + k * 2*Math.PI/n; return [50 + Math.cos(a)*40, 50 + Math.sin(a)*38]; }
  function table(holder, hearts, fuse, boom){
    const ids = (room.g && room.g.seats) || seats(), n = ids.length, mi = Math.max(0, ids.indexOf(uid()));
    const seatsH = ids.map((id, i) => { const [x, y] = seatPos(i, n, mi), h = hearts ? hearts[id] : null, gone = room.players[id] && room.players[id].out;
      return `<div class="sl-seat ${id === holder ? "hold" : ""} ${h === 0 || gone ? "out" : ""} ${boom && id === holder ? "hit" : ""}" data-seat="${id}" style="left:${x}%;top:calc(${y}% - 52px)">
        ${h !== null ? `<div class="sl-hp">${"♥".repeat(Math.max(0, h))}<i>${"♥".repeat(3 - Math.max(0, h))}</i></div>` : ""}<div class="sl-nm">${esc(pName(id))}</div>${A().title(id, "xs")}${A().avatar(id, 62)}</div>`; }).join("");
    let bomb = "";
    if (holder) { const [hx, hy] = seatPos(ids.indexOf(holder), n, mi), bx = hx + (50 - hx)*.42, by = hy + (50 - hy)*.42;
      bomb = `<div class="sl-bomb" style="left:${bx}%;top:${by}%;--beat:${[.35,.55,.75,1][fuse]}s">${bombSVG(fuse)}</div>`; }
    return `<div class="sl-table"><div class="sl-felt"></div>${seatsH}${bomb}${boom ? `<div class="sl-boom">BOUM</div>` : ""}</div>`;
  }
  function bombSVG(fuse){
    const segs = [[46,24,54,14],[54,14,64,10],[64,10,72,14]].slice(0, fuse), tip = segs.length ? segs[segs.length-1] : [40,26,46,24];
    return `<svg viewBox="0 0 80 80" width="74" height="74" aria-label="Bombe"><circle cx="36" cy="48" r="24" fill="#2B1D3A"/><circle cx="36" cy="46" r="22" fill="#3D2C55"/>
      <ellipse cx="28" cy="38" rx="7" ry="5" fill="#fff" opacity=".35"/><rect x="36" y="20" width="12" height="10" rx="3" transform="rotate(35 42 25)" fill="#5B4A72" stroke="#2B1D3A" stroke-width="2"/>
      ${segs.map(s => `<path d="M${s[0]},${s[1]} L${s[2]},${s[3]}" stroke="#F4A261" stroke-width="3.5" stroke-linecap="round"/>`).join("")}
      <g class="sl-spark" style="transform-origin:${tip[2]}px ${tip[3]}px"><circle cx="${tip[2]}" cy="${tip[3]}" r="5" fill="#FFD23F"/><circle cx="${tip[2]}" cy="${tip[3]}" r="2.5" fill="#fff"/></g></svg>`;
  }
  const emoBar = () => `<div class="sl-emo">${EMO.map(e => `<button data-sl="emo" data-v="${e}" aria-label="Envoyer ${e}">${e}</button>`).join("")}</div>`;
  function qCard(qid, ord, ans, can, status, left, total, picked){
    const q = Q[qid]; if (!q) return "";
    const ch = ord.map(o => { let c = "choice"; if (ans !== undefined && ans !== null) c += o === 0 ? " right" : o === ans ? " wrong" : " dim"; else if (picked !== undefined && picked !== null) c += o === picked ? " picked" : " dim";
      return `<button class="${c}" data-sl="ans" data-v="${o}" ${can ? "" : "disabled"}>${esc(q[2][o])}</button>`; }).join("");
    return `<article class="card q sl-q"><div class="row between"><span class="chip">${dot(q[0])}${esc(THEMES[q[0]].n)}</span><span class="label" id="sl-left">${Math.ceil(left/1000)} s</span></div>
      <div class="timer" style="margin:8px 0 0"><i id="sl-bar" style="width:${Math.min(100, left/(total*10))}%"></i></div>
      <h2>${esc(q[4])}</h2><div class="choices">${ch}</div><p class="sl-status">${status}</p></article>`;
  }
  function bombView(){
    const g = room.g, h = g.holder, mine = h === uid(), ph = g.phase;
    const picked = ph === "ask" && g.ans && g.ans.turn === g.turn ? g.ans.v : undefined, ans = ph === "ask" ? undefined : g.ans && g.ans.v;
    const status = ph === "ask" ? (picked !== undefined ? `<span class="muted">Verdict…</span>` : mine ? `<b class="sl-you">À toi ! Réponds vite.</b>` : `<span class="muted">${esc(pName(h))} réfléchit…</span>`)
      : ph === "boom" ? `<b class="sl-bad">💥 La bombe explose sur ${esc(pName(h))} !</b>`
      : g.good ? `<b class="sl-good">Juste ! ${esc(pName(h))} passe la bombe.</b>` : `<b class="sl-bad">${g.ans && g.ans.v === -1 ? "Temps écoulé" : "Raté"} : la mèche brûle !</b>`;
    return `<section class="stack sl-game"><div class="row between"><span class="label">La Bombe · salon ${room.code}${g.turn > FAST_AFTER ? " · 8 s !" : ""}</span><button class="quit" data-sl="leave">Quitter</button></div>
      ${table(h, g.hearts, g.fuse, ph === "boom")}
      <div class="sl-fuse">${[0,1,2].map(i => `<i class="${i < 3 - g.fuse ? "burnt" : ""}"></i>`).join("")}<span class="label">${g.fuse === 0 ? "Prochaine erreur = BOUM" : "Erreurs avant explosion : " + g.fuse}</span></div>
      ${qCard(g.qid, g.ord, ans, mine && ph === "ask" && picked === undefined, status, Math.max(0, g.dl - now()), qTime(g), picked)}
      ${emoBar()}${chatHTML(true)}</section>`;
  }
  function quizView(){
    const g = room.g, p = quizPos(), sc = room.sc || {};
    const board = `<div class="sl-board">${ranking().map((r, i) => `<span class="${r.id === uid() ? "me" : ""}">${i + 1}. ${esc(pName(r.id))} <b>${r.a}</b></span>`).join("")}</div>`;
    let body;
    if (p.e < 0) body = `<div class="card stack" style="text-align:center"><b>Le quiz commence dans <span id="sl-left">${Math.ceil(-p.e/1000)} s</span></b><span class="muted">${g.qids.length} questions · 10 secondes chacune</span></div>`;
    else { const i = Math.min(p.i, g.qids.length - 1), qid = g.qids[i], mine = quizMine[qid + room.gid];
      const ans = p.inQ ? mine : (mine === undefined ? -1 : mine);
      const status = p.inQ ? `<b class="sl-you">Question ${i + 1}/${g.qids.length}</b>`
        : mine === 0 ? `<b class="sl-good">Bien vu !</b>` : `<b class="sl-bad">${mine === undefined ? "Trop tard" : "Raté"} : ${esc(Q[qid][2][0])}</b>`;
      body = qCard(qid, String(g.ords[i]).split("").map(Number), p.inQ ? undefined : ans, p.inQ && mine === undefined, status, p.inQ ? p.w - p.r : 0, Q_TIME, p.inQ ? mine : undefined); }
    return `<section class="stack sl-game"><div class="row between"><span class="label">Quiz · salon ${room.code}</span><button class="quit" data-sl="leave">Quitter</button></div>
      ${table(null, null, 0, false)}${board}${body}${emoBar()}${chatHTML(true)}</section>`;
  }
  function viewAll(){
    if (!room) return `<section class="stack"><h1 class="big">JcJ</h1><div class="card"><p class="muted">Connexion au salon…</p></div></section>`;
    if (room.state === "play" && view === "game") return room.mode === "bombe" ? bombView() : room.mode === "pm" ? pmView() : quizView();
    return lobbyView();
  }

  /* --- Clics --- */
  async function click(b){
    const a = b.dataset.sl, v = b.dataset.v; msg = "";
    try {
      if (a === "create") { busy = true; render(); await create(); }
      else if (a === "join") { b.closest(".am-inv") && b.closest(".am-inv").remove(); busy = true; await join(v); }
      else if (a === "x") { b.closest(".am-inv") && b.closest(".am-inv").remove(); return; }
      else if (a === "leave") return await leave();
      else if (a === "set" && isHost()) await upd({[b.dataset.k]: b.dataset.k === "nq" ? +v : v});
      else if (a === "inv" && isHost()) await upd({inv:FV().arrayUnion(v)});
      else if (a === "start" && isHost() && live().length < 2) msg = "Tes amis ne répondent plus : attends qu'ils reviennent dans l'appli.";
      else if (a === "start" && isHost()) { await db().collection("rooms/" + code + "/chat").add({u:uid(), p:"Lumen", t:"La partie commence !", at:Date.now()}).catch(() => {}); await (room.mode === "bombe" ? startBomb() : room.mode === "pm" ? startPM() : startQuiz()); }
      else if (a === "ans") { room.mode === "bombe" ? bombAnswer(+v) : quizAnswer(+v); return; }
      else if (a === "av") { avAnswer(+v); return; }
      else if (a === "emo") return send(null, v);
    } catch(e){ msg = typeof e === "string" ? e : "Impossible de joindre le salon. Vérifie ta connexion."; }
    busy = false; render();
  }
  document.addEventListener("submit", e => {
    if (e.target.id === "sl-form") { e.preventDefault(); const i = document.getElementById("sl-msg"), t = i.value.trim(); if (!t) return; i.value = ""; draft = ""; send(t); }
    if (e.target.id === "sl-pm") { e.preventDefault(); const v = parseInt(document.getElementById("sl-guess").value.replace(/[^\d-]/g, ""), 10); if (!isNaN(v)) pmGuess(v); return; }
    if (e.target.id === "sl-join") { e.preventDefault(); const v = document.getElementById("sl-code").value; busy = true; msg = ""; render();
      join(v).catch(x => { msg = typeof x === "string" ? x : "Impossible de joindre le salon. Vérifie ta connexion."; }).finally(() => { busy = false; render(); }); }
  });
  document.addEventListener("input", e => { if (e.target.id === "sl-msg") draft = e.target.value;
    if (e.target.id === "sl-guess") { const c = e.target.value.replace(/[^\d-]/g, "").replace(/(?!^)-/g, ""); if (c !== e.target.value) e.target.value = c; pmDraft = c; } });

  // Musique : Bombe = stressante (accélère quand la mèche raccourcit), Plus ou moins = tension, Quiz = thème habituel
  function music(){
    if (!room || room.state !== "play" || view !== "game" || S.tab !== "amis") return null;
    const g = room.g || {};
    if (room.mode === "bombe") { const left = Math.max(0, (g.dl || 0) - now()) / (qTime(g) * 1000); return {k:"bomb", heat:Math.min(1, (3 - (g.fuse || 0)) / 3 * .7 + (1 - left) * .3)}; }
    if (room.mode === "pm") return {k:"tense"};
    return null;
  }
  return {entry, view:viewAll, click, listen, music, active:() => !!code, playing:() => !!(room && room.state === "play" && view === "game"), _room:() => room, _test:{set:r => { room = r; code = r.code; view = "game"; }, repaint, tick:() => quizTick(), draft:() => pmDraft}};
})();

/* --- Badges des salons privés --- */
[["sal1","bronze",1,"played","Bienvenue au salon","Jouer une partie dans un salon privé",20],
 ["sal10","argent",10,"played","Habitué du salon","Jouer 10 parties dans des salons privés",50],
 ["hote","bronze",3,"hosted","Maître de maison","Créer 3 salons privés",30],
 ["bombe1","argent",1,"bomb","Démineur","Gagner une partie de La Bombe",50],
 ["bombe10","or",10,"bomb","Artificier","Gagner 10 parties de La Bombe",120],
 ["sangfroid","platine",1,"clean","Sang-froid","Gagner La Bombe sans perdre un seul cœur",150],
 ["quiz1","argent",1,"quiz","Premier de la classe","Gagner un quiz à plusieurs",50],
 ["pm1","argent",1,"pm","Devin","Gagner une partie de Dates",50],
 ["bavard","bronze",20,"chat","Bavard","Envoyer 20 messages dans le chat d'un salon",20]
].forEach(([id, tier, goal, k, name, desc, coins]) => BADGES.push({id:"sl_" + id, g:"En ligne", tier, icon:"duel", name, desc, coins, goal, cur:() => (S.salons && S.salons[k]) || 0}));
