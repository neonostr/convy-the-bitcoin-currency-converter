
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Apply theme immediately before any rendering happens
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
  document.documentElement.classList.add(savedTheme);
}

// Create root and render immediately for faster perceived performance
const root = createRoot(document.getElementById("root")!)
root.render(<App />)

// Automatic silent update - no user notification needed
function silentUpdateHandler(sw: ServiceWorker) {
  // Automatically skip waiting and update in background
  sw.postMessage({ type: 'SKIP_WAITING' });
}

// Register SW using requestIdleCallback with even longer delay to prioritize UI rendering
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

      // Handle updates silently in background
      if (registration.waiting) {
        silentUpdateHandler(registration.waiting);
      }
      registration.addEventListener('updatefound', () => {
        const newSw = registration.installing;
        if (newSw) {
          newSw.addEventListener('statechange', () => {
            if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
              silentUpdateHandler(newSw);
            }
          });
        }
      });
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });

    // Listen for controllerchange (when new SW activates after skipWaiting)
    // Only reload if user explicitly requested an update
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New Service Worker controller activated');
      // Remove automatic reload to prevent unwanted page refreshes
    });
  }, 5000); // Extremely delayed registration to ensure UI is visible immediately
}
