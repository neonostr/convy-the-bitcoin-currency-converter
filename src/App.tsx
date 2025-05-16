import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/hooks/useSettings";
import { LanguageProvider } from "@/hooks/useLanguage";
import { lazy, Suspense, useEffect } from "react";

// Import Index directly instead of lazy loading for faster initial render
import Index from "./pages/Index";

// Lazy load non-critical pages
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimize query client config for faster startup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Keep data fresh forever
      gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (previously cacheTime)
      retry: 2, // Reduce retry attempts for faster feedback
      retryDelay: 1000, // Shorter retry delay
      networkMode: 'online', // Don't waste time retrying when offline
    },
  },
});

// Add this function to expose toast globally for service worker
if (typeof window !== 'undefined') {
  (window as any).showToast = (options: any) => {
    // This will be populated by the useEffect in the App component
  };
}

// Initialize service worker sync in a non-blocking way
if (typeof window !== 'undefined') {
  // Defer the service worker initialization to after rendering
  setTimeout(() => {
    import("@/services/ratesService").then(module => {
      module.initializeServiceWorkerSync();
    });
  }, 3000);
}

// Main app component with optimized rendering
const App = () => {
  // Pre-initialize critical data as early as possible
  useEffect(() => {
    // Import data fetching utilities without blocking initial render
    const preloadRates = async () => {
      try {
        const { getCachedRates, fetchBitcoinRates } = await import('@/services/coinGeckoApi');
        const cachedRates = getCachedRates();
        // If we have cached rates, no need to fetch immediately
        if (cachedRates && Object.keys(cachedRates).length > 0) {
          return;
        }
        // Otherwise fetch rates in the background
        fetchBitcoinRates().catch(console.error);
      } catch (error) {
        console.error('Failed to preload rates:', error);
      }
    };
    
    // Start preloading data without blocking the UI
    requestIdleCallback(() => {
      preloadRates();
    });
    
    // Expose the toast function for the service worker
    if (typeof window !== 'undefined') {
      import('@/hooks/use-toast').then(({ toast }) => {
        (window as any).showToast = toast;
      });
    }
    
    // Log startup performance metrics
    const performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`[Performance] ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
      });
    });
    performanceObserver.observe({ entryTypes: ['mark', 'measure'] });
    performance.mark('app-mounted');
    
    return () => {
      performanceObserver.disconnect();
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={
                  <Suspense fallback={<div className="p-4">Loading...</div>}>
                    <NotFound />
                  </Suspense>
                } />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SettingsProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
