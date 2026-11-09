/* Prototype « Salon privé » + mode « La Bombe » (jamais publié tel quel).
   Tout est simulé : Léa, Nina et Tom sont des robots. S'ouvre par-dessus l'appli, depuis l'onglet JcJ. */
(function(){
const BOTS = [{n:"Léa", av:3, skill:.72}, {n:"Nina", av:7, skill:.6}, {n:"Tom", av:11, skill:.5}];
const EMO = ["😂","👍","😱","🤫","🔥","😈"];
const BOT_CHAT = ["Allez allez !", "Je la sens pas celle-là 😅", "Passe-la moi pas !!", "Trop facile", "Nooon", "Bien joué", "La mèche est courte là…", "Revanche après ?"];
let P = null, root = null, timers = [];
const $ = s => root.querySelector(s);
const later = (f, ms) => { const t = setTimeout(f, ms); timers.push(t); return t; };
const clearAll = () => { timers.forEach(clearTimeout); timers = []; };
const me = () => (window.__app.state().profile || {name:"Toi", avatar:0});
const code4 = () => Array.from({length:4}, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random()*24)]).join("");
const esc2 = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function css(){ return `<style>
#bp{position:fixed;inset:0;z-index:999;background:var(--bg);overflow-y:auto;padding:14px max(14px,env(safe-area-inset-left,0px)) 90px}
#bp .wrap{max-width:460px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
#bp .top{display:flex;justify-content:space-between;align-items:center}
#bp .code{font:800 44px/1 "Bricolage Grotesque",sans-serif;letter-spacing:.18em;text-align:center;color:var(--lamp)}
#bp .seg{display:flex;gap:6px;flex-wrap:wrap}
#bp .seg button{flex:1;min-width:0;padding:10px 6px;border-radius:12px;border:2px solid var(--line);background:var(--surface);font-weight:800;color:var(--ink)}
#bp .seg button[aria-pressed=true]{border-color:var(--lamp);background:color-mix(in srgb,var(--lamp) 16%,var(--surface))}
#bp .pl{display:flex;align-items:center;gap:10px;padding:6px 0}
#bp .pl svg{flex:none}
#bp .pl b{flex:1}
#bp .tag{font:600 11px "IBM Plex Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);opacity:.7}
#bp input[type=range]{width:100%}
#bp .chat{display:flex;flex-direction:column;gap:6px;max-height:150px;overflow-y:auto;font-size:14px}
#bp .chat p{margin:0}
#bp .chat b{color:var(--lamp)}
#bp .chatrow{display:flex;gap:6px}
#bp .chatrow input{flex:1;min-width:0;border-radius:12px;border:2px solid var(--line);padding:10px;background:var(--surface);color:var(--ink);font:inherit}
#bp .table{position:relative;height:290px;margin:0}
#bp .felt{position:absolute;left:12%;right:12%;top:22%;bottom:22%;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,#5B3A8C,#33205A 70%);box-shadow:0 10px 0 #20123A,inset 0 0 0 6px #7B54B8}
#bp .seat{position:absolute;width:96px;margin-left:-48px;text-align:center;transition:transform .3s}
#bp .seat .nm{font:800 13px "Bricolage Grotesque",sans-serif;background:var(--surface);border-radius:10px;padding:2px 8px;display:inline-block;box-shadow:0 2px 0 var(--line)}
#bp .seat .hp{font-size:13px;color:#FF4D6D;letter-spacing:1px}
#bp .seat .hp i{opacity:.2;font-style:normal}
#bp .seat.hold .nm{background:var(--lamp);color:#fff}
#bp .seat.out{opacity:.35;filter:grayscale(1)}
#bp .seat.hit{animation:bpHit .5s}
@keyframes bpHit{0%,100%{transform:none}20%{transform:translateX(-8px) rotate(-6deg)}50%{transform:translateX(8px) rotate(6deg)}}
#bp .bubble{position:absolute;left:50%;top:-30px;transform:translateX(-50%);font-size:26px;animation:bpPop 1.8s forwards;pointer-events:none}
@keyframes bpPop{0%{transform:translate(-50%,10px) scale(.4);opacity:0}15%{transform:translate(-50%,0) scale(1.2);opacity:1}80%{opacity:1}100%{transform:translate(-50%,-14px);opacity:0}}
#bp .bomb{position:absolute;width:76px;height:76px;margin:-38px 0 0 -38px;transition:left .55s cubic-bezier(.5,1.6,.5,1),top .55s cubic-bezier(.5,1.6,.5,1);z-index:2}
#bp .bomb svg{animation:bpBeat var(--beat,1s) ease-in-out infinite}
@keyframes bpBeat{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
#bp .spark{animation:bpSpark .25s steps(2) infinite}
@keyframes bpSpark{50%{transform:scale(.6) rotate(30deg)}}
#bp .boom{position:absolute;inset:0;display:grid;place-items:center;font:900 64px "Bricolage Grotesque",sans-serif;color:#FFD23F;text-shadow:0 4px 0 #C2185B,0 0 30px #FF5FA2;animation:bpBoom 1.1s forwards;pointer-events:none;z-index:3}
@keyframes bpBoom{0%{transform:scale(.2);opacity:0}20%{transform:scale(1.3);opacity:1}100%{transform:scale(1);opacity:0}}
#bp .flash{position:fixed;inset:0;background:#fff;animation:bpFlash .5s forwards;pointer-events:none;z-index:1000}
@keyframes bpFlash{from{opacity:.8}to{opacity:0}}
#bp .fuse{display:flex;gap:4px;justify-content:center;align-items:center}
#bp .fuse i{width:26px;height:8px;border-radius:4px;background:#F4A261}
#bp .fuse i.burnt{background:var(--line)}
#bp .emo{display:flex;gap:6px;justify-content:center}
#bp .emo button{font-size:22px;width:44px;height:44px;border-radius:12px;border:2px solid var(--line);background:var(--surface)}
#bp .wait{text-align:center;opacity:.75;font-weight:700}
#bp .q h2{font-size:18px;margin:6px 0}
#bp .q .choice{padding-block:10px}
#bp .rank{display:flex;flex-direction:column;gap:6px}
#bp .note{font-size:12px;opacity:.65;text-align:center}
@media (prefers-reduced-motion:reduce){#bp .bomb svg,#bp .spark,#bp .boom,#bp .seat.hit{animation:none}}
</style>`; }

