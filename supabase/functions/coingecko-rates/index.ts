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

// Track recently served requests to avoid duplicate processing
const processedRequests = new Map();
const DEDUPLICATION_TIMEOUT = 2000; // 2 seconds

// Track successful API logs to prevent duplicates within a short time window
const recentSuccessLogs = new Map();
const LOG_DEDUPLICATION_TIMEOUT = 10000; // 10 seconds

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Generate a request identifier based on timestamp
    const requestTime = Date.now();
    const requestIP = req.headers.get('x-forwarded-for') || 'unknown';
    const requestId = `${requestIP}-${Math.floor(requestTime / 1000)}`; // Group by seconds
    
    // Check if we've recently processed a very similar request
    if (processedRequests.has(requestId)) {
      console.log('Duplicate request detected, returning cached response');
      return new Response(JSON.stringify(processedRequests.get(requestId)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Fallback chain in priority order
    let data = null
    let source = ''
    let apiSuccess = false
    let fromCache = false
    
    // 1. Try CoinGecko public API first
    try {
      data = await fetchFromCoinGeckoPublic()
      apiSuccess = true
      source = 'coingecko_public'
      // Check if this was a cache hit (we can tell by looking at the console logs)
      fromCache = console.logs && console.logs.some(log => log.includes('Using cached rates'));
      console.log('Successfully fetched data from CoinGecko public API' + (fromCache ? ' (from cache)' : ''));
    } catch (error) {
      console.error('CoinGecko public API error:', error)
      const errorCode = error.message.includes('status:') ? error.message.split('status:')[1].trim() : 'unknown';
      await logApiError('coingecko_public', errorCode)
      
      // 2. Try CoinGecko with API key as first fallback
      try {
        console.log('Falling back to CoinGecko with API key...')
        data = await fetchFromCoinGeckoWithKey()
        apiSuccess = true
        source = 'coingecko_api_key'
        console.log('Successfully fetched data from CoinGecko with API key')
      } catch (coinGeckoKeyError) {
        console.error('CoinGecko API with key error:', coinGeckoKeyError)
        const errorCode = coinGeckoKeyError.message.includes('status:') ? 
          coinGeckoKeyError.message.split('status:')[1].trim() : 'unknown';
        await logApiError('coingecko_api_key', errorCode)
        
        // 3. Try CryptoCompare public API as second fallback
        try {
          console.log('Falling back to CryptoCompare public API...')
          data = await fetchFromCryptoComparePublic()
          apiSuccess = true
          source = 'cryptocompare_public'
          console.log('Successfully fetched data from CryptoCompare (fallback)')
        } catch (cryptoCompareError) {
          console.error('CryptoCompare public API error:', cryptoCompareError)
          const errorCode = cryptoCompareError.message.includes('status:') ? 
            cryptoCompareError.message.split('status:')[1].trim() : 'unknown';
          await logApiError('cryptocompare_public', errorCode)
          
          // 4. Try CryptoCompare with API key as final fallback
          try {
            console.log('Falling back to CryptoCompare with API key...')
            data = await fetchFromCryptoCompareWithKey()
            apiSuccess = true
            source = 'cryptocompare_api_key'
            console.log('Successfully fetched data from CryptoCompare with API key')
          } catch (cryptoCompareKeyError) {
            console.error('CryptoCompare API with key error:', cryptoCompareKeyError)
            const errorCode = cryptoCompareKeyError.message.includes('status:') ? 
              cryptoCompareKeyError.message.split('status:')[1].trim() : 'unknown';
            await logApiError('cryptocompare_api_key', errorCode)
            throw new Error('All API attempts failed')
          }
        }
      }
    }
    
    if (!data || !apiSuccess) {
      throw new Error('Failed to fetch data from any API source')
    }
    
    // Log the successful API call - but prevent duplicates and only if it's not a cache hit
    // Cache hits are now logged in the provider's getFromCache method
    const logKey = `${source}_${Math.floor(requestTime / LOG_DEDUPLICATION_TIMEOUT)}`;
    if (!recentSuccessLogs.has(logKey) && !fromCache) {
      await logApiCall(source, data)
      recentSuccessLogs.set(logKey, true);
      
      // Clean up old log entries
      setTimeout(() => {
        recentSuccessLogs.delete(logKey);
      }, LOG_DEDUPLICATION_TIMEOUT);
    } else if (fromCache) {
      console.log(`Cache hit for ${source} - already logged separately`);
    } else {
      console.log(`Skipping duplicate log for ${source} - already logged in the last ${LOG_DEDUPLICATION_TIMEOUT/1000} seconds`);
    }
    
    // Store the response to prevent duplicate processing
    processedRequests.set(requestId, data);
    
    // Clean up old entries
    setTimeout(() => {
      processedRequests.delete(requestId);
    }, DEDUPLICATION_TIMEOUT);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Complete Error:', error)
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
