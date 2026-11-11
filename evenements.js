/* ---------- Événements temporaires, fragments de personnages et jetons rares (novembre 2026) ----------
   Réglages : evenements_data.js (EV_DATA). Serveur : functions/index.js (Firebase Cloud Functions).
   - Pendant un événement, chaque bonne réponse (tous les modes) envoie une clé unique au serveur, par petits paquets.
     Le serveur tire au sort (3 %) et, en cas de chance, donne un fragment d'un des personnages de l'événement
     pas encore adoptés. 6 fragments du même personnage = il est débloqué (les 6 fragments sont consommés).
   - Jetons rares (Double pièces, Double XP, 50/50) : un seul de chaque type, gardés par le serveur dans inv/{uid}.
     Le téléphone ne fait que lire ce document. Les pièces de remplacement (jeton déjà possédé) et les achats
     sont appliqués une seule fois grâce à leur clé (S.ev.paid / S.ev.spent).
   - Sans compte : pas de fragments ; les jetons restent sur l'appareil (S.inv), comme les potions du calendrier. */
const Evenements = (() => {
  const D = EV_DATA, REG = "europe-west1";
  let inv = null, unsub = null, who = null, fnLoad = null, q = [], qTimer = null, sending = false, asked = {};
  const st = () => { S.ev = S.ev || {}; ["paid", "spent", "seen", "migr", "frag"].forEach(k => S.ev[k] = S.ev[k] || {}); return S.ev; };
  const online = () => { try { return !!(Amis.api.uid() && Amis.api.db()); } catch(e){ return false; } };
  const live = () => online() && !!inv;                      // l'inventaire du serveur est chargé
  const now = () => Date.now();
  const cur = () => D.EVENTS.find(e => now() >= Date.parse(e.start) && now() <= Date.parse(e.end)) || null;
  const lastEv = () => cur() || D.EVENTS.slice().reverse().find(e => now() > Date.parse(e.end)) || D.EVENTS[0];
  const evOf = id => D.EVENTS.find(e => e.chars.includes(id));
  const skin = id => skinOf(id);

  /* --- Appels au serveur --- */
  async function call(name, data){
    if (!fnLoad) fnLoad = (async () => { const f = Amis.api.fb(); if (!f.functions) await new Promise((ok, ko) => { const s = document.createElement("script"); s.src = `https://www.gstatic.com/firebasejs/${FB_VER}/firebase-functions-compat.js`; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); })();
    try { await fnLoad; } catch(e){ fnLoad = null; throw e; }
    const r = await Amis.api.fb().app().functions(REG).httpsCallable(name)(data || {}); return r.data;
  }
  const key = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /* --- Inventaire du serveur (lecture en direct) --- */
  function listen(){
    if (!online()) return; const uid = Amis.api.uid(); if (unsub && who === uid) return;
    stop(); who = uid;
    unsub = Amis.api.db().doc("inv/" + uid).onSnapshot(s => {
      inv = Object.assign({frag:{}, evSkins:{}, tok:{}, grants:{}, pay:{}, spent:{}, fragTot:{}}, s.exists ? s.data() : {});
      reconcile(); migrate(); retro(); refresh();
    }, () => {});
  }
  function stop(){ if (unsub) { try { unsub(); } catch(e){} } unsub = null; inv = null; who = null; asked = {}; }
  // Applique une seule fois ce que le serveur a décidé : pièces de remplacement, achats, personnages débloqués
  function reconcile(){
    const s = st(); let ch = false;
    Object.keys(inv.pay || {}).forEach(k => { if (s.paid[k]) return; s.paid[k] = 1; const v = +inv.pay[k] || 0; if (v > 0) { S.coins += v; } ch = true; });
    Object.keys(inv.spent || {}).forEach(k => { if (s.spent[k]) return; s.spent[k] = 1; const v = +inv.spent[k] || 0; S.coins = Math.max(0, S.coins - v); spend(v); ch = true; });
    Object.keys(inv.frag || {}).forEach(e => { s.frag[e] = Object.assign({}, inv.frag[e]); });
    Object.keys(inv.evSkins || {}).forEach(id => { if (!S.skins[id] && skin(id) && !s.seen[id]) { S.skins[id] = today(); s.seen[id] = s.seen[id] || 0; ch = true; } });
    if (ch) { save(); checkBadges(); }
  }
  // Potions gagnées avec le calendrier avant le serveur : transférées une seule fois
  function migrate(){
    const s = st(), loc = S.inv || {};
    ["xp", "coin"].forEach(t => { const x = loc[t] || {}; if (s.migr[t] || !((x.got || 0) > (x.used || 0))) return; s.migr[t] = 1; save();
      call("grant", {src:"migr", t}).then(() => { loc[t] = Object.assign({}, x, {used:Date.now()}); save(); }).catch(() => { s.migr[t] = 0; }); });
  }
  // Récompenses déjà méritées avant l'arrivée des jetons : paliers de la Tour, boss vaincu cette semaine
  function retro(){
    const t = S.tour || {};
    Object.keys(D.TOWER).forEach(f => { if ((t.cp || 0) >= +f && !inv.grants["tour:" + f]) tower(+f, true); });
    try { const wk = Boss.current().wk; if (S.boss && S.boss.claimed && S.boss.claimed[wk] && !inv.grants["boss:" + wk]) boss(wk, true); } catch(e){}
  }
  // Mise à jour de l'écran sans casser une partie en cours
  function refresh(){
    if (!S.profile) return;
    if (inPlay() || (typeof Boss !== "undefined" && Boss.open && Boss.open())) { const p = document.querySelector(".hud .pills"); if (p) { const old = p.querySelector(".pill.pot"); const html = Potions.pill(); if (old) old.outerHTML = html || ""; else if (html) p.insertAdjacentHTML("afterbegin", html); } return; }
    window.__quiet = true; render();
  }

  /* --- Fragments : une clé par bonne réponse, envoyées toutes les 2 secondes --- */
  function onCorrect(){
    if (!cur() || !online()) return;
    q.push({k:key("a"), n:0}); if (q.length > 40) q = q.slice(-40);
    if (!qTimer) qTimer = setTimeout(flush, 2000);
  }
  async function flush(){
    qTimer = null; if (sending || !q.length) return; sending = true;
    const pack = q.slice(0, 5);
    try {
      const e = cur(), r = await call("draw", {keys:pack.map(x => x.k), own:e ? e.chars.filter(c => S.skins[c]) : []});
      q = q.filter(x => !pack.includes(x));
      (r.won || []).forEach((w, i) => setTimeout(() => fragFx(w), i * 900));
    } catch(e){ pack.forEach(x => x.n++); q = q.filter(x => x.n < 3); }
    sending = false; if (q.length) qTimer = setTimeout(flush, 2000);
  }
  // Petite notification discrète, sans interrompre la partie
  function fragFx(w){
    const sk = skin(w.c), ev = evOf(w.c); if (!sk || !ev) return;
    const n = w.unlocked ? ev.need : ((inv && inv.frag[ev.id] && inv.frag[ev.id][w.c]) || 0);
    const el = document.createElement("div"); el.className = "ev-frag" + (w.unlocked ? " big" : ""); el.setAttribute("role", "status");
    el.innerHTML = `${shard(26, ev.look)}<span><b>+1 fragment</b> · ${esc(sk.n)}${w.unlocked ? " · complet !" : ` <i>${Math.min(n, ev.need)}/${ev.need}</i>`}</span>`;
    document.body.appendChild(el); try { Music.sfx("ok"); } catch(e){}
    setTimeout(() => el.classList.add("out"), 2600); setTimeout(() => el.remove(), 3100);
    if (w.unlocked) setTimeout(celebrate, 3200);
  }
  // Grande annonce d'un personnage débloqué, dès qu'on n'est plus en pleine partie
  function celebrate(){
    const s = st(); const id = Object.keys(s.seen).find(k => !s.seen[k] && S.skins[k]); if (!id) return;
    if (inPlay() || document.querySelector(".ev-unlock")) return;
    s.seen[id] = Date.now(); save();
    const sk = skin(id), el = document.createElement("div"); el.className = "ev-unlock cal-veil"; el.setAttribute("role", "dialog");
    el.innerHTML = `<div class="ev-ul-box"><div class="ev-ul-rays"></div><span class="tw-kicker">Événement · 6 fragments réunis</span><div class="ev-ul-art">${creatureSVG(sk, 150)}</div>
      <b class="cal-title">${esc(sk.n)}</b><span class="muted" style="text-align:center">rejoint ta collection pour toujours.</span>
      <div class="row" style="gap:8px;justify-content:center"><button class="btn" data-evu="wear">Le porter</button><button class="btn ghost" data-evu="ok">Génial !</button></div></div>`;
    el.addEventListener("click", e => { const b = e.target.closest("[data-evu]"); if (!b && e.target !== el) return;
      if (b && b.dataset.evu === "wear") { S.profile.skin = id; save(); try { Amis.api.ping(); } catch(x){} }
      el.remove(); render(); });
    document.body.appendChild(el); try { Music.sfx("level"); } catch(e){}
  }

  /* --- Jetons --- */
  const has = t => !!(inv && inv.tok[t] && inv.tok[t].n > 0);
  const until = t => (inv && inv.tok[t] && inv.tok[t].until) || 0;
  const label = got => { if (!got) return ""; if (got.startsWith("tok:")) return D.TOKENS[got.slice(4)].n; if (got.startsWith("coins:")) return "+" + got.slice(6) + " pièces (jeton déjà possédé)"; return ""; };
  async function grant(data, k, quiet, intro){
    if (!online() || asked[k]) return null; asked[k] = 1;
    try { const r = await call("grant", data); if (!quiet || !r.dup) { const l = label(r.got); if (l && !r.dup) { toasts.push(`<b>${intro}</b> · ${esc(l)}`); if (!inPlay()) render(); } } return r; }
    catch(e){ asked[k] = 0; return null; }
  }
  function tower(f, quiet){
    const t = D.TOWER[f]; if (!t) return;
    if (online()) return grant({src:"tour", f}, "tour:" + f, quiet, `Palier ${f} de la Tour`);
    const s = S.tour = S.tour || {}; s.tok = s.tok || {}; if (s.tok[f]) return; s.tok[f] = today();   // sans compte
    if (Potions.give(t)) toasts.push(`<b>Palier ${f} de la Tour</b> · ${D.TOKENS[t].n}`); else { S.coins += D.SWAP; toasts.push(`<b>Palier ${f} de la Tour</b> · +${D.SWAP} pièces (jeton déjà possédé)`); }
    save();
  }
  const boss = (wk, quiet) => grant({src:"boss", wk}, "boss:" + wk, quiet, "Boss vaincu");
  const cal = n => grant({src:"cal", n}, "cal:" + n, true, "Calendrier");
  async function use(t){
    if (!has(t)) return false;
    const x = inv.tok[t], back = Object.assign({}, x);
    inv.tok[t] = Object.assign({}, x, {n:0}, D.TOKENS[t].dur ? {until:Date.now() + D.TOKENS[t].dur * 6e4} : {});   // affichage immédiat
    call("use", {t}).then(r => { if (!r.ok) { inv.tok[t] = back; refresh(); } }).catch(() => { inv.tok[t] = back; toasts.push("<b>Jeton non utilisé</b> · vérifie ta connexion."); refresh(); });
    return true;
  }
  let buying = false;
  async function buy(t){
    if (buying || !D.TOKENS[t] || S.coins < D.PRICE) return;
    if (!online()) { // sans compte : achat sur l'appareil
      if (Potions.has(t)) return; S.coins -= D.PRICE; spend(D.PRICE); Potions.give(t); toasts.push(`<b>${D.TOKENS[t].n}</b> · acheté`); save(); return render();
    }
    if (!live() || has(t)) return;
    buying = true; render();
    try { const r = await call("buy", {t, key:key("b")}); toasts.push(r.ok ? `<b>${D.TOKENS[t].n}</b> · acheté pour ${D.PRICE.toLocaleString("fr-FR")} pièces` : "<b>Tu as déjà ce jeton</b> · utilise-le d'abord."); }
    catch(e){ toasts.push("<b>Achat impossible pour l'instant</b> · vérifie ta connexion. Aucune pièce n'a été retirée."); }
    buying = false; render();
  }
  // Bloc de la boutique : les 3 jetons
  function shopBlock(){
    const rows = Object.keys(D.TOKENS).map(t => { const own = Potions.has(t), wait = online() && !live();
      const btn = own ? `<span class="chip lamp">Possédé</span>` : `<button class="btn small" data-evb="${t}" ${S.coins >= D.PRICE && !buying && !wait ? "" : "disabled"}>${coinIco}${D.PRICE.toLocaleString("fr-FR")}</button>`;
      return `<div class="ev-tok">${Potions.svg(t, 44)}<div class="stack grow" style="gap:2px;min-width:0"><b>${Potions.T[t].n}</b><span class="muted" style="font-size:12.5px">${Potions.T[t].d}</span></div>${btn}</div>`; }).join("");
    return `<div class="label">Objets rares · un seul de chaque</div><div class="card ev-toks">${rows}<span class="muted" style="font-size:12px">Aussi offerts aux paliers 30, 60 et 90 de la Tour et contre le Boss de la semaine (5 PV de dégâts).</span></div>`;
  }

  /* --- Affichage --- */
  const left = e => Math.max(0, Date.parse(e.end) - now());
  const leftTxt = e => { const ms = left(e), d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    return d > 0 ? `${d} j ${h} h` : h > 0 ? `${h} h ${m} min` : `${m} min`; };
  const fragOf = (e, c) => (inv ? (inv.frag[e.id] || {})[c] : (st().frag[e.id] || {})[c]) || 0;
  const totOf = e => (inv && inv.fragTot && inv.fragTot[e.id]) || 0;
  function shard(z, look){ const id = "evs" + Math.random().toString(36).slice(2, 6);
    return `<svg viewBox="0 0 40 40" width="${z}" height="${z}" class="ev-shard" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFC46A"/><stop offset=".55" stop-color="#FF6A2A"/><stop offset="1" stop-color="#8A2AD8"/></linearGradient></defs>
      <path d="M20 3 L33 15 L27 37 L10 31 L6 13Z" fill="url(#${id})" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/><path d="M20 3 L20 22 L33 15 M20 22 L27 37 M20 22 L10 31 M20 22 L6 13" stroke="${TD}" stroke-width="1.2" opacity=".35" fill="none"/><path d="M12 14 L18 8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/></svg>`; }
  // Bannière : nuit d'Halloween (lune, manoir, chauves-souris, citrouilles, brume)
  function banner(e){
    const bats = [[60, 40, 1, 0], [250, 28, .8, -1.2], [300, 62, .6, -2.1], [110, 22, .55, -.6]].map(([x, y, s, d]) => `<g class="ev-bat" style="animation-delay:${d}s"><path transform="translate(${x} ${y}) scale(${s})" d="M0 0 Q-6 -8 -16 -6 Q-12 -2 -14 4 Q-8 0 -4 4 Q-2 -2 0 2 Q2 -2 4 4 Q8 0 14 4 Q12 -2 16 -6 Q6 -8 0 0Z" fill="#0C0614"/></g>`).join("");
    const pump = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -14 q2 -8 7 -9" stroke="#3A6A2A" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="18" ry="14" fill="#F07A1E" stroke="${TD}" stroke-width="2.4"/><path d="M-6 -13 Q-10 0 -6 13 M6 -13 Q10 0 6 13" stroke="#B84A0A" stroke-width="1.6" fill="none"/><path d="M-9 -4 l4 -4 l4 4Z M5 -4 l4 -4 l4 4Z M-10 4 Q0 12 10 4 L7 6 L4 4 L0 7 L-4 4 L-7 6Z" fill="#FFE36A" class="ev-glow"/></g>`;
    return `<svg viewBox="0 0 360 190" class="ev-banner-art" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
        <linearGradient id="evsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#160A2E"/><stop offset=".6" stop-color="#4A1A5A"/><stop offset="1" stop-color="#8A2A3A"/></linearGradient>
        <radialGradient id="evmoon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".7" stop-color="#FFD88A"/><stop offset="1" stop-color="#FFB84A" stop-opacity="0"/></radialGradient></defs>
      <rect width="360" height="190" fill="url(#evsky)"/>
      ${[[30, 20], [90, 50], [150, 14], [200, 40], [330, 24], [280, 12], [20, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff" opacity=".7" class="ev-star"/>`).join("")}
      <circle cx="268" cy="62" r="56" fill="url(#evmoon)" opacity=".55"/><circle cx="268" cy="62" r="34" fill="#FFF0C8"/><circle cx="258" cy="54" r="5" fill="#F2DCA8"/><circle cx="278" cy="72" r="7" fill="#F2DCA8"/>
      ${bats}
      <path d="M0 150 Q60 120 120 140 Q180 112 250 136 Q310 118 360 132 V190 H0Z" fill="#1E0C26"/>
      <g fill="#0C0614"><path d="M150 140 V96 L170 76 L190 96 V140Z"/><path d="M176 96 V60 L188 46 L200 60 V140 H176Z"/><path d="M196 140 V104 L214 88 L232 104 V140Z"/><rect x="183" y="40" width="3" height="10"/></g>
      <g fill="#FFC84A" class="ev-glow"><rect x="160" y="106" width="6" height="8"/><rect x="185" y="72" width="6" height="8"/><rect x="210" y="112" width="6" height="8"/></g>
      <path d="M0 166 Q90 150 180 164 Q270 150 360 162 V190 H0Z" fill="#12061A"/>
      ${pump(54, 162, 1.1)}${pump(92, 172, .7)}${pump(320, 168, .9)}
      <g class="ev-fog"><ellipse cx="80" cy="176" rx="120" ry="12" fill="#C8B8E8" opacity=".14"/><ellipse cx="280" cy="180" rx="140" ry="12" fill="#C8B8E8" opacity=".12"/></g></svg>`;
  }
  // Bouton en haut à droite de l'accueil
  function homeBtn(){
    const e = cur(); if (!e) return "";
    return `<button class="ev-hbtn" data-ev="open" aria-label="Événement : ${esc(e.n)}">${shard(30, e.look)}<span>Événement</span><i class="ev-dot"></i></button>`;
  }
  // Petite bannière sur l'accueil
  function card(){
    const e = cur(); if (!e) return "";
    const got = e.chars.filter(c => S.skins[c]).length;
    return `<button class="card ev-card" data-ev="open"><div class="ev-card-art">${banner(e)}</div><div class="ev-card-txt"><span class="tw-kicker">${esc(e.kicker)}</span><b>${esc(e.n)}</b><span>${got}/${e.chars.length} personnages · fin dans ${leftTxt(e)}</span></div></button>`;
  }
  function view(){
    const e = lastEv(), on = !!cur() && e === cur(), got = e.chars.filter(c => S.skins[c]).length;
    const cards = e.chars.map(c => { const sk = skin(c), o = !!S.skins[c], n = o ? e.need : Math.min(fragOf(e, c), e.need);
      return `<div class="ev-ch ${o ? "own" : ""}"><div class="ev-ch-art">${creatureSVG(sk, 104)}</div><span class="bq-r" style="--rc:#E8960A">Légendaire · Événement</span><b class="ev-ch-n">${esc(sk.n)}</b>
        <div class="ev-pips">${Array.from({length:e.need}, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</div><span class="ev-ch-p">${o ? "Obtenu ✓" : `${n} / ${e.need} fragments`}</span>
        ${o ? (S.profile.skin === c ? `<span class="chip lamp">Équipé</span>` : `<button class="btn small ghost" data-equip="${c}">Équiper</button>`) : `<span class="chip">Non débloqué</span>`}</div>`; }).join("");
    return `<section class="stack ev-hub"><div class="row between"><button class="quit" data-ev="close">← Accueil</button><span class="label">Événement temporaire</span></div>
      <div class="ev-banner">${banner(e)}<div class="ev-banner-txt"><span class="tw-kicker">${esc(e.kicker)}</span><b class="ev-title">${esc(e.n)}</b>${on ? `<span class="ev-time">${gIcon("chrono", 18)}Fin dans <b>${leftTxt(e)}</b></span>` : `<span class="ev-time">Événement terminé</span>`}</div></div>
      <p class="ev-desc">${esc(e.d)}</p>
      <div class="ev-stats"><div><span>Fragments trouvés</span><b>${shard(18, e.look)}${totOf(e)}</b></div><div><span>Personnages</span><b>${got} / ${e.chars.length}</b></div><div><span>Chance</span><b>${Math.round(e.rate * 100)} %</b></div></div>
      ${!online() ? `<div class="card ev-warn"><b>Connecte-toi pour participer</b><span class="muted" style="font-size:13px">Les fragments sont tirés par le serveur : il faut un compte (onglet Multi).</span><button class="btn small" data-tab="amis">Me connecter</button></div>` : ""}
      <div class="label">Les personnages de la nuit</div><div class="ev-grid">${cards}</div>
      <div class="card ev-how"><b>Comment ça marche ?</b><span>Réponds normalement, dans n'importe quel mode. À chaque bonne réponse, tu as ${Math.round(e.rate * 100)} % de chances de trouver un fragment d'un des personnages que tu n'as pas encore. Il faut ${e.need} fragments du même personnage pour l'adopter : il reste alors dans ta collection pour toujours.</span><span class="muted" style="font-size:12.5px">Les fragments ne disparaissent pas à la fin de l'événement.</span></div></section>`;
  }
  function click(b){
    const a = b.dataset.ev;
    if (a === "open") { S.evOpen = true; S.tab = "accueil"; S.questOpen = false; save(); render(); return window.scrollTo(0, 0); }
    if (a === "close") { S.evOpen = false; save(); render(); return window.scrollTo(0, 0); }
  }
  const open = () => !!S.evOpen;
  // Personnages retirés du jeu (le Croque-Rêves, novembre 2026) : prix remboursé une seule fois, on ne le porte plus
  function retire(){
    if (typeof RETIRED_SKINS === "undefined" || !S || !S.profile) return; const s = st(); s.refund = s.refund || {};
    RETIRED_SKINS.forEach(sk => { if (S.profile.skin === sk.id) S.profile.skin = null;
      if (S.skins[sk.id] && !s.refund[sk.id]) { s.refund[sk.id] = 1; const v = sk.p || 0; S.coins += v; toasts.push(`<b>${esc(sk.n)} quitte Lumen</b> · tes ${v.toLocaleString("fr-FR")} pièces te sont rendues.`); save(); if (!inPlay()) render(); } });
  }
  setTimeout(retire, 3000);
  setInterval(() => { if (S && S.profile && !inPlay()) { celebrate(); retire(); } }, 4000);
  return {listen, stop, live, onCorrect, has, until, use, buy, tower, boss, cal, shopBlock, homeBtn, card, view, click, open, cur, info:id => { const e = evOf(id); return e ? {e} : null; }, _flush:flush, _inv:() => inv};
})();
