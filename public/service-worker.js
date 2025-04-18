// Service Worker for Bitcoin Currency Converter
const CACHE_NAME = 'bitcoin-converter-cache-v3';
const APP_VERSION = '1.1.0'; // Increment this when publishing updates
const APP_URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx'
];

// Function to notify all clients about updates
const notifyClientsAboutUpdate = async () => {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'UPDATE_AVAILABLE'
    });
  });
};

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(APP_URLS_TO_CACHE);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Add version check for HTML requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If we get a valid response, check if it's a new version
          if (response.headers.get('x-app-version') !== APP_VERSION) {
            notifyClientsAboutUpdate();
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other requests, use standard cache strategy
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          const fetchRequest = event.request.clone();
          
          return fetch(fetchRequest).then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Don't cache API calls to external services except rate data
            if (!event.request.url.includes('api.coingecko.com')) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          }).catch(() => {
            // Offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return null;
          });
        })
    );
  }
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
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Listen for the beforeunload event to save the current state
self.addEventListener('sync', event => {
  if (event.tag === 'save-rates') {
    // This will be triggered when online
    console.log('Sync event triggered, will update rates when online');
  }
});
