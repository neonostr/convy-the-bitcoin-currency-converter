
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co"
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('COINGECKO_API_KEY')
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub'
    
    // Determine which API endpoint we're using
    const api_type = apiKey ? 'pro' : 'public';
    
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

    // Log the API call with additional metadata
    await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: 'coingecko_edge_function_call',
          metadata: { 
            status: response.status, 
            success: true,
            api_type: api_type,
            timestamp: new Date().toISOString()
          }
        }
      ])

    // Include api_type in the response
    return new Response(JSON.stringify({ ...data, api_type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    
    // Log failed API calls
    await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: 'coingecko_edge_function_error',
          metadata: { 
            error: error.message,
            timestamp: new Date().toISOString()
          }
        }
      ])
      
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

