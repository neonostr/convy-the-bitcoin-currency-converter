
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co"
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Supported currencies for all APIs
const supportedCurrencies = ['usd', 'eur', 'chf', 'cny', 'jpy', 'gbp', 'aud', 'cad', 'inr', 'rub']

// Exchange rates for less common currencies if a fallback API doesn't provide them
// These are relative to USD and will be used to approximate missing currencies
const fallbackExchangeRates = {
  chf: 0.823, // Swiss Franc to USD
  rub: 82.5,  // Russian Ruble to USD
}

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
        
        // 3. Try CoinDesk as final fallback
        try {
          console.log('Falling back to CoinDesk API...')
          data = await fetchFromCoinDesk()
          apiSuccess = true
          source = 'coindesk'
          console.log('Successfully fetched data from CoinDesk (fallback)')
        } catch (coindeskError) {
          console.error('CoinDesk API error:', coindeskError)
          throw new Error('All API attempts failed')
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

async function fetchFromCoinDesk() {
  console.log('Fetching from CoinDesk API as fallback...')
  const coinDeskApiKey = Deno.env.get('COINDESK_API_KEY') || ''
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
  
  // Add API key to headers if available
  if (coinDeskApiKey) {
    headers['Authorization'] = `Bearer ${coinDeskApiKey}`
    console.log('Using CoinDesk API Key: Key present')
  } else {
    console.log('No CoinDesk API Key found, using public endpoint')
  }
  
  // CoinDesk only provides USD rates in the free tier, so we'll start with that
  const response = await fetch(
    'https://api.coindesk.com/v1/bpi/currentprice.json',
    { headers }
  )
  
  console.log('CoinDesk API Status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('CoinDesk API Error:', errorText)
    throw new Error(`CoinDesk API error: ${response.status} - ${errorText}`)
  }
  
  const coinDeskData = await response.json()
  console.log('CoinDesk Raw Response:', JSON.stringify(coinDeskData, null, 2))
  
  // Convert CoinDesk response to match CoinGecko format
  // CoinDesk provides USD, GBP, and EUR in their basic endpoint
  const result = {
    bitcoin: {
      usd: parseFloat(coinDeskData.bpi.USD.rate.replace(',', '')),
      gbp: parseFloat(coinDeskData.bpi.GBP.rate.replace(',', '')),
      eur: parseFloat(coinDeskData.bpi.EUR.rate.replace(',', ''))
    }
  }
  
  // For other currencies, we'll need to approximate based on common exchange rates
  // This is not ideal but better than nothing in case of API failures
  const usdRate = result.bitcoin.usd
  
  // Calculate missing currencies based on USD rate and approximate exchange rates
  result.bitcoin.chf = usdRate * fallbackExchangeRates.chf
  result.bitcoin.cny = usdRate / 0.138  // Approximate USD to CNY
  result.bitcoin.jpy = usdRate / 0.0067 // Approximate USD to JPY
  result.bitcoin.aud = usdRate / 0.66   // Approximate USD to AUD
  result.bitcoin.cad = usdRate / 0.73   // Approximate USD to CAD
  result.bitcoin.inr = usdRate / 0.012  // Approximate USD to INR
  result.bitcoin.rub = usdRate * fallbackExchangeRates.rub
  
  console.log('Transformed CoinDesk Response:', JSON.stringify(result, null, 2))
  return result
}
