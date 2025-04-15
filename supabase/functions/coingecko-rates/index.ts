
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
    // 1. Try CoinGecko API first (with API key if available)
    let data = null
    let source = 'coingecko'
    let apiSuccess = false
    
    try {
      data = await fetchFromCoinGecko()
      apiSuccess = true
      console.log('Successfully fetched data from CoinGecko')
    } catch (error) {
      console.error('CoinGecko API error:', error)
      source = 'coindesk'
      
      try {
        // 2. Try CoinDesk as fallback
        data = await fetchFromCoinDesk()
        apiSuccess = true
        console.log('Successfully fetched data from CoinDesk (fallback)')
      } catch (coindeskError) {
        console.error('CoinDesk API error:', coindeskError)
        throw new Error('Both CoinGecko and CoinDesk APIs failed')
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

async function fetchFromCoinGecko() {
  const apiKey = Deno.env.get('COINGECKO_API_KEY')
  console.log('Using CoinGecko API Key:', apiKey ? 'Key present' : 'No key found')
  
  const currenciesParam = supportedCurrencies.join(',')
  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currenciesParam}`
  
  let response
  
  // First try with API key if available
  if (apiKey) {
    console.log('Attempting CoinGecko API call with API key...')
    response = await fetch(
      `${apiUrl}&x_cg_api_key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.ok) {
      console.log('CoinGecko API call with key successful')
      const data = await response.json()
      console.log('CoinGecko Response:', JSON.stringify(data, null, 2))
      return data
    }
    
    console.log('CoinGecko API call with key failed with status:', response.status)
  }
  
  // If no API key or API key call failed, try without API key
  console.log('Attempting CoinGecko API call without API key...')
  response = await fetch(
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
    console.error('CoinGecko API Error:', errorText)
    throw new Error(`CoinGecko API error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  console.log('CoinGecko Response:', JSON.stringify(data, null, 2))
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
