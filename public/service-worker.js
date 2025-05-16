
// Service Worker for Bitcoin Currency Converter - Optimized for instant startup

const CACHE_NAME = 'bitcoin-converter-cache-v10';
const APP_VERSION = '1.3.3';

// Ultra-critical PWA assets - these must load instantly for PWA to appear
const ULTRA_CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/src/index.css',
  '/lovable-uploads/1312301f-1d52-44de-aef4-c630e8329bb4.png' // App icon
];

// Additional critical app resources
const CRITICAL_APP_SHELL = [
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/pages/Index.tsx',
  '/src/components/BitcoinConverter.tsx'
];

// Lower priority assets
const ADDITIONAL_ASSETS = [
  '/lovable-uploads/3ea16b8d-4ec7-4ac2-8195-8c5575377664.png',
  '/lovable-uploads/94f20957-5441-4a0d-a9c8-9f555a8c5f5f.png'
];

// Aggressive blocking installation strategy for ultra-fast PWA startup
self.addEventListener('install', event => {
  console.log('Service Worker installing with ultra-fast PWA startup optimization...');
  
  // Skip waiting immediately to activate as soon as possible
  self.skipWaiting();
  
  // Block installation until ultra-critical assets are cached
  event.waitUntil(
    Promise.all([
      // 1. Cache ultra-critical assets
      caches.open(CACHE_NAME + '-ultra').then(cache => {
        console.log('Caching ultra-critical PWA assets for instant startup');
        return cache.addAll(ULTRA_CRITICAL_ASSETS);
      }),
      
      // 2. Start caching critical shell assets in parallel
      caches.open(CACHE_NAME + '-critical').then(cache => {
        console.log('Caching critical app shell');
        return cache.addAll(CRITICAL_APP_SHELL);
      })
    ])
    .then(() => {
      console.log('Ultra-critical pre-caching complete');
      
      // Cache additional assets after activation
      setTimeout(() => {
        caches.open(CACHE_NAME).then(cache => {
          console.log('Caching additional assets in background');
          cache.addAll(ADDITIONAL_ASSETS);
        });
      }, 1000);
    })
  );
});

// Claim clients immediately on activation
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  console.log('Service worker activated and claiming all clients immediately');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName.startsWith('bitcoin-converter-cache-') && 
                  cacheName !== CACHE_NAME &&
                  cacheName !== CACHE_NAME + '-ultra' &&
                  cacheName !== CACHE_NAME + '-critical';
          })
          .map(cacheName => {
            console.log('Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Ultra-aggressive fetch strategy optimized for PWA instant launch
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Special handling for navigation requests in PWA mode
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(cachedResponse => {
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME + '-ultra').then(cache => {
                  cache.put('/index.html', networkResponse.clone());
                });
              }
              return networkResponse;
            })
            .catch(() => cachedResponse || new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            }));
          
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // For critical assets, use cache-first strategy
  if (ULTRA_CRITICAL_ASSETS.includes(url.pathname) || 
      CRITICAL_APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return cached response immediately
          if (cachedResponse) {
            // Update cache in background
            fetch(event.request)
              .then(networkResponse => {
                if (networkResponse.ok) {
                  caches.open(CACHE_NAME + '-ultra').then(cache => {
                    cache.put(event.request, networkResponse.clone());
                  });
                }
                return networkResponse;
              })
              .catch(() => {});
            
            return cachedResponse;
          }
          
          // Fallback to network if not cached yet
          return fetch(event.request);
        })
    );
    return;
  }

  // For API requests - network first, fallback to cache
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('coingecko')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If we don't have a cached API response, return cached rates
            if (event.request.url.includes('coingecko')) {
              return caches.match('bitcoin-rates-data');
            }
            
            return new Response(JSON.stringify({error: 'Network error'}), {
              headers: {'Content-Type': 'application/json'}
            });
          });
        })
    );
    return;
  }

  // For all other requests, use stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Clone the request because it's a stream
        const fetchPromise = fetch(event.request.clone())
          .then(networkResponse => {
            // Only cache valid responses
            if (networkResponse.ok && event.request.method === "GET") {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);
        
        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
  );
});

// Listen for skipWaiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Cache rates data for offline use
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

// Notify clients when update is available
self.addEventListener('activate', event => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({type: 'SW_UPDATE'});
    });
  });
});
