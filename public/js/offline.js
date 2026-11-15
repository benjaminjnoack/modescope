// Lets the app open without a connection once it's on the home screen, by
// registering the service worker (sw.js), which keeps a copy of every file.
//
// Only over HTTPS, as on the live site. Service workers need a secure origin,
// so a phone on http://<this machine's IP>:3000 couldn't use one anyway, and
// this way the dev server's live reload never fights a cache. To try it on
// localhost, open http://localhost:3000/?sw (and unregister it afterwards).
export function initOffline() {
  const wanted = location.protocol === "https:" || new URLSearchParams(location.search).has("sw");
  if (!wanted || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch(() => {
    // The page still works online; it just won't open offline.
  });
}
