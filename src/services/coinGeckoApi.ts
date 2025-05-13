import { CoinRates } from "@/types/currency.types";
import { 
  initialRates, 
  updateCachedRates, 
  getCachedRates,
  isCacheStale, 
  updateInitialRates, 
  isFetching, 
  setFetchingState,
  getActiveFetchPromise
} from "./ratesService";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "./eventLogger";
import { trackApiCall } from "./usageTracker";

// Minimum time between API calls (in milliseconds)
const MIN_API_CALL_INTERVAL = 30000; // 30 seconds minimum between API calls
let lastApiCallTime = 0;

// Prefetch data in the background after initial load to speed up subsequent interactions
let hasPrefetched = false;

export async function fetchCoinRates(): Promise<CoinRates> {
  console.time('fetchCoinRates');
  
  // First, check if we have valid rates that are fresh enough (less than 60 seconds old)
  const cachedRates = getCachedRates();
  
  // If we have rates and they're still fresh, use them immediately
  if (!isCacheStale()) {
    console.log('Using fresh cached rates (< 60s old)');
    // Log that we're using cached data
    await logEvent('cached_data_provided');
    
    // But if we haven't prefetched yet, do it in the background
    if (!hasPrefetched) {
      hasPrefetched = true;
      setTimeout(() => {
        prefetchData().catch(err => console.error('Background prefetch failed:', err));
      }, 5000); // Delay to ensure main UI is responsive first
    }
    
    console.timeEnd('fetchCoinRates');
    return { ...cachedRates };
  }
  
  // Rate limiting: Check if we've made a request too recently
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  if (timeSinceLastCall < MIN_API_CALL_INTERVAL) {
    console.log(`Rate limiting: Using cached rates (last API call was ${Math.round(timeSinceLastCall/1000)}s ago)`);
    // Log that we're using cached data due to rate limiting
    await logEvent('cached_data_provided_rate_limited');
    // Use cached rates even if stale to avoid too many API calls
    console.timeEnd('fetchCoinRates');
    return { ...cachedRates };
  }
  
  // Check if another request is already fetching fresh data
  if (isFetching()) {
    console.log('Another request is already fetching data, waiting for that result');
    const activePromise = getActiveFetchPromise();
    if (activePromise) {
      try {
        const result = await activePromise;
        console.timeEnd('fetchCoinRates');
        return result;
      } catch (error) {
        console.error('Error while waiting for active fetch:', error);
      }
    }
  }
  
  // Set up the fetch promise that multiple concurrent requests can use
  const fetchPromise = performFetch();
  setFetchingState(true, fetchPromise);
  
  try {
    const result = await fetchPromise;
    lastApiCallTime = Date.now(); // Update last successful API call time
    setFetchingState(false, null);
    console.timeEnd('fetchCoinRates');
    return result;
  } catch (error) {
    console.error('Fetch failed:', error);
    setFetchingState(false, null);
    const latestRates = getLatestAvailableRates();
    console.timeEnd('fetchCoinRates');
    return latestRates;
  }
}

// Function to prefetch data in the background to speed up future interactions
async function prefetchData(): Promise<void> {
  console.log('Prefetching data in background for faster future interactions');
  try {
    const result = await performFetch();
    lastApiCallTime = Date.now();
    console.log('Background prefetch complete, data updated');
  } catch (error) {
    console.error('Background prefetch failed:', error);
  }
}

async function performFetch(): Promise<CoinRates> {
  try {
    console.log("Fetching fresh Bitcoin rates from API...");
    
    // Track this API call
    trackApiCall();
    
    const { data, error } = await supabase.functions.invoke('coingecko-rates');
    
    if (error) {
      console.error('Supabase function error:', error);
      logEvent('coingecko_api_public_failure');
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    if (!data || !data.bitcoin) {
      console.error('Invalid response from API:', data);
      logEvent('coingecko_api_public_failure');
      throw new Error('Invalid response from API');
    }
    
    console.log("Bitcoin rates from API:", data.bitcoin);
    
    const newRates: CoinRates = {
      btc: 1,
      sats: 100000000,
      usd: data.bitcoin.usd || initialRates.usd,
      eur: data.bitcoin.eur || initialRates.eur,
      chf: data.bitcoin.chf || initialRates.chf,
      cny: data.bitcoin.cny || initialRates.cny,
      jpy: data.bitcoin.jpy || initialRates.jpy,
      gbp: data.bitcoin.gbp || initialRates.gbp,
      aud: data.bitcoin.aud || initialRates.aud,
      cad: data.bitcoin.cad || initialRates.cad,
      inr: data.bitcoin.inr || initialRates.inr,
      rub: data.bitcoin.rub || initialRates.rub,
      sek: data.bitcoin.sek || initialRates.sek,
      nzd: data.bitcoin.nzd || initialRates.nzd,
      krw: data.bitcoin.krw || initialRates.krw,
      sgd: data.bitcoin.sgd || initialRates.sgd,
      nok: data.bitcoin.nok || initialRates.nok,
      mxn: data.bitcoin.mxn || initialRates.mxn,
      brl: data.bitcoin.brl || initialRates.brl,
      hkd: data.bitcoin.hkd || initialRates.hkd,
      try: data.bitcoin.try || initialRates.try,
      pln: data.bitcoin.pln || initialRates.pln,
      zar: data.bitcoin.zar || initialRates.zar,
      lastUpdated: new Date()
    };
    
    updateCachedRates(newRates);
    updateInitialRates(newRates);
    
    console.log('Successfully updated rates with fresh data');
    return newRates;
  } catch (error) {
    console.error('Error fetching Bitcoin rates:', error);
    throw error;
  }
}

function getLatestAvailableRates(): CoinRates {
  const cachedRates = getCachedRates();
  console.log('Using cached rates as fallback:', cachedRates);
  
  // Log that we're using cached data
  logEvent('cached_data_provided');
  
  // Always use the most recent data we have
  if (cachedRates.lastUpdated) {
    // If cached rates exist and are newer than initialRates, update initialRates
    if (!initialRates.lastUpdated || 
        new Date(cachedRates.lastUpdated) > new Date(initialRates.lastUpdated)) {
      updateInitialRates(cachedRates);
    }
    return cachedRates;
  }
  
  // Fallback to initial rates if no cached rates
  return { ...initialRates };
}
