
import { CoinRates, CoinGeckoResponse } from "@/types/currency.types";
import { initialRates, updateCachedRates, getCachedRates, getLastFetchTime, canRefreshRates, updateInitialRates } from "./ratesService";

// Secure API key handling - storing it in memory only, not in the codebase
let apiKey = '';

// Function to set the API key (to be called when the app initializes or when you need to update it)
export function setCoinGeckoApiKey(key: string): void {
  apiKey = key;
}

// Get the API key from memory, not from the codebase
const getApiKey = (): string => {
  return apiKey;
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
    const cachedRates = getCachedRates();
    // Update initialRates with cached data if it's newer
    if (cachedRates.lastUpdated && 
        (!initialRates.lastUpdated || 
         new Date(cachedRates.lastUpdated) > new Date(initialRates.lastUpdated))) {
      updateInitialRates(cachedRates);
    }
    return cachedRates;
  }
  
  try {
    // Build the API URL with the API key as a parameter
    const apiKeyToUse = getApiKey();
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub';
    
    // Add API key if available
    const urlWithKey = apiKeyToUse ? `${apiUrl}&x_cg_demo_api_key=${apiKeyToUse}` : apiUrl;
    
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
    
    const newRates: CoinRates = {
      btc: 1,
      sats: 100000000,
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
    
    // Always update both cached rates and initialRates with fresh data
    updateCachedRates(newRates);
    updateInitialRates(newRates);
    
    console.log('Successfully updated rates with fresh data');
    return newRates;
  } catch (error) {
    console.error('Error fetching Bitcoin rates:', error);
    
    // Get cached rates to check if they're newer than initialRates
    const cachedRates = getCachedRates();
    if (cachedRates.lastUpdated && 
        (!initialRates.lastUpdated || 
         new Date(cachedRates.lastUpdated) > new Date(initialRates.lastUpdated))) {
      updateInitialRates(cachedRates);
      return cachedRates;
    }
    
    // If we have cached rates and this isn't the first fetch, return those
    if (getLastFetchTime() > 0) {
      return getCachedRates();
    }
    
    // Otherwise return initial rates
    return initialRates;
  }
}
