
import { setCoinGeckoApiKey } from './coinGeckoApi';

// This is a hidden constant that will only exist in memory at runtime
// You can replace this with your actual API key
const COINGECKO_API_KEY = 'YOUR_COINGECKO_API_KEY';

export function initializeApiKeys(): void {
  // Set the CoinGecko API key in memory only
  setCoinGeckoApiKey(COINGECKO_API_KEY);
  
  console.log('API keys initialized');
}
