
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co"
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

export async function logApiCall(source: string, data: any) {
  try {
    await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: `${source}_api_call`,
          metadata: { 
            status: 200, 
            success: true,
            source: source,
            response_data: data 
          }
        }
      ])
  } catch (error) {
    console.error('Error logging API call:', error)
  }
}

export async function logApiError(error: Error) {
  try {
    await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type: 'api_call_error',
          metadata: { 
            error: error.message,
            full_error: JSON.stringify(error)
          }
        }
      ])
  } catch (logError) {
    console.error('Error logging API error:', logError)
  }
}
