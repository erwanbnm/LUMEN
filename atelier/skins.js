/* Personnages de la boutique et personnages secrets : yeux kawaii, petits bras */
const kEye = (x, y, r, tint) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.18}" fill="#24142E"/>
  <ellipse cx="${x}" cy="${y+r*.45}" rx="${r*.7}" ry="${r*.48}" fill="${tint||"#7A5AE0"}" opacity=".85"/>
  <ellipse cx="${x-r*.3}" cy="${y-r*.4}" rx="${r*.42}" ry="${r*.33}" fill="#fff"/>
  <circle cx="${x+r*.36}" cy="${y+r*.32}" r="${r*.16}" fill="#fff" opacity=".9"/>
  <circle cx="${x+r*.1}" cy="${y-r*.78}" r="${r*.09}" fill="#fff" opacity=".7"/>`;
const kEyes = (x1, x2, y, r, tint) => kEye(x1, y, r, tint) + kEye(x2, y, r, tint) + blush(x1-r*.6, y+r*1.5) + blush(x2+r*.6, y+r*1.5);
const kMouth = (x, y, t, col) => {
  col = col || "#3A1426";
  if (t === "w") return `<path d="M${x-5} ${y} q2.5 3.4 5 0 q2.5 3.4 5 0" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round"/>`;
  if (t === "o") return `<ellipse cx="${x}" cy="${y+1.5}" rx="2.6" ry="3.2" fill="${col}"/><ellipse cx="${x}" cy="${y+3}" rx="1.6" ry="1.1" fill="#F2788E"/>`;
  return `<path d="M${x-4.5} ${y} q4.5 6 9 0z" fill="${col}"/><ellipse cx="${x}" cy="${y+2.6}" rx="2.2" ry="1.3" fill="#F2788E"/>`;
};
// Petit bras arrondi : du point d'attache à la main
const arm = (x, y, dx, dy, col, out) => `<path d="M${x} ${y} q${dx*.55} ${dy*.1} ${dx} ${dy}" fill="none" stroke="${out}" stroke-width="8" stroke-linecap="round"/>
  <path d="M${x} ${y} q${dx*.55} ${dy*.1} ${dx} ${dy}" fill="none" stroke="${col}" stroke-width="4.8" stroke-linecap="round"/>
  <circle cx="${x+dx}" cy="${y+dy}" r="4" fill="${col}" stroke="${out}" stroke-width="1.8"/>`;
const feet = (x1, x2, y, col, out) => `<ellipse cx="${x1}" cy="${y}" rx="7" ry="4" fill="${col}" stroke="${out}" stroke-width="1.8"/><ellipse cx="${x2}" cy="${y}" rx="7" ry="4" fill="${col}" stroke="${out}" stroke-width="1.8"/>`;
const circ = (cx, cy, r) => `M${cx} ${cy-r} a${r} ${r} 0 1 0 .1 0Z`;

