/* ---------- Les 8 personnages du Portail (style jouet) ----------
   Des clins d'œil à de grands héros de BD, de mangas et de jeux, réinventés en personnages Lumen originaux
   (pas de logos, pas de noms déposés). Ils ne s'obtiennent qu'en réussissant le défi du Portail : tirés au sort.
   Utilise tPerson() de toy_stars.js. */
const PORTAL_SKINS = [
{ id:"tisseur", n:"Le Tisseur", noHat:false, draw(){
  const web = `<path d="M60 22 V70 M36 34 Q60 46 84 34 M34 52 Q60 62 86 52 M40 26 L60 46 L80 26 M33 46 L60 46 L87 46" fill="none" stroke="#7A0E1E" stroke-width="1.4" opacity=".75"/>`;
  return tPerson({
    skin:["#FF6A6A", "#D8202E", "#7A0E1E"], torso:["#FF6A6A", "#D8202E", "#7A0E1E"], shoes:["#FF6A6A", "#D8202E", "#7A0E1E"], sleeve:"#2E5AD8",
    armR:"M92 88 Q110 80 112 62", handR:[112, 60],
    back: `<path d="M112 60 L118 -4" stroke="#FFFFFF" stroke-width="2.4" opacity=".85"/><path d="M112 60 L104 -4 M112 60 L126 4" stroke="#FFFFFF" stroke-width="1.2" opacity=".5"/>`,
    body: `<path d="M28 96 Q30 80 40 74 L46 104 Q40 116 30 116Z M92 96 Q90 80 80 74 L74 104 Q80 116 90 116Z" fill="#2E5AD8" stroke="${TD}" stroke-width="2"/>`
      + `<path d="M60 72 V124 M44 84 Q60 92 76 84 M40 100 Q60 108 80 100" fill="none" stroke="#7A0E1E" stroke-width="1.3" opacity=".6"/>`,
    face: web,
    eyes: `<g class="tblink"><path d="M38 42 Q44 32 56 44 Q50 54 40 50Z" fill="#FFFFFF" stroke="${TD}" stroke-width="3" stroke-linejoin="round"/><path d="M82 42 Q76 32 64 44 Q70 54 80 50Z" fill="#FFFFFF" stroke="${TD}" stroke-width="3" stroke-linejoin="round"/></g>`,
    mouth: "", noBlush:true
  });
} },
{ id:"nuit", n:"Le Gardien de la Nuit", noHat:true, draw(){
  const D = ["#5A5A6E", "#30303E", "#121218"];
  return tPerson({
    skin:["#FFE2CC", "#F2B494", "#000"], torso:["#7A7A90", "#4A4A5E", "#1E1E2A"], shoes:D, sleeve:"#30303E", gloves:D,
    back: toy("M14 124 C2 104 10 70 60 70 C110 70 118 104 106 124 L96 116 L86 124 L76 116 L60 124 L44 116 L34 124 L24 116Z", ...D, {dy:3}),
    body: `<rect x="30" y="104" width="60" height="7" rx="3" fill="#FFD84A" stroke="${TD}" stroke-width="2"/>` + toy(tE(60, 88, 13, 7), "#FFF0A0", "#F2C232", "#8A6A0A", {dy:0, w:2})
      + `<path d="M54 88 a6.5 6.5 0 1 0 12 -3 a5 5 0 1 1 -12 3z" fill="${TD}"/>`,
    face: toy("M32 52 Q30 18 36 8 L44 22 Q60 18 76 22 L84 8 Q90 18 88 52 Q84 46 76 46 Q60 42 44 46 Q36 46 32 52Z", ...D, {dy:2}),
    eyes: `<g class="tblink"><path d="M41 40 Q49 35 56 40 Q49 45 41 40Z" fill="#FFFFFF" stroke="${TD}" stroke-width="2.4"/><path d="M79 40 Q71 35 64 40 Q71 45 79 40Z" fill="#FFFFFF" stroke="${TD}" stroke-width="2.4"/></g>`,
    mouth: `<path d="M54 61 Q60 59 66 61" fill="none" stroke="${TD}" stroke-width="2.4" stroke-linecap="round"/>`,
    front: tStar(14, 14, 3, "#FFFFFF", "ta-twinkle") + tStar(104, 10, 2.4, "#FFFFFF", "ta-twinkle")
  });
} },
{ id:"renard", n:"Le Ninja Renard", noHat:true, draw(){
  const O = ["#FFB36A", "#F27A1E", "#9A4410"];
  const spikes = "M30 44 L24 20 L38 30 L40 8 L50 24 L58 2 L66 22 L76 6 L80 26 L94 16 L90 40 Q76 26 60 26 Q42 26 30 44Z";
  return tPerson({
    skin:["#FFE4CE", "#F2B494", "#000"], torso:O, shoes:["#5A6AD8", "#2E3A98", "#141A5A"], sleeve:"#F27A1E",
    back: `<g class="ta-sway" style="transform-origin:96px 110px">${toy("M90 112 Q118 104 118 76 Q112 92 100 92 Q108 84 104 70 Q98 92 88 100Z", ...O, {dy:2})}${toy("M106 72 Q110 66 112 72 Q114 80 108 82Z", "#FFFFFF", "#E8E8F0", "#8A8AA0", {dy:0, w:2})}</g>`,
    body: `<path d="M26 92 Q30 74 44 70 L50 82 Q38 84 30 96Z M94 92 Q90 74 76 70 L70 82 Q82 84 90 96Z" fill="#2A2A3A" stroke="${TD}" stroke-width="2"/><path d="M60 72 V124" stroke="#9A4410" stroke-width="2.4"/>`
      + `<path d="M54 78 h12" stroke="${TD}" stroke-width="3" stroke-linecap="round"/>`,
    face: `<path d="M38 54 l-7 -1 M38 58 l-7 1 M38 62 l-6 3 M82 54 l7 -1 M82 58 l7 1 M82 62 l6 3" stroke="#8A5A40" stroke-width="2" stroke-linecap="round"/>`,
    eyes: `<g class="tblink">${tEye(50, 49, 1)}${tEye(70, 49, 1)}</g>`,
    mouth: tMouth(60, 61),
    hair: toy(spikes, "#FFE86A", "#F2C21E", "#9A700A", {dy:2})
      + toy("M32 34 Q60 26 88 34 L88 42 Q60 34 32 42Z", "#5A6AD8", "#2E3A98", "#141A5A", {dy:0, w:2.4})
      + toy("M48 31 Q60 28 72 31 L72 38 Q60 35 48 38Z", "#E8EEF8", "#9AA4B8", "#4E5870", {dy:0, w:2}) + `<circle cx="51" cy="34.5" r="1" fill="${TD}"/><circle cx="69" cy="34.5" r="1" fill="${TD}"/>`
  });
} },
{ id:"dore", n:"Le Guerrier Doré", noHat:true, draw(){
  const hair = "M28 46 L10 30 L30 30 L14 6 L40 22 L44 -4 L58 18 L72 -6 L76 20 L100 4 L88 30 L110 28 L92 46 Q76 26 60 26 Q42 26 28 46Z";
  return tPerson({
    skin:["#FFE2CC", "#F2B494", "#000"], torso:["#FFB36A", "#F27A1E", "#9A4410"], shoes:["#5A6AD8", "#2E3A98", "#141A5A"], sleeve:"#2E3A98",
    back: tGlow(60, 60, 64, "#FFE36A", .75) + [[8,70,0],[110,60,-.6],[16,30,-1.2],[104,100,-1.8]].map(([x, y, d]) => `<g class="ta-spore" style="animation-delay:${d}s"><path d="M${x} ${y} l3 -8 l3 8 l-3 -3z" fill="#FFF6A0" stroke="${TD}" stroke-width="1.2"/></g>`).join(""),
    body: `<path d="M44 70 L60 92 L76 70" fill="#2E3A98" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round"/><rect x="28" y="104" width="64" height="8" rx="3" fill="#2E3A98" stroke="${TD}" stroke-width="2"/>`,
    face: `<path d="M41 38 l12 4 M79 38 l-12 4" stroke="#C8901A" stroke-width="3.2" stroke-linecap="round"/>`,
    eyes: `<g class="tblink">${tEye(50, 49, .95).replace(/fill="#2B1D3A"/, 'fill="#1E7A6A"')}${tEye(70, 49, .95).replace(/fill="#2B1D3A"/, 'fill="#1E7A6A"')}</g>`,
    mouth: `<path d="M54 60 Q60 63 66 59" fill="none" stroke="${TD}" stroke-width="2.4" stroke-linecap="round"/>`,
    hair: `<g class="ta-pulse">${toy(hair, "#FFF6A0", "#FFD21E", "#A8740A", {dy:2})}</g>`
  });
} },
{ id:"sorcier", n:"L'Apprenti Sorcier", hat:{at:[60, 21], k:1}, draw(){
  const R = "#B8243A", G = "#F2C232";
  return tPerson({
    skin:["#FFE6D4", "#F0B79C", "#000"], torso:["#4A4458", "#2A2436", "#100C18"], shoes:["#3A3440", "#1E1A24", "#0A080E"], sleeve:"#2A2436",
    armR:"M92 88 Q108 84 110 70", handR:[110, 68],
    held: `<path d="M110 66 L122 34" stroke="${TD}" stroke-width="6" stroke-linecap="round"/><path d="M110 66 L122 34" stroke="#8A5A30" stroke-width="3" stroke-linecap="round"/>` + tStar(123, 30, 5, "#FFF6A0", "ta-twinkle"),
    body: `<path d="M38 70 Q60 82 82 70 L84 80 Q60 92 36 80Z" fill="${R}" stroke="${TD}" stroke-width="2.2"/>`
      + `<path d="M40 78 L36 104 L46 104 L48 80Z" fill="${R}" stroke="${TD}" stroke-width="2.2"/><path d="M38 86 h9 M37 94 h9" stroke="${G}" stroke-width="3"/>`
      + `<path d="M44 74 l4 2 M54 77 l4 1 M66 77 l4 -1 M76 74 l4 -2" stroke="${G}" stroke-width="3"/>`,
    eyes: tEyes(50, 70, 48, .85) + `<circle cx="50" cy="48" r="8.5" fill="#FFFFFF" fill-opacity=".15" stroke="${TD}" stroke-width="2.6"/><circle cx="70" cy="48" r="8.5" fill="#FFFFFF" fill-opacity=".15" stroke="${TD}" stroke-width="2.6"/><path d="M58.5 48 h3" stroke="${TD}" stroke-width="2.6"/>`,
    mouth: tMouth(60, 60),
    hair: toy("M32 42 Q28 14 60 13 Q92 14 88 42 Q86 30 80 30 L76 36 L72 26 L66 32 L60 24 L54 32 L48 26 L44 34 Q36 30 32 42Z", "#3A302E", "#1E1816", "#000", {dy:2})
  });
} },
{ id:"paille", n:"Le Capitaine de Paille", noHat:true, draw(){
  const S2 = ["#FFF0A0", "#F2C24A", "#9A740A"];
  return tPerson({
    skin:["#FFE0C8", "#F0AE8C", "#000"], torso:["#FF7A6A", "#E2322E", "#8A1414"], shoes:["#C89A6A", "#8A5E3A", "#3E2614"], sleeve:"#F0AE8C",
    armR:"M92 88 Q112 70 120 48", handR:[121, 46],
    body: `<path d="M50 70 L56 124 M70 70 L64 124" stroke="${TD}" stroke-width="2"/><path d="M52 72 Q60 76 68 72 L64 124 H56Z" fill="#FFE0C8" stroke="${TD}" stroke-width="2"/>`
      + `<rect x="27" y="112" width="66" height="10" rx="3" fill="#5A7AE0" stroke="${TD}" stroke-width="2"/>`,
    face: `<path d="M44 55 l5 3 M44 58 l5 -3" stroke="#B8443A" stroke-width="1.6" stroke-linecap="round"/>`,
    mouth: `<path d="M50 58 Q60 70 70 58Z" fill="#B8344E" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round"/><path d="M52 59 h16 l-1 2 h-14z" fill="#fff"/>`,
    hair: toy("M34 40 Q32 22 60 21 Q88 22 86 40 L80 34 L76 40 L70 33 L62 40 L56 33 L48 40 L42 33Z", "#3A302E", "#1E1816", "#000", {dy:1.5})
      + toy(tE(60, 28, 40, 7.5), ...S2, {dy:2}) + toy("M40 28 Q40 6 60 6 Q80 6 80 28Z", ...S2, {dy:0})
      + `<path d="M40.5 22 Q60 25 79.5 22 L80 27.5 Q60 30.5 40 27.5Z" fill="#E2322E" stroke="${TD}" stroke-width="2"/>`
      + `<path d="M46 12 l4 4 M56 9 l3 5 M68 10 l-2 5 M76 15 l-4 3" stroke="#C8962A" stroke-width="1.6" stroke-linecap="round"/>`
  });
} },
{ id:"plombier", n:"Le Plombier Moustachu", noHat:true, draw(){
  const B = ["#7A9AF0", "#3A5AD0", "#1A2A80"];
  return tPerson({
    skin:["#FFE0C8", "#F2B090", "#000"], torso:["#FF7A6A", "#E2322E", "#8A1414"], shoes:["#9A6A40", "#6A4020", "#2E1A0A"], sleeve:"#E2322E", gloves:["#FFFFFF", "#E0E0EA", "#8A8AA0"],
    body: toy("M34 94 Q36 84 44 84 L44 76 L50 76 L50 92 L70 92 L70 76 L76 76 L76 84 Q84 84 86 94 L94 118 Q92 126 84 126 H36 Q28 126 26 118Z", ...B, {dy:0, w:2.6})
      + toy(tC(47, 88, 4), "#FFF0A0", "#F2C232", "#8A6A0A", {dy:0, w:2}) + toy(tC(73, 88, 4), "#FFF0A0", "#F2C232", "#8A6A0A", {dy:0, w:2}),
    face: toy(tC(60, 52, 6.5), "#FFC8B0", "#F09A80", "#000", {dy:0, w:2.4}),
    mouth: toy("M40 60 Q46 54 54 58 Q60 54 66 58 Q74 54 80 60 Q74 66 66 62 Q60 66 54 62 Q46 66 40 60Z", "#4A3428", "#2A1A10", "#000", {dy:0, w:2.2}),
    hair: toy("M30 36 Q30 12 60 11 Q90 12 92 32 L100 38 Q102 42 96 42 L32 40Z", "#FF6A5A", "#E2322E", "#8A1414", {dy:2})
      + toy(tC(60, 24, 7), "#FFFFFF", "#E0E0EA", "#8A8AA0", {dy:0, w:2.2}) + tStar(60, 24, 4.2, "#E2322E")
  });
} },
{ id:"fer", n:"L'Armure Écarlate", noHat:true, draw(){
  const R = ["#FF7A6A", "#D8202E", "#7A0E1E"], G = ["#FFF0A0", "#F2C232", "#8A6A0A"];
  return tPerson({
    skin:R, torso:R, shoes:G, sleeve:"#D8202E", gloves:G,
    armR:"M92 88 Q110 84 114 70", handR:[114, 68],
    held: `<g class="ta-pulse">${tGlow(116, 64, 14, "#8AF0FF", .9)}</g>`,
    body: `<g class="ta-pulse">${tGlow(60, 90, 20, "#8AF0FF", .9)}</g>` + toy(tC(60, 90, 8), "#E8FFFF", "#8AF0FF", "#1A7A9A", {dy:0, w:2.4})
      + toy("M38 100 Q60 110 82 100 L80 112 Q60 120 40 112Z", ...G, {dy:0, w:2.2}),
    face: toy("M40 40 Q40 30 60 30 Q80 30 80 40 L78 62 Q60 72 42 62Z", ...G, {dy:0, w:2.4}) + `<path d="M50 64 h20" stroke="${TD}" stroke-width="2"/>`,
    eyes: `<g class="tblink"><path d="M44 46 h12 l-2 4 h-10z" fill="#E8FFFF" stroke="${TD}" stroke-width="2"/><path d="M76 46 h-12 l2 4 h10z" fill="#E8FFFF" stroke="${TD}" stroke-width="2"/></g>`,
    mouth: "", noBlush:true
  });
} }
];
PORTAL_SKINS.forEach(s => { s.toy = true; s.anim = ""; s.portal = true; s.hint = "Réussis le défi du Portail"; SECRET_SKINS.push(s); });
