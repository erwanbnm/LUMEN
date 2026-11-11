/* ---------- Personnages des événements temporaires (style jouet) ----------
   « La Nuit des Ombres » (Halloween, novembre 2026, choix d'Erwan) : le Campeur du Lac et le Zombie
   (anciens personnages de l'édition Halloween, plus en boutique) + 2 personnages originaux Lumen, clins d'œil
   à l'univers des carnets maudits, sans noms de marque. Ils ne s'achètent pas : on les obtient avec 6 fragments
   pendant l'événement, puis ils restent dans la collection pour toujours. */
const EVENT_NEW = [
{ id:"ev_pomme", n:"Le Spectre à la Pomme", toy:true, anim:"", noHat:true, draw(){
  // Grandes ailes en plumes (3 rangées), cape déchirée, yeux luisants, pomme qui flotte
  const wing = side => { const m = side < 0 ? "" : "translate(120 0) scale(-1 1)";
    const rows = [[8, 18, 30], [14, 30, 22], [22, 44, 16]].map(([x, y, l], i) => [0, 1, 2, 3].map(k => `<path d="M${30 - k * 3} ${66 + k * 4} Q${x - k * 2} ${y + k * 9} ${x - 6 - k * 2} ${y + l + k * 9} Q${x + 6 - k} ${y + l - 4 + k * 9} ${32 - k * 2} ${72 + k * 4}Z" fill="${["#4A3C6A", "#5E4E84", "#7464A0"][i]}" stroke="${TD}" stroke-width="1.6" stroke-linejoin="round"/>`).join("")).join("");
    return `<g transform="${m}">${toy("M34 74 Q10 60 2 22 Q14 30 18 26 Q14 40 24 46 Q20 56 36 66Z", "#3E3258", "#2A2240", "#08060E", {dy:3})}${rows}<path d="M6 28 Q16 48 32 68" stroke="#A898D0" stroke-width="1.6" fill="none" opacity=".8"/></g>`; };
  const aura = `<ellipse cx="60" cy="62" rx="58" ry="54" fill="#B05AFF" opacity=".16"/><ellipse cx="60" cy="60" rx="40" ry="38" fill="#FF7AD8" opacity=".08"/>`;
  const rag = `<path d="M22 112 L28 128 L34 116 L40 130 L47 117 L54 131 L60 118 L66 131 L73 117 L80 130 L86 116 L92 128 L98 112" fill="#1E1830" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/>`;
  return tPerson({
    skin:["#A8B4D8", "#7884AC", "#000"], torso:["#3A3050", "#241E36", "#0A0812"], shoes:["#241E36", "#16121E", "#000"], sleeve:"#241E36", gloves:["#A8B4D8", "#7884AC", "#2A3050"],
    armR:"M92 88 Q106 80 104 66", handR:[104, 64],
    back: aura + wing(-1) + wing(1),
    body: rag + `<path d="M28 78 Q60 92 92 78 L88 86 Q60 100 32 86Z" fill="#4A3E66" stroke="${TD}" stroke-width="2"/>`
      + [36, 46, 56, 66, 76, 84].map((x, i) => `<path d="M${x} 82 l3 ${i % 2 ? 9 : 12} l3 ${i % 2 ? -9 : -12}" fill="#2E2640" stroke="${TD}" stroke-width="1.4" stroke-linejoin="round"/>`).join("")
      + `<path d="M34 104 Q60 112 86 104" stroke="#9A8AB8" stroke-width="2.6" fill="none" stroke-dasharray="3 3"/>` + toy(tC(60, 110, 5), "#D8D0E8", "#A89AC0", "#3A3050", {dy:1, w:2})
      + `<path d="M57 108 h6 M58 112 h4" stroke="${TD}" stroke-width="1.2"/>`,
    held: `<g class="tbreath"><ellipse cx="110" cy="52" rx="13" ry="4" fill="#FF4A52" opacity=".25"/>${toy("M110 30 Q100 26 98 36 Q96 48 106 52 Q110 50 114 52 Q124 48 122 36 Q120 26 110 30Z", "#FF4A52", "#D41E2A", "#6A0A10", {dy:2, w:2.4})}`
      + `<path d="M110 30 q0 -6 3 -8" stroke="#5A3A1E" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M112 26 q7 -5 10 0 q-6 3 -10 0Z" fill="#5ACB5A" stroke="${TD}" stroke-width="1.4"/>` + tShine("M102 36 Q103 32 107 31", 2.2, .85)
      + `<path d="M120 22 l1.5 3 l3 1.5 l-3 1.5 l-1.5 3 l-1.5 -3 l-3 -1.5 l3 -1.5Z" fill="#FFF6C8" class="ta-twinkle"/></g>`,
    face: `<path d="M36 52 Q34 66 46 70 M84 52 Q86 66 74 70" stroke="#5A6488" stroke-width="2" fill="none" opacity=".7"/>`
      + `<path d="M37 38 L53 44 M83 38 L67 44" stroke="${TD}" stroke-width="3.4" stroke-linecap="round"/>`,
    eyes: `<g class="tblink"><circle cx="49" cy="49" r="8" fill="#FFF36A" stroke="${TD}" stroke-width="2.6"/><circle cx="49" cy="49" r="8" fill="#FFB800" opacity=".35"/><ellipse cx="49.5" cy="49" rx="1.8" ry="5" fill="#B0101E"/>`
      + `<circle cx="71" cy="49" r="8" fill="#FFF36A" stroke="${TD}" stroke-width="2.6"/><circle cx="71" cy="49" r="8" fill="#FFB800" opacity=".35"/><ellipse cx="70.5" cy="49" rx="1.8" ry="5" fill="#B0101E"/><circle cx="52" cy="46" r="1.5" fill="#fff"/><circle cx="74" cy="46" r="1.5" fill="#fff"/></g>`,
    noBlush:true,
    mouth: `<path d="M36 58 Q60 80 84 58 Q72 64 60 64 Q48 64 36 58Z" fill="#3A0A16" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round"/>`
      + `<path d="M40 60 l3 5 l3 -4 l3 5 l3 -4 l3 5 l3 -4 l3 5 l3 -4 l3 5 l3 -4 l3 5 l3 -4 l3 4" fill="#FFF8E8" stroke="${TD}" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<path d="M46 70 Q60 76 74 70" stroke="#C8183A" stroke-width="1.6" fill="none" opacity=".6"/>`,
    hair: toy("M28 44 L14 34 L28 32 L16 16 L34 22 L32 4 L46 16 L52 0 L60 14 L68 0 L74 16 L88 4 L86 22 L104 16 L92 32 L106 34 L92 44 Q86 26 60 24 Q34 26 28 44Z", "#4A3C6A", "#2E2444", "#06040A", {dy:2})
      + `<path d="M34 30 L42 34 M46 18 L50 28 M60 12 L60 24 M74 18 L70 28 M86 30 L78 34" stroke="#8A78B8" stroke-width="1.8" stroke-linecap="round"/>`
  });
} },
{ id:"ev_carnet", n:"L'Élève au Carnet Noir", toy:true, anim:"", noHat:true, draw(){
  return tPerson({
    skin:["#FFE4D0", "#F2B898", "#000"], torso:["#7A5A44", "#5A402E", "#24160C"], shoes:["#3A2A22", "#22160E", "#000"], sleeve:"#5A402E",
    armR:"M92 88 Q106 86 108 74", handR:[108, 72],
    body: `<path d="M48 70 L60 84 L72 70 Z" fill="#F6F4F0" stroke="${TD}" stroke-width="2"/><path d="M57 76 L63 76 L62 100 L60 104 L58 100Z" fill="#C8202E" stroke="${TD}" stroke-width="1.8" stroke-linejoin="round"/>`
      + `<path d="M48 70 L42 96 M72 70 L78 96" stroke="#24160C" stroke-width="2" opacity=".6"/><rect x="70" y="92" width="12" height="9" rx="1.5" fill="#6A4C38" stroke="${TD}" stroke-width="1.8"/>`
      + `<circle cx="60" cy="110" r="2" fill="#E8C24A" stroke="${TD}" stroke-width="1.2"/><circle cx="60" cy="118" r="2" fill="#E8C24A" stroke="${TD}" stroke-width="1.2"/>`,
    held: toy("M98 56 H118 Q120 56 120 58 V84 Q120 86 118 86 H98 Q96 86 96 84 V58 Q96 56 98 56Z", "#3A3644", "#1E1A26", "#06040A", {dy:2, w:2.6})
      + `<path d="M100 60 V82" stroke="#5A5468" stroke-width="2"/><path d="M104 64 h12 M104 69 h12" stroke="#E8E4F0" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>` + tShine("M101 59 Q108 58 114 59", 1.8, .5),
    face: `<path d="M42 41 L55 43 M78 41 L65 43" stroke="#5A3A22" stroke-width="3" stroke-linecap="round"/>`,
    eyes: `<g class="tblink">${tEye(50, 48, .85)}${tEye(70, 48, .85)}</g><path d="M44 51 Q50 53 56 51 M64 51 Q70 53 76 51" stroke="#C8182A" stroke-width="1.4" fill="none" opacity=".7"/>`,
    mouth: `<path d="M53 60 Q62 64 68 58" fill="none" stroke="${TD}" stroke-width="2.4" stroke-linecap="round"/>`,
    hair: toy("M32 46 Q26 14 60 12 Q94 14 88 46 Q86 30 78 28 Q72 38 60 32 Q58 40 50 36 Q44 42 38 34 Q34 38 32 46Z", "#8A5A36", "#6A4026", "#2A160A", {dy:2})
      + `<path d="M60 14 Q54 24 50 36 M66 16 Q66 26 60 32" stroke="#5A3A22" stroke-width="1.8" fill="none" opacity=".7"/>` + tShine("M42 22 Q50 16 60 15", 2.4, .5)
  });
} }
];
const EVENT_SKINS = HALLOWEEN_EVENT.concat(EVENT_NEW);
EVENT_SKINS.forEach(s => { s.event = true; s.ev = "hw26"; s.e = "Événement Halloween"; s.r = "leg"; delete s.p; });
