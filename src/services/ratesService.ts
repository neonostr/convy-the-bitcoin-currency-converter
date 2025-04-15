
import { CoinRates, Currency } from "@/types/currency.types";

// Cache settings
export const CACHE_EXPIRY_TIME = 60000; // 60 seconds in milliseconds

// Initial exchange rates to use as fallback
export const initialRates: CoinRates = {
  btc: 1,
  sats: 100000000, // 1 BTC = 100,000,000 satoshis
  usd: 70123,
  eur: 64852,
  chf: 62754,
  cny: 510430,
  jpy: 10854000,
  gbp: 55621,
  aud: 105823,
  cad: 95241,
  inr: 5853000,
  rub: 6423000,
  lastUpdated: new Date()
};

// Cache state
let cachedRates: CoinRates = { ...initialRates };
let lastFetchTime: number = 0;
let isFetchingData: boolean = false;
let fetchPromise: Promise<CoinRates> | null = null;

// Try to load rates from localStorage after initializing variables
const loadRatesFromStorage = (): boolean => {
  try {
    const storedRates = localStorage.getItem('bitcoin-converter-rates');
    if (storedRates) {
      const parsedRates = JSON.parse(storedRates);
      // Convert the string date back to a Date object
      parsedRates.lastUpdated = new Date(parsedRates.lastUpdated);
      
      // Update both cachedRates and initialRates with stored values
      cachedRates = { ...parsedRates };
      updateInitialRates(parsedRates);
      console.log('Loaded rates from storage:', initialRates);
      return true;
    }
  } catch (error) {
    console.error('Failed to load rates from localStorage:', error);
  }
  return false;
};

// Initialize by trying to load from storage
const hasLoadedFromStorage = loadRatesFromStorage();
if (!hasLoadedFromStorage) {
  console.log('No stored rates found, using default initialRates:', initialRates);
}

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
  Object.assign(initialRates, rates);
  console.log('Updated initialRates with fresh data:', initialRates);
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
