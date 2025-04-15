
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co"
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Supported currencies for all APIs
const supportedCurrencies = ['usd', 'eur', 'chf', 'cny', 'jpy', 'gbp', 'aud', 'cad', 'inr', 'rub']

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
    await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: `${source}_api_call`,
          metadata: { 
            status: 200, 
            success: true,
            source: source,
            response_data: data 
          }
        }
      ])

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Complete Error:', error)
    
    // Log failed API calls
    await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: 'api_call_error',
          metadata: { 
            error: error.message,
            full_error: JSON.stringify(error)
          }
        }
      ])
      
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// Function to fetch from CoinGecko public API (no key)
async function fetchFromCoinGeckoPublic() {
  console.log('Attempting CoinGecko public API call...')
  const currenciesParam = supportedCurrencies.join(',')
  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currenciesParam}`
  
  const response = await fetch(
    apiUrl,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  )
  
  console.log('CoinGecko Public API Status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('CoinGecko Public API Error:', errorText)
    throw new Error(`CoinGecko Public API error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  console.log('CoinGecko Public API Response:', JSON.stringify(data, null, 2))
  return data
}

// Function to fetch from CoinGecko with API key
async function fetchFromCoinGeckoWithKey() {
  const apiKey = Deno.env.get('COINGECKO_API_KEY')
  
  if (!apiKey) {
    console.log('No CoinGecko API key found, skipping this fallback')
    throw new Error('No CoinGecko API key available')
  }
  
  console.log('Using CoinGecko API Key: Key present')
  
  const currenciesParam = supportedCurrencies.join(',')
  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currenciesParam}&x_cg_api_key=${apiKey}`
  
  const response = await fetch(
    apiUrl,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  )
  
  console.log('CoinGecko API with Key Status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('CoinGecko API with Key Error:', errorText)
    throw new Error(`CoinGecko API with Key error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  console.log('CoinGecko API with Key Response:', JSON.stringify(data, null, 2))
  return data
}

// Function to fetch from CryptoCompare public API
async function fetchFromCryptoComparePublic() {
  console.log('Fetching from CryptoCompare public API...')
  const currenciesParam = supportedCurrencies.map(curr => curr.toUpperCase()).join(',')
  const apiUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=${currenciesParam}`
  
  const response = await fetch(
    apiUrl,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  )
  
  console.log('CryptoCompare Public API Status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('CryptoCompare Public API Error:', errorText)
    throw new Error(`CryptoCompare Public API error: ${response.status} - ${errorText}`)
  }
  
  const rawData = await response.json()
  console.log('CryptoCompare Raw Response:', JSON.stringify(rawData, null, 2))
  
  // Transform CryptoCompare response to match CoinGecko format
  const transformedData = {
    bitcoin: {
      usd: rawData.BTC.USD,
      eur: rawData.BTC.EUR,
      chf: rawData.BTC.CHF,
      cny: rawData.BTC.CNY,
      jpy: rawData.BTC.JPY,
      gbp: rawData.BTC.GBP,
      aud: rawData.BTC.AUD,
      cad: rawData.BTC.CAD,
      inr: rawData.BTC.INR,
      rub: rawData.BTC.RUB
    }
  }
  
  console.log('Transformed CryptoCompare Response:', JSON.stringify(transformedData, null, 2))
  return transformedData
}

// Function to fetch from CryptoCompare with API key
async function fetchFromCryptoCompareWithKey() {
  const apiKey = Deno.env.get('CRYPTOCOMPARE_API_KEY')
  
  if (!apiKey) {
    console.log('No CryptoCompare API key found, skipping this fallback')
    throw new Error('No CryptoCompare API key available')
  }
  
  console.log('Using CryptoCompare API Key: Key present')
  const currenciesParam = supportedCurrencies.map(curr => curr.toUpperCase()).join(',')
  const apiUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=${currenciesParam}`
  
  const response = await fetch(
    apiUrl,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Apikey ${apiKey}`
      }
    }
  )
  
  console.log('CryptoCompare API with Key Status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('CryptoCompare API with Key Error:', errorText)
    throw new Error(`CryptoCompare API with Key error: ${response.status} - ${errorText}`)
  }
  
  const rawData = await response.json()
  console.log('CryptoCompare API with Key Response:', JSON.stringify(rawData, null, 2))
  
  // Transform CryptoCompare response to match CoinGecko format
  const transformedData = {
    bitcoin: {
      usd: rawData.BTC.USD,
      eur: rawData.BTC.EUR,
      chf: rawData.BTC.CHF,
      cny: rawData.BTC.CNY,
      jpy: rawData.BTC.JPY,
      gbp: rawData.BTC.GBP,
      aud: rawData.BTC.AUD,
      cad: rawData.BTC.CAD,
      inr: rawData.BTC.INR,
      rub: rawData.BTC.RUB
    }
  }
  
  console.log('Transformed CryptoCompare Response:', JSON.stringify(transformedData, null, 2))
  return transformedData
}

