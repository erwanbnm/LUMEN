// Envoi des notifications de Lumen, lancé par GitHub Actions toutes les 10 minutes (.github/workflows/notifs.yml).
//   - vers 8 h (heure de Paris) : le défi du jour, une fois par jour
//   - vers 16 h : rappel pour venir jouer (sauf si le défi du jour est déjà fait)
//   - à chaque passage : les défis lancés par un ami depuis le dernier passage
// Mode « test » (lancement à la main) : une notification de test à tous les appareils inscrits.
// La clé du compte de service Firebase est dans le secret GitHub FIREBASE_SA (jamais dans le code).
const fs = require("fs"), path = require("path");
const admin = require("firebase-admin");

if (!process.env.FIREBASE_SA) { console.log("Secret FIREBASE_SA absent : rien à envoyer."); process.exit(process.argv[2] === "test" ? 2 : 0); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SA)) });
const db = admin.firestore(), fcm = admin.messaging();
const MODE = process.argv[2] || "auto";
const APP = "https://erwanbnm.github.io/LUMEN/";

// Date et heure à Paris
const parts = Object.fromEntries(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false })
  .formatToParts(new Date()).map(p => [p.type, p.value]));
const DATE = `${parts.year}-${parts.month}-${parts.day}`, HOUR = +parts.hour % 24;

// Thème du défi du jour : même calcul que l'appli (main.js : ORDER[dayNum(today()) % ORDER.length])
function dailyTheme(){
  const src = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
  const block = src.slice(src.indexOf("const THEMES = {"), src.indexOf("};", src.indexOf("const THEMES = {")));
  const themes = [...block.matchAll(/(\w+):\{n:"([^"]+)"/g)].map(m => m[2]);
  const [y, m, d] = DATE.split("-").map(Number), n = Math.round(Date.UTC(y, m - 1, d) / 864e5);
  return themes[n % themes.length];
}

// Envoie un message à tous les appareils d'un joueur, et oublie les adresses périmées
async function send(uid, t, msg){
  const tokens = (t && t.tokens) || []; if (!tokens.length) return 0;
  const r = await fcm.sendEachForMulticast({ tokens, webpush: { data: msg, headers: { Urgency: "high", TTL: "21600" } } });
  const dead = tokens.filter((tok, i) => !r.responses[i].success && /not-registered|invalid-registration|invalid-argument/.test(r.responses[i].error && r.responses[i].error.code || ""));
  if (dead.length) await db.doc("tokens/" + uid).update({ tokens: admin.firestore.FieldValue.arrayRemove(...dead) });
  return r.successCount;
}

(async () => {
  const toks = {}; (await db.collection("tokens").get()).forEach(d => toks[d.id] = d.data());
  const pref = (uid, k) => !(toks[uid] && toks[uid].prefs && toks[uid].prefs[k] === false);
  let sent = 0;

  if (MODE === "test") {
    for (const uid of Object.keys(toks)) sent += await send(uid, toks[uid], { title: "Lumen", body: "Test réussi : les notifications marchent ✅", url: "./", tag: "test" });
    console.log(`test : ${sent} notification(s) envoyée(s) à ${Object.keys(toks).length} joueur(s) inscrit(s)`);
    if (!sent) process.exit(3); // en rouge sur GitHub : aucun appareil n'a reçu le test
    return;
  }

  const metaRef = db.doc("meta/notifs"), meta = (await metaRef.get()).data() || {};

  // Défi du jour, entre 8 h et 11 h (GitHub peut lancer avec du retard)
  if (HOUR >= 8 && HOUR < 11 && meta.matin !== DATE) {
    await metaRef.set({ matin: DATE }, { merge: true });
    const th = dailyTheme();
    for (const uid of Object.keys(toks)) if (pref(uid, "daily"))
      sent += await send(uid, toks[uid], { title: "Défi du jour ☀️", body: `Aujourd'hui : ${th}. Un fait et 10 questions pour bien démarrer.`, url: "./", tag: "daily" });
    console.log(`matin (${th}) : ${sent}`);
  }

  // Rappel de l'après-midi, entre 16 h et 19 h, seulement si le défi du jour n'est pas fait
  if (HOUR >= 16 && HOUR < 19 && meta.aprem !== DATE) {
    await metaRef.set({ aprem: DATE }, { merge: true });
    for (const uid of Object.keys(toks)) {
      if (!pref(uid, "remind")) continue;
      const s = await db.doc("saves/" + uid).get();
      try { if (s.exists && (JSON.parse(s.data().data).days || {})[DATE]) continue; } catch(e){}
      sent += await send(uid, toks[uid], { title: "Lumen t'attend 📚", body: "Viens te cultiver si tu veux pas finir comme Dwayne !", url: "./", tag: "remind" });
    }
    console.log(`après-midi : ${sent}`);
  }

  // Défis des amis lancés depuis moins de 6 heures et pas encore signalés
  const since = Date.now() - 6 * 3600e3;
  const duels = await db.collection("duels").where("created", ">=", since).get();
  const names = {}, pseudo = async id => names[id] || (names[id] = ((await db.doc("users/" + id).get()).data() || {}).pseudo || "Un ami");
  const MODES = { classic: "Classique", chrono: "Chrono", survie: "Survie", avap: "Avant ou après ?", qad: "Qui a dit ?" };
  for (const doc of duels.docs) {
    const d = doc.data(); if (d.pushed) continue;
    const answered = d.res && d.res[d.to] && d.res[d.to].done;
    if (d.kind === "live" ? ["live", "done", "declined", "cancelled"].includes(d.state) : (answered || d.state !== "open")) { await doc.ref.update({ pushed: true }); continue; }
    if (d.kind === "live" && d.state === "invite" && Date.now() - d.created < 70e3) continue; // invitation encore en cours : l'appli s'en occupe
    await doc.ref.update({ pushed: true });
    if (!pref(d.to, "duels") || !toks[d.to]) continue;
    const who = await pseudo(d.from), mode = MODES[d.mode || "classic"] || "Duel";
    const msg = d.kind === "live"
      ? { title: `⚡ ${who} voulait t'affronter en direct`, body: "Tu l'as manqué ! Renvoie-lui un défi dans JcJ.", url: "./?tab=amis", tag: "duel-" + doc.id }
      : { title: `⚔️ ${who} te défie !`, body: `${mode} · à toi de jouer dans l'onglet JcJ.`, url: "./?tab=amis", tag: "duel-" + doc.id };
    sent += await send(d.to, toks[d.to], msg);
  }
  console.log(`${DATE} ${HOUR} h : ${sent} notification(s) au total`);
})().catch(e => { console.error(e); process.exit(1); });
