/* ---------- Boutique du jour, Prestige, Parchemin de révélation et Collection complète (refonte de novembre 2026) ----------
   Choix d'Erwan :
   - 4 personnages par jour en boutique, tirés au hasard parmi ceux « de boutique », les mêmes pour tout le monde
     (le tirage dépend de la date de Paris : personne ne peut le relancer). Renouvellement à minuit, heure de Paris.
   - Prestige : les plus beaux personnages, très chers, achetables à tout moment (pièces uniquement, pas d'argent réel).
   - Défis permanents et défi de la semaine (un personnage vedette par semaine).
   - Parchemin de révélation (3 000 pièces) : dévoile le défi d'un personnage secret.
   - Cinq raretés : Commun, Rare, Épique, Légendaire, Mythique. */
const Boutique = (() => {
  const RAR = {com:{n:"Commun", c:"#8A96AA", w:6}, rare:{n:"Rare", c:"#3A7AE0", w:5}, epic:{n:"Épique", c:"#9A4AD8", w:3}, leg:{n:"Légendaire", c:"#E8960A", w:2}, myth:{n:"Mythique", c:"#E2283A", w:1}};
  const RORD = ["myth", "leg", "epic", "rare", "com"];
  const HOW = {shop:"Boutique du jour", prestige:"Prestige", quest:"Défi permanent", week:"Défi de la semaine", portal:"Portail et Boss", secret:"Secret", season:"Édition Halloween", start:"Départ"};
  const REVEAL_PRICE = 3000;
  const towerBest = () => { try { return Tour.stats().best || 0; } catch(e){ return 0; } };
  // Les nouvelles Légendes : comment on les obtient
  const LEG = {
    numero7:{how:"shop", p:2500}, pulga:{how:"shop", p:2500}, pop:{how:"shop", p:2500, r:"leg"}, pirate:{how:"shop", p:2200}, clown:{how:"shop", p:2200}, goule:{how:"shop", p:2000}, corbeau:{how:"shop", p:2200},
    fleaux:{how:"prestige", p:10000}, seigneur:{how:"prestige", p:8000}, sparte:{how:"prestige", p:7000}, empereur:{how:"prestige", p:6000},
    sabreur:{how:"quest", cond:"Atteindre l'étage 50 de la Tour", goal:50, cur:towerBest},
    dragon:{how:"quest", cond:"30 bonnes réponses d'affilée dans une partie solo", goal:30, cur:() => (S.st && S.st.bestCombo) || 0},
    agent:{how:"quest", cond:"Gagner 25 duels en ligne", goal:25, cur:() => (S.online && S.online.wins) || 0},
    spartiate:{how:"week", cond:"Gravir 60 étages de la Tour dans la semaine", k:"tower", goal:60},
    shinigami:{how:"week", cond:"Infliger 15 PV au Boss dans la semaine", k:"boss", goal:15},
    notorious:{how:"week", cond:"Remporter 10 parties multijoueurs dans la semaine", k:"win", goal:10},
    titan:{how:"week", cond:"Ouvrir le coffre légendaire des défis de la semaine", k:"chest", goal:1}
  };
  LEGEND_SKINS.forEach(s => { const L = LEG[s.id]; if (L && L.p) s.p = L.p; if (L && L.r) s.r = L.r; });
  const WEEK_ROT = ["spartiate", "shinigami", "notorious", "titan"];
  // Conditions des secrets (affichées seulement une fois révélées ou obtenues)
  const SECRET_COND = {lumen:{cond:"Répondre juste à 1 000 questions au total", goal:1000, cur:() => totalOk()}};

  /* --- Heure de Paris --- */
  const parisParts = () => { const p = {}; new Intl.DateTimeFormat("fr-FR", {timeZone:"Europe/Paris", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hourCycle:"h23"}).formatToParts(new Date()).forEach(x => p[x.type] = x.value); return p; };
  const parisDay = () => { const p = parisParts(); return `${p.year}-${p.month}-${p.day}`; };
  const weekOf = day => { const d = new Date(day + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
  const WK = () => weekOf(parisDay());
  const untilMidnight = () => { const p = parisParts(); const m = 24 * 60 - (+p.hour * 60 + +p.minute); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`; };

  /* --- Catalogue : rareté et façon d'obtenir chaque personnage --- */
  const portalIds = () => PORTAL_SKINS.map(s => s.id);
  function info(id){
    const sk = skinOf(id); if (!sk) return null;
    if (/^b\d+$/.test(id)) return {id, sk, r:"com", how:"start"};
    if (LEG[id]) { const L = LEG[id]; return Object.assign({id, sk, r:sk.r || "leg", p:L.p}, L); }
    if (portalIds().includes(id)) return {id, sk, r:"leg", how:"portal", cond:"Gagné au Portail ou contre le Boss de la semaine"};
    if (id === "lumen") return Object.assign({id, sk, r:"myth", how:"secret"}, SECRET_COND.lumen);
    if (SECRET_SKINS.some(s => s.id === id)) return {id, sk, r:"epic", how:"secret", cond:sk.hint};
    if (HALLOWEEN_SKINS.some(s => s.id === id)) return {id, sk, r:"epic", how:"season", p:sk.p};
    if (sk.free) return {id, sk, r:"rare", how:"quest", cond:sk.hint, goal:id === "nord" ? 1 : 0, cur:id === "nord" ? () => (S.online && S.online.wins) || 0 : null};
    if (sk.unlock && !sk.p) return {id, sk, r:"rare", how:"quest", cond:`${sk.unlock.n} bonnes réponses en ${THEMES[sk.unlock.th].n}`, goal:sk.unlock.n, cur:() => correctIn(sk.unlock.th)};
    const r = sk.p >= 500 ? "epic" : sk.p >= 400 ? "rare" : "com";
    const o = {id, sk, r, how:"shop", p:sk.p};
    if (sk.unlock) { o.alt = `ou ${sk.unlock.n} bonnes réponses en ${THEMES[sk.unlock.th].n}`; o.goal = sk.unlock.n; o.cur = () => correctIn(sk.unlock.th); }
    return o;
  }
  const allIds = () => CHARS.map((c, i) => "b" + i).concat(SHOP_SKINS.map(s => s.id), SECRETS.map(s => s.id), LEGEND_SKINS.map(s => s.id)).filter((x, i, a) => a.indexOf(x) === i);
  const own = id => ownsSkin(id);

  /* --- Boutique du jour : 4 personnages, mêmes pour tous, tirés selon la date --- */
  let dayCache = {d:"", ids:[]};
  function daily(){
    const d = parisDay(); if (dayCache.d === d) return dayCache.ids;
    const r = rng(+d.replace(/-/g, "") * 7919 + 17), pool = allIds().map(info).filter(x => x && x.how === "shop"), ids = [];
    while (ids.length < 4 && ids.length < pool.length) {
      const left = pool.filter(x => !ids.includes(x.id)), tot = left.reduce((a, x) => a + RAR[x.r].w, 0); let v = r() * tot;
      for (const x of left) { v -= RAR[x.r].w; if (v <= 0) { ids.push(x.id); break; } }
    }
    dayCache = {d, ids}; return ids;
  }
  const featured = () => { const n = Math.round(new Date(WK() + "T12:00:00Z") / 6048e5); return WEEK_ROT[((n % WEEK_ROT.length) + WEEK_ROT.length) % WEEK_ROT.length]; };
  // Peut-on acheter ce personnage maintenant ?
  function buyable(id){ const i = info(id); if (!i || own(id)) return false;
    return (i.how === "shop" && daily().includes(id)) || i.how === "prestige" || (i.how === "season" && halloweenSeason()); }

  /* --- Progression des défis --- */
  const W = () => { S.legW = S.legW && S.legW.wk === WK() ? S.legW : {wk:WK(), tower:0, boss:0, win:0, chest:0}; return S.legW; };
  function ev(type, info_){
    if (!S || !S.profile) return; info_ = info_ || {};
    const w = W();
    if (type === "tower") w.tower += info_.v || 1;
    else if (type === "bossdmg") w.boss += info_.v || 1;
    else if (type === "mp" && info_.win) w.win++;
    else if (type === "wchest") w.chest = 1;
    else if (type === "combo") { S.st = S.st || {}; S.st.bestCombo = Math.max(S.st.bestCombo || 0, info_.v || 0); }
    else return;
    check();
  }
  function progress(i){
    if (i.how === "week") { const v = i.id === featured() ? (W()[i.k] || 0) : 0; return {v:Math.min(v, i.goal), goal:i.goal}; }
    if (i.cur && i.goal) return {v:Math.min(i.cur(), i.goal), goal:i.goal};
    return null;
  }
  function check(){
    Object.keys(LEG).forEach(id => { const i = info(id); if (own(id) || !(i.how === "quest" || i.how === "week")) return;
      if (i.how === "week" && id !== featured()) return;
      const p = progress(i); if (p && p.v >= p.goal) unlockSkin(id); });
  }

  /* --- Cartes --- */
  const rTag = r => `<span class="bq-r" style="--rc:${RAR[r].c}">${RAR[r].n}</span>`;
  const eqOf = id => S.profile.skin ? S.profile.skin === id : id === "b" + S.profile.avatar;
  function foot(i, ctx){
    if (own(i.id)) return eqOf(i.id) ? `<span class="chip lamp">Équipé</span>` : `<button class="btn small ghost" data-equip="${i.id}">Équiper</button>`;
    if (buyable(i.id) && (ctx === "shop" || i.how === "prestige" || i.how === "season")) return `<button class="btn small" data-buy="${i.id}" ${S.coins >= i.p ? "" : "disabled"}>${coinIco}${i.p.toLocaleString("fr-FR")}</button>`;
    return "";
  }
  const secretHidden = i => i.how === "secret" && !own(i.id) && !(S.revealed && S.revealed[i.id]);
  function card(i, ctx){
    const o = own(i.id), hid = secretHidden(i), p = !o && !hid ? progress(i) : null, inShop = i.how === "shop" && daily().includes(i.id);
    const how = i.how === "shop" ? (inShop ? "En boutique aujourd'hui" : "Boutique du jour · pas aujourd'hui") : i.how === "week" ? (i.id === featured() ? "Défi de cette semaine" : "Défi de la semaine · une autre semaine") : HOW[i.how];
    const cond = hid ? "Défi caché. Le Parchemin de révélation peut le dévoiler." : i.cond ? i.cond : i.how === "shop" ? `${(i.p || 0).toLocaleString("fr-FR")} pièces quand il est en boutique${i.alt ? " · " + i.alt : ""}` : i.how === "prestige" ? `${i.p.toLocaleString("fr-FR")} pièces, à tout moment` : i.how === "season" ? `${i.p} pièces en octobre et novembre` : "";
    return `<div class="bq-card r-${i.r} ${o ? "own" : "no"} ${hid ? "hid" : ""}" style="--rc:${RAR[i.r].c}">${inShop && ctx !== "shop" ? `<i class="bq-today">Aujourd'hui</i>` : ""}
      <div class="bq-art">${creatureSVG(i.sk, ctx === "shop" ? 96 : 76)}</div>
      ${rTag(i.r)}<b class="bq-n">${hid ? "???" : esc(i.sk.n)}</b>
      ${ctx === "shop" ? "" : `<span class="bq-how">${esc(how)}</span>`}
      ${o || ctx === "shop" && i.how === "shop" ? "" : `<span class="bq-cond">${esc(cond)}</span>`}
      ${p ? `<span class="meter bq-meter"><i style="width:${Math.round(p.v / p.goal * 100)}%"></i></span><span class="bq-pv">${p.v.toLocaleString("fr-FR")} / ${p.goal.toLocaleString("fr-FR")}</span>` : ""}
      ${foot(i, ctx)}</div>`;
  }

  /* --- Onglet « Personnages » de la boutique --- */
  function shopView(){
    check();
    const day = daily().map(info), wk = info(featured()), wp = progress(wk), prest = Object.keys(LEG).filter(id => LEG[id].how === "prestige").map(info).sort((a, b) => b.p - a.p);
    const secretsLeft = allIds().map(info).filter(i => i && i.how === "secret" && !own(i.id) && !(S.revealed && S.revealed[i.id]));
    return `<div class="bq-head"><div class="stack" style="gap:2px"><b class="bq-title">Boutique du jour</b><span class="muted" style="font-size:13px">4 personnages, les mêmes pour tout le monde</span></div><span class="bq-timer">${gIcon("chrono", 22)}Nouvelle sélection dans <b>${untilMidnight()}</b></span></div>
      <div class="bq-grid">${day.map(i => card(i, "shop")).join("")}</div>
      <div class="label">Défi de la semaine</div>
      <div class="bq-week r-${wk.r}" style="--rc:${RAR[wk.r].c}"><div class="bq-art">${creatureSVG(wk.sk, 92)}</div><div class="stack" style="gap:5px;min-width:0">${rTag(wk.r)}<b>${esc(wk.sk.n)}</b><span class="muted" style="font-size:13.5px">${esc(wk.cond)}</span>
        ${own(wk.id) ? `<span class="chip lamp">Obtenu</span>` : `<span class="meter"><i style="width:${Math.round(wp.v / wp.goal * 100)}%"></i></span><span class="bq-pv">${wp.v} / ${wp.goal} · jusqu'à dimanche soir</span>`}</div></div>
      ${halloweenSeason() ? `<div class="label">🎃 Édition Halloween · jusqu'au 30 novembre</div><div class="bq-grid">${HALLOWEEN_SKINS.map(s => card(info(s.id), "season")).join("")}</div>` : ""}
      <div class="label">Prestige · achetables à tout moment</div>
      <div class="bq-grid">${prest.map(i => card(i, "prestige")).join("")}</div>
      <div class="bq-scroll"><div class="bq-scroll-ic">${scrollSVG(64)}</div><div class="stack" style="gap:4px;min-width:0"><b>Parchemin de révélation</b><span class="muted" style="font-size:13px">Dévoile le défi d'un personnage secret que tu n'as pas encore. ${secretsLeft.length} secret${secretsLeft.length > 1 ? "s" : ""} encore caché${secretsLeft.length > 1 ? "s" : ""}.</span>
        <button class="btn small" data-bq="reveal" ${secretsLeft.length && S.coins >= REVEAL_PRICE ? "" : "disabled"}>${coinIco}${REVEAL_PRICE.toLocaleString("fr-FR")}</button></div></div>
      <button class="btn ghost" data-shopseg="collection">Voir toute la collection</button>`;
  }
  const scrollSVG = z => `<svg viewBox="0 0 64 64" width="${z}" height="${z}" aria-hidden="true"><defs><linearGradient id="bqp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4D8"/><stop offset="1" stop-color="#E8C890"/></linearGradient></defs>
    <rect x="12" y="10" width="40" height="44" rx="4" fill="url(#bqp)" stroke="${TD}" stroke-width="2.6"/><rect x="6" y="6" width="52" height="10" rx="5" fill="#C8965A" stroke="${TD}" stroke-width="2.6"/><rect x="6" y="48" width="52" height="10" rx="5" fill="#C8965A" stroke="${TD}" stroke-width="2.6"/>
    <path d="M20 24 h24 M20 31 h18 M20 38 h22" stroke="#A8845A" stroke-width="2.4" stroke-linecap="round"/><circle cx="44" cy="38" r="7" fill="#E2283A" stroke="${TD}" stroke-width="2"/><path d="M41 38 h6 M44 35 v6" stroke="#FFD8D8" stroke-width="1.6"/></svg>`;

  /* --- Onglet Collection : tout voir --- */
  let fOwn = "all", fHow = "all", fRar = "all";
  function collectionView(){
    check();
    const all = allIds().map(info).filter(Boolean), n = all.filter(i => own(i.id)).length;
    const list = all.filter(i => (fOwn === "all" || (fOwn === "own") === own(i.id)) && (fHow === "all" || i.how === fHow || (fHow === "quest" && i.how === "week")) && (fRar === "all" || i.r === fRar))
      .sort((a, b) => (own(b.id) - own(a.id)) || RORD.indexOf(a.r) - RORD.indexOf(b.r));
    const chip = (k, v, lab, cur) => `<button class="chip-btn ${cur === v ? "on" : ""}" data-bq="${k}" data-v="${v}">${lab}</button>`;
    return `<div class="bq-col-top"><b>${n} / ${all.length} personnages</b><span class="meter"><i style="width:${Math.round(n / all.length * 100)}%"></i></span></div>
      <div class="bq-filters">${[["all", "Tous"], ["own", "Possédés"], ["no", "Manquants"]].map(([v, l]) => chip("own", v, l, fOwn)).join("")}</div>
      <div class="bq-filters">${[["all", "Toutes origines"], ["shop", "Boutique"], ["prestige", "Prestige"], ["quest", "Défis"], ["portal", "Portail"], ["secret", "Secrets"], ["season", "Halloween"], ["start", "Départ"]].map(([v, l]) => chip("how", v, l, fHow)).join("")}</div>
      <div class="bq-filters">${chip("rar", "all", "Toutes raretés", fRar)}${RORD.map(r => chip("rar", r, RAR[r].n, fRar)).join("")}</div>
      <div class="bq-grid col">${list.map(i => card(i, "col")).join("") || `<p class="muted">Aucun personnage avec ces filtres.</p>`}</div>`;
  }

  function click(b){
    const a = b.dataset.bq, v = b.dataset.v;
    if (a === "own") fOwn = v; else if (a === "how") fHow = v; else if (a === "rar") fRar = v;
    else if (a === "reveal") {
      const left = allIds().map(info).filter(i => i && i.how === "secret" && !own(i.id) && !(S.revealed && S.revealed[i.id]));
      if (!left.length || S.coins < REVEAL_PRICE) return render();
      const i = left[Math.floor(Math.random() * left.length)]; S.coins -= REVEAL_PRICE; spend(REVEAL_PRICE); S.revealed = S.revealed || {}; S.revealed[i.id] = today();
      toasts.push(`<b>Le parchemin révèle un secret…</b> · ${esc(i.sk.n)} : ${esc(i.cond)}`); save();
    }
    render();
  }
  return {shopView, collectionView, click, buyable, ev, check, info, daily, featured, RAR};
})();
