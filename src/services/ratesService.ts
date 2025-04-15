import { CoinRates, Currency } from "@/types/currency.types";

// Cache settings
export const CACHE_EXPIRY_TIME = 60000; // 60 seconds in milliseconds

// Try to load rates from localStorage on startup
const loadRatesFromStorage = (): CoinRates => {
  try {
    const storedRates = localStorage.getItem('bitcoin-converter-rates');
    if (storedRates) {
      const parsedRates = JSON.parse(storedRates);
      // Convert the string date back to a Date object
      parsedRates.lastUpdated = new Date(parsedRates.lastUpdated);
      console.log('Loaded rates from localStorage, last updated:', parsedRates.lastUpdated);
      return parsedRates;
    }
  } catch (error) {
    console.error('Failed to load rates from localStorage:', error);
  }
  return { ...DEFAULT_INITIAL_RATES };
};

// Default initial market rates as fallback (will be dynamically updated)
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
  lastUpdated: new Date()
};

// Mutable variable to store current rates
export let initialRates: CoinRates = { ...DEFAULT_INITIAL_RATES };

// Cache state
let cachedRates: CoinRates = loadRatesFromStorage();
let lastFetchTime: number = parseInt(localStorage.getItem('bitcoin-converter-last-fetch-time') || '0', 10);
let isFetchingData: boolean = false;
let fetchPromise: Promise<CoinRates> | null = null;

// After initializing cachedRates, update initialRates if needed
if (cachedRates.lastUpdated) {
  // If cached rates exist, update initialRates
  initialRates = { ...cachedRates };
  console.log('Loaded rates from storage:', initialRates);
}

export function getCachedRates(): CoinRates {
  return { ...cachedRates };
}

export function updateCachedRates(rates: CoinRates): void {
  cachedRates = { ...rates };
  lastFetchTime = Date.now();
  
  // Save last fetch time for cross-tab coordination
  localStorage.setItem('bitcoin-converter-last-fetch-time', lastFetchTime.toString());
  console.log('Updated lastFetchTime in localStorage:', lastFetchTime);
  
  // Save to localStorage for offline access
  try {
    localStorage.setItem('bitcoin-converter-rates', JSON.stringify(rates));
    console.log('Saved rates to localStorage');
  } catch (error) {
    console.error('Failed to save rates to localStorage:', error);
  }
  
  // Also save to the service worker cache if available
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_RATES',
      payload: rates
    });
    console.log('Posted rates to service worker cache');
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
  // Check if we have cached rates
  if (!cachedRates || !cachedRates.lastUpdated) {
    console.log('Cache is stale: No cached rates available');
    return true;
  }
  
  // Check local memory cache first
  const now = Date.now();
  const cachedLastFetchTime = lastFetchTime;
  
  if (now - cachedLastFetchTime < CACHE_EXPIRY_TIME) {
    console.log(`Cache is fresh: Last fetch was ${(now - cachedLastFetchTime)/1000}s ago (< 60s)`);
    return false;
  }
  
  // Also check localStorage in case another tab updated the rates
  const storedLastFetchTime = parseInt(localStorage.getItem('bitcoin-converter-last-fetch-time') || '0', 10);
  const isFresh = now - storedLastFetchTime < CACHE_EXPIRY_TIME;
  
  console.log(`Cache status from localStorage: Last fetch was ${(now - storedLastFetchTime)/1000}s ago, is fresh: ${isFresh}`);
  return !isFresh;
}

export function setFetchingState(state: boolean, promise: Promise<CoinRates> | null = null): void {
  isFetchingData = state;
  fetchPromise = promise;
  console.log('Set fetching state:', state);
}

export function isFetching(): boolean {
  return isFetchingData;
}

export function getActiveFetchPromise(): Promise<CoinRates> | null {
  return fetchPromise;
}

export function getLastFetchTime(): number {
  // Check both local memory and localStorage
  const storedLastFetchTime = parseInt(localStorage.getItem('bitcoin-converter-last-fetch-time') || '0', 10);
  const latestTime = Math.max(lastFetchTime, storedLastFetchTime);
  console.log(`Latest fetch time is ${new Date(latestTime).toISOString()}, ${(Date.now() - latestTime)/1000}s ago`);
  return latestTime;
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
    rub: amountInBtc * rates.rub
  };
}

// Initialize service worker data synchronization
export function initializeServiceWorkerSync(): void {
  if ('serviceWorker' in navigator) {
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
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_RATES',
            payload: cachedRates
          });
        }
      });
    });
  }
}
