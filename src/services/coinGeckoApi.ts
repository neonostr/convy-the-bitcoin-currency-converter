
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
const MIN_API_CALL_INTERVAL = 30000; // 30 seconds
let lastApiCallTime = 0;

export async function fetchCoinRates(): Promise<CoinRates> {
  // First, check if we have valid rates that are fresh enough (less than 60 seconds old)
  const cachedRates = getCachedRates();
  if (!isCacheStale()) {
    console.log('Using fresh cached rates (< 60s old)');
    logEvent('cached_data_provided');
    return { ...cachedRates };
  }
  
  // Rate limiting: Check if we've made a request too recently
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  if (timeSinceLastCall < MIN_API_CALL_INTERVAL) {
    console.log(`Rate limiting: Using cached rates (last API call was ${Math.round(timeSinceLastCall/1000)}s ago)`);
    logEvent('cached_data_provided_rate_limited');
    // Use cached rates even if stale to avoid too many API calls
    return { ...cachedRates };
  }
  
  // Check if another request is already fetching fresh data
  if (isFetching()) {
    console.log('Another request is already fetching data, waiting for that result');
    const activePromise = getActiveFetchPromise();
    if (activePromise) {
      try {
        return await activePromise;
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
    return result;
  } catch (error) {
    console.error('Fetch failed:', error);
    setFetchingState(false, null);
    return getLatestAvailableRates();
  }
}

async function performFetch(): Promise<CoinRates> {
  try {
    console.log("Fetching fresh Bitcoin rates from API...");
    
    // Track this API call
    trackApiCall();
    
    const { data, error } = await supabase.functions.invoke('coingecko-rates');
    
    if (error) {
      logEvent('coingecko_api_public_failure');
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    if (!data || !data.bitcoin) {
      logEvent('coingecko_api_public_failure');
      throw new Error('Invalid response from API');
    }
    
    // Log successful API call
    logEvent('coingecko_api_public_success');
    
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
