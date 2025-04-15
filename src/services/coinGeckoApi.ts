
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
import { logEvent } from "./usageTracker";

// Increased cache time to reduce API calls
const FETCH_COOLDOWN = 60000; // 60 seconds (1 minute)
let lastFetchTimestamp = 0;

export async function fetchCoinRates(): Promise<CoinRates> {
  // First, check if we have valid rates that are fresh enough (less than FETCH_COOLDOWN old)
  const cachedRates = getCachedRates();
  const now = Date.now();
  
  if (!isCacheStale()) {
    console.log('Using fresh cached rates (< 60s old)');
    await logEvent('provided_cached_data');
    return { ...cachedRates };
  }
  
  // Add an additional time-based throttle to prevent too frequent API calls
  if (now - lastFetchTimestamp < FETCH_COOLDOWN) {
    console.log(`Throttling API call - last fetch was ${(now - lastFetchTimestamp)/1000}s ago`);
    await logEvent('provided_cached_data_throttled');
    return { ...cachedRates };
  }
  
  // Check if another request is already fetching fresh data
  if (isFetching()) {
    console.log('Another request is already fetching data, waiting for that result');
    await logEvent('provided_cached_data_concurrent');
    const activePromise = getActiveFetchPromise();
    if (activePromise) {
      try {
        return await activePromise;
      } catch (error) {
        console.error('Error while waiting for active fetch:', error);
        await logEvent('cached_data_update_failed_000');
      }
    }
  }
  
  // Set up the fetch promise that multiple concurrent requests can use
  const fetchPromise = performFetch();
  setFetchingState(true, fetchPromise);
  lastFetchTimestamp = now;
  
  try {
    const result = await fetchPromise;
    setFetchingState(false, null);
    return result;
  } catch (error) {
    console.error('Fetch failed:', error);
    setFetchingState(false, null);
    
    // Log the specific error type if we can extract it
    if (error.response && error.response.status) {
      await logEvent(`cached_data_update_failed_${error.response.status}`);
    } else {
      await logEvent('cached_data_update_failed_000');
    }
    
    return getLatestAvailableRates();
  }
}

async function performFetch(): Promise<CoinRates> {
  try {
    console.log("Fetching fresh Bitcoin rates from API...");
    
    // Track API call for our metrics
    await logEvent('api_call_initiated');
    
    const { data, error } = await supabase.functions.invoke('coingecko-rates');
    
    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    if (!data || !data.bitcoin) {
      throw new Error('Invalid response from CoinGecko API');
    }
    
    console.log("Bitcoin rates from API:", data.bitcoin);
    console.log("API type used:", data.api_type);
    
    // We don't need to log API usage here as the edge function already does it
    
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
    
    await logEvent('cached_data_updated');
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
  
  // Always use the most recent data we have
  if (cachedRates.lastUpdated) {
    // If cached rates exist and are newer than initialRates, update initialRates
    if (!initialRates.lastUpdated || 
        new Date(cachedRates.lastUpdated) > new Date(initialRates.lastUpdated)) {
      updateInitialRates(cachedRates);
      logEvent('initial_rates_updated_from_cache');
    }
    return cachedRates;
  }
  
  // Fallback to initial rates if no cached rates
  logEvent('provided_initial_rates');
  return { ...initialRates };
}
