/* ---------- Serveur de Lumen (Firebase Cloud Functions, formule Blaze, novembre 2026) ----------
   Tout ce qui ne doit pas pouvoir être triché depuis le téléphone passe ici :
   - tirage des fragments d'événement (3 % par bonne réponse, côté serveur) ;
   - jetons rares (Double pièces, Double XP, 50/50) : un exemplaire maximum de chaque type, récompenses
     de la Tour, du Boss (vérifié dans bosses/{lundi}) et du calendrier (vérifié dans logins/{uid}), achats en boutique ;
   - activation des boosters (heure du serveur).
   Les données vivent dans inv/{uid} : le téléphone peut seulement les lire (règle Firestore), seul ce serveur écrit.
   Chaque demande porte une clé unique : la rejouer (double appel, réseau qui coupe) ne donne jamais rien de plus. */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const D = require("./evenements_data.js");
admin.initializeApp();
setGlobalOptions({ region:"europe-west1", maxInstances:5, memory:"256MiB" });
const db = admin.firestore();

const KEY_RE = /^[A-Za-z0-9:_-]{4,64}$/;
const parisDay = ms => new Intl.DateTimeFormat("fr-CA", {timeZone:"Europe/Paris", year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date(ms));
const calDay = ms => Math.floor((ms + 36e5) / 864e5);          // même calcul que la règle « logins »
const activeEvent = now => D.EVENTS.find(e => now >= Date.parse(e.start) && now <= Date.parse(e.end)) || null;
const blank = () => ({frag:{}, evSkins:{}, tok:{}, grants:{}, pay:{}, spent:{}, stake:{}, ch:{}, pets:{}, recent:[], last:0, day:"", dayN:0});
const has = (inv, t) => !!(inv.tok[t] && inv.tok[t].n > 0);
function need(req){ if (!req.auth) throw new HttpsError("unauthenticated", "Connexion nécessaire."); return req.auth.uid; }
// Transaction sur inv/{uid}
async function withInv(uid, fn){
  const ref = db.doc("inv/" + uid);
  return db.runTransaction(async tx => {
    const s = await tx.get(ref), inv = Object.assign(blank(), s.exists ? s.data() : {});
    const out = await fn(inv, tx);
    tx.set(ref, inv); return out;
  });
}
// Donne un jeton (ou des pièces de remplacement s'il est déjà possédé), une seule fois par clé
function give(inv, key, t, swap){
  if (inv.grants[key]) return {dup:true, got:inv.grants[key]};
  let got;
  if (!has(inv, t)) { inv.tok[t] = Object.assign({}, inv.tok[t], {n:1, at:Date.now()}); got = "tok:" + t; }
  else { inv.pay[key] = swap; got = "coins:" + swap; }
  inv.grants[key] = got; return {got};
}

/* --- Réponses : une clé par question répondue (« a… » bonne réponse, « w… » mauvaise), envoyées par paquets.
   Bonne réponse pendant un événement à fragments : tirage (3 %). Toute réponse pendant un défi « questions » : +1. --- */
const activeCh = now => (D.CHALLENGES || []).filter(e => now >= Date.parse(e.start) && now <= Date.parse(e.end));
function chUnlock(inv, e, now){ // défi atteint : familier débloqué pour toujours
  const c = inv.ch[e.id] || {}; inv.pets = inv.pets || {}; const got = [];
  e.goals.forEach(g => { if ((c[g.k] || 0) >= g.n && !inv.pets[g.pet]) { inv.pets[g.pet] = now; got.push(g.pet); } });
  return got;
}
exports.draw = onCall(async req => {
  const uid = need(req), now = Date.now(), ev = activeEvent(now), chs = activeCh(now);
  const owned = new Set(Array.isArray(req.data && req.data.own) ? req.data.own.slice(0, 20) : []);
  const keys = [...new Set((req.data && req.data.keys) || [])].filter(k => typeof k === "string" && KEY_RE.test(k)).slice(0, 8);
  if ((!ev && !chs.length) || !keys.length) return {won:[], pets:[]};
  return withInv(uid, async inv => {
    const today = parisDay(now); if (inv.day !== today) { inv.day = today; inv.dayN = 0; inv.dayA = 0; }
    inv.ch = inv.ch || {};
    // Pas plus d'une réponse toutes les 0,7 seconde depuis le dernier envoi (les vraies parties sont plus lentes)
    const room = Math.max(1, Math.floor((now - (inv.last || 0)) / 700));
    const fresh = keys.filter(k => !inv.recent.includes(k)).slice(0, room);
    inv.last = now; const won = []; let pets = [];
    for (const k of fresh) {
      inv.recent.push(k);
      if ((inv.dayA || 0) < D.DAY_ANS) { inv.dayA = (inv.dayA || 0) + 1;
        chs.forEach(e => { if (e.goals.some(g => g.k === "q")) { const c = inv.ch[e.id] = inv.ch[e.id] || {}; c.q = (c.q || 0) + 1; } }); }
      if (k[0] !== "a" || !ev) continue;
      if (inv.dayN >= D.DAY_MAX) continue; inv.dayN++;
      const f = inv.frag[ev.id] = inv.frag[ev.id] || {};
      const open = ev.chars.filter(c => !inv.evSkins[c] && !owned.has(c));           // les personnages déjà adoptés ne donnent plus de fragments
      if (!open.length || Math.random() >= ev.rate) continue;
      const c = open[Math.floor(Math.random() * open.length)];
      f[c] = (f[c] || 0) + 1; inv.fragTot = inv.fragTot || {}; inv.fragTot[ev.id] = (inv.fragTot[ev.id] || 0) + 1;
      let unlocked = false;
      if (f[c] >= ev.need) { f[c] -= ev.need; inv.evSkins[c] = now; unlocked = true; }   // 6 fragments consommés
      won.push({c, unlocked});
    }
    chs.forEach(e => { pets = pets.concat(chUnlock(inv, e, now)); });
    inv.recent = inv.recent.slice(-160);
    return {won, pets};
  });
});

/* --- Pièces dépensées (défi de l'événement) : achats en boutique, améliorations, parc… Les mises des paris n'en font pas partie.
   Chaque dépense a une clé unique ; plafonds par envoi et par jour. --- */
exports.spent = onCall(async req => {
  const uid = need(req), now = Date.now(), chs = activeCh(now).filter(e => e.goals.some(g => g.k === "spend"));
  const d = req.data || {}, key = String(d.key || ""), v = Math.floor(+d.v || 0);
  if (!chs.length || !KEY_RE.test(key) || !(v > 0)) return {ok:false, pets:[]};
  return withInv(uid, async inv => {
    inv.ch = inv.ch || {}; inv.spRecent = inv.spRecent || [];
    if (inv.spRecent.includes(key)) return {dup:true, pets:[]};
    const today = parisDay(now); if (inv.spDay !== today) { inv.spDay = today; inv.spN = 0; }
    const add = Math.max(0, Math.min(v, D.SPEND_ONE, D.SPEND_DAY - (inv.spN || 0)));
    inv.spRecent = inv.spRecent.concat(key).slice(-120); inv.spN = (inv.spN || 0) + add;
    let pets = [];
    chs.forEach(e => { const c = inv.ch[e.id] = inv.ch[e.id] || {}; c.spend = (c.spend || 0) + add; pets = pets.concat(chUnlock(inv, e, now)); });
    return {ok:true, add, pets};
  });
});

/* --- Paris en duel 1 contre 1 : mise de 25, 50 ou 100 pièces, identique pour les deux joueurs.
   betJoin : le joueur engage sa mise (une seule fois par duel). betSettle : le serveur lit le résultat du duel et verse
   le pot une seule fois (bets/{duel}.settled). Égalité ou duel jamais commencé : chacun récupère sa mise.
   Abandon : quitter un duel rend sa copie (perdu) ; un joueur qui ne finit jamais perd après le délai. --- */
const OFF = ["cancelled", "declined", "expired"];
exports.betJoin = onCall(async req => {
  const uid = need(req), id = String((req.data || {}).duel || "");
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) throw new HttpsError("invalid-argument", "Duel inconnu.");
  const dref = db.doc("duels/" + id), bref = db.doc("bets/" + id), iref = db.doc("inv/" + uid);
  return db.runTransaction(async tx => {
    const [ds, bs, is] = await Promise.all([tx.get(dref), tx.get(bref), tx.get(iref)]);
    const d = ds.exists ? ds.data() : null;
    if (!d || !D.BETS.includes(d.bet) || (uid !== d.from && uid !== d.to)) throw new HttpsError("failed-precondition", "Pas de mise sur ce duel.");
    if (OFF.includes(d.state)) throw new HttpsError("failed-precondition", "Duel annulé.");
    const b = bs.exists ? bs.data() : {duel:id, from:d.from, to:d.to, bet:d.bet, st:{}, created:Date.now()};
    if (b.settled) throw new HttpsError("failed-precondition", "Pari déjà réglé.");
    if (d.res && d.res[uid] && d.res[uid].done) throw new HttpsError("failed-precondition", "Trop tard pour miser.");
    if (b.st[uid]) return {ok:true, dup:true};
    const inv = Object.assign(blank(), is.exists ? is.data() : {}); inv.stake = inv.stake || {};
    b.st[uid] = d.bet; inv.stake["bet:" + id] = d.bet;
    tx.set(bref, b); tx.set(iref, inv); return {ok:true};
  });
});
exports.betSettle = onCall(async req => {
  need(req); const id = String((req.data || {}).duel || ""), now = Date.now();
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) throw new HttpsError("invalid-argument", "Duel inconnu.");
  const dref = db.doc("duels/" + id), bref = db.doc("bets/" + id);
  return db.runTransaction(async tx => {
    const [ds, bs] = await Promise.all([tx.get(dref), tx.get(bref)]);
    if (!bs.exists) return {none:true};
    const b = bs.data(); if (b.settled) return {done:true, res:b.result};
    const d = ds.data() || {}, res = d.res || {}, A = d.from, B = d.to, ra = res[A], rb = res[B];
    const iA = db.doc("inv/" + A), iB = db.doc("inv/" + B);
    const [sa, sb] = await Promise.all([tx.get(iA), tx.get(iB)]);
    const dead = now > (d.kind === "live" ? (d.start || d.created || 0) + 15 * 6e4 : (d.created || 0) + 3 * 864e5);
    const both = !!(b.st[A] && b.st[B]), doneA = !!(ra && ra.done), doneB = !!(rb && rb.done);
    let pay = {}, result;
    if (!both) {
      if (!(OFF.includes(d.state) || dead || (doneA && doneB))) return {wait:true};
      Object.keys(b.st).forEach(u => pay[u] = b.st[u]); result = "refund";
    } else if (doneA && doneB) {
      const o = ra.ok !== rb.ok ? (ra.ok > rb.ok ? 1 : -1) : (d.kind === "live" && ra.t !== rb.t ? (ra.t < rb.t ? 1 : -1) : 0);
      if (o === 0) { pay[A] = b.bet; pay[B] = b.bet; result = "tie"; } else { pay[o === 1 ? A : B] = 2 * b.bet; result = o === 1 ? A : B; }
    } else if (dead) {
      if (doneA || doneB) { pay[doneA ? A : B] = 2 * b.bet; result = doneA ? A : B; } else { pay[A] = b.bet; pay[B] = b.bet; result = "tie"; }
    } else return {wait:true};
    [[A, iA, sa], [B, iB, sb]].forEach(([u, ref, snap]) => { if (!pay[u]) return; const inv = Object.assign(blank(), snap.exists ? snap.data() : {}); inv.pay["bet:" + id] = pay[u]; tx.set(ref, inv); });
    tx.set(bref, Object.assign({}, b, {settled:now, result, paid:pay}));
    return {done:true, res:result};
  });
});

