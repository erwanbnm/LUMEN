/* ---------- Aventure · Monde 5 : Les Terres Maudites ----------
   Plaine de cendres, marais maudit, pont de chaînes au-dessus de la lave, cimetière noir, cœur du volcan, forteresse obscure,
   et le trône du Seigneur de la Corruption. Monstres originaux (style jouet) : Diablotin de Lave, Chauve-Souris Maudite,
   Squelette Grinçant, Chevalier Noir (chef). Boss : le Seigneur de la Corruption. 100 % du monde : « L'Empereur » (boutique.js). */
(() => {
  const {TD, rnd, smooth, sample, dist, near, blob, bumpy, tf, lg, rg} = Aventure.kit;
  const NODES = [[200, 1405], [92, 1258], [276, 1080], [118, 890], [282, 702], [126, 512], [200, 312]];
  const defs = () => lg("mGround", "#5A3A5A", "#2A1A2E") + lg("mRock", "#6A5A6A", "#2E222E") + lg("mLava", "#FFD23F", "#FF3A1A") + lg("mBone", "#FFF6E0", "#D8C8A8") + lg("mIron", "#8A8AA0", "#3A3A4A")
    + lg("mSwamp", "#7AD84A", "#2A6A3A") + lg("mDead", "#6A4A3A", "#2E1E18") + lg("mStone", "#7A6A8A", "#3A2E4A") + lg("mPurple", "#B060E8", "#4A1A7A")
    + rg("mGlowR", "#FFE0A0", "#FF3A1A") + rg("mGlowP", "#F0C8FF", "#9A3AE8") + rg("mGlowG", "#E0FFC0", "#5AE83A");

  /* --- Décor --- */
  function deadTree(x, y, s, seed){
    const r = rnd(seed); let g = `<ellipse cx="${x}" cy="${y}" rx="${14 * s}" ry="${4 * s}" fill="rgba(0,0,0,.3)"/>`;
    const br = (x0, y0, a, L, w, d) => { if (d > 3) return; const x1 = x0 + Math.sin(a) * L, y1 = y0 - Math.cos(a) * L;
      g += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${TD}" stroke-width="${w + 3}" stroke-linecap="round"/><path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="#5A4038" stroke-width="${w}" stroke-linecap="round"/>`;
      br(x1, y1, a - .6 - r() * .3, L * .65, w * .6, d + 1); if (r() < .8) br(x1, y1, a + .5 + r() * .3, L * .65, w * .6, d + 1); };
    br(x, y, (r() - .5) * .2, 24 * s, 7 * s, 0);
    return g;
  }
  const rockM = (x, y, s, seed) => `<ellipse cx="${x}" cy="${y + 2}" rx="${17 * s}" ry="${4 * s}" fill="rgba(0,0,0,.3)"/>` + tf(blob(x, y - 9 * s, 16 * s, 11 * s, seed, 7, .25), "mRock", "#1A121A", 3, 2.4) + `<path d="M${x - 6 * s} ${y - 6 * s} l5 -6 l4 4" stroke="#FF6A2A" stroke-width="2" fill="none" class="av-lava"/>`;
  const grave = (x, y, s) => `<ellipse cx="${x}" cy="${y + 2}" rx="${12 * s}" ry="${3 * s}" fill="rgba(0,0,0,.3)"/>` + tf(`M${x - 9 * s} ${y} L${x - 9 * s} ${y - 18 * s} Q${x} ${y - 30 * s} ${x + 9 * s} ${y - 18 * s} L${x + 9 * s} ${y}Z`, "mStone", "#1E162A", 2, 2.2) + `<path d="M${x} ${y - 22 * s} v10 M${x - 4 * s} ${y - 18 * s} h8" stroke="#2A1E3A" stroke-width="2"/>`;
  const crystalP = (x, y, s) => `<circle cx="${x}" cy="${y - 12 * s}" r="${14 * s}" fill="url(#mGlowP)" opacity=".5" class="av-pulse"/>` + tf(`M${x - 6 * s} ${y} L${x - 2 * s} ${y - 24 * s} L${x + 2 * s} ${y - 12 * s} L${x + 6 * s} ${y - 28 * s} L${x + 9 * s} ${y}Z`, "mPurple", "#2A0A4A", 2, 2);
  const skullPile = (x, y) => [[-8, 0], [6, 2], [-1, -8]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="7" ry="6" fill="url(#mBone)" stroke="${TD}" stroke-width="1.6"/><circle cx="${x + dx - 2.5}" cy="${y + dy - .5}" r="1.6" fill="${TD}"/><circle cx="${x + dx + 2.5}" cy="${y + dy - .5}" r="1.6" fill="${TD}"/>`).join("");
  function lavaRiver(pts){
    const d = smooth(pts, false);
    return `<path d="${d}" stroke="${TD}" stroke-width="56" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#C8280A" stroke-width="49" fill="none"/><path d="${d}" stroke="url(#mLava)" stroke-width="34" fill="none"/>`
      + `<path class="av-flow" d="${d}" stroke="#FFF4A0" stroke-width="3" stroke-dasharray="8 26" fill="none" transform="translate(0 -6)"/><path class="av-flow" d="${d}" stroke="#FFE07A" stroke-width="2.4" stroke-dasharray="5 30" fill="none" transform="translate(0 8)" style="animation-duration:1.8s"/>`;
  }
  function swamp(x, y){
    let g = `<path d="${blob(x, y, 96, 40, 51, 12, .14)}" fill="#1A3A1E" stroke="${TD}" stroke-width="3"/><path d="${blob(x, y - 2, 86, 34, 51, 12, .14)}" fill="url(#mSwamp)" opacity=".85"/>`;
    g += [[-40, -6], [10, 8], [44, -10], [-12, -16]].map(([dx, dy], i) => `<circle class="mm-pop" style="animation-delay:-${i * .6}s" cx="${x + dx}" cy="${y + dy}" r="6" fill="#B8F87A" stroke="${TD}" stroke-width="1.6"/>`).join("");
    g += `<ellipse cx="${x}" cy="${y - 4}" rx="90" ry="20" fill="url(#mGlowG)" opacity=".25" class="av-fog"/>`;
    return g;
  }
  function chainBridge(x, y){
    let g = `<g transform="translate(${x} ${y}) rotate(-26)">`;
    g += `<path d="M-70 -14 Q0 6 70 -14" stroke="${TD}" stroke-width="7" fill="none"/><path d="M-70 -14 Q0 6 70 -14" stroke="url(#mIron)" stroke-width="4" fill="none" stroke-dasharray="8 4"/>`;
    for (let k = 0; k < 10; k++) { const t = k / 9, px = -64 + t * 128, py = Math.sin(t * Math.PI) * 8; g += `<rect x="${px - 6}" y="${py - 10}" width="12" height="22" rx="2" fill="url(#mDead)" stroke="${TD}" stroke-width="2"/>`; }
    g += `<path d="M-70 18 Q0 38 70 18" stroke="${TD}" stroke-width="7" fill="none"/><path d="M-70 18 Q0 38 70 18" stroke="url(#mIron)" stroke-width="4" fill="none" stroke-dasharray="8 4"/>`;
    g += [-70, 70].map(px => `<rect x="${px - 5}" y="-26" width="10" height="56" rx="3" fill="url(#mIron)" stroke="${TD}" stroke-width="2"/>`).join("") + `</g>`;
    return g;
  }
  function volcano(x, y){
    let g = `<circle cx="${x}" cy="${y - 100}" r="90" fill="url(#mGlowR)" opacity=".35" class="av-lava"/>`;
    g += tf(`M${x - 110} ${y} L${x - 30} ${y - 120} L${x + 30} ${y - 120} L${x + 110} ${y}Z`, "mRock", "#140C14", 5, 3);
    g += `<path d="M${x - 30} ${y - 120} L${x + 30} ${y - 120} L${x + 22} ${y - 106} Q${x} ${y - 116} ${x - 22} ${y - 106}Z" fill="url(#mLava)" stroke="${TD}" stroke-width="2.4" class="av-lava"/>`;
    g += `<path d="M${x - 8} ${y - 110} Q${x - 22} ${y - 60} ${x - 40} ${y - 4} M${x + 10} ${y - 110} Q${x + 18} ${y - 70} ${x + 42} ${y - 6}" stroke="url(#mLava)" stroke-width="7" fill="none" class="av-lava" stroke-linecap="round"/>`;
    g += [0, 1, 2].map(i => `<circle class="mm-smoke" style="animation-delay:-${i * 1.6}s" cx="${x - 6 + i * 6}" cy="${y - 130}" r="${14 + i * 4}" fill="#4A3A4A" opacity=".55"/>`).join("");
    g += `<path d="M${x - 80} ${y - 20} L${x - 36} ${y - 100}" stroke="#fff" stroke-width="3" opacity=".15" stroke-linecap="round"/>`;
    return g;
  }
  function fortress(x, y){
    let g = `<circle cx="${x}" cy="${y - 130}" r="190" fill="url(#mGlowP)" opacity=".28" class="av-pulse"/>`;
    const tw = (tx, ty, w, h) => tf(`M${tx - w / 2} ${ty} L${tx - w / 2} ${ty - h} L${tx + w / 2} ${ty - h} L${tx + w / 2} ${ty}Z`, "mStone", "#140C1E", 4, 2.8)
      + Array.from({length:3}, (_, k) => `<rect x="${tx - w / 2 + k * w / 3 + 1}" y="${ty - h - 9}" width="${w / 3 - 4}" height="10" fill="url(#mStone)" stroke="${TD}" stroke-width="2"/>`).join("")
      + `<path d="M${tx - 4} ${ty - h * .7} L${tx - 4} ${ty - h * .85} Q${tx} ${ty - h * .9} ${tx + 4} ${ty - h * .85} L${tx + 4} ${ty - h * .7}Z" fill="#FF5A2A" stroke="${TD}" stroke-width="1.6" class="av-lava"/>`;
    g += tw(x - 130, y, 36, 130) + tw(x + 130, y, 36, 130) + tw(x - 70, y - 4, 44, 180) + tw(x + 70, y - 4, 44, 180);
    g += tf(`M${x - 52} ${y} L${x - 52} ${y - 200} L${x + 52} ${y - 200} L${x + 52} ${y}Z`, "mStone", "#140C1E", 5, 3);
    g += tf(`M${x - 62} ${y - 200} L${x - 40} ${y - 236} L${x - 20} ${y - 212} L${x} ${y - 262} L${x + 20} ${y - 212} L${x + 40} ${y - 236} L${x + 62} ${y - 200}Z`, "mStone", "#140C1E", 4, 3);
    g += `<path d="M${x - 24} ${y} L${x - 24} ${y - 60} Q${x} ${y - 86} ${x + 24} ${y - 60} L${x + 24} ${y}Z" fill="#14060E" stroke="${TD}" stroke-width="2.6"/><path d="M${x - 24} ${y - 10} h48 M${x - 24} ${y - 30} h48 M${x - 12} ${y} v-68 M${x + 12} ${y} v-68" stroke="#4A4A5A" stroke-width="2.4"/>`;
    g += `<circle cx="${x}" cy="${y - 150}" r="20" fill="url(#mGlowP)" class="av-pulse"/><path d="M${x - 10} ${y - 150} L${x} ${y - 166} L${x + 10} ${y - 150} L${x} ${y - 134}Z" fill="#E0A8FF" stroke="${TD}" stroke-width="2"/>`;
    // dragon qui tourne autour de la forteresse
    g += `<g class="mm-dragon" style="transform-origin:${x}px ${y - 200}px"><path d="M${x + 110} ${y - 250} q12 -16 26 -4 q-6 -18 14 -22 q-4 14 8 20 q14 -10 20 4 q-14 0 -18 10 q-16 6 -26 -2 q-14 8 -24 -6Z" fill="#2A0A1E" stroke="${TD}" stroke-width="2"/><circle cx="${x + 120}" cy="${y - 250}" r="2" fill="#FF5A2A"/></g>`;
    return g;
  }
  function start(x, y){
    return `<ellipse cx="${x}" cy="${y}" rx="40" ry="9" fill="rgba(0,0,0,.35)"/>` + tf(`M${x - 46} ${y} L${x - 40} ${y - 30} L${x - 4} ${y - 30} L${x + 2} ${y}Z`, "mStone", "#140C1E", 2, 2.4)
      + `<path d="M${x - 30} ${y} L${x - 30} ${y - 18} Q${x - 22} ${y - 26} ${x - 14} ${y - 18} L${x - 14} ${y}Z" fill="url(#mGlowP)" stroke="${TD}" stroke-width="2" class="av-pulse"/>`
      + `<path class="av-flame" d="M${x + 10} ${y - 2} Q${x + 6} ${y - 16} ${x + 16} ${y - 26} Q${x + 26} ${y - 14} ${x + 22} ${y - 2}Z" fill="#B060E8" stroke="${TD}" stroke-width="2"/><circle cx="${x + 16}" cy="${y - 10}" r="22" fill="url(#mGlowP)" opacity=".45" class="av-pulse"/>`
      + `<rect x="${x + 44}" y="${y - 40}" width="5" height="40" fill="url(#mDead)" stroke="${TD}" stroke-width="2"/><path d="M${x + 34} ${y - 44} L${x + 76} ${y - 44} L${x + 82} ${y - 36} L${x + 76} ${y - 28} L${x + 34} ${y - 28}Z" fill="url(#mDead)" stroke="${TD}" stroke-width="2.2"/><text x="${x + 56}" y="${y - 32.5}" text-anchor="middle" style="font:800 9.5px var(--f-display)" fill="#FFD8C8">DÉPART</text>`;
  }

  /* --- La carte --- */
  function mapDraw(){
    const W = 400, H = 1580, st = [200, 1520], pts = [st, ...NODES], P = sample(pts, 30);
    let s = `<defs>${defs()}${lg("mSky", "#1A0610", "#5A1A2A")}</defs><rect width="${W}" height="${H}" fill="url(#mGround)"/><rect width="${W}" height="440" fill="url(#mSky)" opacity=".85"/>`;
    const r = rnd(505);
    for (let i = 0; i < 40; i++) { const x = r() * W, y = 440 + r() * (H - 460); if (near([x, y], P) < 34) continue; s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(26 + r() * 40).toFixed(0)}" ry="${(7 + r() * 8).toFixed(0)}" fill="${r() < .5 ? "#6A4A6A" : "#3A2438"}" opacity=".6"/>`; }
    for (let i = 0; i < 40; i++) { const x = r() * W, y = 440 + r() * (H - 460); if (near([x, y], P) < 30) continue; s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l6 -4 l5 5 l7 -3" stroke="#FF6A2A" stroke-width="1.8" fill="none" opacity=".75" class="av-lava"/>`; }
    // rivière de lave sous le pont de chaînes, et lac de lave
    const lavaPts = [[-40, 1150], [80, 1120], [210, 1150], [320, 1110], [440, 1140]];
    s += lavaRiver(lavaPts);
    s += swamp(300, 1310);
    const pd = smooth(pts, false);
    s += `<path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round" transform="translate(0 4)"/><path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round"/><path d="${pd}" stroke="#3A2A3A" stroke-width="31" fill="none" stroke-linecap="round" transform="translate(0 3)"/><path d="${pd}" stroke="#8A7A8A" stroke-width="27" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${pd}" stroke="#6A5A6A" stroke-width="22" fill="none" stroke-dasharray="9 5" opacity=".7"/>`;
    // pont : là où le chemin croise la lave
    const LV = sample(lavaPts, 30); let bi = 0, bd = 1e9; P.forEach((p, i) => { const d = near(p, LV); if (d < bd) { bd = d; bi = i; } });
    const bp = P[bi], bq = P[Math.min(P.length - 1, bi + 2)], ang = Math.atan2(bq[1] - bp[1], bq[0] - bp[0]) * 180 / Math.PI;
    s += `<g transform="translate(${bp[0].toFixed(1)} ${bp[1].toFixed(1)}) rotate(${ang.toFixed(1)})">` + Array.from({length:9}, (_, i) => `<rect x="${-48 + i * 10.8}" y="-20" width="10" height="40" rx="2" fill="url(#mDead)" stroke="${TD}" stroke-width="2"/>`).join("")
      + `<path d="M-54 -24 Q0 -14 54 -24 M-54 24 Q0 34 54 24" stroke="url(#mIron)" stroke-width="5" fill="none" stroke-dasharray="7 3"/></g>`;
    const items = [];
    items.push([1530, start(180, 1530)]);
    [[80, 880], [40, 930], [180, 920], [70, 980], [210, 860], [150, 970]].forEach(([x, y]) => items.push([y, grave(x, y, 1)]));
    items.push([766, volcano(70, 766)]);
    items.push([320, fortress(200, 300)]);
    [[60, 1420], [350, 1450], [40, 1060], [360, 820], [30, 560], [370, 600]].forEach(([x, y], i) => items.push([y, i % 2 ? skullPile(x, y) : crystalP(x, y, 1.1)]));
    const STRUCT = [[180, 1510, 60], [300, 1310, 100], [130, 920, 80], [70, 700, 120], [200, 190, 220]];
    const rt = rnd(606);
    for (let y = 400; y < H - 10; y += 34) for (let x = -10; x < W + 20; x += 38){
      const px = x + (rt() - .5) * 24, py = y + (rt() - .5) * 16, pt = [px, py], edge = Math.min(px, W - px) < 60;
      if (rt() < (edge ? .35 : .72)) continue;
      if (near(pt, P) < 44 || near(pt, LV) < 40 || STRUCT.some(([sx, sy, sr]) => dist(pt, [sx, sy]) < sr)) continue;
      const k = rt(), sc = .85 + rt() * .4, X = +px.toFixed(1), Y = +py.toFixed(1), sd = Math.floor(rt() * 1e4);
      items.push([Y, k < .5 ? deadTree(X, Y, sc, sd) : k < .8 ? rockM(X, Y, sc, sd) : grave(X, Y, sc * .8)]);
    }
    items.sort((a, b) => a[0] - b[0]).forEach(it => s += it[1]);
    let top = "";
    const rf = rnd(99);
    for (let i = 0; i < 60; i++) top += `<circle class="mm-ember" style="animation-delay:-${(rf() * 6).toFixed(1)}s;animation-duration:${(4 + rf() * 4).toFixed(1)}s" cx="${(rf() * W).toFixed(0)}" cy="${(300 + rf() * (H - 300)).toFixed(0)}" r="${(1.2 + rf() * 1.8).toFixed(1)}" fill="${rf() < .5 ? "#FF8A3A" : "#FFD23F"}"/>`;
    top += `<ellipse class="av-fog" cx="120" cy="420" rx="160" ry="30" fill="#7A3AA8" opacity=".25"/><ellipse class="av-fog" style="animation-delay:-3s" cx="300" cy="460" rx="140" ry="26" fill="#7A3AA8" opacity=".22"/>`;
    return {bg:s, top};
  }

  /* --- Monstres maudits --- */
  const monsters = {
    diablotin:{n:"Diablotin de Lave", draw(){
      let g = `<defs>${lg("mLava", "#FFD23F", "#FF3A1A")}</defs>` + tFeet(44, 76, 106, "#FF6A3A", "#B8280A", "#6A1004", 9);
      g += `<path d="M90 92 Q112 90 110 70 l8 -4 l-6 10" fill="none" stroke="${TD}" stroke-width="6" stroke-linecap="round"/><path d="M90 92 Q112 90 110 70" fill="none" stroke="#E83A1A" stroke-width="3"/>`;
      g += toy("M24 100 Q16 60 40 44 Q60 34 80 44 Q104 60 96 100 Q60 110 24 100Z", "#FF7A3A", "#C02A0A", "#5A0A04");
      g += `<path d="M40 70 l8 6 l-4 8 l10 6 M80 66 l-6 8 l6 6" stroke="url(#mLava)" stroke-width="3" fill="none" class="av-lava"/>`;
      g += toy("M38 46 L30 18 L48 38Z", "#3A2A2A", "#1A0A0A", "#000", {dy:2, w:2.2}) + toy("M82 46 L90 18 L72 38Z", "#3A2A2A", "#1A0A0A", "#000", {dy:2, w:2.2});
      g += `<path d="M38 56 L54 62 M82 56 L66 62" stroke="${TD}" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="47" cy="66" rx="5" ry="4.4" fill="#FFF26A" stroke="${TD}" stroke-width="2"/><ellipse cx="73" cy="66" rx="5" ry="4.4" fill="#FFF26A" stroke="${TD}" stroke-width="2"/>`;
      g += `<path d="M44 80 Q60 92 76 80" stroke="${TD}" stroke-width="2.6" fill="#3A0A0A"/><path d="M48 81 l3 5 l3 -4 M66 81 l3 4 l3 -5" fill="#fff" stroke="${TD}" stroke-width="1"/>`;
      g += tLimb("M26 78 Q10 72 8 58", "#FF6A3A", 8) + tLimb("M94 78 Q110 70 108 56", "#FF6A3A", 8);
      g += `<path class="av-flame" d="M52 40 Q48 24 58 14 Q60 26 66 22 Q72 32 66 40Z" fill="#FFD23F" stroke="${TD}" stroke-width="2"/>`;
      return g; }},
    chauve:{n:"Chauve-Souris Maudite", draw(){
      let g = toy("M52 62 Q30 30 4 34 Q16 44 12 56 Q24 54 26 66 Q38 60 44 72Z", "#6A3A8A", "#3A1A5A", "#1A0A2A", {dy:2, w:2.4}) + toy("M68 62 Q90 30 116 34 Q104 44 108 56 Q96 54 94 66 Q82 60 76 72Z", "#6A3A8A", "#3A1A5A", "#1A0A2A", {dy:2, w:2.4});
      g += toy("M36 76 Q34 44 60 42 Q86 44 84 76 Q82 100 60 102 Q38 100 36 76Z", "#7A4A9A", "#3A1A5A", "#1A0A2A");
      g += toy("M40 50 L36 28 L52 44Z", "#7A4A9A", "#3A1A5A", "#1A0A2A", {dy:2, w:2.2}) + toy("M80 50 L84 28 L68 44Z", "#7A4A9A", "#3A1A5A", "#1A0A2A", {dy:2, w:2.2});
      g += `<path d="M42 60 L56 66 M78 60 L64 66" stroke="${TD}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="70" r="6" fill="#FF3A4A" stroke="${TD}" stroke-width="2" class="av-pulse"/><circle cx="70" cy="70" r="6" fill="#FF3A4A" stroke="${TD}" stroke-width="2" class="av-pulse"/>`;
      g += `<path d="M50 84 Q60 90 70 84" stroke="${TD}" stroke-width="2.6" fill="none"/><path d="M53 85 l2 7 l2 -6 M63 86 l2 6 l2 -7" fill="#fff" stroke="${TD}" stroke-width="1"/>`;
      g += `<path d="M46 102 l-4 8 M74 102 l4 8" stroke="${TD}" stroke-width="3" stroke-linecap="round"/><path d="M44 50 Q50 44 58 44" stroke="#fff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>`;
      return g; }},
    squelette:{n:"Squelette Grinçant", draw(){
      let g = `<defs>${lg("mBone", "#FFF6E0", "#D8C8A8")}</defs>`;
      g += tLimb("M48 104 L46 82", "#F4EAD0", 6) + tLimb("M72 104 L74 82", "#F4EAD0", 6) + tFeet(44, 76, 108, "#F4EAD0", "#C8B890", "#8A7A5A", 8);
      g += toy("M44 84 L42 60 Q60 54 78 60 L76 84 Q60 90 44 84Z", "#3A2A3A", "#1A0E1A", "#000");
      g += [64, 70, 76].map(y => `<path d="M46 ${y} Q60 ${y + 3} 74 ${y}" stroke="#F4EAD0" stroke-width="3" fill="none"/>`).join("");
      g += tLimb("M44 64 Q26 70 22 88", "#F4EAD0", 6) + tLimb("M76 64 Q94 66 100 50", "#F4EAD0", 6);
      g += `<path d="M98 54 L110 8" stroke="${TD}" stroke-width="7" stroke-linecap="round"/><path d="M98 54 L110 8" stroke="#A8A8C0" stroke-width="3.6" stroke-linecap="round"/><path d="M92 52 h14" stroke="#7A5230" stroke-width="5" stroke-linecap="round"/>`;
      g += tf(`M32 36 Q30 8 60 6 Q90 8 88 36 Q88 50 76 54 L74 62 L46 62 L44 54 Q32 50 32 36Z`, "mBone", "#8A7A5A", 3, 2.8);
      g += `<path d="M40 30 L54 34 M80 30 L66 34" stroke="${TD}" stroke-width="3.6" stroke-linecap="round"/><ellipse cx="47" cy="40" rx="7" ry="8" fill="#14081A" stroke="${TD}" stroke-width="2"/><ellipse cx="73" cy="40" rx="7" ry="8" fill="#14081A" stroke="${TD}" stroke-width="2"/><circle cx="47" cy="41" r="2.6" fill="#7AF8C8" class="av-pulse"/><circle cx="73" cy="41" r="2.6" fill="#7AF8C8" class="av-pulse"/>`;
      g += `<path d="M58 48 l2 -4 l2 4Z" fill="#14081A"/><path d="M48 56 h24 M52 52 v8 M58 52 v8 M64 52 v8 M70 52 v8" stroke="${TD}" stroke-width="1.8"/><path d="M40 18 Q48 10 60 10" stroke="#fff" stroke-width="3.4" fill="none" opacity=".7" stroke-linecap="round"/>`;
      return g; }},
    chevalier:{n:"Chevalier Noir", draw(){
      let g = `<defs>${lg("mIron", "#8A8AA0", "#3A3A4A")}</defs>` + tFeet(42, 78, 106, "#4A4A5A", "#1E1E2A", "#0A0A12", 11);
      g += toy("M10 104 Q8 70 22 54 L98 54 Q112 70 110 104 Q60 112 10 104Z", "#A8283A", "#5A0A1A", "#2A0408");
      g += toy("M26 100 L28 52 Q60 44 92 52 L94 100 Q60 108 26 100Z", "#5A5A6A", "#24242E", "#0A0A12");
      g += `<path d="M60 52 V100 M30 74 Q60 82 90 74" stroke="#7A7A8A" stroke-width="2.4" fill="none"/>`;
      g += tf(`M8 66 L22 60 L28 94 L14 100Z`, "mIron", "#14141E", 2, 2.4) + `<path d="M112 92 L114 22" stroke="${TD}" stroke-width="9" stroke-linecap="round"/><path d="M112 92 L114 22" stroke="#C8C8E0" stroke-width="5" stroke-linecap="round"/><path d="M102 88 h22" stroke="#7A5230" stroke-width="6" stroke-linecap="round"/>`;
      g += toy("M34 50 Q30 14 60 10 Q90 14 86 50 Q60 56 34 50Z", "#5A5A6A", "#24242E", "#0A0A12", {dy:3});
      g += toy("M30 24 L14 4 L38 16Z", "#3A3A4A", "#14141E", "#000", {dy:2, w:2.2}) + toy("M90 24 L106 4 L82 16Z", "#3A3A4A", "#14141E", "#000", {dy:2, w:2.2});
      g += `<path d="M38 32 Q60 26 82 32 L80 40 Q60 34 40 40Z" fill="#0A0410" stroke="${TD}" stroke-width="2"/><ellipse cx="50" cy="35" rx="5" ry="2.6" fill="#FF3A2A" class="av-pulse"/><ellipse cx="70" cy="35" rx="5" ry="2.6" fill="#FF3A2A" class="av-pulse"/>`;
      g += `<path d="M60 40 V50 M52 44 v4 M68 44 v4" stroke="#0A0410" stroke-width="2"/><path d="M40 22 Q48 14 60 14" stroke="#fff" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`;
      return g; }}
  };

  /* --- Le Seigneur de la Corruption (boss), 3 phases --- */
  function bossSVG(ph){
    const eye = ph === 1 ? ["#FFE0D0", "#FF3A2A"] : ph === 2 ? ["#FFF4A0", "#FF8A1A"] : ["#F8D8FF", "#C040FF"], u = "lc" + ph;
    let s = `<defs>${rg(u + "e", eye[0], eye[1])}${rg(u + "a", ph === 3 ? "#C060FF" : "#FF5A2A", "#000")}${lg(u + "m", "#5A5A70", "#1E1E2A")}${lg(u + "c", "#6A1A3A", "#24061A")}${lg(u + "l", "#FFD23F", "#FF3A1A")}${lg(u + "w", "#4A1A5A", "#14061E")}</defs>`;
    s += `<circle cx="100" cy="104" r="${ph === 3 ? 112 : 98}" fill="url(#${u}a)" opacity="${ph === 1 ? .22 : .42}" class="av-pulse"/>`;
    s += `<ellipse cx="100" cy="212" rx="84" ry="9" fill="rgba(10,6,24,.4)"/>`;
    if (ph === 3) s += tf(`M70 100 Q20 40 -4 60 Q14 70 8 90 Q24 84 30 100 Q40 92 54 112Z`, u + "w", "#000", 3, 2.6) + tf(`M130 100 Q180 40 204 60 Q186 70 192 90 Q176 84 170 100 Q160 92 146 112Z`, u + "w", "#000", 3, 2.6);
    // cape et armure
    s += tf(`M42 100 Q20 160 22 212 L178 212 Q180 160 158 100Z`, u + "c", "#0A0208", 4, 3);
    s += tf(`M60 212 L58 118 Q60 100 100 98 Q140 100 142 118 L140 212Z`, u + "m", "#0A0A12", 3, 3);
    s += `<path d="M100 104 V206 M66 150 Q100 166 134 150" stroke="#7A7A90" stroke-width="2.6" fill="none"/><path d="M70 118 L72 200" stroke="#fff" stroke-width="3" opacity=".3"/>`;
    if (ph >= 2) s += `<path d="M76 130 l12 14 l-6 12 l14 10 M124 126 l-10 16 l8 10 M110 180 l-12 14" stroke="url(#${u}l)" stroke-width="4" fill="none" class="av-lava" stroke-linecap="round"/>`;
    s += tf(`M42 100 L78 90 L82 124 L46 128Z`, u + "m", "#0A0A12", 2, 2.6) + tf(`M158 100 L122 90 L118 124 L154 128Z`, u + "m", "#0A0A12", 2, 2.6);
    s += `<path d="M46 96 L38 74 L54 90 M154 96 L162 74 L146 90" fill="url(#${u}m)" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round"/>`;
    // épée maudite
    s += `<path d="M170 206 L176 40" stroke="${TD}" stroke-width="12" stroke-linecap="round"/><path d="M170 206 L176 40" stroke="${ph === 3 ? "#C080FF" : "#B8B8D0"}" stroke-width="7" stroke-linecap="round"/><path d="M158 176 h28" stroke="${TD}" stroke-width="8" stroke-linecap="round"/><path d="M158 176 h28" stroke="#7A2A4A" stroke-width="4" stroke-linecap="round"/>`;
    s += `<path d="M173 160 L177 60" stroke="${eye[1]}" stroke-width="2" opacity=".8" class="av-pulse"/>`;
    s += tLimb("M140 132 Q160 140 168 170", "#4A4A60", 12) + tLimb("M60 132 Q42 146 40 170", "#4A4A60", 12);
    // tête : heaume à cornes
    s += tf(`M66 72 Q64 36 100 32 Q136 36 134 72 Q134 98 100 104 Q66 98 66 72Z`, u + "m", "#0A0A12", 3, 3);
    s += tf(`M68 48 Q44 30 46 4 Q58 24 76 34Z`, u + "w", "#000", 2, 2.4) + tf(`M132 48 Q156 30 154 4 Q142 24 124 34Z`, u + "w", "#000", 2, 2.4);
    s += `<path d="M74 62 Q100 52 126 62 L124 76 Q100 68 76 76Z" fill="#0A0208" stroke="${TD}" stroke-width="2.4"/>`;
    s += `<circle cx="88" cy="68" r="12" fill="url(#${u}e)" class="av-pulse"/><circle cx="112" cy="68" r="12" fill="url(#${u}e)" class="av-pulse"/><path d="M80 66 L94 70 M120 66 L106 70" stroke="${eye[0]}" stroke-width="4" stroke-linecap="round"/>`;
    s += `<path d="M100 76 V100 M90 84 v12 M110 84 v12" stroke="#0A0208" stroke-width="3"/><path d="M76 46 Q84 38 96 36" stroke="#fff" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>`;
    s += `<circle cx="100" cy="44" r="5" fill="${eye[1]}" stroke="${TD}" stroke-width="1.8" class="av-pulse"/>`;
    if (ph === 3) s += [[30, 180], [170, 186], [60, 30], [140, 26]].map(([x, y], i) => `<path class="av-flame" style="animation-delay:-${i * .2}s" d="M${x - 8} ${y} Q${x - 10} ${y - 14} ${x} ${y - 24} Q${x + 10} ${y - 14} ${x + 8} ${y}Z" fill="#B060E8" stroke="${TD}" stroke-width="1.8"/>`).join("");
    return `<svg viewBox="0 0 200 222" style="width:100%;height:auto;overflow:visible" aria-label="Le Seigneur de la Corruption">${s}</svg>`;
  }

  /* --- Arène --- */
  function arena(boss){
    let s = `<defs>${defs()}${lg("mAsky", boss ? "#14020E" : "#3A0E1E", boss ? "#4A1A5A" : "#A83A2A")}</defs><rect width="400" height="300" fill="url(#mAsky)"/>`;
    s += `<circle cx="${boss ? 200 : 310}" cy="${boss ? 70 : 60}" r="34" fill="${boss ? "#C080FF" : "#FF6A3A"}" opacity=".85"/><circle cx="${boss ? 200 : 310}" cy="${boss ? 70 : 60}" r="110" fill="url(#${boss ? "mGlowP" : "mGlowR"})" opacity=".3"/>`;
    s += `<path d="M0 190 L50 120 L80 150 L130 80 L170 100 L230 60 L270 110 L320 90 L360 140 L400 120 L400 300 L0 300Z" fill="#1E0E1A"/><path d="M130 80 L140 92 L120 92Z M230 60 L242 76 L218 76Z" fill="url(#mLava)" class="av-lava"/>`;
    s += deadTree(40, 214, 1.4, 4) + deadTree(366, 216, 1.3, 9);
    s += `<path d="M0 214 Q200 196 400 214 L400 300 L0 300Z" fill="#3A2438" stroke="${TD}" stroke-width="3"/>`;
    s += `<ellipse cx="200" cy="262" rx="190" ry="34" fill="#5A3A52" stroke="${TD}" stroke-width="3"/><path d="M50 262 l30 -6 l22 8 l30 -4 M260 272 l30 -8 l34 6" stroke="url(#mLava)" stroke-width="3" fill="none" class="av-lava"/>`;
    s += grave(120, 250, 1.1) + grave(296, 248, 1);
    const r = rnd(boss ? 13 : 23);
    for (let i = 0; i < 22; i++) s += `<circle class="mm-ember" style="animation-delay:-${(r() * 6).toFixed(1)}s" cx="${(r() * 400).toFixed(0)}" cy="${(100 + r() * 180).toFixed(0)}" r="${(1.2 + r() * 1.8).toFixed(1)}" fill="${r() < .5 ? "#FF8A3A" : "#FFD23F"}"/>`;
    return `<svg class="af-bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">${s}</svg>`;
  }

  Aventure.register(5, {
    music:"musique/monde5.mp3", boss:"Le Seigneur de la Corruption", qp:"m5", nodes:NODES, h:1580, mapDraw, bossSVG, arena, monsters,
    title:{id:"adv5", n:"LÉGENDE DE LUMEN", a:"#FFE58A", b:"#7A1A9A", f:"#FFFFFF"},
    phase:["Phase 2 · L'armure se fissure de lave !", "Phase 3 · La corruption se libère !"],
    win:"Le Seigneur de la Corruption est vaincu ! Tu as terminé l'Aventure de Lumen !",
    qn:["Traverser les cendres", "Aux portes de la forteresse", "Le Seigneur déchu", "Étoiles dans les ténèbres", "Toutes les étoiles maudites", "Savant des ténèbres", "Chasseur de démons", "Sans une ombre de travers", "Plus vif que la lave", "Âme pure"],
    levels:[
      {n:"La Plaine de Cendres", mode:"c", diff:3, mix:[.2, .6, .2], sp:{k:"streak", n:5}, mons:["diablotin", "chauve", "diablotin", "chevalier"]},
      {n:"Le Marais Maudit", mode:"c", diff:3, mix:[.2, .55, .25], sp:{k:"first5"}, mons:["chauve", "squelette", "chauve", "chevalier"]},
      {n:"Le Pont de Chaînes", mode:"chrono", diff:3, mix:[.2, .55, .25], sp:{k:"streak", n:6}, mons:["diablotin", "chauve", "squelette"]},
      {n:"Le Cimetière Noir", mode:"surv", diff:3, mix:[.15, .55, .3], sp:{k:"streak", n:7}, mons:["squelette", "chauve", "chevalier"]},
      {n:"Le Cœur du Volcan", mode:"c", diff:3, mix:[.15, .5, .35], sp:{k:"hard"}, mons:["diablotin", "squelette", "diablotin", "chevalier"]},
      {n:"La Forteresse Obscure", mode:"c", diff:3, mix:[.1, .5, .4], sp:{k:"fast", n:8}, mons:["chevalier", "squelette", "chauve", "chevalier"]},
      {n:"Le Trône de la Corruption", mode:"boss", diff:3, mix:[.05, .5, .45], sp:{k:"nolife"}}
    ]
  });
})();