function bombSVG(fuse){
  // fuse = morceaux de mèche restants (3 = neuve). L'étincelle est au bout.
  const segs = [[46,24,54,14],[54,14,64,10],[64,10,72,14]].slice(0, fuse);
  const tip = segs.length ? segs[segs.length-1] : [40,26,46,24];
  return `<svg viewBox="0 0 80 80" width="76" height="76" aria-label="Bombe">
  <circle cx="36" cy="48" r="24" fill="#2B1D3A"/><circle cx="36" cy="46" r="22" fill="#3D2C55"/>
  <ellipse cx="28" cy="38" rx="7" ry="5" fill="#fff" opacity=".35"/>
  <rect x="36" y="20" width="12" height="10" rx="3" transform="rotate(35 42 25)" fill="#5B4A72" stroke="#2B1D3A" stroke-width="2"/>
  ${segs.map(s => `<path d="M${s[0]},${s[1]} L${s[2]},${s[3]}" stroke="#F4A261" stroke-width="3.5" stroke-linecap="round"/>`).join("")}
  <g class="spark" style="transform-origin:${tip[2]}px ${tip[3]}px"><circle cx="${tip[2]}" cy="${tip[3]}" r="5" fill="#FFD23F"/><circle cx="${tip[2]}" cy="${tip[3]}" r="2.5" fill="#fff"/></g></svg>`;
}

/* ---------- Écran 1 : salon ---------- */
function newRoom(join){
  P = {screen:"room", code: join || code4(), host: !join, mode:"bombe", nq:20, diff:"normal", players:[{n:me().name||"Toi", av:me().avatar||0, you:true}], chat:[], invited:{}};
  if (join) { P.host = false; P.players.unshift({n:"Léa", av:3, bot:BOTS[0]}); later(() => addBot(1), 900); }
  draw();
}
function addBot(i){ if (!P || P.screen !== "room" || P.players.some(p => p.n === BOTS[i].n)) return;
  P.players.push({n:BOTS[i].n, av:BOTS[i].av, bot:BOTS[i]}); say(BOTS[i].n, i === 2 ? "Yo, je suis là" : "Coucou !"); draw(); }
