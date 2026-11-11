/* ---------- L'Aventure (remplace le Parc, novembre 2026) ----------
   Règles validées par Erwan :
   - 5 mondes de 7 niveaux (4 classiques, 1 Chrono, 1 Survie, puis le boss). Seul le Monde 1 (la Forêt des Anciens) est construit pour l'instant.
   - Classique : 10 questions, 20 s, 6/10 pour réussir, 8/10 = maîtrise. Combat de 3 petits monstres (2 PV) + un chef de bande (4 PV).
   - Chrono : 60 s, 8 bonnes réponses pour réussir, 12 = maîtrise. Survie : 15 questions, 3 vies. Pas de joker dans l'Aventure.
   - Boss : 3 vies, 15 s, 3 phases (le boss change à 66 % et 33 % de sa vie), il tombe à la 7e bonne réponse.
   - 3 étoiles par niveau (gardées pour toujours, même en rejouant). Les réponses comptent comme ailleurs (XP, pièces, « Revoir mes erreurs », quêtes).
   - Questions : toutes les questions à 4 choix des thèmes, difficulté qui monte avec les niveaux, une question surprise plus dure,
     jamais deux fois dans une partie, et celles déjà vues dans l'Aventure passent en dernier. Moins de 13 ans : pas de questions pointues.
   - Le Casino (casino.js) est la Taverne du Trèfle d'Or, sur la carte de la Forêt, ouverte dès le début.
   - L'ancien Parc 3D est retiré ; chaque joueur récupère une fois 50 % des pièces qu'il y avait dépensées. */
