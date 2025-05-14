
import { useSettings } from './useSettings';
import { useToast } from './use-toast';

export const useAppToast = () => {
  const { toast: originalToast } = useToast();
  const { settings } = useSettings();
  
  // Simple wrapper around the original toast function
  // This ensures that even if the settings structure has changed,
  // the app will still function without errors
  const toast = (props: Parameters<typeof originalToast>[0]) => {
    // Always allow toast to work regardless of any setting inconsistencies
    return originalToast(props);
  };

  return { toast };
};
