/* ---------- Icônes « jeu mobile » : pleines, colorées, contour sombre, reflet ---------- */
const GO = "#2B1D3A";
const gl = (d) => `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>`; // reflet
const GI = {
  home:`<path d="M11 23v16a3 3 0 0 0 3 3h20a3 3 0 0 0 3-3V23" fill="#FFE9C2" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="31" y="9" width="5" height="10" rx="1.5" fill="#C8624A" stroke="${GO}" stroke-width="2.2"/>
    <path d="M5 25 L24 8.5 L43 25" fill="#FF6B5A" stroke="${GO}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M7.5 22.5 L24 8.5 L40.5 22.5 Z" fill="#FF6B5A"/><path d="M5 25 L24 8.5 L43 25" fill="none" stroke="${GO}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
    <rect x="19.5" y="29" width="9" height="13" rx="3" fill="#B86A3A" stroke="${GO}" stroke-width="2.2"/><circle cx="26" cy="36" r="1.1" fill="${GO}"/>${gl("M13 21 L22 13.5")}`,
  play:`<path d="M10 16 Q10 11 16 11 L32 11 Q38 11 38 16 L42 32 Q43 39 36 38 L30 32 L18 32 L12 38 Q5 39 6 32Z" fill="#8A6AF2" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M16 18 v8 M12 22 h8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/><circle cx="31" cy="19" r="2.6" fill="#FF6A8A" stroke="${GO}" stroke-width="1.4"/><circle cx="35" cy="24" r="2.6" fill="#5AE8A0" stroke="${GO}" stroke-width="1.4"/>${gl("M15 14.5 H24")}`,
  shop:`<path d="M17 17 V13 a7 7 0 0 1 14 0 V17" fill="none" stroke="${GO}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M8 17 h32 l-2.6 22.5 a3.5 3.5 0 0 1 -3.5 3 H14.1 a3.5 3.5 0 0 1 -3.5 -3Z" fill="#5AC8FF" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="24" cy="30" r="6" fill="#FFD045" stroke="${GO}" stroke-width="2"/><path d="M24 27 v6" stroke="#C88A10" stroke-width="2" stroke-linecap="round"/>${gl("M12.5 21 L13.5 33")}`,
  parc:`<path d="M15 44 L24 25 L33 44" fill="none" stroke="${GO}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="24" cy="21" r="14" fill="none" stroke="#FF9A3D" stroke-width="4"/><circle cx="24" cy="21" r="14" fill="none" stroke="${GO}" stroke-width="1.6"/>
    ${[0,60,120,180,240,300].map(a => { const r = a*Math.PI/180, x = 24+Math.cos(r)*14, y = 21+Math.sin(r)*14, c = ["#FF6A8A","#5AC8FF","#FFD045","#5AE8A0","#B48AFF","#FF9A3D"][a/60]; return `<path d="M24 21 L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${GO}" stroke-width="1.4"/><rect x="${(x-3.6).toFixed(1)}" y="${(y-2.6).toFixed(1)}" width="7.2" height="6.4" rx="2" fill="${c}" stroke="${GO}" stroke-width="1.6"/>`; }).join("")}
    <circle cx="24" cy="21" r="3.4" fill="#FFE9C2" stroke="${GO}" stroke-width="1.8"/>`,
  user:`<circle cx="24" cy="17" r="8.5" fill="#FFC9A8" stroke="${GO}" stroke-width="2.4"/><path d="M8 42 C9 31 16 27 24 27 S39 31 40 42Z" fill="#F2A947" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>${gl("M19 13 Q21 10.5 24 10.5")}`,
  daily:`<rect x="7" y="11" width="34" height="31" rx="6" fill="#FFFFFF" stroke="${GO}" stroke-width="2.4"/><path d="M7 17 a6 6 0 0 1 6 -6 h22 a6 6 0 0 1 6 6 v4 H7Z" fill="#FF6B5A" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M16 7 v8 M32 7 v8" stroke="${GO}" stroke-width="3" stroke-linecap="round"/><path d="M24 25 l2.6 5.2 5.7.8 -4.1 4 1 5.7 -5.2 -2.7 -5.2 2.7 1 -5.7 -4.1 -4 5.7 -.8z" fill="#FFD045" stroke="${GO}" stroke-width="1.8" stroke-linejoin="round"/>`,
  chrono:`<rect x="20" y="4" width="8" height="5" rx="2" fill="#FF9A3D" stroke="${GO}" stroke-width="2"/><path d="M36 11 l3.5 3.5" stroke="${GO}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="24" cy="27" r="16" fill="#FFB547" stroke="${GO}" stroke-width="2.4"/><circle cx="24" cy="27" r="11.5" fill="#FFFFFF" stroke="${GO}" stroke-width="1.8"/>
    <path d="M24 27 V19.5 M24 27 L29 30" stroke="${GO}" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="27" r="1.8" fill="${GO}"/>${gl("M14 20 Q16 15.5 20.5 14")}`,
  survie:`<path d="M24 42 S6 31 6 18.5 a9.5 9.5 0 0 1 18 -4.3 a9.5 9.5 0 0 1 18 4.3 C42 31 24 42 24 42Z" fill="#FF4F6A" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>${gl("M11.5 16.5 Q12.5 12 17 11.8")}<circle cx="13.5" cy="22.5" r="1.6" fill="#FFFFFF" opacity=".8"/>`,
  avap:`<path d="M12 5 h24 M12 43 h24" stroke="${GO}" stroke-width="3.2" stroke-linecap="round"/><path d="M14 6 h20 c0 9 -7 12 -7 18 s7 9 7 18 H14 c0 -9 7 -12 7 -18 S14 15 14 6Z" fill="#CFF0FF" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M17.5 12 h13 c-1.5 4 -6.5 6 -6.5 9 c0 -3 -5 -5 -6.5 -9Z" fill="#FFD045"/><path d="M16.5 41 c1 -5 7.5 -7 7.5 -10 c0 3 6.5 5 7.5 10Z" fill="#FFD045"/>`,
  mix:`<rect x="5" y="15" width="21" height="21" rx="5" transform="rotate(-12 15.5 25.5)" fill="#FFFFFF" stroke="${GO}" stroke-width="2.4"/>
    ${[[11,20],[19,28],[15,24]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${GO}" transform="rotate(-12 15.5 25.5)"/>`).join("")}
    <rect x="22" y="9" width="21" height="21" rx="5" transform="rotate(14 32.5 19.5)" fill="#FF6B5A" stroke="${GO}" stroke-width="2.4"/>
    ${[[27.5,14.5],[37.5,14.5],[27.5,24.5],[37.5,24.5]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#FFFFFF" transform="rotate(14 32.5 19.5)"/>`).join("")}`,
  revoir:`<path d="M38.5 19 A15.5 15.5 0 1 0 39 29" fill="none" stroke="${GO}" stroke-width="8.5" stroke-linecap="round"/><path d="M38.5 19 A15.5 15.5 0 1 0 39 29" fill="none" stroke="#5AE8A0" stroke-width="5" stroke-linecap="round"/>
    <path d="M32 18 L41 21 L43 11.5Z" fill="#5AE8A0" stroke="${GO}" stroke-width="2.2" stroke-linejoin="round"/><path d="M19 24 l4 4 l7 -8" fill="none" stroke="${GO}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  flame:`<path d="M24 43 C14 43 9 36 10 28 C11 21 17 18 17 11 C22 14 25 19 24 24 C27 22 28 18 28 15 C35 20 39 26 38 32 C37 39 32 43 24 43Z" fill="#FF8A2A" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M24 40 C19 40 17 36.5 18 33 C19 29.5 22 28.5 22 25 C26 27.5 27.5 30 27 33 C29 32 29.5 30.5 29.5 29.5 C31.5 32 32 35 30.5 37 C29 39.5 27 40 24 40Z" fill="#FFD045"/>`,
  star:`<path d="M24 4 l5.6 11.6 12.7 1.8 -9.2 8.9 2.2 12.6 L24 32.9 12.7 38.9 l2.2 -12.6 -9.2 -8.9 12.7 -1.8Z" fill="#FFD045" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>${gl("M17 17.5 L21.5 16.8")}`,
  mission:`<circle cx="24" cy="24" r="18" fill="#FF6B5A" stroke="${GO}" stroke-width="2.4"/><circle cx="24" cy="24" r="12" fill="#FFFFFF" stroke="${GO}" stroke-width="1.8"/><circle cx="24" cy="24" r="6" fill="#FF6B5A" stroke="${GO}" stroke-width="1.8"/><path d="M24 24 L40 8" stroke="${GO}" stroke-width="3" stroke-linecap="round"/><path d="M37 5 l5 1 l1 5 l-4 -1Z" fill="#5AC8FF" stroke="${GO}" stroke-width="1.6" stroke-linejoin="round"/>`,
  trophy:`<path d="M15 7 h18 v10 a9 9 0 0 1 -18 0Z" fill="#FFD045" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/><path d="M15 10 H9 a6 6 0 0 0 7 9 M33 10 h6 a6 6 0 0 1 -7 9" fill="none" stroke="${GO}" stroke-width="2.4"/>
    <path d="M21 26 h6 l1 8 h-8Z" fill="#E8A21A" stroke="${GO}" stroke-width="2"/><rect x="14" y="34" width="20" height="7" rx="2.5" fill="#B86A3A" stroke="${GO}" stroke-width="2.2"/>${gl("M19 11 V16")}`,
  book:`<path d="M24 12 Q15 7 6 10 V39 Q15 36 24 41Z" fill="#5AC8FF" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 12 Q33 7 42 10 V39 Q33 36 24 41Z" fill="#8A6AF2" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M10 17 Q15 15.5 20 17 M10 23 Q15 21.5 20 23 M28 17 Q33 15.5 38 17" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".85"/>`,
  chart:`<rect x="7" y="25" width="9" height="16" rx="2.5" fill="#5AE8A0" stroke="${GO}" stroke-width="2.2"/><rect x="19.5" y="16" width="9" height="25" rx="2.5" fill="#5AC8FF" stroke="${GO}" stroke-width="2.2"/><rect x="32" y="8" width="9" height="33" rx="2.5" fill="#FF9A3D" stroke="${GO}" stroke-width="2.2"/><path d="M5 43 H43" stroke="${GO}" stroke-width="2.6" stroke-linecap="round"/>`,
  gear:`<path d="M21 5 h6 l1.2 5 a14 14 0 0 1 4.3 2.5 l4.9 -1.6 3 5.2 -3.8 3.4 a14 14 0 0 1 0 5 l3.8 3.4 -3 5.2 -4.9 -1.6 a14 14 0 0 1 -4.3 2.5 L27 43 h-6 l-1.2 -5 a14 14 0 0 1 -4.3 -2.5 l-4.9 1.6 -3 -5.2 3.8 -3.4 a14 14 0 0 1 0 -5 L7.6 20.1 l3 -5.2 4.9 1.6 a14 14 0 0 1 4.3 -2.5Z" fill="#B8C2D6" stroke="${GO}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="24" r="6" fill="#FFFFFF" stroke="${GO}" stroke-width="2.2"/>`,
  lock:`<path d="M15 21 V15 a9 9 0 0 1 18 0 V21" fill="none" stroke="${GO}" stroke-width="3.2"/><rect x="9" y="20" width="30" height="22" rx="6" fill="#FFD045" stroke="${GO}" stroke-width="2.4"/><circle cx="24" cy="30" r="3" fill="${GO}"/><path d="M24 31 v5" stroke="${GO}" stroke-width="3" stroke-linecap="round"/>`,
  joker:`<rect x="9" y="6" width="24" height="34" rx="4" transform="rotate(-10 21 23)" fill="#FFFFFF" stroke="${GO}" stroke-width="2.2"/><rect x="16" y="8" width="24" height="34" rx="4" transform="rotate(8 28 25)" fill="#8A6AF2" stroke="${GO}" stroke-width="2.2"/><text x="28" y="31" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="11" fill="#FFFFFF" transform="rotate(8 28 25)">50</text>`,
  gift:`<rect x="7" y="18" width="34" height="9" rx="2.5" fill="#FF6A8A" stroke="${GO}" stroke-width="2.2"/><rect x="10" y="27" width="28" height="15" rx="2.5" fill="#FF6A8A" stroke="${GO}" stroke-width="2.2"/><path d="M24 18 V42" stroke="#FFD045" stroke-width="5"/><path d="M24 18 C18 8 10 12 16 18 M24 18 C30 8 38 12 32 18" fill="none" stroke="${GO}" stroke-width="2.4"/>`,
  shirt:`<path d="M17 7 L8 12 L4 21 L11 24 L12 41 H36 L37 24 L44 21 L40 12 L31 7 Q24 13 17 7Z" fill="#FF9A3D" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/><path d="M19 8 Q24 12 29 8" fill="none" stroke="${GO}" stroke-width="2"/><path d="M14 30 H34" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>`,
  crown:`<path d="M7 36 L5 13 L16 22 L24 9 L32 22 L43 13 L41 36Z" fill="#FFD045" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/><rect x="7" y="35" width="34" height="6" rx="2" fill="#E8A21A" stroke="${GO}" stroke-width="2.2"/><circle cx="24" cy="27" r="3" fill="#FF6A8A" stroke="${GO}" stroke-width="1.4"/>`,
  quote:`<path d="M8 10 h32 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 H22 l-8 7 v-7 H8 a4 4 0 0 1 -4 -4 V14 a4 4 0 0 1 4 -4Z" fill="#FFFFFF" stroke="${GO}" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 26 q0 -6 5 -8 M24 26 q0 -6 5 -8" fill="none" stroke="#8A6AF2" stroke-width="4" stroke-linecap="round"/><circle cx="15" cy="26" r="3" fill="#8A6AF2"/><circle cx="25" cy="26" r="3" fill="#8A6AF2"/>${gl("M10 14 H20")}`,
  up:`<circle cx="24" cy="24" r="18" fill="#5AE8A0" stroke="${GO}" stroke-width="2.4"/><path d="M24 34 V15 M15.5 22 L24 13.5 L32.5 22" fill="none" stroke="#FFFFFF" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>`
};
/* ---------- Icônes en relief (v2, validées) : extrusion, dégradés, reflets, ombre ---------- */
const GI3 = (() => {
const D = "#2B1D3A";
const lg = (id,a,b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const sh = (y=59,rx=18) => `<ellipse cx="32" cy="${y}" rx="${rx}" ry="3.6" fill="#000" opacity=".25"/>`;
const shine = d => `<path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/>`;
const S = `stroke="${D}" stroke-width="2.5" stroke-linejoin="round"`;
let uid = 0;
const I = {
  home(){ const u=uid++; return `<defs>${lg("hw"+u,"#FFF7E8","#F2C287")}${lg("hr"+u,"#FF9F8A","#E2424B")}${lg("hd"+u,"#D08C58","#8A4E26")}</defs>${sh()}
    <g class="smoke"><circle cx="45" cy="6" r="3.4" fill="#fff"/><circle cx="49" cy="2" r="2.6" fill="#fff"/><circle cx="44" cy="-2" r="2" fill="#fff"/></g>
    <rect x="40" y="11" width="9" height="15" rx="2" fill="#B5473F" ${S}/>
    <rect x="14" y="31" width="36" height="25" rx="6" fill="#B9773F" ${S}/>
    <rect x="14" y="27" width="36" height="25" rx="6" fill="url(#hw${u})" ${S}/>
    <path d="M7 34.5 L32 13.5 L57 34.5 Q58.5 38.5 55 38.5 H9 Q5.5 38.5 7 34.5Z" fill="#A82E35" ${S}/>
    <path d="M7 31 L32 10 L57 31 Q58.5 35 55 35 H9 Q5.5 35 7 31Z" fill="url(#hr${u})" ${S}/>
    ${shine("M14 29.5 L29 16.5")}
    <path d="M26 52 V44 a6 6 0 0 1 12 0 V52Z" fill="url(#hd${u})" ${S}/><circle cx="35" cy="47.5" r="1.3" fill="${D}"/>
    <circle cx="20.5" cy="43" r="4.4" fill="#9BE7FF" stroke="${D}" stroke-width="2.2"/><path d="M18.6 41.6 l2.4 -1.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="44" cy="43" r="4.4" fill="#9BE7FF" stroke="${D}" stroke-width="2.2"/><path d="M42.1 41.6 l2.4 -1.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`; },
  play(){ const u=uid++; const body="M14 22 Q14 15 21 15 H43 Q50 15 50 22 L55 40 Q57 51 47 49 L40.5 42 H23.5 L17 49 Q7 51 9 40Z"; return `<defs>${lg("pp"+u,"#C7B5FF","#6E4BEA")}</defs>${sh(58,20)}
    <path d="${body}" transform="translate(0 4.5)" fill="#4228A0" ${S}/>
    <path d="${body}" fill="url(#pp${u})" ${S}/>
    ${shine("M19 19.5 H31")}
    <path d="M19 27 h5.5 v-5.5 h5.5 v5.5 h5.5 v5.5 h-5.5 v5.5 h-5.5 v-5.5 h-5.5z" fill="#fff" stroke="${D}" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="42" cy="25.5" r="4" fill="#FF6A8A" stroke="${D}" stroke-width="2.2"/><circle cx="41" cy="24.3" r="1.2" fill="#fff"/>
    <circle cx="47.5" cy="32" r="4" fill="#5AE8A0" stroke="${D}" stroke-width="2.2"/><circle cx="46.5" cy="30.8" r="1.2" fill="#fff"/>`; },
  shop(){ const u=uid++; const bag="M11 23 H53 L49.5 51 Q49 55 45 55 H19 Q15 55 14.5 51Z"; const coin=(cx,cy,r)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sc${u})" stroke="${D}" stroke-width="2.2"/><circle cx="${cx}" cy="${cy}" r="${r*.62}" fill="none" stroke="#C98A10" stroke-width="1.6"/><path d="M${cx} ${cy-r*.42} v${r*.84}" stroke="#C98A10" stroke-width="2.2" stroke-linecap="round"/>`; return `<defs>${lg("sb"+u,"#A6E8FF","#2B8FDA")}${lg("sc"+u,"#FFE98A","#F0A61C")}</defs>${sh()}
    <path d="M23 25 V18 a9 9 0 0 1 18 0 V25" fill="none" stroke="${D}" stroke-width="6.5" stroke-linecap="round"/><path d="M23 25 V18 a9 9 0 0 1 18 0 V25" fill="none" stroke="#FFB547" stroke-width="3" stroke-linecap="round"/>
    <path d="${bag}" transform="translate(0 4)" fill="#17639F" ${S}/>
    <path d="${bag}" fill="url(#sb${u})" ${S}/>
    <path d="M11.4 23 H52.6 L51.9 29 H12.1Z" fill="#fff" opacity=".35"/>
    ${shine("M16 30 L18 46")}
    <g>${coin(32,40,8.5)}</g>
    <g class="pop">${coin(32,14,6.5)}</g>`; },
  adv(){ const u=uid++; return `<defs>${lg("am"+u,"#FFF4D6","#F0C070")}</defs>${sh()}
    <path d="M9 17 L23 12 L41 17 L55 12 L55 50 L41 55 L23 50 L9 55Z" fill="#B8803A" transform="translate(0 3)" ${S}/><path d="M9 17 L23 12 L41 17 L55 12 L55 50 L41 55 L23 50 L9 55Z" fill="url(#am${u})" ${S}/>
    <path d="M23 12 V50 M41 17 V55" stroke="#C8964A" stroke-width="2"/>
    <path d="M13 36 q3 -7 9 -4 q4 3 -1 8 q-6 3 -8 -4Z" fill="#7AD04A" stroke="${D}" stroke-width="1.8"/><path d="M44 40 q4 -5 8 -1 q1 5 -4 6 q-5 0 -4 -5Z" fill="#5AC8FF" stroke="${D}" stroke-width="1.8"/>
    <path d="M17 46 Q24 38 29 31 T43 23" fill="none" stroke="#E2283A" stroke-width="2.6" stroke-dasharray="1.6 4.4" stroke-linecap="round"/>
    <path d="M40 18 l8 8 M48 18 l-8 8" stroke="${D}" stroke-width="5.4" stroke-linecap="round"/><path d="M40 18 l8 8 M48 18 l-8 8" stroke="#E2283A" stroke-width="2.8" stroke-linecap="round"/>
    ${shine("M13 20 L20 17.5")}`; },
  parc(){ const u=uid++; const cols=["#FF6A8A","#5AC8FF","#FFD045","#5AE8A0","#B48AFF","#FF9A3D"]; let spokes="",cabs="";
    for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/2,x=32+Math.cos(a)*18,y=27+Math.sin(a)*18; spokes+=`<path d="M32 27 L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${D}" stroke-width="1.6"/>`; cabs+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="${cols[i]}" stroke="${D}" stroke-width="2"/><circle cx="${(x-1.4).toFixed(1)}" cy="${(y-1.5).toFixed(1)}" r="1.3" fill="#fff" opacity=".85"/>`;}
    return `${sh()}
    <path d="M19 56 L32 29 L45 56" fill="none" stroke="${D}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 56 L32 29 L45 56" fill="none" stroke="#8A6AF2" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="13" y="53" width="38" height="6" rx="3" fill="#6B4FD8" stroke="${D}" stroke-width="2.2"/>
    <g class="wheel"><circle cx="32" cy="29.5" r="18" fill="none" stroke="#B85E14" stroke-width="6"/>
    <circle cx="32" cy="27" r="18" fill="none" stroke="${D}" stroke-width="7.5"/><circle cx="32" cy="27" r="18" fill="none" stroke="#FFA347" stroke-width="4"/>
    <circle cx="32" cy="27" r="11" fill="none" stroke="#FFD9A0" stroke-width="1.6" opacity=".8"/>${spokes}${cabs}
    <circle cx="32" cy="27" r="4.4" fill="#FFE9C2" stroke="${D}" stroke-width="2.2"/></g>`; },
  user(){ const u=uid++; return `<defs>${lg("ub"+u,"#FFDB8A","#F28F23")}</defs>${sh(59,17)}
    <path class="arm" d="M47 38 q7 -3 8 -11" fill="none" stroke="${D}" stroke-width="6.5" stroke-linecap="round"/>
    <ellipse cx="32" cy="41" rx="18" ry="16" fill="#C2661A" ${S}/>
    <ellipse cx="32" cy="37" rx="18" ry="16" fill="url(#ub${u})" ${S}/>
    <path class="arm" d="M47 38 q7 -3 8 -11" fill="none" stroke="#F7A93B" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 22 q-1 -8 -9 -10 q1 8 9 10z" fill="#5AE8A0" stroke="${D}" stroke-width="2.2" stroke-linejoin="round"/>
    ${shine("M19.5 30 Q22 25 27.5 23.5")}
    <g class="eyes"><ellipse cx="25.5" cy="36" rx="2.7" ry="3.6" fill="${D}"/><ellipse cx="38.5" cy="36" rx="2.7" ry="3.6" fill="${D}"/><circle cx="26.3" cy="34.6" r="1" fill="#fff"/><circle cx="39.3" cy="34.6" r="1" fill="#fff"/></g>
    <ellipse cx="21" cy="42" rx="3.4" ry="2" fill="#FF6A8A" opacity=".55"/><ellipse cx="43" cy="42" rx="3.4" ry="2" fill="#FF6A8A" opacity=".55"/>
    <path d="M28.5 42.5 q3.5 3.5 7 0" fill="none" stroke="${D}" stroke-width="2.2" stroke-linecap="round"/>`; },
  tower(){ const u=uid++;
    return `<defs>${lg("tw"+u,"#8E7CB8","#3E2E66")}${lg("tr"+u,"#FF8AB8","#C2185B")}</defs>${sh(59,16)}
    <path d="M22 58 L24 22 H40 L42 58Z" transform="translate(0 2.5)" fill="#22163A" ${S}/>
    <path d="M22 58 L24 22 H40 L42 58Z" fill="url(#tw${u})" ${S}/>
    <path d="M20 22 V15 H24 V18 H28 V15 H32 V18 H36 V15 H40 V18 H44 V22Z" fill="#5A4A86" ${S}/>
    <path d="M27 15 L32 3 L37 15Z" fill="url(#tr${u})" ${S}/>
    <path d="M24 34 H40 M23.5 46 H40.5" stroke="${D}" stroke-width="1.6" opacity=".5"/>
    <rect x="29" y="27" width="6" height="7" rx="3" fill="#FFD23F" stroke="${D}" stroke-width="1.8" class="tw-ic-win"/>
    <path d="M28 58 V51 Q32 46 36 51 V58Z" fill="#1A1030" stroke="${D}" stroke-width="2"/>
    <path d="M47 8 L43 17 L47 17 L44 25" fill="none" stroke="#FFE36A" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" class="tw-ic-bolt"/>
    ${shine("M26.5 25 L25.5 44")}`; },
  sword(){ const u=uid++; const blade="M28.5 40 V12 L32 5 L35.5 12 V40Z";
    return `<defs>${lg("sw"+u,"#F4FBFF","#8FB8E0")}${lg("sg"+u,"#FFE07A","#F0A020")}</defs>${sh(59,15)}
    <g transform="rotate(40 32 32)">
    <path d="${blade}" transform="translate(0 2.5)" fill="#4A6E99" ${S}/>
    <path d="${blade}" fill="url(#sw${u})" ${S}/>
    <path d="M32 9 V38" stroke="#B9D4EE" stroke-width="1.6"/>
    ${shine("M30.6 14 V30")}
    <rect x="21" y="39.5" width="22" height="6.5" rx="3.2" fill="#B86A10" ${S} transform="translate(0 2)"/>
    <rect x="21" y="39.5" width="22" height="6.5" rx="3.2" fill="url(#sg${u})" ${S}/>
    <rect x="29" y="46" width="6" height="10" rx="2" fill="#7A3FD0" ${S}/>
    <path d="M29.5 49 h5 M29.5 52.5 h5" stroke="#5A2AA0" stroke-width="1.4"/>
    <circle cx="32" cy="59" r="3.6" fill="url(#sg${u})" ${S}/>
    <circle cx="23.5" cy="41.5" r="1.1" fill="#fff" opacity=".8"/></g>
    <path class="pop" d="M50 8 l1.6 3.6 3.6 1.6-3.6 1.6L50 18.4l-1.6-3.6-3.6-1.6 3.6-1.6z" fill="#FFD23F" stroke="${D}" stroke-width="1.6" stroke-linejoin="round"/>`; },
  amis(){ const u=uid++; const eyes=(x,y)=>`<ellipse cx="${x-5}" cy="${y}" rx="2.2" ry="3" fill="${D}"/><ellipse cx="${x+5}" cy="${y}" rx="2.2" ry="3" fill="${D}"/><circle cx="${x-4.3}" cy="${y-1.2}" r=".9" fill="#fff"/><circle cx="${x+5.7}" cy="${y-1.2}" r=".9" fill="#fff"/>`;
    return `<defs>${lg("ab"+u,"#9AE0FF","#3A8FE0")}${lg("ap"+u,"#FFB3D0","#F0508E")}</defs>${sh(59,22)}
    <ellipse cx="22" cy="40" rx="14" ry="14" fill="#1F5FA8" ${S}/><ellipse cx="22" cy="36.5" rx="14" ry="14" fill="url(#ab${u})" ${S}/>
    ${shine("M12 32 Q14 27 19 25.5")}<g class="eyes">${eyes(22,35)}</g><path d="M19 41 q3 2.5 6 0" fill="none" stroke="${D}" stroke-width="2" stroke-linecap="round"/>
    <g class="arm"><ellipse cx="42" cy="44" rx="15" ry="14" fill="#B02A62" ${S}/><ellipse cx="42" cy="40.5" rx="15" ry="14" fill="url(#ap${u})" ${S}/>
    ${shine("M31 36 Q33 31 38 29.5")}<g class="eyes">${eyes(42,39)}</g><ellipse cx="34" cy="45" rx="2.8" ry="1.7" fill="#FF6A8A" opacity=".6"/><ellipse cx="50" cy="45" rx="2.8" ry="1.7" fill="#FF6A8A" opacity=".6"/>
    <path d="M38.5 45 q3.5 3.5 7 0" fill="none" stroke="${D}" stroke-width="2.2" stroke-linecap="round"/></g>
    <path d="M32 9 l2 4.5 4.8.4-3.6 3.2 1.1 4.7L32 19.3l-4.3 2.5 1.1-4.7-3.6-3.2 4.8-.4z" fill="#FFD23F" stroke="${D}" stroke-width="2" stroke-linejoin="round" class="pop"/>`; },
  heart(){ const u=uid++; const h="M32 54 S10 41 10 24.5 a11.5 11.5 0 0 1 22 -5.3 a11.5 11.5 0 0 1 22 5.3 C54 41 32 54 32 54Z"; return `<defs>${lg("he"+u,"#FF9AAB","#E8274A")}</defs>${sh(59,14)}
    <path d="${h}" transform="translate(0 4)" fill="#A3132F" ${S}/><path d="${h}" fill="url(#he${u})" ${S}/>${shine("M16.5 23 Q17.5 16.5 24 15.8")}<circle cx="17" cy="30" r="2" fill="#fff" opacity=".7"/>`; },
  chrono(){ const u=uid++; return `<defs>${lg("ch"+u,"#FFDF8F","#F28A1E")}</defs>${sh()}
    <rect x="27" y="5" width="10" height="7" rx="2.5" fill="#FF7A45" ${S}/><path d="M47 14 l4 4" stroke="${D}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="32" cy="38" r="19" fill="#B8620E" ${S}/><circle cx="32" cy="34" r="19" fill="url(#ch${u})" ${S}/>
    <circle cx="32" cy="34" r="13.5" fill="#fff" stroke="${D}" stroke-width="2"/>
    <path d="M32 34 V24.5 M32 34 L38.5 38" stroke="${D}" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="34" r="2.2" fill="${D}"/>${shine("M19 26 Q21.5 20 27 18.5")}`; },
  dice(){ const p=(x,y,c=D)=>`<ellipse cx="${x}" cy="${y}" rx="2.5" ry="2.9" fill="${c}"/>`; return `${sh(59,17)}
    <path d="M12 21 L32 31 L32 55 L12 45Z" fill="#DCD6F7" ${S}/><path d="M32 31 L52 21 L52 45 L32 55Z" fill="#B9B0EA" ${S}/>
    <path d="M32 10 L52 20.5 L32 31 L12 20.5Z" fill="#FFFFFF" ${S}/>
    <ellipse cx="32" cy="20.5" rx="3.6" ry="2" fill="#FF5A6A"/>
    ${p(18,31.5)}${p(26,44.5)}${p(37,34)}${p(42,38)}${p(47,42)}`; },
  quote(){ const u=uid++; const b="M12 12 h40 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 H31 l-11 9 v-9 h-8 a6 6 0 0 1 -6 -6 V18 a6 6 0 0 1 6 -6Z"; return `<defs>${lg("qb"+u,"#FFFFFF","#E4DBFF")}</defs>${sh(59,14)}
    <path d="${b}" transform="translate(0 4)" fill="#5B3FC4" ${S}/><path d="${b}" fill="url(#qb${u})" ${S}/>
    <path d="M20 32 q0 -7 6 -9 M33 32 q0 -7 6 -9" fill="none" stroke="#7B5BF0" stroke-width="4.5" stroke-linecap="round"/><circle cx="21.5" cy="32" r="3.6" fill="#7B5BF0"/><circle cx="34.5" cy="32" r="3.6" fill="#7B5BF0"/>`; },
  daily(){ const u=uid++; return `<defs>${lg("dc"+u,"#FFFFFF","#EDE7F7")}${lg("dt"+u,"#FF8C7A","#E2424B")}${lg("ds"+u,"#FFE98A","#F0A61C")}</defs>${sh(59,20)}
    <rect x="9" y="17" width="46" height="40" rx="8" fill="#B9B0D8" ${S}/><rect x="9" y="13" width="46" height="40" rx="8" fill="url(#dc${u})" ${S}/>
    <path d="M9 21 a8 8 0 0 1 8 -8 h30 a8 8 0 0 1 8 8 v4 H9Z" fill="url(#dt${u})" ${S}/>
    <path d="M21 8 v10 M43 8 v10" stroke="${D}" stroke-width="4" stroke-linecap="round"/>
    <path d="M32 28.5 l3.3 6.6 7.3 1.1 -5.3 5.2 1.2 7.3 -6.5 -3.4 -6.5 3.4 1.2 -7.3 -5.3 -5.2 7.3 -1.1z" fill="url(#ds${u})" ${S}/>`; },
  flame(){ return `<path d="M24 43 C14 43 9 36 10 28 C11 21 17 18 17 11 C22 14 25 19 24 24 C27 22 28 18 28 15 C35 20 39 26 38 32 C37 39 32 43 24 43Z" fill="#FF8A2A" stroke="${D}" stroke-width="2.4" stroke-linejoin="round" transform="translate(8 6)"/><path d="M24 40 C19 40 17 36.5 18 33 C19 29.5 22 28.5 22 25 C26 27.5 27.5 30 27 33 C29 32 29.5 30.5 29.5 29.5 C31.5 32 32 35 30.5 37 C29 39.5 27 40 24 40Z" fill="#FFD045" transform="translate(8 6)"/>`; },
  coin(){ const u=uid++; return `<defs>${lg("co"+u,"#FFE98A","#F0A61C")}</defs><circle cx="32" cy="35" r="17" fill="#B8740E" ${S}/><circle cx="32" cy="32" r="17" fill="url(#co${u})" ${S}/><circle cx="32" cy="32" r="11" fill="none" stroke="#C98A10" stroke-width="2.4"/><path d="M32 25 v14" stroke="#C98A10" stroke-width="3.4" stroke-linecap="round"/>${shine("M21 26 Q23 21 28 19.5")}`; }
};

I.survie=I.heart; I.mix=I.dice;
return I;
})();
const gIcon = (k, size, cls) => GI3[k] ? `<svg class="gi g3 ${cls||""}" viewBox="0 0 64 64" width="${size||28}" height="${size||28}" aria-hidden="true">${GI3[k]()}</svg>` : `<svg class="gi ${cls||""}" viewBox="0 0 48 48" width="${size||28}" height="${size||28}" aria-hidden="true">${GI[k]||""}</svg>`;
// Icône de thème : pastille arrondie à la couleur du thème, pictogramme blanc
const thIcon = (k, size) => `<span class="thi" style="--h:${THEMES[k].h};width:${size||40}px;height:${size||40}px"><svg viewBox="0 0 40 40" aria-hidden="true"><g fill="#FFFFFF">${ICONS[k]||""}</g></svg></span>`;
