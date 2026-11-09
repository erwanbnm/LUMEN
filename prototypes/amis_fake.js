// Prototype de l'onglet Amis : faux serveur en mémoire + amis simulés (Léa, Tom, Nina).
// Rien n'est envoyé sur Internet. Les données repartent de zéro à chaque rechargement.
(function(){
  const store = {}, subs = [];
  const clone = o => JSON.parse(JSON.stringify(o));
  const notify = () => setTimeout(() => subs.forEach(s => s()), 5);
  const docsOf = col => Object.keys(store).filter(k => k.startsWith(col + "/")).map(k => ({id:k.split("/")[1], data:() => clone(store[k])}));
  function setPath(o, path, v){ const p = path.split("."); let c = o; while (p.length > 1) { const k = p.shift(); c[k] = c[k] || {}; c = c[k]; } c[p[0]] = v; }
  const docRef = path => ({
    get: async () => ({exists: path in store, data: () => clone(store[path])}),
    set: async (d, o) => { store[path] = o && o.merge ? Object.assign(store[path] || {}, clone(d)) : clone(d); notify(); },
    update: async d => { Object.keys(d).forEach(k => setPath(store[path], k, clone(d[k]))); notify(); react(path); }
  });
  let n = 0;
  const colRef = name => { const q = {
    orderBy: () => q, limit: () => q,
    onSnapshot: cb => { const f = () => { const docs = docsOf(name).sort((a, b) => (b.data().created||0) - (a.data().created||0)); cb({docs, forEach: g => docs.forEach(g)}); }; subs.push(f); f(); return () => subs.splice(subs.indexOf(f), 1); },
    add: async d => { const id = "d" + (++n); store[name + "/" + id] = clone(d); notify(); react(name + "/" + id); return {id}; }
  }; return q; };
  let user = null; const authCbs = [], accounts = {};
  const fire = () => authCbs.forEach(c => c(user));

  /* --- Amis simulés --- */
  const now = Date.now(), H = 3600e3;
  store["users/lea"] = {pseudo:"Léa", pl:"léa", av:"b3", since:now, seen:now, st:{lvl:14, ok:612, avap:11, streak:9}};
  store["users/nina"] = {pseudo:"Nina", pl:"nina", av:"b9", since:now, seen:now, st:{lvl:9, ok:388, avap:15, streak:4}};
  store["users/tom"] = {pseudo:"Tom", pl:"tom", av:"b7", since:now, seen:now - 5*H, st:{lvl:21, ok:1040, avap:6, streak:23}};
  const ids = () => Object.keys(Q).filter(id => !(Q[id][6] && Q[id][6].t === "quote"));
  const rnd = k => ids().sort(() => Math.random() - .5).slice(0, k);
  const done = (ok, t) => ({ok, pos:10, ans:[], t, done:true});
  // Quelques duels déjà joués entre eux, pour remplir le classement
  store["duels/old1"] = {kind:"async", from:"lea", to:"tom", theme:"his", n:10, qids:[], state:"done", created:now - 30*H, start:0, res:{lea:done(8, 90e3), tom:done(6, 80e3)}};
  store["duels/old2"] = {kind:"live", from:"nina", to:"lea", mode:"chrono", theme:"mix", n:0, qids:[], state:"done", created:now - 20*H, start:0, res:{nina:done(7, 70e3), lea:done(7, 75e3)}};
  store["duels/old3"] = {kind:"async", from:"tom", to:"nina", mode:"survie", theme:"mix", n:0, qids:[], state:"done", created:now - 10*H, start:0, res:{tom:done(5, 90e3), nina:done(9, 85e3)}};
  const bots = ["lea", "nina", "tom"], skill = {lea:.7, nina:.6, tom:.5};
  setInterval(() => { store["users/lea"].seen = store["users/nina"].seen = Date.now(); }, 30e3);
  function botPlays(id, bot, live){
    const d = store["duels/" + id]; let pos = 0, ok = 0; const t0 = Date.now();
    // Nombre de réponses du faux ami selon le mode (Chrono : ~12 en 60 s, Survie / Avant-après : une série)
    const m = d.mode || "classic", N = d.n || (m === "chrono" ? 12 + Math.floor(Math.random()*5) : 4 + Math.floor(Math.random()*8));
    const step = () => {
      const cur = store["duels/" + id]; if (!cur || pos >= N) return;
      pos++; if (m === "survie" || m === "avap" || Math.random() < skill[bot]) ok++;
      cur.res[bot] = {ok, pos, ans:[], t:Date.now() - (cur.start || t0), done:pos >= N};
      if (pos >= N && Object.values(cur.res).filter(r => r.done).length >= 2) cur.state = "done";
      notify(); if (pos < N) setTimeout(step, live ? (m === "chrono" ? 4000 : 3500 + Math.random()*3000) : 120);
    };
    setTimeout(step, live ? Math.max(0, d.start - Date.now()) + 3000 : 0);
  }
  // Ce que font les amis quand on les défie
  function react(path){
    const id = path.split("/")[1], d = store[path]; if (!d || !path.startsWith("duels/") || !bots.includes(d.to) || d._seen) return;
    d._seen = 1;
    if (d.to === "tom") return; // Tom n'est pas là : le défi reste en attente
    if (d.kind === "live" && d.state === "invite") setTimeout(() => { d.state = "live"; d.start = Date.now() + 5000; notify(); botPlays(id, d.to, true); }, 2500);
    if (d.kind === "async") setTimeout(() => botPlays(id, d.to, false), 9000);
  }
  // Une fois connecté : Nina t'a envoyé un défi, et Léa te défie en direct au bout de 40 secondes
  let greeted = false;
  function greet(){
    if (greeted || !user) return; greeted = true;
    const qn = rnd(10);
    store["duels/nina1"] = {kind:"async", from:"nina", to:user.uid, mode:"survie", theme:"mix", n:0, qids:[], seed:4242, state:"open", created:Date.now() - 6e5, start:0, res:{nina:done(7, 95e3)}};
    notify();
    setTimeout(() => {
      store["duels/lealive"] = {kind:"live", from:"lea", to:user.uid, mode:"classic", theme:"his", n:5, qids:Object.keys(Q).filter(id => Q[id][0] === "his").sort(() => Math.random() - .5).slice(0, 5), seed:77, state:"invite", created:Date.now(), start:0, res:{}};
      notify();
      const watch = setInterval(() => { const d = store["duels/lealive"]; if (d.state === "live") { clearInterval(watch); botPlays("lealive", "lea", true); } }, 300);
    }, 40e3);
  }

  window.firebase = {
    initializeApp(){},
    auth: () => ({
      onAuthStateChanged: c => { authCbs.push(c); setTimeout(() => c(user), 1); },
      createUserWithEmailAndPassword: async (m, pw) => { if (accounts[m]) throw {code:"auth/email-already-in-use"}; const u = {uid:"moi", delete: async () => {}}; accounts[m] = {pw, u}; user = u; setTimeout(() => { fire(); greet(); }, 1); return {user:u}; },
      signInWithEmailAndPassword: async (m, pw) => { const r = accounts[m]; if (!r || r.pw !== pw) throw {code:"auth/wrong"}; user = r.u; setTimeout(fire, 1); return {user}; },
      signOut: async () => { user = null; fire(); },
      sendPasswordResetEmail: async () => {}, languageCode: "fr"
    }),
    firestore: () => ({ collection: colRef, doc: docRef, runTransaction: async fn => fn({get: r => r.get(), set: (r, d) => r.set(d)}) })
  };
})();
