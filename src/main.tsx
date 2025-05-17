
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { toast } from "sonner"

// Polyfill for requestIdleCallback for browsers that don't support it
const requestIdleCallbackPolyfill = (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
  const timeout = options?.timeout || 1;
  return setTimeout(() => {
    const start = Date.now();
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, timeout);
};

// Use the polyfill or native implementation
const idle = window.requestIdleCallback || requestIdleCallbackPolyfill;
const cancelIdle = window.cancelIdleCallback || clearTimeout;

// Apply theme immediately before any rendering happens
// This happens in the main entry point to ensure it's the first thing that happens
if (typeof window !== 'undefined') {
  // Mark body as loading to prevent transitions during initial render
  document.body.classList.add('app-loading');
  
  // Apply saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.classList.add(savedTheme);
  
  // Add inline style for instant background color
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const bgColor = savedTheme === 'dark' ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)';
  const textColor = savedTheme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(240 10% 3.9%)';
  
  // Force immediate background color
  document.documentElement.style.backgroundColor = bgColor;
  document.documentElement.style.color = textColor;
  document.body.style.backgroundColor = bgColor;
  document.body.style.color = textColor;
  
  // Force any main container to be visible immediately
  const root = document.getElementById("root");
  if (root) {
    root.style.display = 'flex';
    root.style.flex = '1';
    root.style.backgroundColor = bgColor;
    root.style.color = textColor;
  }
  
  // Remove loading class after a short delay
  setTimeout(() => {
    document.body.classList.remove('app-loading');
  }, 300);
}

// Create root and render immediately for faster perceived performance
const root = createRoot(document.getElementById("root")!)
root.render(<App />)

// Toast: show update banner when SW says "update available"
function showUpdateToast(sw: ServiceWorker) {
  // We're using the sonner toast system for notification
  toast("Update verfügbar!", {
    description: "Eine neue Version von Convy ist da. Klicke zum Aktualisieren.",
    action: {
      label: "Neu laden",
      onClick: () => {
        sw.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  });
}

// Register SW using our polyfill with longer delay to prioritize UI rendering
if ('serviceWorker' in navigator) {
  // Delay service worker registration even further for immediate UI rendering
  setTimeout(() => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Check for updates after page is fully loaded and idle
      window.addEventListener('load', () => {
        setTimeout(() => {
          registration.update();
          console.log('Checking for Service Worker updates...');
        }, 10000); // Even longer delay for update check to prioritize UI rendering
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
  }, 5000); // Extremely delayed registration to ensure UI is visible immediately
}
