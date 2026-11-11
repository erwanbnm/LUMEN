/* ---------- Aventure · Monde 4 : Le Royaume de Glace ----------
   Col enneigé, lac gelé, village des fourrures, mines de cristal, falaises du blizzard, pont de givre et le château du Roi des Glaces,
   sous une aurore boréale. Monstres originaux (style jouet) : Bonhomme de Givre, Loup Blanc, Golem de Cristal, Yéti Grognon (chef).
   Boss : le Roi des Glaces. */
(() => {
  const {TD, rnd, smooth, sample, dist, near, blob, bumpy, tf, lg, rg} = Aventure.kit;
  const NODES = [[200, 1405], [298, 1250], [108, 1080], [282, 880], [118, 700], [280, 515], [200, 312]];
  const defs = () => lg("gSnow", "#FFFFFF", "#D4E8F8") + lg("gIce", "#E8FCFF", "#8AD0F0") + lg("gRock", "#9AA8C0", "#4A5878") + lg("gPine", "#5AA88A", "#1E5A4A") + lg("gWood", "#A8784A", "#5A3A1E")
    + lg("gCrys", "#E8C8FF", "#7A5AE8") + lg("gCrysB", "#C8F8FF", "#3AA8E8") + lg("gFur", "#FFFFFF", "#C8D4E8") + lg("gRoof", "#E8F4FF", "#A8C8E8")
    + rg("gGlowC", "#E8FFFF", "#5AD8FF") + rg("gGlowP", "#F0D8FF", "#A060FF") + rg("gGlowY", "#FFF4C0", "#FFC040");

  /* --- Décor --- */
  function pine(x, y, s){
    const h = 62 * s, w = 24 * s;
    const d = `M${x} ${y - h} L${x + w * .5} ${y - h * .7} L${x + w * .3} ${y - h * .7} L${x + w * .8} ${y - h * .4} L${x + w * .5} ${y - h * .4} L${x + w} ${y - h * .12} L${x - w} ${y - h * .12} L${x - w * .5} ${y - h * .4} L${x - w * .8} ${y - h * .4} L${x - w * .3} ${y - h * .7} L${x - w * .5} ${y - h * .7}Z`;
    const snow = `M${x} ${y - h} L${x + w * .42} ${y - h * .74} Q${x + w * .2} ${y - h * .7} ${x} ${y - h * .76} Q${x - w * .2} ${y - h * .7} ${x - w * .42} ${y - h * .74}Z M${x - w * .7} ${y - h * .42} Q${x} ${y - h * .5} ${x + w * .7} ${y - h * .42} L${x + w * .55} ${y - h * .38} Q${x} ${y - h * .44} ${x - w * .55} ${y - h * .38}Z M${x - w * .9} ${y - h * .14} Q${x} ${y - h * .22} ${x + w * .9} ${y - h * .14} L${x + w * .8} ${y - h * .1} Q${x} ${y - h * .16} ${x - w * .8} ${y - h * .1}Z`;
    return `<ellipse cx="${x}" cy="${y}" rx="${17 * s}" ry="${5 * s}" fill="rgba(40,60,110,.2)"/><rect x="${x - 3.5 * s}" y="${y - 10 * s}" width="${7 * s}" height="${10 * s}" fill="url(#gWood)" stroke="${TD}" stroke-width="2"/>` + tf(d, "gPine", "#103A30", 3 * s, 2.4) + `<path d="${snow}" fill="#fff" stroke="${TD}" stroke-width="1.4" stroke-linejoin="round"/>`;
  }
  const rockS = (x, y, s, seed) => `<ellipse cx="${x}" cy="${y + 2}" rx="${17 * s}" ry="${4 * s}" fill="rgba(40,60,110,.22)"/>` + tf(blob(x, y - 9 * s, 16 * s, 11 * s, seed, 8, .18), "gRock", "#2A3450", 3, 2.4) + `<path d="${bumpy(x - 2 * s, y - 17 * s, 13 * s, 5 * s, 4, seed)}" fill="#fff" stroke="${TD}" stroke-width="1.6"/>`;
  const iceSpike = (x, y, s) => tf(`M${x - 8 * s} ${y} L${x - 3 * s} ${y - 26 * s} L${x} ${y - 8 * s} L${x + 4 * s} ${y - 34 * s} L${x + 9 * s} ${y}Z`, "gIce", "#3A8AB8", 2, 2) + `<path d="M${x + 2 * s} ${y - 6 * s} L${x + 4 * s} ${y - 26 * s}" stroke="#fff" stroke-width="2" opacity=".8"/>`;
  const snowman = (x, y) => `<circle cx="${x}" cy="${y - 10}" r="11" fill="url(#gFur)" stroke="${TD}" stroke-width="2"/><circle cx="${x}" cy="${y - 27}" r="8" fill="url(#gFur)" stroke="${TD}" stroke-width="2"/><path d="M${x} ${y - 27} l8 2 l-8 1Z" fill="#FF8A3A" stroke="${TD}" stroke-width="1"/><circle cx="${x - 3}" cy="${y - 30}" r="1.3" fill="${TD}"/><circle cx="${x + 3}" cy="${y - 30}" r="1.3" fill="${TD}"/><path d="M${x - 8} ${y - 21} h16" stroke="#E2283A" stroke-width="3"/>`;
  function lake(x, y){
    let g = `<path d="${blob(x, y, 110, 46, 21, 12, .1)}" fill="#5AA8D8" stroke="${TD}" stroke-width="3"/><path d="${blob(x, y - 2, 100, 40, 21, 12, .1)}" fill="url(#gIce)"/>`;
    g += `<path d="M${x - 60} ${y - 10} l20 8 l10 -12 l24 10 M${x + 10} ${y + 14} l18 -10 l22 6 M${x - 30} ${y + 18} l14 -6" stroke="#fff" stroke-width="2" fill="none" opacity=".9"/>`;
    g += `<path d="M${x - 80} ${y - 20} Q${x - 40} ${y - 34} ${x} ${y - 34}" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>`;
    g += `<g class="gi-skate"><ellipse cx="${x + 40}" cy="${y + 4}" rx="14" ry="3" fill="#fff" opacity=".6"/></g>`;
    return g;
  }
  function hutS(x, y, s, seed){
    const wall = `M${x - 24 * s} ${y} L${x - 24 * s} ${y - 26 * s} L${x + 24 * s} ${y - 26 * s} L${x + 24 * s} ${y}Z`;
    const roof = `M${x - 32 * s} ${y - 22 * s} L${x} ${y - 52 * s} L${x + 32 * s} ${y - 22 * s}Z`;
    return `<ellipse cx="${x}" cy="${y + 2}" rx="${30 * s}" ry="${6 * s}" fill="rgba(40,60,110,.25)"/>` + tf(wall, "gWood", "#3A2010", 0, 2.4)
      + [-14, 0, 14].map(dx => `<path d="M${x + dx * s} ${y - 26 * s} V${y}" stroke="#5A3418" stroke-width="1.6" opacity=".6"/>`).join("")
      + `<rect x="${x - 6 * s}" y="${y - 16 * s}" width="${12 * s}" height="${16 * s}" fill="#3A2010" stroke="${TD}" stroke-width="1.8"/><rect x="${x + 10 * s}" y="${y - 20 * s}" width="${9 * s}" height="${8 * s}" fill="url(#gGlowY)" stroke="${TD}" stroke-width="1.6" class="av-pulse" style="animation-delay:-${seed * .4}s"/>`
      + tf(roof, "gRoof", "#5A7AA8", 3, 2.6) + `<path d="M${x - 32 * s} ${y - 22 * s} q8 6 16 0 q8 6 16 0 q8 6 16 0 q8 6 16 0" fill="#fff" stroke="${TD}" stroke-width="1.6"/>`
      + `<rect x="${x + 12 * s}" y="${y - 50 * s}" width="${7 * s}" height="${14 * s}" fill="#8A6A5A" stroke="${TD}" stroke-width="1.6"/><circle cx="${x + 15 * s}" cy="${y - 58 * s}" r="${5 * s}" fill="#E8EEF8" opacity=".7" class="av-fog"/>`;
  }
  function mine(x, y){
    let g = `<ellipse cx="${x}" cy="${y + 4}" rx="70" ry="12" fill="rgba(40,60,110,.3)"/>` + tf(blob(x, y - 42, 64, 50, 44, 11, .12), "gRock", "#2A3450", 5, 2.8);
    g += `<path d="${bumpy(x, y - 86, 46, 12, 6, 5)}" fill="#fff" stroke="${TD}" stroke-width="2"/>`;
    g += `<path d="M${x - 24} ${y} L${x - 24} ${y - 40} L${x + 24} ${y - 40} L${x + 24} ${y}Z" fill="#14102A" stroke="${TD}" stroke-width="2.6"/><path d="M${x - 28} ${y - 40} h56 M${x - 24} ${y - 40} v40 M${x + 24} ${y - 40} v40" stroke="url(#gWood)" stroke-width="6"/>`;
    g += [[-44, -10, "gCrys"], [-52, -30, "gCrysB"], [44, -14, "gCrysB"], [50, -36, "gCrys"], [-8, -6, "gCrys"]].map(([dx, dy, c], i) => `<circle cx="${x + dx}" cy="${y + dy - 8}" r="14" fill="url(#${c === "gCrys" ? "gGlowP" : "gGlowC"})" opacity=".6" class="av-pulse" style="animation-delay:-${i * .3}s"/>` + tf(`M${x + dx - 6} ${y + dy} L${x + dx - 2} ${y + dy - 22} L${x + dx + 2} ${y + dy - 10} L${x + dx + 6} ${y + dy - 26} L${x + dx + 9} ${y + dy}Z`, c, "#2A1A6A", 2, 1.8)).join("");
    g += `<path d="M${x - 40} ${y + 6} L${x + 40} ${y + 6}" stroke="#5A3418" stroke-width="3"/><rect x="${x + 28}" y="${y - 6}" width="18" height="10" rx="2" fill="url(#gWood)" stroke="${TD}" stroke-width="1.8"/>`;
    return g;
  }
  function cliff(x, y, w, h, seed){
    const r = rnd(seed), pts = [[x - w / 2, y]]; for (let k = 0; k <= 5; k++) pts.push([x - w / 2 + 6 + k * (w - 12) / 5, y - h + (r() - .5) * 18]); pts.push([x + w / 2, y]);
    const d = "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") + "Z";
    let g = `<ellipse cx="${x}" cy="${y + 3}" rx="${w * .55}" ry="12" fill="rgba(40,60,110,.25)"/>` + tf(d, "gRock", "#2A3450", 6, 3);
    const top = pts.slice(1, -1); g += `<path d="M${top.map(p => p[0].toFixed(1) + " " + (p[1] - 3).toFixed(1)).join(" L")} L${top[top.length - 1][0]} ${top[top.length - 1][1] + 14} Q${x} ${y - h + 22} ${top[0][0]} ${top[0][1] + 14}Z" fill="#fff" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/>`;
    g += `<path d="M${x - w / 2 + 12} ${y - h + 30} L${x - w / 2 + 16} ${y - 18}" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>`;
    return g;
  }
  function iceBridge(x, y){
    return `<g transform="translate(${x} ${y}) rotate(-28)"><rect x="-56" y="-18" width="112" height="36" rx="8" fill="#3A6A9A" opacity=".35" transform="translate(0 6)"/>`
      + `<rect x="-56" y="-18" width="112" height="36" rx="8" fill="url(#gIce)" stroke="${TD}" stroke-width="2.6"/>` + [-36, -12, 12, 36].map(dx => `<path d="M${dx} -16 L${dx + 6} 16" stroke="#fff" stroke-width="2" opacity=".8"/>`).join("")
      + `<path d="M-56 -18 Q0 -34 56 -18" stroke="url(#gCrysB)" stroke-width="5" fill="none"/></g>`;
  }
  function castle(x, y){
    let g = `<path d="M-20 ${y + 10} Q${x - 100} ${y - 30} ${x} ${y - 40} Q${x + 100} ${y - 30} 420 ${y + 10} L420 ${y + 30} L-20 ${y + 30}Z" fill="url(#gSnow)"/>`;
    g += `<circle cx="${x}" cy="${y - 120}" r="170" fill="url(#gGlowC)" opacity=".3" class="av-pulse"/>`;
    const tower = (tx, ty, w, h) => tf(`M${tx - w / 2} ${ty} L${tx - w / 2} ${ty - h} L${tx + w / 2} ${ty - h} L${tx + w / 2} ${ty}Z`, "gIce", "#2A6A9A", 4, 2.8)
      + tf(`M${tx - w / 2 - 6} ${ty - h} L${tx} ${ty - h - w * 1.6} L${tx + w / 2 + 6} ${ty - h}Z`, "gCrysB", "#1A4A8A", 3, 2.6)
      + `<path d="M${tx - 5} ${ty - h * .55} L${tx - 5} ${ty - h * .75} Q${tx} ${ty - h * .82} ${tx + 5} ${ty - h * .75} L${tx + 5} ${ty - h * .55}Z" fill="#1A2A5A" stroke="${TD}" stroke-width="1.6"/><path d="M${tx - w / 2 + 4} ${ty - h + 6} V${ty - 8}" stroke="#fff" stroke-width="3" opacity=".6"/>`;
    g += tower(x - 120, y, 34, 120) + tower(x + 120, y, 34, 120) + tower(x - 64, y - 6, 40, 170) + tower(x + 64, y - 6, 40, 170);
    g += tf(`M${x - 50} ${y} L${x - 50} ${y - 150} L${x + 50} ${y - 150} L${x + 50} ${y}Z`, "gIce", "#2A6A9A", 4, 3) + tf(`M${x - 58} ${y - 150} L${x} ${y - 250} L${x + 58} ${y - 150}Z`, "gCrysB", "#1A4A8A", 4, 3);
    g += `<path d="M${x - 22} ${y} L${x - 22} ${y - 52} Q${x} ${y - 76} ${x + 22} ${y - 52} L${x + 22} ${y}Z" fill="#14204A" stroke="${TD}" stroke-width="2.6"/><circle cx="${x - 7}" cy="${y - 38}" r="3" fill="#7AE8FF" class="av-pulse"/><circle cx="${x + 7}" cy="${y - 38}" r="3" fill="#7AE8FF" class="av-pulse"/>`;
    g += `<path d="M${x} ${y - 250} L${x - 10} ${y - 268} L${x} ${y - 290} L${x + 10} ${y - 268}Z" fill="url(#gCrysB)" stroke="${TD}" stroke-width="2.4"/><circle cx="${x}" cy="${y - 270}" r="18" fill="url(#gGlowC)" class="av-pulse"/>`;
    g += `<path d="M${x - 40} ${y - 140} L${x - 40} ${y - 20}" stroke="#fff" stroke-width="4" opacity=".5" stroke-linecap="round"/>`;
    return g;
  }
  function start(x, y){
    return `<ellipse cx="${x}" cy="${y}" rx="40" ry="9" fill="rgba(40,60,110,.25)"/>`
      + `<path d="M${x - 46} ${y} Q${x - 46} ${y - 32} ${x - 22} ${y - 32} Q${x + 2} ${y - 32} ${x + 2} ${y}Z" fill="url(#gFur)" stroke="${TD}" stroke-width="2.4"/>` + [-34, -22, -10].map(dx => `<path d="M${x + dx} ${y - 30} V${y}" stroke="#B8C8E0" stroke-width="1.4"/>`).join("") + `<path d="M${x - 46} ${y - 12} Q${x - 22} ${y - 18} ${x + 2} ${y - 12}" stroke="#B8C8E0" stroke-width="1.4" fill="none"/><path d="M${x - 30} ${y} Q${x - 30} ${y - 14} ${x - 22} ${y - 14} Q${x - 14} ${y - 14} ${x - 14} ${y}Z" fill="#2A3A6A" stroke="${TD}" stroke-width="2"/>`
      + `<path class="av-flame" d="M${x + 10} ${y - 2} Q${x + 6} ${y - 16} ${x + 16} ${y - 26} Q${x + 26} ${y - 14} ${x + 22} ${y - 2}Z" fill="#FF8A3A" stroke="${TD}" stroke-width="2"/><circle cx="${x + 16}" cy="${y - 10}" r="22" fill="url(#gGlowY)" opacity=".45" class="av-pulse"/>`
      + `<rect x="${x + 44}" y="${y - 40}" width="5" height="40" fill="url(#gWood)" stroke="${TD}" stroke-width="2"/><path d="M${x + 34} ${y - 44} L${x + 76} ${y - 44} L${x + 82} ${y - 36} L${x + 76} ${y - 28} L${x + 34} ${y - 28}Z" fill="url(#gWood)" stroke="${TD}" stroke-width="2.2"/><text x="${x + 56}" y="${y - 32.5}" text-anchor="middle" style="font:800 9.5px var(--f-display)" fill="#FFF4DA">DÉPART</text>`;
  }

  /* --- La carte --- */
  function mapDraw(){
    const W = 400, H = 1580, st = [200, 1520], pts = [st, ...NODES], P = sample(pts, 30);
    let s = `<defs>${defs()}${lg("gSky", "#1A2A6A", "#C8E4F8")}${lg("gAur", "#5AF8B8", "#5AF8B8")}</defs><rect width="${W}" height="${H}" fill="url(#gSnow)"/><rect width="${W}" height="420" fill="url(#gSky)"/>`;
    // aurore boréale
    s += [["#5AF8B8", 70], ["#A87AFF", 120], ["#5AD8FF", 170]].map(([c, y], i) => `<path class="gi-aur" style="animation-delay:-${i * 1.5}s" d="M-20 ${y} Q100 ${y - 50} 200 ${y - 10} T420 ${y - 20}" stroke="${c}" stroke-width="${26 - i * 4}" fill="none" opacity=".35" stroke-linecap="round"/>`).join("");
    const rs = rnd(1234); for (let i = 0; i < 30; i++) { const r = rs; s += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * 200).toFixed(0)}" r="${(r() * 1.6 + .6).toFixed(1)}" fill="#fff" class="av-pulse" style="animation-delay:-${(r() * 2).toFixed(1)}s"/>`; }
    const r = rnd(404);
    for (let i = 0; i < 40; i++) { const x = r() * W, y = 440 + r() * (H - 460); if (near([x, y], P) < 36) continue; s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(26 + r() * 40).toFixed(0)}" ry="${(7 + r() * 8).toFixed(0)}" fill="${r() < .5 ? "#C8DCF0" : "#FFFFFF"}" opacity=".7"/>`; }
    s += lake(110, 1080 + 40);
    const pd = smooth(pts, false);
    s += `<path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round" transform="translate(0 4)"/><path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round"/><path d="${pd}" stroke="#8AA8D0" stroke-width="31" fill="none" stroke-linecap="round" transform="translate(0 3)"/><path d="${pd}" stroke="#E4EEF8" stroke-width="27" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${pd}" stroke="#A8C0E0" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="3 14" transform="translate(-5 0)"/><path d="${pd}" stroke="#A8C0E0" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="3 14" stroke-dashoffset="8" transform="translate(5 0)"/>`;
    const items = [];
    items.push([1530, start(180, 1530)]);
    items.push([1262, hutS(330, 1290, 1, 1)], [1210, hutS(360, 1200, .85, 2)], [1180, hutS(210, 1176, .8, 3)], [1230, snowman(250, 1236)]);
    items.push([880, mine(110, 890)]);
    items.push([720, cliff(320, 720, 110, 120, 5)], [660, cliff(36, 650, 80, 110, 9)], [780, cliff(330, 790, 70, 70, 7)]);
    items.push([600, iceBridge(206, 606)]);
    items.push([320, castle(200, 300)]);
    [[60, 1420], [320, 1440], [40, 1000], [360, 1010], [200, 960], [360, 560], [40, 470]].forEach(([x, y], i) => items.push([y, iceSpike(x, y, 1 + (i % 3) * .2)]));
    const STRUCT = [[180, 1510, 60], [110, 1120, 110], [330, 1260, 60], [360, 1190, 44], [210, 1166, 40], [110, 870, 80], [320, 700, 80], [36, 630, 56], [330, 780, 48], [206, 606, 64], [200, 180, 210]];
    const rt = rnd(808);
    for (let y = 380; y < H - 10; y += 28) for (let x = -10; x < W + 20; x += 33){
      const px = x + (rt() - .5) * 20 + (Math.floor(y / 28) % 2) * 14, py = y + (rt() - .5) * 14, pt = [px, py], edge = Math.min(px, W - px) < 70;
      if (rt() < (edge ? .15 : .6)) continue;
      if (near(pt, P) < 46 || STRUCT.some(([sx, sy, sr]) => dist(pt, [sx, sy]) < sr)) continue;
      const k = rt(), sc = (edge ? 1.05 : .85) + rt() * .35, X = +px.toFixed(1), Y = +py.toFixed(1);
      items.push([Y, k < .82 ? pine(X, Y, sc) : rockS(X, Y, sc * .85, Math.floor(rt() * 1e4))]);
    }
    items.sort((a, b) => a[0] - b[0]).forEach(it => s += it[1]);
    let top = "";
    const rf = rnd(66);
    for (let i = 0; i < 70; i++) top += `<circle class="gi-snow" style="animation-delay:-${(rf() * 8).toFixed(1)}s;animation-duration:${(6 + rf() * 5).toFixed(1)}s" cx="${(rf() * W).toFixed(0)}" cy="${(rf() * H).toFixed(0)}" r="${(1.4 + rf() * 2).toFixed(1)}" fill="#fff" opacity=".9"/>`;
    return {bg:s, top};
  }

  /* --- Monstres de la glace --- */
  const monsters = {
    bonhomme:{n:"Bonhomme de Givre", draw(){
      let g = toy("M22 100 Q16 70 38 62 Q60 56 82 62 Q104 70 98 100 Q60 112 22 100Z", "#FFFFFF", "#B8D0E8", "#6A88B0");
      g += toy("M32 62 Q28 30 60 26 Q92 30 88 62 Q60 70 32 62Z", "#FFFFFF", "#B8D0E8", "#6A88B0", {dy:3});
      g += tLimb("M28 74 Q10 66 6 48", "#7A5230", 5) + tLimb("M92 74 Q110 66 114 48", "#7A5230", 5) + tLimb("M8 52 l-4 -6 M10 50 l2 -8", "#7A5230", 3) + tLimb("M112 52 l4 -6 M110 50 l-2 -8", "#7A5230", 3);
      g += `<path d="M36 26 L84 26 L80 16 L40 16Z" fill="#3A4A8A" stroke="${TD}" stroke-width="2.4"/><rect x="44" y="2" width="32" height="16" rx="3" fill="#3A4A8A" stroke="${TD}" stroke-width="2.4"/>`;
      g += `<path d="M42 36 L54 42 M78 36 L66 42" stroke="${TD}" stroke-width="4" stroke-linecap="round"/><circle cx="49" cy="45" r="4" fill="${TD}"/><circle cx="71" cy="45" r="4" fill="${TD}"/><path d="M58 48 l18 4 l-18 3Z" fill="#FF8A3A" stroke="${TD}" stroke-width="1.8"/>`;
      g += `<path d="M46 58 Q60 52 74 58" stroke="${TD}" stroke-width="2.6" fill="#2A3A6A"/><path d="M50 57 l2 5 l2 -5 M60 56 l2 6 l2 -6 M68 57 l2 5" stroke="#C8F0FF" stroke-width="1.6" fill="#E8FCFF"/>`;
      g += `<path d="M30 66 Q60 76 90 66 L90 72 Q60 82 30 72Z" fill="#E2283A" stroke="${TD}" stroke-width="2"/><path d="M80 72 l6 22 l8 -2 l-4 -20" fill="#E2283A" stroke="${TD}" stroke-width="2"/>`;
      g += [74, 88].map(y => `<circle cx="60" cy="${y}" r="3.2" fill="${TD}"/>`).join("") + `<path d="M38 36 Q44 30 54 28" stroke="#fff" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`;
      return g; }},
    loup:{n:"Loup Blanc", draw(){
      let g = `<defs>${lg("gFur", "#FFFFFF", "#C8D4E8")}</defs>` + tFeet(36, 84, 106, "#FFFFFF", "#B8C8E0", "#6A7AA0", 9) + `<path d="M98 86 Q118 76 114 56 Q106 70 96 72" fill="url(#gFur)" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/>`;
      g += toy("M20 102 Q14 66 40 58 Q60 54 80 58 Q106 66 100 102 Q60 112 20 102Z", "#FFFFFF", "#C0D0E8", "#6A7AA0");
      g += toy("M24 48 Q22 20 60 18 Q98 20 96 48 Q90 70 60 74 Q30 70 24 48Z", "#FFFFFF", "#C0D0E8", "#6A7AA0", {dy:3});
      g += toy("M26 30 L22 4 L42 20Z", "#FFFFFF", "#C0D0E8", "#6A7AA0", {dy:2, w:2.4}) + toy("M94 30 L98 4 L78 20Z", "#FFFFFF", "#C0D0E8", "#6A7AA0", {dy:2, w:2.4}) + `<path d="M28 24 L26 12 L36 20Z M92 24 L94 12 L84 20Z" fill="#FFB0C8"/>`;
      g += `<path d="M38 34 L54 42 M82 34 L66 42" stroke="${TD}" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="47" cy="44" rx="5" ry="4" fill="#7AE8FF" stroke="${TD}" stroke-width="2"/><ellipse cx="73" cy="44" rx="5" ry="4" fill="#7AE8FF" stroke="${TD}" stroke-width="2"/><circle cx="47" cy="44" r="1.6" fill="${TD}"/><circle cx="73" cy="44" r="1.6" fill="${TD}"/>`;
      g += toy("M44 52 Q60 46 76 52 Q78 66 60 70 Q42 66 44 52Z", "#F4F8FF", "#C8D4E8", "#8A9AB8", {dy:2, w:2.2}) + `<ellipse cx="60" cy="54" rx="6" ry="4" fill="${TD}"/>`;
      g += `<path d="M48 62 Q60 68 72 62" stroke="${TD}" stroke-width="2.6" fill="#3A1A2A"/><path d="M51 63 l2 5 l2 -4 M65 63 l2 4 l2 -5" fill="#fff" stroke="${TD}" stroke-width="1"/>`;
      g += `<path d="M30 76 q6 -4 10 0 M80 76 q6 -4 10 0" stroke="#A8B8D8" stroke-width="2" fill="none"/>`;
      return g; }},
    golem:{n:"Golem de Cristal", draw(){
      let g = `<defs>${lg("gCrysB", "#C8F8FF", "#3AA8E8")}${lg("gCrys", "#E8C8FF", "#7A5AE8")}${rg("gGlowP", "#F0D8FF", "#A060FF")}</defs>` + tFeet(38, 82, 106, "#C8F0FF", "#5AB0E0", "#2A5A9A", 11);
      g += toy("M18 100 L22 54 L40 40 L80 40 L98 54 L102 100 Q60 110 18 100Z", "#D8F8FF", "#6AB8E8", "#2A5A9A");
      g += `<path d="M22 54 L60 70 L98 54 M40 40 L60 70 L80 40 M60 70 L60 104" stroke="#fff" stroke-width="2" opacity=".75"/>`;
      g += tf(`M4 82 L10 52 L24 50 L28 84 L16 92Z`, "gCrysB", "#1A4A8A", 2, 2.4) + tf(`M116 82 L110 52 L96 50 L92 84 L104 92Z`, "gCrysB", "#1A4A8A", 2, 2.4);
      g += `<path d="M42 40 L46 16 L54 34 L60 8 L66 34 L74 16 L78 40Z" fill="url(#gCrys)" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="60" cy="20" r="12" fill="url(#gGlowP)" opacity=".7" class="av-pulse"/>`;
      g += `<path d="M38 56 L52 62 M82 56 L68 62" stroke="${TD}" stroke-width="4.4" stroke-linecap="round"/><path d="M42 66 l8 -3 l2 6Z M78 66 l-8 -3 l-2 6Z" fill="#B87AFF" stroke="${TD}" stroke-width="1.8"/>`;
      g += `<path d="M46 82 h28 l-4 6 h-20Z" fill="#1A2A5A" stroke="${TD}" stroke-width="2"/><path d="M26 60 L30 90" stroke="#fff" stroke-width="3" opacity=".55" stroke-linecap="round"/>`;
      return g; }},
    yeti:{n:"Yéti Grognon", draw(){
      let g = tFeet(36, 84, 106, "#F4F8FF", "#B8C8E0", "#6A7AA0", 12);
      g += toy("M10 100 Q4 50 30 30 Q60 10 90 30 Q116 50 110 100 Q60 114 10 100Z", "#FFFFFF", "#C8D4E8", "#7A88A8");
      for (let k = 0; k < 9; k++) g += `<path d="M${16 + k * 11} ${96 - (k % 2) * 4} l4 8 l4 -8" stroke="#A8B8D0" stroke-width="2" fill="none"/>`;
      g += tLimb("M18 64 Q2 70 6 92", "#F4F8FF", 13) + tLimb("M102 64 Q118 70 114 92", "#F4F8FF", 13);
      g += toy("M34 38 Q34 26 60 24 Q86 26 86 38 L84 70 Q60 80 36 70Z", "#8AB8E8", "#4A78B8", "#22406A", {dy:2, w:2.4});
      g += `<path d="M38 40 L54 48 M82 40 L66 48" stroke="${TD}" stroke-width="5" stroke-linecap="round"/><circle cx="47" cy="50" r="4.6" fill="#FFE07A" stroke="${TD}" stroke-width="1.8"/><circle cx="73" cy="50" r="4.6" fill="#FFE07A" stroke="${TD}" stroke-width="1.8"/>`;
      g += `<path d="M44 60 Q60 54 76 60 Q74 72 60 74 Q46 72 44 60Z" fill="#2A0A1A" stroke="${TD}" stroke-width="2.4"/><path d="M48 60 l3 7 l3 -7 M66 60 l3 7 l3 -7" fill="#fff" stroke="${TD}" stroke-width="1.2"/>`;
      g += `<path d="M24 36 Q36 18 56 14" stroke="#fff" stroke-width="5" fill="none" opacity=".8" stroke-linecap="round"/>`;
      return g; }}
  };

  /* --- Le Roi des Glaces (boss), 3 phases --- */
  function bossSVG(ph){
    const eye = ph === 1 ? ["#E8FFFF", "#5AD8FF"] : ph === 2 ? ["#FFE0E0", "#FF3A4A"] : ["#FFFFFF", "#7AF8FF"], u = "ik" + ph;
    let s = `<defs>${rg(u + "e", eye[0], eye[1])}${rg(u + "a", ph === 2 ? "#FF7A8A" : "#9AF8FF", "#000")}${lg(u + "s", "#AAD4F8", "#4A7AC0")}${lg(u + "c", "#3A5AA8", "#14205A")}${lg(u + "i", "#F0FCFF", "#8AD0F0")}</defs>`;
    s += `<circle cx="100" cy="100" r="${ph === 3 ? 110 : 96}" fill="url(#${u}a)" opacity="${ph === 1 ? .22 : .42}" class="av-pulse"/>`;
    s += `<ellipse cx="100" cy="212" rx="80" ry="9" fill="rgba(10,6,24,.35)"/>`;
    // cape
    s += tf(`M44 96 Q22 160 18 212 L182 212 Q178 160 156 96Z`, u + "c", "#0A102E", 4, 3);
    s += `<path d="M18 212 q10 -8 20 0 q10 -8 20 0 q10 -8 20 0 q10 -8 20 0 q10 -8 20 0 q10 -8 20 0 q10 -8 20 0 q10 -8 20 0" fill="#E8F4FF" stroke="${TD}" stroke-width="2"/>`;
    // armure de glace
    s += tf(`M62 212 L60 120 Q60 100 100 98 Q140 100 140 120 L138 212Z`, u + "i", "#2A6A9A", 3, 3);
    s += `<path d="M100 104 V206 M70 140 L100 160 L130 140 M66 180 L100 196 L134 180" stroke="#5AA8D8" stroke-width="2.6" fill="none"/><path d="M68 120 L72 200" stroke="#fff" stroke-width="3" opacity=".6"/>`;
    s += tf(`M48 100 L76 92 L80 120 L50 124Z`, u + "i", "#2A6A9A", 2, 2.6) + tf(`M152 100 L124 92 L120 120 L150 124Z`, u + "i", "#2A6A9A", 2, 2.6);
    s += `<path d="M50 104 L44 88 L54 96 L58 84 L64 98 M150 104 L156 88 L146 96 L142 84 L136 98" fill="url(#${u}i)" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/>`;
    // sceptre
    s += `<path d="M170 210 L162 60" stroke="${TD}" stroke-width="9" stroke-linecap="round"/><path d="M170 210 L162 60" stroke="#8AA8D0" stroke-width="5" stroke-linecap="round"/>`;
    s += tf(`M162 62 L150 44 L162 14 L174 44Z`, u + "i", "#2A6A9A", 2, 2.6) + `<circle cx="162" cy="40" r="${ph === 3 ? 22 : 15}" fill="url(#${u}e)" opacity=".7" class="av-pulse"/>`;
    s += tLimb("M138 130 Q154 120 162 110", "#AAD4F8", 11) + tLimb("M62 130 Q46 140 40 160", "#AAD4F8", 11);
    // tête
    s += tf(`M70 70 Q70 40 100 38 Q130 40 130 70 Q130 98 100 102 Q70 98 70 70Z`, u + "s", "#22406A", 3, 3);
    s += `<path d="M70 78 Q72 120 100 ${ph === 1 ? 128 : 134} Q128 120 130 78 Q120 94 100 94 Q80 94 70 78Z" fill="#F4FCFF" stroke="${TD}" stroke-width="2.6"/>` + [82, 92, 102, 112, 120].map((x, i) => `<path d="M${x} ${96 + i % 2 * 4} l2 ${18 + i % 3 * 6} l3 -16" fill="#E8F8FF" stroke="${TD}" stroke-width="1.4"/>`).join("");
    s += `<path d="M76 62 L94 70 M124 62 L106 70" stroke="${TD}" stroke-width="${ph === 1 ? 4.4 : 6}" stroke-linecap="round"/>`;
    s += `<circle cx="86" cy="74" r="12" fill="url(#${u}e)" class="av-pulse"/><circle cx="114" cy="74" r="12" fill="url(#${u}e)" class="av-pulse"/><ellipse cx="86" cy="74" rx="6" ry="4.6" fill="${eye[0]}" stroke="${TD}" stroke-width="2.2"/><ellipse cx="114" cy="74" rx="6" ry="4.6" fill="${eye[0]}" stroke="${TD}" stroke-width="2.2"/>`;
    s += ph === 1 ? `<path d="M90 88 Q100 84 110 88" stroke="${TD}" stroke-width="3" fill="none" stroke-linecap="round"/>` : `<path d="M86 86 Q100 80 114 86 Q100 98 86 86Z" fill="#14102A" stroke="${TD}" stroke-width="2.4"/><path d="M90 87 l2 5 l2 -5 l2 5 l2 -5 l2 5 l2 -5 l2 5" stroke="#E8FFFF" stroke-width="1.6" fill="none"/>`;
    // couronne de glace (grandit avec les phases)
    const ch = ph === 1 ? 22 : ph === 2 ? 30 : 38;
    s += `<path d="M66 50 L70 ${40 - ch} L80 36 L88 ${36 - ch * 1.2} L100 32 L112 ${36 - ch * 1.2} L120 36 L130 ${40 - ch} L134 50 Q100 40 66 50Z" fill="url(#${u}i)" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="100" cy="42" r="5" fill="${eye[1]}" stroke="${TD}" stroke-width="1.8" class="av-pulse"/>`;
    s += `<path d="M76 54 Q82 44 94 42" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
    if (ph === 3) s += `<g class="av-spin">${Array.from({length:8}, (_, k) => { const a = k * Math.PI / 4, x = 100 + Math.cos(a) * 96, y = 110 + Math.sin(a) * 40; return `<path d="M${(x - 7).toFixed(1)} ${y.toFixed(1)} h14 M${x.toFixed(1)} ${(y - 7).toFixed(1)} v14 M${(x - 5).toFixed(1)} ${(y - 5).toFixed(1)} l10 10 M${(x + 5).toFixed(1)} ${(y - 5).toFixed(1)} l-10 10" stroke="#E8FFFF" stroke-width="2.4" stroke-linecap="round"/>`; }).join("")}</g>`;
    return `<svg viewBox="0 0 200 222" style="width:100%;height:auto;overflow:visible" aria-label="Le Roi des Glaces">${s}</svg>`;
  }

  /* --- Arène --- */
  function arena(boss){
    let s = `<defs>${defs()}${lg("gAsky", boss ? "#0A1240" : "#5A9AE0", boss ? "#3A4A8A" : "#E8F4FF")}</defs><rect width="400" height="300" fill="url(#gAsky)"/>`;
    if (boss) s += [["#5AF8B8", 50], ["#A87AFF", 90]].map(([c, y], i) => `<path class="gi-aur" style="animation-delay:-${i}s" d="M-20 ${y} Q100 ${y - 40} 200 ${y - 8} T420 ${y - 16}" stroke="${c}" stroke-width="22" fill="none" opacity=".35" stroke-linecap="round"/>`).join("");
    s += `<path d="M0 190 L60 110 L110 170 L170 90 L240 175 L300 105 L360 160 L400 130 L400 300 L0 300Z" fill="${boss ? "#4A5A8A" : "#A8C0E0"}"/><path d="M60 110 L78 134 L50 130Z M170 90 L192 120 L156 116Z M300 105 L318 128 L288 126Z" fill="#fff"/>`;
    for (let i = 0; i < 8; i++) s += pine(i * 54 + 10, 214 + (i % 2) * 6, 1.1);
    s += `<path d="M0 214 Q200 196 400 214 L400 300 L0 300Z" fill="${boss ? "#C8D8F0" : "#F4FAFF"}" stroke="${TD}" stroke-width="3"/>`;
    s += `<ellipse cx="200" cy="262" rx="190" ry="34" fill="${boss ? "#A8D0F0" : "#D8ECFF"}" stroke="${TD}" stroke-width="3"/><path d="M60 258 l40 -8 l30 10 M240 270 l40 -10 l40 6" stroke="#fff" stroke-width="2.4" fill="none"/>`;
    const r = rnd(boss ? 91 : 19);
    for (let i = 0; i < 26; i++) s += `<circle class="gi-snow" style="animation-delay:-${(r() * 8).toFixed(1)}s;animation-duration:${(5 + r() * 4).toFixed(1)}s" cx="${(r() * 400).toFixed(0)}" cy="${(r() * 220).toFixed(0)}" r="${(1.4 + r() * 2).toFixed(1)}" fill="#fff"/>`;
    return `<svg class="af-bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">${s}</svg>`;
  }

  Aventure.register(4, {
    music:"musique/monde4.mp3", boss:"Le Roi des Glaces", qp:"g4", nodes:NODES, h:1580, mapDraw, bossSVG, arena, monsters,
    title:{id:"adv4", n:"BRISEUR DE GLACE", a:"#E8FCFF", b:"#4A8AD8", f:"#14205A"},
    phase:["Phase 2 · La couronne du Roi s'aiguise !", "Phase 3 · Blizzard éternel !"],
    win:"Le Roi des Glaces s'effondre en mille éclats. Le printemps revient !",
    qn:["Au-delà du col", "Aux portes du château", "Le Roi détrôné", "Étoiles de givre", "Toutes les étoiles du royaume", "Savant des neiges", "Chasseur de yétis", "Sans un flocon de travers", "Glissade éclair", "Cœur de glace"],
    levels:[
      {n:"Le Col Enneigé", mode:"c", diff:2, mix:[.3, .6, .1], sp:{k:"streak", n:5}, mons:["bonhomme", "loup", "bonhomme", "yeti"]},
      {n:"Le Village des Fourrures", mode:"c", diff:2, mix:[.3, .6, .1], sp:{k:"first5"}, mons:["loup", "bonhomme", "golem", "yeti"]},
      {n:"Le Lac Gelé", mode:"chrono", diff:2, mix:[.3, .6, .1], sp:{k:"streak", n:6}, mons:["bonhomme", "loup", "golem"]},
      {n:"Les Mines de Cristal", mode:"c", diff:3, mix:[.25, .6, .15], sp:{k:"hard"}, mons:["golem", "bonhomme", "loup", "yeti"]},
      {n:"Les Falaises du Blizzard", mode:"surv", diff:3, mix:[.25, .6, .15], sp:{k:"streak", n:7}, mons:["loup", "golem", "yeti"]},
      {n:"Le Pont de Givre", mode:"c", diff:3, mix:[.2, .6, .2], sp:{k:"fast", n:8}, mons:["golem", "loup", "golem", "yeti"]},
      {n:"La Salle du Trône Gelé", mode:"boss", diff:3, mix:[.15, .55, .3], sp:{k:"nolife"}}
    ]
  });
})();
