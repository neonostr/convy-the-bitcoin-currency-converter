
import { supportedCurrencies } from '../types.ts'

export async function fetchFromCoinGeckoPublic() {
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

export async function fetchFromCoinGeckoWithKey() {
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
