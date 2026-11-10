/* ---------- Quêtes quotidiennes et défis hebdomadaires (novembre 2026) ----------
   - Les mêmes quêtes pour tous les joueurs (tirées à partir de la date), renouvelées à minuit (heure de Paris) ;
     les défis de la semaine, le lundi à minuit.
   - Les compteurs avancent avec les vraies performances, quel que soit le mode : chaque bonne réponse passe par
     answer() (solo, Tour, Boss, salons), les parties multijoueurs par la fin d'un duel ou d'une partie de salon.
   - Chaque quête du jour rapporte 20 pièces, une seule fois. Toutes faites : coffre du jour (100 pièces).
     Défis de la semaine : de 200 à 350 pièces chacun ; tous faits : coffre légendaire (600 pièces, titre INFATIGABLE).
   - Les quêtes multijoueur sont remplacées par d'autres pour les joueurs non connectés au mode en ligne. */
const Quetes = (() => {
  const parisNow = () => { const p = new Intl.DateTimeFormat("fr-CA", {timeZone:"Europe/Paris", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false}).formatToParts(new Date()), g = t => p.find(x => x.type === t).value;
    return {day:`${g("year")}-${g("month")}-${g("day")}`, sec:(+g("hour") % 24) * 3600 + (+g("minute")) * 60 + (+g("second"))}; };
  const weekOf = day => { const d = new Date(day + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
  const dayN = day => Math.round(new Date(day + "T12:00:00Z") / 864e5);
  const online = () => { try { return !!Amis.api.uid(); } catch(e){ return false; } };
  const BIG = ["his", "sci", "geo", "spo", "cin", "art", "mus", "ani", "esp", "tec", "mon", "cor"];
  const isMax = k => k === "run" || k === "combo";

  // Quêtes du jour (20 pièces chacune)
  const DAILY = {
    ok:{n:() => "Réponds juste à 30 questions", goal:30, on:"ok", ic:"star"},
    th:{n:m => `Réponds juste à 30 questions en ${THEMES[m.th].n}`, goal:30, on:"ok", f:(m, i) => i.th === m.th, ic:"theme"},
    hard:{n:() => "Réponds juste à 10 questions pointues", goal:10, on:"ok", f:(m, i) => i.lvl === 3, ic:"crown"},
    run:{n:() => "Réponds juste à 20 questions dans une même partie", goal:20, on:"run", ic:"chrono"},
    combo:{n:() => "Enchaîne 12 bonnes réponses d'affilée", goal:12, on:"combo", ic:"flame"},
    mp:{n:() => "Joue une partie multijoueur (duel ou salon)", goal:1, on:"mp", net:true, ic:"sword"},
    mpw:{n:() => "Remporte 2 parties multijoueurs", goal:2, on:"mp", f:(m, i) => i.win, net:true, ic:"sword"},
    tower:{n:() => "Gravis 10 étages de la Tour", goal:10, on:"tower", ic:"tower"},
    boss:{n:() => "Combats le Boss de la semaine", goal:1, on:"boss", net:true, ic:"boss"}
  };
  const D_REWARD = 20, D_CHEST = 100;
  // Défis de la semaine (récompenses propres à chacun)
  const WEEKLY = {
    ok:{n:() => "Réponds juste à 300 questions", goal:300, on:"ok", c:300, ic:"star"},
    th:{n:m => `Réponds juste à 100 questions en ${THEMES[m.th].n}`, goal:100, on:"ok", f:(m, i) => i.th === m.th, c:200, ic:"theme"},
    hard:{n:() => "Réponds juste à 60 questions pointues", goal:60, on:"ok", f:(m, i) => i.lvl === 3, c:250, ic:"crown"},
    mp:{n:() => "Joue 20 parties multijoueurs", goal:20, on:"mp", net:true, c:250, ic:"sword"},
    mpw:{n:() => "Remporte 10 parties multijoueurs", goal:10, on:"mp", f:(m, i) => i.win, net:true, c:350, ic:"sword"},
    serie:{n:() => "Termine une Série dans 6 thèmes différents", goal:6, on:"serie", c:200, ic:"book"},
    tower:{n:() => "Gravis 50 étages de la Tour", goal:50, on:"tower", c:250, ic:"tower"},
    boss:{n:() => "Inflige 25 PV au Boss de la semaine", goal:25, on:"bossdmg", net:true, c:250, ic:"boss"}
  };
  const W_CHEST = 600;

  /* --- Tirage (le même pour tout le monde) --- */
  function pickDaily(day){
    const r = rng(dayN(day) * 7919 + 3), pick = a => a[Math.floor(r() * a.length)];
    const ks = [pick(["ok", "th"]), pick(["hard", "run", "combo"]), pick(["mp", "mpw", "tower", "boss"])];
    const rest = Object.keys(DAILY).filter(k => !ks.includes(k)); ks.push(pick(rest));
    const th = BIG[Math.floor(r() * BIG.length)];
    return subAll(ks, DAILY).map(k => ({k, th:k === "th" ? th : null, p:0, done:false}));
  }
  function pickWeekly(wk){
    const r = rng(dayN(wk) * 104729 + 7), pick = a => a[Math.floor(r() * a.length)];
    const ks = ["ok", "th", pick(["mp", "mpw"]), "serie", pick(["tower", "boss", "hard"])];
    const th = BIG[Math.floor(r() * BIG.length)];
    return subAll(ks, WEEKLY).map(k => ({k, th:k === "th" ? th : null, p:0, done:false, seen:{}}));
  }
  // Pas connecté au mode en ligne : les quêtes multijoueur sont remplacées par des quêtes solo
  // (remplacement un par un, sans jamais créer de doublon)
  function subAll(ks, DEF){ const out = [];
    ks.forEach(k => { if (!DEF[k].net || online()) { if (!out.includes(k)) return out.push(k); }
      const alt = ["tower", "hard", "combo", "run", "ok", "serie"].find(x => DEF[x] && !DEF[x].net && !out.includes(x) && !ks.includes(x)); if (alt) out.push(alt); });
    return out; }

  function Qs(){
    const n = parisNow(), wk = weekOf(n.day);
    S.qst = S.qst || {}; const q = S.qst;
    if (q.day !== n.day) { q.day = n.day; q.d = {list:pickDaily(n.day), chest:false}; }
    if (q.wk !== wk) { q.wk = wk; q.w = {list:pickWeekly(wk), chest:false}; }
    q.mp = q.mp || {}; q.tot = q.tot || {d:0, w:0};
    return q;
  }

  /* --- Événements : appelés par le jeu --- */
  let runN = 0;
  // Une nouvelle partie commence (solo, Tour, Boss, salon) : le compteur « dans une même partie » repart à zéro
  function newRun(){ runN = 0; }
  function ev(type, info){
    if (!S || !S.profile) return;
    const q = Qs(); info = info || {};
    if (typeof Guildes !== "undefined") try { Guildes.ev(type, info); } catch(e){}
    if (typeof Boutique !== "undefined") try { Boutique.ev(type, info); } catch(e){}
    if (type === "ok") { runN++; ev("run", {v:runN}); }
    const apply = (list, DEF, wk) => list.forEach(m => {
      const d = DEF[m.k]; if (!d || m.done || d.on !== type) return;
      if (d.f && !d.f(m, info)) return;
      if (type === "serie") { m.seen = m.seen || {}; if (m.seen[info.th]) return; m.seen[info.th] = 1; m.p = Object.keys(m.seen).length; }
      else if (isMax(type)) m.p = Math.max(m.p, info.v || 0);
      else m.p += type === "bossdmg" || type === "tower" ? (info.v || 1) : 1;
      if (m.p >= d.goal) { m.p = d.goal; m.done = true; const c = wk ? d.c : D_REWARD; S.coins += c;
        toasts.push(`<b>${wk ? "Défi de la semaine réussi !" : "Quête du jour réussie"}</b> · ${esc(d.n(m))} · +${c} pièces`); }
    });
    apply(q.d.list, DAILY, false); apply(q.w.list, WEEKLY, true);
  }
  // Partie multijoueur terminée : chaque duel ou partie de salon ne compte qu'une fois
  function mpDone(key, win){ const q = Qs(); if (q.mp[key]) return; q.mp[key] = q.day; const ks = Object.keys(q.mp); if (ks.length > 200) delete q.mp[ks[0]]; ev("mp", {win:!!win}); }

  /* --- Coffres --- */
  const allDone = l => l.length && l.every(m => m.done);
  function openChest(kind){
    const q = Qs(), box = kind === "w" ? q.w : q.d; if (box.chest || !allDone(box.list)) return;
    box.chest = true; const lines = [];
    if (kind === "w" && typeof Boutique !== "undefined") try { Boutique.ev("wchest"); } catch(e){}
    if (kind === "w") { S.coins += W_CHEST; q.tot.w++; lines.push(`+${W_CHEST} pièces`);
      S.titles = S.titles || {}; if (!S.titles.infatigable) { S.titles.infatigable = today(); lines.push("Titre exclusif : INFATIGABLE"); } }
    else { S.coins += D_CHEST; q.tot.d++; lines.push(`+${D_CHEST} pièces`); }
    save(); checkBadges(); chestFx(kind, lines);
  }
  function chestSVG(kind, state, size){
    const lg = kind === "w", body = lg ? ["#7A3AC8", "#4A1E8A"] : ["#C8823A", "#7A4A1E"], band = lg ? "#FFD23F" : "#E8C25A", gem = lg ? "#FF5FA2" : "#7FD8BE";
    const open = state === "open";
    return `<svg class="qs-chest ${state} ${lg ? "lg" : ""}" viewBox="0 -28 120 138" width="${size}" height="${size * 138 / 120}" aria-hidden="true">
      ${state === "ready" || open ? `<circle cx="60" cy="58" r="52" fill="${lg ? "#C98AFF" : "#FFE36A"}" opacity=".35" class="qs-aura"/>` : ""}
      <ellipse cx="60" cy="102" rx="44" ry="6" fill="#000" opacity=".3"/>
      <path d="M16 56 H104 V96 Q104 100 100 100 H20 Q16 100 16 96Z" fill="${body[0]}" stroke="#2B1D3A" stroke-width="3.5"/>
      <path d="M16 74 H104" stroke="${body[1]}" stroke-width="4"/>
      <rect x="28" y="56" width="10" height="44" fill="${band}" stroke="#2B1D3A" stroke-width="2.5"/><rect x="82" y="56" width="10" height="44" fill="${band}" stroke="#2B1D3A" stroke-width="2.5"/>
      ${open ? `<g class="qs-burst"><path d="M60 50 L40 6 M60 50 L60 0 M60 50 L80 6 M60 50 L22 24 M60 50 L98 24" stroke="#FFF6C8" stroke-width="5" stroke-linecap="round"/></g>
        <path d="M18 54 Q14 30 26 22 H94 Q106 30 102 54Z" fill="${body[0]}" stroke="#2B1D3A" stroke-width="3.5" transform="rotate(-24 18 54) translate(-6 -10)"/>`
        : `<path d="M16 58 Q14 30 28 22 H92 Q106 30 104 58Z" fill="${body[0]}" stroke="#2B1D3A" stroke-width="3.5"/>
        <path d="M24 30 Q60 22 96 30" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>
        <rect x="28" y="24" width="10" height="34" fill="${band}" stroke="#2B1D3A" stroke-width="2.5"/><rect x="82" y="24" width="10" height="34" fill="${band}" stroke="#2B1D3A" stroke-width="2.5"/>
        <rect x="50" y="48" width="20" height="22" rx="4" fill="${band}" stroke="#2B1D3A" stroke-width="3"/><path d="M60 52 L66 59 L60 66 L54 59Z" fill="${gem}" stroke="#2B1D3A" stroke-width="2"/>
        ${state === "locked" ? `<path d="M60 74 v8" stroke="#2B1D3A" stroke-width="3" stroke-linecap="round"/>` : ""}`}
    </svg>`;
  }
  function chestFx(kind, lines){
    try { Music.sfx("level"); setTimeout(() => Music.sfx("win"), 500); navigator.vibrate && navigator.vibrate([40, 40, 40, 40, 140]); } catch(e){}
    const el = document.createElement("div"); el.className = "tw-fx tw-cp qs-fx";
    el.innerHTML = `${Array.from({length:kind === "w" ? 50 : 26}, () => `<i class="tw-coin" style="left:${Math.random()*100}%;animation-delay:${(.5 + Math.random()*1.2).toFixed(2)}s"></i>`).join("")}
      <div class="tw-cp-card qs-chest-card ${kind === "w" ? "lg" : ""}"><div class="qs-chest-anim">${chestSVG(kind, "ready", 140)}</div><div class="qs-chest-open">${chestSVG(kind, "open", 140)}</div>
      <span class="tw-kicker">${kind === "w" ? "Coffre légendaire de la semaine" : "Coffre du jour"}</span><b class="tw-cp-title">Récompenses</b>
      ${lines.map(l => `<span class="tw-cp-gain qs-line">${esc(l)}</span>`).join("")}<button class="btn">Super !</button></div>`;
    el.querySelector("button").onclick = () => { el.remove(); render(); flushLevelUp(); };
    document.body.appendChild(el);
  }

  /* --- Affichage --- */
  let tab = "d";
  const left = kind => { const n = parisNow(); let s = 86400 - n.sec; if (kind === "w") s += ((7 - (new Date(n.day + "T12:00:00Z").getUTCDay() + 6) % 7) - 1) * 86400;
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60); return d ? `${d} j ${h} h` : h ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`; };
  function icon(d, m, z){ if (d.ic === "theme") return thIcon(m.th || "his", z); if (d.ic === "boss") return typeof Boss !== "undefined" ? Boss.svg(Boss.current().b.id, z) : gIcon("trophy", z); return gIcon(d.ic, z); }
  function row(m, DEF, wk){
    const d = DEF[m.k], pct = Math.round(m.p / d.goal * 100);
    const name = d.ic === "theme" && m.k === "serie" ? d.n(m) : d.n(m);
    return `<div class="qs-row ${m.done ? "done" : ""}"><div class="qs-ic">${icon(d, m, 40)}</div>
      <div class="qs-mid"><b>${esc(name)}</b><div class="qs-bar"><i style="width:${pct}%"></i><span>${m.p}/${d.goal}</span></div></div>
      <div class="qs-rw">${m.done ? `<span class="qs-ok">✓</span>` : `<span class="qs-coin">${coinIco}${wk ? d.c : D_REWARD}</span>`}</div></div>`;
  }
  function chestBlock(kind){
    const q = Qs(), box = kind === "w" ? q.w : q.d, ok = allDone(box.list), n = box.list.filter(m => m.done).length;
    const state = box.chest ? "open" : ok ? "ready" : "locked";
    return `<div class="qs-chestbox ${state} ${kind === "w" ? "lg" : ""}">${chestSVG(kind, state, kind === "w" ? 96 : 80)}
      <div class="stack" style="gap:4px;min-width:0;flex:1"><b>${kind === "w" ? "Coffre légendaire" : "Coffre du jour"}</b>
        <span class="muted" style="font-size:13px">${kind === "w" ? `${W_CHEST} pièces + titre exclusif ${titleTag("infatigable", "xs")} (la 1re fois)` : `${D_CHEST} pièces`} · ${n}/${box.list.length} ${kind === "w" ? "défis" : "quêtes"}</span>
        ${state === "ready" ? `<button class="btn small qs-open" data-qs="open" data-v="${kind}">Ouvrir le coffre</button>` : state === "open" ? `<span class="chip lamp">Coffre ouvert</span>` : `<span class="muted" style="font-size:12.5px">Termine tout pour l'ouvrir</span>`}</div></div>`;
  }
  function viewAll(){
    const q = Qs(), isW = tab === "w", box = isW ? q.w : q.d, DEF = isW ? WEEKLY : DAILY;
    return `<section class="stack qs">
      <div class="row between"><button class="quit" data-qs="back">← Accueil</button><span class="label">Quêtes</span></div>
      <div class="qs-head"><h1 class="big" style="margin:0">Quêtes</h1><span class="muted">Joue pour de vrai, gagne des pièces et des coffres</span></div>
      <div class="seg qs-seg"><button data-qs="tab" data-v="d" aria-pressed="${!isW}">${gIcon("mission", 24)}<span>Du jour</span></button><button data-qs="tab" data-v="w" aria-pressed="${isW}">${gIcon("trophy", 24)}<span>De la semaine</span></button></div>
      <div class="qs-timer">${isW ? "Nouveaux défis dans" : "Nouvelles quêtes dans"} <b>${left(isW ? "w" : "d")}</b> <span class="muted">· minuit, heure de Paris${isW ? ", le lundi" : ""}</span></div>
      ${chestBlock(isW ? "w" : "d")}
      <div class="card stack qs-list">${box.list.map(m => row(m, DEF, isW)).join("")}</div>
      <p class="muted" style="font-size:12.5px;text-align:center;margin:0">Toutes les bonnes réponses comptent, dans tous les modes : solo, Tour, Boss et salons.${online() ? "" : " Connecte-toi dans JcJ pour débloquer les quêtes multijoueur."}</p>
    </section>`;
  }
  // Résumé sur l'accueil (remplace les anciennes missions)
  function card(){
    const q = Qs(), nd = q.d.list.filter(m => m.done).length, nw = q.w.list.filter(m => m.done).length;
    const ready = (allDone(q.d.list) && !q.d.chest) || (allDone(q.w.list) && !q.w.chest);
    return `<button class="card qs-card ${ready ? "ready" : ""}" data-qs="openview"><div class="qs-card-chest">${chestSVG("d", allDone(q.d.list) && !q.d.chest ? "ready" : q.d.chest ? "open" : "locked", 64)}</div>
      <div class="stack" style="gap:6px;flex:1;min-width:0;text-align:left"><span class="label">Quêtes</span>
        <div class="qs-mini"><span>Du jour</span><div class="qs-bar sm"><i style="width:${nd / q.d.list.length * 100}%"></i></div><b>${nd}/${q.d.list.length}</b></div>
        <div class="qs-mini"><span>Semaine</span><div class="qs-bar sm lg"><i style="width:${nw / q.w.list.length * 100}%"></i></div><b>${nw}/${q.w.list.length}</b></div>
        ${ready ? `<span class="chip lamp">Un coffre t'attend !</span>` : `<span class="muted" style="font-size:12.5px">Renouvellement dans ${left("d")}</span>`}</div></button>`;
  }
  function click(b){
    const a = b.dataset.qs;
    if (a === "openview") { S.questOpen = true; render(); return window.scrollTo(0, 0); }
    if (a === "back") { S.questOpen = false; return render(); }
    if (a === "tab") { tab = b.dataset.v; return render(); }
    if (a === "open") return openChest(b.dataset.v);
  }
  return {ev, newRun, mpDone, view:viewAll, card, click, open:() => !!S.questOpen, state:Qs, chestSVG};
})();

/* --- Badges et titre des quêtes --- */
[["qd7","argent",7,"d","Assidu","Ouvrir 7 coffres du jour",50],
 ["qd30","or",30,"d","Pilier de Lumen","Ouvrir 30 coffres du jour",150],
 ["qw1","or",1,"w","Héros de la semaine","Ouvrir un coffre légendaire de la semaine",100],
 ["qw5","diamant",5,"w","Légende hebdomadaire","Ouvrir 5 coffres légendaires de la semaine",300]
].forEach(([id, tier, goal, k, name, desc, coins]) => BADGES.push({id, g:"Général", tier, icon:"bulb", name, desc, coins, goal, cur:() => (S.qst && S.qst.tot && S.qst.tot[k]) || 0}));