function say(who, txt){ P.chat.push([who, txt]); if (P.chat.length > 40) P.chat.shift(); }
function chatBox(mini){ return `<div class="card" style="padding:12px"><span class="tag">Chat du salon</span>
  <div class="chat" id="bpchat" ${mini?'style="max-height:46px"':""}>${P.chat.map(m => `<p><b>${esc2(m[0])}</b> ${esc2(m[1])}</p>`).join("") || `<p style="opacity:.6">Écris un message à tes amis…</p>`}</div>
  <form class="chatrow" id="bpform" style="margin-top:8px"><input id="bpmsg" maxlength="80" placeholder="Ton message" autocomplete="off"><button class="btn" style="width:auto;padding:0 16px">Envoyer</button></form></div>`; }
function roomView(){
  const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button data-bp-set="${k}:${v}" aria-pressed="${P[k]===v}">${l}</button>`).join("")}</div>`;
  const friends = BOTS.filter(b => !P.players.some(p => p.n === b.n));
  return `<div class="top"><span class="label">Salon privé</span><button class="quit" data-bp="close">Quitter</button></div>
  <div class="card" style="padding:16px;text-align:center"><span class="tag">Code du salon</span><div class="code">${P.code}</div>
    <p style="margin:6px 0 0;font-size:14px">Tes amis tapent ce code dans JcJ › Rejoindre un salon.</p></div>
  <div class="card" style="padding:14px"><span class="tag">Joueurs (${P.players.length}/6)</span>
    ${P.players.map(p => `<div class="pl">${avatarSVG(p.av, 40)}<b>${esc2(p.n)}${p.you?" (toi)":""}</b>${p === P.players[0] ? `<span class="tag">Hôte</span>` : ""}</div>`).join("")}
    ${friends.length ? `<div class="tag" style="margin-top:8px">Inviter (ils reçoivent une notification)</div>${friends.map(b => `<div class="pl">${avatarSVG(b.av, 34)}<b>${b.n}</b><button class="chip-btn" data-bp-inv="${BOTS.indexOf(b)}" ${P.invited[b.n]?"disabled":""}>${P.invited[b.n]?"Invité…":"Inviter"}</button></div>`).join("")}` : ""}</div>
  <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px">
    <span class="tag">Mode</span>${seg("mode", [["bombe","💣 La Bombe"],["quiz","Quiz à plusieurs"]])}
    ${P.mode === "quiz" ? `<span class="tag">Nombre de questions : <b id="bpnq">${P.nq}</b></span><input id="bprange" type="range" min="10" max="50" step="5" value="${P.nq}">`
      : `<p style="margin:0;font-size:14px">Chacun 3 cœurs. Bonne réponse : tu passes la bombe. Mauvaise réponse : la mèche brûle. Après 3 erreurs, la suivante fait exploser la bombe. 10 secondes pour répondre (puis 8).</p>`}
    <span class="tag">Difficulté</span>${seg("diff", [["facile","Facile"],["normal","Normal"],["difficile","Difficile"]])}
    <span class="tag">Thèmes : tous</span></div>
  ${chatBox()}
  ${P.host ? `<button class="btn" data-bp="go" ${P.players.length < 2 ? "disabled" : ""}>${P.players.length < 2 ? "En attente d'un ami…" : "Lancer la partie"}</button>` : `<p class="wait">En attente que ${esc2(P.players[0].n)} lance la partie…</p><button class="btn ghost" data-bp="go">(Prototype : lancer quand même)</button>`}`;
}

