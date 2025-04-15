import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co"
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

export async function fetchFromCryptoComparePublic() {
  try {
    const response = await fetch('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD,EUR,CHF,CNY,JPY,GBP,AUD,CAD,INR,RUB');
    
    if (!response.ok) {
      await logApiError('cryptocompare_api_public_failure', response.status);
      throw new Error(`CryptoCompare public API failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the response to match CoinGecko format
    const transformedData = {
      bitcoin: {
        usd: data.BTC.USD,
        eur: data.BTC.EUR,
        chf: data.BTC.CHF,
        cny: data.BTC.CNY,
        jpy: data.BTC.JPY,
        gbp: data.BTC.GBP,
        aud: data.BTC.AUD,
        cad: data.BTC.CAD,
        inr: data.BTC.INR,
        rub: data.BTC.RUB
      }
    };
    
    await logApiSuccess('cryptocompare_api_public_success');
    return transformedData;
  } catch (error) {
    console.error(`CryptoCompare public API error: ${error.message}`);
    throw error;
  }
}

export async function fetchFromCryptoCompareWithKey() {
  try {
    const apiKey = Deno.env.get('CRYPTOCOMPARE_API_KEY');
    
    if (!apiKey) {
      throw new Error('CRYPTOCOMPARE_API_KEY is not set');
    }
    
    const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD,EUR,CHF,CNY,JPY,GBP,AUD,CAD,INR,RUB&api_key=${apiKey}`);
    
    if (!response.ok) {
      await logApiError('cryptocompare_api_with_key_failure', response.status);
      throw new Error(`CryptoCompare API with key failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the response to match CoinGecko format
    const transformedData = {
      bitcoin: {
        usd: data.BTC.USD,
        eur: data.BTC.EUR,
        chf: data.BTC.CHF,
        cny: data.BTC.CNY,
        jpy: data.BTC.JPY,
        gbp: data.BTC.GBP,
        aud: data.BTC.AUD,
        cad: data.BTC.CAD,
        inr: data.BTC.INR,
        rub: data.BTC.RUB
      }
    };
    
    await logApiSuccess('cryptocompare_api_with_key_success');
    return transformedData;
  } catch (error) {
    console.error(`CryptoCompare API with key error: ${error.message}`);
    throw error;
  }
}

// Add helper functions for logging API calls
async function logApiSuccess(eventType: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
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
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase
      .from('usage_logs')
      .insert([{ event_type: eventType, timestamp: new Date().toISOString() }]);
  } catch (error) {
    console.error(`Failed to log API error event (${baseEventType}):`, error);
  }
}
