// Service Worker for Bitcoin Currency Converter

const CACHE_NAME = 'bitcoin-converter-cache-v3';
const APP_URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/manifest.json',
  '/lovable-uploads/1312301f-1d52-44de-aef4-c630e8329bb4.png',
  '/lovable-uploads/97fd222f-9245-4a69-a4cc-ebe26eb4076e.png'
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(APP_URLS_TO_CACHE);
      })
  );
  // Activate immediately and take control of clients
  self.skipWaiting();
});

// Cache and return requests with improved offline fallback
self.addEventListener('fetch', event => {
  // For API requests that might fail, use a network-first strategy
  if (event.request.url.includes('api.coingecko.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          // If network request fails, try to return cached API response
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For navigation requests (HTML pages), use a cache-first strategy with network fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Otherwise try network, and cache the result
          return fetch(event.request)
            .then(response => {
              // Don't cache non-success responses
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone the response for caching
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(() => {
              // If all fails, return the cached home page as fallback
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // For all other requests, try cache first with network fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise try network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-success responses
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // Return null to indicate network error
            return null;
          });
      })
  );
});

// Listen for messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_RATES') {
    const ratesData = event.data.payload;
    
    // Store the rates data in the cache with a custom URL
    caches.open(CACHE_NAME).then(cache => {
      const ratesBlob = new Blob([JSON.stringify(ratesData)], { type: 'application/json' });
      const ratesResponse = new Response(ratesBlob);
      cache.put('bitcoin-rates-data', ratesResponse);
      console.log('Cached rates data:', ratesData);
    });
  }
});

// Update service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Listen for the beforeunload event to save the current state
self.addEventListener('sync', event => {
  if (event.tag === 'save-rates') {
    // This will be triggered when online
    console.log('Sync event triggered, will update rates when online');
  }
});
