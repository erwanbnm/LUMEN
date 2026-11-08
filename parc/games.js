/* ---------- Jeux du casino : roulette, blackjack, courses ---------- */
const MIN_BET = 10, MAX_BET = 300;
const REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const HORSES = [
  {n:"Éclair", c:"#E84A5A", odds:2.5}, {n:"Tempête", c:"#5AA9F0", odds:3.5}, {n:"Comète", c:"#F2C440", odds:5},
  {n:"Brindille", c:"#B48CF2", odds:7}, {n:"Pépite", c:"#6CC27A", odds:12}
];
const G_ = {game:null, bet:10, busy:false, color:null, horse:null, bj:null, msg:"", race:null, roul:null};
const clampBet = v => Math.max(MIN_BET, Math.min(MAX_BET, Math.round(v/10)*10));

function openGame(g){ G_.game = g; G_.msg = ""; G_.busy = false; G_.bj = null; G_.race = null; G_.roul = null; $("game").hidden = false; renderGame(); }
function closeGame(){ if (G_.busy) return; $("game").hidden = true; G_.game = null; }
function pay(n){ S.coins += n; save(); ui(); }
const ev = (k, v) => { try { const n = window.__app.event(k, v); if (n) setTimeout(() => toast(`Personnage secret débloqué : ${n} !`), 600); } catch(e){} };
function take(n){ if (S.coins < n) { G_.msg = `Il te manque ${n - S.coins} pièces pour cette mise.`; renderGame(); return false; } S.coins -= n; save(); ui(); return true; }

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
  const g = G_.game, body = $("game-body");
  if (g === "roulette") {
    $("game-title").textContent = "Roulette européenne";
    const r = G_.roul;
    body.innerHTML = `<p class="muted">Mise sur rouge ou noir. Si la bille tombe sur ta couleur, tu doubles ta mise. Le 0 vert fait perdre tout le monde.</p>
      <div class="roul-num ${r ? (r.n===0?"g":REDS.has(r.n)?"r":"b") : ""}">${r ? r.n : "?"}</div>
      <div class="pickrow"><button class="pick red" data-g="color" data-v="rouge" aria-pressed="${G_.color==="rouge"}" ${G_.busy?"disabled":""}>Rouge</button><button class="pick black" data-g="color" data-v="noir" aria-pressed="${G_.color==="noir"}" ${G_.busy?"disabled":""}>Noir</button></div>
      ${betBar(G_.busy)}
      <button class="go" data-g="roulette" ${G_.busy||!G_.color?"disabled":""}>${G_.color ? `Lancer la bille sur ${G_.color}` : "Choisis une couleur"}</button>
      <p class="gmsg" role="status">${G_.msg}</p>`;
  } else if (g === "blackjack") {
    $("game-title").textContent = "Blackjack";
    const bj = G_.bj, playing = bj && bj.phase === "play";
    const dealer = bj ? bj.dealer.map((c,i) => cardHTML(c, playing && i===1)).join("") : "";
    const player = bj ? bj.player.map(c => cardHTML(c)).join("") : "";
    body.innerHTML = `<p class="muted">Approche-toi de 21 sans dépasser. Le croupier tire jusqu'à 17. Un blackjack d'entrée paie 3 contre 2.</p>
      <div class="table-felt">
        <div class="hand"><span class="label">Croupier ${bj && !playing ? "· " + handVal(bj.dealer) : bj ? "· " + cardVal(bj.dealer[0]) + " + ?" : ""}</span><div class="cards">${dealer || '<span class="card back"></span><span class="card back"></span>'}</div></div>
        <div class="hand"><span class="label">Toi ${bj ? "· " + handVal(bj.player) : ""}</span><div class="cards">${player || '<span class="card ghost"></span><span class="card ghost"></span>'}</div></div>
      </div>
      ${playing ? `<div class="pickrow"><button class="pick" data-g="hit">Tirer</button><button class="pick" data-g="stand">Rester</button><button class="pick" data-g="double" ${bj.player.length!==2 || S.coins < bj.bet ? "disabled" : ""}>Doubler</button></div>`
        : `${betBar(false)}<button class="go" data-g="deal">Distribuer</button>`}
      <p class="gmsg" role="status">${G_.msg}</p>`;
  } else if (g === "courses") {
    $("game-title").textContent = "Courses de chevaux";
    const rc = G_.race;
    body.innerHTML = `<p class="muted">Choisis ton cheval. S'il gagne, tu touches ta mise multipliée par sa cote. Plus la cote est haute, plus il est outsider.</p>
      <div class="track">${HORSES.map((h,i) => `<div class="lane"><span class="hname">${h.n}</span><span class="horse" id="hz${i}" style="--c:${h.c};left:${rc ? rc.pos[i]*86 : 0}%">${horseSVG(h.c)}</span></div>`).join("")}<span class="finish"></span></div>
      <div class="horses">${HORSES.map((h,i) => `<button class="hpick" data-g="horse" data-v="${i}" aria-pressed="${G_.horse===i}" ${G_.busy?"disabled":""}><i style="background:${h.c}"></i>${h.n}<span>x${String(h.odds).replace(".",",")}</span></button>`).join("")}</div>
      ${betBar(G_.busy)}
      <button class="go" data-g="race" ${G_.busy||G_.horse===null?"disabled":""}>${G_.horse===null ? "Choisis un cheval" : `Départ ! Mise sur ${HORSES[G_.horse].n}`}</button>
      <p class="gmsg" role="status">${G_.msg}</p>`;
  }
}
function horseSVG(c){ return `<svg viewBox="0 0 48 36" width="44" height="33" aria-hidden="true"><g stroke="#1B1A33" stroke-width="1.6" stroke-linejoin="round">
  <path d="M8 20 C8 14 14 12 22 12 L30 12 L36 4 L42 6 L40 12 C44 14 44 18 40 18 L36 18 L34 22 C34 26 30 27 26 27 L14 27 C10 27 8 24 8 20Z" fill="#C8955A"/>
  <path d="M10 26 l-3 8 M16 27 l1 8 M28 27 l-2 8 M33 24 l4 8" stroke-width="2.4" fill="none"/>
  <path d="M8 18 C3 18 2 24 4 28" fill="none" stroke-width="2.4"/>
  <path d="M18 12 C18 6 26 6 26 12Z" fill="${c}"/><circle cx="22" cy="5.5" r="3.2" fill="${c}"/>
  <circle cx="39.5" cy="9" r="1" fill="#1B1A33"/></g></svg>`; }

