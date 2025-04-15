import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Keep your existing imports and configurations
const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co";
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchFromCoinGeckoPublic() {
  try {
    console.log("Attempting CoinGecko public API first...");
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub');
    
    if (!response.ok) {
      await logApiError('coingecko_api_public_failure', response.status);
      throw new Error(`CoinGecko public API failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Don't log success here - let the main edge function handle it
    console.log("Successfully fetched data from CoinGecko public API");
    
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
    
    // Don't log success here - let the main edge function handle it
    console.log("Successfully fetched data from CoinGecko with API key");
    
    return data;
  } catch (error) {
    console.error(`CoinGecko API with key error: ${error.message}`);
    throw error;
  }
}

// Keep only error logging at the provider level
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
