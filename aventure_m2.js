/* ---------- Aventure · Monde 2 : Le Désert des Rois ----------
   Dunes, oasis, marché aux épices, canyon rouge, cité ensablée, temple du scarabée, tombeau des rois et la grande pyramide.
   Monstres originaux (style jouet) : Scarabée d'Or, Serpent des Dunes, Petite Momie, Scorpion Rouge. Boss : le Sphinx Oublié. */
(() => {
  const {TD, rnd, smooth, sample, dist, near, blob, bumpy, tf, lg, rg, flower} = Aventure.kit;
  const NODES = [[150, 1405], [272, 1250], [128, 1062], [262, 872], [118, 690], [272, 505], [200, 312]];
  const defs = () => lg("dSand", "#FCE2A8", "#E8B868") + lg("dDune", "#F8D088", "#D89A48") + lg("dRock", "#E8845A", "#A84A2E") + lg("dStone", "#F4DCAA", "#C8A06A") + lg("dPalm", "#8ED86A", "#3A8A3A")
    + lg("dTrunk", "#C8925A", "#7A5230") + lg("dWater", "#7FE0F0", "#2A9AC8") + lg("dGold", "#FFE58A", "#E0A01A") + lg("dRed", "#FF6A5A", "#C02838") + lg("dBlue", "#6AB8FF", "#2A5AC8") + lg("dCloth", "#FFFFFF", "#E8D8C0")
    + rg("dGlowY", "#FFF4A0", "#FFB020") + rg("dGlowC", "#B8FFFF", "#3AD8E8") + rg("dGlowO", "#FFC080", "#FF6A2A") + rg("dSun", "#FFFBE0", "#FFE080");

  /* --- Décor --- */
  function palm(x, y, s, seed){
    const r = rnd(seed), lean = (r() - .5) * 16 * s;
    const tr = `M${x - 4 * s} ${y} Q${x - 2 * s + lean * .3} ${y - 30 * s} ${x + lean - 2.5 * s} ${y - 56 * s} L${x + lean + 2.5 * s} ${y - 56 * s} Q${x + 2 * s + lean * .3} ${y - 30 * s} ${x + 4 * s} ${y}Z`;
    let g = `<ellipse cx="${x}" cy="${y}" rx="${16 * s}" ry="${4.5 * s}" fill="rgba(120,70,20,.25)"/>` + tf(tr, "dTrunk", "#5A3418", 0, 2.2);
    for (let k = 0; k < 4; k++) g += `<path d="M${x - 4 * s + lean * (.2 + k * .2)} ${y - 12 * s - k * 11 * s} q${4 * s} ${-2 * s} ${8 * s} 0" stroke="#7A5230" stroke-width="1.6" fill="none"/>`;
    const tx = x + lean, ty = y - 56 * s;
    [[-34, 6], [-20, -12], [0, -18], [20, -12], [34, 6], [-12, 14], [14, 14]].forEach(([dx, dy], i) => {
      const ex = tx + dx * s, ey = ty + dy * s + 8 * s, mx = tx + dx * .5 * s, my = ty - 10 * s + dy * .2 * s;
      g += `<path d="M${tx} ${ty} Q${mx} ${my} ${ex} ${ey} Q${mx + 2} ${my + 8 * s} ${tx} ${ty + 3 * s}Z" fill="url(#dPalm)" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/>`;
    });
    g += `<circle cx="${tx - 3 * s}" cy="${ty + 4 * s}" r="${3 * s}" fill="#8A5A2A" stroke="${TD}" stroke-width="1.4"/><circle cx="${tx + 3 * s}" cy="${ty + 5 * s}" r="${3 * s}" fill="#8A5A2A" stroke="${TD}" stroke-width="1.4"/>`;
    return g;
  }
  // Touffe d'herbe sèche
  const shrub = (x, y, s, seed) => { const r = rnd(seed); let g = `<ellipse cx="${x}" cy="${y}" rx="${11 * s}" ry="${3 * s}" fill="rgba(120,70,20,.22)"/>`;
    for (let k = 0; k < 7; k++) { const a = -1.1 + k * .37 + (r() - .5) * .2, L = (10 + r() * 8) * s; g += `<path d="M${x} ${y} Q${x + Math.cos(a - 1.57) * L * .3} ${y - L * .6} ${(x + Math.sin(a) * L).toFixed(1)} ${(y - Math.cos(a) * L).toFixed(1)}" stroke="${TD}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M${x} ${y} Q${x + Math.cos(a - 1.57) * L * .3} ${y - L * .6} ${(x + Math.sin(a) * L).toFixed(1)} ${(y - Math.cos(a) * L).toFixed(1)}" stroke="${k % 2 ? "#C8B04A" : "#9AB84A"}" stroke-width="2" fill="none" stroke-linecap="round"/>`; }
    return g; };
  const rock = (x, y, s, seed) => `<ellipse cx="${x}" cy="${y + 2}" rx="${16 * s}" ry="${4 * s}" fill="rgba(120,70,20,.25)"/>` + tf(blob(x, y - 8 * s, 15 * s, 10 * s, seed, 8, .18), "dRock", "#7A3018", 3, 2.4) + `<path d="M${x - 9 * s} ${y - 12 * s} q4 -5 9 -6" stroke="#fff" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>`;
  const skull = (x, y) => `<g opacity=".9"><ellipse cx="${x}" cy="${y}" rx="7" ry="6" fill="#FFF6E0" stroke="${TD}" stroke-width="1.6"/><circle cx="${x - 2.5}" cy="${y - .5}" r="1.6" fill="${TD}"/><circle cx="${x + 2.5}" cy="${y - .5}" r="1.6" fill="${TD}"/><path d="M${x - 14} ${y + 6} l10 -3 M${x + 4} ${y + 4} l12 3" stroke="#FFF6E0" stroke-width="3" stroke-linecap="round"/></g>`;
  function tent(x, y, c, seed){
    const stripes = Array.from({length:5}, (_, k) => `<path d="M${x - 30 + k * 12} ${y - 30} L${x - 24 + k * 12} ${y - 30} L${x - 26 + k * 12.6} ${y - 6} L${x - 32 + k * 12.6} ${y - 6}Z" fill="${k % 2 ? "#fff" : c}" opacity=".95"/>`).join("");
    return `<ellipse cx="${x}" cy="${y + 2}" rx="36" ry="8" fill="rgba(120,70,20,.28)"/>`
      + `<rect x="${x - 30}" y="${y - 10}" width="60" height="10" rx="2" fill="url(#dTrunk)" stroke="${TD}" stroke-width="2"/>`
      + [[-26, "#E8A030"], [-10, "#C83A2A"], [8, "#3A9A4A"]].map(([dx, cc]) => `<path d="M${x + dx} ${y - 10} q6 -9 12 0z" fill="${cc}" stroke="${TD}" stroke-width="1.6"/>`).join("")
      + `<path d="M${x - 28} ${y - 10} L${x - 28} ${y - 30} M${x + 28} ${y - 10} L${x + 28} ${y - 30}" stroke="#7A5230" stroke-width="3"/>`
      + `<path d="M${x - 36} ${y - 26} L${x} ${y - 46} L${x + 36} ${y - 26} L${x + 30} ${y - 22} L${x - 30} ${y - 22}Z" fill="${c}" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round"/>`
      + `<path d="M${x - 30} ${y - 22} q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0" fill="#fff" stroke="${TD}" stroke-width="1.6"/>`
      + `<path d="M${x - 18} ${y - 32} L${x} ${y - 42}" stroke="#fff" stroke-width="2.6" opacity=".55" stroke-linecap="round"/>`;
  }
  function jar(x, y, c){ return `<path d="M${x - 6} ${y} Q${x - 10} ${y - 9} ${x - 5} ${y - 15} L${x - 3} ${y - 18} L${x + 3} ${y - 18} L${x + 5} ${y - 15} Q${x + 10} ${y - 9} ${x + 6} ${y}Z" fill="${c}" stroke="${TD}" stroke-width="1.8"/><path d="M${x - 6} ${y - 9} h12" stroke="#FFF6E0" stroke-width="1.6"/>`; }
  function mesa(x, y, w, h, seed){
    const r = rnd(seed), pts = [];
    pts.push([x - w / 2, y]); for (let k = 0; k <= 6; k++) pts.push([x - w / 2 + 4 + k * (w - 8) / 6, y - h + (r() - .5) * 16 + (k === 0 || k === 6 ? 14 : 0)]); pts.push([x + w / 2, y]);
    const d = "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") + "Z";
    let g = `<ellipse cx="${x}" cy="${y + 2}" rx="${w * .55}" ry="12" fill="rgba(120,40,20,.28)"/>` + tf(d, "dRock", "#6A2410", 6, 3);
    for (let k = 1; k < 4; k++) g += `<path d="M${x - w / 2 + 6} ${y - h * k / 4} Q${x} ${y - h * k / 4 + 6} ${x + w / 2 - 6} ${y - h * k / 4 - 2}" stroke="#B8502E" stroke-width="3" fill="none" opacity=".8"/>`;
    g += `<path d="M${x - w / 2 + 10} ${y - h + 22} L${x - w / 2 + 14} ${y - 20}" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>`;
    return g;
  }
  function dome(x, y, s, seed){
    const d = `M${x - 26 * s} ${y} L${x - 26 * s} ${y - 18 * s} Q${x - 26 * s} ${y - 44 * s} ${x} ${y - 46 * s} Q${x + 26 * s} ${y - 44 * s} ${x + 26 * s} ${y - 18 * s} L${x + 26 * s} ${y}Z`;
    return tf(d, "dStone", "#8A6A3A", 4, 2.6) + `<path d="M${x - 6 * s} ${y - 8 * s} L${x - 6 * s} ${y - 22 * s} Q${x} ${y - 30 * s} ${x + 6 * s} ${y - 22 * s} L${x + 6 * s} ${y - 8 * s}Z" fill="#3A2010" stroke="${TD}" stroke-width="2"/>`
      + `<path d="M${x - 30 * s} ${y + 2} Q${x - 10 * s} ${y - 12 * s} ${x + 4 * s} ${y - 4 * s} Q${x + 18 * s} ${y - 14 * s} ${x + 32 * s} ${y + 2}Z" fill="url(#dDune)" stroke="${TD}" stroke-width="2"/>`
      + `<path d="M${x - 16 * s} ${y - 34 * s} Q${x - 8 * s} ${y - 42 * s} ${x + 2 * s} ${y - 43 * s}" stroke="#fff" stroke-width="2.6" fill="none" opacity=".5" stroke-linecap="round"/>`;
  }
  function temple(x, y){
    let g = `<ellipse cx="${x}" cy="${y + 2}" rx="78" ry="12" fill="rgba(120,70,20,.3)"/>`;
    g += tf(`M${x - 74} ${y} L${x - 74} ${y - 14} L${x + 74} ${y - 14} L${x + 74} ${y}Z`, "dStone", "#8A6A3A", 0, 2.6) + tf(`M${x - 66} ${y - 14} L${x - 66} ${y - 24} L${x + 66} ${y - 24} L${x + 66} ${y - 14}Z`, "dStone", "#8A6A3A", 0, 2.6);
    [-54, -30, 30, 54].forEach(dx => g += tf(`M${x + dx - 7} ${y - 24} L${x + dx - 6} ${y - 80} L${x + dx + 6} ${y - 80} L${x + dx + 7} ${y - 24}Z`, "dStone", "#8A6A3A", 0, 2.2) + `<path d="M${x + dx - 2} ${y - 30} V${y - 74}" stroke="#fff" stroke-width="2" opacity=".45"/>`);
    g += tf(`M${x - 68} ${y - 80} L${x + 68} ${y - 80} L${x + 60} ${y - 96} L${x - 60} ${y - 96}Z`, "dGold", "#9A6A10", 3, 2.6);
    g += `<path d="M${x - 18} ${y - 24} L${x - 18} ${y - 62} Q${x} ${y - 76} ${x + 18} ${y - 62} L${x + 18} ${y - 24}Z" fill="#2A1408" stroke="${TD}" stroke-width="2.4"/>`;
    // scarabée doré lumineux
    g += `<circle cx="${x}" cy="${y - 106}" r="22" fill="url(#dGlowC)" class="av-pulse"/><ellipse cx="${x}" cy="${y - 104}" rx="9" ry="11" fill="url(#dGold)" stroke="${TD}" stroke-width="2"/><path d="M${x} ${y - 114} V${y - 94}" stroke="${TD}" stroke-width="1.6"/><path d="M${x - 9} ${y - 108} q-12 -4 -16 4 M${x + 9} ${y - 108} q12 -4 16 4" stroke="url(#dGold)" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${x}" cy="${y - 118}" r="4" fill="#3AD8E8" stroke="${TD}" stroke-width="1.6"/>`;
    [-80, 80].forEach((dx, i) => g += `<rect x="${x + dx - 3}" y="${y - 40}" width="6" height="40" fill="url(#dTrunk)" stroke="${TD}" stroke-width="1.8"/><path class="av-flame" style="animation-delay:-${i * .2}s" d="M${x + dx - 6} ${y - 40} Q${x + dx - 8} ${y - 52} ${x + dx} ${y - 60} Q${x + dx + 8} ${y - 52} ${x + dx + 6} ${y - 40}Z" fill="#FF8A3A" stroke="${TD}" stroke-width="1.8"/><circle cx="${x + dx}" cy="${y - 48}" r="16" fill="url(#dGlowO)" opacity=".6" class="av-pulse"/>`);
    return g;
  }
  function obelisk(x, y, h){
    return `<ellipse cx="${x}" cy="${y + 2}" rx="14" ry="4" fill="rgba(120,70,20,.3)"/>` + tf(`M${x - 8} ${y} L${x - 6} ${y - h} L${x + 6} ${y - h} L${x + 8} ${y}Z`, "dStone", "#8A6A3A", 0, 2.2)
      + tf(`M${x - 6} ${y - h} L${x} ${y - h - 12} L${x + 6} ${y - h}Z`, "dGold", "#9A6A10", 0, 2) + `<path d="M${x - 2} ${y - h * .8} h4 M${x - 2} ${y - h * .6} l2 -3 l2 3 M${x - 2} ${y - h * .4} h4" stroke="#8A5A2A" stroke-width="1.6"/>`;
  }
  function pyramid(x, y){
    let g = `<circle cx="${x}" cy="${y - 120}" r="190" fill="url(#dGlowY)" opacity=".28" class="av-pulse"/>`;
    g += `<path d="M${x - 170} ${y} L${x} ${y - 230} L${x + 170} ${y}Z" fill="#B8803A" stroke="${TD}" stroke-width="3" stroke-linejoin="round" transform="translate(0 6)"/>`;
    g += `<path d="M${x - 170} ${y} L${x} ${y - 230} L${x + 170} ${y}Z" fill="url(#dStone)" stroke="${TD}" stroke-width="3" stroke-linejoin="round"/>`;
    g += `<path d="M${x} ${y - 230} L${x + 170} ${y} L${x + 40} ${y}Z" fill="#D8A868" opacity=".8"/>`;
    for (let k = 1; k < 9; k++) { const yy = y - 230 + k * 25.5, hw = k * 18.9; g += `<path d="M${x - hw} ${yy} L${x + hw} ${yy}" stroke="#A8784A" stroke-width="2" opacity=".75"/>`; }
    g += `<path d="M${x} ${y - 230} L${x - 20} ${y - 203} L${x + 20} ${y - 203}Z" fill="url(#dGold)" stroke="${TD}" stroke-width="2.4"/><circle cx="${x}" cy="${y - 228}" r="14" fill="url(#dGlowY)" class="av-pulse"/>`;
    g += `<path d="M${x - 16} ${y} L${x - 16} ${y - 30} Q${x} ${y - 44} ${x + 16} ${y - 30} L${x + 16} ${y}Z" fill="#2A1408" stroke="${TD}" stroke-width="2.6"/><circle cx="${x - 5}" cy="${y - 20}" r="2.6" fill="#3AD8E8" class="av-pulse"/><circle cx="${x + 5}" cy="${y - 20}" r="2.6" fill="#3AD8E8" class="av-pulse"/>`;
    g += `<path d="M${x - 120} ${y - 40} L${x - 30} ${y - 196}" stroke="#fff" stroke-width="4" opacity=".35" stroke-linecap="round"/>`;
    return g;
  }
  function vulture(x, y, i){ return `<g class="dv-fly" style="animation-delay:-${i * 2.3}s;transform-origin:${x}px ${y}px"><path d="M${x - 14} ${y} q7 -8 14 0 q7 -8 14 0" stroke="${TD}" stroke-width="3" fill="none" stroke-linecap="round" transform="translate(${-30 + i * 20} 0)"/></g>`; }
  function camp(x, y){
    return `<ellipse cx="${x}" cy="${y}" rx="40" ry="9" fill="rgba(120,70,20,.3)"/>` + tent(x - 40, y - 2, "#3A6AC8", 1)
      + `<path class="av-flame" d="M${x + 14} ${y - 2} Q${x + 10} ${y - 16} ${x + 20} ${y - 26} Q${x + 30} ${y - 14} ${x + 26} ${y - 2}Z" fill="#FF8A3A" stroke="${TD}" stroke-width="2"/><circle cx="${x + 20}" cy="${y - 10}" r="24" fill="url(#dGlowO)" opacity=".45" class="av-pulse"/>`
      + `<rect x="${x + 50}" y="${y - 40}" width="5" height="40" fill="url(#dTrunk)" stroke="${TD}" stroke-width="2"/><path d="M${x + 40} ${y - 44} L${x + 82} ${y - 44} L${x + 88} ${y - 36} L${x + 82} ${y - 28} L${x + 40} ${y - 28}Z" fill="url(#dTrunk)" stroke="${TD}" stroke-width="2.2"/><text x="${x + 62}" y="${y - 32.5}" text-anchor="middle" style="font:800 9.5px var(--f-display)" fill="#FFF4DA">DÉPART</text>`;
  }

  /* --- La carte --- */
  function mapDraw(){
    const W = 400, H = 1580, start = [200, 1520], pts = [start, ...NODES], P = sample(pts, 30);
    let s = `<defs>${defs()}</defs><rect width="${W}" height="${H}" fill="url(#dSand)"/>`;
    s += `<rect width="${W}" height="460" fill="#E89850" opacity=".35"/>`;
    const r = rnd(202);
    // dunes en bandes
    for (let k = 0; k < 22; k++) { const y = 380 + k * 56 + (r() - .5) * 20, x0 = -40 + r() * 60; let d = `M${x0} ${y}`; for (let j = 0; j < 5; j++) d += ` q${40 + r() * 20} ${-18 - r() * 12} ${90} 0`; s += `<path d="${d} L${W + 40} ${y + 40} L-40 ${y + 40}Z" fill="${k % 2 ? "#F4C47A" : "#FFE4A8"}" opacity=".5"/>`; }
    for (let i = 0; i < 70; i++) { const x = r() * W, y = 400 + r() * (H - 420); if (near([x, y], P) < 28) continue; s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q6 -4 12 0" stroke="#C8904A" stroke-width="1.6" fill="none" opacity=".55"/>`; }
    // oasis
    s += `<path d="${blob(64, 1372, 52, 26, 11, 10, .14)}" fill="#3A9AC8" stroke="${TD}" stroke-width="3"/><path d="${blob(64, 1370, 44, 20, 11, 10, .14)}" fill="url(#dWater)"/>`;
    s += `<path class="av-flow" d="M30 1370 q12 -4 24 0 q12 4 24 0 q12 -4 24 0" stroke="#E8FFFF" stroke-width="2.4" fill="none" stroke-dasharray="8 10" opacity=".8"/>`;
    s += [[20, 1352], [108, 1360], [96, 1392], [30, 1394]].map(([x, y]) => `<path d="M${x} ${y} q-2 -12 2 -18 M${x + 3} ${y} q2 -10 6 -14" stroke="#3A8A3A" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join("");
    // chemin pavé
    const pd = smooth(pts, false);
    s += `<path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round" transform="translate(0 4)"/><path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round"/><path d="${pd}" stroke="#B88A50" stroke-width="31" fill="none" stroke-linecap="round" transform="translate(0 3)"/><path d="${pd}" stroke="#E8C890" stroke-width="27" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${pd}" stroke="#C8A06A" stroke-width="22" fill="none" stroke-dasharray="9 5" opacity=".55"/>`;
    const items = [];
    items.push([1520, camp(200, 1528)]);
    items.push([1236, tent(338, 1236, "#C83A2A", 1)], [1302, tent(346, 1300, "#3A9A4A", 2)], [1196, tent(210, 1188, "#E8A030", 3)]);
    items.push([1250, jar(312, 1262, "#C86A3A") + jar(322, 1266, "#3A8AC8") + jar(304, 1270, "#E8B030")]);
    items.push([1110, mesa(40, 1110, 90, 130, 3)], [1012, mesa(352, 1012, 90, 96, 7)], [1150, mesa(330, 1160, 100, 90, 9)]);
    items.push([880, dome(340, 880, 1, 1)], [826, dome(170, 826, .85, 2)], [922, dome(40, 922, .9, 3)], [790, dome(330, 786, .7, 4)]);
    items.push([700, temple(282, 700)]);
    items.push([530, obelisk(196, 530, 70)], [470, obelisk(350, 470, 60)], [560, obelisk(44, 560, 64)]);
    items.push([300, pyramid(200, 250)]);
    // sphinx de pierre (gardien du boss) devant la pyramide
    items.push([292, `<g transform="translate(78 292) scale(.36)">${sphinxBody(1, true)}</g>`]);
    items.push([1440, skull(330, 1440)], [960, skull(60, 980)], [600, skull(340, 610)]);
    const STRUCT = [[200, 1500, 60], [64, 1372, 66], [330, 1250, 70], [210, 1186, 46], [40, 1090, 70], [352, 1000, 64], [330, 1150, 60], [340, 860, 40], [170, 810, 40], [40, 905, 38], [330, 776, 34], [282, 660, 100], [196, 500, 30], [350, 440, 26], [44, 530, 26], [200, 170, 190], [120, 270, 70]];
    const rt = rnd(909);
    for (let y = 40; y < H - 10; y += 34) for (let x = -10; x < W + 20; x += 40){
      const px = x + (rt() - .5) * 26, py = y + (rt() - .5) * 18, pt = [px, py], edge = Math.min(px, W - px) < 60;
      if (rt() < (edge ? .45 : .8)) continue;
      if (near(pt, P) < 44 || STRUCT.some(([sx, sy, sr]) => dist(pt, [sx, sy]) < sr)) continue;
      const k = rt(), sc = .8 + rt() * .4, X = +px.toFixed(1), Y = +py.toFixed(1);
      items.push([Y, k < .45 ? palm(X, Y, sc, Math.floor(rt() * 1e4)) : k < .75 ? shrub(X, Y, sc, Math.floor(rt() * 1e4)) : rock(X, Y, sc * .8, Math.floor(rt() * 1e4))]);
    }
    [[30, 1300], [110, 1330], [100, 1420], [16, 1430]].forEach(([x, y], i) => items.push([y, palm(x, y, 1.05, 30 + i)]));
    items.sort((a, b) => a[0] - b[0]).forEach(it => s += it[1]);
    // sable qui vole, vautours, chaleur
    let top = "";
    const rf = rnd(55);
    for (let i = 0; i < 40; i++) { const x = (rf() * W).toFixed(0), y = (300 + rf() * (H - 320)).toFixed(0); top += `<circle class="dv-sand" style="animation-delay:-${(rf() * 5).toFixed(1)}s;animation-duration:${(4 + rf() * 4).toFixed(1)}s" cx="${x}" cy="${y}" r="${(1.2 + rf() * 1.6).toFixed(1)}" fill="#FFF4D0" opacity=".85"/>`; }
    top += vulture(120, 120, 0) + vulture(300, 160, 1) + vulture(240, 620, 2);
    top += [[-40, 600], [80, 1100]].map(([x, y]) => `<path d="M${x} ${y - 300} L${x + 70} ${y - 300} L${x + 260} ${y + 200} L${x + 150} ${y + 200}Z" fill="#FFF6C8" opacity=".08"/>`).join("");
    return {bg:s, top};
  }

  /* --- Monstres du désert --- */
  const monsters = {
    scarab:{n:"Scarabée d'Or", draw(){
      return [[24, 92, 8, 104], [22, 80, 4, 86], [26, 68, 10, 60], [96, 92, 112, 104], [98, 80, 116, 86], [94, 68, 110, 60]].map(([a, b, c, d]) => tLimb(`M${a} ${b} L${c} ${d}`, "#3A2A1A", 5)).join("")
        + toy("M18 84 Q16 46 60 40 Q104 46 102 84 Q100 108 60 110 Q20 108 18 84Z", "#FFE07A", "#D8960A", "#8A5A06")
        + `<path d="M60 44 L60 108" stroke="${TD}" stroke-width="2.6"/><path d="M30 60 Q40 48 56 46" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`
        + `<circle cx="40" cy="80" r="6" fill="#3AD8E8" stroke="${TD}" stroke-width="2"/><circle cx="80" cy="80" r="6" fill="#3AD8E8" stroke="${TD}" stroke-width="2"/>`
        + toy("M34 44 Q36 20 60 18 Q84 20 86 44 Q60 50 34 44Z", "#4A3A2A", "#2A1A0A", "#120A04", {dy:3})
        + `<path d="M44 20 Q36 8 40 2 M76 20 Q84 8 80 2" stroke="${TD}" stroke-width="4" fill="none" stroke-linecap="round"/>`
        + `<path d="M42 30 L54 35 M78 30 L66 35" stroke="#FFE07A" stroke-width="3" stroke-linecap="round"/><ellipse cx="49" cy="38" rx="4" ry="3.4" fill="#7AF8FF" stroke="${TD}" stroke-width="1.6"/><ellipse cx="71" cy="38" rx="4" ry="3.4" fill="#7AF8FF" stroke="${TD}" stroke-width="1.6"/>`
        + `<path d="M50 46 Q44 54 48 60 M70 46 Q76 54 72 60" stroke="${TD}" stroke-width="4" fill="none" stroke-linecap="round"/>`; }},
    serpent:{n:"Serpent des Dunes", draw(){
      return toy("M16 100 Q14 82 40 80 Q78 78 96 88 Q110 98 96 106 Q60 114 16 100Z", "#F4B860", "#C8783A", "#7A4A1A")
        + `<path d="M28 92 q10 -6 20 0 q10 6 20 0 q10 -6 20 0" stroke="#3AB8A8" stroke-width="4" fill="none" stroke-linecap="round"/>`
        + toy("M48 86 Q44 60 52 44 L68 44 Q76 60 72 86Z", "#F4B860", "#C8783A", "#7A4A1A", {dy:3})
        + toy("M26 50 Q24 16 60 12 Q96 16 94 50 Q78 58 60 50 Q42 58 26 50Z", "#FFC870", "#D8843A", "#8A4A1A", {dy:4})
        + `<path d="M36 40 Q48 30 60 32 Q72 30 84 40" stroke="#3AB8A8" stroke-width="4" fill="none"/><path d="M60 22 v8" stroke="#3AB8A8" stroke-width="4" stroke-linecap="round"/>`
        + `<path d="M40 26 L54 32 M80 26 L66 32" stroke="${TD}" stroke-width="4" stroke-linecap="round"/><ellipse cx="49" cy="36" rx="5" ry="6" fill="#FFF26A" stroke="${TD}" stroke-width="2"/><ellipse cx="71" cy="36" rx="5" ry="6" fill="#FFF26A" stroke="${TD}" stroke-width="2"/><rect x="47.6" y="31" width="2.8" height="10" rx="1.4" fill="${TD}"/><rect x="69.6" y="31" width="2.8" height="10" rx="1.4" fill="${TD}"/>`
        + `<path d="M50 46 Q60 54 70 46" stroke="${TD}" stroke-width="3" fill="#5A1A1A"/><path d="M53 47 l2 5 l2 -4.4 M63 47.6 l2 4.4 l2 -5" fill="#fff" stroke="${TD}" stroke-width="1"/><path d="M60 52 v8 l-4 4 M60 60 l4 4" stroke="#E2283A" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
        + `<path d="M34 26 Q42 16 56 14" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".65"/>`; }},
    momie:{n:"Petite Momie", draw(){
      let g = tFeet(44, 76, 106, "#F4E8D0", "#C8B48A", "#8A7A5A", 9);
      g += toy("M28 104 Q20 64 30 40 Q42 18 60 18 Q78 18 90 40 Q100 64 92 104 Q60 112 28 104Z", "#FFF6E4", "#D8C8A4", "#9A8A6A");
      [30, 44, 58, 72, 86].forEach((y, k) => g += `<path d="M${k % 2 ? 22 : 26} ${y} Q60 ${y + (k % 2 ? -8 : 8)} ${k % 2 ? 96 : 94} ${y - 4}" stroke="#C8B48A" stroke-width="2.6" fill="none"/>`);
      g += `<path d="M32 50 L88 44 L88 60 L32 64Z" fill="#3A2A1A" stroke="${TD}" stroke-width="2"/>`;
      g += `<circle cx="72" cy="53" r="10" fill="url(#avMGlow)"/><circle cx="72" cy="53" r="4.6" fill="#7AFF9A" stroke="${TD}" stroke-width="1.6"/><path d="M44 54 h8" stroke="#C8B48A" stroke-width="3" stroke-linecap="round"/>`;
      g += tLimb("M28 70 Q12 66 6 56", "#FFF6E4", 9) + tLimb("M92 70 Q108 66 114 56", "#FFF6E4", 9);
      g += `<path d="M90 96 q14 4 18 14 M30 30 q-10 -10 -4 -20" stroke="#FFF6E4" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M40 28 Q48 20 60 20" stroke="#fff" stroke-width="3.4" fill="none" opacity=".8" stroke-linecap="round"/>`;
      return g; }},
    scorpion:{n:"Scorpion Rouge", draw(){
      let g = "";
      [[36, 96, 16, 108], [46, 100, 32, 112], [84, 96, 104, 108], [74, 100, 88, 112]].forEach(([a, b, c, d]) => g += tLimb(`M${a} ${b} L${c} ${d}`, "#A82A2A", 5));
      g += tLimb("M66 76 Q100 70 104 44 Q106 22 86 18", "#E8443A", 13) + toy("M78 6 Q96 6 94 22 Q84 26 78 18Z", "#FFE07A", "#E0A01A", "#8A5A06", {dy:2, w:2.2});
      g += toy("M24 96 Q20 70 60 66 Q100 70 96 96 Q60 106 24 96Z", "#FF6A5A", "#C02838", "#6A1018");
      g += tLimb("M30 84 Q10 76 12 58", "#E8443A", 9) + tLimb("M90 84 Q110 76 108 58", "#E8443A", 9);
      g += toy("M2 52 Q4 36 18 38 Q26 44 20 56 Q12 52 10 60 Q4 62 2 52Z", "#FF6A5A", "#C02838", "#6A1018", {dy:2, w:2.2}) + toy("M118 52 Q116 36 102 38 Q94 44 100 56 Q108 52 110 60 Q116 62 118 52Z", "#FF6A5A", "#C02838", "#6A1018", {dy:2, w:2.2});
      g += `<path d="M42 72 L54 78 M78 72 L66 78" stroke="${TD}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="83" r="4.4" fill="#FFE07A" stroke="${TD}" stroke-width="1.8"/><circle cx="70" cy="83" r="4.4" fill="#FFE07A" stroke="${TD}" stroke-width="1.8"/>`;
      g += `<path d="M50 92 l4 -3 l4 3 l4 -3 l4 3 l4 -3" stroke="${TD}" stroke-width="2.4" fill="none"/><path d="M32 78 Q40 70 52 68" stroke="#fff" stroke-width="3.4" fill="none" opacity=".6" stroke-linecap="round"/>`;
      return g; }}
  };

  /* --- Le Sphinx Oublié (boss), 3 phases --- */
  function sphinxBody(ph, statue){
    const eye = ph === 1 ? ["#FFF4A0", "#FFB020"] : ph === 2 ? ["#FFD0C0", "#FF3A2A"] : ["#C8FFFF", "#2AD8F0"], u = "sx" + ph + (statue ? "s" : "");
    let s = `<defs>${rg(u + "e", eye[0], eye[1])}${rg(u + "a", ph === 3 ? "#7AF8FF" : ph === 2 ? "#FF7A3A" : "#FFE07A", "#000")}${lg(u + "b", statue ? "#E8C890" : "#F4D49A", statue ? "#B08A50" : "#C8965A")}${lg(u + "g", "#FFE58A", "#D8960A")}${lg(u + "n", "#4A8AE8", "#1A3A9A")}</defs>`;
    if (!statue) s += `<circle cx="100" cy="110" r="${ph === 3 ? 108 : 96}" fill="url(#${u}a)" opacity="${ph === 1 ? .25 : .45}" class="av-pulse"/>`;
    s += `<ellipse cx="100" cy="212" rx="92" ry="9" fill="rgba(10,6,24,.35)"/>`;
    // corps de lion couché, pattes avant
    s += tf(`M22 210 Q14 160 40 140 L160 140 Q186 160 178 210Z`, u + "b", "#7A5230", 5, 3);
    s += tf(`M44 212 L44 176 Q44 166 56 166 L76 166 Q86 166 86 178 L86 212Z`, u + "b", "#7A5230", 3, 2.8) + tf(`M114 212 L114 178 Q114 166 124 166 L144 166 Q156 166 156 176 L156 212Z`, u + "b", "#7A5230", 3, 2.8);
    s += `<path d="M52 212 v-8 M62 212 v-8 M72 212 v-8 M124 212 v-8 M134 212 v-8 M144 212 v-8" stroke="${TD}" stroke-width="2.4"/>`;
    // némès (coiffe rayée bleu et or)
    s += tf(`M44 156 Q36 104 52 72 Q70 40 100 40 Q130 40 148 72 Q164 104 156 156 L132 156 Q136 120 126 104 L74 104 Q64 120 68 156Z`, u + "g", "#8A5A06", 4, 3);
    for (let k = 0; k < 7; k++) s += `<path d="M${52 + k * 2} ${80 + k * 11} Q${70} ${76 + k * 9} ${74} ${104 + k * 2}" stroke="url(#${u}n)" stroke-width="6" fill="none"/><path d="M${148 - k * 2} ${80 + k * 11} Q${130} ${76 + k * 9} ${126} ${104 + k * 2}" stroke="url(#${u}n)" stroke-width="6" fill="none"/>`;
    s += `<path d="M64 60 Q100 36 136 60" stroke="url(#${u}n)" stroke-width="7" fill="none"/>`;
    // visage
    s += tf(`M70 74 Q70 58 100 56 Q130 58 130 74 L128 118 Q118 140 100 142 Q82 140 72 118Z`, u + "b", "#7A5230", 3, 3);
    s += `<path d="M90 142 L92 168 L108 168 L110 142" fill="url(#${u}g)" stroke="${TD}" stroke-width="2.6"/><path d="M92 150 h16 M92 158 h16" stroke="url(#${u}n)" stroke-width="3"/>`;
    s += `<path d="M100 40 L94 26 L100 14 L106 26Z" fill="url(#${u}g)" stroke="${TD}" stroke-width="2.4"/><circle cx="100" cy="24" r="3.4" fill="${statue ? "#3AD8E8" : eye[1]}" stroke="${TD}" stroke-width="1.4"/>`;
    s += `<path d="M76 84 L94 92 M124 84 L106 92" stroke="${TD}" stroke-width="${ph === 1 ? 4 : 6}" stroke-linecap="round"/>`;
    if (statue) s += `<ellipse cx="86" cy="98" rx="6" ry="4" fill="#3AD8E8" stroke="${TD}" stroke-width="2" class="av-pulse"/><ellipse cx="114" cy="98" rx="6" ry="4" fill="#3AD8E8" stroke="${TD}" stroke-width="2" class="av-pulse"/>`;
    else s += `<circle cx="86" cy="98" r="14" fill="url(#${u}e)" class="av-pulse"/><circle cx="114" cy="98" r="14" fill="url(#${u}e)" class="av-pulse"/><ellipse cx="86" cy="98" rx="7" ry="5.6" fill="${eye[0]}" stroke="${TD}" stroke-width="2.4"/><ellipse cx="114" cy="98" rx="7" ry="5.6" fill="${eye[0]}" stroke="${TD}" stroke-width="2.4"/><ellipse cx="86" cy="98" rx="2.6" ry="4.4" fill="${TD}"/><ellipse cx="114" cy="98" rx="2.6" ry="4.4" fill="${TD}"/>`;
    s += `<path d="M98 104 L96 116 L104 116 L102 104" stroke="#8A5A2A" stroke-width="2" fill="none"/>`;
    s += statue ? `<path d="M88 126 Q100 130 112 126" stroke="${TD}" stroke-width="3" fill="none" stroke-linecap="round"/>` : `<path d="M84 124 Q100 ${ph === 1 ? 120 : 116} 116 124 Q100 ${ph === 1 ? 136 : 142} 84 124Z" fill="#2A0A0A" stroke="${TD}" stroke-width="2.6"/><path d="M89 125 l3 6 l3 -7 l3 7 l3 -7 l3 7 l3 -6" stroke="#FFF0D0" stroke-width="2" fill="none" stroke-linejoin="round"/>`;
    if (ph >= 2) s += `<path d="M78 70 L86 82 L82 92 M120 64 L114 76 M134 120 L124 132" stroke="${ph === 3 ? "#7AF8FF" : "#FF7A3A"}" stroke-width="2.6" fill="none" stroke-linecap="round" class="av-pulse"/>`;
    if (ph === 3) s += `<g class="av-spin"><ellipse cx="100" cy="100" rx="96" ry="22" fill="none" stroke="#7AF8FF" stroke-width="3" stroke-dasharray="6 10" opacity=".8"/></g>` + [[24, 70], [176, 70], [30, 130], [170, 130]].map(([x, y], i) => `<path d="M${x - 5} ${y} h10 M${x} ${y - 6} v12 M${x - 4} ${y - 4} l8 8" stroke="#7AF8FF" stroke-width="2.4" class="av-pulse" style="animation-delay:-${i * .3}s"/>`).join("");
    s += `<path d="M58 84 Q62 66 78 58" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>`;
    return s;
  }
  const bossSVG = ph => `<svg viewBox="0 0 200 222" style="width:100%;height:auto;overflow:visible" aria-label="Le Sphinx Oublié">${sphinxBody(ph, false)}</svg>`;

  /* --- Arène --- */
  function arena(boss){
    let s = `<defs>${defs()}${lg("dSky", boss ? "#3A1A4A" : "#FF9A5A", boss ? "#C86A3A" : "#FFE4A0")}</defs><rect width="400" height="300" fill="url(#dSky)"/><circle cx="${boss ? 80 : 300}" cy="${boss ? 60 : 50}" r="${boss ? 26 : 40}" fill="${boss ? "#F4E8FF" : "#FFF8D0"}" opacity=".9"/><circle cx="${boss ? 80 : 300}" cy="${boss ? 60 : 50}" r="110" fill="url(#dSun)" opacity="${boss ? .15 : .5}"/>`;
    s += `<path d="M150 190 L230 100 L310 190Z" fill="${boss ? "#7A4A3A" : "#E8A868"}" opacity=".7"/><path d="M20 190 L70 140 L120 190Z" fill="${boss ? "#6A3A30" : "#E0A060"}" opacity=".6"/><path d="M290 190 L340 150 L390 190Z" fill="${boss ? "#6A3A30" : "#E0A060"}" opacity=".6"/>`;
    s += `<path d="M0 190 Q60 160 130 185 Q210 205 280 178 Q340 160 400 182 L400 300 L0 300Z" fill="${boss ? "#B8784A" : "#F0C070"}"/>`;
    s += palm(30, 205, 1.2, 4) + palm(372, 210, 1.1, 8);
    s += `<path d="M0 214 Q200 196 400 214 L400 300 L0 300Z" fill="${boss ? "#D8A060" : "#FFD890"}" stroke="${TD}" stroke-width="3"/>`;
    s += `<ellipse cx="200" cy="262" rx="190" ry="34" fill="${boss ? "#E8B470" : "#FFE4A8"}" stroke="${TD}" stroke-width="3"/><ellipse cx="200" cy="258" rx="170" ry="24" fill="#FFF0C8" opacity=".5"/>`;
    const r = rnd(boss ? 31 : 13);
    for (let i = 0; i < 14; i++) s += `<path d="M${(20 + r() * 360).toFixed(0)} ${(236 + r() * 46).toFixed(0)} q6 -4 12 0" stroke="#C8904A" stroke-width="1.8" fill="none"/>`;
    if (boss) s += [70, 330].map((x, i) => `<rect x="${x - 4}" y="170" width="8" height="70" fill="#7A5230" stroke="${TD}" stroke-width="2"/><path class="av-flame" style="animation-delay:-${i * .25}s" d="M${x - 9} 170 Q${x - 11} 154 ${x} 142 Q${x + 11} 154 ${x + 9} 170Z" fill="#FF8A3A" stroke="${TD}" stroke-width="2"/><circle cx="${x}" cy="158" r="26" fill="url(#dGlowO)" opacity=".5" class="av-pulse"/>`).join("");
    for (let i = 0; i < 16; i++) s += `<circle class="dv-sand" style="animation-delay:-${(r() * 5).toFixed(1)}s" cx="${(r() * 400).toFixed(0)}" cy="${(80 + r() * 160).toFixed(0)}" r="1.8" fill="#FFF4D0"/>`;
    return `<svg class="af-bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">${s}</svg>`;
  }

  Aventure.register(2, {
    music:"musique/monde2.mp3", boss:"Le Sphinx Oublié", qp:"d2", nodes:NODES, h:1580, mapDraw, bossSVG, arena, monsters,
    title:{id:"adv2", n:"ÉNIGME DES SABLES", a:"#FFE58A", b:"#C8781A", f:"#2B1D3A"},
    phase:["Phase 2 · Le Sphinx se fissure de colère !", "Phase 3 · L'énigme éternelle !"],
    win:"Le Sphinx Oublié retourne au silence. Le désert t'appartient !",
    qn:["La route des caravanes", "Aux portes du tombeau", "L'énigme résolue", "Chercheur d'or", "Toutes les étoiles du désert", "Savant des sables", "Chasseur de scorpions", "Sans un grain de travers", "Vif comme le vent", "Mirage parfait"],
    levels:[
      {n:"L'Oasis Perdue", mode:"c", diff:1, mix:[.6, .4, 0], sp:{k:"first5"}, mons:["scarab", "serpent", "scarab", "momie"]},
      {n:"Le Marché aux Épices", mode:"c", diff:2, mix:[.55, .45, 0], sp:{k:"streak", n:5}, mons:["serpent", "scarab", "serpent", "momie"]},
      {n:"Le Canyon des Vents", mode:"surv", diff:2, mix:[.55, .45, 0], sp:{k:"streak", n:7}, mons:["scarab", "serpent", "scorpion"]},
      {n:"La Cité Ensablée", mode:"c", diff:2, mix:[.5, .5, 0], sp:{k:"hard"}, mons:["momie", "scarab", "serpent", "scorpion"]},
      {n:"Le Temple du Scarabée", mode:"chrono", diff:2, mix:[.5, .5, 0], sp:{k:"streak", n:6}, mons:["scarab", "serpent"]},
      {n:"Le Tombeau des Rois", mode:"c", diff:3, mix:[.4, .6, 0], sp:{k:"fast", n:8}, mons:["momie", "serpent", "momie", "scorpion"]},
      {n:"La Chambre du Sphinx", mode:"boss", diff:3, mix:[.3, .55, .15], sp:{k:"nolife"}}
    ]
  });
})();
