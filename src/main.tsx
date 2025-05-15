
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Apply theme IMMEDIATELY before any rendering happens - this is critical for perceived performance
if (typeof window !== 'undefined') {
  // Use direct DOM manipulation for optimal speed
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.add(savedTheme);
}

// Create root and render IMMEDIATELY for fastest perceived performance
const root = createRoot(document.getElementById("root")!)
root.render(<App />)

// EXTREMELY delayed service worker registration - only after UI is visible
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    requestIdleCallback(() => {
      // Only register SW after page is fully loaded and idle
      setTimeout(() => {
        import('./services/toastUtils').then(module => {
          const showUpdateToast = module.showUpdateToast;
          
          navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('Service Worker registered (delayed for faster startup)');
            
            // Check for updates after a very long delay
            setTimeout(() => {
              registration.update();
            }, 15000); // Even longer delay for update check
            
            // Same event listeners as before
            navigator.serviceWorker.addEventListener('message', event => {
              if (event.data && event.data.type === 'SW_UPDATE') {
                const waitingSw = registration.waiting || registration.installing;
                if (waitingSw) {
                  showUpdateToast(waitingSw);
                }
              }
            });
            
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
          
          // Listen for controllerchange, then reload
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New Service Worker controller, reloading...');
            window.location.reload();
          });
        });
      }, 8000); // Extremely delayed registration
    }, { timeout: 5000 });
  });
}
