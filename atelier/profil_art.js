/* Lumen · Emblèmes de prestige, rangs de maîtrise, bannières et cadres de la carte de visite.
   Généré depuis prototypes/prestiges.html, maitrise.html, carte.html et collections.html (validés par Erwan). */
const PArt = (() => {

const TD = "#2B1D3A";
let U = 0;
let NS = 0, PF = "pa0_";
const uid = () => PF + (U++);
const ns = () => { U = 0; PF = "pa" + (NS++) + "_"; };
const lg = (a, b, id = uid()) => [id, `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`];
const rg = (a, b, o = 0, id = uid()) => [id, `<radialGradient id="${id}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}" stop-opacity="${o}"/></radialGradient>`];
// Pièce en relief : copie sombre décalée + dégradé + contour épais (recette « jouet » de Lumen)
function part(d, a, b, dark, o = {}){ const [id, def] = lg(a, b); const dy = o.dy === undefined ? 4 : o.dy, w = o.w || 3;
  return `<defs>${def}</defs>${dy ? `<path d="${d}" transform="translate(0 ${dy})" fill="${dark}" stroke="${TD}" stroke-width="${w}" stroke-linejoin="round"/>` : ""}<path d="${d}" fill="url(#${id})" stroke="${TD}" stroke-width="${w}" stroke-linejoin="round"${o.cls ? ` class="${o.cls}"` : ""}/>`; }
const shine = (d, w = 3.2, o = .75) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
const glow = (cx, cy, r, c, o = .7, cls = "pulse") => { const [id, def] = rg(c, c); return `<defs>${def}</defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})" opacity="${o}" class="${cls}"/>`; };

/* Palettes : bronze, argent, or, améthyste, rubis, obsidienne */
const PAL = {
  bronze:["#F4C08A", "#B8672E", "#6A3412"], silver:["#FFFFFF", "#9AA6C0", "#4A5470"], gold:["#FFF0A0", "#E0A21A", "#8A5806"],
  violet:["#E0B8FF", "#8A3AE8", "#3A0E7A"], crimson:["#FF8A9A", "#C8142E", "#5A0412"], obsidian:["#8A7AA8", "#2A1E3E", "#0E0818"], fire:["#FFF4A0", "#FF8A1A", "#C8260A"]
};
const P = (k, o = {}) => (d) => part(d, PAL[k][0], PAL[k][1], PAL[k][2], o);

/* --- Pièces d'armure --- */
const shieldD = (s = 1, cy = 100) => { const w = 48 * s, h = 62 * s, t = cy - h * .62;
  return `M100 ${t} Q${100 + w * .55} ${t + h * .02} ${100 + w} ${t + h * .12} L${100 + w} ${t + h * .62} Q${100 + w} ${t + h * 1.18} 100 ${t + h * 1.42} Q${100 - w} ${t + h * 1.18} ${100 - w} ${t + h * .62} L${100 - w} ${t + h * .12} Q${100 - w * .55} ${t + h * .02} 100 ${t}Z`; };
const circleD = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
function wings(span, n, k, o = {}){ // n plumes par aile, palette k ; deux couches (grandes plumes derrière, petites devant)
  let g = "";
  const layer = (len, cnt, kk, y0, wf) => { let out = "";
    for (const sd of [-1, 1]) for (let i = cnt - 1; i >= 0; i--) {
      const t = i / Math.max(1, cnt - 1), ang = (.15 + t * 1.05) * (o.up || 1), L = len * (.7 + t * .3);
      const bx = 100 + sd * 34, by = y0 - t * 10, ex = bx + sd * Math.cos(ang) * L, ey = by - Math.sin(ang) * L;
      const mx = (bx + ex) / 2, my = (by + ey) / 2, px = Math.sin(ang) * L * wf, py = sd * Math.cos(ang) * L * wf;
      const d = `M${bx.toFixed(1)} ${by.toFixed(1)} Q${(mx - sd * px).toFixed(1)} ${(my - py * sd * sd).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(mx + sd * px * .55).toFixed(1)} ${(my + py * .55 * sd * sd + 6).toFixed(1)} ${bx.toFixed(1)} ${(by + 10).toFixed(1)}Z`;
      out += P(i % 2 && o.alt ? o.alt : kk, {dy:2.5, w:2.4})(d) + `<path d="M${bx.toFixed(1)} ${(by + 4).toFixed(1)} L${(bx + (ex - bx) * .8).toFixed(1)} ${(by + (ey - by) * .8).toFixed(1)}" stroke="#fff" stroke-width="1.6" opacity=".45" stroke-linecap="round"/>`;
    }
    return out; };
  g += layer(span, n, k, 104, .2);
  g += layer(span * .6, Math.max(2, n - 2), o.alt || k, 112, .24);
  return g;
}
function laurel(k, r = 70, n = 7){
  let g = "";
  for (const sd of [-1, 1]) for (let i = 0; i < n; i++) {
    const a = Math.PI * (.62 + i * .075) , x = 100 + sd * Math.cos(a) * -r, y = 104 + Math.sin(a) * r, rot = sd * (i * 9 + 40);
    g += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot})">${P(k, {dy:1.5, w:2})("M0 -10 Q7 -2 0 10 Q-7 -2 0 -10Z")}</g>`;
  }
  return g;
}
function gem(x, y, r, k){
  return P(k, {dy:2, w:2.4})(`M${x} ${y - r} L${x + r * .8} ${y - r * .2} L${x + r * .5} ${y + r} L${x - r * .5} ${y + r} L${x - r * .8} ${y - r * .2}Z`)
    + `<path d="M${x - r * .8} ${y - r * .2} L${x + r * .8} ${y - r * .2} M${x} ${y - r} L${x - r * .3} ${y - r * .2} L${x} ${y + r} L${x + r * .3} ${y - r * .2}Z" fill="none" stroke="#fff" stroke-width="1.2" opacity=".55"/>`
    + `<path d="M${x - r * .35} ${y - r * .55} L${x - r * .05} ${y - r * .75}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
}
function crown(y, w, k, gems){
  const d = `M${100 - w} ${y} L${100 - w * 1.08} ${y - 22} L${100 - w * .55} ${y - 10} L${100 - w * .28} ${y - 30} L100 ${y - 14} L${100 + w * .28} ${y - 30} L${100 + w * .55} ${y - 10} L${100 + w * 1.08} ${y - 22} L${100 + w} ${y}Z`;
  return P(k, {dy:3, w:2.6})(d) + `<rect x="${100 - w}" y="${y - 4}" width="${w * 2}" height="9" rx="3" fill="url(#${lg(PAL[k][0], PAL[k][1])[0]})" stroke="${TD}" stroke-width="2.4"/>`.replace(/url\(#(e\d+)\)/, (m, id) => `url(#${id})`) + (gems || []).map(([dx, gk]) => gem(100 + dx * w, y - 22, 5, gk)).join("");
}
// le rect de la couronne a besoin de son dégradé : on le déclare à part
function crownBand(y, w, k){ const [id, def] = lg(PAL[k][0], PAL[k][1]); return `<defs>${def}</defs><rect x="${100 - w}" y="${y - 4}" width="${w * 2}" height="10" rx="3" fill="url(#${id})" stroke="${TD}" stroke-width="2.4"/>`; }
function crownFull(y, w, k, gems){
  const d = `M${100 - w} ${y} L${100 - w * 1.1} ${y - 22} L${100 - w * .55} ${y - 9} L${100 - w * .28} ${y - 32} L100 ${y - 14} L${100 + w * .28} ${y - 32} L${100 + w * .55} ${y - 9} L${100 + w * 1.1} ${y - 22} L${100 + w} ${y}Z`;
  return P(k, {dy:3, w:2.6})(d) + crownBand(y, w, k) + (gems || []).map(([dx, dy, gk]) => gem(100 + dx * w, y + dy, 5, gk)).join("") + shine(`M${100 - w * .9} ${y - 14} L${100 - w * .7} ${y - 6}`, 2.4, .7);
}
function ribbon(y, txt, k){
  const d = `M40 ${y} L160 ${y} L152 ${y + 11} L160 ${y + 22} L40 ${y + 22} L48 ${y + 11}Z`;
  return P(k, {dy:3, w:2.6})(`M28 ${y + 6} L48 ${y + 6} L48 ${y + 24} L28 ${y + 24} L36 ${y + 15}Z`) + P(k, {dy:3, w:2.6})(`M172 ${y + 6} L152 ${y + 6} L152 ${y + 24} L172 ${y + 24} L164 ${y + 15}Z`)
    + P(k, {dy:3, w:2.6})(d) + `<text x="100" y="${y + 16.5}" text-anchor="middle" style="font:800 15px 'Bricolage Grotesque',sans-serif;letter-spacing:.12em" fill="#fff" stroke="${TD}" stroke-width="3.4" paint-order="stroke">${txt}</text>`;
}
function swords(k){ let g = "";
  for (const sd of [-1, 1]) g += `<g transform="rotate(${sd * 38} 100 104)">${P(k, {dy:2, w:2.4})("M96 30 L104 30 L106 150 L100 162 L94 150Z")}${P("gold", {dy:2, w:2.4})("M82 140 L118 140 L118 148 L82 148Z")}${P("crimson", {dy:1, w:2.2})("M96 148 L104 148 L104 170 L96 170Z")}</g>`;
  return g; }
function spikes(n, r, k, len = 18){ let g = "";
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i - (n - 1) / 2) * .28, x = 100 + Math.cos(a) * r, y = 104 + Math.sin(a) * r, ex = 100 + Math.cos(a) * (r + len), ey = 104 + Math.sin(a) * (r + len), nx = -Math.sin(a) * 6, ny = Math.cos(a) * 6;
    g += P(k, {dy:2, w:2.2})(`M${x + nx} ${y + ny} L${ex} ${ey} L${x - nx} ${y - ny}Z`); }
  return g; }
function tentacles(k){ let g = "";
  for (const [sx, a] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) { const y0 = 128 + a * 10, x0 = 100 + sx * (24 + a * 6);
    const d = `M${x0} ${y0} Q${x0 + sx * 34} ${y0 + 8} ${x0 + sx * 40} ${y0 + 34 + a * 6} Q${x0 + sx * 42} ${y0 + 46} ${x0 + sx * 30} ${y0 + 44}`;
    g += `<path d="${d}" stroke="${TD}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${PAL[k][1]}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${PAL[k][0]}" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="2 7" opacity=".9"/>`; }
  return g; }

