/* Lumen : parc à construire, monde Maison, monde Casino */
const KEY = "lumen.parc.v1";
const BLANK = () => ({coins:600, map:{}, garden:[], inside:[], night:false, wheelDay:"", chest:false});
let S; try { S = Object.assign(BLANK(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch(e){ S = BLANK(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };
const today = () => new Date().toISOString().slice(0,10);

/* ---------- Rendu partagé ---------- */
const stage = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(38, 1, .1, 300);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .08;

const MATS = {};
function mat(c, o){ const k = c + JSON.stringify(o||{}); if (!MATS[k]) { const m = new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.82, metalness:0, flatShading:true}, o||{})); m.color.convertSRGBToLinear(); if (m.emissive) m.emissive.convertSRGBToLinear(); MATS[k] = m; } return MATS[k]; }
const glowMats = [];
function glow(c, i){ const m = new THREE.MeshStandardMaterial({color:c, emissive:c, emissiveIntensity:i===undefined?.25:i, roughness:.4}); m.color.convertSRGBToLinear(); m.emissive.convertSRGBToLinear(); m.userData.base = m.emissiveIntensity; glowMats.push(m); return m; }
function mesh(geo, m, x, y, z, cast){ const o = new THREE.Mesh(geo, m); o.position.set(x||0, y||0, z||0); o.castShadow = cast !== false; o.receiveShadow = true; return o; }
const box = (w,h,d,m,x,y,z) => mesh(new THREE.BoxGeometry(w,h,d), m, x, y, z);
const cyl = (rt,rb,h,m,x,y,z,s) => mesh(new THREE.CylinderGeometry(rt,rb,h,s||12), m, x, y, z);
const cone = (r,h,m,x,y,z,s) => mesh(new THREE.ConeGeometry(r,h,s||10), m, x, y, z);
const ball = (r,m,x,y,z,d) => mesh(new THREE.IcosahedronGeometry(r, d===undefined?1:d), m, x, y, z);
const G = (...p) => { const g = new THREE.Group(); p.forEach(o => g.add(o)); return g; };
const at = (o, x, y, z, ry) => { o.position.set(x, y, z); if (ry) o.rotation.y = ry; return o; };
function rng(seed){ return () => { seed = (seed*16807) % 2147483647; return (seed-1)/2147483646; }; }
function canvasTex(w, h, draw){ const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }
function sky(color){ return new THREE.Color(color).convertSRGBToLinear(); }
function lights(scene, o){
  const hemi = new THREE.HemisphereLight(0xdff2ff, 0x6a8a4a, o.hemi||.8); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d6, o.sun||1.3); sun.position.set(o.sx||18, 28, o.sz||12); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const s = o.span||26; Object.assign(sun.shadow.camera, {left:-s, right:s, top:s, bottom:-s, near:1, far:90}); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;
  scene.add(sun); return {hemi, sun};
}
function tree(r, s){
  const g = new THREE.Group(), h = (1 + r()*.8)*s;
  g.add(cyl(.2*s,.28*s,h, mat("#7A5234"), 0, h/2, 0));
  if (r() < .45){ g.add(cone(1.2*s, 2.4*s, mat("#3E8A5A"), 0, h+1.1*s, 0, 7)); g.add(cone(.9*s, 1.8*s, mat("#4FA06A"), 0, h+2*s, 0, 7)); }
  else { g.add(ball(1.2*s, mat(r()<.5?"#5DB04E":"#6CC25A"), 0, h+1*s, 0)); g.add(ball(.8*s, mat("#7FD06A"), .55*s, h+1.4*s, .3*s)); }
  return g;
}
function puffAt(scene, list, center, spread, n, color){
  for (let i=0;i<n;i++){ const m = new THREE.MeshStandardMaterial({color:color||0xf2ead8, transparent:true, opacity:.85, roughness:1}); m.color.convertSRGBToLinear();
    const p = ball(.4+Math.random()*.4, m, center.x+(Math.random()-.5)*spread, center.y+.4, center.z+(Math.random()-.5)*spread); scene.add(p);
    list.push({m:p, v:new THREE.Vector3((Math.random()-.5)*.06, .03+Math.random()*.04, (Math.random()-.5)*.06), life:1}); }
}
function confetti(scene, list, center){
  const cols = [0xF2A947,0xF27BA8,0x6CC27A,0x5AA9F0,0xB48CF2,0xFFE36A];
  for (let i=0;i<40;i++){ const p = box(.18,.04,.1, new THREE.MeshBasicMaterial({color:cols[i%6]}), center.x, center.y+3, center.z); p.castShadow = false; scene.add(p);
    list.push({m:p, v:new THREE.Vector3((Math.random()-.5)*.25, .15+Math.random()*.2, (Math.random()-.5)*.25), life:1.6, spin:Math.random()*.3, grav:true}); }
}
function stepFx(scene, list, dt){
  for (let i=list.length-1;i>=0;i--){ const p = list[i]; p.life -= dt*.75; if (p.grav){ p.v.y -= dt*.5; p.m.rotation.x += p.spin; p.m.rotation.z += p.spin; } else p.m.scale.multiplyScalar(1.012);
    p.m.position.add(p.v); if (p.m.material.opacity !== undefined && !p.grav) p.m.material.opacity = Math.max(0, p.life*.85);
    if (p.life <= 0){ scene.remove(p.m); list.splice(i,1); } }
}
function fixSigns(scene){ scene.traverse(o => { const m = o.material; if (m && m.map && m.emissive && !m.emissiveMap && m.emissive.r > .9) { m.emissiveMap = m.map; m.needsUpdate = true; } }); }
const popIn = x => 1 + 2.7*Math.pow(x-1,3) + 1.7*Math.pow(x-1,2);

/* ============================================================
   MONDE 1 : LE PARC
   ============================================================ */
const BUILDINGS = [
  {id:"maison", n:"La Maison", prices:[50,90,140], world:"home", t:.12, side:1},
  {id:"casino", n:"Le Casino", prices:[100,160,240], world:"casino", t:.28, side:-1},
  {id:"carrousel", n:"Le Carrousel", prices:[120,190,260], t:.44, side:1},
  {id:"observatoire", n:"L'Observatoire", prices:[150,220,300], t:.6, side:-1},
  {id:"statue", n:"La Grande Statue", prices:[180,260,360], t:.76, side:1},
  {id:"chateau", n:"Le Château", prices:[250,380,520], t:.9, side:-1}
];
const lvl = id => S.map[id] || 0;

