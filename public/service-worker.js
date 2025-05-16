// Service Worker for Bitcoin Currency Converter - Optimized for instant startup

const CACHE_NAME = 'bitcoin-converter-cache-v8';
const APP_VERSION = '1.3.1';

// Most critical resources - these must load instantly for PWA launch screen
const CRITICAL_PWA_ASSETS = [
  '/',
  '/index.html'
];

// Critical app shell resources - these MUST load instantly for PWA
const CRITICAL_APP_SHELL = [
  '/src/index.css',
  '/lovable-uploads/1312301f-1d52-44de-aef4-c630e8329bb4.png' // App icon
];

// Additional app shell resources - still important but secondary priority
const APP_SHELL_URLS = [
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx'
];

// Additional assets to cache but with lower priority
const ADDITIONAL_URLS = [
  '/lovable-uploads/3ea16b8d-4ec7-4ac2-8195-8c5575377664.png',
  '/lovable-uploads/94f20957-5441-4a0d-a9c8-9f555a8c5f5f.png'
];

// Maximum-aggressive pre-cache strategy for PWA launch screen
self.addEventListener('install', event => {
  console.log('Service Worker installing with ultra-fast startup optimization...');
  
  // Split caching into immediate (blocking) and background operations
  event.waitUntil(
    Promise.all([
      // 1. Ultra-critical PWA assets - MUST complete before SW activates
      caches.open(CACHE_NAME + '-pwa-launch').then(cache => {
        console.log('Caching PWA launch assets for instant startup');
        return cache.addAll(CRITICAL_PWA_ASSETS);
      }),
      
      // 2. Critical resources - still high priority but can be fetched in parallel
      caches.open(CACHE_NAME + '-critical').then(cache => {
        console.log('Caching critical resources for instant startup');
        // Don't block activation on this, but start it immediately
        cache.addAll(CRITICAL_APP_SHELL);
      }),
      
      // 3. App shell - important but not blocking
      caches.open(CACHE_NAME + '-shell').then(cache => {
        console.log('Caching app shell for quick startup');
        // Background task - don't even await
        setTimeout(() => {
          cache.addAll(APP_SHELL_URLS);
        }, 100);
      }),
      
      // 4. Additional assets - lowest priority
      new Promise(resolve => {
        setTimeout(() => {
          caches.open(CACHE_NAME).then(cache => {
            console.log('Caching additional assets in background');
            cache.addAll(ADDITIONAL_URLS);
          });
          resolve();
        }, 300); // Even more delayed
      })
    ])
    .then(() => {
      console.log('Critical pre-caching complete - activating immediately');
      self.skipWaiting(); // Activate new SW immediately
    })
  );
});

// Ultra-aggressive fetch strategy with immediate index.html response
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // For PWA launch screen (root path or index.html), use maximum-aggressive strategy
  if (event.request.mode === 'navigate' ||
      url.pathname === '/' || 
      url.pathname === '/index.html') {
    
    event.respondWith(
      caches.match('/index.html')
        .then(cachedResponse => {
          if (cachedResponse) {
            // Always return cached index.html immediately for instant startup
            // Network fetch happens in background to update cache
            fetch(event.request).then(networkResponse => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME + '-pwa-launch').then(cache => {
                  cache.put('/index.html', networkResponse);
                });
              }
            }).catch(() => {});
            
            return cachedResponse;
          }
          
          // Fallback to network if not cached yet (first load)
          return fetch(event.request);
        })
    );
    return;
  }

  // For all other requests, use the existing strategy
  const url2 = new URL(event.request.url);
  
  // For critical resources like index.html in PWA mode, use cache-only
  if (CRITICAL_APP_SHELL.some(path => url2.pathname === path || 
      (path === '/' && url2.pathname === '/') ||
      (path === '/index.html' && url2.pathname === '/'))) {
    
    // PWA mode needs absolute immediate cache response
    if (event.request.mode === 'navigate' && 
        event.request.headers.get('Accept')?.includes('text/html')) {
      
      event.respondWith(
        caches.open(CACHE_NAME + '-critical')
          .then(cache => cache.match('/index.html') || cache.match('/'))
          .then(response => {
            // If we have a cached response, use it immediately
            if (response) return response;
            
            // If no cached response (first load), fetch from network
            return fetch(event.request).catch(() => {
              return caches.open(CACHE_NAME + '-shell')
                .then(shellCache => shellCache.match('/index.html') || shellCache.match('/'));
            });
          })
      );
      return;
    }
  }

  // For navigation requests (HTML pages), use cache-first for instant loading
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME + '-shell').then(cache => 
        cache.match('/').then(response => {
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
            .catch(() => response || caches.match('/'));
          
          // Return cached response immediately for instant loading
          return response || fetchPromise;
        })
      )
    );
    return;
  }

  // For API requests - network first, fallback to cache
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('coingecko') || 
      event.request.url.includes('supabase')) {
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

  // For all other requests (assets, scripts, etc), use stale-while-revalidate
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Clone the request because it's a stream that can only be consumed once
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
          .catch(error => {
            console.error('Fetch failed:', error);
            // If network fetch fails, return the cached response as is
            return cachedResponse;
          });
        
        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
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