/* ---------- Écran 2 : la table de la Bombe ---------- */
function startBomb(){
  clearAll();
  P.screen = "bomb"; P.players.forEach(p => { p.hearts = 3; p.ok = 0; p.ko = 0; });
  P.holder = Math.floor(Math.random()*P.players.length); P.fuse = 3; P.turn = 0; P.used = new Set();
  say("Lumen", "La partie commence ! " + P.players[P.holder].n + " a la bombe.");
  ask();
}
const lvlOf = () => P.diff === "facile" ? [1] : P.diff === "difficile" ? [2,3] : [1,2];
function pickQ(){
  const ids = Object.keys(Q).filter(id => !(Q[id][6] && Q[id][6].t) && Q[id][2].length === 4 && lvlOf().includes(Q[id][1]) && !P.used.has(id));
  const id = ids[Math.floor(Math.random()*ids.length)]; P.used.add(id); return id;
}
const qTime = () => P.turn >= 12 ? 8 : 10;
function ask(){
  P.phase = "ask"; P.qid = pickQ(); P.ans = undefined; P.turn++;
  P.order = [0,1,2,3].sort(() => Math.random() - .5); P.dl = Date.now() + qTime()*1000;
  if (P.turn === 13) say("Lumen", "La bombe s'emballe : 8 secondes pour répondre !");
  const h = P.players[P.holder];
  if (h.bot) { const t = 1600 + Math.random()*(qTime()*1000 - 1200); later(() => { if (P.phase === "ask") answer(Math.random() < h.bot.skill ? 0 : 1 + Math.floor(Math.random()*3)); }, Math.min(t, qTime()*1000 - 200)); }
  if (Math.random() < .25) later(() => botTalk(), 1500 + Math.random()*3000);
  draw(); tickLoop();
}
function tickLoop(){
  const t = setInterval(() => {
    if (!P || P.screen !== "bomb" || P.phase !== "ask") return clearInterval(t);
    const left = Math.max(0, P.dl - Date.now()), b = $("#bpbar"), l = $("#bpleft");
    if (b) b.style.width = (left / (qTime()*10)) + "%"; if (l) l.textContent = Math.ceil(left/1000) + " s";
    if (left <= 0) { clearInterval(t); answer(-1); }
  }, 150); timers.push(t);
}
function answer(v){
  if (P.phase !== "ask") return;
  P.phase = "reveal"; P.ans = v; const h = P.players[P.holder], ok = v === 0;
  try { Music.sfx(ok ? "ok" : "ko"); } catch(e){}
  if (ok) { h.ok++; draw(); return later(() => { P.holder = nextAlive(P.holder); ask(); }, 1500); }
  h.ko++;
  if (P.fuse > 0) { P.fuse--; draw(); return later(ask, 1700); }
  // Mèche finie : la bombe explose sur celui qui l'a
  P.phase = "boom"; h.hearts--; P.fuse = 3; draw();
  root.insertAdjacentHTML("beforeend", `<div class="flash"></div>`); later(() => { const f = $(".flash"); if (f) f.remove(); }, 600);
  try { navigator.vibrate && navigator.vibrate([80, 40, 160]); } catch(e){}
  say("Lumen", "💥 BOUM ! " + h.n + " perd un cœur.");
  if (h.hearts <= 0) return later(endGame, 1800);
  later(() => { P.holder = nextAlive(P.holder); ask(); }, 2000);
}
const nextAlive = i => (i + 1) % P.players.length;
function botTalk(){ if (!P || P.screen === "end") return; const b = P.players.filter(p => p.bot); if (!b.length) return; const p = b[Math.floor(Math.random()*b.length)];
  if (Math.random() < .5) emote(P.players.indexOf(p), EMO[Math.floor(Math.random()*EMO.length)]); else { say(p.n, BOT_CHAT[Math.floor(Math.random()*BOT_CHAT.length)]); refreshChat(); } }
function emote(i, e){ const s = root.querySelector(`[data-seat="${i}"]`); if (!s) return; s.insertAdjacentHTML("beforeend", `<span class="bubble">${e}</span>`); const b = s.lastElementChild; setTimeout(() => b.remove(), 1900); }
function seatPos(i, n){ // toi en bas, les autres répartis autour de la table
  const you = P.players.findIndex(p => p.you), k = (i - you + n) % n, a = Math.PI/2 + k * 2*Math.PI/n;
  return [50 + Math.cos(a)*40, 50 + Math.sin(a)*38]; }
