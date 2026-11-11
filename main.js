/* ---------- Thèmes ---------- */
const THEMES = {
  his:{n:"Histoire",h:28}, sci:{n:"Sciences",h:190}, geo:{n:"Géographie",h:140}, ani:{n:"Animaux & nature",h:100},
  jeu:{n:"Jeux vidéo",h:280}, art:{n:"Art & littérature",h:330}, spo:{n:"Sport",h:8}, esp:{n:"Espace",h:235},
  mon:{n:"Monde & société",h:55}, cor:{n:"Corps humain",h:350}, per:{n:"Grandes figures",h:40}, cin:{n:"Cinéma & séries",h:300},
  mus:{n:"Musique",h:170}, ins:{n:"Insolite",h:75},
  gas:{n:"Cuisine & gastronomie",h:18}, lan:{n:"Langue française",h:210}, myt:{n:"Mythologie",h:258},
  tec:{n:"Inventions & tech",h:182}, cap:{n:"Capitales & drapeaux",h:122}, eco:{n:"Économie & marques",h:88},
  bdm:{n:"BD, mangas & animés",h:312}
};
const ORDER = Object.keys(THEMES);
const RANKS = ["Curieux","Apprenti","Initié","Connaisseur","Érudit","Expert","Savant","Maître","Sage","Légende"];
const JOURS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const INT = [0,1,3,7,16,35];
const XP_LVL = [0,10,20,30];
const qTheme = id => Q[id][0];

/* ---------- Améliorations ---------- */
const UPGRADES = {
  life:{n:"Vie supplémentaire en Survie", d:"Commence chaque partie de Survie avec une vie de plus.", prices:[150,300]},
  time:{n:"Temps bonus en Chrono", d:"10 secondes de plus à chaque partie de Chrono.", prices:[120,250]}
};

/* ---------- Personnages ---------- */
const CHARS = CREATURES.concat([RIXY, SOMNI]);
const avatarSVG = (i, size) => creatureSVG(CHARS[i] || CHARS[0], size);
const SECRETS = SECRET_SKINS.concat([ULTRA_SKIN]);
const skinOf = id => !id ? null : id[0]==="b" && /^b\d+$/.test(id) ? CHARS[+id.slice(1)] : SHOP_SKINS.concat(SECRETS, typeof LEGEND_SKINS !== "undefined" ? LEGEND_SKINS : []).find(s => s.id===id);
const ownsSkin = id => /^b\d+$/.test(id) || !!(S.skins && S.skins[id]);
const heroChar = () => (S.profile && S.profile.skin && ownsSkin(S.profile.skin) && skinOf(S.profile.skin)) || (S.profile && CHARS[S.profile.avatar]) || CHARS[0];
const hasAcc = () => S.acc && Object.values(S.acc.eq).some(Boolean);
const meSVG = size => hasAcc() ? dressedSVG(heroChar(), S.acc.eq, size) : creatureSVG(heroChar(), size);
const totalOk = () => Object.values(S.q).reduce((a,e) => a + (e.ok||0), 0);
function unlockSkin(id){
  if (S.skins[id]) return null;
  const sk = skinOf(id); S.skins[id] = today();
  toasts.push(`<span class="sec">${creatureSVG(sk, 44)}<span><b>${id==="lumen"?"Personnage ultra secret débloqué !":sk.free||sk.unlock||sk.r?"Nouveau personnage débloqué !":"Personnage secret débloqué !"}</b> ${esc(sk.n)} t'attend dans ta Collection.</span></span>`);
  return sk.n;
}
function spend(n){ S.st.spent = Math.max(0, (S.st.spent||0) + n); if (S.st.spent >= 1000) unlockSkin("lingot"); }
function checkSecrets(){
  if ((S.st.spent||0) >= 1000) unlockSkin("lingot");
  if (totalOk() >= 1000) unlockSkin("lumen");
}
function gameEvent(k, v){
  let got = null;
  if (k === "bj" || k === "rl") { S.st[k] = v ? (S.st[k]||0)+1 : 0; if (S.st[k] >= 5) got = unlockSkin(k==="bj" ? "trefle" : "dede"); }
  if (k === "race" && v >= 12) got = unlockSkin("veinard");
  save(); return got;
}

/* ---------- Retour sensoriel : petits sons et vibration ---------- */
function feedback(ok, combo){
  if (S.settings.sfx !== false) Music.sfx(ok ? (combo >= 3 ? "combo" : "ok") : "ko");
  try { if (navigator.vibrate) navigator.vibrate(ok ? 12 : [30, 40, 30]); } catch(e){}
}

const isQuote = q => q && q[6] && q[6].t === "quote";
const quoteIds = () => allIds().filter(id => isQuote(Q[id]));

/* ---------- Difficulté ---------- */
const DIFF = {facile:"Facile", mix:"Mixte", expert:"Expert"};
function diffPick(ids, n, r, used, d){
  if (!d || d === "mix") return pick(ids, n, r, used);
  const want = d === "facile" ? 1 : 3;
  const first = pick(ids.filter(id => Q[id][1] === want), n, r, used);
  if (first.length >= n) return first;
  const u2 = new Set([...used, ...first]);
  return first.concat(pick(ids.filter(id => Q[id][1] === 2), n - first.length, r, u2));
}

/* ---------- Mot du jour ---------- */
const motIdx = () => T() % MOTS.length;
function motCard(){
  const i = motIdx(), m = MOTS[i], kept = S.mots && S.mots[i];
  return `<div class="card stack motj"><div class="row between"><span class="row" style="gap:8px">${gIcon("book",26)}<span class="label">Le mot du jour</span></span>${kept?`<span class="chip lamp">Dans ton carnet</span>`:""}</div>
    <div><b class="mot">${esc(m[0])}</b> <span class="muted" style="font-size:13px;font-style:italic">${esc(m[1])}</span></div>
    <p>${esc(m[2])}</p><p class="muted" style="font-size:14px">${esc(m[3])}</p>
    ${kept?"":`<button class="btn small" data-mot="${i}">Garder ce mot</button>`}</div>`;
}

/* ---------- Succès cachés ---------- */
const SUCCES = [
  {id:"nuit", n:"Oiseau de nuit", d:"Répondre à une question entre minuit et 4 h du matin", c:40},
  {id:"aube", n:"Lève-tôt", d:"Terminer le Défi du jour avant 7 h", c:40},
  {id:"touche", n:"Touche-à-tout", d:"Réussir des questions dans 10 thèmes différents le même jour", c:60},
  {id:"parfait", n:"Sans faute", d:"Réussir une série de 10 sur 10", c:40},
  {id:"eclair", n:"Éclair", d:"Trouver la bonne réponse en moins de 2 secondes", c:30},
  {id:"chute", n:"Mauvaise passe", d:"Faire trois erreurs d'affilée", c:20},
  {id:"retour", n:"Revanche", d:"Réussir une question ratée au moins trois fois", c:50},
  {id:"expert", n:"Cerveau d'acier", d:"Faire au moins 8 sur 10 dans une série Expert", c:80},
  {id:"citation", n:"Fin lettré", d:"Réussir 10 citations dans « Qui a dit ? »", c:50},
  {id:"mots", n:"Collectionneur de mots", d:"Garder 10 mots du jour", c:50},
  {id:"carnet", n:"Rat de bibliothèque", d:"Avoir 100 notions dans son carnet", c:60},
  {id:"perso", n:"Grande famille", d:"Posséder 10 personnages en plus de ceux de départ", c:80},
  {id:"mode", n:"Tiré à quatre épingles", d:"Porter 4 accessoires en même temps", c:50},
  {id:"riche", n:"Picsou", d:"Avoir 5 000 pièces en même temps", c:100},
  {id:"fidele", n:"Fidèle au poste", d:"Jouer au Défi du jour 30 jours au total", c:100}
];
function winSucces(id){
  if (!S.succ) S.succ = {}; if (S.succ[id]) return;
  const x = SUCCES.find(s => s.id === id); if (!x) return;
  S.succ[id] = today(); S.coins += x.c;
  toasts.push(`<span class="sec"><span class="succ-ic">${gIcon("star",36)}</span><span><b>Succès caché débloqué : ${esc(x.n)}</b> ${esc(x.d)} · +${x.c} pièces</span></span>`);
}
function checkSucces(){
  if (!S.succ) S.succ = {};
  const h = new Date().getHours();
  if (Object.values(S.q).filter(e => e.ok > 0).length + Object.keys(S.f).length >= 100) winSucces("carnet");
  if (Object.keys(S.mots || {}).length >= 10) winSucces("mots");
  if (SHOP_SKINS.concat(SECRETS).filter(s => S.skins && S.skins[s.id]).length >= 10) winSucces("perso");
  if (S.acc && Object.values(S.acc.eq).filter(Boolean).length >= 4) winSucces("mode");
  if (S.coins >= 5000 && !(S.admin && S.admin.inf)) winSucces("riche");
  if (Object.keys(S.days).length >= 30) winSucces("fidele");
  if (quoteIds().filter(id => S.q[id] && S.q[id].ok > 0).length >= 10) winSucces("citation");
}
function succesAnswer(s, st, ok){
  const h = new Date().getHours(), t = today();
  if (h < 4) winSucces("nuit");
  if (ok && st.t0 && Date.now() - st.t0 < 2000) winSucces("eclair");
  if (ok && S.q[st.id] && S.q[st.id].ko >= 3) winSucces("retour");
  s.koRun = ok ? 0 : (s.koRun || 0) + 1; if (s.koRun >= 3) winSucces("chute");
  if (ok) { if (!S.thDay || S.thDay.d !== t) S.thDay = {d:t, th:{}}; S.thDay.th[qTheme(st.id)] = 1; if (Object.keys(S.thDay.th).length >= 10) winSucces("touche"); }
}
function renderSucces(){
  const n = SUCCES.filter(x => S.succ && S.succ[x.id]).length;
  return `<div class="card stack" style="gap:10px"><div class="label">Succès cachés · ${n}/${SUCCES.length}</div><div class="succgrid">${SUCCES.map(x => S.succ && S.succ[x.id]
    ? `<div class="succ own">${gIcon("star",34)}<b>${esc(x.n)}</b><span>${esc(x.d)}</span></div>`
    : `<div class="succ">${gIcon("lock",30)}<b>???</b><span>Secret</span></div>`).join("")}</div></div>`;
}

