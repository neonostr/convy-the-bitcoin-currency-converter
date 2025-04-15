
import { CoinRates, CoinGeckoResponse } from "@/types/currency.types";
import { initialRates, updateCachedRates, getCachedRates, getLastFetchTime, canRefreshRates, updateInitialRates } from "./ratesService";

// Get the API key from environment variables (will be added by the user)
// This prevents the key from being hardcoded and leaked
const getApiKey = () => {
  // Try to get from localStorage for development (user must add it)
  const localKey = localStorage.getItem('coingecko-api-key');
  
  // Return the appropriate key or an empty string if none available
  return localKey || '';
};

export async function fetchCoinRates(): Promise<CoinRates> {
  const currentTime = Date.now();
  
  // Check if initialRates are fresh (less than 60 seconds old)
  if (initialRates.lastUpdated && 
      (new Date().getTime() - new Date(initialRates.lastUpdated).getTime() < 60000)) {
    console.log('Using fresh initialRates (< 60s old)');
    return { ...initialRates };
  }
  
  // Check if we need to throttle the request
  if (!canRefreshRates()) {
    return getCachedRates();
  }
  
  try {
    // Build the API URL with the API key as a parameter
    const apiKey = getApiKey();
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub';
    
    // Add API key if available
    const urlWithKey = apiKey ? `${apiUrl}&x_cg_demo_api_key=${apiKey}` : apiUrl;
    
    const response = await fetch(
      urlWithKey,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.error('CoinGecko API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch data from CoinGecko: ${response.status}`);
    }
    
    const data: CoinGeckoResponse = await response.json();
    
    if (!data.bitcoin) {
      throw new Error('Invalid response from CoinGecko API');
    }
    
    console.log("Bitcoin rates from API:", data.bitcoin);
    
    // Update cached rates with real rates from the API
    const newRates: CoinRates = {
      btc: 1,
      sats: 100000000, // 1 BTC = 100,000,000 satoshis
      usd: data.bitcoin.usd || initialRates.usd,
      eur: data.bitcoin.eur || initialRates.eur,
      chf: data.bitcoin.chf || initialRates.chf,
      cny: data.bitcoin.cny || initialRates.cny,
      jpy: data.bitcoin.jpy || initialRates.jpy,
      gbp: data.bitcoin.gbp || initialRates.gbp,
      aud: data.bitcoin.aud || initialRates.aud,
      cad: data.bitcoin.cad || initialRates.cad,
      inr: data.bitcoin.inr || initialRates.inr,
      rub: data.bitcoin.rub || initialRates.rub,
      lastUpdated: new Date()
    };
    
    // Update both cached rates and initialRates with the fresh data
    updateCachedRates(newRates);
    updateInitialRates(newRates);
    
    return newRates;
  } catch (error) {
    console.error('Error fetching Bitcoin rates:', error);
    
    // If we have cached rates and this isn't the first fetch, return those
    if (getLastFetchTime() > 0) {
      return getCachedRates();
    }
    
    // Otherwise return initial rates
    return initialRates;
  }
}
