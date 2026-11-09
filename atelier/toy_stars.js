/* ---------- Édition spéciale « séries & stars » : 6 personnages originaux en style jouet ----------
   Des clins d'œil à des héros de séries et de sport, sans reprendre leurs traits : des personnages Lumen déguisés.
   Deux se débloquent avec un exploit (free + hint), les quatre autres s'achètent en pièces. */
// Un petit personnage « humain » : corps, bras, tête. Les options ajoutent les costumes.
function tPerson(o){
  const torso = "M24 118 C18 92 28 70 60 68 C92 70 102 92 96 118 Q94 126 84 126 H36 Q26 126 24 118Z";
  const armL = o.armL || "M28 88 Q14 96 14 110", handL = o.handL || [14, 112];
  const armR = o.armR || "M92 88 Q106 96 106 110", handR = o.handR || [106, 112];
  const hand = (x, y) => toy(tC(x, y, 6.5), ...(o.gloves || o.skin), {dy:1.5, w:2.4});
  return `<g transform="translate(9 3) scale(.85)">`
    + (o.back || "")
    + tFeet(44, 76, 124, ...o.shoes, 11)
    + tLimb(armL, o.sleeve || o.torso[1], 12) + hand(...handL)
    + toy(torso, ...o.torso, {dy:4}) + (o.body || "") + tShine("M30 110 Q29 92 40 80", 3.2, .6)
    + tLimb(armR, o.sleeve || o.torso[1], 12) + hand(...handR) + (o.held || "")
    + toy(tE(60, 46, 27, 24), ...o.skin, {dy:0}) + (o.face || "")
    + (o.eyes || tEyes(50, 70, 48)) + tBlush(40, 80, 57) + (o.mouth || tMouth(60, 58))
    + (o.hair || "") + (o.front || "") + `</g>`;
}
const STAR_SKINS = [
{ id:"nord", n:"Le Veilleur du Nord", e:"Édition séries", free:true, hint:"Gagne ton premier duel en ligne", toy:true, anim:"", draw(){
  const fur = ["#C8B8A6", "#8A7864", "#3E3226"];
  const snow = [[10,18,0],[34,4,-1.1],[96,10,-.5],[112,30,-2],[20,44,-1.6],[104,52,-.3]].map(([x, y, d]) => `<g class="ta-snow" style="animation-delay:${d}s"><circle cx="${x}" cy="${y}" r="2.6" fill="#FFFFFF" stroke="#9AB8E0" stroke-width="1"/></g>`).join("");
  return tPerson({
    skin:["#FFE4CE", "#F2B494", "#000"], torso:["#5E4E44", "#3A2E28", "#1A1210"], shoes:["#6A5240", "#3E2C20", "#1A120C"], sleeve:"#3A2E28",
    back: toy("M16 124 C8 98 16 72 60 70 C104 72 112 98 104 124Z", "#3E3848", "#24202E", "#0E0C14", {dy:3})
      + tLimb("M88 74 L106 22", "#DCE6F2", 8) + toy("M98 34 L112 40 L110 44 L96 38Z", "#B8A060", "#7A6430", "#3A2E10", {dy:1, w:2}) + tLimb("M108 36 L113 24", "#4A3A30", 6),
    body: `<path d="M36 78 L84 118" stroke="${TD}" stroke-width="8" stroke-linecap="round"/><path d="M36 78 L84 118" stroke="#8A6440" stroke-width="4.5" stroke-linecap="round"/>`
      + toy("M22 86 Q24 66 40 68 Q48 60 60 66 Q72 60 80 68 Q96 66 98 86 Q90 78 80 82 Q70 74 60 80 Q50 74 40 82 Q30 78 22 86Z", ...fur, {dy:3}),
    face: `<path d="M36 54 Q38 70 60 72 Q82 70 84 54 Q78 66 60 67 Q42 66 36 54Z" fill="#3A2A24" opacity=".5"/><path d="M42 39 l10 2 M78 39 l-10 2" stroke="#2A1E1A" stroke-width="3" stroke-linecap="round"/>`,
    mouth: `<path d="M55 60 Q60 62 65 60" fill="none" stroke="${TD}" stroke-width="2.4" stroke-linecap="round"/>`,
    hair: toy("M32 46 Q28 16 60 14 Q92 16 88 46 Q84 34 78 36 Q76 26 68 30 Q62 22 54 30 Q46 24 42 36 Q36 34 32 46Z", "#4E3E36", "#2A1E1A", "#120C0A", {dy:2})
      + toy(tC(33, 48, 6.5), "#4E3E36", "#2A1E1A", "#120C0A", {dy:1, w:2.4}) + toy(tC(87, 48, 6.5), "#4E3E36", "#2A1E1A", "#120C0A", {dy:1, w:2.4})
      + tShine("M44 24 Q52 18 62 18", 2.6, .5),
    front: snow
  });
} },
{ id:"chimiste", n:"Le Chimiste", e:"Édition séries", p:400, toy:true, anim:"", draw(){
  const bub = [[108,68,2.4,0],[113,64,1.8,-.8],[104,62,1.6,-1.5]].map(([x, y, r, d]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#E8FAFF" stroke="${TD}" stroke-width="1" class="ta-bubble" style="animation-delay:${d}s"/>`).join("");
  return tPerson({
    skin:["#FFE6D4", "#F0B79C", "#000"], torso:["#FFE66A", "#EAB820", "#946C00"], shoes:["#4A4A52", "#24242A", "#0A0A0E"], sleeve:"#EAB820",
    armR:"M92 88 Q108 84 110 72", handR:[110, 70],
    body: `<path d="M60 70 V124" stroke="#946C00" stroke-width="2.4" opacity=".6"/><rect x="40" y="94" width="14" height="10" rx="2" fill="#FFF6C0" stroke="${TD}" stroke-width="2"/>`,
    held: toy("M104 40 L114 40 L114 52 Q124 58 122 68 Q120 78 109 78 Q98 78 96 68 Q94 58 104 52Z", "#F0FAFF", "#B8DEF0", "#5A8AB0", {dy:2, w:2.6})
      + `<path d="M97 64 Q109 60 121 64 Q121 76 109 76 Q97 76 97 64Z" fill="#6AD8FF" stroke="${TD}" stroke-width="2"/>` + bub
      + `<g class="ta-spore"><path d="M106 34 q-4 -6 0 -10 q4 -4 0 -10" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>`,
    face: `<path d="M50 59 Q60 54 70 59" fill="none" stroke="#6A4A30" stroke-width="3.4" stroke-linecap="round"/><path d="M54 62 Q60 74 66 62 Q64 68 60 69 Q56 68 54 62Z" fill="#6A4A30" stroke="${TD}" stroke-width="1.6"/>`,
    eyes: tEyes(50, 70, 47, .85) + `<rect x="40" y="40" width="19" height="13" rx="3" fill="#CFEFFF" fill-opacity=".25" stroke="${TD}" stroke-width="2.6"/><rect x="61" y="40" width="19" height="13" rx="3" fill="#CFEFFF" fill-opacity=".25" stroke="${TD}" stroke-width="2.6"/><path d="M59 45 h2" stroke="${TD}" stroke-width="2.6"/>`,
    mouth: `<path d="M56 63 Q60 64.5 64 63" fill="none" stroke="${TD}" stroke-width="2" stroke-linecap="round"/>`,
    hair: toy(tE(60, 26, 36, 6.5), "#55555E", "#2A2A30", "#0A0A0E", {dy:2})
      + toy("M38 26 Q37 4 60 4 Q83 4 82 26Z", "#55555E", "#2A2A30", "#0A0A0E", {dy:0})
      + `<path d="M38.5 20 Q60 23 81.5 20 L82 25 Q60 28 38 25Z" fill="#7A6450" stroke="${TD}" stroke-width="2"/>` + tShine("M44 18 Q46 8 56 7", 2.6, .45)
  });
} },
{ id:"roi", n:"Le Roi du Panier", e:"Édition sport", p:450, toy:true, anim:"", draw(){
  const P = "#6A3AB8";
  return tPerson({
    skin:["#C98A60", "#9A5E3A", "#000"], torso:["#FFE36A", "#F2B320", "#A8740A"], shoes:["#FFFFFF", "#D8D8E4", "#6A6A80"], sleeve:"#9A5E3A",
    handL:[16, 104], armL:"M28 88 Q16 92 16 102",
    body: `<path d="M44 70 L60 86 L76 70" fill="none" stroke="${TD}" stroke-width="7.5" stroke-linejoin="round"/><path d="M44 70 L60 86 L76 70" fill="none" stroke="${P}" stroke-width="4" stroke-linejoin="round"/>`
      + `<path d="M28 84 Q30 76 36 72 M92 84 Q90 76 84 72" stroke="${P}" stroke-width="4" fill="none" stroke-linecap="round"/>` + tStar(60, 102, 9, P),
    held: `<g class="ta-dribble">${toy(tC(14, 118, 10), "#FFB37A", "#E8742A", "#9A4012", {dy:2, w:2.6})}<path d="M4 118 H24 M14 108 V128 M7 111 Q14 118 7 125 M21 111 Q14 118 21 125" fill="none" stroke="${TD}" stroke-width="1.6"/></g>`,
    face: `<path d="M36 54 Q38 72 60 73 Q82 72 84 54 Q78 68 60 68 Q42 68 36 54Z" fill="#2A1A14" opacity=".75"/>`,
    mouth: tMouth(60, 59),
    hair: toy("M34 36 Q34 18 60 17 Q86 18 86 36 Q60 28 34 36Z", "#3A2A24", "#1E1612", "#000", {dy:1.5})
      + toy("M33 36 Q60 27 87 36 L87 43 Q60 34 33 43Z", "#FFFFFF", "#DCDCE8", "#8A8AA0", {dy:0, w:2.4})
      + `<g class="ta-sway" style="transform-origin:60px 14px">${toy("M44 15 L46 2 L53 9 L60 -1 L67 9 L74 2 L76 15Z", "#FFF0A0", "#F2B81E", "#A8740A", {dy:1.5, w:2.4})}</g>`
      + tStar(98, 14, 4, "#FFFFFF", "ta-twinkle")
  });
} },
{ id:"prince", n:"Le Prince de L.A.", e:"Édition séries", p:500, toy:true, anim:"", draw(){
  const G = ["#FFF0A0", "#F2B81E", "#A8740A"];
  const leaves = [[-34,-6],[-14,-16],[10,-14],[28,-2]].map(([dx, dy]) => `<path d="M20 52 Q${20+dx*.5} ${52+dy-8} ${20+dx} ${52+dy}" fill="none" stroke="${TD}" stroke-width="8" stroke-linecap="round"/><path d="M20 52 Q${20+dx*.5} ${52+dy-8} ${20+dx} ${52+dy}" fill="none" stroke="#4AC86A" stroke-width="4" stroke-linecap="round"/>`).join("");
  return tPerson({
    skin:["#B97A52", "#8A5232", "#000"], torso:["#7AE0D8", "#2EA8A0", "#126A64"], shoes:["#FFFFFF", "#D8D8E4", "#6A6A80"], sleeve:"#2EA8A0",
    back: tGlow(98, 34, 34, "#FF9A5A", .75) + `<g class="ta-sway" style="transform-origin:16px 124px">${tLimb("M16 124 Q10 92 20 54", "#B8844A", 9)}${leaves}</g>`,
    body: toy("M30 96 Q50 84 92 100 L95 112 Q56 98 28 108Z", "#B48AFF", "#7A4AE0", "#3A1E8A", {dy:0, w:2.4})
      + `<path d="M44 70 Q60 94 76 70" fill="none" stroke="${TD}" stroke-width="6" stroke-linecap="round"/><path d="M44 70 Q60 94 76 70" fill="none" stroke="#FFD84A" stroke-width="3" stroke-linecap="round"/>`
      + toy(tC(60, 88, 5), ...G, {dy:1, w:2}) + tStar(60, 88, 2.4, "#FFFFFF"),
    mouth: tMouth(60, 59),
    hair: toy("M34 40 Q32 18 60 17 Q88 18 86 40 Q80 28 60 27 Q40 28 34 40Z", "#2A1E18", "#140E0A", "#000", {dy:1.5})
      + `<path d="M43 37 l10 1.5 M77 37 l-10 1.5" stroke="#1E1410" stroke-width="3" stroke-linecap="round"/>`
  });
} },
{ id:"fou", n:"Le Fou du Désert", e:"Édition jeux vidéo", p:600, toy:true, anim:"", draw(){
  const C = ["#9AE07A", "#4AA040", "#1E5A1A"];
  return tPerson({
    skin:["#FFD9C2", "#EAA080", "#000"], torso:["#F6F2E8", "#D2C8B2", "#7A705A"], shoes:["#8A6A4A", "#5A4028", "#2A1C10"], sleeve:"#EAA080",
    armR:"M92 88 Q110 82 108 64", handR:[108, 62],
    back: tGlow(100, 26, 26, "#FFC24A", .8) + toy(tC(100, 26, 10), "#FFF0A0", "#FFC23A", "#C8800A", {dy:0, w:2.4})
      + toy("M6 124 V86 Q6 78 12 78 Q18 78 18 86 V124Z", ...C, {dy:2, w:2.6}) + toy("M6 100 H0 Q-4 100 -4 94 V88 Q-4 84 0 84 Q2 84 2 88 V94 H6Z", ...C, {dy:1, w:2.2}),
    body: `<path d="M30 118 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6" fill="none" stroke="${TD}" stroke-width="2.2" stroke-linejoin="round"/>`
      + `<ellipse cx="72" cy="96" rx="7" ry="5" fill="#A88A5A" opacity=".45"/><ellipse cx="46" cy="108" rx="5" ry="3.6" fill="#A88A5A" opacity=".4"/>`
      + `<path d="M40 70 Q44 80 46 90 M80 70 Q76 80 74 90" stroke="#D2C8B2" stroke-width="3" fill="none"/>`,
    face: `<path d="M36 54 Q38 72 60 73 Q82 72 84 54 Q78 68 60 68 Q42 68 36 54Z" fill="#6A5A50" opacity=".35"/><path d="M41 36 l12 5 M79 38 l-11 2" stroke="#4A3428" stroke-width="3.2" stroke-linecap="round"/>`,
    eyes: `<g class="tblink">${tEye(49, 48, 1.2)}${tEye(71, 49, .85)}</g>`,
    mouth: `<path d="M48 58 Q60 70 72 57 Q60 62 48 58Z" fill="#B8344E" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round"/><path d="M51 59.5 h18 l-1.5 2.5 h-15z" fill="#fff"/>`,
    hair: toy(tC(34, 40, 7.5), "#6A4E3A", "#3E2C20", "#1A1008", {dy:1, w:2.4}) + toy(tC(86, 40, 7.5), "#6A4E3A", "#3E2C20", "#1A1008", {dy:1, w:2.4})
      + `<path d="M52 24 q4 -8 8 -2 M62 23 q5 -7 8 0" fill="none" stroke="#3E2C20" stroke-width="2.6" stroke-linecap="round"/>` + tShine("M44 30 Q50 24 58 23", 3, .7)
  });
} },
{ id:"analyste", n:"L'Analyste", e:"Édition séries", free:true, hint:"Finis un Chrono avec 15 bonnes réponses", toy:true, anim:"", draw(){
  const dots = [[38,90],[50,100],[70,92],[82,104],[44,114],[64,112],[78,82],[56,82]].map(([x, y]) => `<path d="M${x} ${y-3} l3 3 l-3 3 l-3 -3z" fill="#2E5A9A" opacity=".55"/>`).join("");
  return tPerson({
    skin:["#FFE8D6", "#F2BCA0", "#000"], torso:["#A8D4F4", "#5A9AD4", "#1E4A80"], shoes:["#5A4A40", "#3A2E28", "#1A1210"], sleeve:"#5A9AD4",
    gloves:["#C8F0FF", "#5AC0F0", "#1A6A9A"], armR:"M92 88 Q110 84 110 72", handR:[110, 70],
    body: dots + `<path d="M50 70 L60 80 L70 70" fill="none" stroke="#1E4A80" stroke-width="2.4"/><circle cx="60" cy="88" r="1.8" fill="#FFFFFF" stroke="${TD}"/><circle cx="60" cy="98" r="1.8" fill="#FFFFFF" stroke="${TD}"/>`,
    held: toy(tC(110, 58, 9.5), "#FF8A7A", "#E2322E", "#8A1414", {dy:2, w:2.6}) + tStar(110, 49, 4.4, "#4AC86A") + tShine("M104 54 Q105 50 108 49", 2.2, .8)
      + `<g class="ta-bubble" style="animation-delay:-.6s"><path d="M100 74 q-2 4 0 6 q2 -2 0 -6z" fill="#E2322E" stroke="${TD}" stroke-width="1.2"/></g>`,
    face: `<path d="M41 38 l11 1 M79 36 l-11 3" stroke="#5A3E2E" stroke-width="3" stroke-linecap="round"/>`,
    mouth: tMouth(62, 58, "cat"),
    hair: toy("M33 40 Q32 15 60 14 Q88 15 87 40 Q82 28 68 29 Q58 22 46 29 Q37 30 33 40Z", "#8A5E40", "#5A3A24", "#2A1A0E", {dy:2})
      + tShine("M42 26 Q50 18 62 18", 2.6, .55)
  });
} }
];
// Placement des chapeaux sur la tête (les effets autour, comme la neige ou le soleil, faussent la mesure automatique)
const STAR_HAT = { nord:{at:[60, 21], k:1}, prince:{at:[60, 23], k:1}, fou:{at:[60, 26], k:1}, analyste:{at:[60, 21], k:1} };
STAR_SKINS.forEach(s => { if (STAR_HAT[s.id]) s.hat = STAR_HAT[s.id]; if (s.id === "chimiste" || s.id === "roi") s.noHat = true; SHOP_SKINS.push(s); });
// Personnages qui ont déjà un couvre-chef : Somni (bonnet de nuit), Chevalino (casque à plumet), Lumen (auréole)
SOMNI.noHat = true;
SHOP_SKINS.concat(SECRETS_ALL()).forEach(s => { if (s.id === "his" || s.id === "lumen") s.noHat = true; });
function SECRETS_ALL(){ return (typeof SECRET_SKINS !== "undefined" ? SECRET_SKINS : []).concat(typeof ULTRA_SKIN !== "undefined" ? [ULTRA_SKIN] : []); }
