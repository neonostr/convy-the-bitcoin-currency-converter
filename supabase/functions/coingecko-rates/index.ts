
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { 
  fetchFromCoinGeckoPublic, 
  fetchFromCoinGeckoWithKey 
} from '../_shared/providers/coingecko.ts'
import { 
  fetchFromCryptoComparePublic, 
  fetchFromCryptoCompareWithKey 
} from '../_shared/providers/cryptocompare.ts'
import { logApiCall, logCacheHit } from '../_shared/logging.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Coin Gecko Rates Edge Function Initialized")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Processing request for bitcoin rates...")
    
    // Check for existing fresh cache first
    console.log("Checking for fresh cache data first...")
    const { cachedData, provider } = await checkForFreshCache();
    
    if (cachedData) {
      console.log(`Using fresh cached data from ${provider}`)
      // Log the cache hit event
      await logCacheHit(provider);
      return new Response(JSON.stringify(cachedData), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    }
    
    // Primary Method: Try CoinGecko public API first
    try {
      console.log("Trying CoinGecko public API as primary method...")
      const { data, fromCache } = await fetchFromCoinGeckoPublic()
      
      // Log the API call event if it was a fresh fetch (not from cache)
      if (!fromCache) {
        console.log("Logging fresh API call to CoinGecko public API")
        await logApiCall('coingecko_public', data)
      } else {
        console.log("Using cached data from CoinGecko public API")
        // This should be logged in the provider, but log it here too for redundancy
        await logCacheHit('coingecko');
      }
      
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    } catch (error) {
      console.error("CoinGecko public API failed:", error.message)
      // Continue to next fallback
    }
    
    // Fallback 1: CryptoCompare public API (try this before using API keys)
    try {
      console.log("Trying CryptoCompare public API (fallback 1)...")
      const { data, fromCache } = await fetchFromCryptoComparePublic()
      
      // Log the API call event if it was a fresh fetch (not from cache)
      if (!fromCache) {
        console.log("Logging fresh API call to CryptoCompare public API")
        await logApiCall('cryptocompare_public', data)
      } else {
        console.log("Using cached data from CryptoCompare public API")
        await logCacheHit('cryptocompare');
      }
      
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    } catch (error) {
      console.error("CryptoCompare public API failed:", error.message)
      // Continue to next fallback
    }
    
    // Fallback 2: CryptoCompare with API key
    const cryptoCompareApiKey = Deno.env.get('CRYPTOCOMPARE_API_KEY')
    
    if (cryptoCompareApiKey && cryptoCompareApiKey.trim() !== '') {
      try {
        console.log("Trying CryptoCompare with API key (fallback 2)...")
        const { data, fromCache } = await fetchFromCryptoCompareWithKey()
        
        // Log the API call event if it was a fresh fetch (not from cache)
        if (!fromCache) {
          console.log("Logging fresh API call to CryptoCompare with API key")
          await logApiCall('cryptocompare_api_key', data)
        } else {
          console.log("Using cached data from CryptoCompare with API key")
          await logCacheHit('cryptocompare');
        }
        
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        })
      } catch (error) {
        console.error("CryptoCompare API key fetch failed:", error.message)
        // Continue to final fallback
      }
    } else {
      console.log("No CryptoCompare API key set or key is empty, skipping API key method")
    }
    
    // Final Fallback 3: CoinGecko with API key (use as last resort due to 404 issues)
    const coinGeckoApiKey = Deno.env.get('COINGECKO_API_KEY')
    
    if (coinGeckoApiKey && coinGeckoApiKey.trim() !== '') {
      try {
        console.log("Trying CoinGecko with API key (final fallback)...")
        const { data, fromCache } = await fetchFromCoinGeckoWithKey()
        
        // Log the API call event if it was a fresh fetch (not from cache)
        if (!fromCache) {
          console.log("Logging fresh API call to CoinGecko with API key")
          await logApiCall('coingecko_api_key', data)
        } else {
          console.log("Using cached data from CoinGecko with API key")
          // This should be logged in the provider, but log it here too for redundancy
          await logCacheHit('coingecko');
        }
        
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        })
      } catch (error) {
        console.error("CoinGecko API key fetch failed:", error.message)
        throw error
      }
    } else {
      console.log("No CoinGecko API key set or key is empty, skipping API key method")
      throw new Error("All API providers failed and no CoinGecko API key available")
    }
    
  } catch (error) {
    console.error("Error in edge function:", error.message)
    
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }
})

// Helper function to log cache hits
async function logCacheHit(provider: string) {
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co";
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Use more specific event type for better tracking
    const eventType = `cached_data_provided_${provider}`;
    console.log(`Logging cache hit event: ${eventType}`);
    
    await supabase
      .from('usage_logs')
      .insert([{ 
        event_type: eventType,
        timestamp: new Date().toISOString()
      }]);
      
    console.log(`Cached data usage for ${provider} logged successfully`);
  } catch (error) {
    console.error('Failed to log cache hit:', error);
  }
}

// Helper function to check for fresh cache across providers
async function checkForFreshCache() {
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co";
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Cache duration in milliseconds (60 seconds)
    const CACHE_DURATION = 60000;

    // First try CoinGecko cache
    let { data: cacheData, error: cacheError } = await supabase
      .from('rate_cache')
      .select('*')
      .eq('provider', 'coingecko')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!cacheError && cacheData) {
      const cacheAge = Date.now() - new Date(cacheData.updated_at).getTime();
      if (cacheAge < CACHE_DURATION) {
        console.log('Using cached CoinGecko rates, age:', Math.round(cacheAge / 1000), 'seconds');
        return { cachedData: cacheData.rates, provider: 'coingecko' };
      }
    }

    // Then try CryptoCompare cache
    ({ data: cacheData, error: cacheError } = await supabase
      .from('rate_cache')
      .select('*')
      .eq('provider', 'cryptocompare')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle());

    if (!cacheError && cacheData) {
      const cacheAge = Date.now() - new Date(cacheData.updated_at).getTime();
      if (cacheAge < CACHE_DURATION) {
        console.log('Using cached CryptoCompare rates, age:', Math.round(cacheAge / 1000), 'seconds');
        return { cachedData: cacheData.rates, provider: 'cryptocompare' };
      }
    }

    return { cachedData: null, provider: null };
  } catch (error) {
    console.error('Error checking for fresh cache:', error);
    return { cachedData: null, provider: null };
  }
}
