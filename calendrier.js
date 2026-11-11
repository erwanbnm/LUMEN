/* ---------- Potions (Double XP, Double pièces) et calendrier de connexion de 14 jours (novembre 2026) ----------
   Potions : un exemplaire maximum de chaque type. Activées quand le joueur le décide, elles durent 30 minutes et
   doublent l'XP ou les pièces des bonnes réponses (pas les coffres, badges ni paliers). Impossible d'en relancer
   une du même type tant qu'elle est active. Stockage en dates (obtenue / utilisée / fin) : la synchro entre
   appareils garde le plus grand nombre, donc des dates ne peuvent pas « ressusciter » une potion utilisée.
   Calendrier : une case par jour de connexion, à récupérer avec le bouton. Les jours manqués ne se rattrapent pas :
   on reprend simplement à la case suivante. Après le jour 14, on recommence au jour 1.
   La date vient du serveur Firebase (heure du serveur, pas celle du téléphone) ; la règle Firestore « logins »
   refuse une 2e récupération le même jour. Le jour change à minuit (heure d'hiver de Paris ; 1 h en été). */
const Potions = (() => {
  const T = {xp:{n:"Potion Double XP", d:"Double l'XP des bonnes réponses pendant 30 minutes.", a:"#B48AFF", b:"#5A2AC8", t:"XP"},
             coin:{n:"Potion Double pièces", d:"Double les pièces des bonnes réponses pendant 30 minutes.", a:"#FFE36A", b:"#D88A0A", t:"×2"}};
  const DUR = 30 * 60 * 1000;
  const inv = () => (S.inv = S.inv || {});
  const has = t => { const x = inv()[t] || {}; return (x.got || 0) > (x.used || 0); };
  const left = t => Math.max(0, ((inv()[t] || {}).until || 0) - Date.now());
  const active = t => left(t) > 0;
  const mult = t => active(t) ? 2 : 1;
  // Donne une potion ; renvoie false si le joueur l'a déjà (la récompense est alors remplacée par l'appelant)
  function give(t){ if (has(t)) return false; inv()[t] = Object.assign({}, inv()[t], {got:Date.now()}); save(); return true; }
  function use(t){ if (!has(t) || active(t)) return; const x = inv()[t], now = Date.now(); inv()[t] = Object.assign({}, x, {used:now, until:now + DUR}); save();
    toasts.push(`<b>${T[t].n} activée</b> · 30 minutes`); try { Music.sfx("level"); } catch(e){} }
  const mmss = ms => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  function svg(t, z, off){ const c = T[t], id = "pt" + t + Math.random().toString(36).slice(2, 6);
    return `<svg viewBox="0 0 60 70" width="${z}" height="${z * 70 / 60}" class="pot-svg ${off ? "off" : ""}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.a}"/><stop offset="1" stop-color="${c.b}"/></linearGradient></defs>
      <rect x="22" y="4" width="16" height="8" rx="2" fill="#C8965A" stroke="${TD}" stroke-width="2.4"/><path d="M24 12 V22 Q8 30 8 46 Q8 66 30 66 Q52 66 52 46 Q52 30 36 22 V12Z" fill="#EAF6FF" fill-opacity=".55" stroke="${TD}" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M10 42 Q30 36 50 42 Q52 64 30 64 Q8 64 10 42Z" fill="url(#${id})"/><path d="M15 36 Q12 46 16 54" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <circle cx="40" cy="48" r="2.4" fill="#fff" opacity=".7"/><circle cx="34" cy="56" r="1.6" fill="#fff" opacity=".6"/>
      <text x="30" y="56" text-anchor="middle" font-size="12" font-weight="900" fill="#fff" stroke="${TD}" stroke-width="1" font-family="sans-serif">${c.t}</text></svg>`; }
  // Pastille dans la barre du haut : potions possédées et temps restant
  function pill(){
    const ks = Object.keys(T).filter(t => has(t) || active(t)); if (!ks.length) return "";
    return `<button class="pill pot" data-pot="open" aria-label="Mes potions">${ks.map(t => `<span class="pot-i ${active(t) ? "on" : ""}">${svg(t, 16, false)}${active(t) ? `<b data-pot-min="${t}">${Math.ceil(left(t) / 6e4)}′</b>` : ""}</span>`).join("")}</button>`;
  }
  function sheet(){
    document.querySelectorAll(".pot-sheet").forEach(e => e.remove());
    const el = document.createElement("div"); el.className = "pot-sheet cal-veil"; el.setAttribute("role", "dialog");
    el.innerHTML = `<div class="cal-box pot-box"><button class="am-x" data-pot="close" aria-label="Fermer">×</button><b class="cal-title">Mes potions</b>
      ${Object.keys(T).map(t => `<div class="pot-row">${svg(t, 46, !has(t) && !active(t))}<div class="stack grow" style="gap:2px;min-width:0"><b>${T[t].n}</b><span class="muted" style="font-size:13px">${T[t].d}</span>
        <span class="pot-st">${active(t) ? `Active · encore <b data-pot-left="${t}">${mmss(left(t))}</b>` : has(t) ? "Prête à l'emploi" : "Aucune pour l'instant · une au maximum"}</span></div>
        ${has(t) && !active(t) ? `<button class="btn small" data-pot="use" data-v="${t}">Activer</button>` : ""}</div>`).join("")}
      <p class="muted" style="font-size:12.5px;margin:0">Une potion de chaque type au maximum. Le calendrier de connexion en offre aux jours 3 et 4.</p></div>`;
    el.addEventListener("click", e => { const b = e.target.closest("[data-pot]"); if (e.target === el || (b && b.dataset.pot === "close")) el.remove();
      else if (b && b.dataset.pot === "use") { use(b.dataset.v); el.remove(); render(); } });
    document.body.appendChild(el);
  }
  setInterval(() => { document.querySelectorAll("[data-pot-min]").forEach(e => { const t = e.dataset.potMin; if (active(t)) e.textContent = Math.ceil(left(t) / 6e4) + "′"; else if (S.profile && !inPlay()) render(); }); document.querySelectorAll("[data-pot-left]").forEach(e => { const t = e.dataset.potLeft; if (active(t)) e.textContent = mmss(left(t)); else { e.closest(".pot-sheet") ? e.closest(".pot-sheet").remove() : 0; if (S.profile && !inPlay()) render(); } }); }, 1000);
  return {give, use, has, active, mult, svg, pill, sheet, T};
})();

