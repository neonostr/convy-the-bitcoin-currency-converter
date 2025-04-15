
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

async function logUsageEvent(eventType: string, metadata: any = {}) {
  try {
    console.log(`Attempting to log event: ${eventType}`, metadata);
    
    // Using a simpler insert format to match the table structure
    const { data, error } = await supabase
      .from('usage_logs')
      .insert([{
        event_type: eventType,
        metadata: metadata
      }])
      .select();
    
    if (error) {
      console.error('Error logging usage event:', error);
    } else {
      console.log(`Successfully logged event: ${eventType}`, data);
    }
  } catch (error) {
    console.error('Failed to log usage event:', error);
  }
}

export async function fetchCoinRates(): Promise<CoinRates> {
  // First, check if we have valid rates that are fresh enough (less than 60 seconds old)
  const cachedRates = getCachedRates();
  if (!isCacheStale()) {
    console.log('Using fresh cached rates (< 60s old)');
    // Log cache hit
    try {
      await logUsageEvent('cache_hit', {
        timestamp: new Date().toISOString(),
        cache_age: Date.now() - (cachedRates.lastUpdated?.getTime() || 0)
      });
    } catch (e) {
      console.error('Failed to log cache hit:', e);
    }
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
    
    const { data, error } = await supabase.functions.invoke('coingecko-rates');
    
    if (error) {
      // Log API error
      try {
        await logUsageEvent('coingecko_api_error', {
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('Failed to log API error:', e);
      }
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    if (!data || !data.bitcoin) {
      // Log API format error
      try {
        await logUsageEvent('coingecko_api_error', {
          error: 'Invalid response format',
          raw_response: JSON.stringify(data),
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('Failed to log API format error:', e);
      }
      throw new Error('Invalid response from CoinGecko API');
    }
    
    console.log("Bitcoin rates from API:", data.bitcoin);
    console.log("API type used:", data.api_type);

    // Log successful API call
    try {
      await logUsageEvent('coingecko_api_success', {
        timestamp: new Date().toISOString(),
        rates_received: true,
        api_type: data.api_type || 'unknown' // This will be set by the edge function
      });
    } catch (e) {
      console.error('Failed to log API success:', e);
    }
    
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
  
  // Log fallback to cache
  try {
    logUsageEvent('cache_fallback', {
      timestamp: new Date().toISOString(),
      cache_age: Date.now() - (cachedRates.lastUpdated?.getTime() || 0)
    }).catch(e => console.error('Failed to log cache fallback:', e));
  } catch (e) {
    console.error('Failed to initialize cache fallback log:', e);
  }
  
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