/* --- Récompenses en jetons : Tour, Boss, calendrier, transfert des potions déjà gagnées --- */
exports.grant = onCall(async req => {
  const uid = need(req), d = req.data || {}, src = d.src;
  if (src === "tour") {
    const t = D.TOWER[d.f]; if (!t) throw new HttpsError("invalid-argument", "Palier inconnu.");
    return withInv(uid, async inv => give(inv, "tour:" + d.f, t, D.SWAP));
  }
  if (src === "boss") {
    const wk = String(d.wk || ""); if (!/^\d{4}-\d{2}-\d{2}$/.test(wk)) throw new HttpsError("invalid-argument", "Semaine inconnue.");
    const b = await db.doc("bosses/" + wk).get(), bd = b.exists ? b.data() : null;
    if (!bd || !bd.defeatedAt || ((bd.dmg || {})[uid] || 0) < D.BOSS_MIN) throw new HttpsError("failed-precondition", "Pas de jeton pour ce boss.");
    return withInv(uid, async inv => {
      const k = "boss:" + wk; if (inv.grants[k]) return {dup:true, got:inv.grants[k]};
      const free = Object.keys(D.TOKENS).filter(t => !has(inv, t));
      return give(inv, k, free.length ? free[Math.floor(Math.random() * free.length)] : "fifty", D.SWAP);
    });
  }
  if (src === "cal") {
    const n = +d.n, step = ((n - 1) % 14) + 1, t = D.CAL[step]; if (!t) throw new HttpsError("invalid-argument", "Case sans jeton.");
    const l = await db.doc("logins/" + uid).get(); if (!l.exists || l.data().n < n) throw new HttpsError("failed-precondition", "Case pas encore récupérée.");
    return withInv(uid, async inv => give(inv, "cal:" + n, t, D.CAL_SWAP));
  }
  if (src === "migr") { // potions gagnées avant le passage au serveur (une seule fois par type)
    const t = d.t; if (t !== "xp" && t !== "coin") throw new HttpsError("invalid-argument", "Potion inconnue.");
    return withInv(uid, async inv => { if (inv.grants["migr:" + t]) return {dup:true}; if (has(inv, t)) { inv.grants["migr:" + t] = "none"; return {got:"none"}; } return give(inv, "migr:" + t, t, 0); });
  }
  throw new HttpsError("invalid-argument", "Récompense inconnue.");
});

