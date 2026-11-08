/* Badges : médailles en relief, du bronze au rang Maître */
const TIERS = {
  bronze:{n:"Bronze", c:["#FFD9B0","#C98552","#6E3E1C"], rib:["#E86A5C","#B83A30"]},
  argent:{n:"Argent", c:["#FFFFFF","#C9D1DC","#6E7A8C"], rib:["#5AA9F0","#2A6AB8"]},
  or:{n:"Or", c:["#FFF7C0","#F2C440","#9A6A08"], rib:["#E2483E","#9A1E18"]},
  platine:{n:"Platine", c:["#F6FDFF","#A9D9E8","#3E7A92"], rib:["#8E5BD8","#4A2A9A"]},
  diamant:{n:"Diamant", c:["#F2FBFF","#7FD3FF","#1E6AB0"], rib:["#3FD8C8","#0E7A72"]},
  maitre:{n:"Maître", c:["#FFC2C2","#E2323A","#5A0A12"], rib:["#F2C440","#9A6A08"]}
};
const ICONS = {
  bulb:`<path d="M20 4a11 11 0 0 0-6 20v4h12v-4a11 11 0 0 0-6-20z"/><rect x="14" y="30" width="12" height="3" rx="1.5"/><rect x="16" y="35" width="8" height="3" rx="1.5"/>`,
  moon:`<path d="M26 4a16 16 0 1 0 10 26A13 13 0 0 1 26 4z"/><path d="M8 8l1.2 2.6 2.8.4-2 2 .5 2.8L8 14.5l-2.5 1.3.5-2.8-2-2 2.8-.4z"/>`,
  heart:`<path d="M20 35S5 26 5 15a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 11-15 20-15 20z"/>`,
  hourglass:`<path d="M9 3h22v5c0 6-7 9-7 12s7 6 7 12v5H9v-5c0-6 7-9 7-12S9 14 9 8z"/>`,
  timeline:`<rect x="3" y="18" width="34" height="4" rx="2"/><circle cx="9" cy="20" r="5"/><circle cx="31" cy="20" r="5"/><path d="M20 6l6 6h-12z M20 34l6-6h-12z"/>`,
  his:`<path d="M7 37V11h5v4h4v-4h8v4h4v-4h5v26H24v-8a4 4 0 0 0-8 0v8z"/>`,
  sci:`<path d="M15 3h10v3h-2v9l10 16a4 4 0 0 1-3.5 6h-19A4 4 0 0 1 7 31l10-16V6h-2z"/>`,
  geo:`<path fill-rule="evenodd" d="M20 4a16 16 0 1 0 0 32 16 16 0 0 0 0-32zm-3 4c-3 4-6 6-9 7 1 4 5 5 7 8 1 3-1 6 1 8 2-4 6-5 6-9s-6-3-6-7c0-3 3-4 1-7zm9 3c-2 2-1 5 2 6 3 1 4 4 3 7 2-3 2-8-1-11-1-1-3-2-4-2z"/>`,
  ani:`<ellipse cx="20" cy="27" rx="9" ry="7.5"/><circle cx="8.5" cy="17" r="4"/><circle cx="15.5" cy="10.5" r="4"/><circle cx="24.5" cy="10.5" r="4"/><circle cx="31.5" cy="17" r="4"/>`,
  jeu:`<path fill-rule="evenodd" d="M11 11h18a9 9 0 0 1 8 13l-2 6a4 4 0 0 1-7 1l-3-4H15l-3 4a4 4 0 0 1-7-1l-2-6a9 9 0 0 1 8-13zm1 6v3H9v3h3v3h3v-3h3v-3h-3v-3zm15 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm3 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>`,
  art:`<path fill-rule="evenodd" d="M20 4C10 4 3 11 3 20s7 16 15 16c3 0 4-2 3-4s0-4 3-4h5c5 0 8-3 8-8C37 11 29 4 20 4zM11 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm8-4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm9 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>`,
  spo:`<path fill-rule="evenodd" d="M20 4a16 16 0 1 0 0 32 16 16 0 0 0 0-32zm0 8l7 5-2.7 8h-8.6L13 17z"/>`,
  esp:`<path d="M20 2c7 6 9 14 7 24H13c-2-10 0-18 7-24z"/><path d="M13 21l-6 9 6-1zM27 21l6 9-6-1zM16 28h8l-4 9z"/>`,
  mon:`<path d="M20 3L4 11h32zM6 13h28v3H6zM8 18h4v12H8zm7 0h4v12h-4zm7 0h4v12h-4zm7 0h4v12h-4zM5 32h30v4H5z"/>`,
  cor:`<path d="M19 6a7 7 0 0 0-11 4 6 6 0 0 0-3 9 6 6 0 0 0 2 9 6 6 0 0 0 9 5 4 4 0 0 0 3-2zM21 6a7 7 0 0 1 11 4 6 6 0 0 1 3 9 6 6 0 0 1-2 9 6 6 0 0 1-9 5 4 4 0 0 1-3-2z"/>`,
  per:`<path d="M20 3l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z"/>`,
  cin:`<path d="M5 17h30v18H5z M4 9l28-6 2 7-28 6z"/>`,
  mus:`<path d="M14 7l19-4v24a5 5 0 1 1-3-4.6V10l-13 3v17a5 5 0 1 1-3-4.6z"/>`,
  ins:`<ellipse cx="20" cy="22" rx="17" ry="6"/><path d="M11 19a9 8 0 0 1 18 0z"/><circle cx="12" cy="31" r="2"/><circle cx="20" cy="33" r="2"/><circle cx="28" cy="31" r="2"/>`,
  gas:`<path d="M12 26v9h16v-9a7 7 0 0 0 3-13 7 7 0 0 0-11-6 7 7 0 0 0-11 6 7 7 0 0 0 3 13z"/>`,
  lan:`<path d="M6 5h28a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H17l-9 8v-8H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z"/>`,
  myt:`<path d="M23 2L8 22h10l-3 16 17-22H21z"/>`,
  tec:`<path fill-rule="evenodd" d="M17 3h6l1 4.5 3.5 1.5 4-2.5 4 4-2.5 4 1.5 3.5 4.5 1v6l-4.5 1-1.5 3.5 2.5 4-4 4-4-2.5-3.5 1.5-1 4.5h-6l-1-4.5-3.5-1.5-4 2.5-4-4 2.5-4L7 24l-4.5-1v-6L7 16l1.5-3.5-2.5-4 4-4 4 2.5L17 7.5zm3 11a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/>`,
  cap:`<path d="M8 3h3v34H8z M11 5c6-3 10 3 19 0v15c-9 3-13-3-19 0z"/>`,
  eco:`<ellipse cx="20" cy="30" rx="13" ry="5"/><ellipse cx="20" cy="22.5" rx="13" ry="5"/><ellipse cx="20" cy="15" rx="13" ry="5"/>`
};
let BID = 0;
function star(cx, cy, n, R, r){ let d = ""; for (let i=0;i<n*2;i++){ const a = Math.PI*i/n - Math.PI/2, rr = i%2 ? r : R; d += (i?"L":"M")+(cx+rr*Math.cos(a)).toFixed(1)+" "+(cy+rr*Math.sin(a)).toFixed(1); } return d+"Z"; }
function poly(cx, cy, n, R, rot){ let d = ""; for (let i=0;i<n;i++){ const a = 2*Math.PI*i/n + (rot||0); d += (i?"L":"M")+(cx+R*Math.cos(a)).toFixed(1)+" "+(cy+R*Math.sin(a)).toFixed(1); } return d+"Z"; }

