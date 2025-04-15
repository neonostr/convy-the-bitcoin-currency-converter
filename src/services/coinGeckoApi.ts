import { CoinRates, CoinGeckoResponse } from "@/types/currency.types";
import { 
  initialRates, 
  updateCachedRates, 
  getCachedRates, 
  getLastFetchTime, 
  isCacheStale, 
  updateInitialRates, 
  isFetching, 
  setFetchingState,
  getActiveFetchPromise
} from "./ratesService";
import { trackApiCall } from "./usageTracker";

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
  // Track API call before fetching
  trackApiCall();

  // First, check if we already have valid rates that are fresh enough (less than 60 seconds old)
  const cachedRates = getCachedRates();
  if (!isCacheStale()) {
    console.log('Using fresh cached rates (< 60s old)');
    return { ...cachedRates };
  }
  
  // Check if another request is already fetching fresh data
  if (isFetching()) {
    console.log('Another request is already fetching data, waiting for that result');
    const activePromise = getActiveFetchPromise();
    if (activePromise) {
      try {
        return await activePromise;
      } catch (error) {
        console.error('Error while waiting for active fetch:', error);
        // If the active fetch fails, we'll continue with our own fetch attempt
      }
    }
  }
  
  // Set up the fetch promise that multiple concurrent requests can use
  const fetchPromise = performFetch();
  setFetchingState(true, fetchPromise);
  
  try {
    const result = await fetchPromise;
    setFetchingState(false, null);
    return result;
  } catch (error) {
    console.error('Fetch failed:', error);
    setFetchingState(false, null);
    
    // Return the most recent data available
    return getLatestAvailableRates();
  }
}

// Separate function to perform the actual API fetch
async function performFetch(): Promise<CoinRates> {
  try {
    console.log("Fetching fresh Bitcoin rates from API...");
    // Build the API URL with the API key as a parameter
    const apiKeyToUse = getApiKey();
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub';
    
    // Fix the API key parameter format - it should be x_cg_api_key not x_cg_demo_api_key
    const urlWithKey = apiKeyToUse ? `${apiUrl}&x_cg_api_key=${apiKeyToUse}` : apiUrl;
    
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
    throw error; // Re-throw to be handled by the calling function
  }
}

// Helper function to get the most recent rates available when API fetch fails
function getLatestAvailableRates(): CoinRates {
  const cachedRates = getCachedRates();
  console.log('Using cached rates as fallback:', cachedRates);
  
  // Always use the most recent data we have
  if (cachedRates.lastUpdated) {
    // If cached rates exist and are newer than initialRates, update initialRates
    if (!initialRates.lastUpdated || 
        new Date(cachedRates.lastUpdated) > new Date(initialRates.lastUpdated)) {
      updateInitialRates(cachedRates);
    }
    return cachedRates;
  }
  
  // Fallback to initial rates if no cached rates
  return { ...initialRates };
}
