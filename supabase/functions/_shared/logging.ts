
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co"
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

export async function logApiCall(source: string, data: any) {
  try {
    // Format the event type according to our new naming convention
    let eventType = '';
    
    if (source === 'coingecko_public') {
      eventType = 'coingecko_api_public_success';
    } else if (source === 'coingecko_api_key') {
      eventType = 'coingecko_api_with_key_success';
    } else if (source === 'cryptocompare_public') {
      eventType = 'cryptocompare_api_public_success';
    } else if (source === 'cryptocompare_api_key') {
      eventType = 'cryptocompare_api_with_key_success';
    } else {
      eventType = `${source}_success`;
    }
    
    console.log(`Logging API call event: ${eventType}`);
    
    const { error } = await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: eventType,
          timestamp: new Date().toISOString()
        }
      ]);
      
    if (error) {
      console.error('Error logging API call:', error);
    } else {
      console.log(`Successfully logged event: ${eventType}`);
    }
  } catch (error) {
    console.error('Error logging API call:', error);
  }
}

export async function logApiError(source: string, errorCode: number | string) {
  try {
    // Format the event type according to our new naming convention
    let eventType = '';
    
    if (source === 'coingecko_public') {
      eventType = `coingecko_api_public_failure_${errorCode}`;
    } else if (source === 'coingecko_api_key') {
      eventType = `coingecko_api_with_key_failure_${errorCode}`;
    } else if (source === 'cryptocompare_public') {
      eventType = `cryptocompare_api_public_failure_${errorCode}`;
    } else if (source === 'cryptocompare_api_key') {
      eventType = `cryptocompare_api_with_key_failure_${errorCode}`;
    } else {
      eventType = `${source}_failure_${errorCode}`;
    }
    
    console.log(`Logging API error event: ${eventType}`);
    
    const { error } = await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: eventType,
          timestamp: new Date().toISOString()
        }
      ]);
      
    if (error) {
      console.error(`Error logging API error event:`, error);
    } else {
      console.log(`Successfully logged error event: ${eventType}`);
    }
  } catch (error) {
    console.error('Error logging API error:', error);
  }
}

export async function logCacheHit(provider: string) {
  try {
    console.log(`Logging cached_data_provided event for ${provider}`);
    
    const { error } = await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: 'cached_data_provided',
          timestamp: new Date().toISOString()
        }
      ]);
      
    if (error) {
      console.error('Error logging cache hit:', error);
    } else {
      console.log('Successfully logged cached_data_provided event');
    }
  } catch (error) {
    console.error('Error logging cache hit:', error);
  }
}
