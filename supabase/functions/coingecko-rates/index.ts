
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
    console.log('Using API Key:', apiKey ? 'Key present' : 'No key found')
    
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub'
    
    // Attempt to make the API call with the secret key
    const response = await fetch(
      `${apiUrl}&x_cg_api_key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('API Response Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('CoinGecko API Error:', errorText)
      throw new Error(`CoinGecko API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('API Response Data:', JSON.stringify(data, null, 2))

    // Log the API call
    await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: 'coingecko_api_call',
          metadata: { 
            status: response.status, 
            success: true,
            response_data: data 
          }
        }
      ])

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Complete Error:', error)
    
    // Log failed API calls
    await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: 'coingecko_api_call_error',
          metadata: { 
            error: error.message,
            full_error: JSON.stringify(error)
          }
        }
      ])
      
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

