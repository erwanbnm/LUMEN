/* ---------- Personnages « jouets » : même recette que les icônes GI3 ----------
   Contour foncé épais, copie sombre décalée vers le bas (épaisseur de jouet), dégradés verticaux,
   reflets blancs nets. Animations en CSS (app.html, section « Personnages animés ») :
   tblink (clignement), tbreath (respiration), ta-* (animations propres à chaque personnage). */
const TD = "#2B1D3A";
let TU = 0;
const tGrad = (a, b) => { const id = "tg" + (TU++); return [id, `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`]; };
const tS = (w = 3) => `stroke="${TD}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
// Forme en volume : ombre décalée + dégradé + contour
function toy(d, a, b, dark, o = {}){
  const [id, def] = tGrad(a, b), dy = o.dy === undefined ? 4.5 : o.dy, w = o.w || 3;
  return `<defs>${def}</defs>${dy ? `<path d="${d}" transform="translate(0 ${dy})" fill="${dark}" ${tS(w)}/>` : ""}<path d="${d}" fill="url(#${id})" ${tS(w)}/>`;
}
// Lueur douce qui pulse (dégradé radial qui s'estompe vers l'extérieur)
const tGlow = (cx, cy, r, c, o = .7) => { const id = "tgl" + (TU++); return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset=".55" stop-color="${c}" stop-opacity="${o*.35}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})" class="ta-pulse"/>`; };
const tC = (cx, cy, r) => `M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`;
const tE = (cx, cy, rx, ry) => `M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;
const tShine = (d, w = 3.4, o = .8) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
const tLimb = (d, col, w = 9) => `<path d="${d}" fill="none" stroke="${TD}" stroke-width="${w}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w-4.5}" stroke-linecap="round"/>`;
// Yeux qui clignent
const tEye = (x, y, s = 1) => `<ellipse cx="${x}" cy="${y}" rx="${4.8*s}" ry="${6.2*s}" fill="${TD}"/><circle cx="${x+1.6*s}" cy="${y-2.4*s}" r="${1.9*s}" fill="#fff"/><circle cx="${x-1.4*s}" cy="${y+2.6*s}" r="${.9*s}" fill="#fff"/>`;
const tEyes = (x1, x2, y, s = 1) => `<g class="tblink">${tEye(x1, y, s)}${tEye(x2, y, s)}</g>`;
const tBlush = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="4.6" ry="2.6" fill="#FF6A8A" opacity=".55"/><ellipse cx="${x2}" cy="${y}" rx="4.6" ry="2.6" fill="#FF6A8A" opacity=".55"/>`;
function tMouth(x, y, k){
  if (k === "o") return `<ellipse cx="${x}" cy="${y+1}" rx="3" ry="3.6" fill="#7A2440" stroke="${TD}" stroke-width="2"/>`;
  if (k === "grr") return `<path d="M${x-5} ${y+3} Q${x} ${y-2} ${x+5} ${y+3}" fill="none" stroke="${TD}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (k === "cat") return `<path d="M${x-5.5} ${y} q2.75 3.6 5.5 0 q2.75 3.6 5.5 0" fill="none" stroke="${TD}" stroke-width="2.2" stroke-linecap="round"/>`;
  return `<path d="M${x-5.5} ${y} Q${x} ${y+6} ${x+5.5} ${y}" fill="#B8344E" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round"/><path d="M${x-2} ${y+1.1} h4 v2.2 h-4z" fill="#fff"/>`;
}
const tFeet = (x1, x2, y, a, b, dark, rx = 10) => toy(tE(x1, y, rx, 6.5), a, b, dark, {dy:2.5, w:2.6}) + toy(tE(x2, y, rx, 6.5), a, b, dark, {dy:2.5, w:2.6});
function tStar(x, y, r, c = "#FFD84A", cls = ""){
  let d = ""; for (let i = 0; i < 10; i++) { const a = Math.PI*i/5 - Math.PI/2, rr = i % 2 ? r*.45 : r; d += (i ? "L" : "M") + (x + rr*Math.cos(a)).toFixed(1) + " " + (y + rr*Math.sin(a)).toFixed(1); }
  return `<path d="${d}Z" fill="${c}" stroke="${TD}" stroke-width="1.6" stroke-linejoin="round"${cls ? ` class="${cls}"` : ""}/>`;
}

