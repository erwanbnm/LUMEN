/* ---------- Le Casino : La Taverne du Trèfle d'Or (Monde 1 de l'Aventure) ----------
   Les jeux sont ceux de l'ancien Casino du parc 3D, sans changement de règles :
   roulette (rouge/noir, x2), blackjack (croupier tire jusqu'à 17, blackjack x2,5), courses (5 chevaux et leurs cotes),
   roue du jour (une fois par jour, 10 à 100 pièces). Mises de 10 à 300. Personnages secrets Trèfle, Dédé et Veinard.
   Seul le décor change : une salle de taverne en 2D au lieu de la salle 3D. */
const Casino = (() => {
  const MIN_BET = 10, MAX_BET = 300;
  const REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  const HORSES = [
    {n:"Éclair", c:"#E84A5A", odds:2.5}, {n:"Tempête", c:"#5AA9F0", odds:3.5}, {n:"Comète", c:"#F2C440", odds:5},
    {n:"Brindille", c:"#B48CF2", odds:7}, {n:"Pépite", c:"#6CC27A", odds:12}
  ];
  const WHEEL = [10,25,15,50,10,30,20,100];
  const WCOL = ["#E84A5A","#F2C440","#5AA9F0","#6CC27A","#B48CF2","#F27BA8","#FF8A3D","#3FD8C8"];
  const G_ = {game:null, bet:10, busy:false, color:null, horse:null, bj:null, msg:"", race:null, roul:null, wheel:null};
  const clampBet = v => Math.max(MIN_BET, Math.min(MAX_BET, Math.round(v/10)*10));
  const C = () => { S.cas = S.cas || {wheel:(S.parc && S.parc.wheelDay) || ""}; return S.cas; };
  let root = null;
  const $c = id => document.getElementById(id);

  function open(){
    if (!root) { root = document.createElement("div"); root.id = "casino"; document.body.appendChild(root);
      root.addEventListener("click", e => { const b = e.target.closest("[data-g]"); if (!b || b.disabled) return; act(b.dataset.g, b.dataset); }); }
    G_.game = null; G_.msg = ""; root.hidden = false; document.body.classList.add("in-casino"); paint();
    if (typeof MusiqueFichier !== "undefined") MusiqueFichier.set(null);
    try { Music.sfx("tab1"); } catch(e){}
  }
  function close(){ if (G_.busy) return; root.hidden = true; document.body.classList.remove("in-casino"); try { checkBadges(); save(); } catch(e){} if (typeof render === "function" && !Aventure.playing()) render(); try { flushLevelUp(); } catch(e){} }
  const coinsTxt = () => Math.floor(S.coins);
  function paint(){
    const head = `<div class="cas-top"><button class="cas-x" data-g="${G_.game ? "hall" : "close"}">${G_.game ? "← La salle" : "← La forêt"}</button><span class="cas-coins"><span class="coin"></span><b id="cas-c">${coinsTxt()}</b></span></div>`;
    if (!G_.game) {
      const done = C().wheel === today();
      root.innerHTML = `<div class="cas-wrap">${head}<div class="cas-hall"><div class="cas-sign"><b>☘ La Taverne du Trèfle d'Or</b><span>Le Casino de Lumen, caché dans la forêt</span></div>
        <div class="cas-grid">${[["roulette", "Roulette", "Rouge ou noir, x2", ICON.roulette], ["blackjack", "Blackjack", "Approche-toi de 21", ICON.bj], ["courses", "Courses", "5 chevaux, 5 cotes", ICON.horse], ["roue", "Roue du jour", done ? "Reviens demain !" : "Un tour gratuit par jour", ICON.wheel]]
          .map(([k, n, d, ic]) => `<button class="cas-card ${k === "roue" ? "wheel" : ""} ${k === "roue" && done ? "used" : ""}" data-g="open" data-v="${k}"><svg width="64" height="58" viewBox="-30 -28 60 56">${ic()}</svg><b>${n}</b><span>${d}</span></button>`).join("")}</div>
        <p class="cas-note">Mises de ${MIN_BET} à ${MAX_BET} pièces. Joue avec modération : ce ne sont que des pièces de Lumen !</p></div></div>`;
      return;
    }
    root.innerHTML = `<div class="cas-wrap">${head}<div class="gbox"><h2 id="game-title"></h2><div id="game-body"></div></div></div>`;
    renderGame();
  }
  function ui(){ const c = $c("cas-c"); if (c) c.textContent = coinsTxt(); }
  function pay(n){ S.coins += n; save(); ui(); }
  const ev = (k, v) => { try { const n = gameEvent(k, v); if (n) setTimeout(() => { G_.msg += ` · Personnage secret débloqué : ${n} !`; renderGame(); }, 600); } catch(e){} };
  function take(n){ if (S.coins < n) { G_.msg = `Il te manque ${Math.ceil(n - S.coins)} pièces pour cette mise.`; renderGame(); return false; } S.coins -= n; save(); ui(); return true; }

  function betBar(locked){
    return `<div class="betbar"><span class="label">Mise</span>
      <button data-g="bet" data-d="-10" ${locked?"disabled":""} aria-label="Baisser la mise">−</button>
      <b class="betv"><span class="coin"></span>${G_.bet}</b>
      <button data-g="bet" data-d="10" ${locked?"disabled":""} aria-label="Augmenter la mise">+</button>
      <span class="chips">${[10,50,100,300].map(v => `<button data-g="betset" data-v="${v}" ${locked?"disabled":""} aria-pressed="${G_.bet===v}">${v}</button>`).join("")}</span></div>`;
  }
  /* --- Cartes --- */
  const SUITS = [["♠","#1B1A33"],["♥","#D8343A"],["♦","#D8343A"],["♣","#1B1A33"]];
  const RANKS = ["A","2","3","4","5","6","7","8","9","10","V","D","R"];
  const drawCard = () => ({r:RANKS[Math.floor(Math.random()*13)], s:Math.floor(Math.random()*4)});
  const cardVal = c => c.r === "A" ? 11 : ["V","D","R"].includes(c.r) ? 10 : +c.r;
  function handVal(h){ let v = h.reduce((a,c) => a + cardVal(c), 0), aces = h.filter(c => c.r === "A").length; while (v > 21 && aces) { v -= 10; aces--; } return v; }
  const cardHTML = (c, hidden) => hidden ? `<span class="card back"></span>` : `<span class="card" style="color:${SUITS[c.s][1]}"><b>${c.r}</b><i>${SUITS[c.s][0]}</i></span>`;

  function renderGame(){
    const g = G_.game, body = $c("game-body"), title = $c("game-title"); if (!body) return;
    if (g === "roulette") {
      title.textContent = "Roulette européenne";
      const r = G_.roul;
      body.innerHTML = `<p class="muted">Mise sur rouge ou noir. Si la bille tombe sur ta couleur, tu doubles ta mise. Le 0 vert fait perdre tout le monde.</p>
        <div class="roul-num ${r ? (r.n===0?"g":REDS.has(r.n)?"r":"b") : ""}">${r ? r.n : "?"}</div>
        <div class="pickrow"><button class="pick red" data-g="color" data-v="rouge" aria-pressed="${G_.color==="rouge"}" ${G_.busy?"disabled":""}>Rouge</button><button class="pick black" data-g="color" data-v="noir" aria-pressed="${G_.color==="noir"}" ${G_.busy?"disabled":""}>Noir</button></div>
        ${betBar(G_.busy)}
        <button class="go" data-g="roulette" ${G_.busy||!G_.color?"disabled":""}>${G_.color ? `Lancer la bille sur ${G_.color}` : "Choisis une couleur"}</button>
        <p class="gmsg" role="status">${G_.msg}</p>`;
    } else if (g === "blackjack") {
      title.textContent = "Blackjack";
      const bj = G_.bj, playing = bj && bj.phase === "play";
      const dealer = bj ? bj.dealer.map((c,i) => cardHTML(c, playing && i===1)).join("") : "";
      const player = bj ? bj.player.map(c => cardHTML(c)).join("") : "";
      body.innerHTML = `<p class="muted">Approche-toi de 21 sans dépasser. Le croupier tire jusqu'à 17. Un blackjack d'entrée paie 3 contre 2.</p>
        <div class="table-felt">
          <div class="hand"><span class="label">Croupier ${bj && !playing ? "· " + handVal(bj.dealer) : bj ? "· " + cardVal(bj.dealer[0]) + " + ?" : ""}</span><div class="cards">${dealer || '<span class="card ghost"></span><span class="card ghost"></span>'}</div></div>
          <div class="hand"><span class="label">Toi ${bj ? "· " + handVal(bj.player) : ""}</span><div class="cards">${player || '<span class="card ghost"></span><span class="card ghost"></span>'}</div></div>
        </div>
        ${playing ? `<div class="pickrow"><button class="pick" data-g="hit">Tirer</button><button class="pick" data-g="stand">Rester</button><button class="pick" data-g="double" ${bj.player.length!==2 || S.coins < bj.bet ? "disabled" : ""}>Doubler</button></div>`
          : `${betBar(false)}<button class="go" data-g="deal">Distribuer</button>`}
        <p class="gmsg" role="status">${G_.msg}</p>`;
    } else if (g === "courses") {
      title.textContent = "Courses de chevaux";
      const rc = G_.race;
      body.innerHTML = `<p class="muted">Choisis ton cheval. S'il gagne, tu touches ta mise multipliée par sa cote. Plus la cote est haute, plus il est outsider.</p>
        <div class="track">${HORSES.map((h,i) => `<div class="lane"><span class="hname">${h.n}</span><span class="horse" id="hz${i}" style="--c:${h.c};left:${rc ? rc.pos[i]*86 : 0}%">${horseSVG(h.c)}</span></div>`).join("")}<span class="finish"></span></div>
        <div class="horses">${HORSES.map((h,i) => `<button class="hpick" data-g="horse" data-v="${i}" aria-pressed="${G_.horse===i}" ${G_.busy?"disabled":""}><i style="background:${h.c}"></i>${h.n}<span>x${String(h.odds).replace(".",",")}</span></button>`).join("")}</div>
        ${betBar(G_.busy)}
        <button class="go" data-g="race" ${G_.busy||G_.horse===null?"disabled":""}>${G_.horse===null ? "Choisis un cheval" : `Départ ! Mise sur ${HORSES[G_.horse].n}`}</button>
        <p class="gmsg" role="status">${G_.msg}</p>`;
    } else if (g === "roue") {
      title.textContent = "Roue de la fortune";
      const done = C().wheel === today() && !G_.busy;
      body.innerHTML = `<p class="muted">Un tour gratuit par jour : de 10 à 100 pièces.</p>
        <div class="cas-wheel"><svg viewBox="-110 -118 220 230" width="240" height="250"><g id="cas-spin" style="transform:rotate(${G_.wheel ? G_.wheel.deg : 0}deg)">${WHEEL.map((v, k) => { const a0 = (k * 45 - 90) * Math.PI / 180, a1 = ((k + 1) * 45 - 90) * Math.PI / 180, am = (a0 + a1) / 2;
          return `<path d="M0 0 L${(100*Math.cos(a0)).toFixed(1)} ${(100*Math.sin(a0)).toFixed(1)} A100 100 0 0 1 ${(100*Math.cos(a1)).toFixed(1)} ${(100*Math.sin(a1)).toFixed(1)}Z" fill="${WCOL[k]}" stroke="#2B1D3A" stroke-width="2.4"/><text x="${(66*Math.cos(am)).toFixed(1)}" y="${(66*Math.sin(am)+7).toFixed(1)}" text-anchor="middle" transform="rotate(${k*45+22.5} ${(66*Math.cos(am)).toFixed(1)} ${(66*Math.sin(am)).toFixed(1)})" style="font:800 20px var(--f-display)" fill="#fff" stroke="#2B1D3A" stroke-width="3" paint-order="stroke">${v}</text>`; }).join("")}</g>
          <circle r="104" fill="none" stroke="#FFD23F" stroke-width="7"/><circle r="104" fill="none" stroke="#2B1D3A" stroke-width="2"/><circle r="15" fill="#FFD23F" stroke="#2B1D3A" stroke-width="3"/><path d="M0 -96 L-12 -118 L12 -118Z" fill="#FFD23F" stroke="#2B1D3A" stroke-width="3" stroke-linejoin="round"/></svg></div>
        <button class="go" data-g="spin" ${G_.busy || done ? "disabled" : ""}>${done ? "Déjà tournée aujourd'hui, reviens demain !" : "Faire tourner la roue"}</button>
        <p class="gmsg" role="status">${G_.msg}</p>`;
    }
  }
  function horseSVG(c){ return `<svg viewBox="0 0 48 36" width="44" height="33" aria-hidden="true"><g stroke="#1B1A33" stroke-width="1.6" stroke-linejoin="round">
    <path d="M8 20 C8 14 14 12 22 12 L30 12 L36 4 L42 6 L40 12 C44 14 44 18 40 18 L36 18 L34 22 C34 26 30 27 26 27 L14 27 C10 27 8 24 8 20Z" fill="#C8955A"/>
    <path d="M10 26 l-3 8 M16 27 l1 8 M28 27 l-2 8 M33 24 l4 8" stroke-width="2.4" fill="none"/>
    <path d="M8 18 C3 18 2 24 4 28" fill="none" stroke-width="2.4"/>
    <path d="M18 12 C18 6 26 6 26 12Z" fill="${c}"/><circle cx="22" cy="5.5" r="3.2" fill="${c}"/>
    <circle cx="39.5" cy="9" r="1" fill="#1B1A33"/></g></svg>`; }

  function act(a, d){
    if (a === "close") return close();
    if (a === "hall") { if (G_.busy) return; G_.game = null; G_.msg = ""; return paint(); }
    if (a === "open") { G_.game = d.v; G_.msg = ""; G_.busy = false; G_.bj = null; G_.race = null; G_.roul = null; G_.wheel = null; return paint(); }
    if (a === "bet") { G_.bet = clampBet(G_.bet + (+d.d)); return renderGame(); }
    if (a === "betset") { G_.bet = clampBet(+d.v); return renderGame(); }
    if (a === "color") { G_.color = d.v; return renderGame(); }
    if (a === "horse") { G_.horse = +d.v; return renderGame(); }
    if (a === "roulette") {
      if (G_.busy || !take(G_.bet)) return; G_.busy = true; G_.msg = "Les jeux sont faits, rien ne va plus…";
      const n = Math.floor(Math.random()*37), bet = G_.bet, color = G_.color; let k = 0;
      const iv = setInterval(() => { G_.roul = {n:Math.floor(Math.random()*37)}; renderGame(); if (++k > 22) { clearInterval(iv); G_.roul = {n}; G_.busy = false;
        const col = n === 0 ? "vert" : REDS.has(n) ? "rouge" : "noir", win = col === color;
        if (win) pay(bet*2); G_.msg = win ? `${n} ${col} : gagné ! +${bet*2} pièces` : `${n} ${col} : perdu.`; ev("rl", win); renderGame(); } }, 90);
      return;
    }
    if (a === "deal") {
      if (!take(G_.bet)) return;
      G_.bj = {player:[drawCard(), drawCard()], dealer:[drawCard(), drawCard()], phase:"play", bet:G_.bet}; G_.msg = "";
      if (handVal(G_.bj.player) === 21) return finishBJ(true);
      return renderGame();
    }
    const bj = G_.bj;
    if (a === "hit" && bj) { bj.player.push(drawCard()); if (handVal(bj.player) > 21) { bj.phase = "done"; G_.msg = `Tu dépasses 21 : perdu (${handVal(bj.player)}).`; ev("bj", false); } else if (handVal(bj.player) === 21) return finishBJ(); return renderGame(); }
    if (a === "stand" && bj) return finishBJ();
    if (a === "double" && bj) { if (!take(bj.bet)) return; bj.bet *= 2; bj.player.push(drawCard()); if (handVal(bj.player) > 21) { bj.phase = "done"; G_.msg = `Tu dépasses 21 : perdu (${handVal(bj.player)}).`; ev("bj", false); return renderGame(); } return finishBJ(); }
    if (a === "race") {
      if (G_.busy || !take(G_.bet)) return; G_.busy = true; G_.msg = "Et c'est parti !";
      const w = HORSES.map(h => 1/h.odds), sum = w.reduce((x,y) => x+y, 0); let r = Math.random()*sum, winner = 0; for (let i=0;i<w.length;i++){ r -= w[i]; if (r <= 0) { winner = i; break; } }
      const fin = HORSES.map((_,i) => i === winner ? 1 : 1.04 + Math.random()*.28), wob = HORSES.map(() => Math.random()*6), bet = G_.bet, pick = G_.horse, T = 4200, t0 = performance.now();
      G_.race = {pos:HORSES.map(() => 0)}; renderGame();
      const step = now => { const t = (now - t0)/T;
        HORSES.forEach((_,i) => { const p = Math.min(1, t/fin[i]); G_.race.pos[i] = Math.min(1, p + Math.sin(p*9 + wob[i])*.02*(1-p)); const el = $c("hz"+i); if (el) el.style.left = (G_.race.pos[i]*86) + "%"; });
        if (t < Math.max(...fin)*1.02) return requestAnimationFrame(step);
        G_.busy = false; const won = winner === pick, gain = Math.round(bet*HORSES[pick].odds);
        if (won) pay(gain); G_.msg = won ? `${HORSES[winner].n} gagne ! +${gain} pièces` : `${HORSES[winner].n} gagne la course. Ton cheval n'a pas gagné.`; ev("race", won ? HORSES[pick].odds : 0); renderGame(); };
      requestAnimationFrame(step);
    }
    if (a === "spin") {
      if (G_.busy || C().wheel === today()) return;
      const k = Math.floor(Math.random()*8); G_.busy = true; C().wheel = today(); save();
      G_.wheel = {deg:0}; G_.msg = ""; renderGame();
      const el = $c("cas-spin"), deg = 360 * 5 + (360 - (k * 45 + 22.5));
      requestAnimationFrame(() => { el.style.transition = "transform 4s cubic-bezier(.15,.85,.2,1)"; el.style.transform = `rotate(${deg}deg)`; });
      setTimeout(() => { G_.busy = false; G_.wheel = {deg:deg % 360}; pay(WHEEL[k]); G_.msg = `Roue de la fortune : +${WHEEL[k]} pièces !`; try { Music.sfx("level"); } catch(e){} renderGame(); }, 4200);
    }
  }
  function finishBJ(natural){
    const bj = G_.bj; bj.phase = "done";
    const pv = handVal(bj.player);
    if (natural) { const dv = handVal(bj.dealer); if (dv === 21) { pay(bj.bet); G_.msg = "Blackjack des deux côtés : égalité, mise rendue."; } else { const g = Math.round(bj.bet*2.5); pay(g); G_.msg = `Blackjack ! +${g} pièces`; ev("bj", true); } return renderGame(); }
    while (handVal(bj.dealer) < 17) bj.dealer.push(drawCard());
    const dv = handVal(bj.dealer);
    if (dv > 21 || pv > dv) { pay(bj.bet*2); G_.msg = `${dv > 21 ? "Le croupier dépasse 21" : `${pv} contre ${dv}`} : gagné ! +${bj.bet*2} pièces`; ev("bj", true); }
    else if (pv === dv) { pay(bj.bet); G_.msg = `Égalité à ${pv} : mise rendue.`; }
    else { G_.msg = `${pv} contre ${dv} : le croupier gagne.`; ev("bj", false); }
    renderGame();
  }
  const D = "#2B1D3A";
  const ICON = {
    roulette:() => `<circle r="22" fill="#2A1A14" stroke="#FFD23F" stroke-width="3"/>${Array.from({length:12}, (_, k) => `<path d="M0 0 L${(20*Math.cos(k*Math.PI/6)).toFixed(1)} ${(20*Math.sin(k*Math.PI/6)).toFixed(1)} A20 20 0 0 1 ${(20*Math.cos((k+1)*Math.PI/6)).toFixed(1)} ${(20*Math.sin((k+1)*Math.PI/6)).toFixed(1)}Z" fill="${k % 2 ? "#E2323A" : "#1A1A1A"}"/>`).join("")}<circle r="7" fill="#FFD23F" stroke="${D}" stroke-width="2"/><circle cx="10" cy="-10" r="3" fill="#fff"/>`,
    bj:() => `<rect x="-20" y="-16" width="22" height="30" rx="3" fill="#fff" stroke="${D}" stroke-width="2.4" transform="rotate(-12)"/><rect x="-4" y="-16" width="22" height="30" rx="3" fill="#fff" stroke="${D}" stroke-width="2.4" transform="rotate(10)"/><text x="6" y="4" text-anchor="middle" transform="rotate(10)" style="font:800 13px var(--f-display)" fill="#E2323A">A♥</text>`,
    horse:() => `<path d="M-18 10 Q-16 -6 0 -8 L8 -16 L12 -10 L16 -12 L14 -2 Q18 8 10 12 L6 4 L-8 6 L-10 14Z" fill="#C88A50" stroke="${D}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="9" cy="-9" r="1.6" fill="${D}"/><path d="M-4 -8 L-6 -14 L2 -12Z" fill="#E84A5A" stroke="${D}" stroke-width="1.6"/>`,
    wheel:() => `<g class="cas-ic-spin">${Array.from({length:8}, (_, k) => `<path d="M0 0 L${(20*Math.cos(k*Math.PI/4)).toFixed(1)} ${(20*Math.sin(k*Math.PI/4)).toFixed(1)} A20 20 0 0 1 ${(20*Math.cos((k+1)*Math.PI/4)).toFixed(1)} ${(20*Math.sin((k+1)*Math.PI/4)).toFixed(1)}Z" fill="${WCOL[k]}" stroke="${D}" stroke-width="1.2"/>`).join("")}</g><circle r="20" fill="none" stroke="#FFD23F" stroke-width="3"/><path d="M0 -26 L-5 -17 L5 -17Z" fill="#FFD23F" stroke="${D}" stroke-width="1.6"/>`
  };
  return {open, close, isOpen:() => !!(root && !root.hidden)};
})();
