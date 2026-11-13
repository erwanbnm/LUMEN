// Test du serveur des potions (functions/index.js) avec une fausse base Firestore en mémoire. Rien n'est envoyé en ligne.
const path = require('path'), Module = require('module');
const store = {};
const snap = p => ({exists:p in store, data:() => JSON.parse(JSON.stringify(store[p]))});
const doc = p => ({get:async () => snap(p), path:p});
const fakeAdmin = {initializeApp(){}, firestore:Object.assign(() => ({doc, runTransaction:async fn => fn({get:async r => snap(r.path), set:(r, v) => { store[r.path] = JSON.parse(JSON.stringify(v)); }})}), {})};
class HttpsError extends Error { constructor(c, m){ super(m); this.code = c; } }
const fns = {};
const stubs = {'firebase-admin':fakeAdmin, 'firebase-functions/v2':{setGlobalOptions(){}}, 'firebase-functions/v2/https':{onCall:f => f, HttpsError}};
const load = Module._load; Module._load = function(req, ...a){ return stubs[req] || load.call(this, req, ...a); };
const F = require(path.join(__dirname, '..', 'functions', 'index.js'));
const D = require(path.join(__dirname, '..', 'functions', 'evenements_data.js'));
const call = (f, data, uid = 'u1') => F[f]({auth:{uid}, data});
const inv = (uid = 'u1') => store['inv/' + uid];
const day = new Intl.DateTimeFormat("fr-CA", {timeZone:"Europe/Paris", year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date());
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
(async () => {
  // Ancienne potion (un exemplaire) et effet en cours : convertis
  store['inv/u1'] = {tok:{xp:{n:1, at:1}, coin:{n:0, until:Date.now() + 10 * 6e4}, fifty:{n:1}}, grants:{}, pay:{}};
  await call('use', {t:'xp', r:'c'});
  ok(inv().boost.xp > Date.now() + 29 * 6e4 && inv().boost.coin > Date.now() + 9 * 6e4 && !inv().tok.xp && inv().tok.fifty.n === 1, 'migration des anciennes potions + activation commune 30 min');
  // Activation : cumul plafonné à 3 h
  store['inv/u1'].pot = {'coin:e':3};
  await call('use', {t:'coin', r:'e'}); await call('use', {t:'coin', r:'e'}); const r3 = await call('use', {t:'coin', r:'e'});
  ok(r3.ok && Math.round((inv().boost.coin - Date.now()) / 6e4) === 180 && inv().pot['coin:e'] === 0, 'cumul limité à 3 h, sac décrémenté');
  ok(!(await call('use', {t:'coin', r:'e'})).ok, 'refus sans potion');
  // Récompenses : paliers permanents une seule fois, quêtes du jour, Survie
  let r = await call('grant', {src:'pot', items:[{s:'tour', t:'50'}, {s:'tour', t:'50'}, {s:'atl', t:'10'}, {s:'mst', t:'his:7'}, {s:'qd', t:'2', d:day}, {s:'qd', t:'2', d:'2020-01-01'}]});
  ok(r.out[0].got === 'pot:xp:r' && r.out[1].dup && r.out[2].bad && r.out[3].got === 'pot:coin:e' && r.out[4].got === 'pot:xp:c' && r.out[5].no, 'Tour, doublon, palier sans potion, maîtrise, quête du jour, jour périmé refusé');
  r = await call('grant', {src:'pot', items:[{s:'qw', t:'chest', d:day, e:'coin'}]});
  ok(r.out[0].got === 'pot:coin:e', 'coffre légendaire : épique au choix');
  // Survie : il faut assez de réponses aujourd'hui ; 3 parties par jour ; épique 1 fois par semaine
  r = await call('grant', {src:'pot', items:[{s:'surv', t:'10', d:day, g:'aaaa1'}]}); ok(r.out[0].no, 'Survie refusée sans réponses comptées');
  store['inv/u1'].dayA = 40; store['inv/u1'].day = day;
  r = await call('grant', {src:'pot', items:['g1aa', 'g2aa', 'g3aa', 'g4aa'].map(g => ({s:'surv', t:'10', d:day, g}))});
  ok(r.out.filter(x => x.got).length === 3 && r.out[3].no, 'Survie : 3 parties récompensées par jour');
  r = await call('grant', {src:'pot', items:[{s:'surv', t:'30', d:day, g:'g1aa'}, {s:'surv', t:'30', d:day, g:'g2aa'}]});
  ok(r.out[0].got === 'pot:xp:e' && r.out[1].no, 'Survie : épique une fois par semaine');
  // Calendrier : vérifié avec logins
  store['logins/u1'] = {n:6, day:1};
  r = await call('grant', {src:'pot', items:[{s:'cal', t:'6', n:6}, {s:'cal', t:'14', n:14}]});
  ok(r.out[0].got === 'pot:xp:r' && r.out[1].no, 'calendrier : case récupérée acceptée, case future refusée');
  // Boss : dégâts du jour lus dans bosses/{lundi}
  const d0 = new Date(day + 'T12:00:00Z'); d0.setUTCDate(d0.getUTCDate() - (d0.getUTCDay() + 6) % 7); const wk = d0.toISOString().slice(0, 10);
  store['bosses/' + wk] = {days:{u1:{[day]:7}}};
  r = await call('grant', {src:'pot', items:[{s:'boss', t:'5', d:day}, {s:'boss', t:'10', d:day}]});
  ok(r.out[0].got === 'pot:coin:c' && r.out[1].no, 'Boss : 7 PV donnent le palier 5, pas le 10');
  // Sac plein : pièces à la place
  store['inv/u2'] = {pot:{'xp:r':20}, grants:{}, pay:{}, tok:{}};
  r = await call('grant', {src:'pot', items:[{s:'tour', t:'50'}]}, 'u2');
  ok(r.out[0].got === 'coins:250' && inv('u2').pay['tour:50'] === 250, 'case pleine : 250 pièces');
  // Achat : potion commune
  r = await call('buy', {t:'coin', key:'bkey1'}, 'u2'); const r2 = await call('buy', {t:'coin', key:'bkey1'}, 'u2');
  ok(r.ok && r2.dup && inv('u2').pot['coin:c'] === 1 && inv('u2').spent.bkey1 === 1000, 'achat d\'une potion commune (une fois par clé)');
  // Trouvailles : une chance par question et par jour, 3 au plus par jour
  const rnd = Math.random; Math.random = () => 0.001;
  store['inv/u3'] = {grants:{}, pay:{}, tok:{}};
  let got = 0;
  for (let i = 0; i < 6; i++) { store['inv/u3'].last = 0; const x = await call('draw', {keys:['akey' + i], qs:[i < 2 ? 'his01' : 'geo0' + i]}, 'u3'); got += x.pots.length; }
  Math.random = rnd;
  ok(got === 3 && inv('u3').potN === 3, 'trouvailles : même question une seule fois, 3 par jour au plus (' + got + ')');
  // Migration des potions gagnées sans compte
  r = await call('grant', {src:'local', key:'lkey1', pot:{'xp:c':2, 'coin:e':1, 'bad':5}}, 'u3'); const again = await call('grant', {src:'local', key:'lkey1', pot:{'xp:c':2}}, 'u3');
  ok(r.got.length === 3 && again.dup, 'transfert des potions de l\'appareil (une fois)');
  console.log(fail ? `${fail} échec(s)` : 'tout est bon');
})();
