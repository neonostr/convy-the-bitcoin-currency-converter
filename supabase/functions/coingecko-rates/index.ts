
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { 
  fetchFromCoinGeckoPublic, 
  fetchFromCoinGeckoWithKey 
} from '../_shared/providers/coingecko.ts'
import { 
  fetchFromCryptoComparePublic, 
  fetchFromCryptoCompareWithKey 
} from '../_shared/providers/cryptocompare.ts'
import { logApiCall } from '../_shared/logging.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Coin Gecko Rates Edge Function Initialized")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Primary Data Source: CoinGecko with API key
    const coinGeckoApiKey = Deno.env.get('COINGECKO_API_KEY')
    
    if (coinGeckoApiKey) {
      try {
        console.log("Trying CoinGecko with API key...")
        const { data, fromCache } = await fetchFromCoinGeckoWithKey()
        
        // Log the API call event if it was a fresh fetch (not from cache)
        if (!fromCache) {
          await logApiCall('coingecko_api_key', data)
        }
        
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        })
      } catch (error) {
        console.error("CoinGecko API key fetch failed:", error.message)
        // Continue to fallback methods
      }
    }
    
    // Fallback 1: CoinGecko Public API
    try {
      console.log("Trying CoinGecko public API...")
      const { data, fromCache } = await fetchFromCoinGeckoPublic()
      
      // Log the API call event if it was a fresh fetch (not from cache)
      if (!fromCache) {
        await logApiCall('coingecko_public', data)
      }
      
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    } catch (error) {
      console.error("CoinGecko public API failed:", error.message)
      // Continue to next fallback
    }
    
    // Fallback 2: CryptoCompare with API key
    const cryptoCompareApiKey = Deno.env.get('CRYPTOCOMPARE_API_KEY')
    
    if (cryptoCompareApiKey) {
      try {
        console.log("Trying CryptoCompare with API key...")
        const { data, fromCache } = await fetchFromCryptoCompareWithKey()
        
        // Log the API call event if it was a fresh fetch (not from cache)
        if (!fromCache) {
          await logApiCall('cryptocompare_api_key', data)
        }
        
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        })
      } catch (error) {
        console.error("CryptoCompare API key fetch failed:", error.message)
        // Continue to final fallback
      }
    }
    
    // Final Fallback: CryptoCompare Public API
    try {
      console.log("Trying CryptoCompare public API (final fallback)...")
      const { data, fromCache } = await fetchFromCryptoComparePublic()
      
      // Log the API call event if it was a fresh fetch (not from cache)
      if (!fromCache) {
        await logApiCall('cryptocompare_public', data)
      }
      
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    } catch (error) {
      console.error("All API providers failed:", error.message)
      throw error
    }
    
  } catch (error) {
    console.error("Error in edge function:", error.message)
    
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }
})
