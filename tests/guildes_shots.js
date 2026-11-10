// Captures des Guildes avec des données factices (aucun serveur) : taverne, objectifs, membres, classement, création
const {chromium} = require('playwright'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
(async()=>{ const b = await chromium.launch(); const p = await b.newPage({viewport:{width:400,height:860}}); await p.addInitScript(() => { window.__noPortal = true; });
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split(String.fromCharCode(10))[1]));
 await p.goto('file://'+path.join(ROOT,'dist','lumen.html')); await p.waitForTimeout(3300);
 await p.fill('#p-name','Erwan'); await p.fill('#p-age','20'); await p.click('[data-av-pick="0"]'); await p.click('#pform button[type=submit]');
 await p.evaluate(()=>{ document.querySelectorAll('.lvup').forEach(e=>e.remove()); });
 const LV = process.env.LV ? +process.env.LV : 7400;
 await p.evaluate((XPV)=>{
   const day = new Intl.DateTimeFormat("fr-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
   const d = new Date(day+"T12:00:00Z"); d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7); const wk = d.toISOString().slice(0,10);
   const U = {me:{p:"Erwan",c:0}, lea:{p:"Léa",c:3}, tom:{p:"Tom",c:7}, nina:{p:"Nina",c:11}, max:{p:"Max",c:5}, zoe:{p:"Zoé",c:9}};
   const G = {g1:{name:"Les Lanternes", nameL:"les lanternes", emb:{s:"couronne", c:"rubis", i:"bulb"}, desc:"On répond vite, on répond juste.", created:Date.now()-20*864e5, leader:"me",
     members:{me:{role:"chef",j:1}, lea:{role:"off",j:2}, tom:{role:"mem",j:3}, nina:{role:"mem",j:4}}, apps:{zoe:{at:1,p:"Zoé"}}, inv:[], done:{}, bonus:0},
     g2:{name:"Club Galilée", nameL:"club galilée", emb:{s:"rond", c:"azur", i:"sci"}, desc:"", created:1, leader:"x", members:{x:{role:"chef",j:1},y:{role:"mem",j:1}}, apps:{}, inv:[], done:{}, bonus:0},
     g3:{name:"Les Hiboux", nameL:"les hiboux", emb:{s:"etendard", c:"emeraude", i:"moon"}, desc:"", created:1, leader:"z", members:{z:{role:"chef",j:1}}, apps:{}, inv:[], done:{}, bonus:0}};
   const mk = (all, w) => ({p:"", all:Object.assign({th:{}}, all), w:{[wk]:Object.assign({th:{}}, w)}});
   const C = [["g1","me",mk({ok:2600,mp:40,win:22,xp:Math.round(XPV*.4),th:{sci:300}},{ok:180,mp:6,win:3,tower:30,boss:12,th:{his:40,sci:60,geo:20}})],
     ["g1","lea",mk({ok:2100,mp:30,win:14,xp:Math.round(XPV*.3)},{ok:150,mp:5,win:2,tower:20,boss:8,th:{his:30,sci:50}})],
     ["g1","tom",mk({ok:1500,mp:12,win:5,xp:Math.round(XPV*.2)},{ok:90,mp:2,win:1,tower:10,boss:6,th:{sci:20}})],
     ["g1","nina",mk({ok:600,mp:4,win:1,xp:Math.round(XPV*.1)},{ok:15,mp:0,win:0,tower:0,boss:0})],
     ["g2","x",mk({ok:3000,mp:20,win:10,xp:5200},{ok:300,mp:4})],["g3","z",mk({ok:800,mp:2,win:1,xp:1500},{ok:40})]];
   const snap = arr => ({metadata:{hasPendingWrites:false}, forEach:f=>arr.forEach(f)});
   const fake = {collection:()=>({onSnapshot:cb=>{cb(snap(Object.entries(G).map(([id,v])=>({id,data:()=>v})))); return ()=>{};}}),
     collectionGroup:()=>({onSnapshot:cb=>{cb(snap(C.map(([g,u,v])=>({id:u,ref:{parent:{parent:{id:g}}},data:()=>v})))); return ()=>{};}}),
     doc:()=>({update:async()=>{},set:async()=>{},delete:async()=>{}}), runTransaction:async()=>{}};
   const A = Amis.api; A.db = ()=>fake; A.uid = ()=>"me"; A.fb = ()=>({firestore:{FieldValue:{increment:n=>n,delete:()=>null,arrayUnion:x=>x,arrayRemove:x=>x}}});
   A.users = ()=>Object.fromEntries(Object.keys(U).map(k=>[k,{pseudo:U[k].p}])); A.pseudoOf = u=>(U[u]||{p:"?"}).p;
   A.avatar = (u,z)=>creatureSVG(CHARS[(U[u]||{c:1}).c % CHARS.length], z||34); A.online = u=>["me","lea","tom"].includes(u); A.title = (u,c)=>u==="lea"?titleTag("gardien",c):"";
   S.guild = {claimed:{}, feats:{}}; Amis.view = ()=>Guildes.view(); S.tab="amis"; S.multiView="guild"; render();
 }, LV);
 const tag = process.env.LV ? '_lv'+process.env.LV : '';
 await p.waitForTimeout(700); await p.evaluate(()=>window.scrollTo(0,0));
 await p.screenshot({path:path.join(OUT,'guilde_1_taverne'+tag+'.png')});
 if (!tag) {
  await p.screenshot({path:path.join(OUT,'guilde_2_objectifs.png'), fullPage:true});
  await p.click('[data-gd="sub"][data-v="members"]'); await p.waitForTimeout(400); await p.evaluate(()=>window.scrollTo(0,420)); await p.screenshot({path:path.join(OUT,'guilde_3_membres.png')});
  await p.click('[data-gd="sub"][data-v="rank"]'); await p.waitForTimeout(400); await p.evaluate(()=>window.scrollTo(0,420)); await p.screenshot({path:path.join(OUT,'guilde_4_classement.png')});
  await p.click('[data-gd="sub"][data-v="info"]'); await p.waitForTimeout(400); await p.evaluate(()=>window.scrollTo(0,420)); await p.screenshot({path:path.join(OUT,'guilde_5_parametres.png'), fullPage:true});
 }
 console.log(errs); await b.close(); })();
