/* ---------- Familiers (novembre 2026) : purement décoratifs ----------
   Dessins dans atelier/toy_pets.js (PETS). Onglet « Familiers » de la boutique : achat en pièces (comme les skins),
   collection, équiper / ranger. Un seul familier équipé. Les familiers d'événement (how:"event") ne s'achètent pas :
   ils se gagnent avec les défis de l'événement de la semaine (serveur, voir evenements.js).
   État : S.pets = {own:{id:date}, eq:id}. Aucun effet sur le jeu (ni XP, ni pièces, ni combat). */
const Familiers = (() => {
  const RAR = {epic:{n:"Épique", c:"#9A4AD8"}, leg:{n:"Légendaire", c:"#E8960A"}, myth:{n:"Mythique", c:"#E2283A"}};
  const st = () => { S.pets = S.pets || {own:{}, eq:""}; S.pets.own = S.pets.own || {}; return S.pets; };
  const own = id => !!st().own[id];
  const eq = () => { const e = st().eq; return e && own(e) ? petOf(e) : null; };
  let filter = "all";
  function give(id){ if (own(id) || !petOf(id)) return false; st().own[id] = today(); save(); return true; }
  // Petit familier à côté du personnage (accueil, profil, Boss…) ; cls : "win" pour la petite danse de victoire
  function beside(z, cls){ const p = eq(); if (!p) return ""; return `<span class="pet-by ${cls || ""}" aria-hidden="true">${creatureSVG(p, z)}</span>`; }
  const howTxt = p => { if (p.how === "shop") return `${p.p.toLocaleString("fr-FR")} pièces`;
    const g = typeof Evenements !== "undefined" ? Evenements.petGoal(p.id) : null; return g ? `Défi : ${g.t.toLowerCase()}` : "Défi d'événement"; };
  function card(p){
    const o = own(p.id), on = st().eq === p.id, g = !o && p.how === "event" && typeof Evenements !== "undefined" ? Evenements.petGoal(p.id) : null;
    let foot;
    if (on) foot = `<button class="btn small ghost" data-pet="off">Ranger</button>`;
    else if (o) foot = `<button class="btn small" data-pet="eq" data-v="${p.id}">Équiper</button>`;
    else if (p.how === "shop") foot = `<button class="btn small" data-pet="buy" data-v="${p.id}" ${S.coins >= p.p ? "" : "disabled"}>${coinIco}${p.p.toLocaleString("fr-FR")}</button>`;
    else foot = g && g.live ? `<button class="btn small ghost" data-ev="open" data-v="ch">Voir le défi</button>` : `<span class="chip">Événement terminé</span>`;
    return `<div class="bq-card pet-card r-${p.r} ${o ? "own" : "no"}" style="--rc:${RAR[p.r].c}">${on ? `<i class="bq-today">Équipé</i>` : ""}
      <div class="bq-art pet-art">${creatureSVG(p, 92)}</div><span class="bq-r" style="--rc:${RAR[p.r].c}">${RAR[p.r].n}</span><b class="bq-n">${esc(p.n)}</b>
      <span class="bq-how">${p.how === "shop" ? "Boutique" : "Événement de la semaine"}</span>${o ? "" : `<span class="bq-cond">${esc(howTxt(p))}</span>`}
      ${g ? `<span class="meter bq-meter"><i style="width:${Math.min(100, Math.round(g.v / g.n * 100))}%"></i></span><span class="bq-pv">${g.v.toLocaleString("fr-FR")} / ${g.n.toLocaleString("fr-FR")}</span>` : ""}
      ${foot}</div>`;
  }
  function view(){
    const n = PETS.filter(p => own(p.id)).length, list = PETS.filter(p => filter === "all" || (filter === "own") === own(p.id));
    const e = eq();
    return `<div class="pet-top"><div class="pet-stage">${meSVG(86)}${e ? `<span class="pet-by big">${creatureSVG(e, 64)}</span>` : ""}</div>
        <div class="stack" style="gap:3px;min-width:0"><b class="bq-title">Familiers</b><span class="muted" style="font-size:13px">Ils t'accompagnent partout, juste pour le style : aucun bonus.</span><span class="chip">${n} / ${PETS.length} dans ta collection</span></div></div>
      <div class="bq-filters">${[["all", "Tous"], ["own", "Possédés"], ["no", "Manquants"]].map(([v, l]) => `<button class="chip-btn ${filter === v ? "on" : ""}" data-pet="f" data-v="${v}">${l}</button>`).join("")}</div>
      <div class="bq-grid">${list.map(card).join("") || `<p class="muted">Aucun familier ici.</p>`}</div>`;
  }
  function click(b){
    const a = b.dataset.pet, v = b.dataset.v, p = petOf(v);
    if (a === "f") filter = v;
    else if (a === "buy" && p && p.how === "shop" && !own(v) && S.coins >= p.p) { S.coins -= p.p; spend(p.p); give(v); st().eq = v; toasts.push(`<b>${esc(p.n)}</b> · rejoint ta collection et t'accompagne.`); save(); try { Amis.api.ping(); } catch(e){} }
    else if (a === "eq" && own(v)) { st().eq = v; save(); toasts.push(`<b>${esc(p.n)}</b> · t'accompagne.`); try { Amis.api.ping(); } catch(e){} }
    else if (a === "off") { st().eq = ""; save(); }
    render();
  }
  return {view, click, beside, give, own, eq};
})();
