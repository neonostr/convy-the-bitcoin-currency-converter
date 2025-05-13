
// Service Worker for Bitcoin Currency Converter, improved for instant loading
const CACHE_NAME = 'bitcoin-converter-cache-v5';
const APP_VERSION = '1.2.0';
const APP_URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/manifest.json',
  '/lovable-uploads/3ea16b8d-4ec7-4ac2-8195-8c5575377664.png',
  '/lovable-uploads/94f20957-5441-4a0d-a9c8-9f555a8c5f5f.png',
  '/lovable-uploads/1312301f-1d52-44de-aef4-c630e8329bb4.png',
  '/lovable-uploads/46cf07ac-a8fe-4f54-a73e-b62492896398.png'
];

// Critical assets that should be cached with highest priority
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install the SW and cache critical resources immediately
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Cache critical assets first for faster startup
      await cache.addAll(CRITICAL_ASSETS);
      
      // Then cache other assets
      await cache.addAll(APP_URLS_TO_CACHE.filter(url => !CRITICAL_ASSETS.includes(url)));
      
      // Activate immediately
      await self.skipWaiting();
    })()
  );
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
      // Take control immediately
      self.clients.claim()
    ])
  );
});

// Enhanced caching and fetch strategy with network-first for API calls and cache-first for static assets
self.addEventListener('fetch', event => {
  // For navigation requests (page loads), try cache first, then network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try cache first for instant loading
          const cachedResponse = await caches.match('/');
          if (cachedResponse) return cachedResponse;
          
          // If not in cache, try network
          return await fetch(event.request);
        } catch (error) {
          // If offline and not in cache, show cached home page
          return caches.match('/');
        }
      })()
    );
    return;
  }
  
  // For API requests
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('coingecko') || 
      event.request.url.includes('cryptocompare')) {
    event.respondWith(
      (async () => {
        try {
          // Try network first for fresh data
          const networkResponse = await fetch(event.request);
          // Clone and cache the response
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        } catch (error) {
          // If offline, try cached response
          return caches.match(event.request);
        }
      })()
    );
    return;
  }
  
  // For static assets, use cache-first strategy for performance
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return from cache if available
          if (response) {
            return response;
          }
          
          // If not in cache, fetch from network and cache the result
          return fetch(event.request)
            .then(networkResponse => {
              // Only cache successful responses
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseToCache);
                });
              }
              return networkResponse;
            });
        })
    );
  }
});

// Cache Bitcoin rates data
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

// When update is available, notify clients
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
