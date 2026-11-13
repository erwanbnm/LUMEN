/* ---------- Potions à raretés et calendrier de connexion de 14 jours (novembre 2026) ----------
   Potions : Double XP et Double pièces, en trois raretés (commune 30 min, rare 1 h, épique 2 h ; toujours ×2).
   Table unique : EV_DATA.POT et EV_DATA.REW (evenements_data.js), lue aussi par le serveur.
   Sac : jusqu'à 20 potions par case ; elles ne périment jamais, le temps ne compte qu'une fois activée. Activer ajoute
   la durée à l'effet en cours (3 h d'avance au plus) ; Double XP et Double pièces peuvent tourner en même temps.
   L'effet ne touche que les gains des bonnes réponses (pas les coffres, badges ni paliers) et jamais les scores
   de duel, de salon ou de classement (ils comptent les bonnes réponses, pas l'XP).
   Avec un compte : sac et effets gardés par le serveur (inv/{uid}) ; sans compte : sur l'appareil (S.pot, S.boost).
   Récompenses : Potions.reward(source, palier) ; les paliers permanents (Tour, Atlas, Aventure, badges, maîtrise) sont
   vérifiés par Potions.tick, ce qui donne aussi les paliers déjà dépassés avant la mise à jour.
   Calendrier : une case par jour de connexion, à récupérer avec le bouton. Les jours manqués ne se rattrapent pas :
   on reprend simplement à la case suivante. Après le jour 14, on recommence au jour 1.
   La date vient du serveur Firebase (heure du serveur, pas celle du téléphone) ; la règle Firestore « logins »
   refuse une 2e récupération le même jour. Le jour change à minuit (heure d'hiver de Paris ; 1 h en été). */
