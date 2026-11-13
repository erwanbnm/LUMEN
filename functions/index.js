/* ---------- Serveur de Lumen (Firebase Cloud Functions, formule Blaze, novembre 2026) ----------
   Tout ce qui ne doit pas pouvoir être triché depuis le téléphone passe ici :
   - tirage des fragments d'événement (3 % par bonne réponse, côté serveur) ;
   - potions à raretés (Double XP, Double pièces ; commune, rare, épique) : sac de 20 par case, trouvailles (2 %),
     récompenses de la table D.REW (quêtes, calendrier, Survie, Boss, Tour, Atlas, Aventure, badges, maîtrise), achats ;
   - jeton 50/50 (un exemplaire) : Tour, Boss de la semaine, quêtes Chrono de l'Aventure, boutique ;
   - activation des potions (heure du serveur, 3 h d'avance au plus).
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
const blank = () => ({frag:{}, evSkins:{}, tok:{}, grants:{}, pay:{}, spent:{}, stake:{}, ch:{}, pets:{}, pot:{}, boost:{}, recent:[], last:0, day:"", dayN:0});
const has = (inv, t) => !!(inv.tok[t] && inv.tok[t].n > 0);
function need(req){ if (!req.auth) throw new HttpsError("unauthenticated", "Connexion nécessaire."); return req.auth.uid; }
// Anciennes potions (un exemplaire, 30 min) : transformées une seule fois en potions communes du sac
function norm(inv){
  inv.pot = inv.pot || {}; inv.boost = inv.boost || {};
  ["xp", "coin"].forEach(t => { const x = inv.tok[t]; if (!x) return;
    if (x.n > 0) inv.pot[t + ":c"] = Math.min(P.MAX, (inv.pot[t + ":c"] || 0) + 1);
    if ((x.until || 0) > (inv.boost[t] || 0)) inv.boost[t] = x.until;
    delete inv.tok[t]; });
}
// Transaction sur inv/{uid}
async function withInv(uid, fn){
  const ref = db.doc("inv/" + uid);
  return db.runTransaction(async tx => {
    const s = await tx.get(ref), inv = Object.assign(blank(), s.exists ? s.data() : {});
    norm(inv);
    const out = await fn(inv, tx);
    tx.set(ref, inv); return out;
  });
}

/* --- Potions à raretés (table : D.POT et D.REW) --- */
const P = D.POT, RW = D.REW;
const POT_RE = /^(xp|coin):(c|r|e)$/;
// Ajoute une potion au sac ; case pleine : pièces à la place (versées par l'appli via inv.pay)
function putPot(inv, key, p){
  const n = inv.pot[p] || 0, r = p.slice(-1);
  if (n < P.MAX) { inv.pot[p] = n + 1; return "pot:" + p; }
  inv.pay[key] = P.FULL[r]; return "coins:" + P.FULL[r];
}
function rollPot(){ const fx = Math.random() < 0.5 ? "xp" : "coin"; let x = Math.random(), r = "c";
  for (const [k, o] of P.DROP.odds) { if (x < o) { r = k; break; } x -= o; } return fx + ":" + r; }
