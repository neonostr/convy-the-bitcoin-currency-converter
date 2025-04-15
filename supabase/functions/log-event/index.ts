
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client with service role key (not exposed to the client)
const supabaseUrl = "https://wmwwjdkjybtwqzrqchfh.supabase.co";
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple in-memory store for rate limiting
// This is a basic implementation and will reset when the function restarts
const eventCounts: Record<string, { count: number; timestamp: number }> = {};

// Rate limiting settings
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX = 50; // Maximum 50 events per minute for the same event type

// Check if an event is being rate limited
function isRateLimited(eventType: string): boolean {
  const now = Date.now();
  const eventData = eventCounts[eventType];
  
  if (!eventData) {
    // First time seeing this event type
    eventCounts[eventType] = { count: 1, timestamp: now };
    return false;
  }
  
  if (now - eventData.timestamp > RATE_LIMIT_WINDOW) {
    // Reset counter if window has passed
    eventCounts[eventType] = { count: 1, timestamp: now };
    return false;
  }
  
  // Increment counter
  eventData.count++;
  
  // Check if over limit
  return eventData.count > RATE_LIMIT_MAX;
}

// Handle requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse request body
    const requestData = await req.json();
    const { event_type } = requestData;
    
    // Validate input
    if (!event_type || typeof event_type !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid event data: event_type is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check for allowed event types
    const allowedEventTypes = [
      'app_open_browser_mobile',
      'app_open_browser_desktop',
      'app_open_pwa',
      'coingecko_api_with_key_success',
      'coingecko_api_public_success',
      'cryptocompare_api_with_key_success',
      'cryptocompare_api_public_success'
    ];
    
    // Allow error codes to be appended to failure events
    const baseEventTypes = [
      'coingecko_api_with_key_failure',
      'coingecko_api_public_failure',
      'cryptocompare_api_with_key_failure',
      'cryptocompare_api_public_failure'
    ];
    
    // Check if it's a base event or a failure with error code
    const isAllowedEvent = allowedEventTypes.includes(event_type) || 
      baseEventTypes.some(baseType => event_type.startsWith(baseType));
    
    if (!isAllowedEvent) {
      return new Response(
        JSON.stringify({ error: 'Invalid event type' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check rate limiting
    if (isRateLimited(event_type)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded for this event type' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // First, try to create the table directly with SQL
    try {
      const { error: createTableError } = await supabase.rpc(
        'create_table_if_not_exists',
        {
          table_name: 'usage_logs',
          table_definition: `
            id SERIAL PRIMARY KEY,
            event_type TEXT NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
          `
        }
      );
      
      if (createTableError) {
        console.log('Error with create_table_if_not_exists RPC:', createTableError);
        
        // If the RPC method isn't available, use raw SQL through the REST API
        const { data, error } = await supabase.auth.admin.createUser({
          email: 'placeholder@example.com',
          password: 'placeholder'
        });
        
        if (error) {
          console.log('Just testing if service role key works:', error);
        }
        
        // Try a simple query to see if the table exists
        const { error: queryError } = await supabase.from('usage_logs').select('count(*)', { count: 'exact' }).limit(1);
        
        if (queryError && queryError.code === '42P01') { // Table doesn't exist error
          console.log('Table does not exist, creating it...');
          
          // Create the table with a direct REST API call since we can't use raw SQL via the JS client
          const res = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'X-Client-Info': 'Edge Function'
            },
            body: JSON.stringify({
              command: `
                CREATE TABLE IF NOT EXISTS public.usage_logs (
                  id SERIAL PRIMARY KEY,
                  event_type TEXT NOT NULL,
                  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
                );
              `
            })
          });
          
          if (!res.ok) {
            console.error('Failed to create table with direct REST call:', await res.text());
          }
        }
      }
    } catch (error) {
      console.error('Error ensuring table exists:', error);
      // Continue anyway, maybe the table already exists
    }
    
    // Insert event into the database
    const { error } = await supabase
      .from('usage_logs')
      .insert([
        { 
          event_type,
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error logging event:', error);
      
      if (error.code === '42P01') { // Table doesn't exist error
        return new Response(
          JSON.stringify({ error: 'Usage logs table does not exist' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to log event' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
