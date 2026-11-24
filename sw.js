/* Network-first service worker: always fetch the newest copy when online, fall back to the saved copy offline. */
var CACHE = 'my-apps-v2';
var ASSETS = ["./", "./blackjack.html", "./energy-rush.html", "./index.html", "./steelica.html", "./type-clash.html", "./workout.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-180.png"];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(ASSETS.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); })); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  var key = url.origin + url.pathname; /* ignore ?r=... cache-busters */
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(key, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(key).then(function (m) { return m || caches.match('./index.html'); });
    })
  );
});
