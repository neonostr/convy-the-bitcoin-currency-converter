
// Service Worker for Bitcoin Currency Converter - Optimized for fast startup

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
  '/lovable-uploads/94f20957-5441-4a0d-a9c8-9f555a8c5f5f.png'
];

// Pre-cache essential assets during installation for faster startup
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and assets for fast startup');
        return cache.addAll(APP_URLS_TO_CACHE);
      })
      .then(() => {
        console.log('Pre-caching complete');
        self.skipWaiting(); // Activate new SW immediately
      })
  );
});

// Clear old caches and take control of clients immediately
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting outdated cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim().then(() => {
        console.log('Service Worker is now controlling all clients');
      })
    ])
  );
});

// Optimized fetch strategy - network first with cache fallback for API, 
// cache first with network fallback for static assets
self.addEventListener('fetch', event => {
  // For navigation requests (HTML pages), use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          console.log('Navigation request served from network');
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          console.log('Navigation request falling back to cache');
          return caches.match('/');
        })
    );
    return;
  }

  // For API requests
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('coingecko') || 
      event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For all other requests, try cache first for fastest loading
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('Resource served from cache:', event.request.url);
          // Fetch in background to update cache for next time
          fetch(event.request)
            .then(networkResponse => {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse);
                console.log('Updated cache for:', event.request.url);
              });
            })
            .catch(err => console.log('Background fetch failed:', err));
          
          return cachedResponse;
        }

        // Not in cache, get from network
        return fetch(event.request)
          .then(networkResponse => {
            // Clone the response before using it
            const clonedResponse = networkResponse.clone();
            
            // Cache valid responses
            if (networkResponse.ok && event.request.method === "GET") {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clonedResponse);
                console.log('Cached new resource:', event.request.url);
              });
            }
            
            return networkResponse;
          });
      })
  );
});

// Listen for skipWaiting message from client (for update prompt)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Improved rates caching
  if (event.data && event.data.type === 'CACHE_RATES') {
    const ratesData = event.data.payload;
    caches.open(CACHE_NAME).then(cache => {
      const ratesBlob = new Blob([JSON.stringify(ratesData)], { type: 'application/json' });
      const ratesResponse = new Response(ratesBlob);
      cache.put('bitcoin-rates-data', ratesResponse);
      console.log('Bitcoin rates cached for offline use');
    });
  }
});

// When update is available, notify all clients
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