const Calendrier = (() => {
  const REW = [100, 100, "xp", "coin", 100, 100, 100, 100, 100, 100, 100, 100, 100, 500];
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
  function reward(step){ return REW[step - 1]; }
  // Verse la récompense de la n-ième récupération ; une potion déjà possédée devient 100 pièces
  function pay(n, quiet){
    const s = st(); if ((s.paid || 0) >= n) return null; s.paid = n;
    const r = reward(stepOf(n)); let out;
    if (typeof r === "number") { S.coins += r; out = {kind:"coin", v:r}; }
    else if (Potions.give(r)) out = {kind:"pot", t:r};
    else { S.coins += 100; out = {kind:"coin", v:100, swap:r}; }
    save(); checkBadges();
    if (quiet && out) toasts.push(out.kind === "pot" ? `<b>Calendrier</b> · ${Potions.T[out.t].n}` : `<b>Calendrier</b> · +${out.v} pièces`);
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
  const ico = (r, z) => typeof r === "number" ? `<span class="cal-coins" style="--z:${z}px">${r >= 500 ? `<i></i><i></i><i></i>` : `<i></i><i></i>`}</span>` : Potions.svg(r, z * .8);
  const lab = r => typeof r === "number" ? `${r} pièces` : r === "xp" ? "Potion Double XP" : "Potion Double pièces";
  function board(){
    const s = st(), done = claimedToday(), k = s.n === 0 ? 0 : done ? stepOf(s.n) : s.n % 14, cur = done ? k : k + 1;
    return `<div class="cal-grid">${REW.map((r, i) => { const d = i + 1, got = d <= k, now = d === cur && !done, today = d === cur && done;
      return `<div class="cal-t ${got ? "got" : ""} ${now ? "now" : ""} ${today ? "today" : ""} ${d === 14 ? "big" : ""} ${!got && !now ? "lock" : ""}" data-d="${d}">
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
        + `<div class="cal-win">${out.kind === "pot" ? Potions.svg(out.t, 80) : ico(out.v, 54)}<b>${out.kind === "pot" ? Potions.T[out.t].n : "+" + out.v + " pièces"}</b>${out.swap ? `<span>Tu avais déjà cette potion : 100 pièces à la place</span>` : out.kind === "pot" ? `<span>Active-la quand tu veux depuis la barre du haut</span>` : ""}</div>`;
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
