
// Service Worker for Bitcoin Currency Converter - Ultra optimized for fast startup

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

// Ultra-optimized fetch strategy - prioritize cache for IMMEDIATE rendering
self.addEventListener('fetch', event => {
  // For HTML/app shell requests, use cache-first for instant rendering
  if (event.request.mode === 'navigate' || 
      event.request.url.endsWith('.html') || 
      event.request.url.endsWith('.js') || 
      event.request.url.endsWith('.css') || 
      event.request.url.includes('font')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Background fetch to update cache
            fetch(event.request).then(networkResponse => {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse);
              });
            }).catch(() => {/* Silently fail background fetch */});
            
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(networkResponse => {
              let responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
              return networkResponse;
            });
        })
    );
    return;
  }

  // For API requests, use network-first but don't block UI
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('coingecko') || 
      event.request.url.includes('supabase')) {
    
    // Don't wait for API responses, let them happen in background
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
              return networkResponse;
            })
            .catch(() => {
              if (cachedResponse) return cachedResponse;
              throw new Error('No network and no cache');
            });
          
          // Return cached response immediately if available
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // For all other requests, try cache first for fastest loading
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Background fetch to update cache without blocking
          fetch(event.request)
            .then(networkResponse => {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse);
              });
            })
            .catch(() => {/* Ignore errors in background fetch */});
          
          return cachedResponse;
        }

        // Not in cache, get from network
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse.ok && event.request.method === "GET") {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            }
            return networkResponse;
          });
      })
  );
});

// Listen for skipWaiting message from client
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
