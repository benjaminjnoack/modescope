// Service worker: keeps a copy of the whole app so it opens offline once it
// has been added to the home screen. Registered by js/offline.js.

// The deploy (.github/workflows/pages.yml) replaces "dev" with the commit, so
// each deploy changes this file, the browser installs the new worker, and it
// fetches every file again into a fresh cache.
const VERSION = "dev";
const CACHE = `modescope-${VERSION}`;

// Every file in public/ except this one. `npm run lint` fails if one is
// missing, since a missing file would only break once the phone is offline.
const FILES = [
  "./",
  "index.html",
  "styles.css",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "js/alternates.js",
  "js/drag.js",
  "js/explain.js",
  "js/fretboard.js",
  "js/guitar.js",
  "js/main.js",
  "js/music.js",
  "js/offline.js",
  "js/ring.js",
  "js/state.js",
  "js/svg.js",
  "js/theme.js",
  "js/tooltips.js",
];

self.addEventListener("install", (event) => {
  // "reload" skips the browser's HTTP cache (GitHub Pages lets files be
  // cached for 10 minutes), so a new version never stores stale files.
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES.map((file) => new Request(file, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  // Drop the caches of earlier versions.
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith("modescope-") && key !== CACHE).map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;

  // Opening the app (with or without a ?query) always gets the cached page.
  const key = request.mode === "navigate" ? "./" : request;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(key);
      if (cached) return cached;
      const response = await fetch(request);
      // A file the list forgot still works offline after one visit online.
      if (response.ok) cache.put(request, response.clone());
      return response;
    }),
  );
});
