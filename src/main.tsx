
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root before SW registration to speed up initial render
const root = createRoot(document.getElementById("root")!)
root.render(<App />)

// Toast: show update banner when SW says "update available"
function showUpdateToast(sw: ServiceWorker) {
  // We're using shadcn/toast system for notification
  // For a simple solution, append a banner div -- but best is to use your toast infra
  // We'll use window.dispatchEvent for a minimal reference implementation
  const id = 'pwa-update-banner';
  if (document.getElementById(id)) return; // Prevent duplicates

  // Use shadcn toast if possible, else fallback to a div
  if (window && (window as any).showToast) {
    (window as any).showToast({
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

// Register SW using requestIdleCallback to not block main thread
// This will improve initial load time while still ensuring SW is registered
if ('serviceWorker' in navigator) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => registerServiceWorker(), { timeout: 3000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(registerServiceWorker, 1000);
  }
}

function registerServiceWorker() {
  navigator.serviceWorker.register('/service-worker.js').then(registration => {
    console.log('Service Worker registered with scope:', registration.scope);
    
    // Check for updates after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        registration.update();
        console.log('Checking for Service Worker updates...');
      }, 3000); // Delay update check to improve initial performance
    });

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
