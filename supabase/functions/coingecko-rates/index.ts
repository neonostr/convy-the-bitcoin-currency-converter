
import { corsHeaders } from '../_shared/cors.ts'
import { logApiCall, logApiError } from '../_shared/logging.ts'
import { 
  fetchFromCoinGeckoPublic, 
  fetchFromCoinGeckoWithKey 
} from '../_shared/providers/coingecko.ts'
import { 
  fetchFromCryptoComparePublic, 
  fetchFromCryptoCompareWithKey 
} from '../_shared/providers/cryptocompare.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Fallback chain in priority order
    let data = null
    let source = ''
    let apiSuccess = false
    
    // 1. Try CoinGecko public API first
    try {
      console.log('Attempting CoinGecko public API first...')
      data = await fetchFromCoinGeckoPublic()
      apiSuccess = true
      source = 'coingecko_public'
      console.log('Successfully fetched data from CoinGecko public API')
    } catch (error) {
      console.error('CoinGecko public API error:', error)
      
      // 2. Try CoinGecko with API key as first fallback
      try {
        console.log('Falling back to CoinGecko with API key...')
        data = await fetchFromCoinGeckoWithKey()
        apiSuccess = true
        source = 'coingecko_api_key'
        console.log('Successfully fetched data from CoinGecko with API key')
      } catch (coinGeckoKeyError) {
        console.error('CoinGecko API with key error:', coinGeckoKeyError)
        
        // 3. Try CryptoCompare public API as second fallback
        try {
          console.log('Falling back to CryptoCompare public API...')
          data = await fetchFromCryptoComparePublic()
          apiSuccess = true
          source = 'cryptocompare_public'
          console.log('Successfully fetched data from CryptoCompare (fallback)')
        } catch (cryptoCompareError) {
          console.error('CryptoCompare public API error:', cryptoCompareError)
          
          // 4. Try CryptoCompare with API key as final fallback
          try {
            console.log('Falling back to CryptoCompare with API key...')
            data = await fetchFromCryptoCompareWithKey()
            apiSuccess = true
            source = 'cryptocompare_api_key'
            console.log('Successfully fetched data from CryptoCompare with API key')
          } catch (cryptoCompareKeyError) {
            console.error('CryptoCompare API with key error:', cryptoCompareKeyError)
            throw new Error('All API attempts failed')
          }
        }
      }
    }
    
    if (!data || !apiSuccess) {
      throw new Error('Failed to fetch data from any API source')
    }
    
    // Log the successful API call
    await logApiCall(source, data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Complete Error:', error)
    await logApiError(error)
      
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
