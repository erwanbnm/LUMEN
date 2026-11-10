/* ---------- Guildes (espace Multi, à côté du Joueur contre joueur) ----------
   Choix d'Erwan (novembre 2026) : 5 membres maximum, objectifs calculés pour 5 joueurs, une guilde par joueur.
   Données Firestore :
   - guilds/{id} : nom, emblème, description, date, chef, membres {uid:{role:"chef"|"off"|"mem", j}}, candidatures,
     invitations, objectifs validés (done) et bonus d'XP de guilde.
   - guilds/{id}/contrib/{uid} : contributions d'UN membre (lui seul peut l'écrire ; les compteurs « all » ne
     peuvent que monter, d'un petit pas à chaque envoi). Les totaux de la guilde = somme de ces fiches.
   - guildNames/{nom en minuscules} : réserve le nom (unique).
   Rôles : le chef fait tout ; un officier accepte ou refuse les candidatures et invite ; un membre invite et peut partir.
   La progression de guilde ne débloque que du cosmétique (emblèmes, couleurs, décor du QG, titres). */
const Guildes = (() => {
  const A = () => Amis.api, MAX = 5;
  const db = () => A().db(), uid = () => A().uid(), FV = () => A().fb().firestore.FieldValue;
  const parisDay = () => new Intl.DateTimeFormat("fr-CA", {timeZone:"Europe/Paris", year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date());
  const weekOf = day => { const d = new Date(day + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
  const WK = () => weekOf(parisDay());
  const BIG = ["his", "sci", "geo", "spo", "cin", "art", "mus", "ani", "esp", "tec", "mon", "cor"];
  // XP de guilde gagnée par les membres (aucun bonus en jeu : uniquement niveau et cosmétique)
  const XP = {ok:1, mp:10, win:15, tower:2, boss:3};
  const lvlOf = xp => { let L = 1; while (xp >= 500 * L * (L + 1)) L++; return L; };          // 1 000, 3 000, 6 000, 10 000…
  const lvlStart = L => 500 * (L - 1) * L, lvlNext = L => 500 * L * (L + 1);

  /* --- Emblèmes : formes, couleurs, symboles (certains se débloquent avec le niveau de la guilde) --- */
  const SHAPES = [{id:"ecu", n:"Écu", lv:1}, {id:"rond", n:"Rond", lv:1}, {id:"etendard", n:"Étendard", lv:2}, {id:"losange", n:"Losange", lv:3}, {id:"couronne", n:"Couronné", lv:5}, {id:"ailes", n:"Ailé", lv:7}];
  const COLORS = [{id:"violet", a:"#8A5AD8", b:"#3A1E6A", lv:1}, {id:"rose", a:"#FF5FA2", b:"#8A1E5A", lv:1}, {id:"azur", a:"#4A8AE8", b:"#1A3A7A", lv:1}, {id:"emeraude", a:"#2BB673", b:"#0E4A2A", lv:2},
    {id:"rubis", a:"#E2474F", b:"#6A0A1A", lv:3}, {id:"nuit", a:"#3A3A5A", b:"#0E0E1E", lv:4}, {id:"or", a:"#FFD23F", b:"#A8740A", lv:6}, {id:"astral", a:"#C9A2FF", b:"#FF5FA2", lv:8}];
  const ICONS_OK = [{id:"duel", lv:1}, {id:"bulb", lv:1}, {id:"moon", lv:1}, {id:"his", lv:1}, {id:"sci", lv:1}, {id:"myt", lv:2}, {id:"esp", lv:2}, {id:"heart", lv:3}, {id:"tower", lv:4}, {id:"art", lv:4}, {id:"spo", lv:5}, {id:"cap", lv:6}];
  function emblem(e, size, lv){
    e = e || {}; const col = COLORS.find(c => c.id === e.c) || COLORS[0], sh = e.s || "ecu", ic = (typeof ICONS !== "undefined" && ICONS[e.i || "duel"]) || "", D = "#1E1030";
    const path = {ecu:"M50 8 L88 20 V52 Q88 84 50 104 Q12 84 12 52 V20Z", rond:"M50 8 A46 46 0 1 1 49.9 8Z", etendard:"M16 6 H84 V96 L50 80 L16 96Z", losange:"M50 4 L94 54 L50 104 L6 54Z",
      couronne:"M14 34 L26 14 L38 28 L50 8 L62 28 L74 14 L86 34 V58 Q86 88 50 104 Q14 88 14 58Z", ailes:"M50 10 L76 20 V52 Q76 82 50 100 Q24 82 24 52 V20Z"}[sh] || "";
    const wings = sh === "ailes" ? `<path d="M24 34 Q6 30 0 12 Q10 40 24 54Z M76 34 Q94 30 100 12 Q90 40 76 54Z" fill="${col.a}" stroke="${D}" stroke-width="3"/>` : "";
    const glow = (lv || 1) >= 4 ? `<path d="${path}" fill="none" stroke="#FFF6C8" stroke-width="10" opacity=".25" class="gd-glow"/>` : "";
    const g = "gd" + Math.random().toString(36).slice(2, 7);
    return `<svg class="gd-emb" viewBox="-4 0 108 112" width="${size}" height="${size * 112 / 108}" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col.a}"/><stop offset="1" stop-color="${col.b}"/></linearGradient></defs>
      ${wings}${glow}<path d="${path}" transform="translate(0 4)" fill="${D}" opacity=".45"/><path d="${path}" fill="url(#${g})" stroke="${D}" stroke-width="4" stroke-linejoin="round"/>
      <path d="${path}" fill="none" stroke="#FFD23F" stroke-width="2" opacity=".75" transform="translate(50 56) scale(.86) translate(-50 -56)"/>
      <path d="M26 24 Q50 14 74 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>
      <g transform="translate(29 34) scale(1.05)" fill="#FFFFFF" stroke="${D}" stroke-width=".6">${ic}</g></svg>`;
  }

  /* --- État en direct --- */
  let guilds = {}, contrib = {}, unsub = [], listening = false, view = "home", sub = "hq", tab = "general", msg = "", draft = null, pend = {ok:0, mp:0, win:0, tower:0, boss:0, th:{}}, flushT = null;
  const myG = () => Object.keys(guilds).find(id => guilds[id].members && guilds[id].members[uid()]);
  const role = (g, u) => (g && g.members && g.members[u || uid()] && g.members[u || uid()].role) || null;
  const can = (g, what) => { const r = role(g); return r === "chef" || (r === "off" && (what === "apps" || what === "inv")) || (what === "inv" && r === "mem"); };
  function listen(){
    if (!uid() || listening) return; listening = true;
    unsub.push(db().collection("guilds").onSnapshot(s => { guilds = {}; s.forEach(d => guilds[d.id] = d.data()); showInvites(); if (!s.metadata.hasPendingWrites) claim(); refresh(); }, () => {}));
    unsub.push(db().collectionGroup("contrib").onSnapshot(s => { contrib = {}; s.forEach(d => { const g = d.ref.parent.parent.id; (contrib[g] = contrib[g] || {})[d.id] = d.data(); }); if (!s.metadata.hasPendingWrites) claim(); refresh(); }, () => {}));
  }
  const refresh = () => { if (S.tab === "amis" && S.multiView === "guild" && !(typeof Salons !== "undefined" && Salons.active())) { window.__quiet = true; const y = window.scrollY; render(); window.scrollTo(0, y); } };

  /* --- Totaux d'une guilde --- */
  function totals(gid){
    const c = contrib[gid] || {}, wk = WK(), t = {xp:0, ok:0, mp:0, win:0, th:{}, w:{ok:0, mp:0, win:0, tower:0, boss:0, th:{}}, wkBy:{}};
    Object.keys(c).forEach(u => { const a = c[u].all || {}, w = (c[u].w || {})[wk] || {};
      t.xp += a.xp || 0; t.ok += a.ok || 0; t.mp += a.mp || 0; t.win += a.win || 0;
      Object.keys(a.th || {}).forEach(k => t.th[k] = (t.th[k] || 0) + a.th[k]);
      ["ok", "mp", "win", "tower", "boss"].forEach(k => t.w[k] += w[k] || 0); Object.keys(w.th || {}).forEach(k => t.w.th[k] = (t.w.th[k] || 0) + w.th[k]);
      t.wkBy[u] = w; });
    t.xp += (guilds[gid] && guilds[gid].bonus) || 0; t.lvl = lvlOf(t.xp); return t;
  }

  /* --- Objectifs collectifs de la semaine (calculés pour 5 joueurs) --- */
  const OBJ = {
    ok:{n:() => "Répondez juste à 750 questions", goal:750, k:"ok"},
    th:{n:o => `Répondez juste à 250 questions en ${THEMES[o.th].n}`, goal:250, k:"th"},
    mp:{n:() => "Jouez 25 parties multijoueurs", goal:25, k:"mp"},
    win:{n:() => "Remportez 12 parties multijoueurs", goal:12, k:"win"},
    tower:{n:() => "Gravissez 150 étages de la Tour", goal:150, k:"tower"},
    boss:{n:() => "Infligez 60 PV au Boss de la semaine", goal:60, k:"boss"}
  };
  const OBJ_COINS = 150, OBJ_XP = 500, CHEST_COINS = 300, SHARE = .05; // 5 % de l'objectif pour avoir droit aux récompenses
  function objectives(){ const wk = WK(), r = rng(Math.round(new Date(wk + "T12:00:00Z") / 864e5) * 31337 + 1), rest = ["th", "mp", "win", "tower", "boss"];
    const two = []; while (two.length < 2) { const k = rest[Math.floor(r() * rest.length)]; if (!two.includes(k)) two.push(k); }
    const th = BIG[Math.floor(r() * BIG.length)]; return ["ok"].concat(two).map(k => ({k, th:k === "th" ? th : null, key:wk + ":" + k})); }
  const prog = (o, w) => o.k === "th" ? (w.th[o.th] || 0) : (w[o.k] || 0);
  const mine = (o, w) => o.k === "th" ? ((w.th || {})[o.th] || 0) : (w[o.k] || 0);
  // Exploits de guilde (sur toute sa vie) : badges et titres pour les membres
  const FEATS = [{id:"q10k", n:"10 000 bonnes réponses", v:t => t.ok, goal:10000}, {id:"mp100", n:"100 parties multijoueurs", v:t => t.mp, goal:100},
    {id:"win50", n:"50 victoires multijoueurs", v:t => t.win, goal:50}, {id:"sci2k", n:"2 000 bonnes réponses en Sciences", v:t => t.th.sci || 0, goal:2000}];

  /* --- Contributions : on accumule, puis on envoie (petits paquets, au plus toutes les 8 s) --- */
  function ev(type, info){
    if (!uid() || !myG()) return; info = info || {};
    if (type === "ok") { pend.ok++; if (info.th) pend.th[info.th] = (pend.th[info.th] || 0) + 1; }
    else if (type === "mp") { pend.mp++; if (info.win) pend.win++; }
    else if (type === "tower") pend.tower += info.v || 1;
    else if (type === "bossdmg") pend.boss += info.v || 1;
    else return;
    clearTimeout(flushT); flushT = setTimeout(flush, 8000);
  }
  function flush(){
    const gid = myG(); if (!gid || !uid()) return;
    const p = pend; pend = {ok:0, mp:0, win:0, tower:0, boss:0, th:{}};
    if (!p.ok && !p.mp && !p.tower && !p.boss) return;
    const I = n => FV().increment(n), wk = WK(), xp = p.ok * XP.ok + p.mp * XP.mp + p.win * XP.win + p.tower * XP.tower + p.boss * XP.boss;
    const up = {p:(A().users()[uid()] || {}).pseudo || S.profile.name, at:Date.now(), all:{ok:I(p.ok), mp:I(p.mp), win:I(p.win), xp:I(xp), th:{}}, w:{[wk]:{ok:I(p.ok), mp:I(p.mp), win:I(p.win), tower:I(p.tower), boss:I(p.boss), th:{}}}};
    Object.keys(p.th).forEach(k => { up.all.th[k] = I(p.th[k]); up.w[wk].th[k] = I(p.th[k]); });
    db().doc(`guilds/${gid}/contrib/${uid()}`).set(up, {merge:true}).catch(() => { // refusé (réseau) : on remet dans la file
      ["ok", "mp", "win", "tower", "boss"].forEach(k => pend[k] += p[k]); Object.keys(p.th).forEach(k => pend.th[k] = (pend.th[k] || 0) + p.th[k]); });
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });

  /* --- Récompenses (une seule fois chacune, sur ce compte) --- */
  function claim(){
    const gid = myG(); if (!gid || !contrib[gid]) return;
    const g = guilds[gid], t = totals(gid), me = t.wkBy[uid()] || {}, s = st(), lines = [];
    objectives().forEach(o => { const goal = OBJ[o.k].goal, done = prog(o, t.w) >= goal;
      if (!done) return;
      if (!(g.done && g.done[o.key])) db().doc("guilds/" + gid).update({["done." + o.key]:true, bonus:FV().increment(OBJ_XP)}).catch(() => {});
      if (!s.claimed[o.key] && mine(o, me) >= Math.ceil(goal * SHARE)) { s.claimed[o.key] = today(); S.coins += OBJ_COINS; lines.push(`Objectif réussi : ${OBJ[o.k].n(o)} · +${OBJ_COINS} pièces`); } });
    const os = objectives(), ck = WK() + ":coffre";
    if (!s.claimed[ck] && os.every(o => prog(o, t.w) >= OBJ[o.k].goal) && os.some(o => mine(o, me) >= Math.ceil(OBJ[o.k].goal * SHARE))) { s.claimed[ck] = today(); s.chests = (s.chests || 0) + 1; S.coins += CHEST_COINS; lines.push(`Coffre de guilde : +${CHEST_COINS} pièces`); }
    FEATS.forEach(f => { if (f.v(t) >= f.goal && !s.feats[f.id]) { s.feats[f.id] = today(); lines.push(`Exploit de guilde : ${f.n}`); if (f.id === "q10k") { S.titles = S.titles || {}; S.titles.legion = S.titles.legion || today(); } } });
    if (t.lvl >= 5 && !(S.titles && S.titles.gardien)) { S.titles = S.titles || {}; S.titles.gardien = today(); lines.push("Titre débloqué : GARDIEN DE GUILDE"); }
    if (lines.length) { save(); checkBadges(); rewardFx(g, lines); }
  }
  const st = () => { S.guild = S.guild || {}; S.guild.claimed = S.guild.claimed || {}; S.guild.feats = S.guild.feats || {}; return S.guild; };
  function rewardFx(g, lines){
    if (document.querySelector(".gd-fx")) return;
    try { Music.sfx("level"); setTimeout(() => Music.sfx("win"), 500); } catch(e){}
    const el = document.createElement("div"); el.className = "tw-fx tw-cp gd-fx";
    el.innerHTML = `${Array.from({length:30}, () => `<i class="tw-coin" style="left:${Math.random()*100}%;animation-delay:${(Math.random()*1.2).toFixed(2)}s"></i>`).join("")}<div class="tw-cp-card"><div class="gd-fx-emb">${emblem(g.emb, 110, totals(myG()).lvl)}</div><span class="tw-kicker">${esc(g.name)}</span><b class="tw-cp-title">Récompenses de guilde</b>${lines.map(l => `<span class="tw-cp-sub">${esc(l)}</span>`).join("")}<button class="btn">Pour la guilde !</button></div>`;
    el.querySelector("button").onclick = () => { el.remove(); render(); flushLevelUp(); };
    document.body.appendChild(el);
  }

  /* --- Actions --- */
  const okName = n => /^[\p{L}\p{N} '’-]{3,20}$/u.test(n.trim());
  async function create(){
    const n = draft.name.trim(), nl = n.toLowerCase();
    if (!okName(n)) throw "Le nom doit faire de 3 à 20 lettres ou chiffres.";
    if (myG()) throw "Tu es déjà dans une guilde.";
    const ref = db().collection("guilds").doc();
    await db().runTransaction(async tx => { const r = db().doc("guildNames/" + nl), s = await tx.get(r); if (s.exists) throw "Ce nom de guilde est déjà pris.";
      tx.set(r, {uid:uid(), g:ref.id});
      tx.set(ref, {name:n, nameL:nl, emb:draft.emb, desc:(draft.desc || "").slice(0, 140), created:Date.now(), leader:uid(), members:{[uid()]:{role:"chef", j:Date.now()}}, apps:{}, inv:[], done:{}, bonus:0}); });
    await db().doc(`guilds/${ref.id}/contrib/${uid()}`).set({p:S.profile.name, at:Date.now(), all:{ok:0, mp:0, win:0, xp:0, th:{}}, w:{}});
    draft = null; sub = "hq"; view = "home";
  }
  const G = id => db().doc("guilds/" + id);
  async function apply(id){ if (myG()) throw "Quitte d'abord ta guilde actuelle."; const g = guilds[id]; if (Object.keys(g.members).length >= MAX) throw "Cette guilde est complète (5 membres).";
    await G(id).update({["apps." + uid()]: {at:Date.now(), p:S.profile.name}}); msg = "Candidature envoyée ! Le chef ou un officier va te répondre."; }
  async function accept(id, u){ const g = guilds[id]; if (Object.keys(g.members).length >= MAX) throw "La guilde est complète (5 membres).";
    await G(id).update({["members." + u]:{role:"mem", j:Date.now()}, ["apps." + u]:FV().delete()}); }
  const refuse = (id, u) => G(id).update({["apps." + u]:FV().delete()});
  const invite = (id, u) => G(id).update({inv:FV().arrayUnion(u)});
  async function joinInvite(id){ if (myG()) throw "Quitte d'abord ta guilde actuelle."; const g = guilds[id]; if (Object.keys(g.members).length >= MAX) throw "Cette guilde est complète.";
    await G(id).update({["members." + uid()]:{role:"mem", j:Date.now()}, inv:FV().arrayRemove(uid())}); }
  async function leave(){ const id = myG(), g = guilds[id]; if (!id) return; flush();
    const others = Object.keys(g.members).filter(u => u !== uid());
    if (!others.length) { await db().doc(`guilds/${id}/contrib/${uid()}`).delete().catch(() => {}); await G(id).delete(); await db().doc("guildNames/" + g.nameL).delete().catch(() => {}); return; }
    const up = {["members." + uid()]:FV().delete()};
    if (g.leader === uid()) { const next = others.find(u => g.members[u].role === "off") || others.sort((a, b) => g.members[a].j - g.members[b].j)[0]; up.leader = next; up["members." + next] = Object.assign({}, g.members[next], {role:"chef"}); }
    await G(id).update(up); }
  const kick = (id, u) => G(id).update({["members." + u]:FV().delete()});
  const promote = (id, u, r) => G(id).update({["members." + u + ".role"]: r});
  async function transfer(id, u){ await G(id).update({leader:u, ["members." + u + ".role"]:"chef", ["members." + uid() + ".role"]:"off"}); }
  const saveInfo = (id, emb, desc) => G(id).update({emb, desc:(desc || "").slice(0, 140)});

  /* --- Invitations reçues --- */
  let shownInv = {};
  function showInvites(){
    if (!uid() || myG()) return;
    Object.keys(guilds).forEach(id => { const g = guilds[id]; if (!(g.inv || []).includes(uid()) || shownInv[id]) return; shownInv[id] = 1;
      const el = document.createElement("div"); el.className = "am-inv"; el.setAttribute("role", "alertdialog");
      el.innerHTML = `<button class="am-x" aria-label="Fermer">×</button><div class="row" style="gap:10px;align-items:center;flex-wrap:nowrap">${emblem(g.emb, 44)}<div class="stack" style="gap:2px;min-width:0"><b>Invitation dans la guilde ${esc(g.name)}</b><span>${Object.keys(g.members).length}/${MAX} membres</span></div></div><div class="row"><button class="btn small" data-go>Rejoindre</button><button class="btn small ghost" data-x>Plus tard</button></div>`;
      el.querySelector("[data-go]").onclick = async () => { el.remove(); try { await joinInvite(id); S.tab = "amis"; S.multiView = "guild"; save(); render(); } catch(e){ toasts.push(typeof e === "string" ? e : "Impossible de rejoindre la guilde."); render(); } };
      el.querySelectorAll(".am-x,[data-x]").forEach(b => b.onclick = () => el.remove());
      document.body.appendChild(el); setTimeout(() => el.remove(), 60000); });
  }

  /* --- Affichage --- */
  const roleN = {chef:"Chef de guilde", off:"Bras droit", mem:"Membre"};
  const online = u => A().online(u) || u === uid();
  function rankRows(by){
    const rows = Object.keys(guilds).map(id => { const t = totals(id); return {id, g:guilds[id], t, n:Object.keys(guilds[id].members || {}).length}; });
    const key = {general:r => r.t.xp, actives:r => r.t.w.ok + r.t.w.mp * 10, victoires:r => r.t.win, questions:r => r.t.ok}[by];
    return rows.sort((a, b) => key(b) - key(a));
  }

  /* --- La taverne de la guilde : une petite salle, une table ronde et 5 tabourets --- */
  const STOOL = `<svg viewBox="0 0 60 44" class="gd-stool" aria-hidden="true"><path d="M14 12 L8 42 M46 12 L52 42 M30 14 V42" stroke="#2E1A0C" stroke-width="5" stroke-linecap="round"/><path d="M14 12 L8 42 M46 12 L52 42 M30 14 V42" stroke="#8A5428" stroke-width="2.6" stroke-linecap="round"/><path d="M12 30 H48" stroke="#2E1A0C" stroke-width="3"/><ellipse cx="30" cy="12" rx="24" ry="8" fill="#6A3C1A" stroke="#2E1A0C" stroke-width="2.5"/><ellipse cx="30" cy="10" rx="21" ry="5.5" fill="#A8642C"/><path d="M16 9 Q30 5 44 9" stroke="#E0A060" stroke-width="1.6" fill="none" opacity=".7"/></svg>`;
  function tavernBG(g, L){
    const col = COLORS.find(c => c.id === (g && g.emb && g.emb.c)) || COLORS[0];
    const planks = Array.from({length:12}, (_, i) => `<rect x="${i * 30}" y="0" width="30" height="150" fill="${i % 2 ? "#5A3418" : "#66391B"}"/><path d="M${i * 30} 14V150" stroke="#2E1A0C" stroke-width="2"/><circle cx="${i * 30 + 6}" cy="22" r="1.4" fill="#2E1A0C"/><circle cx="${i * 30 + 6}" cy="112" r="1.4" fill="#2E1A0C"/>`).join("");
    const floor = Array.from({length:11}, (_, i) => `<path d="M${180 + (i - 5) * 26} 150 L${180 + (i - 5) * 80} 270" stroke="#2E1A0C" stroke-width="1.6" opacity=".55"/>`).join("");
    const bottles = [["#2BB673", 276], ["#8A5AD8", 290], ["#E2474F", 304], ["#4A8AE8", 330]].map(([c, x], i) => `<rect x="${x}" y="${i % 2 ? 60 : 56}" width="9" height="${i % 2 ? 18 : 22}" rx="3" fill="${c}" stroke="#1E1030" stroke-width="1.5"/><rect x="${x + 2.5}" y="${i % 2 ? 54 : 50}" width="4" height="7" fill="${c}" stroke="#1E1030" stroke-width="1.2"/>`).join("");
    const pennant = x => `<path d="M${x - 14} 14 H${x + 14} V64 L${x} 54 L${x - 14} 64Z" fill="${col.a}" stroke="#1E1030" stroke-width="2.4"/><path d="M${x - 14} 22 H${x + 14}" stroke="#FFD23F" stroke-width="2"/><circle cx="${x}" cy="38" r="5" fill="#FFD23F" stroke="#1E1030" stroke-width="1.6"/>`;
    const torch = x => `<path d="M${x - 4} 96 L${x + 4} 96 L${x + 2} 76 L${x - 2} 76Z" fill="#3A2410" stroke="#1E1030" stroke-width="1.8"/><path d="M${x - 7} 76 H${x + 7}" stroke="#8A8A9A" stroke-width="3"/><circle cx="${x}" cy="66" r="22" fill="url(#gdGlow)" class="gd-flick"/><path d="M${x} 52 Q${x + 9} 66 ${x + 4} 74 Q${x} 78 ${x - 4} 74 Q${x - 9} 66 ${x} 52Z" fill="#FF9A2A" class="gd-flame"/><path d="M${x} 60 Q${x + 4} 68 ${x + 2} 72 Q${x} 74 ${x - 2} 72 Q${x - 4} 68 ${x} 60Z" fill="#FFE58A" class="gd-flame"/>`;
    return `<svg class="gd-bg" viewBox="0 0 360 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
      <radialGradient id="gdGlow"><stop offset="0" stop-color="#FFC861" stop-opacity=".75"/><stop offset="1" stop-color="#FFC861" stop-opacity="0"/></radialGradient>
      <radialGradient id="gdWarm" cx=".5" cy=".62" r=".75"><stop offset="0" stop-color="#FFB054" stop-opacity=".28"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0A0408" stop-opacity=".7"/></radialGradient>
      <linearGradient id="gdFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A3418"/><stop offset="1" stop-color="#2E1A0C"/></linearGradient></defs>
      ${planks}<rect width="360" height="16" fill="#3A2010"/><rect y="118" width="360" height="10" fill="#3A2010"/><rect y="128" width="360" height="22" fill="#4A2A12"/>
      <g><path d="M22 100 V46 Q52 18 82 46 V100Z" fill="#FFD98A" stroke="#2E1A0C" stroke-width="4"/><path d="M52 26 V100 M22 64 H82" stroke="#2E1A0C" stroke-width="3"/><path d="M26 98 V48 Q38 34 50 30" stroke="#FFF2C8" stroke-width="3" fill="none" opacity=".6"/>
        <path d="M22 100 L82 100 L150 270 L-30 270Z" fill="#FFD98A" opacity=".07"/></g>
      <g><rect x="268" y="78" width="80" height="6" fill="#3A2010" stroke="#1E1030" stroke-width="1.5"/><rect x="268" y="40" width="80" height="6" fill="#3A2010" stroke="#1E1030" stroke-width="1.5"/>${bottles}
        <path d="M278 40 v-12 h12 v12 M300 40 v-16 h10 v16" fill="#C8A060" stroke="#1E1030" stroke-width="1.5"/>
        ${L >= 4 ? `<path d="M318 24 h18 v6 q0 8 -9 9 q-9 -1 -9 -9z M324 39 h6 v-1 M322 40 h10" fill="#FFD23F" stroke="#1E1030" stroke-width="1.6"/>` : `<rect x="318" y="26" width="18" height="14" rx="2" fill="#7A4A22" stroke="#1E1030" stroke-width="1.5"/>`}</g>
      ${L >= 2 ? pennant(110) + pennant(250) : ""}
      ${L >= 3 ? torch(128) + torch(232) : ""}
      <path d="M180 0 V18 M150 0 L162 20 M210 0 L198 20" stroke="#2E1A0C" stroke-width="2.4"/>
      ${L >= 6 ? `<circle cx="180" cy="22" r="60" fill="url(#gdGlow)" class="gd-flick"/>` : ""}
      <rect y="150" width="360" height="120" fill="url(#gdFloor)"/>${floor}
      <ellipse cx="180" cy="210" rx="160" ry="46" fill="${col.b}" opacity=".85" stroke="${col.a}" stroke-width="4"/><ellipse cx="180" cy="210" rx="140" ry="36" fill="none" stroke="#FFD23F" stroke-width="1.6" stroke-dasharray="6 5" opacity=".6"/>
      <rect width="360" height="270" fill="url(#gdWarm)"/></svg>`;
  }
  const TABLE = `<svg class="gd-table" viewBox="0 0 360 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="gdTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8743A"/><stop offset="1" stop-color="#7A4420"/></linearGradient></defs>
      <ellipse cx="180" cy="236" rx="70" ry="10" fill="#000" opacity=".35"/><path d="M168 190 h24 l6 42 h-36z" fill="#4A2A12" stroke="#1E1030" stroke-width="2.5"/><ellipse cx="180" cy="234" rx="30" ry="7" fill="#3A2010" stroke="#1E1030" stroke-width="2.5"/>
      <ellipse cx="180" cy="188" rx="106" ry="31" fill="#4A2A12" stroke="#1E1030" stroke-width="3"/><ellipse cx="180" cy="180" rx="106" ry="30" fill="url(#gdTop)" stroke="#1E1030" stroke-width="3"/>
      <ellipse cx="180" cy="180" rx="92" ry="23" fill="none" stroke="#5A3418" stroke-width="2" opacity=".7"/><path d="M110 172 Q180 158 250 172" stroke="#E0A060" stroke-width="2" fill="none" opacity=".5"/>
      <circle cx="180" cy="160" r="40" fill="url(#gdGlow)" class="gd-flick"/>
      <path d="M150 178 l26 -6 l18 8 l-26 6z" fill="#F3E3C0" stroke="#5A3418" stroke-width="1.5"/><path d="M158 178 l16 -3 M162 181 l14 -3" stroke="#A8642C" stroke-width="1.2"/>
      <rect x="176" y="156" width="8" height="18" rx="2" fill="#FFF6DE" stroke="#1E1030" stroke-width="1.5"/><path d="M180 146 Q185 152 182 156 Q180 158 178 156 Q175 152 180 146Z" fill="#FFB33A" class="gd-flame"/>
      <g stroke="#1E1030" stroke-width="1.8"><rect x="120" y="166" width="14" height="16" rx="3" fill="#C8A060"/><path d="M134 170 q6 0 6 5 q0 5 -6 5" fill="none"/><ellipse cx="127" cy="166" rx="7" ry="2.5" fill="#FFF6DE"/>
        <rect x="226" y="168" width="14" height="16" rx="3" fill="#C8A060"/><path d="M226 172 q-6 0 -6 5 q0 5 6 5" fill="none"/><ellipse cx="233" cy="168" rx="7" ry="2.5" fill="#FFF6DE"/></g>
      <g fill="#FFD23F" stroke="#8A5A00" stroke-width="1.2"><ellipse cx="206" cy="186" rx="6" ry="2.4"/><ellipse cx="207" cy="183" rx="6" ry="2.4"/><ellipse cx="214" cy="188" rx="6" ry="2.4"/></g></svg>`;
  // Places : le chef au fond au centre, puis les côtés, puis les deux tabourets de devant
  const SEATS = [{x:50, y:60, w:19}, {x:25, y:65, w:19}, {x:75, y:65, w:19}, {x:15, y:97, w:22, f:1}, {x:85, y:97, w:22, f:1}];
  function tavern(g, members, L, invOk){
    const seats = SEATS.map((p, i) => { const u = members[i], st = `left:${p.x}%;top:${p.y}%;width:${p.w}%`;
      if (!u) return `<div class="gd-seat gd-freeseat ${p.f ? "front" : ""}" style="${st}">${invOk ? `<button class="gd-free" data-gd="sub" data-v="members" aria-label="Place libre : inviter un ami">+</button>` : ""}${STOOL}<span class="gd-plate">Place libre</span></div>`;
      const on = online(u), r = g.members[u].role;
      return `<div class="gd-seat ${p.f ? "front" : ""} ${on ? "on" : "off"}" style="${st};--d:${(i * .37).toFixed(2)}s"><span class="gd-plate">${r === "chef" ? `<i class="gd-crown">♛</i>` : r === "off" ? `<i class="gd-crown off">◆</i>` : ""}${esc(A().pseudoOf(u))}</span>
        <div class="gd-who">${A().avatar(u, 70)}${on ? "" : `<span class="gd-zz">z<small>z</small></span>`}</div>${STOOL}</div>`; });
    const back = seats.slice(0, 3).join(""), front = seats.slice(3).join("");
    return `<div class="gd-tav">${tavernBG(g, L)}<div class="gd-wallemb">${emblem(g && g.emb, 64, L)}</div>${back}${TABLE}${front}</div>`;
  }
  function hq(id){
    const g = guilds[id], t = totals(id), L = t.lvl, me = t.wkBy[uid()] || {}, ord = {chef:0, off:1, mem:2}, mem = Object.keys(g.members).sort((a, b) => ord[g.members[a].role] - ord[g.members[b].role] || g.members[a].j - g.members[b].j);
    const rank = rankRows("general").findIndex(r => r.id === id) + 1, pct = Math.round((t.xp - lvlStart(L)) / (lvlNext(L) - lvlStart(L)) * 100);
    const nOn = mem.filter(online).length;
    const objs = objectives().map(o => { const goal = OBJ[o.k].goal, p = Math.min(goal, prog(o, t.w)), my = mine(o, me), ok = p >= goal, elig = my >= Math.ceil(goal * SHARE);
      return `<div class="gd-obj ${ok ? "done" : ""}"><div class="row between" style="gap:8px;flex-wrap:nowrap"><b>${esc(OBJ[o.k].n(o))}</b>${ok ? `<span class="qs-ok">✓</span>` : `<span class="qs-coin">${coinIco}${OBJ_COINS}</span>`}</div>
        <div class="gd-bar"><i style="width:${p / goal * 100}%"></i><span>${p.toLocaleString("fr-FR")} / ${goal.toLocaleString("fr-FR")}</span></div>
        <span class="gd-mine">Ta part : ${my} ${elig ? "· récompense assurée ✓" : `· encore ${Math.ceil(goal * SHARE) - my} pour avoir droit à la récompense`}</span></div>`; }).join("");
    const allOk = objectives().every(o => prog(o, t.w) >= OBJ[o.k].goal);
    const body = sub === "members" ? membersView(id) : sub === "rank" ? rankView() : sub === "info" ? infoView(id) :
      `<div class="gd-sec"><b>Objectifs de la semaine</b><span>renouvelés lundi · prévus pour 5 joueurs</span></div>${objs}
       <div class="gd-chest ${allOk ? "ready" : ""}">${typeof Quetes !== "undefined" && Quetes.chestSVG ? Quetes.chestSVG("w", allOk ? "ready" : "locked", 54) : ""}<div class="stack" style="gap:2px"><b>Coffre de guilde</b><span>Les 3 objectifs atteints : +${CHEST_COINS} pièces pour chaque membre qui a participé (au moins 5 % d'un objectif).</span></div></div>
       <div class="gd-sec"><b>Exploits de la guilde</b><span>un badge pour chaque membre</span></div>
       ${FEATS.map(f => { const v = Math.min(f.goal, f.v(t)); return `<div class="gd-feat ${v >= f.goal ? "done" : ""}"><span>${esc(f.n)}</span><div class="gd-bar sm"><i style="width:${v / f.goal * 100}%"></i></div><b>${v.toLocaleString("fr-FR")}</b></div>`; }).join("")}
       <p class="gd-note">Niveau 5 : titre ${titleTag("gardien", "xs")} · 10 000 bonnes réponses : titre ${titleTag("legion", "xs")}</p>`;
    return `<section class="gd-hq">
      ${tavern(g, mem, L, can(g, "inv") && mem.length < MAX)}
      <div class="gd-plaque"><h1>${esc(g.name)}</h1>
        <div class="gd-stats"><span class="gd-lv">Niv. ${L}</span><div class="gd-xp"><i style="width:${pct}%"></i><span>${t.xp.toLocaleString("fr-FR")} / ${lvlNext(L).toLocaleString("fr-FR")} XP</span></div></div>
        <div class="gd-meta"><span>${gIcon("trophy", 20)} ${rank ? "#" + rank : "–"}</span><span>${gIcon("user", 20)} ${mem.length}/${MAX}</span><span><i class="st-dot on"></i> ${nOn} en ligne</span></div>
        ${g.desc ? `<p class="gd-desc">« ${esc(g.desc)} »</p>` : ""}</div>
      <div class="gd-tabs">${[["obj", "Objectifs"], ["members", "Membres"], ["rank", "Classement"], ["info", "Infos"]].map(([k, n]) => `<button class="${(sub === k || (k === "obj" && sub === "hq")) ? "on" : ""}" data-gd="sub" data-v="${k}">${n}</button>`).join("")}</div>
      <div class="gd-parch">${body}</div>
    </section>`;
  }
  function membersView(id){
    const g = guilds[id], t = totals(id), r = role(g), ord = {chef:0, off:1, mem:2}, mem = Object.keys(g.members).sort((a, b) => ord[g.members[a].role] - ord[g.members[b].role] || g.members[a].j - g.members[b].j);
    const friends = Object.keys(A().users()).filter(u => !mem.includes(u) && !Object.keys(guilds).some(x => guilds[x].members[u]));
    const apps = Object.keys(g.apps || {});
    return `<div class="card stack">${mem.map(u => { const m = g.members[u], c = (contrib[id] || {})[u] || {}, w = t.wkBy[u] || {};
        return `<div class="am-row">${A().avatar(u, 40)}<div class="stack grow" style="gap:1px"><b>${esc(A().pseudoOf(u))} ${A().title(u, "xs")}</b><span class="muted" style="font-size:12.5px">${roleN[m.role]} · cette semaine : ${w.ok || 0} réponses, ${w.mp || 0} parties · ${(c.all && c.all.xp) || 0} XP</span>
          ${r === "chef" && u !== uid() ? `<div class="row" style="gap:6px;margin-top:4px">${m.role === "mem" ? `<button class="chip-btn" data-gd="promote" data-v="${u}">Nommer bras droit</button>` : `<button class="chip-btn" data-gd="demote" data-v="${u}">Retirer bras droit</button>`}<button class="chip-btn" data-gd="transfer" data-v="${u}">Donner la tête</button><button class="chip-btn" data-gd="kick" data-v="${u}">Exclure</button></div>` : ""}</div>
          <i class="st-dot ${online(u) ? "on" : "off"}"></i></div>`; }).join("")}</div>
      ${apps.length && can(g, "apps") ? `<div class="card stack"><b>Candidatures</b>${apps.map(u => `<div class="am-row">${A().avatar(u, 36)}<b class="grow">${esc(A().pseudoOf(u))}</b><button class="chip-btn" data-gd="accept" data-v="${u}">Accepter</button><button class="chip-btn" data-gd="refuse" data-v="${u}">Refuser</button></div>`).join("")}</div>` : ""}
      ${can(g, "inv") && mem.length < MAX ? `<div class="card stack"><b>Inviter des amis</b>${friends.length ? friends.map(u => `<div class="am-row">${A().avatar(u, 36)}<b class="grow">${esc(A().pseudoOf(u))}</b><button class="chip-btn" data-gd="invite" data-v="${u}" ${(g.inv || []).includes(u) ? "disabled" : ""}>${(g.inv || []).includes(u) ? "Invité" : "Inviter"}</button></div>`).join("") : `<p class="muted" style="margin:0">Tous tes amis sont déjà dans une guilde.</p>`}</div>` : ""}`;
  }
  function rankView(){
    const R = rankRows(tab), lab = {general:"Général", actives:"Plus actives", victoires:"Victoires", questions:"Questions"};
    const val = r => tab === "general" ? `${r.t.xp.toLocaleString("fr-FR")} XP` : tab === "actives" ? `${r.t.w.ok} rép. cette semaine` : tab === "victoires" ? `${r.t.win} victoires` : `${r.t.ok.toLocaleString("fr-FR")} réponses`;
    return `<div class="card stack"><div class="am-tabs">${Object.keys(lab).map(k => `<button class="chip-btn ${tab === k ? "on" : ""}" data-gd="tab" data-v="${k}">${lab[k]}</button>`).join("")}</div>
      ${R.length ? R.map((r, i) => `<div class="gd-rk ${r.id === myG() ? "me" : ""}"><span class="am-pos ${i < 3 ? "gold" : ""}">${i + 1}</span>${emblem(r.g.emb, 44, r.t.lvl)}<div class="stack grow" style="gap:1px;min-width:0"><b>${esc(r.g.name)}</b><span class="muted" style="font-size:12.5px">Niveau ${r.t.lvl} · ${r.n}/${MAX} membres</span></div><b class="am-pts">${val(r)}</b>
        ${!myG() && r.n < MAX ? `<button class="chip-btn" data-gd="apply" data-v="${r.id}" ${(r.g.apps || {})[uid()] ? "disabled" : ""}>${(r.g.apps || {})[uid()] ? "Demandé" : "Rejoindre"}</button>` : ""}</div>`).join("") : `<p class="muted" style="margin:0">Aucune guilde pour l'instant. Crée la première !</p>`}</div>`;
  }
  function picker(emb, L){
    const pick = (arr, k, label, show) => `<div class="label">${label}</div><div class="gd-pick">${arr.map(x => `<button class="gd-opt ${emb[k] === x.id ? "on" : ""}" data-gd="emb" data-k="${k}" data-v="${x.id}" ${x.lv > L ? "disabled" : ""} title="${x.lv > L ? "Niveau " + x.lv : ""}">${show(x)}${x.lv > L ? `<span class="gd-lock">niv. ${x.lv}</span>` : ""}</button>`).join("")}</div>`;
    return pick(SHAPES, "s", "Forme", x => emblem(Object.assign({}, emb, {s:x.id}), 44)) + pick(COLORS, "c", "Couleurs", x => `<span class="gd-col" style="background:linear-gradient(${x.a},${x.b})"></span>`) + pick(ICONS_OK, "i", "Symbole", x => emblem(Object.assign({}, emb, {i:x.id}), 44));
  }
  function infoView(id){
    const g = guilds[id], t = totals(id), r = role(g); if (!draft) draft = {emb:Object.assign({}, g.emb), desc:g.desc || ""};
    const d = new Date(g.created);
    return `<div class="card stack"><b>Informations</b><span class="muted">Créée le ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()} · ${Object.keys(g.members).length}/${MAX} membres · niveau ${t.lvl}</span>
      <span class="muted" style="font-size:13px">Le niveau débloque de nouvelles formes, couleurs et symboles, des décorations du QG (bannières au niveau 2, torches au 3, aura au 6) et le titre GARDIEN DE GUILDE au niveau 5. Aucun avantage dans les quiz.</span></div>
      ${r === "chef" ? `<div class="card stack"><b>Emblème et description</b><div style="display:grid;place-items:center">${emblem(draft.emb, 110, t.lvl)}</div>${picker(draft.emb, t.lvl)}
        <div class="label">Description</div><textarea id="gd-desc" maxlength="140" class="gd-ta">${esc(draft.desc)}</textarea><button class="btn" data-gd="saveinfo">Enregistrer</button></div>` : ""}
      <button class="btn ghost" data-gd="leave">${r === "chef" && Object.keys(g.members).length > 1 ? "Quitter la guilde (la tête passe à un autre membre)" : "Quitter la guilde"}</button>`;
  }
  function noGuild(){
    if (draft && draft.creating) return `<section class="stack"><div class="row between"><button class="quit" data-gd="cancel">← Retour</button><span class="label">Nouvelle guilde</span></div>
      <div class="gd-hq">${tavern({emb:draft.emb, members:{[uid()]:{role:"chef"}}}, [uid()], 1, false)}<div class="gd-plaque"><h1>${esc(draft.name || "Ta guilde")}</h1></div></div>
      <div class="card stack"><div class="label">Nom (unique, 3 à 20 caractères)</div><input id="gd-name" class="gd-in" maxlength="20" value="${esc(draft.name || "")}" autocomplete="off">
        <div class="label">Description</div><textarea id="gd-desc" maxlength="140" class="gd-ta">${esc(draft.desc || "")}</textarea>${picker(draft.emb, 1)}
        ${msg ? `<p class="am-err">${esc(msg)}</p>` : ""}<button class="btn" data-gd="create">Fonder la guilde</button></div></section>`;
    const invs = Object.keys(guilds).filter(id => (guilds[id].inv || []).includes(uid()));
    return `<section class="stack gd-hq">${tavern({emb:{s:"ecu", c:"rubis", i:"duel"}, members:{}}, [], 1, false)}<div class="gd-plaque"><h1>Guildes</h1><p class="gd-desc">Une petite taverne pour 5 amis au plus : faites progresser votre guilde ensemble et ouvrez des coffres chaque semaine.</p></div>
      ${msg ? `<p class="am-err">${esc(msg)}</p>` : ""}
      ${invs.length ? `<div class="card stack"><b>Invitations</b>${invs.map(id => `<div class="gd-rk">${emblem(guilds[id].emb, 40)}<b class="grow">${esc(guilds[id].name)}</b><button class="chip-btn" data-gd="join" data-v="${id}">Rejoindre</button></div>`).join("")}</div>` : ""}
      <button class="btn" data-gd="new">Fonder une guilde</button>
      <div class="label">Rejoindre une guilde</div><div class="gd-parch">${rankView()}</div></section>`;
  }
  function viewAll(){
    listen();
    const id = myG(), back = `<div class="row between"><button class="quit" data-gd="back">← Multi</button><span class="label">Guildes</span></div>`;
    return back + (id ? hq(id) : noGuild());
  }

  /* --- Clics --- */
  async function click(b){
    const a = b.dataset.gd, v = b.dataset.v, id = myG(); msg = "";
    const n = document.getElementById("gd-name"), dsc = document.getElementById("gd-desc"); if (draft) { if (n) draft.name = n.value; if (dsc) draft.desc = dsc.value; }
    try {
      if (a === "back") { S.multiView = "home"; draft = null; save(); }
      else if (a === "sub") { sub = v; draft = null; }
      else if (a === "tab") tab = v;
      else if (a === "new") draft = {creating:true, name:"", desc:"", emb:{s:"ecu", c:"violet", i:"duel"}};
      else if (a === "cancel") draft = null;
      else if (a === "emb") draft.emb[b.dataset.k] = v;
      else if (a === "create") await create();
      else if (a === "apply") await apply(v);
      else if (a === "join") await joinInvite(v);
      else if (a === "accept") await accept(id, v);
      else if (a === "refuse") await refuse(id, v);
      else if (a === "invite") await invite(id, v);
      else if (a === "kick") await kick(id, v);
      else if (a === "promote") await promote(id, v, "off");
      else if (a === "demote") await promote(id, v, "mem");
      else if (a === "transfer") await transfer(id, v);
      else if (a === "saveinfo") { await saveInfo(id, draft.emb, draft.desc); draft = null; msg = ""; }
      else if (a === "leave") { await leave(); sub = "hq"; }
    } catch(e){ msg = typeof e === "string" ? e : "Action impossible pour le moment. Vérifie ta connexion."; if (id) toasts.push(esc(msg)); }
    render();
  }
  return {view:viewAll, click, listen, ev, emblem, invites:() => uid() && !myG() ? Object.keys(guilds).filter(id => (guilds[id].inv || []).includes(uid())).length : 0, mine:() => { const id = myG(); return id ? {id, g:guilds[id], t:totals(id)} : null; }, _flush:flush};
})();

/* --- Badges des guildes (exploits collectifs) --- */
[["gdq","diamant","q10k","Légion du savoir","Ta guilde atteint 10 000 bonnes réponses",300],
 ["gdmp","or","mp100","Arène vivante","Ta guilde joue 100 parties multijoueurs",150],
 ["gdwin","platine","win50","Conquérants","Ta guilde remporte 50 parties multijoueurs",200],
 ["gdsci","or","sci2k","Académie des sciences","Ta guilde atteint 2 000 bonnes réponses en Sciences",150],
 ["gdbox","argent","chest","Esprit d'équipe","Ouvrir un coffre de guilde",60]
].forEach(([id, tier, f, name, desc, coins]) => BADGES.push({id, g:"En ligne", tier, icon:"duel", name, desc, coins, goal:1, cur:() => f === "chest" ? ((S.guild && S.guild.chests) || 0) : (S.guild && S.guild.feats && S.guild.feats[f] ? 1 : 0)}));
