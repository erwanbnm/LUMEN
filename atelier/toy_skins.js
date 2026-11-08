/* ---------- Skins de la boutique et skins secrets, style « jouet » (voir atelier/toy.js) ----------
   Mêmes identifiants, prix et conditions de déblocage : seuls le dessin et les animations changent. */
const tArm = (x, y, dx, dy, a, b, dark) => tLimb(`M${x} ${y} q${(dx*.55).toFixed(1)} ${(dy*.1).toFixed(1)} ${dx} ${dy}`, b, 9) + toy(tC(x+dx, y+dy, 4.6), a, b, dark, {dy:1.5, w:2.4});
const tArms = (xl, xr, y, dyl, dyr, a, b, dark) => tArm(xl, y, -12, dyl, a, b, dark) + tArm(xr, y, 12, dyr, a, b, dark);

const TOY_SKINS = {
cor(){ // Cœurio : un cœur qui bat
  const P = ["#FF9AAE", "#E8344E", "#9A1830"];
  return tFeet(48, 72, 102, ...P, 8) + tArms(26, 94, 62, -14, 6, ...P)
  + toy("M60 100 C30 80 16 62 20 46 C24 30 44 26 54 36 L60 42 L66 36 C76 26 96 30 100 46 C104 62 90 80 60 100Z", ...P)
  + tShine("M28 50 Q30 38 42 35") + `<path d="M72 78 l10 -6 M76 82 l6 4" stroke="#FFD0DA" stroke-width="3" stroke-linecap="round" opacity=".7"/>`
  + tEyes(49, 71, 58) + tBlush(40, 80, 68) + tMouth(60, 68);
},
geo(){ // Globi : un globe dont les continents défilent
  const id = "tgc" + (TU++), land = "M10 50 Q20 40 30 46 Q36 56 28 62 Q22 70 14 66 Z M42 30 Q56 26 62 36 Q56 44 48 42 Z M52 76 Q64 70 72 78 Q68 88 58 86 Z";
  return tFeet(46, 74, 101, "#7FC8FF", "#2E86E0", "#1D56A8", 9) + tArms(30, 90, 70, -12, 8, "#7FC8FF", "#2E86E0", "#1D56A8")
  + toy(tC(60, 64, 32), "#9ADCFF", "#2E86E0", "#1D56A8")
  + `<defs><clipPath id="${id}"><path d="${tC(60, 64, 30)}"/></clipPath></defs><g clip-path="url(#${id})"><g class="ta-globe">${[0, 80].map(dx => `<path d="${land}" transform="translate(${20+dx} 8)" fill="#6CD87A" stroke="#2E7A3A" stroke-width="2"/>`).join("")}</g></g>`
  + tShine("M38 52 Q42 40 52 35") + tEyes(50, 70, 62) + tBlush(41, 79, 72) + tMouth(60, 73, "cat");
},
esp(){ // Jupi : une planète à anneau
  const ring = (front) => `<path d="M8 72 Q60 ${front ? 98 : 52} 112 72" fill="none" stroke="${TD}" stroke-width="9" stroke-linecap="round"/><path d="M8 72 Q60 ${front ? 98 : 52} 112 72" fill="none" stroke="#F4E2BC" stroke-width="5" stroke-linecap="round"/>`;
  return ring(false) + tArms(32, 88, 66, -12, -4, "#FFD4A0", "#E8955A", "#9A5A2A")
  + toy(tC(60, 64, 30), "#FFD8A8", "#E8955A", "#9A5A2A")
  + `<path d="M31 56 H89 M30 72 H90" stroke="#D8763A" stroke-width="5" opacity=".55"/><ellipse cx="74" cy="80" rx="6" ry="3.6" fill="#C8503A" opacity=".85"/>`
  + ring(true) + tShine("M38 50 Q42 40 52 36") + tEyes(50, 70, 60, .9) + tBlush(41, 79, 69) + tMouth(60, 69, "o")
  + tStar(16, 26, 4, "#FFF3A0", "ta-twinkle") + tStar(102, 22, 3.4, "#FFFFFF", "ta-twinkle");
},
sci(){ // Fiolo : une fiole avec des bulles qui montent
  const bub = [[46,92,3.2,0],[66,96,2.6,-.7],[56,88,2,-1.3],[74,90,1.8,-.4]].map(([x, y, r, d]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#E0FFF0" stroke="${TD}" stroke-width="1.2" class="ta-bubble" style="animation-delay:${d}s"/>`).join("");
  return tFeet(44, 76, 104, "#9ADCFF", "#5A9ADA", "#2E5A9A", 8) + tArms(30, 90, 74, -12, -6, "#CFEFFF", "#7AB8E8", "#3A6AA0")
  + toy("M48 20 L72 20 L72 44 Q98 54 98 80 Q98 106 60 106 Q22 106 22 80 Q22 54 48 44Z", "#F0FAFF", "#A8D8F0", "#5A8AB0")
  + `<path d="M27 78 Q60 66 93 78 Q95 102 60 103 Q25 102 27 78Z" fill="#6FE0A6" stroke="${TD}" stroke-width="2.4"/>` + bub
  + tEyes(50, 70, 60, .9) + tBlush(40, 80, 68) + tMouth(60, 68) + tShine("M30 82 Q30 62 44 52") + tShine("M52 26 V40", 2.6)
  + toy("M45 8 L75 8 L73 22 L47 22Z", "#E8B47A", "#B87A3A", "#7A4A1E", {dy:2.5, w:2.6});
},
his(){ // Chevalino : un petit chevalier en armure, plumet au vent
  const M = ["#E8EEF8", "#8E9AB0", "#4E5A70"];
  return tFeet(44, 76, 102, ...M, 9) + tArms(28, 92, 70, -10, 8, ...M)
  + `<g class="ta-sway" style="transform-origin:60px 24px">${toy("M60 24 Q52 6 64 2 Q80 0 82 14 Q72 10 66 24Z", "#FF8A9A", "#D8243A", "#8A1020", {dy:2, w:2.6})}</g>`
  + toy("M26 98 Q20 64 30 44 Q42 24 60 24 Q78 24 90 44 Q100 64 94 98 Q60 106 26 98Z", ...M)
  + toy("M36 52 Q60 44 84 52 L84 76 Q60 84 36 76Z", "#2A2440", "#1A1430", "#0A0614", {dy:0, w:2.6})
  + `<path d="M60 26 V98" stroke="${TD}" stroke-width="2" opacity=".35"/><g class="tblink"><ellipse cx="50" cy="64" rx="4" ry="5.4" fill="#8AF8E8"/><ellipse cx="70" cy="64" rx="4" ry="5.4" fill="#8AF8E8"/><circle cx="51.4" cy="62" r="1.4" fill="#fff"/><circle cx="71.4" cy="62" r="1.4" fill="#fff"/></g>`
  + tShine("M33 80 Q31 56 42 40") + toy(tC(60, 90, 6), "#FFE98A", "#F0A61C", "#A8650C", {dy:1.5, w:2.2});
},
ani(){ // Pandou : un panda tout rond
  const W = ["#FFFFFF", "#DCD8E6", "#9A94A8"], K = ["#4A4458", "#1E1A28", "#0A0810"];
  return tFeet(44, 76, 102, ...K, 9) + tArms(28, 92, 70, -12, 8, ...K)
  + toy(tC(36, 28, 10), ...K, {dy:2}) + toy(tC(84, 28, 10), ...K, {dy:2})
  + toy("M60 24 Q94 24 98 60 Q100 98 60 100 Q20 98 22 60 Q26 24 60 24Z", ...W)
  + `<ellipse cx="47" cy="60" rx="10" ry="12" transform="rotate(-20 47 60)" fill="#2A2436"/><ellipse cx="73" cy="60" rx="10" ry="12" transform="rotate(20 73 60)" fill="#2A2436"/>`
  + `<g class="tblink"><ellipse cx="48" cy="60" rx="4" ry="5.2" fill="#fff"/><ellipse cx="72" cy="60" rx="4" ry="5.2" fill="#fff"/><circle cx="48.8" cy="61" r="2.6" fill="${TD}"/><circle cx="72.8" cy="61" r="2.6" fill="${TD}"/></g>`
  + `<ellipse cx="60" cy="72" rx="4.4" ry="3" fill="${TD}"/>` + tMouth(60, 76, "cat") + tBlush(38, 82, 74) + tShine("M30 64 Q30 42 44 32");
},
jeu(){ // Manetto : une manette aux boutons qui clignotent
  const P = ["#B8A4FF", "#6E4BEA", "#3A2498"];
  return tFeet(42, 78, 101, ...P, 9)
  + toy("M18 44 Q18 34 30 34 H90 Q102 34 102 44 L108 76 Q112 96 94 92 L80 80 H40 L26 92 Q8 96 12 76Z", ...P)
  + tShine("M24 44 Q26 38 34 38 H48")
  + `<path d="M24 56 h6 v-6 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6z" fill="#fff" ${tS(2.2)}/>`
  + [[88,52,"#FF6A8A",0],[96,60,"#5AE8A0",-.4],[80,60,"#7FC8FF",-.8],[88,68,"#FFD23F",-1.2]].map(([x, y, c, d]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}" ${tS(2)} class="ta-blinkb" style="animation-delay:${d}s"/>`).join("")
  + tEyes(52, 68, 56, .75) + tBlush(46, 74, 65) + tMouth(60, 65);
},
art(){ // Palette : des taches de peinture qui pulsent
  return tFeet(44, 76, 102, "#E8B47A", "#B87A3A", "#7A4A1E", 9)
  + `<g class="ta-sway" style="transform-origin:100px 86px">${tLimb("M100 86 L112 52", "#C8925A", 6)}${toy("M112 52 Q108 40 114 34 Q120 40 116 52Z", "#5AB8FF", "#2E6AC8", "#1D3A8A", {dy:1.5, w:2})}</g>`
  + toy("M16 64 Q14 32 50 26 Q90 20 104 48 Q112 70 92 72 Q80 72 82 84 Q84 100 58 100 Q20 98 16 64Z", "#F6D4A0", "#D8A060", "#8A5A2A")
  + `<ellipse cx="88" cy="58" rx="7" ry="5.4" fill="#2B1D3A" opacity=".85"/>`
  + [[30,48,"#FF5A6A"],[48,36,"#FFD23F"],[70,34,"#5AE8A0"],[28,72,"#5AB8FF"]].map(([x, y, c], i) => `<g class="ta-pulse2" style="animation-delay:${-i*.5}s">${toy(tC(x, y, 6.5), c, c, "#2B1D3A", {dy:1.5, w:2.2})}</g>`).join("")
  + tShine("M22 60 Q22 44 34 36") + tEyes(50, 68, 70, .85) + tBlush(42, 76, 79) + tMouth(59, 79);
},
spo(){ // Ballon : un ballon qui rebondit
  return toy(tC(60, 62, 34), "#FFFFFF", "#D8D8E4", "#8A8AA0")
  + `<path d="M60 46 L72 55 L68 69 L52 69 L48 55Z" fill="#2B2440" ${tS(2)}/><path d="M60 46 V30 M72 55 L88 50 M68 69 L78 84 M52 69 L42 84 M48 55 L32 50" stroke="${TD}" stroke-width="2"/>`
  + `<path d="M30 46 L36 38 L44 40 M88 82 L82 92 L74 92 M96 60 L92 70" fill="none" stroke="${TD}" stroke-width="2"/>`
  + tShine("M36 44 Q42 32 54 29") + tEyes(48, 72, 80, .8) + tBlush(40, 80, 88) + tMouth(60, 88)
  + tArms(30, 90, 66, -14, -14, "#FFFFFF", "#D8D8E4", "#8A8AA0");
},
mon(){ // Valise : une valise couverte d'autocollants
  const B = ["#E8A466", "#B86A2E", "#6A3A14"];
  return toy(tE(42, 104, 6, 6), "#5A5070", "#2A2440", "#120E1E", {dy:1}) + toy(tE(78, 104, 6, 6), "#5A5070", "#2A2440", "#120E1E", {dy:1})
  + tLimb("M46 30 Q46 18 60 18 Q74 18 74 30", "#5A3A1E", 9)
  + toy("M18 36 Q18 30 26 30 H94 Q102 30 102 36 V94 Q102 100 94 100 H26 Q18 100 18 94Z", ...B)
  + `<path d="M18 52 H102 M18 84 H102" stroke="${TD}" stroke-width="2" opacity=".35"/>`
  + toy(tC(30, 42, 6), "#FFE98A", "#F0A61C", "#A8650C", {dy:1, w:2}) + toy("M84 80 l12 -4 l-2 12 l-10 2z", "#7FC8FF", "#2E86E0", "#1D56A8", {dy:1, w:2}) + toy("M86 38 h12 v9 h-12z", "#FF8AB8", "#E2427A", "#8A1A40", {dy:1, w:2})
  + tShine("M24 46 V80") + tEyes(50, 70, 64) + tBlush(41, 79, 74) + tMouth(60, 74);
},
per(){ // Buste : un buste de marbre couronné de laurier
  const M = ["#FFFFFF", "#D8D2E8", "#8A84A0"];
  return toy("M30 106 H90 L86 94 H34Z", "#C8C0D8", "#8A84A0", "#5A5470", {dy:2, w:2.6})
  + toy("M28 94 Q30 74 46 70 L74 70 Q90 74 92 94Z", ...M)
  + toy("M60 14 Q86 14 88 44 Q88 70 60 74 Q32 70 32 44 Q34 14 60 14Z", ...M)
  + `<path d="M40 82 Q60 90 80 82" fill="none" stroke="#A8A0C0" stroke-width="2"/>`
  + [-1, 1].map(s => [0,1,2,3].map(i => `<ellipse cx="${60 + s*(26-i*3)}" cy="${30-i*5}" rx="5.4" ry="2.6" transform="rotate(${s*(-60+i*20)} ${60 + s*(26-i*3)} ${30-i*5})" fill="#8BD050" ${tS(1.6)}/>`).join("")).join("")
  + tShine("M38 40 Q40 24 52 18") + tEyes(50, 70, 46, .85) + tBlush(42, 78, 55) + tMouth(60, 56, "cat");
},
cin(){ // Popcorn : des grains qui sautent
  const pop = [[34,22,0],[60,12,-.5],[86,22,-1]].map(([x, y, d]) => `<g class="ta-pop" style="animation-delay:${d}s">${toy(tC(x, y, 6), "#FFFBE8", "#F6E0A0", "#B89A5A", {dy:1, w:2})}</g>`).join("");
  return pop + tFeet(46, 74, 103, "#FF8A9A", "#D8243A", "#8A1020", 8)
  + [[32,34],[46,26],[60,24],[74,26],[88,34],[40,40],[80,40]].map(([x, y]) => toy(tC(x, y, 10), "#FFFBE8", "#F6E0A0", "#B89A5A", {dy:2, w:2.4})).join("")
  + toy("M22 42 H98 L88 100 H32Z", "#FFFFFF", "#E8E0EC", "#8A84A0")
  + [0,1,2,3].map(i => `<path d="M${30+i*20} 42 L${36+i*17} 100 H${44+i*17} L${40+i*20} 42Z" fill="#E8344E"/>`).join("") + `<path d="M22 42 H98 L88 100 H32Z" fill="none" ${tS(3)}/>`
  + toy("M36 56 H84 Q86 74 80 82 H40 Q34 74 36 56Z", "#FFFFFF", "#F0ECF6", "#8A84A0", {dy:0, w:2.4})
  + tEyes(51, 69, 66, .8) + tBlush(44, 76, 74) + tMouth(60, 74);
},
mus(){ // Croche : une note de musique qui se dandine
  const notes = [[18,30,0],[100,20,-1]].map(([x, y, d]) => `<g class="ta-spore" style="animation-delay:${d}s"><path d="M${x} ${y} v-12 l8 -3 v12" fill="none" stroke="#C9A2FF" stroke-width="2.4"/><circle cx="${x-2}" cy="${y}" r="3" fill="#C9A2FF"/><circle cx="${x+6}" cy="${y-3}" r="3" fill="#C9A2FF"/></g>`).join("");
  return notes + `<g class="ta-sway" style="transform-origin:60px 100px">`
  + tFeet(46, 74, 104, "#5A5070", "#2A2440", "#120E1E", 8)
  + tLimb("M80 74 V18", "#3A3450", 9) + toy("M80 14 Q102 22 100 46 Q92 32 80 34Z", "#5A5070", "#2A2440", "#120E1E", {dy:2})
  + toy(tE(58, 76, 26, 22), "#6A6088", "#2A2440", "#120E1E")
  + tShine("M38 70 Q40 60 50 56") + tEyes(50, 68, 76, .85) + tBlush(42, 76, 85) + tMouth(59, 85) + `</g>`;
},
ins(){ // Soucoupe : une soucoupe volante et son rayon
  return `<path d="M44 84 L30 112 H90 L76 84Z" fill="#AFFFE0" opacity=".35" class="ta-pulse"/>`
  + toy(tE(60, 52, 22, 20), "#D8F8FF", "#7AC8E8", "#3A7AA0", {dy:0, w:2.6})
  + toy(tE(60, 74, 46, 12), "#C8D0E8", "#7A84A8", "#4A5070")
  + [26, 44, 60, 76, 94].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 80 : 77}" r="3" fill="#FFE27A" ${tS(1.4)} class="ta-blinkb" style="animation-delay:${-i*.25}s"/>`).join("")
  + `<path d="M40 52 Q42 38 54 34" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".8"/>`
  + `<g>${toy(tE(60, 56, 12, 10), "#9AF08A", "#4EB84A", "#2A7A2A", {dy:0, w:2.4})}</g>` + tEyes(55, 65, 55, .55) + `<path d="M58 60 q2 2 4 0" fill="none" stroke="${TD}" stroke-width="1.8" stroke-linecap="round"/>`
  + tShine("M22 72 Q34 66 48 65", 2.8);
},
gas(){ // Croissant : bien doré, avec un peu de vapeur
  const steam = [44, 60, 76].map((x, i) => `<path d="M${x} 30 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".6" class="ta-spore" style="animation-delay:${-i*.7}s"/>`).join("");
  return steam + tFeet(42, 78, 101, "#E8A050", "#B86A20", "#7A420A", 8)
  + toy("M8 74 Q14 44 42 38 Q60 34 78 38 Q106 44 112 74 Q100 64 90 70 Q96 92 60 96 Q24 92 30 70 Q20 64 8 74Z", "#FFD088", "#D8862E", "#8A4E12")
  + `<path d="M36 44 Q42 66 40 90 M60 38 V96 M84 44 Q78 66 80 90" fill="none" stroke="#B86A20" stroke-width="2.6" opacity=".7"/>`
  + tShine("M18 66 Q24 52 36 46") + tEyes(50, 70, 64, .85) + tBlush(42, 78, 74) + tMouth(60, 74);
},
lan(){ // Encrier : une plume qui se balance et une goutte d'encre
  return `<path class="ta-drip" d="M40 102 q-3 5 0 7 q3 -2 0 -7z" fill="#5A4AE8" ${tS(1.4)}/>`
  + tFeet(44, 76, 103, "#5A5070", "#2A2440", "#120E1E", 8)
  + toy("M26 56 Q26 46 38 46 H82 Q94 46 94 56 V92 Q94 102 82 102 H38 Q26 102 26 92Z", "#8A7AF0", "#3A2AA0", "#1E146A")
  + toy("M42 30 H78 V46 H42Z", "#3A3450", "#1E1A28", "#0A0810", {dy:2, w:2.6})
  + `<g class="ta-sway" style="transform-origin:66px 34px">${toy("M66 34 Q76 6 102 2 Q94 20 72 36Z", "#FFFFFF", "#D8D0EC", "#8A84A0", {dy:2, w:2.4})}<path d="M70 32 Q82 16 98 6" fill="none" stroke="#A8A0C0" stroke-width="1.6"/></g>`
  + tShine("M32 60 V88") + tEyes(50, 70, 72) + tBlush(41, 79, 82) + tMouth(60, 82);
},
myt(){ // Cyclo : un cyclope au grand œil
  const S = ["#B4E88A", "#5EAA44", "#2E6A26"];
  return tFeet(44, 76, 102, ...S, 9) + tArms(28, 92, 72, -14, 6, ...S)
  + toy("M52 28 L58 8 L64 28Z", "#FFF3DC", "#E8CFA0", "#B89A6A", {dy:2, w:2.4})
  + toy("M60 26 Q94 26 96 62 Q98 100 60 100 Q22 100 24 62 Q26 26 60 26Z", ...S)
  + toy("M30 80 Q60 92 90 80 L92 98 Q60 106 28 98Z", "#FFFFFF", "#E8E0EC", "#8A84A0", {dy:0, w:2.4})
  + `<g class="tblink"><circle cx="60" cy="56" r="15" fill="#fff" ${tS(2.6)}/><g class="ta-look"><circle cx="60" cy="58" r="8" fill="#5AB8FF" stroke="${TD}" stroke-width="2"/><circle cx="60" cy="58" r="4" fill="${TD}"/><circle cx="63" cy="55" r="2.2" fill="#fff"/></g></g>`
  + tShine("M30 70 Q30 46 44 34") + tMouth(60, 76) + tBlush(38, 82, 70);
},
tec(){ // Robotik : un robot à l'antenne qui clignote
  const M = ["#D8E6F8", "#7A8EB0", "#3E4A68"];
  return tFeet(44, 76, 102, ...M, 9) + tArms(24, 96, 74, -14, 4, ...M)
  + tLimb("M60 24 V10", "#7A8EB0", 7) + `<circle cx="60" cy="8" r="5" fill="#FF5A6A" ${tS(2.2)} class="ta-blinkb"/>`
  + toy("M22 32 Q22 24 30 24 H90 Q98 24 98 32 V96 Q98 102 90 102 H30 Q22 102 22 96Z", ...M)
  + toy("M32 36 H88 V70 H32Z", "#2A3A5A", "#121A2E", "#060A14", {dy:0, w:2.6})
  + `<g class="tblink"><rect x="44" y="46" width="9" height="11" rx="2" fill="#7FF0E0"/><rect x="67" y="46" width="9" height="11" rx="2" fill="#7FF0E0"/></g><path d="M52 62 q8 5 16 0" fill="none" stroke="#7FF0E0" stroke-width="2.4" stroke-linecap="round"/>`
  + [[36,84,"#FF6A8A"],[48,84,"#FFD23F"],[60,84,"#5AE8A0"]].map(([x, y, c], i) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}" ${tS(2)} class="ta-blinkb" style="animation-delay:${-i*.35}s"/>`).join("")
  + `<path d="M72 80 h16 M72 88 h12" stroke="${TD}" stroke-width="3" stroke-linecap="round"/>` + tShine("M27 40 V64");
},
cap(){ // Punaise : une épingle de carte qui sautille
  const R = ["#FF8A8A", "#E2323A", "#8A1018"];
  return `<path d="M60 84 L60 108" stroke="#8A94A8" stroke-width="4" stroke-linecap="round"/><path d="M60 84 L60 108" stroke="${TD}" stroke-width="1.4" opacity=".4"/>`
  + tArms(30, 90, 52, -12, -10, ...R)
  + toy("M60 88 Q30 72 28 46 Q28 18 60 16 Q92 18 92 46 Q90 72 60 88Z", ...R)
  + `<circle cx="60" cy="44" r="16" fill="#fff" opacity=".25"/>` + tShine("M36 42 Q38 28 50 22") + tEyes(50, 70, 46) + tBlush(41, 79, 56) + tMouth(60, 56);
},
eco(){ // Tirelou : un cochon tirelire, une pièce tombe dans la fente
  const P = ["#FFC4DA", "#F07AA8", "#A83A64"];
  return `<g class="ta-coin">${toy(tE(60, 8, 7, 7), "#FFE98A", "#F0A61C", "#A8650C", {dy:1, w:2})}</g>`
  + toy("M30 92 v12 h10 v-12Z", ...P, {dy:1.5, w:2.4}) + toy("M80 92 v12 h10 v-12Z", ...P, {dy:1.5, w:2.4})
  + toy("M28 36 L32 22 L44 32Z", ...P, {dy:2, w:2.4}) + toy("M92 36 L88 22 L76 32Z", ...P, {dy:2, w:2.4})
  + `<g class="ta-wag" style="transform-origin:104px 66px"><path d="M104 66 q10 -2 8 6 q-2 6 6 4" fill="none" stroke="${TD}" stroke-width="5" stroke-linecap="round"/><path d="M104 66 q10 -2 8 6 q-2 6 6 4" fill="none" stroke="#F07AA8" stroke-width="2.4" stroke-linecap="round"/></g>`
  + toy("M60 26 Q100 26 104 62 Q104 96 60 96 Q16 96 16 62 Q20 26 60 26Z", ...P)
  + `<rect x="50" y="27" width="20" height="4" rx="2" fill="${TD}"/>`
  + toy(tE(60, 68, 12, 8.5), "#FFD8E8", "#F09ABC", "#A83A64", {dy:0, w:2.4}) + `<ellipse cx="56" cy="68" rx="2" ry="3" fill="${TD}"/><ellipse cx="64" cy="68" rx="2" ry="3" fill="${TD}"/>`
  + tShine("M24 56 Q26 40 40 33") + tEyes(44, 76, 52, .85) + tBlush(32, 88, 62);
},
// ---- Skins secrets
etoile(){
  return `<path d="M30 74 C10 84 2 98 -2 110 C12 98 22 92 36 88Z" fill="#FFE7A0" opacity=".6" class="ta-pulse"/>`
  + tArms(30, 90, 54, -12, -12, "#FFF3A0", "#F0B81E", "#A8740A")
  + toy("M60 12 L72 40 L102 42 L78 62 L86 92 L60 76 L34 92 L42 62 L18 42 L48 40Z", "#FFF3A0", "#F0B81E", "#A8740A")
  + tShine("M50 36 L56 22") + tEyes(51, 69, 56, .8) + tBlush(44, 76, 64) + tMouth(60, 65);
},
trefle(){
  const G = ["#A8F09A", "#3EA04A", "#1E6A26"];
  return tLimb("M60 88 Q62 98 72 106", "#3EA04A", 7)
  + `<g class="ta-sway" style="transform-origin:60px 90px">${tArms(30, 90, 66, -10, -12, ...G)}`
  + [[60,40],[40,62],[80,62],[60,82]].map(([x, y]) => toy(tC(x, y, 20), ...G, {dy:3})).join("") + toy(tC(60, 62, 14), ...G, {dy:0})
  + tShine("M50 30 Q52 24 58 22") + tEyes(52, 68, 62, .8) + tBlush(45, 75, 70) + tMouth(60, 70) + `</g>`;
},
dede(){ // Dédé : un dé qui roule des yeux
  return tFeet(44, 76, 104, "#E8E8F0", "#B4B4C8", "#6A6A80", 8) + tArms(24, 96, 70, -14, -8, "#FFFFFF", "#D8D8E4", "#8A8AA0")
  + `<path d="M24 44 L60 28 L96 44 L60 60Z" fill="#FFFFFF" ${tS(3)}/><path d="M24 44 L60 60 V100 L24 84Z" fill="#E8E8F2" ${tS(3)}/><path d="M96 44 L60 60 V100 L96 84Z" fill="#C8C8D8" ${tS(3)}/>`
  + `<ellipse cx="60" cy="44" rx="4.4" ry="2.6" fill="#E2323A"/>` + [[84,60],[72,82],[78,71]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${TD}"/>`).join("")
  + tEyes(36, 50, 68, .6) + `<path d="M39 79 q4 3 8 0" fill="none" stroke="${TD}" stroke-width="2" stroke-linecap="round"/>` + tShine("M30 52 L52 42", 3);
},
lingot(){
  const Gd = ["#FFF0A0", "#F2B81E", "#A8740A"];
  return tFeet(40, 80, 102, ...Gd, 9) + tArms(22, 98, 80, -14, -14, ...Gd)
  + toy("M32 52 H88 L104 96 H16Z", ...Gd) + toy("M32 52 H88 L84 62 H36Z", "#FFFBE0", "#FFE070", "#A8740A", {dy:0, w:2.4})
  + tShine("M30 72 L24 90") + tEyes(50, 70, 76, .85) + tBlush(41, 79, 86) + tMouth(60, 86)
  + tStar(90, 40, 6, "#FFFFFF", "ta-twinkle") + tStar(22, 44, 4, "#FFF3A0", "ta-twinkle");
},
veinard(){ // Veinard : un fer à cheval porte-bonheur
  const M = ["#F0F4FA", "#9AA4B8", "#4E5870"];
  return tFeet(30, 90, 104, ...M, 8)
  + toy("M28 102 Q14 74 20 48 Q28 18 60 16 Q92 18 100 48 Q106 74 92 102 L74 102 Q84 76 80 54 Q76 36 60 36 Q44 36 40 54 Q36 76 46 102Z", ...M)
  + [[28,48],[24,66],[30,84],[92,48],[96,66],[90,84]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.8" fill="#4E5870"/>`).join("")
  + tShine("M28 40 Q38 24 54 20") + tEyes(52, 68, 26, .65) + tBlush(46, 74, 32) + `<path d="M56 31 q4 3 8 0" fill="none" stroke="${TD}" stroke-width="2" stroke-linecap="round"/>`
  + tStar(60, 62, 8, "#FFE27A", "ta-twinkle") + tStar(14, 20, 4, "#FFFFFF", "ta-twinkle");
},
comete(){
  return `<path d="M84 44 C100 30 112 12 118 2 C108 20 104 36 96 52Z M86 60 C104 56 114 46 120 38 C112 54 104 62 92 70Z" fill="#B8ECFF" opacity=".65" class="ta-pulse"/>`
  + tArms(32, 88, 72, -6, 4, "#C8F0FF", "#3E9AD8", "#123A6A")
  + toy(tC(60, 66, 28), "#C8F0FF", "#3E9AD8", "#123A6A")
  + `<circle cx="74" cy="80" r="5" fill="#5AB8F0" opacity=".7"/><circle cx="44" cy="84" r="3" fill="#5AB8F0" opacity=".7"/>`
  + tShine("M40 56 Q44 44 54 40") + tEyes(50, 70, 64, .85) + tBlush(42, 78, 73) + tMouth(60, 74, "o");
},
lumen(){ // Lumen, l'ultra secret : un astre doré entouré de rayons qui tournent
  return tGlow(60, 60, 58, "#FFD06A", .7)
  + `<g class="ta-rays" style="transform-origin:60px 60px">${[0,1,2,3,4,5,6,7].map(i => { const a = i*Math.PI/4, p = r => (60+Math.cos(a)*r).toFixed(1) + " " + (60+Math.sin(a)*r).toFixed(1); return `<path d="M${p(40)} L${p(52)}" stroke="${TD}" stroke-width="7" stroke-linecap="round"/><path d="M${p(40)} L${p(52)}" stroke="#FFE36A" stroke-width="3.6" stroke-linecap="round"/>`; }).join("")}</g>`
  + `<ellipse cx="60" cy="16" rx="16" ry="4.5" fill="none" stroke="${TD}" stroke-width="6"/><ellipse cx="60" cy="16" rx="16" ry="4.5" fill="none" stroke="#FFE36A" stroke-width="3"/>`
  + tArms(32, 88, 66, -14, -14, "#FFF6C8", "#F2B83B", "#A8740A")
  + toy("M60 26 C80 26 92 42 92 62 C92 84 78 96 60 96 C42 96 28 84 28 62 C28 42 40 26 60 26Z", "#FFF6C8", "#F2B83B", "#A8740A")
  + `<g class="ta-flick" style="transform-origin:60px 50px"><path d="M60 50 C55 44 56 38 60 32 C64 38 65 44 60 50Z" fill="#FF9A3D" ${tS(2)}/><path d="M60 48 C58 45 58.5 42 60 39 C61.5 42 62 45 60 48Z" fill="#FFE27A"/></g>`
  + tShine("M36 56 Q38 42 48 35") + tEyes(48, 72, 64) + tBlush(40, 80, 74) + tMouth(60, 78);
}
};
const TOY_SKIN_ANIM = { cor:"beat", spo:"bounce", cap:"bounce", dede:"jelly" };
SHOP_SKINS.concat(SECRET_SKINS, [ULTRA_SKIN]).forEach(s => { if (TOY_SKINS[s.id]) { s.draw = TOY_SKINS[s.id]; s.toy = true; s.anim = TOY_SKIN_ANIM[s.id] || ""; delete s.hat; } });
