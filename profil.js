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
  function pub(){ const c = myCard(), R = S.rec || {}, pet = typeof Familiers !== "undefined" && Familiers.eq();
    return {bn:c.bn, fr:c.fr, bd:c.bd, rk:c.rk, wr:c.wr, pl:c.pl, tw:c.tw,
      rc:[N(R.chrono), N(R.survie), N(R.avap), Math.max(N(S.bestStreak), typeof streak === "function" ? streak() : 0)],
      nb:[Object.keys(S.badges || {}).length, Object.keys(S.titles || {}).length], co:Object.keys(S.coll || {}), pt:(pet && pet.id) || ""}; }
  const API = () => (typeof Amis !== "undefined" && Amis.api) || null;
  const clampR = r => Math.min(7, Math.max(0, Math.floor(+r || 0)));
  function theirCard(id){
    const U = (API() && API().users()[id]) || {}, st = U.st || {}, cd = st.cd || {}, A = pres(txpOf(st));
    return {name:U.pseudo || "Joueur", ti:U.ti || "", P:A.P, L:A.L, p:A.p, txp:txpOf(st), bn:typeof cd.bn === "string" ? cd.bn : "aube", fr:typeof cd.fr === "string" ? cd.fr : "bronze",
      bd:Array.isArray(cd.bd) ? cd.bd.filter(x => typeof x === "string").slice(0, 3) : [], rk:Array.isArray(cd.rk) ? cd.rk.slice(0, 8).map(clampR) : [],
      wr:typeof cd.wr === "number" ? cd.wr : null, pl:+cd.pl || 0, tw:+cd.tw || +(st.tw && st.tw.best) || 0, ok:+st.ok || 0, stars:+(st.adv && st.adv.stars) || 0, old:!st.cd || !cd.rc,
      rc:Array.isArray(cd.rc) ? cd.rc.map(x => +x || 0) : [0, 0, +st.avap || 0, +st.streak || 0], nb:Array.isArray(cd.nb) ? cd.nb.map(x => +x || 0) : null,
      co:Array.isArray(cd.co) ? cd.co.filter(x => typeof x === "string") : [], pt:typeof cd.pt === "string" ? cd.pt : "", atl:st.atl || null, av:U.av || ""};
  }
  // Mes données sous la même forme
  function meFull(){ const c = myCard(), p = pub(); let stars = 0; try { stars = Aventure.stats().stars || 0; } catch(e){}
    return Object.assign(c, {txp:totalXp(), stars, rc:p.rc, nb:p.nb, co:p.co, pt:p.pt, atl:typeof Atlas !== "undefined" ? Atlas.stats() : null});
  }
  let pv = null; // {id, mode:"card"|"cmp", el}
  function see(id, force){ if (!id || (!force && typeof inPlay === "function" && inPlay())) return; closePv(); const el = document.createElement("div"); el.className = "pv"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.addEventListener("click", e => { if (e.target === el) closePv(); }); document.body.appendChild(el); pv = {id, mode:"card", el}; paintPv(); try { Music.sfx("tap"); } catch(e){} }
  function closePv(){ if (pv && pv.el) pv.el.remove(); pv = null; }
  function paintPv(){
    if (!pv) return; const me = API() && pv.id === API().uid(), c = me ? meFull() : theirCard(pv.id);
    const av = me ? meSVG(74) + (typeof Familiers !== "undefined" ? Familiers.beside(30, "vc-pet") : "") : (API() ? API().avatar(pv.id, 74, true) : "") + (c.pt && typeof petOf === "function" && petOf(c.pt) ? `<span class="pet-by vc-pet">${creatureSVG(petOf(c.pt), 30)}</span>` : "");
    const body = pv.mode === "cmp" && !me ? compare(c) : cardHTML(c, av) + details(c, me);
    pv.el.innerHTML = `<div class="pv-box"><button class="pv-x" data-pc="close" aria-label="Fermer">✕</button>${pv.mode === "cmp" && !me ? `<button class="btn small ghost pv-back" data-pc="card">← Sa carte</button>` : ""}${body}</div>`;
  }
  const BAN_N = {aube:"Aube", neant:"Néant"}, FR_N = {bronze:"Bronze", roi:"Roi-liche"};
  PArt.COLL.forEach(c => { BAN_N[c.k] = c.items[0][0].replace(/^Bannière « (.*) »$/, "$1"); FR_N[c.k] = c.items[1][0].replace(/^Cadre « (.*) »$/, "$1"); });
  const agoTxt = t => { const m = Math.round((Date.now() - (t || 0)) / 60000); return !t ? "Hors ligne" : m < 60 ? `Vu il y a ${m} min` : m < 1440 ? `Vu il y a ${Math.round(m / 60)} h` : `Vu il y a ${Math.round(m / 1440)} j`; };
  // Sections du profil public : statut, actions, maîtrise, records, distinctions, cosmétiques
  function details(c, me){
    const api = API(), U = api && !me ? api.users()[pv.id] || {} : {}, on = me || (api && api.online(pv.id));
    const G = typeof Guildes !== "undefined" ? Guildes.mine() : null, inG = G && G.g && G.g.members && G.g.members[pv.id];
    const dom = DOMS.map((d, i) => { const r = (c.rk || [])[i] || 0; return `<div class="pm-dom ${r ? "" : "off"}">${rankArt(r, d)}<b>${esc(PArt.DOM[d].n)}</b><span>${r ? RN[r] : "Non classé"}</span></div>`; }).join("");
    const rc = c.rc || [0, 0, 0, 0], atl = c.atl || {};
    const rec = [["Tour", c.tw ? "Étage " + c.tw : "—"], ["Chrono", rc[0] || "—"], ["Survie", rc[1] || "—"], ["Avant ou après", rc[2] || "—"], ["Série de jours", rc[3] ? rc[3] + " j" : "—"], ["Aventure", (c.stars || 0) + " ★"],
      ["Atlas · pays", (atl.f || 0) + "/197"], ["Atlas · capitales", (atl.c || 0) + "/196"], ["Duels", c.pl ? `${c.pl} · ${c.wr || 0} %` : "—"], ["Bonnes réponses", fmt(c.ok || 0)]];
    const co = c.co || [], coll = PArt.COLL.map(k => { const n = [0, 1, 2].filter(i => co.includes(k.k + i)).length;
      return `<div class="pf-co ${n ? "" : "off"}" style="--c:${k.col}"><b>${esc(k.n.replace(/^Collection (du |de la |de l'|des )/, ""))}</b><span>${"●".repeat(n)}<i>${"○".repeat(3 - n)}</i></span></div>`; }).join("");
    const nb = c.nb || [null, null], pet = c.pt && typeof petOf === "function" ? petOf(c.pt) : null, ch = me ? heroChar() : (typeof skinOf === "function" && skinOf(c.av)) || null;
    return `<div class="pf-stat"><span class="${on ? "on" : ""}"><i class="st-dot ${on ? "on" : "off"}"></i>${me ? "C'est toi" : on ? "En ligne" : agoTxt(U.seen)}</span>${inG && !me ? `<span>Dans ta guilde</span>` : ""}<span>${fmt(c.txp || 0)} XP</span></div>
      ${c.old ? `<p class="muted pv-old">Ce joueur n'a pas encore la dernière version de Lumen : son profil se complétera quand il ouvrira l'appli.</p>` : ""}
      ${me ? "" : `<div class="pf-act"><button class="btn" data-pc="cmp">${typeof gIcon === "function" ? gIcon("sword", 22) : ""} Comparer avec moi</button><button class="btn ghost" data-pc="duel">⚔️ Le défier en duel</button></div>`}
      <div class="cp-box"><div class="label">Maîtrise des domaines</div><div class="pm-grid">${dom}</div></div>
      <div class="cp-box"><div class="label">Records</div><div class="pf-rec">${rec.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("")}</div></div>
      <div class="cp-box"><div class="label">Distinctions</div><div class="pf-dist"><div><b>${nb[0] === null ? "—" : nb[0]}</b><span>badges</span></div><div><b>${nb[1] === null ? "—" : nb[1]}</b><span>titres</span></div><div><b>${co.length}<small>/18</small></b><span>collections</span></div></div><div class="pf-cols">${coll}</div></div>
      <div class="cp-box"><div class="label">Cosmétiques mis en avant</div><div class="pf-cos">
        <div><span class="pf-th">${ch ? creatureSVG(ch, 56) : ""}</span><b>Personnage</b><small>${esc((ch && ch.n) || "")}</small></div>
        <div><span class="pf-th">${pet ? creatureSVG(pet, 50) : "—"}</span><b>Familier</b><small>${pet ? esc(pet.n || "") : "Aucun"}</small></div>
        <div><span class="pf-th bn">${PArt.bannerArt(c.bn || "aube")}</span><b>Bannière</b><small>${esc(BAN_N[c.bn] || "Aube")}</small></div>
        <div><span class="pf-th fr">${PArt.frameArt(c.fr || "bronze", "")}</span><b>Cadre</b><small>${esc(FR_N[c.fr] || "Bronze")}</small></div></div></div>`;
  }
  function compare(o){
    const m = meFull();
    const row = (lab, a, b, va, vb) => { const w = va === vb ? 0 : va > vb ? 1 : -1; return `<div class="cp-r"><b class="${w > 0 ? "win" : ""}">${a}</b><span>${lab}</span><b class="${w < 0 ? "win" : ""}">${b}</b></div>`; };
    const pr = c => `${c.P >= 10 ? "MP" : "P" + c.P} · niv. ${c.L}`;
    const rows = [
      row("Prestige", pr(m), pr(o), m.txp, o.txp), row("XP totale", fmt(m.txp), fmt(o.txp), m.txp, o.txp), row("Bonnes réponses", fmt(m.ok), fmt(o.ok), m.ok, o.ok),
      row("Tour · meilleur étage", m.tw || "—", o.tw || "—", m.tw, o.tw), row("Victoires en duel", m.wr === null ? "—" : m.wr + " %", o.wr === null ? "—" : o.wr + " %", m.wr || 0, o.wr || 0),
      row("Duels joués", m.pl, o.pl, m.pl, o.pl), row("Étoiles de l'Aventure", m.stars, o.stars, m.stars, o.stars),
      row("Chrono", m.rc[0], o.rc[0], m.rc[0], o.rc[0]), row("Survie", m.rc[1], o.rc[1], m.rc[1], o.rc[1]), row("Avant ou après", m.rc[2], o.rc[2], m.rc[2], o.rc[2]), row("Série de jours", m.rc[3], o.rc[3], m.rc[3], o.rc[3]),
      row("Atlas · pays", (m.atl || {}).f || 0, (o.atl || {}).f || 0, (m.atl || {}).f || 0, (o.atl || {}).f || 0), row("Atlas · capitales", (m.atl || {}).c || 0, (o.atl || {}).c || 0, (m.atl || {}).c || 0, (o.atl || {}).c || 0),
      ...(o.nb ? [row("Badges", m.nb[0], o.nb[0], m.nb[0], o.nb[0])] : []), row("Collections", m.co.length, o.co.length, m.co.length, o.co.length)].join("");
    const dom = DOMS.map((d, i) => { const a = m.rk[i] || 0, b = o.rk[i] || 0, w = a === b ? 0 : a > b ? 1 : -1;
      return `<div class="cp-d"><span class="cp-rk ${w > 0 ? "win" : ""} ${a ? "" : "off"}">${rankArt(a, d)}</span><span class="cp-dn">${esc(PArt.DOM[d].n)}<small>${a ? RN[a] : "—"} · ${b ? RN[b] : "—"}</small></span><span class="cp-rk ${w < 0 ? "win" : ""} ${b ? "" : "off"}">${rankArt(b, d)}</span></div>`; }).join("");
    const score = DOMS.reduce((t, d, i) => t + Math.sign((m.rk[i] || 0) - (o.rk[i] || 0)), 0);
    const h = API() && API().h2h ? API().h2h(pv.id) : {w:0, d:0, l:0};
    return `<div class="cp"><div class="cp-h"><div>${meSVG(56)}<b>${esc(m.name)}</b></div><span class="cp-vs">VS</span><div>${API() ? API().avatar(pv.id, 56, true) : ""}<b>${esc(o.name)}</b></div></div>
      <div class="cp-box"><div class="label">Face-à-face en duel</div>${h.w + h.d + h.l ? `<div class="cp-h2h"><b class="${h.w > h.l ? "win" : ""}">${h.w}</b><span>${h.w > 1 ? "victoires" : "victoire"} · ${h.d} nul${h.d > 1 ? "s" : ""}</span><b class="${h.l > h.w ? "win" : ""}">${h.l}</b></div>` : `<p class="muted" style="margin:4px 0 0">Vous ne vous êtes jamais affrontés. Lance-lui un duel !</p>`}</div>
      <div class="cp-box"><div class="label">Records</div>${rows}</div>
      <div class="cp-box"><div class="label">Maîtrise des domaines · ${score > 0 ? "tu mènes" : score < 0 ? (esc(o.name) + " mène") : "égalité"}</div>${dom}</div></div>`;
  }

  /* ---------- Écran « Joueurs » de l'onglet Multi ---------- */
  // Point unique pour un futur système d'amis : aujourd'hui, tout le monde est ami avec tout le monde
  const friends = id => true;
  const jo = {q:"", f:"all", s:"online"};
  function players(){
    const api = API(); if (!api) return "";
    const users = api.users(), me = api.uid(), G = typeof Guildes !== "undefined" ? Guildes.mine() : null, gm = (G && G.g && G.g.members) || {};
    const all = Object.keys(users).filter(id => id !== me && friends(id)), on = all.filter(id => api.online(id));
    const q = jo.q.trim().toLowerCase();
    let rows = all.filter(id => !q || String(api.pseudoOf(id)).toLowerCase().includes(q)).filter(id => jo.f === "all" || (jo.f === "on" && api.online(id)) || (jo.f === "guild" && gm[id]));
    const xp = id => txpOf((users[id] && users[id].st) || {});
    rows.sort(jo.s === "lvl" ? (a, b) => xp(b) - xp(a) : jo.s === "name" ? (a, b) => String(api.pseudoOf(a)).localeCompare(String(api.pseudoOf(b))) : (a, b) => (api.online(b) - api.online(a)) || (((users[b] || {}).seen || 0) - ((users[a] || {}).seen || 0)));
    const card = (id, isMe) => { const U = users[id] || {}, st = U.st || {}, cd = isMe ? pub() : st.cd || {}, A = pres(isMe ? totalXp() : txpOf(st));
      const rk = (Array.isArray(cd.rk) ? cd.rk : []).map(clampR), top = DOMS.map((d, i) => [d, rk[i] || 0]).sort((x, y) => y[1] - x[1]).slice(0, 3).filter(x => x[1]);
      const online = isMe || api.online(id);
      return `<div class="jl-card ${isMe ? "me" : ""}" data-see="${id}" role="button" tabindex="0" aria-label="Voir le profil de ${esc(api.pseudoOf(id))}">
        <span class="jl-bn">${PArt.bannerArt(typeof cd.bn === "string" ? cd.bn : "aube")}</span>
        <span class="jl-av">${isMe ? meSVG(58) : api.avatar(id, 58, true)}<i class="st-dot ${online ? "on" : "off"}"></i></span>
        <span class="jl-id"><b>${esc(api.pseudoOf(id))}${isMe ? ` <em class="jl-me">Toi</em>` : ""}</b>${api.title(id, "xs")}<span class="jl-lv"><span class="jl-emb">${emblem(A.P, true)}</span>${A.P >= 10 ? "Maître Prestige" : "Prestige " + A.P} · niv. ${A.L}</span><span class="jl-seen ${online ? "on" : ""}">${isMe ? "C'est toi" : online ? "En ligne" : agoTxt(U.seen)}</span></span>
        <span class="jl-rk">${top.map(([d, r]) => `<span title="${esc(PArt.DOM[d].n)} : ${RN[r]}">${rankArt(r, d)}</span>`).join("")}</span></div>`; };
    const chip = (k, v, l) => `<button class="chip-btn ${jo[k] === v ? "on" : ""}" data-pc="jo" data-k="${k}" data-v="${v}" aria-pressed="${jo[k] === v}">${l}</button>`;
    return `<section class="stack">
      <div class="row between"><button class="quit" data-am="multi" data-v="home">← Multi</button><span class="label">${all.length} joueurs</span></div>
      <h1 class="big" style="margin:0">Joueurs</h1>
      <label class="jl-search"><span aria-hidden="true">🔍</span><input id="jo-q" type="search" placeholder="Rechercher un pseudo" value="${esc(jo.q)}" autocomplete="off" aria-label="Rechercher un joueur"></label>
      <div class="row" style="gap:6px;flex-wrap:wrap">${chip("f", "all", "Tous")}${chip("f", "on", `En ligne · ${on.length}`)}${G ? chip("f", "guild", "Ma guilde") : ""}</div>
      <div class="row" style="gap:6px;align-items:center;flex-wrap:wrap"><span class="label">Trier</span>${chip("s", "online", "En ligne d'abord")}${chip("s", "lvl", "Niveau")}${chip("s", "name", "Pseudo")}</div>
      ${!q && jo.f === "all" ? card(me, true) : ""}
      ${rows.map(id => card(id)).join("") || `<div class="card"><p class="muted" style="margin:0">Aucun joueur ne correspond.</p></div>`}
      <p class="muted" style="font-size:13px;text-align:center">Touche un joueur pour voir son profil et te comparer à lui. Le statut se met à jour quand chacun ouvre l'appli.</p>
    </section>`;
  }
  document.addEventListener("input", e => { if (e.target.id !== "jo-q") return; jo.q = e.target.value; const pos = e.target.selectionStart; render(); const n = document.getElementById("jo-q"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch(err){} } });
  const hubInfo = () => { const api = API(); if (!api) return null; const ids = Object.keys(api.users()).filter(id => id !== api.uid() && friends(id)); return {n:ids.length, on:ids.filter(id => api.online(id)).length, ids}; };

  function click(b){
    const d = b.dataset, c = C();
    if (d.pc === "close") return closePv();
    if (d.pc === "jo") { jo[d.k] = d.v; return render(); }
    if (d.pc === "duel") { const id = pv && pv.id; closePv(); if (id && API() && API().pickOpponent) API().pickOpponent(id); return; }
    if (d.pc === "cmp" || d.pc === "card") { if (pv) { pv.mode = d.pc; paintPv(); pv.el.scrollTop = 0; } return; }
    if (d.pc === "edit") editing = !editing;
    else if (d.pc === "bn" && okBan(d.v)) c.bn = d.v;
    else if (d.pc === "fr" && okFr(d.v)) c.fr = d.v;
    else if (d.pc === "bd" && S.badges[d.v]) { if (!c.bd.length) c.bd = []; const i = c.bd.indexOf(d.v); if (i >= 0) c.bd.splice(i, 1); else { c.bd.push(d.v); if (c.bd.length > 3) c.bd.shift(); } }
    save(); render();
  }

  return {DOMS, pres, mast, name, label, emblem, mini, rankArt, progress, check, checkColl, collections, titles:TITLES_C, txpOf, boardTxt, myCard, cardHTML, myCardBlock, click, pub, see, players, hubInfo};
})();
