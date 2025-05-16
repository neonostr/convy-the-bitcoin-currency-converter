
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check if running as PWA
const isPWA = window.matchMedia('(display-mode: standalone)').matches;

// For PWA, minimize initialization to prioritize UI rendering
if (!isPWA && typeof window !== 'undefined') {
  // Only do this theme check for browser mode, PWA uses default dark
  const savedTheme = localStorage.getItem('theme') || 'dark'; 
  document.documentElement.classList.add(savedTheme);
} else if (isPWA) {
  // In PWA mode, ensure dark theme is applied instantly
  document.documentElement.classList.add('dark');
}

// Create root and render immediately for faster perceived performance
const root = createRoot(document.getElementById("root")!)
root.render(<App />)

// For PWA, use a much longer delay for non-critical features to ensure UI is fully rendered first
const initDelay = isPWA ? 5000 : 3000;

// Only initialize non-critical features after UI is rendered
setTimeout(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Even longer delay for update checks in PWA mode
      const updateCheckDelay = isPWA ? 10000 : 5000;
      
      // Check for updates after page is fully loaded and idle
      window.addEventListener('load', () => {
        setTimeout(() => {
          registration.update();
          console.log('Checking for Service Worker updates...');
        }, updateCheckDelay);
      });

      // Toast: show update banner when SW says "update available"
      function showUpdateToast(sw) {
        // We're using shadcn/toast system for notification
        const id = 'pwa-update-banner';
        if (document.getElementById(id)) return; // Prevent duplicates

        // Use shadcn toast if possible, else fallback to a div
        if (window && (window).showToast) {
          (window).showToast({
            title: "Update verfügbar!",
            description: "Eine neue Version von Convy ist da. Klicke zum Aktualisieren.",
            action: {
              label: "Neu laden",
              onClick: () => {
                sw.postMessage({ type: 'SKIP_WAITING' });
              }
            }
          });
          return;
        }

        // Fallback: simple banner
        const banner = document.createElement('div');
        banner.id = id;
        banner.style.position = 'fixed';
        banner.style.bottom = '0';
        banner.style.left = '0';
        banner.style.right = '0';
        banner.style.background = '#FFD600';
        banner.style.color = '#222';
        banner.style.textAlign = 'center';
        banner.style.zIndex = '9999';
        banner.style.padding = '1em';
        banner.style.fontSize = '1rem';
        banner.style.boxShadow = '0 -2px 8px rgba(0,0,0,0.15)';
        banner.innerHTML = `Neue Version verfügbar. <button style="margin-left: 1em;padding:0.25em 0.75em;border-radius:0.3em;border:none;background:#222;color:#FFD600;cursor:pointer;">Neu laden</button>`;
        banner.querySelector('button')?.addEventListener('click', () => {
          sw.postMessage({ type: 'SKIP_WAITING' });
          banner.remove();
        });
        document.body.appendChild(banner);
      }

      // Listen for SW message about new update
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'SW_UPDATE') {
          // Show update toast/banner, pass waiting SW if possible
          const waitingSw = registration.waiting || registration.installing;
          if (waitingSw) {
            showUpdateToast(waitingSw);
          }
        }
      });

      // Listen for new SW activation and reload
      if (registration.waiting) {
        showUpdateToast(registration.waiting);
      }
      registration.addEventListener('updatefound', () => {
        const newSw = registration.installing;
        if (newSw) {
          newSw.addEventListener('statechange', () => {
            if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast(newSw);
            }
          });
        }
      });
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });

    // Listen for controllerchange (when new SW activates after skipWaiting), then reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New Service Worker controller, reloading for fresh content...');
      window.location.reload();
    });
  }
}, initDelay); // Extra delayed registration for PWA

// Initialize service worker sync in a non-blocking way - much later for PWA
if (typeof window !== 'undefined') {
  // Defer the service worker initialization to after rendering
  setTimeout(() => {
    import("@/services/ratesService").then(module => {
      module.initializeServiceWorkerSync();
    });
  }, isPWA ? 8000 : 3000); // Much longer delay for PWA
}
