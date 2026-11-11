/* ---------- Familiers (purement décoratifs, novembre 2026) ----------
   Petites créatures Lumen originales en style jouet. Comme pour les Légendes, le nom fait le clin d'œil ;
   le dessin reste une création Lumen. Aucun effet sur le jeu : ils accompagnent seulement le personnage.
   how : "shop" (boutique, prix p) ou "event" (défi de l'événement de la semaine). */
const PETS = [
{ id:"pet_cube", n:"Le Siffleur Cubique", r:"epic", how:"shop", p:1500, toy:true, anim:"", draw(){
  const px = [[34,46,"#7ED957"],[50,46,"#5CB83A"],[66,46,"#8EE868"],[34,62,"#5CB83A"],[50,62,"#4A9E2E"],[66,62,"#7ED957"],[34,78,"#8EE868"],[50,78,"#5CB83A"],[66,78,"#6ACB48"]]
    .map(([x, y, c]) => `<rect x="${x}" y="${y}" width="17" height="17" fill="${c}"/>`).join("");
  return `<g>${toy("M38 90 h12 v14 h-12Z M70 90 h12 v14 h-12Z", "#5CB83A", "#3E8A26", "#14300A", {dy:2, w:2.6})}
    <rect x="31" y="43" width="58" height="56" rx="6" fill="${TD}" transform="translate(0 4)"/><rect x="31" y="43" width="58" height="56" rx="6" fill="#6ACB48"/>${px}
    <rect x="31" y="43" width="58" height="56" rx="6" fill="none" stroke="${TD}" stroke-width="3"/><path d="M37 50 h16" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <g class="tblink"><circle cx="48" cy="66" r="7" fill="#fff" stroke="${TD}" stroke-width="2.4"/><circle cx="49" cy="67" r="3.6" fill="${TD}"/><circle cx="72" cy="66" r="7" fill="#fff" stroke="${TD}" stroke-width="2.4"/><circle cx="73" cy="67" r="3.6" fill="${TD}"/></g>
    <circle cx="60" cy="84" r="4" fill="${TD}"/><g class="ta-pop"><path d="M92 40 v-14 l9 -3 v14" fill="none" stroke="${TD}" stroke-width="2.6" stroke-linecap="round"/><circle cx="89" cy="40" r="3.4" fill="${TD}"/><circle cx="98" cy="37" r="3.4" fill="${TD}"/></g></g>`;
} },
{ id:"pet_foudre", n:"La Souris Foudre", r:"leg", how:"shop", p:2500, toy:true, anim:"", draw(){
  return `<g>${`<path d="M84 92 Q104 92 104 76 Q104 64 94 66 Q86 68 90 76 Q94 82 98 76" fill="none" stroke="${TD}" stroke-width="7" stroke-linecap="round"/><path d="M84 92 Q104 92 104 76 Q104 64 94 66 Q86 68 90 76 Q94 82 98 76" fill="none" stroke="#F2B320" stroke-width="3.6" stroke-linecap="round"/>`}
    ${toy(tC(98, 74, 5), "#BFF4FF", "#6AD8FF", "#1A6A9A", {dy:1, w:2})}
    ${toy(tC(36, 40, 16), "#FFD84A", "#F2B320", "#7A5000", {dy:2})}${toy(tC(84, 40, 16), "#FFD84A", "#F2B320", "#7A5000", {dy:2})}
    <circle cx="36" cy="40" r="9" fill="#E8B8F0"/><circle cx="84" cy="40" r="9" fill="#E8B8F0"/>
    ${toy(tE(60, 74, 32, 28), "#FFE84A", "#F5B800", "#6A4400", {dy:3})}${tShine("M36 66 Q40 54 52 50", 3, .6)}
    ${toy(tE(60, 88, 16, 10), "#FFF4C8", "#F6E2A0", "#7A5000", {dy:1, w:2})}
    ${tEyes(50, 70, 70)}<path d="M57 80 Q60 83 63 80" fill="none" stroke="${TD}" stroke-width="2.2" stroke-linecap="round"/><circle cx="60" cy="78" r="2" fill="#B85A2A"/>
    <circle cx="44" cy="80" r="1.4" fill="#E0962A"/><circle cx="41" cy="77" r="1.4" fill="#E0962A"/><circle cx="76" cy="80" r="1.4" fill="#E0962A"/><circle cx="79" cy="77" r="1.4" fill="#E0962A"/>
    <g class="ta-pulse"><path d="M18 62 l8 -6 l-2 6 l8 -4" fill="none" stroke="#6AE0FF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M104 46 l-8 -4 l3 6 l-8 -2" fill="none" stroke="#6AE0FF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 84 l6 2 l-4 3 l6 2" fill="none" stroke="#FFF36A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g><g class="ta-twinkle"><path d="M60 22 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3Z" fill="#BFF4FF" stroke="${TD}" stroke-width="1.6" stroke-linejoin="round"/></g>
    ${toy("M44 98 h10 v6 h-10Z M66 98 h10 v6 h-10Z", "#FFD84A", "#F2B320", "#7A5000", {dy:1, w:2})}</g>`;
} },
{ id:"pet_dragon", n:"Le Fils des Flammes", r:"myth", how:"shop", p:6000, toy:true, anim:"", float:true, draw(){
  const wing = m => `<g transform="${m}">${toy("M48 62 Q20 30 4 34 Q14 44 10 54 Q20 52 22 62 Q30 58 34 70Z", "#3A2A36", "#241A22", "#08040A", {dy:2})}<path d="M46 62 Q24 40 8 38 M40 64 Q24 52 12 54 M36 68 Q28 62 22 62" stroke="#C8303A" stroke-width="1.8" fill="none" opacity=".8"/></g>`;
  return `<g>${wing("")}${wing("translate(120 0) scale(-1 1)")}
    <path d="M78 94 Q100 100 108 86 Q110 80 104 80" fill="none" stroke="${TD}" stroke-width="9" stroke-linecap="round"/><path d="M78 94 Q100 100 108 86 Q110 80 104 80" fill="none" stroke="#3A2A36" stroke-width="5.5" stroke-linecap="round"/><path d="M104 80 l-4 -6 l8 2Z" fill="#C8303A" stroke="${TD}" stroke-width="1.6"/>
    ${toy(tE(60, 80, 24, 20), "#4A3842", "#2E2028", "#08040A", {dy:3})}${toy(tE(60, 86, 13, 11), "#E85A3A", "#C8303A", "#5A0A10", {dy:1, w:2})}
    <path d="M50 80 h20 M51 86 h18 M53 92 h14" stroke="#7A1A20" stroke-width="1.6"/>
    ${toy(tE(60, 50, 22, 18), "#4A3842", "#2E2028", "#08040A", {dy:2})}${tShine("M44 44 Q48 36 58 34", 2.6, .5)}
    ${toy("M44 38 Q36 22 30 18 Q40 22 48 34Z", "#E8D8C0", "#B8A080", "#4A3420", {dy:1, w:2.2})}${toy("M76 38 Q84 22 90 18 Q80 22 72 34Z", "#E8D8C0", "#B8A080", "#4A3420", {dy:1, w:2.2})}
    <path d="M52 34 l4 -6 l4 6 l4 -6 l4 6" fill="#C8303A" stroke="${TD}" stroke-width="1.6" stroke-linejoin="round"/>
    <g class="tblink"><path d="M44 48 Q50 43 56 49 Q50 52 44 48Z" fill="#FFB83A" stroke="${TD}" stroke-width="2"/><path d="M76 48 Q70 43 64 49 Q70 52 76 48Z" fill="#FFB83A" stroke="${TD}" stroke-width="2"/><path d="M50 46 v5 M70 46 v5" stroke="${TD}" stroke-width="2"/></g>
    ${toy(tE(60, 60, 12, 7), "#5A4650", "#3A2A32", "#08040A", {dy:1, w:2})}<circle cx="55" cy="59" r="1.6" fill="${TD}"/><circle cx="65" cy="59" r="1.6" fill="${TD}"/>
    <g class="ta-ember"><path d="M60 68 q-6 6 0 12 q6 -6 0 -12Z" fill="#FFB83A" stroke="${TD}" stroke-width="1.4" opacity=".9"/></g></g>`;
} },
{ id:"pet_scie", n:"Le Chiot Tronçonneuse", r:"leg", how:"event", goal:"q", toy:true, anim:"", draw(){
  const chain = Array.from({length:7}, (_, i) => `<path d="M${76 + i * 5} 66 l2 -3 l2 3" fill="none" stroke="${TD}" stroke-width="1.2"/><path d="M${76 + i * 5} 80 l2 3 l2 -3" fill="none" stroke="${TD}" stroke-width="1.2"/>`).join("");
  return `<g><path d="M30 86 Q14 82 16 66" fill="none" stroke="${TD}" stroke-width="8" stroke-linecap="round"/><path d="M30 86 Q14 82 16 66" fill="none" stroke="#FF8A3A" stroke-width="4.6" stroke-linecap="round" class="ta-wag"/>
    ${toy(tE(52, 86, 28, 19), "#FF9A4A", "#F06A1E", "#6A2A04", {dy:3})}
    ${toy("M30 96 h12 v8 h-12Z M60 96 h12 v8 h-12Z", "#FF9A4A", "#F06A1E", "#6A2A04", {dy:1, w:2})}
    <g class="ta-buzz">${toy("M74 64 H110 Q116 64 116 73 Q116 82 110 82 H74Z", "#E4EAF2", "#AEB8C8", "#3A4250", {dy:2, w:2.4})}${chain}<path d="M78 73 H110" stroke="#8A94A6" stroke-width="1.6"/>
      ${toy("M56 60 H80 Q84 60 84 64 V84 Q84 88 80 88 H56 Q52 88 52 84 V64 Q52 60 56 60Z", "#FFC83A", "#E89A0A", "#5A3A00", {dy:2, w:2.6})}<rect x="58" y="66" width="18" height="6" rx="2" fill="#2B1D3A" opacity=".8"/><circle cx="62" cy="79" r="3" fill="#E2283A" stroke="${TD}" stroke-width="1.4"/>
      ${toy("M58 60 Q58 50 68 50 Q78 50 78 60 L74 60 Q74 54 68 54 Q62 54 62 60Z", "#3A3A46", "#24242E", "#08080C", {dy:1, w:2})}</g>
    <g class="ta-spore"><circle cx="50" cy="58" r="4" fill="#D8D8E4" opacity=".7"/><circle cx="44" cy="52" r="3" fill="#D8D8E4" opacity=".5"/></g>
    ${toy(tE(44, 54, 24, 21), "#FF9A4A", "#F06A1E", "#6A2A04", {dy:2})}${tShine("M26 46 Q30 36 40 34", 2.8, .55)}
    ${toy("M22 42 Q10 46 12 66 Q20 62 26 52Z", "#D85A14", "#B0420A", "#4A1A02", {dy:1, w:2.4})}${toy("M66 40 Q76 36 80 50 Q72 52 64 48Z", "#D85A14", "#B0420A", "#4A1A02", {dy:1, w:2.4})}
    ${toy(tE(46, 64, 11, 8), "#FFD8B0", "#F0B888", "#6A2A04", {dy:1, w:2})}<ellipse cx="47" cy="59" rx="4" ry="3" fill="${TD}"/>
    <path d="M40 66 Q46 71 52 66" fill="none" stroke="${TD}" stroke-width="2" stroke-linecap="round"/><path d="M45 69 Q47 77 50 69Z" fill="#FF6A8A" stroke="${TD}" stroke-width="1.4"/>
    ${tEyes(36, 56, 50)}${toy(tC(68, 78, 6), "#FF9A4A", "#F06A1E", "#6A2A04", {dy:1, w:2.2})}
    <path d="M24 74 Q46 82 66 72" fill="none" stroke="${TD}" stroke-width="6" stroke-linecap="round"/><path d="M24 74 Q46 82 66 72" fill="none" stroke="#2A6AD8" stroke-width="3.4" stroke-linecap="round"/></g>`;
} },
{ id:"pet_renne", n:"Le Petit Docteur Renne", r:"leg", how:"event", goal:"spend", toy:true, anim:"", draw(){
  const antler = m => `<g transform="${m}"><path d="M46 34 Q40 20 34 14 M40 22 Q32 22 28 18 M37 17 Q38 10 42 6" fill="none" stroke="${TD}" stroke-width="6.5" stroke-linecap="round"/><path d="M46 34 Q40 20 34 14 M40 22 Q32 22 28 18 M37 17 Q38 10 42 6" fill="none" stroke="#C8965A" stroke-width="3.4" stroke-linecap="round"/></g>`;
  return `<g>${antler("")}${antler("translate(120 0) scale(-1 1)")}
    ${toy(tE(60, 86, 27, 19), "#F8F8FC", "#D4D8E4", "#4A4A5A", {dy:3})}<path d="M60 70 V104" stroke="#9AA0B0" stroke-width="1.8"/><path d="M50 70 L60 82 L70 70" fill="#A8744A" stroke="${TD}" stroke-width="2"/><rect x="64" y="88" width="10" height="8" rx="1.5" fill="#E4E8F0" stroke="${TD}" stroke-width="1.6"/><circle cx="56" cy="90" r="1.6" fill="#9AA0B0"/><circle cx="56" cy="98" r="1.6" fill="#9AA0B0"/>
    ${toy("M38 98 h11 v7 h-11Z M71 98 h11 v7 h-11Z", "#5A3A22", "#3A2414", "#120804", {dy:1, w:2})}
    ${toy("M84 82 h20 Q106 82 106 84 V98 Q106 100 104 100 H84 Q82 100 82 98 V84 Q82 82 84 82Z", "#F4F4F8", "#C8C8D8", "#4A4A5A", {dy:2, w:2.4})}<path d="M90 82 Q94 76 98 82" fill="none" stroke="${TD}" stroke-width="2.2"/><path d="M94 86 v10 M89 91 h10" stroke="#3AB86A" stroke-width="3"/>
    ${toy(tE(60, 54, 24, 21), "#B8845A", "#8A5A36", "#2A160A", {dy:2})}
    ${toy(tE(60, 64, 12, 8), "#F4E2C8", "#D8C0A0", "#5A4020", {dy:1, w:2})}${toy(tE(60, 60, 5, 3.6), "#4A90E8", "#2A6AC8", "#0A2A5A", {dy:.5, w:1.8})}
    <path d="M55 67 Q60 70 65 67" fill="none" stroke="${TD}" stroke-width="2" stroke-linecap="round"/>
    ${tEyes(50, 70, 52, .95)}${tBlush(42, 78, 60)}
    ${toy("M28 38 Q26 8 60 6 Q94 8 92 38 Q60 46 28 38Z", "#3AA86A", "#24804C", "#0A3A1E", {dy:2})}<path d="M30 36 Q60 44 90 36" fill="none" stroke="${TD}" stroke-width="5" stroke-linecap="round"/><path d="M30 36 Q60 44 90 36" fill="none" stroke="#F4F4F8" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M60 22 q-6 4 0 10 q6 -6 0 -10Z" fill="#B8F0C8" stroke="${TD}" stroke-width="1.4"/>${tShine("M40 30 Q44 22 54 21", 2.4, .5)}
    <path d="M44 72 Q38 86 48 92 Q56 94 54 84" fill="none" stroke="${TD}" stroke-width="4.4" stroke-linecap="round"/><path d="M44 72 Q38 86 48 92 Q56 94 54 84" fill="none" stroke="#5A8AD8" stroke-width="2.2" stroke-linecap="round"/>${toy(tC(54, 83, 4), "#E4EAF2", "#AEB8C8", "#3A4250", {dy:.5, w:1.8})}</g>`;
} }
];
const petOf = id => PETS.find(p => p.id === id) || null;