const Aventure = (() => {
  const TD = "#2B1D3A";
  /* ===================== Données ===================== */
  const WORLDS = [
    {id:1, n:"La Forêt des Anciens", music:"musique/monde1.mp3", boss:"Le Gardien Sylvestre", title:"adv1", levels:[
      {n:"La Lisière", mode:"c", diff:1, mix:[.85, .15, 0], sp:{k:"streak", n:5}, mons:["champi", "gluant", "champi", "souche"]},
      {n:"Le Village des Lucioles", mode:"c", diff:1, mix:[.8, .2, 0], sp:{k:"first5"}, mons:["gluant", "gluant", "champi", "souche"]},
      {n:"Le Pont des Cascades", mode:"chrono", diff:1, mix:[.75, .25, 0], sp:{k:"streak", n:6}, mons:["gluant", "champi"]},
      {n:"Les Ruines Moussues", mode:"c", diff:2, mix:[.65, .35, 0], sp:{k:"hard"}, mons:["champi", "souche", "gluant", "souche"]},
      {n:"La Grotte aux Champignons", mode:"surv", diff:2, mix:[.6, .4, 0], sp:{k:"streak", n:7}, mons:["champi", "gluant", "souche"]},
      {n:"Le Sanctuaire de la Source", mode:"c", diff:2, mix:[.55, .45, 0], sp:{k:"fast", n:8}, mons:["souche", "gluant", "champi", "souche"]},
      {n:"Le Cœur de la Forêt", mode:"boss", diff:3, mix:[.4, .45, .15], sp:{k:"nolife"}}
    ]},
    {id:2, n:"Le Désert des Rois"}, {id:3, n:"Le Royaume des Abysses"}, {id:4, n:"Le Royaume de Glace"}, {id:5, n:"Les Terres Maudites"}
  ];
  // Monde affiché sur la carte ; les mondes 2 à 5 sont ajoutés par leurs propres fichiers (aventure_m2.js…) avec register()
  let cw = 1;
  const WD = () => WORLDS[cw - 1];
  const built = w => !!(WORLDS[w - 1] && WORLDS[w - 1].levels && WORLDS[w - 1].mapDraw);
  const MODE_N = {c:"Classique · 10 questions", chrono:"Chrono · 60 secondes", surv:"Survie · 15 questions, 3 vies", boss:"Boss · 3 phases, 3 vies"};
  const DIFF_N = ["", "Facile", "Moyen", "Difficile"];
  const MON_N = {gluant:"Gluant de mousse", champi:"Champichon", souche:"Souche grognonne"};
  const LV_COINS = {1:30, 2:40, 3:50, 4:60, 5:70};  // pièces du premier succès d'un niveau, par monde
  const BOSS_COINS = {1:300, 2:400, 3:500, 4:600, 5:700};
  const STAR_COINS = 10;
  const SEEN_MAX = 1500;
  const spText = sp => sp.k === "streak" ? `${sp.n} bonnes réponses d'affilée` : sp.k === "first5" ? "Aucune erreur sur les 5 premières questions"
    : sp.k === "hard" ? "Réussir les 3 questions difficiles" : sp.k === "fast" ? `Chaque bonne réponse en moins de ${sp.n} secondes` : "Ne perdre aucune vie";
  function objectives(L){
    if (L.mode === "boss") return ["Vaincre le boss", "Perdre une vie au maximum", spText(L.sp)];
    if (L.mode === "chrono") return ["8 bonnes réponses en 60 secondes", "12 bonnes réponses", spText(L.sp)];
    if (L.mode === "surv") return ["Survivre aux 15 questions", "Perdre une vie au maximum", spText(L.sp)];
    return ["Réussir le niveau (6/10)", "Maîtrise : 8/10 ou plus", spText(L.sp)];
  }

  /* ===================== Sauvegarde ===================== */
  const A = () => { S.adv = S.adv || {w:{}, seen:[]}; S.adv.w = S.adv.w || {}; S.adv.seen = S.adv.seen || []; return S.adv; };
  const WS = w => { const a = A(); a.w[w] = a.w[w] || {st:[0, 0, 0, 0, 0, 0, 0], best:[0, 0, 0, 0, 0, 0, 0], done:[0, 0, 0, 0, 0, 0, 0]}; return a.w[w]; };
  const nStars = m => (m & 1) + (m >> 1 & 1) + (m >> 2 & 1);
  const worldStars = w => WS(w).st.reduce((a, m) => a + nStars(m), 0);
  const totalStars = () => [1, 2, 3, 4, 5].reduce((a, w) => a + (A().w[w] ? worldStars(w) : 0), 0);
  const curLevel = w => { const d = WS(w).done; const i = d.findIndex(x => !x); return i < 0 ? 6 : i; };
  const unlocked = (w, i) => i === 0 || !!WS(w).done[i - 1];
  const worldOpen = w => w === 1 || (built(w) && !!WS(w - 1).done[6]);
  // Complétion d'un monde (choix d'Erwan : pas de secrets ni de reliques) : niveaux 50 %, étoiles 50 %. 100 % = 500 pièces, une fois.
  const pct = w => { const s = WS(w); return Math.round(s.done.filter(Boolean).length / 7 * 50 + worldStars(w) / 21 * 50); };
  const FULL_COINS = 500;

  // Remboursement de l'ancien Parc : 50 % des pièces dépensées en bâtiments et en objets, une seule fois
  const PARC_B = {maison:[50, 90, 140], casino:[100, 160, 240], carrousel:[120, 190, 260], observatoire:[150, 220, 300], statue:[180, 260, 360], chateau:[250, 380, 520]};
  const PARC_I = {banc:25, lampadaire:35, fleurs:20, pommier:30, cerisier:45, fontaine:70, statue:120, parasol:45, balancoire:50, potager:35, mare:40, puits:55, barbecue:40, nichoir:40, moulin:90, feu:30, arche:60, hamac:45, serre:80, boite:15, epouvantail:25,
    canape:30, fauteuil:25, table:30, biblio:40, lampe:20, tapis:15, lit:35, cheminee:70, piano:90, aquarium:55, horloge:45, bureau:50, arcade:80, telescope:60, globe:45, plante:15, coffre:40};
  function parcSpent(p){
    if (!p) return 0; let n = 0;
    Object.keys(p.map || {}).forEach(k => { const pr = PARC_B[k] || []; for (let l = 0; l < Math.min(3, p.map[k] || 0); l++) n += pr[l] || 0; });
    (p.garden || []).concat(p.inside || []).forEach(e => n += PARC_I[e && e.id] || 0);
    return n;
  }
  function init(){
    const a = A();
    if (S.tab === "parc") S.tab = "aventure";
    if (a.refund === undefined) {
      const back = Math.round(parcSpent(S.parc) * .5); a.refund = back;
      if (back > 0) { S.coins += back; toasts.push(`<b>Le Parc devient l'Aventure !</b> · Tu récupères ${back} pièces, la moitié de ce que tu avais dépensé dans ton parc.`); }
      if (S.parc && S.parc.wheelDay) { S.cas = S.cas || {wheel:S.parc.wheelDay}; }
      save();
    }
  }

  /* ===================== Questions ===================== */
  let POOL = null;
  function pools(){
    if (POOL) return POOL;
    POOL = {1:[], 2:[], 3:[]};
    Object.keys(Q).forEach(id => { const q = Q[id]; if (!q[6] && q[2] && q[2].length === 4 && POOL[q[1]]) POOL[q[1]].push(id); });
    return POOL;
  }
  const lvlFor = l => young() && l === 3 ? 2 : l;
  function pickOne(l, used){
    const P = pools()[lvlFor(l)].filter(id => !used.has(id)), seen = A().seen, sset = new Set(seen);
    let fresh = P.filter(id => !sset.has(id));
    if (!fresh.length) { const ord = new Map(seen.map((id, i) => [id, i])); fresh = P.slice().sort((a, b) => (ord.get(a) || 0) - (ord.get(b) || 0)).slice(0, 30); }
    const id = fresh[Math.floor(Math.random() * fresh.length)];
    used.add(id); return id;
  }
  function markSeen(id){ const a = A(); const i = a.seen.indexOf(id); if (i >= 0) a.seen.splice(i, 1); a.seen.push(id); if (a.seen.length > SEEN_MAX) a.seen = a.seen.slice(-SEEN_MAX); }
  const rollLvl = mix => { const r = Math.random(); return r < mix[0] ? 1 : r < mix[0] + mix[1] ? 2 : 3; };
  // Liste de questions d'une partie : difficulté du niveau, une surprise plus dure, 3 « difficiles » pour l'objectif des Ruines
  function makeList(L, n){
    const used = new Set(), out = [];
    for (let k = 0; k < n; k++) out.push({id:pickOne(rollLvl(L.mix), used)});
    if (L.mode !== "boss") { const k = 3 + Math.floor(Math.random() * Math.max(1, Math.min(6, n - 4))); out[k] = {id:pickOne(3, used), hard:true}; }
    if (L.sp.k === "hard") [1, 5, 8].forEach(k => out[k] = {id:pickOne(3, used), hard:true});
    return out;
  }

  /* ===================== Outils de dessin ===================== */
  function rnd(seed){ seed = seed % 2147483647; if (seed <= 0) seed += 2147483646; return () => (seed = seed * 16807 % 2147483647) / 2147483647; }
  function smooth(p, closed){
    const n = p.length, f = v => v.toFixed(1); let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 0; i < (closed ? n : n - 1); i++){
      const p0 = closed ? p[(i - 1 + n) % n] : p[Math.max(0, i - 1)], p1 = p[i], p2 = p[(i + 1) % n], p3 = closed ? p[(i + 2) % n] : p[Math.min(n - 1, i + 2)];
      d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + (closed ? "Z" : "");
  }
  function sample(p, k = 24){
    const out = [], n = p.length;
    for (let i = 0; i < n - 1; i++){ const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(n - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      for (let j = 0; j < k; j++){ const t = j / k, u = 1 - t;
        out.push([u*u*u*p1[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p2[0], u*u*u*p1[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p2[1]]); } }
    out.push(p[n - 1]); return out;
  }
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const near = (pt, list) => { let m = 1e9; for (const q of list) { const d = dist(pt, q); if (d < m) m = d; } return m; };
  function blob(cx, cy, rx, ry, seed, k = 10, amp = .14){ const r = rnd(seed), p = [];
    for (let i = 0; i < k; i++){ const a = i / k * Math.PI * 2, m = 1 + (r() - .5) * 2 * amp; p.push([cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m]); }
    return smooth(p, true); }
  function bumpy(cx, cy, rx, ry, k, seed){ const r = rnd(seed), p = [];
    for (let i = 0; i < k * 2; i++){ const a = i / (k * 2) * Math.PI * 2 - Math.PI / 2, m = i % 2 ? .9 : 1 + r() * .06; p.push([cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m]); }
    return smooth(p, true); }
  const tf = (d, g, dark, dy = 3, w = 2.6) => `${dy ? `<path d="${d}" transform="translate(0 ${dy})" fill="${dark}" stroke="${TD}" stroke-width="${w}" stroke-linejoin="round"/>` : ""}<path d="${d}" fill="url(#${g})" stroke="${TD}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const lg = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const rg = (id, a, b, o = 0) => `<radialGradient id="${id}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}" stop-opacity="${o}"/></radialGradient>`;
  const starP = (x, y, r) => { let d = ""; for (let i = 0; i < 10; i++){ const a = Math.PI * i / 5 - Math.PI / 2, rr = i % 2 ? r * .46 : r; d += (i ? "L" : "M") + (x + rr * Math.cos(a)).toFixed(1) + " " + (y + rr * Math.sin(a)).toFixed(1); } return d + "Z"; };
  const starSVG = (on, s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 20 20" aria-hidden="true"><path d="${starP(10, 10.6, 9)}" fill="${on ? "#FFD23F" : "#CDBF9E"}" stroke="${TD}" stroke-width="1.8" stroke-linejoin="round"/>${on ? `<path d="M7 6.5 L9 5.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>` : ""}</svg>`;
  const nest = (svg, x, y) => svg.replace("<svg ", `<svg x="${x}" y="${y}" `);
  const fluid = svg => svg.replace(/width="[\d.]+" height="[\d.]+"/, 'style="width:100%;height:auto;overflow:visible"');
  const pet = () => typeof Familiers !== "undefined" ? Familiers.eq() : null;

  /* --- Décor de la Forêt --- */
  const TREE_PAL = [["avA", "#A6EA72", "#4FA83E", "#2E6A2A"], ["avB", "#86DA5E", "#3A8E3E", "#21542A"], ["avC", "#7DE0A8", "#2F9A6A", "#1C5A42"], ["avP", "#FFC4E2", "#E66AAE", "#9A3A78"]];
  const forestDefs = () => TREE_PAL.map(p => lg(p[0], p[1], p[2])).join("") + lg("avTrunk", "#A87444", "#6E4428") + lg("avPine", "#5FC27A", "#1F6A44") + lg("avStone", "#E4E0EC", "#9C98AE") + lg("avRock", "#B8B0A8", "#6E6660")
    + lg("avWater", "#7FD8FF", "#2E9AD8") + lg("avRed", "#FF6A6A", "#C02838") + lg("avWall", "#FFF0D2", "#D6B080") + lg("avRoof", "#B07AE0", "#6A3AA8") + lg("avWood", "#C88A50", "#7A4A26") + lg("avGold", "#FFE07A", "#E09A1A")
    + rg("avGlowY", "#FFF4A0", "#FFD23F") + rg("avGlowC", "#B8FFFF", "#4AE0FF") + rg("avGlowP", "#E8C8FF", "#A060FF") + rg("avSun", "#FFF6C8", "#FFF6C8");
  function tree(x, y, s, kind, seed){
    if (kind === "pine"){ const h = 58 * s, w = 22 * s;
      const d = `M${x} ${y - h} L${x + w * .5} ${y - h * .7} L${x + w * .3} ${y - h * .7} L${x + w * .8} ${y - h * .4} L${x + w * .5} ${y - h * .4} L${x + w} ${y - h * .12} L${x - w} ${y - h * .12} L${x - w * .5} ${y - h * .4} L${x - w * .8} ${y - h * .4} L${x - w * .3} ${y - h * .7} L${x - w * .5} ${y - h * .7}Z`;
      return `<ellipse cx="${x}" cy="${y}" rx="${16 * s}" ry="${5 * s}" fill="rgba(20,40,10,.25)"/><rect x="${x - 3.5 * s}" y="${y - 10 * s}" width="${7 * s}" height="${10 * s}" fill="url(#avTrunk)" stroke="${TD}" stroke-width="2.2"/>` + tf(d, "avPine", "#164A30", 3 * s, 2.4) + `<path d="M${x - 2 * s} ${y - h * .86} L${x - w * .35} ${y - h * .62}" stroke="#fff" stroke-width="${2.4 * s}" stroke-linecap="round" opacity=".5"/>`;
    }
    const p = TREE_PAL[kind] || TREE_PAL[0];
    const trunk = `M${x - 5 * s} ${y} Q${x - 4 * s} ${y - 12 * s} ${x - 4 * s} ${y - 24 * s} L${x + 4 * s} ${y - 24 * s} Q${x + 4 * s} ${y - 12 * s} ${x + 5 * s} ${y}Z`;
    const can = bumpy(x, y - 36 * s, 23 * s, 19 * s, 7 + (seed % 2), seed);
    return `<ellipse cx="${x}" cy="${y}" rx="${18 * s}" ry="${5.5 * s}" fill="rgba(20,40,10,.25)"/>` + tf(trunk, "avTrunk", "#4A2C18", 0, 2.2) + tf(can, p[0], p[3], 4 * s, 2.6)
      + `<path d="M${x - 13 * s} ${y - 41 * s} Q${x - 8 * s} ${y - 50 * s} ${x} ${y - 51 * s}" stroke="#fff" stroke-width="${3 * s}" fill="none" stroke-linecap="round" opacity=".55"/>`
      + (kind === 3 ? "" : `<circle cx="${x + 9 * s}" cy="${y - 32 * s}" r="${2 * s}" fill="${["#FF6A8A", "#FFD23F", "#fff"][seed % 3]}" stroke="${TD}" stroke-width="1"/>`);
  }
  const bush = (x, y, s, seed) => `<ellipse cx="${x}" cy="${y}" rx="${16 * s}" ry="${4 * s}" fill="rgba(20,40,10,.25)"/>` + tf(bumpy(x, y - 9 * s, 17 * s, 11 * s, 5, seed), "avB", "#21542A", 2.5, 2.3);
  const mush = (x, y, s) => `<rect x="${x - 2.5 * s}" y="${y - 8 * s}" width="${5 * s}" height="${8 * s}" rx="2" fill="#FFF0D2" stroke="${TD}" stroke-width="1.8"/>` + tf(`M${x - 8 * s} ${y - 7 * s} Q${x} ${y - 20 * s} ${x + 8 * s} ${y - 7 * s}Z`, "avRed", "#7A1A24", 1.5, 1.8) + `<circle cx="${x - 2 * s}" cy="${y - 12 * s}" r="${1.6 * s}" fill="#fff"/>`;
  const flower = (x, y, c) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c}" stroke="${TD}" stroke-width="1"/><circle cx="${x}" cy="${y}" r=".9" fill="#FFF6B0"/>`;
  function hut(x, y, s = 1, seed = 1){
    const wall = `M${x - 18 * s} ${y} L${x - 16 * s} ${y - 26 * s} L${x + 16 * s} ${y - 26 * s} L${x + 18 * s} ${y}Z`;
    const cap = `M${x - 32 * s} ${y - 22 * s} Q${x - 30 * s} ${y - 62 * s} ${x} ${y - 64 * s} Q${x + 30 * s} ${y - 62 * s} ${x + 32 * s} ${y - 22 * s} Q${x} ${y - 14 * s} ${x - 32 * s} ${y - 22 * s}Z`;
    return `<ellipse cx="${x}" cy="${y + 1}" rx="${30 * s}" ry="${6 * s}" fill="rgba(20,40,10,.3)"/>` + tf(wall, "avWall", "#8A6A44", 0, 2.4)
      + `<path d="M${x - 6 * s} ${y} L${x - 6 * s} ${y - 11 * s} Q${x} ${y - 18 * s} ${x + 6 * s} ${y - 11 * s} L${x + 6 * s} ${y}Z" fill="#6E4428" stroke="${TD}" stroke-width="2"/>`
      + `<circle cx="${x + 11 * s}" cy="${y - 15 * s}" r="${4 * s}" fill="url(#avGlowY)" stroke="${TD}" stroke-width="1.8" class="av-pulse" style="animation-delay:-${seed * .3}s"/>`
      + tf(cap, seed % 2 ? "avRed" : "avRoof", seed % 2 ? "#7A1A24" : "#3A1A6A", 3.5, 2.6)
      + [[-16, -40, 5], [4, -52, 6], [18, -36, 4], [-2, -34, 3.5]].map(([dx, dy, r]) => `<ellipse cx="${x + dx * s}" cy="${y + dy * s}" rx="${r * s}" ry="${r * .8 * s}" fill="#FFF6E8" stroke="${TD}" stroke-width="1.5"/>`).join("")
      + `<path d="M${x - 22 * s} ${y - 46 * s} Q${x - 14 * s} ${y - 58 * s} ${x - 2 * s} ${y - 59 * s}" stroke="#fff" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round" opacity=".6"/>`;
  }
  function column(x, y, h, broken, s = 1){
    const top = broken ? `L${x + 8 * s} ${y - h + 6} L${x + 3 * s} ${y - h - 2} L${x - 2 * s} ${y - h + 5} L${x - 8 * s} ${y - h}` : `L${x + 8 * s} ${y - h} L${x - 8 * s} ${y - h}`;
    return `<ellipse cx="${x}" cy="${y}" rx="${14 * s}" ry="${4 * s}" fill="rgba(20,40,10,.3)"/>` + tf(`M${x - 8 * s} ${y} L${x + 8 * s} ${y} ${top}Z`, "avStone", "#6A667A", 3, 2.3)
      + `<rect x="${x - 11 * s}" y="${y - 5}" width="${22 * s}" height="6" rx="2" fill="url(#avStone)" stroke="${TD}" stroke-width="2"/>`
      + (broken ? "" : `<rect x="${x - 11 * s}" y="${y - h - 5}" width="${22 * s}" height="7" rx="2" fill="url(#avStone)" stroke="${TD}" stroke-width="2"/>`)
      + `<path d="M${x - 3 * s} ${y - 6} L${x - 3 * s} ${y - h + 10}" stroke="#fff" stroke-width="2" opacity=".5"/>`
      + `<path d="${bumpy(x - 4 * s, y - h * .45, 8 * s, 5, 3, h)}" fill="#5AB04A" stroke="${TD}" stroke-width="1.6"/>`;
  }
  function arch(x, y){
    const d = `M${x - 34} ${y} L${x - 34} ${y - 44} Q${x} ${y - 84} ${x + 34} ${y - 44} L${x + 34} ${y} L${x + 20} ${y} L${x + 20} ${y - 40} Q${x} ${y - 64} ${x - 20} ${y - 40} L${x - 20} ${y}Z`;
    return `<ellipse cx="${x}" cy="${y}" rx="40" ry="7" fill="rgba(20,40,10,.3)"/>` + tf(d, "avStone", "#6A667A", 4, 2.6)
      + `<path d="M${x - 10} ${y - 56} l4 -4 l4 4 l-4 4z M${x + 4} ${y - 58} h6" stroke="#8A60FF" stroke-width="2" fill="none" class="av-pulse"/>`
      + `<path d="${bumpy(x + 24, y - 56, 12, 7, 4, 9)}" fill="#5AB04A" stroke="${TD}" stroke-width="1.6"/><path d="M${x + 30} ${y - 50} q2 12 -2 20" stroke="#3E8A3A" stroke-width="2.4" fill="none"/>`;
  }
  function cave(x, y){
    const rock = blob(x, y - 40, 62, 50, 77, 11, .12);
    return `<ellipse cx="${x}" cy="${y + 4}" rx="66" ry="12" fill="rgba(20,40,10,.3)"/>` + tf(rock, "avRock", "#4A4440", 5, 2.8)
      + `<path d="${bumpy(x + 10, y - 82, 40, 12, 5, 4)}" fill="#5AB04A" stroke="${TD}" stroke-width="2"/>`
      + `<path d="M${x - 26} ${y} Q${x - 26} ${y - 46} ${x} ${y - 48} Q${x + 26} ${y - 46} ${x + 26} ${y}Z" fill="#1A1020" stroke="${TD}" stroke-width="2.6"/>`
      + `<circle cx="${x - 6}" cy="${y - 26}" r="3" fill="#FFE07A" class="av-pulse"/><circle cx="${x + 7}" cy="${y - 26}" r="3" fill="#FFE07A" class="av-pulse"/>`
      + [[-44, 2], [-36, -4], [40, 2], [48, -6]].map(([dx, dy], i) => `<circle cx="${x + dx}" cy="${y + dy - 8}" r="11" fill="url(#avGlowC)" class="av-pulse" style="animation-delay:-${i * .4}s"/><rect x="${x + dx - 1.6}" y="${y + dy - 6}" width="3.2" height="7" fill="#E8FFFF" stroke="${TD}" stroke-width="1.2"/><path d="M${x + dx - 6} ${y + dy - 5} Q${x + dx} ${y + dy - 15} ${x + dx + 6} ${y + dy - 5}Z" fill="#6AF0FF" stroke="${TD}" stroke-width="1.4"/>`).join("")
      + `<path d="M${x - 40} ${y - 62} Q${x - 24} ${y - 84} ${x} ${y - 86}" stroke="#fff" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`;
  }
  function sanctuary(x, y){
    return `<circle cx="${x}" cy="${y}" r="56" fill="url(#avGlowC)" opacity=".55" class="av-pulse"/>`
      + `<ellipse cx="${x}" cy="${y}" rx="44" ry="20" fill="url(#avStone)" stroke="${TD}" stroke-width="2.6"/><ellipse cx="${x}" cy="${y - 2}" rx="34" ry="13" fill="url(#avWater)" stroke="${TD}" stroke-width="2.2"/>`
      + `<ellipse cx="${x - 8}" cy="${y - 5}" rx="12" ry="3" fill="#E8FFFF" opacity=".75" class="av-fog"/>`
      + [[-52, -6], [-30, -26], [30, -26], [52, -6]].map(([dx, dy], i) => tf(`M${x + dx - 7} ${y + dy} L${x + dx - 6} ${y + dy - 30} Q${x + dx} ${y + dy - 38} ${x + dx + 6} ${y + dy - 30} L${x + dx + 7} ${y + dy}Z`, "avStone", "#6A667A", 3, 2.2) + `<path d="M${x + dx - 2} ${y + dy - 22} l2 -4 l2 4 l-2 4z" fill="#7AF0FF" class="av-pulse" style="animation-delay:-${i * .3}s"/>`).join("");
  }
  function taverne(x, y){
    const body = `M${x - 46} ${y} L${x - 44} ${y - 50} L${x + 44} ${y - 50} L${x + 46} ${y}Z`;
    const roof = `M${x - 58} ${y - 44} L${x - 30} ${y - 92} L${x + 30} ${y - 92} L${x + 58} ${y - 44}Z`;
    return `<g class="av-tav" data-adv="casino" role="button" aria-label="Entrer dans la Taverne du Trèfle d'Or (Casino)"><ellipse cx="${x}" cy="${y + 2}" rx="62" ry="11" fill="rgba(20,40,10,.32)"/>`
      + `<circle cx="${x}" cy="${y - 40}" r="80" fill="url(#avGlowY)" opacity=".28" class="av-pulse"/>`
      + tf(body, "avWood", "#4A2C18", 0, 2.8)
      + [-30, -10, 10, 30].map(dx => `<path d="M${x + dx} ${y - 48} L${x + dx} ${y - 2}" stroke="#5A3418" stroke-width="2" opacity=".6"/>`).join("")
      + tf(roof, "avB", "#21542A", 5, 2.8) + `<path d="M${x - 40} ${y - 56} L${x - 22} ${y - 86}" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>`
      + `<path d="${bumpy(x - 30, y - 90, 14, 6, 3, 5)}" fill="#3E8A3A" stroke="${TD}" stroke-width="1.8"/>`
      + `<rect x="${x + 22}" y="${y - 112}" width="12" height="24" fill="#8A6A5A" stroke="${TD}" stroke-width="2.2"/><circle cx="${x + 28}" cy="${y - 120}" r="5" fill="#E8E0F0" opacity=".7" class="av-fog"/>`
      + `<path d="M${x - 12} ${y} L${x - 12} ${y - 26} Q${x} ${y - 38} ${x + 12} ${y - 26} L${x + 12} ${y}Z" fill="url(#avGlowY)" stroke="${TD}" stroke-width="2.4"/><path d="M${x} ${y - 32} L${x} ${y}" stroke="${TD}" stroke-width="2"/>`
      + [-31, 31].map(dx => `<rect x="${x + dx - 9}" y="${y - 40}" width="18" height="15" rx="3" fill="url(#avGlowY)" stroke="${TD}" stroke-width="2.2"/><path d="M${x + dx} ${y - 40} v15 M${x + dx - 9} ${y - 32} h18" stroke="${TD}" stroke-width="1.6"/>`).join("")
      + `<rect x="${x - 38}" y="${y - 76}" width="76" height="22" rx="6" fill="#2B1A12" stroke="#FFD23F" stroke-width="2.4"/>`
      + `<text x="${x + 6}" y="${y - 60.5}" text-anchor="middle" style="font:800 11px var(--f-display)" fill="#FFD23F">CASINO</text>`
      + `<g transform="translate(${x - 26} ${y - 65})"><circle cx="0" cy="-4" r="3.4" fill="#5AE07A"/><circle cx="-3.6" cy="1" r="3.4" fill="#5AE07A"/><circle cx="3.6" cy="1" r="3.4" fill="#5AE07A"/><path d="M0 2 L1 8" stroke="#5AE07A" stroke-width="1.6"/></g>`
      + [-50, 50].map((dx, i) => `<path d="M${x + dx} ${y - 50} v6" stroke="${TD}" stroke-width="1.8"/><circle cx="${x + dx}" cy="${y - 38}" r="12" fill="url(#avGlowP)" class="av-pulse" style="animation-delay:-${i * .5}s"/><rect x="${x + dx - 4.5}" y="${y - 44}" width="9" height="12" rx="3" fill="#FF8AC8" stroke="${TD}" stroke-width="1.8"/>`).join("")
      + `<rect x="${x + 50}" y="${y - 18}" width="16" height="18" rx="4" fill="url(#avWood)" stroke="${TD}" stroke-width="2"/><path d="M${x + 50} ${y - 12} h16 M${x + 50} ${y - 5} h16" stroke="${TD}" stroke-width="1.4"/>`
      + `<rect x="${x + 53}" y="${y - 27}" width="9" height="9" rx="2" fill="#fff" stroke="${TD}" stroke-width="1.6" transform="rotate(-12 ${x + 57} ${y - 22})"/><circle cx="${x + 57}" cy="${y - 22.5}" r="1.3" fill="#E2283A"/>`
      + `<rect x="${x - 66}" y="${y - 124}" width="140" height="132" fill="transparent"/></g>`;
  }
  function bossTree(x, y){
    const trunk = `M${x - 46} ${y} Q${x - 70} ${y + 14} ${x - 92} ${y + 10} Q${x - 62} ${y - 6} ${x - 44} ${y - 30} L${x - 36} ${y - 120} L${x + 36} ${y - 120} L${x + 44} ${y - 30} Q${x + 62} ${y - 6} ${x + 92} ${y + 10} Q${x + 70} ${y + 14} ${x + 46} ${y}Z`;
    return `<ellipse cx="${x}" cy="${y + 6}" rx="120" ry="18" fill="rgba(10,0,20,.4)"/>`
      + `<circle cx="${x}" cy="${y - 120}" r="170" fill="url(#avGlowP)" opacity=".35" class="av-pulse"/>`
      + tf(trunk, "avTrunk", "#3A2010", 0, 3)
      + `<path d="M${x - 20} ${y - 10} Q${x - 24} ${y - 60} ${x - 14} ${y - 110} M${x + 22} ${y - 14} Q${x + 26} ${y - 64} ${x + 16} ${y - 108}" stroke="#4A2C18" stroke-width="3" fill="none" opacity=".7"/>`
      + tf(bumpy(x, y - 175, 150, 80, 13, 21), "avC", "#123A2A", 6, 3)
      + tf(bumpy(x - 50, y - 210, 70, 42, 9, 3), "avB", "#163A20", 4, 2.6) + tf(bumpy(x + 60, y - 200, 66, 40, 9, 8), "avB", "#163A20", 4, 2.6)
      + `<path d="M${x - 80} ${y - 220} Q${x - 50} ${y - 252} ${x - 10} ${y - 254}" stroke="#fff" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/>`
      + `<path d="M${x - 26} ${y - 82} L${x - 6} ${y - 74} M${x + 26} ${y - 82} L${x + 6} ${y - 74}" stroke="${TD}" stroke-width="5" stroke-linecap="round"/>`
      + `<ellipse cx="${x - 15}" cy="${y - 66}" rx="9" ry="6" fill="#1A0A20" stroke="${TD}" stroke-width="2"/><ellipse cx="${x + 15}" cy="${y - 66}" rx="9" ry="6" fill="#1A0A20" stroke="${TD}" stroke-width="2"/>`
      + `<circle cx="${x - 15}" cy="${y - 66}" r="12" fill="url(#avGlowP)" class="av-pulse"/><circle cx="${x + 15}" cy="${y - 66}" r="12" fill="url(#avGlowP)" class="av-pulse"/><circle cx="${x - 15}" cy="${y - 66}" r="3.4" fill="#F4E0FF"/><circle cx="${x + 15}" cy="${y - 66}" r="3.4" fill="#F4E0FF"/>`
      + `<path d="M${x - 22} ${y - 40} Q${x} ${y - 52} ${x + 22} ${y - 40} Q${x} ${y - 22} ${x - 22} ${y - 40}Z" fill="#1A0A20" stroke="${TD}" stroke-width="2.4"/><path d="M${x - 12} ${y - 44} l3 7 l3 -8 l3 8 l3 -8 l3 7" stroke="#E8D8B0" stroke-width="2" fill="none"/>`
      + [[-30, -100], [28, -96], [0, -108], [-34, -28], [34, -30]].map(([dx, dy], i) => `<path d="M${x + dx - 3} ${y + dy} l3 -6 l3 6 l-3 6z" fill="#C8A0FF" class="av-pulse" style="animation-delay:-${i * .35}s"/>`).join("");
  }
  function campfire(x, y){
    return `<ellipse cx="${x}" cy="${y}" rx="36" ry="9" fill="rgba(20,40,10,.3)"/><circle cx="${x}" cy="${y - 10}" r="34" fill="url(#avGlowY)" opacity=".45" class="av-pulse"/>`
      + `<rect x="${x - 18}" y="${y - 6}" width="36" height="8" rx="4" fill="url(#avTrunk)" stroke="${TD}" stroke-width="2" transform="rotate(14 ${x} ${y})"/><rect x="${x - 18}" y="${y - 6}" width="36" height="8" rx="4" fill="url(#avTrunk)" stroke="${TD}" stroke-width="2" transform="rotate(-14 ${x} ${y})"/>`
      + `<path class="av-flame" d="M${x - 10} ${y - 4} Q${x - 14} ${y - 18} ${x - 2} ${y - 30} Q${x} ${y - 20} ${x + 6} ${y - 26} Q${x + 14} ${y - 12} ${x + 10} ${y - 4}Z" fill="#FF8A3A" stroke="${TD}" stroke-width="2"/><path class="av-flame" d="M${x - 4} ${y - 5} Q${x - 6} ${y - 14} ${x + 1} ${y - 20} Q${x + 7} ${y - 12} ${x + 4} ${y - 5}Z" fill="#FFE07A"/>`
      + `<rect x="${x + 34}" y="${y - 40}" width="5" height="40" fill="url(#avTrunk)" stroke="${TD}" stroke-width="2"/><path d="M${x + 24} ${y - 44} L${x + 66} ${y - 44} L${x + 72} ${y - 36} L${x + 66} ${y - 28} L${x + 24} ${y - 28}Z" fill="url(#avWood)" stroke="${TD}" stroke-width="2.2"/><text x="${x + 46}" y="${y - 32.5}" text-anchor="middle" style="font:800 9.5px var(--f-display)" fill="#FFF4DA">DÉPART</text>`;
  }

  /* --- Monstres de la Forêt (originaux, style jouet) --- */
  const MON = {
    gluant(){
      return toy("M16 102 Q8 72 28 50 Q44 30 60 30 Q76 30 92 50 Q112 72 104 102 Q60 112 16 102Z", "#A8F07A", "#3E9A3A", "#22602A")
        + tLimb("M60 32 Q58 20 62 12", "#5AB04A", 6) + toy("M62 14 Q74 2 86 10 Q76 22 62 14Z", "#8BE36A", "#3E9A3A", "#22602A", {dy:2, w:2.4}) + toy("M60 16 Q46 6 38 14 Q48 24 60 16Z", "#8BE36A", "#3E9A3A", "#22602A", {dy:2, w:2.4})
        + `<path d="M34 58 L52 64 M86 58 L68 64" stroke="${TD}" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="45" cy="72" rx="8" ry="9" fill="#fff" stroke="${TD}" stroke-width="2.6"/><ellipse cx="75" cy="72" rx="8" ry="9" fill="#fff" stroke="${TD}" stroke-width="2.6"/><circle cx="47" cy="74" r="4" fill="${TD}"/><circle cx="73" cy="74" r="4" fill="${TD}"/>`
        + `<path d="M44 90 Q60 82 76 90 Q60 100 44 90Z" fill="#3A1A2A" stroke="${TD}" stroke-width="2.4"/><path d="M50 88 l3 5 l3 -6 M64 87 l3 6 l3 -5" fill="#fff" stroke="${TD}" stroke-width="1"/>`
        + `<path d="M28 66 Q30 50 44 42" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/><ellipse cx="96" cy="88" rx="3" ry="5" fill="#C8FF9A" stroke="${TD}" stroke-width="1.6"/>`; },
    champi(){
      return tFeet(46, 74, 104, "#FFF0D6", "#C8A47A", "#8A6A44", 9)
        + toy("M38 104 Q32 76 42 62 L78 62 Q88 76 82 104 Q60 110 38 104Z", "#FFF4E0", "#D8B88A", "#9A7A5A")
        + toy("M10 64 Q10 20 60 16 Q110 20 110 64 Q86 76 60 72 Q34 76 10 64Z", "#FF6A6A", "#C02838", "#7A1A24", {dy:5})
        + [[34, 38, 8], [60, 28, 9], [86, 40, 7], [48, 56, 5], [76, 58, 5]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .8}" fill="#FFF6E8" stroke="${TD}" stroke-width="2"/>`).join("")
        + `<path d="M26 36 Q36 22 54 20" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`
        + `<path d="M44 76 L56 81 M76 76 L64 81" stroke="${TD}" stroke-width="4" stroke-linecap="round"/><circle cx="51" cy="86" r="4.2" fill="${TD}"/><circle cx="69" cy="86" r="4.2" fill="${TD}"/><circle cx="52.4" cy="84.6" r="1.4" fill="#fff"/><circle cx="70.4" cy="84.6" r="1.4" fill="#fff"/>`
        + `<path d="M50 96 Q60 92 70 96" stroke="${TD}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M53 95.5 l2 4 l2 -4.6 M63 94.6 l2 4.6 l2 -4" fill="#fff" stroke="${TD}" stroke-width="1"/>`
        + tLimb("M36 84 Q24 80 20 70", "#FFF0D6", 8) + tLimb("M84 84 Q96 80 100 70", "#FFF0D6", 8); },
    souche(){
      return tFeet(40, 80, 106, "#8A5A30", "#5A3418", "#3A2010", 11)
        + toy("M22 106 L28 44 Q60 34 92 44 L98 106 Q60 114 22 106Z", "#B8804E", "#6E4428", "#3A2010")
        + `<ellipse cx="60" cy="44" rx="32" ry="10" fill="#F0C890" stroke="${TD}" stroke-width="2.6"/><ellipse cx="60" cy="44" rx="20" ry="6" fill="none" stroke="#B8804E" stroke-width="1.8"/><ellipse cx="60" cy="44" rx="9" ry="3" fill="none" stroke="#B8804E" stroke-width="1.6"/>`
        + `<path d="${bumpy(40, 38, 16, 7, 4, 3)}" fill="#6CC85A" stroke="${TD}" stroke-width="2"/>`
        + tLimb("M62 36 Q62 22 70 14", "#7A4A26", 6) + toy("M70 16 Q82 6 90 16 Q80 24 70 16Z", "#8BE36A", "#3E9A3A", "#22602A", {dy:2, w:2.2})
        + `<path d="M32 60 Q34 84 30 100 M88 62 Q86 86 90 100 M48 92 Q50 100 46 106" stroke="#5A3418" stroke-width="2.4" fill="none" opacity=".75"/>`
        + `<path d="M36 58 L54 66 M84 58 L66 66" stroke="${TD}" stroke-width="5" stroke-linecap="round"/>`
        + `<circle cx="47" cy="72" r="10" fill="url(#avMGlow)"/><circle cx="73" cy="72" r="10" fill="url(#avMGlow)"/><ellipse cx="47" cy="72" rx="5" ry="4" fill="#FFE07A" stroke="${TD}" stroke-width="2"/><ellipse cx="73" cy="72" rx="5" ry="4" fill="#FFE07A" stroke="${TD}" stroke-width="2"/>`
        + `<path d="M40 88 L48 84 L54 90 L60 84 L66 90 L72 84 L80 88 Q60 102 40 88Z" fill="#2A1010" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/>`
        + tLimb("M26 70 Q10 62 8 46", "#7A4A26", 9) + tLimb("M14 54 L4 48", "#7A4A26", 5) + tLimb("M94 70 Q110 62 112 46", "#7A4A26", 9) + tLimb("M106 54 L116 48", "#7A4A26", 5)
        + `<path d="M30 52 Q32 70 30 86" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".35"/>`; }
  };
  const monSVG = (k, size, cls = "") => `<svg class="${cls}" viewBox="0 0 120 116" width="${size}" height="${(size * 116 / 120).toFixed(1)}" style="overflow:visible" aria-label="${MON_N[k]}"><defs>${rg("avMGlow", "#FFF4A0", "#FF8A3A")}</defs><ellipse cx="60" cy="108" rx="38" ry="5" fill="rgba(10,6,24,.3)"/>${MON[k]()}</svg>`;

  /* --- Le Gardien Sylvestre (boss du Monde 1), 3 phases --- */
  function guardianSVG(ph){
    const eye = ph === 1 ? ["#C8FFE0", "#3AE08A"] : ph === 2 ? ["#FFE0A0", "#FF6A2A"] : ["#F0D0FF", "#A040FF"];
    const leaf = ph === 3 ? ["#7A6AB8", "#3A2A6A", "#1E1440"] : ph === 2 ? ["#9AD05A", "#4A8A2E", "#244A1A"] : ["#A6EA72", "#3E9A3A", "#1E5A2A"];
    const u = "gd" + ph;
    let s = `<defs>${rg(u + "e", eye[0], eye[1])}${rg(u + "a", ph === 3 ? "#C080FF" : ph === 2 ? "#FF8A3A" : "#9AF8C0", "#000")}${lg(u + "l", leaf[0], leaf[1])}${lg(u + "t", "#B07A48", "#5A3418")}</defs>`;
    s += `<circle cx="100" cy="110" r="${ph === 3 ? 105 : 92}" fill="url(#${u}a)" opacity="${ph === 1 ? .25 : .45}" class="av-pulse"/>`;
    s += `<ellipse cx="100" cy="212" rx="80" ry="9" fill="rgba(10,6,24,.35)"/>`;
    // jambes-racines
    s += tf(`M62 212 Q56 186 70 168 L88 172 Q84 192 92 212Z`, u + "t", "#3A2010", 3, 3) + tf(`M138 212 Q144 186 130 168 L112 172 Q116 192 108 212Z`, u + "t", "#3A2010", 3, 3);
    s += `<path d="M58 212 q-10 2 -16 -2 M142 212 q10 2 16 -2" stroke="${TD}" stroke-width="5" stroke-linecap="round"/><path d="M58 212 q-10 2 -16 -2 M142 212 q10 2 16 -2" stroke="#8A5A30" stroke-width="2.6" stroke-linecap="round"/>`;
    // bras-branches
    const arm = (d, w) => `<path d="${d}" fill="none" stroke="${TD}" stroke-width="${w + 5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#8A5A30" stroke-width="${w}" stroke-linecap="round"/>`;
    s += arm("M58 112 Q30 120 22 150", 14) + arm("M24 146 L10 156 M24 148 L18 166 M26 148 L34 164", 5) + arm("M142 112 Q172 104 182 78", 14) + arm("M180 82 L194 70 M180 82 L190 92 M180 80 L176 64", 5);
    s += `<path d="${bumpy(184, 70, 16, 11, 6, 2)}" fill="url(#${u}l)" stroke="${TD}" stroke-width="2.2"/>`;
    // tronc
    s += tf(`M54 176 Q46 124 60 88 L140 88 Q154 124 146 176 Q100 188 54 176Z`, u + "t", "#3A2010", 5, 3.2);
    s += `<path d="M70 100 Q66 140 72 172 M128 100 Q134 140 128 172 M98 150 Q102 166 96 180" stroke="#5A3418" stroke-width="2.6" fill="none" opacity=".75"/>`;
    s += `<path d="M62 100 Q58 130 62 160" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".3"/>`;
    s += `<path d="${bumpy(76, 168, 16, 8, 5, 7)}" fill="#5AB04A" stroke="${TD}" stroke-width="2"/>`;
    // couronne de feuillage
    s += tf(bumpy(100, 66, 74, 46, 11, ph * 7 + 1), u + "l", leaf[2], 5, 3);
    s += `<path d="M44 52 Q60 28 92 24" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".45"/>`;
    if (ph === 3) s += [[40, 50], [70, 22], [100, 16], [132, 22], [160, 50]].map(([x, y]) => `<path d="M${x - 6} ${y + 8} L${x} ${y - 12} L${x + 6} ${y + 8}Z" fill="#3A1A5A" stroke="${TD}" stroke-width="2.4" stroke-linejoin="round"/>`).join("");
    else s += [[52, 60], [84, 40], [128, 46], [150, 72]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" fill="${ph === 2 ? "#FF8A3A" : "#FFB0D8"}" stroke="${TD}" stroke-width="1.8"/>`).join("");
    // visage
    s += `<path d="M66 108 L94 120 M134 108 L106 120" stroke="${TD}" stroke-width="7" stroke-linecap="round"/>`;
    s += `<circle cx="80" cy="128" r="16" fill="url(#${u}e)" class="av-pulse"/><circle cx="120" cy="128" r="16" fill="url(#${u}e)" class="av-pulse"/>`;
    s += `<ellipse cx="80" cy="128" rx="9" ry="7" fill="${eye[0]}" stroke="${TD}" stroke-width="2.6"/><ellipse cx="120" cy="128" rx="9" ry="7" fill="${eye[0]}" stroke="${TD}" stroke-width="2.6"/><ellipse cx="80" cy="128" rx="3" ry="5" fill="${TD}"/><ellipse cx="120" cy="128" rx="3" ry="5" fill="${TD}"/>`;
    s += `<path d="M74 150 Q100 ${ph === 1 ? 142 : 138} 126 150 Q100 ${ph === 1 ? 168 : 176} 74 150Z" fill="#1A0A12" stroke="${TD}" stroke-width="3"/><path d="M82 151 l4 8 l4 -9 l4 9 l4 -9 l4 9 l4 -9 l4 8" stroke="#F0E0B8" stroke-width="2.4" fill="none" stroke-linejoin="round"/>`;
    s += [[64, 98], [136, 98], [100, 96], [70, 170], [130, 170]].map(([x, y], i) => `<path d="M${x - 4} ${y} l4 -7 l4 7 l-4 7z" fill="${eye[0]}" stroke="${TD}" stroke-width="1.4" class="av-pulse" style="animation-delay:-${i * .3}s"/>`).join("");
    return `<svg viewBox="0 0 200 222" style="width:100%;height:auto;overflow:visible" aria-label="Le Gardien Sylvestre">${s}</svg>`;
  }

  /* ===================== Écran des îles ===================== */
  let ISL = null;
  function islandsSVG(){
    const w1 = WS(1), open2 = !!w1.done[6];
    let s = `<defs>${lg("avSea", "#0B2C5E", "#1E78C8")}${lg("avIA", "#A6EA72", "#3E9A3A")}${lg("avIS", "#FFE8A8", "#E8C070")}${lg("avID", "#FFD87A", "#D8963A")}${lg("avII", "#FFFFFF", "#A8D4F2")}${lg("avIC", "#6A3A6A", "#24142E")}${lg("avIB", "#3AA0D8", "#103A7A")}${rg("avIL", "#FFB070", "#FF4A2A")}${rg("avIW", "#9AF8FF", "#2AC0FF")}${rg("avGlowP", "#E8C8FF", "#A060FF")}${lg("avTrunk", "#A87444", "#6E4428")}</defs>`;
    s += `<rect width="400" height="800" fill="url(#avSea)"/>`;
    const r = rnd(5);
    for (let i = 0; i < 70; i++){ const x = r() * 400, y = 40 + r() * 760; s += `<path class="av-wave" style="animation-delay:-${(r() * 3).toFixed(1)}s" d="M${x.toFixed(0)} ${y.toFixed(0)} q5 -4 10 0 q5 4 10 0" stroke="#fff" stroke-width="2" fill="none" opacity=".22" stroke-linecap="round"/>`; }
    const C = [[118, 650], [292, 520], [112, 392], [292, 262], [150, 120]];
    s += `<path d="${smooth(C, false)}" stroke="#FFF3C4" stroke-width="4" stroke-dasharray="1 11" stroke-linecap="round" fill="none" opacity=".85"/>`;
    const label = (x, y, t, sub, on) => `<g transform="translate(${x} ${y})"><path d="M-74 -14 L74 -14 L66 0 L74 14 L-74 14 L-66 0Z" fill="${on ? "#FF5FA2" : "#4A4466"}" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/><text y="-1" text-anchor="middle" style="font:800 12.5px var(--f-display)" fill="#fff">${t}</text><text y="10" text-anchor="middle" style="font:600 8.5px var(--f-mono)" fill="#fff" opacity=".9">${sub}</text></g>`;
    const lock = (x, y) => `<g transform="translate(${x} ${y})"><circle r="17" fill="${TD}" opacity=".85"/><rect x="-8" y="-3" width="16" height="12" rx="3" fill="#FFD23F" stroke="${TD}" stroke-width="2"/><path d="M-5 -3 V-7 a5 5 0 0 1 10 0 V-3" stroke="#FFD23F" stroke-width="3" fill="none"/></g>`;
    const fog = (x, y) => [[-56, 18, 26], [52, 22, 24], [-20, 34, 22], [30, -30, 20]].map(([dx, dy, rr], i) => `<circle class="av-fog" style="animation-delay:-${i}s" cx="${x + dx}" cy="${y + dy}" r="${rr}" fill="#E8EEF8" opacity=".4"/>`).join("");
    const isl = (x, y, rx, ry, seed, land, dark, deco, name, sub, on, w) => {
      let g = `<ellipse cx="${x}" cy="${y + 10}" rx="${rx + 22}" ry="${ry + 18}" fill="#5AD0F0" opacity=".35"/>`;
      g += tf(blob(x, y + 4, rx + 8, ry + 8, seed + 1, 11, .1), "avIS", "#B8904A", 6, 3);
      g += tf(blob(x, y - 2, rx, ry, seed, 11, .13), land, dark, 5, 3) + deco;
      if (!on) g = `<g style="filter:grayscale(.45) brightness(.82)">${g}</g>${fog(x, y)}${lock(x, y - 8)}`;
      const crown = on && pct(w) >= 100 ? `<g class="av-crown" transform="translate(${x} ${y - ry - 22})"><circle r="30" fill="#FFE07A" opacity=".35" class="av-pulse"/><path d="M-18 8 L-20 -12 L-9 -2 L0 -16 L9 -2 L20 -12 L18 8Z" fill="#FFD23F" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/><rect x="-18" y="6" width="36" height="7" rx="2" fill="#F0A21A" stroke="${TD}" stroke-width="2.2"/><circle cy="-2" r="3" fill="#E2283A" stroke="${TD}" stroke-width="1.4"/></g>` : "";
      return `<g class="av-isl" data-adv="world" data-v="${w}" role="button" aria-label="${name}">${g}${crown}${label(x, y + ry + 26, name, sub, on)}</g>`;
    };
    let f = ""; const rr = rnd(11);
    for (let i = 0; i < 16; i++){ const a = rr() * 6.28, d = rr() * .8; const tx = 118 + Math.cos(a) * 62 * d, ty = 650 + Math.sin(a) * 38 * d; if (Math.abs(tx - 118) < 18 && ty < 646) continue; f += tf(bumpy(tx, ty - 10, 12, 10, 9, i + 1), "avIA", "#22602A", 2.5, 2); }
    f += `<rect x="113" y="604" width="10" height="20" fill="url(#avTrunk)" stroke="${TD}" stroke-width="2"/>` + tf(bumpy(118, 594, 26, 18, 10, 4), "avIA", "#1C4A2A", 3, 2.4) + `<circle cx="112" cy="592" r="3" fill="#E8C8FF" class="av-pulse"/><circle cx="124" cy="592" r="3" fill="#E8C8FF" class="av-pulse"/>`;
    f += `<path d="M150 668 l10 -12 l10 12z" fill="#7A4A26" stroke="${TD}" stroke-width="2"/><rect x="152" y="668" width="16" height="10" fill="#C88A50" stroke="${TD}" stroke-width="2"/>`;
    f += `<g class="av-bob"><circle cx="86" cy="654" r="8" fill="url(#avGlowP)"/></g>`;
    s += isl(118, 650, 86, 58, 3, "avIA", "#22602A", f, "La Forêt des Anciens", `${w1.done.filter(Boolean).length}/7 niveaux · ${worldStars(1)} ★ · ${pct(1)} %`, true, 1);
    let d2 = `<path d="M262 528 L292 476 L322 528Z" fill="#F2C060" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/><path d="M292 476 L322 528 L300 528Z" fill="#C88A3A" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/>`;
    d2 += `<ellipse cx="248" cy="540" rx="16" ry="6" fill="#4FC0E8" stroke="${TD}" stroke-width="2"/><path d="M340 540 q2 -16 -2 -26 M338 514 q-10 -4 -16 2 M338 514 q10 -6 16 0 M338 514 q-2 -10 -10 -12 M338 514 q4 -10 12 -10" stroke="#2E8A3A" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
    const sub = w => worldOpen(w) && built(w) ? `${WS(w).done.filter(Boolean).length}/7 niveaux · ${worldStars(w)} ★ · ${pct(w)} %` : WS(w - 1).done[6] ? "Bientôt disponible" : `Bats ${(WORLDS[w - 2].boss || "le boss précédent").replace(/^Le /, "le ").replace(/^La /, "la ")}`;
    const on = w => worldOpen(w) && built(w);
    s += isl(292, 520, 78, 52, 8, "avID", "#9A6A2A", d2, "Le Désert des Rois", sub(2), on(2), 2);
    let a3 = `<ellipse cx="112" cy="390" rx="46" ry="28" fill="url(#avIB)" stroke="${TD}" stroke-width="2.4"/><g class="av-spin"><path d="M112 390 m-30 0 a30 18 0 1 1 60 0 M112 390 m-18 0 a18 10 0 1 1 36 0" stroke="#BFF4FF" stroke-width="2.4" fill="none" opacity=".8"/></g><path d="M100 392 Q112 370 124 392Z" fill="#9AF8FF" stroke="${TD}" stroke-width="2"/><circle cx="112" cy="378" r="14" fill="url(#avIW)" class="av-pulse"/>`;
    s += isl(112, 392, 80, 50, 13, "avIS", "#B8904A", a3, "Le Royaume des Abysses", sub(3), on(3), 3);
    let i4 = `<path d="M252 270 L272 228 L292 270Z M282 270 L306 216 L330 270Z" fill="#FFFFFF" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/><path d="M296 238 L306 216 L316 238 L306 232Z" fill="#CDEBFF"/><rect x="316" y="248" width="10" height="24" fill="#B8E0FF" stroke="${TD}" stroke-width="2"/><path d="M314 248 l7 -14 l7 14z" fill="#7AB8F0" stroke="${TD}" stroke-width="2"/>`;
    s += isl(292, 262, 78, 50, 21, "avII", "#6A9AC8", i4, "Le Royaume de Glace", sub(4), on(4), 4);
    let c5 = `<circle cx="150" cy="96" r="40" fill="url(#avIL)" opacity=".5" class="av-lava"/><path d="M118 132 L140 86 L160 86 L182 132Z" fill="#4A2A3A" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/><path d="M140 86 L160 86 L156 96 Q150 90 144 96Z" fill="#FF6A2A" stroke="${TD}" stroke-width="2" class="av-lava"/><path d="M146 94 Q144 112 136 128 M156 96 Q160 112 168 126" stroke="#FF6A2A" stroke-width="3" fill="none" class="av-lava"/><circle cx="150" cy="70" r="9" fill="#5A4A5A" opacity=".7" class="av-fog"/><circle cx="160" cy="58" r="7" fill="#5A4A5A" opacity=".6" class="av-fog"/>`;
    s += isl(150, 120, 84, 50, 31, "avIC", "#140A1A", c5, "Les Terres Maudites", sub(5), on(5), 5);
    return `<svg viewBox="0 0 400 800" class="av-isl-svg">${s}</svg>`;
  }

  /* ===================== Carte de la Forêt ===================== */
  const NODES = [[205, 1405], [98, 1270], [282, 1042], [108, 860], [288, 690], [118, 505], [200, 300]];
  const TAV = [318, 1360];
  let MAP_BASE = null; const MAPS = {};
  function mapBase(){
    if (MAP_BASE) return MAP_BASE;
    const W = 400, H = 1580, start = [200, 1520], pts = [start, ...NODES], P = sample(pts, 30);
    const riverPts = [[430, 1090], [320, 1112], [210, 1160], [110, 1168], [-30, 1210]], RV = sample(riverPts, 30);
    const STRUCT = [[318, 1340, 74], [40, 1250, 52], [180, 1222, 50], [34, 1390, 48], [200, 815, 52], [30, 900, 26], [352, 655, 76], [242, 515, 80], [200, 160, 175], [200, 1500, 52], [370, 1010, 46]];
    const BUSHES = [[40, 1072, 1], [364, 560, 2], [36, 690, 3]];
    let s = `<defs>${forestDefs()}${lg("avMeadow", "#3F7A3E", "#8ED86A")}${rg("avMist", "#C8A0FF", "#7A40C8")}</defs>`;
    s += `<rect width="${W}" height="${H}" fill="url(#avMeadow)"/><rect width="${W}" height="420" fill="#1E3A2A" opacity=".55"/>`;
    const r = rnd(42);
    for (let i = 0; i < 46; i++){ const x = r() * W, y = 380 + r() * (H - 380); s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(30 + r() * 50).toFixed(0)}" ry="${(10 + r() * 16).toFixed(0)}" fill="${r() < .5 ? "#A8E880" : "#5AA848"}" opacity=".35"/>`; }
    for (let i = 0; i < 90; i++){ const x = r() * W, y = 420 + r() * (H - 440); if (near([x, y], P) < 30 || near([x, y], RV) < 40) continue; s += flower(x.toFixed(0), y.toFixed(0), ["#FF8AC0", "#FFE07A", "#FFFFFF", "#C8A0FF"][i % 4]); }
    const rd = smooth(riverPts, false);
    s += `<path d="${rd}" stroke="${TD}" stroke-width="60" fill="none" stroke-linecap="round"/><path d="${rd}" stroke="#2E9AD8" stroke-width="53" fill="none"/><path d="${rd}" stroke="#5AC4F0" stroke-width="36" fill="none"/>`;
    s += `<path class="av-flow" d="${rd}" stroke="#E8FAFF" stroke-width="3" stroke-dasharray="10 30" fill="none" opacity=".8" transform="translate(0 -9)"/><path class="av-flow" d="${rd}" stroke="#E8FAFF" stroke-width="2.4" stroke-dasharray="6 34" fill="none" opacity=".6" transform="translate(0 10)" style="animation-duration:1.6s"/>`;
    s += tf(blob(378, 1012, 44, 58, 9, 9, .14), "avRock", "#4A4440", 5, 2.8) + `<path d="${bumpy(372, 960, 40, 12, 5, 6)}" fill="#5AB04A" stroke="${TD}" stroke-width="2.2"/>`;
    s += `<path d="M356 966 Q352 1040 344 1092 L384 1092 Q384 1040 390 966Z" fill="#7FD8FF" stroke="${TD}" stroke-width="2.6"/><path class="av-fall" d="M362 970 L356 1090 M372 970 L370 1090 M382 970 L380 1090" stroke="#fff" stroke-width="3" stroke-dasharray="12 18" opacity=".85"/>`;
    s += [[350, 1096], [364, 1104], [380, 1094], [338, 1104]].map(([x, y], i) => `<circle class="av-pulse" style="animation-delay:-${i * .3}s" cx="${x}" cy="${y}" r="${7 + i % 2 * 3}" fill="#fff" opacity=".85"/>`).join("");
    const pd = smooth(pts, false), td = smooth([NODES[0], [262, 1392], [TAV[0], TAV[1] + 6]], false);
    s += `<path d="${td}" stroke="${TD}" stroke-width="24" fill="none" stroke-linecap="round"/><path d="${td}" stroke="#E2BE7A" stroke-width="17" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round" transform="translate(0 4)"/><path d="${pd}" stroke="${TD}" stroke-width="38" fill="none" stroke-linecap="round"/><path d="${pd}" stroke="#C99A5A" stroke-width="31" fill="none" stroke-linecap="round" transform="translate(0 3)"/><path d="${pd}" stroke="#F0D296" stroke-width="27" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${pd}" stroke="#FFF0C8" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="2 22" transform="translate(-5 -3)"/>`;
    let bi = 0, bd = 1e9; P.forEach((p, i) => { const d = near(p, RV); if (d < bd) { bd = d; bi = i; } });
    const bp = P[bi], bq = P[Math.min(P.length - 1, bi + 2)], ang = Math.atan2(bq[1] - bp[1], bq[0] - bp[0]) * 180 / Math.PI;
    s += `<g transform="translate(${bp[0].toFixed(1)} ${bp[1].toFixed(1)}) rotate(${ang.toFixed(1)})"><rect x="-52" y="-22" width="104" height="44" rx="6" fill="#3A2010" opacity=".35" transform="translate(0 6)"/>`
      + Array.from({length:9}, (_, i) => `<rect x="${-48 + i * 10.8}" y="-20" width="10" height="40" rx="2" fill="url(#avWood)" stroke="${TD}" stroke-width="2"/>`).join("")
      + `<rect x="-54" y="-25" width="108" height="6" rx="3" fill="#8A5A30" stroke="${TD}" stroke-width="2"/><rect x="-54" y="19" width="108" height="6" rx="3" fill="#8A5A30" stroke="${TD}" stroke-width="2"/></g>`;
    const items = [];
    items.push([1342, taverne(...TAV)], [1250, hut(40, 1250, .95, 1)], [1222, hut(180, 1222, .85, 2)], [1392, hut(34, 1392, .8, 3)]);
    items.push([830, arch(200, 830)], [905, column(30, 905, 50, true)], [800, column(350, 790, 44, false)], [770, column(56, 772, 38, true, .9)]);
    items.push([690, cave(352, 690)], [530, sanctuary(242, 530)], [300, bossTree(200, 250)], [1520, campfire(150, 1530)]);
    BUSHES.forEach(([x, y, k]) => items.push([y, bush(x, y, 1.15, k * 7)]));
    const rt = rnd(1234);
    for (let y = 30; y < H - 10; y += 27) for (let x = -10; x < W + 20; x += 31){
      const px = x + (rt() - .5) * 20 + (Math.floor(y / 27) % 2) * 15, py = y + (rt() - .5) * 14, pt = [px, py];
      const edge = Math.min(px, W - px) < 70, top = py < 440;
      if (rt() < (edge || top ? .1 : .58)) continue;
      if (near(pt, P) < 46 || near(pt, RV) < 50 || dist(pt, [262, 1392]) < 30) continue;
      if (STRUCT.some(([sx, sy, sr]) => dist(pt, [sx, sy]) < sr)) continue;
      if (BUSHES.some(([cx, cy]) => dist(pt, [cx, cy]) < 32)) continue;
      const s0 = (edge || top ? 1.05 : .85) + rt() * .35, k = rt();
      const kind = top ? (k < .5 ? "pine" : 2) : k < .18 ? "pine" : k < .26 ? 3 : k < .6 ? 0 : k < .85 ? 1 : 2;
      items.push([py, (k > .93 && !top ? mush(+px.toFixed(1), +py.toFixed(1), 1.1) : tree(+px.toFixed(1), +py.toFixed(1), s0, kind, Math.floor(rt() * 1e4)))]);
    }
    items.sort((a, b) => a[0] - b[0]).forEach(it => s += it[1]);
    s += `<ellipse class="av-fog" cx="120" cy="330" rx="120" ry="30" fill="url(#avMist)" opacity=".35"/><ellipse class="av-fog" style="animation-delay:-3s" cx="300" cy="360" rx="110" ry="26" fill="url(#avMist)" opacity=".3"/>`;
    const rf = rnd(77); let ff = "";
    for (let i = 0; i < 46; i++){ const x = (rf() * W).toFixed(0), y = (300 + rf() * (H - 320)).toFixed(0); ff += `<g class="av-ff" style="animation-delay:-${(rf() * 4).toFixed(1)}s;animation-duration:${(3 + rf() * 3).toFixed(1)}s"><circle cx="${x}" cy="${y}" r="7" fill="url(#avGlowY)" opacity=".7"/><circle cx="${x}" cy="${y}" r="1.8" fill="#FFFBD0"/></g>`; }
    MAP_BASE = {bg:s, top:ff + [[-40, 520], [60, 980], [-20, 1300]].map(([x, y]) => `<path d="M${x} ${y - 300} L${x + 70} ${y - 300} L${x + 260} ${y + 200} L${x + 150} ${y + 200}Z" fill="#FFF6C8" opacity=".07"/>`).join("")};
    return MAP_BASE;
  }
  function node(i, [x, y]){
    const L = WD().levels[i], W = WS(cw), st = W.st[i], done = !!W.done[i], cur = i === curLevel(cw) && !done, lock = !unlocked(cw, i), boss = L.mode === "boss", R = boss ? 31 : 24;
    const [a, b, dk] = lock ? ["#A8A4BC", "#6A6680", "#3A3650"] : boss ? ["#D8A0FF", "#7A2AB8", "#3A1060"] : cur ? ["#FF9ACA", "#FF4F9A", "#A01A5A"] : ["#FFE88A", "#F0A21A", "#9A5A10"];
    const id = "avNd" + cw + "_" + i;
    let g = `<g class="av-node" data-adv="node" data-v="${i}" role="button" aria-label="Niveau ${i + 1} : ${L.n}${lock ? " (verrouillé)" : ""}"><defs>${lg(id, a, b)}</defs>`;
    if (cur) g += `<circle class="av-ring" cx="${x}" cy="${y}" r="${R + 4}" fill="none" stroke="#FFD23F" stroke-width="4"/>`;
    g += `<ellipse cx="${x}" cy="${y + R * .55}" rx="${R + 6}" ry="${R * .45}" fill="rgba(20,30,10,.35)"/>`;
    g += `<circle cx="${x}" cy="${y + 5}" r="${R}" fill="${dk}" stroke="${TD}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${R}" fill="url(#${id})" stroke="${TD}" stroke-width="3"/>`;
    g += `<circle cx="${x}" cy="${y}" r="${R - 7}" fill="none" stroke="#fff" stroke-width="2" opacity=".35"/><path d="M${x - R * .6} ${y - R * .35} Q${x - R * .4} ${y - R * .75} ${x} ${y - R * .78}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
    if (boss) g += `<g transform="translate(${x} ${y + 1})"><path d="M-13 -2 Q-13 -16 0 -16 Q13 -16 13 -2 Q13 5 8 7 L8 12 L-8 12 L-8 7 Q-13 5 -13 -2Z" fill="#F4ECFF" stroke="${TD}" stroke-width="2.4"/><circle cx="-5" cy="-3" r="3.6" fill="${TD}"/><circle cx="5" cy="-3" r="3.6" fill="${TD}"/><path d="M-3 12 V8 M0 12 V8 M3 12 V8" stroke="${TD}" stroke-width="1.6"/></g>`;
    else g += `<text x="${x}" y="${y + 7.5}" text-anchor="middle" style="font:800 21px var(--f-display)" fill="#fff" stroke="${TD}" stroke-width="4.5" paint-order="stroke">${i + 1}</text>`;
    if (lock) g += `<g transform="translate(${x + R * .72} ${y + R * .6})"><circle r="10" fill="#4A4466" stroke="${TD}" stroke-width="2.2"/><rect x="-4.6" y="-1.6" width="9.2" height="7" rx="1.6" fill="#FFD23F"/><path d="M-2.8 -1.6 V-4 a2.8 2.8 0 0 1 5.6 0 V-1.6" stroke="#FFD23F" stroke-width="1.8" fill="none"/></g>`;
    if (L.mode === "chrono" || L.mode === "surv") {
      const ic = L.mode === "chrono" ? `<circle r="5.6" fill="#fff" stroke="${TD}" stroke-width="1.6"/><path d="M0 -3.4 V0 L2.4 1.6" stroke="${TD}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` : `<path d="M0 5 C-8 -1 -5 -7 0 -3.2 C5 -7 8 -1 0 5Z" fill="#fff" stroke="${TD}" stroke-width="1.5"/>`;
      g += `<g transform="translate(${x - R * .78} ${y - R * .68})"><circle r="11" fill="${L.mode === "chrono" ? "#2A7AD8" : "#E2283A"}" stroke="${TD}" stroke-width="2.4"/>${ic}</g>`;
    }
    if (done || cur) for (let k = 0; k < 3; k++){ const sx = x + (k - 1) * 15, sy = y - R - 9 + (k === 1 ? -4 : 0); g += `<path d="${starP(sx, sy, 7.5)}" fill="${st >> k & 1 ? "#FFD23F" : "#E6DCC4"}" stroke="${TD}" stroke-width="2" stroke-linejoin="round"/>`; }
    return g + `</g>`;
  }
  function mapSVG(){
    const MAPS_ = MAPS[cw] || (MAPS[cw] = WD().mapDraw()), B = MAPS_, N = WD().nodes, c = N[curLevel(cw)], p = pet();
    const hero = `<g class="av-bob" style="pointer-events:none">${nest(meSVG(62), c[0] - 46, c[1] - 92)}${p ? nest(creatureSVG(p, 32), c[0] + 6, c[1] - 56) : ""}</g>`;
    return `<svg viewBox="0 0 400 ${WD().h || 1580}" class="av-map-svg">${B.bg}${N.map((p, i) => node(i, p)).join("")}${hero}<g style="pointer-events:none">${B.top}</g></svg>`;
  }

  /* --- Bouton rouge « Continuer la quête » : lance directement le prochain niveau à faire --- */
  function nextStep(){
    const w = scr === "map" ? cw : [5, 4, 3, 2, 1].find(x => built(x) && worldOpen(x)) || 1;
    const W = WS(w), i = W.done.findIndex(x => !x);
    return i < 0 ? null : {w, i};
  }
  function contBtn(){
    const n = nextStep(); if (!n) return "";
    const L = WORLDS[n.w - 1].levels[n.i];
    return `<div class="av-cont"><button class="av-contb" data-adv="cont"><span class="av-cplay">▶</span><span><b>Continuer la quête</b><small>${scr === "isl" ? `Monde ${n.w} · ` : ""}Niveau ${n.i + 1} · ${esc(L.n)}</small></span></button></div>`;
  }

  /* ===================== Tableau de quêtes ===================== */
  // Les mêmes 10 quêtes dans chaque monde (3 principales, 7 secondaires), avec les noms du monde. Récompenses : pièces ou potions.
  // Potions : par le serveur quand le joueur est connecté (EV_DATA.ADVQ, une seule fois), sinon sur l'appareil.
  const QT = [
    {k:"main", g:(W) => W.done[2] ? 1 : 0, n:1, d:(w) => `Réussir le niveau 3 · ${WORLDS[w - 1].levels[2].n}`, rw:{c:50}},
    {k:"main", g:(W) => W.done[5] ? 1 : 0, n:1, d:(w) => `Réussir le niveau 6 · ${WORLDS[w - 1].levels[5].n}`, rw:{c:80}},
    {k:"main", id:"boss", g:(W) => W.done[6] ? 1 : 0, n:1, d:(w) => `Vaincre ${WORLDS[w - 1].boss.replace(/^Le /, "le ").replace(/^La /, "la ").replace(/^Les /, "les ")}`, rw:{p:"xp"}},
    {k:"sec", g:(W, w) => worldStars(w), n:10, d:() => "Gagner 10 étoiles dans ce monde", rw:{c:60}},
    {k:"sec", id:"stars", g:(W, w) => worldStars(w), n:21, d:() => "Gagner les 21 étoiles du monde", rw:{p:"coin"}},
    {k:"sec", g:(W) => W.ok || 0, n:60, d:() => "Donner 60 bonnes réponses dans ce monde", rw:{c:60}},
    {k:"sec", g:(W) => W.kills || 0, n:30, d:() => "Vaincre 30 monstres", rw:{c:60}},
    {k:"sec", g:(W) => W.perfect ? 1 : 0, n:1, d:() => "Faire 10/10 à un niveau classique", rw:{c:80}},
    {k:"sec", id:"chrono", g:(W, w) => W.best[WORLDS[w - 1].levels.findIndex(l => l.mode === "chrono")] || 0, n:12, d:() => "12 bonnes réponses au niveau Chrono", rw:{p:"fifty"}},
    {k:"sec", g:(W) => W.surv3 ? 1 : 0, n:1, d:() => "Réussir la Survie sans perdre de vie", rw:{c:80}}
  ];
  function questsOf(w){
    const D = WORLDS[w - 1], W = WS(w); W.q = W.q || {};
    return QT.map((t, i) => { const id = `${D.qp}_${t.id || i}`, v = Math.min(t.n, t.g(W, w));
      return {id, k:t.k, t:D.qn[i], d:t.d(w), v, n:t.n, rw:t.rw, done:v >= t.n, claimed:!!W.q[id]}; });
  }
  const questsOpen = () => !!WS(1).done[3];
  const claimable = w => questsOf(w).filter(q => q.done && !q.claimed).length;
  function questBtn(){
    const n = questsOpen() ? claimable(cw) : 0;
    return `<button class="av-rb wood av-qbtn" data-adv="quests" aria-label="Tableau de quêtes">📜${n ? `<i>${n}</i>` : !questsOpen() ? `<i class="lk">🔒</i>` : ""}</button>`;
  }
  const rwHTML = rw => rw.c ? `<span class="coin"></span>${rw.c} pièces` : typeof Potions !== "undefined" ? `${Potions.svg(rw.p, 20)}${esc(Potions.T[rw.p].n)}` : "Potion";
  function questsView(){
    const Q2 = questsOf(cw), sec = (k, t) => `<div class="av-qsec"><span>${t}</span></div><div class="av-qgrid">${Q2.filter(q => q.k === k).map((q, i) => `
      <div class="av-qp ${q.claimed ? "claimed" : q.done ? "ready" : q.v ? "prog" : ""}" style="--rot:${[-1.6, 1.2, -.6, 1.8][i % 4]}deg">
        <i class="av-pin"></i><b>${esc(q.t)}</b><span class="av-qd">${esc(q.d)}</span>
        ${q.n > 1 ? `<div class="av-qbar"><i style="width:${q.v / q.n * 100}%"></i></div><span class="av-qn">${q.v} / ${q.n}</span>` : ""}
        <span class="av-qrw">${rwHTML(q.rw)}</span>
        ${q.claimed ? `<span class="av-stamp">Terminée</span>` : q.done ? `<button class="av-btn green" data-adv="claim" data-v="${q.id}">Récupérer</button>` : `<span class="av-qst">${q.v ? "En cours" : "Disponible"}</span>`}
      </div>`).join("")}</div>`;
    return `<div class="av-scr av-w${cw}">
      <div class="av-top"><button class="av-rb wood" data-adv="qmap" aria-label="Retour à la carte">←</button>
        <div class="av-t"><b>Tableau de quêtes</b><span>${WD().n} · ${Q2.filter(q => q.claimed).length}/10 terminées</span></div></div>
      <div class="av-scroll"><div class="av-qboard">${sec("main", "Quêtes principales")}${sec("sec", "Quêtes secondaires")}</div></div></div>`;
  }
  let claiming = false;
  async function claim(id){
    const q = questsOf(cw).find(x => x.id === id); if (!q || !q.done || q.claimed || claiming) return;
    const t = q.rw.p, swap = (typeof EV_DATA !== "undefined" && EV_DATA.ADVQ_SWAP) || 100;
    if (q.rw.c) { S.coins += q.rw.c; toasts.push(`<b>Quête terminée</b> · +${q.rw.c} pièces`); }
    else if (typeof Evenements !== "undefined" && Evenements.live()) {
      // Potion donnée par le serveur : la quête n'est marquée qu'une fois la réponse reçue (rien n'est perdu si le réseau coupe)
      claiming = true; let r = null; try { r = await Evenements.adv(id); } catch(e){} claiming = false;
      if (!r) { toasts.push("<b>Quête</b> · Le serveur ne répond pas, réessaie dans un moment."); return render(); }
    }
    else if (typeof Potions !== "undefined" && Potions.give(t)) toasts.push(`<b>Quête terminée</b> · ${Potions.T[t].n}`);
    else { S.coins += swap; toasts.push(`<b>Quête terminée</b> · +${swap} pièces (tu avais déjà cette potion)`); }
    WS(cw).q[id] = today();
    try { Music.sfx("level"); } catch(e){}
    save(); render();
  }

  /* ===================== Vue de l'onglet ===================== */
  let scr = "isl", sheet = -1, lastScroll = null, rankOpen = false;
  const starIco = `<svg class="av-star-i" viewBox="0 0 20 20" aria-hidden="true"><path d="${starP(10, 10.6, 9)}" fill="#FFD23F" stroke="${TD}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  function view(){
    init();
    if (scr === "quests") return questsView();
    if (scr === "map") return `<div class="av-scr av-w${cw}">
      <div class="av-top"><button class="av-rb wood" data-adv="isl" aria-label="Retour aux îles">←</button>
        <div class="av-t"><b>${WD().n}</b><span>Monde ${cw} · complété à ${pct(cw)} %</span></div>
        <span class="av-chip">${starIco}<b>${worldStars(cw)}</b>/21</span>
        ${questBtn()}
        <button class="av-rb wood" data-adv="music" aria-label="Musique">${S.settings.music ? "♪" : "🔇"}</button></div>
      <div class="av-scroll" id="av-scroll">${mapSVG()}</div>
      ${sheet >= 0 ? sheetHTML(sheet) : contBtn()}</div>`;
    return `<div class="av-scr av-sea">
      <div class="av-itop"><h1>Aventure</h1><span class="av-chip">${starIco}<b>${totalStars()}</b>/105</span><button class="av-rb wood" data-adv="rank" aria-label="Classement des amis">🏆</button></div>
      <div class="av-scroll">${islandsSVG()}</div>${rankOpen ? rankHTML() : contBtn()}</div>`;
  }
  function sheetHTML(i){
    const L = WD().levels[i], W = WS(cw), st = W.st[i], lock = !unlocked(cw, i), boss = L.mode === "boss";
    const art = boss ? `<span style="width:72px">${WD().bossSVG(1)}</span>` : monSVG(L.mons[0], 64);
    const reward = W.done[i] ? "Récompense du niveau déjà reçue" : `${boss ? BOSS_COINS[cw] : LV_COINS[cw]} pièces la 1re fois`;
    return `<div class="av-sheet"><div class="av-sheet-in"><button class="av-x" data-adv="close" aria-label="Fermer">✕</button><div class="av-parch">
      <div class="av-ribbon ${boss ? "boss" : ""}">${boss ? "NIVEAU 7 · BOSS" : "NIVEAU " + (i + 1)}</div>
      <div class="av-sh-h"><div class="av-art ${boss ? "boss" : ""}">${art}</div><div><h2>${L.n}</h2>
        <div class="av-chips"><span class="av-chip mode ${L.mode}">${MODE_N[L.mode]}</span><span class="av-chip">${DIFF_N[L.diff]} ${"●".repeat(L.diff)}${"○".repeat(3 - L.diff)}</span></div></div></div>
      ${lock ? `<p class="av-lockmsg">🔒 Termine le niveau ${i} pour ouvrir celui-ci.</p>` : ""}
      <div class="av-objs">${objectives(L).map((o, k) => `<div class="av-obj ${st >> k & 1 ? "got" : ""}">${starSVG(st >> k & 1, 20)}<span>${o}</span></div>`).join("")}</div>
      ${boss ? `<div class="av-mons">${WD().boss} · 3 phases · il change de forme à 66 % et 33 % de sa vie</div>` : `<div class="av-mons">Monstres :</div><div class="av-chips">${[...new Set(L.mons)].map(m => `<span class="av-chip mon">${monSVG(m, 24)}${MON_N[m]}</span>`).join("")}</div>`}
      <div class="av-foot"><div class="av-rw"><span>Meilleur : <b>${W.done[i] ? (L.mode === "boss" ? `${W.best[i]} vie${W.best[i] > 1 ? "s" : ""} restante${W.best[i] > 1 ? "s" : ""}` : W.best[i] + (L.mode === "chrono" ? " bonnes réponses" : L.mode === "surv" ? "/15" : "/10")) : "—"}</b></span><span><span class="coin"></span>${reward} · +${STAR_COINS} par étoile</span></div>
        <button class="av-play" data-adv="play" data-v="${i}" ${lock ? "disabled" : ""}>${W.done[i] ? "Rejouer" : "Jouer"}</button></div>
    </div></div></div>`;
  }
  function after(){
    document.body.classList.add("in-adv");
    const sc = document.getElementById("av-scroll");
    if (sc && scr === "map") {
      const k = sc.clientWidth / 400;
      sc.scrollTop = lastScroll !== null ? lastScroll : WD().nodes[curLevel(cw)][1] * k - sc.clientHeight * .6;
      sc.onscroll = () => { lastScroll = sc.scrollTop; };
    }
  }
  function leave(){ document.body.classList.remove("in-adv"); }
  function click(b){
    const a = b.dataset.adv, v = b.dataset.v;
    if (a === "world") {
      const w = +v;
      if (worldOpen(w) && built(w)) { cw = w; scr = "map"; sheet = -1; lastScroll = null; try { Music.sfx("tab3"); } catch(e){} return render(); }
      toasts.push(!built(w) && WS(w - 1).done[6] ? `<b>${WORLDS[w - 1].n}</b> · Ce monde arrive bientôt !` : `<b>🔒 ${WORLDS[w - 1].n}</b> · Bats le boss du monde précédent pour ouvrir cette île.`);
      return render();
    }
    if (a === "isl") { scr = "isl"; sheet = -1; return render(); }
    if (a === "rank") { rankOpen = !rankOpen; return render(); }
    if (a === "node") { sheet = +v; try { Music.sfx("tap"); } catch(e){} return render(); }
    if (a === "close") { sheet = -1; return render(); }
    if (a === "play") { const i = +v; if (!unlocked(cw, i)) return; sheet = -1; return start(cw, i); }
    if (a === "cont") { const n = nextStep(); if (!n) return; cw = n.w; scr = "map"; sheet = -1; lastScroll = null; return start(n.w, n.i); }
    if (a === "quests") { if (!questsOpen()) { toasts.push("<b>📜 Tableau de quêtes</b> · Il s'ouvre quand tu as réussi le niveau 4 de la Forêt."); return render(); } scr = "quests"; return render(); }
    if (a === "qmap") { scr = "map"; return render(); }
    if (a === "claim") return claim(v);
    if (a === "casino") return Casino.open();
    if (a === "music") { S.settings.music = !S.settings.music; save(); try { S.settings.music ? Music.start() : Music.stop(); } catch(e){} return render(); }
    if (a) return fightClick(a, b);
  }

  /* --- Musique de chaque monde (musique_fichiers.js) : la Forêt sur les îles, puis celle du monde ouvert ; rien dans le Casino --- */
  const track = () => typeof Casino !== "undefined" && Casino.isOpen() ? null : [`musique/monde${scr === "isl" ? 1 : cw}.mp3`];

  /* ===================== Combat ===================== */
  let F = null, layer = null, qtimer = null;
  const playing = () => !!(F && !F.over) || !!document.querySelector(".av-sail");
  function start(w, i){
    const L = WORLDS[w - 1].levels[i];
    const n = L.mode === "c" ? 10 : L.mode === "surv" ? 15 : L.mode === "boss" ? 10 : 80;
    const list = makeList(L, n);
    let mons;
    if (L.mode === "c") mons = L.mons.map((k, j) => ({k, hp:j === 3 ? 4 : 2, max:j === 3 ? 4 : 2, chief:j === 3}));
    else if (L.mode === "surv") mons = Array.from({length:5}, (_, j) => { const k = L.mons[j % L.mons.length]; return {k, hp:3, max:3, chief:j === 4}; });
    else if (L.mode === "chrono") mons = Array.from({length:80}, (_, j) => ({k:L.mons[j % L.mons.length], hp:1, max:1}));
    else mons = [{k:"boss", hp:100, max:100}];
    F = {w, i, L, mode:L.mode, list, n:0, ok:0, ko:0, streak:0, best:0, first5:true, hardOk:0, fast:true, lives:3, mons, m:0, phase:1, t0:0, ends:0, lock:false, over:false};
    if (typeof Quetes !== "undefined" && Quetes.newRun) Quetes.newRun();
    if (!layer) { layer = document.createElement("div"); layer.id = "av-fight"; document.body.appendChild(layer);
      layer.addEventListener("click", e => { const b = e.target.closest("[data-adv],[data-ans]"); if (!b) return; if (b.dataset.ans !== undefined) return choose(+b.dataset.ans); click(b); }); }
    layer.hidden = false; document.body.classList.add("in-adv-fight");
    paintScene();
    if (F.mode === "chrono") F.ends = Date.now() + 60000;
    try { Music.sfx("tab2"); } catch(e){}
    if (isBoss()) return bossIntro(() => { if (F && !F.over) nextQ(); });
    nextQ();
  }
  // Écran « BOSS » : nom, portrait et points de vie, puis le combat commence
  function bossIntro(done){
    const D = WORLDS[F.w - 1], el = document.createElement("div"); el.className = "af-intro";
    el.innerHTML = `<div class="af-intro-in"><span class="af-intro-k">BOSS · Monde ${F.w}</span><div class="af-intro-art">${D.bossSVG(1)}</div>
      <b class="af-intro-n">${esc(D.boss)}</b><span class="af-intro-hp">100 PV · 3 phases · 3 vies pour toi</span></div>`;
    document.getElementById("af-arena").appendChild(el);
    try { Music.sfx("level"); navigator.vibrate && navigator.vibrate([60, 40, 120]); } catch(e){}
    setTimeout(() => { el.classList.add("out"); setTimeout(() => { el.remove(); done(); }, 380); }, 2100);
  }
  const isBoss = () => F.mode === "boss";
  function arenaBG(boss){
    let s = `<defs>${forestDefs()}${lg("avSky", boss ? "#2A1A4A" : "#3E8A5A", boss ? "#7A5AA8" : "#C8F0A0")}</defs><rect width="400" height="300" fill="url(#avSky)"/><circle cx="300" cy="40" r="120" fill="url(#avSun)" opacity="${boss ? .2 : .55}"/>`;
    const r = rnd(boss ? 19 : 9);
    s += `<path d="M0 170 ${Array.from({length:12}, (_, i) => `Q${i * 36 + 18} ${(120 + r() * 30).toFixed(0)} ${(i + 1) * 36} 165`).join(" ")} L400 300 L0 300Z" fill="${boss ? "#1E2A3A" : "#2E6A3E"}"/>`;
    for (let i = 0; i < 9; i++) s += tree(+(i * 50 + r() * 20).toFixed(0), +(200 + r() * 10).toFixed(0), 1.1 + r() * .3, i % 3 === 0 ? "pine" : 2, i + 3);
    s += `<path d="M0 205 Q200 185 400 205 L400 300 L0 300Z" fill="${boss ? "#3A6A3A" : "#5AAA4A"}" stroke="${TD}" stroke-width="3"/><path d="M0 214 Q200 196 400 214" stroke="#8ED86A" stroke-width="5" fill="none" opacity=".6"/>`;
    s += `<ellipse cx="200" cy="262" rx="190" ry="34" fill="${boss ? "#5A8A4A" : "#7FCB5A"}" stroke="${TD}" stroke-width="3"/><ellipse cx="200" cy="258" rx="170" ry="24" fill="#9BE070" opacity="${boss ? .3 : .6}"/>`;
    for (let i = 0; i < 18; i++) s += flower((20 + r() * 360).toFixed(0), (236 + r() * 50).toFixed(0), ["#FF8AC0", "#FFE07A", "#fff"][i % 3]);
    if (boss) s += `<ellipse class="av-fog" cx="100" cy="200" rx="140" ry="26" fill="#B080F0" opacity=".25"/><ellipse class="av-fog" style="animation-delay:-3s" cx="300" cy="215" rx="130" ry="22" fill="#B080F0" opacity=".22"/>`;
    s += [20, 140, 260].map(x => `<path d="M${x} 0 L${x + 50} 0 L${x + 140} 300 L${x + 80} 300Z" fill="#FFF6C8" opacity="${boss ? .04 : .09}"/>`).join("");
    for (let i = 0; i < 12; i++) s += `<g class="av-ff" style="animation-delay:-${(r() * 4).toFixed(1)}s"><circle cx="${(r() * 400).toFixed(0)}" cy="${(60 + r() * 160).toFixed(0)}" r="5" fill="url(#${boss ? "avGlowP" : "avGlowY"})"/></g>`;
    return `<svg class="af-bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">${s}</svg>`;
  }
  const hearts = () => `<span class="af-lives" id="af-lives">${[0, 1, 2].map(k => `<i class="${k < F.lives ? "" : "lost"}"></i>`).join("")}</span>`;
  function paintScene(){
    const L = F.L, p = pet(), boss = isBoss();
    const sub = boss ? `Boss · ${WORLDS[F.w - 1].boss}` : MODE_N[F.mode];
    layer.innerHTML = `<div class="af w${F.w} ${boss ? "boss" : ""}">
      <div class="af-top"><button class="av-rb wood" data-adv="quit" aria-label="Quitter le combat">✕</button>
        <div class="av-t"><b>${boss ? "Niveau 7" : "Niveau " + (F.i + 1)} · ${L.n}</b><span>${sub}</span></div>
        ${F.mode === "surv" || boss ? hearts() : ""}<span class="av-chip">✓ <b id="af-ok">0</b></span></div>
      <div class="af-arena" id="af-arena">${WORLDS[F.w - 1].arena(boss)}
        ${boss ? `<div class="af-bosshp"><div class="n"><b>${WORLDS[F.w - 1].boss}</b><span id="af-phase">Phase 1</span></div><div class="bar"><i id="af-bar" style="width:100%"></i><em style="left:33%"></em><em style="left:66%"></em></div></div>`
          : `<div class="af-waves" id="af-waves"></div><div class="af-hp"><div class="n"><span id="af-mname"></span><span id="af-mhp"></span></div><div class="bar"><i id="af-bar"></i></div></div>`}
        <div class="af-hero" id="af-hero">${fluid(meSVG(200))}${p ? `<div class="af-pet">${fluid(creatureSVG(p, 100))}</div>` : ""}</div>
        <div class="af-mon ${boss ? "boss" : ""}" id="af-mon"></div>
        <svg class="af-slash" id="af-slash" viewBox="0 0 100 100"><path d="M10 85 Q50 50 92 12" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M14 92 Q55 58 96 24" stroke="#FFD23F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M4 70 Q40 44 80 6" stroke="#FFF6B0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></svg>
        <div class="af-red" id="af-red"></div><div class="af-banner" id="af-banner"></div>
      </div>
      <div class="af-q"><div class="af-qin">
        <div class="af-meta"><span id="af-n"></span><span id="af-t"></span></div>
        <div class="af-timer"><i id="af-tbar"></i></div>
        <div class="af-text" id="af-text"></div>
        <div class="af-ans" id="af-ans"></div>
      </div></div>
      <div class="af-poster" id="af-poster"></div></div>`;
    showMon(false);
  }
  function showMon(enter){
    const el = document.getElementById("af-mon"); if (!el) return;
    if (isBoss()) { el.className = "af-mon boss ph" + F.phase + (enter ? " enter" : ""); el.innerHTML = `<div class="af-msvg">${WORLDS[F.w - 1].bossSVG(F.phase)}</div>`; return paintHP(); }
    const m = F.mons[F.m]; if (!m) { el.innerHTML = ""; return; }
    el.className = "af-mon" + (m.chief ? " chief" : "") + (enter ? " enter" : "");
    el.innerHTML = fluid(monSVG(m.k, 200, "af-msvg"));
    document.getElementById("af-mname").textContent = MON_N[m.k] + (m.chief ? " · chef" : "");
    paintHP(); paintWaves();
  }
  function paintWaves(){
    const w = document.getElementById("af-waves"); if (!w) return;
    if (F.mode === "chrono") { w.innerHTML = `<span>Monstres vaincus : <b>${F.m}</b></span>`; return; }
    w.innerHTML = F.mons.map((x, j) => `<i class="${x.chief ? "chief " : ""}${x.hp <= 0 ? "dead" : j === F.m ? "now" : ""}"></i>`).join("");
  }
  function paintHP(){
    const bar = document.getElementById("af-bar"); if (!bar) return;
    const m = F.mons[F.m]; if (!m) return;
    bar.style.width = Math.max(0, m.hp / m.max * 100) + "%";
    const t = document.getElementById("af-mhp"); if (t) t.textContent = `${Math.max(0, m.hp)}/${m.max}`;
    const ph = document.getElementById("af-phase"); if (ph) ph.textContent = `Phase ${F.phase} · ${Math.max(0, Math.round(m.hp))} PV`;
  }
  const qTime = () => isBoss() ? 15 : 20;
  function nextQ(){
    if (!F || F.over) return;
    if (F.mode === "chrono" && Date.now() >= F.ends) return end();
    if (F.mode !== "chrono" && F.n >= F.list.length) return end();
    if (F.n >= F.list.length) return end();
    const it = F.list[F.n], q = Q[it.id];
    it.ord = [0, 1, 2, 3].sort(() => Math.random() - .5);
    markSeen(it.id);
    const total = F.mode === "chrono" ? "" : `/${F.list.length}`;
    document.getElementById("af-n").innerHTML = `Question ${F.n + 1}${total}${it.hard ? ` <span class="af-hard">difficile</span>` : ""}`;
    document.getElementById("af-text").textContent = q[4];
    document.getElementById("af-ans").innerHTML = it.ord.map(k => `<button data-ans="${k}">${esc(q[2][k])}</button>`).join("");
    F.lock = false; F.t0 = Date.now();
    const bar = document.getElementById("af-tbar");
    if (F.mode === "chrono") { const left = Math.max(0, F.ends - Date.now()); bar.style.transition = "none"; bar.style.transform = `scaleX(${left / 60000})`; void bar.offsetWidth; bar.style.transition = `transform ${left}ms linear`; bar.style.transform = "scaleX(0)"; }
    else { bar.style.transition = "none"; bar.style.transform = "scaleX(1)"; void bar.offsetWidth; bar.style.transition = `transform ${qTime()}s linear`; bar.style.transform = "scaleX(0)"; }
    clearInterval(qtimer);
    qtimer = setInterval(() => {
      if (!F || F.over) return clearInterval(qtimer);
      const t = document.getElementById("af-t");
      if (F.mode === "chrono") { const left = Math.max(0, F.ends - Date.now()); if (t) t.textContent = Math.ceil(left / 1000) + " s"; if (left <= 0 && !F.lock) { clearInterval(qtimer); F.lock = true; end(); } return; }
      const left = Math.max(0, qTime() * 1000 - (Date.now() - F.t0)); if (t) t.textContent = Math.ceil(left / 1000) + " s";
      if (left <= 0 && !F.lock) { clearInterval(qtimer); choose(-1); }
    }, 200);
  }
  function fx(el, cls, ms){ if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); }
  function dmg(t, cls = ""){ const a = document.getElementById("af-arena"); if (!a) return; const d = document.createElement("div"); d.className = "af-dmg " + cls; d.textContent = t; d.style.right = (16 + Math.random() * 16) + "%"; d.style.bottom = (isBoss() ? 56 : 46) + "%"; a.appendChild(d); setTimeout(() => d.remove(), 820); }
  function banner(t){ const b = document.getElementById("af-banner"); if (!b) return; b.innerHTML = `<span>${t}</span>`; fx(b, "on", 1500); }
  function choose(k){
    if (!F || F.lock || F.over) return; F.lock = true; clearInterval(qtimer);
    const it = F.list[F.n], q = Q[it.id], ok = k === 0, dt = (Date.now() - F.t0) / 1000;
    const bar = document.getElementById("af-tbar"); if (bar && F.mode !== "chrono") { bar.style.transform = getComputedStyle(bar).transform; bar.style.transition = "none"; }
    [...document.getElementById("af-ans").children].forEach(b => { const v = +b.dataset.ans; b.disabled = true; if (v === 0) b.classList.add("ok"); else if (v === k) b.classList.add("ko"); });
    try { answer(it.id, ok, F.streak + (ok ? 1 : 0)); noteAnswer(ok); } catch(e){}
    try { Music.sfx(ok ? "ok" : "ko"); } catch(e){}
    F.n++;
    if (F.n <= 5 && !ok) F.first5 = false;
    if (it.hard && ok) F.hardOk++;
    if (ok && dt >= (F.L.sp.n || 8) && F.L.sp.k === "fast") F.fast = false;
    const okEl = document.getElementById("af-ok");
    if (ok) {
      F.ok++; F.streak++; F.best = Math.max(F.best, F.streak); if (okEl) okEl.textContent = F.ok;
      const Wq = WS(F.w); Wq.ok = (Wq.ok || 0) + 1;
      fx(document.getElementById("af-hero"), "atk", 450);
      setTimeout(hit, 170);
      setTimeout(nextQ, F.mode === "chrono" ? 700 : 1250);
    } else {
      F.streak = 0; F.ko++;
      fx(document.getElementById("af-mon"), "atk", 460);
      setTimeout(() => { fx(document.getElementById("af-hero"), "hurt", 460); fx(document.getElementById("af-red"), "on", 460); fx(document.getElementById("af-arena"), "shake", 360); }, 200);
      if (F.mode === "surv" || isBoss()) {
        F.lives--; setTimeout(() => { const l = document.getElementById("af-lives"); if (l) l.outerHTML = hearts(); }, 260);
        try { navigator.vibrate && navigator.vibrate([90, 50, 160]); } catch(e){}
        if (F.lives <= 0) { setTimeout(end, 1500); return; }
      }
      setTimeout(nextQ, F.mode === "chrono" ? 1100 : 1900);
    }
  }
  function hit(){
    if (!F) return;
    fx(document.getElementById("af-slash"), "on", 400);
    const m = F.mons[F.m]; if (!m || m.hp <= 0) return;
    if (isBoss()) {
      m.hp = Math.max(0, m.hp - 100 / 7 - .01); fx(document.getElementById("af-mon"), "hit", 420); dmg("-" + Math.round(100 / 7), "big"); paintHP();
      const ph = m.hp <= 33.4 ? 3 : m.hp <= 66.7 ? 2 : 1;
      if (m.hp <= 0) { F.won = true; const el = document.getElementById("af-mon"); el.classList.add("die"); setTimeout(end, 900); F.n = F.list.length; return; }
      if (ph !== F.phase) { F.phase = ph; setTimeout(() => { showMon(false); fx(document.getElementById("af-mon"), "morph", 700); fx(document.getElementById("af-arena"), "shake", 360);
        banner(WORLDS[F.w - 1].phase[ph - 2]); try { Music.sfx("level"); } catch(e){} }, 450); }
      return;
    }
    m.hp--; paintHP(); fx(document.getElementById("af-mon"), "hit", 420); dmg("-1");
    if (m.hp <= 0) { const Wk = WS(F.w); Wk.kills = (Wk.kills || 0) + 1;
      document.getElementById("af-mon").classList.add("die");
      setTimeout(() => { if (!F) return; if (F.m < F.mons.length - 1) { F.m++; showMon(true); } else { document.getElementById("af-mon").innerHTML = ""; paintWaves(); } }, 560);
    }
  }
  function stars(){
    const L = F.L, sp = L.sp;
    let win, s2, s3;
    if (F.mode === "c") { win = F.ok >= 6; s2 = F.ok >= 8; }
    else if (F.mode === "chrono") { win = F.ok >= 8; s2 = F.ok >= 12; }
    else if (F.mode === "surv") { win = F.lives > 0; s2 = F.lives >= 2; }
    else { win = !!F.won; s2 = F.lives >= 2; }
    s3 = sp.k === "streak" ? F.best >= sp.n : sp.k === "first5" ? F.first5 && F.n >= 5 : sp.k === "hard" ? F.hardOk >= 3 : sp.k === "fast" ? F.fast && F.ok > 0 : F.lives === 3;
    return {win, mask:win ? 1 | (s2 ? 2 : 0) | (s3 ? 4 : 0) : 0, got:[win, win && s2, win && s3]};
  }
  function end(){
    if (!F || F.over) return; F.over = true; clearInterval(qtimer);
    const W = WS(F.w), i = F.i, L = F.L, r = stars(), before = W.st[i], first = r.win && !W.done[i];
    const newMask = before | r.mask, newStars = nStars(newMask) - nStars(before);
    let coins = 0;
    if (r.win) {
      if (first) coins += isBoss() ? BOSS_COINS[F.w] : LV_COINS[F.w];
      coins += newStars * STAR_COINS;
      W.done[i] = 1;
      const score = isBoss() ? F.lives : F.ok;
      if (F.mode === "c" && F.ok >= 10) W.perfect = 1;
      if (F.mode === "surv" && F.lives === 3) W.surv3 = 1;
      W.best[i] = Math.max(W.best[i] || 0, score);
    }
    W.st[i] = newMask;
    let full = false;
    if (pct(F.w) >= 100 && !W.full) { W.full = today(); coins += FULL_COINS; full = true; }
    S.coins += coins;
    let title = false;
    if (r.win && isBoss() && first && built(F.w + 1)) F.sail = F.w + 1;
    if (r.win && isBoss() && first) { S.titles = S.titles || {}; if (!S.titles[WORLDS[F.w - 1].title]) { S.titles[WORLDS[F.w - 1].title] = today(); title = true; } }
    save(); try { checkBadges(); } catch(e){}
    try { Amis.api.ping(); } catch(e){}
    poster(r, coins, newStars, title, first, full);
  }
  function poster(r, coins, newStars, title, first, full){
    const win = r.win, L = F.L, p = pet(), boss = isBoss();
    const alive = F.mons.filter(m => m.hp > 0);
    const flee = !win ? (F.mode === "surv" || boss ? "Tu n'as plus de vie. Retente ta chance !" : F.mode === "chrono" ? "Il faut 8 bonnes réponses en 60 secondes. Retente ta chance !" : "Il faut 6 bonnes réponses pour passer. Retente ta chance !")
      : boss ? WORLDS[F.w - 1].win : F.mode === "chrono" ? `${F.m} monstres balayés en 60 secondes !`
      : alive.length ? (alive.some(m => m.chief) ? "Le chef de bande s'enfuit dans les fourrés…" : "Les derniers monstres s'enfuient !") : "Toute la bande est vaincue, même le chef !";
    const banner = `<svg viewBox="0 0 300 70"><defs>${lg("avBnr", "#FF6A7A", "#C8243A")}</defs><path d="M8 22 L40 22 L40 58 L22 50 L4 58 L14 40Z" fill="${win ? "#B02A3A" : "#4A4466"}" stroke="${TD}" stroke-width="3" stroke-linejoin="round"/><path d="M292 22 L260 22 L260 58 L278 50 L296 58 L286 40Z" fill="${win ? "#B02A3A" : "#4A4466"}" stroke="${TD}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 8 L270 8 Q276 30 270 52 L30 52 Q24 30 30 8Z" fill="${win ? "url(#avBnr)" : "#6A6680"}" stroke="${TD}" stroke-width="3.4"/><path d="M40 16 L260 16" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>
      <text x="150" y="41" text-anchor="middle" style="font:800 30px var(--f-display);letter-spacing:.04em" fill="#FFD23F" stroke="${TD}" stroke-width="5" paint-order="stroke">${win ? "VICTOIRE !" : "DÉFAITE…"}</text></svg>`;
    const big = (on, k) => `<svg class="${k === 1 ? "mid" : ""}" width="${k === 1 ? 64 : 52}" height="${k === 1 ? 64 : 52}" viewBox="0 0 40 40"><path d="${starP(20, 21, 18)}" fill="${on ? "#FFD23F" : "#CDBF9E"}" stroke="${TD}" stroke-width="2.6" stroke-linejoin="round"/>${on ? `<path d="M13 13 L17 11" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>` : ""}</svg>`;
    const score = boss ? `${F.ok} coups portés<small>${F.lives} vie${F.lives > 1 ? "s" : ""} restante${F.lives > 1 ? "s" : ""} · ${L.n}</small>` : F.mode === "chrono" ? `${F.ok} bonnes réponses<small>en 60 secondes · ${L.n}</small>` : `${F.ok} / ${F.n}<small>bonnes réponses · ${L.n}</small>`;
    const nx = WORLDS[F.w], nextWorld = win && boss && nx ? `<p class="af-flee"><b>${built(F.w + 1) ? `Nouvelle île débloquée : ${nx.n} !` : `Le Monde ${F.w + 1}, ${nx.n}, arrive bientôt !`}</b></p>` : "";
    const el = document.getElementById("af-poster");
    el.innerHTML = `<div class="af-board"><div class="af-bnr">${banner}</div><div class="af-paper">
      ${win ? `<div class="af-heroes"><span class="w">${meSVG(74)}</span>${p ? `<span class="w w2">${creatureSVG(p, 40)}</span>` : ""}</div>` : ""}
      <div class="af-stars">${r.got.map((g, k) => big(g, k)).join("")}</div>
      <div class="af-score">${score}</div><p class="af-flee">${flee}</p>${nextWorld}
      <div class="av-objs">${objectives(L).map((o, k) => `<div class="av-obj ${r.got[k] ? "got" : ""}">${starSVG(r.got[k], 18)}<span>${o}</span></div>`).join("")}</div>
      ${win ? `<div class="af-rw">${coins ? `<span class="av-chip"><span class="coin"></span>+${coins} pièces${first ? " (1re victoire)" : ""}</span>` : ""}${newStars ? `<span class="av-chip">+${newStars} ★ nouvelle${newStars > 1 ? "s" : ""}</span>` : ""}${title ? `<span class="av-chip">Titre : ${esc(titleById(WORLDS[F.w - 1].title).n)}</span>` : ""}${full ? `<span class="av-chip">🏆 Monde complété à 100 % (+${FULL_COINS})</span>` : ""}${!coins && !newStars ? `<span class="av-chip">Pièces et XP des bonnes réponses</span>` : ""}</div>` : ""}
    </div><div class="af-btns"><button class="av-btn wood" data-adv="replay">Rejouer</button><button class="av-btn ${win ? "green" : "pink"}" data-adv="tomap">${win ? "Continuer" : "Retour à la carte"}</button></div></div>`;
    el.classList.add("on");
    try { Music.sfx(win ? "level" : "ko"); } catch(e){}
    if (win) [...el.querySelectorAll(".af-stars svg")].forEach((s, k) => setTimeout(() => s.classList.add("in"), 350 + k * 380));
    else [...el.querySelectorAll(".af-stars svg")].forEach(s => s.classList.add("in"));
  }
  function closeFight(){
    clearInterval(qtimer); if (layer) { layer.hidden = true; layer.innerHTML = ""; }
    document.body.classList.remove("in-adv-fight"); F = null; scr = "map"; lastScroll = null;
    render(); try { flushLevelUp(); } catch(e){}
  }
  // Traversée vers l'île suivante : le personnage navigue, la brume se lève sur la nouvelle île
  const ISLC = {1:"#5AB04A", 2:"#E8B050", 3:"#3AA0D8", 4:"#E8F4FF", 5:"#6A3A6A"};
  function sail(to){
    const el = document.createElement("div"); el.className = "av-sail";
    const isl = (x, c, fog) => `<g transform="translate(${x} 150)"><ellipse rx="70" ry="22" cy="18" fill="#5AD0F0" opacity=".45"/><ellipse rx="62" ry="26" fill="#F8E2A8" stroke="#2B1D3A" stroke-width="3"/><ellipse rx="50" ry="20" cy="-6" fill="${c}" stroke="#2B1D3A" stroke-width="3"/>${fog ? `<g class="av-sail-fog"><circle cx="-30" cy="-10" r="30" fill="#E8EEF8"/><circle cx="10" cy="-20" r="34" fill="#E8EEF8"/><circle cx="40" cy="0" r="26" fill="#E8EEF8"/></g>` : ""}</g>`;
    el.innerHTML = `<svg viewBox="0 0 400 260" class="av-sail-svg"><defs><linearGradient id="avSeaS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7AC8F0"/><stop offset=".45" stop-color="#2A7AC8"/><stop offset="1" stop-color="#0E3A78"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#avSeaS)"/><circle cx="330" cy="40" r="22" fill="#FFF4C0"/>
      ${Array.from({length:14}, (_, i) => `<path class="av-wave" style="animation-delay:-${i * .3}s" d="M${(i * 53) % 380} ${120 + (i * 37) % 120} q5 -4 10 0 q5 4 10 0" stroke="#fff" stroke-width="2" fill="none" opacity=".35"/>`).join("")}
      ${isl(70, ISLC[to - 1], false)}${isl(330, ISLC[to], true)}
      <g class="av-sail-boat"><path d="M-26 0 L26 0 L18 14 L-18 14Z" fill="#A8784A" stroke="#2B1D3A" stroke-width="2.6" stroke-linejoin="round"/><path d="M0 0 V-44" stroke="#2B1D3A" stroke-width="3"/><path d="M2 -42 L30 -10 L2 -8Z" fill="#fff" stroke="#2B1D3A" stroke-width="2.4" stroke-linejoin="round"/><path d="M-2 -38 L-22 -10 L-2 -10Z" fill="#FF5FA2" stroke="#2B1D3A" stroke-width="2.4" stroke-linejoin="round"/>
        <g transform="translate(-14 -30)">${nest(meSVG(28), 0, 0)}</g></g></svg>
      <div class="av-sail-txt"><span>Nouvelle île</span><b>${esc(WORLDS[to - 1].n)}</b></div>`;
    document.body.appendChild(el);
    try { Music.sfx("level"); } catch(e){}
    const go = () => { if (!el.isConnected) return; el.classList.add("out"); setTimeout(() => el.remove(), 400); cw = to; scr = "map"; sheet = -1; lastScroll = null; render(); setTimeout(() => { try { flushLevelUp(); } catch(e){} }, 500); };
    el.addEventListener("click", go); setTimeout(go, 4200);
  }
  function fightClick(a){
    if (a === "quit") { if (F && !F.over) { F.over = true; } return closeFight(); }
    if (a === "tomap") { const to = F && F.sail; if (to) document.body.appendChild(Object.assign(document.createElement("i"), {className:"av-sail"})); closeFight(); if (to) { document.querySelectorAll("i.av-sail").forEach(e => e.remove()); sail(to); } return; }
    if (a === "replay") { const w = F.w, i = F.i; clearInterval(qtimer); F = null; return start(w, i); }
  }

  // Classement entre amis (prochaine étape) : résumé publié avec le profil
  const stats = () => { const w = [5, 4, 3, 2, 1].find(x => WORLDS[x - 1].levels && worldOpen(x)) || 1, s = WS(w);
    return {w, lv:s.done.every(Boolean) ? 8 : curLevel(w) + 1, st:totalStars(), pc:pct(w)}; };
  function rankHTML(){
    const api = (() => { try { return Amis.api; } catch(e){ return null; } })(), me = api && api.uid && api.uid();
    const head = `<div class="av-rank-h"><b>🏆 Classement des amis</b><button class="av-x" data-adv="rank" aria-label="Fermer">✕</button></div>`;
    if (!me) return `<div class="av-rank">${head}<p class="av-rank-p">Connecte-toi dans l'onglet Multi pour comparer ta progression avec tes amis.</p></div>`;
    const users = api.users();
    const R = Object.keys(users).map(id => ({id, a:id === me ? stats() : (users[id].st && users[id].st.adv) || null})).filter(r => r.a)
      .sort((x, y) => y.a.w - x.a.w || y.a.lv - x.a.lv || y.a.st - x.a.st);
    const where = a => a.lv > 7 ? `Monde ${a.w} · terminé` : `Monde ${a.w} · Niv. ${a.lv}`;
    return `<div class="av-rank">${head}<div class="av-rank-list">${R.length ? R.map((r, i) => `<div class="av-rk ${r.id === me ? "me" : ""}"><b class="av-pos">${i + 1}</b>${api.avatar(r.id, 34)}<div class="av-rk-n"><b>${esc(api.pseudoOf(r.id))}${r.id === me ? " (toi)" : ""}</b><span>${where(r.a)}</span></div><span class="av-chip">★ ${r.a.st} · ${r.a.pc} %</span></div>`).join("") : `<p class="av-rank-p">Personne n'a encore commencé l'Aventure.</p>`}</div>
      <p class="av-rank-p">Mis à jour automatiquement. Seuls les amis qui ont joué à l'Aventure apparaissent.</p></div>`;
  }
  const ADV_TITLES = {adv1:{id:"adv1", n:"FLÉAU DE LA FORÊT", a:"#9BE36A", b:"#1E5A2A", f:"#FFFFFF"}};
  Object.assign(WORLDS[0], {nodes:NODES, h:1580, mapDraw:mapBase, bossSVG:guardianSVG, arena:arenaBG, qp:"f1",
    phase:["Phase 2 · Le Gardien s'enrage !", "Phase 3 · Forme ancestrale !"], win:"Le Gardien Sylvestre est vaincu ! La forêt retrouve son calme.",
    qn:["Ouvrir la route", "Jusqu'au cœur des bois", "Le Gardien vaincu", "Chasseur d'étoiles", "Toutes les étoiles de la forêt", "Érudit des bois", "Nettoyeur de clairières", "Sans faute", "Rapide comme l'éclair", "Intouchable"]});
  // Un monde de plus (fichiers aventure_m2.js…) : données, dessins de la carte, monstres, boss et arène
  function register(w, def){
    Object.assign(WORLDS[w - 1], def);
    if (def.monsters) { Object.keys(def.monsters).forEach(k => { MON[k] = def.monsters[k].draw; MON_N[k] = def.monsters[k].n; }); }
    if (def.title) ADV_TITLES[def.title.id] = def.title, WORLDS[w - 1].title = def.title.id;
  }
  const kit = {TD, rnd, smooth, sample, dist, near, blob, bumpy, tf, lg, rg, starP, flower, monSVG};
  return {register, kit, track, pctOf:w => built(w) ? pct(w) : 0, init, view, after, leave, click, playing, stats, titles:ADV_TITLES, _test:{sail, start, end:() => end(), F:() => F, choose, WS, makeList, show:() => showMon(false)}};
})();

try { Aventure.init(); } catch(e){}