/* Flacons des potions : 2 effets × 3 raretés (commune : fiole et liège ; rare : cristal et argent ; épique : or, ailes, couronne) */
const PotArt = (() => {
  const TD = "#2B1D3A";
  let U = 0; const uid = () => "po" + (U++);
  const LIQ = {xp:{c:["#E2C8FF", "#A070FF", "#5A2AC8"], glow:"#C9A2FF", t:"XP"}, coin:{c:["#FFF3A8", "#FFC83A", "#D88A0A"], glow:"#FFD23F", t:"×2"}};
  const RAR = {c:{n:"Commune", col:"#9FB4D8", dur:"30 min"}, r:{n:"Rare", col:"#4AA8FF", dur:"1 h"}, e:{n:"Épique", col:"#FF5FD2", dur:"2 h"}};
  const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`;
  const rg = (id, c, o = 0) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="${o}"/></radialGradient>`;
  const spark = (x, y, r, d, c = "#fff") => `<path class="po-spark" style="animation-delay:-${d}s" d="M${x} ${y - r} L${x + r * .25} ${y - r * .25} L${x + r} ${y} L${x + r * .25} ${y + r * .25} L${x} ${y + r} L${x - r * .25} ${y + r * .25} L${x - r} ${y} L${x - r * .25} ${y - r * .25}Z" fill="${c}"/>`;
  // Objet relief : copie sombre décalée + forme
  const relief = (d, fill, dy = 3, w = 3) => `<path d="${d}" fill="${TD}" transform="translate(0 ${dy})"/><path d="${d}" fill="${fill}" stroke="${TD}" stroke-width="${w}" stroke-linejoin="round"/>`;

  /* --- Commune : fiole ronde, bouchon de liège --- */
  function common(k){
    const L = LIQ[k], g = uid(), gl = uid(), cork = uid();
    const body = "M42 30 V44 Q20 52 20 74 Q20 104 50 104 Q80 104 80 74 Q80 52 58 44 V30Z";
    return `<defs>${lg(g, [[0, L.c[0]], [.5, L.c[1]], [1, L.c[2]]])}${lg(gl, [[0, "#FFFFFF", .55], [1, "#DDEBFF", .25]])}${lg(cork, [[0, "#E8B87A"], [1, "#A8703A"]])}</defs>
      ${relief(body, `url(#${gl})`, 4, 3.2)}
      <path d="M23 70 Q50 60 77 70 Q79 101 50 101 Q21 101 23 70Z" fill="url(#${g})"/>
      <path d="M26 74 Q50 66 74 74" stroke="#fff" stroke-width="2.4" fill="none" opacity=".55"/>
      <circle cx="60" cy="86" r="3" fill="#fff" opacity=".6" class="po-bub"/><circle cx="44" cy="92" r="2" fill="#fff" opacity=".5" class="po-bub" style="animation-delay:-1.2s"/>
      ${relief("M39 18 H61 V32 H39Z", `url(#${cork})`, 3, 2.8)}<path d="M43 22 H57" stroke="#fff" stroke-width="2" opacity=".4"/>
      <path d="M28 64 Q24 76 28 88" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
      <text x="50" y="91" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="900" font-size="17" fill="#fff" stroke="${TD}" stroke-width="4" paint-order="stroke">${L.t}</text>`;
  }
  /* --- Rare : flacon de cristal à facettes, monture d'argent, halo --- */
  function rare(k){
    const L = LIQ[k], g = uid(), gl = uid(), ag = uid(), h = uid(), gem = uid();
    const body = "M50 34 L76 52 L80 84 L50 108 L20 84 L24 52Z";
    return `<defs>${lg(g, [[0, L.c[0]], [.45, L.c[1]], [1, L.c[2]]])}${lg(gl, [[0, "#FFFFFF", .7], [1, "#CFE4FF", .3]])}${lg(ag, [[0, "#FFFFFF"], [.5, "#C8D4E8"], [1, "#7A88A8"]])}${rg(h, L.glow)}${lg(gem, [[0, "#FFFFFF"], [1, RAR.r.col]])}</defs>
      <circle cx="50" cy="72" r="50" fill="url(#${h})" class="po-breathe" opacity=".75"/>
      ${relief(body, `url(#${gl})`, 4, 3.2)}
      <path d="M22 70 L50 62 L78 70 L80 84 L50 106 L20 84Z" fill="url(#${g})"/>
      <path d="M50 34 V108 M24 52 L50 62 L76 52 M20 84 L50 76 L80 84" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45"/>
      <path d="M28 56 L32 80" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
      ${relief("M36 46 Q50 38 64 46 L62 52 Q50 46 38 52Z", `url(#${ag})`, 2, 2.4)}
      ${relief("M30 92 Q50 104 70 92 L72 98 Q50 112 28 98Z", `url(#${ag})`, 2, 2.4)}
      ${relief("M43 22 H57 L59 34 H41Z", `url(#${ag})`, 2, 2.6)}
      ${relief("M50 6 L58 14 L50 24 L42 14Z", `url(#${gem})`, 2, 2.4)}<path d="M46 12 L50 9" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      ${spark(84, 30, 6, 0)}${spark(14, 46, 5, .9)}${spark(88, 96, 4, 1.6)}
      <text x="50" y="92" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="900" font-size="18" fill="#fff" stroke="${TD}" stroke-width="4" paint-order="stroke">${L.t}</text>`;
  }
  /* --- Épique : flacon royal en or, ailes, couronne, runes, aura qui tourne --- */
  function epic(k){
    const L = LIQ[k], g = uid(), gl = uid(), au = uid(), h = uid(), gem = uid(), wg = uid();
    const body = "M50 34 Q70 40 74 60 Q80 86 50 110 Q20 86 26 60 Q30 40 50 34Z";
    const rays = Array.from({length:12}, (_, i) => { const a = i / 12 * Math.PI * 2; return `M50 70 L${(50 + Math.cos(a - .08) * 62).toFixed(1)} ${(70 + Math.sin(a - .08) * 62).toFixed(1)} L${(50 + Math.cos(a + .08) * 62).toFixed(1)} ${(70 + Math.sin(a + .08) * 62).toFixed(1)}Z`; }).join(" ");
    const wing = sd => { const x = sd < 0 ? 0 : 100; const f = (dx, dy) => `${50 + sd * dx} ${dy}`;
      return relief(`M${f(22, 58)} Q${f(44, 40)} ${f(50, 30)} Q${f(48, 50)} ${f(40, 56)} Q${f(50, 58)} ${f(48, 68)} Q${f(38, 70)} ${f(30, 70)} Q${f(40, 76)} ${f(36, 84)} Q${f(28, 80)} ${f(24, 74)}Z`, `url(#${wg})`, 2, 2.6); };
    return `<defs>${lg(g, [[0, L.c[0]], [.4, L.c[1]], [1, L.c[2]]])}${lg(gl, [[0, "#FFFFFF", .75], [1, "#FFE8F8", .35]])}${lg(au, [[0, "#FFF6C8"], [.45, "#FFD23F"], [1, "#B8780E"]])}${rg(h, L.glow)}${lg(gem, [[0, "#FFD0F4"], [1, "#E0249C"]])}${lg(wg, [[0, "#FFFFFF"], [1, "#FFE0F6"]])}</defs>
      <circle cx="50" cy="70" r="58" fill="url(#${h})" class="po-breathe" opacity=".9"/>
      <g class="po-spin" style="transform-origin:50px 70px"><path d="${rays}" fill="${L.glow}" opacity=".35"/></g>
      ${wing(-1)}${wing(1)}
      ${relief(body, `url(#${gl})`, 4, 3.2)}
      <path d="M27 66 Q50 58 73 66 Q78 88 50 108 Q22 88 27 66Z" fill="url(#${g})"/>
      <g class="po-rune" fill="none" stroke="#FFF6C8" stroke-width="2" stroke-linecap="round"><path d="M38 80 l4 -6 l4 6 M54 78 h8 M58 74 v8 M44 94 q6 -4 12 0"/></g>
      <path d="M33 54 Q30 70 34 84" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>
      <path d="M50 34 Q66 40 70 56 M50 34 Q34 40 30 56" stroke="url(#${au})" stroke-width="4" fill="none"/>
      ${relief("M26 62 Q50 54 74 62 L74 68 Q50 60 26 68Z", `url(#${au})`, 2, 2.4)}
      ${relief("M36 98 Q50 106 64 98 L62 106 Q50 114 38 106Z", `url(#${au})`, 2, 2.4)}
      ${relief("M42 22 H58 L60 36 H40Z", `url(#${au})`, 2, 2.6)}
      ${relief("M36 22 L40 8 L46 16 L50 4 L54 16 L60 8 L64 22Z", `url(#${au})`, 2, 2.6)}
      ${relief("M50 12 L54 17 L50 22 L46 17Z", `url(#${gem})`, 1.5, 2)}
      ${spark(10, 28, 7, 0)}${spark(90, 34, 6, .7)}${spark(6, 92, 5, 1.3)}${spark(94, 100, 6, 2)}${spark(50, -2, 5, 1)}
      <text x="50" y="92" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="900" font-size="19" fill="#fff" stroke="${TD}" stroke-width="4" paint-order="stroke">${L.t}</text>`;
  }
  function svg(k, r, z, cls){ const inner = r === "e" ? epic(k) : r === "r" ? rare(k) : common(k);
    return `<svg viewBox="-12 -10 124 132" width="${z}" height="${Math.round(z * 132 / 124)}" class="po po-${r} ${cls || ""}" aria-hidden="true">${inner}</svg>`; }
  return {svg, RAR, LIQ};
})();
const Potions = (() => {
  const P = () => EV_DATA.POT, RW = () => EV_DATA.REW;
  const FX = ["xp", "coin"], RR = ["c", "r", "e"], COL = {xp:"#A070FF", coin:"#FFC83A"};
  const T = {xp:{n:"Double XP", t:"XP", d:"Double l'XP des bonnes réponses."}, coin:{n:"Double pièces", t:"×2", d:"Double les pièces des bonnes réponses."},
             fifty:{n:"Jeton 50/50", d:"Retire deux mauvaises réponses sur une question. Dans la Tour, en Survie et au Défi du jour.", a:"#7AE0FF", b:"#2A7AD8", t:"50", once:true}};
  const inv = () => (S.inv = S.inv || {});                     // jeton 50/50 et anciennes potions, sans compte
  const G = () => (S.potG = S.potG || {});                     // récompenses déjà traitées (clé)
  const acct = () => typeof Evenements !== "undefined" && Evenements.online();
  const srv = () => typeof Evenements !== "undefined" && Evenements.live();
  const sv = () => srv() ? Evenements._inv() : null;
  const rarN = r => P().RAR[r].n, durOf = r => P().RAR[r].dur;
  const potName = p => `${T[p.split(":")[0]].n} ${rarN(p.slice(-1)).toLowerCase()}`;
  const fmtM = m => m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`;
  const mins = ms => Math.ceil(ms / 6e4);

  /* --- Sac --- */
  // Anciennes potions gardées sur l'appareil (un exemplaire) : potion commune du sac, une seule fois
  function localNorm(){
    S.pot = S.pot || {}; S.boost = S.boost || {};
    FX.forEach(t => { const x = inv()[t]; if (!x || acct()) return;
      if ((x.got || 0) > (x.used || 0)) { S.pot[t + ":c"] = Math.min(P().MAX, (S.pot[t + ":c"] || 0) + 1); x.used = Date.now(); }
      if ((x.until || 0) > (S.boost[t] || 0)) S.boost[t] = x.until; delete inv()[t]; });
  }
  function count(p){ const x = sv(); if (!x) return acct() ? 0 : (S.pot && S.pot[p]) || 0;
    const t = p.split(":")[0]; return ((x.pot || {})[p] || 0) + (p.endsWith(":c") && x.tok && x.tok[t] && x.tok[t].n > 0 ? 1 : 0); }
  const total = () => FX.reduce((s, t) => s + RR.reduce((a, r) => a + count(t + ":" + r), 0), 0);
  /* --- Effets --- */
  function until(t){ const x = sv(), loc = Math.max((S.boost && S.boost[t]) || 0, (inv()[t] && inv()[t].until) || 0);
    return Math.max(loc, x ? Math.max((x.boost || {})[t] || 0, (x.tok && x.tok[t] && x.tok[t].until) || 0) : 0); }
  const left = t => Math.max(0, until(t) - Date.now());
  const active = t => FX.includes(t) && left(t) > 0;
  const mult = t => active(t) ? 2 : 1;
  /* --- Jeton 50/50 --- */
  const localHas = t => { const x = inv()[t] || {}; return (x.got || 0) > (x.used || 0); };
  const has = t => t === "fifty" ? (srv() ? Evenements.has(t) : localHas(t)) : FX.includes(t) && RR.some(r => count(t + ":" + r) > 0);
  function give(t){ if (t !== "fifty" || localHas(t)) return false; inv()[t] = Object.assign({}, inv()[t], {got:Date.now()}); save(); return true; }   // sans compte
  function use(t){ if (t !== "fifty" || !has(t)) return false;
    if (srv()) Evenements.use(t); else { inv()[t] = Object.assign({}, inv()[t], {used:Date.now()}); save(); }
    return true; }
  // Activer une potion du sac : sa durée s'ajoute à l'effet en cours, 3 h d'avance au plus
  const endIf = (t, r) => Math.min(Date.now() + P().CAP * 6e4, Math.max(Date.now(), until(t)) + durOf(r) * 6e4);
  function activate(t, r){
    const p = t + ":" + r; if (count(p) <= 0 || (acct() && !srv())) return false;
    const end = endIf(t, r);
    if (srv()) Evenements.usePot(t, r, end);
    else { S.pot[p]--; S.boost[t] = end; save(); }
    toasts.push(`<b>${T[t].n} activée</b> · encore ${fmtM(mins(end - Date.now()))}`); try { Music.sfx("level"); } catch(e){}
    return true;
  }

  /* --- Récompenses (table EV_DATA.REW) --- */
  const keyOf = (s, t, o) => s === "qd" ? `qd:${o.d}:${t}` : s === "qw" ? `qw:${o.w}:${t}` : s === "cal" ? `pcal:${t}:${o.n}` : s === "boss" ? `pboss:${o.d}:${t}` : s === "surv" ? `surv:${o.d}:${o.g}:${t}` : `${s}:${t}`;
  const Qd = () => (S.potQ = S.potQ || []);
  // s = source, t = palier, o = précisions (jour, numéro, partie, effet choisi), intro = texte du bandeau
  function reward(s, t, o, intro){
    const rw = (RW()[s] || {})[s === "mst" ? String(t).split(":")[1] : t]; if (!rw) return false;
    o = o || {}; const k = keyOf(s, t, o), g = G();
    if (rw.c && !g["c$" + k]) { g["c$" + k] = 1; S.coins += rw.c; if (!rw.p) toasts.push(`<b>${intro}</b> · +${rw.c} pièces`); }
    if (rw.p && !g[k] && !Qd().some(x => x.k === k)) Qd().push({k, s, t:String(t), o, intro, c:rw.c || 0});
    save(); later(50); return true;
  }
  let busy = false, tmr = null;
  const later = ms => { clearTimeout(tmr); tmr = setTimeout(flush, ms); };
  async function flush(){
    const q = Qd(); if (busy || !q.length) return;
    if (!acct()) { q.splice(0).forEach(localGive); save(); return; }
    if (!srv()) return later(5000);
    busy = true; const pack = q.slice(0, 30);
    try {
      const r = await Evenements.call("grant", {src:"pot", items:pack.map(x => Object.assign({s:x.s, t:x.t}, x.o))});
      (r.out || []).forEach((o, i) => { const x = pack[i]; if (!x) return; G()[x.k] = 1;
        if (o.got && !o.dup) shown(o.got, x); });
      S.potQ = Qd().filter(x => !pack.includes(x)); save();
    } catch(e){ busy = false; return later(20000); }
    busy = false; if (Qd().length) later(1500);
  }
  // Sans compte : sur l'appareil, mêmes limites qu'au serveur pour la Survie
  function localGive(x){
    const rw = RW()[x.s][x.s === "mst" ? x.t.split(":")[1] : x.t]; let p = rw.p; if (p[0] === "?") p = (x.o.e === "coin" ? "coin" : "xp") + p.slice(1);
    if (x.s === "surv") { const L = S.potS = S.potS && S.potS.day === x.o.d ? S.potS : {day:x.o.d, g:[], wk:(S.potS || {}).wk};
      const isE = p.endsWith(":e"), wk = weekOf(x.o.d);
      if ((!L.g.includes(x.o.g) && L.g.length >= P().SURV_DAY) || (isE && L.wk === wk)) { G()[x.k] = 1; return; }
      if (!L.g.includes(x.o.g)) L.g.push(x.o.g); if (isE) L.wk = wk; }
    G()[x.k] = 1; S.pot = S.pot || {};
    if ((S.pot[p] || 0) < P().MAX) { S.pot[p] = (S.pot[p] || 0) + 1; shown("pot:" + p, x); }
    else { const v = P().FULL[p.slice(-1)]; S.coins += v; shown("coins:" + v, x); }
  }
  function shown(got, x){
    if (got.startsWith("coins:")) return toasts.push(`<b>${esc(x.intro || "Récompense")}</b> · sac plein : +${got.slice(6)} pièces à la place`);
    if (got.startsWith("pot:")) found(got.slice(4), x.intro);
  }
  // Paliers permanents : vérifiés régulièrement (et donnés aussi s'ils étaient déjà atteints avant la mise à jour)
  let lastTick = 0;
  function tick(force){
    if (!S || !S.profile || typeof EV_DATA === "undefined") return; const now = Date.now(); if (!force && now - lastTick < 5000) return; lastTick = now;
    localNorm(); const R = RW(), g = G();
    const chk = (s, v, lab) => Object.keys(R[s]).forEach(t => { if (v >= +t && !(g[`${s}:${t}`] && (!R[s][t].c || g[`c$${s}:${t}`]))) reward(s, t, {}, lab(t)); });
    const tw = S.tour || {}; chk("tour", Math.max(tw.best || 0, tw.cp || 0), t => `Palier ${t} de la Tour`);
    const at = S.atlas || {}; chk("atl", Object.keys(at.found || {}).length, t => `Atlas · ${t} pays trouvés`); chk("atc", Object.keys(at.capOk || {}).length, t => `Atlas · ${t} capitales`);
    Object.keys(R.bdg).forEach(id => { if (S.badges && S.badges[id] && !g["bdg:" + id]) reward("bdg", id, {}, `Badge · ${id.slice(3)} bonnes réponses`); });
    const adv = (S.adv && S.adv.w) || {};
    Object.keys(adv).forEach(w => Object.keys(adv[w].q || {}).forEach(id => { if (R.adv[id] && !g["adv:" + id]) reward("adv", id, {}, "Quête d'Aventure"); }));
    try { const M = Profil.mast(), RN = PArt.RANKS.map(r => r.n);
      Object.keys(M).forEach(d => { for (let r = 3; r <= M[d].r; r++) if (R.mst[r] && !g[`mst:${d}:${r}`]) reward("mst", `${d}:${r}`, {}, `Maîtrise · ${RN[r]}`); }); } catch(e){}
    later(300);
  }
  const weekOf = day => { const d = new Date(day + "T12:00:00Z"), k = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - k); return d.toISOString().slice(0, 10); };

  /* --- Affichage --- */
  const svg = (t, z, off, r) => t === "fifty" ? fiftySVG(z, off) : PotArt.svg(t, r || "c", z, off ? "still off" : "still");
  function fiftySVG(z, off){ const c = T.fifty, id = "pt50" + Math.random().toString(36).slice(2, 6);
    return `<svg viewBox="0 0 60 70" width="${z}" height="${z * 70 / 60}" class="pot-svg ${off ? "off" : ""}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.a}"/><stop offset="1" stop-color="${c.b}"/></linearGradient></defs>
      <circle cx="30" cy="40" r="25" fill="${TD}"/><circle cx="30" cy="36" r="25" fill="url(#${id})" stroke="${TD}" stroke-width="2.8"/><circle cx="30" cy="36" r="18" fill="none" stroke="#fff" stroke-width="2" opacity=".55" stroke-dasharray="4 3"/>
      <path d="M14 26 Q20 16 30 14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/><text x="30" y="42" text-anchor="middle" font-size="15" font-weight="900" fill="#fff" stroke="${TD}" stroke-width="1.2" font-family="sans-serif">50</text></svg>`; }
  const tag = r => `<span class="po-rar ${r}">${rarN(r)}</span>`;
  function ring(t){ const p = Math.min(1, left(t) / (P().CAP * 6e4)), c = 2 * Math.PI * 14;
    return `<span class="po-ring"><svg class="po-rg" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="3"/><circle cx="16" cy="16" r="14" fill="none" stroke="${COL[t]}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}"/></svg>${PotArt.svg(t, "c", 22, "still")}</span>`; }
  const tLeft = t => { const m = mins(left(t)); return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : m + "′"; };
  // Pastille de la barre du haut : un anneau par effet actif, sinon le nombre de potions du sac
  function pill(){
    const on = FX.filter(active), n = total() + (has("fifty") ? 1 : 0); if (!on.length && !n) return "";
    if (!on.length) return `<button class="pill pot po-pill" data-pot="open" aria-label="Mes potions (${n})">${PotArt.svg("xp", "c", 22, "still")}<b class="pot-n">${n}</b></button>`;
    return `<button class="pill pot po-pill" data-pot="open" aria-label="Mes potions">${on.map(t => `${ring(t)}<b class="po-pt" data-pot-min="${t}">${tLeft(t)}</b>`).join("")}</button>`;
  }
  let sel = null, tab = "bag";
  function bagHTML(){
    if (!sel || !count(sel.join(":"))) { const f = FX.flatMap(t => RR.map(r => [t, r])).find(([t, r]) => count(t + ":" + r) > 0); sel = f || sel || ["xp", "c"]; }
    const [t, r] = sel, n = count(t + ":" + r), cur = mins(left(t)), end = mins(endIf(t, r) - Date.now()), lost = cur + durOf(r) - end, wait = acct() && !srv();
    const actv = FX.map(x => `<div class="po-act">${PotArt.svg(x, "c", 26, "still")}<b>${T[x].n}</b><span class="po-bar"><i style="width:${Math.min(100, left(x) / (P().CAP * 6e4) * 100)}%;background:${COL[x]}"></i></span><em data-pot-left="${x}">${active(x) ? fmtM(mins(left(x))) : "—"}</em></div>`).join("");
    const grid = FX.map(x => `<div class="po-lab">${T[x].n}</div><div class="po-g">${RR.map(y => { const c = count(x + ":" + y);
      return `<button class="po-slot r-${y} ${t === x && r === y ? "sel" : ""} ${c ? "" : "zero"}" data-pot="sel" data-v="${x}:${y}" aria-label="${potName(x + ":" + y)} : ${c}">${PotArt.svg(x, y, 54, c ? "" : "still")}<span class="po-q">×${c}</span>${tag(y)}<span class="po-d">${fmtM(durOf(y))}</span></button>`; }).join("")}</div>`).join("");
    const f50 = has("fifty");
    return `<div class="po-acts">${actv}</div>${grid}
      <div class="po-go"><p><b>${potName(t + ":" + r)}</b> : ${cur ? `il reste ${fmtM(cur)}, ça passera à <b>${fmtM(end)}</b>` : `<b>${fmtM(durOf(r))}</b> à partir de maintenant`}.</p>
        <button class="btn po-btn" data-pot="act" ${n && !wait ? "" : "disabled"}>${wait ? "Connexion au serveur…" : n ? `Activer (${fmtM(durOf(r))})` : "Aucune potion de ce type"}</button>
        ${lost > 0 && n ? `<span class="po-cap">⚠ 3 h d'avance au maximum : ${fmtM(lost)} seraient perdues.</span>` : ""}</div>
      <div class="po-fifty">${fiftySVG(34, !f50)}<div class="stack grow" style="gap:1px;min-width:0"><b>${T.fifty.n}</b><span>${f50 ? "Prêt · utilise-le pendant une question" : "Aucun · un seul à la fois"}</span></div></div>`;
  }
  // Paliers : même barre partout (coche verte = gagné, cercle doré = prochain)
  function line(s, v, lab, o){
    const R = RW()[s], ks = Object.keys(R).map(Number).sort((a, b) => a - b), g = G();
    // Paliers espacés régulièrement ; la barre avance proportionnellement entre deux paliers
    const X = i => (i + 1) / (ks.length + .15) * 100, pos = x => { if (x <= 0) return 0; const i = ks.findIndex(k => x < k); if (i < 0) return 100;
      const a = i ? ks[i - 1] : 0, xa = i ? X(i - 1) : 0; return xa + (x - a) / (ks[i] - a) * (X(i) - xa); };
    const nx = ks.find(k => v < k);
    return `<div class="po-tier"><div class="po-th"><b>${lab}</b><span>${o.txt}</span></div><div class="po-tl"><div class="po-rail"></div><div class="po-fill" style="width:${pos(v)}%"></div>
      ${ks.map(k => { const rw = R[k], got = o.got ? o.got(k) : v >= k, p = rw.p;
        return `<div class="po-st ${got ? "got" : k === nx ? "next" : ""}" style="left:${X(ks.indexOf(k))}%"><div class="po-ic">${p ? PotArt.svg(p.split(":")[0] === "?" ? "xp" : p.split(":")[0], p.slice(-1), 28, "still") : `<span class="po-cn"><i class="po-coin"></i>${rw.c}</span>`}</div><span>${k}</span></div>`; }).join("")}</div>
      ${o.foot ? `<span class="po-tf">${o.foot}</span>` : ""}</div>`;
  }
  function tiersHTML(){
    const tw = S.tour || {}, at = S.atlas || {}, sv2 = (S.rec && S.rec.survie) || 0;
    let bd = 0; try { const c = Boss.current(); bd = (S.potBoss && S.potBoss.d === c.day && S.potBoss.v) || 0; } catch(e){}
    return line("surv", 0, "💀 Survie · par partie", {txt:`record ${sv2}`, got:() => false, foot:"Bonnes réponses dans une même partie. Potions sur 3 parties par jour, épique 1 fois par semaine."})
      + line("boss", bd, "🐉 Boss · combat du jour", {txt:`${bd} PV aujourd'hui`, foot:"Dégâts infligés pendant ton combat du jour."})
      + line("tour", Math.max(tw.best || 0, tw.cp || 0), "🗼 Tour · étages", {txt:`étage ${Math.max(tw.best || 0, tw.cp || 0)}`, foot:"Une seule fois par palier, pour toujours."})
      + line("atl", Object.keys(at.found || {}).length, "🌍 Atlas · pays", {txt:`${Object.keys(at.found || {}).length} / 197`})
      + line("atc", Object.keys(at.capOk || {}).length, "🏛️ Atlas · capitales", {txt:`${Object.keys(at.capOk || {}).length} / 196`})
      + `<p class="po-src">Aussi : quêtes du jour (2e et 4e), défis de la semaine (3e, 5e et coffre légendaire : épique au choix), calendrier de connexion, quêtes de l'Aventure, badges de bonnes réponses (500 à 5 000), rangs de maîtrise (Or à Légende), et 2 % de chances à chaque bonne réponse (3 par jour au plus). En boutique : potions communes.</p>`;
  }
  function sheetHTML(){
    return `<div class="cal-box po-box"><button class="am-x" data-pot="close" aria-label="Fermer">×</button>
      <div class="po-head"><b class="cal-title">🎒 Mes potions</b><span>${total()} potion${total() > 1 ? "s" : ""} · ${P().MAX} max par case</span></div>
      <div class="seg po-seg"><button data-pot="tab" data-v="bag" aria-pressed="${tab === "bag"}">Sac</button><button data-pot="tab" data-v="tiers" aria-pressed="${tab === "tiers"}">Paliers</button></div>
      ${tab === "bag" ? bagHTML() : tiersHTML()}
      <p class="po-src">Une potion ne s'abîme jamais dans le sac : le temps ne compte qu'une fois activée. Double XP et Double pièces peuvent tourner en même temps.</p></div>`;
  }
  function sheet(){
    document.querySelectorAll(".pot-sheet").forEach(e => e.remove());
    const el = document.createElement("div"); el.className = "pot-sheet cal-veil"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Mes potions");
    el.innerHTML = sheetHTML();
    el.addEventListener("click", e => { const b = e.target.closest("[data-pot]"); if (e.target === el || (b && b.dataset.pot === "close")) return el.remove();
      if (!b) return; const a = b.dataset.pot;
      if (a === "sel") sel = b.dataset.v.split(":");
      else if (a === "tab") tab = b.dataset.v;
      else if (a === "act") { if (activate(sel[0], sel[1])) render(); }
      const sc = el.querySelector(".cal-box").scrollTop; el.innerHTML = sheetHTML(); el.querySelector(".cal-box").scrollTop = sc; });
    document.body.appendChild(el);
  }
  // Choix de l'effet d'une potion « au choix » (coffre légendaire)
  function choose(r, cb){
    const el = document.createElement("div"); el.className = "po-drop-v cal-veil"; el.setAttribute("role", "dialog");
    el.innerHTML = `<div class="po-drop e"><span class="po-k">★ Récompense épique ★</span><b class="po-h">Choisis ta potion</b>
      <div class="po-ch">${FX.map(t => `<button class="po-chb" data-ch="${t}">${PotArt.svg(t, r, 96)}<b>${T[t].n}</b>${tag(r)}</button>`).join("")}</div></div>`;
    el.addEventListener("click", e => { const b = e.target.closest("[data-ch]"); if (!b) return; el.remove(); cb(b.dataset.ch); });
    document.body.appendChild(el);
  }
  // Potion obtenue : petit bandeau en pleine partie, grande fenêtre sinon
  const waiting = [];
  function found(p, intro){
    const [t, r] = p.split(":");
    if (inPlay() || document.querySelector(".po-drop-v,.lvup,.cal-modal,.qs-fx,.tw-fx")) {
      const el = document.createElement("div"); el.className = "ev-frag po-toast" + (r === "e" ? " big" : ""); el.setAttribute("role", "status");
      el.innerHTML = `${PotArt.svg(t, r, 30, "still")}<span><b>${r === "e" ? "Potion épique !" : "Potion trouvée"}</b> · ${esc(potName(p))}</span>`;
      document.body.appendChild(el); try { Music.sfx("ok"); } catch(e){}
      setTimeout(() => el.classList.add("out"), 2800); setTimeout(() => el.remove(), 3300);
      if (!inPlay()) waiting.push([p, intro]);
      return;
    }
    waiting.push([p, intro]); clearTimeout(ftm); ftm = setTimeout(next, 700);   // plusieurs à la fois : une seule fenêtre récapitulative
  }
  let ftm = null;
  function summary(list){
    const el = document.createElement("div"); el.className = "po-drop-v cal-veil"; el.setAttribute("role", "dialog");
    const best = list.some(([p]) => p.endsWith(":e")) ? "e" : list.some(([p]) => p.endsWith(":r")) ? "r" : "c";
    el.innerHTML = `<div class="po-drop ${best}"><span class="po-k">Récompenses</span><b class="po-h">${list.length} potions gagnées !</b>
      <div class="po-sum">${list.map(([p, i]) => `<div>${PotArt.svg(p.split(":")[0], p.slice(-1), 44, "still")}<span><b>${esc(potName(p))}</b>${esc(i || "")}</span></div>`).join("")}</div>
      <p>Rangées dans ton sac. Tu les actives quand tu veux.</p>
      <div class="po-row2"><button class="btn ghost" data-dr="later">Super !</button><button class="btn" data-dr="bag">Voir mon sac</button></div></div>`;
    el.addEventListener("click", e => { const b = e.target.closest("[data-dr]"); if (!b) return; el.remove(); render(); if (b.dataset.dr === "bag") sheet(); else next(); });
    document.body.appendChild(el); try { Music.sfx("level"); } catch(e){}
  }
  function popup(p, intro){
    const [t, r] = p.split(":"), el = document.createElement("div"); el.className = "po-drop-v cal-veil"; el.setAttribute("role", "dialog");
    const cf = r === "c" ? "" : `<div class="po-cf">${Array.from({length:r === "e" ? 36 : 18}, (_, i) => `<i style="background:${["#FFD23F", "#FF5FD2", "#4AA8FF", "#3DDC84", "#fff"][i % 5]};--x:${Math.round(Math.cos(i) * (90 + i * 5))}px;--y:${Math.round(Math.sin(i * 1.7) * 140 - 40)}px;--r:${i * 47}deg"></i>`).join("")}</div>`;
    el.innerHTML = `<div class="po-drop ${r}">${cf}<span class="po-k">${r === "e" ? "★ Extrêmement rare ★" : esc(intro || "Bonne réponse · bonus")}</span><b class="po-h">${r === "e" ? "POTION ÉPIQUE !" : r === "r" ? "Potion rare !" : "Potion trouvée !"}</b>
      <div class="po-fl">${PotArt.svg(t, r, r === "e" ? 150 : 128)}</div>${tag(r)}<span class="po-dd">${fmtM(durOf(r))}</span>
      <p>${esc(potName(p))} rangée dans ton sac. Tu l'actives quand tu veux.</p>
      <div class="po-row2"><button class="btn ghost" data-dr="later">Plus tard</button><button class="btn" data-dr="now">Activer</button></div></div>`;
    el.addEventListener("click", e => { const b = e.target.closest("[data-dr]"); if (!b) return; el.remove(); if (b.dataset.dr === "now") activate(t, r); render(); next(); });
    document.body.appendChild(el); try { Music.sfx("level"); } catch(e){}
  }
  const next = () => { if (!waiting.length || inPlay() || document.querySelector(".po-drop-v,.lvup,.cal-modal,.qs-fx,.tw-fx")) return;
    if (waiting.length > 1) return summary(waiting.splice(0)); const [p, i] = waiting.shift(); popup(p, i); };
  setInterval(() => {
    document.querySelectorAll("[data-pot-min]").forEach(e => { const t = e.dataset.potMin; if (active(t)) e.textContent = tLeft(t); else if (S.profile && !inPlay()) render(); });
    document.querySelectorAll("[data-pot-left]").forEach(e => { const t = e.dataset.potLeft; e.textContent = active(t) ? fmtM(mins(left(t))) : "—"; });
    if (S && S.profile) { next(); if (!inPlay()) tick(); }
  }, 1000);
  setTimeout(() => later(2000), 3000);
  return {give, use, has, active, mult, left, count, total, activate, reward, tick, flush, found, choose, svg, pill, sheet, name:potName, T, FX, RR};
})();

const Calendrier = (() => {
  // Cases du calendrier : EV_DATA.REW.cal (pièces et potions en alternance, épique + 500 pièces au jour 14)
  const REW = () => EV_DATA.REW.cal;
  const calDay = ms => Math.floor((ms + 36e5) / 864e5);           // même calcul que la règle Firestore
  const st = () => (S.cal = S.cal || {n:0, day:0, paid:0});
  let srv = null, busy = false, offset = 0;                        // offset : écart entre l'horloge du serveur et celle du téléphone
  const online = () => { try { return !!(Amis.api.uid() && Amis.api.db()); } catch(e){ return false; } };
  const nowDay = () => calDay(Date.now() + offset);
  const claimedToday = () => st().day >= nowDay();
  const stepOf = n => ((n - 1) % 14) + 1;                           // case 1 à 14 pour la n-ième récupération
  // Lit l'heure du serveur (on écrit l'heure serveur dans clock/{uid} puis on la relit) et l'état officiel
  async function sync(){
    if (!online()) return;
    try {
      const db = Amis.api.db(), uid = Amis.api.uid(), FV = Amis.api.fb().firestore.FieldValue, ck = db.doc("clock/" + uid);
      await ck.set({t:FV.serverTimestamp()}); const t = (await ck.get()).data().t.toMillis(); offset = t - Date.now();
      const d = await db.doc("logins/" + uid).get(); srv = d.exists ? d.data() : {n:0, day:0};
      const s = st(); s.n = Math.max(s.n, srv.n); s.day = Math.max(s.day, srv.day);
      if (srv.n === (s.paid || 0) + 1) pay(srv.n, true);            // récompense validée par le serveur mais pas encore versée (appli fermée trop tôt)
      save(); if (S.tab === "accueil" && !inPlay()) { window.__quiet = true; render(); }
      auto();
    } catch(e){}
  }
  function reward(step){ return REW()[step]; }
  // Verse la récompense de la n-ième récupération : pièces tout de suite, potion par le serveur (vérifie la connexion du jour)
  function pay(n, quiet){
    const s = st(); if ((s.paid || 0) >= n) return null; s.paid = n;
    const step = stepOf(n), r = reward(step), out = {kind:r.p ? "pot" : "coin", v:r.c || 0, p:r.p};
    if (r.c && !r.p) S.coins += r.c;
    if (r.p) { Potions.reward("cal", step, {n}, "Calendrier"); }   // les pièces du jour 14 sont versées avec la potion
    save(); checkBadges();
    if (quiet) toasts.push(out.kind === "pot" ? `<b>Calendrier</b> · ${Potions.name(r.p)}` : `<b>Calendrier</b> · +${out.v} pièces`);
    return out;
  }
  async function claim(){
    if (busy || claimedToday()) return; busy = true;
    try {
      let n, day;
      if (online()) {
        if (!srv) await sync();
        const db = Amis.api.db(), uid = Amis.api.uid(), FV = Amis.api.fb().firestore.FieldValue, ref = db.doc("logins/" + uid);
        await db.runTransaction(async tx => { const d = await tx.get(ref), prev = d.exists ? d.data() : {n:0, day:0};
          day = nowDay(); if (prev.day >= day) throw "deja"; n = prev.n + 1; tx.set(ref, {n, day, at:FV.serverTimestamp()}); });
        srv = {n, day};
      } else { const s = st(); day = nowDay(); n = s.n + 1; }
      const s = st(); s.n = n; s.day = day; const out = pay(n); fx(out, stepOf(n));
    } catch(e){
      if (e === "deja") { st().day = nowDay(); save(); toasts.push("<b>Déjà récupérée aujourd'hui</b> · reviens demain !"); }
      else toasts.push("<b>Impossible de récupérer pour l'instant</b> · vérifie ta connexion.");
      close(); render();
    }
    busy = false;
  }

  /* --- Affichage --- */
  const coins = (v, z) => `<span class="cal-coins" style="--z:${z}px">${v >= 400 ? `<i></i><i></i><i></i>` : `<i></i><i></i>`}</span>`;
  const ico = (r, z) => r.p ? `${PotArt.svg(r.p.split(":")[0], r.p.slice(-1), z * 1.05, "still")}${r.c ? coins(r.c, z * .8) : ""}` : coins(r.c, z);
  const lab = r => r.p ? `${Potions.name(r.p)}${r.c ? ` + ${r.c} pièces` : ""}` : `${r.c} pièces`;
  function board(){
    const s = st(), done = claimedToday(), k = s.n === 0 ? 0 : done ? stepOf(s.n) : s.n % 14, cur = done ? k : k + 1;
    return `<div class="cal-grid">${Array.from({length:14}, (_, i) => REW()[i + 1]).map((r, i) => { const d = i + 1, got = d <= k, now = d === cur && !done, today = d === cur && done;
      return `<div class="cal-t ${got ? "got" : ""} ${now ? "now" : ""} ${today ? "today" : ""} ${d === 14 ? "big" : ""} ${r.p ? "pt pr-" + r.p.slice(-1) : ""} ${!got && !now ? "lock" : ""}" data-d="${d}">
        <span class="cal-d">Jour ${d}</span><span class="cal-ic">${ico(r, d === 14 ? 34 : 26)}</span><span class="cal-l">${lab(r)}</span>
        ${got ? `<span class="cal-ok">✓</span>` : !now ? `<span class="cal-lk">🔒</span>` : ""}</div>`; }).join("")}</div>`;
  }
  function card(){
    const s = st(), done = claimedToday(), next = done ? stepOf(s.n) : (s.n % 14) + 1;
    return `<button class="card cal-card ${done ? "" : "ready"}" data-cal="open"><span class="cal-card-ic">${calIcon(46)}</span><span class="stack" style="gap:2px;min-width:0;text-align:left">
      <b>Calendrier de connexion</b><span class="muted" style="font-size:13px">${done ? `Jour ${next} récupéré · reviens demain` : `Jour ${next} : ${lab(reward(next))} à récupérer`}</span></span>${done ? `<span class="chip">✓</span>` : `<span class="chip lamp">Récupérer</span>`}</button>`;
  }
  const calIcon = z => `<svg viewBox="0 0 48 48" width="${z}" height="${z}" aria-hidden="true"><rect x="6" y="9" width="36" height="33" rx="6" fill="#FFF4D8" stroke="${TD}" stroke-width="2.6"/><path d="M6 15 Q6 9 12 9 H36 Q42 9 42 15 V20 H6Z" fill="#E2283A" stroke="${TD}" stroke-width="2.6"/><path d="M15 5 V13 M33 5 V13" stroke="${TD}" stroke-width="3.4" stroke-linecap="round"/><path d="M15 5 V13 M33 5 V13" stroke="#C8C8D4" stroke-width="1.6" stroke-linecap="round"/><text x="24" y="37" text-anchor="middle" font-size="15" font-weight="900" fill="#2B1D3A" font-family="sans-serif">14</text></svg>`;
  function close(){ document.querySelectorAll(".cal-modal").forEach(e => e.remove()); }
  function open(){
    close(); const done = claimedToday(), s = st(), next = done ? stepOf(s.n) : (s.n % 14) + 1;
    const el = document.createElement("div"); el.className = "cal-modal cal-veil"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Calendrier de connexion");
    el.innerHTML = `<div class="cal-box"><button class="am-x" data-cal="close" aria-label="Fermer">×</button>
      <span class="tw-kicker">Récompenses de connexion</span><b class="cal-title">Calendrier des 14 jours</b>
      <span class="muted cal-sub">Une case par jour de connexion. Après le jour 14, le calendrier recommence.</span>
      ${board()}
      <button class="btn cal-go" data-cal="claim" ${done ? "disabled" : ""}>${done ? "Reviens demain pour le jour " + ((s.n % 14) + 1) : "Récupérer · jour " + next}</button></div>`;
    el.addEventListener("click", e => { const b = e.target.closest("[data-cal]"); if (e.target === el || (b && b.dataset.cal === "close")) close(); else if (b && b.dataset.cal === "claim") claim(); });
    document.body.appendChild(el);
  }
  // Animation d'ouverture : la case s'ouvre, puis pièces ou potion
  function fx(out, step){
    const box = document.querySelector(".cal-modal .cal-box"); if (!box) { render(); return; }
    const t = box.querySelector(`.cal-t[data-d="${step}"]`); if (t) { t.classList.remove("now", "lock"); t.classList.add("opening"); }
    try { Music.sfx("ok"); setTimeout(() => Music.sfx("level"), 380); } catch(e){}
    setTimeout(() => {
      const fxEl = document.createElement("div"); fxEl.className = "cal-burst";
      fxEl.innerHTML = (out.kind === "coin" ? Array.from({length:18}, () => `<i class="tw-coin" style="left:${Math.random() * 100}%;animation-delay:${(Math.random() * .5).toFixed(2)}s"></i>`).join("") : "")
        + `<div class="cal-win">${out.kind === "pot" ? PotArt.svg(out.p.split(":")[0], out.p.slice(-1), 90) : coins(out.v, 54)}<b>${out.kind === "pot" ? esc(Potions.name(out.p)) + (out.v ? ` + ${out.v} pièces` : "") : "+" + out.v + " pièces"}</b>${out.kind === "pot" ? `<span>Rangée dans ton sac : active-la quand tu veux</span>` : ""}</div>`;
      box.appendChild(fxEl);
      const g = box.querySelector(".cal-grid"); if (g) g.outerHTML = board();
      const go = box.querySelector(".cal-go"); if (go) { go.disabled = true; go.textContent = "Reviens demain pour le jour " + ((st().n % 14) + 1); }
      setTimeout(() => { fxEl.classList.add("out"); }, 1900); setTimeout(() => { fxEl.remove(); }, 2300);
      render();
    }, 520);
  }
  // Fenêtre automatique à la première ouverture du jour (une fois par jour et par appareil, jamais en pleine partie)
  function auto(){
    if (!S.profile || S.tab !== "accueil" || claimedToday() || inPlay() || document.querySelector(".cal-modal,.am-inv.portal,.lvup") || window.__noCal) return;
    if (online() && !srv) return;                 // on attend l'heure du serveur
    const d = nowDay(); if (S.calSeen === d) return; S.calSeen = d; save(); open();
  }
  return {card, open, close, claim, sync, auto, state:st, _reset:() => { srv = null; }};
})();
