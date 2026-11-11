/* ---------- Aventure · Monde 3 : Le Royaume des Abysses ----------
   On descend dans l'océan : récif de corail, épave, forêt d'algues, grotte luminescente, cité engloutie, palais de nacre, et tout en haut
   (le plus profond), la fosse du Léviathan. Monstres originaux (style jouet) : Méduse Électrique, Crabe Bagarreur, Poisson-Lanterne,
   Pieuvre Encreuse (chef). Boss : le Léviathan. 100 % du monde : personnage « Le Fantôme de Sparte » (boutique.js). */
(() => {
  const {TD, rnd, smooth, sample, dist, near, blob, bumpy, tf, lg, rg} = Aventure.kit;
  const NODES = [[200, 1405], [92, 1262], [282, 1078], [118, 890], [282, 702], [128, 512], [200, 312]];
  const defs = () => lg("aSea", "#0A1A4A", "#2AB8D8") + lg("aSand", "#F8E4B0", "#D8B878") + lg("aCoralP", "#FF9AC8", "#E0508A") + lg("aCoralO", "#FFB070", "#E8703A") + lg("aKelp", "#7AD86A", "#2A7A4A")
    + lg("aRock", "#6A7AA8", "#2E3A6A") + lg("aStone", "#E8F0F8", "#9AB0C8") + lg("aWood", "#A8784A", "#5A3A1E") + lg("aPearl", "#FFFFFF", "#D8C8F0") + lg("aGold", "#FFE58A", "#E0A01A")
    + rg("aGlowC", "#C8FFFF", "#3AD8F0") + rg("aGlowP", "#F0C8FF", "#A050FF") + rg("aGlowY", "#FFF8C0", "#FFD040") + rg("aRay", "#E8FFFF", "#7AE8FF");

  /* --- Décor --- */
  const bubble = (x, y, r, i) => `<circle class="ab-bub" style="animation-delay:-${(i * .7 % 6).toFixed(1)}s;animation-duration:${(5 + i % 4).toFixed(1)}s" cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#E8FFFF" stroke-width="1.6" opacity=".8"/>`;
  function coral(x, y, s, seed){
    const r = rnd(seed), pink = seed % 3 !== 0, g0 = pink ? "aCoralP" : "aCoralO", dk = pink ? "#8A1A4A" : "#8A3A10";
    let g = `<ellipse cx="${x}" cy="${y}" rx="${16 * s}" ry="${4 * s}" fill="rgba(0,20,60,.25)"/>`;
    const br = (x0, y0, a, L, d) => { if (d > 2) return; const x1 = x0 + Math.sin(a) * L, y1 = y0 - Math.cos(a) * L;
      g += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${TD}" stroke-width="${(8 - d * 2) * s + 3}" stroke-linecap="round"/><path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="url(#${g0})" stroke-width="${(8 - d * 2) * s}" stroke-linecap="round"/>`;
      br(x1, y1, a - .5 - r() * .2, L * .7, d + 1); br(x1, y1, a + .5 + r() * .2, L * .7, d + 1); };
    br(x, y, (r() - .5) * .3, 14 * s, 0);
    return g + `<circle cx="${x}" cy="${y - 4 * s}" r="${3 * s}" fill="${dk}" opacity=".4"/>`;
  }
  function kelp(x, y, h, i){
    const d = `M${x} ${y} Q${x - 10} ${y - h * .3} ${x + 4} ${y - h * .5} Q${x + 14} ${y - h * .75} ${x - 2} ${y - h}`;
    return `<g class="ab-sway" style="animation-delay:-${(i * .6).toFixed(1)}s;transform-origin:${x}px ${y}px"><path d="${d}" stroke="${TD}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="url(#aKelp)" stroke-width="6.4" fill="none" stroke-linecap="round"/>`
      + [.3, .55, .8].map(t => `<ellipse cx="${x + (t * 30 % 10) - 3}" cy="${y - h * t}" rx="6" ry="3" fill="#8AE07A" stroke="${TD}" stroke-width="1.4" transform="rotate(${t * 120 - 40} ${x} ${y - h * t})"/>`).join("") + `</g>`;
  }
  const anemone = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="4" fill="rgba(0,20,60,.25)"/>` + Array.from({length:7}, (_, k) => { const a = -1.2 + k * .4; return `<path d="M${x} ${y} q${Math.sin(a) * 6} -6 ${Math.sin(a) * 12} -14" stroke="${TD}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${x} ${y} q${Math.sin(a) * 6} -6 ${Math.sin(a) * 12} -14" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`; }).join("");
  const star = (x, y, a) => { let d = ""; for (let k = 0; k < 10; k++) { const t = a + k * Math.PI / 5, rr = k % 2 ? 3.4 : 8; d += (k ? "L" : "M") + (x + Math.cos(t) * rr).toFixed(1) + " " + (y + Math.sin(t) * rr).toFixed(1); } return `<path d="${d}Z" fill="#FF8A5A" stroke="${TD}" stroke-width="1.6" stroke-linejoin="round"/>`; };
  const shell = (x, y) => `<path d="M${x - 8} ${y} Q${x} ${y - 14} ${x + 8} ${y}Z" fill="#FFE8D8" stroke="${TD}" stroke-width="1.6"/><path d="M${x} ${y} V${y - 8} M${x - 4} ${y} L${x - 3} ${y - 6} M${x + 4} ${y} L${x + 3} ${y - 6}" stroke="#D8A890" stroke-width="1.2"/>`;
  const rockA = (x, y, s, seed) => `<ellipse cx="${x}" cy="${y + 2}" rx="${18 * s}" ry="${4 * s}" fill="rgba(0,20,60,.3)"/>` + tf(blob(x, y - 9 * s, 17 * s, 11 * s, seed, 8, .2), "aRock", "#1A2244", 3, 2.4) + `<path d="M${x - 10 * s} ${y - 14 * s} q5 -5 11 -6" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>`;
  function fishSchool(x, y, i){
    let g = `<g class="ab-swim" style="animation-delay:-${i * 3}s">`;
    for (let k = 0; k < 5; k++) { const fx = x + (k % 3) * 14, fy = y + Math.floor(k / 2) * 9 - (k % 2) * 4; g += `<path d="M${fx} ${fy} q6 -5 12 0 q-6 5 -12 0Z M${fx} ${fy} l-5 -4 v8Z" fill="${["#FFD23F", "#FF8A5A", "#7AE8FF"][i % 3]}" stroke="${TD}" stroke-width="1.4"/><circle cx="${fx + 8}" cy="${fy - 1}" r="1" fill="${TD}"/>`; }
    return g + `</g>`;
  }
  function wreck(x, y){
    let g = `<ellipse cx="${x}" cy="${y + 4}" rx="90" ry="14" fill="rgba(0,20,60,.35)"/>`;
    g += `<g transform="rotate(-10 ${x} ${y})">` + tf(`M${x - 80} ${y - 30} Q${x - 70} ${y + 4} ${x - 20} ${y + 6} L${x + 60} ${y + 4} Q${x + 86} ${y - 6} ${x + 84} ${y - 40} L${x + 40} ${y - 30}Z`, "aWood", "#3A2010", 4, 3);
    for (let k = 0; k < 4; k++) g += `<path d="M${x - 72 + k * 4} ${y - 20 + k * 6} Q${x} ${y - 10 + k * 6} ${x + 78 - k * 3} ${y - 28 + k * 7}" stroke="#4A2A12" stroke-width="2" fill="none" opacity=".7"/>`;
    g += `<rect x="${x - 6}" y="${y - 110}" width="8" height="84" fill="url(#aWood)" stroke="${TD}" stroke-width="2.2"/><path d="M${x - 2} ${y - 104} L${x + 40} ${y - 84} L${x + 34} ${y - 50} L${x - 2} ${y - 56}" fill="#E8E0D0" stroke="${TD}" stroke-width="2" opacity=".85"/><path d="M${x + 8} ${y - 92} l14 30" stroke="#C8B8A0" stroke-width="2"/>`;
    g += `<circle cx="${x - 40}" cy="${y - 12}" r="7" fill="#1A1020" stroke="${TD}" stroke-width="2"/><circle cx="${x + 20}" cy="${y - 10}" r="7" fill="#1A1020" stroke="${TD}" stroke-width="2"/></g>`;
    g += `<rect x="${x + 50}" y="${y - 14}" width="24" height="16" rx="3" fill="url(#aWood)" stroke="${TD}" stroke-width="2"/><rect x="${x + 50}" y="${y - 18}" width="24" height="6" rx="2" fill="url(#aGold)" stroke="${TD}" stroke-width="1.6"/><circle cx="${x + 62}" cy="${y - 8}" r="12" fill="url(#aGlowY)" opacity=".7" class="av-pulse"/>`;
    return g;
  }
  function glowCave(x, y){
    let g = `<ellipse cx="${x}" cy="${y + 4}" rx="70" ry="12" fill="rgba(0,20,60,.35)"/>` + tf(blob(x, y - 44, 66, 52, 33, 11, .12), "aRock", "#141A38", 5, 2.8);
    g += `<path d="M${x - 28} ${y} Q${x - 28} ${y - 50} ${x} ${y - 52} Q${x + 28} ${y - 50} ${x + 28} ${y}Z" fill="#0A0A20" stroke="${TD}" stroke-width="2.6"/>`;
    g += [[-46, -40], [-30, -70], [10, -84], [44, -60], [52, -26], [-52, -14], [24, -40]].map(([dx, dy], i) => `<circle cx="${x + dx}" cy="${y + dy}" r="9" fill="url(#aGlowC)" class="av-pulse" style="animation-delay:-${i * .35}s"/><circle cx="${x + dx}" cy="${y + dy}" r="2.6" fill="#E8FFFF"/>`).join("");
    g += `<circle cx="${x - 8}" cy="${y - 26}" r="2.6" fill="#7AF8FF" class="av-pulse"/><circle cx="${x + 8}" cy="${y - 26}" r="2.6" fill="#7AF8FF" class="av-pulse"/>`;
    return g;
  }
  function ruins(x, y){
    let g = `<ellipse cx="${x}" cy="${y + 4}" rx="80" ry="12" fill="rgba(0,20,60,.35)"/>`;
    g += tf(`M${x - 70} ${y} L${x - 70} ${y - 12} L${x + 70} ${y - 12} L${x + 70} ${y}Z`, "aStone", "#4A5A7A", 0, 2.4);
    [-56, -28, 0, 28, 56].forEach((dx, k) => { const h = k === 3 ? 34 : 70; g += tf(`M${x + dx - 7} ${y - 12} L${x + dx - 6} ${y - 12 - h} L${x + dx + 6} ${y - 12 - h} L${x + dx + 7} ${y - 12}Z`, "aStone", "#4A5A7A", 0, 2.2) + (k === 3 ? `<path d="M${x + dx - 6} ${y - 46} l4 -6 l4 4 l4 -6" stroke="${TD}" stroke-width="2" fill="none"/>` : ""); });
    g += tf(`M${x - 66} ${y - 82} L${x + 14} ${y - 82} L${x + 4} ${y - 96} L${x - 56} ${y - 96}Z`, "aStone", "#4A5A7A", 3, 2.4);
    g += `<path d="M${x - 50} ${y - 60} q4 20 -2 40 M${x + 10} ${y - 70} q6 24 0 50" stroke="#5AB04A" stroke-width="3" fill="none" opacity=".8"/>`;
    // statue d'un trident
    g += `<rect x="${x + 84}" y="${y - 60}" width="6" height="60" fill="url(#aGold)" stroke="${TD}" stroke-width="1.8"/><path d="M${x + 76} ${y - 78} v14 q11 8 22 0 v-14 M${x + 87} ${y - 82} v20" stroke="url(#aGold)" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="${x + 87}" cy="${y - 70}" r="18" fill="url(#aGlowY)" opacity=".4" class="av-pulse"/>`;
    return g;
  }
  function palace(x, y){
    let g = `<circle cx="${x}" cy="${y - 60}" r="110" fill="url(#aGlowP)" opacity=".25" class="av-pulse"/><ellipse cx="${x}" cy="${y + 4}" rx="86" ry="12" fill="rgba(0,20,60,.35)"/>`;
    g += tf(`M${x - 70} ${y} L${x - 70} ${y - 50} L${x + 70} ${y - 50} L${x + 70} ${y}Z`, "aPearl", "#7A6AA8", 3, 2.6);
    [[-74, 90], [74, 90], [-36, 70], [36, 70]].forEach(([dx, h]) => g += tf(`M${x + dx - 12} ${y} L${x + dx - 12} ${y - h} Q${x + dx} ${y - h - 26} ${x + dx + 12} ${y - h} L${x + dx + 12} ${y}Z`, "aPearl", "#7A6AA8", 3, 2.4) + `<circle cx="${x + dx}" cy="${y - h - 24}" r="4" fill="url(#aGold)" stroke="${TD}" stroke-width="1.6"/>`);
    g += tf(`M${x - 40} ${y - 50} Q${x - 40} ${y - 110} ${x} ${y - 116} Q${x + 40} ${y - 110} ${x + 40} ${y - 50}Z`, "aPearl", "#7A6AA8", 4, 2.8);
    for (let k = -2; k <= 2; k++) g += `<path d="M${x} ${y - 114} Q${x + k * 12} ${y - 84} ${x + k * 18} ${y - 52}" stroke="#C8B0E8" stroke-width="2" fill="none"/>`;
    g += `<path d="M${x - 14} ${y} L${x - 14} ${y - 26} Q${x} ${y - 40} ${x + 14} ${y - 26} L${x + 14} ${y}Z" fill="#2A1A4A" stroke="${TD}" stroke-width="2.4"/><circle cx="${x}" cy="${y - 124}" r="9" fill="url(#aPearl)" stroke="${TD}" stroke-width="2"/><circle cx="${x}" cy="${y - 124}" r="18" fill="url(#aGlowC)" opacity=".6" class="av-pulse"/>`;
    g += `<path d="M${x - 30} ${y - 90} Q${x - 22} ${y - 106} ${x - 6} ${y - 110}" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
    return g;
  }
  function trench(x, y){
    let g = `<path d="M-20 ${y} Q${x - 120} ${y - 60} ${x - 60} ${y - 140} Q${x} ${y - 200} ${x + 60} ${y - 140} Q${x + 120} ${y - 60} 420 ${y} L420 0 L-20 0Z" fill="#060A1E" opacity=".75"/>`;
    // anneaux du Léviathan qui dépassent de la fosse
    g += [[x - 110, y - 40, 34], [x + 100, y - 70, 30], [x - 40, y - 150, 26]].map(([cx, cy, r], i) => `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" stroke="${TD}" stroke-width="22" fill="none"/><path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" stroke="#2A8A9A" stroke-width="16" fill="none"/><path d="M${cx - r * .6} ${cy - r * .75} l4 -10 l5 9 M${cx} ${cy - r} l4 -10 l5 9 M${cx + r * .6} ${cy - r * .75} l4 -10 l5 9" stroke="#7AE8C8" stroke-width="3" fill="none"/>`).join("");
    g += `<circle cx="${x + 30}" cy="${y - 110}" r="40" fill="url(#aGlowP)" opacity=".45" class="av-pulse"/><ellipse cx="${x + 18}" cy="${y - 110}" rx="7" ry="4" fill="#F0C8FF" class="av-pulse"/><ellipse cx="${x + 42}" cy="${y - 110}" rx="7" ry="4" fill="#F0C8FF" class="av-pulse"/>`;
    return g;
  }
  function start(x, y){
    return `<ellipse cx="${x}" cy="${y}" rx="44" ry="9" fill="rgba(0,20,60,.3)"/>` + tf(`M${x - 40} ${y} Q${x - 40} ${y - 20} ${x - 26} ${y - 26} L${x + 6} ${y - 26} Q${x + 20} ${y - 20} ${x + 20} ${y}Z`, "aGold", "#8A5A06", 3, 2.4)
      + `<circle cx="${x - 10}" cy="${y - 14}" r="7" fill="#7AE8FF" stroke="${TD}" stroke-width="2"/><path d="M${x - 10} ${y - 26} V${y - 42}" stroke="${TD}" stroke-width="3"/><circle cx="${x - 10}" cy="${y - 44}" r="4" fill="#FF5A5A" stroke="${TD}" stroke-width="1.6" class="av-pulse"/>`
      + `<rect x="${x + 34}" y="${y - 40}" width="5" height="40" fill="url(#aWood)" stroke="${TD}" stroke-width="2"/><path d="M${x + 24} ${y - 44} L${x + 66} ${y - 44} L${x + 72} ${y - 36} L${x + 66} ${y - 28} L${x + 24} ${y - 28}Z" fill="url(#aWood)" stroke="${TD}" stroke-width="2.2"/><text x="${x + 46}" y="${y - 32.5}" text-anchor="middle" style="font:800 9.5px var(--f-display)" fill="#FFF4DA">DÉPART</text>`;
  }

  /* --- La carte --- */
  function mapDraw(){
    const W = 400, H = 1580, st = [200, 1520], pts = [st, ...NODES], P = sample(pts, 30);
    let s = `<defs>${defs()}</defs><rect width="${W}" height="${H}" fill="url(#aSea)"/>`;
    // fond marin en bas, rayons de lumière
    s += `<path d="M0 1440 Q100 1410 200 1430 Q300 1450 400 1420 L400 1580 L0 1580Z" fill="url(#aSand)" opacity=".9"/>`;
    s += [[-30, 1580], [90, 1580], [220, 1580], [320, 1200]].map(([x, y], i) => `<path class="ab-ray" style="animation-delay:-${i * 1.3}s" d="M${x} ${y - 700} L${x + 60} ${y - 700} L${x + 170} ${y} L${x + 90} ${y}Z" fill="url(#aRay)" opacity=".12"/>`).join("");
    const r = rnd(303);
    for (let i = 0; i < 26; i++) { const x = r() * W, y = 500 + r() * (H - 560); if (near([x, y], P) < 40) continue; s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(30 + r() * 40).toFixed(0)}" ry="${(8 + r() * 8).toFixed(0)}" fill="#E8D8A8" opacity=".18"/>`; }
    const pd = smooth(pts, false);
    s += `<path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round" transform="translate(0 4)"/><path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round"/><path d="${pd}" stroke="#C8B080" stroke-width="31" fill="none" stroke-linecap="round" transform="translate(0 3)"/><path d="${pd}" stroke="#F4E2B0" stroke-width="27" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${pd}" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-dasharray="3 18" opacity=".55" transform="translate(-5 -3)"/>`;
    const items = [];
    items.push([1530, start(180, 1530)]);
    items.push([300, trench(200, 310)]);
    items.push([1200, wreck(300, 1220)]);
    items.push([880, glowCave(330, 880)]);
    items.push([700, ruins(150, 700)]);
    items.push([520, palace(268, 520)]);
    for (let k = 0; k < 9; k++) items.push([1080 + k * 6, kelp(20 + k * 40 + (k % 2) * 12, 1100 + (k % 3) * 18, 70 + (k % 4) * 18, k)]);
    const STRUCT = [[180, 1510, 60], [300, 1200, 100], [330, 860, 80], [150, 690, 100], [268, 470, 110], [200, 200, 220], [200, 1060, 70]];
    const rt = rnd(707);
    for (let y = 380; y < H - 10; y += 32) for (let x = -10; x < W + 20; x += 38){
      const px = x + (rt() - .5) * 24, py = y + (rt() - .5) * 16, pt = [px, py], edge = Math.min(px, W - px) < 60;
      if (rt() < (edge ? .35 : .72)) continue;
      if (near(pt, P) < 44 || STRUCT.some(([sx, sy, sr]) => dist(pt, [sx, sy]) < sr)) continue;
      const k = rt(), sc = .8 + rt() * .45, X = +px.toFixed(1), Y = +py.toFixed(1), sd = Math.floor(rt() * 1e4);
      items.push([Y, k < .4 ? coral(X, Y, sc, sd) : k < .6 ? kelp(X, Y, 40 + rt() * 40, sd) : k < .75 ? anemone(X, Y, ["#FF8AC8", "#FFD23F", "#7AE8FF"][sd % 3]) : k < .85 ? rockA(X, Y, sc, sd) : k < .93 ? star(X, Y, rt() * 3) : shell(X, Y)]);
    }
    items.sort((a, b) => a[0] - b[0]).forEach(it => s += it[1]);
    let top = "";
    const rf = rnd(41);
    for (let i = 0; i < 46; i++) top += bubble((rf() * W).toFixed(0), (350 + rf() * (H - 360)).toFixed(0), (2 + rf() * 4).toFixed(1), i);
    top += fishSchool(40, 1320, 0) + fishSchool(240, 980, 1) + fishSchool(60, 620, 2) + fishSchool(260, 1460, 3);
    return {bg:s, top};
  }

  /* --- Monstres des abysses --- */
  const monsters = {
    meduse:{n:"Méduse Électrique", draw(){
      let g = "";
      [30, 44, 58, 72, 86].forEach((x, k) => { const d = `M${x} 64 q${k % 2 ? 8 : -8} 12 0 22 q${k % 2 ? -8 : 8} 12 0 24`; g += `<path d="${d}" stroke="${TD}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#F0A0E8" stroke-width="4" fill="none" stroke-linecap="round"/>`; });
      g += toy("M14 66 Q12 18 60 16 Q108 18 106 66 Q96 72 84 66 Q72 74 60 66 Q48 74 36 66 Q24 72 14 66Z", "#FFB0F0", "#C860C8", "#7A2A7A");
      g += `<path d="M28 34 Q38 20 56 20" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".75"/>`;
      g += `<path d="M38 40 L52 46 M82 40 L68 46" stroke="${TD}" stroke-width="4" stroke-linecap="round"/><ellipse cx="47" cy="50" rx="5" ry="6" fill="#fff" stroke="${TD}" stroke-width="2"/><ellipse cx="73" cy="50" rx="5" ry="6" fill="#fff" stroke="${TD}" stroke-width="2"/><circle cx="48" cy="51" r="2.6" fill="${TD}"/><circle cx="72" cy="51" r="2.6" fill="${TD}"/>`;
      g += `<path d="M52 60 Q60 56 68 60" stroke="${TD}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      g += `<path class="av-pulse" d="M8 30 l8 6 l-6 4 l10 8 M112 30 l-8 6 l6 4 l-10 8" stroke="#FFF26A" stroke-width="3" fill="none" stroke-linejoin="round"/>`;
      return g; }},
    crabe:{n:"Crabe Bagarreur", draw(){
      let g = "";
      [[34, 96, 14, 110], [42, 100, 26, 114], [86, 96, 106, 110], [78, 100, 94, 114]].forEach(([a, b, c, d]) => g += tLimb(`M${a} ${b} L${c} ${d}`, "#E86A3A", 5));
      g += tLimb("M30 80 Q12 70 14 50", "#FF8A4A", 9) + tLimb("M90 80 Q108 70 106 50", "#FF8A4A", 9);
      g += toy("M2 46 Q2 24 20 26 Q30 32 22 44 L28 50 Q14 60 2 46Z", "#FF9A5A", "#D8502A", "#7A2A10", {dy:2, w:2.4}) + toy("M118 46 Q118 24 100 26 Q90 32 98 44 L92 50 Q106 60 118 46Z", "#FF9A5A", "#D8502A", "#7A2A10", {dy:2, w:2.4});
      g += toy("M18 92 Q14 60 60 56 Q106 60 102 92 Q60 106 18 92Z", "#FFA060", "#E0582A", "#7A2A10");
      g += `<path d="M44 58 V38 M76 58 V38" stroke="${TD}" stroke-width="5" stroke-linecap="round"/><path d="M44 58 V38 M76 58 V38" stroke="#E86A3A" stroke-width="2.6"/><circle cx="44" cy="36" r="7" fill="#fff" stroke="${TD}" stroke-width="2.2"/><circle cx="76" cy="36" r="7" fill="#fff" stroke="${TD}" stroke-width="2.2"/><circle cx="46" cy="37" r="3.2" fill="${TD}"/><circle cx="74" cy="37" r="3.2" fill="${TD}"/>`;
      g += `<path d="M36 28 L50 32 M84 28 L70 32" stroke="${TD}" stroke-width="3.4" stroke-linecap="round"/>`;
      g += `<path d="M46 80 Q60 72 74 80" stroke="${TD}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M28 72 Q36 62 50 60" stroke="#fff" stroke-width="3.6" fill="none" opacity=".6" stroke-linecap="round"/>`;
      return g; }},
    lanterne:{n:"Poisson-Lanterne", draw(){
      let g = `<path d="M60 40 Q62 14 86 10" stroke="${TD}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60 40 Q62 14 86 10" stroke="#3A4A7A" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="88" cy="10" r="16" fill="url(#avMGlow)" class="av-pulse"/><circle cx="88" cy="10" r="6" fill="#FFF8A0" stroke="${TD}" stroke-width="2"/>`;
      g += toy("M104 72 L118 52 L118 96Z", "#4A5A9A", "#22285A", "#10142E", {dy:2, w:2.4});
      g += toy("M12 74 Q12 36 54 34 Q100 36 106 72 Q100 104 54 106 Q14 104 12 74Z", "#4A5A9A", "#22285A", "#10142E");
      g += `<path d="M12 78 Q40 72 66 86 Q40 104 14 92Z" fill="#14102A" stroke="${TD}" stroke-width="2.6"/>`;
      g += `<path d="M18 80 l4 8 l4 -7 l4 8 l4 -7 l4 8 l4 -7 l4 8 M20 92 l4 -6 l4 6 l4 -6 l4 6 l4 -6" stroke="#FFF6E0" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`;
      g += `<circle cx="56" cy="56" r="11" fill="#fff" stroke="${TD}" stroke-width="2.4"/><circle cx="54" cy="57" r="5" fill="${TD}"/><circle cx="52" cy="54" r="1.6" fill="#fff"/><path d="M44 42 L62 48" stroke="${TD}" stroke-width="4" stroke-linecap="round"/>`;
      g += `<path d="M78 60 Q90 70 84 84" stroke="#7AE8FF" stroke-width="2.6" fill="none" opacity=".7"/><path d="M26 54 Q34 42 48 40" stroke="#fff" stroke-width="3.4" fill="none" opacity=".45" stroke-linecap="round"/>`;
      return g; }},
    pieuvre:{n:"Pieuvre Encreuse", draw(){
      let g = "";
      [[22, 92, -14], [36, 98, -6], [52, 102, 0], [68, 102, 0], [84, 98, 6], [98, 92, 14]].forEach(([x, y, a]) => { const d = `M${x} ${y - 12} q${a} 14 ${a * 1.6 - 4} 22 q4 6 10 2`; g += `<path d="${d}" stroke="${TD}" stroke-width="13" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#B070E8" stroke-width="9" fill="none" stroke-linecap="round"/>`; });
      g += toy("M20 84 Q12 30 60 20 Q108 30 100 84 Q60 96 20 84Z", "#C890FF", "#7A3AC8", "#3A1A6A");
      [[38, 74], [60, 80], [82, 74]].forEach(([x, y]) => g += `<circle cx="${x}" cy="${y}" r="3.4" fill="#F0D8FF" stroke="${TD}" stroke-width="1.4"/>`);
      g += `<path d="M34 44 Q42 28 60 26" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`;
      g += `<path d="M34 46 L52 54 M86 46 L68 54" stroke="${TD}" stroke-width="5" stroke-linecap="round"/><ellipse cx="45" cy="60" rx="7" ry="8" fill="#FFF26A" stroke="${TD}" stroke-width="2.4"/><ellipse cx="75" cy="60" rx="7" ry="8" fill="#FFF26A" stroke="${TD}" stroke-width="2.4"/><rect x="43.4" y="54" width="3.2" height="12" rx="1.6" fill="${TD}"/><rect x="73.4" y="54" width="3.2" height="12" rx="1.6" fill="${TD}"/>`;
      g += `<path d="M54 72 Q60 68 66 72" stroke="${TD}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M60 8 q-6 -6 -2 -10 M64 10 q8 -4 6 -10" stroke="#3A1A6A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
      g += `<circle cx="104" cy="40" r="7" fill="#1A0A2A" opacity=".7" class="av-fog"/><circle cx="112" cy="30" r="5" fill="#1A0A2A" opacity=".6" class="av-fog"/>`;
      return g; }}
  };

  /* --- Le Léviathan (boss), 3 phases --- */
  function bossSVG(ph){
    const sc = ph === 3 ? ["#7A5AC8", "#3A1A7A", "#1A0A3A"] : ph === 2 ? ["#3AA88A", "#1A5A6A", "#0A2A3A"] : ["#4AC8B8", "#1A7A8A", "#0A3A4A"];
    const eye = ph === 1 ? ["#E8FFF8", "#3AE8C8"] : ph === 2 ? ["#FFE0D0", "#FF3A2A"] : ["#F8D8FF", "#C040FF"], u = "lv" + ph;
    let s = `<defs>${lg(u + "b", sc[0], sc[1])}${lg(u + "w", "#E8FFF0", "#9AD8C8")}${rg(u + "e", eye[0], eye[1])}${rg(u + "a", ph === 3 ? "#C080FF" : ph === 2 ? "#FF7A5A" : "#7AF8E8", "#000")}</defs>`;
    s += `<circle cx="100" cy="100" r="${ph === 3 ? 108 : 96}" fill="url(#${u}a)" opacity="${ph === 1 ? .22 : .42}" class="av-pulse"/>`;
    // vagues et anneaux du corps
    s += `<path d="M0 206 q20 -12 40 0 q20 12 40 0 q20 -12 40 0 q20 12 40 0 q20 -12 40 0 L200 222 L0 222Z" fill="#2A8AC8" stroke="${TD}" stroke-width="2.6" opacity=".9"/>`;
    s += tf(`M14 210 Q14 160 46 158 Q78 160 76 210Z`, u + "b", sc[2], 4, 3) + tf(`M150 210 Q148 170 172 168 Q196 172 194 210Z`, u + "b", sc[2], 4, 3);
    s += `<path d="M32 162 l4 -12 l6 10 M52 160 l4 -12 l6 10 M164 170 l4 -12 l6 10 M180 172 l4 -10 l5 9" stroke="${TD}" stroke-width="2.4" fill="#E8FFF8"/>`;
    // cou et tête
    s += tf(`M84 210 Q78 150 92 120 L130 120 Q142 160 132 210Z`, u + "b", sc[2], 4, 3);
    s += `<path d="M94 200 Q92 170 100 140 M118 200 Q120 170 114 140" stroke="url(#${u}w)" stroke-width="10" fill="none" opacity=".9"/>`;
    for (let k = 0; k < 5; k++) s += `<path d="M96 ${190 - k * 14} h22" stroke="#7AC8B0" stroke-width="2" opacity=".8"/>`;
    s += tf(`M48 96 Q44 50 90 38 Q140 30 164 64 Q178 86 168 108 Q150 128 110 124 L76 126 Q50 122 48 96Z`, u + "b", sc[2], 5, 3.2);
    // nageoires en couronne
    s += [[70, 40, -30], [100, 30, -10], [132, 34, 14], [158, 52, 36]].map(([x, y, a]) => `<path d="M${x - 8} ${y + 8} L${x} ${y - (ph >= 2 ? 26 : 18)} L${x + 10} ${y + 6}Z" fill="${ph === 3 ? "#C080FF" : "#E86A8A"}" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round" transform="rotate(${a} ${x} ${y})"/>`).join("");
    s += `<path d="M168 70 q22 -6 30 10 q-14 -2 -22 10Z M50 74 q-22 -8 -32 6 q14 0 20 10Z" fill="${ph === 3 ? "#9A60E8" : "#5AD8C8"}" stroke="${TD}" stroke-width="2.4"/>`;
    // gueule
    s += `<path d="M58 100 Q100 ${ph === 1 ? 92 : 88} 160 98 Q150 ${ph === 1 ? 118 : 128} 110 ${ph === 1 ? 120 : 130} Q70 124 58 100Z" fill="#2A0A1A" stroke="${TD}" stroke-width="2.8"/>`;
    s += `<path d="M66 101 l5 8 l5 -8 l5 9 l5 -9 l5 9 l5 -9 l5 9 l5 -9 l5 9 l5 -9 l5 9 l5 -8 l5 8 M76 ${ph === 1 ? 119 : 126} l5 -7 l5 7 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8 l5 -7 l5 7" stroke="#FFF6E0" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`;
    // yeux
    s += `<path d="M66 62 L92 72 M150 58 L126 70" stroke="${TD}" stroke-width="${ph === 1 ? 5 : 7}" stroke-linecap="round"/>`;
    s += `<circle cx="80" cy="80" r="15" fill="url(#${u}e)" class="av-pulse"/><circle cx="138" cy="78" r="15" fill="url(#${u}e)" class="av-pulse"/><ellipse cx="80" cy="80" rx="8" ry="6" fill="${eye[0]}" stroke="${TD}" stroke-width="2.4"/><ellipse cx="138" cy="78" rx="8" ry="6" fill="${eye[0]}" stroke="${TD}" stroke-width="2.4"/><ellipse cx="80" cy="80" rx="2.4" ry="5" fill="${TD}"/><ellipse cx="138" cy="78" rx="2.4" ry="5" fill="${TD}"/>`;
    s += `<path d="M60 70 Q66 50 88 44" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>`;
    if (ph >= 2) s += `<path class="av-pulse" d="M30 120 q10 -6 6 -16 M172 128 q-6 -10 4 -18" stroke="#E8FFFF" stroke-width="2" fill="none"/>` + [[24, 140], [182, 150], [40, 30]].map(([x, y], i) => `<circle class="ab-bub" style="animation-delay:-${i}s" cx="${x}" cy="${y}" r="5" fill="none" stroke="#E8FFFF" stroke-width="1.6"/>`).join("");
    if (ph === 3) s += `<path class="av-pulse" d="M20 40 l12 14 l-8 4 l14 16 M184 34 l-12 14 l8 4 l-14 16" stroke="#E0A8FF" stroke-width="3.4" fill="none" stroke-linejoin="round"/>`;
    return `<svg viewBox="0 0 200 222" style="width:100%;height:auto;overflow:visible" aria-label="Le Léviathan">${s}</svg>`;
  }

  /* --- Arène --- */
  function arena(boss){
    let s = `<defs>${defs()}${lg("aDeep", boss ? "#060A2A" : "#1A5A9A", boss ? "#2A1A5A" : "#5AD0E8")}</defs><rect width="400" height="300" fill="url(#aDeep)"/>`;
    s += [20, 140, 260].map((x, i) => `<path class="ab-ray" style="animation-delay:-${i}s" d="M${x} 0 L${x + 50} 0 L${x + 140} 300 L${x + 80} 300Z" fill="#E8FFFF" opacity="${boss ? .04 : .12}"/>`).join("");
    s += `<path d="M0 200 Q50 150 90 190 Q130 140 170 185 Q230 150 270 190 Q320 145 400 195 L400 300 L0 300Z" fill="${boss ? "#1A1A44" : "#2A6A9A"}" opacity=".8"/>`;
    s += coral(30, 210, 1.3, 3) + coral(372, 214, 1.2, 9) + kelp(70, 230, 90, 1) + kelp(340, 232, 80, 2);
    s += `<path d="M0 214 Q200 196 400 214 L400 300 L0 300Z" fill="${boss ? "#3A3A6A" : "#E8D4A0"}" stroke="${TD}" stroke-width="3"/>`;
    s += `<ellipse cx="200" cy="262" rx="190" ry="34" fill="${boss ? "#4A4A80" : "#F4E2B0"}" stroke="${TD}" stroke-width="3"/><ellipse cx="200" cy="258" rx="170" ry="24" fill="#FFFFFF" opacity="${boss ? .08 : .3}"/>`;
    s += shell(90, 270) + star(310, 268, .4) + shell(250, 284);
    if (boss) s += `<circle cx="200" cy="120" r="120" fill="url(#aGlowP)" opacity=".18" class="av-pulse"/>`;
    const r = rnd(boss ? 77 : 17);
    for (let i = 0; i < 18; i++) s += bubble((r() * 400).toFixed(0), (60 + r() * 200).toFixed(0), (2 + r() * 4).toFixed(1), i);
    if (!boss) s += fishSchool(30, 80, 0) + fishSchool(250, 50, 1);
    return `<svg class="af-bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">${s}</svg>`;
  }

  Aventure.register(3, {
    music:"musique/monde3.mp3", boss:"Le Léviathan", qp:"a3", nodes:NODES, h:1580, mapDraw, bossSVG, arena, monsters,
    title:{id:"adv3", n:"TERREUR DES ABYSSES", a:"#7AE8FF", b:"#1A4A9A", f:"#FFFFFF"},
    phase:["Phase 2 · Le Léviathan sort ses crocs !", "Phase 3 · Colère des profondeurs !"],
    win:"Le Léviathan replonge dans la fosse. L'océan est calme !",
    qn:["Plongée vers l'épave", "Les portes du palais", "Le Léviathan vaincu", "Pêcheur d'étoiles", "Toutes les étoiles de l'océan", "Savant des profondeurs", "Chasseur de crabes", "Sans une bulle de travers", "Rapide comme un dauphin", "Coquille intacte"],
    levels:[
      {n:"Le Récif de Corail", mode:"c", diff:2, mix:[.45, .55, 0], sp:{k:"streak", n:5}, mons:["meduse", "crabe", "meduse", "pieuvre"]},
      {n:"L'Épave du Corsaire", mode:"c", diff:2, mix:[.4, .6, 0], sp:{k:"first5"}, mons:["crabe", "lanterne", "crabe", "pieuvre"]},
      {n:"La Forêt d'Algues", mode:"chrono", diff:2, mix:[.4, .6, 0], sp:{k:"streak", n:6}, mons:["meduse", "crabe", "lanterne"]},
      {n:"La Grotte Luminescente", mode:"surv", diff:2, mix:[.35, .6, .05], sp:{k:"streak", n:7}, mons:["lanterne", "meduse", "pieuvre"]},
      {n:"La Cité Engloutie", mode:"c", diff:2, mix:[.35, .6, .05], sp:{k:"hard"}, mons:["crabe", "lanterne", "meduse", "pieuvre"]},
      {n:"Le Palais de Nacre", mode:"c", diff:3, mix:[.3, .6, .1], sp:{k:"fast", n:8}, mons:["meduse", "lanterne", "crabe", "pieuvre"]},
      {n:"La Fosse du Léviathan", mode:"boss", diff:3, mix:[.25, .55, .2], sp:{k:"nolife"}}
    ]
  });
})();
