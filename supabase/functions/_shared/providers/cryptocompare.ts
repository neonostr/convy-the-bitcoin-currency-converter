
import { supportedCurrencies } from '../types.ts'

export async function fetchFromCryptoComparePublic() {
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

export async function fetchFromCryptoCompareWithKey() {
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