function bombView(){
  const n = P.players.length, h = P.players[P.holder], q = Q[P.qid], mine = h.you;
  const [hx, hy] = seatPos(P.holder, n), bx = hx + (50-hx)*.42, by = hy + (50-hy)*.42;
  const seats = P.players.map((p, i) => { const [x, y] = seatPos(i, n);
    return `<div class="seat ${i===P.holder?"hold":""} ${p.hearts<=0?"out":""} ${P.phase==="boom"&&i===P.holder?"hit":""}" data-seat="${i}" style="left:${x}%;top:calc(${y}% - 52px)">
      <div class="hp">${"♥".repeat(Math.max(0,p.hearts))}<i>${"♥".repeat(3-Math.max(0,p.hearts))}</i></div><div class="nm">${esc2(p.n)}</div>${avatarSVG(p.av, 64)}</div>`; }).join("");
  let card = "";
  if (q) {
    const left = Math.max(0, P.dl - Date.now());
    const choices = P.order.map(o => { let c = "choice"; if (P.ans !== undefined) c += o===0 ? " right" : o===P.ans ? " wrong" : " dim";
      return `<button class="${c}" data-bp-ans="${o}" ${!mine||P.phase!=="ask"?"disabled":""}>${esc2(q[2][o])}</button>`; }).join("");
    const status = P.phase === "ask" ? (mine ? `<b style="color:var(--lamp)">À toi ! Réponds vite.</b>` : `<span class="wait">${esc2(h.n)} réfléchit…</span>`)
      : P.phase === "boom" ? `<b style="color:#FF4D6D">💥 La bombe explose sur ${esc2(h.n)} !</b>`
      : P.ans === 0 ? `<b style="color:var(--ok,#2BB673)">Juste ! ${esc2(h.n)} passe la bombe.</b>` : `<b style="color:#FF4D6D">${P.ans===-1?"Temps écoulé":"Raté"} : la mèche brûle !</b>`;
    card = `<article class="card q" style="padding:14px"><div class="row between"><span class="chip">${dot(q[0])}${esc2(THEMES[q[0]].n)}</span><span class="label" id="bpleft">${Math.ceil(left/1000)} s</span></div>
      <div class="timer" style="margin:8px 0 0"><i id="bpbar" style="width:${P.phase==="ask"?left/(qTime()*10):0}%"></i></div>
      <h2>${esc2(q[4])}</h2><div class="choices">${choices}</div><p style="margin:10px 0 0;text-align:center">${status}</p></article>`;
  }
  return `<div class="top"><span class="label">La Bombe · salon ${P.code}</span><button class="quit" data-bp="close">Quitter</button></div>
  <div class="table"><div class="felt"></div>${seats}<div class="bomb" style="left:${bx}%;top:${by}%;--beat:${[.35,.55,.75,1][P.fuse]}s">${bombSVG(P.fuse)}</div>${P.phase==="boom"?`<div class="boom">BOUM</div>`:""}</div>
  <div class="fuse" aria-label="Mèche">${[0,1,2].map(i => `<i class="${i < 3-P.fuse ? "burnt" : ""}"></i>`).join("")}<span class="tag" style="margin-left:6px">${P.fuse === 0 ? "Prochaine erreur = BOUM" : "Erreurs avant explosion : " + P.fuse}</span></div>
  ${card}
  <div class="emo">${EMO.map(e => `<button data-bp-emo="${e}" aria-label="Envoyer ${e}">${e}</button>`).join("")}</div>
  ${chatBox(true)}`;
}
function endGame(){
  clearAll(); P.screen = "end";
  P.rank = P.players.slice().sort((a, b) => b.hearts - a.hearts || b.ok - a.ok);
  draw();
}
function endView(){
  const youWin = P.rank[0].you, xp = 40 + P.players.find(p => p.you).ok*8;
  return `<div class="top"><span class="label">Fin de partie</span><button class="quit" data-bp="close">Quitter</button></div>
  <div class="card" style="padding:16px;text-align:center"><div style="font-size:44px">${youWin?"🏆":"💥"}</div><h2 style="margin:4px 0">${youWin?"Tu as survécu à la bombe !":esc2(P.rank[P.rank.length-1].n)+" a tout perdu."}</h2><p style="margin:0">+${xp} XP · +${youWin?60:20} pièces</p></div>
  <div class="card rank" style="padding:14px">${P.rank.map((p, i) => `<div class="pl"><b style="flex:none;width:22px">${i+1}</b>${avatarSVG(p.av, 40)}<b>${esc2(p.n)}</b><span class="hp" style="color:#FF4D6D">${"♥".repeat(Math.max(0,p.hearts))}</span><span class="tag">${p.ok} justes</span></div>`).join("")}</div>
  ${youWin ? `<div class="toast" role="status"><b>Nouveau badge : Démineur</b> · Gagner une partie de Bombe</div>` : ""}
  <button class="btn" data-bp="again">Revanche (même salon)</button><button class="btn ghost" data-bp="room">Retour au salon</button>
  ${chatBox()}`;
}