/* --- Achat d'un jeton en boutique (1 000 pièces) : refusé si le joueur l'a déjà ; une seule fois par clé d'achat --- */
exports.buy = onCall(async req => {
  const uid = need(req), d = req.data || {}, t = d.t, key = String(d.key || "");
  if (!D.TOKENS[t] || !KEY_RE.test(key)) throw new HttpsError("invalid-argument", "Achat inconnu.");
  return withInv(uid, async inv => {
    if (inv.spent[key]) return {dup:true, ok:true};
    if (has(inv, t)) return {ok:false, why:"owned"};
    inv.tok[t] = Object.assign({}, inv.tok[t], {n:1, at:Date.now()}); inv.spent[key] = D.PRICE;
    return {ok:true};
  });
});

/* --- Utiliser un jeton : boosters (heure du serveur, pas de cumul) et 50/50 --- */
exports.use = onCall(async req => {
  const uid = need(req), t = (req.data || {}).t, now = Date.now();
  if (!D.TOKENS[t]) throw new HttpsError("invalid-argument", "Jeton inconnu.");
  return withInv(uid, async inv => {
    const x = inv.tok[t] || {};
    if (!(x.n > 0)) return {ok:false, why:"none"};
    if (D.TOKENS[t].dur && (x.until || 0) > now) return {ok:false, why:"active"};
    inv.tok[t] = Object.assign({}, x, {n:0, used:now}, D.TOKENS[t].dur ? {until:now + D.TOKENS[t].dur * 60000} : {});
    return {ok:true, until:inv.tok[t].until || 0};
  });
});