function badgeSVG(tier, icon, size, label){
  const t = TIERS[tier], id = "b"+(BID++), cx = 50, cy = 48;
  let outer;
  if (tier === "or") outer = star(cx, cy, 14, 42, 37);
  else if (tier === "platine") outer = poly(cx, cy, 6, 42, Math.PI/6);
  else if (tier === "diamant") outer = poly(cx, cy, 8, 42, Math.PI/8);
  else if (tier === "maitre") outer = star(cx, cy, 8, 43, 33);
  else outer = `M${cx} ${cy-40}a40 40 0 1 0 .1 0z`;
  const wings = tier === "maitre" ? `<path d="M14 40 C-2 34 -4 18 2 10 C6 22 12 26 22 28Z M86 40 C102 34 104 18 98 10 C94 22 88 26 78 28Z" fill="url(#${id}-wing)" stroke="#9A6A08" stroke-width="1"/>` : "";
  const facets = tier === "diamant" ? Array.from({length:8},(_,i)=>{ const a = 2*Math.PI*i/8 + Math.PI/8; return `<path d="M${cx} ${cy} L${(cx+42*Math.cos(a)).toFixed(1)} ${(cy+42*Math.sin(a)).toFixed(1)}" stroke="rgba(255,255,255,.45)" stroke-width="1"/>`; }).join("") : "";
  return `<svg viewBox="-4 -4 108 116" width="${size}" height="${size*1.07}" role="img" aria-label="${label||t.n}">
  <defs>
    <radialGradient id="${id}-m" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="${t.c[0]}"/><stop offset=".5" stop-color="${t.c[1]}"/><stop offset="1" stop-color="${t.c[2]}"/></radialGradient>
    <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.c[2]}"/><stop offset=".5" stop-color="${t.c[0]}"/><stop offset="1" stop-color="${t.c[2]}"/></linearGradient>
    <radialGradient id="${id}-face" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="${t.c[0]}"/><stop offset="1" stop-color="${t.c[1]}"/></radialGradient>
    <linearGradient id="${id}-rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.rib[0]}"/><stop offset="1" stop-color="${t.rib[1]}"/></linearGradient>
    <linearGradient id="${id}-wing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF7C0"/><stop offset="1" stop-color="#E0A21A"/></linearGradient>
  </defs>
  <ellipse cx="50" cy="106" rx="26" ry="3.5" fill="rgba(10,6,24,.25)"/>
  <path d="M34 74 L26 106 L36 99 L42 108 L48 80Z M66 74 L74 106 L64 99 L58 108 L52 80Z" fill="url(#${id}-rib)"/>
  ${wings}
  <path d="${outer}" fill="url(#${id}-m)" stroke="${t.c[2]}" stroke-width="1.2"/>
  ${facets}
  <circle cx="${cx}" cy="${cy}" r="29" fill="url(#${id}-rim)"/>
  <circle cx="${cx}" cy="${cy}" r="25.5" fill="url(#${id}-face)"/>
  <g transform="translate(${cx-17} ${cy-17}) scale(.85)">
    <g fill="rgba(255,255,255,.7)" transform="translate(1.2 1.4)">${ICONS[icon]}</g>
    <g fill="${t.c[2]}">${ICONS[icon]}</g>
  </g>
  <path d="M30 26 A26 26 0 0 1 58 21" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
  <path d="${star(80, 16, 4, 6, 1.6)}" fill="#fff" opacity=".9"/>
</svg>`;
}
