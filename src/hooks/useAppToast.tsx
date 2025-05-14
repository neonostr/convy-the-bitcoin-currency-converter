
import { useSettings } from './useSettings';
import { useToast as useShadcnToast, toast as shadcnToast } from '@/hooks/use-toast';

export function useAppToast() {
  const { settings } = useSettings();
  const shadcnToastHook = useShadcnToast();
  
  const showToast = (props: Parameters<typeof shadcnToast>[0]) => {
    if (settings.disableToasts) return { id: 'disabled' };
    return shadcnToast(props);
  };
  
  return {
    ...shadcnToastHook,
    toast: showToast
  };
}

export const toast = (props: Parameters<typeof shadcnToast>[0]) => {
  // This is a fallback for places where hooks can't be used
  // Note: This won't respect the disableToasts setting immediately
  // It will only work after a component that uses useAppToast has rendered
  return shadcnToast(props);
};

// Make the toast function available globally for the service worker update notification
if (typeof window !== 'undefined') {
  (window as any).showToast = (props: Parameters<typeof shadcnToast>[0]) => {
    // For the global usage, we need to check localStorage directly
    try {
      const savedSettings = localStorage.getItem('bitcoin-converter-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.disableToasts) {
          return { id: 'disabled' };
        }
      }
    } catch (error) {
      console.error('Error reading settings from localStorage:', error);
    }
    return shadcnToast(props);
  };
}