const weekOf = day => { const d = new Date(day + "T12:00:00Z"), k = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - k); return d.toISOString().slice(0, 10); };
const prevDay = day => { const d = new Date(day + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); };
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
  const raw = (req.data && req.data.keys) || [], qs = (req.data && req.data.qs) || [];
  const qOf = {}; raw.forEach((k, i) => { if (typeof qs[i] === "string" && /^[A-Za-z0-9_-]{1,32}$/.test(qs[i])) qOf[k] = qs[i]; });
  const keys = [...new Set(raw)].filter(k => typeof k === "string" && KEY_RE.test(k)).slice(0, 8);
  if (!keys.length) return {won:[], pets:[], pots:[]};
  return withInv(uid, async inv => {
    const today = parisDay(now); if (inv.day !== today) { inv.day = today; inv.dayN = 0; inv.dayA = 0; inv.potN = 0; inv.potQ = []; }
    inv.ch = inv.ch || {}; inv.potQ = inv.potQ || [];
    // Pas plus d'une réponse toutes les 0,7 seconde depuis le dernier envoi (les vraies parties sont plus lentes)
    const room = Math.max(1, Math.floor((now - (inv.last || 0)) / 700));
    const fresh = keys.filter(k => !inv.recent.includes(k)).slice(0, room);
    inv.last = now; const won = [], pots = []; let pets = [];
    for (const k of fresh) {
      inv.recent.push(k);
      if ((inv.dayA || 0) < D.DAY_ANS) { inv.dayA = (inv.dayA || 0) + 1;
        chs.forEach(e => { if (e.goals.some(g => g.k === "q")) { const c = inv.ch[e.id] = inv.ch[e.id] || {}; c.q = (c.q || 0) + 1; } }); }
      // Potion trouvée : bonne réponse, une seule chance par question et par jour, 3 au plus par jour
      const qid = qOf[k];
      if (k[0] === "a" && qid && (inv.dayA || 0) <= D.DAY_ANS && !inv.potQ.includes(qid)) {
        inv.potQ.push(qid);
        if ((inv.potN || 0) < P.DROP.day && Math.random() < P.DROP.rate) {
          const p = rollPot(), key = "drop:" + today + ":" + qid; inv.potN = (inv.potN || 0) + 1;
          const got = putPot(inv, key, p); inv.grants[key] = got; pots.push({p, got});
        }
      }
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
    inv.recent = inv.recent.slice(-160); inv.potQ = inv.potQ.slice(-D.DAY_ANS);
    return {won, pets, pots};
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
    return withInv(uid, async inv => give(inv, "boss:" + wk, "fifty", D.SWAP));   // boss vaincu dans la semaine : jeton 50/50
  }
  if (src === "adv") { // quête de l'Aventure (progression gardée sur le téléphone, comme les pièces)
    const q = String(d.q || ""), t = (D.ADVQ || {})[q]; if (!t) throw new HttpsError("invalid-argument", "Quête inconnue.");
    return withInv(uid, async inv => give(inv, "adv:" + q, t, D.ADVQ_SWAP || 100));
  }
  if (src === "migr") { // anciennes potions gardées sur le téléphone (une seule fois par type) : potion commune
    const t = d.t; if (t !== "xp" && t !== "coin") throw new HttpsError("invalid-argument", "Potion inconnue.");
    return withInv(uid, async inv => { const k = "migr:" + t; if (inv.grants[k]) return {dup:true}; const got = putPot(inv, k, t + ":c"); inv.grants[k] = got; return {got}; });
  }
  if (src === "local") { // potions gagnées sans compte, sur cet appareil, transférées à la connexion (au plus MAX par case)
    const key = String(d.key || ""), pot = d.pot || {}; if (!KEY_RE.test(key)) throw new HttpsError("invalid-argument", "Clé inconnue.");
    return withInv(uid, async inv => { if (inv.grants[key]) return {dup:true};
      const got = []; Object.keys(pot).filter(p => POT_RE.test(p)).forEach(p => { const n = Math.max(0, Math.min(P.MAX, Math.floor(+pot[p] || 0)));
        for (let i = 0; i < n; i++) got.push(putPot(inv, key + ":" + p + i, p)); });
      inv.grants[key] = "local:" + got.length; return {got}; });
  }
  if (src === "pot") return potGrant(uid, d);
  throw new HttpsError("invalid-argument", "Récompense inconnue.");
});

/* --- Récompenses en potions (table D.REW), par paquets. Chaque palier n'est donné qu'une fois (clé), avec des contrôles :
   quêtes du jour/semaine : jour ou semaine en cours ; calendrier : connexion validée (logins/{uid}) ; Boss : dégâts du jour
   lus dans bosses/{lundi} ; Survie : 3 parties récompensées par jour, épique 1 fois par semaine, assez de réponses aujourd'hui.
   Paliers permanents (Tour, Atlas, Aventure, badges, maîtrise) : une seule fois par compte. --- */
