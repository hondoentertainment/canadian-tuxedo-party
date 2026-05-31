const CACHE = "ctp-v7";
const ASSETS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/config.js",
  "/js/main.js",
  "/js/qr.js",
  "/js/vote.js",
  "/assets/poster.webp",
  "/assets/poster-hero.jpg",
  "/assets/qr-code.png",
  "/assets/app-icon.png",
  "/gallery.html",
  "/js/gallery.js",
  "/js/slideshow.js",
  "/vote.html",
  "/host.html",
  "/poll-results.html",
  "/qr.html",
  "/numbers.html",
  "/slideshow.html",
  "/admin.html",
  "/poll.html",
  "/ice-breaker.html",
  "/name-that-canadian.html",
  "/manifest.json",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return (
        cached ||
        fetch(event.request).then(function (response) {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const copy = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(event.request, copy);
          });
          return response;
        })
      );
    })
  );
});
