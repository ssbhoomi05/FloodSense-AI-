/**
 * FloodSense AI 2.0 — Service Worker
 * Provides offline caching for application shell, disaster safety guide,
 * and verified emergency contacts.
 */

const CACHE_NAME = 'floodsense-v2.0-cache';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/app.js',
  '/js/map.js',
  '/js/alerts.js',
  '/js/reports.js',
  '/js/contacts.js',
  '/js/guide.js',
  '/js/shelters.js',
  '/js/risk.js',
  '/api/status',
  '/api/contacts',
  '/api/alerts',
  '/api/shelters',
  '/api/risk-zones'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell & emergency resources');
      // Cache with error tolerance for dynamic endpoints
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[ServiceWorker] Failed to cache ${url}:`, err.message);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-first for dynamic API reports, falling back to cache if offline
  if (url.pathname.startsWith('/api/reports')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({
                offline: true,
                total: 0,
                reports: [],
                message: 'Operating in offline mode. Live community submissions require network connectivity.'
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Cache-first for static assets, network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background revalidate
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => { /* offline silent */ });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch((err) => {
        // Return offline fallback if navigating to an HTML page
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw err;
      });
    })
  );
});
