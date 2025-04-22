
// Service Worker for Bitcoin Currency Converter, improved for instant update & banner UI

const CACHE_NAME = 'bitcoin-converter-cache-v4';
const APP_VERSION = '1.1.0';
const APP_URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx'
];

// Install the SW and activate it immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_URLS_TO_CACHE);
      })
  );
  // Activate the new SW immediately
  self.skipWaiting();
});

// Claim all clients right away for instant activation
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Standard caching and fetch strategy
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => caches.match('/'))
    );
    return;
  }
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(networkResponse => {
              // Optionally cache the result
              if (networkResponse && event.request.method === "GET") {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return networkResponse;
            });
        })
    );
  }
});

// LISTEN for skipWaiting message from client (for update prompt)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_RATES') {
    const ratesData = event.data.payload;
    caches.open(CACHE_NAME).then(cache => {
      const ratesBlob = new Blob([JSON.stringify(ratesData)], { type: 'application/json' });
      const ratesResponse = new Response(ratesBlob);
      cache.put('bitcoin-rates-data', ratesResponse);
    });
  }
});

// When update is available, tell all clients
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    self.clients.matchAll({type: "window"}).then(clients => {
      clients.forEach(client => {
        client.postMessage({type: 'SW_UPDATE'});
      });
    })
  );
});