/* --- Créatures (au centre du blason) --- */
const eyes = (x1, x2, y, r, c = "#FFE07A", sl) => [x1, x2].map(x => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${sl ? r * .7 : r}" fill="${c}" stroke="${TD}" stroke-width="2.2"/><ellipse cx="${x}" cy="${y}" rx="${r * .35}" ry="${r * .8}" fill="${TD}"/><circle cx="${x - r * .35}" cy="${y - r * .35}" r="${r * .25}" fill="#fff"/>`).join("");
const CRE = {
  hibou(){ return P("bronze", {dy:3})("M70 96 Q68 66 82 62 L76 48 L92 60 Q100 57 108 60 L124 48 L118 62 Q132 66 130 96 Q128 128 100 132 Q72 128 70 96Z")
    + `<circle cx="87" cy="92" r="13" fill="#FFF4DA" stroke="${TD}" stroke-width="2.4"/><circle cx="113" cy="92" r="13" fill="#FFF4DA" stroke="${TD}" stroke-width="2.4"/>` + eyes(87, 113, 92, 7, "#FFB020")
    + `<path d="M96 104 L104 104 L100 114Z" fill="#FFB020" stroke="${TD}" stroke-width="2"/>` + [0, 1, 2].map(i => `<path d="M${88 + i * 8} 120 q4 4 8 0" stroke="#8A4A1A" stroke-width="2" fill="none"/>`).join("") + shine("M76 84 Q78 72 88 68"); },
  loup(){ return P("silver", {dy:3})("M68 70 L64 42 L86 60 Q100 54 114 60 L136 42 L132 70 Q140 92 126 112 L112 132 Q100 140 88 132 L74 112 Q60 92 68 70Z")
    + `<path d="M70 52 L72 64 L80 60Z M130 52 L128 64 L120 60Z" fill="#FF9AB8"/>` + `<path d="M76 84 L92 92 M124 84 L108 92" stroke="${TD}" stroke-width="4" stroke-linecap="round"/>` + eyes(86, 114, 94, 5.4, "#7AE8FF", 1)
    + P("silver", {dy:2, w:2.4})("M86 108 Q100 102 114 108 L108 128 Q100 134 92 128Z") + `<ellipse cx="100" cy="112" rx="7" ry="5" fill="${TD}"/><path d="M92 124 l3 6 l3 -6 M102 124 l3 6 l3 -6" fill="#fff" stroke="${TD}" stroke-width="1.2"/>` + shine("M74 76 Q78 64 88 62"); },
  serpent(){ return `<path d="M64 128 Q60 104 84 100 Q118 96 120 116 Q122 138 96 136 Q78 134 82 122" fill="none" stroke="${TD}" stroke-width="18" stroke-linecap="round"/><path d="M64 128 Q60 104 84 100 Q118 96 120 116 Q122 138 96 136 Q78 134 82 122" fill="none" stroke="#3AB88A" stroke-width="12" stroke-linecap="round"/><path d="M64 128 Q60 104 84 100 Q118 96 120 116 Q122 138 96 136" fill="none" stroke="#B8F8D8" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round"/>`
    + `<path d="M84 100 Q86 80 100 74" fill="none" stroke="${TD}" stroke-width="16" stroke-linecap="round"/><path d="M84 100 Q86 80 100 74" fill="none" stroke="#3AB88A" stroke-width="10" stroke-linecap="round"/>`
    + part("M80 74 Q82 52 104 50 Q126 52 126 70 Q124 84 106 86 Q86 88 80 74Z", "#7AF8B8", "#2A9A6A", "#0E4A30") + `<path d="M84 64 L96 68 M122 62 L112 68" stroke="${TD}" stroke-width="3.4" stroke-linecap="round"/>` + eyes(94, 114, 70, 4.4, "#FFE07A", 1)
    + `<path d="M104 86 v10 l-4 4 M104 96 l4 4" stroke="#E2283A" stroke-width="2.4" fill="none" stroke-linecap="round"/>` + shine("M86 62 Q92 54 102 54"); },
  corbeau(){ return P("obsidian", {dy:3})("M66 112 Q62 76 80 62 L74 40 L92 54 Q100 50 108 54 L126 40 L120 62 Q138 76 134 112 Q118 132 100 132 Q82 132 66 112Z")
    + `<path d="M80 50 L88 30 L96 50 M104 50 L112 30 L120 50" fill="#3A2E5A" stroke="${TD}" stroke-width="2"/>` + `<path d="M74 82 L92 90 M126 82 L108 90" stroke="#C890FF" stroke-width="3.4" stroke-linecap="round"/>` + eyes(86, 114, 94, 5.6, "#C890FF", 1)
    + P("gold", {dy:2, w:2.4})("M90 104 L110 104 L100 132Z") + `<path d="M100 104 V128" stroke="#8A5806" stroke-width="1.6"/>` + shine("M74 80 Q76 68 86 62", 2.6, .45); },
  lion(){ let mane = ""; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, x = 100 + Math.cos(a) * 34, y = 98 + Math.sin(a) * 34; mane += `M${(x + Math.cos(a + 1.57) * 10).toFixed(1)} ${(y + Math.sin(a + 1.57) * 10).toFixed(1)} Q${(100 + Math.cos(a) * 50).toFixed(1)} ${(98 + Math.sin(a) * 50).toFixed(1)} ${(x - Math.cos(a + 1.57) * 10).toFixed(1)} ${(y - Math.sin(a + 1.57) * 10).toFixed(1)}Z `; }
    return P("crimson", {dy:3})(mane) + P("gold", {dy:3})("M72 92 Q72 66 100 64 Q128 66 128 92 Q128 120 112 128 Q100 134 88 128 Q72 120 72 92Z")
    + `<path d="M78 84 L94 90 M122 84 L106 90" stroke="${TD}" stroke-width="4" stroke-linecap="round"/>` + eyes(87, 113, 94, 5.4, "#FFF4DA", 1)
    + P("gold", {dy:1, w:2.2})("M88 104 Q100 98 112 104 Q112 118 100 120 Q88 118 88 104Z") + `<path d="M94 104 L106 104 L100 110Z" fill="${TD}"/><path d="M100 110 V116 M92 118 Q100 124 108 118" stroke="${TD}" stroke-width="2.2" fill="none"/>` + shine("M78 80 Q82 70 92 68"); },
  hydre(){ let g = "";
    for (const [dx, h, s] of [[-26, 18, .78], [26, 18, .78], [0, 0, 1]]) { const x = 100 + dx, top = 62 + h;
      g += `<path d="M${100 + dx * .4} 136 Q${x - dx * .3} 112 ${x} ${top + 22}" fill="none" stroke="${TD}" stroke-width="${15 * s}" stroke-linecap="round"/><path d="M${100 + dx * .4} 136 Q${x - dx * .3} 112 ${x} ${top + 22}" fill="none" stroke="#5AC86A" stroke-width="${9 * s}" stroke-linecap="round"/>`;
      g += part(`M${x - 16 * s} ${top + 14 * s} Q${x - 16 * s} ${top - 6 * s} ${x} ${top - 8 * s} Q${x + 16 * s} ${top - 6 * s} ${x + 16 * s} ${top + 14 * s} Q${x + 8 * s} ${top + 30 * s} ${x} ${top + 30 * s} Q${x - 8 * s} ${top + 30 * s} ${x - 16 * s} ${top + 14 * s}Z`, "#9AF87A", "#3A9A3A", "#14501A", {dy:2.5, w:2.4})
        + `<path d="M${x - 12 * s} ${top - 2 * s} L${x - 16 * s} ${top - 16 * s} L${x - 6 * s} ${top - 6 * s} M${x + 12 * s} ${top - 2 * s} L${x + 16 * s} ${top - 16 * s} L${x + 6 * s} ${top - 6 * s}" fill="#E8D8A0" stroke="${TD}" stroke-width="1.8"/>`
        + eyes(x - 6 * s, x + 6 * s, top + 8 * s, 3.4 * s, "#FF3A4A", 1) + `<path d="M${x - 6 * s} ${top + 20 * s} Q${x} ${top + 24 * s} ${x + 6 * s} ${top + 20 * s}" stroke="${TD}" stroke-width="2" fill="none"/>`; }
    return g; },
  griffon(){ return wings(40, 4, "gold", {up:.8}).replace(/<g/g, "<g")
    + P("silver", {dy:3})("M74 100 Q70 70 92 60 L88 44 L100 54 L112 44 L108 60 Q130 70 126 100 Q122 122 100 126 Q78 122 74 100Z")
    + `<path d="M80 86 L94 92 M120 86 L106 92" stroke="${TD}" stroke-width="4" stroke-linecap="round"/>` + eyes(88, 112, 94, 5, "#FFB020", 1)
    + P("gold", {dy:2, w:2.4})("M92 100 Q100 96 108 100 L106 112 Q102 124 100 126 Q98 116 92 100Z") + shine("M80 82 Q84 70 94 66"); },
  kraken(){ return tentacles("violet") + P("violet", {dy:3})("M70 100 Q66 58 100 54 Q134 58 130 100 Q128 126 100 128 Q72 126 70 100Z")
    + [[84, 72], [116, 72], [100, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#F0D8FF" stroke="${TD}" stroke-width="1.4"/>`).join("")
    + `<path d="M76 88 L94 96 M124 88 L106 96" stroke="${TD}" stroke-width="4.4" stroke-linecap="round"/>` + eyes(86, 114, 100, 6.4, "#FFF26A", 1)
    + `<path d="M90 116 Q100 112 110 116" stroke="${TD}" stroke-width="3" fill="none" stroke-linecap="round"/>` + shine("M78 80 Q82 64 96 60"); },
  dragon(){ return P("obsidian", {dy:2, w:2.4})("M74 74 Q58 50 62 26 Q74 46 86 58Z") + P("obsidian", {dy:2, w:2.4})("M126 74 Q142 50 138 26 Q126 46 114 58Z")
    + P("crimson", {dy:3})("M68 96 Q66 62 100 56 Q134 62 132 96 Q130 112 118 118 L116 132 Q100 140 84 132 L82 118 Q70 112 68 96Z")
    + `<path d="M74 82 L94 92 M126 82 L106 92" stroke="${TD}" stroke-width="5" stroke-linecap="round"/>` + glow(86, 96, 12, "#FFB020", .8) + glow(114, 96, 12, "#FFB020", .8) + eyes(86, 114, 96, 5.6, "#FFE07A", 1)
    + P("crimson", {dy:1, w:2.2})("M84 112 Q100 104 116 112 L114 128 Q100 134 86 128Z") + `<circle cx="93" cy="116" r="2.6" fill="${TD}"/><circle cx="107" cy="116" r="2.6" fill="${TD}"/>`
    + `<path d="M86 128 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6" stroke="#FFF4DA" stroke-width="2" fill="none"/>` + [[80, 64], [100, 58], [120, 64]].map(([x, y]) => `<path d="M${x - 4} ${y} L${x} ${y - 10} L${x + 4} ${y}Z" fill="#3A1A2A" stroke="${TD}" stroke-width="1.6"/>`).join("") + shine("M74 80 Q78 66 92 60"); },
  phenix(){ let g = "";
    // ailes de flammes : langues larges et ondulées, qui vacillent
    for (const sd of [-1, 1]) for (let i = 5; i >= 0; i--) { const ang = .05 + i * .24, L = 70 + i * 3, bx = 100 + sd * 16, by = 112;
      const ex = bx + sd * Math.cos(ang) * L, ey = by - Math.sin(ang) * L, px = Math.sin(ang) * L * .24, py = Math.cos(ang) * L * .24;
      const d = `M${bx} ${by} Q${(bx + ex) / 2 - sd * px - sd * 4} ${(by + ey) / 2 - py - 6} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(bx + ex) / 2 + sd * px * .2} ${(by + ey) / 2 + py * .2} ${(bx + (ex - bx) * .7).toFixed(1)} ${(by + (ey - by) * .55 + 10).toFixed(1)} Q${(bx + ex) / 2} ${(by + ey) / 2 + py + 10} ${bx} ${by + 16}Z`;
      g += P(i % 3 === 0 ? "crimson" : i % 3 === 1 ? "fire" : "gold", {dy:2, w:2.2, cls:"flick"})(d); }
    // queue de flammes sous le corps
    g += P("crimson", {dy:2, w:2.2, cls:"flick"})("M88 130 Q80 156 92 176 Q96 158 100 150 Q104 158 108 176 Q120 156 112 130Z") + P("fire", {dy:1, w:2, cls:"flick"})("M94 132 Q90 150 98 164 Q100 150 102 164 Q110 150 106 132Z");
    // corps et poitrine en plumes
    g += P("fire", {dy:3})("M78 112 Q76 92 100 88 Q124 92 122 112 Q120 136 100 142 Q80 136 78 112Z");
    g += [0, 1, 2].map(r => [0, 1, 2, 3].slice(0, 4 - r).map(c => { const x = 88 + c * 8 + r * 4, y = 106 + r * 9; return `<path d="M${x - 4} ${y} Q${x} ${y + 7} ${x + 4} ${y}" stroke="#C8260A" stroke-width="2" fill="none" opacity=".75"/>`; }).join("")).join("");
    // tête
    g += P("fire", {dy:3})("M82 80 Q80 58 100 54 Q120 58 118 80 Q116 96 100 98 Q84 96 82 80Z");
    // crête de flammes
    g += P("gold", {dy:2, w:2.2, cls:"flick"})("M90 60 Q82 40 90 24 Q94 40 100 42 Q100 26 108 14 Q114 34 106 44 Q114 40 120 30 Q122 48 110 60Z");
    // yeux en amande lumineux, sourcils
    g += glow(91, 76, 9, "#FFF4A0", .9) + glow(109, 76, 9, "#FFF4A0", .9);
    g += `<path d="M84 70 L96 74 M116 70 L104 74" stroke="${TD}" stroke-width="3.6" stroke-linecap="round"/>`;
    g += [91, 109].map(x => `<path d="M${x - 6} 77 Q${x} 71 ${x + 6} 77 Q${x} 81 ${x - 6} 77Z" fill="#FFFFFF" stroke="${TD}" stroke-width="2"/><ellipse cx="${x}" cy="77" rx="1.6" ry="3" fill="${TD}"/>`).join("");
    // bec doré crochu
    g += P("gold", {dy:2, w:2.2})("M93 82 Q100 78 107 82 Q106 92 100 100 Q98 92 93 82Z") + `<path d="M100 84 V96" stroke="#8A5806" stroke-width="1.4"/>`;
    g += shine("M86 66 Q88 58 96 56", 2.8, .7);
    return g; }
};

/* --- Pièces sombres des grands prestiges --- */
PAL.blood = ["#FF4A4A", "#8A0010", "#2A0004"];
PAL.bone = ["#FFFBEE", "#D8C8A0", "#7A6A48"];
PAL.shadow = ["#7A4AC8", "#24083E", "#08020E"];
// Tête de mort : crâne, orbites rougeoyantes, dents ; cornes et couronne en option
function skull(cx, cy, s, o = {}){
  const k = o.k || "bone", eye = o.eye || "#FF2A2A";
  let g = "";
  if (o.horns) for (const sd of [-1, 1]) g += P(o.horns, {dy:2, w:2.6})(`M${cx + sd * 22 * s} ${cy - 10 * s} Q${cx + sd * 62 * s} ${cy - 6 * s} ${cx + sd * 70 * s} ${cy - 48 * s} Q${cx + sd * 72 * s} ${cy - 64 * s} ${cx + sd * 64 * s} ${cy - 72 * s} Q${cx + sd * 60 * s} ${cy - 34 * s} ${cx + sd * 24 * s} ${cy - 26 * s}Z`);
  g += P(k, {dy:3 * s, w:2.6})(`M${cx - 26 * s} ${cy} Q${cx - 28 * s} ${cy - 34 * s} ${cx} ${cy - 36 * s} Q${cx + 28 * s} ${cy - 34 * s} ${cx + 26 * s} ${cy} Q${cx + 24 * s} ${cy + 10 * s} ${cx + 16 * s} ${cy + 14 * s} L${cx + 16 * s} ${cy + 26 * s} L${cx - 16 * s} ${cy + 26 * s} L${cx - 16 * s} ${cy + 14 * s} Q${cx - 24 * s} ${cy + 10 * s} ${cx - 26 * s} ${cy}Z`);
  g += `<path d="M${cx - 10 * s} ${cy - 30 * s} Q${cx - 2 * s} ${cy - 22 * s} ${cx - 6 * s} ${cy - 14 * s} M${cx + 14 * s} ${cy - 28 * s} L${cx + 8 * s} ${cy - 18 * s}" stroke="${PAL[k][2]}" stroke-width="${1.6 * s}" fill="none" opacity=".7"/>`;
  for (const sd of [-1, 1]) g += glow(cx + sd * 11 * s, cy - 2 * s, 13 * s, eye, .9) + `<path d="M${cx + sd * 4 * s} ${cy - 10 * s} Q${cx + sd * 20 * s} ${cy - 12 * s} ${cx + sd * 20 * s} ${cy} Q${cx + sd * 18 * s} ${cy + 8 * s} ${cx + sd * 8 * s} ${cy + 6 * s} Q${cx + sd * 2 * s} ${cy} ${cx + sd * 4 * s} ${cy - 10 * s}Z" fill="#14020A" stroke="${TD}" stroke-width="2"/><circle cx="${cx + sd * 11 * s}" cy="${cy - 1 * s}" r="${3.4 * s}" fill="${eye}" class="pulse"/><circle cx="${cx + sd * 11 * s}" cy="${cy - 1 * s}" r="${1.4 * s}" fill="#FFF4E0"/>`;
  g += `<path d="M${cx} ${cy + 4 * s} L${cx - 4 * s} ${cy + 12 * s} L${cx + 4 * s} ${cy + 12 * s}Z" fill="#14020A" stroke="${TD}" stroke-width="1.6"/>`;
  // arcades sourcilières en V (regard furieux) et pommettes creusées
  g += `<path d="M${cx - 24 * s} ${cy - 16 * s} L${cx - 3 * s} ${cy - 7 * s} L${cx - 4 * s} ${cy - 12 * s} L${cx - 22 * s} ${cy - 20 * s}Z M${cx + 24 * s} ${cy - 16 * s} L${cx + 3 * s} ${cy - 7 * s} L${cx + 4 * s} ${cy - 12 * s} L${cx + 22 * s} ${cy - 20 * s}Z" fill="${PAL[k][2]}" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/>`;
  g += `<path d="M${cx - 24 * s} ${cy + 6 * s} Q${cx - 18 * s} ${cy + 12 * s} ${cx - 12 * s} ${cy + 8 * s} M${cx + 24 * s} ${cy + 6 * s} Q${cx + 18 * s} ${cy + 12 * s} ${cx + 12 * s} ${cy + 8 * s}" stroke="${PAL[k][2]}" stroke-width="${2 * s}" fill="none" opacity=".8"/>`;
  g += `<path d="M${cx - 14 * s} ${cy + 18 * s} H${cx + 14 * s}" stroke="${TD}" stroke-width="${2 * s}"/>` + [-9, -3, 3, 9].map(x => `<path d="M${cx + x * s} ${cy + 15 * s} V${cy + 26 * s}" stroke="${TD}" stroke-width="${1.6 * s}"/>`).join("");
  g += shine(`M${cx - 20 * s} ${cy - 18 * s} Q${cx - 16 * s} ${cy - 30 * s} ${cx - 4 * s} ${cy - 32 * s}`, 3 * s, .7);
  return g;
}
// Ailes de chauve-souris / démon : membrane et doigts osseux
function batWings(span, k, bone = "bone"){
  let g = "";
  for (const sd of [-1, 1]) {
    const bx = 100 + sd * 34, by = 86;
    // épaule haute puis doigts osseux en éventail ; membrane creusée entre chaque doigt
    const sh = [bx + sd * span * .42, by - span * .62];
    const tips = [[1.02, -.78], [1.08, -.28], [.96, .12], [.72, .44], [.42, .6]].map(([a, b]) => [bx + sd * a * span, by + b * span]);
    let d = `M${bx} ${by} L${sh[0]} ${sh[1]} L${tips[0][0]} ${tips[0][1]}`;
    for (let t = 1; t < tips.length; t++) { const [px, py] = tips[t - 1], [qx, qy] = tips[t];
      const mx = (px + qx) / 2, my = (py + qy) / 2; d += ` Q${(mx * .62 + sh[0] * .2 + bx * .18).toFixed(1)} ${(my * .62 + sh[1] * .2 + by * .18).toFixed(1)} ${qx.toFixed(1)} ${qy.toFixed(1)}`; }
    d += ` Q${bx + sd * span * .2} ${by + span * .3} ${bx} ${by + 26}Z`;
    g += P(k, {dy:3, w:2.8})(d);
    g += `<path d="M${bx} ${by} L${sh[0]} ${sh[1]}" stroke="${TD}" stroke-width="8" stroke-linecap="round"/><path d="M${bx} ${by} L${sh[0]} ${sh[1]}" stroke="${PAL[bone][1]}" stroke-width="4.4" stroke-linecap="round"/>`;
    g += tips.map(([x, y]) => `<path d="M${sh[0]} ${sh[1]} Q${((sh[0] + x) / 2 + sd * 4).toFixed(1)} ${((sh[1] + y) / 2 - 4).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" stroke="${TD}" stroke-width="5.4" fill="none" stroke-linecap="round"/><path d="M${sh[0]} ${sh[1]} Q${((sh[0] + x) / 2 + sd * 4).toFixed(1)} ${((sh[1] + y) / 2 - 4).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" stroke="${PAL[bone][1]}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`).join("");
    g += P(bone, {dy:1, w:2})(`M${sh[0]} ${sh[1]} l${sd * 4} -16 l${sd * 6} 14Z`);
  }
  return g;
}
// Aura d'ombre : couronne de flammes noires et rouges qui tourne autour de l'emblème
function aura(r, n, inner, outer, speed = "spin", o = .95){
  let g = "";
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, L = r * (.34 + (k % 3) * .1), wa = Math.PI / n * 1.2;
    const x1 = 100 + Math.cos(a - wa) * r, y1 = 100 + Math.sin(a - wa) * r, x2 = 100 + Math.cos(a + wa) * r, y2 = 100 + Math.sin(a + wa) * r;
    const tx = 100 + Math.cos(a + .18) * (r + L), ty = 100 + Math.sin(a + .18) * (r + L), cx = 100 + Math.cos(a - .1) * (r + L * .6), cy = 100 + Math.sin(a - .1) * (r + L * .6);
    g += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q${(100 + Math.cos(a + .3) * (r + L * .4)).toFixed(1)} ${(100 + Math.sin(a + .3) * (r + L * .4)).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}Z" fill="${k % 2 ? outer : inner}" opacity="${o}"/>`;
  }
  return `<g class="${speed}">${g}</g>`;
}
function scythes(){ let g = "";
  for (const sd of [-1, 1]) g += `<g transform="rotate(${sd * 32} 100 104)">${P("shadow", {dy:2, w:2.4})("M97 18 L103 18 L104 184 L96 184Z")}${P("silver", {dy:2, w:2.6})(sd < 0 ? "M100 20 Q60 6 30 30 Q62 22 100 34Z" : "M100 20 Q140 6 170 30 Q138 22 100 34Z")}${P("blood", {dy:1, w:2})("M95 60 L105 60 L105 70 L95 70Z")}</g>`;
  return g; }
const boneRing = (r, n) => Array.from({length:n}, (_, k) => { const a = k / n * Math.PI * 2; return `<g transform="translate(${(100 + Math.cos(a) * r).toFixed(1)} ${(100 + Math.sin(a) * r).toFixed(1)}) scale(.32)">${skull(0, 0, 1, {eye:"#FF3A3A"})}</g>`; }).join("");

// Créatures supplémentaires
CRE.faucheur = () => P("shadow", {dy:3})("M58 132 Q54 70 100 50 Q146 70 142 132 Q120 120 100 124 Q80 120 58 132Z") + `<path d="M70 120 Q72 78 100 64 Q128 78 130 120 Q100 108 70 120Z" fill="#0A0210" stroke="${TD}" stroke-width="2.4"/>` + skull(100, 100, .82, {eye:"#FF1A3A"});
CRE.roi = () => skull(100, 104, 1.12, {horns:"shadow", eye:"#FF1A1A"}) + crownFull(66, 32, "gold", [[0, -28, "blood"], [-.6, -18, "shadow"], [.6, -18, "shadow"]]);

/* --- Palettes : une couleur par prestige --- */
PAL.sapphire = ["#C8F0FF", "#2A86F0", "#0A2A7A"];
PAL.teal = ["#A8FFF4", "#14B8A8", "#04484A"];
PAL.void = ["#5A5A6E", "#101018", "#000000"];
PAL.holy = ["#FFFFFF", "#F4DC9A", "#9A7A2A"];
PAL.emerald = ["#C8FFA8", "#22C85A", "#03461A"];
PAL.soul = ["#F0FFC0", "#6AF83A", "#0A5A14"];
// Éclairs qui crépitent
function bolts(n, r, c){ let g = "";
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .3, x0 = 100 + Math.cos(a) * r, y0 = 100 + Math.sin(a) * r; let d = `M${x0.toFixed(1)} ${y0.toFixed(1)}`, x = x0, y = y0;
    for (let t = 0; t < 4; t++) { x += Math.cos(a) * 12 + (t % 2 ? 7 : -7) * Math.sin(a); y += Math.sin(a) * 12 - (t % 2 ? 7 : -7) * Math.cos(a); d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; }
    g += `<path class="zap" style="animation-delay:-${(k * .23).toFixed(2)}s" d="${d}" stroke="${c}" stroke-width="3.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`; }
  return `<g filter="url(#${PF}bg)">${g}</g>`; }
