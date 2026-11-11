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
const blank = () => ({frag:{}, evSkins:{}, tok:{}, grants:{}, pay:{}, spent:{}, recent:[], last:0, day:"", dayN:0});
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

/* --- Tirages de fragments : une liste de clés (une par bonne réponse), envoyée par paquets --- */
exports.draw = onCall(async req => {
  const uid = need(req), now = Date.now(), ev = activeEvent(now);
  const owned = new Set(Array.isArray(req.data && req.data.own) ? req.data.own.slice(0, 20) : []);
  const keys = [...new Set((req.data && req.data.keys) || [])].filter(k => typeof k === "string" && KEY_RE.test(k)).slice(0, 6);
  if (!ev || !keys.length) return {won:[]};
  return withInv(uid, async inv => {
    const today = parisDay(now); if (inv.day !== today) { inv.day = today; inv.dayN = 0; }
    // Pas plus d'une bonne réponse par seconde depuis le dernier envoi (les vraies parties sont plus lentes)
    const room = Math.max(1, Math.floor((now - (inv.last || 0)) / 1000));
    const fresh = keys.filter(k => !inv.recent.includes(k)).slice(0, room);
    inv.last = now; const won = [];
    for (const k of fresh) {
      inv.recent.push(k);
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
    inv.recent = inv.recent.slice(-120);
    return {won};
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
