/* Flugbahn Service Worker: legt alle App-Dateien beim Installieren ab und liefert sie offline aus. */
const CACHE = "flugbahn-c3a99fe944";
const VOICES = "flugbahn-voices-a81f12b0";   // Sprachaufnahmen: bleiben über Updates erhalten, werden bei Bedarf geladen
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
  "data/targets.json"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("flugbahn-") && k !== CACHE && k !== VOICES).map(k => caches.delete(k))))
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
  // Sprachaufnahmen: aus dem Stimmen-Cache, sonst laden und dort ablegen
  if (new URL(req.url).pathname.includes("/data/voices/")) {
    e.respondWith(caches.open(VOICES).then(c => c.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  // Alles andere: Cache zuerst
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