// Bulles qui montent
const bubbles = (n, c) => Array.from({length:n}, (_, k) => `<circle class="rise" style="animation-delay:-${(k * .41).toFixed(2)}s" cx="${(40 + (k * 37) % 120)}" cy="${150 - (k * 13) % 30}" r="${2 + k % 4}" fill="none" stroke="${c}" stroke-width="1.8"/>`).join("");
// Cristaux qui tournent autour de l'emblème
function crystals(n, r, k){ let g = "";
  for (let t = 0; t < n; t++) { const a = t / n * Math.PI * 2, x = 100 + Math.cos(a) * r, y = 100 + Math.sin(a) * r;
    g += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(a * 180 / Math.PI + 90).toFixed(0)})">${P(k, {dy:1.5, w:2})("M0 -14 L6 -2 L0 12 L-6 -2Z")}<path d="M0 -14 L0 12" stroke="#fff" stroke-width="1.2" opacity=".6"/></g>`; }
  return `<g class="spin">${g}</g>`; }
// Visage céleste : casque d'or ailé, visière lumineuse, auréole
CRE.ange = () => `<ellipse cx="100" cy="46" rx="30" ry="8" fill="none" stroke="#FFF4C0" stroke-width="5" class="pulse"/><ellipse cx="100" cy="46" rx="30" ry="8" fill="none" stroke="#C8A040" stroke-width="1.6"/>`
  + wings(30, 3, "holy", {up:1.1}).replace(/translate\(0 2\.5\)/g, "translate(0 2.5)")
  + P("holy", {dy:3})("M70 104 Q68 66 100 60 Q132 66 130 104 Q128 124 116 132 L84 132 Q72 124 70 104Z")
  + P("gold", {dy:2, w:2.4})("M98 60 L102 60 L104 132 L96 132Z")
  + `<path d="M76 92 L124 92 L120 102 L80 102Z" fill="#14100A" stroke="${TD}" stroke-width="2.4"/>` + glow(100, 97, 22, "#FFFFFF", .9) + `<path d="M80 96 L120 96" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" class="pulse"/>`
  + shine("M76 84 Q78 70 92 64", 3, .8);