// Chaque modèle : liste de [étape, objet]
const MODELS = {
  maison(){ const cream = mat("#F4E6CC"), wood = mat("#6E4428"), roof = mat("#9A86D8");
    const p1 = G(box(5.2,.4,4.4,mat("#A8A29A"),0,.2,0), box(4.6,2.6,3.8,cream,0,1.7,0), box(.16,2.6,.1,wood,-2.3,1.7,1.92), box(.16,2.6,.1,wood,2.3,1.7,1.92), box(4.6,.14,.1,wood,0,3,1.92));
    const tri = new THREE.Shape(); tri.moveTo(-2.6,0); tri.lineTo(2.6,0); tri.lineTo(0,2); tri.lineTo(-2.6,0);
    const gable = mesh(new THREE.ExtrudeGeometry(tri,{depth:4.6,bevelEnabled:false}), cream, 0,3,0); gable.rotation.y = Math.PI/2; gable.position.x = -2.3;
    const r1 = box(5.6,.25,3.5,roof,0,4.05,1.05); r1.rotation.x = .66; const r2 = box(5.6,.25,3.5,roof,0,4.05,-1.05); r2.rotation.x = -.66;
    const p2 = G(gable, r1, r2, box(1,1.7,.14,mat("#8A5A3A"),0,1.25,1.92), box(.9,.8,.08,glow("#FFD58A"),-1.4,1.9,1.93), box(.9,.8,.08,glow("#FFD58A"),1.4,1.9,1.93), box(.6,1.4,.6,mat("#B4553A"),1.4,4.6,-.6));
    const p3 = G(); ["#F27BA8","#FFD84A","#B48CF2","#FFFFFF","#FF8A5C"].forEach((c,i) => p3.add(ball(.22,mat(c),-2.2+i*1.1,.55,2.6,0)));
    for (let i=0;i<7;i++) p3.add(box(.12,.6,.12,mat("#F4EDE0"),-2.7+i*.9,.3,3.1)); p3.add(box(5.6,.08,.06,mat("#F4EDE0"),0,.45,3.1));
    p3.add(cyl(.06,.08,2,mat("#3A3A48"),2.9,1,2.6), box(.34,.4,.34,glow("#FFD58A"),2.9,2.15,2.6));
    return [[1,p1],[2,p2],[3,p3]]; },
  casino(){ const red = mat("#8A1E2A"), gold = mat("#E0B040", {metalness:.5, roughness:.35}), dark = mat("#3A1420");
    const p1 = G(box(6,.4,4.6,mat("#C8C2B8"),0,.2,0), box(5.4,3,4,red,0,1.9,0)); [-2.2,-.8,.8,2.2].forEach(x => p1.add(cyl(.18,.2,2.8,mat("#F4EDE0"),x,1.8,2.2)));
    const sign = mesh(new THREE.PlaneGeometry(4.4,1.1), new THREE.MeshStandardMaterial({map:canvasTex(512,128,(g,w,h)=>{ g.fillStyle="#2A0A12"; g.fillRect(0,0,w,h); g.strokeStyle="#F2C440"; g.lineWidth=10; g.strokeRect(5,5,w-10,h-10); g.fillStyle="#FFE36A"; g.font="bold 78px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("CASINO",w/2,h/2+4); }), emissive:0xffffff, emissiveIntensity:.35}), 0, 3.95, 2.12);
    const p2 = G(box(5.8,.3,4.4,gold,0,3.55,0), cyl(1.6,1.8,.4,gold,0,3.9,0,16), mesh(new THREE.SphereGeometry(1.5,16,10,0,Math.PI*2,0,Math.PI/2),mat("#C8323A"),0,4.1,0), ball(.25,gold,0,5.7,0), sign, box(1.6,2,.12,dark,0,1.4,2.02));
    const p3 = G(box(1.6,.04,3,mat("#C8323A"),0,.42,3.5)); [-1,1].forEach(s => { p3.add(cyl(.06,.06,1,gold,s*.9,.9,3.2), cyl(.06,.06,1,gold,s*.9,.9,4.6)); p3.add(cone(.35,.8,glow("#FFE36A"),s*2.7,4.3,1.8,6)); });
    for (let i=0;i<10;i++) p3.add(ball(.09, glow(["#FFE36A","#F27BA8","#6CF0FF"][i%3], .8), -2.6+i*.58, 3.3, 2.15, 0));
    return [[1,p1],[2,p2],[3,p3]]; },
  carrousel(){ const p1 = G(cyl(3,3.1,.5,mat("#F4EDE0"),0,.25,0,24), cyl(2.7,2.7,.12,mat("#E86A5C"),0,.56,0,24));
    const p2 = G(cyl(.25,.25,3.6,mat("#F2C440",{metalness:.4}),0,2.3,0)); const hc = ["#FFFFFF","#F4A6C0","#A8D8FF","#FFE36A","#C8B4FF","#B8F0C8"];
    for (let i=0;i<6;i++){ const a = i/6*Math.PI*2, x = Math.cos(a)*2, z = Math.sin(a)*2; p2.add(cyl(.05,.05,3.2,mat("#F2C440",{metalness:.4}),x,2.1,z)); const h = G(box(.9,.5,.3,mat(hc[i]),0,0,0), box(.25,.55,.25,mat(hc[i]),.4,.35,0), box(.12,.5,.1,mat(hc[i]),-.3,-.4,0), box(.12,.5,.1,mat(hc[i]),.3,-.4,0)); h.position.set(x,1.6,z); h.rotation.y = -a; p2.add(h); }
    const top = cone(3.3,1.8,mat("#E2483E"),0,4.7,0,12); const stripe = cone(3.32,1.82,mat("#FFFFFF"),0,4.7,0,12); stripe.scale.set(1,.5,1); stripe.position.y = 4.25;
    const p3 = G(top, cyl(3.3,3.3,.5,mat("#F2C440",{metalness:.4}),0,3.85,0,24), cyl(.05,.05,1.2,mat("#8A8A96"),0,6,0), box(.6,.35,.03,mat("#5AA9F0"),.3,6.4,0));
    for (let i=0;i<12;i++){ const a = i/12*Math.PI*2; p3.add(ball(.1,glow("#FFE36A",.8),Math.cos(a)*3.3,3.6,Math.sin(a)*3.3,0)); }
    return [[1,p1],[2,p2],[3,p3]]; },
  observatoire(){ const st = mat("#E6E0D4");
    const p1 = G(cyl(2.4,2.6,.4,mat("#A8A29A"),0,.2,0,16), cyl(2,2.1,3.6,st,0,2.2,0,16)); for (let i=0;i<4;i++) p1.add(box(.5,.8,.06,glow("#FFD58A"),Math.cos(i*1.57)*2.02,2.4,Math.sin(i*1.57)*2.02)).children[0];
    p1.children.slice(-4).forEach((w,i) => w.rotation.y = -i*1.57 + Math.PI/2);
    const dome = mesh(new THREE.SphereGeometry(2.1,20,12,0,Math.PI*2,0,Math.PI/2), mat("#5A6AB8",{metalness:.3,roughness:.4}), 0, 4, 0);
    const tel = cyl(.35,.25,2.6,mat("#F2C440",{metalness:.5}),.8,5.6,0); tel.rotation.z = -.8;
    const p2 = G(dome, box(.8,1.4,4.3,mat("#2A2A5E"),.4,4.9,0), tel);
    const p3 = G(); for (let i=0;i<5;i++){ const s = cone(.18,.5,glow("#FFE36A",1),-1.6+i*.8,7+Math.sin(i)*.6,-.5,4); s.rotation.z = Math.PI/4; p3.add(s); } p3.add(cyl(.05,.05,1.8,mat("#8A8A96"),-1.2,5.5,1), box(.7,.4,.03,mat("#F27BA8"),-.85,6.2,1));
    return [[1,p1],[2,p2],[3,p3]]; },
  statue(){ const v = mat("#7EC4A8"), vd = mat("#5FA88C"), stone = mat("#C8BEA8");
    const p1 = G(box(3.2,1.2,3.2,stone,0,.6,0), box(2.4,1.6,2.4,mat("#B8AE98"),0,2,0), box(2.7,.3,2.7,stone,0,2.95,0));
    const p2 = G(cone(1.1,4,v,0,5.1,0,10), cone(.9,3.2,vd,.1,5.4,.15,9), cyl(.55,.7,.9,v,0,6.9,0), ball(.5,v,0,7.6,0,2), box(.5,.9,.18,vd,-.75,6.1,.4));
    const arm = cyl(.18,.2,1.8,v,.75,8.1,0); arm.rotation.z = -.35;
    const p3 = G(arm, cyl(.22,.15,.4,mat("#E0B040",{metalness:.5}),1.1,9.1,0), cone(.25,.6,glow("#FFB13B",1.2),1.1,9.55,0,6));
    for (let i=0;i<7;i++){ const a = -1.2 + i*.4; const sp = cone(.08,.6,v,Math.sin(a)*.5,7.95+Math.cos(a)*.2,Math.cos(a)*.15,4); sp.rotation.z = -a*.8; p3.add(sp); }
    return [[1,p1],[2,p2],[3,p3]]; },
  chateau(){ const st = mat("#E8D8B8"), roof = mat("#C8403A");
    const p1 = G(box(5.6,.4,4.6,mat("#A8A29A"),0,.2,0), box(5,2.6,4,st,0,1.7,0), box(1.2,1.6,.14,mat("#6E4428"),0,1.2,2.02)); for (let i=0;i<6;i++) p1.add(box(.5,.5,.5,st,-2.25+i*.9,3.25,1.8));
    const p2 = G(); [[-2.6,1.9],[2.6,1.9],[-2.6,-1.9],[2.6,-1.9]].forEach(([x,z]) => p2.add(cyl(.8,.9,4.2,st,x,2.1,z,10))); p2.add(cyl(1.1,1.2,5.6,st,0,3,-.6,12));
    const p3 = G(); [[-2.6,1.9,4.2],[2.6,1.9,4.2],[-2.6,-1.9,4.2],[2.6,-1.9,4.2],[0,-.6,5.8]].forEach(([x,z,h]) => { p3.add(cone(1.05,1.8,roof,x,h+.9,z,10)); p3.add(cyl(.03,.03,.9,mat("#8A8A96"),x,h+2.2,z), box(.5,.3,.03,mat("#5AA9F0"),x+.26,h+2.5,z)); });
    return [[1,p1],[2,p2],[3,p3]]; }
};

function makeMap(){
  const scene = new THREE.Scene(); scene.background = sky("#9FD6F0"); scene.fog = new THREE.Fog(sky("#9FD6F0"), 70, 140);
  const L = lights(scene, {span:34});
  const fx = [], r = rng(11);
  // Sol, eau, montagnes
  const water = mesh(new THREE.PlaneGeometry(220,220), mat("#5AB8E8",{flatShading:false, roughness:.3}), 0, -.6, 0, false); water.rotation.x = -Math.PI/2; scene.add(water);
  scene.add(mesh(new THREE.CylinderGeometry(30,31,1.4,40), mat("#7CC46A"), 0, -.7, 0, false));
  scene.add(mesh(new THREE.CylinderGeometry(30.2,30.2,.12,40), mat("#E8D8A8"), 0, -1.3, 0, false));
  [[-22,-30,9],[-12,-34,11],[0,-36,8],[14,-32,12],[26,-28,9]].forEach(([x,z,h]) => { scene.add(cone(h*.9,h,mat("#8A96A8"),x,h/2-1,z,6)); scene.add(cone(h*.35,h*.38,mat("#FFFFFF"),x,h-1-h*.19+.05,z,6)); });
  // Chemin
  const curve = new THREE.CatmullRomCurve3([[0,26],[7,18],[-5,10],[6,2],[-6,-6],[5,-14],[-3,-21],[0,-26]].map(([x,z]) => new THREE.Vector3(x,.02,z)));
  const N = 220, pos = [], idx = [];
  for (let i=0;i<=N;i++){ const t = i/N, p = curve.getPointAt(t), tg = curve.getTangentAt(t), n = new THREE.Vector3(-tg.z,0,tg.x).multiplyScalar(1.6);
    pos.push(p.x+n.x, .04, p.z+n.z, p.x-n.x, .04, p.z-n.z); if (i<N){ const a = i*2; idx.push(a,a+1,a+2, a+1,a+3,a+2); } }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.Float32BufferAttribute(pos,3)); pg.setIndex(idx); pg.computeVertexNormals();
  const path = new THREE.Mesh(pg, mat("#E8D2A8",{side:THREE.DoubleSide, flatShading:false})); path.receiveShadow = true; scene.add(path);
  // Arche d'entrée
  const arch = G(box(.8,3.6,.8,mat("#D8C2A0"),-2.4,1.8,0), box(.8,3.6,.8,mat("#D8C2A0"),2.4,1.8,0), box(5.8,.8,1,mat("#D8C2A0"),0,3.9,0));
  arch.add(mesh(new THREE.PlaneGeometry(4,.6), new THREE.MeshStandardMaterial({map:canvasTex(512,80,(g,w,h)=>{ g.fillStyle="#6E4428"; g.fillRect(0,0,w,h); g.fillStyle="#FFE7B0"; g.font="bold 52px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("PARC LUMEN",w/2,h/2+3); })}), 0, 3.9, .52));
  at(arch, curve.getPointAt(0).x, 0, 24.5, -.3); scene.add(arch);
  // Emplacements
  const spots = {};
  BUILDINGS.forEach(b => {
    const p = curve.getPointAt(b.t), tg = curve.getTangentAt(b.t), n = new THREE.Vector3(-tg.z,0,tg.x).normalize();
    const c = p.clone().add(n.multiplyScalar(5.6*b.side)); c.y = 0;
    const g = new THREE.Group(); g.position.copy(c); g.rotation.y = Math.atan2(p.x-c.x, p.z-c.z);
    g.add(mesh(new THREE.CylinderGeometry(3.8,3.8,.12,28), mat("#8ED07A"), 0, .02, 0, false));
    const parts = MODELS[b.id](); parts.forEach(([s,o]) => { o.userData.stage = s; g.add(o); });
    const marker = G(cyl(.1,.1,1.4,mat("#7A5234"),1.6,.7,1.6), box(1.2,.7,.08,mat("#C8955A"),1.6,1.5,1.66));
    const q = new THREE.Sprite(new THREE.SpriteMaterial({map:canvasTex(128,128,(g2,w,h)=>{ g2.fillStyle="#F2A947"; g2.beginPath(); g2.arc(64,64,58,0,7); g2.fill(); g2.fillStyle="#fff"; g2.font="bold 90px sans-serif"; g2.textAlign="center"; g2.textBaseline="middle"; g2.fillText("?",64,70); })}));
    q.scale.set(1.4,1.4,1); q.position.y = 3; marker.add(q); marker.userData.q = q;
    const dirt = mesh(new THREE.CylinderGeometry(2.6,2.6,.06,20), mat("#B89468"), 0, .08, 0, false); marker.add(dirt);
    g.add(marker); g.userData = {b, marker, pop:{}}; spots[b.id] = g; scene.add(g);
  });
  // Arbres, réverbères, bancs, fleurs
  const tooClose = (x,z) => { for (let i=0;i<=60;i++){ const p = curve.getPointAt(i/60); if (Math.hypot(p.x-x,p.z-z) < 3.4) return true; } return Object.values(spots).some(g => Math.hypot(g.position.x-x, g.position.z-z) < 5.2); };
  for (let i=0;i<140;i++){ const a = r()*Math.PI*2, d = Math.sqrt(r())*28, x = Math.cos(a)*d, z = Math.sin(a)*d; if (tooClose(x,z)) continue; at(scene.add(tree(r, .8+r()*.5)) && scene.children[scene.children.length-1], x, 0, z); }
  for (let i=1;i<12;i++){ const t = i/12, p = curve.getPointAt(t), tg = curve.getTangentAt(t), n = new THREE.Vector3(-tg.z,0,tg.x).normalize().multiplyScalar(2.2*(i%2?1:-1));
    const lamp = G(cyl(.08,.12,2.6,mat("#3A3A48"),0,1.3,0), box(.4,.45,.4,glow("#FFD58A"),0,2.8,0), cone(.38,.3,mat("#3A3A48"),0,3.15,0,4)); at(lamp, p.x+n.x, 0, p.z+n.z); scene.add(lamp); }
  const fc = ["#F27BA8","#FFD84A","#FFFFFF","#B48CF2","#FF8A5C"];
  for (let i=0;i<160;i++){ const a = r()*Math.PI*2, d = Math.sqrt(r())*29, x = Math.cos(a)*d, z = Math.sin(a)*d; if (tooClose(x,z)) continue; scene.add(ball(.13, mat(fc[i%5]), x, .12, z, 0)); }
  // Coffre de fin
  const chest = G(box(1.6,1,1.1,mat("#B07A4A"),0,.5,0), box(1.7,.12,1.2,mat("#E0B040",{metalness:.5}),0,1,0), box(.3,.4,.1,mat("#E0B040",{metalness:.5}),0,.75,.58));
  const chestEnd = curve.getPointAt(1); at(chest, chestEnd.x+3, 0, chestEnd.z-1); scene.add(chest);

  function refresh(animId){
    BUILDINGS.forEach(b => { const g = spots[b.id], l = lvl(b.id);
      g.children.forEach(o => { if (o.userData.stage) { const show = o.userData.stage <= l; if (show && !o.visible && b.id === animId) { o.userData.pop = 0; o.scale.setScalar(.01); } o.visible = show; } });
      g.userData.marker.visible = l === 0; });
    chest.visible = !S.chest;
  }
  refresh(); fixSigns(scene);
  const world = {
    name:"Parc Lumen", scene, fx, spots, chest,
    cam:{pos:new THREE.Vector3(0, 30, 30), target:new THREE.Vector3(0, 0, 10)},
    enter(){ controls.enableRotate = false; controls.enablePan = true; controls.screenSpacePanning = false; controls.minDistance = 16; controls.maxDistance = 80; controls.maxPolarAngle = 1.1;
      controls.touches = {ONE:THREE.TOUCH.PAN, TWO:THREE.TOUCH.DOLLY_PAN}; controls.mouseButtons = {LEFT:THREE.MOUSE.PAN, MIDDLE:THREE.MOUSE.DOLLY, RIGHT:THREE.MOUSE.ROTATE}; },
    buy(id){ const b = BUILDINGS.find(x => x.id === id), l = lvl(id); if (l >= 3) return;
      const price = b.prices[l]; if (S.coins < price) return toast(`Il te manque ${price - S.coins} pièces.`);
      S.coins -= price; S.map[id] = l+1; save(); refresh(id);
      const g = spots[id]; puffAt(scene, fx, g.position, 5, 12); if (l+1 === 3) confetti(scene, fx, g.position);
      focusOn(g.position);
      toast(l+1 === 3 ? `${b.n} est terminé${b.n.startsWith("La")?"e":""} !` : `${b.n} : étape ${l+1}/3`);
      if (BUILDINGS.every(x => lvl(x.id) === 3) && !S.chest) setTimeout(() => toast("Parc terminé ! Touche le coffre au bout du chemin."), 1800);
      ui(); },
    tap(){
      const hit = ray.intersectObjects(Object.values(spots).concat([chest]), true)[0]; if (!hit) return;
      let o = hit.object; while (o.parent && !o.userData.b && o !== chest) o = o.parent;
      if (o === chest || hit.object.parent === chest) { if (S.chest) return; if (!BUILDINGS.every(x => lvl(x.id) === 3)) return toast("Le coffre s'ouvre quand tout le parc est construit."); S.chest = true; S.coins += 500; save(); confetti(scene, fx, chest.position); refresh(); toast("+500 pièces ! Un nouveau parc arrivera ici."); return ui(); }
      const b = o.userData.b; if (!b) return;
      if (lvl(b.id) === 0) return world.buy(b.id);
      if (b.world) return goWorld(b.world);
      toast(`${b.n} : ce monde arrive bientôt.`);
    },
    update(dt, t){
      Object.values(spots).forEach(g => { const m = g.userData.marker; if (m.visible) m.userData.q.position.y = 3 + Math.sin(t*2.4 + g.position.x)*.2;
        g.children.forEach(o => { if (o.userData.pop !== undefined && o.userData.pop < 1){ o.userData.pop = Math.min(1, o.userData.pop + dt*2.2); o.scale.setScalar(Math.max(.01, popIn(o.userData.pop))); } }); });
      chest.rotation.y = Math.sin(t)*.15;
      const tg = controls.target; tg.x = Math.max(-14, Math.min(14, tg.x)); tg.z = Math.max(-24, Math.min(26, tg.z));
    }
  };
  return world;
}

/* ============================================================
   MONDE 2 : LA MAISON (jardin + intérieur)
   ============================================================ */
const CELL = 1.6, COLS = 9, ROWS = 9, HALF = CELL*COLS/2;
const HOUSE_CELLS = {c0:3, c1:5, r0:0, r1:2};
const HOUSE_POS = new THREE.Vector3(0, 0, -HALF + 1.5*CELL);
const IN = {cell:1.25, cols:4, rows:3, x0:-2.5, z0:HOUSE_POS.z - 1.9};
const lampLights = [];
function lampLight(g, y, dist){ const l = new THREE.PointLight(0xffc06a, 0, dist||6, 2); l.position.y = y; g.add(l); lampLights.push(l); return g; }
const ITEMS = {
  // Jardin
  banc:{n:"Banc en bois", p:25, z:"g", make:()=>G(box(1.5,.12,.55,mat("#B07A4A"),0,.55,0), box(1.5,.4,.1,mat("#B07A4A"),0,.9,-.25), box(.1,.55,.5,mat("#3A3A48"),-.65,.27,0), box(.1,.55,.5,mat("#3A3A48"),.65,.27,0))},
  lampadaire:{n:"Réverbère", p:35, z:"g", make:()=>lampLight(G(cyl(.08,.12,2.6,mat("#3A3A48"),0,1.3,0), box(.42,.48,.42,glow("#FFD58A"),0,2.8,0), cone(.4,.3,mat("#3A3A48"),0,3.18,0,4)), 2.8)},
  fleurs:{n:"Parterre fleuri", p:20, z:"g", make:()=>{ const g = G(box(1.4,.26,1.4,mat("#8A5A3A"),0,.13,0), box(1.25,.05,1.25,mat("#5A3A22"),0,.27,0)); const c = ["#F27BA8","#FFD84A","#B48CF2","#FF8A5C","#FFFFFF"]; for (let i=0;i<16;i++){ const x = -.45+(i%4)*.3, z = -.45+Math.floor(i/4)*.3; g.add(cyl(.02,.02,.32,mat("#3E8A3A"),x,.42,z)); g.add(ball(.11,mat(c[i%5]),x,.6,z,0)); } return g; }},
  pommier:{n:"Pommier", p:30, z:"g", make:()=>{ const g = G(cyl(.2,.3,1.6,mat("#7A5234"),0,.8,0), ball(1.15,mat("#5DB04E"),0,2.2,0), ball(.8,mat("#6CC25A"),.55,2.6,.3)); [[.7,2,.7],[-.7,2.3,.5],[.3,1.8,-.9],[-.4,2.8,-.4],[.9,2.6,-.2]].forEach(([x,y,z]) => g.add(ball(.13,mat("#E2483E"),x,y,z,0))); return g; }},
  cerisier:{n:"Cerisier en fleurs", p:45, z:"g", make:()=>{ const g = G(cyl(.2,.3,1.7,mat("#5A3A2A"),0,.85,0)); [[0,2.4,0,1.1],[.7,2.7,.3,.75],[-.6,2.6,-.3,.8],[.1,3.1,-.4,.7]].forEach(([x,y,z,s]) => g.add(ball(s,mat("#F7B8D0"),x,y,z))); for (let i=0;i<6;i++) g.add(ball(.08,mat("#FFDCEA"),(Math.random()-.5)*1.6,.05,(Math.random()-.5)*1.6,0)); return g; }},
  fontaine:{n:"Fontaine", p:70, z:"g", make:()=>{ const w = mat("#6EC6F0",{flatShading:false,roughness:.1,transparent:true,opacity:.85}); return G(cyl(.78,.85,.45,mat("#C8C2B8"),0,.22,0,18), cyl(.68,.68,.05,w,0,.44,0,18), cyl(.14,.17,1,mat("#C8C2B8"),0,.8,0), cyl(.42,.22,.2,mat("#C8C2B8"),0,1.35,0,14), cyl(.36,.36,.04,w,0,1.43,0,14), cone(.12,.4,w,0,1.65,0,8)); }},
  statue:{n:"Statue de la Liberté", p:120, z:"g", make:()=>{ const v = mat("#7EC4A8"), vd = mat("#5FA88C"); const arm = cyl(.09,.1,.9,v,.38,3.05,0); arm.rotation.z = -.35; const g = G(box(1.2,.6,1.2,mat("#C8BEA8"),0,.3,0), box(.9,.7,.9,mat("#B8AE98"),0,.95,0), cone(.5,1.9,v,0,2.25,0,10), cone(.4,1.5,vd,.05,2.35,.08,9), cyl(.25,.32,.4,v,0,3.1,0), ball(.24,v,0,3.42,0,2), arm, cone(.12,.3,glow("#FFB13B",1),.55,3.62,0,6), box(.25,.42,.08,vd,-.36,2.6,.2)); for (let i=0;i<7;i++){ const a = -1.2+i*.4; const s = cone(.04,.3,v,Math.sin(a)*.24,3.65+Math.cos(a)*.08,Math.cos(a)*.07,4); s.rotation.z = -a*.8; g.add(s); } return g; }},
  parasol:{n:"Table et parasol", p:45, z:"g", make:()=>G(cyl(.5,.5,.07,mat("#F4EDE0"),0,.72,0,16), cyl(.06,.06,.72,mat("#8A8A96"),0,.36,0), cyl(.035,.035,1.8,mat("#8A8A96"),0,1.3,0), cone(1.1,.5,mat("#F27BA8"),0,2.2,0,12), cyl(.2,.2,.42,mat("#B07A4A"),-.75,.21,0), cyl(.2,.2,.42,mat("#B07A4A"),.75,.21,0))},
  balancoire:{n:"Balançoire", p:50, z:"g", make:()=>{ const w = mat("#8A5A3A"), g = G(box(1.8,.12,.12,w,0,2,0)); [-1,1].forEach(s => { const a = box(.1,2.1,.1,w,s*.85,1,.3); a.rotation.x = .15; const b = box(.1,2.1,.1,w,s*.85,1,-.3); b.rotation.x = -.15; g.add(a,b); }); g.add(box(.03,1.3,.03,mat("#D8CDB8"),-.3,1.3,0), box(.03,1.3,.03,mat("#D8CDB8"),.3,1.3,0), box(.75,.08,.32,mat("#F27BA8"),0,.65,0)); return g; }},
  potager:{n:"Potager", p:35, z:"g", make:()=>{ const g = G(box(1.45,.3,1.45,mat("#8A5A3A"),0,.15,0), box(1.3,.05,1.3,mat("#4A3020"),0,.31,0)); for (let i=0;i<9;i++){ const x = -.45+(i%3)*.45, z = -.45+Math.floor(i/3)*.45; g.add(cone(.14,.38,mat("#5DB04E"),x,.52,z,5)); if (i%2) g.add(ball(.09,mat(i%4===1?"#F7913A":"#E2483E"),x,.38,z+.14,0)); } return g; }},
  mare:{n:"Mare aux nénuphars", p:40, z:"g", make:()=>{ const w = mat("#5AB8E8",{flatShading:false,roughness:.15,transparent:true,opacity:.9}); const g = G(cyl(.8,.8,.1,mat("#A8A29A"),0,.05,0,18), cyl(.7,.7,.07,w,0,.09,0,18)); [[.3,.25],[-.25,-.2],[.1,-.35]].forEach(([x,z]) => g.add(cyl(.16,.16,.02,mat("#5DB04E"),x,.14,z,8))); g.add(ball(.06,mat("#F27BA8"),.3,.18,.25,0)); return g; }},
  puits:{n:"Puits", p:55, z:"g", make:()=>{ const s = mat("#B8B0A0"); const g = G(cyl(.6,.65,.8,s,0,.4,0,14), cyl(.5,.5,.05,mat("#2A3A5A"),0,.78,0,14), box(.1,1.4,.1,mat("#6E4428"),-.5,1.3,0), box(.1,1.4,.1,mat("#6E4428"),.5,1.3,0)); const r1 = box(1.4,.08,.8,mat("#C8403A"),0,2.05,.25); r1.rotation.x = .6; const r2 = box(1.4,.08,.8,mat("#C8403A"),0,2.05,-.25); r2.rotation.x = -.6; g.add(r1, r2, cyl(.12,.12,.25,mat("#8A5A3A"),0,1.5,0)); return g; }},
  barbecue:{n:"Barbecue", p:40, z:"g", make:()=>G(mesh(new THREE.SphereGeometry(.42,14,8,0,Math.PI*2,Math.PI/2,Math.PI/2), mat("#2A2A34"), 0, .95, 0), box(.1,.9,.1,mat("#3A3A48"),-.3,.45,-.3), box(.1,.9,.1,mat("#3A3A48"),.3,.45,.3), box(.1,.9,.1,mat("#3A3A48"),-.3,.45,.3), box(.1,.9,.1,mat("#3A3A48"),.3,.45,-.3), ball(.1,glow("#FF7A3D",1),-.1,1,.05,0), box(.25,.06,.1,mat("#C8603A"),.1,1.02,0))},
  nichoir:{n:"Niche pour chien", p:40, z:"g", make:()=>{ const g = G(box(1.1,.8,1,mat("#C8955A"),0,.4,0), box(.45,.55,.04,mat("#2A1A10"),0,.32,.5)); const r1 = box(1.3,.1,.7,mat("#C8403A"),0,1.02,.27); r1.rotation.x = .7; const r2 = box(1.3,.1,.7,mat("#C8403A"),0,1.02,-.27); r2.rotation.x = -.7; g.add(r1, r2, cyl(.15,.15,.08,mat("#E86A5C"),.55,.04,.75,12)); return g; }},
  moulin:{n:"Moulin à vent", p:90, z:"g", make:()=>{ const g = G(cyl(.45,.7,2.6,mat("#F4EDE0"),0,1.3,0,10), cone(.6,.8,mat("#C8403A"),0,3,0,10)); const blades = new THREE.Group(); for (let i=0;i<4;i++){ const b = box(.18,1.3,.04,mat("#8A5A3A"),0,.65,0); const h = new THREE.Group(); h.add(b); h.rotation.z = i*Math.PI/2; blades.add(h); } blades.position.set(0,2.5,.62); blades.userData.spin = true; g.add(blades, box(.4,.6,.05,mat("#6E4428"),0,.4,.62)); return g; }},
  feu:{n:"Feu de camp", p:30, z:"g", make:()=>{ const g = G(); for (let i=0;i<8;i++){ const a = i/8*Math.PI*2; g.add(ball(.14,mat("#9A9488"),Math.cos(a)*.45,.08,Math.sin(a)*.45,0)); } [0,1.2].forEach(a => { const l = cyl(.06,.06,.7,mat("#6E4428"),0,.12,0); l.rotation.z = Math.PI/2; l.rotation.y = a; g.add(l); }); g.add(cone(.2,.55,glow("#FF8A3D",1.2),0,.42,0,6), cone(.12,.4,glow("#FFE36A",1.4),.05,.4,.03,6)); return lampLight(g, .6, 5); }},
  arche:{n:"Arche fleurie", p:60, z:"g", make:()=>{ const g = G(box(.12,2,.12,mat("#F4EDE0"),-.75,1,0), box(.12,2,.12,mat("#F4EDE0"),.75,1,0)); const tor = mesh(new THREE.TorusGeometry(.75,.07,6,16,Math.PI), mat("#F4EDE0"), 0, 2, 0); g.add(tor); for (let i=0;i<14;i++){ const a = i/13*Math.PI; g.add(ball(.13, mat(i%3?"#5DB04E":(i%2?"#F27BA8":"#FFD84A")), Math.cos(a)*.75, 2+Math.sin(a)*.75, 0, 0)); } return g; }},
  hamac:{n:"Hamac", p:45, z:"g", make:()=>{ const g = G(box(.1,1.5,.1,mat("#6E4428"),-.9,.75,0), box(.1,1.5,.1,mat("#6E4428"),.9,.75,0)); const h = mesh(new THREE.CylinderGeometry(.35,.35,1.6,12,1,true,Math.PI,Math.PI), mat("#F2B84B",{side:THREE.DoubleSide}), 0, 1, 0); h.rotation.z = Math.PI/2; g.add(h); return g; }},
  serre:{n:"Petite serre", p:80, z:"g", make:()=>{ const glass = mat("#CFF0FF",{transparent:true,opacity:.45,flatShading:false,roughness:.1}); const g = G(box(1.3,1,1.3,glass,0,.5,0), box(1.32,.06,1.32,mat("#F4EDE0"),0,1,0)); const r1 = box(1.36,.05,.8,glass,0,1.28,.3); r1.rotation.x = .7; const r2 = box(1.36,.05,.8,glass,0,1.28,-.3); r2.rotation.x = -.7; g.add(r1,r2); for (let i=0;i<4;i++) g.add(cone(.12,.5,mat("#4FB548"),-.35+i*.24,.3,0,5)); return g; }},
  boite:{n:"Boîte aux lettres", p:15, z:"g", make:()=>G(box(.08,1,.08,mat("#6E4428"),0,.5,0), box(.32,.3,.5,mat("#5AA9F0"),0,1.1,0), box(.04,.2,.12,mat("#E2483E"),.18,1.25,.1))},
  epouvantail:{n:"Épouvantail", p:25, z:"g", make:()=>{ const g = G(box(.08,1.6,.08,mat("#6E4428"),0,.8,0), box(1.1,.08,.08,mat("#6E4428"),0,1.25,0), box(.5,.6,.25,mat("#5AA9F0"),0,1.15,0), ball(.22,mat("#F2D29A"),0,1.65,0), cyl(.12,.3,.12,mat("#C8955A"),0,1.85,0), cone(.16,.25,mat("#C8955A"),0,2,0)); return g; }},
  // Intérieur
  canape:{n:"Canapé", p:30, z:"h", make:()=>G(box(1.15,.32,.55,mat("#E86A5C"),0,.32,0), box(1.15,.42,.15,mat("#D45547"),0,.64,-.22), box(.15,.44,.55,mat("#D45547"),-.58,.42,0), box(.15,.44,.55,mat("#D45547"),.58,.42,0), box(.32,.22,.1,mat("#F2B84B"),-.3,.58,-.1))},
  fauteuil:{n:"Fauteuil", p:25, z:"h", make:()=>G(box(.6,.3,.55,mat("#5AA9F0"),0,.3,0), box(.6,.5,.14,mat("#3E86D0"),0,.65,-.22), box(.12,.4,.55,mat("#3E86D0"),-.3,.42,0), box(.12,.4,.55,mat("#3E86D0"),.3,.42,0))},
  table:{n:"Table et chaises", p:30, z:"h", make:()=>{ const g = G(cyl(.42,.42,.06,mat("#B07A4A"),0,.58,0,14), cyl(.05,.07,.55,mat("#8A5A3A"),0,.28,0)); [-1,1].forEach(s => { g.add(box(.32,.06,.32,mat("#C68B55"),s*.62,.34,0)); const b = box(.05,.42,.32,mat("#C68B55"),s*.78,.55,0); g.add(b); }); g.add(ball(.11,mat("#F4A6C0"),0,.68,0,0)); return g; }},
  biblio:{n:"Bibliothèque", p:40, z:"h", make:()=>{ const g = G(box(1.15,1.7,.38,mat("#8A5A3A"),0,.85,-.3)); const c = ["#E05A5A","#4E86D6","#F2B84B","#5DBB72","#9B6ED8"]; [.35,.85,1.35].forEach((y,j) => { for (let i=0;i<6;i++) g.add(box(.13,.32+((i+j)%3)*.05,.26,mat(c[(i+j)%5]),-.42+i*.17,y+.03,-.24)); }); return g; }},
  lampe:{n:"Lampe sur pied", p:20, z:"h", make:()=>lampLight(G(cyl(.15,.18,.05,mat("#3A3A48"),0,.03,0), cyl(.03,.03,1.3,mat("#3A3A48"),0,.65,0), mesh(new THREE.CylinderGeometry(.18,.3,.34,10,1,true), glow("#FFD58A"),0,1.35,0)), 1.3, 4)},
  tapis:{n:"Tapis rond", p:15, z:"h", make:()=>{ const t = cyl(.62,.62,.02,mat("#9B6ED8"),0,.01,0,22); t.scale.z = .75; const u = cyl(.44,.44,.025,mat("#F2B84B"),0,.013,0,22); u.scale.z = .75; return G(t,u); }},
  lit:{n:"Lit douillet", p:35, z:"h", make:()=>G(box(.95,.3,1.2,mat("#8A5A3A"),0,.18,0), box(.9,.15,1.1,mat("#7FA6E0"),0,.4,.04), box(.62,.13,.3,mat("#FFFFFF"),0,.5,-.38), box(.95,.7,.08,mat("#8A5A3A"),0,.5,-.6))},
  cheminee:{n:"Cheminée", p:70, z:"h", make:()=>{ const g = G(box(1.1,1.2,.5,mat("#B8AE98"),0,.6,-.3), box(1.25,.12,.6,mat("#8A5A3A"),0,1.24,-.3), box(.6,.5,.3,mat("#2A1A14"),0,.35,-.18), cone(.16,.35,glow("#FF8A3D",1.3),0,.3,-.1,6), box(.4,1.4,.4,mat("#B8AE98"),0,1.9,-.38)); return lampLight(g, .5, 4); }},
  piano:{n:"Piano", p:90, z:"h", make:()=>G(box(1.15,1,.5,mat("#1E1A22",{roughness:.3}),0,.5,-.3), box(1.15,.06,.25,mat("#FFFFFF"),0,.78,-.02), box(.8,.4,.04,mat("#1E1A22",{roughness:.3}),0,1.15,-.5), box(.5,.08,.3,mat("#2A2430"),0,.4,.3))},
  aquarium:{n:"Aquarium", p:55, z:"h", make:()=>G(box(1,.55,.4,mat("#8A5A3A"),0,.27,-.25), box(1,.6,.38,mat("#8FD3F0",{transparent:true,opacity:.6,flatShading:false,roughness:.1}),0,.85,-.25), ball(.07,mat("#F7A53A"),-.2,.85,-.2,0), ball(.06,mat("#F27BA8"),.2,.95,-.3,0), cone(.05,.3,mat("#3FA36B"),.35,.7,-.25,4))},
  horloge:{n:"Horloge comtoise", p:45, z:"h", make:()=>G(box(.45,1.7,.3,mat("#8A5A3A"),0,.85,-.35), cyl(.17,.17,.04,mat("#FFF6E0"),0,1.45,-.19,16), box(.04,.5,.02,mat("#E0B040",{metalness:.5}),0,.8,-.19))},
  bureau:{n:"Bureau et ordinateur", p:50, z:"h", make:()=>G(box(1.1,.06,.55,mat("#B07A4A"),0,.72,-.2), box(.06,.7,.5,mat("#8A5A3A"),-.5,.36,-.2), box(.06,.7,.5,mat("#8A5A3A"),.5,.36,-.2), box(.5,.36,.05,mat("#2A2A34"),0,1,-.35), box(.44,.3,.02,glow("#6CC4FF",.6),0,1,-.32), box(.4,.03,.15,mat("#DDDDE4"),0,.77,-.05))},
  arcade:{n:"Borne d'arcade", p:80, z:"h", make:()=>{ const s = box(.5,.38,.04,glow("#6CF0B0",.8),0,1.15,.22); s.rotation.x = -.2; return G(box(.62,1.5,.48,mat("#7C4DDB"),0,.75,0), s, box(.62,.12,.32,mat("#5A33B8"),0,.85,.3), ball(.05,mat("#E05A5A"),-.12,.93,.32,0), ball(.05,mat("#F7D54A"),.12,.93,.32,0)); }},
  telescope:{n:"Télescope", p:60, z:"h", make:()=>{ const g = G(); [0,2.1,4.2].forEach(a => { const l = cyl(.025,.025,1.1,mat("#5A4636"),Math.cos(a)*.2,.5,Math.sin(a)*.2); l.rotation.z = Math.cos(a)*.3; l.rotation.x = -Math.sin(a)*.3; g.add(l); }); const t = cyl(.12,.08,1,mat("#4E6FAE"),0,1.1,0,12); t.rotation.z = 1; g.add(t); return g; }},
  globe:{n:"Globe terrestre", p:45, z:"h", make:()=>G(box(.55,.6,.55,mat("#B07A4A"),0,.3,0), cyl(.02,.02,.2,mat("#8A5A3A"),0,.7,0), ball(.27,mat("#6DB7E8"),0,.98,0,2), ball(.13,mat("#6CC27A"),.13,1.02,.16,0), ball(.1,mat("#6CC27A"),-.16,.92,.1,0))},
  plante:{n:"Grande plante", p:15, z:"h", make:()=>{ const g = G(cyl(.24,.18,.38,mat("#D9774A"),0,.19,0,10)); for (let i=0;i<7;i++){ const l = cone(.11,.8,mat("#4FB548"),Math.cos(i)*.13,.65,Math.sin(i)*.13,4); l.rotation.z = Math.cos(i)*.45; l.rotation.x = Math.sin(i)*.45; g.add(l); } return g; }},
  coffre:{n:"Coffre au trésor", p:40, z:"h", make:()=>G(box(.8,.45,.5,mat("#B07A4A"),0,.23,0), box(.84,.08,.54,mat("#E0B040",{metalness:.5}),0,.47,0), box(.16,.2,.04,mat("#E0B040",{metalness:.5}),0,.35,.26), ball(.06,glow("#FFE36A",.8),0,.6,0,0))},
  cheval:{n:"Cheval à bascule", p:30, z:"h", make:()=>{ const g = G(box(.6,.3,.22,mat("#F4EDE0"),0,.55,0), box(.18,.32,.18,mat("#F4EDE0"),.3,.78,0), box(.3,.06,.24,mat("#E86A5C"),0,.72,0)); const rk = mesh(new THREE.TorusGeometry(.5,.04,4,12,Math.PI*.6), mat("#8A5A3A"), 0, .55, .12); rk.rotation.z = Math.PI + Math.PI*.2; const rk2 = rk.clone(); rk2.position.z = -.12; g.add(rk, rk2); return g; }}
};

function makeHome(){
  const scene = new THREE.Scene();
  const L = lights(scene, {span:22, sx:14, sz:10});
  const fx = [], r = rng(7);
  scene.add(mesh(new THREE.CylinderGeometry(15.5,15.5,.5,44), mat("#7CC46A"), 0, -.25, 0, false));
  scene.add(mesh(new THREE.CylinderGeometry(15.4,13.6,2.6,44), mat("#8A5A3A"), 0, -1.8, 0, false));
  const c0 = cone(13.6,6.5,mat("#6E5A4A"),0,-6.35,0,9); c0.rotation.x = Math.PI; scene.add(c0);
  for (let i=0;i<26;i++){ const a = i/26*Math.PI*2 + r()*.12, rad = 12.2+r()*2.4, x = Math.cos(a)*rad, z = Math.sin(a)*rad;
    if (z > 8 && Math.abs(x) < 3) continue; if (x + z > 10) { const b = ball(.6+r()*.3, mat("#5DB04E"), x, .3, z); b.scale.y = .75; scene.add(b); continue; } scene.add(at(tree(r, 1+r()*.3), x, 0, z)); }
  const fc = ["#F27BA8","#FFD84A","#FFFFFF","#B48CF2","#FF8A5C"];
  for (let i=0;i<90;i++){ const a = r()*Math.PI*2, d = 8+r()*6.8, x = Math.cos(a)*d, z = Math.sin(a)*d; if (Math.abs(x) < HALF+.4 && Math.abs(z) < HALF+.4) continue; scene.add(ball(.1, mat(fc[i%5]), x, .1, z, 0)); }
  const post = mat("#F4EDE0"), F = HALF + .3;
  for (let i=0;i<=18;i++){ const p = -F + i*2*F/18; [[p,-F],[p,F],[-F,p],[F,p]].forEach(([x,z]) => { if (z === F && Math.abs(x) < 1.3) return; scene.add(box(.15,.75,.15,post,x,.37,z)); }); }
  [[0,-F,2*F,0],[-(F+1.3)/2,F,F-1.3,0],[(F+1.3)/2,F,F-1.3,0],[-F,0,2*F,1],[F,0,2*F,1]].forEach(([x,z,len,rot]) => [.3,.6].forEach(y => { const b = box(len,.08,.06,post,x,y,z); if (rot) b.rotation.y = Math.PI/2; scene.add(b); }));
  for (let i=0;i<10;i++){ const s = cyl(.45,.45,.06, mat("#D8CDB8"), (i%2?.25:-.25), .03, F+1 - i*.95, 8); s.castShadow = false; scene.add(s); }
  // Maison
  const house = new THREE.Group(); house.position.copy(HOUSE_POS); scene.add(house);
  const roofG = new THREE.Group(), frontG = new THREE.Group();
  const W = 5.6, D = 4.2, H = 2.7, T = .2, cream = mat("#F4E6CC"), wood = mat("#6E4428");
  house.add(box(W+.4,.35,D+.4,mat("#A8A29A"),0,.17,0), box(W-.3,.06,D-.3,mat("#C08A5A"),0,.38,0));
  for (let i=-2;i<=2;i++) house.add(box(.03,.065,D-.3,mat("#9A6A40"),i*1.05,.385,0));
  house.add(box(W,H,T,cream,0,.35+H/2,-D/2+T/2), box(T,H,D,cream,-W/2+T/2,.35+H/2,0), box(T,H,D,cream,W/2-T/2,.35+H/2,0), box(W-.4,H-.1,.05,mat("#F2D2C0"),0,.35+H/2,-D/2+T+.03));
  [-1,1].forEach(s => house.add(box(.06,.8,.9,glow("#FFD58A"),s*(W/2+.01),1.8,0)));
  frontG.add(box(1.9,H,T,cream,-W/2+.95,.35+H/2,D/2-T/2), box(1.9,H,T,cream,W/2-.95,.35+H/2,D/2-T/2), box(1.8,.9,T,cream,0,.35+H-.45,D/2-T/2), box(1,1.75,.12,mat("#8A5A3A"),0,.35+.88,D/2-.04));
  [-1,1].forEach(s => { frontG.add(box(.95,.8,.06,glow("#FFD58A"),s*1.85,1.8,D/2+.01), box(.06,.8,.08,wood,s*1.85,1.8,D/2+.04), box(.95,.06,.08,wood,s*1.85,1.8,D/2+.04), box(1.1,.22,.3,mat("#8A5A3A"),s*1.85,1.27,D/2+.15));
    ["#F27BA8","#FFD84A","#B48CF2","#FFFFFF"].forEach((c,i) => frontG.add(ball(.11,mat(c),s*1.85-.38+i*.25,1.45,D/2+.17,0))); });
  frontG.add(box(.16,H,.1,wood,-W/2+.1,.35+H/2,D/2+.02), box(.16,H,.1,wood,W/2-.1,.35+H/2,D/2+.02), box(W,.14,.1,wood,0,.35+H,D/2+.02), box(1.6,.14,.5,mat("#A8A29A"),0,.07,D/2+.45));
  const ang = .62, half = D/2+.5, len = half/Math.cos(ang);
  [-1,1].forEach(s => { const p = box(W+.9,.22,len,mat("#9A86D8"),0,.35+H+Math.sin(ang)*len/2,s*half/2); p.rotation.x = s*ang; roofG.add(p); });
  const tri = new THREE.Shape(); tri.moveTo(-D/2,0); tri.lineTo(D/2,0); tri.lineTo(0,Math.tan(ang)*D/2); tri.lineTo(-D/2,0);
  [-1,1].forEach(s => { const g = mesh(new THREE.ExtrudeGeometry(tri,{depth:.2,bevelEnabled:false}), cream, s>0?W/2-.2:-W/2, .35+H, 0); g.rotation.y = Math.PI/2; roofG.add(g); const w = mesh(new THREE.CircleGeometry(.28,16), glow("#FFD58A"), s*(W/2+.01), .35+H+.55, 0, false); w.rotation.y = s*Math.PI/2; roofG.add(w); });
  roofG.add(box(.6,1.4,.6,mat("#B4553A"),1.5,.35+H+1.2,-.6), box(.72,.14,.72,mat("#8A3A26"),1.5,.35+H+1.9,-.6));
  house.add(frontG, roofG);
  const homeLight = new THREE.PointLight(0xffb45a, 0, 9, 2); homeLight.position.set(0, 2.3, 0); house.add(homeLight);
  // Grilles
  const cellPos = (c, rr) => new THREE.Vector3(-HALF + CELL/2 + c*CELL, 0, -HALF + CELL/2 + rr*CELL);
  const inHouse = (c, rr) => c >= HOUSE_CELLS.c0 && c <= HOUSE_CELLS.c1 && rr >= HOUSE_CELLS.r0 && rr <= HOUSE_CELLS.r1;
  const inPos = (c, rr) => new THREE.Vector3(IN.x0 + IN.cell/2 + c*IN.cell, .41, IN.z0 + IN.cell/2 + rr*IN.cell);
  const ground = mesh(new THREE.PlaneGeometry(2*HALF, 2*HALF), new THREE.MeshBasicMaterial({visible:false}), 0, .02, 0, false); ground.rotation.x = -Math.PI/2; scene.add(ground);
  const floorPick = mesh(new THREE.PlaneGeometry(IN.cols*IN.cell, IN.rows*IN.cell), new THREE.MeshBasicMaterial({visible:false}), 0, .42, HOUSE_POS.z, false); floorPick.rotation.x = -Math.PI/2; scene.add(floorPick);
  const hover = mesh(new THREE.PlaneGeometry(CELL*.92, CELL*.92), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.35}), 0, .05, 0, false); hover.rotation.x = -Math.PI/2; hover.visible = false; scene.add(hover);
  const placed = new THREE.Group(); scene.add(placed);
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({length:900},()=>0).map((_,i,a)=>{ if (i%3) return a[i]; const t = Math.random()*Math.PI*2, e = Math.random()*1.2+.15, R = 90; a[i] = R*Math.cos(t)*Math.cos(e); a[i+1] = R*Math.sin(e); a[i+2] = R*Math.sin(t)*Math.cos(e); return a[i]; }), 3)), new THREE.PointsMaterial({color:0xffffff, size:.6}));
  scene.add(stars);
  // Promeneurs
  const walkers = [];
  function creatureTexture(c){ const defs = GLOBAL_DEFS.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, ""); const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 116" width="256" height="248">${defs}<g filter="url(#paint)">${c.draw()}</g></svg>`; const t = new THREE.TextureLoader().load("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)); t.encoding = THREE.sRGBEncoding; return t; }
  function freeCell(){ for (let k=0;k<40;k++){ const c = Math.floor(Math.random()*COLS), rr = Math.floor(Math.random()*ROWS); if (inHouse(c, rr) || S.garden.some(e => e.c===c && e.r===rr)) continue; return cellPos(c, rr).add(new THREE.Vector3((Math.random()-.5)*.6, 0, (Math.random()-.5)*.6)); } return new THREE.Vector3(0,0,5); }
  [[CREATURES.find(c => c.n==="Voile") || CREATURES[0], -3, 4], [RIXY, 3, 5]].forEach(([c,x,z]) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({map:creatureTexture(c), transparent:true})); sp.scale.set(1.6,1.55,1); sp.center.set(.5,.05);
    const sh = mesh(new THREE.CircleGeometry(.42,16), new THREE.MeshBasicMaterial({color:0, transparent:true, opacity:.22}), 0, .03, 0, false); sh.rotation.x = -Math.PI/2; const g = G(sp, sh); g.position.set(x,0,z); scene.add(g); walkers.push({g, sp, target:g.position.clone(), wait:Math.random()*2, ph:Math.random()*6}); });

  let mode = "garden";
  function rebuild(){
    lampLights.length = 0; while (placed.children.length) placed.remove(placed.children[0]);
    const add = (e, zone) => { const it = ITEMS[e.id]; if (!it) return; const o = it.make(); o.traverse(m => { if (m.isMesh){ m.castShadow = true; m.receiveShadow = true; } });
      o.position.copy(zone === "g" ? cellPos(e.c, e.r) : inPos(e.c, e.r)); o.rotation.y = (e.rot||0)*Math.PI/2; o.userData = {entry:e, zone}; if (e === lastAdded) { o.userData.pop = 0; o.scale.setScalar(.01); } placed.add(o); };
    S.garden.forEach(e => add(e, "g")); S.inside.forEach(e => add(e, "h")); applyNight();
  }
  let lastAdded = null;
  function applyNight(){
    const n = S.night; scene.background = sky(n ? "#161A3A" : "#9FD6F0"); scene.fog = new THREE.Fog(sky(n ? "#161A3A" : "#9FD6F0"), 50, 110);
    L.hemi.intensity = n ? .3 : .8; L.sun.intensity = n ? .28 : 1.3; L.sun.color.set(n ? 0x9ab0ff : 0xfff1d6); stars.visible = n;
    glowMats.forEach(m => m.emissiveIntensity = n ? Math.max(1.2, m.userData.base) : m.userData.base);
    lampLights.forEach(l => l.intensity = n ? 1.6 : 0); homeLight.intensity = (n || mode === "inside") ? 1.4 : 0;
  }
  const world = {
    name:"La Maison", scene, fx, tool:"place", selected:null,
    get mode(){ return mode; },
    cam:{pos:new THREE.Vector3(19, 18, 22), target:new THREE.Vector3(0,0,0)},
    enter(){ mode = "garden"; roofG.visible = frontG.visible = true; walkers.forEach(w => w.g.visible = true); world.cam = {pos:new THREE.Vector3(19,18,22), target:new THREE.Vector3(0,0,0)};
      controls.enableRotate = true; controls.enablePan = false; controls.minDistance = 9; controls.maxDistance = 60; controls.maxPolarAngle = 1.25;
      controls.touches = {ONE:THREE.TOUCH.ROTATE, TWO:THREE.TOUCH.DOLLY_PAN}; controls.mouseButtons = {LEFT:THREE.MOUSE.ROTATE, MIDDLE:THREE.MOUSE.DOLLY, RIGHT:THREE.MOUSE.PAN}; applyNight(); rebuild(); },
    inside(){ mode = "inside"; roofG.visible = frontG.visible = false; walkers.forEach(w => w.g.visible = false); world.selected = null; flyTo(new THREE.Vector3(0, 7.4, HOUSE_POS.z + 7.6), new THREE.Vector3(0, .6, HOUSE_POS.z)); controls.minDistance = 4; controls.maxDistance = 15; applyNight(); ui(); },
    outside(){ mode = "garden"; roofG.visible = frontG.visible = true; walkers.forEach(w => w.g.visible = true); world.selected = null; flyTo(new THREE.Vector3(19,18,22), new THREE.Vector3(0,0,0)); controls.minDistance = 9; controls.maxDistance = 48; applyNight(); ui(); },
    night(){ applyNight(); },
    cellAt(){ if (mode === "garden"){ const h = ray.intersectObject(ground)[0]; if (!h) return null; const c = Math.floor((h.point.x+HALF)/CELL), rr = Math.floor((h.point.z+HALF)/CELL); if (c<0||rr<0||c>=COLS||rr>=ROWS) return null; return {c, r:rr, pos:cellPos(c,rr), blocked:inHouse(c,rr)}; }
      const h = ray.intersectObject(floorPick)[0]; if (!h) return null; const c = Math.floor((h.point.x-IN.x0)/IN.cell), rr = Math.floor((h.point.z-IN.z0)/IN.cell); if (c<0||rr<0||c>=IN.cols||rr>=IN.rows) return null; return {c, r:rr, pos:inPos(c,rr)}; },
    hover(show){ if (!show) { hover.visible = false; return; } const cell = world.cellAt(); hover.visible = !!cell; if (cell){ hover.position.set(cell.pos.x, mode==="garden"?.05:.45, cell.pos.z); hover.scale.setScalar(mode==="garden"?1:IN.cell/CELL); hover.material.color.set(cell.blocked ? 0xff6a6a : 0xffffff); } },
    tap(){
      const zone = mode === "garden" ? "g" : "h", list = zone === "g" ? S.garden : S.inside;
      const hits = ray.intersectObjects(placed.children, true);
      if (hits.length && (world.tool !== "place" || !world.selected)) { let o = hits[0].object; while (o.parent && o.parent !== placed) o = o.parent; const {entry, zone:z2} = o.userData; if (z2 !== zone) return;
        if (world.tool === "remove") { list.splice(list.indexOf(entry), 1); S.coins += ITEMS[entry.id].p; toast(`${ITEMS[entry.id].n} rangé, ${ITEMS[entry.id].p} pièces rendues.`); }
        else entry.rot = ((entry.rot||0)+1) % 4;
        save(); rebuild(); return ui(); }
      if (mode === "garden" && !world.selected && ray.intersectObject(house, true).length) return world.inside();
      if (!world.selected) return;
      const cell = world.cellAt(); if (!cell) return; const it = ITEMS[world.selected];
      if (cell.blocked) return toast("Cet emplacement est occupé par la maison.");
      if (list.some(x => x.c===cell.c && x.r===cell.r)) return toast("Il y a déjà quelque chose ici. Choisis « Ranger » pour libérer la place.");
      if (S.coins < it.p) return toast(`Il te manque ${it.p - S.coins} pièces.`);
      S.coins -= it.p; lastAdded = {id:world.selected, c:cell.c, r:cell.r, rot:0}; list.push(lastAdded); save(); rebuild(); puffAt(scene, fx, cell.pos, 1, 4); ui();
    },
    update(dt, t){
      placed.children.forEach(o => { if (o.userData.pop !== undefined && o.userData.pop < 1){ o.userData.pop = Math.min(1, o.userData.pop + dt*3); o.scale.setScalar(Math.max(.01, popIn(o.userData.pop))); } o.traverse(c => { if (c.userData.spin) c.rotation.z += dt*.8; }); });
      walkers.forEach(w => { const d = w.target.clone().sub(w.g.position); d.y = 0; if (d.length() < .05){ w.wait -= dt; if (w.wait <= 0){ w.target = freeCell(); w.wait = 1.5+Math.random()*3; } w.sp.position.y = 0; } else { w.g.position.add(d.normalize().multiplyScalar(dt*1.2)); w.sp.position.y = Math.abs(Math.sin(t*9+w.ph))*.12; } });
    }
  };
  return world;
}

/* ============================================================
   MONDE 3 : LE CASINO
   ============================================================ */
const WHEEL = [10,25,15,50,10,30,20,100];
function makeCasino(){
  const scene = new THREE.Scene(); scene.background = sky("#120814");
  const hemi = new THREE.HemisphereLight(0xffd6b0, 0x401020, .55); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe0c0, .7); key.position.set(6, 14, 10); key.castShadow = true; key.shadow.mapSize.set(2048,2048); Object.assign(key.shadow.camera, {left:-14,right:14,top:14,bottom:-14}); scene.add(key);
  const fx = [];
  const carpet = canvasTex(512,512,(g,w,h)=>{ g.fillStyle="#7A1424"; g.fillRect(0,0,w,h); g.strokeStyle="#C89A3A"; g.lineWidth=3; for (let i=-8;i<16;i++){ g.beginPath(); g.moveTo(i*48,0); g.lineTo(i*48+512,512); g.stroke(); g.beginPath(); g.moveTo(i*48+512,0); g.lineTo(i*48,512); g.stroke(); } g.fillStyle="#E0B040"; for (let x=0;x<11;x++) for (let y=0;y<11;y++){ g.beginPath(); g.arc(x*48+24, y*48, 4, 0, 7); g.fill(); } });
  carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(3,2.4);
  const floor = mesh(new THREE.PlaneGeometry(18,14), new THREE.MeshStandardMaterial({map:carpet, roughness:.95}), 0, 0, 0, false); floor.rotation.x = -Math.PI/2; scene.add(floor);
  const wall = mat("#4A0E1C"), gold = mat("#E0B040",{metalness:.6, roughness:.3});
  scene.add(box(18,6,.4,wall,0,3,-7), box(.4,6,14,wall,-9,3,0), box(.4,6,14,wall,9,3,0));
  scene.add(box(18,.25,.5,gold,0,5.9,-6.9), box(18,.25,.5,gold,0,.12,-6.9), box(.5,.25,14,gold,-8.9,.12,0), box(.5,.25,14,gold,8.9,.12,0));
  for (let i=-3;i<=3;i++) scene.add(box(.14,5.6,.1,gold,i*2.6,3,-6.78));
  // Enseigne néon
  const neon = mesh(new THREE.PlaneGeometry(7,1.6), new THREE.MeshStandardMaterial({map:canvasTex(1024,232,(g,w,h)=>{ g.fillStyle="#1A0610"; g.fillRect(0,0,w,h); g.shadowColor="#FF5AC8"; g.shadowBlur=30; g.fillStyle="#FFB6EC"; g.font="bold 120px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("LUMEN CASINO",w/2,h/2+6); }), emissive:0xffffff, emissiveIntensity:.9, emissiveMap:null}), 0, 5.15, -6.75, false); neon.scale.set(.8,.75,1); scene.add(neon);
  // Lustres
  [-4.5,4.5].forEach(x => { const l = G(cyl(.03,.03,1.2,gold,0,.6,0), cyl(.9,.4,.3,gold,0,0,0,12)); for (let i=0;i<8;i++){ const a = i/8*Math.PI*2; l.add(ball(.13,glow("#FFE7A0",1.2),Math.cos(a)*.8,.2,Math.sin(a)*.8,0)); } const pl = new THREE.PointLight(0xffd08a, 1.4, 14, 2); l.add(pl); l.position.set(x, 5.2, -1); scene.add(l); });
  // Écran des courses de chevaux
  const race = new THREE.Group(); race.position.set(-4.6, -.3, -6.6);
  const raceTex = canvasTex(640,400,(g,w,h)=>{ g.fillStyle="#1A0A10"; g.fillRect(0,0,w,h); g.fillStyle="#3E8A3A"; g.fillRect(20,70,w-40,h-90);
    for (let k=0;k<5;k++){ g.fillStyle = k%2 ? "#4FA048" : "#5AB050"; g.fillRect(20,70+k*(h-90)/5,w-40,(h-90)/5); }
    g.fillStyle="#fff"; g.fillRect(w-70,70,8,h-90); const cs = ["#E84A5A","#5AA9F0","#F2C440","#B48CF2","#6CC27A"];
    cs.forEach((c,k) => { g.fillStyle=c; g.beginPath(); g.arc(80+k*70, 70+(k+.5)*(h-90)/5, 20, 0, 7); g.fill(); });
    g.fillStyle="#FFE36A"; g.font="bold 46px sans-serif"; g.textAlign="center"; g.fillText("COURSES DE CHEVAUX", w/2, 50); });
  race.add(box(5,3.3,.3,gold,0,2.9,0), mesh(new THREE.PlaneGeometry(4.7,2.95), new THREE.MeshStandardMaterial({map:raceTex, emissive:0xffffff, emissiveMap:raceTex, emissiveIntensity:.5}), 0, 2.9, .16, false));
  scene.add(race);
  // Roue de la fortune
  const wheel = new THREE.Group(); wheel.position.set(3.6, 3.1, -6.6);
  const disc = mesh(new THREE.CylinderGeometry(1.9,1.9,.2,48), new THREE.MeshStandardMaterial({map:canvasTex(512,512,(g,w,h)=>{ const cols = ["#E84A5A","#F2C440","#5AA9F0","#6CC27A","#B48CF2","#F27BA8","#FF8A3D","#3FD8C8"]; for (let i=0;i<8;i++){ g.fillStyle=cols[i]; g.beginPath(); g.moveTo(256,256); g.arc(256,256,256,i*Math.PI/4,(i+1)*Math.PI/4); g.fill(); g.save(); g.translate(256,256); g.rotate(i*Math.PI/4+Math.PI/8); g.fillStyle="#fff"; g.font="bold 52px sans-serif"; g.textAlign="right"; g.textBaseline="middle"; g.fillText(WHEEL[i],226,0); g.restore(); } g.fillStyle="#E0B040"; g.beginPath(); g.arc(256,256,34,0,7); g.fill(); }), roughness:.5}), 0, 0, 0);
  disc.rotation.x = Math.PI/2; const spinner = G(disc); wheel.add(spinner, mesh(new THREE.TorusGeometry(1.95,.12,8,48), gold, 0, 0, .05));
  for (let i=0;i<16;i++){ const a = i/16*Math.PI*2; wheel.add(ball(.08, glow("#FFE7A0",1), Math.cos(a)*1.95, Math.sin(a)*1.95, .2, 0)); }
  const pointer = cone(.25,.55,gold,0,2.2,.2,4); pointer.rotation.z = Math.PI; wheel.add(pointer, box(.3,2.6,.3,gold,0,-2.4,-.1)); scene.add(wheel);
  // Tables décoratives
  const felt = mat("#1E7A4A");
  const roul = G(cyl(1.5,1.5,.18,gold,0,.95,0,24), cyl(1.4,1.4,.2,felt,0,.98,0,24), cyl(.7,.7,.06,mat("#2A1A14"),0,1.1,0,24), cyl(.25,.4,.95,mat("#5A2A1A"),0,.47,0,12));
  for (let i=0;i<12;i++){ const a = i/12*Math.PI*2; roul.add(box(.12,.04,.25,mat(i%2?"#E2323A":"#1A1A1A"),Math.cos(a)*.55,1.14,Math.sin(a)*.55)); }
  at(roul, 3.6, 0, 1.4); scene.add(roul);
  const roulDisc = roul.children[2];
  const cards = G(box(3,.18,1.6,felt,0,1,0), box(3.1,.12,1.7,gold,0,.9,0), box(.3,.9,.3,mat("#5A2A1A"),-1.2,.45,0), box(.3,.9,.3,mat("#5A2A1A"),1.2,.45,0));
  for (let i=0;i<5;i++) cards.add(box(.24,.02,.34,mat("#FFFFFF"),-.6+i*.3,1.1,.2));
  for (let i=0;i<4;i++) cards.add(cyl(.12,.12,.08+i*.04,mat(["#E2323A","#5AA9F0","#F2C440","#1A1A1A"][i]),.9-i*.25,1.12,-.35,12));
  const bjSign = mesh(new THREE.PlaneGeometry(2,.5), new THREE.MeshStandardMaterial({map:canvasTex(512,128,(g,w,h)=>{ g.fillStyle="#2A0A12"; g.fillRect(0,0,w,h); g.fillStyle="#FFE36A"; g.font="bold 80px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("BLACKJACK",w/2,h/2+4); }), emissive:0xffffff, emissiveIntensity:.5}), 0, 1.75, -.7); cards.add(bjSign, box(.08,.7,.08,gold,0,1.3,-.75));
  at(cards, -3.6, 0, 1.4); scene.add(cards);
  const rSign = mesh(new THREE.PlaneGeometry(2,.5), new THREE.MeshStandardMaterial({map:canvasTex(512,128,(g,w,h)=>{ g.fillStyle="#2A0A12"; g.fillRect(0,0,w,h); g.fillStyle="#FFE36A"; g.font="bold 80px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText("ROULETTE",w/2,h/2+4); }), emissive:0xffffff, emissiveIntensity:.5}), 0, 2.2, -1.6); roul.add(rSign, box(.08,1.2,.08,gold,0,1.6,-1.6));
  [[-6.5,-5],[6.5,-5],[-6.5,4],[6.5,4]].forEach(([x,z]) => { const p = G(cyl(.3,.24,.6,mat("#2A1A14"),0,.3,0,10)); for (let i=0;i<6;i++){ const l = cone(.12,1,mat("#3FA36B"),Math.cos(i)*.14,1,Math.sin(i)*.14,4); l.rotation.z = Math.cos(i)*.4; l.rotation.x = Math.sin(i)*.4; p.add(l); } at(p, x, 0, z); scene.add(p); });
  fixSigns(scene);
  let spin = null;
  const world = {
    name:"Le Casino", scene, fx, wheel, spinRoulette(on){ world._rs = on; },
    cam:{pos:new THREE.Vector3(0, 9, 13), target:new THREE.Vector3(0, 1.8, -2)},
    enter(){ controls.enableRotate = true; controls.enablePan = false; controls.minDistance = 7; controls.maxDistance = 20; controls.maxPolarAngle = 1.3; controls.minAzimuthAngle = -.9; controls.maxAzimuthAngle = .9;
      controls.touches = {ONE:THREE.TOUCH.ROTATE, TWO:THREE.TOUCH.DOLLY_PAN}; controls.mouseButtons = {LEFT:THREE.MOUSE.ROTATE, MIDDLE:THREE.MOUSE.DOLLY, RIGHT:THREE.MOUSE.PAN}; },
    leave(){ controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity; },
    tap(){
      if (ray.intersectObject(roul, true).length) return openGame("roulette");
      if (ray.intersectObject(cards, true).length) return openGame("blackjack");
      if (ray.intersectObject(race, true).length) return openGame("courses");
      if (ray.intersectObject(wheel, true).length) {
        if (spin) return;
        if (S.wheelDay === today()) return toast("Tu as déjà fait tourner la roue aujourd'hui. Reviens demain !");
        const k = Math.floor(Math.random()*8), start = spinner.rotation.z;
        // Le segment k doit finir sous le pointeur (en haut)
        const goal = start + Math.PI*2*5 + ((Math.PI/2 - (k*Math.PI/4 + Math.PI/8)) - start % (Math.PI*2));
        spin = {t:0, start, goal, k}; S.wheelDay = today(); save();
      }
    },
    update(dt, t){
      if (world._rs) roulDisc.rotation.y += dt*9;
      neon.material.emissiveIntensity = .75 + Math.sin(t*3)*.15 + (Math.random() < .02 ? -.4 : 0);
      if (spin){ spin.t = Math.min(1, spin.t + dt/4); const e = 1 - Math.pow(1-spin.t, 3); spinner.rotation.z = spin.start + (spin.goal - spin.start)*e;
        if (spin.t >= 1){ const prize = WHEEL[spin.k]; S.coins += prize; save(); confetti(scene, fx, new THREE.Vector3(3.6, 1, -5)); toast(`Roue de la fortune : +${prize} pièces !`); spin = null; ui(); } }
    }
  };
  return world;
}

/* ============================================================
   Pilotage commun
   ============================================================ */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(ev){ const r = renderer.domElement.getBoundingClientRect(); ndc.set(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1); ray.setFromCamera(ndc, camera); }
let worlds = {}, cur = null, fly = null;
function flyTo(pos, target){ fly = {pos, target}; }
function focusOn(p){ fly = {pos:new THREE.Vector3(p.x, camera.position.y, p.z + (camera.position.z - controls.target.z)), target:new THREE.Vector3(p.x, 0, p.z)}; }
function goWorld(name, instant){
  if (cur && cur.leave) cur.leave();
  cur = worlds[name]; cur.key = name; cur.enter();
  if (instant || !fly) { camera.position.copy(cur.cam.pos); controls.target.copy(cur.cam.target); }
  // Écran en hauteur (téléphone) : on recule la caméra pour voir plus large
  const k = camera.aspect < 1 ? (cur.key === "map" ? 1.6 : 1.35) : 1;
  const goal = cur.cam.target.clone().add(cur.cam.pos.clone().sub(cur.cam.target).multiplyScalar(k));
  camera.position.copy(cur.cam.target.clone().add(goal.clone().sub(cur.cam.target).multiplyScalar(1.25))); controls.target.copy(cur.cam.target); flyTo(goal, cur.cam.target);
  if (cur.key !== "map") toast(cur.key === "home" ? "Bienvenue chez toi ! Touche la maison pour entrer." : "Touche une table pour jouer : roulette, blackjack ou courses.");
  ui();
}
let down = null;
renderer.domElement.addEventListener("pointerdown", e => { down = {x:e.clientX, y:e.clientY}; });
renderer.domElement.addEventListener("pointermove", e => { if (e.pointerType !== "mouse" || !cur || cur.key !== "home") return; pick(e); cur.hover(!!cur.selected || cur.tool !== "place"); });
renderer.domElement.addEventListener("pointerup", e => { if (!down || Math.hypot(e.clientX-down.x, e.clientY-down.y) > 7) return; pick(e); cur.tap(); });

/*__GAMES__*/
/* ---------- Interface ---------- */
const $ = id => document.getElementById(id);
let toastT;
function toast(t){ const el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 2800); }
const THUMBS = {};
function makeThumbs(){
  const tr = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true}); tr.setSize(180,180); tr.outputEncoding = THREE.sRGBEncoding; tr.toneMapping = THREE.ACESFilmicToneMapping;
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x88aa66, 1)); const dl = new THREE.DirectionalLight(0xffffff, .9); dl.position.set(5,10,7); sc.add(dl);
  const cam = new THREE.PerspectiveCamera(32, 1, .1, 100);
  BUILDINGS.forEach(b => { const g = new THREE.Group(); MODELS[b.id]().forEach(([s,o]) => g.add(o)); g.add(mesh(new THREE.CylinderGeometry(3.6,3.6,.2,24), mat("#8ED07A"), 0, -.1, 0)); sc.add(g);
    const bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3()).length();
    cam.position.set(c.x + sz*.75, c.y + sz*.55, c.z + sz*.95); cam.lookAt(c); tr.render(sc, cam); THUMBS[b.id] = tr.domElement.toDataURL(); sc.remove(g); });
  tr.dispose();
}
function ui(){
  $("coins").textContent = Math.floor(S.coins);
  if (!cur) return;
  $("where").textContent = cur.key === "home" ? (cur.mode === "inside" ? "Dans la maison" : "Le jardin") : cur.name;
  $("back").hidden = cur.key === "map";
  $("back").textContent = cur.key === "home" && cur.mode === "inside" ? "Retour au jardin" : "Retour au parc";
  $("night").hidden = cur.key !== "home";
  $("night").textContent = S.night ? "Jour" : "Nuit";
  $("shelf").hidden = cur.key !== "map"; $("drawer").hidden = cur.key !== "home";
  if (cur.key === "map") {
    const done = BUILDINGS.filter(b => lvl(b.id) === 3).length;
    $("hint").textContent = done === BUILDINGS.length ? (S.chest ? "Parc terminé ! Un nouveau parc arrive bientôt." : "Tout est construit : touche le coffre au bout du chemin !") : "Achète les bâtiments en bas. Touche un bâtiment construit pour visiter son monde.";
    $("shelf").innerHTML = BUILDINGS.map(b => { const l = lvl(b.id), price = l < 3 ? b.prices[l] : 0;
      return `<button class="bcard ${l===3?"done":""}" data-b="${b.id}" ${l<3 && S.coins<price ? 'data-poor="1"' : ""}><span class="pips">${[1,2,3].map(i => `<i class="${i<=l?"on":""}"></i>`).join("")}</span>${THUMBS[b.id]?`<img src="${THUMBS[b.id]}" alt="">`:""}<span class="bn">${b.n}</span><span class="bp">${l<3 ? `<span class="coin"></span>${price}` : (b.world ? "Visiter" : "Terminé")}</span></button>`; }).join("");
  } else if (cur.key === "home") {
    const zone = cur.mode === "inside" ? "h" : "g";
    $("hint").textContent = cur.tool === "rotate" ? "Touche un objet pour le faire pivoter." : cur.tool === "remove" ? "Touche un objet pour le ranger. Ses pièces te sont rendues." : cur.selected ? `Touche une case libre pour poser : ${ITEMS[cur.selected].n}.` : (zone === "g" ? "Choisis un objet, ou touche la maison pour entrer." : "Choisis un meuble à poser dans la pièce.");
    $("tools").innerHTML = [["place","Poser"],["rotate","Pivoter"],["remove","Ranger"]].map(([k,n]) => `<button data-tool="${k}" aria-pressed="${cur.tool===k}">${n}</button>`).join("");
    $("cat").innerHTML = Object.keys(ITEMS).filter(k => ITEMS[k].z === zone).sort((a,b) => ITEMS[a].p - ITEMS[b].p).map(k => { const it = ITEMS[k], n = (zone==="g"?S.garden:S.inside).filter(x=>x.id===k).length;
      return `<button class="item" data-item="${k}" aria-pressed="${cur.selected===k}" ${S.coins < it.p ? 'data-poor="1"' : ""}><span class="nm">${it.n}</span><span class="pr"><span class="coin"></span>${it.p}${n?` · ${n} posé${n>1?"s":""}`:""}</span></button>`; }).join("");
  } else $("hint").textContent = "Touche la roulette, la table de blackjack ou l'écran des courses. La roue au fond offre un tour gratuit par jour.";
}
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.b) { const id = b.dataset.b, bd = BUILDINGS.find(x => x.id === id); if (lvl(id) < 3) return worlds.map.buy(id); return bd.world ? goWorld(bd.world) : (focusOn(worlds.map.spots[id].position), toast(`${bd.n} : ce monde arrive bientôt.`)); }
  if (b.dataset.item) { cur.selected = cur.selected === b.dataset.item ? null : b.dataset.item; cur.tool = "place"; return ui(); }
  if (b.dataset.tool) { cur.tool = b.dataset.tool; if (cur.tool !== "place") cur.selected = null; cur.hover(false); return ui(); }
  if (b.id === "back") { if (cur.key === "home" && cur.mode === "inside") return cur.outside(); return goWorld("map"); }
  if (b.id === "night") { S.night = !S.night; save(); cur.night(); return ui(); }
  if (b.id === "gift") { S.coins += 200; save(); toast("+200 pièces de test"); return ui(); }
  if (b.id === "reset") { S = BLANK(); save(); location.reload(); }
  if (b.dataset.g) return gameAction(b.dataset.g, b.dataset);
  if (b.id === "game-close") return closeGame();
});

function resize(){ const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w/h; camera.updateProjectionMatrix(); }
window.addEventListener("resize", resize);
const clock = new THREE.Clock();
function loop(){
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  if (fly){ camera.position.lerp(fly.pos, .07); controls.target.lerp(fly.target, .07); if (camera.position.distanceTo(fly.pos) < .05) fly = null; }
  controls.update(); cur.update(dt, t); stepFx(cur.scene, cur.fx, dt);
  renderer.render(cur.scene, camera); requestAnimationFrame(loop);
}
function boot(){
  worlds = {map:makeMap(), home:makeHome(), casino:makeCasino()};
  try { makeThumbs(); } catch(e){}
  resize(); goWorld("map", true); loop();
}
