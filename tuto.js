/* ---------- Premier lancement : tutoriel en 3 écrans (choix d'Erwan, novembre 2026) ----------
   Montré une seule fois, juste après la création du profil d'un nouveau joueur (S.tuto). « Passer » le ferme aussi. */
const Tuto = (() => {
  const PAGES = [
    {ic:["daily", "play"], t:"Réponds, apprends, gagne", d:"Chaque bonne réponse te donne de l'XP et des pièces. Le <b>Défi du jour</b> t'attend chaque matin, et tes erreurs reviennent dans <b>Revoir mes erreurs</b> pour que tu les retiennes."},
    {ic:["tower", "adv"], t:"Deux grandes aventures", d:"<b>La Tour</b> : 100 étages, une question par étage, et une chute au dernier palier si tu te trompes. <b>L'Aventure</b> : 5 mondes à explorer, des monstres à battre et un boss au bout de chaque île."},
    {ic:["sword", "shop"], t:"Joue avec tes amis", d:"Crée ton compte dans <b>Multi</b> pour défier tes amis, jouer en salon et grimper dans les classements. Dépense ensuite tes pièces dans la <b>Boutique</b> : personnages, familiers, titres…"}
  ];
  let k = 0, el = null;
  function paint(){
    const P = PAGES[k], last = k === PAGES.length - 1;
    el.innerHTML = `<div class="tu-card"><button class="tu-skip" data-tu="skip">Passer</button>
      <div class="tu-art">${k === 0 ? `<span class="tu-me">${meSVG(96)}</span>` : ""}${P.ic.map(i => `<span class="tu-ic">${gIcon(i, k === 0 ? 64 : 84)}</span>`).join("")}</div>
      <span class="tu-k">${k + 1} / ${PAGES.length}</span><h2>${P.t}</h2><p>${P.d}</p>
      <div class="tu-dots">${PAGES.map((_, i) => `<i class="${i === k ? "on" : ""}"></i>`).join("")}</div>
      <button class="btn tu-next" data-tu="next">${last ? "C'est parti !" : "Suivant"}</button></div>`;
  }
  function close(){ if (!el) return; S.tuto = 1; save(); el.classList.add("out"); const e = el; el = null; setTimeout(() => e.remove(), 300); try { flushLevelUp(); } catch(x){} }
  function show(){
    if (el || S.tuto || window.__noTuto) return; k = 0;
    el = document.createElement("div"); el.className = "tu-veil"; document.body.appendChild(el); paint();
    el.addEventListener("click", e => { const b = e.target.closest("[data-tu]"); if (!b) return;
      try { Music.sfx("tap"); } catch(x){}
      if (b.dataset.tu === "skip" || k === PAGES.length - 1) return close();
      k++; paint(); });
  }
  return {show, open:() => !!el};
})();
