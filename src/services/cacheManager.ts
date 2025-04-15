
import { CoinRates } from "@/types/currency.types";

// Cache settings
export const CACHE_EXPIRY_TIME = 60000; // 60 seconds in milliseconds

// Default initial market rates as fallback
export const DEFAULT_INITIAL_RATES: CoinRates = {
  btc: 1,
  sats: 100000000,
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

// Try to load rates from localStorage on startup
export const loadRatesFromStorage = (): CoinRates => {
  try {
    const storedRates = localStorage.getItem('bitcoin-converter-rates');
    if (storedRates) {
      const parsedRates = JSON.parse(storedRates);
      parsedRates.lastUpdated = new Date(parsedRates.lastUpdated);
      console.log('Loaded rates from localStorage, last updated:', parsedRates.lastUpdated);
      return parsedRates;
    }
  } catch (error) {
    console.error('Failed to load rates from localStorage:', error);
  }
  return { ...DEFAULT_INITIAL_RATES };
};

// Cache state
let cachedRates: CoinRates = loadRatesFromStorage();
let lastFetchTime: number = parseInt(localStorage.getItem('bitcoin-converter-last-fetch-time') || '0', 10);
let isFetchingData: boolean = false;
let fetchPromise: Promise<CoinRates> | null = null;

export function getCachedRates(): CoinRates {
  return { ...cachedRates };
}

export function updateCachedRates(rates: CoinRates): void {
  cachedRates = { ...rates };
  lastFetchTime = Date.now();
  
  localStorage.setItem('bitcoin-converter-last-fetch-time', lastFetchTime.toString());
  console.log('Updated lastFetchTime in localStorage:', lastFetchTime);
  
  try {
    localStorage.setItem('bitcoin-converter-rates', JSON.stringify(rates));
    console.log('Saved rates to localStorage');
  } catch (error) {
    console.error('Failed to save rates to localStorage:', error);
  }
}

export function isCacheStale(): boolean {
  if (!cachedRates || !cachedRates.lastUpdated) {
    console.log('Cache is stale: No cached rates available');
    return true;
  }
  
  const now = Date.now();
  const cachedLastFetchTime = lastFetchTime;
  
  if (now - cachedLastFetchTime < CACHE_EXPIRY_TIME) {
    console.log(`Cache is fresh: Last fetch was ${(now - cachedLastFetchTime)/1000}s ago (< 60s)`);
    return false;
  }
  
  const storedLastFetchTime = parseInt(localStorage.getItem('bitcoin-converter-last-fetch-time') || '0', 10);
  const isFresh = now - storedLastFetchTime < CACHE_EXPIRY_TIME;
  
  console.log(`Cache status from localStorage: Last fetch was ${(now - storedLastFetchTime)/1000}s ago, is fresh: ${isFresh}`);
  return !isFresh;
}

export function hasCachedRates(): boolean {
  return cachedRates && Object.keys(cachedRates).length > 0 && cachedRates.usd > 0;
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
  const storedLastFetchTime = parseInt(localStorage.getItem('bitcoin-converter-last-fetch-time') || '0', 10);
  const latestTime = Math.max(lastFetchTime, storedLastFetchTime);
  console.log(`Latest fetch time is ${new Date(latestTime).toISOString()}, ${(Date.now() - latestTime)/1000}s ago`);
  return latestTime;
}
