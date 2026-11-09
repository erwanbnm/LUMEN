/* ---------- Accessoires : chapeaux, objets, auras, socles ---------- */
// Chaque dessin est fait autour de (0,0) : bas-centre pour les chapeaux, centre pour les objets.
const AO = "#2B1D3A";
const ACC = [
  // Chapeaux
  {id:"couronne", n:"Couronne", slot:"tete", p:180, th:"his", draw:() => `<path d="M-17 0 L-19 -17 L-9 -9 L0 -21 L9 -9 L19 -17 L17 0Z" fill="#FFD045" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><path d="M-17 0 L17 0 L16 -5 L-16 -5Z" fill="#E8A21A" stroke="${AO}" stroke-width="2"/><circle cx="0" cy="-21" r="2.6" fill="#FF5A7A" stroke="${AO}" stroke-width="1.4"/><circle cx="-19" cy="-17" r="2" fill="#5AC8FF" stroke="${AO}" stroke-width="1.2"/><circle cx="19" cy="-17" r="2" fill="#5AC8FF" stroke="${AO}" stroke-width="1.2"/><circle cx="0" cy="-2.5" r="2" fill="#FF5A7A"/><path d="M-13 -8 L-11 -4" stroke="#FFF6C0" stroke-width="2" stroke-linecap="round"/>`},
  {id:"mortier", n:"Toque de lauréat", slot:"tete", p:160, th:"sci", draw:() => `<path d="M-12 -2 Q0 4 12 -2 L12 -10 L-12 -10Z" fill="#2E2A4A" stroke="${AO}" stroke-width="2"/><path d="M0 -20 L26 -12 L0 -4 L-26 -12Z" fill="#3E3A62" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-12" r="2" fill="#FFD045"/><path d="M0 -12 Q16 -10 18 -1" fill="none" stroke="#FFD045" stroke-width="1.8"/><path d="M16 -2 l2 8 l2 -8z" fill="#FFD045" stroke="${AO}" stroke-width="1"/>`},
  {id:"beret", n:"Béret", slot:"tete", p:120, th:"gas", draw:() => `<path d="M-20 -3 C-22 -16 -8 -20 2 -19 C16 -18 24 -12 20 -4 C14 1 -14 1 -20 -3Z" fill="#E0445A" stroke="${AO}" stroke-width="2"/><path d="M1 -19 l1 -5" stroke="${AO}" stroke-width="2.4" stroke-linecap="round"/><path d="M-12 -12 Q-4 -16 6 -15" fill="none" stroke="#FF8A9A" stroke-width="2" stroke-linecap="round"/>`},
  {id:"laurier", n:"Couronne de laurier", slot:"tete", p:150, th:"myt", draw:() => `<path d="M-18 0 Q-22 -10 -14 -16" fill="none" stroke="#5E8A2E" stroke-width="2"/><path d="M18 0 Q22 -10 14 -16" fill="none" stroke="#5E8A2E" stroke-width="2"/>${[-1,1].map(s => [0,1,2,3].map(i => `<ellipse cx="${s*(19-i*1.6)}" cy="${-2-i*4.4}" rx="5" ry="2.4" transform="rotate(${s*(-60+i*22)} ${s*(19-i*1.6)} ${-2-i*4.4})" fill="#8BC34A" stroke="${AO}" stroke-width="1.3"/>`).join("")).join("")}`},
  {id:"casquette", n:"Casquette", slot:"tete", p:110, th:"spo", draw:() => `<path d="M-17 -1 C-18 -18 16 -20 17 -2Z" fill="#3E8AE8" stroke="${AO}" stroke-width="2"/><path d="M8 -2 Q24 -4 30 1 Q20 4 6 2Z" fill="#2E6AC8" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-16" r="2" fill="#FFFFFF" stroke="${AO}" stroke-width="1"/><path d="M-6 -10 L4 -10" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>`},
  {id:"casque", n:"Casque audio", slot:"tete", p:170, th:"mus", wide:true, draw:(w) => `<path d="M${-w/2-2} 8 C${-w/2-2} -26 ${w/2+2} -26 ${w/2+2} 8" fill="none" stroke="${AO}" stroke-width="7" stroke-linecap="round"/><path d="M${-w/2-2} 8 C${-w/2-2} -26 ${w/2+2} -26 ${w/2+2} 8" fill="none" stroke="#FF6AA8" stroke-width="4" stroke-linecap="round"/><rect x="${-w/2-8}" y="2" width="11" height="17" rx="5" fill="#FF6AA8" stroke="${AO}" stroke-width="2"/><rect x="${w/2-3}" y="2" width="11" height="17" rx="5" fill="#FF6AA8" stroke="${AO}" stroke-width="2"/>`},
  {id:"fleur", n:"Petite fleur", slot:"tete", p:90, th:"ani", draw:() => `<path d="M0 0 Q2 -6 0 -10" stroke="#4E9A2E" stroke-width="2.2" fill="none"/>${[0,72,144,216,288].map(a => `<ellipse cx="0" cy="-17" rx="4" ry="6" transform="rotate(${a} 0 -12)" fill="#FFB0D0" stroke="${AO}" stroke-width="1.4"/>`).join("")}<circle cx="0" cy="-12" r="3.6" fill="#FFD045" stroke="${AO}" stroke-width="1.4"/>`},
  {id:"noeud", n:"Nœud", slot:"tete", p:80, draw:() => `<path d="M0 -8 L-15 -16 Q-19 -8 -15 0Z" fill="#FF6A9A" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><path d="M0 -8 L15 -16 Q19 -8 15 0Z" fill="#FF6A9A" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-8" r="4.4" fill="#FF8AB4" stroke="${AO}" stroke-width="2"/>`},
  {id:"magicien", n:"Chapeau de magicien", slot:"tete", p:200, draw:() => `<path d="M-14 -2 L-4 -36 Q0 -40 3 -35 L14 -2Z" fill="#5A3AB8" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="0" cy="-1" rx="21" ry="4.5" fill="#4A2A98" stroke="${AO}" stroke-width="2"/>${[[-4,-14],[4,-24],[3,-8]].map(([x,y]) => `<path d="M${x} ${y-3} l1 2.2 l2.4 .3 l-1.8 1.6 l.5 2.4 l-2.1 -1.2 l-2.1 1.2 l.5 -2.4 l-1.8 -1.6 l2.4 -.3z" fill="#FFD045"/>`).join("")}`},
  {id:"bulle", n:"Casque de cosmonaute", slot:"tete", p:220, th:"esp", bubble:true, draw:() => ""},
  // Objets tenus
  {id:"carte", n:"Carte au trésor", slot:"main", p:120, th:"geo", draw:() => `<g transform="rotate(-10)"><path d="M-11 -9 L11 -9 L11 9 L-11 9Z" fill="#F4DFA8" stroke="${AO}" stroke-width="2"/><path d="M-11 -9 Q-14 -10 -14 -6 L-14 10 Q-14 13 -11 9" fill="#E8C880" stroke="${AO}" stroke-width="1.6"/><path d="M-7 4 Q-2 -2 2 1 Q5 4 7 -4" fill="none" stroke="#B84A2A" stroke-width="1.4" stroke-dasharray="2 2"/><path d="M5 -6 l4 4 M9 -6 l-4 4" stroke="#E0303A" stroke-width="2" stroke-linecap="round"/></g>`},
  {id:"manette", n:"Manette", slot:"main", p:140, th:"jeu", draw:() => `<path d="M-14 -4 Q-14 -9 -8 -9 L8 -9 Q14 -9 14 -4 L16 6 Q16 11 11 10 L6 5 L-6 5 L-11 10 Q-16 11 -16 6Z" fill="#5E4AD8" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><path d="M-9 -3 v6 M-12 0 h6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="-3" r="1.8" fill="#FF5A7A"/><circle cx="11" cy="1" r="1.8" fill="#5AE88A"/>`},
  {id:"clap", n:"Clap de cinéma", slot:"main", p:130, th:"cin", draw:() => `<rect x="-12" y="-4" width="24" height="15" rx="2" fill="#2B2B3A" stroke="${AO}" stroke-width="2"/><g transform="rotate(-14 -12 -4)"><rect x="-12" y="-11" width="24" height="7" fill="#FFFFFF" stroke="${AO}" stroke-width="2"/><path d="M-8 -11 l4 7 M0 -11 l4 7 M8 -11 l4 7" stroke="${AO}" stroke-width="3"/></g><path d="M-8 3 h16 M-8 7 h10" stroke="#FFFFFF" stroke-width="1.4" opacity=".7"/>`},
  {id:"livre", n:"Livre", slot:"main", p:100, th:"lan", draw:() => `<path d="M0 -8 Q-8 -12 -15 -9 L-15 9 Q-8 6 0 10Z" fill="#FFFFFF" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><path d="M0 -8 Q8 -12 15 -9 L15 9 Q8 6 0 10Z" fill="#FFF6E0" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><path d="M-11 -4 h7 M-11 0 h7 M4 -4 h7 M4 0 h5" stroke="#9A8AB0" stroke-width="1.4" stroke-linecap="round"/><path d="M-16 10 Q-8 7 0 11 Q8 7 16 10" fill="none" stroke="#C83A5A" stroke-width="2.4"/>`},
  {id:"loupe", n:"Loupe", slot:"main", p:110, th:"ins", draw:() => `<path d="M5 6 L14 16" stroke="#8A5A2E" stroke-width="5" stroke-linecap="round"/><path d="M5 6 L14 16" stroke="${AO}" stroke-width="1.6" stroke-linecap="round" opacity=".4"/><circle cx="-2" cy="-1" r="10" fill="#CFF0FF" fill-opacity=".55" stroke="${AO}" stroke-width="2.4"/><circle cx="-2" cy="-1" r="10" fill="none" stroke="#C8A040" stroke-width="1.6"/><path d="M-7 -5 Q-5 -8 -2 -8" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>`},
  {id:"ballon", n:"Ballon de fête", slot:"main", p:90, draw:() => `<path d="M0 6 Q-4 14 2 22" fill="none" stroke="${AO}" stroke-width="1.4"/><ellipse cx="0" cy="-6" rx="10" ry="12" fill="#5AC8FF" stroke="${AO}" stroke-width="2"/><path d="M-2 6 l2 -2 l2 2z" fill="#3AA0E0" stroke="${AO}" stroke-width="1.2"/><ellipse cx="-4" cy="-11" rx="2.4" ry="4" fill="#FFFFFF" opacity=".7"/>`},
  {id:"piece", n:"Grosse pièce", slot:"main", p:150, th:"eco", draw:() => `<circle r="11" fill="#FFD045" stroke="${AO}" stroke-width="2"/><circle r="7.5" fill="none" stroke="#E8A21A" stroke-width="1.8"/><path d="M-2 -4 Q2 -6 3 -3 Q3 0 -1 1 Q-3 3 0 4 Q3 4 3 3 M0 -6 v13" fill="none" stroke="#C88A10" stroke-width="1.8" stroke-linecap="round"/><path d="M-7 -6 Q-5 -9 -1 -9" stroke="#FFF6C0" stroke-width="2" fill="none" stroke-linecap="round"/>`},
  // Auras
  {id:"etincelles", n:"Étincelles", slot:"aura", p:160, draw:(b) => [[b.x-6,b.y+10,1],[b.x+b.w+6,b.y+20,.8],[b.x+4,b.y+b.h-14,.7],[b.x+b.w-2,b.y-2,.9],[b.cx+2,b.y-10,.6]].map(([x,y,k],i) => `<path class="atw" style="animation-delay:${i*.3}s;transform-origin:${x}px ${y}px" d="M${x} ${y-7*k} Q${x+1.4*k} ${y-1.4*k} ${x+7*k} ${y} Q${x+1.4*k} ${y+1.4*k} ${x} ${y+7*k} Q${x-1.4*k} ${y+1.4*k} ${x-7*k} ${y} Q${x-1.4*k} ${y-1.4*k} ${x} ${y-7*k}Z" fill="#FFE36A"/>`).join("")},
  {id:"bulles", n:"Bulles", slot:"aura", p:120, draw:(b) => [[b.x-4,b.y+18,5],[b.x+b.w+4,b.y+8,4],[b.x+b.w+8,b.y+30,3],[b.x-8,b.y+36,3]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#BFEFFF" fill-opacity=".35" stroke="#7FD6FF" stroke-width="1.4"/><circle cx="${x-r*.35}" cy="${y-r*.35}" r="${r*.25}" fill="#FFFFFF"/>`).join("")},
  {id:"coeurs", n:"Petits cœurs", slot:"aura", p:140, draw:(b) => [[b.x-6,b.y+14,1],[b.x+b.w+6,b.y+6,.8],[b.x+b.w+2,b.y+34,.7]].map(([x,y,k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 4 C-8 -2 -6 -9 0 -5 C6 -9 8 -2 0 4Z" fill="#FF6A9A" stroke="${AO}" stroke-width="1.2"/>`).join("")},
  // Socles
  {id:"nuage", n:"Petit nuage", slot:"sol", p:130, draw:() => `<path d="M-30 4 Q-34 -4 -24 -6 Q-22 -13 -12 -10 Q-6 -16 4 -11 Q14 -15 20 -8 Q32 -8 30 2 Q32 10 20 9 L-22 9 Q-34 10 -30 4Z" fill="#FFFFFF" stroke="#A8B4D8" stroke-width="2"/><path d="M-20 2 Q-10 5 0 2" fill="none" stroke="#DCE4F8" stroke-width="2" stroke-linecap="round"/>`},
  {id:"tapis", n:"Tapis volant", slot:"sol", p:180, draw:() => `<path d="M-32 0 Q-16 -6 0 0 Q16 6 32 0 L30 8 Q14 14 0 8 Q-16 2 -30 8Z" fill="#C83A5A" stroke="${AO}" stroke-width="2" stroke-linejoin="round"/><path d="M-26 3 Q-14 -1 0 4 Q14 9 26 4" fill="none" stroke="#FFD045" stroke-width="1.6" stroke-dasharray="3 2"/>${[-32,32].map(x => `<path d="M${x} ${x<0?0:0} l${x<0?-4:4} 3 M${x+(x<0?2:-2)} 8 l${x<0?-4:4} 3" stroke="#FFD045" stroke-width="1.6" stroke-linecap="round"/>`).join("")}`}
];
const ACC_SLOTS = {tete:"Chapeaux", main:"Objets", aura:"Auras", sol:"Socles"};

// Boîte englobante de chaque personnage, mesurée une fois dans le navigateur
const _bbox = new Map();
function charBox(c){
  if (_bbox.has(c)) return _bbox.get(c);
  let b = {x:30, y:22, w:60, h:76};
  try {
    const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 120 116"); svg.setAttribute("width", "120"); svg.setAttribute("height", "116");
    svg.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden";
    svg.innerHTML = `<g>${c.draw()}</g>`; document.body.appendChild(svg);
    // On mesure les formes pleines (sans halos ni ombres flous)
    const g = svg.firstChild; [...g.querySelectorAll("[filter],[opacity]")].forEach(el => { if (+el.getAttribute("opacity") < .6 || /glow|soft/.test(el.getAttribute("filter")||"")) el.remove(); });
    // Effets animés (zzz, lueurs, pluie, spores, étincelles) : hors de la silhouette
    g.querySelectorAll(".so-zzz,.ta-pulse,.ta-rain,.ta-spore,.ta-ember,.ta-twinkle").forEach(el => el.remove());
    const r = g.getBBox(); if (r.width > 4) b = {x:r.x, y:r.y, w:r.width, h:r.height};
    svg.remove();
  } catch(e){}
  b.cx = b.x + b.w/2; _bbox.set(c, b); return b;
}
// Personnage habillé : même cadre que creatureSVG, avec accessoires par-dessus
function dressedSVG(c, acc, size){
  acc = acc || {}; const b = charBox(c), get = s => acc[s] && ACC.find(a => a.id === acc[s]);
  // noHat : le personnage porte déjà quelque chose sur la tête (bonnet, casque, chapeau) : pas de chapeau par-dessus
  const hat = c.noHat && get("tete") && !get("tete").bubble ? null : get("tete"), hand = get("main"), aura = get("aura"), sol = get("sol");
  const H = c.hat || {};
  // H.at : point d'accroche fixe [x, y] du chapeau (personnages dont les effets agrandissent la boîte englobante)
  const k = H.k || Math.max(.75, Math.min(1.25, b.w/58));
  const hx = H.at ? H.at[0] : b.cx + (H.dx||0), hy = H.at ? H.at[1] : b.y + 6 + (H.dy||0);
  let back = "", front = "";
  if (aura) back += aura.draw(b);
  if (sol) back += `<g transform="translate(${b.cx} ${b.y+b.h+2})">${sol.draw(b)}</g>`;
  if (hat && hat.bubble) front += `<ellipse cx="${b.cx}" cy="${b.y+b.h/2}" rx="${b.w/2+10}" ry="${b.h/2+9}" fill="#CFF0FF" fill-opacity=".22" stroke="#FFFFFF" stroke-width="3" stroke-opacity=".85"/><ellipse cx="${b.cx}" cy="${b.y+b.h/2}" rx="${b.w/2+10}" ry="${b.h/2+9}" fill="none" stroke="#7FA8D8" stroke-width="1.4"/><path d="M${b.cx-b.w/2-2} ${b.y+b.h*.28} Q${b.cx-b.w/4} ${b.y-4} ${b.cx+4} ${b.y-5}" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".8"/><rect x="${b.cx-b.w/2-6}" y="${b.y+b.h+2}" width="${b.w+12}" height="7" rx="3.5" fill="#C8D0E0" stroke="${AO}" stroke-width="1.6"/>`;
  else if (hat) front += `<g transform="translate(${hx} ${hy}) scale(${hat.wide?1:k})">${hat.draw(b.w*.86)}</g>`;
  if (hand) front += `<g transform="translate(${Math.min(108, b.x+b.w+4)} ${b.y+b.h*.62}) rotate(8)">${hand.draw(b)}</g>`;
  const shadow = `<ellipse cx="60" cy="${c.float?110:106}" rx="${c.float?22:32}" ry="4.5" fill="rgba(10,6,24,.28)"/>`;
  const body = c.toy ? `<g class="tbreath">${c.draw()}</g>` : `<g filter="url(#paint)">${c.draw()}</g>`;
  return `<svg class="${c.toy ? "toyc " + (c.anim ? "t-" + c.anim : "") : ""}" style="overflow:visible${c.toy ? ";--bd:" + blinkDelay(c) + "s" : ""}" viewBox="-12 -16 144 140" width="${size}" height="${Math.round(size*140/144)}" aria-hidden="true">${back}${shadow}
  <g class="${c.float?"fl":""}">${body}${front}</g></svg>`;
}
