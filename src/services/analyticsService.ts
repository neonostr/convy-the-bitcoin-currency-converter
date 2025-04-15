
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are available
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Initialize Supabase client if credentials are available
const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Fallback to localStorage if Supabase isn't configured
const logToLocalStorage = (type: 'app_access' | 'api_call') => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const storageKey = `app_usage_${today}`;
    
    // Get existing data for today
    const existingData = localStorage.getItem(storageKey);
    let usageData = existingData 
      ? JSON.parse(existingData) 
      : { date: today, count: 0, apiCalls: 0 };
    
    // Update the appropriate counter
    if (type === 'app_access') {
      usageData.count += 1;
    } else if (type === 'api_call') {
      usageData.apiCalls += 1;
    }
    
    // Save updated data
    localStorage.setItem(storageKey, JSON.stringify(usageData));
    console.info('Daily App Usage:', usageData);
  } catch (err) {
    console.error('Error logging to localStorage:', err);
  }
};

interface AppUsage {
  timestamp: string;
  type: 'app_access' | 'api_call';
}

export const logAppAccess = async () => {
  if (!isSupabaseConfigured) {
    logToLocalStorage('app_access');
    return;
  }
  
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
      // Fallback to localStorage if Supabase insert fails
      logToLocalStorage('app_access');
    }
  } catch (err) {
    console.error('Error logging app access:', err);
    // Fallback to localStorage if Supabase throws an error
    logToLocalStorage('app_access');
  }
};

export const logApiCall = async () => {
  if (!isSupabaseConfigured) {
    logToLocalStorage('api_call');
    return;
  }
  
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
      // Fallback to localStorage if Supabase insert fails
      logToLocalStorage('api_call');
    }
  } catch (err) {
    console.error('Error logging API call:', err);
    // Fallback to localStorage if Supabase throws an error
    logToLocalStorage('api_call');
  }
};
