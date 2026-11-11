// Service worker de Lumen : l'appli marche hors connexion.
// La page est chargée « réseau d'abord » (pour recevoir les mises à jour), le reste « cache d'abord ».
const CACHE = "lumen-f1ecf45f04";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Notifications envoyées par notifs/send.js (Firebase Cloud Messaging, données seules)
self.addEventListener("push", e => {
  let d = {}; try { d = e.data.json(); } catch(x){}
  const n = d.notification || {}, data = d.data || d || {};
  e.waitUntil(self.registration.showNotification(n.title || data.title || "Lumen", {
    body: n.body || data.body || "", icon: "icons/icon-192.png", badge: "icons/badge-96.png",
    tag: data.tag || undefined, data: {url: data.url || "./"}
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(clients.matchAll({type: "window", includeUncontrolled: true}).then(list => {
    for (const c of list) if (c.url.startsWith(self.registration.scope)) { return c.focus().then(w => w && w.navigate ? w.navigate(url) : w); }
    return clients.openWindow(url);
  }));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Mode en ligne (Firebase) : jamais de cache, sinon les duels ne se mettraient plus à jour
  const host = new URL(req.url).hostname;
  if (/googleapis\.com$|firebaseio\.com$|firebaseapp\.com$/.test(host) && !/^fonts\./.test(host)) return;
  if (/\.mp3$/.test(new URL(req.url).pathname)) return;   // musiques : directement par le réseau
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  // Polices Google et Three.js : gardés en cache après le premier chargement
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
