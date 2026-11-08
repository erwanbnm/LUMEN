/* --- Lancement --- */
(function(){
  document.body.insertAdjacentHTML("afterbegin", GLOBAL_DEFS + BADGE_DEFS);
  const list = ["Voile","Plouf","Braise","Hulotte"].map(n => CREATURES.find(c => c.n === n)).filter(Boolean).concat([RIXY]);
  document.getElementById("crew").innerHTML = list.map((c,i) => `<div style="animation-delay:${.25+i*.12}s">${creatureSVG(c, i===2?84:66)}</div>`).join("");
  document.getElementById("logo").innerHTML = "Lumen".split("").map((ch,i) => `<span class="${i===1?"u":""}" style="animation-delay:${.55+i*.09}s">${ch}</span>`).join("");
  const bar = document.getElementById("loadbar");
  setTimeout(() => { bar.style.width = "45%"; }, 1500);
  setTimeout(() => { bar.style.width = "100%"; }, 2200);
  setTimeout(() => { const s = document.getElementById("splash"); s.classList.add("out"); setTimeout(() => s.remove(), 800); }, 2900);
})();
render();