const SHOP_SKINS = [
{ id:"cor", th:"cor", n:"Cœurio", p:350, draw(){ const c = {b:"#E8445A", s:"#B8243A", l:"#FF9AAA", o:"#6A0E1E"};
  return `<path d="M54 38 C52 22 66 14 72 22" stroke="${c.o}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M54 38 C52 22 66 14 72 22" stroke="#D8344A" stroke-width="6.5" fill="none" stroke-linecap="round"/>
  <path d="M44 38 v-14" stroke="#1E3A7A" stroke-width="9" stroke-linecap="round"/><path d="M44 38 v-14" stroke="#5A86E0" stroke-width="5.6" stroke-linecap="round"/>`
  + feet(52, 70, 100, "#C8344A", c.o) + arm(26,62,-12,-14,"#E8445A",c.o) + arm(94,62,12,6,"#E8445A",c.o)
  + vol("M60 98 C30 78 18 62 22 46 C26 32 44 28 54 38 L60 44 L66 38 C76 28 94 32 98 46 C102 62 90 78 60 98Z", c, [40,46,10,6], `<path d="M60 90 C44 78 36 70 34 60" stroke="#FF7A8A" stroke-width="2" fill="none" opacity=".6"/>`)
  + kEyes(48, 72, 60, 6.6, "#E8445A") + kMouth(60, 72); } },
{ id:"geo", th:"geo", n:"Globi", p:350, draw(){ const c = {b:"#4FA8EE", s:"#2D6FC8", l:"#CFEFFF", o:"#1E4E8E"};
  return feet(48, 72, 100, "#3E8AD8", c.o) + arm(32,70,-12,-10,"#4FA8EE",c.o) + arm(88,70,12,8,"#4FA8EE",c.o)
  + vol(circ(60,64,32), c, [44,46,12,7], `<path d="M30 52 C38 44 48 46 50 54 C46 62 38 62 36 70 C30 68 28 60 30 52Z M66 36 C76 34 86 40 88 50 C80 52 74 48 70 52 C64 48 62 40 66 36Z M58 86 C66 82 76 84 80 90 C74 96 62 96 58 86Z" fill="#6CC27A"/><path d="M28 64 h18 M72 64 h20" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".5"/>`)
  + kEyes(48, 72, 62, 6.4, "#2D6FC8") + kMouth(60, 74, "w"); } },
{ id:"esp", th:"esp", n:"Jupi", p:450, draw(){ const c = {b:"#F2B880", s:"#C8834A", l:"#FFE8CC", o:"#6A3A1A"};
  return `<g transform="rotate(-14 60 66)"><ellipse cx="60" cy="66" rx="50" ry="12" fill="none" stroke="#6A3A1A" stroke-width="9"/><ellipse cx="60" cy="66" rx="50" ry="12" fill="none" stroke="#E8D2A8" stroke-width="5.5"/></g>`
  + arm(32,66,-12,-12,"#F2B880",c.o) + arm(88,66,12,-4,"#F2B880",c.o)
  + vol(circ(60,64,29), c, [46,46,11,6], `<path d="M30 54 H90 V60 H30Z M30 72 H90 V78 H30Z" fill="#E8955A" opacity=".8"/><path d="M30 84 H90 V88 H30Z" fill="#FFE2C0"/><ellipse cx="74" cy="80" rx="7" ry="4" fill="#C8503A"/>`)
  + `<g transform="rotate(-14 60 66)"><path d="M10 66 A50 12 0 0 0 110 66" fill="none" stroke="#6A3A1A" stroke-width="9"/><path d="M10 66 A50 12 0 0 0 110 66" fill="none" stroke="#F4E2BC" stroke-width="5.5"/></g>`
  + kEyes(49, 71, 58, 6.2, "#C8503A") + kMouth(60, 68, "o"); }, float:true },
{ id:"sci", th:"sci", n:"Fiolo", p:350, draw(){ const c = {b:"#E6F6FF", s:"#AED6EE", l:"#FFFFFF", o:"#2E4E6E"};
  return arm(38,70,-14,-12,"#CDEBFA",c.o) + arm(82,70,14,-6,"#CDEBFA",c.o)
  + vol("M50 26 H70 V46 L92 90 C95 98 90 102 84 102 H36 C30 102 25 98 28 90 L50 46Z", c, [56,40,4,10],
    `<path d="M33 80 Q45 74 60 80 T88 80 L95 96 C95 104 88 104 84 104 H36 C30 104 25 104 26 96Z" fill="#6CE07A"/><path d="M33 80 Q45 74 60 80 T88 80" stroke="#B8FFB0" stroke-width="2.4" fill="none"/>
     <circle cx="48" cy="92" r="3" fill="#B8FFB0"/><circle cx="70" cy="88" r="2.2" fill="#B8FFB0"/><circle cx="62" cy="96" r="1.8" fill="#B8FFB0"/>`)
  + `<rect x="47" y="16" width="26" height="12" rx="3" fill="#C8955A" stroke="${c.o}" stroke-width="2"/><circle cx="74" cy="10" r="3" fill="#B8FFB0" opacity=".8"/><circle cx="80" cy="4" r="2" fill="#B8FFB0" opacity=".6"/>`
  + kEyes(50, 70, 62, 6, "#3FB56A") + kMouth(60, 72); } },
{ id:"his", th:"his", n:"Chevalino", p:400, draw(){ const c = {b:"#C9CED8", s:"#8E95A4", l:"#FFFFFF", o:"#2E323E"};
  return `<path d="M60 22 C58 8 72 2 82 8 C76 10 72 14 70 20 C78 14 88 16 90 24 C82 24 74 26 68 30Z" fill="#E2323A" stroke="#6A0E14" stroke-width="2" stroke-linejoin="round"/>`
  + feet(48, 72, 101, "#8E95A4", c.o) + arm(32,74,-10,-14,"#B4BAC6",c.o)
  + `<path d="M98 50 L106 80" stroke="${c.o}" stroke-width="5" stroke-linecap="round"/><path d="M98 50 L106 80" stroke="#E6EAF2" stroke-width="2.6" stroke-linecap="round"/><path d="M94 76 l12 -4" stroke="#8A5A2A" stroke-width="4" stroke-linecap="round"/>`
  + arm(88,74,10,0,"#B4BAC6",c.o)
  + vol("M60 22 C82 22 92 40 92 62 C92 86 80 100 60 100 C40 100 28 86 28 62 C28 40 38 22 60 22Z", c, [44,36,9,7], `<path d="M60 22 V100" stroke="#A8AEBC" stroke-width="2"/><path d="M28 80 H92" stroke="#A8AEBC" stroke-width="2"/>`)
  + `<ellipse cx="60" cy="58" rx="21" ry="17" fill="#FFE2C8" stroke="${c.o}" stroke-width="2"/>` + kEyes(51, 69, 57, 5.6, "#5AA9F0") + kMouth(60, 67, "w"); } },
{ id:"ani", th:"ani", n:"Pandou", p:300, draw(){ const c = {b:"#FFFFFF", s:"#D6D6E2", l:"#FFFFFF", o:"#26262E"};
  return `<circle cx="36" cy="32" r="10" fill="#26262E"/><circle cx="84" cy="32" r="10" fill="#26262E"/>` + feet(46, 74, 101, "#26262E", c.o)
  + arm(30,74,-10,-10,"#2E2E36",c.o) + arm(90,74,12,-14,"#2E2E36",c.o)
  + vol("M60 26 C86 26 96 46 94 66 C92 88 78 100 60 100 C42 100 28 88 26 66 C24 46 34 26 60 26Z", c, [46,38,10,6], `<ellipse cx="60" cy="84" rx="18" ry="13" fill="#F2F2F8"/>`)
  + `<ellipse cx="47" cy="56" rx="10" ry="12" fill="#2E2E36" transform="rotate(20 47 56)"/><ellipse cx="73" cy="56" rx="10" ry="12" fill="#2E2E36" transform="rotate(-20 73 56)"/>`
  + kEyes(48, 72, 56, 5.8, "#8A6A4A") + `<ellipse cx="60" cy="67" rx="3" ry="2.2" fill="#26262E"/>` + kMouth(60, 70, "w"); } },
{ id:"jeu", th:"jeu", n:"Manetto", p:450, draw(){ const c = {b:"#8A5AE8", s:"#5E36B8", l:"#C8B0FF", o:"#24145A"};
  return feet(32, 88, 98, "#5E36B8", c.o) + arm(22,58,-10,-16,"#8A5AE8",c.o) + arm(98,58,10,-16,"#8A5AE8",c.o)
  + vol("M32 42 H88 C104 42 112 58 108 78 C106 94 94 98 86 90 L78 82 H42 L34 90 C26 98 14 94 12 78 C8 58 16 42 32 42Z", c, [40,50,14,5])
  + `<path d="M26 64 h14 M33 57 v14" stroke="#2A1A5A" stroke-width="5.4" stroke-linecap="round"/>
  <circle cx="86" cy="58" r="3.6" fill="#E84A5A" stroke="${c.o}" stroke-width="1.2"/><circle cx="94" cy="65" r="3.6" fill="#F2C440" stroke="${c.o}" stroke-width="1.2"/><circle cx="78" cy="65" r="3.6" fill="#5AA9F0" stroke="${c.o}" stroke-width="1.2"/><circle cx="86" cy="72" r="3.6" fill="#6CC27A" stroke="${c.o}" stroke-width="1.2"/>`
  + kEyes(52, 68, 58, 5.6, "#F2C440") + kMouth(60, 70); } },
{ id:"art", th:"art", n:"Palette", p:350, draw(){ const c = {b:"#E8C89A", s:"#C29A64", l:"#FFF0D8", o:"#5A3A1A"};
  return feet(46, 74, 101, "#C29A64", c.o) + arm(28,72,-10,-12,"#E8C89A",c.o)
  + `<path d="M98 76 L112 46" stroke="${c.o}" stroke-width="5" stroke-linecap="round"/><path d="M98 76 L112 46" stroke="#C8955A" stroke-width="2.6" stroke-linecap="round"/><path d="M110 50 l4 -10 l2 1 l-2 10z" fill="#5AA9F0" stroke="${c.o}" stroke-width="1.2"/>`
  + arm(90,72,8,4,"#E8C89A",c.o)
  + vol("M60 28 C86 28 98 46 96 66 C94 86 80 100 62 100 C52 100 50 92 44 92 C36 92 26 86 24 68 C22 46 36 28 60 28Z", c, [46,40,10,6],
    `<circle cx="38" cy="80" r="6" fill="#5A3A1A" opacity=".9"/><circle cx="34" cy="56" r="5" fill="#E84A5A"/><circle cx="84" cy="52" r="5" fill="#5AA9F0"/><circle cx="86" cy="74" r="5" fill="#F2C440"/><circle cx="70" cy="90" r="5" fill="#6CC27A"/>`)
  + `<path d="M36 34 C40 18 76 14 86 26 C80 30 52 36 36 34Z" fill="#D8343A" stroke="#6A0E14" stroke-width="2"/><circle cx="64" cy="18" r="3" fill="#D8343A" stroke="#6A0E14" stroke-width="1.5"/>`
  + kEyes(50, 70, 60, 6, "#B48CF2") + kMouth(60, 72); } },
{ id:"spo", th:"spo", n:"Ballon", p:300, draw(){ const c = {b:"#FFFFFF", s:"#D8D8E2", l:"#FFFFFF", o:"#24242E"};
  return feet(48, 72, 101, "#3A3A48", c.o) + arm(30,70,-12,-14,"#F4F4F8",c.o) + arm(90,70,14,-10,"#F4F4F8",c.o)
  + vol(circ(60,64,32), c, [44,46,12,7], `<path d="M60 74 l10 7 l-4 12 h-12 l-4 -12z M28 70 l8 -4 l6 8 l-4 10 l-9 -2z M92 70 l-8 -4 l-6 8 l4 10 l9 -2z M48 32 l12 -2 l12 2 l-2 8 h-20z" fill="#2E2E3A"/>`)
  + `<path d="M28 50 C40 38 80 38 92 50 L92 56 C80 46 40 46 28 56Z" fill="#E2323A" stroke="#6A0E14" stroke-width="1.8"/>`
  + kEyes(48, 72, 62, 6.2, "#5AA9F0") + kMouth(60, 73); } },
{ id:"mon", th:"mon", n:"Valise", p:350, draw(){ const c = {b:"#C8804A", s:"#9A5A2E", l:"#F2C090", o:"#4A2A12"};
  return `<path d="M48 30 v-8 h24 v8" fill="none" stroke="${c.o}" stroke-width="7" stroke-linejoin="round"/><path d="M48 30 v-8 h24 v8" fill="none" stroke="#8A5A3A" stroke-width="3.6" stroke-linejoin="round"/>`
  + feet(44, 76, 101, "#6A4A2E", c.o) + arm(24,70,-10,-12,"#C8804A",c.o) + arm(96,70,10,4,"#C8804A",c.o)
  + vol("M30 30 H90 C96 30 98 34 98 40 V92 C98 98 94 100 90 100 H30 C26 100 22 98 22 92 V40 C22 34 24 30 30 30Z", c, [40,38,12,5],
    `<rect x="38" y="30" width="6" height="70" fill="#8A5A3A"/><rect x="76" y="30" width="6" height="70" fill="#8A5A3A"/><circle cx="32" cy="84" r="6" fill="#5AA9F0"/><rect x="84" y="80" width="12" height="9" rx="2" fill="#F27BA8" transform="rotate(-12 90 84)"/><circle cx="90" cy="40" r="5" fill="#F2C440"/>`)
  + kEyes(50, 70, 60, 6, "#F2C440") + kMouth(60, 72, "w"); } },
{ id:"per", th:"per", n:"Buste", p:400, draw(){ const c = {b:"#F4F0E6", s:"#CBC2AE", l:"#FFFFFF", o:"#5A5244"};
  return arm(30,86,-10,-6,"#ECE6D8",c.o) + arm(90,86,10,-6,"#ECE6D8",c.o)
  + vol("M24 104 C24 86 36 78 48 76 C40 70 36 60 36 50 C36 32 46 22 60 22 C74 22 84 32 84 50 C84 60 80 70 72 76 C84 78 96 86 96 104Z", c, [48,34,9,6], `<path d="M40 92 C52 86 68 86 80 92" stroke="#D8D0C0" stroke-width="2" fill="none"/>`)
  + `<path d="M36 36 C42 24 52 20 60 20" stroke="#4E9A3A" stroke-width="3" fill="none"/><path d="M84 36 C78 24 68 20 60 20" stroke="#4E9A3A" stroke-width="3" fill="none"/>
  ${[0,1,2,3].map(i=>`<ellipse cx="${40+i*4}" cy="${32-i*3.4}" rx="3.4" ry="1.8" fill="#6CC25A" transform="rotate(${-50+i*10} ${40+i*4} ${32-i*3.4})"/><ellipse cx="${80-i*4}" cy="${32-i*3.4}" rx="3.4" ry="1.8" fill="#6CC25A" transform="rotate(${50-i*10} ${80-i*4} ${32-i*3.4})"/>`).join("")}`
  + kEyes(51, 69, 50, 5.4, "#8A8A9A") + kMouth(60, 60, "w"); } },
{ id:"cin", th:"cin", n:"Popcorn", p:300, draw(){ const c = {b:"#FFFFFF", s:"#D8D2CC", l:"#FFFFFF", o:"#5A1A1A"};
  const pops = [[36,36,9],[50,28,10],[66,27,10],[80,34,9],[44,40,8],[60,38,9],[74,40,8]];
  return feet(46, 74, 101, "#C8323A", c.o) + arm(30,72,-12,-14,"#F4ECE4",c.o) + arm(90,72,12,-6,"#F4ECE4",c.o)
  + pops.map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r+1.8}" fill="#B88A3A"/>`).join("") + pops.map(([x,y,r],i) => `<circle cx="${x-1}" cy="${y-1}" r="${r}" fill="${i%3?"#FFF6D8":"#FFE07A"}"/>`).join("")
  + vol("M28 44 H92 L84 100 H36Z", c, [44,54,6,10], `<path d="M36 44 L41 100 H50 L48 44Z M60 44 V100 H68 V44Z M84 44 L79 100 H88 L92 44Z" fill="#E2323A"/>`)
  + `<rect x="26" y="42" width="68" height="7" rx="3" fill="#F2C440" stroke="${c.o}" stroke-width="1.8"/>`
  + `<rect x="44" y="56" width="32" height="26" rx="8" fill="#FFFFFF" stroke="${c.o}" stroke-width="1.4"/>` + kEyes(53, 67, 64, 4.6, "#E2323A") + kMouth(60, 73); } },
{ id:"mus", th:"mus", n:"Croche", p:350, draw(){ const c = {b:"#4A4AA8", s:"#2E2E7A", l:"#9A9AF2", o:"#16163E"};
  return `<path d="M86 66 V14 C96 18 104 26 100 40" fill="none" stroke="${c.o}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M86 66 V14 C96 18 104 26 100 40" fill="none" stroke="#5A5AC0" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>`
  + feet(44, 68, 101, "#2E2E7A", c.o) + arm(26,76,-10,-12,"#4A4AA8",c.o)
  + vol("M56 46 C80 44 92 58 88 76 C84 94 66 102 50 98 C32 94 24 80 28 66 C32 54 42 46 56 46Z", c, [44,58,10,6])
  + kEyes(48, 68, 70, 6.2, "#F2C440") + kMouth(58, 82) + `<path d="M14 40 l6 -2 l1 6 M18 30 l3 4" stroke="#F2C440" stroke-width="2" fill="none" stroke-linecap="round"/>`; } },
{ id:"ins", th:"ins", n:"Soucoupe", p:450, float:true, draw(){ const c = {b:"#B8C2D6", s:"#8A94AC", l:"#F2F6FF", o:"#2E3448"};
  return `<ellipse cx="60" cy="96" rx="22" ry="5" fill="#9FF2E4" opacity=".55" filter="url(#soft)"/>` + arm(22,74,-10,-12,"#B8C2D6",c.o) + arm(98,74,10,-12,"#B8C2D6",c.o)
  + vol("M60 22 C78 22 88 36 88 54 H32 C32 36 42 22 60 22Z", {b:"#BFF2E8", s:"#88D2C4", l:"#FFFFFF", o:c.o}, [50,32,8,5])
  + vol("M10 72 C10 60 34 52 60 52 C86 52 110 60 110 72 C110 84 86 90 60 90 C34 90 10 84 10 72Z", c, [36,60,14,4], `<path d="M14 74 C30 82 90 82 106 74" stroke="#6A7488" stroke-width="2" fill="none"/>`)
  + [24,42,60,78,96].map((x,i) => `<circle cx="${x}" cy="${78+(i%4===0?-2:2)}" r="3.4" fill="${["#F2C440","#F27BA8","#6CF0B0","#5AA9F0","#F2C440"][i]}" stroke="${c.o}" stroke-width="1.2"/>`).join("")
  + kEyes(50, 70, 40, 5.6, "#3FB5A0") + kMouth(60, 48, "w"); } },
{ id:"gas", th:"gas", n:"Croissant", p:300, draw(){ const c = {b:"#F2B860", s:"#C8823A", l:"#FFE6B0", o:"#6A3A10"};
  return feet(46, 74, 101, "#C8823A", c.o) + arm(22,80,-8,-14,"#F2B860",c.o) + arm(98,80,8,-14,"#F2B860",c.o)
  + vol("M14 88 C10 60 34 34 60 34 C86 34 110 60 106 88 C98 82 90 80 82 84 C76 74 70 70 60 70 C50 70 44 74 38 84 C30 80 22 82 14 88Z", c, [44,44,14,6],
    `<path d="M34 46 C40 58 42 70 38 84 M50 38 C54 50 56 60 54 72 M70 38 C66 50 64 60 66 72 M86 46 C80 58 78 70 82 84" stroke="#B8722A" stroke-width="2.4" fill="none"/>`)
  + kEyes(50, 70, 54, 5.8, "#C8823A") + kMouth(60, 64); } },
{ id:"lan", th:"lan", n:"Encrier", p:350, draw(){ const c = {b:"#3A4A9A", s:"#232E6A", l:"#8A9AF2", o:"#121A44"};
  return `<path d="M74 34 C80 10 98 2 108 4 C100 12 92 24 82 36Z" fill="#FFFFFF" stroke="#5A5A6A" stroke-width="1.8"/><path d="M78 34 L100 8" stroke="#9A9AAA" stroke-width="1.2"/>`
  + feet(46, 74, 101, "#232E6A", c.o) + arm(26,72,-10,-12,"#3A4A9A",c.o) + arm(94,72,10,-6,"#3A4A9A",c.o)
  + `<rect x="48" y="28" width="24" height="10" rx="3" fill="#1A1A2A" stroke="${c.o}" stroke-width="2"/>`
  + vol("M50 36 H70 V44 C88 46 96 58 96 72 C96 90 82 100 60 100 C38 100 24 90 24 72 C24 58 32 46 50 44Z", c, [42,54,10,6])
  + `<rect x="38" y="64" width="44" height="26" rx="5" fill="#FFF6E0" stroke="${c.o}" stroke-width="1.6"/><text x="60" y="86" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-style="italic" fill="#3A4A9A">Aa</text>`
  + kEyes(50, 70, 54, 5.4, "#8A9AF2") + kMouth(60, 61, "w", "#FFF6E0"); } },
{ id:"myt", th:"myt", n:"Cyclo", p:450, draw(){ const c = {b:"#B49AE8", s:"#8A6AC8", l:"#E4D8FF", o:"#3A2268"};
  return feet(46, 74, 101, "#8A6AC8", c.o) + arm(28,70,-10,-14,"#B49AE8",c.o) + arm(92,70,12,-8,"#B49AE8",c.o)
  + vol("M60 22 C86 22 96 42 94 64 C92 88 78 100 60 100 C42 100 28 88 26 64 C24 42 34 22 60 22Z", c, [46,34,10,6],
    `<path d="M26 74 C46 70 60 86 94 66 L96 100 H24Z" fill="#FFFFFF"/><path d="M40 80 C46 88 52 92 58 100" stroke="#D8D0E8" stroke-width="2" fill="none"/>`)
  + `<path d="M36 34 C44 20 76 20 84 34" stroke="#E0B040" stroke-width="3" fill="none"/>${[0,1,2,3,4].map(i=>`<ellipse cx="${40+i*10}" cy="${28-Math.sin(i/4*Math.PI)*6}" rx="4" ry="2" fill="#F2C440" transform="rotate(${-30+i*15} ${40+i*10} ${28-Math.sin(i/4*Math.PI)*6})"/>`).join("")}`
  + kEye(60, 52, 11, "#E0B040") + blush(42,64) + blush(78,64) + kMouth(60, 70); } },
{ id:"tec", th:"tec", n:"Robotik", p:450, draw(){ const c = {b:"#A8B8D0", s:"#7A8AA6", l:"#E8F0FF", o:"#283044"};
  return `<path d="M60 20 V8" stroke="${c.o}" stroke-width="3"/><circle cx="60" cy="7" r="4.4" fill="#F27BA8" stroke="${c.o}" stroke-width="1.6"/><circle cx="60" cy="7" r="8" fill="#F27BA8" opacity=".4" filter="url(#soft)"/>`
  + feet(46, 74, 102, "#5A6A86", c.o) + arm(32,86,-12,-10,"#8A9AB6",c.o) + arm(88,86,12,-14,"#8A9AB6",c.o)
  + vol("M40 76 H80 C84 76 86 78 86 82 V96 C86 100 84 102 80 102 H40 C36 102 34 100 34 96 V82 C34 78 36 76 40 76Z", c, null, `<circle cx="60" cy="89" r="5" fill="#6CF0B0"/>`)
  + vol("M30 20 H90 C96 20 98 24 98 30 V64 C98 70 96 74 90 74 H30 C24 74 22 70 22 64 V30 C22 24 24 20 30 20Z", c, [40,28,12,4])
  + `<rect x="30" y="28" width="60" height="38" rx="10" fill="#18223A"/>` + `<ellipse cx="48" cy="46" rx="6" ry="7.5" fill="#6CF0FF"/><ellipse cx="72" cy="46" rx="6" ry="7.5" fill="#6CF0FF"/><circle cx="46" cy="43" r="2.4" fill="#fff"/><circle cx="70" cy="43" r="2.4" fill="#fff"/>
  <path d="M54 56 q6 5 12 0" stroke="#6CF0FF" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="56" rx="4" ry="2" fill="#F27BA8" opacity=".6"/><ellipse cx="82" cy="56" rx="4" ry="2" fill="#F27BA8" opacity=".6"/>`; } },
{ id:"cap", th:"cap", n:"Punaise", p:350, draw(){ const c = {b:"#E8445A", s:"#B8243A", l:"#FF9AAA", o:"#6A0E1E"};
  return `<path d="M76 24 V4 L96 10 L76 16" fill="#5AA9F0" stroke="#1E4E8E" stroke-width="1.8" stroke-linejoin="round"/>`
  + arm(30,54,-12,-10,"#E8445A",c.o) + arm(90,54,12,-14,"#E8445A",c.o)
  + vol("M60 20 C82 20 94 36 94 54 C94 72 72 86 60 104 C48 86 26 72 26 54 C26 36 38 20 60 20Z", c, [46,32,10,6])
  + `<circle cx="60" cy="56" r="17" fill="#FFF0F2" stroke="${c.o}" stroke-width="1.6"/>` + kEyes(53, 67, 54, 4.8, "#E8445A") + kMouth(60, 63, "w"); } },
{ id:"eco", th:"eco", n:"Tirelou", p:400, draw(){ const c = {b:"#F7A8C4", s:"#D87A9C", l:"#FFE0EA", o:"#6A1E3E"};
  return `<circle cx="60" cy="12" r="8" fill="#F2C440" stroke="#8A5A08" stroke-width="1.8"/><path d="M60 8 v8" stroke="#8A5A08" stroke-width="1.6"/>`
  + `<path d="M34 34 l-4 -14 l14 8z M86 34 l4 -14 l-14 8z" fill="#F7A8C4" stroke="${c.o}" stroke-width="2" stroke-linejoin="round"/>`
  + `<rect x="34" y="88" width="10" height="14" rx="4" fill="#D87A9C" stroke="${c.o}" stroke-width="1.8"/><rect x="76" y="88" width="10" height="14" rx="4" fill="#D87A9C" stroke="${c.o}" stroke-width="1.8"/>`
  + arm(24,66,-10,-12,"#F7A8C4",c.o) + `<path d="M98 72 c8 -2 8 -10 2 -10" stroke="${c.o}" stroke-width="2.4" fill="none"/>`
  + vol("M60 28 C88 28 98 46 98 64 C98 84 82 96 60 96 C38 96 22 84 22 64 C22 46 32 28 60 28Z", c, [44,40,12,6], `<rect x="52" y="30" width="16" height="4" rx="2" fill="#6A1E3E"/>`)
  + `<ellipse cx="60" cy="72" rx="11" ry="8" fill="#FFC0D4" stroke="${c.o}" stroke-width="1.6"/><ellipse cx="56" cy="72" rx="2" ry="3" fill="${c.o}"/><ellipse cx="64" cy="72" rx="2" ry="3" fill="${c.o}"/>`
  + kEyes(46, 74, 56, 5.8, "#D87A9C") + kMouth(60, 84, "w"); } }
];

