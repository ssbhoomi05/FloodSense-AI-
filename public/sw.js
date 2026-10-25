
/**
 * FloodSense AI 2.0 — Service Worker
 * Caches the application shell and supports offline fallbacks.
 */

const CACHE_NAME = 'floodsense-v2.1-cache';

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
  '/js/risk.js'
];

// Install: cache the application shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        ASSETS_TO_CACHE.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn(
              `[ServiceWorker] Could not cache ${url}:`,
              err.message
            );
          }
        })
      );
    })
  );

  self.skipWaiting();
});

// Activate: remove older caches owned by this app.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith('floodsense-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }

          return Promise.resolve(false);
        })
      )
    )
  );

  self.clients.claim();
});

// Fetch: use network-first for APIs and cache-first for app assets.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Do not intercept requests to other origins.
  if (url.origin !== self.location.origin) return;

  // API requests: prefer fresh server data.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);

          // Cache only successful responses.
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, response.clone());
          }

          return response;
        } catch (err) {
          const cached = await caches.match(event.request);

          if (cached) {
            return cached;
          }

          // Reports endpoint has a specific offline response.
          if (url.pathname === '/api/reports') {
            return new Response(
              JSON.stringify({
                offline: true,
                total: 0,
                reports: [],
                message:
                  'Offline mode: live community reports are unavailable.'
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          }

          return new Response(
            JSON.stringify({
              offline: true,
              message: 'This information is unavailable offline.'
            }),
            {
              status: 503,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
      })()
    );

    return;
  }

  // App assets: use cache first, then fetch from the server.
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);

      if (cached) {
        // Refresh the cache in the background.
        event.waitUntil(
          fetch(event.request)
            .then(async (response) => {
              if (response.ok) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, response.clone());
              }
            })
            .catch(() => {
              // Network may be unavailable.
            })
        );

        return cached;
      }

      try {
        const response = await fetch(event.request);

        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }

        return response;
      } catch (err) {
        if (event.request.mode === 'navigate') {
          const offlinePage = await caches.match('/index.html');

          if (offlinePage) return offlinePage;
        }

        return new Response('Content unavailable offline.', {
          status: 503,
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      }
    })()
  );
});
