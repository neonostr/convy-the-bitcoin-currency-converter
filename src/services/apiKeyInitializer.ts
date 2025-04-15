
import { setCoinGeckoApiKey } from './coinGeckoApi';

// This is a hidden constant that will only exist in memory at runtime
// Using the correct API key format for CoinGecko
const COINGECKO_API_KEY = "CG-Xrz4kxHNqEF79t1iGrvFH1UD";

export function initializeApiKeys(): void {
  // Set the CoinGecko API key in memory only
  setCoinGeckoApiKey(COINGECKO_API_KEY);
  
  console.log('API keys initialized');
}
