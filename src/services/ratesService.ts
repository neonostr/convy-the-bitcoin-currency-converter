
import { CoinRates, Currency } from "@/types/currency.types";

// Cache settings - shorter expiry for faster updates when needed
export const CACHE_EXPIRY_TIME = 60000; // 60 seconds in milliseconds

// Initialize with empty values that will be quickly populated from localStorage
export const DEFAULT_INITIAL_RATES: CoinRates = {
  btc: 1,
  sats: 100000000, // 1 BTC = 100,000,000 satoshis
  usd: 0,
  eur: 0,
  chf: 0,
  cny: 0,
  jpy: 0,
  gbp: 0,
  aud: 0,
  cad: 0,
  inr: 0,
  rub: 0,
  sek: 0,
  nzd: 0,
  krw: 0,
  sgd: 0,
  nok: 0,
  mxn: 0,
  brl: 0, 
  hkd: 0,
  try: 0,
  lastUpdated: new Date()
};

// Try to load rates from localStorage on startup - do this very early for fast access
const loadRatesFromStorage = (): CoinRates => {
  console.time('loadRatesFromStorage');
  try {
    const storedRates = localStorage.getItem('bitcoin-converter-rates');
    if (storedRates) {
      const parsedRates = JSON.parse(storedRates);
      // Convert the string date back to a Date object
      parsedRates.lastUpdated = new Date(parsedRates.lastUpdated);
      console.timeEnd('loadRatesFromStorage');
      return parsedRates;
    }
  } catch (error) {
    console.error('Failed to load rates from localStorage:', error);
  }
  console.timeEnd('loadRatesFromStorage');
  return { ...DEFAULT_INITIAL_RATES };
};

// Try to load from Service Worker cache as well - can be faster than localStorage in some browsers
const loadRatesFromSWCache = async (): Promise<CoinRates | null> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('bitcoin-converter-cache-v5');
      const response = await cache.match('bitcoin-rates-data');
      if (response) {
        const data = await response.json();
        data.lastUpdated = new Date(data.lastUpdated);
        return data;
      }
    } catch (error) {
      console.error('Failed to load rates from SW cache:', error);
    }
  }
  return null;
};

// Mutable variable to store current rates
export let initialRates: CoinRates = { ...DEFAULT_INITIAL_RATES };

// Cache state
let cachedRates: CoinRates = loadRatesFromStorage();
let lastFetchTime: number = 0;
let isFetchingData: boolean = false;
let fetchPromise: Promise<CoinRates> | null = null;

// After initializing cachedRates, update initialRates if needed
if (cachedRates.lastUpdated) {
  // If cached rates exist, update initialRates
  initialRates = { ...cachedRates };
  console.log('Loaded rates from storage:', initialRates);
  
  // Prime the SW cache with localStorage data for even faster future access
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_RATES',
      payload: cachedRates
    });
  }
}

// Also try to load from SW cache for potential faster access (async, non-blocking)
(async () => {
  const swCacheRates = await loadRatesFromSWCache();
  if (swCacheRates && swCacheRates.lastUpdated) {
    const swCacheDate = new Date(swCacheRates.lastUpdated).getTime();
    const currentCacheDate = new Date(cachedRates.lastUpdated).getTime();
    
    // Use whichever is newer
    if (swCacheDate > currentCacheDate) {
      cachedRates = { ...swCacheRates };
      initialRates = { ...swCacheRates };
      console.log('Updated rates from SW cache (newer than localStorage)');
    }
  }
})();

export function getCachedRates(): CoinRates {
  return { ...cachedRates };
}

export function updateCachedRates(rates: CoinRates): void {
  cachedRates = { ...rates };
  lastFetchTime = Date.now();
  
  // Save to localStorage for offline access
  try {
    localStorage.setItem('bitcoin-converter-rates', JSON.stringify(rates));
  } catch (error) {
    console.error('Failed to save rates to localStorage:', error);
  }
  
  // Also save to the service worker cache if available
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_RATES',
      payload: rates
    });
  }
}

// Update the initialRates with fresh data
export function updateInitialRates(rates: CoinRates): void {
  initialRates = { ...rates };
  console.log('Updated initialRates with fresh data:', initialRates);
}

export function resetInitialRates(): void {
  initialRates = { ...DEFAULT_INITIAL_RATES };
}

export function isCacheStale(): boolean {
  return Date.now() - lastFetchTime >= CACHE_EXPIRY_TIME;
}

export function setFetchingState(state: boolean, promise: Promise<CoinRates> | null = null): void {
  isFetchingData = state;
  fetchPromise = promise;
}

export function isFetching(): boolean {
  return isFetchingData;
}

export function getActiveFetchPromise(): Promise<CoinRates> | null {
  return fetchPromise;
}

export function getLastFetchTime(): number {
  return lastFetchTime;
}

export function convertCurrency(amount: number, fromCurrency: Currency, rates: CoinRates): Record<string, number> {
  // Convert to BTC first
  let amountInBtc = 0;
  
  switch (fromCurrency) {
    case 'btc':
      amountInBtc = amount;
      break;
    case 'sats':
      amountInBtc = amount / rates.sats;
      break;
    default:
      // For all other currencies, divide by their BTC rate
      if (rates[fromCurrency] && rates[fromCurrency] > 0) {
        amountInBtc = amount / rates[fromCurrency];
      }
      break;
  }
  
  // Now convert from BTC to all other currencies
  return {
    btc: amountInBtc,
    sats: amountInBtc * rates.sats,
    usd: amountInBtc * rates.usd,
    eur: amountInBtc * rates.eur,
    chf: amountInBtc * rates.chf,
    cny: amountInBtc * rates.cny,
    jpy: amountInBtc * rates.jpy,
    gbp: amountInBtc * rates.gbp,
    aud: amountInBtc * rates.aud,
    cad: amountInBtc * rates.cad,
    inr: amountInBtc * rates.inr,
    rub: amountInBtc * rates.rub,
    sek: amountInBtc * rates.sek,
    nzd: amountInBtc * rates.nzd,
    krw: amountInBtc * rates.krw,
    sgd: amountInBtc * rates.sgd,
    nok: amountInBtc * rates.nok,
    mxn: amountInBtc * rates.mxn,
    brl: amountInBtc * rates.brl,
    hkd: amountInBtc * rates.hkd,
    try: amountInBtc * rates.try
  };
}

// Initialize service worker data synchronization - improved for better performance
export function initializeServiceWorkerSync(): void {
  if ('serviceWorker' in navigator) {
    // Use a non-blocking approach to not slow down startup
    setTimeout(() => {
      navigator.serviceWorker.ready.then(registration => {
        // Check if the SyncManager is supported before trying to use it
        if ('SyncManager' in window) {
          // Use type assertion to handle potential undefined sync property
          (registration as any).sync?.register('save-rates').catch((err: Error) => {
            console.error('Failed to register sync event:', err);
          });
        }
        
        // Send current rates to service worker when page is about to unload
        window.addEventListener('beforeunload', () => {
          if (navigator.serviceWorker.controller && cachedRates) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CACHE_RATES',
              payload: cachedRates
            });
          }
        });
        
        // Also periodically sync rates to the SW cache for better offline experience
        setInterval(() => {
          if (navigator.serviceWorker.controller && cachedRates) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CACHE_RATES',
              payload: cachedRates
            });
          }
        }, 60000); // Every minute
      });
    }, 2000); // Delay initialization to not block main thread
  }
}
