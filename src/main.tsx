
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize app as quickly as possible
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Toast: show update banner when SW says "update available"
function showUpdateToast(sw: ServiceWorker) {
  // We're using shadcn/toast system for notification
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

// Register SW after app is rendered for better startup performance
if ('serviceWorker' in navigator) {
  // Use requestIdleCallback to defer non-critical work
  (window.requestIdleCallback || setTimeout)(() => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      // Update service worker in the background
      (window.requestIdleCallback || setTimeout)(() => {
        registration.update();
      }, 5000); // Check for updates after 5 seconds

      // Listen for SW message about new update
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'SW_UPDATE') {
          const waitingSw = registration.waiting || registration.installing;
          if (waitingSw) {
            showUpdateToast(waitingSw);
          }
        }
      });

      // Show update toast if needed
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
    });

    // Listen for controllerchange, then reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, { timeout: 1000 });
}
