
import { setCoinGeckoApiKey } from './coinGeckoApi';

// Set a default API key for CoinGecko (public demo key, rate-limited)
// This is intentionally a public key, as it's for demo purposes
export function initializeApiKeys(): void {
  // Use a string for the API key, not raw tokens
  setCoinGeckoApiKey("CG_Xrz4kxHNqEF79t1iGrvFH1UD");
  
  // Set up periodic check for API key in localStorage
  checkForApiKeyInStorage();
}

// Check localStorage for user-provided API key
function checkForApiKeyInStorage(): void {
  try {
    const storedApiKey = localStorage.getItem('coingecko-api-key');
    if (storedApiKey) {
      setCoinGeckoApiKey(storedApiKey);
      console.log('Using API key from localStorage');
    }
  } catch (error) {
    console.error('Error checking for API key in localStorage:', error);
  }
}
