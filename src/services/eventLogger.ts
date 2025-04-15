
import { supabase } from "@/integrations/supabase/client";

/**
 * Logs an event to Supabase through the secure edge function
 * @param eventType The type of event to log
 * @returns A promise that resolves when the event is logged
 */
export async function logEvent(eventType: string): Promise<void> {
  try {
    // Call the edge function to log the event
    await supabase.functions.invoke('log-event', {
      body: { event_type: eventType }
    });
  } catch (error) {
    // Log to console but don't throw so this doesn't break the app experience
    console.error('Failed to log event:', error);
  }
}

/**
 * Detects the client platform and logs the appropriate app_open event
 */
export function logAppOpen(): void {
  // Detect if running as PWA
  const isPwa = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;
  
  if (isPwa) {
    logEvent('app_open_pwa');
    return;
  }
  
  // Detect if mobile or desktop
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    logEvent('app_open_browser_mobile');
  } else {
    logEvent('app_open_browser_desktop');
  }
}
