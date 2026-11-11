/* ---------- Édition Halloween : 4 personnages originaux en style jouet ----------
   Des clins d'œil aux grands monstres du cinéma d'horreur, sans reprendre leurs noms ni leurs traits :
   des personnages Lumen déguisés. En vente du 1er octobre au 30 novembre ; une fois achetés, ils restent. */
const HALLOWEEN_ALL = [
{ id:"masque", n:"Le Masque Blanc", e:"Édition Halloween", p:900, toy:true, anim:"", draw(){
  return tPerson({
    skin:["#F6F3EC", "#D9D3C6", "#000"], torso:["#4A6698", "#30497A", "#14213E"], shoes:["#3A3A42", "#1E1E24", "#000"], sleeve:"#30497A",
    body: `<path d="M60 72 V122" stroke="#14213E" stroke-width="2.4" opacity=".7"/><rect x="66" y="92" width="14" height="11" rx="2" fill="#3E5A8C" stroke="${TD}" stroke-width="2"/>`
      + `<path d="M28 106 Q60 112 92 106" stroke="#14213E" stroke-width="2" fill="none" opacity=".5"/>`,
    held: toy(tE(106, 112, 12, 10.5), "#FFA24A", "#F07A1E", "#8A3A06", {dy:2, w:2.6})
      + `<path d="M106 101 q1 -6 5 -7" stroke="#4A7A2A" stroke-width="3" fill="none" stroke-linecap="round"/>`
      + `<path d="M100 108 l3 -4 l3 4Z M108 108 l3 -4 l3 4Z M100 116 Q106 121 113 116 L110 118 L106 116 L103 118Z" fill="#FFE36A" stroke="${TD}" stroke-width="1.4" stroke-linejoin="round" class="ta-glow"/>`,
    face: `<path d="M40 56 Q42 68 60 70 Q78 68 80 56" fill="none" stroke="#C9C2B2" stroke-width="2.4"/>`,
    eyes: `<ellipse cx="50" cy="47" rx="6.5" ry="4.6" fill="${TD}"/><ellipse cx="70" cy="47" rx="6.5" ry="4.6" fill="${TD}"/><circle cx="51" cy="47" r="1.2" fill="#fff"/><circle cx="71" cy="47" r="1.2" fill="#fff"/>`,
    noBlush:true, mouth: `<path d="M54 61 H66" stroke="${TD}" stroke-width="2.2" stroke-linecap="round"/>`,
    hair: toy("M33 42 Q29 14 60 12 Q91 14 87 42 Q83 27 73 31 Q67 22 58 29 Q49 21 45 31 Q37 29 33 42Z", "#7A5A3E", "#4E3622", "#20140A", {dy:2})
      + tShine("M42 24 Q50 16 62 16", 2.4, .45)
  });
} },
{ id:"campeur", n:"Le Campeur du Lac", e:"Édition Halloween", p:1000, toy:true, anim:"", draw(){
  const holes = [[46,30],[52,28],[60,27],[68,28],[74,30],[44,58],[50,64],[70,64],[76,58],[60,66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="${TD}" opacity=".75"/>`).join("");
  return tPerson({
    skin:["#F4F0E4", "#D8D0BC", "#000"], torso:["#7A8650", "#58623A", "#262C14"], shoes:["#5A4636", "#3A2A1E", "#140C06"], sleeve:"#58623A",
    armL:"M28 88 Q14 92 12 104", handL:[12, 106],
    body: `<rect x="38" y="88" width="15" height="12" rx="2" fill="#6A7444" stroke="${TD}" stroke-width="2"/><rect x="67" y="88" width="15" height="12" rx="2" fill="#6A7444" stroke="${TD}" stroke-width="2"/><path d="M60 72 V122" stroke="#262C14" stroke-width="2.2" opacity=".6"/>`,
    back: `<g transform="rotate(-18 12 104)">${toy("M9 52 H15 V100 H9Z", "#C89A62", "#9A6E3A", "#4A300E", {dy:1.5, w:2.2})}${toy(tE(12, 120, 8, 16), "#C89A62", "#9A6E3A", "#4A300E", {dy:1.5, w:2.4})}</g>`,
    face: `<path d="M38 40 Q36 22 60 20" fill="none" stroke="${TD}" stroke-width="3" opacity=".5"/><path d="M82 40 Q84 22 60 20" fill="none" stroke="${TD}" stroke-width="3" opacity=".5"/>`
      + `<path d="M50 33 l5 4 l-5 4 M70 33 l-5 4 l5 4" stroke="#D9343A" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + holes,
    eyes: `<path d="M44 46 Q50 41 56 46 Q50 52 44 46Z M64 46 Q70 41 76 46 Q70 52 64 46Z" fill="${TD}"/><circle cx="51" cy="46" r="1.2" fill="#fff"/><circle cx="71" cy="46" r="1.2" fill="#fff"/>`,
    noBlush:true, mouth:"",
    hair: `<path d="M34 48 Q30 40 33 34 M86 48 Q90 40 87 34" stroke="#3A3A42" stroke-width="3.4" fill="none" stroke-linecap="round"/>`
  });
} },
{ id:"croque", n:"Le Croque-Rêves", e:"Édition Halloween", p:1100, toy:true, anim:"", draw(){
  const band = y => `<path d="M24 ${y} Q60 ${y-6} 96 ${y} L97 ${y+8} Q60 ${y+2} 23 ${y+8}Z" fill="#3E8A46" stroke="${TD}" stroke-width="1.6"/>`;
  return tPerson({
    skin:["#EDB596", "#CC876A", "#000"], torso:["#D23A42", "#A4222C", "#4A0A10"], shoes:["#5A3E2A", "#3A2618", "#140A04"], sleeve:"#A4222C",
    armR:"M92 88 Q106 92 108 104", handR:[108, 106], gloves:["#8A5A3A", "#5E3A22", "#22140A"],
    body: band(80) + band(96) + band(110),
    held: `<path d="M102 110 L97 128 M106 112 L104 131 M110 112 L112 131 M114 110 L119 127" stroke="${TD}" stroke-width="5" stroke-linecap="round"/><path d="M102 110 L97 128 M106 112 L104 131 M110 112 L112 131 M114 110 L119 127" stroke="#D8E0EA" stroke-width="2.6" stroke-linecap="round"/>`,
    face: `<circle cx="44" cy="58" r="4" fill="#C86A56" opacity=".45"/><circle cx="76" cy="54" r="3" fill="#C86A56" opacity=".45"/><circle cx="70" cy="62" r="2.2" fill="#C86A56" opacity=".45"/>`
      + `<path d="M43 40 L55 43 M77 40 L65 43" stroke="#5A3020" stroke-width="3" stroke-linecap="round"/>`,
    eyes: tEyes(50, 70, 48, .9), noBlush:true, mouth: tMouth(60, 59, "grin"),
    hair: toy(tE(60, 30, 36, 6), "#8A6440", "#5E4024", "#24160A", {dy:2})
      + toy("M40 31 Q38 10 60 9 Q82 10 80 31Z", "#8A6440", "#5E4024", "#24160A", {dy:0})
      + `<path d="M40.5 25 Q60 28 79.5 25 L80 30 Q60 33 40 30Z" fill="#3A2614" stroke="${TD}" stroke-width="2"/>` + tShine("M46 22 Q48 13 58 12", 2.4, .45)
  });
} },
{ id:"zombie", n:"Le Zombie", e:"Édition Halloween", p:1200, toy:true, anim:"", draw(){
  return tPerson({
    skin:["#A8D690", "#74A85E", "#000"], torso:["#A6BCCE", "#7590A8", "#34485A"], shoes:["#6A5A4A", "#463A2E", "#1A140E"], sleeve:"#7590A8",
    armL:"M28 86 Q16 80 8 76", handL:[8, 75], armR:"M92 86 Q104 80 112 76", handR:[112, 75],
    body: `<path d="M26 112 L32 120 L38 112 L44 121 L50 113 L56 121 L62 112 L68 121 L74 113 L80 121 L86 112 L92 119" fill="none" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/>`
      + `<rect x="64" y="86" width="12" height="10" rx="1.5" fill="#D8A8B8" stroke="${TD}" stroke-width="1.8" transform="rotate(8 70 91)"/><path d="M42 82 l8 8 M48 80 l-4 10" stroke="${TD}" stroke-width="1.6" opacity=".6"/>`,
    face: `<path d="M42 36 Q52 32 62 36" fill="none" stroke="${TD}" stroke-width="1.8"/><path d="M45 33 v6 M50 32 v6 M55 32 v6 M60 33 v6" stroke="${TD}" stroke-width="1.4"/>`
      + `<circle cx="74" cy="60" r="3" fill="#6A9A54" opacity=".6"/>`,
    eyes: `<g class="tblink"><circle cx="50" cy="48" r="6.6" fill="#FFFDE8" stroke="${TD}" stroke-width="2"/><circle cx="51" cy="49" r="2.4" fill="${TD}"/><circle cx="70" cy="48" r="4.2" fill="#FFFDE8" stroke="${TD}" stroke-width="2"/><circle cx="69" cy="48.5" r="1.6" fill="${TD}"/></g>`,
    noBlush:true, mouth: `<path d="M52 59 Q60 66 68 59 L66 61 L63 59 L60 62 L57 59 L54 61Z" fill="#4A2A30" stroke="${TD}" stroke-width="1.8" stroke-linejoin="round"/>`,
    hair: `<path d="M44 28 Q46 18 52 24 M58 22 Q60 12 64 22 M70 26 Q76 18 76 28" fill="none" stroke="#3A3A2A" stroke-width="3.4" stroke-linecap="round"/>`
  });
} }
];
const HALLOWEEN_HAT = { masque:{at:[60, 20], k:1}, croque:{at:[60, 18], k:1}, zombie:{at:[60, 24], k:1} };
HALLOWEEN_ALL.forEach(s => { if (HALLOWEEN_HAT[s.id]) s.hat = HALLOWEEN_HAT[s.id]; if (s.id === "campeur") s.noHat = true; s.season = "halloween"; });
// Novembre 2026 (choix d'Erwan) : seul le Masque Blanc reste en boutique. Le Campeur du Lac et le Zombie deviennent
// des personnages de l'événement « La Nuit des Ombres » (toy_events.js). Le Croque-Rêves est retiré du jeu :
// il n'est plus visible nulle part, son dessin reste seulement pour afficher les anciens profils (pièces remboursées).
const HALLOWEEN_SKINS = HALLOWEEN_ALL.filter(s => s.id === "masque");
const HALLOWEEN_EVENT = HALLOWEEN_ALL.filter(s => s.id === "campeur" || s.id === "zombie");
const RETIRED_SKINS = HALLOWEEN_ALL.filter(s => s.id === "croque");
HALLOWEEN_SKINS.forEach(s => SHOP_SKINS.push(s));
// Saison d'Halloween : du 1er octobre au 30 novembre (mois 9 et 10 en JavaScript)
const halloweenSeason = (d = new Date()) => d.getMonth() === 9 || d.getMonth() === 10;
