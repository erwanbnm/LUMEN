/* --- Lancement --- */
// Emblème de Lumen : un « L » doré et bombé sous un halo ambre (même dessin que web/icon.html)
const LUMEN_MARK = `<svg viewBox="0 0 120 120" aria-hidden="true"><defs>
  <radialGradient id="lmBg" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="#6A2E5E"/><stop offset="1" stop-color="#22102E"/></radialGradient>
  <radialGradient id="lmGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FF9A3D" stop-opacity=".6"/><stop offset="1" stop-color="#FF9A3D" stop-opacity="0"/></radialGradient>
  <linearGradient id="lmL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0A0"/><stop offset="1" stop-color="#F2A41E"/></linearGradient></defs>
  <rect width="120" height="120" fill="url(#lmBg)"/><circle cx="60" cy="58" r="50" fill="url(#lmGlow)"/>
  <path d="M40 24 Q40 18 46 18 L54 18 Q60 18 60 24 L60 78 L84 78 Q90 78 90 84 L90 92 Q90 98 84 98 L46 98 Q40 98 40 92Z" transform="translate(0 5)" fill="#A8650C" stroke="#2B1D3A" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M40 24 Q40 18 46 18 L54 18 Q60 18 60 24 L60 78 L84 78 Q90 78 90 84 L90 92 Q90 98 84 98 L46 98 Q40 98 40 92Z" fill="url(#lmL)" stroke="#2B1D3A" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M47 28 V70" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>
  <path d="M77 26 l2.6 5.2 5.8 .8 -4.2 4 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.2 -4 5.8 -.8Z" fill="#FFF3B0" stroke="#2B1D3A" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
(function(){
  document.body.insertAdjacentHTML("afterbegin", GLOBAL_DEFS + BADGE_DEFS);
  document.getElementById("emb").innerHTML = LUMEN_MARK;
  document.getElementById("logo").innerHTML = "Lumen".split("").map((ch,i) => `<span class="${i===1?"u":""}" style="animation-delay:${.55+i*.09}s">${ch}</span>`).join("");
  const bar = document.getElementById("loadbar");
  setTimeout(() => { bar.style.width = "45%"; }, 1500);
  setTimeout(() => { bar.style.width = "100%"; }, 2200);
  setTimeout(() => { const s = document.getElementById("splash"); s.classList.add("out"); setTimeout(() => s.remove(), 800); }, 2900);
})();
render();
