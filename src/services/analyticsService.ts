
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface AppUsage {
  timestamp: string;
  type: 'app_access' | 'api_call';
}

export const logAppAccess = async () => {
  try {
    const { error } = await supabase
      .from('app_usage')
      .insert([
        { 
          timestamp: new Date().toISOString(),
          type: 'app_access'
        }
      ]);

    if (error) {
      console.error('Failed to log app access:', error);
    }
  } catch (err) {
    console.error('Error logging app access:', err);
  }
};

export const logApiCall = async () => {
  try {
    const { error } = await supabase
      .from('app_usage')
      .insert([
        { 
          timestamp: new Date().toISOString(),
          type: 'api_call'
        }
      ]);

    if (error) {
      console.error('Failed to log API call:', error);
    }
  } catch (err) {
    console.error('Error logging API call:', err);
  }
};
