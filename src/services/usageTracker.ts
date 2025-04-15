
import { supabase } from "@/integrations/supabase/client";

const DAILY_USAGE_KEY = 'bitcoin-converter-daily-usage';
const API_CALLS_KEY = 'bitcoin-converter-api-calls';
const LAST_EVENT_LOG_KEY = 'bitcoin-converter-last-event-log';
const APP_OPEN_LOGGED_KEY = 'bitcoin-converter-app-open-logged';

interface UsageStats {
  date: string;
  count: number;
  apiCalls: number;
}

// Log events via our Edge Function to avoid RLS issues
export const logEvent = async (eventType: string) => {
  // Rate limit event logging (one per minute per event type)
  const now = Date.now();
  const lastEventLogs = localStorage.getItem(LAST_EVENT_LOG_KEY);
  const eventLogs = lastEventLogs ? JSON.parse(lastEventLogs) : {};
  
  // Check if we've logged this event type recently
  if (eventLogs[eventType] && now - eventLogs[eventType] < 60000) {
    console.log(`Skipping event log for ${eventType} - logged recently`);
    return;
  }
  
  try {
    console.log(`Sending event log for: ${eventType}`);
    
    // Use the edge function to log events instead of direct table access
    const { data, error } = await supabase.functions.invoke('coingecko-rates', {
      body: { event_type: eventType }
    });
      
    if (error) {
      console.error('Error logging event via edge function:', error);
      return;
    }
    
    // Update the last logged time for this event type
    eventLogs[eventType] = now;
    localStorage.setItem(LAST_EVENT_LOG_KEY, JSON.stringify(eventLogs));
    
    console.log(`Successfully logged event: ${eventType}`);
  } catch (err) {
    console.error('Failed to log event:', err);
  }
};

// This function is called once per app session to track app usage
export const trackAppUsage = async () => {
  // Check if we've already logged an app open event for this session
  const hasLoggedAppOpen = sessionStorage.getItem(APP_OPEN_LOGGED_KEY);
  if (hasLoggedAppOpen === 'true') {
    console.log('App open event already logged for this session');
    return { alreadyLogged: true };
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Retrieve or initialize usage stats
  const storedStats = localStorage.getItem(DAILY_USAGE_KEY);
  const stats: UsageStats = storedStats 
    ? JSON.parse(storedStats) 
    : { date: today, count: 0, apiCalls: 0 };

  // If it's a new day, reset the count
  if (stats.date !== today) {
    stats.date = today;
    stats.count = 0;
    stats.apiCalls = 0;
  }

  // Increment usage count
  stats.count += 1;

  // Save back to localStorage
  localStorage.setItem(DAILY_USAGE_KEY, JSON.stringify(stats));
  
  // Log app open event based on device type
  let eventType = 'app_open_browser_desktop';
  
  if (window.matchMedia('(display-mode: standalone)').matches) {
    // This is a PWA
    eventType = 'app_open_pwa';
  } else if (window.matchMedia('(max-width: 768px)').matches) {
    // This is a mobile browser
    eventType = 'app_open_browser_mobile';
  }
  
  console.log(`Logging app open event: ${eventType}`);
  await logEvent(eventType);
  
  // Mark that we've logged this session's app open event
  sessionStorage.setItem(APP_OPEN_LOGGED_KEY, 'true');

  return stats;
};

export const trackApiCall = () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Retrieve or initialize API call stats
  const storedStats = localStorage.getItem(API_CALLS_KEY);
  const stats: UsageStats = storedStats 
    ? JSON.parse(storedStats) 
    : { date: today, count: 0, apiCalls: 0 };

  // If it's a new day, reset the count
  if (stats.date !== today) {
    stats.date = today;
    stats.apiCalls = 0;
  }

  // Increment API call count
  stats.apiCalls += 1;

  // Save back to localStorage
  localStorage.setItem(API_CALLS_KEY, JSON.stringify(stats));

  return stats;
};

export const getDailyUsageStats = (): UsageStats => {
  const storedStats = localStorage.getItem(DAILY_USAGE_KEY);
  return storedStats ? JSON.parse(storedStats) : { date: '', count: 0, apiCalls: 0 };
};