const SECRET_SKINS = [
{ id:"etoile", n:"Étoile filante", hint:"Un Défi du jour parfait", float:true, draw(){ const c = {b:"#FFD84A", s:"#E8A21A", l:"#FFF6C0", o:"#7A4A04"};
  return `<path d="M30 70 C10 80 0 96 -4 110 C10 96 22 90 36 86Z" fill="#FFE7A0" opacity=".55"/><path d="M38 80 C24 94 18 104 16 112 C26 102 34 96 44 92Z" fill="#B8E0FF" opacity=".5"/>`
  + arm(28,52,-12,-10,"#FFD84A",c.o) + arm(92,52,12,-12,"#FFD84A",c.o)
  + vol("M60 12 L72 40 L102 42 L78 62 L86 92 L60 76 L34 92 L42 62 L18 42 L48 40Z", c, [52,34,8,6]) + kEyes(51, 69, 54, 5.4, "#E8A21A") + kMouth(60, 65); } },
{ id:"trefle", n:"Trèfle", hint:"Cinq victoires de suite au blackjack", draw(){ const c = {b:"#5DC86A", s:"#35994A", l:"#C8FFB0", o:"#1A4A22"};
  return `<path d="M60 88 C62 96 66 102 74 106" stroke="${c.o}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M60 88 C62 96 66 102 74 106" stroke="#4FA048" stroke-width="3" fill="none" stroke-linecap="round"/>`
  + vol("M60 62 C52 46 30 46 30 62 C30 74 46 76 60 62 C46 76 44 98 60 98 C76 98 74 76 60 62 C74 76 90 74 90 62 C90 46 68 46 60 62 C68 46 70 26 60 26 C50 26 52 46 60 62Z", c, [48,40,10,6])
  + arm(30,66,-12,-8,"#5DC86A",c.o) + arm(90,66,12,-12,"#5DC86A",c.o) + kEyes(51, 69, 62, 5.4, "#F2C440") + kMouth(60, 73); } },
{ id:"dede", n:"Dédé", hint:"Cinq victoires de suite à la roulette", draw(){ const o = "#2A2A3A";
  return feet(44, 76, 102, "#C8C8D4", o) + arm(22,72,-10,-14,"#F4F4FA",o) + arm(98,62,10,-8,"#F4F4FA",o)
  + `<path d="M24 46 L60 30 L96 46 L60 62Z" fill="#FFFFFF" stroke="${o}" stroke-width="2.3" stroke-linejoin="round"/><path d="M24 46 L60 62 V100 L24 84Z" fill="#E4E4EE" stroke="${o}" stroke-width="2.3" stroke-linejoin="round"/><path d="M96 46 L60 62 V100 L96 84Z" fill="#C8C8D6" stroke="${o}" stroke-width="2.3" stroke-linejoin="round"/>
  <ellipse cx="60" cy="46" rx="4" ry="2.4" fill="#E2323A"/><circle cx="84" cy="62" r="2.6" fill="${o}"/><circle cx="72" cy="84" r="2.6" fill="${o}"/><circle cx="78" cy="73" r="2.6" fill="${o}"/>`
  + kEyes(36, 50, 68, 4.4, "#E2323A") + kMouth(43, 78, "w"); } },
{ id:"lingot", n:"Lingot", hint:"Dépenser 1 000 pièces", draw(){ const c = {b:"#F5C842", s:"#C8961A", l:"#FFF4B0", o:"#6A4A04"};
  return feet(40, 80, 101, "#C8961A", c.o) + arm(18,82,-8,-14,"#F5C842",c.o) + arm(102,82,8,-14,"#F5C842",c.o)
  + vol("M30 54 H90 L104 96 H16Z", c, [40,62,10,4], `<path d="M30 54 L16 96 M90 54 L104 96" stroke="#FFF4B0" stroke-width="2" opacity=".6"/>`)
  + `<path d="M84 46 l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2z" fill="#fff"/>` + kEyes(50, 70, 74, 5.6, "#C8961A") + kMouth(60, 85); } },
{ id:"veinard", n:"Veinard", hint:"Gagner une course avec l'outsider à x12", draw(){ const c = {b:"#C8CED8", s:"#8E95A4", l:"#FFFFFF", o:"#2E323E"};
  return feet(36, 84, 102, "#8E95A4", c.o) + arm(22,54,-8,-14,"#C8CED8",c.o) + arm(98,54,8,-14,"#C8CED8",c.o)
  + vol("M30 100 C18 76 18 40 40 26 C52 18 68 18 80 26 C102 40 102 76 90 100 L72 100 C80 80 82 52 70 42 C64 38 56 38 50 42 C38 52 40 80 48 100Z", c, [40,34,8,6],
    `${[[30,44],[26,62],[30,80],[90,44],[94,62],[90,80]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="#5A6070"/>`).join("")}`)
  + kEyes(52, 68, 28, 4.6, "#5AA9F0") + kMouth(60, 36, "w") + `<path d="M14 18 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2z" fill="#FFE36A"/>`; } },
{ id:"comete", n:"Comète", hint:"Une série de 20 bonnes réponses d'affilée", float:true, draw(){ const c = {b:"#7FD6FF", s:"#3E9AD8", l:"#E0F8FF", o:"#123A6A"};
  return `<path d="M84 44 C100 30 112 12 118 2 C108 20 104 36 96 52Z M86 60 C104 56 114 46 120 38 C112 54 104 62 92 70Z" fill="#B8ECFF" opacity=".6"/>`
  + arm(32,72,-12,-6,"#7FD6FF",c.o) + arm(88,72,12,4,"#7FD6FF",c.o)
  + vol(circ(60,66,28), c, [48,50,10,6], `<circle cx="74" cy="80" r="5" fill="#5AB8F0" opacity=".7"/><circle cx="44" cy="84" r="3" fill="#5AB8F0" opacity=".7"/>`)
  + kEyes(50, 70, 64, 5.8, "#123A6A") + kMouth(60, 75, "o"); } }
];
const ULTRA_SKIN = { id:"lumen", n:"Lumen", hint:"Le plus grand des secrets", float:true, draw(){ const c = {b:"#FFE7A0", s:"#F2B83B", l:"#FFFFFF", o:"#7A4A04"};
  return `<circle cx="60" cy="60" r="46" fill="#FFD36A" opacity=".45" filter="url(#glow)"/>
  ${[0,1,2,3,4,5,6,7].map(i => { const a = i*Math.PI/4; return `<path d="M${60+Math.cos(a)*38} ${60+Math.sin(a)*38} L${60+Math.cos(a)*50} ${60+Math.sin(a)*50}" stroke="#FFE36A" stroke-width="3" stroke-linecap="round" opacity=".8"/>`; }).join("")}
  <ellipse cx="60" cy="18" rx="16" ry="4.5" fill="none" stroke="#FFE36A" stroke-width="3.4"/>`
  + arm(32,66,-12,-14,"#FFE7A0",c.o) + arm(88,66,12,-14,"#FFE7A0",c.o)
  + vol("M60 26 C80 26 92 42 92 62 C92 84 78 96 60 96 C42 96 28 84 28 62 C28 42 40 26 60 26Z", c, [48,40,12,8], `<path d="M60 70 C54 62 56 54 60 48 C64 54 66 62 60 70Z" fill="#FF9A3D" opacity=".8"/>`)
  + kEyes(48, 72, 62, 6.4, "#F2A947") + kMouth(60, 76); } };
