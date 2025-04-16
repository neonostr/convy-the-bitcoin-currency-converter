import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co";
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache duration in milliseconds (60 seconds)
const CACHE_DURATION = 60000;

async function getFromCache() {
  try {
    const { data: cacheData, error: cacheError } = await supabase
      .from('rate_cache')
      .select('*')
      .eq('provider', 'coingecko')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

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
    }
    return null;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

async function updateCache(data: any) {
  try {
    const { error: upsertError } = await supabase
      .from('rate_cache')
      .upsert({
        provider: 'coingecko',
        rates: data,
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      console.error('Cache update error:', upsertError);
    } else {
      console.log('Cache updated successfully');
    }
  } catch (error) {
    console.error('Cache update failed:', error);
  }
}

// Log when cached data is used instead of making an API call
async function logCachedDataProvided() {
  try {
    await supabase
      .from('usage_logs')
      .insert([{ 
        event_type: 'cached_data_provided',
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
    // Log the cache hit with the new name
    await logCachedDataProvided();
    return { data: cachedData, fromCache: true };
  }

  try {
    console.log("Cache miss or stale, fetching fresh data from CoinGecko public API...");
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub');
    
    if (!response.ok) {
      await logApiError('coingecko_api_public_failure', response.status);
      throw new Error(`CoinGecko public API failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update cache with new data
    await updateCache(data);
    
    console.log("Successfully fetched and cached data from CoinGecko public API");
    
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
    // Log the cache hit with the new name
    await logCachedDataProvided();
    return { data: cachedData, fromCache: true };
  }

  try {
    const coinGeckoApiKey = Deno.env.get('COINGECKO_API_KEY');
    
    if (!coinGeckoApiKey) {
      throw new Error('COINGECKO_API_KEY is not set');
    }
    
    console.log("Cache miss or stale, fetching fresh data from CoinGecko API with key...");
    const response = await fetch('https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub', {
      headers: {
        'x-cg-pro-api-key': coinGeckoApiKey
      }
    });
    
    if (!response.ok) {
      await logApiError('coingecko_api_with_key_failure', response.status);
      throw new Error(`CoinGecko API with key failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update cache with new data
    await updateCache(data);
    
    console.log("Successfully fetched and cached data from CoinGecko with API key");
    
    return { data, fromCache: false };
  } catch (error) {
    console.error(`CoinGecko API with key error: ${error.message}`);
    throw error;
  }
}

// Keep only error logging at the provider level
async function logApiError(baseEventType: string, errorCode: number) {
  try {
    const eventType = `${baseEventType}_${errorCode}`;
    
    await supabase
      .from('usage_logs')
      .insert([{ event_type: eventType, timestamp: new Date().toISOString() }]);
  } catch (error) {
    console.error(`Failed to log API error event (${baseEventType}):`, error);
  }
}