/* ---------- Accueil JcJ du prototype ---------- */
function homeView(){
  return `<div class="top"><span class="label">JcJ · Salons privés</span><button class="quit" data-bp="close">Fermer</button></div>
  <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:10px"><h2 style="margin:0">Jouer à plusieurs</h2>
  <p style="margin:0">Crée un salon et partage son code, ou rejoins celui d'un ami. De 2 à 6 joueurs.</p>
  <button class="btn" data-bp="create">Créer un salon</button>
  <div class="chatrow"><input id="bpjoin" maxlength="4" placeholder="Code (ex. FHBU)" style="text-transform:uppercase"><button class="btn ghost" style="width:auto;padding:0 16px" data-bp="join">Rejoindre</button></div></div>
  <p class="note">Prototype : Léa, Nina et Tom sont simulés.</p>`;
}
function refreshChat(){ const c = $("#bpchat"); if (!c) return; c.innerHTML = P.chat.map(m => `<p><b>${esc2(m[0])}</b> ${esc2(m[1])}</p>`).join(""); c.scrollTop = 1e6; }
function draw(){
  if (!root) return;
  const keep = $("#bpmsg") && $("#bpmsg").value;
  root.innerHTML = css() + `<div class="wrap">${!P ? homeView() : P.screen === "room" ? roomView() : P.screen === "bomb" ? bombView() : endView()}</div>`;
  if (keep && $("#bpmsg")) $("#bpmsg").value = keep;
  const c = $("#bpchat"); if (c) c.scrollTop = 1e6;
}
function open(){ if (root) return; root = document.createElement("div"); root.id = "bp"; document.body.appendChild(root); P = null; draw(); }
function close(){ clearAll(); if (root) root.remove(); root = null; P = null; }
document.addEventListener("click", e => {
  if (!root || !root.contains(e.target)) return;
  const b = e.target.closest("button"); if (!b || b.disabled) return; const d = b.dataset;
  if (d.bp === "close") return close();
  if (d.bp === "create") return newRoom();
  if (d.bp === "join") { const v = ($("#bpjoin").value || "").toUpperCase().trim(); return newRoom(v.length === 4 ? v : "FHBU"); }
  if (d.bp === "go") return startBomb();
  if (d.bp === "again") return startBomb();
  if (d.bp === "room") { clearAll(); P.screen = "room"; return draw(); }
  if (d.bpSet) { const [k, v] = d.bpSet.split(":"); P[k] = v; return draw(); }
  if (d.bpInv !== undefined) { const i = +d.bpInv; P.invited[BOTS[i].n] = 1; draw(); return later(() => addBot(i), 1200 + Math.random()*1500); }
  if (d.bpAns !== undefined) return answer(+d.bpAns);
  if (d.bpEmo) { const i = P.players.findIndex(p => p.you); emote(i, d.bpEmo); if (Math.random() < .5) later(botTalk, 900); return; }
}, true);
document.addEventListener("submit", e => {
  if (!root || e.target.id !== "bpform") return; e.preventDefault();
  const v = $("#bpmsg").value.trim(); if (!v) return; $("#bpmsg").value = ""; say(me().name || "Toi", v); refreshChat();
  if (Math.random() < .6) later(() => { const b = BOTS[Math.floor(Math.random()*BOTS.length)]; if (P.players.some(p => p.n === b.n)) { say(b.n, BOT_CHAT[Math.floor(Math.random()*BOT_CHAT.length)]); refreshChat(); } }, 1200);
}, true);
document.addEventListener("input", e => { if (root && e.target.id === "bprange") { P.nq = +e.target.value; const l = $("#bpnq"); if (l) l.textContent = P.nq; } });
window.BombeProto = {open, close};
// Bouton d'accès ajouté en haut de l'onglet JcJ
const obs = new MutationObserver(() => {
  const app = document.getElementById("app"); if (!app || root) return;
  if (window.__app.state().tab === "amis" && !document.getElementById("bp-entry")) {
    app.querySelector(".fade") && app.querySelector(".fade").insertAdjacentHTML("afterbegin", `<button id="bp-entry" class="btn" style="margin-bottom:12px" onclick="BombeProto.open()">💣 Salons privés &amp; La Bombe (prototype)</button>`);
  }
});
window.addEventListener("load", () => obs.observe(document.getElementById("app"), {childList:true, subtree:false}));
})();
