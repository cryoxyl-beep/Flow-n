const CACHE_NAME = 'aetheris-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle fetches normally, caching static assets where supported
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
