/* ---------- La Tour : 100 étages, un palier tous les 10 étages ----------
   Règles (choix d'Erwan, novembre 2026) :
   - 1 étage = 1 question (4 réponses). Bonne réponse : la porte s'ouvre, on monte d'un étage.
   - Mauvaise réponse ou temps écoulé : on retombe au dernier palier franchi, quoi qu'il arrive (pas de vies).
   - Récompense de chaque palier versée une seule fois par compte (S.tour.claimed).
   - Classement de la semaine dans l'onglet : étage le plus haut atteint depuis lundi ; à égalité, le premier arrivé.
   - Questions : les nouvelles questions de la Tour (content/extra/tour.txt, réservées à ce mode) + celles des thèmes,
     triées par difficulté. On évite celles déjà vues dans les montées précédentes. */
const Tour = (() => {
  const CP_REWARD = {10:20, 20:50, 30:100, 40:100, 50:100, 60:100, 70:300, 80:300, 90:300, 100:1000};
  const BANDS = ["Facile", "Facile à modérée", "Modérée", "Modérée à élevée", "Élevée", "Très élevée", "Extrêmement élevée", "Exceptionnelle", "Extrême", "Ultime"];
  const SEEN_MAX = 900;
  let view = "tower", fx = null, qtimer = null, lastScroll = null;
  const T = () => { S.tour = S.tour || {cp:0, best:0, claimed:{}, seen:[], wk:"", wbest:0, wt:0, runs:0, tops:0}; S.tour.claimed = S.tour.claimed || {}; S.tour.seen = S.tour.seen || []; return S.tour; };
  const band = f => Math.min(10, Math.ceil(f / 10));
  const qTime = f => f <= 50 ? 20 : 30;
  const weekId = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.toISOString().slice(0, 10); };
  const run = () => S.tourRun || null;

  /* --- Les questions de chaque tranche --- */
  // Questions des thèmes : niveau 1 → étages 1 à 20, niveau 2 → 11 à 40, niveau 3 → 31 à 60. Les étages 61 à 100 n'ont que des questions de la Tour.
  const THEME_BANDS = {1:[1, 2], 2:[2, 3, 4], 3:[4, 5, 6]};
  let POOLS = null;
  function pools(){
    if (POOLS) return POOLS;
    POOLS = {}; for (let b = 1; b <= 10; b++) POOLS[b] = [];
    Object.keys(Q).forEach(id => { const q = Q[id], t = q[6] && q[6].t;
      if (t === "tower") POOLS[q[6].b].push(id);
      else if (!t && q[2].length === 4) (THEME_BANDS[q[1]] || []).forEach(b => POOLS[b].push(id)); });
    return POOLS;
  }
  function pickFor(f, used){
    const P = pools()[band(f)], seen = new Set(T().seen);
    const tw = P.filter(id => Q[id][6] && !used.has(id)), th = P.filter(id => !Q[id][6] && !used.has(id));
    // Une question de la Tour une fois sur deux quand il y en a (elles sont faites pour l'étage) ; sinon une question de thème
    const prefer = tw.length && (Math.random() < .5 || !th.length) ? tw : th.length ? th : tw;
    let fresh = prefer.filter(id => !seen.has(id)); if (!fresh.length) fresh = (prefer === tw ? th : tw).filter(id => !seen.has(id));
    if (!fresh.length) { // tout a été vu : la plus ancienne
      const order = new Map(T().seen.map((id, i) => [id, i])); fresh = prefer.slice().sort((a, b) => (order.get(a) || 0) - (order.get(b) || 0)).slice(0, 20); }
    return fresh[Math.floor(Math.random() * fresh.length)];
  }
  const markSeen = id => { const t = T(); t.seen = t.seen.filter(x => x !== id); t.seen.push(id); if (t.seen.length > SEEN_MAX) t.seen = t.seen.slice(-SEEN_MAX); };

  /* --- La montée --- */
  function start(){
    const t = T(); if (t.cp >= 100) return;
    S.tourRun = {floor:t.cp + 1, used:[], t0:Date.now()}; t.runs = (t.runs || 0) + 1;
    next(); try { Music.sfx("tab2"); } catch(e){}
  }
  function next(){
    const r = run(); if (!r) return;
    const used = new Set(r.used), id = pickFor(r.floor, used);
    r.qid = id; r.used.push(id); r.ord = [0, 1, 2, 3].sort(() => Math.random() - .5); r.dl = Date.now() + qTime(r.floor) * 1000; r.ans = undefined;
    markSeen(id); view = "q"; save(); render(); startTimer();
  }
  function startTimer(){
    clearInterval(qtimer);
    qtimer = setInterval(() => {
      const r = run(); if (!r || r.ans !== undefined) return clearInterval(qtimer);
      const left = Math.max(0, r.dl - Date.now()), b = document.getElementById("tw-bar"), l = document.getElementById("tw-left");
      if (b) b.style.width = (left / (qTime(r.floor) * 10)) + "%"; if (l) l.textContent = Math.ceil(left / 1000) + " s";
      if (left <= 0) { clearInterval(qtimer); choose(-1); }
    }, 200);
  }
  function choose(v){
    const r = run(); if (!r || r.ans !== undefined) return;
    r.ans = v; const ok = v === 0;
    try { answer(r.qid, ok, 0); noteAnswer(ok); } catch(e){}
    save(); render();
    if (ok) { try { Music.sfx("ok"); } catch(e){} setTimeout(() => climbed(), 900); }
    else { try { Music.sfx("ko"); navigator.vibrate && navigator.vibrate([90, 50, 160]); } catch(e){} setTimeout(() => fall(), 1700); }
  }
  // Étage validé : la porte s'ouvre ; palier : récompense ; étage 100 : sommet
  function climbed(){
    const r = run(), t = T(); if (!r) return;
    const f = r.floor;
    t.best = Math.max(t.best || 0, f);
    if (t.wk !== weekId()) { t.wk = weekId(); t.wbest = 0; t.wt = 0; }
    if (f > (t.wbest || 0)) { t.wbest = f; t.wt = Date.now(); }
    if (f % 10 === 0) {
      t.cp = Math.max(t.cp || 0, f);
      let coins = 0;
      if (!t.claimed[f]) { t.claimed[f] = today(); coins = CP_REWARD[f] || 0; S.coins += coins; } // une seule fois par compte
      if (f === 100) { t.tops = (t.tops || 0) + 1; S.titles = S.titles || {}; S.titles.tour100 = S.titles.tour100 || today(); }
      S.tourRun = f < 100 ? {floor:f + 1, used:r.used, t0:r.t0} : null;
      save(); checkBadges(); pushStats();
      return showDoor(f, () => f === 100 ? showSummit(coins) : showCheckpoint(f, coins));
    }
    r.floor = f + 1; save(); pushStats();
    showDoor(f, () => next());
  }
  function fall(){
    const r = run(), t = T(); if (!r) return;
    const from = r.floor; S.tourRun = null; view = "tower"; save(); render();
    showFall(from, t.cp);
  }
  // Quitter en pleine montée = retomber au palier
  function quit(){ const r = run(); if (!r) { view = "tower"; return render(); } if (r.ans === undefined) { r.ans = -2; fall(); } }
  function pushStats(){ try { Amis.api.ping(); } catch(e){} }

  /* --- Animations (calques par-dessus l'écran) --- */
  function layer(cls, html, ms, done){
    const el = document.createElement("div"); el.className = "tw-fx " + cls; el.innerHTML = html; document.body.appendChild(el);
    if (ms) setTimeout(() => { el.classList.add("out"); setTimeout(() => { el.remove(); done && done(); }, 280); }, ms);
    return el;
  }
  function showDoor(f, done){
    layer("tw-door", `<div class="tw-light"></div><div class="tw-leaf l"></div><div class="tw-leaf r"></div><div class="tw-door-txt"><span>Étage ${f}</span><b>validé</b></div><div class="tw-climber">${meSVG(86)}</div>`, 1150, done);
  }
  function coinRain(n){ return Array.from({length:n}, () => `<i class="tw-coin" style="left:${Math.random()*100}%;animation-delay:${(Math.random()*1.2).toFixed(2)}s;animation-duration:${(1.4+Math.random()*1.2).toFixed(2)}s"></i>`).join(""); }
  function showCheckpoint(f, coins){
    try { Music.sfx("level"); navigator.vibrate && navigator.vibrate([40, 40, 40, 40, 120]); } catch(e){}
    const el = layer("tw-cp", `${coins ? coinRain(30) : ""}<div class="tw-cp-card"><div class="tw-cp-num">${f}</div><span class="tw-kicker">Palier atteint</span>
      <b class="tw-cp-title">Étage ${f} sauvegardé</b><span class="tw-cp-sub">Si tu te trompes plus haut, tu repars d'ici.</span>
      ${coins ? `<div class="tw-cp-gain">+${coins}<span class="coin" aria-hidden="true"></span></div>` : `<div class="tw-cp-sub">Récompense déjà touchée sur ce palier.</div>`}
      <div class="tw-cp-next">Prochain palier : étage ${f + 10}${CP_REWARD[f + 10] && !T().claimed[f + 10] ? ` · ${CP_REWARD[f + 10]} pièces` : ""}</div>
      <button class="btn" data-tw="cont">Continuer la montée</button><button class="btn ghost" data-tw="pause">Souffler (reprendre plus tard)</button></div>`);
    el.querySelector('[data-tw="pause"]').onclick = () => { S.tourRun = null; view = "tower"; save(); el.remove(); render(); flushLevelUp(); };
    el.querySelector('[data-tw="cont"]').onclick = () => { el.remove(); next(); };
  }
  function showSummit(coins){
    try { Music.sfx("win"); setTimeout(() => Music.sfx("level"), 900); navigator.vibrate && navigator.vibrate([60, 60, 60, 60, 200]); } catch(e){}
    view = "tower"; render();
    const el = layer("tw-summit", `<div class="tw-beam"></div>${coinRain(60)}<div class="tw-summit-card"><div class="tw-crown">👑</div><div class="tw-summit-av">${meSVG(120)}</div>
      <span class="tw-kicker">Sommet de la Tour</span><b class="tw-summit-title">ÉTAGE 100</b>
      <span class="tw-cp-sub">Tu fais partie de l'élite de Lumen.</span>
      ${coins ? `<div class="tw-cp-gain">+${coins}<span class="coin" aria-hidden="true"></span></div>` : ""}
      <div>${titleTag("tour100", "lg")}</div><span class="tw-cp-sub">Nouveau titre débloqué (Boutique › Titres)</span>
      <button class="btn" data-tw="ok">Légendaire !</button></div>`);
    el.querySelector('[data-tw="ok"]').onclick = () => { el.remove(); render(); flushLevelUp(); };
  }
  function showFall(from, cp){
    const el = layer("tw-fall", `<div class="tw-fall-card"><span class="tw-kicker">${from === cp + 1 ? "Raté" : "La chute"}</span>
      <b class="tw-cp-title">Tu retombes à l'étage ${cp || "0"}</b><span class="tw-cp-sub">${cp ? "Ton palier t'a sauvé : tu repartiras de l'étage " + (cp + 1) + "." : "Tu repars du pied de la tour."}</span>
      <button class="btn" data-tw="ok">Je retente</button></div>`);
    el.querySelector('[data-tw="ok"]').onclick = () => { el.remove(); render(); flushLevelUp(); };
  }

  /* --- Affichage --- */
  const sky = () => `<div class="tw-sky" aria-hidden="true"><i class="tw-bolt b1"></i><i class="tw-bolt b2"></i><i class="tw-rock r1"></i><i class="tw-rock r2"></i><i class="tw-rock r3"></i><i class="tw-rock r4"></i></div>`;
  function towerHTML(){
    const t = T(), r = run(), cur = r ? r.floor : t.cp + 1;
    let rows = "";
    for (let f = 100; f >= 1; f--) {
      const done = f <= t.cp, cp = f % 10 === 0, here = f === Math.min(100, cur), seen = f <= (t.best || 0);
      const cls = ["tw-fl", cp ? "cp" : "", done ? "done" : seen ? "seen" : "lock", here ? "here" : "", f === 100 ? "top" : ""].join(" ");
      if (f === 100) { rows += `<div class="${cls}" data-f="100"><div class="tw-spire"><span class="tw-spire-crown">👑</span></div><div class="tw-fl-body"><b>100</b><span>Sommet · ${CP_REWARD[100]} pièces + titre</span>${t.claimed[100] ? `<i class="tw-ok">✓</i>` : ""}</div>${here ? `<div class="tw-me">${meSVG(48)}</div>` : ""}</div>`; continue; }
      if (cp) { rows += `<div class="${cls}" data-f="${f}"><div class="tw-fl-body"><b>${f}</b><span>Palier · ${CP_REWARD[f]} pièces</span>${t.claimed[f] ? `<i class="tw-ok">✓</i>` : `<i class="tw-coinic"></i>`}</div>${here ? `<div class="tw-me">${meSVG(48)}</div>` : ""}</div>`; continue; }
      rows += `<div class="${cls}" data-f="${f}"><span class="tw-win"></span><b>${f}</b><span class="tw-win"></span>${here ? `<div class="tw-me sm">${meSVG(40)}</div>` : ""}</div>`;
    }
    return `<div class="tw-shaft" id="tw-shaft">${rows}<div class="tw-base"></div></div>`;
  }
  // Trophée démoniaque du classement : flammes, lave, visage cornu (dessiné en SVG, flammes animées en CSS)
  function demonTrophy(size){
    return `<svg class="dtro" viewBox="0 0 120 140" width="${size}" height="${size*140/120}" aria-hidden="true">
      <defs><radialGradient id="dtg" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#FF8A2A"/><stop offset=".55" stop-color="#C21E1E"/><stop offset="1" stop-color="#3A0610"/></radialGradient>
        <linearGradient id="dtb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B2150"/><stop offset="1" stop-color="#0E0614"/></linearGradient>
        <linearGradient id="dtl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE36A"/><stop offset=".5" stop-color="#FF7A1A"/><stop offset="1" stop-color="#D21E1E"/></linearGradient></defs>
      <ellipse cx="60" cy="58" rx="58" ry="52" fill="url(#dtg)" opacity=".55" class="dt-aura"/>
      <g class="dt-fl"><path class="dt-f1" d="M30 40 Q22 22 34 6 Q34 22 44 26 Q42 14 52 2 Q54 18 60 22 Q64 8 74 0 Q72 18 80 24 Q86 12 92 8 Q96 26 88 42Z" fill="url(#dtl)"/>
        <path class="dt-f2" d="M40 40 Q36 26 44 16 Q46 28 54 30 Q56 18 62 12 Q66 26 72 28 Q78 20 80 16 Q84 30 78 42Z" fill="#FFE36A" opacity=".9"/></g>
      <path d="M18 34 Q4 30 2 12 Q14 22 26 22Z M102 34 Q116 30 118 12 Q106 22 94 22Z" fill="#1A0A12" stroke="#000" stroke-width="2"/>
      <path d="M20 34 H100 Q100 70 74 82 L70 96 H50 L46 82 Q20 70 20 34Z" fill="url(#dtb)" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
      <path d="M20 34 Q8 40 10 54 Q12 66 26 66 M100 34 Q112 40 110 54 Q108 66 94 66" fill="none" stroke="#2A1438" stroke-width="7" stroke-linecap="round"/>
      <path d="M26 40 H94" stroke="#FF5A1A" stroke-width="2.5" opacity=".7"/>
      <path class="dt-eye" d="M36 50 L52 54 L38 60Z M84 50 L68 54 L82 60Z" fill="#FFD23F"/>
      <path d="M44 66 Q60 76 76 66 L72 74 L68 68 L64 76 L60 69 L56 76 L52 68 L48 74Z" fill="#FF7A1A" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/>
      <path class="dt-lava" d="M30 44 Q31 52 29 56 M90 46 Q89 52 91 58 M58 82 Q60 88 58 92" stroke="#FF7A1A" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M50 96 H70 L76 108 H44Z" fill="#2A1438" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
      <rect x="32" y="108" width="56" height="16" rx="4" fill="#1A0A12" stroke="#000" stroke-width="3"/>
      <path d="M38 116 H82" stroke="#C21E1E" stroke-width="2.5"/><circle cx="60" cy="116" r="3.5" fill="#FF7A1A" class="dt-eye"/>
      <ellipse cx="60" cy="132" rx="36" ry="5" fill="#000" opacity=".45"/></svg>`;
  }
  function rows(){
    const api = (() => { try { return Amis.api; } catch(e){ return null; } })(), me = api && api.uid && api.uid();
    if (!me) return null;
    const wk = weekId(), users = api.users(), t = T();
    return Object.keys(users).map(id => { const tw = id === me ? {wk:t.wk, b:t.wbest, t:t.wt, best:t.best} : (users[id].st && users[id].st.tw) || {};
      return {id, b:tw.wk === wk ? tw.b || 0 : 0, t:tw.wk === wk ? tw.t || 0 : 0, best:tw.best || 0}; })
      .sort((a, b) => b.b - a.b || (a.t || 9e15) - (b.t || 9e15));
  }
  // Écran du classement de la semaine (ouvert par le trophée)
  function rankView(){
    const api = Amis.api, me = api.uid && api.uid(), R = rows();
    const back = `<div class="tw-row-h"><button class="quit" data-tw="tower">← Retour à la Tour</button><span class="tw-muted">remis à zéro chaque lundi</span></div>`;
    if (!R) return `<section class="tw">${sky()}${back}<div class="tw-rank-head">${demonTrophy(120)}<h1 class="tw-h1 sm">Classement</h1></div><div class="tw-panel"><p class="tw-muted" style="margin:0">Connecte-toi dans l'onglet JcJ pour voir le classement de la Tour.</p></div></section>`;
    const d = new Date(weekId() + "T12:00:00"), lab = `${d.getDate()} ${MOIS[d.getMonth()]}`;
    const top = R.slice(0, 3), podium = [1, 0, 2].filter(i => top[i]).map(i => `<div class="tw-pod p${i + 1} ${top[i].id === me ? "me" : ""}">${api.avatar(top[i].id, i ? 52 : 68)}<b>${esc(api.pseudoOf(top[i].id))}</b><span>${top[i].b ? "Étage " + top[i].b : "—"}</span><div class="tw-pod-step">${i + 1}</div></div>`).join("");
    const mine = R.findIndex(r => r.id === me);
    return `<section class="tw tw-rank">${sky()}${back}
      <div class="tw-rank-head">${demonTrophy(124)}<h1 class="tw-h1 sm">Classement</h1><span class="tw-muted">Semaine du ${lab} · étage le plus haut atteint</span></div>
      <div class="tw-podium">${podium}</div>
      <div class="tw-panel">${R.map((r, i) => `<div class="tw-rk ${r.id === me ? "me" : ""}"><span class="tw-pos ${i < 3 ? "p" + (i + 1) : ""}">${i + 1}</span>${api.avatar(r.id, 34)}<div class="tw-rk-n"><b>${esc(api.pseudoOf(r.id))}</b>${api.title(r.id, "xs")}<span class="tw-muted">record : étage ${r.best}</span></div><b class="tw-rk-f">${r.b ? "Étage " + r.b : "—"}</b></div>`).join("")}</div>
      <p class="tw-muted" style="text-align:center;font-size:12.5px">${mine >= 0 ? `Tu es ${mine + 1}${mine ? "e" : "er"} cette semaine. ` : ""}À égalité, le premier arrivé à l'étage passe devant. Ta progression dans la Tour, elle, n'est jamais effacée.</p></section>`;
  }
  function board(){
    const R = rows();
    if (!R) return `<div class="tw-panel"><b>Classement de la semaine</b><p class="tw-muted">Connecte-toi dans l'onglet JcJ pour comparer ta montée avec tes amis.</p></div>`;
    const api = Amis.api, me = api.uid(), rows_ = R;
    return `<div class="tw-panel"><div class="tw-row-h"><b>Classement de la semaine</b><span class="tw-muted">remis à zéro lundi</span></div>
      ${rows_.map((r, i) => `<div class="tw-rk ${r.id === me ? "me" : ""}"><span class="tw-pos ${i < 3 ? "p" + (i + 1) : ""}">${i + 1}</span>${api.avatar(r.id, 34)}<div class="tw-rk-n"><b>${esc(api.pseudoOf(r.id))}</b>${api.title(r.id, "xs")}<span class="tw-muted">record : étage ${r.best}</span></div><b class="tw-rk-f">${r.b ? "Étage " + r.b : "—"}</b></div>`).join("")}</div>`;
  }
  function towerView(){
    const t = T(), next = Math.min(100, t.cp + 1), nextCp = Math.min(100, Math.ceil(next / 10) * 10);
    const claimedSum = Object.keys(t.claimed).reduce((s, k) => s + (CP_REWARD[k] || 0), 0);
    return `<section class="tw">${sky()}
      <button class="tw-trophy" data-tw="rank" aria-label="Classement de la Tour">${demonTrophy(52)}<span>Classement</span></button>
      <div class="tw-head"><h1 class="tw-h1">La Tour</h1><span class="tw-muted">100 étages · un palier tous les 10</span></div>
      <div class="tw-stats"><div><span>Palier</span><b>${t.cp}</b></div><div><span>Record</span><b>${t.best || 0}</b></div><div><span>Gagné</span><b>${claimedSum}<i class="coin" aria-hidden="true"></i></b></div></div>
      ${t.cp >= 100 ? `<div class="tw-panel tw-goal"><b>Tu as conquis la Tour.</b><span class="tw-muted">Ton nom est gravé au sommet. Ton classement de la semaine compte toujours.</span></div>`
        : `<div class="tw-panel tw-goal"><span class="tw-muted">Prochain objectif</span><b>Palier ${nextCp}${t.claimed[nextCp] ? "" : ` · ${CP_REWARD[nextCp]} pièces`}</b><span class="tw-band">Difficulté : ${BANDS[band(next) - 1]}</span>
          <button class="btn tw-go" data-tw="start">${t.cp ? `Reprendre à l'étage ${next}` : "Commencer l'ascension"}</button>
          <span class="tw-muted" style="font-size:12.5px">Une erreur et tu retombes au dernier palier.</span></div>`}
      ${towerHTML()}

    </section>`;
  }
  function qView(){
    const r = run(), q = Q[r.qid], f = r.floor, ans = r.ans, left = Math.max(0, r.dl - Date.now());
    const ch = r.ord.map(o => { let c = "choice"; if (ans !== undefined) c += o === 0 ? " right" : o === ans ? " wrong" : " dim";
      return `<button class="${c}" data-tw="ans" data-v="${o}" ${ans === undefined ? "" : "disabled"}>${esc(q[2][o])}</button>`; }).join("");
    const cpNext = Math.ceil(f / 10) * 10;
    return `<section class="tw tw-play">${sky()}
      <div class="tw-row-h"><span class="tw-floor">Étage <b>${f}</b><i>/100</i></span><button class="quit" data-tw="quit">Abandonner</button></div>
      <div class="tw-climb">${Array.from({length:10}, (_, i) => { const n = cpNext - 9 + i; return `<i class="${n < f ? "ok" : n === f ? "now" : ""} ${n % 10 === 0 ? "cp" : ""}"></i>`; }).join("")}</div>
      <div class="tw-row-h"><span class="tw-band">Difficulté : ${BANDS[band(f) - 1]}</span><span class="tw-muted">Palier ${cpNext}${T().claimed[cpNext] ? "" : " · " + CP_REWARD[cpNext] + " pièces"}</span></div>
      <article class="card q tw-q"><div class="row between"><span class="chip">${dot(q[0])}${esc(THEMES[q[0]].n)}</span><span class="label" id="tw-left">${ans === undefined ? Math.ceil(left / 1000) + " s" : ""}</span></div>
        <div class="timer" style="margin:8px 0 0"><i id="tw-bar" style="width:${ans === undefined ? left / (qTime(f) * 10) : 0}%"></i></div>
        <h2>${esc(q[4])}</h2><div class="choices">${ch}</div>
        ${ans !== undefined ? `<div class="verdict ${ans === 0 ? "ok" : "ko"}" role="status"><b>${ans === 0 ? "La porte s'ouvre…" : ans === -1 ? "Temps écoulé ! La réponse était : " + esc(q[2][0]) : "Raté ! La réponse était : " + esc(q[2][0])}</b>${ans !== 0 ? `<p>${esc(q[3])}</p>` : ""}</div>` : ""}
      </article></section>`;
  }
  function viewAll(){
    if (run() && view === "q" && Q[run().qid]) return qView();
    if (view === "rank") return rankView();
    return towerView();
  }
  // Après l'affichage : on fait défiler la tour jusqu'à l'étage du joueur
  function after(){
    const sh = document.getElementById("tw-shaft"); if (!sh) return;
    const here = sh.querySelector(".tw-fl.here"); if (!here) return;
    const key = T().cp + ":" + (run() ? run().floor : "");
    if (lastScroll === key) return; lastScroll = key;
    sh.scrollTop = here.offsetTop - sh.clientHeight / 2 + here.clientHeight / 2;
  }
  function click(b){
    const a = b.dataset.tw;
    if (a === "start") return start();
    if (a === "rank") { view = "rank"; render(); return window.scrollTo(0, 0); }
    if (a === "tower") { view = "tower"; lastScroll = null; render(); return window.scrollTo(0, 0); }
    if (a === "ans") return choose(+b.dataset.v);
    if (a === "quit") return quit();
  }
  // Relancer l'appli en pleine montée = retomber au palier (sinon on pourrait recharger pour éviter une question)
  function init(){ if (S.tourRun) { S.tourRun = null; save(); setTimeout(() => { toasts.push(`<b>Montée interrompue</b> · Retour au palier de l'étage ${T().cp}.`); render(); }, 2800); } }
  // Musique : épique et angoissante, plus intense en montant
  function music(){ if (S.tab !== "tour") return null; const r = run(); return {k:"tower", heat:r ? Math.min(1, (r.floor - 1) / 99) : 0}; }
  const statsForPing = () => { const t = T(); return {wk:t.wk, b:t.wk === weekId() ? t.wbest || 0 : 0, t:t.wk === weekId() ? t.wt || 0 : 0, best:t.best || 0}; };
  return {view:viewAll, click, after, init, music, stats:statsForPing, playing:() => !!(run() && S.tab === "tour"), REWARD:CP_REWARD};
})();

/* --- Badges de la Tour --- */
ICONS.tower = `<path fill-rule="evenodd" d="M13 37 V17 L11 12.5 H15 V9 H18.5 V12.5 H21.5 V9 H25 V12.5 H29 L27 17 V37Z M18 37 V30.5 Q20 27.5 22 30.5 V37Z M18.6 19 h2.8 v4 h-2.8Z"/>`;
[["tw10","bronze",10,"Premier palier","Atteindre l'étage 10 de la Tour",20],
 ["tw30","argent",30,"Grimpeur","Atteindre l'étage 30 de la Tour",40],
 ["tw50","or",50,"Mi-hauteur","Atteindre l'étage 50 de la Tour",80],
 ["tw70","platine",70,"Au-dessus des nuages","Atteindre l'étage 70 de la Tour",150],
 ["tw100","diamant",100,"Maître de la Tour","Atteindre le sommet de la Tour",300]
].forEach(([id, tier, goal, name, desc, coins]) => BADGES.push({id, g:"La Tour", tier, icon:"tower", name, desc, coins, goal, cur:() => (S.tour && S.tour.best) || 0}));

// Au démarrage : une montée interrompue (appli fermée ou rechargée) retombe au palier
try { if (S && S.profile) Tour.init(); } catch(e){}
