// Convertit la carte Natural Earth (world-atlas 50m, domaine public) en tracés SVG pour Lumen
import fs from "fs"; import * as tc from "topojson-client"; import * as ts from "topojson-simplify"; import {geoNaturalEarth1, geoPath, geoArea} from "d3-geo";
const OUT = process.argv[2];
let topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/countries-50m.json"));
topo = ts.presimplify(topo); topo = ts.simplify(topo, ts.quantile(topo, 0.25));
const feats = tc.feature(topo, topo.objects.countries).features.filter(f => f.properties.name !== "Antarctica");
const rows = fs.readFileSync("pays.txt", "utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#")).map(l => { const [id, c, n, cap, k, t] = l.split("|"); return {id, c, n, cap, k, t:+t}; });
const W = 1000, proj = geoNaturalEarth1().fitExtent([[4, 4], [W - 4, 520]], {type:"FeatureCollection", features:feats});
const H = Math.ceil(proj([180, -60])[1] + 6);
const path = geoPath(proj).digits(1);
const keyOf = f => f.id || f.properties.name;
const MERGE = {"Somaliland":"706", "N. Cyprus":"196"};
const byKey = {}; feats.forEach(f => { const k = MERGE[f.properties.name] || keyOf(f); (byKey[k] = byKey[k] || []).push(f); });
const used = new Set(), out = [];
for (const r of rows) {
  const fs_ = byKey[r.id]; let d = "", x, y, s = 0;
  if (fs_) { used.add(r.id); d = fs_.map(f => path(f)).join("");
    const main = fs_[0], [[x0, y0], [x1, y1]] = path.bounds(main); const polys = fs_.flatMap(f => f.geometry.type === "MultiPolygon" ? f.geometry.coordinates.map(c => ({type:"Polygon", coordinates:c})) : [f.geometry]); const big = polys.sort((a, b) => path.area(b) - path.area(a))[0]; const c = path.centroid(big); x = +c[0].toFixed(1); y = +c[1].toFixed(1);
    const area = fs_.reduce((a, f) => a + path.area(f), 0); s = area < 6 ? 1 : 0;
    if (r.c === "us") { const p = proj([-98, 39]); x = +p[0].toFixed(1); y = +p[1].toFixed(1); }
    if (r.c === "fr") { const p = proj([2.5, 46.6]); x = +p[0].toFixed(1); y = +p[1].toFixed(1); }
    if (r.c === "ru") { const p = proj([60, 60]); x = +p[0].toFixed(1); y = +p[1].toFixed(1); }
    if (r.c === "nz") { const p = proj([172.5, -41.5]); x = +p[0].toFixed(1); y = +p[1].toFixed(1); }
    if (r.c === "ki") { const p = proj([173, 1.4]); x = +p[0].toFixed(1); y = +p[1].toFixed(1); }
    if (r.c === "fj") { const p = proj([178, -17.8]); x = +p[0].toFixed(1); y = +p[1].toFixed(1); }
  } else if (r.c === "tv") { const p = proj([179.2, -8.5]); x = +p[0].toFixed(1); y = +p[1].toFixed(1); s = 1; }
  else { console.error("introuvable :", r.id, r.n); continue; }
  out.push({c:r.c, n:r.n, cap:r.cap, k:r.k, t:r.t, d, x, y, s});
}
// Territoires non jouables (Groenland, Sahara occidental, îles dépendantes…) : dessinés en gris
const other = Object.keys(byKey).filter(k => !used.has(k)).map(k => byKey[k].map(f => path(f)).join("")).join("");
const BOX = {eu:[-25, 34, 45, 71], af:[-19, -36, 53, 38], as:[25, -11, 150, 56], am:[-170, -56, -30, 73], oc:[110, -48, 180, 2]};
const box = {}; for (const k in BOX) { const [a, b, c, d] = BOX[k]; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) { const p = proj([a + (c - a) * i / 20, b + (d - b) * j / 20]); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  box[k] = [x0, y0, x1, y1].map(v => Math.round(v)); }
const data = {w:W, h:H, box, other, c:out};
fs.writeFileSync(OUT, "/* Atlas du monde : carte Natural Earth 1:50m (domaine public), projection Natural Earth, 197 pays. Généré, ne pas modifier à la main. */\nconst ATLAS = " + JSON.stringify(data) + ";\n");
console.log("pays", out.length, "petits", out.filter(o => o.s).length, "Ko", Math.round(fs.statSync(OUT).size / 1024), "hauteur", H);
