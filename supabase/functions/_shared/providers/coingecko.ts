
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co";
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache duration in milliseconds (60 seconds)
const CACHE_DURATION = 60000;

async function getFromCache() {
  try {
    console.log('Trying to fetch data from CoinGecko cache');
    const { data: cacheData, error: cacheError } = await supabase
      .from('rate_cache')
      .select('*')
      .eq('provider', 'coingecko')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cacheError) {
      console.error('Cache fetch error:', cacheError);
      return null;
    }

    // Check if cache is fresh (less than CACHE_DURATION old)
    if (cacheData) {
      const cacheAge = Date.now() - new Date(cacheData.updated_at).getTime();
      if (cacheAge < CACHE_DURATION) {
        console.log('Using cached rates, age:', Math.round(cacheAge / 1000), 'seconds');
        return cacheData.rates;
      }
      console.log('Cache is stale, age:', Math.round(cacheAge / 1000), 'seconds');
    } else {
      console.log('No cache data found for coingecko');
    }
    return null;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

async function updateCache(data: any) {
  try {
    console.log('Creating new rate_cache entry with new data for CoinGecko');
    
    // Always create a new entry instead of updating
    const result = await supabase
      .from('rate_cache')
      .insert({
        provider: 'coingecko',
        rates: data,
        updated_at: new Date().toISOString()
      });
    
    if (result.error) {
      console.error('Cache insert error:', result.error);
      throw new Error(`Cache insert failed: ${result.error.message}`);
    } else {
      console.log('New cache entry created successfully for coingecko');
    }
  } catch (error) {
    console.error('Cache update failed:', error);
    throw new Error(`Failed to create cache entry: ${error.message}`);
  }
}

// Log when cached data is used instead of making an API call
async function logCachedDataProvided() {
  try {
    console.log('Logging cached_data_provided_coingecko event');
    await supabase
      .from('usage_logs')
      .insert([{ 
        event_type: 'cached_data_provided_coingecko',
        timestamp: new Date().toISOString()
      }]);
    console.log('Cached data usage logged successfully');
  } catch (error) {
    console.error('Failed to log cached data usage:', error);
  }
}

export async function fetchFromCoinGeckoPublic() {
  // First try to get data from cache
  const cachedData = await getFromCache();
  if (cachedData) {
    // Log the cache hit
    await logCachedDataProvided();
    console.log('Using cached data from CoinGecko');
    return { data: cachedData, fromCache: true };
  }

  try {
    console.log("Cache miss or stale, fetching fresh data from CoinGecko public API...");
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub,sek,nzd,krw,sgd,nok,mxn,brl,hkd,try,pln,zar');
    
    if (!response.ok) {
      await logApiError('coingecko_public', response.status);
      throw new Error(`CoinGecko public API failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Successfully fetched data from CoinGecko public API");
    
    // Update cache with new data
    await updateCache(data);
    console.log("Successfully cached data from CoinGecko public API");
    
    return { data, fromCache: false };
  } catch (error) {
    console.error(`CoinGecko public API error: ${error.message}`);
    throw error;
  }
}

export async function fetchFromCoinGeckoWithKey() {
  // First try to get data from cache
  const cachedData = await getFromCache();
  if (cachedData) {
    // Log the cache hit
    await logCachedDataProvided();
    console.log('Using cached data from CoinGecko with API key');
    return { data: cachedData, fromCache: true };
  }

  try {
    const coinGeckoApiKey = Deno.env.get('COINGECKO_API_KEY');
    
    if (!coinGeckoApiKey || coinGeckoApiKey.trim() === '') {
      console.error('COINGECKO_API_KEY is not set or empty');
      throw new Error('COINGECKO_API_KEY is not set or empty');
    }
    
    console.log("Cache miss or stale, fetching fresh data from CoinGecko API with key...");
    // Adding detailed logging for debugging API key issues
    console.log(`Using API key (first 4 chars): ${coinGeckoApiKey.substring(0, 4)}...`);
    
    const url = 'https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub,sek,nzd,krw,sgd,nok,mxn,brl,hkd,try,pln,zar';
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'x-cg-pro-api-key': coinGeckoApiKey,
        'Content-Type': 'application/json'
      }
    });
    
    // Log the response status for debugging
    console.log(`CoinGecko API with key response status: ${response.status}`);
    
    if (!response.ok) {
      // Log the response body for more debugging info
      const errorText = await response.text();
      console.error(`CoinGecko API with key error response: ${errorText}`);
      
      await logApiError('coingecko_api_key', response.status);
      throw new Error(`CoinGecko API with key failed with status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Successfully fetched data from CoinGecko with API key");
    
    // Update cache with new data
    await updateCache(data);
    console.log("Successfully cached data from CoinGecko with API key");
    
    return { data, fromCache: false };
  } catch (error) {
    console.error(`CoinGecko API with key error: ${error.message}`);
    throw error;
  }
}

// Log API errors
async function logApiError(baseEventType: string, errorCode: number) {
  try {
    const eventType = `${baseEventType}_failure_${errorCode}`;
    console.log(`Logging API error event: ${eventType}`);
    
    await supabase
      .from('usage_logs')
      .insert([{ event_type: eventType, timestamp: new Date().toISOString() }]);
      
    console.log(`Successfully logged API error event: ${eventType}`);
  } catch (error) {
    console.error(`Failed to log API error event (${baseEventType}):`, error);
  }
}