/* ---------- Les personnages de base, redessinés (mêmes noms, même ordre) ---------- */
const TOY_DRAW = {
Caillou(){
  return tFeet(42, 78, 100, "#C8C0B6", "#7E766E", "#544C46")
  + toy("M24 96 Q16 72 28 52 Q38 34 60 32 Q84 32 95 52 Q105 74 96 96 Q60 104 24 96Z", "#E6E0D8", "#8F867C", "#5E564E")
  + `<path d="M32 56 Q42 40 60 37 Q52 47 50 58 Q40 58 32 56Z" fill="#fff" opacity=".3"/><path d="M86 44 L78 58 L84 66" fill="none" stroke="${TD}" stroke-width="2" opacity=".4"/>`
  + toy("M28 54 Q30 38 48 36 Q58 38 54 46 Q46 46 40 52 Q34 58 28 54Z", "#B4EA84", "#4E9A3A", "#2E6A26", {dy:2, w:2.6})
  + `<g class="ta-sway" style="transform-origin:52px 38px">${tLimb("M52 38 Q52 28 56 22", "#5EAA44", 7)}${toy("M56 22 Q64 11 75 15 Q69 26 56 22Z", "#C4F59A", "#5EAA44", "#2E6A26", {dy:2, w:2.4})}${toy("M55 23 Q46 13 37 17 Q43 27 55 23Z", "#C4F59A", "#5EAA44", "#2E6A26", {dy:2, w:2.4})}</g>`
  + tShine("M30 74 Q30 64 35 58") + tEyes(50, 72, 70) + tBlush(41, 81, 80) + tMouth(61, 80);
},
Plouf(){
  return toy("M60 14 Q76 40 88 58 Q102 82 86 96 Q60 108 34 96 Q18 82 32 58 Q44 40 60 14Z", "#C8EEFF", "#2F86E0", "#1D56A8")
  + `<circle cx="44" cy="90" r="3" fill="#fff" opacity=".45"/><circle cx="79" cy="86" r="2.2" fill="#fff" opacity=".45"/><circle cx="70" cy="96" r="1.6" fill="#fff" opacity=".45"/>`
  + tShine("M43 54 Q50 38 58 28", 4) + `<circle cx="38" cy="68" r="2.4" fill="#fff" opacity=".85"/>`
  + tEyes(50, 70, 70) + tBlush(41, 79, 80) + tMouth(60, 80, "o");
},
Braise(){
  return tGlow(60, 66, 54, "#FFA040", .6)
  + toy("M28 96 Q12 80 20 62 Q24 70 32 70 Q28 52 40 40 Q48 30 52 14 Q62 26 66 36 Q72 30 72 22 Q90 38 96 56 Q102 78 90 96 Q60 106 28 96Z", "#FFD06A", "#F0462A", "#A8240E")
  + `<g class="ta-flick" style="transform-origin:60px 98px"><path d="M40 96 Q32 82 40 70 Q44 76 50 74 Q50 60 60 52 Q64 64 70 66 Q74 60 74 56 Q84 70 82 86 Q78 96 72 98Z" fill="#FFE27A" opacity=".95"/></g>`
  + tShine("M29 74 Q31 62 39 53", 3.2, .75) + tEyes(50, 70, 77) + tBlush(42, 78, 87) + tMouth(60, 87)
  + `<circle cx="84" cy="24" r="2.6" fill="#FFB43A" class="ta-ember"/><circle cx="34" cy="32" r="2" fill="#FFD06A" class="ta-ember" style="animation-delay:-1.1s"/><circle cx="92" cy="40" r="1.6" fill="#FFE27A" class="ta-ember" style="animation-delay:-.5s"/>`;
},
Nimbus(){
  const drops = [34, 50, 66, 82].map((x, i) => `<path class="ta-rain" style="animation-delay:${(-i*.29).toFixed(2)}s" d="M${x} 84 q-3.4 5.4 0 7.6 q3.4 -2.2 0 -7.6z" fill="#7FC8FF" stroke="${TD}" stroke-width="1.6"/>`).join("");
  return drops + toy("M26 76 Q12 76 12 62 Q12 48 28 47 Q30 30 48 30 Q58 18 74 26 Q92 22 96 42 Q110 44 108 60 Q108 76 94 76Z", "#FFFFFF", "#C2CCEC", "#8592C4")
  + tShine("M22 60 Q24 51 32 50") + tShine("M52 36 Q58 30 66 30", 3, .7)
  + `<path d="M43 57 l9 4 M77 57 l-9 4" stroke="${TD}" stroke-width="2.8" stroke-linecap="round"/>` + tEyes(50, 70, 66, .9) + tBlush(40, 80, 74) + tMouth(60, 73, "grr");
},
Luciole(){
  return tGlow(62, 80, 38, "#FFE680", .75)
  + `<g class="ta-flap" style="transform-origin:60px 52px"><path d="M58 48 Q30 16 21 38 Q20 56 56 56Z" fill="#EAF6FF" fill-opacity=".75" ${tS(2.4)}/><path d="M62 48 Q90 16 99 38 Q100 56 64 56Z" fill="#EAF6FF" fill-opacity=".75" ${tS(2.4)}/></g>`
  + toy(tE(62, 80, 20, 18), "#FFF7B0", "#F2B81E", "#B87A0E") + `<path d="M46 74 Q62 80 78 74 M46 85 Q62 91 78 85" fill="none" stroke="#D8961A" stroke-width="2.4" opacity=".7"/>`
  + tLimb("M48 34 Q42 21 34 18", "#4A4AB0", 6) + tLimb("M72 34 Q78 21 86 18", "#4A4AB0", 6)
  + toy(tC(34, 17, 4.4), "#FFF7B0", "#F2B81E", "#B87A0E", {dy:1.5, w:2}) + toy(tC(86, 17, 4.4), "#FFF7B0", "#F2B81E", "#B87A0E", {dy:1.5, w:2})
  + toy(tE(60, 48, 22, 20), "#9A9AF6", "#4444B8", "#2A2A86") + tShine("M43 43 Q45 35 53 31") + tEyes(51, 69, 49, .85) + tBlush(43, 77, 57) + tMouth(60, 57);
},
Piquant(){
  let sp = "";
  for (let i = 0; i < 14; i++) { const a = i/14*6.283 - 1.57, p = (r, da) => (60 + Math.cos(a+da)*r).toFixed(1) + " " + (64 + Math.sin(a+da)*r).toFixed(1);
    sp += `<path d="M${p(28,-.2)} L${p(45,0)} L${p(28,.2)}Z" fill="${i % 2 ? "#FFB8E4" : "#E870C4"}" ${tS(2.4)}/>`; }
  return `<g class="ta-spike" style="transform-origin:60px 64px">${sp}</g>` + toy(tC(60, 64, 31), "#DCBAFF", "#7A3AD8", "#4E1F9A")
  + tShine("M37 55 Q41 42 52 37") + tEyes(50, 70, 64) + tBlush(41, 79, 74) + tMouth(60, 74);
},
Poulpi(){
  const legs = [[34,"M38 78 Q26 88 30 100 Q35 105 39 98 Q37 90 47 84"], [48,"M50 82 Q44 96 49 104 Q55 106 55 100 Q53 92 57 86"], [64,"M64 86 Q66 96 63 102 Q66 107 72 103 Q76 94 72 84"], [80,"M80 80 Q94 86 92 98 Q88 104 84 98 Q86 90 75 84"]];
  return legs.map(([x, d], i) => `<g class="ta-sway" style="transform-origin:${x}px 82px;animation-duration:2.2s;animation-delay:${(-i*.45).toFixed(2)}s">${toy(d, "#FFA4CE", "#D8468A", "#9A2A62", {dy:2, w:2.6})}</g>`).join("")
  + toy("M22 74 Q18 34 60 28 Q102 34 98 74 Q94 88 60 88 Q26 88 22 74Z", "#FFBCDC", "#E0509A", "#A02A66")
  + [[36,46,4],[84,50,3.4],[76,38,2.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFE0EF" opacity=".85"/>`).join("")
  + tShine("M31 58 Q35 43 47 36") + tEyes(50, 70, 62) + tBlush(41, 79, 72) + tMouth(60, 72, "o");
},
Hulotte(){
  const wing = (d, ox) => `<g class="ta-wing" style="transform-origin:${ox}px 60px">${toy(d, "#B8844C", "#6E4420", "#4A2C12", {dy:2})}</g>`;
  return tFeet(48, 72, 102, "#FFC24A", "#E0841A", "#A85A0A", 7)
  + wing("M30 56 Q12 70 21 93 Q33 88 37 72Z", 32) + wing("M90 56 Q108 70 99 93 Q87 88 83 72Z", 88)
  + toy("M26 96 Q18 60 34 40 L30 21 Q42 27 48 32 Q60 28 72 32 Q78 27 90 21 L86 40 Q102 60 94 96 Q60 106 26 96Z", "#DFAE74", "#8A5A2E", "#5A3818")
  + toy(tE(60, 86, 20, 13), "#FFF3DC", "#E8CFA0", "#B89A6A", {dy:0, w:2.4})
  + `<path d="M48 82 l4 4 4 -4 M64 82 l4 4 4 -4 M56 89 l4 4 4 -4" fill="none" stroke="#B8905A" stroke-width="2" stroke-linecap="round"/>`
  + toy(tE(47, 56, 14, 13), "#FFF6E4", "#F0D8B0", "#B89A6A", {dy:0, w:2.6}) + toy(tE(73, 56, 14, 13), "#FFF6E4", "#F0D8B0", "#B89A6A", {dy:0, w:2.6})
  + tEyes(47, 73, 56, 1.25) + toy("M55.5 66 L64.5 66 L60 75Z", "#FFC24A", "#E0841A", "#A85A0A", {dy:1.5, w:2.2}) + tShine("M31 72 Q31 55 37 46");
},
Mousseline(){
  return tFeet(30, 82, 100, "#A8E07A", "#5EAA44", "#2E6A26", 8)
  + toy("M14 92 Q14 44 56 40 Q94 44 96 86 Q96 97 56 97 Q14 99 14 92Z", "#A4DE76", "#3E8A3A", "#24602A")
  + `<path d="M40 50 L32 66 L42 82 L60 82 L70 66 L60 50Z M70 66 L86 64 M32 66 L18 68 M60 50 L64 42 M42 82 L38 94 M60 82 L64 96" fill="none" stroke="#2E6A26" stroke-width="2.2" opacity=".55" stroke-linejoin="round"/>`
  + tShine("M22 76 Q24 58 36 50")
  + `<g class="ta-sway" style="transform-origin:54px 42px">${tLimb("M54 42 Q53 32 56 26", "#3E8A3A", 6)}${[0,72,144,216,288].map(a => `<ellipse cx="56" cy="16" rx="4.4" ry="6.4" transform="rotate(${a} 56 22)" fill="#FFB4D8" ${tS(2)}/>`).join("")}${toy(tC(56, 22, 3.8), "#FFF3A0", "#F2B81E", "#B87A0E", {dy:0, w:2})}</g>`
  + toy(tC(96, 72, 15), "#B8EC8A", "#5EAA44", "#2E6A26") + tShine("M86 66 Q88 60 93 58", 2.8)
  + tEyes(91, 103, 70, .7) + tBlush(86, 108, 78) + `<path d="M94 79 q3 2.6 6 0" fill="none" stroke="${TD}" stroke-width="2.2" stroke-linecap="round"/>`;
},
Morille(){
  const spores = [[34,30,0],[86,26,-1],[62,12,-2]].map(([x, y, d]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#FFE0D6" stroke="${TD}" stroke-width="1.2" class="ta-spore" style="animation-delay:${d}s"/>`).join("");
  return spores + tFeet(46, 74, 101, "#FFF0DC", "#D8B48A", "#A8845A", 8)
  + toy("M36 96 Q32 70 40 56 L80 56 Q88 70 84 96 Q60 104 36 96Z", "#FFF8EC", "#E8C9A0", "#B8956A")
  + toy("M12 60 Q12 22 60 18 Q108 22 108 60 Q98 67 60 65 Q22 67 12 60Z", "#FF907A", "#D8343A", "#982030")
  + [[34,36,6],[60,27,7],[86,38,6],[48,52,4],[74,51,4.4]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.8}" fill="#FFF6EC" stroke="${TD}" stroke-width="2"/>`).join("")
  + tShine("M24 48 Q28 32 42 25") + tEyes(51, 69, 76, .85) + tBlush(43, 77, 85) + tMouth(60, 85);
},
Quartz(){
  return tFeet(44, 76, 101, "#C8B4FF", "#7A5AD8", "#4A2E9A", 9)
  + toy("M28 60 L14 36 L22 74Z", "#EAD8FF", "#9A6AE8", "#5A3AA8", {dy:3, w:2.6}) + toy("M92 60 L106 34 L98 74Z", "#EAD8FF", "#9A6AE8", "#5A3AA8", {dy:3, w:2.6})
  + toy("M38 98 L30 58 L46 28 L60 16 L74 28 L90 58 L82 98Z", "#E6F6FF", "#5E9EE8", "#3A62B0")
  + `<path d="M60 16 L60 98 L38 98 L30 58 L46 28Z" fill="#fff" opacity=".2"/><path d="M46 28 L54 58 L60 16 M74 28 L66 58 L60 16 M30 58 L54 58 L66 58 L90 58" fill="none" stroke="${TD}" stroke-width="1.6" opacity=".35"/>`
  + tShine("M40 62 L48 34") + tEyes(50, 70, 70) + tBlush(41, 79, 80) + tMouth(60, 80, "cat")
  + tStar(22, 22, 5, "#FFFFFF", "ta-twinkle") + `<g style="animation-delay:-.6s">${tStar(100, 18, 4, "#FFF3A0", "ta-twinkle")}</g>` + tStar(104, 86, 3.6, "#E6F6FF", "ta-twinkle");
},
Ocelle(){
  const eye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" ${tS(2.4)}/>`;
  const pup = (x, y, r) => `<circle cx="${x}" cy="${y+r*.1}" r="${r*.55}" fill="${TD}"/><circle cx="${x+r*.2}" cy="${y-r*.2}" r="${r*.2}" fill="#fff"/>`;
  const E5 = [[60,56,10],[38,46,6],[82,46,6],[40,74,5],[80,74,5]];
  return tFeet(46, 74, 101, "#5ED0C0", "#1E8A90", "#125A60", 9)
  + toy(tC(60, 64, 35), "#8AF0DE", "#2E9AA0", "#1E6670")
  + [[28,62,3],[92,60,2.6],[60,92,3.2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#C8FFF4" opacity=".7"/>`).join("")
  + tShine("M36 48 Q40 38 50 33")
  + `<g class="tblink">${E5.map(([x, y, r]) => eye(x, y, r)).join("")}<g class="ta-look">${E5.map(([x, y, r]) => pup(x, y, r)).join("")}</g></g>`
  + tBlush(30, 90, 84) + tMouth(60, 84, "o");
},
Voile(){
  return toy("M60 16 Q93 18 98 56 Q102 80 98 100 Q90 94 84 102 Q76 94 68 102 Q60 94 52 102 Q44 94 36 102 Q30 94 22 100 Q18 80 22 56 Q27 18 60 16Z", "#8A86F4", "#3A2E9A", "#241A6A")
  + `<ellipse cx="60" cy="56" rx="25" ry="22" fill="none" stroke="#B8B4FF" stroke-width="5"/>`
  + `<ellipse cx="60" cy="56" rx="22" ry="19" fill="#140C2E" ${tS(2.6)}/>`
  + `<ellipse cx="60" cy="58" rx="20" ry="16" fill="#7FF0E0" opacity=".12" class="ta-pulse"/>`
  + `<g class="tblink"><ellipse cx="51" cy="56" rx="4" ry="5.6" fill="#8AF8E8"/><ellipse cx="69" cy="56" rx="4" ry="5.6" fill="#8AF8E8"/><circle cx="52" cy="54" r="1.4" fill="#fff"/><circle cx="70" cy="54" r="1.4" fill="#fff"/></g>`
  + tShine("M29 70 Q29 46 42 32") + tLimb("M28 78 Q20 84 22 92", "#5A50C8", 9) + tLimb("M92 78 Q100 84 98 92", "#5A50C8", 9);
},
Dino(){
  return `<g class="ta-wag" style="transform-origin:34px 90px">${toy("M38 94 Q14 100 6 84 Q20 88 36 80Z", "#9AE07A", "#3EA04A", "#24702E", {dy:3})}</g>`
  + [[66,20],[80,26],[90,38],[94,52]].map(([x, y]) => toy(`M${x-6} ${y+4} L${x} ${y-6} L${x+6} ${y+4}Z`, "#FFE27A", "#F0A61C", "#A8650C", {dy:2, w:2.4})).join("")
  + tFeet(42, 78, 101, "#8AD86A", "#3EA04A", "#24702E", 10)
  + toy("M30 100 Q24 74 36 58 Q38 34 56 24 Q78 18 88 36 Q94 50 86 62 Q96 78 90 100 Q60 108 30 100Z", "#A4E884", "#3EA04A", "#24702E")
  + toy(tE(62, 84, 18, 13), "#FFF8DC", "#F0DCA0", "#B89A5A", {dy:0, w:2.4}) + `<path d="M48 82 h28 M50 89 h24" stroke="#D8C08A" stroke-width="2" stroke-linecap="round"/>`
  + tLimb("M44 68 Q38 74 40 80", "#5EB84A", 8) + tLimb("M82 68 Q88 74 86 80", "#5EB84A", 8)
  + tShine("M36 72 Q36 56 44 46") + tEyes(56, 76, 44, .9) + tBlush(48, 84, 53) + tMouth(66, 53) + `<circle cx="80" cy="34" r="1.3" fill="${TD}"/><circle cx="85" cy="35" r="1.3" fill="${TD}"/>`;
},
Rixy(){
  const fawn = ["#F6BE80", "#C07A3A", "#7A4A1E"];
  return `<g class="ta-wag" style="transform-origin:86px 94px">${tLimb("M86 94 Q100 90 99 76", "#D9944E", 9)}</g>`
  + toy("M34 100 Q30 78 40 66 Q60 58 80 66 Q90 78 86 100 Q60 106 34 100Z", ...fawn)
  + `<path d="M52 66 Q50 84 54 102 H66 Q70 84 68 66 Q60 70 52 66Z" fill="#FFF6EC" opacity=".95"/>`
  + toy("M44 80 Q44 74 50 74 Q56 74 56 80 L56 99 L44 99Z", ...fawn, {dy:2, w:2.6}) + toy("M64 80 Q64 74 70 74 Q76 74 76 80 L76 99 L64 99Z", ...fawn, {dy:2, w:2.6})
  + toy(tE(50, 100, 8, 5), "#FFFFFF", "#E8DCCE", "#A8988A", {dy:1.5, w:2.4}) + toy(tE(70, 100, 8, 5), "#FFFFFF", "#E8DCCE", "#A8988A", {dy:1.5, w:2.4})
  + toy("M40 63 Q60 71 80 63 L80 69 Q60 77 40 69Z", "#FF6A7A", "#D8243A", "#8A1020", {dy:1.5, w:2.4})
  + toy("M60 70 c-3 -3 -7 0 -4 4 l4 4 l4 -4 c3 -4 -1 -7 -4 -4z", "#FFE98A", "#F0A61C", "#A8650C", {dy:1, w:1.8})
  + `<g class="ta-ear" style="transform-origin:36px 26px">${toy("M36 24 Q22 18 16 32 Q17 45 28 45 Q30 33 38 30Z", "#A86A30", "#6A3E18", "#3E2410", {dy:2})}</g>`
  + `<g class="ta-ear" style="transform-origin:84px 26px;animation-delay:-.3s">${toy("M84 24 Q98 18 104 32 Q103 45 92 45 Q90 33 82 30Z", "#A86A30", "#6A3E18", "#3E2410", {dy:2})}</g>`
  + toy("M60 14 Q86 14 94 36 Q98 56 84 64 Q60 72 36 64 Q22 56 26 36 Q34 14 60 14Z", ...fawn)
  + `<path d="M57 14 Q56 26 55 38 H65 Q64 26 63 14Z" fill="#FFF6EC"/>`
  + toy(tE(60, 51, 17, 11.5), "#6A4A36", "#2A1A14", "#120A08", {dy:0, w:2.4})
  + `<ellipse cx="60" cy="45" rx="6.4" ry="4.4" fill="#120A08"/><ellipse cx="58" cy="43.6" rx="2" ry="1.2" fill="#fff" opacity=".75"/>`
  + `<path d="M53 54 q7 5 14 0" fill="none" stroke="#FFF6EC" stroke-width="2" stroke-linecap="round"/><path d="M58 57 q2 5 4 0z" fill="#FF8AA0" stroke="${TD}" stroke-width="1.2"/>`
  + tShine("M32 40 Q34 28 44 22") + tEyes(46, 74, 34, .82) + tBlush(36, 84, 44);
}
};

/* ---------- Somni : nouveau personnage, il s'endort (zzz) ---------- */
const SOMNI = { n:"Somni", e:"Sommeil", tag:"veilleur en pyjama", toy:true, anim:"sleep", draw(){
  const body = "M22 104 C16 74 24 42 60 38 C96 42 104 74 98 104 Q96 113 85 113 H35 Q24 113 22 104Z";
  const face = `<ellipse cx="60" cy="70" rx="29.5" ry="24.5" fill="none" stroke="${TD}" stroke-width="10"/><ellipse cx="60" cy="70" rx="29.5" ry="24.5" fill="none" stroke="#C7CEFF" stroke-width="5.5"/>`
    + toy(tE(60, 70, 26, 21), "#FFEDE2", "#F6B39C", "#000", {dy:0}) + `<path d="M35 66 Q37 51 60 49 Q83 51 85 66 Q74 57 60 57 Q46 57 35 66Z" fill="#E59C86" opacity=".45"/>`;
  const open = `<g class="so-open"><g class="tblink">${tEye(49, 69, 1)}${tEye(71, 69, 1)}</g>${tMouth(60, 78.5)}</g>`;
  const shut = `<g class="so-closed"><path d="M44 70 Q49 74 54 70 M66 70 Q71 74 76 70" fill="none" stroke="${TD}" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="60" cy="81" rx="2.4" ry="2" fill="#B8344E" stroke="${TD}" stroke-width="1.8"/></g>`;
  const zzz = `<g class="so-zzz">${[[12,48,24,0],[22,30,20,-.8],[34,14,16,-1.6]].map(([x, y, s, d]) => `<text x="${x}" y="${y}" font-size="${s}" fill="#E8ECFF" stroke="${TD}" stroke-width="2.2" paint-order="stroke" class="so-z" style="animation-delay:${d}s">z</text>`).join("")}</g>`;
  return `<g transform="translate(6 -3) scale(.85)">
  ${tGlow(108, 54, 30, "#FFD06A", .7)}
  <g transform="translate(0 7)">${tFeet(42, 78, 108, "#7C88F2", "#3B42B8", "#2A2F8A", 11)}</g>
  ${tLimb("M24 84 Q12 88 13 100", "#6E78EC", 10)}
  ${toy(body, "#9AA8FF", "#4A52D6", "#262A86", {dy:5})}
  <path d="M36 92 Q60 104 84 92 Q86 106 60 108 Q34 106 36 92Z" fill="#fff" opacity=".18"/>
  ${tStar(34, 96, 4.4)}${tStar(86, 98, 3.6)}${tStar(54, 104, 3)}${tStar(92, 70, 3.4)}${tStar(28, 66, 3)}
  ${tShine("M28 82 Q28 64 37 54", 3.6)}
  <g class="so-head">${face}${open}${shut}${tBlush(41, 79, 79)}
  ${toy("M38 50 Q42 20 70 13 Q96 8 108 28 Q100 25 92 28 Q86 30 84 38 Q82 46 82 50Z", "#B4BEFF", "#5A63E0", "#3036A8", {dy:4})}
  <path d="M58 21 L64 44 M76 14 L78 40 M92 16 L88 30" stroke="#E8ECFF" stroke-width="4" stroke-linecap="round" opacity=".55"/>
  ${tStar(66, 30, 3.4)}${tShine("M47 40 Q51 26 63 20", 3.6)}
  ${toy("M36 53 Q60 36 84 53 L83 60 Q60 45 37 60Z", "#FFFBF0", "#F3DDB0", "#C9A76A", {dy:3, w:2.8})}
  ${toy(tC(109, 30, 8), "#FFFBF0", "#F3DDB0", "#C9A76A", {dy:3, w:2.8})}</g>
  ${tLimb("M96 86 Q104 84 106 76", "#6E78EC", 10)}
  ${toy("M96 82 Q108 78 120 82 Q120 88 108 88 Q96 88 96 82Z", "#FFE98A", "#F0A61C", "#B8740E", {dy:3, w:2.6})}
  ${toy("M103 64 Q103 61 108 61 Q113 61 113 64 L113 81 Q108 83 103 81Z", "#FFFBF0", "#F3DDB0", "#C9A76A", {dy:2, w:2.6})}
  <path d="M108 61 V57" stroke="${TD}" stroke-width="2"/>
  <g class="ta-flick" style="transform-box:fill-box;transform-origin:50% 100%"><path d="M108 40 Q117 50 113 56 Q110 60 106 59 Q100 56 103 49 Q105 45 108 40Z" fill="#FF8A2A" ${tS(2.4)}/><path d="M108 47 Q112 52 110.5 55.5 Q108.5 57 106.6 55.8 Q105 53.5 106.5 51Z" fill="#FFE27A"/></g>
  ${tShine("M105.5 66 V75", 2.2, .85)}${zzz}</g>`;
} };

// Applique les nouveaux dessins aux personnages existants (noms et ordre inchangés : les sauvegardes restent valides)
const TOY_ANIM = { Plouf:"jelly", Nimbus:"rain", Braise:"fire", Somni:"sleep" };
CREATURES.concat([RIXY]).forEach(c => { if (TOY_DRAW[c.n]) { c.draw = TOY_DRAW[c.n]; c.toy = true; c.anim = TOY_ANIM[c.n] || ""; delete c.hat; } });
