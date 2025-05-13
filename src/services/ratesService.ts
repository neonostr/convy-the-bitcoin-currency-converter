
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
      return parsedRates;
    }
  } catch (error) {
    console.error('Failed to load rates from localStorage:', error);
  }
  return { ...DEFAULT_INITIAL_RATES };
};

// Pre-fetched default rates to improve initial load
export const DEFAULT_INITIAL_RATES: CoinRates = {
  btc: 1,
  sats: 100000000, // 1 BTC = 100,000,000 satoshis
  usd: 104298,     // Updated with more realistic starting values
  eur: 93253,
  chf: 87636, 
  cny: 751290,
  jpy: 15387889,
  gbp: 78406,
  aud: 161028,
  cad: 145374,
  inr: 8873725,
  rub: 8328415,
  sek: 1014324,
  nzd: 175570,
  krw: 147393430,
  sgd: 135703,
  nok: 1079914,
  mxn: 2022754,
  brl: 584183,
  hkd: 813209,
  try: 4045541,
  lastUpdated: new Date()
};

// Load cached rates immediately on script execution for faster startup
let cachedRates: CoinRates = loadRatesFromStorage();

// Mutable variable to store current rates
export let initialRates: CoinRates = { ...cachedRates };

// Cache state
let lastFetchTime: number = 0;
let isFetchingData: boolean = false;
let fetchPromise: Promise<CoinRates> | null = null;

// Log rates loading for debugging
console.log('Initial rates loaded:', initialRates);

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
