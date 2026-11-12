/* ---------- Profil : prestige (10 emblèmes) et maîtrise des 8 domaines ----------
   Prestige : calculé depuis l'XP totale (rétroactif). Chaque cycle compte 9 niveaux ;
   le 10e fait passer au prestige suivant. Cycle k (0 à 8) : 9 000 XP × 1,1^k.
   Au Prestige 10 (Maître Prestige), les niveaux continuent sans fin.
   Maîtrise : par domaine, 1/2/3 points par question réussie (facile/moyen/pointu), +2 si maîtrisée ;
   rapportée au total possible du domaine. Les deux plus hauts paliers demandent aussi
   un bon taux de réussite aux questions pointues. Dessins : atelier/profil_art.js (PArt). */
const Profil = (() => {
  const DOMS = ["his", "geo", "sci", "spo", "art", "cin", "jeu", "cul"];
  const DMAP = {his:["his", "per", "myt"], geo:["geo", "cap"], sci:["sci", "esp", "cor", "ani", "tec"], spo:["spo"], art:["art", "lan", "mus"], cin:["cin"], jeu:["jeu", "bdm"], cul:["mon", "ins", "gas", "eco"]};
  const D_OF = {}; DOMS.forEach(d => DMAP[d].forEach(t => D_OF[t] = d));
  const COST = k => 9000 * Math.pow(1.1, k), BASE = k => 200 * Math.pow(1.1, k);
  const NAMES = PArt.PRE.map(p => p.n);
  // Paliers de maîtrise (1 à 7) ; l'indice 0 = pas encore classé
  const TIERS = [null, {pct:0}, {pct:8}, {pct:18}, {pct:32}, {pct:48}, {pct:66, acc:60}, {pct:85, acc:75}];
  // Novembre 2026 : la banque est passée de 3 453 à 4 616 questions. Pour que personne ne perde son rang, les paliers de chaque domaine
  // sont abaissés dans la même proportion que l'augmentation des points possibles (ancien total / nouveau total).
  const SCALE = {his:.779, geo:.774, sci:.781, spo:.757, art:.829, cin:.752, jeu:.705, cul:.829};
  const need = (t, d) => Math.round(TIERS[t].pct * (SCALE[d] || 1));
  const RN = PArt.RANKS.map(r => r.n);

  // Prestige et niveau depuis une XP totale
  function pres(x){
    if (x === undefined) x = totalXp();
    let k = 0; while (k < 9 && x >= COST(k)) { x -= COST(k); k++; }
    const b = BASE(k);
    if (k < 9 || x < 45 * b) { const l = lvl(x, b); return {P:k + 1, L:l.L, p:l.p, need:l.need, cycle:k < 9 && l.L === 9}; }
    const s = 10 * b, y = x - 45 * b, n = Math.floor(y / s);
    return {P:10, L:10 + n, p:(y % s) / s, need:s - (y % s), cycle:false};
  }
  const name = P => NAMES[Math.max(1, Math.min(10, P)) - 1];
  const label = P => P >= 10 ? "Maître Prestige" : "Prestige " + P;

  // Maîtrise : total possible par domaine (calculé une fois)
  let MAX = null;
  function maxes(){
    if (MAX) return MAX; MAX = {}; DOMS.forEach(d => MAX[d] = 0);
    for (const id in Q) { const d = D_OF[Q[id][0]]; if (d) MAX[d] += (Q[id][1] || 1) + 2; }
    return MAX;
  }
  function mast(){
    const M = maxes(), o = {}; DOMS.forEach(d => o[d] = {pts:0, hok:0, hko:0, n:0});
    for (const id in S.q) { const q = Q[id], e = S.q[id]; if (!q || !e) continue; const d = D_OF[q[0]]; if (!d) continue; const r = o[d];
      if (e.ok > 0) { r.pts += (q[1] || 1) + (e.b >= 3 ? 2 : 0); r.n++; }
      if (q[1] === 3) { r.hok += e.ok || 0; r.hko += e.ko || 0; } }
    DOMS.forEach(d => { const r = o[d]; r.pct = M[d] ? r.pts / M[d] * 100 : 0; r.acc = r.hok + r.hko ? r.hok / (r.hok + r.hko) * 100 : 0;
      r.d = d; r.r = 0; if (r.n) for (let t = 1; t < TIERS.length; t++) { const T = TIERS[t]; if (r.pct >= need(t, d) && (!T.acc || r.acc >= T.acc)) r.r = t; } });
    return o;
  }
  // Ce qu'il manque pour le palier suivant
  function nextTxt(r){
    if (r.r >= 7) return "Palier maximum atteint";
    const T = TIERS[r.r + 1];
    if (!r.r) return "Réussis une question pour entrer au rang Bronze";
    return `${RN[r.r + 1]} : ${need(r.r + 1, r.d)} % de maîtrise${T.acc ? ` et ${T.acc} % de réussite aux questions pointues` : ""}`;
  }

  // Dessins, gardés en mémoire (un dessin complet pèse lourd)
  const cache = {};
  const emblem = (P, still) => { const k = "e" + P + (still ? "s" : ""); return cache[k] || (cache[k] = PArt.emblem(Math.max(1, Math.min(10, P)) - 1).replace('class="pa"', `class="pa${still ? " still" : ""}"`)); };
  const rankArt = (r, d) => { const k = "r" + r + d; return cache[k] || (cache[k] = PArt.rankEmblem(Math.max(1, r), d)); };

  // Bloc « Prestige » et « Maîtrise » de Profil > Progrès
  function progress(){
    const A = pres(), x = totalXp(), mx = mast();
    const nextL = A.cycle ? `Encore ${Math.ceil(A.need)} XP pour passer ${label(A.P + 1)} : ${name(A.P + 1)}` : `Encore ${Math.ceil(A.need)} XP pour le niveau ${A.L + 1}`;
    const tiles = DOMS.map(d => { const r = mx[d];
      return `<div class="pm-dom ${r.r ? "" : "off"}" title="${esc(nextTxt(r))}">${rankArt(r.r, d)}<b>${esc(PArt.DOM[d].n)}</b><span>${r.r ? RN[r.r] : "Non classé"} · ${r.pct < 10 && r.pct > 0 ? r.pct.toFixed(1).replace(".", ",") : Math.floor(r.pct)} %</span><small>${esc(nextTxt(r))}</small></div>`; }).join("");
    return `<div class="pr-card ${A.P >= 10 ? "legend" : ""} pr-p${A.P}"><div class="pr-emb">${emblem(A.P)}</div>
      <div class="stack" style="gap:4px;min-width:0"><span class="label">Prestige ${A.P}</span><b class="pr-name">${esc(name(A.P))}</b>
        <span class="pr-lv">Niveau ${A.L}</span><span class="meter"><i style="width:${Math.round(A.p * 100)}%"></i></span>
        <span class="muted" style="font-size:13.5px">${nextL}</span><span class="muted" style="font-size:13px">${x} XP au total</span></div></div>
    <div class="card stack"><div class="label">Maîtrise des domaines</div><div class="pm-grid">${tiles}</div>
      <p class="muted" style="font-size:13.5px">Chaque question réussie compte (pointue = plus de points), et encore plus quand elle est maîtrisée. Obsidienne et Légende demandent aussi de bien réussir les questions pointues.</p></div>`;
  }
  // En-tête : petit emblème immobile
  const mini = () => emblem(pres().P, true);

  // Passage de prestige (et révélation du prestige actuel lors de la mise à jour)
  function check(){
    if (!S.profile) return;
    const P = pres().P;
    if (S.pres === undefined) { S.pres = P; if (P > 1) prestigeUp(P, true); return; }
    if (P > S.pres) { S.pres = P; prestigeUp(P, false); }
  }
  function prestigeUp(P, reveal){
    levelUp(P, "Prestige", reveal ? "Toute ton XP compte : voici ton rang de prestige." : "Ton niveau repart à 1 avec un nouvel emblème. Bravo !", {art:emblem(P), kick:reveal ? "Ton prestige" : "Nouveau prestige !", title:P >= 10 ? name(P) : `${label(P)} · ${name(P)}`, big:true});
  }

  // Pour le classement : XP totale (ancienne fiche sans XP : estimée depuis l'ancien niveau)
  const txpOf = st => st.txp || (st.lvl ? 200 * st.lvl * (st.lvl - 1) / 2 : 0);
  const boardTxt = st => { const A = pres(txpOf(st)); return `${A.P >= 10 ? "MP" : "P" + A.P} · niv. ${A.L}`; };

  /* ---------- Carte de visite (mise en page A validée) ---------- */
  const TIER_ORD = {maitre:6, diamant:5, platine:4, or:3, argent:2, bronze:1};
  const C = () => (S.card = S.card || {bn:"aube", fr:"bronze", bd:[]});
  const badgeOf = id => BADGES.find(b => b.id === id);
  // Badges en vitrine : ceux choisis, sinon les 3 plus prestigieux
  function showBadges(){
    const own = Object.keys(S.badges).map(badgeOf).filter(Boolean), pick = C().bd.filter(id => S.badges[id] && badgeOf(id));
    if (pick.length) return pick.slice(0, 3);
    return own.sort((a, b) => (TIER_ORD[b.tier] || 0) - (TIER_ORD[a.tier] || 0) || String(S.badges[b.id]).localeCompare(String(S.badges[a.id]))).slice(0, 3).map(b => b.id);
  }
  /* ---------- Collections : bannière (Épique), cadre (Légendaire), titre (Mythique) gagnés par les exploits ---------- */
  const TI = (id, n, a, b, f) => ({id, n, a, b, f});
  const TITLES_C = {
    cimes:TI("cimes", "CONQUÉRANT DES CIMES", "#FF6A7A", "#5A0A1A", "#FFF0F0"), arene:TI("arene", "CHAMPION DE L'ARÈNE", "#FF9A3A", "#7A1A0A", "#FFF4E0"),
    savant:TI("savant", "MAÎTRE DES CONNAISSANCES", "#D0A0FF", "#3A0E7A", "#FFFFFF"), legende:TI("legende", "LÉGENDE", "#FFE58A", "#14141E", "#FFE58A"),
    champion:TI("champion", "CHAMPION", "#7AC0FF", "#0A2A7A", "#FFFFFF"), explorateur:TI("explorateur", "EXPLORATEUR DES CINQ MONDES", "#5AF0E0", "#04484A", "#FFFFFF")};
  const N = v => v || 0;
  const tw = () => (S.tour || {}), bs = () => (S.boss || {}), on = () => (S.online || {}), adv = () => { try { return typeof Aventure !== "undefined" ? Aventure.stats() : {}; } catch(e){ return {}; } };
  let mc = null, mt = 0; const mastC = () => (Date.now() - mt < 1500 && mc) || (mt = Date.now(), mc = mast());
  const lvlCount = t => { const m = mastC(); return DOMS.filter(d => m[d].r >= t).length; };
  const advAll = () => typeof Aventure !== "undefined" && [1, 2, 3, 4, 5].every(w => Aventure.pctOf(w) >= 100);
  // Chaque objet : progression [actuel, but] ; le titre porte l'id du titre gagné
  const RULES = {
    tour:[() => [N(tw().best), 60], () => [N(tw().best), 100], () => [N(tw().tops), 3]],
    boss:[() => [N(bs().total), 50], () => [N(bs().tops), 1], () => [N(bs().wins), 10]],
    savant:[() => [lvlCount(3), 3], () => [lvlCount(7), 1], () => [lvlCount(7), 4]],
    veteran:[() => [pres().P, 3], () => [pres().P, 6], () => [pres().P, 9]],
    duel:[() => [N(on().wins), 25], () => { const o = on(), wr = o.played ? o.wins / o.played * 100 : 0; return [wr >= 60 ? N(o.wins) : Math.min(N(o.wins), 99), 100]; }, () => [N(on().crowns), 4]],
    aventure:[() => [N(adv().boss), 3], () => [N(adv().stars), 105], () => [advAll() ? 1 : 0, 1]]
  };
  const CT = {tour:"cimes", boss:"arene", savant:"savant", veteran:"legende", duel:"champion", aventure:"explorateur"};
  const RAR = ["Épique", "Légendaire", "Mythique"], RARC = ["#B060FF", "#FFB020", "#FF3A5A"];
  const got = (k, i) => !!(S.coll && S.coll[k + i]);
  // Vérifie les exploits (hors partie) ; les gains sont définitifs
  function checkColl(){
    if (!S.profile || (typeof inPlay === "function" && inPlay())) return;
    S.coll = S.coll || {}; const news = [];
    PArt.COLL.forEach(c => RULES[c.k].forEach((f, i) => { if (got(c.k, i)) return; const [a, b] = f(); if (a < b) return;
      S.coll[c.k + i] = today();
      if (i === 2) { S.titles = S.titles || {}; S.titles[CT[c.k]] = S.titles[CT[c.k]] || today(); }
      news.push(c.items[i][0]); }));
    if (news.length) { news.forEach(n => toasts.push(`<b>Collection</b> · ${esc(n)} débloqué !`)); save(); }
  }
  // Page Collections (Profil > Badges)
  function collections(){
    const own = PArt.COLL.reduce((a, c) => a + [0, 1, 2].filter(i => got(c.k, i)).length, 0);
    return `<div class="card stack" style="gap:12px"><div class="label">Collections · ${own}/18</div>
      <p class="muted" style="margin:0;font-size:14px">Les exploits débloquent une bannière et un cadre pour ta carte de visite, puis un titre très rare. Rien ne s'achète.</p>
      ${PArt.COLL.map(c => `<section class="co" style="--c:${c.col}"><div class="co-h"><b>${esc(c.n)}</b><span>${esc(c.w)}</span></div>
        <div class="co-bn">${PArt.bannerArt(c.k)}<div class="co-fr">${PArt.frameArt(c.k, `<div class="vc-ava">${meSVG(52)}</div>`)}</div></div>
        <div class="co-it">${c.items.map(([n, cond], i) => { const g = got(c.k, i), [a, b] = RULES[c.k][i](), act = !g ? "" : i === 0 ? `<button class="btn small ghost" data-pc="bn" data-v="${c.k}" ${C().bn === c.k ? "disabled" : ""}>${C().bn === c.k ? "Sur ma carte" : "Mettre sur ma carte"}</button>` : i === 1 ? `<button class="btn small ghost" data-pc="fr" data-v="${c.k}" ${C().fr === c.k ? "disabled" : ""}>${C().fr === c.k ? "Sur ma carte" : "Mettre sur ma carte"}</button>` : (S.profile.title === CT[c.k] ? `<span class="chip lamp">Porté</span>` : `<button class="btn small ghost" data-tequip="${CT[c.k]}">Porter</button>`);
          return `<div class="co-i ${g ? "own" : ""}"><span class="co-r" style="--r:${RARC[i]}">${RAR[i]}</span><b>${esc(n)}</b><span class="co-c">${esc(cond)}</span>
            ${g ? act : `<span class="meter"><i style="width:${Math.min(100, Math.round(a / b * 100))}%"></i></span><span class="co-c">${Math.min(a, b)} / ${b}</span>`}</div>`; }).join("")}</div></section>`).join("")}</div>`;
  }
  // Bannières et cadres disponibles
  const BANS = () => [{k:"aube", n:"Aube", ok:true}, {k:"neant", n:"Néant", ok:pres().P >= 10, how:"Maître Prestige"}].concat(PArt.COLL.map(c => ({k:c.k, n:c.items[0][0].replace(/^Bannière « (.*) »$/, "$1"), ok:got(c.k, 0), how:c.items[0][1]})));
  const FRS = () => [{k:"bronze", n:"Bronze", ok:true}, {k:"roi", n:"Roi-liche", ok:pres().P >= 10, how:"Maître Prestige"}].concat(PArt.COLL.map(c => ({k:c.k, n:c.items[1][0].replace(/^Cadre « (.*) »$/, "$1"), ok:got(c.k, 1), how:c.items[1][1]})));
  const okBan = k => BANS().some(b => b.k === k && b.ok), okFr = k => FRS().some(f => f.k === k && f.ok);
  function duelStats(){ let a = null; try { a = typeof Amis !== "undefined" && Amis.api.stats ? Amis.api.stats() : null; } catch(e){} const b = S.online; return a && (!b || N(a.played) >= N(b.played)) ? a : b || a; }
  // Données de ma carte (même forme que celles publiées pour les autres joueurs)
  function myCard(){
    const A = pres(), mx = mast(), ds = duelStats(), tw = typeof Tour !== "undefined" ? Tour.stats() : {best:0};
    return {name:S.profile.name, ti:myTitle(), P:A.P, L:A.L, p:A.p, bn:okBan(C().bn) ? C().bn : "aube", fr:okFr(C().fr) ? C().fr : "bronze", bd:showBadges(),
      rk:DOMS.map(d => mx[d].r), wr:ds && ds.played ? Math.round(ds.wins / ds.played * 100) : null, pl:ds ? ds.played : 0, tw:tw.best || 0, ok:totalOk()};
  }
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  function cardHTML(c, avatar){
    const bd = (c.bd || []).map(badgeOf).filter(Boolean).map(b => `<div class="vc-bd">${badge2(b.tier, b.icon, 56)}<span>${esc(b.name.replace(" · ", " "))}</span></div>`).join("");
    const st = [["Victoires", c.wr === null || c.wr === undefined ? "—" : c.wr + " %", "en duel", true], ["Tour", c.tw ? fmt(c.tw) : "—", "meilleur étage"], ["Réponses", fmt(c.ok || 0), "bonnes réponses"], ["Duels", fmt(c.pl || 0), "joués"]];
    const rk = DOMS.map((d, i) => { const r = (c.rk || [])[i] || 0; return `<div class="vc-rk ${r ? "" : "off"}" title="${esc(PArt.DOM[d].n)} : ${r ? RN[r] : "non classé"}">${rankArt(r, d)}<span>${SHORT[d]}</span></div>`; }).join("");
    return `<div class="vc ${c.P >= 10 ? "legend" : ""}">${PArt.bannerArt(c.bn || "aube")}
      <div class="vc-in"><div class="vc-emb">${emblem(c.P)}</div>
        <div class="vc-mid">${PArt.frameArt(c.fr || "bronze", `<div class="vc-ava">${avatar}</div>`)}
          <div class="vc-id"><b class="vc-nm">${esc(c.name)}</b>${c.ti ? titleTag(c.ti, "") : ""}<div class="vc-lv"><b>${label(c.P)}</b><span>Niveau ${c.L}</span></div><div class="vc-xp"><i style="width:${Math.round((c.p || 0) * 100)}%"></i></div></div></div>
        ${bd ? `<div class="vc-bds">${bd}</div>` : ""}</div>
      <div class="vc-st">${st.map(([k, v, u, w]) => `<div><span>${k}</span><b>${v}</b><small>${u}</small>${w && c.wr ? `<i style="width:${c.wr}%"></i>` : ""}</div>`).join("")}</div>
      <div class="vc-rks">${rk}</div></div>`;
  }
  const SHORT = {his:"Histoire", geo:"Géo", sci:"Sciences", spo:"Sport", art:"Arts", cin:"Ciné", jeu:"Jeux", cul:"Culture"};
  let editing = false;
  function myCardBlock(){
    const card = cardHTML(myCard(), meSVG(74) + (typeof Familiers !== "undefined" ? Familiers.beside(30, "vc-pet") : ""));
    if (!editing) return `${card}<button class="btn ghost small vc-edit" data-pc="edit">${typeof gIcon === "function" ? gIcon("gear", 20) : ""} Personnaliser ma carte</button>`;
    const c = C(), chosen = showBadges();
    const opt = (kind, list, cur) => list.map(o => `<button class="vc-opt ${o.k === cur ? "on" : ""} ${o.ok ? "" : "lock"}" data-pc="${kind}" data-v="${o.k}" ${o.ok ? "" : "disabled"} aria-pressed="${o.k === cur}">
        <span class="vc-thumb ${kind}">${kind === "bn" ? PArt.bannerArt(o.k) : PArt.frameArt(o.k, "")}</span><b>${esc(o.n)}</b>${o.ok ? "" : `<small>${esc(o.how)}</small>`}</button>`).join("");
    const own = Object.keys(S.badges).map(badgeOf).filter(Boolean).sort((a, b) => (TIER_ORD[b.tier] || 0) - (TIER_ORD[a.tier] || 0));
    const bds = own.map(b => `<button class="vc-pick ${chosen.includes(b.id) && c.bd.length ? "on" : ""}" data-pc="bd" data-v="${b.id}" title="${esc(b.name)}">${badge2(b.tier, b.icon, 48)}<span>${esc(b.name)}</span></button>`).join("");
    return `${card}<div class="card stack vc-ed">
      <div class="row between"><b style="font-family:var(--f-display);font-size:18px">Personnaliser ma carte</b><button class="btn small" data-pc="edit">Terminé</button></div>
      <div class="label">Bannière</div><div class="vc-opts">${opt("bn", BANS(), myCard().bn)}</div>
      <div class="label">Cadre</div><div class="vc-opts">${opt("fr", FRS(), myCard().fr)}</div>
      <div class="label">Badges en vitrine (3 au choix)</div>
      ${own.length ? `<p class="muted" style="font-size:13.5px;margin:0">${c.bd.length ? `${c.bd.length}/3 choisis. Touche un badge pour l'ajouter ou le retirer.` : "Pour l'instant, tes 3 plus beaux badges s'affichent tout seuls. Touche un badge pour choisir toi-même."}</p><div class="vc-picks">${bds}</div>` : `<p class="muted" style="margin:0">Gagne ton premier badge pour l'afficher ici.</p>`}
      <p class="muted" style="font-size:13.5px;margin:0">Ton titre se choisit dans la Boutique, onglet Titres. D'autres bannières et cadres se gagneront avec les collections.</p></div>`;
  }
  /* ---------- Fiche d'un autre joueur (depuis les classements) et comparaison ---------- */
  // Ce que je publie pour les autres (avec le ping) : listes simples, pas de listes dans des listes (Firestore)
  function pub(){ const c = myCard(); return {bn:c.bn, fr:c.fr, bd:c.bd, rk:c.rk, wr:c.wr, pl:c.pl, tw:c.tw}; }
  const API = () => (typeof Amis !== "undefined" && Amis.api) || null;
  const clampR = r => Math.min(7, Math.max(0, Math.floor(+r || 0)));
  function theirCard(id){
    const U = (API() && API().users()[id]) || {}, st = U.st || {}, cd = st.cd || {}, A = pres(txpOf(st));
    return {name:U.pseudo || "Joueur", ti:U.ti || "", P:A.P, L:A.L, p:A.p, txp:txpOf(st), bn:typeof cd.bn === "string" ? cd.bn : "aube", fr:typeof cd.fr === "string" ? cd.fr : "bronze",
      bd:Array.isArray(cd.bd) ? cd.bd.filter(x => typeof x === "string").slice(0, 3) : [], rk:Array.isArray(cd.rk) ? cd.rk.slice(0, 8).map(clampR) : [],
      wr:typeof cd.wr === "number" ? cd.wr : null, pl:+cd.pl || 0, tw:+cd.tw || +(st.tw && st.tw.best) || 0, ok:+st.ok || 0, stars:+(st.adv && st.adv.stars) || 0, old:!st.cd};
  }
  let pv = null; // {id, mode:"card"|"cmp", el}
  function see(id){ if (!id) return; closePv(); const el = document.createElement("div"); el.className = "pv"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.addEventListener("click", e => { if (e.target === el) closePv(); }); document.body.appendChild(el); pv = {id, mode:"card", el}; paintPv(); try { Music.sfx("tap"); } catch(e){} }
  function closePv(){ if (pv && pv.el) pv.el.remove(); pv = null; }
  function paintPv(){
    if (!pv) return; const me = API() && pv.id === API().uid(), c = me ? Object.assign(myCard(), {txp:totalXp()}) : theirCard(pv.id);
    const av = me ? meSVG(74) : API() ? API().avatar(pv.id, 74) : "";
    const body = pv.mode === "cmp" && !me ? compare(c) : cardHTML(c, av) + (c.old ? `<p class="muted pv-old">Ce joueur n'a pas encore la dernière version de Lumen : sa carte se complétera quand il ouvrira l'appli.</p>` : "")
      + (me ? "" : `<button class="btn pv-cmp" data-pc="cmp">${typeof gIcon === "function" ? gIcon("sword", 22) : ""} Comparer avec moi</button>`);
    pv.el.innerHTML = `<div class="pv-box"><button class="pv-x" data-pc="close" aria-label="Fermer">✕</button>${pv.mode === "cmp" && !me ? `<button class="btn small ghost pv-back" data-pc="card">← Sa carte</button>` : ""}${body}</div>`;
  }
  function compare(o){
    const m = Object.assign(myCard(), {txp:totalXp(), stars:(() => { try { return Aventure.stats().stars || 0; } catch(e){ return 0; } })()});
    const row = (lab, a, b, va, vb) => { const w = va === vb ? 0 : va > vb ? 1 : -1; return `<div class="cp-r"><b class="${w > 0 ? "win" : ""}">${a}</b><span>${lab}</span><b class="${w < 0 ? "win" : ""}">${b}</b></div>`; };
    const pr = c => `${c.P >= 10 ? "MP" : "P" + c.P} · niv. ${c.L}`;
    const rows = [
      row("Prestige", pr(m), pr(o), m.txp, o.txp), row("XP totale", fmt(m.txp), fmt(o.txp), m.txp, o.txp), row("Bonnes réponses", fmt(m.ok), fmt(o.ok), m.ok, o.ok),
      row("Tour · meilleur étage", m.tw || "—", o.tw || "—", m.tw, o.tw), row("Victoires en duel", m.wr === null ? "—" : m.wr + " %", o.wr === null ? "—" : o.wr + " %", m.wr || 0, o.wr || 0),
      row("Duels joués", m.pl, o.pl, m.pl, o.pl), row("Étoiles de l'Aventure", m.stars, o.stars, m.stars, o.stars)].join("");
    const dom = DOMS.map((d, i) => { const a = m.rk[i] || 0, b = o.rk[i] || 0, w = a === b ? 0 : a > b ? 1 : -1;
      return `<div class="cp-d"><span class="cp-rk ${w > 0 ? "win" : ""} ${a ? "" : "off"}">${rankArt(a, d)}</span><span class="cp-dn">${esc(PArt.DOM[d].n)}<small>${a ? RN[a] : "—"} · ${b ? RN[b] : "—"}</small></span><span class="cp-rk ${w < 0 ? "win" : ""} ${b ? "" : "off"}">${rankArt(b, d)}</span></div>`; }).join("");
    const score = DOMS.reduce((t, d, i) => t + Math.sign((m.rk[i] || 0) - (o.rk[i] || 0)), 0);
    const h = API() && API().h2h ? API().h2h(pv.id) : {w:0, d:0, l:0};
    return `<div class="cp"><div class="cp-h"><div>${meSVG(56)}<b>${esc(m.name)}</b></div><span class="cp-vs">VS</span><div>${API() ? API().avatar(pv.id, 56) : ""}<b>${esc(o.name)}</b></div></div>
      <div class="cp-box"><div class="label">Face-à-face en duel</div>${h.w + h.d + h.l ? `<div class="cp-h2h"><b class="${h.w > h.l ? "win" : ""}">${h.w}</b><span>${h.w > 1 ? "victoires" : "victoire"} · ${h.d} nul${h.d > 1 ? "s" : ""}</span><b class="${h.l > h.w ? "win" : ""}">${h.l}</b></div>` : `<p class="muted" style="margin:4px 0 0">Vous ne vous êtes jamais affrontés. Lance-lui un duel !</p>`}</div>
      <div class="cp-box"><div class="label">Records</div>${rows}</div>
      <div class="cp-box"><div class="label">Maîtrise des domaines · ${score > 0 ? "tu mènes" : score < 0 ? (esc(o.name) + " mène") : "égalité"}</div>${dom}</div></div>`;
  }

  function click(b){
    const d = b.dataset, c = C();
    if (d.pc === "close") return closePv();
    if (d.pc === "cmp" || d.pc === "card") { if (pv) { pv.mode = d.pc; paintPv(); pv.el.scrollTop = 0; } return; }
    if (d.pc === "edit") editing = !editing;
    else if (d.pc === "bn" && okBan(d.v)) c.bn = d.v;
    else if (d.pc === "fr" && okFr(d.v)) c.fr = d.v;
    else if (d.pc === "bd" && S.badges[d.v]) { if (!c.bd.length) c.bd = []; const i = c.bd.indexOf(d.v); if (i >= 0) c.bd.splice(i, 1); else { c.bd.push(d.v); if (c.bd.length > 3) c.bd.shift(); } }
    save(); render();
  }

  return {DOMS, pres, mast, name, label, emblem, mini, rankArt, progress, check, checkColl, collections, titles:TITLES_C, txpOf, boardTxt, myCard, cardHTML, myCardBlock, click, pub, see};
})();
