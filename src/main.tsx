
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root and render IMMEDIATELY for fastest perceived performance
const root = createRoot(document.getElementById("root")!)
root.render(<App />)

// Apply theme after render - still fast but doesn't block initial UI display
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.add(savedTheme);
}

// EXTREMELY delayed service worker registration - only after UI is visible
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        console.log('Service Worker registered (delayed for faster startup)');
        
        // Check for updates after a delay
        setTimeout(() => {
          registration.update();
        }, 5000);
        
        // Import toast utils only when needed
        import('./services/toastUtils').then(module => {
          const showUpdateToast = module.showUpdateToast;
          
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
        });
        
        // Listen for controllerchange, then reload
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('New Service Worker controller, reloading...');
          window.location.reload();
        });
      }).catch(error => {
        console.error('Service Worker registration failed:', error);
      });
    }, 1000);
  });
}
