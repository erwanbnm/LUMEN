/* ---------- Boss de la semaine (coopératif, en ligne) ----------
   Choix (novembre 2026) :
   - Un seul boss par semaine pour tous les joueurs, 100 PV communs : document Firestore bosses/{lundi}.
   - 1 partie par jour (minuit, heure de Paris) : 3 vies, 15 s par question, 20 questions au plus.
     La partie est verrouillée dès qu'elle commence : recharger ne permet pas de recommencer.
   - Bonne réponse = 1 PV de dégâts (2 PV pour une question pointue). Les dégâts comptent pour le classement.
   - Un ou deux thèmes par jour, fixés par le boss de la semaine.
   - Boss vaincu : pièces selon la contribution ; à partir de 5 PV, le personnage du Portail de la semaine
     (skins existants, rien de nouveau) ou 300 pièces si on l'a déjà ; titre rare FLÉAU DES BOSS au plus gros
     contributeur. Tout est versé une seule fois par semaine (S.boss.claimed).
   - « Appeler à l'aide » : pop-up chez les amis choisis (calls dans le document du boss). */
const Boss = (() => {
  const A = () => Amis.api;
  const HP = 100, LIVES = 3, Q_TIME = 15, MAXQ = 20, SKIN_MIN = 5;
  const parisDay = (d = new Date()) => new Intl.DateTimeFormat("fr-CA", {timeZone:"Europe/Paris", year:"numeric", month:"2-digit", day:"2-digit"}).format(d);
  const weekOf = day => { const d = new Date(day + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
  const dayIdx = day => (new Date(day + "T12:00:00Z").getUTCDay() + 6) % 7; // 0 = lundi
  const weekNum = wk => Math.round((new Date(wk + "T12:00:00Z") - new Date("2026-11-09T12:00:00Z")) / 6048e5);
  const MIX = Object.keys(THEMES);
  // Les 4 boss (illustrations originales) et leurs thèmes de la semaine, du lundi au dimanche
  const BOSSES = [
    {id:"ogre", n:"Gloutonor, l'Ogre Écarlate", c:"#E2474F", days:[["his","geo"],["spo"],["cin"],["sci"],["his"],["jeu","bdm"],MIX]},
    {id:"colosse", n:"Le Colosse d'Améthyste", c:"#8A5AD8", days:[["ani","geo"],["mus"],["art","lan"],["esp","sci"],["myt"],["gas","eco"],MIX]},
    {id:"spectre", n:"Le Spectre Gris", c:"#B8C0D0", days:[["his","per"],["spo","jeu"],["cin","bdm"],["sci","tec"],["geo","cap"],["mus","art"],MIX]},
    {id:"ombre", n:"L'Ombre Titanesque", c:"#C21E1E", days:[["myt","his"],["lan","art"],["esp"],["cor","sci"],["spo"],["cin","mus"],MIX]}
  ];
  const cur = () => { const day = parisDay(), wk = weekOf(day), n = weekNum(wk), b = BOSSES[((n % 4) + 4) % 4];
    return {day, wk, n, b, themes:b.days[dayIdx(day)], skin:PORTAL_SKINS[((n % PORTAL_SKINS.length) + PORTAL_SKINS.length) % PORTAL_SKINS.length]}; };
  const st = () => { S.boss = S.boss || {played:{}, claimed:{}, seen:[], kills:0, tops:0, wins:0, last:0}; ["played", "claimed"].forEach(k => S.boss[k] = S.boss[k] || {}); S.boss.seen = S.boss.seen || []; return S.boss; };

  let doc = null, unsub = null, view = "home", run = null, timer = null, msg = "", lastWk = "", pick = {};
  const db = () => A().db(), uid = () => A().uid(), FV = () => A().fb().firestore.FieldValue;
  // window.__bossTest : réservé aux tests automatiques (un boss à part, pour ne pas toucher au vrai boss de la semaine)
  const ref = () => db().doc("bosses/" + (window.__bossTest || cur().wk));
  const tot = () => Math.min(HP, (doc && doc.tot) || 0), hpLeft = () => Math.max(0, HP - tot());
  const playedToday = () => { const c = cur(); return !!st().played[c.day] || !!(doc && doc.days && doc.days[uid()] && c.day in doc.days[uid()]); };

  /* --- Écoute du boss de la semaine --- */
  function listen(){
    const wk = cur().wk; if (!uid() || (unsub && lastWk === wk)) return;
    if (unsub) unsub(); lastWk = wk;
    unsub = ref().onSnapshot(s => {
      const before = doc; doc = s.exists ? s.data() : null;
      const fighting = view === "fight" && run && document.querySelector(".ar-scene");
      if (doc && before && !before.defeatedAt && doc.defeatedAt) { if (fighting) arenaDefeat(); else defeatFx(); }
      showCalls(); claim();
      if (fighting) paintHP(); else if (S.tab === "jouer" && !(S.session && !S.session.done)) { window.__quiet = true; render(); }
    }, () => {});
  }
  async function ensure(){ const r = ref(), s = await r.get(); if (!s.exists) await r.set({wk:cur().wk, boss:cur().b.id, tot:0, dmg:{}, days:{}, calls:{}}, {merge:true}); }

  /* --- Questions du jour --- */
  function pool(){ const th = new Set(cur().themes), seen = new Set(st().seen);
    const all = Object.keys(Q).filter(id => !(Q[id][6] && Q[id][6].t) && Q[id][2].length === 4 && th.has(Q[id][0]) && Q[id][1] >= 2);
    const fresh = all.filter(id => !seen.has(id)); return fresh.length >= MAXQ ? fresh : all; }

  /* --- Le combat --- */
  async function start(){
    if (!uid()) return;
    const c = cur(); msg = "";
    try {
      await ensure();
      // Verrou de la journée : on note la partie AVANT de jouer (recharger ne permet pas de recommencer)
      let ok = false;
      await db().runTransaction(async tx => { const s = await tx.get(ref()), d = s.data() || {}; const mine = (d.days && d.days[uid()]) || {};
        if (c.day in mine) return; tx.update(ref(), {["days." + uid() + "." + c.day]: 0}); ok = true; });
      if (!ok) { st().played[c.day] = true; save(); msg = "Tu as déjà combattu aujourd'hui. Reviens demain !"; return render(); }
    } catch(e){ msg = "Impossible de joindre le boss. Vérifie ta connexion."; return render(); }
    st().played[c.day] = true; save();
    if (typeof Quetes !== "undefined") { Quetes.newRun(); Quetes.ev("boss", {}); }
    const qs = pool().sort(() => Math.random() - .5).slice(0, MAXQ);
    run = {qs, i:0, lives:LIVES, dmg:0, ans:undefined, ord:[0,1,2,3].sort(() => Math.random() - .5), dl:Date.now() + Q_TIME*1000, hit:0};
    view = "fight"; render(); window.scrollTo(0, 0); tick();
  }
  function tick(){
    clearInterval(timer);
    timer = setInterval(() => {
      if (!run || run.ans !== undefined) return;
      const left = Math.max(0, run.dl - Date.now()), b = document.getElementById("bs-bar"), l = document.getElementById("bs-left");
      if (b) b.style.width = (left / (Q_TIME*10)) + "%"; if (l) l.textContent = Math.ceil(left/1000) + " s";
      if (left <= 0) answer(-1);
    }, 200);
  }
  function answer(v){
    if (!run || run.ans !== undefined) return;
    const id = run.qs[run.i], q = Q[id], ok = v === 0; run.ans = v;
    st().seen = st().seen.filter(x => x !== id).concat([id]).slice(-700);
    try { window.answer(id, ok, 0); noteAnswer(ok); } catch(e){}
    if (ok) { const d = q[1] >= 3 ? 2 : 1; run.dmg += d; run.hit = d; hit(d); try { Music.sfx("ok"); } catch(e){} attack(d); }
    else { run.lives--; run.hit = 0; try { Music.sfx("ko"); navigator.vibrate && navigator.vibrate([60, 40, 90]); } catch(e){} counter(); }
    save(); paintPanel();
    setTimeout(() => { if (!run) return; if (doc && doc.defeatedAt) return setTimeout(finish, 2600); // on laisse le boss s'effondrer et VICTOIRE s'afficher
      if (run.lives <= 0 || run.i >= run.qs.length - 1) return finish();
      run.i++; run.ans = undefined; run.ord = [0,1,2,3].sort(() => Math.random() - .5); run.dl = Date.now() + Q_TIME*1000; paintPanel(); }, ok ? 1400 : 2000);
  }
  // Dégâts envoyés tout de suite (une coupure de réseau ne fait pas perdre les coups déjà portés)
  function hit(d){
    const c = cur();
    if (typeof Quetes !== "undefined") Quetes.ev("bossdmg", {v:d});
    db().runTransaction(async tx => { const s = await tx.get(ref()), dd = s.data() || {}; const t = (dd.tot || 0) + d;
      const up = {tot:FV().increment(d), ["dmg." + uid()]:FV().increment(d), ["days." + uid() + "." + c.day]:FV().increment(d)};
      if (t >= HP && !dd.defeatedAt) { up.defeatedAt = Date.now(); up.killer = uid(); }
      tx.update(ref(), up); }).catch(() => {});
  }
  function finish(){ clearInterval(timer); view = "done"; window.__quiet = true; st().last = run.dmg; save(); checkBadges(); render(); window.scrollTo(0, 0); setTimeout(claim, 1500); }

  /* --- Récompenses (une seule fois par semaine) --- */
  function claim(){
    if (!doc || !uid()) return;
    const c = cur(), s = st(), wk = doc.wk || c.wk, mine = (doc.dmg && doc.dmg[uid()]) || 0;
    if (!doc.defeatedAt || !mine || s.claimed[wk]) return;
    if ((S.session && !S.session.done) || (run && view === "fight")) return; // pas en plein combat : on attend la fin
    s.claimed[wk] = today(); s.wins = (s.wins || 0) + 1;
    const coins = Math.min(600, 100 + 15 * mine); S.coins += coins;
    const lines = [`+${coins} pièces pour tes ${mine} PV de dégâts`];
    const skin = PORTAL_SKINS[((weekNum(wk) % PORTAL_SKINS.length) + PORTAL_SKINS.length) % PORTAL_SKINS.length];
    if (mine >= SKIN_MIN) { if (!S.skins[skin.id]) { unlockSkin(skin.id); lines.push(`Personnage débloqué : ${skin.n}`); } else { S.coins += 300; lines.push(`+300 pièces (tu as déjà ${skin.n})`); } }
    const top = Object.keys(doc.dmg || {}).sort((a, b) => doc.dmg[b] - doc.dmg[a])[0];
    if (top === uid()) { s.tops = (s.tops || 0) + 1; S.titles = S.titles || {}; if (!S.titles.fleau) { S.titles.fleau = today(); lines.push("Titre rare débloqué : FLÉAU DES BOSS"); } }
    if (doc.killer === uid()) { s.kills = (s.kills || 0) + 1; lines.push("Tu as porté le coup fatal !"); }
    save(); checkBadges();
    setTimeout(() => rewardFx(lines), 600);
  }

  /* --- Appel à l'aide --- */
  async function call(to){ try { await ensure(); await ref().update({["calls." + uid()]: {at:Date.now(), to}}); msg = to.length > 1 ? "Tes amis ont reçu ton appel !" : "Appel envoyé !"; } catch(e){ msg = "Impossible d'envoyer l'appel."; } render(); }
  let shownCalls = {};
  function showCalls(){
    if (!doc || !doc.calls || !uid() || playedToday()) return;
    Object.keys(doc.calls).forEach(from => { const c = doc.calls[from]; if (from === uid() || !c || !(c.to || []).includes(uid()) || Date.now() - c.at > 12*3600e3) return;
      const k = from + c.at; if (shownCalls[k] || (S.boss && S.boss.seenCalls && S.boss.seenCalls[k])) return; shownCalls[k] = 1; st().seenCalls = Object.assign({}, st().seenCalls, {[k]:1}); save();
      if (S.settings.sfx !== false) try { Music.sfx("level"); navigator.vibrate && navigator.vibrate([90, 60, 90]); } catch(e){}
      const el = document.createElement("div"); el.className = "am-inv"; el.setAttribute("role", "alertdialog");
      el.innerHTML = `<button class="am-x" aria-label="Fermer">×</button><div class="row" style="gap:10px;align-items:center;flex-wrap:nowrap">${bossSVG(cur().b.id, 48)}<div class="stack" style="gap:2px;min-width:0"><b>${esc(A().pseudoOf(from))} t'appelle à l'aide !</b><span>${esc(cur().b.n)} · ${hpLeft()} PV restants</span></div></div>
        <div class="row"><button class="btn small" data-go>Combattre</button><button class="btn small ghost" data-x>Plus tard</button></div>`;
      el.querySelector("[data-go]").onclick = () => { el.remove(); S.tab = "jouer"; S.bossOpen = true; view = "home"; leaveSession(); save(); render(); window.scrollTo(0, 0); };
      el.querySelectorAll(".am-x,[data-x]").forEach(b => b.onclick = () => el.remove());
      document.body.appendChild(el); setTimeout(() => el.remove(), 60000); });
  }

  /* --- Animations --- */
  function defeatFx(){ try { Music.sfx("boom"); setTimeout(() => Music.sfx("win"), 700); } catch(e){}
    const el = document.createElement("div"); el.className = "bs-defeat"; el.innerHTML = `<div class="bs-defeat-card">${bossSVG(cur().b.id, 150)}<b>${esc(cur().b.n)}</b><span>est vaincu !</span></div>`;
    document.body.appendChild(el); setTimeout(() => el.remove(), 3200); }
  function rewardFx(lines){
    const c = cur(), el = document.createElement("div"); el.className = "tw-fx tw-cp";
    el.innerHTML = `${Array.from({length:30}, () => `<i class="tw-coin" style="left:${Math.random()*100}%;animation-delay:${(Math.random()*1.2).toFixed(2)}s"></i>`).join("")}<div class="tw-cp-card"><div class="bs-reward-art">${bossSVG(c.b.id, 90)}</div><span class="tw-kicker">Boss vaincu</span><b class="tw-cp-title">Récompenses de la semaine</b>${lines.map(l => `<span class="tw-cp-sub">${esc(l)}</span>`).join("")}<button class="btn">Génial !</button></div>`;
    el.querySelector("button").onclick = () => { el.remove(); render(); flushLevelUp(); };
    document.body.appendChild(el); try { Music.sfx("win"); } catch(e){}
  }

  /* --- Illustrations des boss (originales, style cartoon de Lumen) --- */
  function bossSVG(id, size, cls){
    const D = "#1E1030", o = `stroke="${D}" stroke-width="4" stroke-linejoin="round"`;
    let art = "";
    if (id === "ogre") art = `
      <path d="M40 186 Q30 150 42 128 L62 128 Q60 160 70 186Z M160 186 Q170 150 158 128 L138 128 Q140 160 130 186Z" fill="#B8323A" ${o}/>
      <path d="M38 190 l6 -10 l6 10 l6 -10 l6 10 l6 -10 l6 10" fill="none" stroke="#F2E2C2" stroke-width="5" stroke-linecap="round"/><path d="M122 190 l6 -10 l6 10 l6 -10 l6 10 l6 -10 l6 10" fill="none" stroke="#F2E2C2" stroke-width="5" stroke-linecap="round"/>
      <path d="M100 32 C156 32 182 76 178 124 C174 162 142 176 100 176 C58 176 26 162 22 124 C18 76 44 32 100 32Z" fill="#E2474F" ${o}/>
      <path d="M48 96 C40 80 62 64 76 70 M154 96 C162 80 140 64 126 70" fill="none" stroke="#B8323A" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 132 C70 150 130 150 156 132 C150 166 50 166 44 132Z" fill="#C83A44"/><ellipse cx="72" cy="58" rx="16" ry="9" fill="#FF8A90" opacity=".7"/>
      <path d="M62 44 Q50 18 60 4 Q72 22 76 40Z M138 44 Q150 18 140 4 Q128 22 124 40Z" fill="#F2E2C2" ${o}/>
      <path d="M58 30 l12 -4 M60 20 l10 -3 M142 30 l-12 -4 M140 20 l-10 -3" stroke="${D}" stroke-width="3"/>
      <path d="M58 92 Q100 132 142 92 Q138 120 100 124 Q62 120 58 92Z" fill="#5A0E1E" ${o}/>
      <path d="M64 96 l6 10 l6 -8 l6 10 l6 -9 l6 10 l6 -9 l6 10 l6 -9 l6 10 l6 -8 l6 9" fill="#FFF6E0" stroke="${D}" stroke-width="2"/>
      <path d="M100 116 Q92 128 100 136 Q108 128 100 116Z" fill="#FF6A9A" ${o}/>
      <circle cx="78" cy="72" r="9" fill="#FFE36A" ${o}/><circle cx="122" cy="72" r="9" fill="#FFE36A" ${o}/><circle cx="80" cy="73" r="3.5" fill="${D}"/><circle cx="120" cy="73" r="3.5" fill="${D}"/>
      <path d="M64 60 L90 66 M136 60 L110 66" stroke="${D}" stroke-width="5" stroke-linecap="round"/>
      <path d="M20 118 Q4 128 6 150 l8 -6 l4 10 l6 -8 l6 8 Q34 134 30 120Z M180 118 Q196 128 194 150 l-8 -6 l-4 10 l-6 -8 l-6 8 Q166 134 170 120Z" fill="#E2474F" ${o}/>
      <path d="M8 150 l-4 14 M16 154 l-2 14 M24 152 l2 14 M192 150 l4 14 M184 154 l2 14 M176 152 l-2 14" stroke="#F2E2C2" stroke-width="4" stroke-linecap="round"/>`;
    else if (id === "colosse") art = `
      <path d="M58 186 L64 140 L86 140 L84 186Z M142 186 L136 140 L114 140 L116 186Z" fill="#6A3AA8" ${o}/>
      <path d="M54 186 h34 v8 h-34z M112 186 h34 v8 h-34z" fill="#4A2478" ${o}/>
      <path d="M100 52 C142 52 160 76 156 112 L146 150 L54 150 L44 112 C40 76 58 52 100 52Z" fill="#8A5AD8" ${o}/>
      <path d="M70 80 Q100 100 130 80 M66 112 Q100 126 134 112 M100 100 V146" fill="none" stroke="#5A2E98" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 70 L8 60 L28 46 L18 30 L40 36 L44 16 L60 34 L72 24 L70 56Z M156 70 L192 60 L172 46 L182 30 L160 36 L156 16 L140 34 L128 24 L130 56Z" fill="#6A3AA8" ${o}/>
      <path d="M30 70 C14 96 18 128 34 140 L52 136 C44 112 46 92 56 76Z M170 70 C186 96 182 128 166 140 L148 136 C156 112 154 92 144 76Z" fill="#8A5AD8" ${o}/>
      <circle cx="40" cy="150" r="16" fill="#6A3AA8" ${o}/><circle cx="160" cy="150" r="16" fill="#6A3AA8" ${o}/>
      <path d="M72 30 C72 12 128 12 128 30 L124 58 Q100 70 76 58Z" fill="#F2ECF8" ${o}/>
      <path d="M74 26 Q58 20 50 6 Q66 10 78 18Z M126 26 Q142 20 150 6 Q134 10 122 18Z" fill="#E8DCC8" ${o}/>
      <path d="M86 30 L114 50 M114 30 L86 50" stroke="${D}" stroke-width="7" stroke-linecap="round"/>
      <circle class="bs-eye" cx="88" cy="38" r="3" fill="#FF3A5A"/><circle class="bs-eye" cx="112" cy="38" r="3" fill="#FF3A5A"/>`;
    else if (id === "spectre") art = `
      <path d="M70 120 Q40 110 18 72 Q40 86 56 84 Q36 60 40 34 Q58 60 74 70Z M130 120 Q160 110 182 72 Q160 86 144 84 Q164 60 160 34 Q142 60 126 70Z" fill="#D8DCE8" ${o}/>
      <path d="M80 140 L70 190 L82 190 L92 150Z M120 140 L130 190 L118 190 L108 150Z" fill="#8FAE7A" ${o}/>
      <path d="M100 58 C128 58 136 84 132 110 L124 146 L76 146 L68 110 C64 84 72 58 100 58Z" fill="#E8ECF4" ${o}/>
      <path d="M84 84 Q100 92 116 84 M82 102 Q100 110 118 102 M86 120 Q100 126 114 120" fill="none" stroke="#B8C0D0" stroke-width="3" stroke-linecap="round"/>
      <path d="M68 78 Q40 96 30 132 l-6 14 M30 132 l2 16 M30 132 l10 12 M132 78 Q160 96 170 132 l6 14 M170 132 l-2 16 M170 132 l-10 12" fill="none" stroke="${D}" stroke-width="10" stroke-linecap="round"/>
      <path d="M68 78 Q40 96 30 132 M132 78 Q160 96 170 132" fill="none" stroke="#E8ECF4" stroke-width="5" stroke-linecap="round"/>
      <path d="M100 14 L112 26 L126 20 L122 36 L132 46 L118 52 Q112 66 100 66 Q88 66 82 52 L68 46 L78 36 L74 20 L88 26Z" fill="#F4F6FA" ${o}/>
      <circle class="bs-eye" cx="91" cy="40" r="4.5" fill="#FF2A3A"/><circle class="bs-eye" cx="109" cy="40" r="4.5" fill="#FF2A3A"/>
      <path d="M88 52 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4" fill="none" stroke="${D}" stroke-width="2.5" stroke-linejoin="round"/>`;
    else art = `
      <defs><radialGradient id="bsfog${size}" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="#5A1A2A" stop-opacity=".9"/><stop offset="1" stop-color="#5A1A2A" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="100" cy="120" rx="100" ry="80" fill="url(#bsfog${size})"/>
      <path d="M100 30 C150 30 176 70 180 110 L194 120 L178 128 L186 150 L166 146 L160 190 L120 190 L112 156 L88 156 L80 190 L40 190 L34 146 L14 150 L22 128 L6 120 L20 110 C24 70 50 30 100 30Z" fill="#160A1E" ${o}/>
      <path d="M60 50 Q46 22 52 4 Q66 26 74 40Z M140 50 Q154 22 148 4 Q134 26 126 40Z" fill="#2A1430" ${o}/>
      <path d="M40 70 l-12 -8 l4 14 M160 70 l12 -8 l-4 14 M30 100 l-14 -2 l10 10 M170 100 l14 -2 l-10 10" fill="#2A1430" stroke="${D}" stroke-width="3" stroke-linejoin="round"/>
      <path class="bs-eye" d="M70 70 L94 78 L72 84Z M130 70 L106 78 L128 84Z" fill="#FF2A2A"/>
      <path d="M78 104 Q100 118 122 104 L116 112 L110 106 L104 114 L100 107 L96 114 L90 106 L84 112Z" fill="#FF5A2A" opacity=".85"/>`;
    return `<svg class="bs-art ${cls || ""}" viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true"><ellipse cx="100" cy="194" rx="70" ry="6" fill="#000" opacity=".35"/>${art}</svg>`;
  }

  /* --- Affichage --- */
  const hpBar = big => { const left = hpLeft(); return `<div class="bs-hp ${big ? "big" : ""}"><i style="width:${left}%"></i><span>${left} / ${HP} PV</span></div>`; };
  const thName = t => t === MIX ? "Culture générale (tous les thèmes)" : t.map(k => THEMES[k].n).join(" et ");
  function card(){
    const c = cur(), on = !!uid();
    return `<button class="card bs-card" data-bs="open"><div class="bs-card-art">${bossSVG(c.b.id, 84)}</div><div class="stack" style="gap:4px;min-width:0;flex:1;text-align:left">
      <span class="label">Boss de la semaine</span><b>${esc(c.b.n)}</b>${on && doc ? hpBar(false) : ""}<span class="muted" style="font-size:13px">Aujourd'hui : ${esc(thName(c.themes))}</span>
      <span class="chip ${on && !playedToday() && !(doc && doc.defeatedAt) ? "lamp" : ""}">${!on ? "Connecte-toi dans JcJ pour combattre" : doc && doc.defeatedAt ? "Vaincu ! Bravo à tous" : playedToday() ? "Déjà combattu aujourd'hui" : "1 combat disponible aujourd'hui"}</span></div></button>`;
  }
  function board(){
    if (!doc || !doc.dmg) return `<p class="muted" style="margin:0">Personne n'a encore attaqué cette semaine. Sois le premier !</p>`;
    const ids = Object.keys(doc.dmg).sort((a, b) => doc.dmg[b] - doc.dmg[a]);
    return ids.map((id, i) => `<div class="am-row ${id === uid() ? "me" : ""}"><span class="am-pos ${i < 3 ? "gold" : ""}">${i + 1}</span>${A().avatar(id, 34)}<div class="stack grow" style="gap:0"><b>${esc(A().pseudoOf(id))} ${A().title(id, "xs")}</b><span class="muted" style="font-size:12.5px">${Object.keys((doc.days || {})[id] || {}).length} participation${Object.keys((doc.days || {})[id] || {}).length > 1 ? "s" : ""}${doc.killer === id ? " · coup fatal" : ""}</span></div><b class="am-pts">${doc.dmg[id]} PV</b></div>`).join("");
  }
  function home(){
    const c = cur(), on = !!uid(), friends = on ? Object.keys(A().users()).filter(id => id !== uid()) : [];
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], di = dayIdx(c.day);
    return `<section class="stack bs">
      <div class="row between"><button class="quit" data-bs="back">← Jouer</button><span class="label">Semaine ${c.wk.slice(8)}/${c.wk.slice(5, 7)}</span></div>
      <div class="bs-stage ${doc && doc.defeatedAt ? "dead" : ""}"><div class="bs-glow" style="--bc:${c.b.c}"></div>${bossSVG(c.b.id, 220, "bs-idle")}</div>
      <h1 class="big" style="text-align:center;margin:0">${esc(c.b.n)}</h1>
      ${on ? hpBar(true) : ""}
      ${msg ? `<p class="am-err" style="text-align:center">${esc(msg)}</p>` : ""}
      ${!on ? `<div class="card"><p style="margin:0">Le boss se combat à plusieurs : connecte-toi dans l'onglet <b>JcJ</b> pour l'affronter avec tes amis.</p></div>`
        : doc && doc.defeatedAt ? `<div class="card stack" style="text-align:center"><b>Le boss est vaincu !</b><span class="muted">Les récompenses ont été distribuées. Un nouveau boss arrive lundi.</span></div>`
        : playedToday() ? `<div class="card stack" style="text-align:center"><b>Tu as déjà combattu aujourd'hui</b><span class="muted">Reviens demain, après minuit, pour frapper encore.</span></div>`
        : `<button class="btn bs-go" data-bs="start">Combattre (1 partie par jour)</button>`}
      <div class="card stack"><div class="label">Thèmes de la semaine</div><div class="bs-days">${c.b.days.map((t, i) => `<div class="${i === di ? "on" : i < di ? "past" : ""}"><b>${days[i]}</b><span>${esc(t === MIX ? "Tous" : t.map(k => THEMES[k].n).join(" + "))}</span></div>`).join("")}</div>
        <span class="muted" style="font-size:13px">3 vies, 15 secondes par question. Bonne réponse : 1 PV de dégâts (2 PV si la question est pointue).</span></div>
      <div class="card stack"><div class="label">Récompenses si le boss tombe</div>
        <div class="row" style="gap:12px;align-items:center;flex-wrap:nowrap">${creatureSVG(c.skin, 64)}<div class="stack" style="gap:2px"><b>${esc(c.skin.n)}</b><span class="muted" style="font-size:13px">Personnage du Portail offert à ceux qui infligent au moins ${SKIN_MIN} PV.${S.skins[c.skin.id] ? " Tu l'as déjà : 300 pièces à la place." : ""}</span></div></div>
        <span class="muted" style="font-size:13px">Pour tous les participants : 100 pièces + 15 par PV infligé (600 au plus). Le plus gros contributeur gagne le titre rare ${titleTag("fleau", "xs")}.</span></div>
      ${on ? `<div class="card stack"><div class="label">Appeler à l'aide</div>${friends.length ? `<button class="btn small" data-bs="callall">Appeler tous mes amis</button>${friends.map(id => `<div class="am-row">${A().avatar(id, 34)}<b class="grow">${esc(A().pseudoOf(id))}</b>${(doc && doc.days && doc.days[id] && doc.days[id][c.day] !== undefined) ? `<span class="chip">A combattu</span>` : `<button class="chip-btn" data-bs="call" data-v="${id}">Appeler</button>`}</div>`).join("")}` : `<p class="muted" style="margin:0">Aucun ami inscrit pour l'instant.</p>`}</div>
      <div class="card stack"><div class="label">Classement des dégâts</div>${board()}</div>` : ""}
    </section>`;
  }
  /* ---------- L'arène de combat (style RPG mobile) ----------
     En haut : le boss et sa barre de vie. Au milieu : l'arène en perspective et l'équipe de 3. En bas : la question.
     Pendant le combat, la scène n'est jamais reconstruite : seuls le panneau de question et la barre de vie changent,
     pour que les animations d'attaque se jouent sans être coupées. */
  const AR_SZ = 92;
  function pickTeam(){
    const me = uid(), users = A().users(), dmg = (doc && doc.dmg) || {};
    const fr = Object.keys(users).filter(id => id !== me).sort((a, b) => (dmg[b] || 0) - (dmg[a] || 0) || (A().online(b) - A().online(a)));
    const t = fr.slice(0, 2).map(id => ({id, name:A().pseudoOf(id)}));
    const mine = S.profile.skin && ownsSkin(S.profile.skin) ? S.profile.skin : "b" + S.profile.avatar;
    const own = Object.keys(S.skins || {}).filter(k => skinOf(k)).concat(CHARS.map((_, i) => "b" + i)).filter(k => k !== mine);
    while (t.length < 2 && own.length) { const k = own.splice(Math.floor(Math.random() * own.length), 1)[0]; t.push({sk:k, name:skinOf(k).n}); }
    return [t[0], {me:true, name:S.profile.name}, t[1]];
  }
  const heroSVG = (h, z) => h.me ? meSVG(z) : h.id ? A().avatar(h.id, z) : creatureSVG(skinOf(h.sk), z);
  const SWORD = `<svg class="ar-sword" viewBox="0 0 40 80" aria-hidden="true"><path d="M18 6 L22 6 L23 52 L17 52Z" fill="#E8F2FF" stroke="#1E1030" stroke-width="2"/><path d="M20 2 L23 8 L17 8Z" fill="#E8F2FF" stroke="#1E1030" stroke-width="2"/><path d="M20 8 V50" stroke="#9AB8E0" stroke-width="1.5"/><rect x="9" y="51" width="22" height="6" rx="3" fill="#FFD23F" stroke="#1E1030" stroke-width="2"/><rect x="17" y="57" width="6" height="14" rx="2" fill="#7A4A2A" stroke="#1E1030" stroke-width="2"/><circle cx="20" cy="74" r="4" fill="#FFD23F" stroke="#1E1030" stroke-width="2"/></svg>`;
  function arenaBG(c){
    let arches = "", crowd = "", pillars = "";
    for (let i = 0; i <= 10; i++) { const x = 20 + i * 36, u = (x - 200) / 200, yT = 128 + u * u * 70, s = 1 - Math.abs(u) * .18;
      arches += `<path d="M${x - 11 * s} ${yT + 52} V${yT + 16} Q${x} ${yT - 4} ${x + 11 * s} ${yT + 16} V${yT + 52}Z" fill="#0C0618"/><path d="M${x - 11 * s} ${yT + 52} V${yT + 16} Q${x} ${yT - 4} ${x + 11 * s} ${yT + 16}" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width="2"/>`;
      if (i < 10) { const px = x + 18, pu = (px - 200) / 200, py = 124 + pu * pu * 70; pillars += `<rect x="${px - 4}" y="${py}" width="8" height="64" fill="#3A2C56"/><rect x="${px - 6}" y="${py - 4}" width="12" height="6" fill="#4A3A6A"/>`; }
      for (let r = 0; r < 3; r++) crowd += `<circle cx="${x + (r % 2) * 9 - 4}" cy="${yT - 12 - r * 7}" r="2.6" fill="hsl(${(i * 47 + r * 90) % 360},40%,${45 + r * 6}%)" opacity=".55"/>`; }
    const banner = (x, y) => `<g class="ar-banner"><path d="M${x - 9} ${y} H${x + 9} V${y + 44} L${x} ${y + 36} L${x - 9} ${y + 44}Z" fill="#8A1426" stroke="#2A0A12" stroke-width="1.5"/><circle cx="${x}" cy="${y + 16}" r="5.5" fill="none" stroke="#FFD23F" stroke-width="2"/><path d="M${x} ${y + 10} V${y + 22} M${x - 6} ${y + 16} H${x + 6}" stroke="#FFD23F" stroke-width="1.5"/></g>`;
    const torch = (x, y, k) => `<g><rect x="${x - 7 * k}" y="${y}" width="${14 * k}" height="${22 * k}" rx="2" fill="#2A1E3E" stroke="#120A1E" stroke-width="1.5"/><g class="ar-crystal"><path d="M${x} ${y - 26 * k} L${x + 8 * k} ${y - 6 * k} L${x} ${y + 2} L${x - 8 * k} ${y - 6 * k}Z" fill="#E0B8FF" stroke="#8A4AE8" stroke-width="1.5"/><circle cx="${x}" cy="${y - 10 * k}" r="${20 * k}" fill="url(#arTorch)"/></g></g>`;
    let runes = ""; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; runes += `<path d="M${Math.cos(a) * 150} ${Math.sin(a) * 150} l6 -6 l6 6 l-6 6Z" fill="#FFD98A" transform="rotate(${i * 22.5} ${Math.cos(a) * 150} ${Math.sin(a) * 150})"/>`; }
    let star = ""; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 62 : 118; star += (i ? "L" : "M") + (Math.cos(a) * r).toFixed(1) + " " + (Math.sin(a) * r).toFixed(1); }
    return `<svg class="ar-bg" viewBox="0 0 400 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="arSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07040F"/><stop offset=".55" stop-color="#1C0E33"/><stop offset="1" stop-color="#2A1446"/></linearGradient>
        <radialGradient id="arGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${c}" stop-opacity=".75"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
        <radialGradient id="arOrb" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#FFF0F6"/><stop offset=".35" stop-color="${c}"/><stop offset="1" stop-color="#2A0614"/></radialGradient>
        <radialGradient id="arTorch" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#C98AFF" stop-opacity=".7"/><stop offset="1" stop-color="#C98AFF" stop-opacity="0"/></radialGradient>
        <radialGradient id="arFloor" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#5A4682"/><stop offset=".7" stop-color="#2E2248"/><stop offset="1" stop-color="#140C26"/></radialGradient></defs>
      <rect width="400" height="440" fill="url(#arSky)"/>
      <path d="M0 30 L60 10 L70 40 L130 20 L150 0 H250 L270 20 L330 40 L340 10 L400 30 V0 H0Z" fill="#120A20"/>
      <circle cx="200" cy="96" r="150" fill="url(#arGlow)" class="ar-glow"/>
      <path d="M150 0 L176 70 M250 0 L224 70 M120 0 L170 60 M280 0 L230 60" stroke="#3A2A50" stroke-width="3"/>
      <circle cx="200" cy="96" r="52" fill="url(#arOrb)" class="ar-orb"/><circle cx="200" cy="96" r="62" fill="none" stroke="${c}" stroke-opacity=".6" stroke-width="2" stroke-dasharray="4 8" class="ar-orbring"/>
      <path d="M0 250 Q200 160 400 250 V120 Q200 40 0 120Z" fill="#241A3A"/>
      ${crowd}${arches}${pillars}
      <path d="M0 252 Q200 166 400 252 V262 Q200 178 0 262Z" fill="#3A2C56"/>
      ${banner(92, 150)}${banner(308, 150)}${banner(160, 132)}${banner(240, 132)}
      <ellipse cx="200" cy="320" rx="224" ry="120" fill="#0C0618"/>
      <ellipse cx="200" cy="318" rx="210" ry="110" fill="url(#arFloor)" stroke="#120A1E" stroke-width="3"/>
      <g transform="translate(200 322) scale(1 .5)">
        <circle r="198" fill="none" stroke="#C9A24A" stroke-width="5" class="ar-line"/>
        <circle r="175" fill="none" stroke="${c}" stroke-opacity=".55" stroke-width="3"/>
        <g class="ar-spin">${runes}<circle r="150" fill="none" stroke="#FFD98A" stroke-opacity=".5" stroke-width="2" stroke-dasharray="10 14"/></g>
        <path d="${star}Z" fill="none" stroke="#FFD98A" stroke-width="3" class="ar-line"/>
        <circle r="62" fill="${c}" fill-opacity=".22" stroke="#FFD98A" stroke-width="3" class="ar-line"/>
        <circle r="30" fill="${c}" fill-opacity=".35" class="ar-core"/>
      </g>
      ${torch(30, 268, 1)}${torch(370, 268, 1)}${torch(18, 392, 1.25)}${torch(382, 392, 1.25)}
    </svg>`;
  }
  const hpHTML = () => { const left = hpLeft(); return `<div class="bs-hp" id="ar-hp"><i style="width:${left}%"></i><span>${left} / ${HP} PV</span></div>`; };
  function panelHTML(){
    const r = run, id = r.qs[r.i], q = Q[id], ans = r.ans, left = Math.max(0, r.dl - Date.now());
    const ch = r.ord.map(o => { let k = "choice"; if (ans !== undefined) k += o === 0 ? " right" : o === ans ? " wrong" : " dim";
      return `<button class="${k}" data-bs="ans" data-v="${o}" ${ans === undefined ? "" : "disabled"}>${esc(q[2][o])}</button>`; }).join("");
    return `<div class="row between"><span class="chip">${dot(q[0])}${esc(THEMES[q[0]].n)}</span><span class="ar-meta"><span class="hearts">${"♥".repeat(r.lives)}<span style="opacity:.25">${"♥".repeat(LIVES - r.lives)}</span></span> <b id="bs-left">${ans === undefined ? Math.ceil(left / 1000) + " s" : ""}</b></span></div>
      <div class="timer" style="margin:6px 0 0"><i id="bs-bar" style="width:${ans === undefined ? left / (Q_TIME * 10) : 0}%"></i></div>
      <h2>${esc(q[4])}</h2><div class="choices ar-choices">${ch}</div>
      ${ans !== undefined && ans !== 0 ? `<p class="ar-miss"><b>${ans === -1 ? "Temps écoulé" : "Raté"} :</b> ${esc(q[2][0])}</p>` : ""}`;
  }
  function fight(){
    const c = cur(); if (!run.team) run.team = pickTeam();
    const pos = [22, 50, 78], emb = Array.from({length:14}, (_, i) => `<i class="ar-ember" style="left:${(i * 7.3 + 4) % 100}%;animation-delay:${(i * .43) % 5}s;animation-duration:${4 + (i % 4)}s"></i>`).join("");
    return `<section class="ar">
      <div class="ar-scene" style="--bc:${c.b.c}">${arenaBG(c.b.c)}${emb}
        <div class="ar-top"><div class="row between"><b class="ar-bname">${esc(c.b.n)}</b><span class="ar-mydmg">Tes dégâts : <b id="ar-my">${run.dmg}</b> PV</span></div>${hpHTML()}</div>
        <div class="ar-boss"><div class="ar-bshadow"></div>${bossSVG(c.b.id, 170, "bs-idle")}</div>
        ${run.team.map((h, i) => `<div class="ar-hero ${h.me ? "me" : ""}" data-i="${i}" style="left:${pos[i]}%"><div class="ar-hshadow"></div><div class="ar-body">${heroSVG(h, h.me ? AR_SZ + 8 : AR_SZ)}${SWORD}</div><span class="ar-tag">${esc(h.name)}</span></div>`).join("")}
        <div class="ar-fx" id="ar-fx"></div>
      </div>
      <div class="card q ar-panel" id="ar-panel">${panelHTML()}</div>
      <button class="ar-quit" data-bs="leavefight">Abandonner le combat</button>
    </section>`;
  }
  function paintPanel(){ const p = document.getElementById("ar-panel"); if (p) p.innerHTML = panelHTML(); else render(); }
  function paintHP(){ const h = document.getElementById("ar-hp"); if (h) { const left = hpLeft(); h.querySelector("i").style.width = left + "%"; h.querySelector("span").textContent = `${left} / ${HP} PV`; }
    const m = document.getElementById("ar-my"); if (m && run) m.textContent = run.dmg; }
  // Une attaque à l'épée, parmi 4 : ruée, saut, tourbillon, estocade
  function attack(dmg){
    const scene = document.querySelector(".ar-scene"); if (!scene || !scene.animate) return;
    const heroes = [...scene.querySelectorAll(".ar-hero")], order = [1, 0, 2];
    run.turn = (run.turn || 0) + 1; const h = heroes[order[run.turn % 3]], boss = scene.querySelector(".ar-boss");
    if (!h || !boss) return;
    const hr = h.getBoundingClientRect(), br = boss.getBoundingClientRect();
    const dx = (br.left + br.width / 2) - (hr.left + hr.width / 2), dy = (br.top + br.height * .82) - (hr.top + hr.height * .55);
    const v = run.vari = ((run.vari == null ? -1 : run.vari) + 1 + Math.floor(Math.random() * 3)) % 4;
    const at = (k, s, extra) => `translate(${(dx * k).toFixed(0)}px,${(dy * k).toFixed(0)}px) scale(${s})${extra || ""}`;
    const F = [
      [{transform:"none"}, {offset:.34, transform:at(.9, .8)}, {offset:.62, transform:at(.9, .8)}, {transform:"none"}],
      [{transform:"none"}, {offset:.22, transform:`translate(${(dx * .4).toFixed(0)}px,${(dy * .4 - 90).toFixed(0)}px) scale(.92)`}, {offset:.4, transform:at(.92, .78)}, {offset:.62, transform:at(.92, .78)}, {transform:"none"}],
      [{transform:"none"}, {offset:.38, transform:at(.9, .8, " rotate(360deg)")}, {offset:.62, transform:at(.9, .8, " rotate(360deg)")}, {transform:"none"}],
      [{transform:"none"}, {offset:.14, transform:"translate(0,14px) scale(1.06,.92)"}, {offset:.36, transform:at(.95, .78)}, {offset:.62, transform:at(.95, .78)}, {transform:"none"}]
    ][v];
    h.classList.add("atk"); h.animate(F, {duration:1050, easing:"cubic-bezier(.45,0,.3,1)"}).onfinish = () => h.classList.remove("atk");
    const sw = h.querySelector(".ar-sword");
    if (sw) sw.animate([{transform:"rotate(-20deg)"}, {offset:.3, transform:"rotate(-80deg)"}, {offset:.42, transform:"rotate(120deg)"}, {offset:.62, transform:"rotate(90deg)"}, {transform:"rotate(-20deg)"}], {duration:1050});
    setTimeout(() => impact(dmg, v, scene, boss), 430);
  }
  function impact(dmg, v, scene, boss){
    try { Music.sfx("combo"); navigator.vibrate && navigator.vibrate(40); } catch(e){}
    const svg = boss.querySelector("svg");
    if (svg) svg.animate([{transform:"none", filter:"none"}, {offset:.2, transform:"translateX(-12px) rotate(-4deg)", filter:"brightness(2.4) saturate(.2)"}, {offset:.5, transform:"translateX(9px) rotate(3deg)"}, {transform:"none", filter:"none"}], {duration:420});
    scene.animate([{transform:"none"}, {transform:"translate(5px,-4px)"}, {transform:"translate(-4px,3px)"}, {transform:"none"}], {duration:260});
    const fx = document.getElementById("ar-fx"); if (!fx) return;
    const sr = scene.getBoundingClientRect(), br = boss.getBoundingClientRect(), x = br.left - sr.left + br.width / 2, y = br.top - sr.top + br.height * .55;
    const ang = [-35, 20, 0, -65][v];
    const sparks = Array.from({length:10}, (_, i) => { const a = i / 10 * Math.PI * 2; return `<i class="ar-spark" style="left:${x}px;top:${y}px;--sx:${(Math.cos(a) * 70).toFixed(0)}px;--sy:${(Math.sin(a) * 70).toFixed(0)}px"></i>`; }).join("");
    fx.insertAdjacentHTML("beforeend", `<svg class="ar-slash" style="left:${x - 90}px;top:${y - 90}px;transform:rotate(${ang}deg)" viewBox="-90 -90 180 180"><defs><linearGradient id="arSl${run.turn}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#FFD23F"/></linearGradient></defs>${v === 2 ? `<circle r="62" fill="none" stroke="url(#arSl${run.turn})" stroke-width="12" stroke-linecap="round" class="ar-arc"/>` : `<path d="M-80 30 Q0 -70 80 -20" fill="none" stroke="url(#arSl${run.turn})" stroke-width="14" stroke-linecap="round" class="ar-arc"/>`}</svg>
      <svg class="ar-burst" style="left:${x - 50}px;top:${y - 50}px" viewBox="-50 -50 100 100"><path d="M0 -46 L10 -12 L44 -16 L16 4 L30 38 L0 16 L-30 38 L-16 4 L-44 -16 L-10 -12Z" fill="#FFF6C8" stroke="#FFD23F" stroke-width="3"/></svg>
      ${sparks}<b class="ar-dmg" style="left:${x}px;top:${y - 30}px">-${dmg}</b>`);
    setTimeout(() => { fx.innerHTML = ""; }, 1100);
    paintHP();
  }
  // Mauvaise réponse : le boss riposte et frappe l'équipe
  function counter(){
    const scene = document.querySelector(".ar-scene"); if (!scene || !scene.animate) return;
    const boss = scene.querySelector(".ar-boss"); if (boss) boss.animate([{transform:"translateX(-50%)"}, {offset:.35, transform:"translateX(-50%) translateY(46px) scale(1.14)"}, {transform:"translateX(-50%)"}], {duration:720, easing:"cubic-bezier(.5,0,.3,1)"});
    setTimeout(() => {
      scene.querySelectorAll(".ar-hero .ar-body").forEach((b, i) => b.animate([{transform:"none", filter:"none"}, {offset:.3, transform:`translate(${(i - 1) * 10}px,14px) rotate(${(i - 1) * 10 - 4}deg)`, filter:"brightness(1.6) sepia(1) hue-rotate(-40deg) saturate(4)"}, {transform:"none", filter:"none"}], {duration:600}));
      scene.animate([{transform:"none"}, {transform:"translate(-6px,4px)"}, {transform:"translate(6px,-3px)"}, {transform:"none"}], {duration:320});
      const fx = document.getElementById("ar-fx"); if (fx) { fx.insertAdjacentHTML("beforeend", `<div class="ar-redflash"></div>`); setTimeout(() => { fx.innerHTML = ""; }, 600); }
    }, 260);
  }
  function arenaDefeat(){
    const scene = document.querySelector(".ar-scene"); if (!scene) return;
    const svg = scene.querySelector(".ar-boss svg"); if (svg && svg.animate) svg.animate([{transform:"none", filter:"none", opacity:1}, {offset:.3, transform:"translateX(-8px) rotate(-5deg)", filter:"brightness(2.5)"}, {offset:.6, transform:"translateX(8px) rotate(5deg)", filter:"brightness(2.5)"}, {transform:"translateY(60px) rotate(-16deg) scale(.7)", filter:"grayscale(1) brightness(.4)", opacity:0}], {duration:1800, fill:"forwards"});
    // Calque à part : les effets de coups (ar-fx) sont vidés après chaque impact
    scene.insertAdjacentHTML("beforeend", `<div class="ar-victory"><b>VICTOIRE</b><span>${esc(cur().b.n)} est vaincu !</span></div>`);
    try { Music.sfx("boom"); setTimeout(() => Music.sfx("win"), 900); } catch(e){}
  }
  function done(){
    const c = cur(), r = run || {dmg:st().last || 0};
    return `<section class="stack bs"><div class="bs-stage"><div class="bs-glow" style="--bc:${c.b.c}"></div>${bossSVG(c.b.id, 180)}</div>
      <div class="card stack" style="text-align:center;align-items:center"><span class="label">Combat terminé</span><b style="font:900 44px var(--f-display)">${r.dmg} PV</b><span>infligés à ${esc(c.b.n)} aujourd'hui</span>${hpBar(false)}</div>
      <button class="btn" data-bs="home">Voir le boss et le classement</button></section>`;
  }
  function viewAll(){ listen(); if (view === "fight" && run) return fight(); if (view === "done") return done(); return home(); }

  /* --- Clics --- */
  function click(b){
    const a = b.dataset.bs; msg = "";
    if (a === "open") { view = "home"; S.bossOpen = true; render(); return window.scrollTo(0, 0); }
    if (a === "back") { S.bossOpen = false; view = "home"; return render(); }
    if (a === "home") { run = null; view = "home"; return render(); }
    if (a === "start") return start();
    if (a === "ans") return answer(+b.dataset.v);
    if (a === "leavefight") { if (run) { run.lives = 0; finish(); } return; }
    if (a === "call") return call([b.dataset.v]);
    if (a === "callall") return call(Object.keys(A().users()).filter(id => id !== uid()));
  }
  // En pleine partie, quitter l'onglet ne relance rien : la partie du jour est déjà comptée
  return {card, view:viewAll, click, listen, open:() => !!S.bossOpen, playing:() => !!(run && view === "fight" && S.tab === "jouer"), svg:bossSVG, current:cur};
})();

/* --- Badges du Boss --- */
[["boss1","argent",1,"wins","Chasseur de boss","Participer à la victoire contre un boss",50],
 ["boss5","or",5,"wins","Briseur de géants","Participer à la victoire contre 5 boss",120],
 ["bosskill","platine",1,"kills","Coup de grâce","Porter le coup fatal à un boss",150],
 ["bosstop","diamant",1,"tops","Fléau des boss","Être le plus gros contributeur contre un boss",200]
].forEach(([id, tier, goal, k, name, desc, coins]) => BADGES.push({id, g:"En ligne", tier, icon:"duel", name, desc, coins, goal, cur:() => (S.boss && S.boss[k]) || 0}));
