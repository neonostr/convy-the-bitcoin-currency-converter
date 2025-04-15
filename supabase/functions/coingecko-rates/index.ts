
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
    
    // Improved API key validation
    const isValidKey = apiKey && apiKey.length > 10 && !apiKey.includes('YOUR_API_KEY');
    
    // First attempt with public API (no key)
    console.log(`First attempting CoinGecko public API call`);
    
    let response = await fetch(
      apiUrl,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Track which API we successfully used
    let api_type = 'public';
    
    // If public API fails with rate limit (429) and we have a valid key, try the pro API
    if (response.status === 429 && isValidKey) {
      console.log(`Public API rate limited, switching to Pro API with key`);
      
      response = await fetch(
        `${apiUrl}&x_cg_api_key=${apiKey}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        api_type = 'pro';
        await logEdgeFunctionEvent(`coingecko_api_pro_success`);
      } else {
        const errorCode = response.status;
        await logEdgeFunctionEvent(`coingecko_api_pro_failure_${errorCode}`);
        throw new Error(`CoinGecko Pro API error: ${response.status}`);
      }
    } else if (response.ok) {
      // Public API succeeded
      await logEdgeFunctionEvent(`coingecko_api_public_success`);
    } else {
      // Public API failed with error other than rate limit
      const errorCode = response.status;
      await logEdgeFunctionEvent(`coingecko_api_public_failure_${errorCode}`);
      throw new Error(`CoinGecko Public API error: ${response.status}`);
    }

    const data = await response.json();
    
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
