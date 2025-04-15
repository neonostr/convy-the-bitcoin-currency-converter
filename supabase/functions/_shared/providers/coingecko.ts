
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Keep your existing imports and configurations
const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co";
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Track successful API calls to avoid duplicate logs
let lastSuccessfulApiCall = {
  type: '',
  timestamp: 0
};
const DUPLICATE_LOG_PREVENTION_WINDOW = 5000; // 5 seconds

export async function fetchFromCoinGeckoPublic() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub');
    
    if (!response.ok) {
      await logApiError('coingecko_api_public_failure', response.status);
      throw new Error(`CoinGecko public API failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log success only if it's not a duplicate
    const now = Date.now();
    if (lastSuccessfulApiCall.type !== 'coingecko_api_public_success' || 
        now - lastSuccessfulApiCall.timestamp > DUPLICATE_LOG_PREVENTION_WINDOW) {
      await logApiSuccess('coingecko_api_public_success');
      lastSuccessfulApiCall = {
        type: 'coingecko_api_public_success',
        timestamp: now
      };
    } else {
      console.log('Skipping duplicate success log for CoinGecko public API');
    }
    
    return data;
  } catch (error) {
    console.error(`CoinGecko public API error: ${error.message}`);
    throw error;
  }
}

export async function fetchFromCoinGeckoWithKey() {
  try {
    const coinGeckoApiKey = Deno.env.get('COINGECKO_API_KEY');
    
    if (!coinGeckoApiKey) {
      throw new Error('COINGECKO_API_KEY is not set');
    }
    
    const response = await fetch('https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub', {
      headers: {
        'x-cg-pro-api-key': coinGeckoApiKey
      }
    });
    
    if (!response.ok) {
      await logApiError('coingecko_api_with_key_failure', response.status);
      throw new Error(`CoinGecko API with key failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log success only if it's not a duplicate
    const now = Date.now();
    if (lastSuccessfulApiCall.type !== 'coingecko_api_with_key_success' || 
        now - lastSuccessfulApiCall.timestamp > DUPLICATE_LOG_PREVENTION_WINDOW) {
      await logApiSuccess('coingecko_api_with_key_success');
      lastSuccessfulApiCall = {
        type: 'coingecko_api_with_key_success',
        timestamp: now
      };
    } else {
      console.log('Skipping duplicate success log for CoinGecko with key API');
    }
    
    return data;
  } catch (error) {
    console.error(`CoinGecko API with key error: ${error.message}`);
    throw error;
  }
}

// Add helper functions for logging API calls
async function logApiSuccess(eventType: string) {
  try {
    await supabase
      .from('usage_logs')
      .insert([{ event_type: eventType, timestamp: new Date().toISOString() }]);
  } catch (error) {
    console.error(`Failed to log API success event (${eventType}):`, error);
  }
}

async function logApiError(baseEventType: string, errorCode: number) {
  try {
    const eventType = `${baseEventType}_${errorCode}`;
    
    await supabase
      .from('usage_logs')
      .insert([{ event_type: eventType, timestamp: new Date().toISOString() }]);
  } catch (error) {
    console.error(`Failed to log API error event (${baseEventType}):`, error);
  }
}
