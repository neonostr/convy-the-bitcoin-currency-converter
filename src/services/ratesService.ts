
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
