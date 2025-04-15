
import { CoinRates } from "@/types/currency.types";
import { DEFAULT_INITIAL_RATES } from "./cacheManager";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "./usageTracker";

export async function fetchCoinRates(): Promise<CoinRates> {
  try {
    console.log("Fetching Bitcoin rates from Edge Function...");
    
    // We'll still try to log the event, but won't fail if it doesn't work
    try {
      await logEvent('api_call_initiated');
    } catch (loggingError) {
      console.warn('Could not log event, continuing anyway:', loggingError);
    }
    
    const { data, error } = await supabase.functions.invoke('coingecko-rates');
    
    if (error) {
      console.error('Error invoking edge function:', error);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    if (!data || !data.bitcoin) {
      console.error('Invalid response data:', data);
      throw new Error('Invalid response from API');
    }
    
    console.log("Bitcoin rates received:", data.bitcoin);
    
    if (data.api_type) {
      console.log("API type used:", data.api_type);
    }
    
    if (data.cache_hit !== undefined) {
      console.log("Cache hit:", data.cache_hit);
      
      // Log if this was a cache hit, but don't fail if logging doesn't work
      try {
        if (data.cache_hit) {
          await logEvent('provided_cached_rates');
        } else {
          await logEvent('new_rates_fetched');
        }
      } catch (loggingError) {
        console.warn('Could not log cache status event:', loggingError);
      }
    }
    
    const newRates: CoinRates = {
      btc: 1,
      sats: 100000000,
      usd: data.bitcoin.usd || DEFAULT_INITIAL_RATES.usd,
      eur: data.bitcoin.eur || DEFAULT_INITIAL_RATES.eur,
      chf: data.bitcoin.chf || DEFAULT_INITIAL_RATES.chf,
      cny: data.bitcoin.cny || DEFAULT_INITIAL_RATES.cny,
      jpy: data.bitcoin.jpy || DEFAULT_INITIAL_RATES.jpy,
      gbp: data.bitcoin.gbp || DEFAULT_INITIAL_RATES.gbp,
      aud: data.bitcoin.aud || DEFAULT_INITIAL_RATES.aud,
      cad: data.bitcoin.cad || DEFAULT_INITIAL_RATES.cad,
      inr: data.bitcoin.inr || DEFAULT_INITIAL_RATES.inr,
      rub: data.bitcoin.rub || DEFAULT_INITIAL_RATES.rub,
      lastUpdated: new Date()
    };

    return newRates;
  } catch (error) {
    console.error('Error fetching Bitcoin rates:', error);
    throw error;
  }
}
