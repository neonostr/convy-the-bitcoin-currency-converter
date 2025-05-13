
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

export function useAppToast() {
  const { toast, ...rest } = useToast();
  const { settings } = useSettings();
  
  const showToast = (props: Parameters<typeof toast>[0]) => {
    if (!settings.disableToasts) {
      return toast(props);
    }
    // Return a mock object when toasts are disabled
    return {
      id: 'disabled',
      dismiss: () => {},
      update: () => {},
    };
  };
  
  return {
    ...rest,
    toast: showToast,
  };
}
