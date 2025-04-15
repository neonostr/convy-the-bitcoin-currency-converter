
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co"
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to log events to Supabase
async function logEdgeFunctionEvent(eventType: string) {
  try {
    const { data, error } = await supabase
      .from('usage_logs')
      .insert([{ event_type: eventType }])
      .select();

    if (error) {
      console.error('Error logging event:', error);
      throw error;
    }

    console.log('Successfully logged event:', eventType);
    return data;
  } catch (err) {
    console.error('Failed to log event:', err);
    throw err;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('COINGECKO_API_KEY')
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub'
    
    // Only consider it "pro" if the API key exists AND is being used in the request
    const isProAccess = !!apiKey && apiKey.length > 10;  // Basic validation that it's not empty/default
    const api_type = isProAccess ? 'pro' : 'public';
    
    console.log(`Using CoinGecko API type: ${api_type}, API Key exists: ${!!apiKey}, API Key valid: ${isProAccess}`);
    
    // Construct the URL based on whether we have a valid API key
    const requestUrl = isProAccess ? `${apiUrl}&x_cg_api_key=${apiKey}` : apiUrl;
    
    const response = await fetch(
      requestUrl,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorCode = response.status;
      await logEdgeFunctionEvent(`coingecko_api_${api_type}_failure_${errorCode}`);
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    await logEdgeFunctionEvent(`coingecko_api_${api_type}_success`);

    return new Response(JSON.stringify({ ...data, api_type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
