
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/hooks/useSettings";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { trackAppUsage } from "@/services/usageTracker";

// Create a new query client that persists cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Keep data fresh forever
      gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (previously cacheTime)
    },
  },
});

const App = () => {
  // Track app usage on initial load - only once per session
  useEffect(() => {
    // This ensures the tracking only happens once per app session
    const trackUsage = async () => {
      console.log('App mounted - tracking app usage');
      try {
        // Tracking is now handled with session storage to prevent duplicate logs
        const result = await trackAppUsage();
        if (result && result.alreadyLogged) {
          console.log('App usage already tracked for this session');
        } else {
          console.log('App usage tracking completed');
        }
      } catch (error) {
        console.error('Error tracking app usage:', error);
      }
    };
    
    // Call the tracking function
    trackUsage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
