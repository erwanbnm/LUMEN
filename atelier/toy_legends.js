/* ---------- Légendes : hommages à des héros d'anime, de jeux, de films et à des stars (premier lot à valider) ----------
   Même style jouet que le Veilleur du Nord (tPerson). Noms d'hommage, sans les noms officiels. */
const LEGEND_SKINS = [
{ id:"sabreur", n:"Le Sabreur aux Trois Lames", e:"Légende · anime", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const G = ["#7FE08A", "#2E9A4A", "#0E4A1E"], HAR = ["#5AC86A", "#2A8A3E", "#0E3A18"];
  // trois sabres : poignées blanche, rouge et noire sur la hanche gauche (côté droit de l'image)
  const hilt = (x1, y1, x2, y2, c, g) => tLimb(`M${x1} ${y1} L${x2} ${y2}`, "#1E1E26", 7) + tLimb(`M${x1} ${y1} L${(x1 + (x2 - x1) * .55).toFixed(1)} ${(y1 + (y2 - y1) * .55).toFixed(1)}`, c, 7)
    + `<path d="M${(x1 + (x2 - x1) * .55).toFixed(1)} ${(y1 + (y2 - y1) * .55 - 5).toFixed(1)} v10" stroke="${TD}" stroke-width="5.5" stroke-linecap="round"/><path d="M${(x1 + (x2 - x1) * .55).toFixed(1)} ${(y1 + (y2 - y1) * .55 - 5).toFixed(1)} v10" stroke="${g}" stroke-width="3" stroke-linecap="round"/>`;
  const swords = hilt(96, 92, 118, 70, "#F4F4F8", "#E8C24A") + hilt(98, 98, 122, 82, "#C8282E", "#E8C24A") + hilt(94, 104, 120, 96, "#26262E", "#B8A060");
  return tPerson({
    skin:["#FFE0C2", "#E8A880", "#000"], torso:["#FFFFFF", "#DCDCE6", "#8A8AA0"], shoes:["#3A3A44", "#1E1E26", "#0A0A0E"], sleeve:"#DCDCE6",
    armR:"M92 88 Q112 80 118 62", handR:[118, 60],
    back: swords,
    // chemise ouverte sur le torse + haramaki vert noué à la taille
    body: `<path d="M50 70 L60 96 L70 70" fill="#E8A880" stroke="${TD}" stroke-width="2.2" stroke-linejoin="round"/><path d="M54 76 Q60 80 66 76" stroke="#B87858" stroke-width="1.6" fill="none"/>`
      + toy("M26 104 Q60 112 94 104 L95 120 Q60 128 25 120Z", ...HAR, {dy:2, w:2.4}) + `<path d="M30 110 Q60 117 90 110" stroke="#1E6A2E" stroke-width="1.6" fill="none"/>`,
    // un sabre noir tenu à la main
    held: tLimb("M118 62 L118 8", "#D8E0EA", 6) + `<path d="M118 60 L118 10" stroke="#FFFFFF" stroke-width="1.2" opacity=".8"/>` + toy(tE(118, 64, 7, 3), "#E8C24A", "#A8841A", "#4A3A0A", {dy:1, w:2}) + tLimb("M118 66 L118 80", "#26262E", 6),
    face: `<path d="M41 34 L44 40 L46 50 L48 58" stroke="#B85A4A" stroke-width="2.4" stroke-linecap="round" fill="none"/>`        // cicatrice sur l'œil gauche
      + `<path d="M40 40 l12 3 M80 40 l-12 3" stroke="#1E4A26" stroke-width="3.4" stroke-linecap="round"/>`
      + toy(tE(89, 48, 4, 6), "#FFE0C2", "#E8A880", "#000", {dy:0, w:2}) + [44, 50, 56].map(y => `<circle cx="91.5" cy="${y}" r="2.2" fill="#FFD23F" stroke="${TD}" stroke-width="1.2"/>`).join(""),  // trois boucles d'oreille dorées
    eyes: `<path d="M44 48 Q50 46 55 48" stroke="${TD}" stroke-width="3" stroke-linecap="round" fill="none"/>` + `<g class="tblink">${tEye(70, 48, .9)}</g>`,
    noBlush:true,
    mouth: `<path d="M53 60 Q60 62 67 58" fill="none" stroke="${TD}" stroke-width="2.4" stroke-linecap="round"/>`,
    hair: toy("M33 44 Q30 18 60 16 Q90 18 87 44 L84 34 L80 40 L77 28 L71 36 L67 24 L61 34 L56 22 L50 34 L46 24 L41 36 L37 30Z", ...G, {dy:2})
      + tShine("M42 26 Q50 20 60 19", 2.6, .55)
  });
} },
{ id:"fleaux", n:"Le Roi des Fléaux", e:"Légende · anime", r:"myth", noHat:true, toy:true, anim:"", draw(){
  const P = ["#FFC2CE", "#F08AA0", "#8A3A50"], tat = `stroke="#1A0A12" stroke-width="2.4" stroke-linecap="round" fill="none"`;
  const redEye = (x, y, s) => `<ellipse cx="${x}" cy="${y}" rx="${4.6 * s}" ry="${4 * s}" fill="#FFF0F0" stroke="${TD}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="${2.6 * s}" fill="#D8202E"/><ellipse cx="${x}" cy="${y}" rx=".9" ry="${2.2 * s}" fill="#1A0A12"/>`;
  return tPerson({
    skin:["#FFE2CE", "#EEAA8A", "#000"], torso:["#3A3A4E", "#1E1E2C", "#0A0A12"], shoes:["#3A3A4E", "#1E1E2C", "#0A0A12"], sleeve:"#1E1E2C",
    armL:"M28 88 Q20 76 30 66", handL:[30, 64],
    back: tGlow(60, 60, 64, "#D8202E", .5),
    // capuche rouge sous le col haut noir, boutons dorés en spirale
    body: toy("M38 70 Q60 82 82 70 L80 80 Q60 90 40 80Z", "#FF5A5A", "#C8202E", "#5A0A10", {dy:1.5, w:2.2})
      + `<path d="M60 84 V124" stroke="#0A0A12" stroke-width="2"/>` + [92, 106].map(y => `<circle cx="60" cy="${y}" r="3.4" fill="#FFD23F" stroke="${TD}" stroke-width="1.6"/><path d="M58.5 ${y} a1.5 1.5 0 1 1 1.5 1.5" stroke="#8A6400" stroke-width="1" fill="none"/>`).join(""),
    held: `<path d="M26 60 l3 -8 M31 59 l1 -9" stroke="${TD}" stroke-width="4.4" stroke-linecap="round"/><path d="M26 60 l3 -8 M31 59 l1 -9" stroke="#FFE2CE" stroke-width="2.2" stroke-linecap="round"/>`  // signe des doigts
      + `<path d="M24 70 h12 M24 74 h12" stroke="#1A0A12" stroke-width="1.8"/>`,
    // marques noires : front, joues (deux traits), menton
    face: `<path d="M50 30 Q60 26 70 30 M54 33 Q60 31 66 33" ${tat}/><path d="M37 50 h9 M37 54 h8 M83 50 h-9 M83 54 h-8" ${tat}/><path d="M56 68 h8" ${tat}/>`
      + `<path d="M40 41 l13 4 M80 41 l-13 4" stroke="#1A0A12" stroke-width="3.4" stroke-linecap="round"/>`,
    // deux paires d'yeux rouges : les yeux principaux et les petits yeux dessous
    eyes: `<g class="tblink">${redEye(49, 47, 1)}${redEye(71, 47, 1)}</g>` + redEye(44, 56, .55) + redEye(76, 56, .55),
    noBlush:true,
    mouth: `<path d="M48 60 Q60 70 72 60 Q60 64 48 60Z" fill="#7A0A1A" stroke="${TD}" stroke-width="2.2" stroke-linejoin="round"/><path d="M50 61 l2.5 2.6 l2.5 -2 l2.5 2.4 l2.5 -2 l2.5 2.4 l2.5 -2 l2.5 2.6 l2 -3" fill="#FFFFFF" stroke="${TD}" stroke-width=".9"/>`,
    // cheveux roses en pointes relevées vers l'arrière
    hair: toy("M33 46 Q28 22 44 14 L40 4 L52 12 L56 0 L62 11 L70 1 L72 13 L84 6 L80 18 Q92 26 87 46 Q82 34 76 36 Q74 26 66 28 Q60 22 54 28 Q46 26 44 36 Q38 34 33 46Z", ...P, {dy:2})
      + `<path d="M44 34 Q52 22 60 24 M60 24 Q70 20 78 32" stroke="#C86A80" stroke-width="1.8" fill="none"/>` + tShine("M40 24 Q46 14 54 13", 2.6, .55)
  });
} },
{ id:"numero7", n:"Le Numéro 7", e:"Légende · sport", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const R = ["#F4363E", "#B8101E", "#5A0008"], GR = "#0E8A3A";
  return tPerson({
    skin:["#F2C8A2", "#C88E66", "#000"], torso:R, shoes:["#FFF2B0", "#E8B820", "#8A6400"], sleeve:"#B8101E",
    // célébration : bras écartés vers le bas
    armL:"M28 88 Q12 100 6 112", handL:[5, 113], armR:"M92 88 Q108 100 114 112", handR:[115, 113],
    back: toy(tC(100, 120, 9), "#FFFFFF", "#D8D8E4", "#6A6A80", {dy:2, w:2.4}) + `<path d="M100 113 l4 4 l-2 5 h-4 l-2 -5z" fill="${TD}"/><path d="M92 119 l4 1 M108 119 l-4 1" stroke="${TD}" stroke-width="1.6"/>`,
    // col vert, bande verte, numéro 7 doré
    body: `<path d="M46 70 Q60 82 74 70" fill="none" stroke="${TD}" stroke-width="7" stroke-linecap="round"/><path d="M46 70 Q60 82 74 70" fill="none" stroke="${GR}" stroke-width="4" stroke-linecap="round"/>`
      + `<path d="M26 98 Q60 106 94 98" stroke="${GR}" stroke-width="3.4" fill="none" opacity=".85"/>`
      + `<path d="M52 86 h16 l-9 24" fill="none" stroke="${TD}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 86 h16 l-9 24" fill="none" stroke="#FFE36A" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<circle cx="78" cy="84" r="4" fill="#FFFFFF" stroke="${TD}" stroke-width="1.4"/><path d="M76 84 h4 M78 82 v4" stroke="${GR}" stroke-width="1.4"/>`,
    face: `<path d="M40 40 Q46 37 53 40 M80 40 Q74 37 67 40" stroke="#2A1A12" stroke-width="3.2" stroke-linecap="round" fill="none"/>`
      + `<path d="M40 54 Q42 68 60 71 Q78 68 80 54" fill="none" stroke="#3A2A20" stroke-width="1.4" opacity=".35"/>`,
    eyes: tEyes(50, 70, 47, .9), noBlush:true,
    mouth: `<path d="M52 58 Q60 66 68 58Z" fill="#FFFFFF" stroke="${TD}" stroke-width="2.2" stroke-linejoin="round"/>`,
    // cheveux courts dégradés sur les côtés, mèche relevée et gominée au-dessus
    hair: toy("M34 44 Q32 30 38 24 Q46 16 60 16 Q76 16 84 24 Q88 30 86 44 Q82 38 80 32 Q60 34 40 32 Q38 38 34 44Z", "#4A3628", "#2A1C14", "#0E0806", {dy:1.5})
      + toy("M40 30 Q42 12 60 8 Q78 6 84 18 Q82 26 76 28 Q60 24 44 32Z", "#5A4232", "#2A1C14", "#0E0806", {dy:1.5})
      + `<path d="M48 22 Q60 12 76 14 M52 26 Q64 18 78 20" stroke="#8A6A50" stroke-width="1.6" fill="none"/>` + tShine("M50 16 Q60 10 72 10", 2.4, .6)
      + `<path d="M35 44 Q34 36 37 30 M85 44 Q86 36 83 30" stroke="#6A5040" stroke-width="2" opacity=".6" fill="none"/>`
  });
} },
{ id:"titan", n:"Le Titan Libre", e:"Légende · anime", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const J = ["#D8A878", "#A8784A", "#4A3018"];
  return tPerson({
    skin:["#FFE2CC", "#EAAA88", "#000"], torso:J, shoes:["#6A4A32", "#3E2A1A", "#140C06"], sleeve:"#A8784A",
    armR:"M92 88 Q110 78 112 60", handR:[112, 58],
    back: toy("M14 124 C6 96 18 70 60 70 C102 70 114 96 106 124Z", "#4A8A5A", "#2A5A36", "#0E2A16", {dy:3}),
    body: `<path d="M48 70 L60 86 L72 70Z" fill="#F4F0E8" stroke="${TD}" stroke-width="2"/>`
      + `<path d="M34 76 L52 124 M86 76 L68 124 M28 100 H92" stroke="${TD}" stroke-width="5" stroke-linecap="round"/><path d="M34 76 L52 124 M86 76 L68 124 M28 100 H92" stroke="#6A4A2A" stroke-width="2.6" stroke-linecap="round"/>`
      + `<g transform="translate(72 82)"><path d="M0 0 h14 v12 q-7 5 -14 0z" fill="#F4F0E8" stroke="${TD}" stroke-width="1.6"/><path d="M7 3 q-4 2 -5 7 q3 -1 5 -4z" fill="#2A4A9A"/><path d="M7 3 q4 2 5 7 q-3 -1 -5 -4z" fill="#FFFFFF" stroke="#2A4A9A" stroke-width=".8"/></g>`,
    held: tLimb("M112 58 L116 10", "#D8E2EE", 5) + `<path d="M112.5 54 L115.6 12" stroke="#FFFFFF" stroke-width="1.2" opacity=".8"/>` + toy("M106 58 h12 v10 h-12z", "#8A8A9A", "#5A5A6A", "#1A1A22", {dy:1, w:2}),
    face: `<path d="M40 40 l13 3 M80 40 l-13 3" stroke="#3A2618" stroke-width="3.4" stroke-linecap="round"/>`,
    eyes: `<g class="tblink">${[49, 71].map(x => `<ellipse cx="${x}" cy="47" rx="4.8" ry="5.6" fill="#2BB673" stroke="${TD}" stroke-width="2"/><circle cx="${x}" cy="47" r="2.4" fill="${TD}"/><circle cx="${x + 1.6}" cy="45" r="1.5" fill="#fff"/>`).join("")}</g>`,
    noBlush:true, mouth: `<path d="M53 60 Q60 58 67 60" fill="none" stroke="${TD}" stroke-width="2.4" stroke-linecap="round"/>`,
    hair: toy("M30 60 Q24 20 60 16 Q96 20 90 60 Q86 46 84 38 Q76 30 62 30 Q58 36 50 34 Q42 36 38 44 Q34 50 30 60Z", "#6A4A34", "#3E2A1C", "#140C06", {dy:2})
      + toy(tC(60, 12, 7), "#6A4A34", "#3E2A1C", "#140C06", {dy:1, w:2.4}) + tShine("M42 26 Q50 20 60 20", 2.4, .5)
  });
} },
{ id:"shinigami", n:"Le Faucheur Orange", e:"Légende · anime", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const K = ["#3A3A48", "#1A1A24", "#000"];
  return tPerson({
    skin:["#FFE2CC", "#EAAA88", "#000"], torso:K, shoes:["#F4F0E8", "#C8C2B4", "#6A6458"], sleeve:"#1A1A24",
    armR:"M92 88 Q112 82 114 66", handR:[114, 64],
    back: `<g transform="rotate(14 112 50)">${toy("M100 -4 L126 -4 L126 70 L100 70 Q96 30 100 -4Z", "#E8EEF6", "#9AA6B8", "#2A3240", {dy:2})}<path d="M104 0 L104 66" stroke="#FFFFFF" stroke-width="2" opacity=".8"/>${tLimb("M113 70 L113 96", "#F4F0E8", 8)}<path d="M109 76 l8 4 M109 84 l8 4 M109 92 l8 4" stroke="#8A8478" stroke-width="1.4"/></g>`,
    body: `<path d="M44 70 L60 94 L76 70" fill="#F4F0E8" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/><path d="M38 70 L60 104 L82 70" fill="none" stroke="#0A0A10" stroke-width="2.6"/>`
      + toy("M26 108 Q60 116 94 108 L95 116 Q60 124 25 116Z", "#F4F0E8", "#C8C2B4", "#6A6458", {dy:1, w:2}),
    face: `<path d="M40 38 l13 5 M80 38 l-13 5" stroke="#B8541A" stroke-width="3.6" stroke-linecap="round"/><path d="M56 40 l3 3 M64 40 l-3 3" stroke="#B8541A" stroke-width="2" stroke-linecap="round"/>`,
    eyes: tEyes(50, 70, 48, .85), noBlush:true,
    mouth: `<path d="M53 61 Q60 58 67 61" fill="none" stroke="${TD}" stroke-width="2.4" stroke-linecap="round"/>`,
    hair: toy("M30 48 L26 36 L34 36 L30 22 L40 28 L40 12 L50 22 L56 6 L62 20 L72 6 L74 22 L86 12 L84 28 L94 26 L88 38 L94 46 Q88 40 84 38 Q76 30 66 32 Q58 28 50 32 Q40 32 36 40 Z", "#FFB04A", "#F07A1A", "#8A3A06", {dy:2})
      + tShine("M44 24 Q52 18 58 16", 2.4, .6)
  });
} },
{ id:"goule", n:"La Goule Masquée", e:"Légende · anime", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const tent = [[-1, "M48 92 Q20 70 6 30"], [1, "M72 92 Q100 70 114 30"], [-1, "M50 100 Q14 96 0 64"], [1, "M70 100 Q106 96 120 64"]].map(([s, d], i) => `<g class="ta-sway" style="transform-origin:60px 96px;animation-delay:${-i * .4}s"><path d="${d}" fill="none" stroke="${TD}" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#E2283A" stroke-width="6.5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#FF8A8A" stroke-width="1.6" stroke-dasharray="3 6" stroke-linecap="round"/></g>`).join("");
  return tPerson({
    skin:["#FFF0E8", "#E8C8BC", "#000"], torso:["#3A3A48", "#1E1E2A", "#000"], shoes:["#3A3A48", "#1E1E2A", "#000"], sleeve:"#1E1E2A",
    back: tent,
    body: `<path d="M50 70 L60 82 L70 70" fill="#F4F0F8" stroke="${TD}" stroke-width="2"/><path d="M60 82 V124" stroke="#000" stroke-width="2"/>`,
    // masque noir : bouche aux dents cousues, cache-œil à droite
    face: toy("M36 54 Q38 72 60 73 Q82 72 84 54 Q72 58 60 58 Q48 58 36 54Z", "#2A2A34", "#14141C", "#000", {dy:0, w:2.4})
      + `<path d="M44 62 Q60 68 76 62" fill="none" stroke="#FFFFFF" stroke-width="5"/><path d="M46 60 v5 M50 61 v5 M54 62 v5 M58 62.5 v5 M62 62.5 v5 M66 62 v5 M70 61 v5 M74 60 v5" stroke="#2A2A34" stroke-width="1.4"/>`
      + toy("M62 40 Q72 36 82 42 L80 52 Q70 54 62 50Z", "#2A2A34", "#14141C", "#000", {dy:0, w:2.2}) + `<path d="M62 44 L34 38" stroke="${TD}" stroke-width="2"/>`,
    // œil de goule : fond noir, iris rouge
    eyes: `<ellipse cx="50" cy="47" rx="5.6" ry="6" fill="#0A0A0E" stroke="${TD}" stroke-width="1.6"/><circle cx="50" cy="47" r="3.2" fill="#FF2A3A"/><circle cx="51.4" cy="45.4" r="1.2" fill="#fff"/><path d="M44 54 q2 4 0 8 M47 54 q-1 4 1 7" stroke="#C8202E" stroke-width="1.2" fill="none"/>`,
    noBlush:true, mouth:"",
    hair: toy("M32 50 Q26 18 60 15 Q94 18 88 50 L84 40 L82 46 L76 34 L72 42 L66 30 L62 40 L56 30 L50 42 L46 32 L40 44 L36 38Z", "#FFFFFF", "#D8DCE6", "#7A8090", {dy:2})
      + tShine("M42 24 Q50 19 58 19", 2.4, .9)
  });
} },
{ id:"corbeau", n:"Le Corbeau Écarlate", e:"Légende · anime", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const cloud = (x, y) => `<path d="M${x} ${y} q2 -6 8 -4 q4 -5 9 0 q6 -1 6 5 q-1 4 -6 4 h-12 q-6 0 -5 -5z" fill="#E2283A" stroke="#FFFFFF" stroke-width="1.6"/>`;
  const crow = (x, y, d) => `<g class="ta-float" style="animation-delay:${d}s"><path d="M${x} ${y} q-8 -6 -14 -2 q6 0 8 4 q-6 2 -8 6 q8 -2 14 -4 q4 2 8 0 q-4 -2 -8 -4z" fill="#14141C" stroke="${TD}" stroke-width="1"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#E2283A"/></g>`;
  const sh = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="5.4" fill="#D8101E" stroke="${TD}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="1.8" fill="#0A0A0E"/>` + [0, 120, 240].map(a => `<circle cx="${(x + 3 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(y + 3 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r=".9" fill="#0A0A0E"/>`).join("") + `<circle cx="${x + 1.6}" cy="${y - 2}" r="1" fill="#fff"/>`;
  return tPerson({
    skin:["#FFE8D6", "#E8B49A", "#000"], torso:["#2A2A36", "#14141E", "#000"], shoes:["#3A3A48", "#1E1E2A", "#000"], sleeve:"#14141E",
    back: toy("M60 28 Q96 30 100 70 Q100 90 84 96 Q92 74 84 52 Q74 40 60 38Z", "#2A2A36", "#14141C", "#000", {dy:2}) + crow(14, 30, 0) + crow(104, 18, -1.2),
    body: cloud(30, 96) + cloud(66, 110) + cloud(72, 86) + toy("M36 74 Q60 84 84 74 L84 66 Q60 76 36 66Z", "#2A2A36", "#14141E", "#000", {dy:0, w:2.4}),
    face: `<path d="M42 52 Q44 56 44 60 M78 52 Q76 56 76 60" stroke="#8A5A4A" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
      + toy("M34 30 Q60 22 86 30 L86 38 Q60 30 34 38Z", "#5A5A6A", "#2A2A36", "#000", {dy:0, w:2}) + toy("M50 28 h20 v8 h-20z", "#E8EEF6", "#9AA6B8", "#2A3240", {dy:0, w:1.8})
      + `<path d="M55 33 q5 -4 10 0 q-5 3 -10 0" fill="none" stroke="${TD}" stroke-width="1.2"/><path d="M48 32 L72 34" stroke="${TD}" stroke-width="1.8"/>`,
    eyes: sh(50, 47) + sh(70, 47), noBlush:true,
    mouth: `<path d="M55 61 h10" stroke="${TD}" stroke-width="2.2" stroke-linecap="round"/>`,
    hair: toy("M32 48 Q28 14 60 14 Q92 14 88 48 Q86 38 82 34 L74 30 L66 34 L60 28 L54 34 L46 30 L38 34 Q34 40 32 48Z", "#2A2A36", "#14141C", "#000", {dy:2})
      + `<path d="M36 36 Q34 50 38 60 M84 36 Q86 50 82 60" stroke="#14141C" stroke-width="4" fill="none" stroke-linecap="round"/>` + tShine("M44 22 Q52 17 60 17", 2.4, .45)
  });
} },
{ id:"sparte", n:"Le Fantôme de Sparte", e:"Légende · jeux vidéo", r:"myth", noHat:true, toy:true, anim:"", draw(){
  const SK = ["#F2EEE6", "#C8C2B8", "#000"], RED = "#C8202E";
  return tPerson({
    skin:SK, torso:SK, shoes:["#6A4A32", "#3E2A1A", "#140C06"], sleeve:"#C8C2B8",
    armR:"M92 88 Q110 80 112 62", handR:[112, 60],
    back: tGlow(110, 40, 30, "#8AD8FF", .5),
    // tatouage rouge sur l'épaule, sangles de cuir, bas de tunique
    body: `<path d="M28 84 Q34 74 44 72 L40 92 Q32 96 28 84Z" fill="${RED}" stroke="${TD}" stroke-width="1.6"/>`
      + `<path d="M36 72 L82 118" stroke="${TD}" stroke-width="7" stroke-linecap="round"/><path d="M36 72 L82 118" stroke="#7A4A22" stroke-width="4" stroke-linecap="round"/>`
      + toy("M26 108 Q60 116 94 108 L96 124 H24Z", "#8A2A2A", "#5A1414", "#1E0606", {dy:1, w:2.2}) + `<path d="M58 70 q-2 8 0 14" stroke="#C8C2B8" stroke-width="1.6" fill="none"/>`,
    // la hache de glace
    held: tLimb("M112 60 L108 4", "#6A4A32", 6) + toy("M106 8 Q128 2 128 20 Q122 24 112 22 Q118 16 106 14Z", "#E8F6FF", "#8AB8E0", "#2A4A7A", {dy:1.5, w:2.2}) + `<path d="M116 9 Q124 8 125 16" stroke="#FFFFFF" stroke-width="1.6" fill="none"/>`,
    face: toy("M36 54 Q34 76 60 82 Q86 76 84 54 Q78 62 70 62 Q60 60 50 62 Q42 62 36 54Z", "#7A4A2E", "#4A2A16", "#1A0E06", {dy:0, w:2.4})
      + `<path d="M52 63 Q60 61 68 63" stroke="#2A160A" stroke-width="2" fill="none"/>`
      + `<path d="M54 22 Q46 34 46 44 Q46 52 44 58" stroke="${RED}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".95"/>`   // la bande rouge du crâne à l'œil
      + `<path d="M40 40 l13 4 M80 40 l-13 4" stroke="#3A2A20" stroke-width="3.8" stroke-linecap="round"/>`,
    eyes: tEyes(50, 70, 48, .8), noBlush:true, mouth:"",
    hair: tShine("M40 30 Q48 22 60 22", 3, .7)
  });
} },
{ id:"spartiate", n:"Le Spartiate Vert", e:"Légende · jeux vidéo", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const A = ["#8AA05A", "#566A30", "#1E2A0E"];
  return tPerson({
    skin:A, torso:A, shoes:A, sleeve:"#566A30", gloves:["#4A4A52", "#2A2A30", "#000"],
    armR:"M92 88 Q104 98 96 108", handR:[94, 110],
    body: toy("M38 78 H82 L78 100 H42Z", "#A0B46A", "#6A7E3A", "#2A3812", {dy:1.5, w:2.2}) + `<path d="M60 78 V100 M42 90 H78" stroke="#3A4A1A" stroke-width="1.6"/>`
      + toy("M24 90 Q24 74 40 72 L36 92Z", "#A0B46A", "#6A7E3A", "#2A3812", {dy:1, w:2}) + toy("M96 90 Q96 74 80 72 L84 92Z", "#A0B46A", "#6A7E3A", "#2A3812", {dy:1, w:2}),
    held: toy("M36 102 H100 V112 H70 L66 120 H58 L60 112 H36Z", "#5A5A66", "#2E2E36", "#0A0A0E", {dy:1.5, w:2.2}) + `<path d="M44 106 H92" stroke="#8AD8FF" stroke-width="1.6"/>`,
    // visière dorée qui reflète
    face: toy("M38 40 Q60 32 82 40 Q84 56 72 60 Q60 62 48 60 Q36 56 38 40Z", "#FFD86A", "#E08A1A", "#6A3A00", {dy:0, w:2.6})
      + `<path d="M42 42 Q52 37 64 38" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/><path d="M70 52 Q76 50 78 44" stroke="#FFF6C8" stroke-width="2" fill="none" opacity=".6"/>`
      + `<path d="M50 66 h20" stroke="#3A4A1A" stroke-width="2"/>`,
    eyes:" ", noBlush:true, mouth:"",
    hair: toy("M40 24 Q60 16 80 24 L78 30 Q60 24 42 30Z", "#A0B46A", "#6A7E3A", "#2A3812", {dy:0, w:2}) + tShine("M44 30 Q40 40 40 48", 2.4, .5)
  });
} },
{ id:"agent", n:"L'Agent Survivant", e:"Légende · jeux vidéo", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const L = ["#9A6A42", "#6A4426", "#2A160A"];
  return tPerson({
    skin:["#FFE2CC", "#EAAA88", "#000"], torso:L, shoes:["#3A3A44", "#1E1E26", "#000"], sleeve:"#6A4426",
    armR:"M92 88 Q110 84 112 70", handR:[112, 68],
    body: toy("M30 80 Q36 66 60 70 Q84 66 90 80 Q80 72 60 76 Q40 72 30 80Z", "#F2E6D0", "#C8B494", "#6A5A3A", {dy:1.5, w:2.2})   // col en fourrure
      + `<path d="M48 76 L60 92 L72 76" fill="#3A3A44" stroke="${TD}" stroke-width="2"/><path d="M60 92 V124" stroke="#2A160A" stroke-width="2"/>`
      + `<path d="M34 88 L46 124 M86 88 L74 124" stroke="${TD}" stroke-width="5"/><path d="M34 88 L46 124 M86 88 L74 124" stroke="#2A2A30" stroke-width="2.6"/>`,
    held: toy("M108 66 H128 V72 H116 L114 80 H108Z", "#5A5A66", "#2E2E36", "#0A0A0E", {dy:1, w:2}),
    face: `<path d="M44 41 l10 2 M76 41 l-10 2" stroke="#8A6A3A" stroke-width="3" stroke-linecap="round"/>`,
    eyes: `<g class="tblink">${tEye(70, 48, .85)}</g>`, noBlush:true,
    mouth: `<path d="M54 60 Q61 62 67 59" fill="none" stroke="${TD}" stroke-width="2.2" stroke-linecap="round"/>`,
    // raie au milieu, longue mèche qui cache un œil
    hair: toy("M32 52 Q26 16 60 15 Q94 16 88 50 Q86 40 82 34 Q72 26 62 26 Q62 34 58 42 Q54 54 46 58 Q40 56 36 50 Q34 52 32 52Z", "#E8C27A", "#B8863A", "#5A3A0A", {dy:2})
      + `<path d="M60 18 Q58 30 54 40 M62 24 Q74 26 82 36" stroke="#A87A30" stroke-width="1.6" fill="none"/>` + tShine("M66 20 Q76 21 82 28", 2.4, .6)
  });
} },
{ id:"seigneur", n:"Le Seigneur Noir", e:"Légende · films", r:"myth", noHat:true, toy:true, anim:"", draw(){
  const B = ["#4A4A56", "#1A1A22", "#000"];
  return tPerson({
    skin:B, torso:B, shoes:B, sleeve:"#1A1A22", gloves:["#3A3A44", "#14141A", "#000"],
    armR:"M92 88 Q110 80 112 64", handR:[112, 62],
    back: toy("M12 124 C4 94 16 66 60 66 C104 66 116 94 108 124Z", "#2A2A34", "#0E0E14", "#000", {dy:3}) + tGlow(112, 30, 30, "#FF2A2A", .55),
    body: toy("M46 86 H74 V104 H46Z", "#5A5A66", "#2E2E36", "#0A0A0E", {dy:1, w:2}) + [["#E2283A", 50, 90], ["#2BB673", 56, 90], ["#4A8AE8", 62, 90], ["#FFD23F", 68, 90]].map(([c, x, y]) => `<rect x="${x}" y="${y}" width="4" height="4" rx="1" fill="${c}" stroke="${TD}" stroke-width=".8"/>`).join("") + `<path d="M50 98 h20 M50 101 h14" stroke="#C8C8D4" stroke-width="1.4"/>`
      + toy("M26 108 H94 V116 H26Z", "#3A3A44", "#14141A", "#000", {dy:0, w:2}) + toy("M54 106 h12 v12 h-12z", "#C8C8D4", "#8A8A9A", "#2A2A30", {dy:0, w:1.6}),
    held: `<path d="M112 62 L112 0" stroke="#FF2A2A" stroke-width="9" stroke-linecap="round" opacity=".45"/><path d="M112 62 L112 0" stroke="#FFD8D8" stroke-width="3.6" stroke-linecap="round"/>` + toy("M108 60 h8 v16 h-8z", "#C8C8D4", "#8A8A9A", "#2A2A30", {dy:1, w:1.8}),
    // casque : dôme, yeux-lentilles, grille triangulaire de la bouche
    face: toy("M34 52 Q30 70 22 76 H98 Q90 70 86 52Z", "#3A3A46", "#14141A", "#000", {dy:0, w:2.4})
      + `<path d="M44 44 Q50 38 56 44 Q50 50 44 44Z M64 44 Q70 38 76 44 Q70 50 64 44Z" fill="#14141C" stroke="#6A6A7A" stroke-width="1.4"/><path d="M47 42 l4 -1 M67 42 l4 -1" stroke="#FFFFFF" stroke-width="1.4" opacity=".7"/>`
      + `<path d="M60 48 L50 66 H70Z" fill="#5A5A66" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/><path d="M56 56 v8 M60 54 v10 M64 56 v8" stroke="#14141A" stroke-width="1.4"/>`,
    eyes:" ", noBlush:true, mouth:"",
    hair: toy("M30 54 Q26 16 60 14 Q94 16 90 54 Q84 40 60 38 Q36 40 30 54Z", ...B, {dy:2}) + tShine("M42 26 Q50 18 62 18", 3, .55)
  });
} },
{ id:"clown", n:"Le Clown du Chaos", e:"Légende · films", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const P = ["#9A5AD8", "#5A2A9A", "#1E0A3A"];
  return tPerson({
    skin:["#FFFFFF", "#DCDCE6", "#000"], torso:P, shoes:["#3A3A44", "#1E1E26", "#000"], sleeve:"#5A2A9A",
    armR:"M92 88 Q110 82 112 66", handR:[112, 64],
    body: `<path d="M44 70 L60 100 L76 70" fill="#4AB86A" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/><path d="M52 70 L60 84 L68 70" fill="#FF9A2A" stroke="${TD}" stroke-width="1.6"/>`
      + `<path d="M56 76 L60 84 L64 76 L60 72Z" fill="#2A8A4A" stroke="${TD}" stroke-width="1.4"/>`,
    held: `<g transform="rotate(14 112 54)">${toy("M104 40 h16 v24 h-16z", "#FFFFFF", "#E8E8F0", "#6A6A80", {dy:1, w:2})}<text x="106.5" y="49" font-size="7" font-weight="900" fill="#E2283A" font-family="sans-serif">J</text><path d="M112 54 l3 4 l-3 4 l-3 -4z" fill="#E2283A"/></g>`,
    face: `<path d="M42 40 Q48 38 54 42 L52 52 Q46 54 42 48Z M78 40 Q72 38 66 42 L68 52 Q74 54 78 48Z" fill="#3A2A5A" opacity=".55"/>`
      + `<path d="M40 38 l14 5 M80 38 l-14 5" stroke="#2A6A3A" stroke-width="3" stroke-linecap="round"/>`,
    eyes: tEyes(49, 71, 47, .8), noBlush:true,
    // grand sourire rouge
    mouth: `<path d="M40 56 Q60 74 80 56 Q74 60 66 60 Q60 62 54 60 Q46 60 40 56Z" fill="#E2283A" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/><path d="M48 59 Q60 66 72 59 Q60 62 48 59Z" fill="#FFFFFF" stroke="${TD}" stroke-width="1"/>`,
    hair: toy("M32 46 Q26 12 60 12 Q94 12 88 46 Q86 30 76 24 Q68 30 60 22 Q52 30 44 24 Q34 30 32 46Z", "#7AE07A", "#2E9A3E", "#0E3A12", {dy:2})
      + `<path d="M46 16 Q56 12 66 16 M50 20 Q60 16 72 22" stroke="#1E7A2A" stroke-width="1.6" fill="none"/>` + tShine("M42 22 Q50 15 58 14", 2.4, .6)
  });
} },
{ id:"pirate", n:"Le Capitaine Sans Navire", e:"Légende · films", r:"leg", toy:true, anim:"", draw(){
  const V = ["#8A6A4A", "#5A4028", "#1E140A"];
  const dread = x => `<path d="M${x} 46 Q${x - 2} 62 ${x + 1} 76" stroke="${TD}" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M${x} 46 Q${x - 2} 62 ${x + 1} 76" stroke="#4A3626" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="${x}" cy="${68}" r="2" fill="#E8C24A" stroke="${TD}" stroke-width="1"/>`;
  return tPerson({
    skin:["#F2C8A2", "#C88E66", "#000"], torso:["#F4F0E4", "#D4CCB8", "#6A6250"], shoes:V, sleeve:"#D4CCB8",
    armR:"M92 88 Q108 80 110 66", handR:[110, 64],
    back: dread(32) + dread(88) + dread(36),
    body: toy("M28 76 Q44 70 48 82 L44 124 H28Z", ...V, {dy:1, w:2}) + toy("M92 76 Q76 70 72 82 L76 124 H92Z", ...V, {dy:1, w:2})
      + toy("M30 104 Q60 112 90 104 L91 112 Q60 120 29 112Z", "#E2283A", "#A8101E", "#4A0008", {dy:1, w:2}) + toy("M54 104 h12 v10 h-12z", "#FFD86A", "#C8962A", "#4A3A0A", {dy:0, w:1.6}),
    held: toy(tC(110, 60, 7), "#E8C24A", "#A8841A", "#4A3A0A", {dy:1, w:2}) + `<circle cx="110" cy="60" r="4" fill="#FFF6DE" stroke="${TD}" stroke-width="1"/><path d="M110 60 l2 -3" stroke="#E2283A" stroke-width="1.4"/>`,
    face: `<path d="M44 44 Q50 41 55 44 M65 44 Q70 41 76 44" stroke="#14141C" stroke-width="2.6" fill="none"/><path d="M44 50 Q50 53 55 50 M65 50 Q70 53 76 50" stroke="#14141C" stroke-width="2" fill="none"/>`
      + `<path d="M48 58 Q54 54 60 57 Q66 54 72 58" stroke="#3A2618" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M57 66 Q56 74 58 76 M63 66 Q64 74 62 76" stroke="#3A2618" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="58" cy="76" r="1.6" fill="#E8C24A"/><circle cx="62" cy="76" r="1.6" fill="#E8C24A"/>`,
    eyes: tEyes(50, 70, 47, .8), noBlush:true,
    mouth: `<path d="M53 61 Q60 65 67 61" fill="#FFFFFF" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/><rect x="62" y="61.5" width="3" height="2.4" fill="#E8C24A"/>`,
    hair: toy("M34 40 Q34 24 60 22 Q86 24 86 40 Q60 32 34 40Z", "#E2283A", "#A8101E", "#4A0008", {dy:1, w:2.2})   // bandana rouge
      + toy("M18 30 Q22 14 60 10 Q98 14 102 30 Q92 26 86 30 Q74 18 60 18 Q46 18 34 30 Q28 26 18 30Z", "#6A4A2E", "#3E2A18", "#140C06", {dy:2})   // tricorne
      + toy("M30 30 Q60 4 90 30 Q60 20 30 30Z", "#7A5636", "#4A3220", "#140C06", {dy:0, w:2}) + tShine("M40 22 Q52 12 64 12", 2.2, .5)
  });
} },
{ id:"pulga", n:"La Pulga", e:"Légende · sport", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const SKY = "#8AC8F0";
  return tPerson({
    skin:["#F4CFB0", "#D49A78", "#000"], torso:["#FFFFFF", "#DCE4EE", "#6A7A90"], shoes:["#FFD86A", "#E0A82A", "#6A4A00"], sleeve:"#DCE4EE",
    armL:"M28 88 Q18 80 20 64", handL:[20, 62], armR:"M92 88 Q108 86 110 74", handR:[110, 72],
    // maillot à rayures bleu ciel et blanches, numéro 10
    body: [36, 52, 68, 84].map(x => `<path d="M${x} 72 Q${x + 1} 98 ${x} 124" stroke="${SKY}" stroke-width="8" fill="none"/>`).join("") + `<path d="M24 118 C18 92 28 70 60 68 C92 70 102 92 96 118" fill="none" stroke="${TD}" stroke-width="3"/>`
      + `<text x="60" y="104" text-anchor="middle" font-size="20" font-weight="900" fill="#1A2A5A" stroke="#FFFFFF" stroke-width="1" font-family="sans-serif">10</text>`,
    // le trophée doré levé au-dessus de la tête
    held: `<g transform="translate(110 46) scale(.7) translate(-60 -20)">` + toy("M50 22 Q46 8 52 0 H68 Q74 8 70 22 Q66 30 64 34 H56 Q54 30 50 22Z", "#FFF0A0", "#E8B820", "#8A6400", {dy:1, w:2.2}) + toy("M52 34 H68 V40 H52Z", "#2BB673", "#1E7A4A", "#0A3A1E", {dy:0, w:1.8}) + `<path d="M56 6 Q54 16 58 26" stroke="#FFFFFF" stroke-width="2" fill="none" opacity=".8"/></g>`,
    face: toy("M36 52 Q36 76 60 77 Q84 76 84 52 Q80 62 72 64 Q60 60 48 64 Q40 62 36 52Z", "#7A5236", "#4A2E1A", "#1A0E06", {dy:0, w:2.2})
      + `<path d="M42 40 Q48 38 54 40 M66 40 Q72 38 78 40" stroke="#3A2618" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    eyes: tEyes(50, 70, 47, .85), noBlush:true,
    mouth: `<path d="M53 62 Q60 68 67 62Z" fill="#FFFFFF" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/>`,
    hair: toy("M33 48 Q28 26 40 22 Q50 14 62 16 Q80 14 86 26 Q90 36 87 48 Q84 36 78 32 Q66 30 56 34 Q44 30 38 36 Q34 42 33 48Z", "#7A5236", "#4A2E1A", "#1A0E06", {dy:2}) + tShine("M44 24 Q54 18 64 19", 2.2, .5)
  });
} },
{ id:"notorious", n:"Le Notorious", e:"Légende · sport", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const SK = ["#FFE0C8", "#E8A684", "#000"];
  return tPerson({
    skin:SK, torso:SK, shoes:["#FFFFFF", "#D8D8E4", "#6A6A80"], sleeve:"#E8A684", gloves:["#3A3A44", "#14141A", "#000"],
    armL:"M28 88 Q18 80 24 70", handL:[24, 68], armR:"M92 88 Q102 80 96 70", handR:[96, 68],
    // tatouages sur le torse, short aux couleurs de l'Irlande
    body: `<path d="M44 82 Q50 76 56 82 Q54 92 46 92 Q40 88 44 82Z M48 84 l4 4" fill="none" stroke="#3A4A6A" stroke-width="2"/><path d="M68 80 q8 -4 12 4 q-2 8 -10 6 M70 84 q4 0 6 4" fill="none" stroke="#3A4A6A" stroke-width="2"/>`
      + `<path d="M48 98 q2 -2 4 0 M66 98 q2 -2 4 0" stroke="#C88A6A" stroke-width="1.6" fill="none"/>`
      + toy("M24 108 Q60 114 96 108 L96 126 H24Z", "#FFFFFF", "#DCDCE6", "#6A6A80", {dy:1, w:2.2}) + `<path d="M26 112 H44 V126 H26Z" fill="#2BB673"/><path d="M76 112 H94 V126 H76Z" fill="#FF9A2A"/><path d="M24 108 Q60 114 96 108" stroke="${TD}" stroke-width="2.4" fill="none"/>`,
    face: toy("M36 52 Q34 78 60 80 Q86 78 84 52 Q80 62 72 64 Q60 60 48 64 Q40 62 36 52Z", "#B8642E", "#7A3A14", "#2A1206", {dy:0, w:2.4})
      + `<path d="M48 60 Q60 56 72 60" stroke="#7A3A14" stroke-width="3" fill="none"/><path d="M41 40 l13 3 M79 40 l-13 3" stroke="#5A2A10" stroke-width="3.4" stroke-linecap="round"/>`,
    eyes: tEyes(50, 70, 48, .8), noBlush:true,
    mouth: `<path d="M54 66 Q60 69 66 65" fill="none" stroke="${TD}" stroke-width="2.2" stroke-linecap="round"/>`,
    hair: toy("M34 40 Q32 22 50 18 Q60 12 74 16 Q86 20 86 40 Q82 30 76 30 Q62 26 46 30 Q38 32 34 40Z", "#8A4A22", "#5A2A10", "#1E0A02", {dy:1.5})
      + `<path d="M48 22 Q60 16 76 20" stroke="#B8642E" stroke-width="1.6" fill="none"/>` + tShine("M50 18 Q60 14 70 15", 2.2, .5)
  });
} },
{ id:"empereur", n:"L'Empereur", e:"Légende · histoire", r:"myth", toy:true, anim:"", draw(){
  const BL = ["#3A5AB8", "#1E3478", "#0A1238"], GO = ["#FFF0A0", "#E8B820", "#8A6400"];
  return tPerson({
    skin:["#FFE6D2", "#EEB496", "#000"], torso:BL, shoes:["#3A3A44", "#1E1E26", "#000"], sleeve:"#1E3478",
    armL:"M28 88 Q40 98 50 96", handL:[52, 95],   // la main glissée dans le gilet
    body: toy("M44 70 L60 74 L76 70 L72 124 H48Z", "#FFFFFF", "#E2E2EA", "#7A7A90", {dy:0, w:2}) + [86, 98, 110].map(y => `<circle cx="66" cy="${y}" r="1.8" fill="#FFD23F" stroke="${TD}" stroke-width="1"/>`).join("")
      + toy("M22 80 Q26 70 40 70 L38 82 Q30 86 22 80Z", ...GO, {dy:1, w:2}) + toy("M98 80 Q94 70 80 70 L82 82 Q90 86 98 80Z", ...GO, {dy:1, w:2})
      + `<path d="M24 82 v6 M28 83 v7 M32 84 v6 M96 82 v6 M92 83 v7 M88 84 v6" stroke="#E8B820" stroke-width="1.8"/>`
      + `<path d="M48 70 L44 124 M72 70 L76 124" stroke="#E8B820" stroke-width="2"/>`,
    face: `<path d="M42 41 l11 2 M78 41 l-11 2" stroke="#3A2618" stroke-width="3" stroke-linecap="round"/>`,
    eyes: tEyes(50, 70, 48, .85), noBlush:true,
    mouth: `<path d="M54 61 h12" stroke="${TD}" stroke-width="2.2" stroke-linecap="round"/>`,
    hair: toy("M34 44 Q32 26 46 24 Q50 34 56 30 Q54 38 50 40 Q42 38 36 46Z", "#4A3428", "#2A1C14", "#0A0604", {dy:1})
      // le bicorne porté en travers, avec la cocarde tricolore
      + toy("M10 28 Q30 4 60 2 Q90 4 110 28 Q86 22 60 24 Q34 22 10 28Z", "#2A2A34", "#0E0E14", "#000", {dy:2.5})
      + `<path d="M14 27 Q60 18 106 27" stroke="#E8B820" stroke-width="2.4" fill="none"/>`
      + `<circle cx="78" cy="14" r="6" fill="#E2283A" stroke="${TD}" stroke-width="1.6"/><circle cx="78" cy="14" r="4" fill="#FFFFFF"/><circle cx="78" cy="14" r="2" fill="#2A4A9A"/>`
  });
} },
{ id:"dragon", n:"Le Petit Dragon", e:"Légende · histoire", r:"leg", noHat:true, toy:true, anim:"", draw(){
  const Y = ["#FFE84A", "#F2C21A", "#8A6A00"];
  return tPerson({
    skin:["#F8DCC0", "#DCA67E", "#000"], torso:Y, shoes:["#FFE84A", "#F2C21A", "#8A6A00"], sleeve:"#F2C21A",
    armL:"M28 88 Q14 82 10 70", handL:[10, 68], armR:"M92 88 Q106 82 110 66", handR:[110, 64],
    // combinaison jaune à bandes noires
    body: `<path d="M26 92 C30 80 34 72 40 70 M94 92 C90 80 86 72 80 70" stroke="#14141C" stroke-width="5" fill="none"/><path d="M24 116 C26 104 28 96 30 90 M96 116 C94 104 92 96 90 90" stroke="#14141C" stroke-width="5" fill="none"/>`
      + `<path d="M50 72 L60 82 L70 72" fill="none" stroke="#14141C" stroke-width="2.4"/>`,
    // nunchaku
    held: tLimb("M110 64 L118 30", "#14141C", 7) + tLimb("M118 30 Q124 24 120 20", "#A8A8B4", 2.6) + tLimb("M120 20 L104 2", "#14141C", 7) + `<path d="M112 58 L117 36" stroke="#FFE84A" stroke-width="1.4"/>`,
    face: `<path d="M40 38 l14 6 M80 38 l-14 6" stroke="#14141C" stroke-width="3.6" stroke-linecap="round"/><path d="M56 40 l3 3 M64 40 l-3 3" stroke="#B8845A" stroke-width="1.6"/>`,
    eyes: tEyes(50, 70, 48, .8), noBlush:true,
    mouth: `<path d="M53 58 Q60 54 67 58 Q66 66 60 66 Q54 66 53 58Z" fill="#8A1A2A" stroke="${TD}" stroke-width="2.2" stroke-linejoin="round"/><path d="M54 58.6 h12" stroke="#FFFFFF" stroke-width="2.2"/>`,
    hair: toy("M33 46 Q30 18 60 16 Q90 18 87 46 Q86 36 80 32 Q74 36 66 32 Q60 38 54 32 Q46 36 40 32 Q34 36 33 46Z", "#2A2A34", "#14141C", "#000", {dy:2}) + tShine("M44 24 Q52 19 60 19", 2.4, .5)
  });
} },
{ id:"pop", n:"Le Roi de la Pop", e:"Légende · musique", r:"myth", toy:true, anim:"", draw(){
  const BK = ["#3A3A48", "#16161E", "#000"];
  const sparkle = [[36, 84], [44, 100], [80, 90], [74, 108], [88, 112], [32, 112]].map(([x, y], i) => `<g class="ta-twinkle" style="animation-delay:${-i * .3}s">${tStar(x, y, 2.6, "#FFFFFF")}</g>`).join("");
  return tPerson({
    skin:["#F4D6BE", "#D8A888", "#000"], torso:BK, shoes:["#2A2A34", "#0E0E14", "#000"], sleeve:"#16161E",
    armR:"M92 88 Q110 78 112 58", handR:[112, 56], gloves:["#FFFFFF", "#DCDCE6", "#6A6A80"],
    back: tGlow(112, 52, 18, "#FFFFFF", .8),
    body: `<path d="M50 70 L60 90 L70 70" fill="#FFFFFF" stroke="${TD}" stroke-width="2"/><path d="M50 70 L60 76 L70 70" fill="#E2283A" stroke="${TD}" stroke-width="1.4"/>` + sparkle
      + `<path d="M28 118 h20 M72 118 h20" stroke="#FFFFFF" stroke-width="4" opacity=".9"/>`,
    face: `<path d="M44 40 Q50 38 55 41 M76 40 Q70 38 65 41" stroke="#1A0E0A" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
    eyes: tEyes(50, 70, 47, .8), noBlush:true,
    mouth: `<path d="M54 60 Q60 64 66 60" fill="#C84A5A" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/>`,
    // boucles noires sur le front, fedora noir à ruban blanc
    hair: `<path d="M38 34 Q34 46 38 56 Q42 50 40 44 M44 32 Q44 44 46 48" stroke="#14141C" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M82 34 Q86 46 82 56" stroke="#14141C" stroke-width="4" fill="none" stroke-linecap="round"/>`
      + toy(tE(60, 30, 38, 6.5), "#3A3A48", "#16161E", "#000", {dy:2}) + toy("M40 30 Q38 6 60 6 Q82 6 80 30Z", "#3A3A48", "#16161E", "#000", {dy:0})
      + `<path d="M40.5 23 Q60 26 79.5 23 L80 28.5 Q60 31.5 40 28.5Z" fill="#FFFFFF" stroke="${TD}" stroke-width="1.8"/>` + tShine("M46 18 Q48 10 58 9", 2.4, .45)
  });
} }
];