// Roi-liche : crâne aux flammes d'âme vertes
CRE.liche = () => {
  let fl = "";
  for (let k = 0; k < 7; k++) { const x = 70 + k * 10, h = 22 + (k % 3) * 10 + (k === 3 ? 14 : 0); fl += `<path class="flick" style="animation-delay:-${k * .13}s" d="M${x - 7} 72 Q${x - 9} ${72 - h * .6} ${x} ${72 - h} Q${x + 9} ${72 - h * .6} ${x + 7} 72Z" fill="${k % 2 ? "#14141E" : "#3A3A4E"}" stroke="#E8F4FF" stroke-width="1.6"/>`; }
  return fl + skull(100, 104, 1.12, {horns:"void", eye:"#E8FFFF", k:"bone"}) + crownFull(66, 32, "gold", [[0, -28, "void"], [-.6, -18, "void"], [.6, -18, "void"]]);
};
CRE.ombre = () => P("emerald", {dy:3})("M54 136 Q50 70 100 46 Q150 70 146 136 Q122 122 100 126 Q78 122 54 136Z")
  + `<path d="M68 122 Q70 76 100 60 Q130 76 132 122 Q100 108 68 122Z" fill="#000" stroke="${TD}" stroke-width="2.4"/>`
  + glow(88, 96, 12, "#7AFF4A", .9) + glow(112, 96, 12, "#7AFF4A", .9)
  + `<path d="M80 94 L94 99 L82 101Z M120 94 L106 99 L118 101Z" fill="#E8FFC0" class="pulse"/>`
  + `<path d="M86 112 Q100 118 114 112" stroke="#9AA8C0" stroke-width="2" fill="none" opacity=".7"/>` + shine("M62 96 Q66 70 88 56", 2.6, .25);

