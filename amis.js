/* ---------- Mode en ligne : onglet JcJ (Firebase) ----------
   Comptes pseudo + mot de passe, défis entre amis dans tous les modes du jeu (Classique par thème,
   Chrono, Survie, Avant ou après, Qui a dit ?), en différé ou en direct, classements, badges « En ligne ».
   Données dans Firestore :
     users/{uid}   : {pseudo, pl, av, since, seen, st:{lvl, ok, avap, streak}}   (seen = dernière activité)
     pseudos/{pl}  : {uid}                                                       (réserve un pseudo unique)
     saves/{uid}   : {data, at, lvl}   sauvegarde de toute la progression (lisible par son seul propriétaire)
     duels/{id}    : {kind:"async"|"live", from, to, mode, theme, n, qids, seed, state, created, start,
                      res:{uid:{ok, pos, t, done}}}
   Les règles de sécurité à coller dans la console Firebase sont dans firestore.rules. */
const FIREBASE_CONFIG = { // projet Firebase « lumen-d206d »
  apiKey: "AIzaSyCGjpcgIdchJE8ysQ1JPUjQDzphU3oIt8w",
  authDomain: "lumen-d206d.firebaseapp.com",
  projectId: "lumen-d206d",
  storageBucket: "lumen-d206d.firebasestorage.app",
  messagingSenderId: "743435924468",
  appId: "1:743435924468:web:a579bb949ed79b1dca3fa1"
};
const FB_VER = "10.14.1";
const Amis = (function(){
  let fb = null, auth = null, db = null, me = null, loading = false, err = ""; let failAt = 0;
  let users = {}, duels = [], unsub = [], seenTimer = null;
  let cloud = {ready:false, offer:null, timer:null, last:"", err:false};
  const ui = { seg:"signup", friend:"", mode:"classic", theme:"mix", n:10, kind:"async", busy:false, msg:"", view:"main", board:"duels" };
  // Modes jouables en duel (les règles sont les mêmes pour les deux joueurs : pas d'améliorations de la boutique)
  const MODES = {
    classic:{n:"Classique", icon:"mix", d:"Un thème, de 5 à 20 questions"},
    chrono:{n:"Chrono", icon:"chrono", d:"60 secondes, un joker"},
    survie:{n:"Survie", icon:"survie", d:"3 vies, un joker"},
    avap:{n:"Avant ou après ?", icon:"avap", d:"La plus longue série"},
    qad:{n:"Qui a dit ?", icon:"quote", d:"Des citations, 5 à 20"}
  };
  const uid = () => me && me.uid;
  const pending = () => duels.find(d => d.kind === "live" && d.from === uid() && d.state === "invite" && Date.now() - d.created < 60000);
  const pseudoOf = id => (users[id] && users[id].pseudo) || "Un ami";
  const online = id => users[id] && Date.now() - (users[id].seen || 0) < 150000;
  const enabled = () => !!FIREBASE_CONFIG;
  const modeOf = d => d.mode || "classic";
  const hasN = m => m === "classic" || m === "qad";
  const thName = t => t === "mix" ? "Tous les thèmes" : THEMES[t].n;
  const duelLabel = d => { const m = modeOf(d); return m === "classic" ? `${d.n} questions · ${thName(d.theme)}` : m === "qad" ? `Qui a dit ? · ${d.n} citations` : MODES[m].n; };

  /* --- Chargement de Firebase (seulement quand on en a besoin) --- */
  function loadScript(src){ return new Promise((ok, ko) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  async function boot(){
    // Sans connexion, on ne réessaie qu'une fois toutes les 15 s (sinon l'écran se recharge en boucle)
    if (fb || loading || !enabled() || Date.now() - failAt < 15000) return; loading = true;
    try {
      for (const m of ["app", "auth", "firestore"]) await loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-${m}-compat.js`);
      fb = window.firebase; fb.initializeApp(FIREBASE_CONFIG); auth = fb.auth(); auth.languageCode = "fr"; db = fb.firestore();
      auth.onAuthStateChanged(u => { me = u; S.amis = S.amis || {}; S.amis.on = !!u; save(); u ? (listen(), cloudCheck(), notifRefresh(), typeof Guildes !== "undefined" && setTimeout(Guildes.listen, 0), typeof Calendrier !== "undefined" && setTimeout(Calendrier.sync, 800), typeof Evenements !== "undefined" && setTimeout(Evenements.listen, 0)) : (stop(), typeof Evenements !== "undefined" && Evenements.stop(), cloud = {ready:false, offer:null, timer:null, last:"", err:false}); rerender(); });
    } catch(e){ err = "Impossible de joindre le serveur. Vérifie ta connexion."; failAt = Date.now(); }
    loading = false; rerender();
  }
  // Rafraîchit l'écran sans casser une partie en cours
  function rerender(){ if (typeof Boss !== "undefined" && Boss.playing()) return; if (!(S.session && !S.session.done && S.tab === "jouer")) { window.__quiet = true; render(); showAsyncInvites(); } else updateDuelBar(); }

  /* --- Écoute en temps réel --- */
  function listen(){
    stop();
    unsub.push(db.collection("users").onSnapshot(s => { users = {}; s.forEach(d => { if (!d.data().gone && d.data().pseudo) users[d.id] = d.data(); }); rerender(); }, () => {}));
    unsub.push(db.collection("duels").orderBy("created", "desc").limit(300).onSnapshot(s => {
      const before = duels; duels = s.docs.map(d => Object.assign({id:d.id}, d.data()));
      onDuels(before); rerender();
    }, () => {}));
    ping(); seenTimer = setInterval(ping, 90000);
    if (typeof Salons !== "undefined") Salons.listen();
    if (typeof Boss !== "undefined") Boss.listen();
  }
  // Présence + statistiques solo publiées pour les classements (rien qui s'achète avec des pièces)
  function ping(){
    if (!uid() || document.visibilityState !== "visible") return;
    // update (et non set) : ne crée jamais de fiche joueur sans pseudo
    db.doc("users/" + uid()).update({seen:Date.now(), ti:(typeof myTitle === "function" && myTitle()) || "", tid:today(), av:(S.profile && S.profile.skin && ownsSkin(S.profile.skin) && S.profile.skin) || ("b" + ((S.profile && S.profile.avatar) || 0)),
      st:{lvl:acctLvl().L, ok:totalOk(), avap:(S.rec && S.rec.avap) || 0, streak:Math.max(S.bestStreak || 0, streak()), tw:typeof Tour !== "undefined" ? Tour.stats() : null}}).catch(() => {});
  }
  document.addEventListener("visibilitychange", ping);
  function stop(){ unsub.forEach(f => f()); unsub = []; clearInterval(seenTimer); users = {}; duels = []; }

  /* --- Comptes : pseudo (affiché) + e-mail (connexion, mot de passe oublié) + mot de passe ---
     L'e-mail n'est jamais écrit dans la base : seuls Firebase Authentication et son propriétaire le voient. */
  const mail = pl => pl + "@joueurs.lumen-amis.app"; // anciens comptes créés avec un pseudo seul
  const norm = p => p.trim().toLowerCase();
  const okMail = m => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.trim());
  async function signup(pseudo, email, pw){
    const pl = norm(pseudo);
    if (!/^[a-z0-9_\-àâçéèêëîïôûùüÿ]{2,16}$/i.test(pseudo.trim())) throw "Pseudo : 2 à 16 lettres ou chiffres, sans espace.";
    if (!okMail(email)) throw "Cette adresse e-mail ne semble pas valide.";
    if (pw.length < 6) throw "Le mot de passe doit faire au moins 6 caractères.";
    const taken = await db.doc("pseudos/" + pl).get();
    if (taken.exists) throw "Ce pseudo est déjà pris.";
    const cred = await auth.createUserWithEmailAndPassword(email.trim(), pw).catch(e => { throw e.code === "auth/email-already-in-use" ? "Cette adresse e-mail a déjà un compte : connecte-toi." : e.code === "auth/invalid-email" ? "Cette adresse e-mail ne semble pas valide." : "Création impossible pour le moment."; });
    try {
      await db.runTransaction(async t => { const r = db.doc("pseudos/" + pl); if ((await t.get(r)).exists) throw "pris"; t.set(r, {uid:cred.user.uid}); });
      await db.doc("users/" + cred.user.uid).set({pseudo:pseudo.trim(), pl, since:Date.now(), seen:Date.now()}); ping();
    } catch(e){ await cred.user.delete().catch(() => {}); throw "Ce pseudo est déjà pris."; }
  }
  async function login(id, pw){
    const m = id.includes("@") ? id.trim() : mail(norm(id));
    await auth.signInWithEmailAndPassword(m, pw).catch(() => { throw "E-mail ou mot de passe incorrect."; });
  }
  async function forgot(email){
    if (!okMail(email)) throw "Écris d'abord ton adresse e-mail dans la case au-dessus.";
    await auth.sendPasswordResetEmail(email.trim()).catch(() => {}); // même message que le compte existe ou non
    ui.info = "Si un compte existe avec cette adresse, un e-mail pour changer de mot de passe vient d'être envoyé. Pense à regarder dans les spams.";
  }

  /* --- Sauvegarde de la progression sur le compte (téléphone, PC…) ---
     syncAt = date de la sauvegarde en ligne que cet appareil connaît. Si la sauvegarde en ligne est plus récente,
     c'est qu'on a joué ailleurs : on la récupère. Sinon, cet appareil envoie la sienne (quelques secondes après chaque changement). */
  const LOCAL = ["session", "amis", "settings", "tab", "pausedDaily", "salonCode", "tourRun", "bossOpen", "questOpen", "multiView", "calSeen", "evOpen"]; // propre à chaque appareil
  function snapshot(){ const o = {}; Object.keys(S).forEach(k => { if (!LOCAL.includes(k)) o[k] = S[k]; }); return JSON.stringify(o); }
  // Fusion de deux sauvegardes (cet appareil + celle du compte) : on ne perd jamais rien.
  // Nombres : le plus grand (pièces, XP, compteurs) ; listes : tout ce qui est dans l'une ou l'autre ;
  // objets : fusion case par case ; textes : on garde celui de cet appareil.
  function mergeVal(a, b){
    if (a === undefined || a === null) return b;
    if (b === undefined || b === null) return a;
    if (typeof a === "number" && typeof b === "number") return Math.max(a, b);
    if (typeof a === "boolean" && typeof b === "boolean") return a || b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.every(x => typeof x !== "object") && b.every(x => typeof x !== "object")) return [...new Set(a.concat(b))];
      return a.length >= b.length ? a : b;
    }
    if (typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
      const o = {}; new Set(Object.keys(a).concat(Object.keys(b))).forEach(k => o[k] = mergeVal(a[k], b[k])); return o;
    }
    return a;
  }
  // Applique la sauvegarde du compte en la fusionnant avec cet appareil (sans recharger la page)
  function absorb(remote){
    const data = JSON.parse(remote.data);
    Object.keys(data).forEach(k => { if (!LOCAL.includes(k)) S[k] = mergeVal(S[k], data[k]); });
    S.amis.syncAt = remote.at; save(); render();
  }
  async function cloudCheck(){
    cloud.ready = false;
    try {
      const r = await db.doc("saves/" + uid()).get(), remote = r.exists ? r.data() : null;
      S.amis = S.amis || {};
      if (!S.profile) { // nouvel appareil, connexion depuis l'écran de bienvenue
        if (remote) return restore(remote, false);
        ui.welcome = false; S.amis.link = uid(); cloud.ready = true;
        toasts.push("<b>Connecté.</b> · Ce compte n'a pas encore de progression : choisis ton pseudo et ton personnage.");
        return render();
      }
      if (!remote) { S.amis.link = uid(); cloud.ready = true; return push(true); }
      if (S.amis.link !== uid()) { cloud.offer = remote; return rerender(); } // première connexion sur cet appareil : on demande
      // Sauvegarde du compte plus récente (jouée ailleurs) : on la fusionne avec celle-ci au lieu de l'écraser
      if (remote.at > (S.amis.syncAt || 0)) absorb(remote);
      cloud.ready = true; push(true);
    } catch(e){ cloud.err = true; rerender(); }
  }
  function restore(remote, quiet){
    const data = JSON.parse(remote.data);
    LOCAL.forEach(k => { if (k in S) data[k] = S[k]; });
    data.session = null; data.pausedDaily = null; data.tab = quiet ? S.tab : "accueil";
    data.amis = Object.assign({}, S.amis, {link:uid(), syncAt:remote.at});
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){}
    try { sessionStorage.setItem("lumen.restored", quiet ? "sync" : "1"); } catch(e){}
    location.reload();
  }
  function push(now){
    if (!db || !uid() || !cloud.ready || !S.amis || S.amis.link !== uid()) return;
    clearTimeout(cloud.timer);
    cloud.timer = setTimeout(async () => {
      if (snapshot() === cloud.last) return;
      const ref = db.doc("saves/" + uid());
      try {
        // Avant d'envoyer : si un autre appareil (ou un autre onglet) a sauvegardé entre-temps, on fusionne d'abord
        let merged = false, at = 0, data = "";
        await db.runTransaction(async tx => {
          const r = await tx.get(ref), remote = r.exists ? r.data() : null;
          if (remote && remote.at > (S.amis.syncAt || 0) && remote.data !== cloud.last) {
            const d = JSON.parse(remote.data); Object.keys(d).forEach(k => { if (!LOCAL.includes(k)) S[k] = mergeVal(S[k], d[k]); }); merged = true;
          }
          data = snapshot(); at = Math.max(Date.now(), (remote && remote.at || 0) + 1);
          tx.set(ref, {data, at, lvl:acctLvl().L});
        });
        cloud.last = data; S.amis.syncAt = at; cloud.err = false;
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){}
        if (merged) render();
      } catch(e){ cloud.err = true; }
    }, now ? 0 : 4000);
  }
  // Avant de fermer l'appli ou de changer d'onglet : on envoie tout de suite
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") push(true); });
  try { const r = sessionStorage.getItem("lumen.restored"); if (r) { sessionStorage.removeItem("lumen.restored"); if (r === "1") setTimeout(() => { toasts.push("<b>Progression récupérée !</b> · Bon retour sur Lumen."); render(); }, 2600); } } catch(e){}

  /* --- Notifications (Firebase Cloud Messaging) ---
     L'appli enregistre l'adresse de notification de l'appareil dans tokens/{uid} avec les préférences.
     L'envoi est fait par GitHub Actions (notifs/send.js) : défi du jour vers 8 h, rappel vers 16 h,
     défis des amis (avec quelques minutes de retard). */
  const VAPID = "BMQcXZtdaWMx7i6whc7SsDDysk_hmAJ1laF7PD2xdCyls7SnEXOR43LJFDxu57Ye99AA2sg8R7EGRFqKI55i8Fo"; // clé publique « Certificats Web Push » (console Firebase > Paramètres > Cloud Messaging)
  const notifOK = () => "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  const NPREFS = {daily:"Défi du jour (vers 8 h)", remind:"Rappel pour venir jouer (vers 16 h)", duels:"Quand un ami me défie", portal:"Ouverture du Portail"};
  let msgLoaded = false;
  async function saveToken(prefs){
    if (!msgLoaded) { await loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-messaging-compat.js`); msgLoaded = true; }
    const reg = await navigator.serviceWorker.ready;
    const tok = await fb.messaging().getToken({vapidKey:VAPID, serviceWorkerRegistration:reg});
    const up = {tokens:fb.firestore.FieldValue.arrayUnion(tok), at:Date.now()};
    if (prefs) up.prefs = prefs;
    await db.doc("tokens/" + uid()).set(up, {merge:true});
  }
  async function notifEnable(){
    if (!VAPID) throw "Les notifications arrivent très bientôt.";
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw "Les notifications sont bloquées. Autorise-les dans les réglages de ton navigateur, puis réessaie.";
    const prefs = {daily:true, remind:true, duels:true, portal:true};
    await saveToken(prefs);
    S.amis.notif = prefs; save();
    toasts.push("<b>Notifications activées !</b>");
  }
  async function notifPref(k){
    const prefs = Object.assign({daily:true, remind:true, duels:true}, S.amis.notif);
    prefs[k] = !prefs[k]; S.amis.notif = prefs; save();
    await db.doc("tokens/" + uid()).set({prefs}, {merge:true});
  }
  // À chaque connexion : on rafraîchit l'adresse de notification (elle peut changer)
  function notifRefresh(){
    if (!VAPID || !notifOK() || Notification.permission !== "granted" || !S.amis || !S.amis.notif) return;
    saveToken(null).catch(() => {});
  }
  function notifCard(){
    if (!enabled()) return "";
    const head = `<div class="label">Notifications</div>`;
    if (!fb) { boot(); return `<div class="card stack">${head}<p class="muted" style="margin:0">Connexion…</p></div>`; }
    if (!me) return `<div class="card stack">${head}<p class="muted" style="margin:0">Crée ton compte Lumen (onglet Profil) pour recevoir le défi du jour, un petit rappel l'après-midi et les défis de tes amis.</p></div>`;
    if (!notifOK()) return `<div class="card stack">${head}<p class="muted" style="margin:0">Sur iPhone et iPad, installe d'abord Lumen sur l'écran d'accueil (bouton Partager, puis « Sur l'écran d'accueil »), puis ouvre l'appli depuis son icône pour activer les notifications.</p></div>`;
    const on = Notification.permission === "granted" && S.amis && S.amis.notif;
    if (!on) return `<div class="card stack">${head}<p class="muted" style="margin:0">Reçois le défi du jour le matin, un rappel l'après-midi et une alerte quand un ami te défie.</p>${ui.nmsg ? `<p class="am-err">${esc(ui.nmsg)}</p>` : ""}<button class="btn" data-am="notifon">Activer les notifications</button></div>`;
    return `<div class="card stack">${head}${Object.keys(NPREFS).map(k => { const v = S.amis.notif[k] !== false;
      return `<div class="row between"><span>${NPREFS[k]}</span><button class="btn small ${v ? "" : "ghost"}" data-am="notifpref" data-v="${k}" aria-pressed="${v}">${v ? "Activé" : "Coupé"}</button></div>`; }).join("")}
      <p class="muted" style="font-size:13px;margin:0">Les alertes de défi peuvent arriver avec quelques minutes de retard.</p></div>`;
  }
  // Ouverture depuis une notification : ?tab=amis
  try { const q = new URLSearchParams(location.search).get("tab"); if (q === "amis" && S.profile) { S.tab = "amis"; history.replaceState(null, "", location.pathname); } } catch(e){}

  /* --- Choix des questions d'un défi Classique ou Qui a dit ? --- */
  function pickQids(mode, theme, n){
    const sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    if (mode === "qad") return sh(quoteIds()).slice(0, n);
    const pool = allIds().filter(id => !isQuote(Q[id]) && (theme === "mix" || Q[id][0] === theme));
    // Un mélange de niveaux : environ 30 % faciles, 40 % moyennes, 30 % pointues
    const k = Math.round(n * .3), want = [k, n - 2*k, k];
    let out = []; [1,2,3].forEach((l, i) => out = out.concat(sh(pool.filter(id => Q[id][1] === l)).slice(0, want[i])));
    if (out.length < n) out = out.concat(sh(pool.filter(id => !out.includes(id))).slice(0, n - out.length));
    return sh(out).slice(0, n);
  }

  /* --- Défis --- */
  async function challenge(){
    if (!ui.friend) { ui.msg = "Choisis d'abord un adversaire."; return render(); }
    if (ui.kind === "live" && !online(ui.friend)) { ui.msg = "Ton ami n'est pas en ligne : envoie-lui plutôt un défi en différé."; return render(); }
    const m = ui.mode, qids = hasN(m) ? pickQids(m, ui.theme, ui.n) : [];
    const d = {kind:ui.kind, from:uid(), to:ui.friend, mode:m, theme:m === "classic" ? ui.theme : "mix", n:qids.length, qids, seed:Math.floor(Math.random()*1e7),
      state:ui.kind === "live" ? "invite" : "open", created:Date.now(), start:0, res:{}};
    const ref = await db.collection("duels").add(d);
    ui.msg = "";
    if (ui.kind === "async") play(Object.assign({id:ref.id}, d));
    else { setTimeout(() => { const x = duels.find(y => y.id === ref.id); if (x && x.state === "invite") db.doc("duels/" + x.id).update({state:"expired"}).catch(() => {}); }, 60000); render(); }
  }
  // Revanche : même mode, même thème, même nombre de questions, de nouvelles questions
  async function rematch(id){
    const d = duels.find(x => x.id === id); if (!d) return;
    ui.friend = d.from === uid() ? d.to : d.from; ui.mode = modeOf(d); ui.theme = d.theme || "mix"; ui.n = d.n || 10;
    ui.kind = d.kind === "live" && online(ui.friend) ? "live" : "async";
    S.session = null; S.tab = "amis"; ui.view = "main";
    return challenge();
  }
  function play(d){
    S.amis.left = S.amis.left || {}; S.amis.left[d.id] = 1;
    const m = modeOf(d), mode = m === "classic" ? (d.theme === "mix" ? "mix" : "serie") : m;
    const extra = {seed:d.seed || 1, duel:{id:d.id, live:d.kind === "live", start:d.start || 0, opp:d.from === uid() ? d.to : d.from}};
    if (d.qids && d.qids.length) extra.qids = d.qids;
    if (mode === "serie") extra.theme = d.theme;
    start(mode, extra);
  }
  async function accept(id){
    const d = duels.find(x => x.id === id); if (!d) return;
    if (d.kind === "live") await db.doc("duels/" + id).update({state:"live", start:Date.now() + 5000});
    else play(d);
  }
  // Score d'un joueur pendant/après la partie
  function score(s){
    if (s.mode === "avap") return {ok:s.score || 0, pos:Math.max(0, (s.used || []).length - 1) + (s.ans !== undefined ? 1 : 0)};
    const it = itemsOf(s).filter(i => "id" in i);
    return {ok:it.filter(i => i.ok).length, pos:it.length};
  }
  // Envoie la progression (après chaque réponse) et le score final, une seule fois par changement
  function sync(s){
    if (!db || !s || !s.duel) return;
    const sc = score(s), sig = sc.ok + "|" + sc.pos + "|" + !!s.done;
    if (s.duel.sig === sig) return; s.duel.sig = sig;
    const d = duels.find(x => x.id === s.duel.id), opp = d && d.res && d.res[s.duel.opp];
    const up = {["res." + uid()]: {ok:sc.ok, pos:sc.pos, t:Date.now() - (s.duel.start || s.t0), done:!!s.done}};
    if (s.done && opp && opp.done) up.state = "done";
    db.doc("duels/" + s.duel.id).update(up).catch(() => {});
  }
  // Résultat d'un duel terminé, du point de vue d'un joueur : 1 victoire, 0 nul, -1 défaite
  function outcome(d, who){
    const a = d.res && d.res[who], o = d.res && d.res[who === d.from ? d.to : d.from];
    if (!a || !o || !a.done || !o.done) return null;
    if (a.ok !== o.ok) return a.ok > o.ok ? 1 : -1;
    if (d.kind === "live" && a.t !== o.t) return a.t < o.t ? 1 : -1; // en direct, le plus rapide départage
    return 0;
  }
  const finished = () => duels.filter(d => d.res && Object.values(d.res).filter(r => r.done).length >= 2);

  /* --- Réactions aux changements --- */
  function onDuels(before){
    if (!uid()) return;
    S.amis.left = S.amis.left || {};
    // Un ami nous défie en direct
    duels.filter(d => d.kind === "live" && d.to === uid() && d.state === "invite" && Date.now() - d.created < 60000 && !before.some(b => b.id === d.id && b.state === "invite")).forEach(inviteBanner);
    // Duel en direct accepté : on lance la partie des deux côtés
    duels.filter(d => d.kind === "live" && d.state === "live" && d.start && (d.from === uid() || d.to === uid()) && !(d.res && d.res[uid()] && d.res[uid()].done) && !S.amis.left[d.id]).forEach(d => {
      document.querySelectorAll(".am-inv").forEach(e => e.remove()); play(d);
    });
    // Un défi vient de se terminer : on prévient
    S.amis.told = S.amis.told || {};
    finished().filter(d => (d.from === uid() || d.to === uid()) && !S.amis.told[d.id]).forEach(d => {
      S.amis.told[d.id] = 1; const o = outcome(d, uid()), opp = pseudoOf(d.from === uid() ? d.to : d.from);
      // Quêtes : un duel terminé cette semaine compte une seule fois (même sur un autre appareil)
      if (typeof Quetes !== "undefined" && Date.now() - d.created < 7 * 864e5) Quetes.mpDone("d" + d.id, o === 1);
      if (before.length) toasts.push(`<b>Duel contre ${esc(opp)}</b> · ${o === 1 ? "victoire !" : o === -1 ? "défaite." : "égalité."}`);
    });
    S.online = stats(); if (S.online.wins >= 1) unlockSkin("nord"); save(); checkBadges();
  }
  // Pop-up en haut de l'écran quand un ami nous défie : petit son, vibration, et on peut le fermer
  function inviteBanner(d){
    document.querySelectorAll(`.am-inv[data-duel="${d.id}"]`).forEach(e => e.remove());
    if (S.settings.sfx !== false) { try { Music.sfx("level"); navigator.vibrate && navigator.vibrate([90, 60, 90]); } catch(e){} }
    const live = d.kind === "live", el = document.createElement("div");
    el.className = "am-inv"; el.dataset.duel = d.id; el.setAttribute("role", "alertdialog");
    const score = !live && d.res && d.res[d.from] && d.res[d.from].done ? ` · score à battre : ${d.res[d.from].ok}` : "";
    el.innerHTML = `<button class="am-x" data-am="later" data-id="${d.id}" aria-label="Fermer">×</button>
      <div class="row" style="gap:10px;align-items:center;flex-wrap:nowrap">${avatar(d.from, 40)}<div class="stack" style="gap:2px;min-width:0"><b>${esc(pseudoOf(d.from))} te défie${live ? " en direct" : ""} !</b><span>${esc(duelLabel(d))}${score}</span></div></div>
      <div class="row">${live ? `<button class="btn small" data-am="accept" data-id="${d.id}">Accepter</button><button class="btn small ghost" data-am="refuse" data-id="${d.id}">Refuser</button>`
        : `<button class="btn small" data-am="accept" data-id="${d.id}">Jouer</button><button class="btn small ghost" data-am="later" data-id="${d.id}">Plus tard</button>`}</div>`;
    document.body.appendChild(el); setTimeout(() => el.remove(), live ? 60000 : 30000);
  }
  // Défis en différé reçus et pas encore montrés : on les montre dès qu'on n'est pas en pleine partie
  function showAsyncInvites(){
    if (!uid() || (S.session && !S.session.done && S.tab === "jouer")) return;
    S.amis.shown = S.amis.shown || {};
    const d = duels.find(x => x.kind === "async" && x.to === uid() && x.state === "open" && !S.amis.shown[x.id] && !(x.res && x.res[uid()] && x.res[uid()].done) && Date.now() - x.created < 3*864e5);
    if (!d) return;
    S.amis.shown[d.id] = 1; save(); inviteBanner(d);
  }

  /* --- Statistiques et classements --- */
  function stats(){
    const mine = finished().filter(d => d.from === uid() || d.to === uid()).sort((a, b) => a.created - b.created);
    let wins = 0, streak = 0, best = 0, live = 0, perfect = 0, big = 0, modes = {};
    mine.forEach(d => { const o = outcome(d, uid()), r = d.res[uid()];
      modes[modeOf(d)] = 1;
      if (o === 1) { wins++; streak++; best = Math.max(best, streak); if (d.kind === "live") live++; if (modeOf(d) === "classic" && d.n >= 20) big++; } else streak = 0;
      if (modeOf(d) === "classic" && d.n >= 10 && r.ok === d.n) perfect++; });
    const top = duelBoard()[0];
    return {played:mine.length, wins, best, live, perfect, big, modes:Object.keys(modes).length, accepted:mine.filter(d => d.to === uid()).length,
      top1:Math.max((S.online && S.online.top1) || 0, top && top.id === uid() && top.n >= 5 ? 1 : 0)};
  }
  // Lundi 0 h de la semaine en cours
  const weekStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.getTime(); };
  function duelBoard(since){
    const t = {}, row = id => t[id] = t[id] || {id, pts:0, w:0, d:0, l:0, n:0};
    Object.keys(users).forEach(row);
    finished().filter(d => !since || d.created >= since).forEach(d => [d.from, d.to].filter(p => users[p]).forEach(p => { const o = outcome(d, p), r = row(p); r.n++;
      if (o === 1) { r.pts += 3; r.w++; } else if (o === 0) { r.pts++; r.d++; } else r.l++; }));
    return Object.values(t).sort((a, b) => b.pts - a.pts || b.w - a.w);
  }
  // Les différents classements : entre amis (duels) et en solo
  const BOARDS = {
    semaine:{n:"Cette semaine", unit:"pts", rows:() => duelBoard(weekStart()).map(r => ({id:r.id, v:r.pts, sub:`${r.w}V ${r.d}N ${r.l}D`}))},
    duels:{n:"Duels", unit:"pts", rows:() => duelBoard().map(r => ({id:r.id, v:r.pts, sub:`${r.w}V ${r.d}N ${r.l}D`}))},
    lvl:{n:"Niveau", unit:"", pre:"Niv. ", rows:() => solo(st => st.lvl)},
    ok:{n:"Bonnes réponses", unit:"", rows:() => solo(st => st.ok)},
    streak:{n:"Série de jours", unit:"j", rows:() => solo(st => st.streak)},
    avap:{n:"Avant ou après", unit:"", rows:() => solo(st => st.avap)}
  };
  function solo(f){
    return Object.keys(users).map(id => { const st = id === uid() ? {lvl:acctLvl().L, ok:totalOk(), avap:(S.rec && S.rec.avap) || 0, streak:Math.max(S.bestStreak || 0, streak())} : (users[id].st || {});
      return {id, v:f(st) || 0}; }).sort((a, b) => b.v - a.v);
  }

  /* --- Affichage --- */
  // Le n°1 des duels de la semaine porte la couronne (jusqu'au lundi suivant)
  let crownCache = {at:0, id:null};
  function crownId(){
    if (Date.now() - crownCache.at < 3000) return crownCache.id;
    const b = duelBoard(weekStart()), top = b[0];
    crownCache = {at:Date.now(), id:top && top.pts > 0 && !(b[1] && b[1].pts === top.pts && b[1].w === top.w) ? top.id : null};
    return crownCache.id;
  }
  const CROWN = `<svg class="am-crown" viewBox="0 0 40 28" aria-label="Couronne du n°1 de la semaine"><path d="M4 24 L2 6 L12 14 L20 2 L28 14 L38 6 L36 24Z" fill="#FFD23F" stroke="#2B1D3A" stroke-width="2.6" stroke-linejoin="round"/><path d="M5 20 H35" stroke="#E8A400" stroke-width="2.4"/><circle cx="20" cy="12" r="2.6" fill="#FF5FA2" stroke="#2B1D3A" stroke-width="1.4"/></svg>`;
  const avatar = (id, z) => { const u = users[id], sk = u && u.av && skinOf(u.av), svg = creatureSVG(sk || CHARS[0], z || 34);
    return id && id === crownId() ? `<span class="am-crowned" style="--z:${z || 34}px">${svg}${CROWN}</span>` : svg; };
  // Pastille verte « En ligne » ou rouge « Hors ligne »
  const status = id => `<span class="am-st ${online(id) ? "on" : "off"}"><i class="st-dot"></i>${online(id) ? "En ligne" : "Hors ligne"}</span>`;
  const chip = (k, v, label, on) => `<button class="chip-btn ${on ? "on" : ""}" data-am="${k}" data-v="${v}" aria-pressed="${on}">${label}</button>`;
  // Écran d'accueil de l'onglet Multi : deux portes (Joueur contre joueur, Guildes)
  function viewHub(){
    const recv = duels.filter(d => d.kind === "async" && d.to === uid() && !(d.res && d.res[uid()] && d.res[uid()].done) && d.state !== "declined").length;
    const G = typeof Guildes !== "undefined" ? Guildes.mine() : null, inv = typeof Guildes !== "undefined" ? Guildes.invites() : 0;
    const door = (v, art, t, d, n) => `<button class="mh-door mh-${v}" data-am="multi" data-v="${v}"><span class="mh-arch">${art}</span><span class="mh-txt"><b>${t}</b><span>${d}</span></span>${n ? `<i class="mh-n">${n}</i>` : ""}</button>`;
    return `<section class="stack"><h1 class="big" style="margin:0">Multi</h1>
      ${door("jcj", gIcon("sword", 64), "Joueur contre joueur", "Duels en direct ou en différé, salons privés et classement", recv)}
      ${door("guild", G ? Guildes.emblem(G.g.emb, 70, G.t.lvl) : Guildes.emblem({s:"ecu", c:"rubis", i:"duel"}, 70, 1), "Guildes", G ? `${esc(G.g.name)} · niveau ${G.t.lvl} · ${Object.keys(G.g.members).length}/5 membres` : "Fonde ou rejoins une guilde de 5 amis maximum", inv)}
    </section>`;
  }
  function view(){
    if (!enabled()) return `<section class="stack"><h1 class="big">JcJ</h1><div class="card stack"><b>Le mode en ligne arrive bientôt.</b><p class="muted">Duels en direct, défis en différé et classements entre amis.</p></div></section>`;
    if (!fb) { boot(); return `<section class="stack"><h1 class="big">JcJ</h1><div class="card"><p class="muted">${err || "Connexion au serveur…"}</p></div></section>`; }
    if (!me) return viewLogin();
    if (cloud.offer) return viewOffer();
    if (typeof Salons !== "undefined" && Salons.active()) return Salons.view();
    const mv = S.multiView || "home";
    if (mv === "guild" && typeof Guildes !== "undefined") return Guildes.view();
    if (mv !== "jcj") return viewHub();
    if (ui.view === "board") return viewBoard();
    const others = Object.keys(users).filter(id => id !== uid()).sort((a, b) => online(b) - online(a));
    const mineDone = d => d.res && d.res[uid()] && d.res[uid()].done;
    const recv = duels.filter(d => d.kind === "async" && d.to === uid() && !mineDone(d) && d.state !== "declined");
    const sent = duels.filter(d => d.from === uid() && d.kind === "async" && mineDone(d) && !(d.res[d.to] && d.res[d.to].done));
    const p = pending(), hist = finished().filter(d => d.from === uid() || d.to === uid()).slice(0, 8);
    const m = ui.mode;
    return `<section class="stack">
      <div class="row between"><div class="stack" style="gap:2px"><button class="quit" data-am="multi" data-v="home">← Multi</button><h1 class="big" style="margin:0">Joueur contre joueur</h1></div><button class="am-trophy" data-am="board">${gIcon("trophy", 46)}<span>Classement</span></button></div>
      ${typeof Salons !== "undefined" ? Salons.entry() : ""}
      ${p ? `<div class="card stack banner-am"><b>En attente de ${esc(pseudoOf(p.to))}…</b><span class="muted">Le duel démarre dès qu'il accepte.</span><button class="btn small ghost" data-am="cancel" data-id="${p.id}">Annuler</button></div>` : ""}
      ${recv.length ? `<div class="card stack banner-am"><div class="label">Défis reçus</div>${recv.map(d => `<div class="am-row">${avatar(d.from)}<div class="stack grow" style="gap:2px"><b>${esc(pseudoOf(d.from))}</b><span class="muted">${esc(duelLabel(d))}${d.res && d.res[d.from] && d.res[d.from].done ? " · à battre : " + d.res[d.from].ok : ""}</span></div><button class="btn small" data-am="accept" data-id="${d.id}">Relever</button></div>`).join("")}</div>` : ""}
      <div class="card stack">
        <div class="label">1 · Ton adversaire</div>
        ${others.length ? `<div class="am-friends">${others.map(id => `<button class="am-f ${ui.friend === id ? "on" : ""}" data-am="friend" data-v="${id}" aria-pressed="${ui.friend === id}">${avatar(id, 44)}<span>${esc(pseudoOf(id))}</span>${titleOf(id, "xs")}${status(id)}</button>`).join("")}</div>` : `<p class="muted">Aucun ami inscrit pour l'instant. Envoie-leur le lien de Lumen !</p>`}
        <div class="label">2 · Le mode de jeu</div>
        <div class="am-modes">${Object.keys(MODES).map(k => `<button class="am-mode ${m === k ? "on" : ""}" data-am="mode" data-v="${k}" aria-pressed="${m === k}">${gIcon(MODES[k].icon, 40)}<b>${MODES[k].n}</b><span>${MODES[k].d}</span></button>`).join("")}</div>
        ${m === "classic" ? `<div class="label">3 · Le thème</div>
        <div class="am-themes"><button class="am-th ${ui.theme === "mix" ? "on" : ""}" data-am="theme" data-v="mix" aria-pressed="${ui.theme === "mix"}">${gIcon("mix", 40)}<span>Tous</span></button>${ORDER.map(t => `<button class="am-th ${ui.theme === t ? "on" : ""}" data-am="theme" data-v="${t}" aria-pressed="${ui.theme === t}">${thIcon(t, 40)}<span>${esc(THEMES[t].n)}</span></button>`).join("")}</div>` : ""}
        ${hasN(m) ? `<div class="label">${m === "classic" ? "4" : "3"} · Nombre de questions</div><div class="row">${[5,10,15,20].map(n => chip("n", n, n, ui.n === n)).join("")}</div>` : ""}
        <div class="label">Quand ?</div><div class="row">${chip("kind", "async", "En différé", ui.kind === "async")}${chip("kind", "live", "En direct", ui.kind === "live")}</div>
        <p class="muted" style="font-size:13.5px">${ui.kind === "async" ? "Tu joues maintenant, ton ami joue la même partie quand il veut." : "Vous jouez en même temps la même partie. À score égal, le plus rapide gagne."}</p>
        ${ui.msg ? `<p class="am-err">${esc(ui.msg)}</p>` : ""}
        <button class="btn" data-am="go" ${p ? "disabled" : ""}>Lancer le défi</button>
      </div>
      ${sent.length ? `<div class="card stack"><div class="label">En attente</div>${sent.map(d => `<div class="am-row">${avatar(d.to)}<div class="stack grow" style="gap:2px"><b>${esc(pseudoOf(d.to))}</b><span class="muted">${esc(duelLabel(d))} · ton score : ${d.res[uid()].ok}</span></div></div>`).join("")}</div>` : ""}
      ${hist.length ? `<div class="card stack"><div class="label">Derniers duels</div>${hist.map(d => { const o = outcome(d, uid()), opp = d.from === uid() ? d.to : d.from;
        return `<div class="am-row">${avatar(opp)}<div class="stack grow" style="gap:2px"><b>${esc(pseudoOf(opp))}</b><span class="muted">${esc(duelLabel(d))} · ${d.res[uid()].ok} – ${d.res[opp].ok}</span></div><div class="stack" style="gap:4px;align-items:flex-end"><span class="chip ${o === 1 ? "lamp" : ""}">${o === 1 ? "Victoire" : o === -1 ? "Défaite" : "Égalité"}</span><button class="am-re" data-am="rematch" data-id="${d.id}">Revanche</button></div></div>`; }).join("")}</div>` : ""}
      ${meCard()}
    </section>`;
  }
  function meCard(){
    return `<div class="card stack"><div class="label">Mon compte Lumen</div>
        <div class="am-row">${avatar(uid())}<div class="stack grow" style="gap:2px"><b>${esc(pseudoOf(uid()))}</b><span class="muted" style="font-size:13px">${me.email && !me.email.endsWith("@joueurs.lumen-amis.app") ? esc(me.email) : "Compte sans e-mail"}</span></div></div>
        <p class="muted" style="font-size:13.5px;margin:0">${cloud.err ? "Sauvegarde impossible pour le moment : elle réessaiera toute seule." : cloud.ready ? "Ta progression est sauvegardée sur ton compte : connecte-toi sur un autre appareil (PC, tablette) pour la retrouver." : "Synchronisation…"}</p>
        <button class="btn ghost small" data-am="logout">Se déconnecter</button></div>`;
  }
  function viewOffer(){ return `<section class="stack"><h1 class="big">JcJ</h1>${offerCard()}</section>`; }
  function offerCard(){
    const o = cloud.offer, d = new Date(o.at);
    return `<div class="card stack banner-am"><b>Une progression est sauvegardée sur ce compte</b>
        <p class="muted" style="margin:0">Niveau ${o.lvl || "?"}, sauvegardée le ${d.getDate()} ${MOIS[d.getMonth()]} à ${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}.</p>
        <p class="muted" style="margin:0">Cet appareil a sa propre progression (niveau ${acctLvl().L}). Laquelle veux-tu garder ?</p>
        <button class="btn" data-am="cloudget">Récupérer celle du compte</button>
        <button class="btn ghost" data-am="cloudkeep">Garder celle de cet appareil</button>
        <p class="muted" style="font-size:13px;margin:0">« Garder celle de cet appareil » remplace la sauvegarde du compte.</p></div>`;
  }
  function viewBoard(){
    const B = BOARDS[ui.board], rows = B.rows(), top = rows.slice(0, 3);
    const unit = v => `${B.pre || ""}${v}${B.unit ? " " + B.unit : ""}`;
    const podium = [1, 0, 2].filter(i => top[i]).map(i => `<div class="pod p${i + 1} ${top[i].id === uid() ? "me" : ""}">${avatar(top[i].id, i ? 52 : 66)}<b>${esc(pseudoOf(top[i].id))}</b>${titleOf(top[i].id, "xs")}<span>${unit(top[i].v)}</span><div class="step">${i + 1}</div></div>`).join("");
    return `<section class="stack">
      <div class="row between"><button class="quit" data-am="back">Retour</button><span class="label">Entre amis</span></div>
      <div class="row" style="gap:10px;align-items:center">${gIcon("trophy", 48)}<h1 class="big" style="margin:0">Classement</h1></div>
      <div class="am-tabs">${Object.keys(BOARDS).map(k => chip("bd", k, BOARDS[k].n, ui.board === k)).join("")}</div>
      <div class="podium">${podium}</div>
      <div class="card stack">${rows.map((r, i) => `<div class="am-row ${r.id === uid() ? "me" : ""}"><span class="am-pos ${i < 3 ? "gold" : ""}">${i + 1}</span>${avatar(r.id)}<div class="stack grow" style="gap:0"><b>${esc(pseudoOf(r.id))} ${titleOf(r.id, "xs")} ${r.id === uid() ? "" : `<i class="st-dot ${online(r.id) ? "on" : "off"}" title="${online(r.id) ? "En ligne" : "Hors ligne"}"></i>`}</b>${r.sub ? `<span class="muted" style="font-size:13px">${r.sub}</span>` : ""}</div><b class="am-pts">${unit(r.v)}</b></div>`).join("")}</div>
      <p class="muted" style="font-size:13px;text-align:center">${ui.board === "semaine" ? "Duels joués depuis lundi : 3 points par victoire, 1 par égalité. Le n°1 porte la couronne 👑 jusqu'à lundi prochain." : ui.board === "duels" ? "3 points par victoire, 1 par égalité." : "Classement en solo : il se met à jour quand chacun ouvre l'appli."}</p>
    </section>`;
  }
  function viewLogin(){
    return `<section class="stack"><h1 class="big">JcJ</h1>
      <p class="muted">Connecte-toi à ton compte Lumen pour défier tes amis dans tous les modes du jeu, en direct ou en différé, et grimper dans les classements. Ton compte sauvegarde aussi toute ta progression.</p>
      ${loginForm(true)}</section>`;
  }
  // Formulaire de compte (création ou connexion) : utilisé dans JcJ, dans Profil et sur l'écran de bienvenue
  function loginForm(withSeg){
    const su = ui.seg === "signup";
    return `${withSeg ? `<div class="row">${[["signup","Créer mon compte"],["login","J'ai déjà un compte"]].map(([k, l]) => chip("seg", k, l, ui.seg === k)).join("")}</div>` : ""}
      <form id="am-form" class="card stack" novalidate>
        ${su ? `<label class="label" for="am-p">Pseudo</label><input class="field" id="am-p" maxlength="16" autocomplete="nickname" value="${esc(S.profile ? S.profile.name : "")}">` : ""}
        <label class="label" for="am-m">${su ? "E-mail" : "E-mail (ou pseudo pour un ancien compte)"}</label><input class="field" id="am-m" type="${su ? "email" : "text"}" inputmode="email" autocomplete="username" value="${esc(ui.mail || "")}" placeholder="toi@exemple.fr">
        <label class="label" for="am-pw">Mot de passe</label><input class="field" id="am-pw" type="password" autocomplete="${su ? "new-password" : "current-password"}" placeholder="6 caractères minimum">
        ${su ? `<p class="muted" style="font-size:13.5px">Ton e-mail sert à te connecter et à changer de mot de passe si tu l'oublies. Tes amis ne le voient pas.</p>` : ""}
        ${ui.msg ? `<p class="am-err">${esc(ui.msg)}</p>` : ""}${ui.info ? `<p class="muted" style="font-size:13.5px;margin:0">${esc(ui.info)}</p>` : ""}
        <button class="btn" type="submit" ${ui.busy ? "disabled" : ""}>${ui.busy ? "Un instant…" : su ? "Créer mon compte" : "Me connecter"}</button>
        ${su ? "" : `<button class="btn ghost small" type="button" data-am="forgot">Mot de passe oublié ?</button>`}
      </form>`;
  }
  // Dans Profil : le compte sert à tout le jeu (sauvegarde) et au mode en ligne
  function accountCard(){
    if (!enabled()) return "";
    if (!fb) { boot(); return `<div class="card stack"><div class="label">Mon compte Lumen</div><p class="muted" style="margin:0">${err || "Connexion au serveur…"}</p></div>`; }
    if (cloud.offer) return offerCard();
    if (me) return meCard();
    return `<div class="card stack"><div class="label">Mon compte Lumen</div><p class="muted" style="margin:0">Crée ton compte pour sauvegarder toute ta progression (niveau, pièces, skins, parc, badges), la retrouver sur un autre appareil comme un PC, et jouer en ligne avec tes amis.</p></div>${loginForm(true)}`;
  }
  // Écran de bienvenue : « J'ai déjà un compte » pour récupérer sa progression sur un nouvel appareil
  function welcome(){
    if (!enabled()) return "";
    return `<div class="card stack" style="text-align:center"><span class="muted">Tu as déjà un compte Lumen ?</span><button class="btn ghost" data-am="welcome">Me connecter et récupérer ma progression</button></div>`;
  }
  function welcomeView(){
    const body = !fb ? `<div class="card"><p class="muted" style="margin:0">${err || "Connexion au serveur…"}</p></div>`
      : me ? `<div class="card"><p class="muted" style="margin:0">Récupération de ta progression…</p></div>` : loginForm(false);
    return `<section class="stack"><div class="row between"><button class="quit" data-am="welcomeback">Retour</button><span></span></div>
      <div class="brand" style="font-size:26px">L<span>u</span>men</div>
      <h1 class="big">Bon retour <em>parmi nous.</em></h1>
      <p class="muted">Connecte-toi : tu retrouveras ton niveau, tes pièces, tes skins et ton parc.</p>${body}</section>`;
  }
  // Pendant un duel : bandeau avec la progression de l'adversaire
  function duelBar(s){ return `<div id="duelbar" class="duelbar">${duelBarInner(s)}</div>`; }
  function duelBarInner(s){
    const d = duels.find(x => x.id === s.duel.id), r = d && d.res && d.res[s.duel.opp];
    const info = s.duel.live ? (r && r.done ? " <small>(fini)</small>" : "") : (r && r.done ? "" : " <small>(pas encore joué)</small>");
    return `<span>Toi <b>${score(s).ok}</b></span><span class="vs">contre</span><span>${esc(pseudoOf(s.duel.opp))} <b>${r ? r.ok : 0}</b>${info}</span>`;
  }
  function updateDuelBar(){ const s = S.session, el = document.getElementById("duelbar"); if (s && s.duel && el) el.innerHTML = duelBarInner(s); }
  function countdown(s){
    const left = Math.ceil((s.duel.start - Date.now()) / 1000);
    setTimeout(() => { if (S.session === s) render(); }, Math.min(1000, s.duel.start - Date.now() + 30));
    return `<section class="stack" style="text-align:center;padding-top:40px;align-items:center"><div class="label">${esc(MODE_NAME[s.mode] || (s.mode === "avap" ? "Avant ou après ?" : "Duel"))} · en direct contre ${esc(pseudoOf(s.duel.opp))}</div>${avatar(s.duel.opp, 90)}<div class="score">${Math.max(left, 1)}</div><p class="muted">Prêt ? Le meilleur score gagne, puis le plus rapide.</p></section>`;
  }
  function recap(s){
    const d = duels.find(x => x.id === s.duel.id), o = d && outcome(d, uid()), r = d && d.res && d.res[s.duel.opp];
    if (o === null || o === undefined) return `<div class="card"><b>${r && !r.done && s.duel.live ? esc(pseudoOf(s.duel.opp)) + " n'a pas encore fini…" : "Ton score est envoyé à " + esc(pseudoOf(s.duel.opp)) + "."}</b><p class="muted">Tu verras le résultat dans l'onglet JcJ.</p></div>`;
    return `<div class="card banner-am"><b>${o === 1 ? "Victoire !" : o === -1 ? "Défaite…" : "Égalité"}</b><p class="muted">Score de ${esc(pseudoOf(s.duel.opp))} : ${r.ok}.</p><button class="btn small" data-am="rematch" data-id="${d.id}">${o === 1 ? "Rejouer contre " + esc(pseudoOf(s.duel.opp)) : "Revanche !"}</button></div>`;
  }

  /* --- Clics et formulaires --- */
  async function click(b){
    const a = b.dataset.am, v = b.dataset.v, id = b.dataset.id; ui.msg = ""; ui.info = "";
    const mEl = document.getElementById("am-m"); if (mEl) ui.mail = mEl.value;
    try {
      if (a === "seg") ui.seg = v;
      else if (a === "friend") ui.friend = ui.friend === v ? "" : v;
      else if (a === "mode") ui.mode = v;
      else if (a === "theme") ui.theme = v;
      else if (a === "n") ui.n = +v;
      else if (a === "kind") ui.kind = v;
      else if (a === "multi") { S.multiView = v; ui.view = "main"; save(); render(); return window.scrollTo(0, 0); }
      else if (a === "board") { ui.view = "board"; render(); return window.scrollTo(0, 0); }
      else if (a === "back") ui.view = "main";
      else if (a === "bd") ui.board = v;
      else if (a === "go") return await challenge();
      else if (a === "later") { document.querySelectorAll(`.am-inv[data-duel="${id}"]`).forEach(e => e.remove()); return; }
      else if (a === "rematch") return await rematch(id);
      else if (a === "accept") { b.closest(".am-inv") && b.closest(".am-inv").remove(); return await accept(id); }
      else if (a === "refuse") { b.closest(".am-inv") && b.closest(".am-inv").remove(); await db.doc("duels/" + id).update({state:"declined"}); return; }
      else if (a === "cancel") await db.doc("duels/" + id).update({state:"cancelled"});
      else if (a === "logout") { push(true); await auth.signOut(); S.amis = {link:S.amis.link, syncAt:S.amis.syncAt}; save(); }
      else if (a === "forgot") await forgot(ui.mail || "");
      else if (a === "notifon") { ui.nmsg = ""; try { await notifEnable(); } catch(x){ ui.nmsg = typeof x === "string" ? x : "Impossible d'activer les notifications sur cet appareil."; } }
      else if (a === "notifpref") await notifPref(v);
      else if (a === "welcome") { ui.welcome = true; ui.seg = "login"; boot(); }
      else if (a === "welcomeback") ui.welcome = false;
      else if (a === "cloudget") return restore(cloud.offer, false);
      else if (a === "cloudkeep") { cloud.offer = null; S.amis.link = uid(); cloud.ready = true; save(); push(true); }
    } catch(e){ ui.msg = typeof e === "string" ? e : "Une erreur est survenue. Réessaie."; }
    render();
  }
  document.addEventListener("submit", async e => {
    if (e.target.id !== "am-form") return; e.preventDefault();
    const pe = document.getElementById("am-p"), p = pe ? pe.value : "", m = document.getElementById("am-m").value, pw = document.getElementById("am-pw").value;
    ui.mail = m; ui.busy = true; ui.msg = ""; ui.info = ""; render();
    try { ui.seg === "signup" ? await signup(p, m, pw) : await login(m, pw); }
    catch(x){ ui.msg = typeof x === "string" ? x : "Une erreur est survenue. Réessaie."; }
    ui.busy = false; render();
  });

  // Au démarrage : si on était connecté, on se reconnecte pour recevoir les défis
  setTimeout(() => { if (S && S.amis && S.amis.on) boot(); }, 1500);

  // Accès partagé pour les salons privés (salons.js)
  // Titre d'un ami (le LOOSER DU JOUR ne compte que le jour même)
  const titleOf = (id, cls) => { const u = users[id]; if (!u || !u.ti || (u.ti === "looser" && u.tid !== today())) return ""; return titleTag(u.ti, cls || "sm"); };
  const api = {db:() => db, fb:() => fb, uid, me:() => me, users:() => users, avatar, pseudoOf, online, rerender, ping, title:titleOf};
  return {view, click, sync, duelBar, countdown, recap, enabled, dirty:() => push(false), accountCard, notifCard, welcome, welcomeView, welcoming:() => !!ui.welcome, api};
})();