/* ---------- Questions en images ---------- */
const geoName = x => { const s = x.n.replace(/^(la |le |les |l')/, ""); return s[0].toUpperCase() + s.slice(1); };
const GEO_BY = {}; GEO.forEach(x => { GEO_BY[x.c] = x; GEO_BY[geoName(x)] = x; });
const flagImg = (x, cls) => x && x.flag ? x.flag.replace("<svg", `<svg class="${cls||""}" aria-hidden="true"`) : "";
const shapeImg = (x, size) => `<svg class="shape" viewBox="0 0 100 100" width="${size||200}" height="${size||200}" aria-hidden="true"><path d="${x.d}"/></svg>`;
function qPic(q, small){ const im = q[6]; if (!im || im.t === "pick") return ""; const x = GEO_BY[im.c]; if (!x) return "";
  return `<div class="pic ${small?"sm":""}">${im.t === "flag" ? flagImg(x, "flag") : shapeImg(x, small?90:200)}</div>`; }

/* ---------- Outils ---------- */
const pad = n => String(n).padStart(2,"0");
const today = () => { const d = new Date(); return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); };
const dayNum = s => { const [y,m,d] = s.split("-").map(Number); return Math.round(Date.UTC(y,m-1,d)/864e5); };
const fromNum = n => { const d = new Date(n*864e5); return d.getUTCFullYear()+"-"+pad(d.getUTCMonth()+1)+"-"+pad(d.getUTCDate()); };
const T = () => dayNum(today());
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, r){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
const hash = s => { let h = 7; for (const c of s) h = (h*31 + c.charCodeAt(0)) | 0; return h; };
const dot = th => `<span class="dot" style="--h:${THEMES[th].h}"></span>`;
const yearTxt = y => y < 0 ? (-y)+" av. J.-C." : String(y);
const plural = (n, w) => n+" "+w+(n>1?"s":"");
const fmtC = n => Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".",",");
const coinsTxt = n => fmtC(n)+" pièce"+(n>=2?"s":"");
const coinIco = `<span class="coin" aria-hidden="true"></span>`;

/* ---------- Niveaux ---------- */
function lvl(xp, base){ const L = Math.floor((1+Math.sqrt(1+8*xp/base))/2); const lo = base*L*(L-1)/2, hi = base*(L+1)*L/2; return {L, p:Math.min(1,(xp-lo)/(hi-lo)), need:hi-xp}; }
const themeLvl = th => lvl(S.xp[th]||0, 60);
const totalXp = () => ORDER.reduce((a,k)=>a+(S.xp[k]||0),0);
const acctLvl = () => lvl(totalXp(), 200);
const rank = L => RANKS[Math.min(L,10)-1];

/* ---------- Sauvegarde ---------- */
const KEY = "chevet.v2";
let S;
const blank = () => ({profile:null, q:{}, xp:{}, f:{}, days:{}, rec:{}, session:null, pausedDaily:null, tab:"accueil", games:0,
  coins:0, badges:{}, bestStreak:0, up:{life:0, time:0}, parc:{map:{}, garden:[], inside:[], night:false, wheelDay:"", chest:false}, settings:{music:true, vol:55}, skins:{}, st:{spent:0, bj:0, rl:0}, acc:{own:{}, eq:{}}});
function load(){
  try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch(e){ S = blank(); }
  if (!S.parc) S.parc = {map:{}, garden:[], inside:[], night:false, wheelDay:"", chest:false};
  if (!S.settings) S.settings = {music:true, vol:55};
  if (S.profile && !(S.profile.avatar < CHARS.length)) S.profile.avatar = 0;
  if (!S.up) S.up = {life:0, time:0};
  if (!S.frozen) S.frozen = {}; if (!S.acc) S.acc = {own:{}, eq:{}}; if (!S.succ) S.succ = {}; if (!S.mots) S.mots = {}; if (!S.diff) S.diff = "mix"; if (!S.skins) S.skins = {}; if (!S.st) S.st = {spent:0, bj:0, rl:0};
  if (!["accueil","jouer","amis","boutique","profil"].includes(S.tab)) S.tab = "accueil";
  if (S.session && (S.session.date !== today() || S.session.mode === "chrono")) S.session = null;
  if (S.session && S.session.mode === "daily") { S.pausedDaily = S.session; S.session = null; }
  if (S.pausedDaily && S.pausedDaily.date !== today()) S.pausedDaily = null;
  delete S.paused;
  applyTheme();
}
// Thème d'affichage : "auto" suit le téléphone, sinon clair ou sombre forcé
function applyTheme(){
  const t = S.settings.theme;
  if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
function save(){ if (S && S.admin && S.admin.inf) S.coins = Math.max(S.coins, 99999); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} if (typeof Amis !== "undefined") Amis.dirty(); }

function streak(){ const fz = S.frozen || {}; let d = S.days[today()] ? T() : T()-1, n = 0; while (S.days[fromNum(d)] || fz[fromNum(d)]) { if (S.days[fromNum(d)]) n++; d--; } return n; }
function runEndingAt(d){ const fz = S.frozen || {}; let n = 0; while (S.days[fromNum(d)] || fz[fromNum(d)]) { if (S.days[fromNum(d)]) n++; d--; } return n; }
function rescue(){ const y = T()-1, ys = fromNum(y);
  if (S.days[ys] || (S.frozen && S.frozen[ys])) return null;
  const L = runEndingAt(y-1); if (L < 2) return null;
  return {day:ys, n:L, price:Math.min(300, 50 + 10*L)}; }

/* ---------- Missions du jour ---------- */
const MIS = {
  th:{n:m => `Réussis 5 questions en ${THEMES[m.th].n}`, goal:5, c:20},
  ok:{n:() => "Réussis 15 questions aujourd'hui", goal:15, c:20},
  hard:{n:() => "Réussis 3 questions pointues", goal:3, c:25},
  combo:{n:() => "Fais un combo de 5", goal:5, c:20},
  daily:{n:() => "Termine le Défi du jour", goal:1, c:15},
  surv:{n:() => "Réussis 8 questions en une partie de Survie", goal:8, c:25},
  chr:{n:() => "Fais 10 bonnes réponses en Chrono", goal:10, c:25},
  avap:{n:() => "Atteins une série de 5 en Avant ou après ?", goal:5, c:20},
  rev:{n:() => "Corrige 3 erreurs dans Revoir mes erreurs", goal:3, c:20}
};
const MIS_MAX = ["combo","surv","chr","avap"], MIS_BONUS = 30;
function missions(){
  if (S.mis && S.mis.date === today()) return S.mis;
  const r = rng(T()*7919+11);
  const keys = shuffle(Object.keys(MIS).filter(k => k !== "rev" || Object.keys(S.q).some(id => Q[id] && S.q[id].b === 0)), r).slice(0,3);
  const th = shuffle(ORDER.filter(k => k !== dailyTheme()), r)[0];
  S.mis = {date:today(), list:keys.map(k => ({k, th:k==="th"?th:null, p:0, done:false})), bonus:false};
  return S.mis;
}
function misEvent(k, v, th){
  if (k === "combo" && typeof Quetes !== "undefined") Quetes.ev("combo", {v});
  return; // les anciennes missions du jour sont remplacées par les Quêtes (quetes.js)
  const M = missions();
  M.list.forEach(m => {
    if (m.done || m.k !== k || (k === "th" && th !== m.th)) return;
    m.p = MIS_MAX.includes(k) ? Math.max(m.p, v) : m.p + v;
    if (m.p >= MIS[k].goal) { m.p = MIS[k].goal; m.done = true; S.coins += MIS[k].c; toasts.push(`<b>Mission réussie</b> · ${esc(MIS[k].n(m))} · +${MIS[k].c} pièces`); }
  });
  if (!M.bonus && M.list.every(m => m.done)) { M.bonus = true; S.coins += MIS_BONUS; toasts.push(`<b>Les 3 missions du jour sont faites !</b> · bonus +${MIS_BONUS} pièces`); }
}
function missionsCard(){
  const M = missions(), n = M.list.filter(m => m.done).length;
  return `<div class="card stack mis"><div class="row between"><span class="row" style="gap:8px">${gIcon("mission",26)}<span class="label">Missions du jour · ${n}/3</span></span><span class="label">${M.bonus?"Bonus gagné":`Bonus +${MIS_BONUS}`}</span></div>
    ${M.list.map(m => { const d = MIS[m.k]; return `<div class="mrow ${m.done?"done":""}"><span class="mk ${m.done?"ok":""}">${m.done?"✓":""}</span><div class="stack" style="gap:5px;min-width:0"><span>${esc(d.n(m))}</span>${m.done?"":`<span class="meter"><i style="width:${Math.round(m.p/d.goal*100)}%"></i></span>`}</div><span class="chip lamp">${coinIco}${d.c}</span></div>`; }).join("")}</div>`;
}
function rescueCard(){
  const r = rescue(); if (!r) return "";
  return `<div class="card stack rescue"><span class="label">Série interrompue</span><b>Tu as oublié le Défi d'hier. Ta série de ${r.n} jours peut encore être sauvée, aujourd'hui seulement.</b>
    <button class="btn small" data-rescue ${S.coins>=r.price?"":"disabled"}>${coinIco}Sauver ma série · ${r.price}</button>${S.coins>=r.price?"":`<span class="muted" style="font-size:13.5px">Il te manque ${Math.ceil(r.price-S.coins)} pièces.</span>`}</div>`;
}
const dueList = () => Object.keys(S.q).filter(id => Q[id] && S.q[id].due <= T()).sort((a,b)=>S.q[a].due-S.q[b].due);
// Les questions du Portail et de la Tour sont réservées à leur mode
const allIds = () => Object.keys(Q).filter(id => !(Q[id][6] && (Q[id][6].t === "portal" || Q[id][6].t === "tower")));
const young = () => S.profile && S.profile.age < 13;
const correctIn = th => Object.keys(S.q).filter(id => Q[id] && Q[id][0]===th && S.q[id].ok>0).length;
const correctAll = () => Object.keys(S.q).filter(id => Q[id] && S.q[id].ok>0).length;

/* ---------- Badges ---------- */
const BADGES = [];
const TIER_N = {bronze:"Bronze", argent:"Argent", or:"Or", platine:"Platine", diamant:"Diamant", maitre:"Maître"};
const masteredIn = th => Object.keys(S.q).filter(id => Q[id] && Q[id][0]===th && S.q[id].b>=3).length;
[["bronze",50,50],["argent",100,100],["or",250,150],["platine",500,250],["diamant",1000,500],["maitre",2000,1000]].forEach(([t,n,c]) => BADGES.push({id:"all"+n, g:"Général", tier:t, icon:"bulb", name:`${n} bonnes réponses`, desc:`${n} questions différentes réussies, tous thèmes confondus`, coins:c, goal:n, cur:correctAll}));
[["bronze",3,20],["argent",7,50],["or",14,100],["platine",30,200],["diamant",100,500]].forEach(([t,n,c]) => BADGES.push({id:"str"+n, g:"Régularité", tier:t, icon:"moon", name:`${n} défis d'affilée`, desc:`Réussir le Défi du jour ${n} jours de suite`, coins:c, goal:n, cur:()=>Math.max(S.bestStreak||0, streak())}));
[["survie","Survie","heart"],["chrono","Chrono","hourglass"],["avap","Avant ou après ?","timeline"]].forEach(([m,nm,ic]) => [["bronze",10,30],["or",20,60]].forEach(([t,n,c]) => BADGES.push({id:m+n, g:"Records", tier:t, icon:ic, name:`${nm} : ${n}`, desc:`Atteindre ${n} en ${nm}`, coins:c, goal:n, cur:()=>S.rec[m]||0})));
ORDER.forEach(k => [["bronze",5,5],["argent",10,10],["or",20,20],["platine",30,30],["diamant",40,40]].forEach(([t,n,c]) => BADGES.push({id:k+"_"+n, g:"Thèmes", th:k, tier:t, icon:k, name:`${THEMES[k].n} · ${TIER_N[t]}`, desc:`${n} bonnes réponses différentes en ${THEMES[k].n}`, coins:c, goal:n, cur:()=>correctIn(k)}))
  || BADGES.push({id:k+"_maitre", g:"Thèmes", th:k, tier:"maitre", icon:k, name:`${THEMES[k].n} · Maître`, desc:`Maîtriser 50 questions de ${THEMES[k].n} (chacune réussie trois fois)`, coins:100, goal:50, cur:()=>masteredIn(k)}));
let toasts = [];

/* ---------- Fête de passage de niveau : carte animée, confettis, fanfare ---------- */
// Posée sur document.body (pas dans #app) pour survivre aux rendus ; une à la fois, dans l'ordre.
// Pendant une partie en cours, les niveaux attendent le bilan (pas d'interruption, surtout en Chrono) ;
// plusieurs niveaux gagnés d'un coup sont réunis sur une seule carte.
const lvQueue = []; let lvOpen = false;
// En pleine partie (solo, ou partie de salon, ou podium affiché) : les grandes animations attendent la fin
const inPlay = () => !!(S.session && !S.session.done && S.tab === "jouer") || (typeof Salons !== "undefined" && Salons.playing()) || !!document.querySelector(".sl-pod") || (typeof Tour !== "undefined" && Tour.playing()) || !!document.querySelector(".tw-fx") || (typeof Boss !== "undefined" && Boss.playing());
const bdQueue = [];
function levelUp(n, what, sub){ lvQueue.push({n, what, sub}); flushLevelUp(); }
function flushLevelUp(){ if (lvOpen || (!lvQueue.length && !bdQueue.length) || inPlay()) return; lvOpen = true; setTimeout(showLevelUp, 350); }
function lvBadge(n){
  const D = "#2B1D3A", u = "lv" + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 120 124" aria-hidden="true"><defs><linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0A0"/><stop offset="1" stop-color="#F2A41E"/></linearGradient><linearGradient id="${u}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8AB8"/><stop offset="1" stop-color="#E2427A"/></linearGradient></defs>
  <ellipse cx="60" cy="118" rx="30" ry="5" fill="#000" opacity=".25"/>
  <path d="M38 78 L28 116 L44 108 L52 120 L60 84Z M82 78 L92 116 L76 108 L68 120 L60 84Z" fill="url(#${u}r)" stroke="${D}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="60" cy="58" r="40" fill="#B8740E" stroke="${D}" stroke-width="3.2" transform="translate(0 5)"/>
  <circle cx="60" cy="58" r="40" fill="url(#${u}g)" stroke="${D}" stroke-width="3.2"/>
  <circle cx="60" cy="58" r="30" fill="none" stroke="#D48A12" stroke-width="2.6" opacity=".7"/>
  <path d="M30 42 Q36 28 50 22" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".8"/>
  <text x="60" y="${n > 9 ? 72 : 74}" text-anchor="middle" font-family="Bricolage Grotesque, system-ui, sans-serif" font-weight="800" font-size="${n > 9 ? 38 : 46}" fill="#fff" stroke="${D}" stroke-width="7" paint-order="stroke" stroke-linejoin="round">${n}</text></svg>`;
}
// Badge débloqué : le badge arrive en tournant, avec rayons, confettis et les pièces gagnées
const TIER_LABEL = {bronze:"Bronze", argent:"Argent", or:"Or", platine:"Platine", diamant:"Diamant"};
const TIER_RANK = {bronze:1, argent:2, or:3, platine:4, diamant:5};
function showBadgeUp(){
  const all = bdQueue.splice(0).sort((a, b) => (TIER_RANK[b.tier] || 0) - (TIER_RANK[a.tier] || 0)), x = all[0], more = all.slice(1);
  const coins = all.reduce((t, b) => t + (b.coins || 0), 0);
  if (S.settings.sfx !== false) { try { Music.sfx("win"); } catch(e){} try { navigator.vibrate && navigator.vibrate([40,40,40,40,120]); } catch(e){} }
  const cols = ["#FF5FA2","#FFD23F","#5AE8A0","#7FC8FF","#C9A2FF","#FF9E6E"];
  const bits = Array.from({length:26}, (_, i) => `<i style="--x:${Math.round(Math.cos(i/26*6.283)*(120+Math.random()*90))}px;--y:${Math.round(Math.sin(i/26*6.283)*(110+Math.random()*80)-40)}px;--r:${Math.round(Math.random()*540-270)}deg;--c:${cols[i%cols.length]};--d:${(.45+Math.random()*.2).toFixed(2)}s"></i>`).join("");
  const el = document.createElement("div");
  el.className = "lvup bdup"; el.setAttribute("role", "alertdialog"); el.setAttribute("aria-label", `Nouveau badge : ${x.name}`);
  el.innerHTML = `<div class="lv-card"><div class="lv-rays" aria-hidden="true"></div><div class="lv-bits" aria-hidden="true">${bits}</div>
    <div class="bd-art">${badge2(x.tier, x.icon, 132)}</div><span class="lv-kicker">${all.length > 1 ? all.length + " nouveaux badges !" : "Nouveau badge !"}</span>
    <b class="lv-title">${esc(x.name)}</b><span class="lv-sub">${esc(x.desc)}</span>
    <span class="chip lamp bd-tier">${TIER_LABEL[x.tier] || ""} · +${coinsTxt(coins)}</span>
    ${more.length ? `<div class="lv-more">${more.slice(0, 6).map(m => `<span class="chip">${esc(m.name)}</span>`).join("")}${more.length > 6 ? `<span class="chip">+${more.length - 6}</span>` : ""}</div>` : ""}
    <button class="btn lv-ok" type="button">Génial !</button></div>`;
  document.body.appendChild(el);
  let done = false;
  const close = () => { if (done) return; done = true; el.classList.add("out"); setTimeout(() => { el.remove(); lvOpen = false; flushLevelUp(); }, 260); };
  el.querySelector(".lv-ok").addEventListener("click", close);
  el.addEventListener("click", e => { if (e.target === el) close(); });
  setTimeout(close, 6500);
  setTimeout(() => { try { el.querySelector(".lv-ok").focus({preventScroll:true}); } catch(e){} }, 400);
}
function showLevelUp(){
  if (inPlay()) { lvOpen = false; return; }
  if (!lvQueue.length) { if (bdQueue.length) return showBadgeUp(); lvOpen = false; return; }
  // Le niveau de thème le plus haut en vedette, les autres en petites pastilles
  const all = lvQueue.splice(0), latest = new Map(); all.forEach(v => latest.set(v.what, v));
  const list = [...latest.values()].sort((a, b) => (a.what === "Ton profil") - (b.what === "Ton profil") || b.n - a.n);
  const x = list[0], more = list.slice(1);
  if (S.settings.sfx !== false) { try { Music.sfx("level"); } catch(e){} try { navigator.vibrate && navigator.vibrate([30,50,30,50,90]); } catch(e){} }
  const cols = ["#FF5FA2","#FFD23F","#5AE8A0","#7FC8FF","#C9A2FF","#FF9E6E"];
  const bits = Array.from({length:22}, (_, i) => `<i style="--x:${Math.round(Math.cos(i/22*6.283)*(120+Math.random()*90))}px;--y:${Math.round(Math.sin(i/22*6.283)*(110+Math.random()*80)-40)}px;--r:${Math.round(Math.random()*540-270)}deg;--c:${cols[i%cols.length]};--d:${(Math.random()*.15).toFixed(2)}s"></i>`).join("");
  const el = document.createElement("div");
  el.className = "lvup"; el.setAttribute("role", "alertdialog"); el.setAttribute("aria-label", `Niveau ${x.n} en ${x.what}`);
  el.innerHTML = `<div class="lv-card"><div class="lv-rays" aria-hidden="true"></div><div class="lv-bits" aria-hidden="true">${bits}</div>
    <div class="lv-badge">${lvBadge(x.n)}</div><span class="lv-kicker">Niveau supérieur !</span>
    <b class="lv-title">${esc(x.what)} · niveau ${x.n}</b><span class="lv-sub">${esc(x.sub)}</span>
    ${more.length ? `<div class="lv-more">${more.map(m => `<span class="chip lamp">${esc(m.what)} · niv. ${m.n}</span>`).join("")}</div>` : ""}
    <button class="btn lv-ok" type="button">Trop bien !</button></div>`;
  document.body.appendChild(el);
  let done = false;
  const close = () => { if (done) return; done = true; el.classList.add("out"); setTimeout(() => { el.remove(); lvOpen = false; flushLevelUp(); }, 260); };
  el.querySelector(".lv-ok").addEventListener("click", close);
  el.addEventListener("click", e => { if (e.target === el) close(); });
  setTimeout(close, 5200);
  setTimeout(() => { try { el.querySelector(".lv-ok").focus({preventScroll:true}); } catch(e){} }, 400);
}
// Personnages de thème gagnés en jouant (atelier/toy_stars.js : SKIN_UNLOCK)
function checkThemeSkins(){ SHOP_SKINS.forEach(s => { if (s.unlock && !S.skins[s.id] && correctIn(s.unlock.th) >= s.unlock.n) unlockSkin(s.id); }); }
function checkBadges(){
  checkThemeSkins();
  if (S.st) checkSecrets();
  checkSucces();
  BADGES.forEach(b => {
    if (S.badges[b.id] || b.cur() < b.goal) return;
    S.badges[b.id] = today(); S.coins += b.coins;
    bdQueue.push(b); flushLevelUp();
  });
}

/* ---------- Réponses : mémoire, XP, pièces ---------- */
// Multiplicateur des potions (Double XP / Double pièces) : seulement sur les gains des bonnes réponses
const PM = t => typeof Potions !== "undefined" ? Potions.mult(t) : 1;
function answer(id, ok, combo){
  const t = T(), e = S.q[id] || {b:0, ok:0, ko:0};
  const firstWin = ok && !e.ok;
  if (ok) { e.b = Math.min(e.b+1, 5); e.ok++; } else { e.b = 0; e.ko++; }
  e.due = t + (ok ? INT[e.b] : 7); e.last = t; S.q[id] = e;
  if (!ok) return {xp:0, coins:0};
  if (typeof Quetes !== "undefined") Quetes.ev("ok", {th:qTheme(id), lvl:Q[id][1]});
  const th = qTheme(id), before = themeLvl(th).L, accBefore = acctLvl().L;
  const mult = combo >= 5 ? 2 : combo >= 3 ? 1.5 : 1;
  const xp = Math.round(XP_LVL[Q[id][1]] * mult * (firstWin ? 1 : 0.35)) * PM("xp");
  const coins = (firstWin ? 1 : 0.5) * mult * (S.session && S.session.diff === "expert" ? 1.5 : 1) * PM("coin");
  S.xp[th] = (S.xp[th]||0) + xp; S.coins += coins;
  const after = themeLvl(th).L, accAfter = acctLvl().L;
  if (after > before) levelUp(after, THEMES[th].n, `Tu deviens ${rank(after)}.`);
  if (accAfter > accBefore) levelUp(accAfter, "Ton profil", "Tu montes en grade. Continue comme ça !");
  checkBadges();
  return {xp, coins};
}
const multTxt = c => c >= 5 ? "x2" : c >= 3 ? "x1,5" : "";

/* ---------- Choix des questions ---------- */
function pick(ids, n, r, exclude){
  ids = ids.filter(id => !exclude.has(id));
  const order = list => { list = shuffle(list, r); return young() ? list.filter(id=>Q[id][1]<3).concat(list.filter(id=>Q[id][1]===3)) : list; };
  const unseen = order(ids.filter(id => !(id in S.q)));
  const wrong = order(ids.filter(id => S.q[id] && S.q[id].b === 0));
  const rest = order(ids.filter(id => S.q[id] && S.q[id].b > 0));
  return unseen.concat(wrong, rest).slice(0, n);
}
const byTheme = th => allIds().filter(id => qTheme(id) === th);
const qStep = id => ({k:"q", id});
const dailyTheme = () => ORDER[T() % ORDER.length];

function newSession(mode, extra){
  const s = Object.assign({mode, steps:[], pos:0, combo:0, best:0, joker:0, seed:Date.now()%1e7, date:today(), xp:0, coins:0}, extra||{});
  const r = rng(s.seed), used = new Set();
  if (mode === "daily") {
    const n = T(), th = dailyTheme(), rr = rng(n*97+13);
    s.theme = th; s.seed = n;
    const main = pick(byTheme(th), 5, rr, used); main.forEach(x=>used.add(x));
    const mix = pick(allIds().filter(id=>qTheme(id)!==th), 10-main.length, rr, used);
    const facts = F.map((_,i)=>i).filter(i=>F[i][0]===th);
    s.steps = [{k:"fact", i:facts[Math.floor(n/ORDER.length) % facts.length]}].concat(main.map(qStep), mix.map(qStep));
  } else if (mode === "portail") {
    // Jamais deux fois la même question : seulement des questions jamais vues, dans un ordre qui dépend du jour
    // (le même pour tous les joueurs qui ont le même historique)
    s.steps = portalFresh().sort((a, b) => hash(a + s.date) - hash(b + s.date)).slice(0, 10).map(qStep);
  } else if (mode === "serie") {
    s.diff = S.diff || "mix"; s.steps = diffPick(byTheme(s.theme), 10, r, used, s.diff).map(qStep);
  } else if (mode === "mix") {
    s.diff = S.diff || "mix"; s.steps = diffPick(allIds(), 10, r, used, s.diff).map(qStep);
  } else if (mode === "qad") {
    s.steps = pick(quoteIds(), 10, r, used).map(qStep);
  } else if (mode === "revoir") {
    const wrong = shuffle(Object.keys(S.q).filter(id => Q[id] && S.q[id].b === 0), r);
    const due = shuffle(dueList().filter(id => S.q[id].b > 0), r);
    s.steps = wrong.concat(due).slice(0,10).map(qStep);
  } else if (mode === "chrono") {
    s.joker = 1; s.total = 60 + 10*(S.up.time||0); s.ends = Date.now() + s.total*1000; s.steps = [qStep(nextFor(s))];
  } else if (mode === "survie") {
    s.maxLives = 3 + (S.up.life||0); s.lives = s.maxLives; s.joker = 1; s.steps = [qStep(nextFor(s))];
  } else if (mode === "avap") {
    s.score = 0; s.used = []; s.a = Math.floor(r()*EV.length); s.used.push(s.a); s.b = nextEvent(s); s.kind = "cmp";
  }
  // Duel entre amis : mêmes questions et mêmes règles pour les deux joueurs (sans les améliorations de la boutique)
  if (s.duel) {
    s.t0 = Date.now();
    if (s.qids) s.steps = s.qids.filter(id => Q[id]).map(qStep);
    if (mode === "chrono") { s.total = 60; s.ends = Math.max(Date.now(), s.duel.start || 0) + 60000; }
    if (mode === "survie") { s.maxLives = 3; s.lives = 3; }
  }
  return s;
}
function nextFor(s){
  const r = rng(s.seed + s.steps.length*101), used = new Set(s.steps.map(x=>x.id));
  let pool = allIds();
  if (s.mode === "survie") {
    const n = s.steps.length; let L = n < 5 ? 1 : n < 12 ? 2 : 3; if (young()) L = Math.min(L, 2);
    const f = pool.filter(id => Q[id][1] === L); if (f.length) pool = f;
  }
  if (s.mode === "chrono") pool = pool.filter(id => Q[id][1] <= 2);
  const c = pool.filter(id => !used.has(id));
  return c[Math.floor(r()*c.length)] || pool[0];
}
// Avant ou après : une manche sur quatre, on donne l'année soi-même
const avKind = s => (s.used.length % 4 === 0 ? "year" : "cmp");
// Marge acceptée selon l'époque (choix d'Erwan) : depuis 1990 ±5 ans, de 1500 à 1990 ±10 ans,
// de l'Antiquité à 1500 ±50 ans, avant l'écriture (préhistoire) ±300 ans
const yearTol = y => y >= 1990 ? 5 : y >= 1500 ? 10 : y >= -3000 ? 50 : 300;
function nextEvent(s){
  const r = rng(s.seed + s.used.length*53), ya = EV[s.a][1];
  const c = EV.map((_,i)=>i).filter(i => !s.used.includes(i) && EV[i][1] !== ya);
  if (!c.length) return -1;
  const close = c.filter(i => Math.abs(EV[i][1]-ya) <= (s.score < 4 ? 2000 : s.score < 8 ? 120 : 40));
  const pool = close.length ? close : c;
  return pool[Math.floor(r()*pool.length)];
}

/* ---------- Rendu ---------- */
const app = document.getElementById("app");
const TAB_ICONS = {
  accueil:'<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  jouer:'<svg viewBox="0 0 24 24"><rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7.5 11v3M6 12.5h3M15.5 12h.01M18 13.5h.01"/></svg>',
  parc:'<svg viewBox="0 0 24 24"><path d="M4 21V10l4-3 4 3v11M12 21V7l4-4 4 4v14M2 21h20M7 14h2M15 11h2M15 15h2"/></svg>',
  profil:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/></svg>'
};
TAB_ICONS.boutique = '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></svg>';
const GTAB = {accueil:"home", jouer:"play", amis:"sword", tour:"tower", boutique:"shop", parc:"parc", profil:"user"};
const TAB_LABEL = {accueil:"Accueil", jouer:"Jouer", amis:"Multi", tour:"Tour", boutique:"Boutique", parc:"Parc", profil:"Profil"};
let adminTaps = 0, libFilter = "all", libQuery = "", confirmReset = false, tick = null, autoNext = null, profSeg = "progres", shopSeg = "skins", draft = null, formErr = "", copyFallback = "";

function renderTabs(){
  const nav = document.getElementById("tabs");
  nav.parentElement.hidden = !S.profile;
  nav.innerHTML = Object.keys(TAB_LABEL).map(k =>
    `<button data-tab="${k}" data-k="${GTAB[k]}" ${S.tab===k?'aria-current="page"':''}><span class="ti"><span class="glow"></span>${k==="profil"&&S.profile ? meSVG(36) : gIcon(GTAB[k], 40)}</span><span>${TAB_LABEL[k]}</span></button>`).join("");
}
/* Animation des onglets : rebond propre à chaque icône + étincelles */
function tabFx(k){
  const b = document.querySelector(`#tabs button[data-tab="${k}"]`); if (!b) return;
  b.classList.remove("tap"); void b.offsetWidth; b.classList.add("tap");
  clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove("tap"), 1000);
  setTimeout(() => tapSparkle(b.querySelector(".ti")), 110);
}
// (nom distinct de sparkle() des badges, sinon l'onglet Badges plante)
function tapSparkle(el){
  if (!el) return;
  const r = el.getBoundingClientRect(), x = r.left + r.width/2, y = r.top + r.height/2;
  const cs = getComputedStyle(document.documentElement), cols = [cs.getPropertyValue("--lamp"), cs.getPropertyValue("--accent2"), "#FFFFFF", "#8AD8FF"];
  const ring = document.createElement("span"); ring.className = "fx-ring"; ring.style.left = x+"px"; ring.style.top = y+"px";
  document.body.appendChild(ring); setTimeout(() => ring.remove(), 550);
  for (let i = 0; i < 9; i++){
    const s = document.createElement("span"), a = i/9*Math.PI*2 + Math.random()*.5, d = 26 + Math.random()*22, z = 8 + Math.random()*9;
    s.className = "fx-spark"; s.style.left = x+"px"; s.style.top = y+"px"; s.style.width = s.style.height = z+"px"; s.style.background = cols[i%cols.length];
    s.style.setProperty("--dx", Math.cos(a)*d+"px"); s.style.setProperty("--dy", Math.sin(a)*d-10+"px");
    document.body.appendChild(s); setTimeout(() => s.remove(), 700);
  }
  if (S.settings && S.settings.sfx !== false) try { navigator.vibrate && navigator.vibrate(10); } catch(e) {}
}
function header(){
  const p = S.profile;
  const A = acctLvl(), st = streak();
  return `<div class="top hud"><button class="who" data-tab="profil" aria-label="Mon profil, niveau ${A.L}"><span class="hav" style="--p:${Math.round(A.p*100)}">${meSVG(40)}<span class="hlv">${A.L}</span></span><span class="who-n"><span>${esc(p.name)}</span>${titleTag(myTitle(), "sm")}</span></button>
    <div class="pills">${typeof Potions !== "undefined" ? Potions.pill() : ""}<span class="pill streak ${st?"":"off"}" title="Défis d'affilée">${gIcon("flame",20)}${st}</span><button class="pill coins" data-tab="boutique" aria-label="${Math.floor(S.coins)} pièces, aller à la boutique"><span class="bigcoin"></span>${Math.floor(S.coins)}<span class="plus">+</span></button></div></div>`;
}
function dateLine(){ const d = new Date(); return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`; }

function render(){
  clearInterval(tick); tick = null;
  renderTabs();
  if (typeof flushLevelUp === "function") flushLevelUp();
  if (!S.profile) { app.innerHTML = `<div class="fade">${renderWelcome()}</div>`; return; }
  const s = S.session;
  let html = header();
  if (toasts.length) { html += toasts.map(t=>`<div class="toast" role="status">${t}</div>`).join(""); toasts = []; }
  const active = s && S.tab === "jouer";
  if (active && s.duel && s.duel.live && !s.done && Date.now() < s.duel.start) html += Amis.countdown(s);
  else if (active) html += s.mode==="avap" ? renderAvap() : renderGame();
  else if (S.tab==="accueil") html += (typeof Quetes !== "undefined" && Quetes.open()) ? Quetes.view() : renderHome();
  else if (S.tab==="jouer") html += (typeof Boss !== "undefined" && Boss.open()) ? Boss.view() : renderPlay();
  else if (S.tab==="amis") html += Amis.view();
  else if (S.tab==="boutique") html += renderShop();
  else if (S.tab==="tour") html += Tour.view();
  else html += renderProfile();
  // Simple mise à jour venue du serveur (salon, mode en ligne) : pas d'animation d'apparition, sinon l'écran clignote
  app.innerHTML = `<div class="${window.__quiet ? "" : "fade"}">${html}</div>`; window.__quiet = false;
  document.body.classList.toggle("in-tour", S.tab === "tour");
  document.body.classList.toggle("in-portal", !!(S.tab === "jouer" && S.session && S.session.mode === "portail"));
  if (S.tab === "tour") Tour.after();
  if (active && s.mode==="chrono" && !s.done) startTick();
  if (active && s.duel && s.mode!=="chrono" && s.mode!=="avap" && !s.done) startQTick();
  stressUpdate();
  if (typeof portalBanner === "function") setTimeout(portalBanner, 900);
  if (typeof Calendrier !== "undefined") setTimeout(Calendrier.auto, 1700);
}
setInterval(() => { try { if (S && S.profile) { const was = document.querySelector(".portal-card"); if (portalOpen() && !was && S.tab === "accueil" && !S.session) render(); portalBanner(); } } catch(e){} }, 60000);

/* --- Bienvenue / profil --- */
function profileForm(isEdit){
  const d = draft;
  return `<form id="pform" class="stack" novalidate>
    <div class="stack" style="gap:6px"><label class="label" for="p-name">Ton pseudo</label>
      <input class="field" id="p-name" maxlength="16" autocomplete="off" value="${esc(d.name)}" placeholder="Entre 2 et 16 caractères"></div>
    <div class="stack" style="gap:6px"><label class="label" for="p-age">Ton âge</label>
      <input class="field" id="p-age" type="number" inputmode="numeric" min="5" max="99" value="${d.age||""}" placeholder="Par exemple 20" style="max-width:160px">
      <span class="muted" style="font-size:13.5px">Il sert à doser les questions les plus pointues. Il reste sur ton appareil.</span></div>
    <div class="stack" style="gap:8px"><span class="label">Ton personnage</span>
      <div class="avgrid">${CHARS.map((a,i)=>`<button type="button" class="av" data-av-pick="${i}" aria-pressed="${d.avatar===i}">${avatarSVG(i,72)}<span>${a.n}</span></button>`).join("")}</div></div>
    ${formErr?`<p class="err" role="alert">${formErr}</p>`:""}
    <button class="btn" type="submit">${isEdit?"Enregistrer":"C'est parti"}</button>
  </form>`;
}
function renderWelcome(){
  if (typeof Amis !== "undefined" && Amis.welcoming()) return Amis.welcomeView();
  if (!draft) draft = {name:"", age:"", avatar:-1};
  return `<section class="stack">
    <div class="brand" style="font-size:26px">L<span>u</span>men</div>
    <h1 class="big">Bienvenue. <em>Qui joue ?</em></h1>
    <p class="muted">Choisis un pseudo et un personnage. Tu gagneras de l'XP et des pièces en répondant aux questions, pour construire ton parc.</p>
    ${profileForm(false)}${typeof Amis !== "undefined" ? Amis.welcome() : ""}</section>`;
}

/* --- Accueil --- */
function dailyCard(){
  const th = dailyTheme(), done = S.days[today()], p = S.pausedDaily;
  if (done) return `<div class="hero done"><span class="label">Défi du jour · ${dateLine()}</span><h2>Défi réussi : <em>${done.ok}/${done.n}</em></h2><p class="muted">Demain, le thème sera ${esc(THEMES[ORDER[(T()+1)%ORDER.length]].n.toLowerCase())}.</p><button class="btn ghost small" data-share>Copier mon résultat</button>${copyFallback?`<textarea class="field" readonly rows="3" aria-label="Résultat à copier">${esc(copyFallback)}</textarea>`:""}</div>`;
  return `<div class="hero"><span class="hero-ic">${thIcon(th, 64)}</span><span class="label">Défi du jour · ${dateLine()}</span>
    <h2>Ce soir : <em>${esc(THEMES[th].n.toLowerCase())}</em></h2>
    <p class="muted">Un fait du jour et 10 questions, dont 5 sur le thème. +10 pièces à la fin.</p>
    <button class="btn" data-start="daily">${p?`Reprendre · question ${p.pos}/10`:"Lancer le défi"}</button></div>`;
}
function renderHome(){
  const A = acctLvl(), next = nextGoal();
  return `<section class="stack">
    <div class="me"><div class="me-av">${meSVG(72)}</div><div class="stack" style="gap:4px;min-width:0">
      <span class="label">Niveau ${A.L} · ${totalXp()} XP</span><b class="me-name">${esc(S.profile.name)}</b>
      <span class="meter"><i style="width:${Math.round(A.p*100)}%"></i></span><span class="muted" style="font-size:13.5px">Encore ${Math.ceil(A.need)} XP pour le niveau ${A.L+1}</span></div></div>
    ${portalCard()}
    ${typeof Calendrier !== "undefined" ? Calendrier.card() : ""}
    ${rescueCard()}
    ${dailyCard()}
    ${typeof Quetes !== "undefined" ? Quetes.card() : missionsCard()}
    ${motCard()}
    <div class="quick">
      <button class="mode" data-mode="chrono"><span class="mi">${gIcon("chrono",44)}</span><h3>Chrono</h3><p>60 s pour un max de bonnes réponses.</p></button>
      <button class="mode" data-mode="survie"><span class="mi">${gIcon("survie",44)}</span><h3>Survie</h3><p>${plural(3+(S.up.life||0),"vie")}, jusqu'où iras-tu ?</p></button>
      <button class="mode" data-mode="mix"><span class="mi">${gIcon("mix",44)}</span><h3>Grand mélange</h3><p>10 questions tous thèmes.</p></button>
      <button class="mode" data-tab="parc"><span class="mi">${gIcon("parc",44)}</span><h3>Mon parc</h3><p>${Math.floor(S.coins)} pièces à dépenser.</p></button>
    </div>
    ${next ? `<div class="card nextb"><div class="nb-m">${badge2(next.tier, next.icon, 70)}</div><div class="stack" style="gap:6px;min-width:0"><span class="label">Prochain badge · ${TIER_N[next.tier]}</span><b style="font-family:var(--f-display)">${esc(next.name)}</b><span class="meter"><i style="width:${Math.round(next.cur()/next.goal*100)}%"></i></span><span class="muted" style="font-size:13.5px">${next.cur()}/${next.goal} · +${coinsTxt(next.coins)}</span></div></div>` : ""}
  </section>`;
}
function nextGoal(){
  let best = null, bp = -1;
  BADGES.forEach(b => { if (S.badges[b.id]) return; const p = b.cur()/b.goal; if (p < 1 && p > bp) { bp = p; best = b; } });
  return best;
}

/* --- Jouer --- */
function renderPlay(){
  const th = dailyTheme(), rv = Object.keys(S.q).filter(id=>Q[id] && S.q[id].b===0).length + dueList().filter(id=>S.q[id].b>0).length;
  const R = S.rec, done = S.days[today()];
  const themes = ORDER.map(k => {
    const ids = byTheme(k), seen = ids.filter(id=>id in S.q).length, L = themeLvl(k);
    return `<button class="theme ${k===th?"today":""}" data-serie="${k}">
      <span class="row between" style="flex-wrap:nowrap">${thIcon(k, 38)}<span class="label">Niv. ${L.L}</span></span>
      <b>${esc(THEMES[k].n)}</b><span class="label">${seen}/${ids.length} vues</span><span class="meter"><i style="width:${Math.round(L.p*100)}%"></i></span></button>`;
  }).join("");
  return `<section class="stack">
    <h1 class="big">Jouer</h1>
    ${typeof Boss !== "undefined" ? Boss.card() : ""}
    <div class="modes">
      <button class="mode wide hl" data-start="daily" ${done?"disabled":""}><span class="mi">${gIcon("daily",44)}</span><h3>Défi du jour · ${esc(THEMES[th].n)}</h3><p>${done?`Réussi : ${done.ok}/${done.n}. Reviens demain pour un nouveau thème.`:S.pausedDaily?`En pause à la question ${S.pausedDaily.pos}/10. Touche pour reprendre.`:"Un fait du jour et 10 questions. +10 pièces à la fin."}</p></button>
      <button class="mode" data-mode="chrono"><span class="mi">${gIcon("chrono",44)}</span><h3>Chrono</h3><p>${60+10*(S.up.time||0)} secondes, un joker.</p><span class="label">Record : ${R.chrono||0}</span></button>
      <button class="mode" data-mode="survie"><span class="mi">${gIcon("survie",44)}</span><h3>Survie</h3><p>${plural(3+(S.up.life||0),"vie")}, un joker, de plus en plus pointu.</p><span class="label">Record : ${R.survie||0}</span></button>
      <button class="mode" data-mode="avap"><span class="mi">${gIcon("avap",44)}</span><h3>Avant ou après ?</h3><p>Place les événements dans le temps.</p><span class="label">Record : ${R.avap||0}</span></button>
      <button class="mode" data-mode="mix"><span class="mi">${gIcon("mix",44)}</span><h3>Grand mélange</h3><p>10 questions, tous thèmes.</p><span class="label">${plural(S.games||0,"partie")}</span></button>
      <button class="mode" data-mode="qad"><span class="mi">${gIcon("quote",44)}</span><h3>Qui a dit ?</h3><p>Des citations célèbres, 4 auteurs au choix.</p><span class="label">${quoteIds().length} citations</span></button>
      <button class="mode wide" data-mode="revoir" ${rv?"":"disabled"}><span class="mi">${gIcon("revoir",44)}</span><h3>Revoir mes erreurs</h3><p>${rv ? plural(Math.min(rv,10),"question")+" à retravailler, quand tu veux." : "Rien à revoir pour l'instant. Tes erreurs viendront se ranger ici."}</p></button>
    </div>
    <div class="row between" style="margin-top:6px"><span class="label">Séries de 10 par thème</span></div>
    <div class="seg gseg s3 diff" role="group" aria-label="Difficulté">${Object.keys(DIFF).map(k => `<button data-diff="${k}" aria-pressed="${(S.diff||"mix")===k}"><span>${DIFF[k]}</span><small>${k==="facile"?"Questions faciles":k==="expert"?"Pointues · pièces x1,5":"De tout"}</small></button>`).join("")}</div>
    <div class="themes">${themes}</div>
  </section>`;
}

/* --- Boutique et collection --- */
const UPG_HTML = () => Object.keys(UPGRADES).map(k => { const u = UPGRADES[k], lv = S.up[k]||0, max = lv >= u.prices.length, price = u.prices[lv];
  return `<div class="card shop"><div class="stack" style="gap:2px;min-width:0;grid-column:1/3"><b>${u.n} · ${lv}/${u.prices.length}</b><span class="muted" style="font-size:13px">${u.d}</span></div>${max?`<span class="chip">Maximum</span>`:`<button class="btn small" data-up="${k}" ${S.coins>=price?"":"disabled"}>${coinIco}${price}</button>`}</div>`; }).join("");
function skinCard(sk, id, mode){
  const eq = S.profile.skin ? S.profile.skin===id : id==="b"+S.profile.avatar;
  if (mode === "lock") return `<div class="sk lock ${id==="lumen"?"ultra":""}"><span class="sil">${creatureSVG(sk, 84)}</span><span class="pad" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/><circle cx="12" cy="15.5" r="1.4"/></svg></span><b>${id==="lumen"?"Ultra secret":"???"}</b><span class="muted">${id==="lumen"?"Le plus rare de tous":"Secret"}</span></div>`;
  const own = ownsSkin(id);
  let foot;
  if (eq) foot = `<span class="chip lamp">Équipé</span>`;
  else if (own) foot = `<button class="btn small ghost" data-equip="${id}">Équiper</button>`;
  else if (sk.free) foot = `<span class="muted" style="font-size:12.5px;text-align:center;line-height:1.25">🔒 ${esc(sk.hint)}</span>`;
  else if (sk.unlock) { const c = Math.min(correctIn(sk.unlock.th), sk.unlock.n);
    foot = `<span class="muted" style="font-size:12.5px;text-align:center;line-height:1.25">🔒 ${c}/${sk.unlock.n} bonnes réponses en ${esc(THEMES[sk.unlock.th].n)}</span><span class="meter" style="width:100%"><i style="width:${Math.round(c/sk.unlock.n*100)}%"></i></span>`; }
  else foot = `<button class="btn small" data-buy="${id}" ${S.coins>=sk.p?"":"disabled"}>${coinIco}${sk.p}</button>`;
  const sub = sk.th ? `<span class="chip">${dot(sk.th)}${esc(THEMES[sk.th].n)}</span>` : mode==="secret" ? `<span class="muted">${esc(sk.hint)}</span>` : `<span class="muted">${esc(sk.e||"")}</span>`;
  return `<div class="sk ${own?"own":""} ${mode==="secret"?"secret":""} ${id==="lumen"?"ultra":""}">${creatureSVG(sk, 84)}<b>${esc(sk.n)}</b>${sub}${foot}</div>`;
}
/* ---------- Titres sous le pseudo (achetés en boutique ; noms choisis par Erwan, novembre 2026) ----------
   « LOOSER DU JOUR » ne s'achète pas : il tombe tout seul après 4 erreurs d'affilée et dure jusqu'à minuit. */
const TITLES = [
  {id:"soumis", n:"SOUMIS", p:200, a:"#F1EEF6", b:"#C4BCD4", f:"#4A3E5A"},
  {id:"gonneur", n:"GOONEUR", p:300, a:"#FFA45A", b:"#E2431E", f:"#FFFFFF"},
  {id:"senpai", n:"SENPAI", p:300, a:"#FFC2DA", b:"#FF5FA2", f:"#FFFFFF"},
  {id:"dessose", n:"DESSOSE", p:400, a:"#D2B4FF", b:"#7A4AD8", f:"#FFFFFF"},
  {id:"banki", n:"BANKAI", p:500, a:"#6EE09A", b:"#16804A", f:"#FFFFFF"},
  {id:"gorosei", n:"GOROSEI", p:600, a:"#5B3A8C", b:"#1E1236", f:"#FFD23F"},
  {id:"patapim", n:"BRR BRR PATAPIM", p:600, a:"#A8DC7A", b:"#5A8A2A", f:"#FFFFFF"},
  {id:"winter", n:"WINTER IS COMING", p:700, a:"#EAF6FF", b:"#86BCEB", f:"#16324E"},
  {id:"kingnorth", n:"KING OF NORTH", p:800, a:"#4A4A5A", b:"#121218", f:"#E8C25A"},
  {id:"cofondateur", n:"CO FONDATEUR", p:25000, a:"#FFF4C8", b:"#E0A82A", f:"#2B1D3A"}
];
// (ancien titre LOOSER DU JOUR retiré)
const TOWER_TITLE = {id:"tour100", n:"MAÎTRE DE LA TOUR", a:"#FFE58A", b:"#B8860B", f:"#2B1D3A"};
const BOSS_TITLE = {id:"fleau", n:"FLÉAU DES BOSS", a:"#FF6A3A", b:"#6A0A1A", f:"#FFE9C8"};
const INF_TITLE = {id:"infatigable", n:"INFATIGABLE", a:"#C98AFF", b:"#4A1E8A", f:"#FFFFFF"};
const GUILD_TITLES = {gardien:{id:"gardien", n:"GARDIEN DE GUILDE", a:"#E8C27A", b:"#6A3A12", f:"#FFF6DE"}, legion:{id:"legion", n:"LÉGION DU SAVOIR", a:"#8AD8FF", b:"#1A3A7A", f:"#FFFFFF"}};
const titleById = id => id === "infatigable" ? INF_TITLE : id === "tour100" ? TOWER_TITLE : id === "fleau" ? BOSS_TITLE : GUILD_TITLES[id] ? GUILD_TITLES[id] : TITLES.find(t => t.id === id);
const titleTag = (id, cls) => { const t = titleById(id); return t ? `<span class="ttl ${cls || ""} ${t.id === "looser" ? "loser" : ""}" style="--ta:${t.a};--tb:${t.b};--tf:${t.f}">${esc(t.n)}</span>` : ""; };
// Mon titre affiché (celui que je porte)
const myTitle = () => (S.profile && S.profile.title && S.titles && S.titles[S.profile.title] ? S.profile.title : "");
// Série d'erreurs : 4 d'affilée = LOOSER DU JOUR
// Le titre « LOOSER DU JOUR » a été retiré (demande d'Erwan, novembre 2026) : on garde la fonction, appelée par tous les modes.
function noteAnswer(ok){}
function renderTitles(){
  S.titles = S.titles || {};
  const cur = myTitle();
  const row = t => { const own = S.titles[t.id], on = S.profile.title === t.id;
    const foot = on ? `<span class="chip lamp">Porté</span>` : own ? `<button class="btn small ghost" data-tequip="${t.id}">Porter</button>` : `<button class="btn small" data-tbuy="${t.id}" ${S.coins >= t.p ? "" : "disabled"}>${coinIco}${t.p}</button>`;
    return `<div class="ttl-row ${own ? "own" : ""}">${titleTag(t.id, "lg")}${foot}</div>`; };
  return `<div class="stack"><p class="muted">Un titre s'affiche sous ton pseudo : en haut de l'écran, dans JcJ, les classements et les salons.</p>
    <div class="card stack ttl-me"><div class="label">Ton titre en ce moment</div><div class="row" style="align-items:center;gap:10px">${meSVG(44)}<div class="stack" style="gap:4px"><b>${esc(S.profile.name)}</b>${cur ? titleTag(cur) : `<span class="muted">Aucun titre</span>`}</div></div>
      ${S.profile.title ? `<button class="btn small ghost" data-tequip="">Ne porter aucun titre</button>` : ""}</div>
    <div class="card stack">${TITLES.map(row).join("")}</div>
    <div class="card stack"><div class="label">Titres spéciaux (ne s'achètent pas)</div>
      <div class="ttl-row">${titleTag("tour100", "lg")}${S.titles.tour100 ? (S.profile.title === "tour100" ? `<span class="chip lamp">Porté</span>` : `<button class="btn small ghost" data-tequip="tour100">Porter</button>`) : `<span class="muted" style="font-size:13px;text-align:right">Atteindre l'étage 100 de la Tour</span>`}</div>
      <div class="ttl-row">${titleTag("infatigable", "lg")}${S.titles.infatigable ? (S.profile.title === "infatigable" ? `<span class="chip lamp">Porté</span>` : `<button class="btn small ghost" data-tequip="infatigable">Porter</button>`) : `<span class="muted" style="font-size:13px;text-align:right">Ouvrir un coffre légendaire de la semaine</span>`}</div>
      <div class="ttl-row">${titleTag("fleau", "lg")}${S.titles.fleau ? (S.profile.title === "fleau" ? `<span class="chip lamp">Porté</span>` : `<button class="btn small ghost" data-tequip="fleau">Porter</button>`) : `<span class="muted" style="font-size:13px;text-align:right">Plus gros contributeur contre un Boss vaincu</span>`}</div>
      ${[["gardien", "Ta guilde atteint le niveau 5"], ["legion", "Ta guilde atteint 10 000 bonnes réponses"]].map(([k, d]) => `<div class="ttl-row">${titleTag(k, "lg")}${S.titles[k] ? (S.profile.title === k ? `<span class="chip lamp">Porté</span>` : `<button class="btn small ghost" data-tequip="${k}">Porter</button>`) : `<span class="muted" style="font-size:13px;text-align:right">${d}</span>`}</div>`).join("")}</div></div>`;
}
function renderShop(){
  const UPG = `${UPG_HTML()}`;
  const segs = {skins:"Personnages", acc:"Accessoires", titres:"Titres", collection:"Collection", ameliorations:"Améliorations"};
  const SI = {skins:"user", acc:"crown", titres:"trophy", collection:"book", ameliorations:"up"};
  const tabs = `<div class="seg gseg s5" role="group" aria-label="Sections de la boutique">${Object.keys(segs).map(k=>`<button data-shopseg="${k}" aria-pressed="${shopSeg===k}">${gIcon(SI[k],26)}<span>${segs[k]}</span></button>`).join("")}</div>`;
  let body;
  if (shopSeg === "collection" && typeof Boutique !== "undefined") body = Boutique.collectionView();
  else if (shopSeg === "skins" && typeof Boutique !== "undefined") body = Boutique.shopView();
  else if (shopSeg === "collection") {
    const nOwn = CHARS.length + SHOP_SKINS.filter(s=>S.skins[s.id]).length + SECRETS.filter(s=>S.skins[s.id]).length;
    const total = CHARS.length + SHOP_SKINS.length + SECRETS.length;
    body = `<p class="muted">${nOwn}/${total} personnages. Touche un personnage que tu possèdes pour l'équiper.</p>
      <div class="label">Secrets · ${SECRET_SKINS.filter(s=>S.skins[s.id]).length}/${SECRET_SKINS.length}</div>
      <div class="skgrid">${SECRET_SKINS.filter(s => !s.portal).map(s => skinCard(s, s.id, S.skins[s.id] ? "secret" : "lock")).join("")}</div>
      <div class="label">Personnages du Portail · ${PORTAL_SKINS.filter(s=>S.skins[s.id]).length}/${PORTAL_SKINS.length}</div>
      <div class="skgrid">${PORTAL_SKINS.map(s => skinCard(s, s.id, S.skins[s.id] ? "secret" : "lock")).join("")}</div>
      <div class="skgrid one">${skinCard(ULTRA_SKIN, "lumen", S.skins.lumen ? "secret" : "lock")}</div>
      <div class="label">Personnages de thème · ${SHOP_SKINS.filter(s=>S.skins[s.id]).length}/${SHOP_SKINS.length}</div>
      <div class="skgrid">${SHOP_SKINS.filter(s=>S.skins[s.id]).map(s => skinCard(s, s.id)).join("") || `<p class="muted" style="grid-column:1/-1">Aucun pour l'instant. Ils s'achètent dans l'onglet Personnages.</p>`}</div>
      <div class="label">Personnages de départ · ${CHARS.length}</div>
      <div class="skgrid">${CHARS.map((c,i) => skinCard(c, "b"+i)).join("")}</div>`;
  } else if (shopSeg === "acc") body = renderAcc();
  else if (shopSeg === "titres") body = renderTitles();
  else if (shopSeg === "ameliorations") body = `<div class="stack">${UPG}</div>`;
  else body = `<p class="muted">Un personnage par thème. Certains s'achètent avec tes pièces, d'autres se gagnent en réussissant des questions de leur thème.</p>
    ${halloweenSeason() || HALLOWEEN_SKINS.some(s => S.skins[s.id]) ? `<div class="label">🎃 Édition Halloween${halloweenSeason() ? " · jusqu'au 30 novembre" : ""}</div>
    <div class="skgrid">${HALLOWEEN_SKINS.filter(s => halloweenSeason() || S.skins[s.id]).map(s => skinCard(s, s.id)).join("")}</div>` : ""}
    <div class="label">Édition spéciale · séries & stars</div>
    <div class="skgrid">${STAR_SKINS.map(s => skinCard(s, s.id)).join("")}</div>
    <div class="label">Un personnage par thème</div>
    <div class="skgrid">${ORDER.map(k => SHOP_SKINS.find(s=>s.th===k)).filter(Boolean).map(s => skinCard(s, s.id)).join("")}</div>`;
  return `<section class="stack"><h1 class="big">Boutique</h1>${tabs}${body}</section>`;
}
function renderAcc(){
  const me = heroChar(), eq = S.acc.eq;
  const card = a => {
    const own = S.acc.own[a.id], on = eq[a.slot] === a.id, lock = a.th && themeLvl(a.th).L < 3;
    if (a.slot === "tete" && me.noHat && !a.bubble) return `<div class="sk locked">${dressedSVG(me, {}, 84)}<b>${esc(a.n)}</b><span class="muted" style="font-size:12.5px;text-align:center">${esc(me.n)} a déjà un couvre-chef</span>${own ? `<span class="chip">Acheté</span>` : `<button class="btn small" data-acc-buy="${a.id}" ${S.coins>=a.p?"":"disabled"}>${coinIco}${a.p}</button>`}</div>`;
    let foot;
    if (on) foot = `<button class="btn small ghost" data-acc-off="${a.slot}">Retirer</button>`;
    else if (own) foot = `<button class="btn small" data-acc-eq="${a.id}">Porter</button>`;
    else if (lock) foot = `<span class="chip">${dot(a.th)}Niv. 3 en ${esc(THEMES[a.th].n)}</span>`;
    else foot = `<button class="btn small" data-acc-buy="${a.id}" ${S.coins>=a.p?"":"disabled"}>${coinIco}${a.p}</button>`;
    return `<div class="sk ${on?"own":""} ${lock&&!own?"locked":""}">${dressedSVG(me, {[a.slot]:a.id}, 84)}<b>${esc(a.n)}</b>${lock&&!own?"":a.th?`<span class="muted">${esc(THEMES[a.th].n)}</span>`:`<span class="muted">Pour tous</span>`}${foot}</div>`;
  };
  return `<div class="card dress-top"><div class="dress-prev">${dressedSVG(me, eq, 150)}</div><div class="stack" style="gap:6px;min-width:0"><b class="me-name">${esc(me.n)}</b><span class="muted" style="font-size:14px">Un accessoire par emplacement, sur n'importe quel personnage. Ceux d'un thème se débloquent au niveau 3 de ce thème.</span></div></div>
    ${Object.keys(ACC_SLOTS).map(s => `<div class="label">${ACC_SLOTS[s]}</div><div class="skgrid">${ACC.filter(a=>a.slot===s).map(card).join("")}</div>`).join("")}`;
}
const tense = () => { const s = S.session; if (!s || s.done || S.tab !== "jouer") return false;
  if (s.mode === "survie") return s.lives === 1;
  if (s.mode === "portail") return true;
  if (s.mode === "chrono") return s.ends - Date.now() <= 15000;
  return false; };
/* Ambiance stressante : Survie à une vie = musique d'espion ; Chrono, 15 dernières secondes = tempo qui s'emballe.
   Bords de l'écran rouges qui pulsent de plus en plus vite et battement de cœur, même sans regarder le chrono. */
let stressOn = "";
function stressUpdate(){
  const sm = (typeof Salons !== "undefined" && Salons.music()) || (typeof Tour !== "undefined" && Tour.music()) || (typeof Boss !== "undefined" && Boss.playing() && {k:"spy", heat:.5});
  if (sm) {
    Music.mode(sm.k); Music.heat(sm.heat || 0); document.body.classList.remove("stress");
    if (stressOn) { stressOn = ""; Music.pulse(null); }
    return;
  }
  const s = S.session, k = !tense() ? "" : s.mode === "survie" || s.mode === "portail" ? "spy" : "panic";
  const heat = k === "panic" ? 1 - Math.max(0, s.ends - Date.now()) / 15000 : k === "spy" ? .3 : 0;
  Music.mode(k || "calm"); Music.heat(heat);
  document.body.classList.toggle("stress", !!k);
  document.body.style.setProperty("--stress", (1.1 - heat*.75).toFixed(2) + "s");
  if (k !== stressOn) {
    stressOn = k;
    const sfxOn = S.settings.sfx !== false;
    Music.pulse(k && sfxOn ? () => (k === "panic" ? 1000 - 600*(1 - Math.max(0, S.session ? S.session.ends - Date.now() : 0)/15000) : 900) : null);
    if (k && sfxOn) try { navigator.vibrate && navigator.vibrate([60, 80, 60]); } catch(e){}
  }
}

/* --- Partie --- */
const MODE_NAME = {qad:"Qui a dit ?", daily:"Défi du jour", serie:"Série", mix:"Grand mélange", revoir:"Revoir mes erreurs", chrono:"Chrono", survie:"Survie", duel:"Duel", portail:"Le Portail"};
function renderGame(){
  const s = S.session;
  if (s.done || (s.pos >= s.steps.length && s.mode !== "chrono" && s.mode !== "survie")) return renderRecap();
  const st = s.steps[s.pos];
  let head = `<div class="row between" style="margin-bottom:10px"><span class="label">${MODE_NAME[s.mode]}${s.mode==="serie"?" · "+esc(THEMES[s.theme].n):""}</span><button class="quit" data-quit>${s.mode==="daily"?"Pause":"Quitter"}</button></div>`;
  if (s.duel) head += Amis.duelBar(s);
  if (s.duel && s.mode !== "chrono" && st && st.k !== "fact" && st.ans === undefined) {
    if (!st.dl) st.dl = Date.now() + DUEL_Q*1000;
    const left = Math.max(0, st.dl - Date.now());
    head += `<div class="row between" style="margin-bottom:6px"><span class="label">Temps pour répondre</span><span class="label" id="qleft">${Math.ceil(left/1000)} s</span></div><div class="timer"><i id="qbar" style="width:${left/(DUEL_Q*10)}%"></i></div>`;
  }
  if (s.mode === "chrono") {
    const left = Math.max(0, s.ends - Date.now());
    head += `<div class="row between" style="margin-bottom:8px"><span class="label">Score ${s.score||0}</span><span class="label" id="tleft">${Math.ceil(left/1000)} s</span></div><div class="timer"><i id="tbar" style="width:${left/(s.total*10)}%"></i></div>`;
  } else if (s.mode === "survie") {
    head += `<div class="row between" style="margin-bottom:14px"><span class="hearts" aria-label="${s.lives} vies">${"♥".repeat(Math.max(0,s.lives))}<span style="opacity:.25">${"♥".repeat(s.maxLives-Math.max(0,s.lives))}</span></span><span class="label">Question ${s.pos+1}</span></div>`;
  } else {
    head += `<div class="progress" aria-hidden="true">${s.steps.map((_,i)=>`<i class="${i<s.pos?"done":i===s.pos?"now":""}"></i>`).join("")}</div>`;
  }
  if (st.k === "fact") {
    const f = F[st.i];
    return head+`<article class="card fact"><span class="chip lamp">${dot(f[0])}Fait du jour · ${esc(THEMES[f[0]].n)}</span>
      <h2>${esc(f[1])}</h2><p>${esc(f[2])}</p></article>
      <div style="margin-top:16px"><button class="btn" data-next>Je retiens, on continue</button></div>`;
  }
  const q = Q[st.id], n = q[2].length;
  // Vrai ou faux : toujours « Vrai » à gauche et « Faux » à droite (avant, la bonne réponse était toujours la première)
  const order = n === 2 ? (q[2][1] === "Vrai" ? [1,0] : [0,1]) : shuffle([...Array(n).keys()], rng(s.seed + hash(st.id)));
  const ans = st.ans, hide = st.hide || [];
  const pk = q[6] && q[6].t === "pick";
  if (st.ans === undefined && !st.t0) st.t0 = Date.now();
  const choices = order.map(o => {
    let cls = "choice";
    if (ans !== undefined) cls += o===0 ? " right" : o===ans ? " wrong" : " dim";
    else if (hide.includes(o)) cls += " gone";
    return `<button class="${cls}" data-ans="${o}" ${ans!==undefined||hide.includes(o)?"disabled":""} ${pk?`aria-label="Drapeau ${o+1}"`:""}>${pk ? flagImg(GEO_BY[q[2][o]]) : esc(q[2][o])}</button>`;
  }).join("");
  const lvlName = ["","Facile","Moyen","Pointu"][q[1]];
  let tools = "";
  if (ans === undefined) {
    const j = s.joker > 0 && n > 2 ? `<button class="joker" data-joker>${gIcon("joker",24)}Joker 50/50</button>` : "<span></span>";
    const c = s.combo >= 2 ? `<span class="combo">Combo ${s.combo}${multTxt(s.combo+1)?" · prochaine "+multTxt(s.combo+1):""}</span>` : "<span></span>";
    tools = `<div class="tools">${j}${c}</div>`;
  }
  let after = "";
  if (ans !== undefined) {
    const ok = ans === 0, e = S.q[st.id];
    const gain = ok ? `<span><b>+${st.xp} XP · +${coinsTxt(st.coins)}</b>${st.combo>=3?" · combo "+multTxt(st.combo):""}</span>` : "";
    if (s.mode === "chrono") after = `<div class="verdict ${ok?"ok":"ko"}" role="status"><b>${ok?"Juste":"Non : "+esc(q[2][0])}</b></div>`;
    else after = `<div class="verdict ${ok?"ok":"ko"}" role="status"><b>${ok?"Bien vu.":(ans===-1?"Temps écoulé ! La réponse était : ":"Raté, la réponse était : ")+esc(q[2][0])}</b><p>${esc(q[3])}</p>${q[5]?`<p class="anec"><b>Le savais-tu ?</b> ${esc(q[5])}</p>`:""}</div>
      <div class="gain">${gain}<span>${ok?"Maîtrise "+e.b+"/5":"Rangée dans Revoir mes erreurs"}</span></div>
      <div style="margin-top:16px"><button class="btn" data-next>${lastStep(s)?"Voir mon bilan":"Question suivante"}</button></div>`;
  }
  return head+`<article class="card q">
    <div class="row"><span class="chip">${dot(q[0])}${esc(THEMES[q[0]].n)}</span><span class="chip">${lvlName}</span></div>
    ${isQuote(q) ? `<div class="qlab">Qui a dit ?</div><blockquote class="quote">« ${esc(q[4])} »</blockquote>` : `<h2>${esc(q[4])}</h2>`}${qPic(q)}<div class="choices ${pk?"flags":""}">${choices}</div>${tools}${after}</article>`;
}
const lastStep = s => s.mode === "survie" ? s.lives <= 0 : s.pos === s.steps.length-1;
// Duel : 10 secondes par question (sinon celui qui finit en premier attend l'autre trop longtemps)
const DUEL_Q = 10, DUEL_READ = 7;
let qtick = null;
function startQTick(){
  clearInterval(qtick);
  qtick = setInterval(() => {
    const s = S.session; if (!s || !s.duel || s.done || S.tab !== "jouer") return clearInterval(qtick);
    const st = s.steps[s.pos]; if (!st || st.k === "fact" || st.ans !== undefined || !st.dl) return;
    const left = Math.max(0, st.dl - Date.now());
    const b = document.getElementById("qbar"), t = document.getElementById("qleft");
    if (b) b.style.width = (left/(DUEL_Q*10))+"%"; if (t) t.textContent = Math.ceil(left/1000)+" s";
    if (left <= 0) { clearInterval(qtick); doAnswer(s, -1); }
  }, 200);
}
function startTick(){
  tick = setInterval(() => {
    const s = S.session; if (!s || s.mode!=="chrono") return clearInterval(tick);
    const left = Math.max(0, s.ends - Date.now());
    const b = document.getElementById("tbar"), t = document.getElementById("tleft");
    if (left <= 15000) stressUpdate();
    if (b) b.style.width = (left/(s.total*10))+"%"; if (t) t.textContent = Math.ceil(left/1000)+" s";
    if (left <= 0) { clearInterval(tick); clearTimeout(autoNext); finish(); }
  }, 250);
}

/* --- Bilans --- */
function itemsOf(s){
  return s.steps.filter(st => st.k==="fact" || st.ans !== undefined).map(st => st.k==="fact" ? {f:st.i} : {id:st.id, ok:st.ans===0});
}
function recapList(items){
  return `<div class="list">${items.map(it => {
    if ("f" in it) { const f = F[it.f]; return `<div class="item"><span class="mk f">★</span><div><b>${esc(f[1])}</b><span>Fait du jour</span></div></div>`; }
    const q = Q[it.id]; if (!q) return "";
    return `<div class="item"><span class="mk ${it.ok?"ok":"ko"}">${it.ok?"✓":"✗"}</span><div><b>${esc(q[2][0])}</b><span>${esc(q[4])}</span>${it.ok?"":`<span style="margin-top:4px">${esc(q[3])}</span>`}</div></div>`;
  }).join("")}</div>`;
}
function renderRecap(){
  const s = S.session, items = itemsOf(s), qs = items.filter(i=>"id" in i), ok = qs.filter(i=>i.ok).length;
  let big, title;
  if (s.mode === "chrono") { big = ok; title = plural(ok,"bonne réponse")+" en "+s.total+" secondes."; }
  else if (s.mode === "survie") { big = ok; title = "Tu as tenu "+plural(qs.length,"question")+"."; }
  else { big = ok+"/"+qs.length; title = s.mode==="daily" ? "Défi terminé : tu as appris "+items.length+" choses." : s.duel ? "Duel terminé." : "Série terminée."; }
  const msg = s.newRec ? "Nouveau record !" : ok===qs.length && qs.length ? "Sans faute." : "Tes erreurs t'attendent dans Revoir mes erreurs, quand tu veux.";
  return `<section class="stack">
    <div class="label">${MODE_NAME[s.mode]}${s.mode==="serie"?" · "+esc(THEMES[s.theme].n):""} · bilan</div>
    <div class="score">${big}</div>
    <h1 class="big" style="font-size:28px">${title}</h1>
    <p class="muted">${msg}</p>
    <div class="row"><span class="chip lamp">+${s.xp} XP</span><span class="chip lamp">${coinIco}+${fmtC(s.coins)}${s.mode==="daily"&&!S.days[s.date]?" (+10 en terminant)":""}</span><span class="chip">Meilleur combo : ${s.best}</span></div>
    ${s.duel ? Amis.recap(s) : ""}
    ${s.mode === "portail" ? `<div class="card banner-am stack" style="align-items:center;text-align:center">${s.portalSkin ? creatureSVG(skinOf(s.portalSkin), 110) + `<b>Le portail t'a confié ${esc(skinOf(s.portalSkin).n)} !</b><span class="muted">Il t'attend dans ta Collection.</span>` : s.portalWin ? `<b>Défi réussi !</b>` : `<b>Le portail s'est refermé…</b><span class="muted">Il fallait ${PORTAL_GOAL} bonnes réponses. Il se rouvrira un autre jour.</span>`}</div>` : ""}
    ${recapList(items)}
    <button class="btn" data-end>${s.mode==="daily"?"Terminer le défi":"Continuer"}</button>
    ${s.mode!=="daily"&&!s.duel&&s.mode!=="portail"?`<button class="btn ghost" data-again>Rejouer</button>`:""}
  </section>`;
}
function finish(){
  const s = S.session; if (!s || s.done) return;
  s.done = true;
  const ok = itemsOf(s).filter(i=>"id" in i && i.ok).length;
  if ((s.mode==="chrono" || s.mode==="survie") && ok > (S.rec[s.mode]||0)) { S.rec[s.mode] = ok; s.newRec = ok > 0; }
  if (s.mode !== "daily") S.games = (S.games||0)+1;
  if (s.mode === "serie" && typeof Quetes !== "undefined") Quetes.ev("serie", {th:s.theme});
  if (s.mode === "portail") portalFinish(s, ok);
  if (s.mode === "chrono") misEvent("chr", ok);
  if (s.mode === "chrono" && ok >= 15) unlockSkin("analyste"); if (s.mode === "survie") misEvent("surv", ok);
  const nq = itemsOf(s).filter(i=>"id" in i).length;
  if ((s.mode === "serie" || s.mode === "mix" || s.mode === "qad") && nq >= 10 && ok === nq) winSucces("parfait");
  if (s.diff === "expert" && nq >= 10 && ok >= 8) winSucces("expert");
  if (s.duel) Amis.sync(s);
  checkBadges(); save(); render();
}

/* --- Avant ou après --- */
function renderAvap(){
  const s = S.session, A = EV[s.a];
  const head = `<div class="row between" style="margin-bottom:12px"><span class="label">Avant ou après ? · série ${s.score}</span><button class="quit" data-quit>Quitter</button></div>` + (s.duel ? Amis.duelBar(s) : "");
  if (s.b < 0) s.done = true;
  if (s.done) {
    return head+`<section class="stack"><div class="score">${s.score}</div>
      <h1 class="big" style="font-size:28px">${s.newRec?"Nouveau record !":"Fin de la série."}</h1>
      ${s.lastMissY ? `<div class="list"><div class="item"><span class="mk ko">✗</span><div><b>${esc(EV[s.lastMissY[0]][0])}</b><span>${yearTxt(EV[s.lastMissY[0]][1])} (tu avais dit ${yearTxt(s.lastMissY[1])})</span></div></div></div>` : ""}
      ${s.lastMiss ? `<div class="list"><div class="item"><span class="mk ko">✗</span><div><b>${esc(EV[s.lastMiss[0]][0])}</b><span>${yearTxt(EV[s.lastMiss[0]][1])}, donc ${s.lastMiss[1]} l'événement d'avant</span></div></div><div class="item"><span class="mk f">★</span><div><b>${esc(EV[s.lastMiss[2]][0])}</b><span>${yearTxt(EV[s.lastMiss[2]][1])}</span></div></div></div>` : ""}
      <div class="row"><span class="chip lamp">+${s.xp||0} XP</span><span class="chip lamp">${coinIco}+${s.score}</span></div>
      ${s.duel ? Amis.recap(s) + `<button class="btn" data-end>Continuer</button>` : `<button class="btn" data-again>Rejouer</button><button class="btn ghost" data-end>Continuer</button>`}</section>`;
  }
  const B = EV[s.b], shown = s.ans !== undefined;
  const ev = (e, showY) => `<div class="ev"><div class="yr ${showY?"":"hid"}">${showY?yearTxt(e[1]):"?"}</div><h2>${esc(e[0])}</h2><div class="row" style="margin-top:8px"><span class="chip">${dot(e[2])}${esc(THEMES[e[2]].n)}</span></div></div>`;
  let ctrl;
  if (s.kind === "year" && !shown) ctrl = `<div class="yearq"><div class="label" style="text-align:center">Manche bonus · en quelle année ?</div>
      <div class="yrow"><input id="avyear" class="yin" type="text" inputmode="numeric" maxlength="5" placeholder="Année" value="${esc(s.yv||"")}" aria-label="Année de l'événement">
      <button class="btn small ${s.bc?"":"ghost"}" data-era aria-pressed="${!!s.bc}">${s.bc?"av. J.-C.":"apr. J.-C."}</button></div>
      <p class="muted" style="font-size:13.5px;text-align:center;margin:0">${s.yerr?"<b>Écris une année avec des chiffres.</b> ":""}Accepté à ±${yearTol(B[1])} ans près. Pile dans le mille : bonus !</p>
      <button class="btn" data-avyear>Valider</button></div>`;
  else if (s.kind === "year") ctrl = `<div class="verdict ${s.ok?"ok":"ko"}" role="status"><b>${s.exact?"Pile dans le mille !":s.ok?"Bien vu, à "+s.diff+" an"+(s.diff>1?"s":"")+" près.":"Raté."}</b><p>${esc(B[0])} : ${yearTxt(B[1])}. Tu as dit ${yearTxt(s.guess)}${s.exact?"":" (écart de "+s.diff+" an"+(s.diff>1?"s":"")+")"}.</p></div>
    <button class="btn" data-avnext>${s.ok?"Suivant":"Voir le bilan"}</button>`;
  else if (!shown) ctrl = `<div class="label" style="text-align:center">L'événement du bas a eu lieu…</div><div class="vs"><button class="btn" data-av="before">Avant</button><button class="btn" data-av="after">Après</button></div>`;
  else ctrl = `<div class="verdict ${s.ok?"ok":"ko"}" role="status"><b>${s.ok?"Exact.":"Raté."}</b><p>${esc(B[0])} : ${yearTxt(B[1])}, soit ${Math.abs(B[1]-A[1])} ans ${B[1]<A[1]?"avant":"après"}.</p></div>
    <button class="btn" data-avnext>${s.ok?"Suivant":"Voir le bilan"}</button>`;
  return head+`<section class="avap">${ev(A,true)}${ev(B,shown)}${ctrl}</section>`;
}

/* --- Profil --- */
function renderProfile(){
  const segs = {progres:"Progrès", badges:"Badges", biblio:"Carnet", moi:"Profil", reglages:"Réglages"}, SI = {progres:"chart", badges:"trophy", biblio:"book", moi:"user", reglages:"gear"};
  const tabs = `<div class="seg gseg" role="group" aria-label="Sections du profil">${Object.keys(segs).map(k=>`<button data-seg="${k}" aria-pressed="${profSeg===k}">${gIcon(SI[k],26)}<span>${segs[k]}</span></button>`).join("")}</div>`;
  let body;
  if (profSeg==="badges") body = renderBadges();
  else if (profSeg==="biblio") body = renderLibrary();
  else if (profSeg==="reglages") body = (typeof Amis !== "undefined" ? Amis.notifCard() : "") + `<div class="card stack"><div class="label">Affichage</div>
      <div class="row between"><span>Thème</span><div class="row" role="group" aria-label="Thème">${[["auto","Auto"],["light","Clair"],["dark","Sombre"]].map(([k,n]) => { const on = (S.settings.theme || "auto") === k; return `<button class="btn small ${on?"":"ghost"}" data-theme-set="${k}" aria-pressed="${on}">${n}</button>`; }).join("")}</div></div>
      <p class="muted" style="font-size:13.5px">« Auto » suit le réglage de ton téléphone.</p></div>
    <div class="card stack"><div class="label">Musique</div>
      <div class="row between"><span>Musique d'ambiance</span><button class="btn small ${S.settings.music?"":"ghost"}" data-music="toggle" aria-pressed="${S.settings.music}">${S.settings.music?"Activée":"Coupée"}</button></div>
      <div class="row between"><label for="mvol">Volume</label><input id="mvol" type="range" min="0" max="100" value="${S.settings.vol}" style="accent-color:var(--lamp);flex:1;max-width:220px"></div>
      <div class="row between"><span>Effets sonores</span><button class="btn small ${S.settings.sfx!==false?"":"ghost"}" data-sfx aria-pressed="${S.settings.sfx!==false}">${S.settings.sfx!==false?"Activés":"Coupés"}</button></div>
      <p class="muted" style="font-size:13.5px">Une boucle douce composée par l'appli. Sur iPhone et iPad, coupe le mode silencieux pour l'entendre.</p></div>
    <div class="card stack"><div class="label">À propos</div><button class="about" data-admin-tap type="button">Lumen · ${Object.keys(Q).length} questions, ${ORDER.length} thèmes, ${CHARS.length + SHOP_SKINS.length + SECRETS.length} personnages. Ta progression reste sur cet appareil.</button></div>
    ${S.admin ? `<div class="card stack admin"><div class="label">Mode admin</div>
      <div class="row">${[100,1000,10000].map(n => `<button class="btn small" data-admin-add="${n}">+${n} pièces</button>`).join("")}</div>
      <div class="row between"><span>Pièces infinies</span><button class="btn small ${S.admin.inf?"":"ghost"}" data-admin-inf aria-pressed="${!!S.admin.inf}">${S.admin.inf?"Activées":"Désactivées"}</button></div>
      <button class="btn small" data-admin-portal>Ouvrir le portail maintenant</button>
      <button class="btn ghost small" data-admin-off>Quitter le mode admin</button></div>` : ""}`;
  else if (profSeg==="moi") { if (!draft) draft = {...S.profile}; body = (typeof Amis !== "undefined" ? Amis.accountCard() : "") + profileForm(true) + `<button class="btn ghost" data-reset>${confirmReset?"Confirmer : tout effacer":"Remettre à zéro ma progression"}</button>`; }
  else body = renderProgress();
  return `<section class="stack">${tabs}${body}</section>`;
}
function renderProgress(){
  const A = acctLvl(), ids = Object.keys(S.q).filter(id=>Q[id]);
  const ok = ids.reduce((a,id)=>a+S.q[id].ok,0), ko = ids.reduce((a,id)=>a+S.q[id].ko,0);
  const acc = ok+ko ? Math.round(ok/(ok+ko)*100) : 0;
  const rows = ORDER.map(k => {
    const L = themeLvl(k), list = byTheme(k), m = list.filter(id=>S.q[id] && S.q[id].b>=3).length;
    return `<div class="trow"><span class="nm">${dot(k)}${esc(THEMES[k].n)}</span><span class="lv">Niv. ${L.L} · ${rank(L.L)}</span>
      <span class="meter"><i style="width:${Math.round(L.p*100)}%"></i></span>
      <span class="sub">${S.xp[k]||0} XP · ${correctIn(k)}/${list.length} réussies · ${m} maîtrisées</span></div>`;
  }).join("");
  return `<div class="acct"><div class="ring" style="--p:${Math.round(A.p*100)}"><div>${A.L}</div></div>
      <div class="stack" style="gap:4px"><span class="label">Niveau de compte</span><b style="font-family:var(--f-display);font-size:19px">${totalXp()} XP au total</b><span class="muted" style="font-size:14.5px">Encore ${Math.ceil(A.need)} XP pour le niveau ${A.L+1}.</span></div></div>
    <div class="stats">
      <div class="stat"><div class="v">${streak()}</div><div class="label">Défis d'affilée</div></div>
      <div class="stat"><div class="v">${acc}<small style="font-size:15px">%</small></div><div class="label">Réussite</div></div>
      <div class="stat"><div class="v">${Object.keys(S.badges).length}</div><div class="label">Badges</div></div>
    </div>
    <div class="card stack"><div class="label">Niveau par thème</div><div class="tl">${rows}</div>
      <p class="muted" style="font-size:14px">Facile rapporte 10 XP, moyen 20, pointu 30. Une question déjà réussie rapporte un tiers.</p></div>
    <div class="card stack"><div class="label">Records</div>
      <div class="row between"><span>Chrono</span><b>${S.rec.chrono||0}</b></div>
      <div class="row between"><span>Survie</span><b>${S.rec.survie||0}</b></div>
      <div class="row between"><span>Avant ou après ?</span><b>${S.rec.avap||0}</b></div></div>`;
}
function badgeTile(b, size){ const own = S.badges[b.id], cur = Math.min(b.cur(), b.goal);
  return `<div class="bt ${own?"own":"lock"}" title="${esc(b.desc)}">${badge2(b.tier, b.icon, size||74)}<b>${esc(b.name.replace(/^.* · /, "") === b.name ? b.name : TIER_N[b.tier])}</b><span>${own ? "Obtenu" : `${cur}/${b.goal}`}</span><span class="bc"><span class="coin" aria-hidden="true"></span>${b.coins}</span></div>`; }
function renderBadges(){
  return renderSucces() + renderBadges0();
}
function renderBadges0(){
  const got = BADGES.filter(b => S.badges[b.id]).length;
  const groups = [["Général","Bonnes réponses, tous thèmes"],["Régularité","Défis du jour d'affilée"],["Records","Records des modes"],["La Tour","La Tour"],["En ligne","En ligne : duels et salons"]].filter(([g]) => BADGES.some(b => b.g === g)).map(([g,t]) => `<div class="card stack" style="gap:10px"><div class="label">${t}</div><div class="bgrid">${BADGES.filter(b=>b.g===g).map(b => badgeTile(b)).join("")}</div></div>`).join("");
  const themes = ORDER.map(k => { const bs = BADGES.filter(b=>b.th===k), n = bs.filter(b=>S.badges[b.id]).length;
    return `<details class="card tb"><summary><span class="nm">${dot(k)}${esc(THEMES[k].n)}</span><span class="label">${n}/6 · ${correctIn(k)}/${byTheme(k).length} réussies</span></summary><div class="bgrid">${bs.map(b => badgeTile(b, 64)).join("")}</div></details>`; }).join("");
  return `<p class="muted">${got}/${BADGES.length} badges obtenus. Chaque badge rapporte des pièces, une seule fois. Plus le palier est haut, plus la médaille impressionne.</p>${groups}<div class="label">Badges de thème · bronze 5, argent 10, or 20, platine 30, diamant 40, Maître 50 maîtrisées</div>${themes}`;
}
function renderLibrary(){
  const facts = Object.keys(S.f).map(Number).filter(i=>F[i]);
  const learned = id => S.q[id] && S.q[id].ok > 0;
  const qs = Object.keys(S.q).filter(id=>Q[id]).sort((a,b)=>S.q[b].last-S.q[a].last);
  const nLearn = qs.filter(learned).length + facts.length;
  const qq = libQuery.trim().toLowerCase();
  const match = (...t) => !qq || t.join(" ").toLowerCase().includes(qq);
  const entryQ = id => { const q = Q[id], e = S.q[id], ok = learned(id);
    return `<div class="entry ${ok?"":"todo"}" style="--h:${THEMES[q[0]].h}"><div class="row"><span class="chip">${dot(q[0])}${esc(THEMES[q[0]].n)}</span><span class="label">${ok?"Maîtrise "+e.b+"/5":"À retravailler"}</span></div><div class="q">${isQuote(q) ? "Qui a dit : « "+esc(q[4])+" » ?" : esc(q[4])}</div>${qPic(q, true)}${q[6]&&q[6].t==="pick"?`<div class="pic sm">${flagImg(GEO_BY[q[2][0]],"flag")}</div>`:""}<div class="a">${esc(q[2][0])}</div><p>${esc(q[3])}</p>${q[5]?`<p class="anec"><b>Le savais-tu ?</b> ${esc(q[5])}</p>`:""}</div>`; };
  const entryF = i => `<div class="entry" style="--h:${THEMES[F[i][0]].h}"><span class="chip lamp">${dot(F[i][0])}Fait du jour</span><div class="q">${esc(F[i][1])}</div><p>${esc(F[i][2])}</p></div>`;
  const search = `<input class="field" id="lib-search" type="search" placeholder="Chercher un mot, un nom, une date…" value="${esc(libQuery)}" aria-label="Chercher dans le carnet">`;
  if (!facts.length && !qs.length && !Object.keys(S.mots||{}).length) return `<div class="empty">Ton carnet se remplit à chaque partie : chaque bonne réponse et chaque fait du jour y sont rangés.</div>`;
  let body;
  const motsK = Object.keys(S.mots || {}).map(Number).filter(i => MOTS[i]);
  if (libFilter === "mots") {
    body = `<div class="row between"><h2 class="nbt">Mots du jour</h2><button class="btn small ghost" data-nb="all">Tous les thèmes</button></div>` + (motsK.length ? motsK.map(i => `<div class="entry" style="--h:40"><div class="q">${esc(MOTS[i][0])} <span class="muted" style="font-size:13px;font-weight:400;font-style:italic">${esc(MOTS[i][1])}</span></div><p style="color:var(--fg)">${esc(MOTS[i][2])}</p><p>${esc(MOTS[i][3])}</p></div>`).join("") : `<div class="empty">Garde le mot du jour depuis l'Accueil pour le retrouver ici.</div>`);
  } else if (libFilter === "all" && !qq) {
    body = `<div class="nbgrid"><button class="nbk" data-nb="mots" style="--h:40"><span class="spine"></span><b>Mots du jour</b><span class="label">${motsK.length} mot${motsK.length>1?"s":""}</span><span class="meter"><i style="width:${Math.round(motsK.length/MOTS.length*100)}%"></i></span></button>${ORDER.map(k => { const n = byTheme(k).filter(learned).length + facts.filter(i=>F[i][0]===k).length, t = byTheme(k).length;
      return `<button class="nbk" data-nb="${k}" style="--h:${THEMES[k].h}" ${n||qs.some(id=>qTheme(id)===k)?"":"disabled"}><span class="spine"></span><b>${esc(THEMES[k].n)}</b><span class="label">${n} notion${n>1?"s":""}</span><span class="meter"><i style="width:${Math.round(Math.min(1,n/t)*100)}%"></i></span></button>`; }).join("")}</div>`;
  } else {
    const keep = th => libFilter==="all" || libFilter===th;
    const fl = facts.filter(i=>keep(F[i][0]) && match(F[i][1],F[i][2]));
    const ql = qs.filter(id=>keep(qTheme(id)) && match(Q[id][4],Q[id][2][0],Q[id][3],Q[id][5]||""));
    const head = libFilter!=="all" ? `<div class="row between"><h2 class="nbt">${dot(libFilter)}${esc(THEMES[libFilter].n)}</h2><button class="btn small ghost" data-nb="all">Tous les thèmes</button></div>` : "";
    body = head + (!fl.length && !ql.length ? `<div class="empty">Rien ne correspond.</div>` : fl.map(entryF).join("") + ql.filter(learned).slice(0,200).map(entryQ).join("") + (ql.some(id=>!learned(id)) ? `<div class="label" style="margin-top:14px">À retravailler</div>` + ql.filter(id=>!learned(id)).slice(0,100).map(entryQ).join("") : ""));
  }
  return `<div class="nbhead"><b>${nLearn}</b><span>notion${nLearn>1?"s":""} apprise${nLearn>1?"s":""} depuis le début</span></div>${search}<div id="lib-body">${body}</div>`;
}

/* ---------- Le Portail : événement surprise ----------
   Tous les jours (depuis le 10 novembre 2026, demande d'Erwan), le portail s'ouvre à une heure au hasard entre 9 h et 18 h, jusqu'à minuit.
   Un pop-up prévient le joueur. 10 questions très difficiles (content/extra/portail.txt) : 7 bonnes réponses
   ou plus débloquent un des 8 personnages du Portail, tiré au sort parmi ceux qu'on n'a pas encore. Un essai par ouverture. */
const PORTAL_GOAL = 7;
const portalIds = () => Object.keys(Q).filter(id => Q[id][6] && Q[id][6].t === "portal");
const portalFresh = () => portalIds().filter(id => !S.q[id]); // questions du Portail jamais vues par ce joueur
// Le même portail pour tout le monde : il dépend seulement de la date (notifs/send.js fait le même calcul pour prévenir).
// PORTAL_FORCE : jours où Erwan ouvre le portail lui-même, avec l'heure d'ouverture en minutes (14 h 50 = 890).
const PORTAL_FORCE = {"2026-11-09": 890, "2026-11-10": 0};
function portalPlan(d){
  if (PORTAL_FORCE[d] !== undefined) return {open:true, at:PORTAL_FORCE[d]};
  const r = rng(dayNum(d) * 7919);
  r(); // (ancien tirage « ouvert ou pas » : gardé pour ne pas changer les heures d'ouverture)
  return {open:true, at:9*60 + Math.floor(r() * 9*60)};
}
function portalToday(){
  const d = today();
  if (!S.portal || S.portal.day !== d) { S.portal = {day:d, seen:false, tried:false}; save(); }
  Object.assign(S.portal, portalPlan(d));
  if (S.portal.force) S.portal.at = 0; // ouverture forcée par le mode admin
  return S.portal;
}
const portalOpen = () => { if (!S.profile) return false; const p = portalToday(), n = new Date(); // tried : un seul essai par ouverture
  // Sécurité : s'il reste moins de 10 questions jamais vues, le portail reste fermé plutôt que de répéter
  return (p.open || p.force) && !p.tried && n.getHours()*60 + n.getMinutes() >= p.at && portalFresh().length >= 10; };
function portalBanner(){
  if (window.__noPortal || !portalOpen() || S.portal.seen || (S.session && !S.session.done && S.tab === "jouer") || document.querySelector(".am-inv.portal")) return;
  S.portal.seen = true; save();
  if (S.settings.sfx !== false) { try { Music.sfx("level"); navigator.vibrate && navigator.vibrate([120, 80, 120, 80, 200]); } catch(e){} }
  const el = document.createElement("div"); el.className = "am-inv portal"; el.setAttribute("role", "alertdialog");
  el.innerHTML = `<button class="am-x" data-portal-close aria-label="Fermer">×</button>
    <div class="row" style="gap:10px;align-items:center;flex-wrap:nowrap"><span class="portal-ic"></span><div class="stack" style="gap:2px;min-width:0"><b>Le portail s'est ouvert !</b><span>Veux-tu relever le défi ? 10 questions très difficiles : ${PORTAL_GOAL} bonnes réponses pour gagner un personnage secret.</span></div></div>
    <div class="row"><button class="btn small" data-portal-go>Entrer dans le portail</button><button class="btn small ghost" data-portal-close>Plus tard</button></div>`;
  document.body.appendChild(el);
}
function portalCard(){
  if (!portalOpen()) return "";
  const left = PORTAL_SKINS.filter(s => !S.skins[s.id]).length;
  return `<button class="portal-card" data-portal-go>${[8, 22, 36, 70, 88].map((l, i) => `<i class="portal-ember" style="left:${l}%;animation-delay:${-i * .7}s"></i>`).join("")}<svg class="portal-figs" width="58" height="22" viewBox="0 0 58 22" aria-hidden="true">${[4,16,30,44].map((x, i) => `<g fill="#050102"><circle cx="${x+4}" cy="${5 + i % 2}" r="3.2"/><path d="M${x} ${22} L${x+1} ${10 + i % 2} Q${x+4} ${7 + i % 2} ${x+7} ${10 + i % 2} L${x+8} 22Z"/></g>`).join("")}</svg><span class="portal-ic big"></span><span class="stack" style="gap:3px;min-width:0;text-align:left"><b>Une faille s'est ouverte</b><span>Jusqu'à minuit · 10 questions très difficiles · ${PORTAL_GOAL}/10 pour gagner ${left ? "un personnage secret" : "300 pièces"}</span></span></button>`;
}
function portalFinish(s, ok){
  S.portal.tried = true; s.portalWin = ok >= PORTAL_GOAL;
  if (!s.portalWin) return;
  const left = PORTAL_SKINS.filter(sk => !S.skins[sk.id]);
  if (left.length) { const sk = left[Math.floor(Math.random() * left.length)]; s.portalSkin = sk.id; unlockSkin(sk.id); }
  else { S.coins += 300; toasts.push(`<b>Le portail t'offre 300 pièces</b> · tu as déjà tous ses personnages !`); }
}

/* ---------- Interactions ---------- */
function start(mode, extra){
  if (mode === "daily") {
    if (S.days[today()]) return;
    S.session = S.pausedDaily || newSession("daily"); S.pausedDaily = null;
  } else {
    if (S.session && S.session.mode === "daily" && !S.session.done) S.pausedDaily = S.session;
    S.session = newSession(mode, extra);
  }
  if (typeof Quetes !== "undefined") Quetes.newRun();
  S.tab = "jouer"; save(); render(); window.scrollTo(0,0);
}
function leaveSession(){
  const s = S.session; if (!s) return;
  clearTimeout(autoNext);
  if (s.mode === "daily" && !s.done) S.pausedDaily = s;
  if (s.duel && !s.done) { s.done = true; Amis.sync(s); } // quitter un duel = rendre sa copie
  S.session = null;
}
function goNext(){
  const s = S.session; if (!s) return;
  const st = s.steps[s.pos];
  if (st && st.k==="fact") S.f[st.i] = today();
  if (s.mode === "survie" && s.lives <= 0) return finish();
  s.pos++;
  if ((s.mode==="chrono" || s.mode==="survie") && s.pos >= s.steps.length) s.steps.push(qStep(nextFor(s)));
  if (s.mode!=="chrono" && s.mode!=="survie" && s.pos >= s.steps.length) return finish();
  save(); render(); if (s.mode!=="chrono") window.scrollTo(0,0);
}
function shareText(){
  const d = S.days[today()]; if (!d) return "";
  const dt = new Date();
  return `Lumen · Défi du ${dt.getDate()}/${dt.getMonth()+1} · ${THEMES[dailyTheme()].n}\n${(d.items||[]).filter(i=>"id" in i).map(i=>i.ok?"🟩":"🟥").join("")} ${d.ok}/${d.n}`;
}
// Avant ou après, manche « année » : Entrée valide la réponse
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target && e.target.id === "avyear") { e.preventDefault(); const v = document.querySelector("[data-avyear]"); if (v) v.click(); } });
document.addEventListener("click", e => {
  try { onClick(e); if (S.session && S.session.duel) Amis.sync(S.session); } catch(err) { console.error(err); try { save(); render(); } catch(e2){} }
});
// Réponse à une question (v = -1 : temps écoulé en duel, compte comme une erreur)
function doAnswer(s, v){
    const st = s.steps[s.pos]; if (!st || st.ans !== undefined || s.done) return;
    st.ans = v; const ok = st.ans === 0; noteAnswer(ok);
    s.combo = ok ? s.combo+1 : 0; s.best = Math.max(s.best, s.combo);
    st.combo = s.combo; const g = answer(st.id, ok, s.combo); st.xp = g.xp; st.coins = g.coins; s.xp += g.xp; s.coins += g.coins;
    if (s.mode==="chrono" && ok) s.score = (s.score||0)+1;
    if (s.mode==="survie" && !ok) s.lives--;
    if (s.combo >= 20) unlockSkin("comete");
    feedback(ok, s.combo);
    succesAnswer(s, st, ok);
    if (ok) { misEvent("ok", 1); misEvent("th", 1, qTheme(st.id)); if (Q[st.id][1] === 3) misEvent("hard", 1); misEvent("combo", s.combo); if (s.mode === "revoir") misEvent("rev", 1); }
    save(); render();
    if (s.duel) Amis.sync(s);
    if (s.mode==="chrono") autoNext = setTimeout(() => { if (S.session===s && !s.done) goNext(); }, ok ? 450 : 1100);
    // En duel, on passe tout seul à la suite après quelques secondes pour que les deux joueurs avancent au même rythme
    else if (s.duel) { clearTimeout(autoNext); const pos = s.pos; autoNext = setTimeout(() => { if (S.session===s && !s.done && s.pos===pos && S.tab==="jouer") { goNext(); Amis.sync(s); } }, DUEL_READ*1000); }
}
function onClick(e){
  const b = e.target.closest("button"); if (!b || b.disabled) return;
  const d = b.dataset, s = S.session;
  if (d.gd !== undefined) { if (S.settings.sfx !== false) try { Music.sfx("tap"); } catch(err){} return Guildes.click(b); }
  if (d.am) { if (S.settings.sfx !== false) try { Music.sfx("tap"); } catch(err){} return Amis.click(b); }
  if (d.qs !== undefined) { if (S.settings.sfx !== false) try { Music.sfx("tap"); } catch(err){} return Quetes.click(b); }
  if (d.bs !== undefined) { if (S.settings.sfx !== false && d.bs !== "ans") try { Music.sfx("tap"); } catch(err){} return Boss.click(b); }
  if (d.tw !== undefined && !b.closest(".tw-fx")) { if (S.settings.sfx !== false && d.tw !== "ans") try { Music.sfx("tap"); } catch(err){} return Tour.click(b); }
  if (d.sl !== undefined) { if (S.settings.sfx !== false && d.sl !== "ans") try { Music.sfx("tap"); } catch(err){} return Salons.click(b); }
  if (d.avPick !== undefined) { draft.avatar = +d.avPick; formErr = ""; const keep = readDraft(); return render(), keep; }
  const fromBar = !!b.closest("#tabs");
  // Sons de navigation : « pop » sur les onglets du bas, petit clic sur les autres boutons (les réponses ont leur propre son)
  if (S.settings && S.settings.sfx !== false && d.ans === undefined && !d.av && d.avyear === undefined) {
    try { Music.sfx(fromBar ? "tab" + ["accueil","jouer","amis","boutique","parc","profil","tour"].indexOf(d.tab) % 5 : "tap"); } catch(err){}
  }
  if (d.tab === "parc") { leaveSession(); save(); if (fromBar) { tabFx("parc"); setTimeout(() => Parc.open(), 480); } else Parc.open(); return; }
  if (d.tab) {
    if (d.tab !== "jouer") leaveSession();
    S.tab = d.tab; confirmReset = false; draft = null; formErr = ""; copyFallback = "";
    save(); render(); window.scrollTo(0,0); if (fromBar) tabFx(d.tab); return;
  }
  if (d.start) return start("daily");
  if (d.mode) return start(d.mode);
  if (d.serie) return start("serie", {theme:d.serie});
  if (d.quit !== undefined) { leaveSession(); save(); return render(); }
  if (d.joker !== undefined) {
    const st = s.steps[s.pos]; if (s.joker <= 0 || st.ans !== undefined) return;
    const wrong = shuffle([1,2,3].filter(i=>i<Q[st.id][2].length), rng(s.seed+hash(st.id)+9));
    st.hide = wrong.slice(0,2); s.joker--; save(); return render();
  }
  if (d.ans !== undefined) return doAnswer(s, +d.ans);
  if (d.next !== undefined) return goNext();
  if (d.end !== undefined) {
    if (s && s.mode==="daily" && !S.days[s.date]) {
      const items = itemsOf(s), qs = items.filter(i=>"id" in i);
      S.days[s.date] = {ok:qs.filter(i=>i.ok).length, n:qs.length, items};
      S.coins += 10; toasts.push(`<b>Défi du jour terminé</b> · +10 pièces`);
      if (qs.length >= 10 && qs.every(i=>i.ok)) unlockSkin("etoile");
      misEvent("daily", 1);
      if (new Date().getHours() < 7) winSucces("aube");
      if (qs.length >= 10 && qs.every(i=>i.ok)) winSucces("parfait");
      S.bestStreak = Math.max(S.bestStreak||0, streak()); checkBadges();
    }
    const back = s && s.mode==="daily" ? "accueil" : s && s.duel ? "amis" : "jouer";
    S.session = null; S.tab = back; save(); render(); return window.scrollTo(0,0);
  }
  if (d.again !== undefined) return start(s.mode, s.mode==="serie" ? {theme:s.theme} : null);
  if (d.av) {
    if (s.ans !== undefined) return;
    const A = EV[s.a], B = EV[s.b]; s.ans = d.av;
    s.ok = (d.av==="before") === (B[1] < A[1]);
    if (s.ok) {
      s.score++; misEvent("avap", s.score); const th = B[2], bef = themeLvl(th).L; S.xp[th] = (S.xp[th]||0)+5*PM("xp"); s.xp = (s.xp||0)+5*PM("xp"); S.coins += PM("coin");
      if (themeLvl(th).L > bef) levelUp(themeLvl(th).L, THEMES[th].n, `Tu deviens ${rank(themeLvl(th).L)}.`);
    } else s.lastMiss = [s.b, B[1] < A[1] ? "avant" : "après", s.a];
    feedback(s.ok, s.score);
    save(); return render();
  }
  if (d.era !== undefined) { const el = document.getElementById("avyear"); s.yv = el ? el.value : ""; s.bc = !s.bc; save(); return render(); }
  if (d.avyear !== undefined) {
    if (s.ans !== undefined) return;
    const el = document.getElementById("avyear"), raw = el ? el.value.trim() : "", v = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (!raw || isNaN(v)) { s.yerr = true; s.yv = raw; return render(); }
    const B = EV[s.b], y = s.bc ? -v : v, diff = Math.abs(y - B[1]), tol = yearTol(B[1]);
    s.ans = "year"; s.guess = y; s.diff = diff; s.ok = diff <= tol; s.exact = diff <= 1; delete s.yerr; delete s.yv;
    if (s.ok) {
      s.score++; misEvent("avap", s.score); const th = B[2], bef = themeLvl(th).L, gain = s.exact ? 15 : 8;
      S.xp[th] = (S.xp[th]||0)+gain*PM("xp"); s.xp = (s.xp||0)+gain*PM("xp"); S.coins += (s.exact ? 5 : 2) * PM("coin");
      if (themeLvl(th).L > bef) levelUp(themeLvl(th).L, THEMES[th].n, `Tu deviens ${rank(themeLvl(th).L)}.`);
    } else s.lastMissY = [s.b, y];
    if (S.settings.sfx !== false) { try { Music.sfx(s.exact ? "exact" : s.ok ? "ok" : "ko"); } catch(err){} }
    save(); return render();
  }
  if (d.avnext !== undefined) {
    const endAvap = () => { s.done = true; if (s.score > (S.rec.avap||0)) { S.rec.avap = s.score; s.newRec = true; } S.games = (S.games||0)+1; checkBadges(); };
    if (!s.ok) { endAvap(); save(); return render(); }
    s.a = s.b; s.used.push(s.b); delete s.ans; s.b = nextEvent(s); s.kind = avKind(s); s.bc = false;
    if (s.b < 0) endAvap();
    save(); return render();
  }
  if (d.up) { const u = UPGRADES[d.up], lv = S.up[d.up]||0, p = u.prices[lv]; if (p && S.coins >= p) { S.coins -= p; spend(p); S.up[d.up] = lv+1; toasts.push(`<b>Amélioration achetée</b> · ${esc(u.n)}`); save(); } return render(); }
  if (d.diff) { S.diff = d.diff; save(); return render(); }
  if (d.mot !== undefined) { if (!S.mots) S.mots = {}; S.mots[+d.mot] = today(); checkSucces(); toasts.push(`<b>Mot gardé</b> · il t'attend dans ton carnet.`); save(); return render(); }
  if (d.rescue !== undefined) { const r = rescue(); if (r && S.coins >= r.price) { S.coins -= r.price; spend(r.price); S.frozen[r.day] = true; toasts.push(`<b>Série sauvée !</b> · ${r.n} jours, et ça continue ce soir.`); save(); } return render(); }
  if (d.nb) { libFilter = d.nb; libQuery = ""; render(); return window.scrollTo(0,0); }
  if (d.cal === "open") return Calendrier.open();
  if (d.pot === "open") return Potions.sheet();
  if (d.bq !== undefined) return Boutique.click(b);
  if (d.shopseg) { shopSeg = d.shopseg; return render(); }
  if (d.tbuy) { const t = titleById(d.tbuy); S.titles = S.titles || {};
    if (t && t.p && !S.titles[t.id] && S.coins >= t.p) { S.coins -= t.p; S.titles[t.id] = today(); S.profile.title = t.id; spend(t.p); toasts.push(`<b>Nouveau titre</b> · ${titleTag(t.id, "sm")} est affiché sous ton pseudo.`); save(); try { Amis.api.ping(); } catch(e){} }
    return render(); }
  if (d.tequip !== undefined) { S.profile.title = d.tequip || ""; save(); try { Amis.api.ping(); } catch(e){} return render(); }
  if (d.buy && typeof Boutique !== "undefined" && !Boutique.buyable(d.buy)) return render();
  if (d.buy) { const sk = skinOf(d.buy); if (sk && sk.p && !S.skins[d.buy] && S.coins >= sk.p) { S.coins -= sk.p; S.skins[d.buy] = today(); S.profile.skin = d.buy; spend(sk.p); toasts.push(`<b>${esc(sk.n)} rejoint ta collection</b> · il est équipé.`); save(); } return render(); }
  if (d.accBuy) { const a = ACC.find(x => x.id === d.accBuy); if (a && !S.acc.own[a.id] && S.coins >= a.p && !(a.th && themeLvl(a.th).L < 3)) { S.coins -= a.p; spend(a.p); S.acc.own[a.id] = today(); S.acc.eq[a.slot] = a.id; toasts.push(`<b>${esc(a.n)}</b> · acheté et porté.`); save(); } return render(); }
  if (d.accEq) { const a = ACC.find(x => x.id === d.accEq); if (a && S.acc.own[a.id]) { S.acc.eq[a.slot] = a.id; save(); } return render(); }
  if (d.accOff) { S.acc.eq[d.accOff] = null; save(); return render(); }
  if (d.equip) { if (ownsSkin(d.equip)) { S.profile.skin = d.equip; if (d.equip[0]==="b") S.profile.avatar = +d.equip.slice(1); toasts.push(`<b>${esc(skinOf(d.equip).n)} équipé.</b>`); save(); } return render(); }
  if (d.seg) { profSeg = d.seg; draft = null; formErr = ""; confirmReset = false; return render(); }
  if (d.filter) { libFilter = d.filter; return render(); }
  if (d.share !== undefined) {
    const txt = shareText();
    const fallback = () => { copyFallback = txt; render(); const t = document.querySelector(".hero textarea"); if (t) { t.focus(); t.select(); } };
    try { navigator.clipboard.writeText(txt).then(() => { toasts.push("<b>Résultat copié</b> · colle-le dans ton groupe d'amis."); render(); }, fallback); } catch(err) { fallback(); }
    return;
  }
  if (d.adminTap !== undefined) { adminTaps++; if (adminTaps >= 7 && !S.admin) { S.admin = {inf:false}; save(); toasts.push("<b>Mode admin activé.</b>"); } return render(); }
  if (d.adminAdd) { S.coins += +d.adminAdd; save(); toasts.push(`<b>+${d.adminAdd} pièces</b>`); return render(); }
  if (d.adminInf !== undefined) { S.admin.inf = !S.admin.inf; save(); return render(); }
  if (d.adminPortal !== undefined) { portalToday(); Object.assign(S.portal, {force:true, at:0, seen:false, tried:false}); save(); render(); return portalBanner(); }
  if (d.portalGo !== undefined) { document.querySelectorAll(".am-inv.portal").forEach(e => e.remove()); if (!portalOpen()) return render(); S.portal.tried = true; save(); return start("portail"); }
  if (d.portalClose !== undefined) { document.querySelectorAll(".am-inv.portal").forEach(e => e.remove()); return; }
  if (d.adminOff !== undefined) { S.admin = null; adminTaps = 0; save(); return render(); }
  if (d.themeSet) { S.settings.theme = d.themeSet; applyTheme(); save(); return render(); }
  if (d.sfx !== undefined) { S.settings.sfx = S.settings.sfx === false; save(); return render(); }
  if (d.music) { S.settings.music = !S.settings.music; save(); S.settings.music ? Music.start() : Music.stop(); return render(); }
  if (d.reset !== undefined) {
    if (!confirmReset) { confirmReset = true; return render(); }
    const p = S.profile; S = blank(); S.profile = p; S.tab = "profil"; confirmReset = false; draft = null; save(); return render();
  }
}
function readDraft(){
  const n = document.getElementById("p-name"), a = document.getElementById("p-age");
  if (n) draft.name = n.value; if (a) draft.age = a.value;
}
document.addEventListener("input", e => {
  if (e.target.id === "p-name" || e.target.id === "p-age") { readDraft(); return; }
  if (e.target.id === "mvol") { S.settings.vol = +e.target.value; save(); Music.volume(S.settings.vol); return; }
  if (e.target.id !== "lib-search") return;
  libQuery = e.target.value;
  const tmp = document.createElement("div"); tmp.innerHTML = renderLibrary();
  document.getElementById("lib-body").replaceWith(tmp.querySelector("#lib-body"));
});
document.addEventListener("submit", e => {
  if (e.target.id !== "pform") return;
  e.preventDefault(); readDraft();
  const name = (draft.name||"").trim(), age = parseInt(draft.age, 10);
  if (name.length < 2) formErr = "Choisis un pseudo d'au moins 2 caractères.";
  else if (!(age >= 5 && age <= 99)) formErr = "Indique un âge entre 5 et 99 ans.";
  else if (!(draft.avatar >= 0)) formErr = "Choisis ton personnage.";
  else formErr = "";
  if (formErr) return render();
  const first = !S.profile;
  const keep = S.profile && S.profile.avatar === draft.avatar ? S.profile.skin : null;
  S.profile = {name, age, avatar:draft.avatar, skin:keep}; draft = null;
  if (first) { S.tab = "accueil"; toasts.push(`<b>Bienvenue, ${esc(name)} !</b> Lance le Défi du jour pour gagner tes premières pièces.`); }
  else toasts.push("<b>Profil enregistré.</b>");
  save(); render(); window.scrollTo(0,0);
});

window.__app = {state:() => S, save, close(){ S.tab = "accueil"; save(); render(); }, checkBadges, spend:n => { spend(n); save(); }, event:gameEvent, hero:heroChar};
load();