/* --- Les 10 prestiges (version 3 : une couleur par prestige, du mouvement, de grosses auras) --- */
const PRE = [
  {n:"Apprenti", c:"hibou", col:"Bronze", note:"Médaillon de bronze, simple et net."},
  {n:"Éclaireur", c:"loup", col:"Argent", note:"Médaillon d'argent cerclé, laurier, reflet qui passe."},
  {n:"Lettré", c:"serpent", col:"Or", note:"Premier blason, en or, ailes dorées, lueur dorée qui respire."},
  {n:"Seigneur des Tempêtes", c:"griffon", col:"Saphir", note:"Griffon sur blason saphir, ailes bleues, éclairs qui crépitent tout autour."},
  {n:"Gardien de Cristal", c:"lion", col:"Améthyste", note:"Lion sur blason améthyste, couronne de cristaux qui tourne, aura violette."},
  {n:"Seigneur des Cendres", c:"dragon", col:"Rubis", note:"Dragon, ailes de démon, aura de flammes rouges qui tourne."},
  {n:"Archimage des Abysses", c:"kraken", col:"Turquoise", note:"Kraken, tentacules, bulles qui montent, aura turquoise."},
  {n:"Faucheur des Âmes", c:"ombre", col:"Émeraude", note:"Silhouette encapuchonnée aux yeux verts, faux, ailes de démon et aura verte qui tourne."},
  {n:"Archange", c:"ange", col:"Blanc et or", note:"Casque ailé, auréole, immenses ailes blanches, rayons de lumière qui tournent."},
  {n:"Maître Prestige", c:"liche", col:"Noir absolu", note:"Roi-liche couronné aux flammes noires et aux yeux blancs glacés, ailes de démon noires, crânes, triple aura de fumée noire immense. Le plus sombre de tous."}
];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
function rays(n, r, c, cls, o = .25){ let d = ""; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; d += `M100 100 L${(100 + Math.cos(a - .05) * r).toFixed(1)} ${(100 + Math.sin(a - .05) * r).toFixed(1)} L${(100 + Math.cos(a + .05) * r).toFixed(1)} ${(100 + Math.sin(a + .05) * r).toFixed(1)}Z `; } return `<g class="${cls}"><path d="${d}" fill="${c}" opacity="${o}"/></g>`; }
function emblem(i){
  ns(); const p = PRE[i], L = i + 1;
  let back = "", front = "";
  const big = (c, r, o) => glow(100, 100, r, c, o, "breathe");
  // --- auras lumineuses (de plus en plus grosses) ---
  if (L === 3) back += big("#FFD23F", 92, .55);
  if (L === 4) back += big("#3A9AFF", 118, .8) + aura(70, 18, "#0A2A7A", "#3A9AFF", "spin", .7) + bolts(8, 66, "#C8F4FF");
  if (L === 5) back += big("#B060FF", 122, .85) + aura(72, 20, "#3A0E7A", "#B060FF", "spinr", .75);
  if (L === 6) back += big("#FF3A1A", 126, .85) + aura(78, 24, "#4A0004", "#FF3A1A", "spin", .9) + aura(64, 18, "#FFB020", "#C8142E", "spinr", .7);
  if (L === 7) back += big("#14E8D0", 128, .85) + aura(76, 22, "#04484A", "#2AE8D8", "spin", .85) + bubbles(14, "#C8FFF8");
  if (L === 8) back += big("#3AFF6A", 140, .9) + aura(84, 28, "#022A0A", "#2AE84A", "spin", .95) + aura(70, 22, "#0A0A12", "#7AFF3A", "spinr", .85);
  if (L === 9) back += big("#FFF8D8", 140, .95) + rays(24, 136, "#FFF4C0", "spin", .35) + rays(12, 120, "#FFFFFF", "spinr", .25);
  if (L === 10) back += big("#000000", 156, .98) + big("#8A9AC0", 128, .3) + rays(20, 140, "#E8F4FF", "spinr", .18) + aura(94, 30, "#000000", "#1A1A26", "spin", .98) + aura(80, 24, "#000000", "#3A3A4E", "spinr", .92) + aura(66, 18, "#0A0A12", "#5A5A6E", "spin", .8) + `<circle cx="100" cy="100" r="100" fill="none" stroke="#E8F4FF" stroke-width="1.6" opacity=".45" stroke-dasharray="3 9" class="spinr"/>`;
  // --- ailes, armes, ornements ---
  if (L === 3) back += wings(40, 3, "gold");
  if (L === 4) back += wings(68, 5, "sapphire", {alt:"silver"});
  if (L === 5) back += wings(66, 5, "violet", {alt:"silver"}) + crystals(10, 78, "violet");
  if (L === 6) back += batWings(86, "crimson", "gold") + spikes(7, 64, "gold", 22);
  if (L === 7) back += swords("silver") + wings(72, 6, "teal", {alt:"silver"});
  if (L === 8) back += scythes() + batWings(94, "emerald", "emerald");
  if (L === 9) back += wings(108, 8, "holy", {alt:"gold"});
  if (L === 10) back += batWings(108, "void", "gold") + spikes(9, 68, "gold", 26);
  if (L === 2) back += laurel("silver", 64, 5);
  if (L === 3) back += laurel("gold", 66, 6);
  // --- corps du blason ---
  const body = {1:"bronze", 2:"silver", 3:"gold", 4:"sapphire", 5:"violet", 6:"crimson", 7:"teal", 8:"emerald", 9:"holy", 10:"void"}[L];
  let shell = "";
  if (L <= 2) {
    shell += P(body, {dy:4})(circleD(100, 100, 52)) + `<circle cx="100" cy="100" r="42" fill="none" stroke="${PAL[body][2]}" stroke-width="3" opacity=".6"/>`;
    if (L === 2) shell += `<circle cx="100" cy="100" r="47" fill="none" stroke="#FFFFFF" stroke-width="3"/>` + Array.from({length:12}, (_, k) => { const a = k / 12 * Math.PI * 2; return `<circle cx="${(100 + Math.cos(a) * 47).toFixed(1)}" cy="${(100 + Math.sin(a) * 47).toFixed(1)}" r="2.4" fill="#FFF" stroke="${TD}" stroke-width="1"/>`; }).join("")
      + `<clipPath id="${PF}cl2"><circle cx="100" cy="100" r="52"/></clipPath><g clip-path="url(#${PF}cl2)"><rect class="sweep" x="20" y="30" width="18" height="140" fill="#FFFFFF" opacity=".5" transform="rotate(20 100 100)"/></g>`;
    shell += shine("M62 80 Q70 58 92 52", 4, .6);
  } else {
    const sc = L >= 8 ? 1.16 : L >= 4 ? 1.08 : 1;
    shell += P(body, {dy:5})(shieldD(sc));
    const rim = {3:"#FFF4C0", 4:"#E8F8FF", 5:"#F0D8FF", 6:"#FFD23F", 7:"#C8FFF8", 8:"#7AFF4A", 9:"#FFD23F", 10:"#E8F4FF"}[L];
    shell += `<path d="${shieldD(sc * .86)}" fill="none" stroke="${rim}" stroke-width="${L >= 4 ? 4 : 3}" opacity=".9"/>`;
    if (L >= 4) shell += `<path d="${shieldD(sc * .93)}" fill="none" stroke="${rim}" stroke-width="2" stroke-dasharray="2 6" opacity=".8" class="dash"/>`;
    shell += shine(`M${100 - 40 * sc} 70 Q${100 - 36 * sc} 56 ${100 - 14 * sc} 52`, 4, L === 8 ? .2 : .5);
  }
  front += CRE[p.c]();
  // --- gemmes et finitions ---
  const gk = {4:"sapphire", 5:"violet", 6:"crimson", 7:"teal", 8:"emerald", 9:"holy", 10:"void"}[L];
  if (gk) front += glow(100, 162, 18 + L, {4:"#7AC8FF", 5:"#C890FF", 6:"#FF5A3A", 7:"#5AF8E8", 8:"#7AFF4A", 9:"#FFFFFF", 10:"#E8F4FF"}[L], .85) + gem(100, 162, 8 + L * .4, gk);
  if (L === 6) front += crownFull(48, 32, "bone", [[0, -26, "crimson"]]);
  if (L === 8) front += boneRing(92, 10).replace(/#FF3A3A/g, "#7AFF4A");
  if (L === 10) front += boneRing(104, 12).replace(/#FF3A3A/g, "#E8FFFF")
    + [[24, 30], [176, 36], [30, 168], [172, 162], [100, -10], [4, 100], [196, 104], [60, 0], [142, -2]].map(([x, y], k) => `<path class="spark" style="animation-delay:-${k * .3}s" d="M${x} ${y - 8} L${x + 2} ${y - 2} L${x + 8} ${y} L${x + 2} ${y + 2} L${x} ${y + 8} L${x - 2} ${y + 2} L${x - 8} ${y} L${x - 2} ${y - 2}Z" fill="#FFFFFF"/>`).join("");
  if (L === 9) front += [[30, 30], [170, 30], [20, 150], [180, 150], [100, -14]].map(([x, y], k) => `<path class="spark" style="animation-delay:-${k * .4}s" d="M${x} ${y - 8} L${x + 2} ${y - 2} L${x + 8} ${y} L${x + 2} ${y + 2} L${x} ${y + 8} L${x - 2} ${y + 2} L${x - 8} ${y} L${x - 2} ${y - 2}Z" fill="#FFFFFF"/>`).join("");
  const rk = {1:"bronze", 2:"silver", 3:"gold", 4:"sapphire", 5:"violet", 6:"crimson", 7:"teal", 8:"emerald", 9:"gold", 10:"void"}[L];
  const rib = ribbon(L <= 2 ? 146 : L >= 8 ? 178 : 170, L === 10 ? "MAÎTRE" : ROMAN[i], rk);
  return `<svg class="pa" viewBox="-36 -36 272 272" role="img" aria-label="Prestige ${L} : ${p.n}"><defs><filter id="${PF}bg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g class="${L >= 4 ? "float" : ""}">${back}${shell}${front}${rib}</g></svg>`;
}


/* ---------- Rangs de maîtrise (8 paliers) et symboles des 8 domaines ---------- */
PAL.stone = ["#D8D4CC", "#8A847A", "#4A4640"];
PAL.legend = ["#FFFFFF", "#FFD86A", "#A87A10"];
const RANKS = [
  {n:"Pierre", k:"stone", cond:"Premières bonnes réponses dans le domaine.", pct:0},
  {n:"Bronze", k:"bronze", cond:"Premières bonnes réponses dans le domaine.", pct:0},
  {n:"Argent", k:"silver", cond:"8 % de la maîtrise du domaine.", pct:8},
  {n:"Or", k:"gold", cond:"18 % de la maîtrise du domaine.", pct:18},
  {n:"Améthyste", k:"violet", cond:"32 % de la maîtrise du domaine.", pct:32},
  {n:"Rubis", k:"crimson", cond:"48 % de la maîtrise du domaine.", pct:48},
  {n:"Obsidienne", k:"void", cond:"66 % de la maîtrise et 60 % de réussite aux questions pointues.", pct:66},
  {n:"Légende", k:"legend", cond:"85 % de la maîtrise et 75 % de réussite aux questions pointues. Très rare.", pct:85}
];
/* Symboles des domaines, dessinés en relief au centre de l'emblème */
const DOM = {
  his:{n:"Histoire", draw:(k) => P(k, {dy:2, w:2.4})("M84 82 L116 82 L112 88 L88 88Z") + P(k, {dy:2, w:2.4})("M88 88 L94 88 L94 116 L88 116Z M97 88 L103 88 L103 116 L97 116Z M106 88 L112 88 L112 116 L106 116Z") + P(k, {dy:2, w:2.4})("M82 116 L118 116 L120 124 L80 124Z") + P(k, {dy:2, w:2.4})("M80 82 L100 70 L120 82Z")},
  geo:{n:"Géographie", draw:(k) => P(k, {dy:2, w:2.4})(circleD(100, 98, 22)) + `<path d="M78 98 H122 M100 76 Q86 98 100 120 Q114 98 100 76 M82 86 Q100 92 118 86 M82 110 Q100 104 118 110" stroke="${TD}" stroke-width="2" fill="none"/>` + P("emerald", {dy:1, w:1.6})("M86 90 Q92 84 98 90 Q96 98 90 100 Q84 96 86 90Z M104 102 Q112 98 114 106 Q108 112 104 108Z")},
  sci:{n:"Sciences", draw:(k) => `<ellipse cx="100" cy="98" rx="26" ry="9" fill="none" stroke="${TD}" stroke-width="6"/><ellipse cx="100" cy="98" rx="26" ry="9" fill="none" stroke="${PAL[k][0]}" stroke-width="3"/>` + [60, -60].map(a => `<ellipse cx="100" cy="98" rx="26" ry="9" fill="none" stroke="${TD}" stroke-width="6" transform="rotate(${a} 100 98)"/><ellipse cx="100" cy="98" rx="26" ry="9" fill="none" stroke="${PAL[k][0]}" stroke-width="3" transform="rotate(${a} 100 98)"/>`).join("") + P(k, {dy:1, w:2})(circleD(100, 98, 6))},
  spo:{n:"Sport", draw:(k) => P(k, {dy:2, w:2.4})("M84 76 L116 76 Q116 100 100 104 Q84 100 84 76Z") + `<path d="M84 80 Q72 80 74 90 Q76 96 86 94 M116 80 Q128 80 126 90 Q124 96 114 94" stroke="${TD}" stroke-width="5" fill="none"/><path d="M84 80 Q72 80 74 90 Q76 96 86 94 M116 80 Q128 80 126 90 Q124 96 114 94" stroke="${PAL[k][0]}" stroke-width="2.4" fill="none"/>` + P(k, {dy:2, w:2.4})("M96 104 L104 104 L106 114 L94 114Z") + P(k, {dy:2, w:2.4})("M86 114 L114 114 L116 122 L84 122Z") + `<path d="M100 82 l2 4 l4 .6 l-3 3 l.8 4 l-3.8 -2 l-3.8 2 l.8 -4 l-3 -3 l4 -.6Z" fill="#fff"/>`},
  art:{n:"Arts & littérature", draw:(k) => P(k, {dy:2, w:2.4})("M116 72 Q124 90 104 112 L96 120 L94 116 Q98 94 116 72Z") + `<path d="M114 78 Q104 96 96 116" stroke="${TD}" stroke-width="2" fill="none"/>` + `<path d="M94 116 L86 126" stroke="${TD}" stroke-width="3.4" stroke-linecap="round"/>` + P("void", {dy:1, w:2})("M76 118 Q84 112 92 118 L90 128 L78 128Z")},
  cin:{n:"Cinéma & séries", draw:(k) => P(k, {dy:2, w:2.4})("M76 92 L124 92 L124 124 L76 124Z") + P("void", {dy:2, w:2.4})("M76 80 L122 70 L124 80 L78 90Z") + [0, 1, 2, 3].map(t => `<path d="M${84 + t * 10} 88 L${90 + t * 10} 76" stroke="#fff" stroke-width="4"/>`).join("") + `<path d="M88 104 L112 104 M88 112 L104 112" stroke="${TD}" stroke-width="3" stroke-linecap="round"/>`},
  jeu:{n:"Jeux vidéo & mangas", draw:(k) => P(k, {dy:2, w:2.4})("M74 96 Q74 84 86 84 L114 84 Q126 84 126 96 L130 112 Q132 122 122 120 L112 110 L88 110 L78 120 Q68 122 70 112Z") + `<path d="M84 94 V104 M79 99 H89" stroke="${TD}" stroke-width="3.4" stroke-linecap="round"/><circle cx="112" cy="94" r="3" fill="${TD}"/><circle cx="118" cy="100" r="3" fill="${TD}"/>`},
  cul:{n:"Culture générale", draw:(k) => P(k, {dy:2, w:2.4})("M100 72 Q120 72 120 92 Q120 102 110 110 L110 116 L90 116 L90 110 Q80 102 80 92 Q80 72 100 72Z") + P("silver", {dy:1, w:2})("M90 116 L110 116 L108 126 L92 126Z") + `<path d="M94 106 Q96 94 100 98 Q104 94 106 106" stroke="${TD}" stroke-width="2" fill="none"/>` + glow(100, 92, 26, "#FFF4A0", .5)}
};
// Cadre d'un rang : il grandit et se pare à chaque palier (esprit des rangs de jeux compétitifs, dessins originaux)
function rankEmblem(r, dom = "his"){
  ns();
  const R = RANKS[r], k = R.k, T = r + 1;
  let back = "", front = "";
  const big = (c, rr, o) => glow(100, 100, rr, c, o, "breathe");
  if (T >= 4) back += big({4:"#FFD23F", 5:"#B060FF", 6:"#FF3A3A", 7:"#5A3A8A", 8:"#FFF0A0"}[T], 70 + T * 8, .55 + T * .04);
  if (T === 7) back += aura(70, 22, "#000000", "#3A1A5A", "spin", .9);
  if (T === 8) back += rays(24, 130, "#FFE58A", "spin", .3) + aura(74, 24, "#FFD23F", "#FFFFFF", "spinr", .55);
  // ailerons / ailes de côté qui grandissent
  const fin = (len, kk, n) => { let g = ""; for (const sd of [-1, 1]) for (let t = 0; t < n; t++) { const y = 84 + t * 14, L = len * (1 - t * .18);
    g += P(kk, {dy:2, w:2.4})(`M${100 + sd * 34} ${y - 8} L${100 + sd * (34 + L)} ${y - 16 - t * 2} L${100 + sd * (30 + L * .7)} ${y + 2} L${100 + sd * 34} ${y + 8}Z`); } return g; };
  if (T === 2) back += fin(16, k, 1);
  if (T === 3) back += fin(26, k, 2);
  if (T === 4) back += fin(36, k, 3) + spikes(3, 52, k, 16);
  if (T === 5) back += crystals(8, 70, "violet") + fin(40, k, 3) + spikes(5, 54, k, 18);
  if (T === 6) back += wings(58, 5, "crimson", {alt:"gold"}) + spikes(5, 56, "gold", 20);
  if (T === 7) back += batWings(70, "void", "violet") + spikes(7, 58, "violet", 22);
  if (T === 8) back += wings(84, 7, "legend", {alt:"gold"}) + spikes(9, 60, "legend", 26);
  // corps : hexagone de pierre → blason à facettes
  const hex = (rr) => Array.from({length:6}, (_, t) => { const a = Math.PI / 6 + t * Math.PI / 3; return `${t ? "L" : "M"}${(100 + Math.cos(a) * rr).toFixed(1)} ${(100 + Math.sin(a) * rr).toFixed(1)}`; }).join(" ") + "Z";
  const crest = (s) => `M100 ${100 - 50 * s} L${100 + 40 * s} ${100 - 30 * s} L${100 + 44 * s} ${100 + 14 * s} L100 ${100 + 56 * s} L${100 - 44 * s} ${100 + 14 * s} L${100 - 40 * s} ${100 - 30 * s}Z`;
  const shape = T <= 2 ? hex(44) : crest(T >= 6 ? 1.12 : 1);
  back += P(k, {dy:5})(shape);
  back += `<path d="${T <= 2 ? hex(36) : crest((T >= 6 ? 1.12 : 1) * .84)}" fill="none" stroke="${T === 7 ? "#B060FF" : PAL[k][0]}" stroke-width="3" opacity=".8"/>`;
  if (T === 1) back += `<path d="M78 86 L88 96 L84 108 M118 80 L110 92 M104 124 L110 114" stroke="${PAL.stone[2]}" stroke-width="2.4" fill="none"/>`;
  if (T >= 5) back += `<path d="${crest((T >= 6 ? 1.12 : 1) * .92)}" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="2 6" opacity=".7" class="dash"/>`;
  back += shine(T <= 2 ? "M70 86 Q74 70 90 64" : "M70 76 Q72 66 86 58", 3.4, .55);
  // médaillon central avec le symbole du domaine
  const mk = T === 7 ? "violet" : T === 8 ? "gold" : k;
  front += P(T >= 7 ? "void" : "void", {dy:2, w:2.6})(circleD(100, 98, 30)) + `<circle cx="100" cy="98" r="27" fill="none" stroke="${PAL[mk][0]}" stroke-width="2.4"/>`;
  front += DOM[dom].draw(mk === "void" ? "silver" : mk);
  // gemme du haut
  if (T >= 3) front += gem(100, 50 - (T >= 6 ? 6 : 0), 6 + T * .4, {3:"silver", 4:"gold", 5:"violet", 6:"crimson", 7:"violet", 8:"legend"}[T]);
  if (T === 8) front += crownFull(36, 22, "gold", [[0, -20, "crimson"]]) + [[24, 40], [176, 44], [30, 160], [170, 158], [100, -2]].map(([x, y], t) => `<path class="spark" style="animation-delay:-${t * .4}s" d="M${x} ${y - 8} L${x + 2} ${y - 2} L${x + 8} ${y} L${x + 2} ${y + 2} L${x} ${y + 8} L${x - 2} ${y + 2} L${x - 8} ${y} L${x - 2} ${y - 2}Z" fill="#FFFFFF"/>`).join("");
  const rk = {1:"stone", 2:"bronze", 3:"silver", 4:"gold", 5:"violet", 6:"crimson", 7:"void", 8:"gold"}[T];
  front += ribbon(T <= 2 ? 140 : 156, R.n.toUpperCase(), rk);
  return `<svg class="pa" viewBox="-30 -30 260 260" role="img" aria-label="Rang ${R.n}"><defs><filter id="${PF}bg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g class="${T >= 6 ? "float" : ""}">${back}${front}</g></svg>`;
}


// Bannières (illustrations de fond)
function banner(kind, w = 400, h = 160){
  const id = uid();
  if (kind === "aube") return `<svg class="bnr" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A2A8A"/><stop offset="1" stop-color="#E86AA8"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`
    + Array.from({length:30}, (_, k) => `<circle cx="${(k * 53) % w}" cy="${(k * 29) % (h * .6)}" r="${1 + k % 3 * .6}" fill="#fff" opacity=".7" class="pulse" style="animation-delay:-${k * .2}s"/>`).join("")
    + `<path d="M0 ${h * .78} Q${w * .2} ${h * .6} ${w * .4} ${h * .74} T${w * .8} ${h * .7} T${w} ${h * .72} V${h} H0Z" fill="#2A1A5A" opacity=".8"/><path d="M0 ${h * .9} Q${w * .3} ${h * .78} ${w * .6} ${h * .88} T${w} ${h * .86} V${h} H0Z" fill="#1A0E3A"/></svg>`;
  if (kind === "neant") {
    let g = `<defs><radialGradient id="${id}" cx="70%" cy="40%" r="80%"><stop offset="0" stop-color="#3A3A4E"/><stop offset=".5" stop-color="#0E0E16"/><stop offset="1" stop-color="#000"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`;
    for (let k = 0; k < 9; k++) g += `<ellipse class="fogx" style="animation-delay:-${k * 1.3}s" cx="${(k * 71) % w}" cy="${h * (.3 + (k % 4) * .18)}" rx="${70 + k % 3 * 30}" ry="${14 + k % 2 * 8}" fill="#5A5A6E" opacity=".18"/>`;
    for (let k = 0; k < 6; k++) g += `<g transform="translate(${30 + k * (w / 6)} ${h * .62}) scale(.42)" opacity=".18">${skull(0, 0, 1, {eye:"#E8F4FF"})}</g>`;
    g += Array.from({length:14}, (_, k) => `<path class="spark" style="animation-delay:-${k * .3}s" d="M${(k * 61) % w} ${(k * 37) % h} l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2Z" fill="#E8F4FF" opacity=".8"/>`).join("");
    g += `<path d="M0 ${h} L0 ${h * .82} Q${w * .5} ${h * .7} ${w} ${h * .82} L${w} ${h}Z" fill="#000" opacity=".7"/>`;
    return `<svg class="bnr" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${g}</svg>`;
  }
}
// Cadres de l'avatar
function frame(kind, inner){
  if (kind === "bronze") return `<div class="fr"><svg viewBox="0 0 200 200" class="frsvg">${P("bronze", {dy:3})(circleD(100, 100, 92))}<circle cx="100" cy="100" r="78" fill="#2A1A4A" stroke="${TD}" stroke-width="3"/>${Array.from({length:8}, (_, k) => { const a = k / 8 * Math.PI * 2; return `<circle cx="${(100 + Math.cos(a) * 85).toFixed(1)}" cy="${(100 + Math.sin(a) * 85).toFixed(1)}" r="3.4" fill="#FFE0B0" stroke="${TD}" stroke-width="1.4"/>`; }).join("")}</svg><div class="frin">${inner}</div></div>`;
  return `<div class="fr roi"><svg viewBox="-40 -40 280 280" class="frsvg">${glow(100, 100, 130, "#000", .9, "breathe")}${aura(92, 26, "#000", "#3A3A4E", "spin", .95)}${spikes(9, 92, "gold", 22).replace(/104/g, "100")}${P("void", {dy:3})(circleD(100, 100, 94))}<circle cx="100" cy="100" r="80" fill="#14141E" stroke="#FFD23F" stroke-width="4"/><circle cx="100" cy="100" r="86" fill="none" stroke="#E8F4FF" stroke-width="1.6" stroke-dasharray="3 7" class="dash"/>${[0, 90, 180, 270].map(a => `<g transform="rotate(${a} 100 100) translate(100 6) scale(.34)">${skull(0, 0, 1, {eye:"#E8F4FF"})}</g>`).join("")}</svg><div class="frin">${inner}</div></div>`;
}

const W = 640, H = 210;
const sparkle = (x, y, r, c, k) => `<path class="spark" style="animation-delay:-${(k * .37).toFixed(2)}s" d="M${x} ${y - r} L${x + r * .25} ${y - r * .25} L${x + r} ${y} L${x + r * .25} ${y + r * .25} L${x} ${y + r} L${x - r * .25} ${y + r * .25} L${x - r} ${y} L${x - r * .25} ${y - r * .25}Z" fill="${c}"/>`;
const svgB = (inner) => `<svg class="bnr" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
function sky(a, b, c){ const [id, def] = lg(a, b); return `<defs>${def}</defs><rect width="${W}" height="${H}" fill="url(#${id})"/>` + (c ? `<rect width="${W}" height="${H}" fill="${c}"/>` : ""); }

const BANNERS = {
  // Conquérant : la Tour dans l'orage, fenêtres allumées, éclairs, étendards
  tour(){ let s = sky("#14082A", "#5A1A3A");
    s += Array.from({length:5}, (_, k) => `<ellipse class="fogx" style="animation-delay:-${k * 2}s" cx="${80 + k * 130}" cy="${40 + (k % 2) * 30}" rx="120" ry="26" fill="#2A1A3A" opacity=".7"/>`).join("");
    s += `<path class="zap" d="M120 0 L104 46 L122 46 L98 104" stroke="#E8D8FF" stroke-width="3" fill="none"/><path class="zap" style="animation-delay:-.3s" d="M560 10 L548 50 L566 52 L546 96" stroke="#E8D8FF" stroke-width="3" fill="none"/>`;
    // tour
    const tw = (x, w, h, y0) => P("obsidian", {dy:3})(`M${x - w} ${H} L${x - w} ${y0 + 20} L${x - w - 6} ${y0 + 20} L${x - w - 6} ${y0} ${Array.from({length:5}, (_, k) => `L${x - w - 6 + k * (w + 6) * .5} ${y0} L${x - w - 6 + k * (w + 6) * .5} ${y0 - 10} L${x - w - 6 + (k + .5) * (w + 6) * .5} ${y0 - 10} L${x - w - 6 + (k + .5) * (w + 6) * .5} ${y0}`).join(" ")} L${x + w + 6} ${y0} L${x + w + 6} ${y0 + 20} L${x + w} ${y0 + 20} L${x + w} ${H}Z`);
    s += tw(320, 54, 0, 30);
    for (let r = 0; r < 6; r++) for (let c = -1; c <= 1; c++) s += `<rect x="${314 + c * 26}" y="${66 + r * 24}" width="12" height="16" rx="5" fill="${(r + c) % 3 ? "#FFB040" : "#3A2A1A"}" stroke="${TD}" stroke-width="1.6" class="${(r + c) % 3 ? "pulse" : ""}" style="animation-delay:-${r * .3}s"/>`;
    s += [[250, 40], [390, 40]].map(([x, y], k) => `<path d="M${x} ${y} V${y - 30}" stroke="${TD}" stroke-width="3"/><path class="flick" d="M${x} ${y - 30} L${x + (k ? -40 : 40)} ${y - 22} L${x} ${y - 12}Z" fill="#E2283A" stroke="${TD}" stroke-width="2"/>`).join("");
    s += `<path d="M0 ${H} L0 170 Q160 150 260 176 L380 176 Q480 150 640 168 L640 ${H}Z" fill="#0A0414"/>`;
    return svgB(s); },
  // Champion : arène, silhouette géante du boss aux yeux rouges, épées croisées, braises
  boss(){ let s = sky("#2A0408", "#6A1410");
    s += glow(320, 90, 170, "#FF3A1A", .45, "breathe");
    s += `<path d="M180 ${H} Q190 60 320 40 Q450 60 460 ${H}Z" fill="#14020A"/><path d="M230 70 L210 20 L260 56 M410 70 L430 20 L380 56" fill="#14020A" stroke="#14020A" stroke-width="10" stroke-linejoin="round"/>`;
    s += glow(288, 96, 22, "#FF2A1A", .9) + glow(352, 96, 22, "#FF2A1A", .9) + `<path d="M272 92 L300 100 L276 104Z M368 92 L340 100 L364 104Z" fill="#FFE0A0" class="pulse"/>`;
    s += `<path d="M280 130 Q320 150 360 130" stroke="#FF5A2A" stroke-width="4" fill="none" class="pulse"/>`;
    s += [-1, 1].map(sd => `<g transform="translate(${320 + sd * 210} 120) rotate(${sd * 28})">${P("silver", {dy:2, w:2.4})("M-5 -80 L5 -80 L7 40 L0 52 L-7 40Z")}${P("gold", {dy:2, w:2.4})("M-26 34 L26 34 L26 42 L-26 42Z")}</g>`).join("");
    s += `<path d="M0 ${H} L0 176 Q320 150 640 176 L640 ${H}Z" fill="#1A0404" stroke="${TD}" stroke-width="3"/>`;
    s += Array.from({length:22}, (_, k) => `<circle class="mm-ember" style="animation-delay:-${(k * .4).toFixed(1)}s" cx="${(k * 29) % W}" cy="${150 + (k % 4) * 12}" r="${1.4 + k % 3 * .6}" fill="${k % 2 ? "#FF8A3A" : "#FFD23F"}"/>`).join("");
    return svgB(s); },
  // Savant : bibliothèque des arcanes, livres qui flottent, cercles de runes
  savant(){ let s = sky("#14083A", "#3A1A7A");
    s += `<g class="spin" style="transform-origin:320px 105px">${Array.from({length:3}, (_, k) => `<circle cx="320" cy="105" r="${50 + k * 26}" fill="none" stroke="#C890FF" stroke-width="2" stroke-dasharray="${4 + k * 3} 10" opacity=".7"/>`).join("")}</g>`;
    s += glow(320, 105, 80, "#B060FF", .6, "breathe");
    for (let k = 0; k < 7; k++) { const x = 60 + k * 86, y = 60 + (k % 3) * 34, c = ["#E2283A", "#3A86F0", "#22C85A", "#FFD23F"][k % 4];
      s += `<g class="float" style="animation-delay:-${k * .5}s"><g transform="translate(${x} ${y}) rotate(${(k % 2 ? -12 : 10)})">${part("M-18 -12 L18 -12 L18 12 L-18 12Z", c, "#2B1D3A", "#14082A", {dy:3, w:2.4})}<path d="M-18 -12 L-18 12" stroke="#FFF4DA" stroke-width="4"/><path d="M-10 -4 H10 M-10 2 H6" stroke="#FFF4DA" stroke-width="1.6" opacity=".7"/></g></g>`; }
    s += `<g transform="translate(320 105)">${P("legend", {dy:3})("M-34 -22 Q0 -30 0 -18 Q0 -30 34 -22 L34 24 Q0 16 0 28 Q0 16 -34 24Z")}<path d="M0 -18 V28" stroke="${TD}" stroke-width="2"/>${["-24 -10 -6 -12", "-24 -2 -6 -4", "6 -12 24 -10", "6 -4 24 -2"].map(d => `<path d="M${d.split(" ").slice(0, 2).join(" ")} L${d.split(" ").slice(2).join(" ")}" stroke="#7A5AE8" stroke-width="1.8"/>`).join("")}</g>`;
    s += Array.from({length:14}, (_, k) => sparkle((k * 47) % W, (k * 31) % H, 5, "#E8D8FF", k)).join("");
    return svgB(s); },
  // Vétéran : couronne de laurier d'or, rayons, velours cramoisi et filigrane
  veteran(){ let s = sky("#3A0414", "#14020A");
    s += `<g transform="translate(220 5)">${rays(28, 420, "#FFD86A", "spin", .14)}</g>`;
    s += `<g transform="translate(220 5)">${laurel("gold", 78, 8)}</g>` + glow(320, 105, 70, "#FFD23F", .5, "breathe");
    s += `<g transform="translate(320 104)">${P("gold", {dy:3})("M0 -40 L12 -12 L42 -12 L18 6 L28 36 L0 18 L-28 36 L-18 6 L-42 -12 L-12 -12Z")}<path d="M-8 -26 L-2 -30" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`;
    s += [0, 1].map(k => `<path d="M${k ? W : 0} 0 Q${k ? W - 80 : 80} ${H / 2} ${k ? W : 0} ${H}" stroke="#FFD23F" stroke-width="3" fill="none" opacity=".6"/><path d="M${k ? W - 14 : 14} 20 q${k ? -30 : 30} 30 0 60 q${k ? 30 : -30} 30 0 60" stroke="#FFD23F" stroke-width="2" fill="none" opacity=".45"/>`).join("");
    return svgB(s); },
  // Compétiteur : duel, deux camps qui s'affrontent, éclair « VS »
  duel(){ let s = `<defs>${lg("#1A4AC8", "#0A1A5A", PF + "dA")[1]}${lg("#C81E6A", "#5A0A2A", PF + "dB")[1]}</defs><path d="M0 0 L370 0 L270 ${H} L0 ${H}Z" fill="url(#${PF}dA)"/><path d="M370 0 L${W} 0 L${W} ${H} L270 ${H}Z" fill="url(#${PF}dB)"/>`;
    s += Array.from({length:10}, (_, k) => `<path d="M${-20 + k * 40} ${H} L${80 + k * 40} 0" stroke="#5AA8FF" stroke-width="2" opacity=".18"/><path d="M${380 + k * 40} ${H} L${480 + k * 40} 0" stroke="#FF8AC0" stroke-width="2" opacity=".18"/>`).join("");
    s += glow(320, 105, 90, "#FFFFFF", .5, "breathe");
    s += `<path class="zap" d="M360 0 L300 92 L344 92 L276 ${H}" stroke="#FFF4A0" stroke-width="10" fill="none" stroke-linejoin="round"/><path d="M360 0 L300 92 L344 92 L276 ${H}" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
    s += `<text x="320" y="122" text-anchor="middle" style="font:800 64px 'Bricolage Grotesque',sans-serif;font-style:italic" fill="#FFD23F" stroke="${TD}" stroke-width="7" paint-order="stroke">VS</text>`;
    s += [[110, "#5AA8FF"], [530, "#FF8AC0"]].map(([x, c]) => `<g transform="translate(${x} 110)">${part("M-14 -40 L14 -40 L18 30 L0 46 L-18 30Z", "#FFFFFF", c, TD, {dy:2, w:2.4})}</g>`).join("");
    return svgB(s); },
  // Explorateur : mer, îles, voilier et rose des vents
  aventure(){ let s = sky("#7AC8F0", "#0E3A78");
    s += Array.from({length:24}, (_, k) => `<path class="av-wave" style="animation-delay:-${k * .3}s" d="M${(k * 53) % W} ${70 + (k * 23) % 130} q6 -5 12 0 q6 5 12 0" stroke="#fff" stroke-width="2" fill="none" opacity=".35"/>`).join("");
    s += [[90, 150, 70, "#5AB04A"], [250, 70, 50, "#E8B050"], [560, 140, 66, "#E8F4FF"], [440, 60, 44, "#6A3A6A"]].map(([x, y, r, c]) => `<ellipse cx="${x}" cy="${y + 10}" rx="${r + 14}" ry="${r * .32 + 8}" fill="#5AD0F0" opacity=".4"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .34}" fill="#F8E2A8" stroke="${TD}" stroke-width="2.4"/><ellipse cx="${x}" cy="${y - 4}" rx="${r * .78}" ry="${r * .26}" fill="${c}" stroke="${TD}" stroke-width="2.4"/>`).join("");
    s += `<g class="float"><g transform="translate(340 140)"><path d="M-30 0 L30 0 L22 16 L-22 16Z" fill="#A8784A" stroke="${TD}" stroke-width="2.6"/><path d="M0 0 V-52" stroke="${TD}" stroke-width="3"/><path d="M2 -50 L34 -12 L2 -10Z" fill="#fff" stroke="${TD}" stroke-width="2.4"/><path d="M-2 -44 L-24 -12 L-2 -12Z" fill="#FF5FA2" stroke="${TD}" stroke-width="2.4"/></g></g>`;
    s += `<g class="spin" style="transform-origin:590px 50px"><g transform="translate(590 50)">${[0, 90, 180, 270].map(a => `<path d="M0 0 L-6 -8 L0 -34 L6 -8Z" fill="${a ? "#FFF4DA" : "#E2283A"}" stroke="${TD}" stroke-width="2" transform="rotate(${a})"/>`).join("")}<circle r="6" fill="#FFD23F" stroke="${TD}" stroke-width="2"/></g></g>`;
    return svgB(s); }
};
// variable lg() avec id imposé : lg(a, b, id) renvoie [id, def]
/* --- Cadres d'avatar --- */
const FRAMES = {
  tour(){ let s = P("obsidian", {dy:3})(circleD(100, 100, 94));
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; s += `<g transform="translate(${(100 + Math.cos(a) * 92).toFixed(1)} ${(100 + Math.sin(a) * 92).toFixed(1)}) rotate(${(a * 180 / Math.PI + 90).toFixed(0)})">${P("obsidian", {dy:1.5, w:2})("M-9 -8 L9 -8 L9 8 L-9 8Z")}</g>`; }
    s += [[-1, 0], [1, 0]].map(([sd]) => `<path d="M${100 + sd * 94} 40 V8" stroke="${TD}" stroke-width="3"/><path class="flick" d="M${100 + sd * 94} 8 L${100 + sd * 94 + sd * 30} 16 L${100 + sd * 94} 26Z" fill="#E2283A" stroke="${TD}" stroke-width="2"/>`).join("");
    return s; },
  boss(){ let s = glow(100, 100, 120, "#FF3A1A", .6, "breathe") + spikes(12, 92, "silver", 22).replace(/104/g, "100") + P("crimson", {dy:3})(circleD(100, 100, 94)) + `<circle cx="100" cy="100" r="86" fill="none" stroke="#FFD23F" stroke-width="3"/>`;
    s += [-1, 1].map(sd => `<g transform="translate(100 186) rotate(${sd * 50})">${P("silver", {dy:1.5, w:2})("M-4 -60 L4 -60 L5 4 L0 12 L-5 4Z")}</g>`).join("");
    return s; },
  savant(){ return glow(100, 100, 118, "#B060FF", .6, "breathe") + `<g class="spin">${Array.from({length:16}, (_, k) => { const a = k / 16 * Math.PI * 2; return `<text x="${(100 + Math.cos(a) * 104).toFixed(1)}" y="${(104 + Math.sin(a) * 104).toFixed(1)}" text-anchor="middle" style="font:800 14px serif" fill="#E8D8FF">${"ᚠᚢᚦᚨᚱᚲᚷᚹ"[k % 8]}</text>`; }).join("")}</g>` + P("violet", {dy:3})(circleD(100, 100, 94)) + `<circle cx="100" cy="100" r="86" fill="none" stroke="#E8D8FF" stroke-width="2" stroke-dasharray="3 6" class="dash"/>` + [0, 120, 240].map(a => `<g transform="rotate(${a} 100 100) translate(100 4)">${gem(0, 0, 8, "violet")}</g>`).join(""); },
  veteran(){ return glow(100, 100, 118, "#FFD23F", .55, "breathe") + `<g transform="translate(0 -4) scale(1)">${laurel("gold", 96, 9).replace(/104/g, "100")}</g>` + P("gold", {dy:3})(circleD(100, 100, 92)) + `<circle cx="100" cy="100" r="84" fill="none" stroke="#FFF4C0" stroke-width="3"/>` + gem(100, 10, 9, "crimson") + gem(100, 192, 8, "crimson"); },
  duel(){ return `<g class="spin">${Array.from({length:8}, (_, k) => { const a = k / 8 * Math.PI * 2, x = 100 + Math.cos(a) * 106, y = 100 + Math.sin(a) * 106; return `<path class="zap" style="animation-delay:-${k * .2}s" d="M${x.toFixed(1)} ${y.toFixed(1)} l${k % 2 ? 6 : -6} 10 l${k % 2 ? -8 : 8} 2 l${k % 2 ? 6 : -6} 10" stroke="${k % 2 ? "#FF8AC0" : "#5AA8FF"}" stroke-width="3" fill="none"/>`; }).join("")}</g>`
    + `<path d="${circleD(100, 100, 94)}" fill="none" stroke="${TD}" stroke-width="14"/><path d="M100 6 A94 94 0 0 0 100 194" fill="none" stroke="#3A86F0" stroke-width="9"/><path d="M100 6 A94 94 0 0 1 100 194" fill="none" stroke="#E2287A" stroke-width="9"/>` + glow(100, 100, 120, "#FFFFFF", .25, "breathe")
    + `<g transform="translate(100 190)">${part("M-16 -10 L16 -10 L12 10 L-12 10Z", "#FFD23F", "#C8860A", TD, {dy:2, w:2.2})}<text y="5" text-anchor="middle" style="font:800 11px 'Bricolage Grotesque'" fill="${TD}">VS</text></g>`; },
  aventure(){ return P("teal", {dy:3})(circleD(100, 100, 94)) + `<circle cx="100" cy="100" r="88" fill="none" stroke="#C8A06A" stroke-width="6" stroke-dasharray="7 4"/><circle cx="100" cy="100" r="88" fill="none" stroke="${TD}" stroke-width="1"/>`
    + [0, 90, 180, 270].map(a => `<g transform="rotate(${a} 100 100) translate(100 0)">${P(a ? "silver" : "crimson", {dy:1.5, w:2})("M0 -14 L7 4 L0 0 L-7 4Z")}</g>`).join("")
    + `<g transform="translate(168 168)"><path d="M0 -16 V14 M-12 2 Q0 20 12 2 M-6 -10 H6" stroke="${TD}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M0 -16 V14 M-12 2 Q0 20 12 2 M-6 -10 H6" stroke="#C8D4E8" stroke-width="3" fill="none" stroke-linecap="round"/><circle cy="-20" r="4" fill="none" stroke="#C8D4E8" stroke-width="3"/></g>`; }
};
function frameOf(k, inner){ return `<div class="fr cf"><svg viewBox="-30 -30 260 260" class="frsvg">${FRAMES[k]()}<circle cx="100" cy="100" r="80" fill="#1A1030" stroke="${TD}" stroke-width="3"/></svg><div class="frin">${inner}</div></div>`; }

