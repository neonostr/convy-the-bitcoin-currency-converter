
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co"
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to log events to Supabase
async function logEdgeFunctionEvent(eventType: string, metadata: any = {}) {
  try {
    // Using a simplified insert format that matches the table structure
    const { error } = await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: eventType,
          metadata: metadata
        }
      ]);
    
    if (error) {
      console.error('Error logging event:', error);
    } else {
      console.log(`Successfully logged event: ${eventType}`);
    }
  } catch (err) {
    console.error('Failed to log event:', err);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('COINGECKO_API_KEY')
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub'
    
    // Determine which API endpoint we're using
    const api_type = apiKey ? 'pro' : 'public';
    
    console.log(`Using CoinGecko API type: ${api_type}`);
    
    // Make the API call with the secret key if available
    const response = await fetch(
      apiKey ? `${apiUrl}&x_cg_api_key=${apiKey}` : apiUrl,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    const timestamp = new Date().toISOString();
    
    // Explicitly log the event before responding
    await logEdgeFunctionEvent('coingecko_edge_function_call', { 
      status: response.status, 
      success: true,
      api_type: api_type,
      timestamp: timestamp
    });

    // Include api_type in the response
    return new Response(JSON.stringify({ ...data, api_type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    
    const timestamp = new Date().toISOString();
    
    // Log failed API calls
    await logEdgeFunctionEvent('coingecko_edge_function_error', { 
      error: error.message,
      timestamp: timestamp
    });
      
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