function gameAction(a, d){
  const g = G_.game;
  if (a === "bet") { G_.bet = clampBet(G_.bet + (+d.d)); return renderGame(); }
  if (a === "betset") { G_.bet = clampBet(+d.v); return renderGame(); }
  if (a === "color") { G_.color = d.v; return renderGame(); }
  if (a === "horse") { G_.horse = +d.v; return renderGame(); }
  if (a === "roulette") {
    if (G_.busy || !take(G_.bet)) return; G_.busy = true; G_.msg = "Les jeux sont faits, rien ne va plus…"; cur.spinRoulette(true);
    const n = Math.floor(Math.random()*37), bet = G_.bet, color = G_.color; let k = 0;
    const iv = setInterval(() => { G_.roul = {n:Math.floor(Math.random()*37)}; renderGame(); if (++k > 22) { clearInterval(iv); G_.roul = {n}; G_.busy = false; cur.spinRoulette(false);
      const col = n === 0 ? "vert" : REDS.has(n) ? "rouge" : "noir", win = col === color;
      if (win) pay(bet*2); ev("rl", win); G_.msg = win ? `${n} ${col} : gagné ! +${bet*2} pièces` : `${n} ${col} : perdu.`; renderGame(); } }, 90);
    return;
  }
  if (a === "deal") {
    if (!take(G_.bet)) return;
    G_.bj = {player:[drawCard(), drawCard()], dealer:[drawCard(), drawCard()], phase:"play", bet:G_.bet}; G_.msg = "";
    if (handVal(G_.bj.player) === 21) return finishBJ(true);
    return renderGame();
  }
  const bj = G_.bj;
  if (a === "hit" && bj) { bj.player.push(drawCard()); if (handVal(bj.player) > 21) { bj.phase = "done"; ev("bj", false); G_.msg = `Tu dépasses 21 : perdu (${handVal(bj.player)}).`; } else if (handVal(bj.player) === 21) return finishBJ(); return renderGame(); }
  if (a === "stand" && bj) return finishBJ();
  if (a === "double" && bj) { if (!take(bj.bet)) return; bj.bet *= 2; bj.player.push(drawCard()); if (handVal(bj.player) > 21) { bj.phase = "done"; ev("bj", false); G_.msg = `Tu dépasses 21 : perdu (${handVal(bj.player)}).`; return renderGame(); } return finishBJ(); }
  if (a === "race") {
    if (G_.busy || !take(G_.bet)) return; G_.busy = true; G_.msg = "Et c'est parti !";
    const w = HORSES.map(h => 1/h.odds), sum = w.reduce((x,y) => x+y, 0); let r = Math.random()*sum, winner = 0; for (let i=0;i<w.length;i++){ r -= w[i]; if (r <= 0) { winner = i; break; } }
    const fin = HORSES.map((_,i) => i === winner ? 1 : 1.04 + Math.random()*.28), wob = HORSES.map(() => Math.random()*6), bet = G_.bet, pick = G_.horse, T = 4200, t0 = performance.now();
    G_.race = {pos:HORSES.map(() => 0)}; renderGame();
    const step = now => { const t = (now - t0)/T;
      HORSES.forEach((_,i) => { const p = Math.min(1, t/fin[i]); G_.race.pos[i] = Math.min(1, p + Math.sin(p*9 + wob[i])*.02*(1-p)); const el = document.getElementById("hz"+i); if (el) el.style.left = (G_.race.pos[i]*86) + "%"; });
      if (t < Math.max(...fin)*1.02) return requestAnimationFrame(step);
      G_.busy = false; const won = winner === pick, gain = Math.round(bet*HORSES[pick].odds);
      if (won) pay(gain); ev("race", won ? HORSES[pick].odds : 0); G_.msg = won ? `${HORSES[winner].n} gagne ! +${gain} pièces` : `${HORSES[winner].n} gagne la course. Ton cheval n'a pas gagné.`; renderGame(); };
    requestAnimationFrame(step);
  }
}
function finishBJ(natural){
  const bj = G_.bj; bj.phase = "done";
  const pv = handVal(bj.player);
  if (natural) { const dv = handVal(bj.dealer); if (dv === 21) { pay(bj.bet); G_.msg = "Blackjack des deux côtés : égalité, mise rendue."; } else { const g = Math.round(bj.bet*2.5); pay(g); ev("bj", true); G_.msg = `Blackjack ! +${g} pièces`; } return renderGame(); }
  while (handVal(bj.dealer) < 17) bj.dealer.push(drawCard());
  const dv = handVal(bj.dealer);
  if (dv > 21 || pv > dv) { pay(bj.bet*2); ev("bj", true); G_.msg = `${dv > 21 ? "Le croupier dépasse 21" : `${pv} contre ${dv}`} : gagné ! +${bj.bet*2} pièces`; }
  else if (pv === dv) { pay(bj.bet); G_.msg = `Égalité à ${pv} : mise rendue.`; }
  else { ev("bj", false); G_.msg = `${pv} contre ${dv} : le croupier gagne.`; }
  renderGame();
}
