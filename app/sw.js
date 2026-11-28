/* Flugbahn Service Worker: legt alle App-Dateien beim Installieren ab und liefert sie offline aus. */
const CACHE = "flugbahn-23358ee4ea";
const ASSETS = [
  "./",
  "index.html",
  "datenschutz.html",
  "handbuch.html",
  "handbook.html",
  "privacy.html",
  "manifest.webmanifest",
  "fonts/fonts.css",
  "fonts/BarlowSemiCondensed-500.woff2",
  "fonts/BarlowSemiCondensed-600.woff2",
  "fonts/BarlowSemiCondensed-700.woff2",
  "fonts/IBMPlexMono-400.woff2",
  "fonts/IBMPlexMono-500.woff2",
  "fonts/IBMPlexMono-600.woff2",
  "fonts/IBMPlexSans-400.woff2",
  "fonts/IBMPlexSans-500.woff2",
  "fonts/IBMPlexSans-600.woff2",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/icon.svg",
  "vendor/qrcode.js",
  "data/ammo.json",
  "data/bullets.json",
  "data/reticles.json",
  "data/targets.json",
  "data/voices/de-kerstin/achtung.m4a",
  "data/voices/de-kerstin/bereit.m4a",
  "data/voices/de-kerstin/ende.m4a",
  "data/voices/de-kerstin/fertig.m4a",
  "data/voices/de-kerstin/laden.m4a",
  "data/voices/de-kerstin/laden10.m4a",
  "data/voices/de-kerstin/laden15.m4a",
  "data/voices/de-kerstin/laden20.m4a",
  "data/voices/de-kerstin/laden4.m4a",
  "data/voices/de-kerstin/laden5.m4a",
  "data/voices/de-kerstin/stopp.m4a",
  "data/voices/de-thorsten/achtung.m4a",
  "data/voices/de-thorsten/bereit.m4a",
  "data/voices/de-thorsten/ende.m4a",
  "data/voices/de-thorsten/fertig.m4a",
  "data/voices/de-thorsten/laden.m4a",
  "data/voices/de-thorsten/laden10.m4a",
  "data/voices/de-thorsten/laden15.m4a",
  "data/voices/de-thorsten/laden20.m4a",
  "data/voices/de-thorsten/laden4.m4a",
  "data/voices/de-thorsten/laden5.m4a",
  "data/voices/de-thorsten/stopp.m4a",
  "data/voices/de-thorsten-energisch/achtung.m4a",
  "data/voices/de-thorsten-energisch/bereit.m4a",
  "data/voices/de-thorsten-energisch/ende.m4a",
  "data/voices/de-thorsten-energisch/fertig.m4a",
  "data/voices/de-thorsten-energisch/laden.m4a",
  "data/voices/de-thorsten-energisch/laden10.m4a",
  "data/voices/de-thorsten-energisch/laden15.m4a",
  "data/voices/de-thorsten-energisch/laden20.m4a",
  "data/voices/de-thorsten-energisch/laden4.m4a",
  "data/voices/de-thorsten-energisch/laden5.m4a",
  "data/voices/de-thorsten-energisch/stopp.m4a",
  "data/voices/de-thorsten-freundlich/achtung.m4a",
  "data/voices/de-thorsten-freundlich/bereit.m4a",
  "data/voices/de-thorsten-freundlich/ende.m4a",
  "data/voices/de-thorsten-freundlich/fertig.m4a",
  "data/voices/de-thorsten-freundlich/laden.m4a",
  "data/voices/de-thorsten-freundlich/laden10.m4a",
  "data/voices/de-thorsten-freundlich/laden15.m4a",
  "data/voices/de-thorsten-freundlich/laden20.m4a",
  "data/voices/de-thorsten-freundlich/laden4.m4a",
  "data/voices/de-thorsten-freundlich/laden5.m4a",
  "data/voices/de-thorsten-freundlich/stopp.m4a"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("flugbahn-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // Seitenaufrufe: zuerst Netz (für Updates), sonst Cache
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put("index.html", copy));
        return res;
      }).catch(() => caches.match("index.html", { ignoreSearch: true }))
    );
    return;
  }
  // Alles andere: Cache zuerst
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