/* --- Badges « En ligne » --- */
[["ami1","bronze",1,"played","Premier duel","Jouer ton premier duel contre un ami",20],
 ["ami10","argent",10,"played","10 duels joués","Jouer 10 duels contre des amis",50],
 ["win1","bronze",1,"wins","Première victoire","Gagner un duel",30],
 ["win5","argent",5,"wins","5 victoires","Gagner 5 duels",60],
 ["win20","or",20,"wins","20 victoires","Gagner 20 duels",120],
 ["win50","platine",50,"wins","50 victoires","Gagner 50 duels",250],
 ["serie3","or",3,"best","Invincible","Gagner 3 duels d'affilée",80],
 ["live1","argent",1,"live","Rapide comme l'éclair","Gagner un duel en direct",50],
 ["touche","argent",5,"modes","Touche-à-tout","Jouer un duel dans chacun des 5 modes",60],
 ["parfait","or",1,"perfect","Sans-faute","Faire un sans-faute dans un duel Classique d'au moins 10 questions",80],
 ["marathon","platine",1,"big","Marathonien","Gagner un duel Classique de 20 questions",100],
 ["releve10","argent",10,"accepted","Toujours partant","Relever 10 défis lancés par tes amis",50],
 ["top1","diamant",1,"top1","Numéro 1","Être premier du classement des duels avec au moins 5 duels",150]
].forEach(([id, tier, goal, k, name, desc, coins]) => BADGES.push({id:"on_" + id, g:"En ligne", tier, icon:"duel", name, desc, coins, goal, cur:() => (S.online && S.online[k]) || 0}));
