import { CoinRates } from "@/types/currency.types";
import { getCachedRates } from "./cacheManager";

export function initializeServiceWorkerSync(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      if ('SyncManager' in window) {
        (registration as any).sync?.register('save-rates').catch((err: Error) => {
          console.error('Failed to register sync event:', err);
        });
      }
      
      window.addEventListener('beforeunload', () => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_RATES',
            payload: getCachedRates()
          });
        }
      });
    });
  }
}

// Update service worker cache
export function updateServiceWorkerCache(rates: CoinRates): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_RATES',
      payload: rates
    });
    console.log('Posted rates to service worker cache');
  }
}