async function potGrant(uid, d){
  const items = Array.isArray(d.items) ? d.items.slice(0, 40) : [], now = Date.now(), today = parisDay(now);
  // Lectures nécessaires avant la transaction
  const needCal = items.some(x => x && x.s === "cal"), bossIt = items.find(x => x && x.s === "boss");
  const login = needCal ? await db.doc("logins/" + uid).get() : null;
  let bossDay = 0;
  if (bossIt && /^\d{4}-\d{2}-\d{2}$/.test(String(bossIt.d || "")) && (bossIt.d === today || bossIt.d === prevDay(today))) {
    const b = await db.doc("bosses/" + weekOf(bossIt.d)).get(); bossDay = b.exists ? +((((b.data().days || {})[uid]) || {})[bossIt.d] || 0) : 0; }
  return withInv(uid, async inv => {
    const out = [];
    for (const it of items) {
      if (!it || typeof it !== "object") continue;
      const s = String(it.s || ""), t = String(it.t || ""), tab = RW[s];
      // Maîtrise : un palier par domaine (« his:5 » = rang 5 en Histoire)
      const tt = s === "mst" ? (/^[a-z]{3}:\d$/.test(t) ? t.split(":")[1] : "") : t, rw = tab && tab[tt];
      if (!rw || !rw.p) { out.push({s, t, bad:true}); continue; }
      let key, ok = true, p = rw.p;
      const day = String(it.d || ""), okDay = day === today || day === prevDay(today);
      if (s === "qd") { key = `qd:${day}:${t}`; ok = okDay; }
      else if (s === "qw") { key = `qw:${weekOf(day)}:${t}`; ok = okDay;
        if (p[0] === "?") p = (it.e === "coin" ? "coin" : "xp") + p.slice(1); }
      else if (s === "cal") { key = `pcal:${t}:${+it.n || 0}`; const n = +it.n || 0, L = login && login.exists ? login.data() : null;
        ok = !!L && L.n >= n && n > 0 && ((n - 1) % 14) + 1 === +t; }
      else if (s === "boss") { key = `pboss:${day}:${t}`; ok = okDay && bossDay >= +t; }
      else if (s === "surv") { const g = String(it.g || ""); key = `surv:${today}:${g}:${t}`;
        inv.surv = inv.surv && inv.surv.day === today ? inv.surv : {day:today, g:[], wk:(inv.surv || {}).wk || ""};
        const isE = p.slice(-1) === "e", wk = weekOf(today);
        ok = /^[A-Za-z0-9]{4,20}$/.test(g) && (inv.dayA || 0) >= +t && (inv.surv.g.includes(g) || inv.surv.g.length < P.SURV_DAY) && !(isE && inv.surv.wk === wk);
        if (ok && !inv.grants[key]) { if (!inv.surv.g.includes(g)) inv.surv.g.push(g); if (isE) inv.surv.wk = wk; } }
      else key = `${s}:${t}`;                                  // paliers permanents
      if (inv.grants[key]) { out.push({s, t, dup:true, got:inv.grants[key]}); continue; }
      if (!ok) { out.push({s, t, no:true}); continue; }
      const got = putPot(inv, key, p); inv.grants[key] = got; out.push({s, t, p, got});
    }
    return {out};
  });
}

/* --- Achats en boutique (1 000 pièces) : potion commune (sac plein = refus) ou jeton 50/50 (un seul) ; une fois par clé d'achat --- */
exports.buy = onCall(async req => {
  const uid = need(req), d = req.data || {}, t = d.t, key = String(d.key || "");
  if (!["xp", "coin", "fifty"].includes(t) || !KEY_RE.test(key)) throw new HttpsError("invalid-argument", "Achat inconnu.");
  return withInv(uid, async inv => {
    if (inv.spent[key]) return {dup:true, ok:true};
    if (t === "fifty") { if (has(inv, t)) return {ok:false, why:"owned"}; inv.tok[t] = Object.assign({}, inv.tok[t], {n:1, at:Date.now()}); }
    else { const p = t + ":c"; if ((inv.pot[p] || 0) >= P.MAX) return {ok:false, why:"full"}; inv.pot[p] = (inv.pot[p] || 0) + 1; }
    inv.spent[key] = t === "fifty" ? D.PRICE : P.PRICE;
    return {ok:true};
  });
});

/* --- Utiliser : potion du sac (durée ajoutée à l'effet en cours, CAP minutes d'avance au plus, heure du serveur) ou 50/50 --- */
exports.use = onCall(async req => {
  const uid = need(req), d = req.data || {}, t = d.t, r = d.r || "c", now = Date.now();
  if (t === "fifty") return withInv(uid, async inv => {
    const x = inv.tok[t] || {}; if (!(x.n > 0)) return {ok:false, why:"none"};
    inv.tok[t] = Object.assign({}, x, {n:0, used:now}); return {ok:true};
  });
  const p = t + ":" + r; if (!POT_RE.test(p)) throw new HttpsError("invalid-argument", "Potion inconnue.");
  return withInv(uid, async inv => {
    if (!((inv.pot[p] || 0) > 0)) return {ok:false, why:"none"};
    inv.pot[p]--; const from = Math.max(now, inv.boost[t] || 0);
    inv.boost[t] = Math.min(now + P.CAP * 60000, from + P.RAR[r].dur * 60000);
    return {ok:true, until:inv.boost[t]};
  });
});