const COLL = [
  {k:"tour", n:"Collection du Conquérant", w:"La Tour", col:"#E2283A", items:[["Bannière « Tour d'orage »", "Atteindre l'étage 60 de la Tour", "Épique"], ["Cadre « Remparts »", "Atteindre le sommet (étage 100)", "Légendaire"], ["Titre CONQUÉRANT DES CIMES", "Atteindre le sommet 3 semaines différentes", "Mythique"]]},
  {k:"boss", n:"Collection du Champion", w:"Boss de la semaine", col:"#FF5A2A", items:[["Bannière « Arène »", "Infliger 50 PV au total aux Boss de la semaine", "Épique"], ["Cadre « Lames croisées »", "Finir 1er des dégâts sur un boss", "Légendaire"], ["Titre CHAMPION DE L'ARÈNE", "Participer à la victoire de 10 boss", "Mythique"]]},
  {k:"savant", n:"Collection du Savant", w:"Rangs de maîtrise", col:"#B060FF", items:[["Bannière « Bibliothèque des arcanes »", "3 domaines au rang Or", "Épique"], ["Cadre « Cercle des runes »", "Un domaine au rang Légende", "Légendaire"], ["Titre MAÎTRE DES CONNAISSANCES", "4 domaines au rang Légende", "Mythique"]]},
  {k:"veteran", n:"Collection du Vétéran", w:"Prestiges", col:"#FFD23F", items:[["Bannière « Laurier d'or »", "Atteindre le Prestige 3", "Épique"], ["Cadre « Couronne de laurier »", "Atteindre le Prestige 6", "Légendaire"], ["Titre LÉGENDE", "Atteindre le Prestige 9", "Mythique"]]},
  {k:"duel", n:"Collection du Compétiteur", w:"Multijoueur", col:"#5AA8FF", items:[["Bannière « Face à face »", "Gagner 25 duels", "Épique"], ["Cadre « Électrique »", "Gagner 100 duels avec au moins 60 % de victoires", "Légendaire"], ["Titre CHAMPION", "Finir n°1 du classement de la semaine 4 fois", "Mythique"]]},
  {k:"aventure", n:"Collection de l'Explorateur", w:"L'Aventure", col:"#2AC8B8", items:[["Bannière « Cinq îles »", "Vaincre 3 boss de l'Aventure", "Épique"], ["Cadre « Rose des vents »", "Gagner les 105 étoiles", "Légendaire"], ["Titre EXPLORATEUR DES CINQ MONDES", "Compléter les 5 mondes à 100 %", "Mythique"]]}
];

// Bannière et cadre d'une carte de visite : défaut (aube, bronze), Maître Prestige (neant, roi), collections (COLL)
function bannerArt(k){ ns(); const s = BANNERS[k] ? BANNERS[k]() : banner(k === "neant" ? "neant" : "aube", W, H); return s.replace('<svg class="bnr"', '<svg class="bnr pa"'); }
function frameArt(k, inner){ ns(); const s = FRAMES[k] ? frameOf(k, inner) : frame(k === "roi" ? "roi" : "bronze", inner); return s.replace('class="frsvg"', 'class="frsvg pa"'); }

return {emblem, rankEmblem, PRE, RANKS, DOM, ROMAN, bannerArt, frameArt, COLL};
})();
